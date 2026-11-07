import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const COUNTS = {
  redeem: ["redemption_orders", (q) => q.eq("status", "pending")],
  game: ["orders", (q) => q.eq("status", "paid")],
  cards: ["card_orders", (q) => q.in("status", ["pending", "needs_review"])],
  withdrawals: ["withdrawals", (q) => q.in("status", ["pending", "processing"])],
  tickets: ["support_tickets", (q) => q.eq("status", "open")],
  posts: ["posts", (q) => q.eq("status", "pending")],
};

export default function usePendingCounts() {
  const [counts, setCounts] = useState({});

  const load = useCallback(async () => {
    try {
      const keys = Object.keys(COUNTS);
      const results = await Promise.all(
        keys.map((k) => {
          const [table, apply] = COUNTS[k];
          return apply(supabase.from(table).select("id", { count: "exact", head: true }));
        })
      );
      const next = {};
      keys.forEach((k, i) => {
        next[k] = results[i].error ? null : results[i].count || 0;
      });
      setCounts(next);
    } catch (err) {
      console.error("usePendingCounts:", err);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  return [counts, load];
}
