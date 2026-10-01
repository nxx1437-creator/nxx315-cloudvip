const FP_CDN = "https://openfpcdn.io/fingerprintjs/v4/iife.min.js";
const STORAGE_KEY = "nxx315_fingerprint";

let fpPromise = null;

function loadFingerprintJS() {
  if (fpPromise) return fpPromise;
  fpPromise = new Promise((resolve, reject) => {
    if (window.FingerprintJS) {
      resolve(window.FingerprintJS);
      return;
    }
    const script = document.createElement("script");
    script.src = FP_CDN;
    script.async = true;
    script.onload = () => {
      if (window.FingerprintJS) resolve(window.FingerprintJS);
      else reject(new Error("FingerprintJS không load được"));
    };
    script.onerror = () => reject(new Error("CDN load fail"));
    document.head.appendChild(script);
  });
  return fpPromise;
}

export async function getFingerprint() {
  let fp = localStorage.getItem(STORAGE_KEY);
  if (fp) return fp;
  const FP = await loadFingerprintJS();
  const fpInstance = await FP.load();
  const result = await fpInstance.get();
  fp = result.visitorId;
  localStorage.setItem(STORAGE_KEY, fp);
  return fp;
}
