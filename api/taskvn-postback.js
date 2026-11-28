// Không dùng nữa: Postback Taskvn được xử lý bằng Supabase Edge Function
// supabase/functions/taskvn-postback (vercel.json chuyển tiếp /taskvn-postback sang đó).
export default function handler(req, res) {
  res.status(404).send("not found");
}
