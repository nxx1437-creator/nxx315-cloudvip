// supabase/functions/taskvn-postback/index.ts
//
// Nhận Postback từ TASKVN rồi cộng xu cho member (gọi hàm SQL taskvn_credit).
// Postback URL đã cài trên TASKVN: https://nxx315.com/taskvn-postback
// (vercel.json chuyển tiếp sang hàm này).
//
// Triển khai (không cần Supabase CLI):
//   Supabase Dashboard -> Edge Functions -> Create a new function
//   -> tên đúng "taskvn-postback" -> dán nội dung file này -> Deploy
//   -> vào Settings của hàm, TẮT "Verify JWT" (Taskvn gọi vào không kèm đăng nhập;
//      hàm vẫn an toàn nhờ kiểm tra chữ ký bằng Secret key).
//
// SECRETS (Edge Functions -> Manage secrets):
//   TASKVN_SITE_KEY = pk_...
//   TASKVN_SECRET   = sk_...   (KHÔNG để trong code/GitHub)
//   (SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY Supabase tự có sẵn)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import crypto from "node:crypto";

const SITE_KEY = Deno.env.get("TASKVN_SITE_KEY") ?? "";
const SECRET = Deno.env.get("TASKVN_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const MAX_AMOUNT = 20000; // chặn số tiền bất thường (xu)
const MAX_SKEW_SEC = 900; // lệch giờ tối đa 15 phút
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const text = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const safeEqual = (a: string, b: string) =>
  a.length === b.length &&
  crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

type Postback = {
  status: string;
  subId: string;
  amount: number;
  taskId: string;
  reason: string;
};

// Giải mã postback mã hóa AES-256-GCM (enc) hoặc đọc dạng chữ ký sig2.
function parsePostback(q: Record<string, string>): Postback | null {
  const now = Date.now() / 1000;

  if (q.enc) {
    const calc = crypto
      .createHmac("sha256", SECRET)
      .update("v2|" + SITE_KEY + "|" + q.ts + "|" + q.enc)
      .digest("hex");
    if (!safeEqual(String(q.sig3 || ""), calc)) return null;

    const raw = Buffer.from(String(q.enc), "base64url");
    if (raw.length < 29) return null;
    const key = crypto
      .createHash("sha256")
      .update("taskvn-pbenc|" + SECRET)
      .digest();
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      key,
      raw.subarray(0, 12)
    );
    decipher.setAuthTag(raw.subarray(raw.length - 16));
    const d = JSON.parse(
      Buffer.concat([
        decipher.update(raw.subarray(12, raw.length - 16)),
        decipher.final(),
      ]).toString("utf8")
    );

    if (
      d.site_key !== SITE_KEY ||
      String(d.ts) !== String(q.ts) ||
      Math.abs(now - Number(d.ts)) > MAX_SKEW_SEC
    ) {
      return null;
    }
    return {
      status: d.status,
      subId: String(d.sub_id),
      amount: Number(d.amount),
      taskId: String(d.task_id),
      reason: String(d.reason || ""),
    };
  }

  const base = [q.sub_id, q.amount, q.task_id, q.ts, q.status].join("|");
  const calc = crypto.createHmac("sha256", SECRET).update(base).digest("hex");
  if (!safeEqual(String(q.sig2 || ""), calc)) return null;
  if (q.site_key !== SITE_KEY || Math.abs(now - Number(q.ts)) > MAX_SKEW_SEC) {
    return null;
  }
  return {
    status: q.status,
    subId: String(q.sub_id),
    amount: Number(q.amount),
    taskId: String(q.task_id),
    reason: "",
  };
}

Deno.serve(async (req) => {
  if (req.method !== "GET") return text("method", 405);

  if (!SITE_KEY || !SECRET || !SUPABASE_URL || !SERVICE_KEY) {
    console.error("taskvn-postback: thiếu secret TASKVN_SITE_KEY / TASKVN_SECRET");
    return text("config", 500);
  }

  const q = Object.fromEntries(new URL(req.url).searchParams.entries());

  let pb: Postback | null;
  try {
    pb = parsePostback(q);
  } catch {
    pb = null;
  }
  if (!pb) return text("invalid", 403);

  if (pb.status === "violation") {
    // Taskvn báo member gian lận: chỉ ghi log để bạn kiểm tra tài khoản.
    console.warn("taskvn violation", pb.subId, pb.reason);
    return text("ok");
  }
  if (pb.status !== "completed") return text("ok");

  const amount = Math.floor(pb.amount);
  if (
    !UUID_RE.test(pb.subId) ||
    !pb.taskId ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > MAX_AMOUNT
  ) {
    console.warn("taskvn: dữ liệu không hợp lệ", pb.subId, pb.amount);
    return text("bad", 400);
  }

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await admin.rpc("taskvn_credit", {
      p_task_id: pb.taskId,
      p_user_id: pb.subId,
      p_amount: amount,
    });
    if (error) throw error;
    console.log("taskvn credit", data, pb.subId, amount, pb.taskId);
    // Trả ok cả khi 'duplicate'/'no_user' để Taskvn không gửi lại mãi.
    return text("ok");
  } catch (err) {
    console.error("taskvn credit error:", err);
    // 500 để Taskvn có thể gửi lại sau.
    return text("error", 500);
  }
});
