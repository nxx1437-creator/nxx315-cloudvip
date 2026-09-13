import { supabase } from "./supabaseClient";

export async function broadcastNotification({ title, body, url, category }) {
  const { data, error } = await supabase.functions.invoke("broadcast-notification", {
    body: { title, body, url, category },
  });

  if (error) throw error;
  return data;
}
