import React, { useState, useEffect } from "react";
import { Gift, Loader2, Sparkles, Lock, RefreshCw, X, Star, Flame, Zap } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";

// ===== CẤU HÌNH PHẦN THƯỞNG - TỈ LỆ =====
// Tổng tỉ lệ = 100%
const REWARDS = [
  { id: 1, label: "May mắn 🍀", value: 5, color: "from-gray-400 to-gray-600", icon: "🍀", rate: 30 },   // 30%
  { id: 2, label: "Sao nhỏ ⭐", value: 10, color: "from-blue-400 to-blue-600", icon: "⭐", rate: 25 },   // 25%
  { id: 3, label: "Sao vàng ✨", value: 20, color: "from-yellow-400 to-yellow-600", icon: "✨", rate: 20 }, // 20%
  { id: 4, label: "Cực phẩm 🔥", value: 50, color: "from-red-400 to-red-600", icon: "🔥", rate: 15 },    // 15%
  { id: 5, label: "Thần tài 🧧", value: 100, color: "from-purple-400 to-purple-600", icon: "🧧", rate: 7 }, // 7%
  { id: 6, label: "Đại phát 🎊", value: 200, color: "from-pink-400 to-pink-600", icon: "🎊", rate: 3 },   // 3%
];

// Hàm random theo tỉ lệ
const getRandomReward = () => {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const reward of REWARDS) {
    cumulative += reward.rate;
    if (random <= cumulative) {
      return reward;
    }
  }
  return REWARDS[0];
};

// Cấu hình hộp quà
const BOXES = [
  { id: 1, emoji: "🎁", label: "Hộp 1" },
  { id: 2, emoji: "🎁", label: "Hộp 2" },
  { id: 3, emoji: "🎁", label: "Hộp 3" },
];

export default function LuckyDraw({ userId, onDrawComplete, isRefundLocked = false }) {
  const [selectedBox, setSelectedBox] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState(null);
  const [remainingDraws, setRemainingDraws] = useState(1);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastDrawDate, setLastDrawDate] = useState(null);

  // Kiểm tra số lượt quay còn lại trong ngày (chỉ 1 lượt/ngày)
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchDraws = async () => {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('lucky_draws')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (!error && data) {
        const hasDrawnToday = data.length > 0;
        setRemainingDraws(hasDrawnToday ? 0 : 1);
        setHistory(data.slice(0, 5));
        
        if (data.length > 0) {
          setLastDrawDate(data[0].created_at);
        }
      }
      setLoading(false);
    };

    fetchDraws();
  }, [userId]);

  const handleBoxClick = async (boxId) => {
    if (isDrawing || remainingDraws <= 0 || isRefundLocked) return;

    setSelectedBox(boxId);
    setIsDrawing(true);
    setResult(null);

    // Hiệu ứng mở hộp
    await new Promise(resolve => setTimeout(resolve, 800));

    // Random phần thưởng theo tỉ lệ
    const reward = getRandomReward();

    // Lưu kết quả
    const { data, error } = await supabase
      .from('lucky_draws')
      .insert({
        user_id: userId,
        reward: reward.value,
        reward_label: reward.label,
        box_id: boxId,
        created_at: new Date().toISOString(),
      })
      .select();

    if (!error && data) {
      // Cộng điểm sao
      const { data: profile } = await supabase
        .from('profiles')
        .select('star_points')
        .eq('id', userId)
        .single();

      if (profile) {
        const newStars = (profile.star_points || 0) + reward.value;
        await supabase
          .from('profiles')
          .update({ star_points: newStars })
          .eq('id', userId);
      }

      setResult({ ...reward, boxId });
      setRemainingDraws(0);
      setLastDrawDate(new Date().toISOString());
      
      if (onDrawComplete) {
        onDrawComplete(reward);
      }
    }

    setIsDrawing(false);
  };

  // Mua thêm lượt (50 Xu)
  const buyExtraDraw = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', userId)
      .single();

    if (!profile || profile.coins < 50) {
      alert("⚠️ Cần 50 Xu để mua thêm 1 lượt bốc thăm!");
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ coins: profile.coins - 50 })
      .eq('id', userId);

    if (!error) {
      setRemainingDraws(1);
      alert("✅ Đã mua thêm 1 lượt bốc thăm!");
    }
  };

  // Kiểm tra xem đã bốc hôm nay chưa
  const hasDrawnToday = remainingDraws === 0;

  if (loading) {
    return (
      <div className="mt-3 rounded-2xl bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-6 text-center">
        <Loader2 size={24} className="mx-auto animate-spin text-white/40" />
      </div>
    );
  }

  if (isRefundLocked) {
    return (
      <div className="mt-3 rounded-2xl bg-gray-100 p-6 text-center border-2 border-gray-200">
        <Lock size={32} className="mx-auto text-gray-400" />
        <p className="mt-2 text-sm font-semibold text-gray-500">🔒 Bị khóa do nợ hoàn trả</p>
        <p className="mt-1 text-xs text-gray-400">Vui lòng trả nợ để mở khóa tính năng này</p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift size={18} className="text-pink-400" />
          <span className="text-sm font-bold text-white">🎲 Bốc thăm trúng thưởng</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-white/60">Lượt:</span>
            <span className="text-sm font-bold text-yellow-400">{remainingDraws}</span>
            <span className="text-xs text-white/40">/1</span>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-white/40 hover:text-white/80 transition-colors"
          >
            {showHistory ? "Ẩn" : "Lịch sử"}
          </button>
        </div>
      </div>

      {/* Tỉ lệ phần thưởng */}
      <div className="mt-2 flex flex-wrap gap-1">
        {REWARDS.map((r) => (
          <span key={r.id} className="text-[7px] text-white/30">
            {r.icon}{r.rate}%
          </span>
        ))}
      </div>

      {/* 3 hộp quà */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        {BOXES.map((box) => {
          const isSelected = selectedBox === box.id;
          const isRevealed = result && result.boxId === box.id;
          
          return (
            <button
              key={box.id}
              onClick={() => handleBoxClick(box.id)}
              disabled={isDrawing || remainingDraws <= 0 || isRefundLocked || hasDrawnToday}
              className={`relative aspect-square rounded-2xl text-4xl transition-all duration-300 ${
                isSelected && isDrawing
                  ? "scale-95 ring-4 ring-yellow-400 ring-offset-2 ring-offset-[#1A1A2E]"
                  : isRevealed
                  ? "scale-105 ring-4 ring-green-400 ring-offset-2 ring-offset-[#1A1A2E]"
                  : "hover:scale-105 hover:ring-2 hover:ring-white/20"
              } ${
                isRevealed && result
                  ? `bg-gradient-to-br ${result.color}`
                  : "bg-gradient-to-br from-gray-700 to-gray-900"
              } ${
                isDrawing || remainingDraws <= 0 || isRefundLocked || hasDrawnToday
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }`}
            >
              {isRevealed && result ? (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-3xl">{result.icon}</span>
                  <span className="mt-1 text-[10px] font-bold text-white">{result.label}</span>
                  <span className="text-[8px] text-white/80">+{result.value}⭐</span>
                </div>
              ) : isSelected && isDrawing ? (
                <div className="flex items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-white" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-4xl">{box.emoji}</span>
                  <span className="mt-1 text-[9px] text-white/40">{box.label}</span>
                  {hasDrawnToday && (
                    <span className="mt-1 text-[8px] text-yellow-400">✅ Đã bốc</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Kết quả */}
      {result && (
        <div className="mt-3 animate-bounce rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 p-3 text-center">
          <p className="text-sm font-bold text-white">
            🎉 Chúc mừng! Bạn nhận được {result.label} (+{result.value}⭐)
          </p>
        </div>
      )}

      {/* Nút mua thêm lượt */}
      {hasDrawnToday && !isDrawing && !result && (
        <button
          onClick={buyExtraDraw}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-2.5 text-xs font-bold text-white transition hover:shadow-lg active:scale-[0.98]"
        >
          <RefreshCw size={14} />
          Mua thêm 1 lượt (50 Xu)
        </button>
      )}

      {/* Lịch sử */}
      {showHistory && (
        <div className="mt-3 max-h-32 overflow-y-auto rounded-xl bg-black/20 p-2">
          <p className="text-[9px] font-bold text-white/40 mb-1">Lịch sử bốc thăm</p>
          {history.length === 0 ? (
            <p className="text-[9px] text-white/20">Chưa có lượt bốc thăm nào</p>
          ) : (
            history.map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b border-white/5 py-1">
                <span className="text-[9px] text-white/60">
                  {new Date(item.created_at).toLocaleString("vi-VN")}
                </span>
                <span className="text-[9px] font-bold text-yellow-400">
                  +{item.reward}⭐
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Hướng dẫn */}
      <p className="mt-2 text-center text-[8px] text-white/30">
        🎯 Chọn 1 trong 3 hộp quà. Mỗi ngày được bốc 1 lượt. Mua thêm 1 lượt (50 Xu)
      </p>
    </div>
  );
            }
