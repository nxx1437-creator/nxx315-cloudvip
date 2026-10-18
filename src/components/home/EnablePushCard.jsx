import React, { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { useI18n } from "../../i18n/index.js";

const DISMISS_KEY = "nxx315_push_dismissed";

const isSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

function urlBase64ToUint8Array(b64) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// Dùng service worker đã có, nếu chưa có thì đăng ký push-sw.js
async function getRegistration() {
  const existing = await navigator.serviceWorker.getRegistration();
  if (!existing) await navigator.serviceWorker.register("/push-sw.js");
  return navigator.serviceWorker.ready;
}

async function saveSubscription(userId, sub) {
  const j = sub.toJSON();
  const { data } = await supabase
    .from("push_subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("endpoint", j.endpoint)
    .maybeSingle();
  if (data) return;
  await supabase.from("push_subscriptions").insert({
    user_id: userId,
    endpoint: j.endpoint,
    p256dh: j.keys.p256dh,
    auth: j.keys.auth,
  });
}

export default function EnablePushCard({ userId }) {
  const { lang } = useI18n();
  const en = lang === "en";
  const [state, setState] = useState("checking"); // checking | ask | done | hidden
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!userId) return;
    let alive = true;

    if (!isSupported() || Notification.permission === "denied") {
      setState("hidden");
      return;
    }
    try {
      if (localStorage.getItem(DISMISS_KEY)) {
        setState("hidden");
        return;
      }
    } catch {}

    navigator.serviceWorker
      .getRegistration()
      .then(async (reg) => {
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        if (sub && Notification.permission === "granted") {
          await saveSubscription(userId, sub); // đảm bảo gắn với tài khoản này
          if (alive) setState("done");
        } else if (alive) {
          setState("ask");
        }
      })
      .catch(() => alive && setState("ask"));

    return () => {
      alive = false;
    };
  }, [userId]);

  if (state !== "ask") return null;

  const enable = async () => {
    setBusy(true);
    setErr("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        if (perm === "denied") setState("hidden");
        return;
      }

      const { data, error } = await supabase.functions.invoke("get-vapid-key");
      if (error || !data?.key) throw new Error("no-key");

      const reg = await getRegistration();
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(data.key),
        });
      }
      await saveSubscription(userId, sub);
      setState("done");

      // Gửi thử 1 thông báo để người dùng thấy đã hoạt động
      supabase.functions
        .invoke("send-push", {
          body: {
            title: en ? "Notifications enabled" : "Đã bật thông báo",
            body: en
              ? "We'll remind you when new tasks are available."
              : "Bạn sẽ nhận nhắc khi có nhiệm vụ mới.",
            url: "/tasks",
          },
        })
        .catch(() => {});
    } catch (e) {
      setErr(en ? "Could not enable, please try again." : "Chưa bật được, thử lại nhé.");
    } finally {
      setBusy(false);
    }
  };

  const later = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setState("hidden");
  };

  return (
    <div className="rounded-xl border border-[#E6E6E6] bg-white p-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3ECF8E]/15">
          <Bell size={18} className="text-[#0F7A4D]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-[#171717]">
            {en ? "Turn on notifications" : "Bật thông báo"}
          </p>
          <p className="text-[11.5px] leading-snug text-[#6F6F6F]">
            {en
              ? "Get reminded when new tasks are available."
              : "Nhắc khi có nhiệm vụ mới và khi lượt nhiệm vụ đã hồi."}
          </p>
        </div>
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-[#24B47E] bg-[#3ECF8E] px-3.5 text-[13px] font-medium text-[#0B1F17] transition active:scale-[0.98] disabled:opacity-60"
        >
          {busy && <Loader2 size={13} className="animate-spin" />}
          {en ? "Turn on" : "Bật"}
        </button>
      </div>
      {err && <p className="mt-2 text-xs text-rose-600">{err}</p>}
      <button
        type="button"
        onClick={later}
        className="mt-1.5 block w-full text-right text-[11px] text-[#9A9A9A]"
      >
        {en ? "Not now" : "Để sau"}
      </button>
    </div>
  );
    }
