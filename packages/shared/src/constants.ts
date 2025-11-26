export const CHAIN_IDS = {
  SEPOLIA: 11155111,
  LISK_SEPOLIA: 4202,
  LOCALHOST: 31337,
} as const;

export const POOL_STATUS_LABELS: Record<string, string> = {
  Pending: "Menunggu",
  Active: "Aktif",
  Completed: "Selesai",
  Cancelled: "Dibatalkan",
};

export const MEMBER_STATUS_LABELS: Record<string, string> = {
  None: "Tidak Terdaftar",
  Pending: "Menunggu Persetujuan",
  Approved: "Disetujui",
  Active: "Aktif",
  Defaulted: "Gagal Bayar",
  Removed: "Dikeluarkan",
};

export const MIN_POOL_MEMBERS = 3;
export const MAX_POOL_MEMBERS = 100;

export const FAUCET_AMOUNT = 1_000_000;
export const FAUCET_COOLDOWN_SECONDS = 86400;


