// src/pages/Support/useMessageFeedback.js — 👍/👎 cho tin nhắn của AI
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";

export default function useMessageFeedback(conversation, user) {
  const [feedback, setFeedback] = useState({});
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  // Tự reset khi đổi conversation (phòng khi caller quên gọi resetFeedback)
  useEffect(() => {
    setFeedback({});
    setFeedbackTarget(null);
  }, [conversation?.id]);

  const openFeedback = useCallback(
    (message, rating) => {
      if (!message?.id) return;
      const current = feedback[message.id];
      if (current?.status === "sent" || current?.status === "sending") return;

      // Xoá draft cũ nếu đang mở target khác
      if (feedbackTarget && feedbackTarget.message.id !== message.id) {
        const oldId = feedbackTarget.message.id;
        setFeedback((prev) => {
          if (prev[oldId]?.status !== "draft") return prev;
          const next = { ...prev };
          delete next[oldId];
          return next;
        });
      }

      setFeedback((prev) => ({ ...prev, [message.id]: { rating, status: "draft" } }));
      setFeedbackTarget({ message, rating });
    },
    [feedback, feedbackTarget]
  );

  const closeFeedback = useCallback(() => {
    setFeedbackTarget((target) => {
      if (target) {
        const id = target.message.id;
        setFeedback((prev) => {
          if (prev[id]?.status !== "draft") return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
      return null;
    });
  }, []);

  const submitFeedback = useCallback(
    async ({ reasons, comment } = {}) => {
      if (!feedbackTarget || !conversation?.id) return { ok: false };

      const { message, rating } = feedbackTarget;
      const id = message.id;

      // Đánh dấu đang gửi (không cho openFeedback override)
      setFeedback((prev) => ({ ...prev, [id]: { rating, status: "sending" } }));
      setFeedbackTarget(null);

      try {
        const { error } = await supabase.from("support_message_feedback").upsert(
          {
            message_id: String(id),
            conversation_id: String(conversation.id),
            user_id: user?.id ?? null,
            rating,
            reasons,
            comment: comment || null,
          },
          { onConflict: "message_id,user_id" }
        );

        if (error) throw error;

        setFeedback((prev) => ({ ...prev, [id]: { rating, status: "sent" } }));
        return { ok: true };
      } catch (e) {
        console.warn("[Feedback] submit failed:", e);
        // Rollback về draft để user thử lại
        setFeedback((prev) => ({ ...prev, [id]: { rating, status: "draft" } }));
        return { ok: false, error: e };
      }
    },
    [feedbackTarget, conversation?.id, user?.id]
  );

  const resetFeedback = useCallback(() => {
    setFeedback({});
    setFeedbackTarget(null);
  }, []);

  return {
    feedback,
    feedbackTarget,
    openFeedback,
    closeFeedback,
    submitFeedback,
    resetFeedback,
  };
    }
