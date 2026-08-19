// supabase/functions/start-task/index.ts
//
// Được gọi từ frontend khi người dùng bấm "Làm nhiệm vụ".
// 1. Gọi RPC start_task() (đã có sẵn trong schema_tasks.sql) bằng chính JWT
//    của người dùng đang gọi -> sinh Token TTL 15 phút, đúng người, đúng nhiệm vụ.
// 2. Ghép Token vào URL callback của app (/task/callback?token=...).
// 3. Gọi API Link4M để rút gọn URL đó -> trả link rút gọn về cho frontend.
//    Link4M chỉ đưa trình duyệt tới URL đích (callback có Token) SAU KHI
//    người dùng thực sự hoàn thành bước quảng cáo -> đó chính là bằng chứng
//    "đã vượt link", không cần Link4M gửi thêm chữ ký gì khác.
//
// TRIỂN KHAI (không cần cài Supabase CLI):
//   Supabase Dashboard -> Edge Functions -> Create a new function
//   -> đặt tên đúng "start-task" -> dán toàn bộ nội dung file này -> Deploy
//
// SECRETS cần thêm (Supabase Dashboard -> Edge Functions -> Manage secrets):
//   LINK4M_API_KEY = <API Key của bạn, KHÔNG để trong code/GitHub>
//   SITE_URL       = https://nxx315-cloudvip.vercel.app   (domain thật của bạn)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

/**
 * Rút gọn URL qua nhà cung cấp tương ứng.
 * Chỉ LINK4M đã có API Key thật; các provider khác tạm thời bỏ qua bước
 * quảng cáo (trả thẳng URL gốc) cho tới khi bạn gửi API Key của họ.
 */
async function shortenLink(provider: string, longUrl: string): Promise<string> {
  if (provider === "LINK4M") {
    const apiKey = Deno.env.get("LINK4M_API_KEY");
    if (!apiKey) throw new Error("Thiếu secret LINK4M_API_KEY trong Supabase Edge Functions");

    const apiUrl = `https://link4m.co/api-shorten/v2?api=${apiKey}&url=${encodeURIComponent(longUrl)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.status !== "success" || !data.shortenedUrl) {
      throw new Error(data.message || "Link4M trả về lỗi không xác định");
    }
    return data.shortenedUrl;
  }

  console.warn(
    `[start-task] Chưa có API Key thật cho provider "${provider}" — trả thẳng URL gốc, bỏ qua bước quảng cáo.`
  );
  return longUrl;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Thiếu Authorization header" }, 401);

    // Client mang danh nghĩa CHÍNH người dùng đang gọi, để auth.uid() bên
    // trong hàm SQL start_task() trả về đúng user_id (không dùng service role ở đây).
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { task_id } = await req.json();
    if (!task_id) return json({ error: "Thiếu task_id" }, 400);

    const { data: task, error: taskError } = await userClient
      .from("tasks")
      .select("*")
      .eq("id", task_id)
      .single();
    if (taskError || !task) return json({ error: "Không tìm thấy nhiệm vụ" }, 404);

    const { data: startData, error: startError } = await userClient.rpc("start_task", {
      p_task_id: task_id,
    });
    if (startError) return json({ error: startError.message }, 400);

    const { token, expires_at, reward_coins } = startData[0];
    const callbackUrl = `${SITE_URL}/task/callback?token=${token}&task=${task_id}`;

    let shortUrl: string;
    try {
      shortUrl = await shortenLink(task.provider, callbackUrl);
    } catch (err) {
      return json({ error: String(err instanceof Error ? err.message : err) }, 502);
    }

    return json({ shortUrl, expiresAt: expires_at, rewardCoins: reward_coins });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});
  
