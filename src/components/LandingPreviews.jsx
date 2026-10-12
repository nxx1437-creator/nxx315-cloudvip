import {
  Check,
  Coins,
  Flame,
  Gift,
  Star,
  Zap,
  Plus,
  Bell,
  Home,
  ShoppingBag,
  User,
  ListChecks,
  Gamepad2,
  Smartphone,
  Phone,
} from "lucide-react";
import { DOT_BG } from "./LandingKit.jsx";

const Bar = ({ w = "w-full", c = "bg-slate-200" }) => (
  <div className={`h-2 rounded-full ${w} ${c}`} />
);

const Mock = ({ children, className = "" }) => (
  <div
    className={`w-full max-w-[260px] rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CoinPill = () => (
  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1">
    <Coins size={13} className="text-amber-500" />
    <span className="h-1.5 w-7 rounded-full bg-amber-300" />
  </span>
);

// Cửa hàng đổi thưởng (dòng đầu được tô sáng như bảng dữ liệu)
export function PvStore({ labels }) {
  const icons = [Gamepad2, Smartphone, Gift];
  const grads = [
    "from-sky-400 to-blue-600",
    "from-emerald-400 to-teal-500",
    "from-fuchsia-400 to-pink-500",
  ];
  return (
    <Mock className="max-w-[320px] space-y-2">
      {labels.map((l, i) => {
        const I = icons[i];
        return (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
              i === 0 ? "border-blue-200 bg-blue-50" : "border-slate-100"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white ${grads[i]}`}
            >
              <I size={15} />
            </span>
            <span className="flex-1 truncate text-[13px] font-semibold text-slate-800">
              {l}
            </span>
            <CoinPill />
          </div>
        );
      })}
    </Mock>
  );
}

// Điểm danh 7 ngày (kiểu Steps)
export function PvCheckin() {
  return (
    <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center">
          {i > 0 && (
            <span
              className={`h-0.5 w-2.5 sm:w-3.5 ${
                i <= 4 ? "bg-blue-500" : "bg-slate-200"
              }`}
            />
          )}
          {i < 4 ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white sm:h-7 sm:w-7">
              <Check size={13} />
            </span>
          ) : i === 4 ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-500 bg-white font-mono text-[11px] font-bold text-blue-600 ring-4 ring-blue-100 sm:h-7 sm:w-7">
              {i + 1}
            </span>
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white font-mono text-[11px] text-slate-400 sm:h-7 sm:w-7">
              {i + 1}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function PvStreak() {
  return (
    <Mock className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/30">
        <Flame size={20} />
      </span>
      <div className="flex-1 space-y-2">
        <Bar w="w-16" c="bg-slate-300" />
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-2 w-[70%] rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
        </div>
      </div>
    </Mock>
  );
}

export function PvGames({ labels }) {
  const icons = [Star, Gift, Zap];
  const grads = [
    "from-amber-300 to-orange-500",
    "from-sky-300 to-blue-600",
    "from-fuchsia-300 to-violet-500",
  ];
  return (
    <div className="flex gap-2.5">
      {labels.map((l, i) => {
        const I = icons[i];
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ${grads[i]}`}
            >
              <I size={22} />
            </span>
            <span className="max-w-[64px] truncate text-[10px] font-semibold text-slate-500">
              {l}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function PvLevel() {
  const hs = ["h-7", "h-10", "h-14", "h-[72px]", "h-24"];
  return (
    <Mock className="flex h-[130px] items-end justify-between gap-2">
      {hs.map((h, i) => (
        <div
          key={i}
          className={`w-full rounded-t-lg ${h} ${
            i === 4
              ? "bg-gradient-to-t from-sky-500 to-blue-600"
              : "bg-blue-100"
          }`}
        />
      ))}
    </Mock>
  );
}

export function PvRank() {
  return (
    <Mock className="space-y-2">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${
            n === 1 ? "border-blue-200 bg-blue-50" : "border-slate-100"
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
              n === 1 ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            {n}
          </span>
          <Bar w={n === 1 ? "w-20" : n === 2 ? "w-16" : "w-12"} />
          <span className="ml-auto">
            <CoinPill />
          </span>
        </div>
      ))}
    </Mock>
  );
}

export function PvRefer() {
  const g = [
    "from-orange-400 to-rose-500",
    "from-sky-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
  ];
  return (
    <div className="flex items-center">
      {g.map((c, i) => (
        <span
          key={i}
          className={`-ml-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ring-4 ring-slate-50 first:ml-0 ${c}`}
        >
          <User size={20} className="text-white/90" />
        </span>
      ))}
      <span className="-ml-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 ring-4 ring-slate-50">
        <Plus size={20} />
      </span>
    </div>
  );
}

export function PvWallet() {
  return (
    <div className="w-full max-w-[220px] rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 p-4 text-white shadow-lg shadow-blue-500/30">
      <Coins size={22} className="opacity-90" />
      <div className="mt-6 space-y-2">
        <div className="h-2.5 w-24 rounded-full bg-white/80" />
        <div className="h-2 w-14 rounded-full bg-white/40" />
      </div>
    </div>
  );
}

export function PvNotify() {
  return (
    <div className="flex w-full max-w-[250px] items-center gap-3 rounded-xl border border-amber-200 border-l-4 border-l-amber-400 bg-amber-50 px-3.5 py-3">
      <Bell size={18} className="shrink-0 text-amber-600" />
      <div className="flex-1 space-y-1.5">
        <Bar w="w-full" c="bg-amber-200" />
        <Bar w="w-2/3" c="bg-amber-200" />
      </div>
    </div>
  );
}

export function PvPhone() {
  const tabs = [Home, ListChecks, ShoppingBag, User];
  return (
    <div className="w-36 overflow-hidden rounded-t-[1.6rem] border-x-4 border-t-4 border-slate-300 bg-gradient-to-b from-orange-300 via-pink-400 to-violet-500 pb-3 pt-12">
      <div className="mx-3 flex items-center justify-between rounded-full bg-white/90 px-3 py-2 shadow">
        {tabs.map((I, i) => (
          <I
            key={i}
            size={15}
            className={i === 0 ? "text-blue-600" : "text-slate-400"}
          />
        ))}
      </div>
    </div>
  );
}

// Khung minh họa bên phải phần đầu trang
export function HeroShowcase({ chip }) {
  const rows = [
    { g: "from-sky-400 to-blue-600", I: ListChecks },
    { g: "from-amber-400 to-orange-500", I: Gamepad2 },
    { g: "from-fuchsia-400 to-pink-500", I: Gift },
  ];
  return (
    <div className="relative mx-auto w-full max-w-md">
      <style>{`@keyframes lpFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>

      <div
        className="rounded-[2rem] border border-slate-200 p-6 sm:p-8"
        style={{ ...DOT_BG, backgroundColor: "#f8fafc" }}
      >
        <div className="mx-auto w-full max-w-[290px] rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500" />
            <div className="flex-1 space-y-1.5">
              <Bar w="w-20" c="bg-slate-300" />
              <Bar w="w-12" />
            </div>
            <CoinPill />
          </div>

          <div className="mt-4 space-y-2.5">
            {rows.map(({ g, I }, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                  i === 0 ? "border-blue-200 bg-blue-50" : "border-slate-100"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white ${g}`}
                >
                  <I size={16} />
                </span>
                <div className="flex-1 space-y-1.5">
                  <Bar w="w-24" c="bg-slate-300" />
                  <Bar w="w-14" />
                </div>
                <CoinPill />
              </div>
            ))}
          </div>

          <div className="mt-4 h-10 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 shadow-md shadow-blue-500/30" />
        </div>
      </div>

      <span
        className="absolute -right-2 -top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-500 shadow-lg ring-1 ring-slate-200"
        style={{ animation: "lpFloat 4s ease-in-out infinite" }}
      >
        <Check size={22} strokeWidth={3} />
      </span>

      <span
        className="absolute -bottom-4 -left-2 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-bold text-slate-800 shadow-lg ring-1 ring-slate-200"
        style={{ animation: "lpFloat 5s ease-in-out infinite 0.6s" }}
      >
        <Gift size={15} className="text-pink-500" />
        {chip}
      </span>
    </div>
  );
}
