import React from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, Ban, User, Users, Bot, Bug, RefreshCw, Mail } from "lucide-react";

export default function Fraud() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">
            <Shield size={16} /> Chính sách chống gian lận
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold text-slate-900">Chính sách chống gian lận</h1>
          <p className="mt-2 text-sm text-slate-500">Cập nhật lần cuối: 25/08/2026</p>
          <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-semibold">⚖️ Nguyên tắc công bằng</p>
            <p>NXX315 Studio Rewards được xây dựng dựa trên nguyên tắc công bằng giữa người dùng. Các hành vi cố tình gian lận, khai thác lỗi hoặc tạo nhiều tài khoản để nhận lợi ích không hợp lệ đều bị nghiêm cấm.</p>
          </div>
        </div>

        <div className="space-y-6">
          <Section icon={User} title="1. Một người dùng, một tài khoản">
            <p>Mỗi người dùng <strong>chỉ được phép sử dụng một tài khoản</strong> trên NXX315 Studio Rewards.</p>
            <p className="mt-2 text-sm text-slate-500">Việc thay đổi thiết bị hoặc mạng Internet không làm thay đổi quy định này.</p>
            <div className="mt-3 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold"> Nghiêm cấm tạo hoặc sử dụng nhiều tài khoản nhằm:</p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>Nhận phần thưởng nhiều lần</li>
                <li>Vượt giới hạn nhiệm vụ</li>
                <li>Nhận ưu đãi dành cho người dùng mới nhiều lần</li>
                <li>Chuyển hoặc gom xu/điểm bất hợp lệ</li>
                <li>Né tránh các biện pháp xử lý tài khoản</li>
              </ul>
            </div>
          </Section>

          <Section icon={AlertTriangle} title="2. Các hành vi bị coi là gian lận">
            <p>Bao gồm nhưng không giới hạn:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Tạo nhiều tài khoản</li>
              <li>Sử dụng tài khoản của người khác</li>
              <li>Làm giả kết quả hoặc bằng chứng nhiệm vụ</li>
              <li>Khai báo nhiệm vụ chưa hoàn thành</li>
              <li>Sử dụng bot hoặc công cụ tự động trái phép</li>
              <li>Can thiệp vào dữ liệu hoặc yêu cầu gửi đến hệ thống</li>
              <li>Khai thác lỗi để tạo xu/điểm</li>
              <li>Cố tình gửi yêu cầu bất thường đến hệ thống</li>
              <li>Tìm cách vượt giới hạn nhiệm vụ hoặc giới hạn phần thưởng</li>
              <li>Sử dụng các phương thức nhằm che giấu hành vi vi phạm</li>
            </ul>
          </Section>

          <Section icon={Bot} title="3. Phát hiện gian lận">
            <p>NXX315 Studio Rewards có thể sử dụng các thông tin và tín hiệu hợp lệ mà hệ thống có sẵn để phát hiện hoạt động bất thường.</p>
            <p className="mt-2">Một tài khoản có thể được xem xét khi xuất hiện các dấu hiệu như:</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Hoạt động nhiệm vụ bất thường</li>
              <li>Lịch sử nhận thưởng không hợp lý</li>
              <li>Nhiều tài khoản có hành vi liên quan đáng ngờ</li>
              <li>Thao tác có dấu hiệu tự động hóa</li>
              <li>Khai thác lỗi hoặc hành vi bất thường khác</li>
            </ul>
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
               Việc sử dụng Wi-Fi, 4G hoặc 5G khác nhau <strong>không được xem là lý do hợp lệ</strong> để tạo thêm tài khoản.
            </div>
          </Section>

          <Section icon={Ban} title="4. Biện pháp xử lý">
            <p>Tùy mức độ vi phạm, NXX315 Studio Rewards có thể:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Từ chối nhiệm vụ</li>
              <li>Hủy xu/điểm không hợp lệ</li>
              <li>Hủy phần thưởng chưa xử lý</li>
              <li>Tạm khóa tài khoản</li>
              <li>Khóa tài khoản vĩnh viễn</li>
              <li>Hạn chế một số chức năng</li>
              <li>Từ chối các yêu cầu đổi thưởng liên quan</li>
            </ul>
            <p className="mt-2 text-sm text-slate-500">Trong trường hợp nghiêm trọng, các tài khoản có liên quan đến hành vi gian lận cũng có thể được kiểm tra.</p>
          </Section>

          <Section icon={Bug} title="5. Khai thác lỗi hệ thống">
            <p>Nếu phát hiện lỗi, người dùng <strong>nên báo cho NXX315 Studio Rewards</strong> thay vì khai thác lỗi.</p>
            <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
               Việc cố tình khai thác lỗi để nhận xu, điểm hoặc phần thưởng <strong>được xem là hành vi vi phạm</strong> chính sách chống gian lận.
            </div>
          </Section>

          <Section icon={Mail} title="6. Khiếu nại">
            <p>Nếu cho rằng tài khoản bị xử lý nhầm, người dùng có thể liên hệ kênh hỗ trợ chính thức để yêu cầu xem xét.</p>
            <p className="mt-2 text-sm text-slate-500">NXX315 Studio Rewards có quyền yêu cầu thông tin cần thiết để xác minh khiếu nại.</p>
          </Section>

          <Section icon={RefreshCw} title="7. Cập nhật chính sách">
            <p>Chính sách chống gian lận có thể được cập nhật để phù hợp với những hình thức gian lận mới hoặc thay đổi của hệ thống.</p>
            <p className="mt-2 text-sm text-slate-500">Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc người dùng chấp nhận chính sách hiện hành.</p>
          </Section>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link to="/dashboard" className="inline-block rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:scale-105">
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
          <Icon size={20} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="mt-3 space-y-2 text-sm text-slate-600 leading-relaxed">
        {children}
      </div>
    </div>
  );
              }
