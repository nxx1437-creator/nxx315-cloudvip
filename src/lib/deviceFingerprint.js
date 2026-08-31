import FingerprintJS from "@fingerprintjs/fingerprintjs";

let cachedFingerprint = null;

export async function getDeviceFingerprint() {
  if (cachedFingerprint) return cachedFingerprint;

  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    cachedFingerprint = result.visitorId;
    return cachedFingerprint;
  } catch (error) {
    console.error("Fingerprint error:", error);
    return null;
  }
}

export async function getPublicIp() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip || null;
  } catch (error) {
    console.error("IP fetch error:", error);
    return null;
  }
}
