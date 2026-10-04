import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

let configCache = null;

async function loadConfig() {
  if (configCache) return configCache;
  const { data, error } = await supabase
    .from("level_config")
    .select("level, coins_required, task_bonus, label")
    .order("level", { ascending: true });
  if (error) throw error;
  configCache = data || [];
  return configCache;
}

// Cấp độ thật (user_levels + level_config) và tiến độ lên cấp tiếp theo
export default function useLevelProgress(userId) {
  const [state, setState] = useState({ loading: true, data: null });

  useEffect(() => {
    if (!userId) {
      setState({ loading: false, data: null });
      return;
    }
    let alive = true;

    (async () => {
      try {
        const [config, { data: ul }] = await Promise.all([
          loadConfig(),
          supabase
            .from("user_levels")
            .select("current_level, lifetime_coins")
            .eq("user_id", userId)
            .maybeSingle(),
        ]);

        const level = ul?.current_level || 1;
        const lifetime = Number(ul?.lifetime_coins) || 0;
        const cur = config.find((l) => l.level === level) || config[0];
        const next = config.find((l) => l.level === level + 1) || null;

        let pct = 100;
        let remain = 0;
        if (next && cur) {
          const span = next.coins_required - cur.coins_required;
          pct = span > 0 ? ((lifetime - cur.coins_required) / span) * 100 : 100;
          pct = Math.max(0, Math.min(100, Math.round(pct)));
          remain = Math.max(0, next.coins_required - lifetime);
        }

        if (alive) {
          setState({
            loading: false,
            data: {
              level,
              label: cur?.label || "",
              bonus: cur?.task_bonus || 0,
              lifetime,
              next,
              nextCoins: next?.coins_required || 0,
              pct,
              remain,
            },
          });
        }
      } catch (err) {
        console.warn("[useLevelProgress] lỗi:", err);
        if (alive) setState({ loading: false, data: null });
      }
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  return state;
  }
