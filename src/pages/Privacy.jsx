import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, User, Mail, FileText, RefreshCw, AlertCircle } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
            <Shield size={16} /> Chính sách quyền riêng tư
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold text-slate-900">Chính sách quyền riêng tư</h1>
          <p className="mt-2 text-sm text-slate-500">Cập nhật lần cuối: 25/08/2026</p>
          <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-semibold">🔒 Cam kết bảo vệ quyền riêng tư</p>
            <p>NXX315 Studio Rewards tôn trọng quyền riêng tư của người dùng và cam kết bảo vệ thông tin được cung cấp trong quá trình sử dụng dịch vụ.</p>
          </div>
        </div>

        <div className="space-y-6">
          <Section icon={User} title="1. Thông tin chúng tôi có thể thu thập">
            <p>Tùy vào cách bạn sử dụng dịch vụ, NXX315 Studio Rewards có thể xử lý một số thông tin cần thiết cho hoạt động của tài khoản, bao gồm:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Thông tin tài khoản như tên hiển thị hoặc thông tin đăng nhập</li>
              <li>Thông tin liên quan đến hồ sơ người dùng</li>
              <li>Lịch sử nhiệm vụ và phần thưởng</li>
              <li>Lịch sử đổi thưởng</li>
              <li>Thông tin cần thiết để xử lý yêu cầu hỗ trợ</li>
              <li>Thông tin kỹ thuật cần thiết để duy trì và bảo vệ hoạt động của hệ thống</li>
            </ul>
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              ℹ️ Chúng tôi <strong>chỉ thu thập những thông tin cần thiết</strong> cho mục đích vận hành, bảo mật và cung cấp dịch vụ.
            </div>
          </Section>

          <Section icon={Eye} title="2. Mục đích sử dụng thông tin">
            <p>Thông tin có thể được sử dụng để:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Quản lý tài khoản người dùng</li>
              <li>Ghi nhận nhiệm vụ và xu/điểm</li>
              <li>Xử lý yêu cầu đổi thưởng</li>
              <li>Phát hiện và ngăn chặn gian lận</li>
              <li>Bảo vệ hệ thống khỏi hành vi lạm dụng</li>
              <li>Cải thiện chất lượng dịch vụ</li>
              <li>Xử lý yêu cầu hỗ trợ</li>
              <li>Khắc phục lỗi và sự cố kỹ thuật</li>
            </ul>
          </Section>

          <Section icon={Lock} title="3. Bảo vệ thông tin">
            <p>NXX315 Studio Rewards áp dụng các biện pháp phù hợp nhằm hạn chế truy cập trái phép, mất mát hoặc sử dụng thông tin không đúng mục đích.</p>
            <div className="mt-3 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
              ⚠️ Tuy nhiên, <strong>không có hệ thống trực tuyến nào có thể đảm bảo an toàn tuyệt đối</strong>. Người dùng cũng có trách nhiệm bảo vệ thông tin đăng nhập và không chia sẻ thông tin tài khoản cho người khác.
            </div>
          </Section>

          <Section icon={Mail} title="4. Chia sẻ thông tin">
            <p>NXX315 Studio Rewards <strong>không chủ động bán thông tin cá nhân</strong> của người dùng.</p>
            <p className="mt-2">Thông tin có thể được cung cấp cho bên thứ ba khi cần thiết để:</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Cung cấp hoặc xử lý phần thưởng</li>
              <li>Duy trì hoạt động của dịch vụ</li>
              <li>Xử lý vấn đề kỹ thuật</li>
              <li>Tuân thủ nghĩa vụ pháp lý hợp lệ</li>
              <li>Bảo vệ quyền lợi, tài sản và sự an toàn của hệ thống</li>
            </ul>
          </Section>

          <Section icon={FileText} title="5. Thời gian lưu trữ">
            <p>Thông tin được lưu trữ trong khoảng thời gian cần thiết để vận hành dịch vụ, xử lý giao dịch, bảo mật hệ thống và thực hiện các mục đích hợp pháp khác.</p>
            <p className="mt-2 text-sm text-slate-500">Một số dữ liệu giao dịch hoặc dữ liệu liên quan đến gian lận có thể được lưu giữ lâu hơn để phục vụ việc kiểm tra và bảo vệ hệ thống.</p>
          </Section>

          <Section icon={User} title="6. Quyền của người dùng">
            <p>Tùy theo quy định pháp luật áp dụng, người dùng có thể yêu cầu:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Kiểm tra thông tin liên quan đến tài khoản</li>
              <li>Sửa thông tin không chính xác</li>
              <li>Yêu cầu hỗ trợ liên quan đến dữ liệu của mình</li>
              <li>Yêu cầu xóa tài khoản khi phù hợp</li>
            </ul>
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              ℹ️ Một số dữ liệu có thể cần được giữ lại vì lý do bảo mật, giao dịch, chống gian lận hoặc nghĩa vụ pháp lý.
            </div>
          </Section>

          <Section icon={AlertCircle} title="7. Trẻ em và độ tuổi sử dụng">
            <p>NXX315 Studio Rewards yêu cầu người dùng <strong>từ 15 tuổi trở lên</strong>.</p>
            <p className="mt-2 text-sm text-slate-500">Nếu phát hiện tài khoản không đáp ứng điều kiện độ tuổi, NXX315 Studio Rewards có thể hạn chế hoặc chấm dứt quyền sử dụng tài khoản.</p>
          </Section>

          <Section icon={RefreshCw} title="8. Thay đổi chính sách">
            <p>Chính sách quyền riêng tư có thể được cập nhật khi hệ thống hoặc cách thức xử lý dữ liệu thay đổi.</p>
            <p className="mt-2 text-sm text-slate-500">Phiên bản mới sẽ được công bố trên website cùng ngày cập nhật.</p>
          </Section>

          <Section icon={Mail} title="9. Liên hệ">
            <p>Nếu bạn có câu hỏi hoặc yêu cầu liên quan đến quyền riêng tư, vui lòng liên hệ NXX315 Studio Rewards thông qua kênh hỗ trợ chính thức được công bố trên website.</p>
          </Section>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link to="/" className="inline-block rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:scale-105">
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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
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
