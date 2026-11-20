// src/hooks/useProfileExtras.js — ảnh bìa + huy hiệu ĐÃ ĐẠT cho hồ sơ của chính mình
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { uploadCover } from "../lib/coverUpload.js";
import { getBadges } from "../lib/profileBadges.js";

export default function useProfileExtras(session, profile = {}, userLevel) {
  const uid = session?.user?.id;
  const [stats, setStats] = useState(undefined); // undefined = đang tải
  const [coverUrl, setCoverUrl] = useState(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverErr, setCoverErr] = useState("");

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    (async () => {
      const { data, error } = await supabase.rpc("get_public_profile", { p_user_id: uid });
      if (alive) setStats(error ? null : data);
    })();
    return () => {
      alive = false;
    };
  }, [uid]);

  const pickCover = async (file) => {
    if (!file || !uid) return;
    setCoverErr("");
    setCoverBusy(true);
    try {
      setCoverUrl(await uploadCover(uid, file));
    } catch (err) {
      setCoverErr(err.message || "Không đổi được ảnh bìa.");
    } finally {
      setCoverBusy(false);
    }
  };

  const badges =
    stats === undefined
      ? []
      : getBadges({
          ...(stats || {}),
          is_verified: profile.is_verified ?? stats?.is_verified,
          level: profile.level ?? stats?.level,
          streak_days: profile.streak_days ?? stats?.streak_days,
          streak_record: profile.streak_record ?? stats?.streak_record,
          referrals_count: profile.referrals_count ?? stats?.referrals_count,
          joined_at: profile.created_at || session?.user?.created_at,
          lifetime_coins: userLevel?.lifetime_coins ?? stats?.lifetime_coins,
        }).filter((b) => b.earned); // chưa đạt thì ẩn

  return {
    cover: coverUrl || stats?.cover_url || profile.cover_url || null,
    coverBusy,
    coverErr,
    pickCover,
    badges,
  };
    }
