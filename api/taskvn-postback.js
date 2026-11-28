// Nhận Postback từ TASKVN rồi cộng xu cho member.
// Postback URL đã cài trên TASKVN: https://nxx315.com/taskvn-postback
// (vercel.json rewrite /taskvn-postback -> /api/taskvn-postback)
//
// Biến môi trường cần thêm trên Vercel (Settings -> Environment Variables):
//   TASKVN_SITE_KEY            = pk_...  (key công khai của site)
//   TASKVN_SECRET              = sk_...  (Secret key — TUYỆT ĐỐI không đưa vào code/GitHub)
//   SUPABASE_URL               = URL project Supabase chứa bảng profiles
//   SUPABASE_SERVICE_ROLE_KEY  = service_role key của project đó
import crypto from "crypto";

const SITE_KEY = process.env.TASKVN_SITE_KEY;
const SECRET = process.env.TASKVN_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MAX_AMOUNT = 20000; // chặn số tiền bất thường (xu)
const MAX_SKEW_SEC = 900; // lệch giờ tối đa 15 phút
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const safeEqual = (a, b) =>
  a.length === b.length &&
  crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

// Giải mã postback dạng mã hóa AES-256-GCM (V273) hoặc đọc dạng chữ ký sig2.
// Trả về { status, subId, amount, taskId, reason } hoặc null nếu không hợp lệ.
function parsePostback(q) {
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

async function credit({ taskId, subId, amount }) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/taskvn_credit`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_task_id: taskId,
      p_user_id: subId,
      p_amount: amount,
    }),
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  return r.json(); // 'credited' | 'duplicate' | 'no_user' | 'bad_amount'
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  if (req.method !== "GET") return res.status(405).send("method");

  if (!SITE_KEY || !SECRET || !SUPABASE_URL || !SERVICE_KEY) {
    console.error("taskvn-postback: thiếu biến môi trường");
    return res.status(500).send("config");
  }

  let pb;
  try {
    pb = parsePostback(req.query);
  } catch {
    pb = null;
  }
  if (!pb) return res.status(403).send("invalid");

  if (pb.status === "violation") {
    // Taskvn báo member gian lận: chỉ ghi log để bạn kiểm tra tài khoản.
    console.warn("taskvn violation", pb.subId, pb.reason);
    return res.status(200).send("ok");
  }

  if (pb.status !== "completed") return res.status(200).send("ok");

  const amount = Math.floor(pb.amount);
  if (
    !UUID_RE.test(pb.subId) ||
    !pb.taskId ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > MAX_AMOUNT
  ) {
    console.warn("taskvn: dữ liệu không hợp lệ", pb.subId, pb.amount);
    return res.status(400).send("bad");
  }

  try {
    const result = await credit({
      taskId: pb.taskId,
      subId: pb.subId,
      amount,
    });
    console.log("taskvn credit", result, pb.subId, amount, pb.taskId);
    // Trả ok cả khi 'duplicate'/'no_user' để Taskvn không gửi lại mãi.
    return res.status(200).send("ok");
  } catch (err) {
    console.error("taskvn credit error:", err);
    // 500 để Taskvn có thể gửi lại sau.
    return res.status(500).send("error");
  }
}
