import React, { useEffect, useState } from "react";
import {
  ShieldCheck, Package, ListChecks, Users, Loader2, Plus, Trash2, Save,
  Gift, Megaphone, CheckCircle2, XCircle, RefreshCw, Music, Youtube
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const TABS = [
  { key: "orders", label: "Orders", icon: Package, desc: "Manage rewards" },
  { key: "tasks", label: "Tasks", icon: ListChecks, desc: "Config tasks" },
  { key: "packages", label: "Packages", icon: Gift, desc: "Store items" },
  { key: "users", label: "Users", icon: Users, desc: "Manage accounts" },
  { key: "marketing", label: "Marketing", icon: Megaphone, desc: "Review videos" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancel" },
];

export default function Admin() {
  const [tab, setTab] = useState("orders");

  return (
    <div className="min-h-screen bg-[#F0F6FF] pb-16">
      <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-xl md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-500/30">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 md:text-xl">Nxx315 Admin Panel</h1>
              <p className="text-xs font-medium text-slate-500">Rewards Management</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-600">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" /> System Online
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-5 md:px-6 md:pt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button key={item.key} type="button" onClick={() => setTab(item.key)}
                className={`flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                  active ? "scale-[1.02] bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/30" : "border border-blue-100 bg-white text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-600"
                }`}>
                <Icon size={20} className={active ? "text-white" : "text-blue-500"} />
                <div>
                  <div className="text-sm font-bold">{item.label}</div>
                  <div className={`text-[11px] ${active ? "text-white/80" : "text-slate-400"}`}>{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-6">
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-blue-50 md:p-6">
          {tab === "orders" && <OrdersTab />}
          {tab === "tasks" && <TasksTab />}
          {tab === "packages" && <PackagesTab />}
          {tab === "users" && <UsersTab />}
          {tab === "marketing" && <MarketingTab />}
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   MARKETING TAB
========================================================= */

function MarketingTab() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [coins, setCoins] = useState({});
  const [savingId, setSavingId] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("marketing_videos").select("*").order("created_at", { ascending: false });
    if (error) { setVideos([]); } else { setVideos(data ?? []); }
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleApprove = async (video) => {
    const coin = Number(coins[video.id] || 0);
    if (coin <= 0) { alert("Vui lòng nhập số coin thưởng!"); return; }
    setSavingId(video.id);
    const { error } = await supabase.from("marketing_videos").update({ status: "approved", coin_awarded: coin, admin_note: notes[video.id] || "" }).eq("id", video.id);
    if (error) { alert(error.message); setSavingId(null); return; }
    // Cộng coin cho user
    const { data: userData } = await supabase.from("profiles").select("coins").eq("id", video.user_id).single();
    if (userData) {
      await supabase.from("profiles").update({ coins: userData.coins + coin }).eq("id", video.user_id);
    }
    setSavingId(null);
    await fetchVideos();
  };

  const handleReject = async (video) => {
    const note = notes[video.id] || "";
    setSavingId(video.id);
    const { error } = await supabase.from("marketing_videos").update({ status: "rejected", admin_note: note }).eq("id", video.id);
    if (error) { alert(error.message); setSavingId(null); return; }
    setSavingId(null);
    await fetchVideos();
  };

  if (loading) return <Loading text="Loading videos..." />;

  return (
    <div className="space-y-6">
      <SectionHeader title="Review Marketing Videos" count={`${videos.length} Videos`} onRefresh={fetchVideos} />

      {videos.length === 0 ? <EmptyState text="No videos submitted." /> : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {videos.map((video) => (
            <div key={video.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                      {video.platform === "TikTok" ? <Music size={12} className="inline" /> : <Youtube size={12} className="inline" />}
                      {video.platform}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(video.created_at).toLocaleString()}</span>
                  </div>

                  <a href={video.link} target="_blank" rel="noopener noreferrer" className="mt-3 block break-all text-sm font-bold text-blue-500 hover:underline">
                    {video.title || video.link}
                  </a>

                  <p className="mt-1 text-xs text-slate-400">User ID: {String(video.user_id).slice(0, 8)}...</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${video.status === "approved" ? "bg-emerald-50 text-emerald-600" : video.status === "rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>
                  {video.status === "approved" ? "Approved" : video.status === "rejected" ? "Rejected" : "Pending"}
                </span>
              </div>

              {/* Hiển thị các số liệu */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <p className="text-[10px] text-slate-400">View</p>
                  <p className="text-sm font-bold text-slate-800">{video.view_count || "—"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <p className="text-[10px] text-slate-400">Like</p>
                  <p className="text-sm font-bold text-slate-800">{video.like_count || "—"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <p className="text-[10px] text-slate-400">Cmt</p>
                  <p className="text-sm font-bold text-slate-800">{video.comment_count || "—"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <p className="text-[10px] text-slate-400">CTR</p>
                  <p className="text-sm font-bold text-slate-800">{video.ctr || "0%"}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <input type="number" value={coins[video.id] ?? ""} onChange={(e) => setCoins({ ...coins, [video.id]: e.target.value })} placeholder="Coin Award" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                <input type="text" value={notes[video.id] ?? ""} onChange={(e) => setNotes({ ...notes, [video.id]: e.target.value })} placeholder="Admin note" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>

              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => handleApprove(video)} disabled={savingId === video.id} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60">
                  {savingId === video.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve
                </button>
                <button type="button" onClick={() => handleReject(video)} disabled={savingId === video.id} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60">
                  {savingId === video.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function SectionHeader({ title, count, onRefresh }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-400">{count}</p>
      </div>
      <button type="button" onClick={onRefresh} className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">
        <RefreshCw size={14} /> Refresh
      </button>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="py-12 text-center"><p className="text-sm text-slate-400">{text}</p></div>;
}

function Loading({ text }) {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={24} className="animate-spin text-slate-400" />
      <span className="ml-2 text-sm text-slate-400">{text}</span>
    </div>
  );
                    }
