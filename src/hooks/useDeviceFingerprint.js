import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient.js";

const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STORAGE_KEY = "nxx315_fingerprint";
const FP_CDN = "https://openfpcdn.io/fingerprintjs/v4/iife.min.js";

// Load FingerprintJS từ CDN (chỉ load 1 lần)
let fpPromise = null;

function loadFingerprintJS() {
  if (fpPromise) return fpPromise;

  fpPromise = new Promise((resolve, reject) => {
    // Nếu đã có sẵn
    if (window.FingerprintJS) {
      resolve(window.FingerprintJS);
      return;
    }

    const script = document.createElement("script");
    script.src = FP_CDN;
    script.async = true;
    script.onload = () => {
      if (window.FingerprintJS) {
        resolve(window.FingerprintJS);
      } else {
        reject(new Error("FingerprintJS không load được"));
      }
    };
    script.onerror = () => reject(new Error("CDN load fail"));
    document.head.appendChild(script);
  });

  return fpPromise;
}

export default function useDeviceFingerprint(userId, onBlocked) {
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!userId) return;
    if (checkedRef.current) return;
    checkedRef.current = true;

    const run = async () => {
      try {
        // 1. Lấy fingerprint (cache trong localStorage)
        let fingerprint = localStorage.getItem(STORAGE_KEY);

        if (!fingerprint) {
          const FP = await loadFingerprintJS();
          const fp = await FP.load();
          const result = await fp.get();
          fingerprint = result.visitorId;
          localStorage.setItem(STORAGE_KEY, fingerprint);
        }

        // 2. Lấy thông tin thiết bị
        const userAgent = navigator.userAgent;
        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // 3. Gọi Edge Function
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) return;

        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/check-device`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
              apikey: SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              fingerprint,
              user_agent: userAgent,
              screen_resolution: screenResolution,
              timezone,
            }),
          }
        );

        const data = await res.json();

        if (data.allowed === false) {
          console.warn("[Fingerprint] Blocked:", data.reason);
          if (onBlocked) onBlocked(data.reason);
        }
      } catch (err) {
        console.error("[Fingerprint] Error:", err);
      }
    };

    run();
  }, [userId, onBlocked]);
            }
