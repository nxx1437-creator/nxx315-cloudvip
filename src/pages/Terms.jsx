import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Clock, Users, Coins, Gift, AlertCircle, Ban, RefreshCw, Server, FileText, Mail } from "lucide-react";

export default function Terms() {
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
            <FileText size={16} /> Điều khoản sử dụng
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold text-slate-900">Điều khoản sử dụng</h1>
          <p className="mt-2 text-sm text-slate-500">Cập nhật lần cuối: 25/08/2026</p>
          <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-semibold">📌 Lưu ý quan trọng:</p>
            <p>Bằng việc đăng ký, truy cập hoặc sử dụng NXX315 Studio Rewards, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ các Điều khoản sử dụng dưới đây.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 1. Giới thiệu */}
          <Section icon={ShieldCheck} title="1. Giới thiệu">
            <p>NXX315 Studio Rewards là nền tảng cho phép người dùng tham gia các nhiệm vụ, chương trình hoặc hoạt động được cung cấp trên hệ thống để nhận xu/điểm thưởng.</p>
            <p className="mt-2">Xu/điểm có thể được sử dụng để yêu cầu đổi lấy các phần thưởng được NXX315 Studio Rewards công bố, bao gồm nhưng không giới hạn ở:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Quân Huy</li>
              <li>Mã/code Robux</li>
              <li>Các phần thưởng khác được công bố trên hệ thống</li>
            </ul>
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              ⚠️ NXX315 Studio Rewards không phải là Roblox Corporation và không đại diện, liên kết hoặc được Roblox Corporation tài trợ, chứng thực hay quản lý.
            </div>
          </Section>

          {/* 2. Điều kiện sử dụng */}
          <Section icon={Users} title="2. Điều kiện sử dụng">
            <p>Để sử dụng dịch vụ, người dùng phải:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>✅ Từ 15 tuổi trở lên</li>
              <li>✅ Cung cấp thông tin đăng ký chính xác và trung thực</li>
              <li>✅ Chỉ sử dụng tài khoản của chính mình</li>
              <li>✅ Tuân thủ các điều khoản và quy định của NXX315 Studio Rewards</li>
              <li>✅ Không sử dụng hệ thống nhằm mục đích gian lận, trục lợi hoặc phá hoại dịch vụ</li>
            </ul>
            <p className="mt-2 text-sm text-slate-500">NXX315 Studio Rewards có quyền yêu cầu xác minh thông tin khi cần thiết để bảo vệ hệ thống và người dùng.</p>
          </Section>

          {/* 3. Tài khoản người dùng */}
          <Section icon={Users} title="3. Tài khoản người dùng">
            <p>Mỗi người dùng chỉ được phép sở hữu một tài khoản trên hệ thống, trừ khi NXX315 Studio Rewards có quy định khác.</p>
            <p className="mt-2">Người dùng chịu trách nhiệm bảo vệ thông tin đăng nhập và không được chia sẻ tài khoản cho người khác.</p>
            <div className="mt-3 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold">🚫 Nghiêm cấm:</p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>Tạo nhiều tài khoản để nhận nhiều lần phần thưởng</li>
                <li>Sử dụng tài khoản của người khác</li>
                <li>Mua, bán, cho thuê hoặc chuyển nhượng tài khoản</li>
                <li>Sử dụng thông tin giả để đăng ký</li>
                <li>Sử dụng công cụ tự động hoặc bot để thao tác với hệ thống khi chưa được cho phép</li>
              </ul>
            </div>
          </Section>

          {/* 4. Xu và điểm thưởng */}
          <Section icon={Coins} title="4. Xu và điểm thưởng">
            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
              ⚠️ Xu/điểm trên NXX315 Studio Rewards <strong>chỉ có giá trị trong phạm vi hệ thống</strong> và không được xem là tiền mặt, tiền điện tử, tài sản tài chính hoặc phương tiện thanh toán.
            </div>
            <p className="mt-3">Xu/điểm có thể được cộng hoặc trừ dựa trên:</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Nhiệm vụ hoàn thành hợp lệ</li>
              <li>Hoạt động khuyến mãi</li>
              <li>Đổi phần thưởng</li>
              <li>Điều chỉnh do lỗi hệ thống hoặc hành vi gian lận</li>
            </ul>
            <p className="mt-2 text-sm text-slate-500">NXX315 Studio Rewards có quyền điều chỉnh hoặc thu hồi số xu/điểm được ghi nhận do lỗi hệ thống, giao dịch không hợp lệ hoặc hành vi gian lận.</p>
          </Section>

          {/* 5. Nhiệm vụ */}
          <Section icon={Gift} title="5. Nhiệm vụ">
            <p>Người dùng phải hoàn thành nhiệm vụ theo đúng yêu cầu được hiển thị trên hệ thống.</p>
            <div className="mt-3 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold">🚫 Nghiêm cấm việc:</p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>Khai báo hoàn thành nhiệm vụ khi chưa thực hiện</li>
                <li>Sử dụng nhiều tài khoản để thực hiện cùng một nhiệm vụ nhằm nhận thưởng nhiều lần</li>
                <li>Sử dụng bot, script hoặc công cụ tự động trái phép</li>
                <li>Làm giả bằng chứng hoàn thành nhiệm vụ</li>
                <li>Khai thác lỗi hệ thống để nhận xu/điểm</li>
                <li>Cố tình tạo hoạt động giả nhằm tăng phần thưởng</li>
              </ul>
            </div>
            <p className="mt-3 text-sm text-slate-500">NXX315 Studio Rewards có quyền từ chối ghi nhận hoặc thu hồi phần thưởng đối với nhiệm vụ không hợp lệ.</p>
          </Section>

          {/* 6. Quy định đổi thưởng */}
          <Section icon={Gift} title="6. Quy định đổi thưởng">
            <p>Người dùng có thể sử dụng số xu/điểm đủ điều kiện để tạo yêu cầu đổi phần thưởng.</p>
            <p className="mt-2">Các yêu cầu đổi thưởng phải tuân thủ:</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Người dùng phải có đủ số xu/điểm yêu cầu</li>
              <li>Thông tin nhận thưởng phải chính xác</li>
              <li>Một yêu cầu đổi thưởng có thể cần được kiểm tra trước khi hoàn tất</li>
              <li>Thời gian xử lý có thể thay đổi tùy từng loại phần thưởng</li>
            </ul>
            <p className="mt-2 text-sm text-slate-500">Sau khi yêu cầu được xác nhận và xử lý thành công, số xu/điểm tương ứng sẽ được trừ khỏi tài khoản.</p>
            <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
              ℹ️ NXX315 Studio Rewards không đảm bảo rằng mọi phần thưởng luôn có sẵn. Phần thưởng có thể thay đổi, hết hàng hoặc được thay thế tùy theo tình trạng cung cấp.
            </div>
          </Section>

          {/* 7. Hủy hoặc từ chối yêu cầu */}
          <Section icon={Ban} title="7. Hủy hoặc từ chối yêu cầu đổi thưởng">
            <p>NXX315 Studio Rewards có thể từ chối, tạm dừng hoặc hủy yêu cầu đổi thưởng nếu:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Phát hiện dấu hiệu gian lận</li>
              <li>Người dùng vi phạm Điều khoản sử dụng</li>
              <li>Thông tin nhận thưởng không chính xác</li>
              <li>Yêu cầu được tạo do lỗi hệ thống</li>
              <li>Phần thưởng không còn khả dụng</li>
              <li>Có lý do hợp lý để nghi ngờ tài khoản hoặc giao dịch không hợp lệ</li>
            </ul>
            <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              ⚠️ Trong trường hợp yêu cầu bị từ chối do lỗi của người dùng hoặc hành vi vi phạm, NXX315 Studio Rewards <strong>có thể không hoàn lại</strong> số xu/điểm đã sử dụng cho yêu cầu đó.
            </div>
          </Section>

          {/* 8. Chống gian lận */}
          <Section icon={AlertCircle} title="8. Chính sách chống gian lận">
            <p>NXX315 Studio Rewards áp dụng các biện pháp kỹ thuật và thủ công nhằm phát hiện hành vi bất thường.</p>
            <p className="mt-2">Hệ thống có thể xem xét nhiều tín hiệu khác nhau, chẳng hạn như:</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Thông tin tài khoản</li>
              <li>Lịch sử nhiệm vụ</li>
              <li>Lịch sử đổi thưởng</li>
              <li>Thiết bị và phiên đăng nhập</li>
              <li>Các dấu hiệu hoạt động bất thường</li>
              <li>Mối liên hệ giữa nhiều tài khoản</li>
            </ul>
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              ℹ️ Việc sử dụng mạng Wi-Fi, 4G hoặc 5G khác nhau không đồng nghĩa với việc người dùng được phép tạo nhiều tài khoản.
            </div>
            <div className="mt-3 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold">🚫 Nếu phát hiện hành vi gian lận hoặc lạm dụng hệ thống, NXX315 Studio Rewards có thể:</p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>Hủy nhiệm vụ không hợp lệ</li>
                <li>Thu hồi xu/điểm bất hợp lệ</li>
                <li>Tạm khóa tài khoản</li>
                <li>Khóa tài khoản vĩnh viễn</li>
                <li>Hủy các yêu cầu đổi thưởng liên quan</li>
                <li>Từ chối các yêu cầu hỗ trợ liên quan đến hành vi vi phạm</li>
              </ul>
              <p className="mt-2 text-xs">NXX315 Studio Rewards có thể áp dụng biện pháp xử lý ngay cả khi hành vi gian lận được phát hiện sau khi phần thưởng đã được cấp.</p>
            </div>
          </Section>

          {/* 9. Lạm dụng lỗi hệ thống */}
          <Section icon={AlertCircle} title="9. Lạm dụng lỗi hệ thống">
            <p>Người dùng không được cố ý khai thác lỗi, lỗ hổng hoặc hành vi ngoài dự kiến của hệ thống để nhận lợi ích.</p>
            <p className="mt-2">Nếu phát hiện lỗi, người dùng nên thông báo cho NXX315 Studio Rewards thay vì khai thác lỗi.</p>
            <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              ⚠️ Việc cố tình khai thác lỗi để nhận xu, điểm hoặc phần thưởng có thể được xem là hành vi gian lận.
            </div>
          </Section>

          {/* 10. Tính khả dụng */}
          <Section icon={Server} title="10. Tính khả dụng của dịch vụ">
            <p>NXX315 Studio Rewards có thể tạm ngừng hoặc hạn chế một phần dịch vụ để:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Bảo trì</li>
              <li>Nâng cấp hệ thống</li>
              <li>Khắc phục lỗi</li>
              <li>Xử lý sự cố bảo mật</li>
              <li>Thực hiện các thay đổi cần thiết đối với nền tảng</li>
            </ul>
            <p className="mt-2 text-sm text-slate-500">NXX315 Studio Rewards không đảm bảo rằng dịch vụ sẽ luôn hoạt động liên tục hoặc không xảy ra lỗi.</p>
          </Section>

          {/* 11. Thay đổi điều khoản */}
          <Section icon={RefreshCw} title="11. Thay đổi điều khoản">
            <p>NXX315 Studio Rewards có quyền cập nhật hoặc thay đổi Điều khoản sử dụng khi cần thiết.</p>
            <p className="mt-2">Phiên bản mới sẽ được công bố trên website và có thể có ngày cập nhật mới.</p>
            <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
              ℹ️ Việc tiếp tục sử dụng dịch vụ sau khi điều khoản được cập nhật được xem là bạn tiếp tục chấp nhận các điều khoản mới.
            </div>
          </Section>

          {/* 12. Chấm dứt quyền sử dụng */}
          <Section icon={Ban} title="12. Chấm dứt quyền sử dụng">
            <p>NXX315 Studio Rewards có quyền hạn chế hoặc chấm dứt quyền truy cập của người dùng nếu người dùng:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Vi phạm Điều khoản sử dụng</li>
              <li>Gian lận hoặc cố tình lạm dụng hệ thống</li>
              <li>Gây ảnh hưởng đến hoạt động của nền tảng</li>
              <li>Sử dụng dịch vụ cho mục đích trái pháp luật</li>
              <li>Có hành vi gây ảnh hưởng nghiêm trọng đến người dùng hoặc hệ thống</li>
            </ul>
          </Section>

          {/* 13. Trách nhiệm người dùng */}
          <Section icon={Users} title="13. Trách nhiệm của người dùng">
            <p>Người dùng có trách nhiệm đảm bảo rằng hoạt động của mình trên NXX315 Studio Rewards tuân thủ pháp luật hiện hành và các quy định của nền tảng.</p>
            <p className="mt-2">Người dùng không được sử dụng NXX315 Studio Rewards để thực hiện các hoạt động bất hợp pháp, lừa đảo hoặc gây thiệt hại cho người khác.</p>
          </Section>

          {/* 14. Liên hệ */}
          <Section icon={Mail} title="14. Liên hệ">
            <p>Nếu bạn phát hiện lỗi, vấn đề bảo mật, giao dịch bất thường hoặc cần hỗ trợ liên quan đến tài khoản, vui lòng liên hệ với NXX315 Studio Rewards thông qua kênh hỗ trợ chính thức được công bố trên website.</p>
          </Section>

          {/* 15. Chấp nhận điều khoản */}
          <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-b from-sky-50 to-white p-6 text-center shadow-lg">
            <h2 className="font-display text-2xl font-bold text-slate-900">15. Chấp nhận điều khoản</h2>
            <div className="mt-4 space-y-2 text-left text-sm text-slate-700">
              <p>Khi tạo tài khoản hoặc tiếp tục sử dụng NXX315 Studio Rewards, bạn xác nhận rằng:</p>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>✅ Bạn đã đọc và hiểu Điều khoản sử dụng</li>
                <li>✅ Bạn đáp ứng điều kiện độ tuổi tối thiểu 15 tuổi</li>
                <li>✅ Bạn đồng ý tuân thủ các quy định của nền tảng</li>
                <li>✅ Bạn hiểu rằng hành vi gian lận hoặc lạm dụng có thể dẫn đến việc mất quyền sử dụng tài khoản và các quyền lợi liên quan</li>
              </ul>
            </div>
            <div className="mt-4 rounded-lg bg-sky-100 p-3 text-sm text-sky-700">
              🔒 NXX315 Studio Rewards có quyền thực hiện các biện pháp cần thiết để bảo vệ tính công bằng, an toàn và ổn định của hệ thống.
            </div>
            <Link to="/" className="mt-6 inline-block rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:scale-105">
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

// Component Section
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
