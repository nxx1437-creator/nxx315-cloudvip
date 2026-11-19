// src/pages/Support/callSupportAI.js — gọi Edge Function trả lời của AI
import { supabase } from "../../lib/supabaseClient.js";
import { AI_ENDPOINT } from "./constants.js";

export async function callSupportAI(conversationId, imageUrl, messageText) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Chưa đăng nhập");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  const bodyPayload = { conversation_id: conversationId, user_message: imageUrl ? "Phân tích ảnh này giúp mình" : messageText };
  if (imageUrl) bodyPayload.image_url = imageUrl;
  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
    body: JSON.stringify(bodyPayload),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  if (!response.ok) {
    let errData = {};
    try { errData = await response.json(); } catch (_) {}
    throw new Error(errData?.error || `AI trả về lỗi ${response.status}`);
  }
  return response.json();
}
