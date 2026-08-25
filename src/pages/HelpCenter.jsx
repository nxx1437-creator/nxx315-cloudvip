import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  HelpCircle, 
  User, 
  Coins, 
  Gift, 
  Shield, 
  Lock, 
  Search, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  MessageCircle
} from "lucide-react";

// Dữ liệu FAQ
const faqData = [
  {
    id: "account",
    icon: User,
    title: "👤 Tài khoản",
    questions: [
      {
        q: "Ai có thể sử dụng NXX315 Studio Rewards?",
        a: "NXX315 Studio Rewards dành cho người dùng từ 15 tuổi trở lên."
      },
      {
        q: "Tôi có được tạo nhiều tài khoản không?",
        a: "Không. Mỗi người dùng chỉ được phép sử dụng một tài khoản. Việc đổi thiết bị hoặc chuyển từ Wi-Fi sang 4G/5G không thay đổi quy định này."
      },
      {
        q: "Tôi quên thông tin đăng nhập thì sao?",
        a: "Hãy sử dụng chức năng khôi phục tài khoản được cung cấp trên website hoặc liên hệ bộ phận hỗ trợ nếu bạn không thể tự khôi phục. Không cung cấp mật khẩu hoặc mã xác thực cho người khác."
      }
    ]
  },
  {
    id: "tasks",
    icon: Coins,
    title: "🪙 Xu và nhiệm vụ",
    questions: [
      {
        q: "Làm nhiệm vụ nhưng không nhận được xu thì sao?",
        a: "Hãy kiểm tra xem nhiệm vụ đã được hoàn thành đúng yêu cầu chưa. Nếu vẫn không nhận được xu, hãy liên hệ hỗ trợ và cung cấp thông tin về nhiệm vụ cùng ảnh chụp màn hình nếu có."
      },
      {
        q: "Tôi có thể tự động hóa nhiệm vụ không?",
        a: "Không được sử dụng bot, script hoặc công cụ tự động trái phép để tạo lợi ích trên hệ thống. Những hoạt động có dấu hiệu gian lận có thể bị từ chối hoặc xử lý theo Chính sách chống gian lận."
      },
      {
        q: "Xu của tôi bị trừ thì sao?",
        a: "Xu có thể bị trừ khi: Bạn thực hiện đổi thưởng, giao dịch được điều chỉnh, hệ thống phát hiện xu được cộng không hợp lệ, hoặc xu/điểm liên quan đến hành vi gian lận bị thu hồi. Nếu cho rằng số dư bị trừ sai, hãy liên hệ hỗ trợ."
      }
    ]
  },
  {
    id: "redemption",
    icon: Gift,
    title: "🎁 Đổi thưởng",
    questions: [
      {
        q: "Tôi có thể đổi những gì?",
        a: "Tùy thời điểm, NXX315 Studio Rewards có thể cung cấp: Quân Huy, Mã/code Robux, và các phần thưởng khác được công bố trên hệ thống."
      },
      {
        q: "Đổi thưởng mất bao lâu?",
        a: "Thời gian xử lý phụ thuộc vào loại phần thưởng và tình trạng hệ thống. Bạn có thể kiểm tra trạng thái yêu cầu trong lịch sử đổi thưởng nếu tính năng này được cung cấp."
      },
      {
        q: "Tại sao yêu cầu đổi thưởng của tôi bị từ chối?",
        a: "Một yêu cầu có thể bị từ chối nếu: Tài khoản vi phạm quy định, có dấu hiệu gian lận, thông tin nhận thưởng không chính xác, phần thưởng không còn khả dụng, hoặc yêu cầu gặp lỗi cần xác minh thêm."
      },
      {
        q: "Tôi nhập sai thông tin nhận thưởng thì sao?",
        a: "Hãy liên hệ hỗ trợ càng sớm càng tốt. NXX315 Studio Rewards không đảm bảo có thể sửa hoặc hoàn lại phần thưởng nếu thông tin sai đã được xử lý thành công."
      }
    ]
  },
  {
    id: "fraud",
    icon: Shield,
    title: "🛡️ Gian lận",
    questions: [
      {
        q: "Tôi có thể dùng nhiều mạng để tạo nhiều tài khoản không?",
        a: "Không. Quy định của hệ thống là một người dùng chỉ một tài khoản, bất kể người dùng đang sử dụng Wi-Fi, 4G hay 5G."
      },
      {
        q: "Tôi phát hiện lỗi thì nên làm gì?",
        a: "Hãy báo lỗi cho NXX315 Studio Rewards. Không cố tình khai thác lỗi để nhận xu, điểm hoặc phần thưởng."
      },
      {
        q: "Tài khoản của tôi bị khóa do nhầm lẫn thì sao?",
        a: "Bạn có thể liên hệ hỗ trợ để yêu cầu xem xét. NXX315 Studio Rewards có thể yêu cầu thông tin cần thiết để kiểm tra trường hợp của bạn."
      }
    ]
  },
  {
    id: "security",
    icon: Lock,
    title: "🔐 An toàn tài khoản",
    questions: [
      {
        q: "NXX315 Studio Rewards có yêu cầu mật khẩu của tôi không?",
        a: "NXX315 Studio Rewards sẽ KHÔNG yêu cầu bạn gửi: Mật khẩu, mã xác thực đăng nhập, mã khôi phục tài khoản, hoặc thông tin bảo mật không cần thiết. Nếu một người tự xưng là nhân viên yêu cầu những thông tin trên, hãy ngừng trao đổi và liên hệ qua kênh chính thức."
      }
    ]
  }
];

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  // Lọc FAQ theo từ khóa
  const filteredFaq = faqData.map(section => ({
    ...section,
    questions: section.questions.filter(q => 
      q.q.toLowerCase().includes(search.toLowerCase()) ||
      q.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(section => section.questions.length > 0);

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
            <HelpCircle size={16} /> Trung tâm trợ giúp
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold text-slate-900">Trung tâm trợ giúp</h1>
          <p className="mt-2 text-sm text-slate-500">
            Chào mừng bạn đến với NXX315 Studio Rewards Help Center.
            <br />
            Tại đây, bạn có thể tìm câu trả lời cho những vấn đề thường gặp về tài khoản, nhiệm vụ, xu/điểm và đổi thưởng.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm câu hỏi, từ khóa..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {filteredFaq.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Không tìm thấy câu hỏi phù hợp với từ khóa "{search}".
              <br />
              <Link to="/contact" className="text-sky-600 hover:underline">Liên hệ hỗ trợ</Link> nếu bạn cần giúp đỡ thêm.
            </div>
          ) : (
            filteredFaq.map((section) => {
              const Icon = section.icon;
              const isOpen = openId === section.id;
              
              return (
                <div key={section.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {/* Section header */}
                  <button
                    onClick={() => toggle(section.id)}
                    className="flex w-full items-center justify-between p-5 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                        <Icon size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        {section.questions.length}
                      </span>
                    </div>
                    {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                  </button>

                  {/* Questions */}
                  {isOpen && (
                    <div className="divide-y divide-slate-100 border-t border-slate-100">
                      {section.questions.map((item, idx) => (
                        <div key={idx} className="p-5">
                          <p className="font-semibold text-slate-900">{item.q}</p>
                          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Không tìm thấy câu trả lời? */}
        <div className="mt-8 rounded-2xl border-2 border-sky-200 bg-gradient-to-b from-sky-50 to-white p-6 text-center shadow-lg">
          <h2 className="font-display text-2xl font-bold text-slate-900">📮 Không tìm thấy câu trả lời?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Nếu câu hỏi của bạn chưa được giải đáp, hãy truy cập trang Liên hệ để gửi yêu cầu hỗ trợ.
            <br />
            Khi liên hệ, hãy mô tả vấn đề rõ ràng và cung cấp mã đơn hàng hoặc ảnh chụp màn hình nếu liên quan.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition hover:scale-105">
              <MessageCircle size={16} /> Liên hệ hỗ trợ
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
  }
