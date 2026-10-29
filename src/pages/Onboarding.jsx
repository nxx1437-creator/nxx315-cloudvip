import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, ArrowRight, Loader2, ShieldCheck, Info, AlertCircle } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthField from "../components/AuthField.jsx";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/index.js";

const T = {
  vi: {
    title: "Thông tin cá nhân",
    sub: "Hãy cho chúng tôi biết bạn muốn được gọi là gì trong NXX315 Studio.",
    nameLabel: "TÊN HIỂN THỊ",
    namePh: "Nhập tên hiển thị của bạn",
    noteTitle: "Lưu ý",
    note1: "Tên hiển thị có thể được hệ thống tự động điều chỉnh nếu vi phạm quy định cộng đồng.",
    note2: "Bạn có thể đổi tên khác trong Cài đặt sau khi hoàn tất.",
    next: "Tiếp tục",
    termsTitle: "Điều khoản sử dụng",
    hello: "Xin chào",
    helloTail: ", trước khi tiếp tục hãy đọc và đồng ý với điều khoản của chúng mình.",
    bodyPre: "Bằng việc sử dụng NXX315 Studio Rewards, bạn đồng ý tuân thủ",
    and: "và",
    bodyPost: "của chúng mình. Tên hiển thị của bạn có thể bị hệ thống tự động điều chỉnh nếu vi phạm quy định cộng đồng.",
    terms: "Điều khoản sử dụng",
    privacy: "Chính sách quyền riêng tư",
    agree: "Tôi đã đọc và đồng ý với Điều khoản sử dụng & Chính sách quyền riêng tư.",
    finish: "Hoàn thành thiết lập",
    errName: "Vui lòng nhập tên hiển thị.",
    errShort: "Tên hiển thị quá ngắn.",
    errAgree: "Vui lòng đồng ý với Điều khoản sử dụng để tiếp tục.",
    renamed: (a, b) =>
      `Tên "${a}" không phù hợp với quy định, hệ thống đã đổi thành "${b}". Bạn có thể đổi tên khác trong Cài đặt sau.`,
  },
  en: {
    title: "Personal information",
    sub: "Tell us what you would like to be called in NXX315 Studio.",
    nameLabel: "DISPLAY NAME",
    namePh: "Enter your display name",
    noteTitle: "Note",
    note1: "Your display name may be adjusted automatically if it breaks community rules.",
    note2: "You can change it later in Settings.",
    next: "Continue",
    termsTitle: "Terms of use",
    hello: "Hello",
    helloTail: ", please read and accept our terms before continuing.",
    bodyPre: "By using NXX315 Studio Rewards, you agree to follow the",
    and: "and the",
    bodyPost: "Your display name may be adjusted automatically if it breaks community rules.",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    agree: "I have read and agree to the Terms of Use & Privacy Policy.",
    finish: "Finish setup",
    errName: "Please enter a display name.",
    errShort: "Display name is too short.",
    errAgree: "Please accept the Terms of Use to continue.",
    renamed: (a, b) =>
      `The name "${a}" breaks our rules, so it was changed to "${b}". You can pick another name in Settings later.`,
  },
};

const btnCls =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";

export default function Onboarding() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const x = T[lang] || T.vi;
  const { session, loading: sessionLoading } = useSession();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [renameNotice, setRenameNotice] = useState("");
  const prefilled = useRef(false);

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate("/login", { replace: true });
    }
  }, [sessionLoading, session, navigate]);

  // Gợi ý sẵn tên (từ email hoặc Google) để người dùng chỉ cần bấm Tiếp tục
  useEffect(() => {
    if (!session || prefilled.current) return;
    prefilled.current = true;
    const m = session.user?.user_metadata || {};
    const guess = String(m.username || m.full_name || m.name || "").trim();
    if (guess) setUsername(guess.slice(0, 30));
  }, [session]);

  const handleNext = (e) => {
    e?.preventDefault();
    const name = username.trim();
    if (!name) return setError(x.errName);
    if (name.length < 2) return setError(x.errShort);
    setError("");
    setStep(2);
  };

  const handleFinish = async () => {
    if (!agreed) {
      setError(x.errAgree);
      return;
    }

    setSubmitting(true);
    setError("");

    const { data, error: rpcError } = await supabase.rpc("complete_onboarding", {
      p_user_id: session.user.id,
      p_username: username.trim(),
      p_referral_code: null,
    });

    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (result?.was_renamed) {
      setRenameNotice(x.renamed(username.trim(), result.final_username));
      setTimeout(() => navigate("/dashboard"), 2800);
    } else {
      navigate("/dashboard");
    }
  };

  if (sessionLoading || !session) return null;

  const bars = (
    <div className="mb-5 flex items-center gap-2">
      {[1, 2].map((n) => (
        <div
          key={n}
          className={`h-1.5 flex-1 rounded-full transition ${
            step >= n ? "bg-emerald-500" : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );

  const errBox = error && (
    <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      {error}
    </p>
  );

  /* Thông báo đổi tên */
  if (renameNotice) {
    return (
      <AuthLayout title={x.title} icon={<Info size={28} />} centered showHome={false}>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm leading-6 text-amber-800">
          {renameNotice}
        </div>
        <div className="mt-4 flex justify-center text-emerald-600">
          <Loader2 size={20} className="animate-spin" />
        </div>
      </AuthLayout>
    );
  }

  /* Bước 1: tên hiển thị */
  if (step === 1) {
    return (
      <AuthLayout
        title={x.title}
        subtitle={x.sub}
        icon={<User size={28} />}
        centered
        showHome={false}
      >
        {bars}
        <form onSubmit={handleNext} className="space-y-3.5">
          <AuthField
            id="ob-name"
            label={
              <>
                <span className="mr-1 text-rose-500">*</span>
                {x.nameLabel}
              </>
            }
            icon={<User size={18} />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={x.namePh}
            maxLength={30}
            autoComplete="nickname"
            autoFocus
          />

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <p className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
              <Info size={17} className="text-amber-500" />
              {x.noteTitle}
            </p>
            <ul className="mt-2 space-y-1.5 text-[13px] leading-5 text-slate-600">
              {[x.note1, x.note2].map((n) => (
                <li key={n} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {n}
                </li>
              ))}
            </ul>
          </div>

          {errBox}

          <button type="submit" className={btnCls}>
            {x.next}
            <ArrowRight size={17} />
          </button>
        </form>
      </AuthLayout>
    );
  }

  /* Bước 2: điều khoản */
  return (
    <AuthLayout
      title={x.termsTitle}
      subtitle={
        <>
          {x.hello} <span className="font-bold text-slate-900">{username.trim()}</span>
          {x.helloTail}
        </>
      }
      icon={<ShieldCheck size={28} />}
      centered
      showHome={false}
      onBack={() => {
        setError("");
        setStep(1);
      }}
    >
      {bars}
      <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-[13px] leading-6 text-slate-600">
        {x.bodyPre}{" "}
        <Link to="/terms" target="_blank" className="font-semibold text-emerald-700 hover:underline">
          {x.terms}
        </Link>{" "}
        {x.and}{" "}
        <Link to="/privacy" target="_blank" className="font-semibold text-emerald-700 hover:underline">
          {x.privacy}
        </Link>{" "}
        {x.bodyPost}
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 rounded accent-emerald-600"
        />
        {x.agree}
      </label>

      {error && <div className="mt-3">{errBox}</div>}

      <button onClick={handleFinish} disabled={submitting} className={`${btnCls} mt-5`}>
        {submitting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            {x.finish}
            <ArrowRight size={17} />
          </>
        )}
      </button>
    </AuthLayout>
  );
  }
            
