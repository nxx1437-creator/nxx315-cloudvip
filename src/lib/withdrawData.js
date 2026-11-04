export const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const STORAGE_BUCKET = "game_logos";

export const getImageUrl = (file) =>
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${file}`;

// Các con số này phải khớp với máy chủ
// (edge function request-withdrawal + RPC request_withdrawal_encrypted)
export const FEE = 500;
export const MIN_BANK = 10000;
export const MIN_WALLET = 5000;
export const MAX_AMOUNT = 500000;
export const MAX_PER_DAY = 500000;
export const MAX_TIMES_PER_DAY = 5;

export const minFor = (type) => (type === "bank" ? MIN_BANK : MIN_WALLET);

export const BANKS = [
  { code: "VCB", name: "Vietcombank", logo: "vcb.png" },
  { code: "TCB", name: "Techcombank", logo: "tcb.png" },
  { code: "MB", name: "MB Bank", logo: "mb.png" },
  { code: "VPB", name: "VPBank", logo: "vpb.png" },
  { code: "TPB", name: "TPBank", logo: "tpb.png" },
  { code: "ACB", name: "ACB", logo: "acb.png" },
  { code: "BIDV", name: "BIDV", logo: "bidv.png" },
  { code: "VTB", name: "VietinBank", logo: "vtb.png" },
  { code: "STB", name: "Sacombank", logo: "stb.png" },
  { code: "EIB", name: "Eximbank", logo: "eib.png" },
  { code: "OCB", name: "OCB", logo: "ocb.png" },
  { code: "MSB", name: "MSB", logo: "msb.png" },
  { code: "HDB", name: "HDBank", logo: "hdb.png" },
  { code: "SEAB", name: "SeABank", logo: "seab.png" },
  { code: "NAB", name: "Nam A Bank", logo: "nab.png" },
];

export const TOP_BANKS = ["VCB", "TCB", "MB", "BIDV", "VPB", "ACB", "VTB", "TPB"];

// Máy chủ chỉ nhận MoMo và ZaloPay
export const WALLETS = [
  { id: "momo", name: "MoMo", logo: "momo.png", color: "#A50064" },
  { id: "zalopay", name: "ZaloPay", logo: "zalopay.png", color: "#0068FF" },
];

export const QUICK_AMOUNTS = [5000, 10000, 20000, 50000, 100000, 200000, 500000];

export function formatMoney(v) {
  return new Intl.NumberFormat("vi-VN").format(Number(v || 0)) + "đ";
}

export const getBankInfo = (code) => BANKS.find((b) => b.code === code);
export const getWalletInfo = (id) => WALLETS.find((w) => w.id === id);

// Máy chủ tính "hôm nay" theo giờ UTC (7:00 sáng giờ Việt Nam)
export function startOfServerDay() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
