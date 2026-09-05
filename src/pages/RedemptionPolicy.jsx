import React from "react";
import { Link } from "react-router-dom";
import { Gift, Coins, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, Mail, Shield } from "lucide-react";

export default function RedemptionPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            <Gift size={16} /> Quy định đổi thưởng
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold text-slate-900">Quy định đổi thưởng</h1>
          <p className="mt-2 text-sm text-slate-500">Cập nhật lần cuối: 25/08/2026</p>
          <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-semibold"> Áp dụng cho tất cả yêu cầu đổi thưởng</p>
            <p>Quy định này áp dụng cho tất cả yêu cầu đổi xu/điểm lấy phần thưởng trên NXX315 Studio Rewards.</p>
          </div>
        </div>

        <div className="space-y-6">
          <Section icon={Gift} title="1. Các loại phần thưởng">
            <p>Tùy từng thời điểm, NXX315 Studio Rewards có thể cung cấp các phần thưởng như:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Quân Huy</li>
              <li>Mã/code Robux</li>
              <li>Các phần thưởng khác được công bố trên hệ thống</li>
            </ul>
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
               Danh sách, giá trị và số xu/điểm cần thiết <strong>có thể thay đổi</strong> tùy từng thời điểm.
            </div>
          </Section>

          <Section icon={Shield} title="2. Điều kiện đổi thưởng">
            <p>Để tạo yêu cầu đổi thưởng:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>✓ Tài khoản phải hoạt động bình thường</li>
              <li>✓ Người dùng phải có đủ số xu/điểm yêu cầu</li>
              <li>✓ Người dùng phải cung cấp thông tin nhận thưởng chính xác</li>
              <li>✓ Tài khoản không đang bị hạn chế do vi phạm</li>
              <li>✓ Yêu cầu phải tuân thủ các quy định của NXX315 Studio Rewards</li>
            </ul>
          </Section>

          <Section icon={Clock} title="3. Quy trình đổi thưởng">
            <p>Thông thường, quy trình gồm:</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-600">1</span>
                <p className="text-slate-600">Người dùng chọn phần thưởng</p>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-600">2</span>
                <p className="text-slate-600">Hệ thống kiểm tra số xu/điểm</p>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-600">3</span>
                <p className="text-slate-600">Người dùng gửi yêu cầu đổi thưởng</p>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-600">4</span>
                <p className="text-slate-600">Yêu cầu được kiểm tra và xử lý</p>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">5</span>
                <p className="text-slate-600">Phần thưởng được cung cấp theo phương thức được công bố</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">Thời gian xử lý có thể khác nhau tùy loại phần thưởng và tình trạng hệ thống.</p>
          </Section>

          <Section icon={Mail} title="4. Thông tin nhận thưởng">
            <p>Người dùng <strong>chịu trách nhiệm kiểm tra thông tin</strong> trước khi gửi yêu cầu.</p>
            <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              Nếu người dùng cung cấp thông tin sai, NXX315 Studio Rewards <strong>có thể không thể hoàn lại hoặc thay thế</strong> phần thưởng đã được gửi thành công.
            </div>
          </Section>

          <Section icon={XCircle} title="5. Hủy yêu cầu">
            <p>Yêu cầu đổi thưởng có thể bị từ chối hoặc hủy nếu:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Phát hiện gian lận</li>
              <li>Tài khoản vi phạm điều khoản</li>
              <li>Thông tin nhận thưởng không hợp lệ</li>
              <li>Phần thưởng không còn khả dụng</li>
              <li>Yêu cầu được tạo do lỗi hệ thống</li>
              <li>Có dấu hiệu bất thường cần xác minh</li>
            </ul>
          </Section>

          <Section icon={Coins} title="6. Xu/điểm sau khi đổi thưởng">
            <p>Khi yêu cầu đổi thưởng được xác nhận, số xu/điểm tương ứng <strong>sẽ được trừ khỏi tài khoản</strong>.</p>
            <div className="mt-3 space-y-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              <p> Nếu yêu cầu bị từ chối do lỗi hệ thống hoặc nguyên nhân thuộc về NXX315 Studio Rewards, số xu/điểm <strong>có thể được hoàn lại</strong> tùy trường hợp.</p>
            </div>
            <div className="mt-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
               Nếu yêu cầu bị từ chối do gian lận hoặc vi phạm của người dùng, NXX315 Studio Rewards <strong>có quyền không hoàn lại</strong> số xu/điểm liên quan.
            </div>
          </Section>

          <Section icon={AlertCircle} title="7. Phần thưởng hết hàng">
            <p>Một số phần thưởng có thể có số lượng giới hạn hoặc phụ thuộc vào nguồn cung.</p>
            <p className="mt-2 text-sm text-slate-500">NXX315 Studio Rewards có quyền tạm dừng hoặc ngừng cung cấp một phần thưởng khi phần thưởng đó không còn khả dụng.</p>
          </Section>

          <Section icon={AlertCircle} title="8. Không được mua bán xu/điểm">
            <p>Xu/điểm trên hệ thống <strong>không được mua bán, trao đổi hoặc chuyển nhượng</strong> giữa người dùng nếu NXX315 Studio Rewards không cho phép.</p>
            <p className="mt-2 text-sm text-slate-500">Mọi giao dịch ngoài hệ thống liên quan đến xu/điểm có thể không được hỗ trợ.</p>
          </Section>

          <Section icon={Mail} title="9. Tranh chấp và hỗ trợ">
            <p>Nếu xảy ra vấn đề với yêu cầu đổi thưởng, người dùng nên liên hệ kênh hỗ trợ chính thức và cung cấp thông tin cần thiết như mã đơn hàng hoặc thông tin giao dịch.</p>
            <p className="mt-2 text-sm text-slate-500">NXX315 Studio Rewards sẽ xem xét từng trường hợp dựa trên dữ liệu hệ thống.</p>
          </Section>

          <Section icon={RefreshCw} title="10. Thay đổi phần thưởng">
            <p>NXX315 Studio Rewards có quyền thay đổi danh sách phần thưởng, số xu/điểm yêu cầu và điều kiện đổi thưởng khi cần thiết.</p>
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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
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
