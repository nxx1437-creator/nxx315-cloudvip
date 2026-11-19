// src/pages/Support/useMessageFeedback.js — 👍/👎 cho tin nhắn của AI
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";

export default function useMessageFeedback(conversation, user) {
  const [feedback, setFeedback] = useState({});
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  const openFeedback = (message, rating) => {
    if (feedback[message.id]?.status === "sent") return;
    setFeedback((prev) => ({ ...prev, [message.id]: { rating, status: "draft" } }));
    setFeedbackTarget({ message, rating });
  };
  const closeFeedback = () => {
    if (feedbackTarget) {
      const id = feedbackTarget.message.id;
      setFeedback((prev) => {
        if (prev[id]?.status !== "draft") return prev;
        const next = { ...prev }; delete next[id]; return next;
      });
    }
    setFeedbackTarget(null);
  };
  const submitFeedback = async ({ reasons, comment }) => {
    if (!feedbackTarget) return;
    const { message, rating } = feedbackTarget;
    setFeedback((prev) => ({ ...prev, [message.id]: { rating, status: "sent" } }));
    setFeedbackTarget(null);
    try {
      await supabase.from("support_message_feedback").insert({
        message_id: String(message.id), conversation_id: String(conversation.id), user_id: user?.id,
        rating, reasons, comment: comment || null,
      });
    } catch (e) { console.warn(e); }
  };
  const resetFeedback = () => { setFeedback({}); setFeedbackTarget(null); };

  return { feedback, feedbackTarget, openFeedback, closeFeedback, submitFeedback, resetFeedback };
}
