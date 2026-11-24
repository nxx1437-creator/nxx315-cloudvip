import { registerSW } from "virtual:pwa-register";

let updateFn = null;
let ready = false;
const listeners = new Set();

export function initUpdater() {
  updateFn = registerSW({
    immediate: true,
    onNeedRefresh() {
      ready = true;
      listeners.forEach((f) => f());
    },
    onRegisteredSW(_, reg) {
      // Hỏi SW mới mỗi 60s → tải ngầm bản mới
      if (reg) setInterval(() => reg.update().catch(() => {}), 60000);
    },
    onRegisterError: (e) => console.error(e),
  });
}
export const isUpdateReady = () => ready;
export const onUpdateReady = (f) => (listeners.add(f), () => listeners.delete(f));
export const applyUpdate = () => (updateFn ? updateFn(true) : window.location.reload());
