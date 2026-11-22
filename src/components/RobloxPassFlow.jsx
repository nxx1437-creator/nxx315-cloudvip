import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  Link2,
  Loader2,
  Search,
  User,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import PaymentSection from "./RobloxPayment.jsx";
import TermsCheckbox from "./TermsCheckbox.jsx";
import {
  Caption,
  IconBox,
  Panel,
  PillButton,
  TermsPanel,
  TextField,
} from "./pay/DimensionKit.jsx";
import { LAST_USERNAME_KEY, formatCoin } from "../lib/robloxData.js";

// passPrice = giá phải đặt cho game pass (đã cộng phí 30% của Roblox)
// Giá thật do máy chủ quyết định (create-roblox-order)
const PASS_PACKAGES = [
  { id: "pass-10", robux: 10, price: 3500, passPrice: 15 },
  { id: "pass-20", robux: 20, price: 7000, passPrice: 29 },
];

const PASS_RE =
  /^(?:https?:\/\/)?(?:www\.)?roblox\.com\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?game-pass\/(\d{4,15})(?:[\/?#].*)?$/i;

function parsePassLink(value) {
  const m = String(value || "").trim().match(PASS_RE);
  if (!m) return null;
  return { id: m[1], url: `https://www.roblox.com/game-pass/${m[1]}` };
}

function lastUsername() {
  try {
    return localStorage.getItem(LAST_USERNAME_KEY) || "";
  } catch {
    return "";
  }
}

const num = (n) => new Intl.NumberFormat("vi-VN").format(n);

export default function RobloxPassFlow({ coins = 0, onEarn }) {
  const [view, setView] = useState("form"); // form | payment
  const [pkgId, setPkgId] = useState("");
  const [username, setUsername] = useState(lastUsername);
  const [robloxUser, setRobloxUser] = useState(null);
  const [link, setLink] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const pkg = PASS_PACKAGES.find((p) => p.id === pkgId) || null;
  const parsed = parsePassLink(link);

  const checkUser = async () => {
    const value = username.trim();
    if (!value) return setError("Vui lòng nhập username Roblox.");
    setChecking(true);
    setError("");
    setRobloxUser(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token)
        throw new Error("Phiên đăng nhập hết hạn, hãy đăng nhập lại.");
      const res = await fetch(
        `/api/roblox-user?username=${encodeURIComponent(value)}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Không kiểm tra được tài khoản.");
      setRobloxUser(data);
      try {
        localStorage.setItem(LAST_USERNAME_KEY, value);
      } catch {}
    } catch (e) {
      setError(e.message || "Không kiểm tra được tài khoản.");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (username.trim() && !robloxUser) checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const missing = [];
  if (!pkg) missing.push("chọn gói");
  if (!robloxUser) missing.push("kiểm tra tài khoản Roblox");
  if (!parsed) missing.push("link game pass hợp lệ");
  if (!agreed) missing.push("đồng ý điều khoản");

  const createOrder = async () => {
    setError("");
    if (missing.length) return setError("Bạn còn thiếu: " + missing.join(" · "));

    // Quay lại từ bước thanh toán mà không đổi gì -> dùng lại đơn cũ
    if (
      order &&
      order.status === "pending" &&
      order.package_id === pkg.id &&
      Number(order.roblox_user_id) === Number(robloxUser.id) &&
      order.contact_value === parsed.url
    ) {
      setView("payment");
      return;
    }

    setCreating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token)
        throw new Error("Phiên đăng nhập hết hạn, hãy đăng nhập lại.");

      const response = await fetch(
        "https://rwglwovohbyqmbbzdvdj.supabase.co/functions/v1/create-roblox-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            roblox_user_id: robloxUser.id,
            roblox_username: robloxUser.username,
            roblox_display_name: robloxUser.displayName,
            package_id: pkg.id,
            receive_method: "gamepass",
            contact_value: parsed.url,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Không thể tạo đơn.");

      setOrder(data.order);
      setView("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e.message || "Không thể tạo đơn.");
    } finally {
      setCreating(false);
    }
  };

  if (view === "payment") {
    return (
      <PaymentSection
        order={order}
        onBack={() => setView("form")}
        onPaid={(updated) => setOrder(updated)}
        onEarn={onEarn}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
          Đổi Robux qua Game Pass
        </h2>
        <p className="mt-0.5 text-[13px] text-gray-500">
          Bạn tạo game pass, shop mua game pass đó và Robux về tài khoản của bạn.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-[20px] border border-red-200 bg-red-50 p-4">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-[14px] text-red-700">{error}</p>
        </div>
      )}

      {/* Chọn gói */}
      <Panel className="space-y-2 p-4">
        <div className="mb-1 flex items-center justify-between rounded-full border border-gray-200 bg-gray-50 px-5 py-3">
          <span className="text-[13px] text-gray-600">Coin của bạn</span>
          <span className="text-[15px] font-semibold text-gray-900">
            {num(coins)} Coin
          </span>
        </div>
        {PASS_PACKAGES.map((p) => {
          const on = pkgId === p.id;
          const enough = coins >= p.price;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPkgId(p.id)}
              className={`flex w-full items-center gap-3.5 rounded-[20px] border bg-white p-4 text-left transition ${
                on
                  ? "border-gray-900 shadow-md ring-1 ring-gray-900"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[17px] font-semibold tracking-[-0.02em] text-gray-900">
                    {p.robux} Robux
                  </p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                    Game Pass
                  </span>
                </div>
                <p className="mt-1 text-[16px] font-semibold text-gray-900">
                  {formatCoin(p.price)}
                </p>
                <p className="mt-1 text-[12px] text-gray-500">
                  Đặt giá game pass: {p.passPrice} Robux
                </p>
                <p
                  className={`mt-0.5 text-[12px] ${
                    enough ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {enough ? "✓ Đủ Coin" : `Thiếu ${num(p.price - coins)} Coin`}
                </p>
              </div>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  on ? "border-gray-900 bg-gray-900" : "border-gray-300 bg-white"
                }`}
              >
                {on && (
                  <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                )}
              </span>
            </button>
          );
        })}
      </Panel>

      {/* Hướng dẫn */}
      <Panel className="p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-gray-900">
          <Info size={16} /> Cách làm
        </div>
        <ol className="list-decimal space-y-1.5 pl-5 text-[13px] leading-5 text-gray-600">
          <li>
            Vào Roblox Creator Hub, chọn game do chính bạn tạo (không dùng game của
            nhóm), mở Monetization rồi Passes và tạo một game pass.
          </li>
          <li>
            Đặt giá game pass đúng{" "}
            <b>{pkg ? `${pkg.passPrice} Robux` : "15 Robux (gói 10) hoặc 29 Robux (gói 20)"}</b>
            , bật bán rồi lưu.
          </li>
          <li>Dán link game pass vào ô bên dưới. Hệ thống sẽ tự kiểm tra giá.</li>
        </ol>
        <p className="mt-3 rounded-[14px] bg-gray-50 p-3 text-[12px] leading-5 text-gray-500">
          Giá game pass đã tính sẵn phí 30% của Roblox nên bạn nhận đủ{" "}
          {pkg ? `${pkg.robux} Robux` : "10 hoặc 20 Robux"}. Robux sẽ về tài khoản sau
          khoảng 3–7 ngày vì Roblox giữ lại để chống gian lận.
        </p>
      </Panel>

      {/* Tài khoản + link */}
      <Panel className="p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <IconBox icon={User} />
          <div>
            <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
              Tài khoản và game pass
            </h2>
            <p className="text-[13px] text-gray-500">
              Game pass phải do chính tài khoản này tạo
            </p>
          </div>
        </div>

        <Caption>Username Roblox</Caption>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <TextField
              icon={User}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (robloxUser) setRobloxUser(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && checkUser()}
              placeholder="Nhập username Roblox"
              autoComplete="off"
              autoCapitalize="none"
            />
          </div>
          <button
            type="button"
            onClick={checkUser}
            disabled={checking || !username.trim()}
            className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-gray-900 px-5 text-[14px] text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {checking ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            <span className="hidden sm:inline">
              {checking ? "Đang kiểm tra" : "Kiểm tra"}
            </span>
          </button>
        </div>

        {robloxUser && (
          <div className="mt-4 flex items-center gap-3 rounded-[16px] border border-gray-200 bg-gray-50 p-3">
            {robloxUser.avatar ? (
              <img
                src={robloxUser.avatar}
                alt=""
                className="h-12 w-12 rounded-[12px] object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-gray-200 text-gray-600">
                <User size={20} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[13px] text-gray-900">
                <CheckCircle2 size={14} /> Đã xác nhận tài khoản
              </p>
              <p className="truncate text-[15px] font-semibold text-gray-900">
                {robloxUser.displayName || robloxUser.username}
              </p>
              <p className="truncate text-[12px] text-gray-500">
                @{robloxUser.username} · ID: {robloxUser.id}
              </p>
            </div>
          </div>
        )}

        <div className="mt-5">
          <Caption>Link game pass</Caption>
          <TextField
            icon={Link2}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://www.roblox.com/game-pass/123456789/..."
            autoComplete="off"
            autoCapitalize="none"
          />
          {link.trim() && !parsed && (
            <p className="mt-2 text-[12px] text-red-600">
              Link chưa đúng. Dạng đúng: roblox.com/game-pass/số/tên
            </p>
          )}
          {parsed && (
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-gray-600">
              <CheckCircle2 size={13} /> Game pass ID: {parsed.id}
            </p>
          )}
        </div>
      </Panel>

      {/* Điều khoản + tạo đơn */}
      <Panel className="p-5 shadow-sm">
        <TermsPanel>
          <TermsCheckbox checked={agreed} onChange={setAgreed} accentColor="gray" />
        </TermsPanel>

        {missing.length > 0 && (
          <p className="mt-3 text-[13px] text-gray-500">
            Còn thiếu: {missing.join(" · ")}
          </p>
        )}

        <div className="mt-4">
          <PillButton onClick={createOrder} disabled={missing.length > 0 || creating}>
            {creating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Đang kiểm tra và tạo đơn...
              </>
            ) : (
              <>
                Tạo đơn {pkg ? `· ${formatCoin(pkg.price)}` : ""}
                <ChevronRight size={17} />
              </>
            )}
          </PillButton>
        </div>
      </Panel>
    </div>
  );
    }
