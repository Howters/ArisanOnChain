import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export async function initWaitlistTable() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        whatsapp VARCHAR(50) NOT NULL,
        kota VARCHAR(100) NOT NULL,
        peran VARCHAR(50) NOT NULL,
        ukuran_grup VARCHAR(50),
        alasan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    client.release();
  }
}

export interface WaitlistEntry {
  nama: string;
  email: string;
  whatsapp: string;
  kota: string;
  peran: string;
  ukuranGrup?: string;
  alasan?: string;
}

export async function addToWaitlist(entry: WaitlistEntry): Promise<{ success: boolean; id?: number; error?: string }> {
  const client = await getPool().connect();
  try {
    await initWaitlistTable();
    
    const result = await client.query(
      `INSERT INTO waitlist (nama, email, whatsapp, kota, peran, ukuran_grup, alasan)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [entry.nama, entry.email, entry.whatsapp, entry.kota, entry.peran, entry.ukuranGrup || null, entry.alasan || null]
    );
    
    return { success: true, id: result.rows[0].id };
  } catch (error: any) {
    if (error.code === "23505") {
      return { success: false, error: "Email sudah terdaftar dalam waiting list" };
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function getWaitlistStats(): Promise<{
  total: number;
  byRole: { admin: number; member: number };
  recentSignups: number;
}> {
  const client = await getPool().connect();
  try {
    const result = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE LOWER(peran) LIKE '%admin%' OR LOWER(peran) LIKE '%keduanya%') as admin_count,
        COUNT(*) FILTER (WHERE peran = 'Anggota') as member_count,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as recent_count
      FROM waitlist
    `);
    
    const row = result.rows[0];
    
    return {
      total: parseInt(row.total, 10),
      byRole: {
        admin: parseInt(row.admin_count, 10),
        member: parseInt(row.member_count, 10),
      },
      recentSignups: parseInt(row.recent_count, 10),
    };
  } finally {
    client.release();
  }
}

export async function initProfileTable() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        wallet_address VARCHAR(42) PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        whatsapp VARCHAR(50) NOT NULL,
        kota VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    client.release();
  }
}

export interface UserProfile {
  walletAddress: string;
  nama: string;
  whatsapp: string;
  kota?: string;
}

export async function getProfile(walletAddress: string): Promise<UserProfile | null> {
  const client = await getPool().connect();
  try {
    await initProfileTable();
    const result = await client.query(
      "SELECT wallet_address, nama, whatsapp, kota FROM user_profiles WHERE wallet_address = $1",
      [walletAddress.toLowerCase()]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      walletAddress: row.wallet_address,
      nama: row.nama,
      whatsapp: row.whatsapp,
      kota: row.kota,
    };
  } finally {
    client.release();
  }
}

export async function upsertProfile(profile: UserProfile): Promise<{ success: boolean; error?: string }> {
  const client = await getPool().connect();
  try {
    await initProfileTable();
    await client.query(
      `INSERT INTO user_profiles (wallet_address, nama, whatsapp, kota, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (wallet_address) 
       DO UPDATE SET nama = $2, whatsapp = $3, kota = $4, updated_at = NOW()`,
      [profile.walletAddress.toLowerCase(), profile.nama, profile.whatsapp, profile.kota || null]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

export async function getProfilesByAddresses(addresses: string[]): Promise<Map<string, UserProfile>> {
  if (addresses.length === 0) return new Map();
  const client = await getPool().connect();
  try {
    await initProfileTable();
    const lowerAddresses = addresses.map(a => a.toLowerCase());
    const placeholders = lowerAddresses.map((_, i) => `$${i + 1}`).join(", ");
    const result = await client.query(
      `SELECT wallet_address, nama, whatsapp, kota FROM user_profiles WHERE wallet_address IN (${placeholders})`,
      lowerAddresses
    );
    const profiles = new Map<string, UserProfile>();
    result.rows.forEach((row: any) => {
      profiles.set(row.wallet_address, {
        walletAddress: row.wallet_address,
        nama: row.nama,
        whatsapp: row.whatsapp,
        kota: row.kota,
      });
    });
    return profiles;
  } finally {
    client.release();
  }
}

export default getPool;
