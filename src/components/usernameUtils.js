const CHANGE_COOLDOWN_DAYS = 7;
const COOLDOWN_MS = CHANGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

/**
 * Kiểm tra user có thể đổi tên không
 * @returns { canChange, nextChangeDate, remainingDays, remainingText }
 */
export function checkUsernameChangeAllowed(lastChangeISO) {
  if (!lastChangeISO) {
    return {
      canChange: true,
      nextChangeDate: null,
      remainingDays: 0,
      remainingText: "",
    };
  }

  const lastChange = new Date(lastChangeISO).getTime();
  const nextChange = lastChange + COOLDOWN_MS;
  const now = Date.now();

  if (now >= nextChange) {
    return {
      canChange: true,
      nextChangeDate: null,
      remainingDays: 0,
      remainingText: "",
    };
  }

  const remainingMs = nextChange - now;
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

  return {
    canChange: false,
    nextChangeDate: new Date(nextChange),
    remainingDays,
    remainingText: formatRemaining(remainingMs),
  };
}

function formatRemaining(ms) {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);

  if (days > 0) return `${days} ngày ${hours} giờ`;
  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  return `${minutes} phút`;
}

export { CHANGE_COOLDOWN_DAYS };
