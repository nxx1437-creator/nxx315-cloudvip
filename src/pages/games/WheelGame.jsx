import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Ticket,
  Coins,
  X,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import useSession from "../../hooks/useSession.js";
import useProfile from "../../hooks/useProfile.js";
import { supabase } from "../../lib/supabaseClient.js";

const SEGMENTS = [
  { id: 1, amount: 10, isBigWin: false },
  { id: 2, amount: 20, isBigWin: false },
  { id: 3, amount: 50, isBigWin: false },
  { id: 4, amount: 100, isBigWin: true },
  { id: 5, amount: 200, isBigWin: true },
  { id: 6, amount: 500, isBigWin: true },
];

/* =========================
   Đồng xu
========================= */
function RewardCoin({ amount, small = false }) {
  return (
    <div
      className={`
        relative flex items-center justify-center rounded-full
        border-[3px] border-[#D99A00]
        bg-gradient-to-br from-[#FFE68A] via-[#F8BE32] to-[#E69B00]
        shadow-[0_4px_8px_rgba(180,120,0,0.25)]
        ${small ? "h-11 w-11" : "h-14 w-14"}
      `}
    >
      {/* Viền bên trong đồng xu */}
      <div
        className={`
          absolute rounded-full border border-[#FFEAA5]/80
          ${small ? "inset-[4px]" : "inset-[5px]"}
        `}
      />

      <div className="relative z-10 flex flex-col items-center justify-center">
        <Coins
          size={small ? 13 : 16}
          strokeWidth={2.8}
          className="text-[#FFF4B8]"
        />

        <span
          className={`
            font-black leading-none text-[#8A5700]
            ${small ? "text-[7px]" : "text-[9px]"}
          `}
        >
          +{amount}
        </span>
      </div>
    </div>
  );
}

/* =========================
   Confetti
========================= */
function ConfettiBurst() {
  const pieces = Array.from({ length: 28 });

  const colors = [
    "#F2A900",
    "#3478F6",
    "#EF4444",
    "#22C55E",
    "#FB923C",
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {pieces.map((_, i) => {
        const angle = (360 / pieces.length) * i;
        const distance = 90 + Math.random() * 70;

        const x =
          Math.cos((angle * Math.PI) / 180) * distance;

        const y =
          Math.sin((angle * Math.PI) / 180) * distance;

        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
            style={{
              backgroundColor: colors[i % colors.length],
              animation: `confetti-fly 900ms ease-out forwards`,
              "--tx": `${x}px`,
              "--ty": `${y}px`,
            }}
          />
        );
      })}
    </div>
  );
}

/* =========================
   Main
========================= */
export default function WheelGame() {
  const navigate = useNavigate();

  const { session } = useSession();
  const { profile, setProfile } = useProfile();

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const tickets = profile?.game_tickets || 0;

  const segmentAngle = 360 / SEGMENTS.length;

  /* =========================
     QUAY
  ========================= */
  const handleSpin = async () => {
    if (spinning) return;

    if (!session?.user?.id) {
      setError("Không tìm thấy phiên đăng nhập.");
      return;
    }

    if (tickets < 1) {
      setError(
        "Bạn đã hết lượt chơi. Làm nhiệm vụ để nhận thêm nhé!"
      );
      return;
    }

    setError("");
    setResult(null);
    setSpinning(true);

    try {
      /*
       * Gọi backend trước để biết phần thưởng thật.
       */
      const { data, error: rpcError } = await supabase.rpc(
        "play_minigame",
        {
          p_user_id: session.user.id,
          p_game_type: "wheel",
        }
      );

      if (rpcError || !data?.success) {
        setSpinning(false);

        setError(
          data?.message ||
            rpcError?.message ||
            "Có lỗi xảy ra."
        );

        return;
      }

      /*
       * Phần thưởng thật từ database
       */
      const finalAmount = Number(data.reward || 0);

      /*
       * Tìm đúng ô tương ứng với reward.
       */
      let selectedIndex = SEGMENTS.findIndex(
        (segment) => segment.amount === finalAmount
      );

      /*
       * Nếu backend trả reward không nằm trong danh sách
       * thì fallback random.
       */
      if (selectedIndex === -1) {
        selectedIndex = Math.floor(
          Math.random() * SEGMENTS.length
        );
      }

      /*
       * Tính góc để ô trúng thưởng nằm ở vị trí kim phía trên.
       *
       * Mỗi segment nằm ở giữa một khoảng.
       */
      const segmentCenter =
        selectedIndex * segmentAngle +
        segmentAngle / 2;

      /*
       * Kim ở phía trên = 270deg theo hệ tọa độ CSS.
       */
      const pointerAngle = 270;

      const correction =
        pointerAngle - segmentCenter;

      /*
       * Thêm 5 vòng quay cho cảm giác giống vòng quay thật.
       */
      const extraRotation = 360 * 5;

      const targetRotation =
        rotation +
        extraRotation +
        correction;

      setRotation(targetRotation);

      /*
       * Đợi animation kết thúc
       */
      setTimeout(() => {
        setSpinning(false);

        setResult({
          amount: finalAmount,
          isBigWin: finalAmount >= 100,
        });

        /*
         * Cập nhật profile local
         */
        setProfile((prev) => ({
          ...prev,
          coins: (prev?.coins || 0) + finalAmount,
          game_tickets: data.tickets_left,
        }));
      }, 3000);
    } catch (err) {
      console.error(err);

      setSpinning(false);
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#EAF2FB] pb-10 text-[#111827]">
      <style>{`
        @keyframes confetti-fly {
          0% {
            transform:
              translate(-50%, -50%)
              scale(1)
              rotate(0deg);
            opacity: 1;
          }

          100% {
            transform:
              translate(
                calc(-50% + var(--tx)),
                calc(-50% + var(--ty))
              )
              scale(0)
              rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes coin-pop {
          0% {
            transform: scale(.75);
            opacity: .5;
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .coin-pop {
          animation: coin-pop .25s ease-out;
        }
      `}</style>

      {/* =========================
          HEADER
      ========================= */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[#374151] shadow-sm active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-[15px] font-bold text-[#111827]">
            Wheel of Fortune
          </h1>
        </div>
      </header>

      {/* =========================
          WHEEL AREA
      ========================= */}
      <div className="relative flex h-[330px] w-full items-center justify-center overflow-hidden px-4">
        {/* Kim chỉ hướng */}
        <div className="absolute top-2 z-40">
          <div
            className="
              h-0 w-0
              border-l-[10px] border-l-transparent
              border-r-[10px] border-r-transparent
              border-t-[18px] border-t-[#3478F6]
              drop-shadow-md
            "
          />
        </div>

        {/* Vòng quay */}
        <div
          className="
            relative aspect-square
            w-[300px] max-w-[82vw]
            rounded-full
            border-[10px] border-white
            bg-white
            shadow-[0_12px_35px_rgba(63,93,120,0.18)]
            transition-transform
            ease-out
          "
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning
              ? "3s"
              : "0s",
          }}
        >
          {/* Các múi màu */}
          <div
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{
              background: `
                conic-gradient(
                  #EEF5FF 0deg 60deg,
                  #FFFFFF 60deg 120deg,
                  #EEF5FF 120deg 180deg,
                  #FFFFFF 180deg 240deg,
                  #EEF5FF 240deg 300deg,
                  #FFFFFF 300deg 360deg
                )
              `,
            }}
          />

          {/* Segment */}
          {SEGMENTS.map((segment, index) => {
            const angle =
              index * segmentAngle;

            return (
              <div
                key={segment.id}
                className="absolute inset-0"
                style={{
                  transform: `rotate(${angle}deg)`,
                }}
              >
                {/* Đường xanh trên mỗi ô */}
                <div
                  className="
                    absolute left-1/2 top-3
                    h-2.5 w-12
                    -translate-x-1/2
                    rounded-full
                    bg-[#3478F6]
                  "
                />

                {/* Đồng xu + số */}
                <div
                  className="
                    absolute left-1/2 top-[43px]
                    flex -translate-x-1/2
                    flex-col items-center
                  "
                  style={{
                    transform: `translateX(-50%)`,
                  }}
                >
                  <RewardCoin
                    amount={segment.amount}
                    small
                  />

                  <span
                    className="
                      mt-1
                      rounded-full
                      bg-white/90
                      px-2
                      py-0.5
                      text-[9px]
                      font-black
                      text-[#8A5700]
                      shadow-sm
                    "
                  >
                    +{segment.amount}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Tâm vòng quay */}
          <div
            className="
              absolute left-1/2 top-1/2
              flex h-16 w-16
              -translate-x-1/2
              -translate-y-1/2
              items-center justify-center
              rounded-full
              border-[5px] border-white
              bg-gradient-to-br
              from-[#FFE27A]
              to-[#F2A900]
              shadow-[0_4px_15px_rgba(180,120,0,.3)]
            "
          >
            <Coins
              size={28}
              className="text-white"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>

      {/* =========================
          WHITE CONTENT CARD
      ========================= */}
      <div
        className="
          relative z-10
          -mt-1
          rounded-t-[30px]
          bg-white
          px-4 pb-8 pt-5
          shadow-[0_-8px_24px_rgba(0,0,0,0.04)]
        "
      >
        {/* Title + tickets */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-black text-[#111827]">
              Fortune Wheel
            </p>

            <p className="text-xs text-[#9CA3AF]">
              Get free coins
            </p>
          </div>

          <span
            className="
              flex items-center gap-1.5
              rounded-full
              bg-[#F5F7FB]
              px-3 py-1.5
              text-sm font-bold
              text-[#111827]
              shadow-inner
            "
          >
            {tickets}

            <Ticket
              size={14}
              className="text-[#3478F6]"
            />
          </span>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-center text-sm font-semibold text-rose-500">
            {error}
          </p>
        )}

        {/* =========================
            SPIN BUTTON
        ========================= */}
        <button
          onClick={handleSpin}
          disabled={spinning || tickets < 1}
          className="
            mt-4
            flex w-full
            items-center justify-center gap-2
            rounded-2xl
            bg-gradient-to-r
            from-[#FB923C]
            to-[#F2A900]
            py-3.5
            text-base font-black
            text-white
            shadow-[0_10px_24px_rgba(242,169,0,0.3)]
            transition
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          {spinning ? "Đang quay..." : "Add spins"}

          {!spinning && (
            <ChevronRight size={18} />
          )}
        </button>

        {/* Promo */}
        <div
          className="
            mt-3
            rounded-xl
            bg-[#F5F7FB]
            px-4 py-2.5
            text-center
            text-xs
            text-[#6B7280]
          "
        >
          Activate promo codes and get more spins!
        </div>

        {/* =========================
            REWARDS
        ========================= */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-bold text-[#111827]">
            You can get:
          </p>

          <button
            onClick={() => {}}
            className="
              flex h-8 w-8
              items-center justify-center
              rounded-xl
              bg-[#F8FAFC]
              text-[#9CA3AF]
              transition
              hover:text-[#111827]
            "
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Reward cards */}
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {SEGMENTS.map((item) => (
            <div
              key={item.id}
              className="
                flex w-[108px]
                shrink-0
                flex-col
                items-center
                rounded-2xl
                border
                border-[#E5E7EB]
                bg-white
                p-3
                text-center
                shadow-sm
              "
            >
              {/* Coin */}
              <div
                className={`
                  flex h-16 w-16
                  items-center justify-center
                  rounded-2xl
                  ${
                    item.isBigWin
                      ? "bg-[#FFF4D6]"
                      : "bg-[#F3F8FF]"
                  }
                `}
              >
                <RewardCoin
                  amount={item.amount}
                />
              </div>

              {/* Reward */}
              <span
                className="
                  mt-2
                  text-xs
                  font-black
                  text-[#111827]
                "
              >
                +{item.amount} Coins
              </span>

              {item.isBigWin && (
                <span
                  className="
                    mt-1
                    rounded-full
                    bg-[#FFF4D6]
                    px-2
                    py-0.5
                    text-[9px]
                    font-bold
                    text-[#D88A00]
                  "
                >
                  BIG WIN
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* =========================
          RESULT POPUP
      ========================= */}
      {result !== null && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/60
            p-4
            backdrop-blur-sm
          "
        >
          <div
            className="
              relative
              w-full max-w-xs
              overflow-visible
              rounded-3xl
              bg-white
              p-6
              text-center
              shadow-2xl
              animate-in
              fade-in
              zoom-in
              duration-200
            "
          >
            {result.isBigWin && (
              <ConfettiBurst />
            )}

            {/* Close */}
            <button
              onClick={() => setResult(null)}
              className="
                absolute right-4 top-4
                flex h-7 w-7
                items-center justify-center
                text-[#9CA3AF]
                hover:text-black
              "
            >
              <X size={16} />
            </button>

            {/* Big coin */}
            <div
              className={`
                relative mx-auto
                flex h-24 w-24
                items-center justify-center
                rounded-full
                ${
                  result.isBigWin
                    ? "border-4 border-amber-400 bg-amber-50"
                    : "border-4 border-blue-100 bg-blue-50"
                }
              `}
            >
              <RewardCoin
                amount={result.amount}
              />
            </div>

            {/* Text */}
            <p className="mt-4 text-xl font-black text-[#111827]">
              {result.isBigWin
                ? "TRÚNG LỚN! 🎉"
                : "Chúc mừng bạn!"}
            </p>

            <p className="mt-2 text-3xl font-black text-[#F2A900]">
              +{result.amount}
            </p>

            <p className="text-sm font-bold text-[#6B7280]">
              Coins
            </p>

            <p className="mt-1 text-xs text-[#9CA3AF]">
              Số dư đã được cộng vào tài khoản của bạn
            </p>

            {/* Button */}
            <button
              onClick={() => setResult(null)}
              className="
                relative mt-6
                w-full
                rounded-xl
                bg-gradient-to-r
                from-[#3478F6]
                to-[#0878C9]
                py-3
                text-sm
                font-bold
                text-white
                shadow-md
                active:scale-95
              "
            >
              Tuyệt vời
            </button>
          </div>
        </div>
      )}
    </div>
  );
    }
