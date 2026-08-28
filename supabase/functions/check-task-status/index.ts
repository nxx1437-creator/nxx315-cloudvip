// supabase/functions/check-task-status/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  const { task_log_id } = await req.json();

  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  // Lấy thông tin task log
  const { data: log } = await supabase
    .from("task_logs")
    .select("*")
    .eq("id", task_log_id)
    .single();

  if (!log) {
    return new Response(JSON.stringify({ error: "Không tìm thấy" }), { status: 404 });
  }

  let completed = false;

  // Kiểm tra với provider
  if (log.provider === "SITE2S") {
    const apiUrl = `https://site2s.com/${log.provider_slug}/info/json`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    
    if (data.status === 200 && data.view > 0) {
      completed = true;
    }
  }
  // Thêm các provider khác

  if (completed) {
    // Cập nhật trạng thái
    await supabase
      .from("task_logs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", task_log_id);

    // Consume token và cộng điểm
    await supabase.rpc("consume_task_token", { p_token: log.token });
  }

  return new Response(JSON.stringify({ completed }), {
    headers: { "Content-Type": "application/json" },
  });
});
