// src/pages/Support/useRatingPrompt.js — lâu lâu mới hiện thẻ "Đánh giá chất lượng hỗ trợ" sau khi AI trả lời
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";

const MIN_USER_MSGS = 3; // chat ít nhất 3 tin của người dùng mới hỏi
const CHANCE = 0.35; // mỗi cuộc trò chuyện đủ điều kiện chỉ có ~35% được hỏi
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // sau khi đánh giá hoặc bỏ qua, 3 ngày sau mới hỏi lại
const LAST_KEY = "nxx_rate_last";
const convKey = (id) => `nxx_rate_c_${id}`;

const read = (k) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    // bộ nhớ bị chặn thì bỏ qua
  }
};

export default function useRatingPrompt({ conversationId, userId, userMsgCount, idle }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !userId || !idle || userMsgCount < MIN_USER_MSGS) return;
    const k = convKey(conversationId);
    const state = read(k); // null | "show" | "skip" | "done"
    if (state === "show") {
      setShow(true);
      return;
    }
    if (state) return;
    const last = Number(read(LAST_KEY) || 0);
    const ok = Date.now() - last > COOLDOWN_MS && Math.random() < CHANCE;
    write(k, ok ? "show" : "skip");
    if (ok) setShow(true);
  }, [conversationId, userId, idle, userMsgCount]);

  const finish = useCallback(() => {
    if (conversationId) write(convKey(conversationId), "done");
    write(LAST_KEY, String(Date.now()));
    setShow(false);
  }, [conversationId]);

  const submit = useCallback(
    async ({ score, reasons, comment }) => {
      try {
        const { error } = await supabase.from("support_chat_ratings").insert({
          user_id: userId,
          conversation_id: String(conversationId),
          score,
          reasons: reasons || [],
          comment: comment || null,
        });
        if (error) throw error;
        return { ok: true };
      } catch (e) {
        console.warn("[Rating] submit failed:", e);
        return { ok: false };
      }
    },
    [userId, conversationId]
  );

  return { visible: show && idle, submit, finish };
}
