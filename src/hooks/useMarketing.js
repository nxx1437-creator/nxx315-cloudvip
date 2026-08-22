import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.js";

export function useMarketing(userId, isAdmin = false) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("marketing_videos").select("*");
    
    if (isAdmin) {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.eq("user_id", userId).order("created_at", { ascending: false });
    }

    const { data } = await query;
    setVideos(data ?? []);
    setLoading(false);
  }, [userId, isAdmin]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { videos, loading, fetchVideos };
}
