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
  const sizes = {
    small: {
      wrapper: "h-[58px] w-[58px]",
      icon: 18,
      text: "text-[8px]",
    },

    normal: {
      wrapper: "h-[68px] w-[68px]",
      icon: 22,
      text: "text-[9px]",
    },

    big: {
      wrapper: "h-[78px] w-[78px]",
      icon: 27,
      text: "text-[11px]",
    },
  };

  const config =
    sizes[size] || sizes.normal;

  return (
    <div
      className={`
        relative
        flex
        ${config.wrapper}
        items-center
        justify-center
        rounded-full
        border-[3px]
        border-[#D79A00]
        bg-gradient-to-br
        from-[#FFE98A]
        via-[#FFC72C]
        to-[#E59A00]
        shadow-[0_4px_9px_rgba(176,112,0,0.30)]
      `}
    >

      {/* Viền trong */}
      <div
        className="
          pointer-events-none
          absolute
          inset-[5px]
          rounded-full
          border
          border-[#FFF1A6]
        "
      />

      {/* Viền trong thứ 2 */}
      <div
        className="
          pointer-events-none
          absolute
          inset-[8px]
          rounded-full
          border
          border-[#E5A800]/60
        "
      />

      {/* Highlight */}
      <div
        className="
          pointer-events-none
          absolute
          left-[10px]
          top-[8px]
          h-[7px]
          w-[19px]
          rotate-[-28deg]
          rounded-full
          bg-white/45
        "
      />

      <div
        className="
          relative
          z-10
          flex
          flex-col
          items-center
          justify-center
        "
      >
        <Coins
          size={config.icon}
          strokeWidth={2.6}
          className="text-[#FFF7C7]"
        />

        <span
          className={`
            mt-[1px]
            font-black
            leading-none
            text-[#805100]
            ${config.text}
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
  const pieces = Array.from({
    length: 28,
  });

  const colors = [
    "#F2A900",
    "#3478F6",
    "#EF4444",
    "#22C55E",
    "#FB923C",
  ];

  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        overflow-visible
      "
    >
      {pieces.map((_, index) => {
        const angle =
          (360 / pieces.length) *
          index;

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
                colors[
                  index %
                    colors.length
                ],

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
   PRIZE WHEEL
========================================================= */

function PrizeWheel({
  rotation,
  spinning,
}) {
  return (
    <div
      className="
        relative
        h-[320px]
        w-[320px]
        max-w-[86vw]
        max-h-[86vw]
      "
    >

      {/* ===================================================
          POINTER
      =================================================== */}

      <div
        className="
          absolute
          left-1/2
          top-[-5px]
          z-[60]
          -translate-x-1/2
        "
      >

        {/* Thanh ngang */}
        <div
          className="
            absolute
            left-1/2
            top-[17px]
            h-[38px]
            w-[180px]
            -translate-x-1/2
            rounded-full
            bg-[#3478F6]
            shadow-[0_4px_9px_rgba(52,120,246,0.25)]
          "
        />

        {/* Thanh dọc */}
        <div
          className="
            absolute
            left-1/2
            top-[40px]
            h-[70px]
            w-[22px]
            -translate-x-1/2
            rounded-b-full
            bg-[#3478F6]
          "
        />

        {/* Mũi tên */}
        <div
          className="
            relative
            z-10
            h-0
            w-0
            border-l-[27px]
            border-r-[27px]
            border-t-[43px]
            border-l-transparent
            border-r-transparent
            border-t-[#3478F6]
            drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)]
          "
        />

      </div>


      {/* ===================================================
          WHEEL OUTER
      =================================================== */}

      <div
        className="
          absolute
          inset-0
          rounded-full
          border-[11px]
          border-white
          bg-white
          shadow-[0_9px_30px_rgba(69,102,130,0.18)]
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
            NỀN 6 MẢNH
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
                from -30deg,
                #FFFFFF 0deg 60deg,
                #EEF5FF 60deg 120deg,
                #FFFFFF 120deg 180deg,
                #EEF5FF 180deg 240deg,
                #FFFFFF 240deg 300deg,
                #EEF5FF 300deg 360deg
              )
            `,
          }}
        />


        {/* =================================================
            6 VẠCH XANH + 6 COIN
        ================================================= */}

        {SEGMENTS.map(
          (segment, index) => {

            /*
             * Góc bắt đầu từ phía trên.
             *
             * -90 = 12 giờ
             * Mỗi ô cách nhau 60 độ.
             */

            const angle =
              -90 +
              index *
                SEGMENT_ANGLE;

            return (
              <div
                key={segment.id}
                className="
                  absolute
                  left-1/2
                  top-1/2
                  h-0
                  w-0
                "
                style={{
                  transform:
                    `rotate(${angle}deg)`,
                }}
              >

                {/* =======================================
                    VẠCH XANH Ở VÀNH NGOÀI
                ======================================= */}

                <div
                  className="
                    absolute
                    left-1/2
                    top-[-132px]
                    h-[43px]
                    w-[12px]
                    -translate-x-1/2
                    rounded-full
                    bg-[#3478F6]
                  "
                />


                {/* =======================================
                    COIN

                    QUAN TRỌNG:
                    Coin được đẩy ra khỏi tâm
                    bằng translateY.
                ======================================= */}

                <div
                  className="
                    absolute
                    left-1/2
                    top-0
                    flex
                    -translate-x-1/2
                    flex-col
                    items-center
                  "
                  style={{
                    transform:
                      `
                        translateX(-50%)
                        translateY(-103px)
                      `,
                  }}
                >

                  {/* Coin */}

                  <div
                    style={{
                      transform:
                        `rotate(${-angle - rotation}deg)`,
                    }}
                  >
                    <Coin
                      amount={
                        segment.amount
                      }
                      size="small"
                    />
                  </div>


                  {/* Số thưởng */}

                  <div
                    className="
                      mt-[5px]
                      whitespace-nowrap
                      text-[12px]
                      font-black
                      text-[#654500]
                    "
                    style={{
                      transform:
                        `rotate(${-angle - rotation}deg)`,
                    }}
                  >
                    +{segment.amount}
                  </div>

                </div>

              </div>
            );
          }
        )}


        {/* =================================================
            TÂM WHEEL
        ================================================= */}

        <div
          className="
            absolute
            left-1/2
            top-1/2
            z-40
            flex
            h-[108px]
            w-[108px]
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border-[9px]
            border-white
            bg-[#F4B51B]
            shadow-[0_5px_15px_rgba(163,108,0,0.23)]
          "
        >

          <div
            className="
              flex
              h-[82px]
              w-[82px]
              items-center
              justify-center
              rounded-full
              border
              border-white/80
              bg-gradient-to-br
              from-[#FFD95A]
              to-[#F0A900]
            "
          >

            <Coins
              size={36}
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
   MAIN WHEEL GAME
========================================================= */

export default function WheelGame() {
  const navigate = useNavigate();

  const { session } =
    useSession();

  const {
    profile,
    setProfile,
  } = useProfile();


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
     HANDLE SPIN
  ======================================================= */

  const handleSpin = async () => {

    if (spinning) return;


    /* Kiểm tra session */

    if (!session?.user?.id) {
      setError(
        "Không tìm thấy phiên đăng nhập."
      );

      return;
    }


    /* Kiểm tra lượt */

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

      /* ===============================================
         GỌI RPC
      =============================================== */

      const {
        data,
        error: rpcError,
      } =
        await supabase.rpc(
          "play_minigame",
          {
            p_user_id:
              session.user.id,

            p_game_type:
              "wheel",
          }
        );


      /* ===============================================
         RPC ERROR
      =============================================== */

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


      /* ===============================================
         REWARD TỪ DATABASE
      =============================================== */

      const finalAmount =
        Number(data.reward || 0);


      /* ===============================================
         TÌM SEGMENT
      =============================================== */

      let selectedIndex =
        SEGMENTS.findIndex(
          (segment) =>
            segment.amount ===
            finalAmount
        );


      if (
        selectedIndex === -1
      ) {
        selectedIndex = 0;
      }


      /* ===============================================
         TÍNH GÓC QUAY
      =============================================== */

      const current =
        (
          rotation % 360 +
          360
        ) % 360;


      const desiredAngle =
        -90 +
        selectedIndex *
          SEGMENT_ANGLE;


      /*
       * Đưa segment trúng thưởng
       * về vị trí kim 12 giờ.
       */

      let delta =
        desiredAngle -
        current;


      /*
       * Đảm bảo quay theo chiều thuận
       */

      if (delta < 0) {
        delta += 360;
      }


      /*
       * Thêm 5 vòng hoàn chỉnh.
       */

      const targetRotation =
        rotation +
        360 * 5 -
        delta;


      setRotation(
        targetRotation
      );


      /* ===============================================
         ĐỢI ANIMATION
      =============================================== */

      setTimeout(() => {

        setSpinning(false);


        /* =============================================
           HIỆN KẾT QUẢ
        ============================================= */

        setResult({
          amount:
            finalAmount,

          isBigWin:
            finalAmount >= 100,
        });


        /* =============================================
           UPDATE PROFILE
        ============================================= */

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
     UI
  ======================================================= */

  return (
    <div
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#EAF3FC]
        text-[#111827]
      "
    >

      {/* =================================================
          ANIMATION CSS
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
          flex
          items-center
          px-4
          pb-3
          pt-4
        "
      >

        <button
          onClick={() =>
            navigate(-1)
          }
          className="
            flex
            h-[46px]
            w-[46px]
            items-center
            justify-center
            rounded-full
            bg-white
            text-[#374151]
            shadow-[0_3px_12px_rgba(0,0,0,0.05)]
            active:scale-95
          "
        >
          <ArrowLeft
            size={23}
            strokeWidth={2.4}
          />
        </button>


        <h1
          className="
            ml-3
            text-[18px]
            font-black
            text-[#111827]
          "
        >
          Wheel of Fortune
        </h1>

      </header>


      {/* =================================================
          WHEEL AREA
      ================================================= */}

      <div
        className="
          relative
          flex
          h-[420px]
          w-full
          items-center
          justify-center
          overflow-hidden
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
          WHITE BOTTOM CARD
      ================================================= */}

      <section
        className="
          relative
          z-10
          -mt-1
          min-h-[420px]
          rounded-t-[32px]
          bg-white
          px-4
          pb-10
          pt-6
          shadow-[0_-7px_25px_rgba(0,0,0,0.035)]
        "
      >

        {/* =================================================
            TITLE
        ================================================= */}

        <div
          className="
            flex
            items-start
            justify-between
          "
        >

          <div>

            <p
              className="
                text-[18px]
                font-black
                leading-tight
                text-[#111827]
              "
            >
              Fortune Wheel
            </p>

            <p
              className="
                mt-1
                text-[14px]
                text-[#9CA3AF]
              "
            >
              Get free coins
            </p>

          </div>


          {/* =============================================
              TICKET
          ============================================= */}

          <div
            className="
              flex
              h-[52px]
              min-w-[92px]
              items-center
              justify-center
              gap-3
              rounded-full
              bg-[#F7F9FC]
              px-4
              text-[16px]
              font-black
              shadow-[inset_0_1px_5px_rgba(0,0,0,0.025)]
            "
          >

            <span>
              {tickets}
            </span>

            <Ticket
              size={21}
              strokeWidth={2}
              className="text-[#3478F6]"
            />

          </div>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

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


        {/* =================================================
            ADD SPINS
        ================================================= */}

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
            rounded-[20px]
            bg-gradient-to-r
            from-[#FFD4A7]
            to-[#FFE39A]
            py-[17px]
            text-[17px]
            font-black
            text-white
            shadow-[0_8px_22px_rgba(247,183,72,0.15)]
            transition
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >

          <span>
            {spinning
              ? "Đang quay..."
              : "Add spins"}
          </span>

          {!spinning && (
            <ChevronRight
              size={21}
              strokeWidth={3}
            />
          )}

        </button>


        {/* =================================================
            PROMO
        ================================================= */}

        <div
          className="
            mt-4
            flex
            min-h-[58px]
            items-center
            justify-center
            rounded-[18px]
            bg-[#F6F8FC]
            px-4
            text-center
            text-[13px]
            text-[#6B7280]
          "
        >
          Activate promo codes and get more spins!
        </div>


        {/* =================================================
            YOU CAN GET
        ================================================= */}

        <div
          className="
            mt-8
            flex
            items-center
            justify-between
          "
        >

          <p
            className="
              text-[18px]
              font-black
              text-[#111827]
            "
          >
            You can get:
          </p>


          <button
            className="
              flex
              h-[45px]
              w-[45px]
              items-center
              justify-center
              rounded-full
              bg-[#F8FAFC]
              text-[#9CA3AF]
            "
          >
            <RefreshCw
              size={20}
            />
          </button>

        </div>


        {/* =================================================
            REWARD CARDS
        ================================================= */}

        <div
          className="
            scrollbar-none
            mt-4
            flex
            gap-3
            overflow-x-auto
            pb-3
          "
        >

          {SEGMENTS.map(
            (item) => (
              <div
                key={item.id}
                className="
                  flex
                  w-[138px]
                  shrink-0
                  flex-col
                  items-center
                  rounded-[21px]
                  border
                  border-[#E3E6EB]
                  bg-white
                  px-3
                  pb-4
                  pt-3
                  text-center
                "
              >

                {/* Top indicator */}

                <div
                  className={`
                    mb-3
                    h-[4px]
                    w-[48px]
                    rounded-full
                    ${
                      item.isBigWin
                        ? "bg-[#F2A900]"
                        : "bg-[#3478F6]"
                    }
                  `}
                />


                {/* Coin background */}

                <div
                  className="
                    flex
                    h-[91px]
                    w-[91px]
                    items-center
                    justify-center
                    rounded-[20px]
                    bg-[#F3F7FC]
                  "
                >

                  <Coin
                    amount={
                      item.amount
                    }
                    size="normal"
                  />

                </div>


                {/* Text */}

                <p
                  className="
                    mt-3
                    text-[13px]
                    font-black
                    text-[#111827]
                  "
                >
                  +{item.amount} Coins
                </p>


                {item.isBigWin && (
                  <span
                    className="
                      mt-1.5
                      rounded-full
                      bg-[#FFF3CE]
                      px-2.5
                      py-1
                      text-[9px]
                      font-black
                      text-[#D78B00]
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
          RESULT MODAL
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
              rounded-[30px]
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


            {/* Result coin */}

            <div
              className="
                relative
                mx-auto
                flex
                h-[112px]
                w-[112px]
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


            {/* Title */}

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


            {/* Amount */}

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
                text-[#9CA3AF]
              "
            >
              Số dư đã được cộng
              vào tài khoản của bạn
            </p>


            {/* Button */}

            <button
              onClick={() =>
                setResult(null)
              }
              className="
                relative
                mt-6
                w-full
                rounded-[16px]
                bg-gradient-to-r
                from-[#3478F6]
                to-[#0878C9]
                py-[13px]
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
