import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-npay-signature",
  "Content-Type": "application/json",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });

async function verifyHmac(
  body: string,
  signature: string,
  secret: string
) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(body)
  );

  const expected = Array.from(
    new Uint8Array(signatureBuffer)
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const received = signature
    .replace(/^sha256=/i, "")
    .trim()
    .toLowerCase();

  return expected === received;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return json(
      {
        success: false,
        error: "Method not allowed",
      },
      405
    );
  }

  try {
    // =====================================================
    // 1. ĐỌC RAW BODY
    // =====================================================

    const rawBody = await req.text();

    if (!rawBody) {
      return json(
        {
          success: false,
          error: "Empty webhook body",
        },
        400
      );
    }

    // =====================================================
    // 2. KIỂM TRA WEBHOOK AUTH
    // =====================================================

    const webhookToken =
      Deno.env.get("NPAY_WEBHOOK_TOKEN");

    const webhookSecret =
      Deno.env.get("NPAY_WEBHOOK_SECRET");

    const authorization =
      req.headers.get("Authorization");

    const signature =
      req.headers.get("X-Npay-Signature");

    let authorized = false;

    // Cách 1: Apikey
    if (
      webhookToken &&
      authorization
    ) {
      const receivedToken =
        authorization
          .replace(/^Apikey\s+/i, "")
          .trim();

      if (
        receivedToken &&
        receivedToken === webhookToken
      ) {
        authorized = true;
      }
    }

    // Cách 2: HMAC SHA256
    if (
      !authorized &&
      webhookSecret &&
      signature
    ) {
      authorized = await verifyHmac(
        rawBody,
        signature,
        webhookSecret
      );
    }

    if (!authorized) {
      return json(
        {
          success: false,
          error: "Unauthorized webhook",
        },
        401
      );
    }

    // =====================================================
    // 3. PARSE PAYLOAD
    // =====================================================

    const payload = JSON.parse(rawBody);

    console.log(
      "NPAY WEBHOOK:",
      JSON.stringify(payload)
    );

    const transferType =
      String(
        payload?.transferType || ""
      ).toLowerCase();

    // Chỉ xử lý tiền vào
    if (
      transferType &&
      transferType !== "in"
    ) {
      return json({
        success: true,
        ignored: true,
        reason: "Not an incoming transaction",
      });
    }

    const amount = Number(
      payload?.transferAmount
    );

    const content = String(
      payload?.content || ""
    ).trim();

    const accountNumber = String(
      payload?.accountNumber || ""
    ).trim();

    const referenceCode = String(
      payload?.referenceCode ||
      payload?.code ||
      ""
    ).trim();

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return json(
        {
          success: false,
          error: "Invalid transfer amount",
        },
        400
      );
    }

    if (!content) {
      return json(
        {
          success: false,
          error: "Missing transfer content",
        },
        400
      );
    }

    // =====================================================
    // 4. SUPABASE SERVICE ROLE
    // =====================================================

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      throw new Error(
        "Missing Supabase environment variables"
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    // =====================================================
    // 5. TÌM ĐƠN PENDING CÙNG SỐ TIỀN
    // =====================================================

    const {
      data: orders,
      error: orderError,
    } = await supabase
      .from("payment_orders")
      .select(`
        id,
        user_id,
        amount,
        total,
        payment_code,
        status,
        expires_at
      `)
      .eq("status", "PENDING")
      .eq("total", amount)
      .order("created_at", {
        ascending: true,
      })
      .limit(20);

    if (orderError) {
      console.error(
        "ORDER SEARCH ERROR:",
        orderError
      );

      throw orderError;
    }

    if (!orders || orders.length === 0) {
      return json({
        success: true,
        matched: false,
        reason:
          "No pending order with matching amount",
      });
    }

    // =====================================================
    // 6. TÌM PAYMENT CODE TRONG NỘI DUNG
    // =====================================================

    const normalizedContent =
      content
        .replace(/\s+/g, "")
        .toUpperCase();

    const matchedOrder =
      orders.find((order) => {
        const paymentCode =
          String(
            order.payment_code || ""
          )
            .replace(/\s+/g, "")
            .toUpperCase();

        return (
          paymentCode &&
          normalizedContent.includes(
            paymentCode
          )
        );
      });

    if (!matchedOrder) {
      return json({
        success: true,
        matched: false,
        reason:
          "Payment code not found",
      });
    }

    // =====================================================
    // 7. KIỂM TRA HẾT HẠN
    // =====================================================

    const expiresAt =
      new Date(
        matchedOrder.expires_at
      ).getTime();

    if (
      !Number.isFinite(expiresAt) ||
      expiresAt < Date.now()
    ) {
      await supabase
        .from("payment_orders")
        .update({
          status: "EXPIRED",
        })
        .eq("id", matchedOrder.id)
        .eq("status", "PENDING");

      return json({
        success: true,
        matched: true,
        paid: false,
        reason: "Order expired",
      });
    }

    // =====================================================
    // 8. ĐÁNH DẤU PAID
    // =====================================================

    const { data: updatedOrder, error: updateError } =
      await supabase
        .from("payment_orders")
        .update({
          status: "PAID",

          gateway: "NPAY",

          gateway_transaction_id:
            referenceCode || null,

          payment_content:
            content,

          reference_code:
            referenceCode || null,

          paid_at:
            new Date().toISOString(),
        })
        .eq("id", matchedOrder.id)
        .eq("status", "PENDING")
        .select(`
          id,
          user_id,
          package_id,
          package_name,
          delivery_target,
          amount,
          total,
          order_code,
          payment_code,
          status,
          paid_at
        `)
        .maybeSingle();

    if (updateError) {
      console.error(
        "PAYMENT UPDATE ERROR:",
        updateError
      );

      throw updateError;
    }

    // Có thể xảy ra khi webhook gửi lại lần 2
    if (!updatedOrder) {
      return json({
        success: true,
        matched: true,
        paid: false,
        reason:
          "Order was already processed",
      });
    }

    console.log(
      "PAYMENT PAID:",
      updatedOrder.id
    );

    // =====================================================
    // 9. TRẢ KẾT QUẢ
    // =====================================================

    return json({
      success: true,
      matched: true,
      paid: true,

      order: {
        id: updatedOrder.id,
        orderCode:
          updatedOrder.order_code,
        paymentCode:
          updatedOrder.payment_code,
        packageName:
          updatedOrder.package_name,
        deliveryTarget:
          updatedOrder.delivery_target,
        amount:
          updatedOrder.amount,
        total:
          updatedOrder.total,
        status:
          updatedOrder.status,
        paidAt:
          updatedOrder.paid_at,
      },
    });

  } catch (error) {
    console.error(
      "NPAY WEBHOOK ERROR:",
      error
    );

    return json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      500
    );
  }
}); 
