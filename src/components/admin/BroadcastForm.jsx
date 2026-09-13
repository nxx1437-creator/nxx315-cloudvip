import { useState } from "react";
import { broadcastNotification } from "../../lib/notify";

const CATEGORIES = [
  { value: "system", label: "Hệ thống" },
  { value: "promo", label: "Khuyến mãi" },
  { value: "rewards", label: "Phần thưởng" },
  { value: "orders", label: "Đơn hàng" },
];

export default function BroadcastForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("system");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async () => {
    if (!title.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await broadcastNotification({ title: title.trim(), body: body.trim(), url: url.trim(), category });
      setResult(`Đã gửi cho ${res.notified} người, push tới ${res.pushed} thiết bị.`);
      setTitle("");
      setBody("");
      setUrl("");
    } catch (err) {
      setResult("Lỗi: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-slate-800">Gửi thông báo hàng loạt</h3>

      <select value={category} onChange={(e) => setCategory(e.target.value)} className="mb-2 w-full rounded-xl border border-slate-200 p-2 text-sm">
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" className="mb-2 w-full rounded-xl border border-slate-200 p-2 text-sm" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Nội dung (không bắt buộc)" rows={2} className="mb-2 w-full rounded-xl border border-slate-200 p-2 text-sm" />
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link khi bấm vào (không bắt buộc)" className="mb-3 w-full rounded-xl border border-slate-200 p-2 text-sm" />

      <button onClick={handleSend} disabled={sending || !title.trim()} className="w-full rounded-xl bg-sky-500 py-2 text-sm font-bold text-white disabled:opacity-50">
        {sending ? "Đang gửi..." : "Gửi thông báo"}
      </button>

      {result && <p className="mt-2 text-xs text-slate-500">{result}</p>}
    </div>
  );
      }
