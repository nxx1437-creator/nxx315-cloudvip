// src/pages/Support/callSupportAI.js — gọi Edge Function trả lời của AI
import { supabase } from "../../lib/supabaseClient.js";
import { AI_ENDPOINT } from "./constants.js";

const TIMEOUT_MS = 60000;

export async function callSupportAI(conversationId, imageUrl, messageText) {
  if (!conversationId) throw new Error("Thiếu mã cuộc trò chuyện");

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) throw new Error("Thiếu cấu hình Supabase");

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Chưa đăng nhập");

  // Giữ nguyên message gốc nếu user gửi ảnh kèm câu hỏi
  const userMessage = imageUrl
    ? messageText?.trim() || "Phân tích ảnh này giúp mình"
    : messageText || "";

  const bodyPayload = {
    conversation_id: conversationId,
    user_message: userMessage,
  };
  if (imageUrl) bodyPayload.image_url = imageUrl;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let response;
    try {
      response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: anonKey,
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("AI phản hồi quá lâu, vui lòng thử lại.");
      }
      throw new Error("Không kết nối được tới AI. Kiểm tra mạng và thử lại.");
    }

    if (!response.ok) {
      let errData = {};
      try {
        errData = await response.json();
      } catch (_) {
        // Body không phải JSON (502/504 gateway trả HTML)
      }
      const serverMsg =
        errData?.error?.message ||
        errData?.error ||
        errData?.message ||
        `AI trả về lỗi ${response.status}`;
      const err = new Error(serverMsg);
      err.status = response.status;
      throw err;
    }

    try {
      return await response.json();
    } catch (_) {
      throw new Error("AI trả về dữ liệu không hợp lệ.");
    }
  } finally {
    clearTimeout(timeoutId);
  }
    }
