import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, ShoppingBag, Clock3, ExternalLink } from "lucide-react";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";

export default function LinkHistory() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchLinks = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setLinks(data);
      }

      setLoading(false);
    };

    fetchLinks();
  }, [session?.user?.id]);

  const handleCopy = async (link, id) => {
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Nhóm theo ngày
  const groupedLinks = links.reduce((groups, link) => {
    const date = link.created_at ? new Date(link.created_at).toLocaleDateString("vi-VN", { 
      weekday: 'long',
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric' 
    }) : "Không rõ";
    if (!groups[date]) groups[date] = [];
    groups[date].push(link);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-[#F5F8F4] text-[#18231D]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/[0.04] bg-[#F5F8F4]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#66736B] shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-[15px] font-black text-[#18231D]">Lịch sử tạo link</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-3.5 pt-3.5 pb-28">
        {loading ? (
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#45B967] border-t-transparent" />
          </div>
        ) : links.length === 0 ? (
          <div className="mt-6 rounded-[22px] bg-white p-8 text-center shadow-[0_5px_20px_rgba(31,55,40,0.05)]">
            <ShoppingBag size={40} className="mx-auto text-[#C6CEC8]" />
            <p className="mt-3 text-sm font-medium text-[#7A897F]">Chưa có link nào được tạo</p>
            <button 
              onClick={() => navigate("/shop-earn")}
              className="mt-3 text-[10px] font-black text-[#45B967]"
            >
              Tạo link ngay →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedLinks).map(([date, items]) => (
              <div key={date} className="rounded-[22px] bg-white p-4 shadow-[0_5px_20px_rgba(31,55,40,0.05)]">
                <p className="text-[11px] font-black text-[#7A897F]">{date}</p>
                
                <div className="mt-3 space-y-3">
                  {items.map((link) => (
                    <div key={link.id} className="rounded-xl border border-[#E8ECE9] p-3">
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F8F4]">
                          <ShoppingBag size={18} className="text-[#45B967]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-bold leading-5 text-[#18231D] line-clamp-2">
                            {link.product_name || "Sản phẩm"}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                            {link.platform || "TikTok Shop"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex gap-2">
                        <button
                          onClick={() => handleCopy(link.short_link || link.full_link, link.id)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] py-2 text-[10px] font-black text-[#6F7B73] transition hover:bg-[#F5F8F4]"
                        >
                          {copiedId === link.id ? (
                            <><Check size={13} className="text-emerald-500" /> Đã sao chép</>
                          ) : (
                            <><Copy size={13} /> Sao chép</>
                          )}
                        </button>
                        <button
                          onClick={() => navigate(`/redirect?url=${encodeURIComponent(link.full_link)}&name=${encodeURIComponent(link.product_name || "Sản phẩm")}&image=${encodeURIComponent(link.product_image || "")}`)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#45B967] py-2 text-[10px] font-black text-white shadow-sm transition hover:bg-[#3DA85A]"
                        >
                          <ExternalLink size={13} /> Mua ngay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
      }
