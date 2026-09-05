const VAPID_PUBLIC_KEY = "BK3zEmel56jjZbov-6dABwVjl12PFpnuRPKRprkUWWxBZ8kaL5dYXfYWt0-5IB6He9higlQg2gqNor1auPgtU1k";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export async function getPushPermissionState() {
  if (!(await isPushSupported())) return "unsupported";
  return Notification.permission;
}

export async function subscribeToPush() {
  if (!(await isPushSupported())) {
    throw new Error("Trình duyệt này không hỗ trợ thông báo đẩy.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Bạn chưa cho phép nhận thông báo.");
  }

  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  return subscription.toJSON();
}

export async function unsubscribeFromPush() {
  if (!(await isPushSupported())) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();
  }
}
