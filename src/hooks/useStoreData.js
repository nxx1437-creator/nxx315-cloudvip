import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

/**
 * useStoreData — lấy danh sách gói Robux đang bán + lịch sử đơn.
 * Tự động tải lại khi quay lại tab.
 */
export function useStoreData(userId) {
  const [packages, setPackages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);

  const fetchAll = useCallback(async () => {
    const isFirstLoad = !hasLoadedOnce.current;
    if (isFirstLoad) {
      setLoading(true);
    }
    try {
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
    } finally {
      if (isFirstLoad) {
        setLoading(false);
        hasLoadedOnce.current = true;
      }
    }
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
