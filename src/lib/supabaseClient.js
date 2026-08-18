import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Helps catch a missing .env file early instead of a confusing runtime error later.
  console.error(
    "Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY. " +
      "Kiểm tra file .env ở thư mục gốc (xem .env.example)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
