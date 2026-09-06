import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req) => {
  // CORS
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
    // 1. LẤY ACCESS TOKEN
    // =====================================================

    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return json(
        {
          success: false,
          error: "Missing authorization",
        },
        401
      );
    }

    const accessToken = authHeader.replace("Bearer ", "").trim();

    // =====================================================
    // 2. SUPABASE CLIENT
    // =====================================================

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Client xác thực user
    const authClient = createClient(
      supabaseUrl,
      anonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(accessToken);

    if (userError || !user) {
      return json(
        {
          success: false,
          error: "Unauthorized",
        },
        401
      );
    }

    // Client service role để tạo payment order
    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    // =====================================================
    // 3. ĐỌC REQUEST
    // =====================================================

    const body = await req.json();

    const packageId = String(
      body?.package_id || ""
    ).trim();

    const deliveryTarget = String(
      body?.delivery_target || ""
    ).trim();

    if (!packageId) {
      return json(
        {
          success: false,
          error: "Missing package_id",
        },
        400
      );
    }

    if (!deliveryTarget) {
      return json(
        {
          success: false,
          error: "Missing delivery_target",
        },
        400
      );
    }

    // =====================================================
    // 4. LẤY GÓI ROBUX
    // =====================================================

    const {
      data: pkg,
      error: packageError,
    } = await supabase
      .from("redemption_packages")
      .select(
        "id,name,coin_cost,price_vnd,active,reward_type,version"
      )
      .eq("id", packageId)
      .maybeSingle();

    if (packageError) {
      console.error(packageError);

      return json(
        {
          success: false,
          error: "Cannot load package",
        },
        500
      );
    }

    if (!pkg) {
      return json(
        {
          success: false,
          error: "Package not found",
        },
        404
      );
    }

    // =====================================================
    // 5. KIỂM TRA GÓI
    // =====================================================

    if (!pkg.active) {
      return json(
        {
          success: false,
          error: "Package is currently unavailable",
        },
        400
      );
    }

    if (pkg.reward_type !== "robux") {
      return json(
        {
          success: false,
          error: "This package is not a Robux package",
        },
        400
      );
    }

    // =====================================================
    // 6. GIÁ THANH TOÁN
    // =====================================================

    const amount = Number(pkg.price_vnd);

    if (!Number.isFinite(amount) || amount <= 0) {
      return json(
        {
          success: false,
          error: "Invalid package price",
        },
        400
      );
    }

    const fee = 0;
    const total = amount + fee;

    // =====================================================
    // 7. THÔNG TIN TÀI KHOẢN NGÂN HÀNG
    // =====================================================

    const npayAccount =
      Deno.env.get("NPAY_ACCOUNT")?.trim();

    const npayBankBin =
      Deno.env.get("NPAY_BANK_BIN")?.trim();

    const npayAccountName =
      Deno.env.get("NPAY_ACCOUNT_NAME")?.trim();

    if (
      !npayAccount ||
      !npayBankBin ||
      !npayAccountName
    ) {
      return json(
        {
          success: false,
          error:
            "NPAY bank account configuration is missing",
        },
        500
      );
    }

    // =====================================================
    // 8. TẠO MÃ ĐƠN
    // =====================================================

    const randomPart =
      crypto.randomUUID()
        .replaceAll("-", "")
        .slice(0, 8)
        .toUpperCase();

    const timestamp =
      Date.now().toString(36).toUpperCase();

    const orderCode =
      `NPAY${timestamp}${randomPart}`;

    const paymentCode = orderCode;

    // =====================================================
    // 9. TẠO QR NPAY
    // =====================================================

    const qrParams = new URLSearchParams({
      acc: npayAccount,
      bank: npayBankBin,
      amount: String(total),
      des: paymentCode,
      template: "compact",
    });

    const qrUrl =
      `https://qr.npay.vn/img?${qrParams.toString()}`;

    // =====================================================
    // 10. THỜI HẠN THANH TOÁN
    // =====================================================

    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    ).toISOString();

    // =====================================================
    // 11. TẠO PAYMENT ORDER
    // =====================================================

    const {
      data: paymentOrder,
      error: insertError,
    } = await supabase
      .from("payment_orders")
      .insert({
        user_id: user.id,

        package_id: String(pkg.id),
        package_name: String(pkg.name),

        delivery_target: deliveryTarget,

        amount,
        fee,
        total,

        order_code: orderCode,
        payment_code: paymentCode,

        status: "PENDING",

        qr_url: qrUrl,

        gateway: "NPAY",

        created_at: new Date().toISOString(),
        expires_at: expiresAt,
      })
      .select(
        `
          id,
          package_id,
          package_name,
          delivery_target,
          amount,
          fee,
          total,
          order_code,
          payment_code,
          status,
          qr_url,
          gateway,
          created_at,
          expires_at
        `
      )
      .single();

    if (insertError) {
      console.error(
        "INSERT PAYMENT ORDER ERROR:",
        insertError
      );

      return json(
        {
          success: false,
          error: "Cannot create payment order",
        },
        500
      );
    }

    // =====================================================
    // 12. TRẢ KẾT QUẢ CHO FRONTEND
    // =====================================================

    return json({
      success: true,

      payment: {
        id: paymentOrder.id,

        orderCode:
          paymentOrder.order_code,

        paymentCode:
          paymentOrder.payment_code,

        amount:
          paymentOrder.amount,

        fee:
          paymentOrder.fee,

        total:
          paymentOrder.total,

        qrUrl:
          paymentOrder.qr_url,

        account:
          npayAccount,

        accountName:
          npayAccountName,

        bankBin:
          npayBankBin,

        packageName:
          paymentOrder.package_name,

        deliveryTarget:
          paymentOrder.delivery_target,

        status:
          paymentOrder.status,

        createdAt:
          paymentOrder.created_at,

        expiresAt:
          paymentOrder.expires_at,
      },
    });

  } catch (error) {
    console.error(
      "CREATE NPAY ORDER ERROR:",
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
