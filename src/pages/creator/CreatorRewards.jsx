import React from "react";
import { Loader2, Gift, Coins, Clock, Ticket } from "lucide-react";
import useSession from "../../hooks/useSession.js";
import { Card, Eyebrow, CodeBox, PLATFORMS, useMyVideos } from "../../components/creator/creatorUi.jsx";

function Stat({ icon: Icon, label, value }) {
  return (
    <Card className="!p-4">
      <div className="flex items-start justify-between">
        <Eyebrow>{label}</Eyebrow>
        <Icon size={18} className="text-slate-500" />
      </div>
      <p className="mt-3 text-3xl font-extrabold text-cyan-300">{value}</p>
    </Card>
  );
}

export default function CreatorRewards() {
  const { session } = useSession();
  const { items, loading } = useMyVideos(session?.user?.id);

  const approved = items.filter((i) => i.status === "approved" && i.gift_code);
  const totalCoins = approved.reduce((s, i) => s + (i.coins || 0), 0);
  const pending = items.filter((i) => i.status === "pending").length;

  return (
    <>
      <div className="px-1">
        <Eyebrow>▸ Rewards</Eyebrow>
        <h1 className="mt-1 text-3xl font-extrabold text-white">Lịch sử thưởng</h1>
        <p className="mt-1 text-sm text-slate-400">
          Mỗi video được duyệt nhận 1 code xu. Chép code rồi nhập ở Ví.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={Coins} label="Tổng xu thưởng" value={totalCoins.toLocaleString("vi-VN")} />
        <Stat icon={Ticket} label="Số code" value={approved.length} />
        <Stat icon={Clock} label="Đang xử lý" value={pending} />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={22} className="animate-spin text-cyan-400" />
        </div>
      ) : approved.length === 0 ? (
        <Card>
          <div className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center">
            <Gift size={34} className="mx-auto text-slate-500" />
            <p className="mt-3 text-lg font-bold text-white">Chưa có thưởng nào</p>
            <p className="mt-1 text-sm text-slate-400">
              Đăng video chất lượng lên TikTok/YouTube để bắt đầu nhận thưởng.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {approved.map((it) => (
            <Card key={it.id} className="!p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-bold text-white">
                  <span className={`h-2.5 w-2.5 rounded-full ${PLATFORMS[it.platform]?.dot}`} />
                  {PLATFORMS[it.platform]?.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {new Date(it.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <CodeBox code={it.gift_code} coins={it.coins} />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
