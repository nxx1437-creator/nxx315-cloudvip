import { useState, useEffect } from "react";

const STORAGE_KEY = "nxx315_login_attempts";
const MAX_ATTEMPTS = 5;          // Tối đa 5 lần sai
const LOCK_DURATION = 5 * 60 * 1000; // Khoá 5 phút

export default function useLoginRateLimit(email) {
  const [lockedUntil, setLockedUntil] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);

  // Load state từ localStorage khi mount hoặc khi email đổi
  useEffect(() => {
    if (!email) return;

    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const record = data[email.toLowerCase()];

      if (!record) {
        setLockedUntil(0);
        setAttemptsLeft(MAX_ATTEMPTS);
        return;
      }

      // Nếu hết hạn lock → reset
      if (record.lockedUntil && Date.now() > record.lockedUntil) {
        delete data[email.toLowerCase()];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setLockedUntil(0);
        setAttemptsLeft(MAX_ATTEMPTS);
        return;
      }

      setLockedUntil(record.lockedUntil || 0);
      setAttemptsLeft(Math.max(0, MAX_ATTEMPTS - (record.attempts || 0)));
    } catch (e) {
      console.warn("[RateLimit] Parse error:", e);
    }
  }, [email]);

  // Ghi nhận 1 lần sai
  const recordFailure = () => {
    if (!email) return { locked: false, attemptsLeft: MAX_ATTEMPTS };

    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const key = email.toLowerCase();
      const record = data[key] || { attempts: 0, lockedUntil: 0 };

      record.attempts = (record.attempts || 0) + 1;

      // Nếu vượt ngưỡng → khoá
      if (record.attempts >= MAX_ATTEMPTS) {
        record.lockedUntil = Date.now() + LOCK_DURATION;
      }

      data[key] = record;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      setLockedUntil(record.lockedUntil || 0);
      setAttemptsLeft(Math.max(0, MAX_ATTEMPTS - record.attempts));

      return {
        locked: record.lockedUntil > Date.now(),
        attemptsLeft: Math.max(0, MAX_ATTEMPTS - record.attempts),
      };
    } catch (e) {
      console.warn("[RateLimit] Save error:", e);
      return { locked: false, attemptsLeft: MAX_ATTEMPTS };
    }
  };

  // Reset khi login thành công
  const reset = () => {
    if (!email) return;
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      delete data[email.toLowerCase()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
    setLockedUntil(0);
    setAttemptsLeft(MAX_ATTEMPTS);
  };

  // Đếm ngược
  const [remainingSec, setRemainingSec] = useState(0);
  useEffect(() => {
    if (!lockedUntil || lockedUntil <= Date.now()) {
      setRemainingSec(0);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setRemainingSec(left);
      if (left === 0) {
        setLockedUntil(0);
        setAttemptsLeft(MAX_ATTEMPTS);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = lockedUntil > Date.now();

  return {
    isLocked,
    lockedUntil,
    attemptsLeft,
    remainingSec,
    recordFailure,
    reset,
    maxAttempts: MAX_ATTEMPTS,
  };
    }
