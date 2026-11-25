// src/pages/Support/useChatLimit.js — giới hạn số lượt gửi tin để khỏi bị spam làm hết token AI
import { useCallback, useEffect, useRef, useState } from "react";

export const MAX_PER_MIN = 6;
export const MAX_PER_DAY = 40;
const MIN_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const NOTICE_MS = 8000;

const MSG_DAY = `Bạn đã dùng hết ${MAX_PER_DAY} lượt chat hôm nay. Quay lại vào ngày mai nhé!`;
const MSG_MIN_SERVER = "Bạn gửi hơi nhanh rồi, chờ ít giây rồi thử lại nhé.";

function readLog(key) {
  try {
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function useChatLimit(userId) {
  const [limitNotice, setLimitNotice] = useState("");
  const timer = useRef(0);

  const show = useCallback((msg) => {
    setLimitNotice(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLimitNotice(""), NOTICE_MS);
  }, []);

  const clearLimitNotice = useCallback(() => {
    clearTimeout(timer.current);
    setLimitNotice("");
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  // true = được gửi (và ghi nhận 1 lượt); false = đã chạm giới hạn, có hiện thông báo
  const checkLimit = useCallback(() => {
    const key = `nxx_chat_log_${userId || "guest"}`;
    const now = Date.now();
    const log = readLog(key).filter((t) => typeof t === "number" && now - t < DAY_MS);

    if (log.length >= MAX_PER_DAY) {
      show(MSG_DAY);
      return false;
    }
    const lastMin = log.filter((t) => now - t < MIN_MS);
    if (lastMin.length >= MAX_PER_MIN) {
      const wait = Math.max(1, Math.ceil((MIN_MS - (now - Math.min(...lastMin))) / 1000));
      show(`Bạn gửi hơi nhanh rồi, thử lại sau ${wait} giây nhé.`);
      return false;
    }

    log.push(now);
    try {
      localStorage.setItem(key, JSON.stringify(log));
    } catch {
      // bộ nhớ đầy hoặc bị chặn thì bỏ qua, server vẫn chặn
    }
    setLimitNotice("");
    return true;
  }, [userId, show]);

  // Server (trigger trong Supabase) từ chối thì hiện cùng kiểu thông báo. Trả về true nếu là lỗi giới hạn
  const notifyServerLimit = useCallback(
    (message) => {
      const m = String(message || "");
      if (!/RATE_LIMIT/.test(m)) return false;
      show(/DAY/.test(m) ? MSG_DAY : MSG_MIN_SERVER);
      return true;
    },
    [show]
  );

  return { checkLimit, limitNotice, clearLimitNotice, notifyServerLimit };
}
