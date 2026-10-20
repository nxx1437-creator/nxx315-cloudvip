import React from "react";
import { useOutletContext } from "react-router-dom";
import useSession from "../../hooks/useSession.js";
import { Card, Eyebrow, ChannelLinkCard } from "../../components/creator/creatorUi.jsx";

export default function CreatorSettings() {
  const { ov, reload } = useOutletContext();
  const { session } = useSession();
  const by = Object.fromEntries((ov?.channels || []).map((c) => [c.platform, c]));

  return (
    <>
      <div className="px-1">
        <Eyebrow>▸ Settings</Eyebrow>
        <h1 className="mt-1 text-3xl font-extrabold text-white">Cài đặt</h1>
        <p className="mt-1 text-sm text-slate-400">Liên kết kênh và thông tin tài khoản.</p>
      </div>

      <Eyebrow className="px-1">▸ Kênh liên kết</Eyebrow>
      <ChannelLinkCard platform="youtube" channel={by.youtube} onChanged={reload} />
      <ChannelLinkCard platform="tiktok" channel={by.tiktok} onChanged={reload} />

      <Card>
        <Eyebrow>▸ Tài khoản</Eyebrow>
        <div className="mt-4">
          <Eyebrow>Email hiện tại</Eyebrow>
          <p className="mt-1 break-all font-mono text-sm text-white">{session?.user?.email}</p>
        </div>
        <div className="mt-4">
          <Eyebrow>Điểm mỗi video được duyệt</Eyebrow>
          <p className="mt-1 font-mono text-sm text-white">100 điểm</p>
        </div>
      </Card>
    </>
  );
      }
