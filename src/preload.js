/**
 * Preload các chunk của BottomNav & các trang hay dùng.
 * Chạy khi browser rảnh → lần đầu bấm vào gần như tức thì.
 */
export function preloadRoutes() {
  const idle =
    typeof window !== "undefined" && window.requestIdleCallback
      ? window.requestIdleCallback
      : (cb) => setTimeout(cb, 200);

  idle(() => {
    // BottomNav chính
    import("./pages/Dashboard.jsx");
    import("./pages/Tasks.jsx");
    import("./pages/Store.jsx");
    import("./pages/Profile.jsx");

    // Trang phụ hay vào
    import("./pages/Wallet.jsx");
    import("./pages/Invite.jsx");
    import("./pages/Level.jsx");
    import("./pages/Notifications.jsx");
    import("./pages/History.jsx");
    import("./pages/Leaderboard.jsx");
    import("./pages/MiniGames.jsx");
  });
}

/**
 * Preload 1 trang cụ thể khi hover / touch BottomNav.
 * Dùng: onMouseEnter={() => preloadOne("Tasks")}
 */
const registry = {
  Dashboard: () => import("./pages/Dashboard.jsx"),
  Tasks: () => import("./pages/Tasks.jsx"),
  Store: () => import("./pages/Store.jsx"),
  Profile: () => import("./pages/Profile.jsx"),
  Wallet: () => import("./pages/Wallet.jsx"),
  Invite: () => import("./pages/Invite.jsx"),
  Level: () => import("./pages/Level.jsx"),
  Notifications: () => import("./pages/Notifications.jsx"),
  History: () => import("./pages/History.jsx"),
  Leaderboard: () => import("./pages/Leaderboard.jsx"),
  MiniGames: () => import("./pages/MiniGames.jsx"),
};

export function preloadOne(name) {
  const fn = registry[name];
  if (fn) fn();
}
