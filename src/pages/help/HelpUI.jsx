export function Hero({ query, onQuery, name, onBack }) {
  useHelpTheme();
  return (
    // Thêm class bg-gradient-to-b để tạo hiệu ứng giống Loom
    <header className="relative overflow-hidden pb-16 pt-6 bg-gradient-to-b from-[#e0f2fe] to-[#f8f9fc]">
      <div className="relative mx-auto max-w-md px-4 md:max-w-4xl">
        {/* ... Giữ nguyên phần Nav ... */}

        <div className="mt-8 text-center">
          {/* Bỏ badge, thay bằng tiêu đề to đậm giống Loom */}
          <h1 className="text-[#1e1e2f] mx-auto mt-2 max-w-[520px] text-[32px] font-bold leading-[1.2] tracking-tight sm:text-[40px]">
            {name ? `Chào ${name}, ` : ""}Chúng tôi có thể giúp gì?
          </h1>

          {/* Thanh tìm kiếm to, bo tròn, có đổ bóng */}
          <div className="mx-auto mt-6 max-w-[520px]">
            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-lg shadow-blue-500/10 border border-white/50">
              <Icon name="search" size={20} className="text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết, câu hỏi..."
                className="flex-1 bg-transparent text-[16px] text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button className="rounded-full bg-[#625df5] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#4f4ad6]">
                Tìm
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Chủ đề phổ biến: <span className="underline cursor-pointer">Đơn hàng</span>, <span className="underline cursor-pointer">Nạp tiền</span>, <span className="underline cursor-pointer">Tài khoản</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
