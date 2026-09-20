import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY. " +
      "Kiểm tra file .env ở thư mục gốc (xem .env.example)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =====================================================
// ANTI-SPAM HELPERS
// =====================================================

let cachedIp = null;
let ipCacheTime = 0;

export async function getClientIp() {
  const now = Date.now();
  // Cache IP 5 phút
  if (cachedIp && now - ipCacheTime < 5 * 60 * 1000) {
    return cachedIp;
  }

  try {
    // ✅ Dùng Edge Function — chính xác 100%
    const { data, error } = await supabase.functions.invoke("get-my-ip-");

    if (error) {
      console.error("[getClientIp] Edge Function error:", error);
      return null;
    }

    cachedIp = data?.ip || null;
    ipCacheTime = now;
    return cachedIp;
  } catch (err) {
    console.error("[getClientIp] exception:", err);
    return null;
  }
}

export async function checkRateLimit(
  endpoint,
  maxRequests = 30,
  windowSeconds = 60
) {
  try {
    const ip = await getClientIp();
    if (!ip) return true;

    const { data: allowed, error } = await supabase.rpc("check_rate_limit", {
      p_ip: ip,
      p_endpoint: endpoint,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.error("[rate limit] error:", error);
      return true;
    }

    return allowed;
  } catch (err) {
    console.error("[rate limit] exception:", err);
    return true;
  }
}

export async function logFraudEvent(
  userId,
  eventType,
  severity = "low",
  details = {}
) {
  try {
    const ip = await getClientIp();
    const { data, error } = await supabase.rpc("log_fraud_event", {
      p_user_id: userId,
      p_event_type: eventType,
      p_severity: severity,
      p_details: details,
      p_ip: ip,
    });

    if (error) console.error("[fraud log] error:", error);
    return data;
  } catch (err) {
    console.error("[fraud log] exception:", err);
    return null;
  }
}
