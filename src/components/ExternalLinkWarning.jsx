export default function ExternalLinkWarning({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white px-6 pb-8 pt-8 text-center shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          className="mx-auto h-16 w-16 text-cyan-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          <path
            d="m8.5 12.5 2.5 2.5 4.5-5"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h2 className="mt-5 text-2xl font-extrabold text-slate-900">
          An toàn của bạn rất quan trọng
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          Bạn sắp rời khỏi trang và mở liên kết bên ngoài. Hãy đảm bảo đó là
          liên kết của một nguồn đáng tin cậy và tránh chia sẻ thông tin cá
          nhân.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="rounded-full bg-slate-100 py-3.5 font-bold text-slate-800 active:scale-95"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 py-3.5 font-bold text-white active:scale-95"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}
