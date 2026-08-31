function OrderPanel({
  selectedPackage,
  category,
  version,
  deliveryMethod,
  setDeliveryMethod,
  deliveryTarget,
  setDeliveryTarget,
  canRedeem,
  redeeming,
  onRedeem,
  onBack,
}) {
  const isForcedVng = category === "robux" && version === "vng";

  const targetLabel =
    category === "robux"
      ? "Tên đăng nhập Roblox"
      : "ID tài khoản Liên Quân";

  const targetPlaceholder =
    category === "robux"
      ? "Nhập username Roblox..."
      : "Nhập ID game...";

  if (!selectedPackage) {
    return (
      <div
        id="store-order-panel"
        className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-14 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50">
          <Gift size={23} className="text-sky-400" />
        </div>

        <p className="mt-4 text-sm font-black text-slate-700">
          Chưa chọn gói thưởng
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Chọn 1 gói ở bên trái để bắt đầu đổi thưởng.
        </p>
      </div>
    );
  }

  return (
    <div
      id="store-order-panel"
      className="h-fit rounded-[24px] border border-sky-100 bg-white p-5 shadow-[0_12px_40px_rgba(14,165,233,0.08)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 transition hover:text-sky-600"
        >
          <ArrowLeft size={14} />
          Đổi gói khác
        </button>

        <ShieldCheck size={16} className="text-emerald-500" />
      </div>

      <div className="rounded-2xl bg-sky-50/70 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-sky-500">
          Gói đã chọn
        </p>

        <p className="mt-1 text-base font-black text-slate-900">
          {selectedPackage.name}
        </p>

        <div className="mt-2 flex items-center gap-1.5 text-sm font-black text-sky-600">
          <Coins size={15} />
          {formatCoins(selectedPackage.coin_cost)} Coin
        </div>
      </div>

      {!isForcedVng && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold text-slate-600">
            Phương thức nhận
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeliveryMethod("direct")}
              className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                deliveryMethod === "direct"
                  ? "border-sky-300 bg-sky-500 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:border-sky-200"
              }`}
            >
              Nhận trực tiếp
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMethod("code")}
              className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                deliveryMethod === "code"
                  ? "border-sky-300 bg-sky-500 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:border-sky-200"
              }`}
            >
              Nhận mã
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="mb-2 block text-xs font-bold text-slate-600">
          {targetLabel}
        </label>

        <input
          type="text"
          value={deliveryTarget}
          onChange={(event) => setDeliveryTarget(event.target.value)}
          placeholder={targetPlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-200"
        />
      </div>

      <button
        type="button"
        disabled={!canRedeem}
        onClick={onRedeem}
        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black shadow-lg transition ${
          canRedeem
            ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-sky-500/25 hover:-translate-y-0.5"
            : "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none"
        }`}
      >
        {redeeming ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Đang xử lý...
          </>
        ) : (
          "Xác nhận đổi thưởng"
        )}
      </button>
    </div>
  );
}

function History({ history, copied, onCopy }) {
  if (!history?.length) {
    return (
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-black">
          Lịch sử đổi thưởng
        </h2>

        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50">
            <Clock3 size={23} className="text-sky-400" />
          </div>

          <p className="mt-4 text-sm font-black text-slate-700">
            Chưa có đơn nào
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Đơn đổi thưởng của bạn sẽ hiện ở đây.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-black">
        Lịch sử đổi thưởng
      </h2>

      <div className="space-y-3">
        {history.map((order) => {
          const status =
            statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = status.icon;

          return (
            <div
              key={order.id}
              className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">
                    {order.package_name || "Gói đổi thưởng"}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {formatDate(order.created_at)}
                  </p>
                </div>

                <span
                  className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                >
                  <StatusIcon size={12} />
                  {status.label}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600">
                  <Coins size={13} />
                  {formatCoins(order.coin_cost)} Coin
                </div>

                {order.order_code && (
                  <button
                    type="button"
                    onClick={() => onCopy(order.order_code)}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 transition hover:bg-slate-100"
                  >
                    {copied === order.order_code ? (
                      <>
                        <Check size={11} className="text-emerald-500" />
                        Đã chép
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        {order.order_code}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Store() {
  return null;
}

export { OrderPanel, History };
