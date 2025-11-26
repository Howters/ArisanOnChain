export const CONTRACTS = {
  MOCK_IDRX: process.env.NEXT_PUBLIC_MOCK_IDRX_ADDRESS as `0x${string}`,
  DEBT_NFT: process.env.NEXT_PUBLIC_DEBT_NFT_ADDRESS as `0x${string}`,
  FACTORY: process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`,
} as const;

export const CHAIN_CONFIG = {
  chainId: 11155111,
  name: "Sepolia",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia.org",
  blockExplorer: "https://sepolia.etherscan.io",
} as const;

export const PAYMENT_METHODS = [
  { id: "qris", name: "QRIS", icon: "/icons/qris.svg" },
  { id: "gopay", name: "GoPay", icon: "/icons/gopay.svg" },
  { id: "bca", name: "Bank BCA", icon: "/icons/bca.svg" },
  { id: "mandiri", name: "Bank Mandiri", icon: "/icons/mandiri.svg" },
] as const;

export const POOL_STATUS = {
  Pending: { label: "Menunggu", color: "warning" },
  Active: { label: "Aktif", color: "success" },
  Completed: { label: "Selesai", color: "muted" },
  Cancelled: { label: "Dibatalkan", color: "destructive" },
} as const;

export const MEMBER_STATUS = {
  Pending: { label: "Menunggu Persetujuan", color: "warning" },
  Approved: { label: "Disetujui", color: "primary" },
  Active: { label: "Aktif", color: "success" },
  Defaulted: { label: "Gagal Bayar", color: "destructive" },
  Removed: { label: "Dikeluarkan", color: "muted" },
} as const;

export const UI_TEXT = {
  appName: "ArisanAman",
  tagline: "Arisan digital yang aman dan transparan",
  topUp: "Top Up Saldo",
  balance: "Saldo IDRX",
  contribution: "Setor Iuran",
  securityDeposit: "Uang Jaminan",
  pool: "Lingkaran",
  member: "Anggota",
  pending: "Menunggu Persetujuan",
  winner: "Pemenang",
  round: "Periode",
  vouch: "Jaminan Sosial",
  simulationWarning: "⚠️ INI SIMULASI - Dana tidak nyata",
  createPool: "Buat Arisan Baru",
  joinPool: "Gabung Arisan",
  myCircles: "Arisan Saya",
  profile: "Profil",
  settings: "Pengaturan",
  logout: "Keluar",
} as const;


