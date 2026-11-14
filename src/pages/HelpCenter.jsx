import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

// Import các component từ đúng file chứa chúng
import { Hero, PopularFaqs, CategoryCards, FaqSection, ContactCard } from "./help/HelpUI.jsx";
import { QuickActions, OrderList } from "./help/HelpSections.jsx";
import { RequestScreen, HistoryFlow } from "./help/HelpRequest.jsx";
import { useHelpTheme } from "./help/helpTheme.jsx";

export default function HelpCenter() {
  useHelpTheme(); // Kích hoạt theme cho toàn bộ trang
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(null);
  const [openFaqId, setOpenFaqId] = useState(null);
  
  // Các state quản lý dữ liệu
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [user, setUser] = useState(null);

  // Các state quản lý màn hình (Gửi yêu cầu / Lịch sử)
  const [showRequest, setShowRequest] = useState(false);
  const [requestPreset, setRequestPreset] = useState({});
  const [showHistory, setShowHistory] = useState(false);

  // Lấy dữ liệu người dùng, đơn hàng và câu hỏi
  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      // 1. Lấy session
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      if (isMounted) setUser(currentUser);

      // 2. Lấy danh sách FAQ (giả lập hoặc từ DB)
      // Nếu bạn có bảng faqs trên Supabase thì thay thế đoạn này bằng supabase.from('faqs').select('*')
      if (isMounted) {
        setFaqs([
          { id: 1, question: "Làm sao để nạp Coin vào tài khoản?", answer: "Bạn có thể nạp qua thẻ cào, chuyển khoản hoặc ví điện tử ở mục Nạp Coin.", category: "payment" },
          { id: 2, question: "Tôi chuyển khoản nhưng chưa nhận được Coin?", answer: "Vui lòng chờ 5-10 phút. Nếu vẫn chưa có, hãy gửi yêu cầu hỗ trợ kèm ảnh chụp màn hình biên lai.", category: "payment" },
          { id: 3, question: "Làm sao để đổi thưởng?", answer: "Vào mục Đổi thưởng, chọn phần quà và nhấn Đổi. Coin sẽ bị trừ ngay lập tức.", category: "order" },
        ]);
        setLoadingFaqs(false);
      }

      // 3. Lấy danh sách đơn hàng gần đây (nếu đã đăng nhập)
      if (currentUser) {
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(3);
        
        if (isMounted) {
          setOrders(ordersData || []);
          setLoadingOrders(false);
        }
      } else {
        if (isMounted) setLoadingOrders(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Mở form gửi yêu cầu với dữ liệu có sẵn (từ FAQ, Đơn hàng...)
  const handleAsk = (preset = {}) => {
    setRequestPreset(preset);
    setShowRequest(true);
  };

  // Lọc FAQ theo từ khóa tìm kiếm và danh mục
  const filteredFaqs = faqs.filter(f => {
    const matchQuery = query.trim() === "" || 
      f.question.toLowerCase().includes(query.toLowerCase()) || 
      f.answer.toLowerCase().includes(query.toLowerCase());
    const matchCat = !activeCat || f.category === activeCat;
    return matchQuery && matchCat;
  });

  return (
    <div className="min-h-screen pb-20">
      {/* 1. Phần Hero với thanh tìm kiếm */}
      <Hero 
        query={query} 
        onQuery={setQuery} 
        name={user?.user_metadata?.full_name || user?.email?.split('@')[0]} 
        onBack={() => window.history.back()} 
      />

      <main className="mx-auto max-w-md px-4 md:max-w-xl relative -mt-6">
        
        {/* 2. Câu hỏi phổ biến (Nổi lên trên Hero) */}
        <PopularFaqs 
          faqs={filteredFaqs} 
          onPick={(f) => setOpenFaqId(f.id)} 
        />

        {/* 3. Các nút thao tác nhanh */}
        <QuickActions 
          onChat={() => alert("Tính năng Chat AI đang phát triển")} 
          onTicket={() => handleAsk()} 
          onHistory={() => setShowHistory(true)} 
        />

        {/* 4. Giao dịch gần đây */}
        <OrderList 
          orders={orders} 
          loading={loadingOrders} 
          signedIn={!!user} 
          onAsk={handleAsk} 
          onAll={() => alert("Chuyển đến trang Lịch sử đơn hàng")} 
        />

        {/* 5. Duyệt theo chủ đề (Grid 2 cột) */}
        <CategoryCards 
          faqs={faqs} 
          active={activeCat} 
          onPick={setActiveCat} 
        />

        {/* 6. Danh sách FAQ chi tiết */}
        <FaqSection 
          faqs={filteredFaqs}
          loading={loadingFaqs}
          cat={activeCat}
          setCat={setActiveCat}
          query={query}
          openId={openFaqId}
          setOpenId={setOpenFaqId}
          onAsk={handleAsk}
        />

        {/* 7. Khối CTA liên hệ màu tím than */}
        <ContactCard onRequest={() => handleAsk()} />
      </main>

      {/* Các màn hình Overlay */}
      {showRequest && (
        <RequestScreen 
          preset={requestPreset} 
          orders={orders}
          onClose={() => setShowRequest(false)} 
          onHistory={() => { setShowRequest(false); setShowHistory(true); }}
          onChat={() => alert("Tính năng Chat AI đang phát triển")}
        />
      )}

      {showHistory && (
        <HistoryFlow 
          onClose={() => setShowHistory(false)} 
          onNew={() => { setShowHistory(false); handleAsk(); }} 
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
                                          }
