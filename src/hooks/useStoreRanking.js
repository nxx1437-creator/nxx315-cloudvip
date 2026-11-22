import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { GAMES } from "../lib/storeData.js";

// Số game đứng đầu được gắn HOT (chỉ tính game có điểm > 0)
export const HOT_TOP_N = 3;

const CACHE_MS = 60 * 1000;
let cache = null;
let cacheAt = 0;

// "/store/free-fire" -> "free-fire" (khớp game_key trong get_store_ranking)
export const gameKeyOf = (game) =>
  String(game?.path || "")
    .split("/")
    .filter(Boolean)
    .pop() || "";

// Sắp theo điểm giảm dần, bằng điểm thì giữ thứ tự gốc trong GAMES.
// Chưa có dữ liệu (hoặc mọi điểm = 0) thì trả nguyên danh sách gốc.
export function rankGames(games, ranking, topN = HOT_TOP_N) {
  if (!Array.isArray(ranking) || ranking.length === 0) return games;

  const byKey = new Map(ranking.map((r) => [r.game_key, r]));
  const scored = games.map((game, index) => {
    const r = byKey.get(gameKeyOf(game));
    return {
      game,
      index,
      score: Number(r?.score) || 0,
      views: Number(r?.views) || 0,
      orders: Number(r?.orders) || 0,
    };
  });

  if (!scored.some((s) => s.score > 0)) return games;

  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  return scored.map((s, i) => ({
    ...s.game,
    hot: s.score > 0 && i < topN,
    rank: i + 1,
    score: s.score,
    views: s.views,
    orders: s.orders,
  }));
}

// Ghi 1 lượt bấm xem lên Supabase (lỗi thì bỏ qua)
export async function trackStoreGameView(gameKey) {
  if (!gameKey) return;
  try {
    await supabase.rpc("track_store_game_view", { p_game_key: gameKey });
  } catch {
    // bỏ qua
  }
}

export default function useStoreRanking() {
  const [ranking, setRanking] = useState(cache);

  useEffect(() => {
    if (cache && Date.now() - cacheAt < CACHE_MS) return undefined;

    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase.rpc("get_store_ranking");
        if (error || !Array.isArray(data)) return;
        cache = data;
        cacheAt = Date.now();
        if (alive) setRanking(data);
      } catch {
        // lỗi mạng: giữ thứ tự và cờ hot mặc định
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return useMemo(() => rankGames(GAMES, ranking), [ranking]);
    }
