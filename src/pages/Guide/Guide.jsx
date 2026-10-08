import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import GuideLayout from "./GuideLayout.jsx";
import { GUIDE_MENU } from "./guideData.js";

export default function Guide() {
  return (
    <GuideLayout>
      {/* BREADCRUMB */}
      <div className="mb-6 flex items-center gap-1.5 text-[13px] text-slate-500">
        <Link to="/guide" className="hover:text-slate-800">
          Hướng dẫn
        </Link>
        <ChevronRight size={13} />
        <span className="font-semibold text-slate-800">Tổng quan</span>
      </div>

      {/* HERO */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Hướng dẫn sử dụng NXX315
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-500">
          Chào mừng bạn đến với NXX315 Studio Rewards. Đây là nơi bạn có thể
          kiếm Coin miễn phí và đổi thưởng hấp dẫn. Dưới đây là các mục hướng
          dẫn chi tiết.
        </p>
      </div>

      {/* GRID MỤC */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDE_MENU.map((item) => (
          <Link
            key={item.id}
            to={`/guide/${item.id}`}
            className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-sky-300 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xl">
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-bold text-slate-900 group-hover:text-sky-700">
                {item.label}
              </p>
              <p className="mt-0.5 text-[12px] text-slate-500">
                Xem hướng dẫn →
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* THÔNG TIN THÊM */}
      <div className="mt-10 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-6">
        <h2 className="text-lg font-bold text-slate-900">
          💡 Cần hỗ trợ thêm?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Nếu không tìm thấy câu trả lời, bạn có thể:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>
            •{" "}
            <Link to="/support" className="font-semibold text-sky-700 underline">
              Chat với AI hỗ trợ
            </Link>{" "}
            — trả lời 24/7
          </li>
          <li>
            •{" "}
            <a
              href="https://zalo.me/0865245988"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sky-700 underline"
            >
              Chat Zalo 0865245988
            </a>{" "}
            — gặp nhân viên thật
          </li>
          <li>
            •{" "}
            <Link to="/help" className="font-semibold text-sky-700 underline">
              Trung tâm trợ giúp
            </Link>{" "}
            — câu hỏi thường gặp
          </li>
        </ul>
      </div>
    </GuideLayout>
  );
}
