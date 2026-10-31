import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, Globe, Mail, Server, AlertTriangle } from "lucide-react";
import { Section, Chip, CARD } from "./cpUi.jsx";
import SpecCard from "./SpecCard.jsx";
import ComboCard from "./ComboCard.jsx";
import { REGION_LABEL, VMOS_URL, withDiscount } from "./cpUtils.js";

export default function BuyView({
  pkgs,
  selectedId,
  setSelectedId,
  account,
  setAccount,
  agreed,
  setAgreed,
  hasActive,
}) {
  const list = useMemo(() => withDiscount(pkgs), [pkgs]);

  return (
    <div className="space-y-6">
      {hasActive && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          Bạn đang có một máy còn hạn hoặc đang được giao. Xem ở tab "Máy của tôi".
        </div>
      )}

      <SpecCard />

      <Section icon={Server} title="Máy chủ">
        <div className="grid grid-cols-2 gap-3">
          <Chip text={REGION_LABEL} />
        </div>
      </Section>

      <Section icon={Globe} title="Hệ thống">
        <div className="grid grid-cols-2 gap-3">
          <Chip text="Android 13" />
        </div>
      </Section>

      <Section icon={Clock} title="Combo">
        {list.length === 0 ? (
          <p className={`py-6 text-center text-sm font-bold text-slate-400 ${CARD}`}>
            Đang chờ hàng về
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {list.map((p) => (
              <ComboCard
                key={p.id}
                p={p}
                on={p.id === selectedId}
                onSelect={() => setSelectedId(p.id)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section icon={Mail} title="Tài khoản VMOS Cloud nhận máy">
        <input
          type="email"
          inputMode="email"
          autoCapitalize="none"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="ten@gmail.com"
          className="h-14 w-full rounded-2xl border border-emerald-100 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-amber-700">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            Máy chuyển thẳng vào tài khoản này, nhập sai sẽ không lấy lại được.{" "}
            <a
              href={VMOS_URL}
              target="_blank"
              rel="noreferrer"
              className="font-bold underline"
            >
              Chưa có tài khoản?
            </a>
          </span>
        </p>
      </Section>

      <label className={`flex items-start gap-3 p-3.5 ${CARD}`}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-emerald-600"
        />
        <span className="text-xs leading-5 text-slate-500">
          Tôi đã đọc và đồng ý với{" "}
          <Link to="/redemption-policy" className="font-bold text-emerald-700">
            Quy định đổi thưởng
          </Link>{" "}
          và{" "}
          <Link to="/privacy" className="font-bold text-emerald-700">
            Chính sách quyền riêng tư
          </Link>
          .
        </span>
      </label>
    </div>
  );
}
