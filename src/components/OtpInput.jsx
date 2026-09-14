import React, { useRef, useEffect } from "react";

export default function OtpInput({ value = "", onChange, length = 6, disabled }) {
  const inputsRef = useRef([]);

  const digits = value.split("").slice(0, length);
  while (digits.length < length) digits.push("");

  const handleChange = (index, val) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) return;

    const newDigits = [...digits];
    for (let i = 0; i < cleaned.length && index + i < length; i++) {
      newDigits[index + i] = cleaned[i];
    }
    onChange(newDigits.join("").slice(0, length));

    const nextIndex = Math.min(index + cleaned.length, length - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = "";
      } else if (index > 0) {
        newDigits[index - 1] = "";
        inputsRef.current[index - 1]?.focus();
      }
      onChange(newDigits.join(""));
    }
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  useEffect(() => {
    if (!value) inputsRef.current[0]?.focus();
  }, []);

  return (
    <div className="flex items-center justify-between gap-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="h-14 w-full rounded-xl border border-slate-300 bg-white text-center text-xl font-bold text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
        />
      ))}
    </div>
  );
}
