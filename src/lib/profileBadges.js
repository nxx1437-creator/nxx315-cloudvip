import { BadgeCheck, CalendarCheck, Coins, Flame, Gift, Star, Trophy, Zap } from "lucide-react";

const DAY = 86400000;
const num = (v) => Number(v) || 0;

// cur/goal dùng để hiện tiến độ ở huy hiệu chưa đạt
const mk = (id, name, desc, Icon, grad, cur, goal = 1) => ({
  id, name, desc, Icon, grad, cur, goal, earned: cur >= goal,
});

export function getBadges(s = {}) {
  const days = s.joined_at ? Math.floor((Date.now() - new Date(s.joined_at).getTime()) / DAY) : 0;
  const streak = Math.max(num(s.streak_record), num(s.streak_days));
  const coins = num(s.lifetime_coins);
  const tasks = num(s.tasks_done);

  return [
    mk("verified", "Đã xác minh", "Tài khoản được NXX xác minh.", BadgeCheck, "from-sky-400 to-blue-600", s.is_verified === true ? 1 : 0),
    mk("tasks5", "Khởi động", "Hoàn thành 5 nhiệm vụ.", Zap, "from-violet-400 to-purple-600", tasks, 5),
    mk("tasks25", "Chăm chỉ", "Hoàn thành 25 nhiệm vụ.", Zap, "from-fuchsia-400 to-pink-600", tasks, 25),
    mk("tasks50", "Cao thủ nhiệm vụ", "Hoàn thành 50 nhiệm vụ.", Trophy, "from-amber-300 to-orange-500", tasks, 50),
    mk("streak3", "Chuỗi 3 ngày", "Hoạt động liên tục 3 ngày.", Flame, "from-orange-400 to-red-500", streak, 3),
    mk("streak7", "Chuỗi 7 ngày", "Hoạt động liên tục 7 ngày.", Flame, "from-red-400 to-rose-600", streak, 7),
    mk("coin10k", "10.000 coin", "Kiếm tổng cộng 10.000 coin.", Coins, "from-yellow-300 to-amber-500", coins, 10000),
    mk("coin100k", "100.000 coin", "Kiếm tổng cộng 100.000 coin.", Coins, "from-emerald-400 to-green-600", coins, 100000),
    mk("coin500k", "500.000 coin", "Kiếm tổng cộng 500.000 coin.", Trophy, "from-teal-400 to-cyan-600", coins, 500000),
    mk("lv5", "Cấp 5", "Đạt cấp độ 5.", Star, "from-indigo-400 to-blue-600", num(s.level) || 1, 5),
    mk("ref3", "Truyền cảm hứng", "Mời thành công 3 bạn bè.", Gift, "from-pink-400 to-rose-500", num(s.referrals_count), 3),
    mk("veteran", "Thành viên lâu năm", "Đồng hành cùng NXX hơn 30 ngày.", CalendarCheck, "from-slate-400 to-slate-600", days, 30),
  ];
       }
