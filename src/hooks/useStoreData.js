import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

/**
 * useStoreData
 * -----------------------------------------------------------------
 * Lấy danh sách gói Robux đang bán + lịch sử đơn của người dùng.
 * Tự refetch khi tab được focus lại (đồng bộ với useProfile/useTasks).
 * -----------------------------------------------------------------
 */
export function useStoreData(userId) {
  const [packages, setPackages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [{ data: pkgs }, { data: ords }] = await Promise.all([
      supabase
        .from("redemption_packages")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      userId
        ? supabase
            .from("redemption_orders")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);
    setPackages(pkgs ?? []);
    setOrders(ords ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchAll();
    const onFocus = () => fetchAll();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [fetchAll]);

  return { packages, orders, loading, refetch: fetchAll };
}
