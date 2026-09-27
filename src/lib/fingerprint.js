import FingerprintJS from "@fingerprintjs/fingerprintjs";

let fpPromise = null;

export async function getFingerprint() {
  if (!fpPromise) {
    fpPromise = (async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      return result.visitorId;
    })();
  }
  return fpPromise;
}
