// src/components/profile/FollowList.jsx — danh sách "Người theo dõi" / "Đang theo dõi" kiểu GitHub (tối đa 100 người gần nhất)
import React, { useEffect, useState } from "react";
import { Lock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";
import { GH_BTN, GH_INK, GH_MUTED } from "./GhProfile.jsx";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

// dòng "👥 6 người theo dõi · 0 đang theo dõi" (bấm vào từng số để mở danh sách)
// following = null/undefined khi người đó đã ẩn danh sách đang theo dõi
export function FollowCounts({ followers, following, onOpen }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-1.5 text-[14px] ${GH_MUTED}`}>
      <Users size={16} />
      <button type="button" onClick={() => onOpen("followers")} className="hover:text-accent-600">
        <b className={GH_INK}>{fmt(followers)}</b> người theo dõi
      </button>
      {following !== null && following !== undefined && (
        <>
          <span>·</span>
          <button type="button" onClick={() => onOpen("following")} className="hover:text-accent-600">
            <b className={GH_INK}>{fmt(following)}</b> đang theo dõi
          </button>
        </>
      )}
    </div>
  );
}

function Message({ icon: Icon, title, sub }) {
  return (
    <div className="px-6 py-16 text-center">
      <Icon size={30} className={`mx-auto ${GH_MUTED}`} />
      <p className={`mt-3 text-[18px] font-semibold ${GH_INK}`}>{title}</p>
      {sub && <p className={`mt-1 text-[14px] ${GH_MUTED}`}>{sub}</p>}
    </div>
  );
}

export default function FollowList({ userId, kind, meId, ownerName }) {
  const navigate = useNavigate();
  const [st, setSt] = useState({ loading: true, error: false, hidden: false, total: 0, items: [] });
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let alive = true;
    setSt({ loading: true, error: false, hidden: false, total: 0, items: [] });
    supabase.rpc("get_follow_list", { p_user_id: userId, p_kind: kind }).then(({ data, error }) => {
      if (!alive) return;
      if (error || !data) {
        setSt({ loading: false, error: true, hidden: false, total: 0, items: [] });
      } else {
        setSt({
          loading: false,
          error: false,
          hidden: !!data.hidden,
          total: Number(data.total || 0),
          items: data.items || [],
        });
      }
    });
    return () => {
      alive = false;
    };
  }, [userId, kind]);

  const patch = (id, value) =>
    setSt((s) => ({ ...s, items: s.items.map((i) => (i.id === id ? { ...i, is_following: value } : i)) }));

  const toggle = async (item) => {
    if (busyId) return;
    const want = !item.is_following;
    setBusyId(item.id);
    patch(item.id, want);
    const { data, error } = await supabase.rpc("set_follow", { p_user_id: item.id, p_follow: want });
    if (error || !data) patch(item.id, !want);
    setBusyId(null);
  };

  const who = ownerName || "Người này";

  if (st.loading) {
    return (
      <div className="space-y-3 p-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-[#eaeef2] dark:bg-[#161b22]" />
        ))}
      </div>
    );
  }
  if (st.error) return <Message icon={Users} title="Chưa tải được danh sách" sub="Bạn thử lại sau ít phút nhé." />;
  if (st.hidden) {
    return <Message icon={Lock} title={`${who} đã ẩn danh sách đang theo dõi`} />;
  }
  if (st.items.length === 0) {
    return (
      <Message
        icon={Users}
        title={kind === "followers" ? `${who} chưa có người theo dõi` : `${who} chưa theo dõi ai`}
      />
    );
  }

  return (
    <div>
      <ul className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
        {st.items.map((it) => (
          <li key={it.id} className="flex items-center gap-3 px-4 py-3.5">
            <button
              type="button"
              onClick={() => navigate(`/u/${it.id}`)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              {it.avatar_url ? (
                <img
                  src={it.avatar_url}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-full border border-[#d0d7de] object-cover dark:border-[#30363d]"
                />
              ) : (
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaeef2] text-[16px] font-bold dark:bg-[#21262d] ${GH_INK}`}
                >
                  {(it.name || "T").charAt(0).toUpperCase()}
                </span>
              )}
              <span className={`truncate text-[16px] font-semibold ${GH_INK}`}>{it.name || "Thành viên"}</span>
            </button>

            {it.id !== meId && (
              <button
                type="button"
                onClick={() => toggle(it)}
                disabled={busyId === it.id}
                className={`${GH_BTN} shrink-0 !px-3 !py-1.5 !text-[13px] disabled:opacity-60`}
              >
                {it.is_following ? "Bỏ theo dõi" : "Theo dõi"}
              </button>
            )}
          </li>
        ))}
      </ul>

      {st.total > st.items.length && (
        <p className={`px-4 py-5 text-center text-[13px] ${GH_MUTED}`}>
          Chỉ hiển thị {st.items.length} người gần nhất trong tổng {fmt(st.total)} người.
        </p>
      )}
    </div>
  );
}
