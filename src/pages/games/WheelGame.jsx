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


/* =========================================================
   PHẦN THƯỞNG
========================================================= */

const SEGMENTS = [
  { id: 1, amount: 10, isBigWin: false },
  { id: 2, amount: 20, isBigWin: false },
  { id: 3, amount: 50, isBigWin: false },
  { id: 4, amount: 100, isBigWin: true },
  { id: 5, amount: 200, isBigWin: true },
  { id: 6, amount: 500, isBigWin: true },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;


/* =========================================================
   COIN
========================================================= */

function Coin({
  amount,
  size = "normal",
}) {
  const isSmall = size === "small";
  const isBig = size === "big";

  return (
    <div
      className={`
        relative
        flex
        shrink-0
        items-center
        justify-center
        rounded-full
        border-[3px]
        border-[#D79A00]
        bg-gradient-to-br
        from-[#FFE98A]
        via-[#FFC62E]
        to-[#E59A00]
        shadow-[0_4px_8px_rgba(170,110,0,0.28)]
        ${
          isSmall
            ? "h-[54px] w-[54px]"
            : isBig
              ? "h-[76px] w-[76px]"
              : "h-[62px] w-[62px]"
        }
      `}
    >
      {/* Viền bên trong */}
      <div
        className={`
          pointer-events-none
          absolute
          rounded-full
          border
          border-[#FFF2AE]/90
          ${
            isSmall
              ? "inset-[5px]"
              : isBig
                ? "inset-[6px]"
                : "inset-[5px]"
          }
        `}
      />

      {/* Highlight */}
      <div
        className="
          pointer-events-none
          absolute
          left-[10px]
          top-[8px]
          h-2
          w-5
          rotate-[-25deg]
          rounded-full
          bg-white/35
        "
      />

      <div className="relative z-10 flex flex-col items-center justify-center">
        <Coins
          size={isBig ? 25 : isSmall ? 17 : 20}
          strokeWidth={2.6}
          className="text-[#FFF4B6]"
        />

        <span
          className={`
            mt-[1px]
            font-black
            leading-none
            text-[#8A5700]
            ${
              isBig
                ? "text-[11px]"
                : isSmall
                  ? "text-[8px]"
                  : "text-[9px]"
            }
          `}
        >
          +{amount}
        </span>
      </div>
    </div>
  );
}


/* =========================================================
   CONFETTI
========================================================= */

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
      {pieces.map((_, index) => {
        const angle =
          (360 / pieces.length) * index;

        const distance =
          90 + Math.random() * 70;

        const x =
          Math.cos(
            (angle * Math.PI) / 180
          ) * distance;

        const y =
          Math.sin(
            (angle * Math.PI) / 180
          ) * distance;

        return (
          <span
            key={index}
            className="
              absolute
              left-1/2
              top-1/2
              h-2
              w-2
              rounded-sm
            "
            style={{
              backgroundColor:
                colors[index % colors.length],

              animation:
                "confetti-fly 900ms ease-out forwards",

              "--tx": `${x}px`,
              "--ty": `${y}px`,
            }}
          />
        );
      })}
    </div>
  );
}


/* =========================================================
   VÒNG QUAY
========================================================= */

function PrizeWheel({
  rotation,
  spinning,
}) {
  return (
    <div
      className="
        relative
        aspect-square
        w-[292px]
        max-w-[82vw]
      "
    >

      {/* =================================================
          KIM CHỈ
      ================================================= */}

      <div
        className="
          absolute
          left-1/2
          top-[-4px]
          z-50
          -translate-x-1/2
        "
      >
        {/* Thanh xanh */}
        <div
          className="
            absolute
            left-1/2
            top-[8px]
            h-[20px]
            w-[94px]
            -translate-x-1/2
            rounded-full
            bg-[#3478F6]
            shadow-[0_3px_6px_rgba(52,120,246,0.2)]
          "
        />

        {/* Mũi tên */}
        <div
          className="
            relative
            h-0
            w-0
            border-l-[18px]
            border-r-[18px]
            border-t-[29px]
            border-l-transparent
            border-r-transparent
            border-t-[#3478F6]
            drop-shadow-[0_3px_3px_rgba(0,0,0,0.12)]
          "
        />
      </div>


      {/* =================================================
          WHEEL
      ================================================= */}

      <div
        className="
          absolute
          inset-0
          rounded-full
          border-[10px]
          border-white
          bg-white
          shadow-[0_8px_28px_rgba(66,100,130,0.16)]
          transition-transform
          ease-out
        "
        style={{
          transform:
            `rotate(${rotation}deg)`,

          transitionDuration:
            spinning
              ? "3s"
              : "0ms",
        }}
      >

        {/* =================================================
            NỀN 6 Ô
        ================================================= */}

        <div
          className="
            absolute
            inset-0
            overflow-hidden
            rounded-full
          "
          style={{
            background: `
              conic-gradient(
                from 0deg,
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


        {/* =================================================
            CÁC PHẦN THƯỞNG
        ================================================= */}

        {SEGMENTS.map(
          (segment, index) => {
            const angle =
              index * SEGMENT_ANGLE;

            return (
              <div
                key={segment.id}
                className="
                  absolute
                  inset-0
                "
                style={{
                  transform:
                    `rotate(${angle}deg)`,
                }}
              >

                {/* -----------------------------------------
                    VẠCH XANH
                ----------------------------------------- */}

                <div
                  className="
                    absolute
                    left-1/2
                    top-[11px]
                    h-[35px]
                    w-[11px]
                    -translate-x-1/2
                    rounded-full
                    bg-[#3478F6]
                  "
                />


                {/* -----------------------------------------
                    COIN + SỐ

                    Counter rotate để luôn đứng thẳng
                ----------------------------------------- */}

                <div
                  className="
                    absolute
                    left-1/2
                    top-[55px]
                    flex
                    -translate-x-1/2
                    flex-col
                    items-center
                  "
                  style={{
                    transform:
                      `translateX(-50%) rotate(${-angle - rotation}deg)`,
                  }}
                >
                  <Coin
                    amount={
                      segment.amount
                    }
                    size="small"
                  />

                  <span
                    className="
                      mt-[5px]
                      whitespace-nowrap
                      text-[12px]
                      font-black
                      text-[#6F4A00]
                    "
                  >
                    +{segment.amount}
                  </span>
                </div>
              </div>
            );
          }
        )}


        {/* =================================================
            TÂM VÒNG QUAY
        ================================================= */}

        <div
          className="
            absolute
            left-1/2
            top-1/2
            flex
            h-[92px]
            w-[92px]
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border-[8px]
            border-white
            bg-[#F5B51B]
            shadow-[0_4px_12px_rgba(170,110,0,0.22)]
          "
        >
          <div
            className="
              flex
              h-[66px]
              w-[66px]
              items-center
              justify-center
              rounded-full
              border
              border-white/70
              bg-gradient-to-br
              from-[#FFD95A]
              to-[#F0A900]
            "
          >
            <Coins
              size={31}
              strokeWidth={2.5}
              className="text-white"
            />
          </div>
        </div>

      </div>
    </div>
  );
      }
/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function WheelGame() {
  const navigate = useNavigate();

  const { session } =
    useSession();

  const { profile, setProfile } =
    useProfile();


  /* =======================================================
     STATE
  ======================================================= */

  const [spinning, setSpinning] =
    useState(false);

  const [rotation, setRotation] =
    useState(0);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");


  /* =======================================================
     TICKETS
  ======================================================= */

  const tickets =
    profile?.game_tickets || 0;


  /* =======================================================
     SPIN
  ======================================================= */

  const handleSpin = async () => {
    if (spinning) return;


    /* -----------------------------------------------
       Kiểm tra đăng nhập
    ------------------------------------------------ */

    if (!session?.user?.id) {
      setError(
        "Không tìm thấy phiên đăng nhập."
      );

      return;
    }


    /* -----------------------------------------------
       Kiểm tra lượt quay
    ------------------------------------------------ */

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

      /* =============================================
         GỌI SUPABASE RPC
      ============================================= */

      const {
        data,
        error: rpcError,
      } = await supabase.rpc(
        "play_minigame",
        {
          p_user_id:
            session.user.id,

          p_game_type:
            "wheel",
        }
      );


      /* =============================================
         KIỂM TRA RPC
      ============================================= */

      if (
        rpcError ||
        !data?.success
      ) {
        setSpinning(false);

        setError(
          data?.message ||
            rpcError?.message ||
            "Có lỗi xảy ra."
        );

        return;
      }


      /* =============================================
         LẤY PHẦN THƯỞNG THẬT
      ============================================= */

      const finalAmount =
        Number(data.reward || 0);


      /* =============================================
         TÌM Ô TƯƠNG ỨNG
      ============================================= */

      let selectedIndex =
        SEGMENTS.findIndex(
          (segment) =>
            segment.amount ===
            finalAmount
        );


      /*
       * Nếu reward không nằm trong
       * danh sách SEGMENTS thì dùng ô đầu tiên.
       */

      if (
        selectedIndex === -1
      ) {
        selectedIndex = 0;
      }


      /* =============================================
         TÍNH GÓC QUAY
      ============================================= */

      const currentNormalized =
        (
          rotation % 360 +
          360
        ) % 360;


      /*
       * Tính vị trí ô cần đưa lên kim.
       */

      const targetOffset =
        (
          360 -
          currentNormalized -
          selectedIndex *
            SEGMENT_ANGLE
        ) % 360;


      /*
       * 5 vòng quay hoàn chỉnh
       */

      const extraSpins =
        360 * 5;


      const targetRotation =
        rotation +
        extraSpins +
        targetOffset;


      setRotation(
        targetRotation
      );


      /* =============================================
         CHỜ ANIMATION 3 GIÂY
      ============================================= */

      setTimeout(() => {

        setSpinning(false);


        /* =========================================
           KẾT QUẢ
        ========================================= */

        setResult({
          amount:
            finalAmount,

          isBigWin:
            finalAmount >= 100,
        });


        /* =========================================
           CẬP NHẬT PROFILE
        ========================================= */

        setProfile(
          (prev) => ({
            ...prev,

            coins:
              (prev?.coins || 0) +
              finalAmount,

            game_tickets:
              data.tickets_left,
          })
        );

      }, 3000);

    } catch (err) {

      console.error(
        "Wheel error:",
        err
      );

      setSpinning(false);

      setError(
        "Có lỗi xảy ra, vui lòng thử lại."
      );
    }
  };


  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#EAF2FB]
        text-[#111827]
      "
    >

      {/* =================================================
          CSS
      ================================================= */}

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


        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }


        .scrollbar-none {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

      `}</style>


      {/* =================================================
          HEADER
      ================================================= */}

      <header
        className="
          relative
          z-20
          flex
          items-center
          px-4
          pb-3
          pt-3
        "
      >

        <button
          onClick={() =>
            navigate(-1)
          }
          className="
            flex
            h-[42px]
            w-[42px]
            items-center
            justify-center
            rounded-full
            bg-white/90
            text-[#374151]
            shadow-[0_2px_8px_rgba(0,0,0,0.05)]
            active:scale-95
          "
        >
          <ArrowLeft
            size={21}
          />
        </button>


        <h1
          className="
            ml-3
            text-[17px]
            font-black
            text-[#111827]
          "
        >
          Wheel of Fortune
        </h1>

      </header>


      {/* =================================================
          WHEEL
      ================================================= */}

      <div
        className="
          relative
          flex
          h-[360px]
          w-full
          items-center
          justify-center
          overflow-hidden
          px-4
        "
      >

        <PrizeWheel
          rotation={
            rotation
          }
          spinning={
            spinning
          }
        />

      </div>


      {/* =================================================
          WHITE CARD
      ================================================= */}

      <section
        className="
          relative
          z-10
          -mt-1
          rounded-t-[30px]
          bg-white
          px-4
          pb-10
          pt-5
          shadow-[0_-8px_24px_rgba(0,0,0,0.04)]
        "
      >

        {/* ===============================================
            TITLE + TICKET
        =============================================== */}

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <div>

            <p
              className="
                text-[17px]
                font-black
                text-[#111827]
              "
            >
              Fortune Wheel
            </p>

            <p
              className="
                mt-1
                text-[13px]
                text-[#9CA3AF]
              "
            >
              Get free coins
            </p>

          </div>


          {/* Ticket counter */}

          <div
            className="
              flex
              min-w-[82px]
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#F6F8FC]
              px-4
              py-2.5
              text-[15px]
              font-black
              text-[#111827]
              shadow-inner
            "
          >

            <span>
              {tickets}
            </span>

            <Ticket
              size={17}
              className="text-[#3478F6]"
            />

          </div>

        </div>


        {/* ===============================================
            ERROR
        =============================================== */}

        {error && (
          <p
            className="
              mt-3
              text-center
              text-[13px]
              font-semibold
              text-rose-500
            "
          >
            {error}
          </p>
        )}


        {/* ===============================================
            ADD SPINS
        =============================================== */}

        <button
          onClick={handleSpin}
          disabled={
            spinning ||
            tickets < 1
          }
          className="
            mt-5
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-[18px]
            bg-gradient-to-r
            from-[#FB923C]
            to-[#F2A900]
            py-[15px]
            text-[16px]
            font-black
            text-white
            shadow-[0_9px_22px_rgba(242,169,0,0.26)]
            transition
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >

          <span>
            {spinning
              ? "Đang quay..."
              : "Add spins"}
          </span>

          {!spinning && (
            <ChevronRight
              size={19}
              strokeWidth={3}
            />
          )}

        </button>


        {/* ===============================================
            PROMO
        =============================================== */}

        <div
          className="
            mt-3
            rounded-[17px]
            bg-[#F5F7FB]
            px-4
            py-[13px]
            text-center
            text-[12px]
            text-[#6B7280]
          "
        >
          Activate promo codes and get more spins!
        </div>


        {/* ===============================================
            YOU CAN GET
        =============================================== */}

        <div
          className="
            mt-7
            flex
            items-center
            justify-between
          "
        >

          <p
            className="
              text-[17px]
              font-black
              text-[#111827]
            "
          >
            You can get:
          </p>


          <button
            className="
              flex
              h-[42px]
              w-[42px]
              items-center
              justify-center
              rounded-full
              bg-[#F8FAFC]
              text-[#9CA3AF]
            "
          >
            <RefreshCw
              size={18}
            />
          </button>

        </div>


        {/* ===============================================
            REWARD LIST
        =============================================== */}

        <div
          className="
            scrollbar-none
            mt-4
            flex
            gap-3
            overflow-x-auto
            pb-2
          "
        >

          {SEGMENTS.map(
            (item) => (
              <div
                key={item.id}
                className="
                  flex
                  w-[130px]
                  shrink-0
                  flex-col
                  items-center
                  rounded-[20px]
                  border
                  border-[#E5E7EB]
                  bg-white
                  px-3
                  pb-4
                  pt-3
                  text-center
                  shadow-[0_2px_6px_rgba(0,0,0,0.025)]
                "
              >

                {/* top line */}

                <div
                  className={`
                    mb-3
                    h-[4px]
                    w-[45px]
                    rounded-full
                    ${
                      item.isBigWin
                        ? "bg-[#F2A900]"
                        : "bg-[#3478F6]"
                    }
                  `}
                />


                {/* coin */}

                <div
                  className={`
                    flex
                    h-[86px]
                    w-[86px]
                    items-center
                    justify-center
                    rounded-[19px]
                    ${
                      item.isBigWin
                        ? "bg-[#FFF7DF]"
                        : "bg-[#F2F7FF]"
                    }
                  `}
                >

                  <Coin
                    amount={
                      item.amount
                    }
                  />

                </div>


                {/* amount */}

                <p
                  className="
                    mt-3
                    text-[14px]
                    font-black
                    text-[#111827]
                  "
                >
                  +{item.amount} Coins
                </p>


                {/* BIG WIN */}

                {item.isBigWin && (
                  <span
                    className="
                      mt-1.5
                      rounded-full
                      bg-[#FFF0C5]
                      px-2.5
                      py-1
                      text-[9px]
                      font-black
                      text-[#D88A00]
                    "
                  >
                    BIG WIN
                  </span>
                )}

              </div>
            )
          )}

        </div>

      </section>


      {/* =================================================
          RESULT POPUP
      ================================================= */}

      {result !== null && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/60
            p-4
            backdrop-blur-sm
          "
        >

          <div
            className="
              relative
              w-full
              max-w-[330px]
              overflow-visible
              rounded-[28px]
              bg-white
              p-6
              text-center
              shadow-2xl
            "
          >

            {/* Confetti */}

            {result.isBigWin && (
              <ConfettiBurst />
            )}


            {/* Close */}

            <button
              onClick={() =>
                setResult(null)
              }
              className="
                absolute
                right-4
                top-4
                z-20
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-[#F5F7FB]
                text-[#9CA3AF]
              "
            >
              <X
                size={16}
              />
            </button>


            {/* =========================================
                RESULT COIN
            ========================================= */}

            <div
              className="
                relative
                mx-auto
                flex
                h-[108px]
                w-[108px]
                items-center
                justify-center
                rounded-full
                bg-[#FFF6DA]
              "
            >

              <Coin
                amount={
                  result.amount
                }
                size="big"
              />

            </div>


            {/* =========================================
                TITLE
            ========================================= */}

            <p
              className="
                mt-5
                text-[21px]
                font-black
                text-[#111827]
              "
            >
              {result.isBigWin
                ? "TRÚNG LỚN! 🎉"
                : "Chúc mừng bạn!"}
            </p>


            {/* =========================================
                AMOUNT
            ========================================= */}

            <p
              className="
                mt-2
                text-[32px]
                font-black
                leading-none
                text-[#F2A900]
              "
            >
              +{result.amount}
            </p>


            <p
              className="
                mt-1
                text-[14px]
                font-bold
                text-[#6B7280]
              "
            >
              Coins
            </p>


            <p
              className="
                mt-2
                text-[12px]
                leading-relaxed
                text-[#9CA3AF]
              "
            >
              Số dư đã được cộng
              vào tài khoản của bạn
            </p>


            {/* =========================================
                BUTTON
            ========================================= */}

            <button
              onClick={() =>
                setResult(null)
              }
              className="
                relative
                mt-6
                w-full
                rounded-[15px]
                bg-gradient-to-r
                from-[#3478F6]
                to-[#0878C9]
                py-3
                text-[14px]
                font-black
                text-white
                shadow-md
                active:scale-[0.98]
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
