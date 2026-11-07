import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function usePendingCounts() {
  const [counts, setCounts] = useState({ orders: null, redeem: null, tickets: null, cards: null });

  const load = useCallback(async () => {
    try {
      const count = (table, apply) =>
        apply(supabase.from(table).select("id", { count: "exact", head: true }));

      const [paid, redeem, tickets, cards] = await Promise.all([
        count("orders", (q) => q.eq("status", "paid")),
        count("redemption_orders", (q) => q.eq("status", "pending")),
        count("support_tickets", (q) => q.eq("status", "open")),
        count("card_orders", (q) => q.in("status", ["pending", "needs_review"])),
      ]);

      const val = (r) => (r.error ? null : r.count || 0);
      setCounts({ orders: val(paid), redeem: val(redeem), tickets: val(tickets), cards: val(cards) });
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
