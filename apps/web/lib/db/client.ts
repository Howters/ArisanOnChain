import { Pool } from "pg";

// Initialize PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

// Types
export interface UserProfile {
  walletAddress: string;
  nama: string;
  whatsapp: string;
  kota?: string;
}

export interface WaitlistEntry {
  nama: string;
  email: string;
  whatsapp: string;
  kota: string;
  peran: string;
}

// Initialize tables
async function initTables() {
  try {
    const client = await pool.connect();
    try {
      // User profiles table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          wallet_address TEXT PRIMARY KEY,
          nama TEXT NOT NULL,
          whatsapp TEXT NOT NULL,
          kota TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Waitlist table
      await client.query(`
        CREATE TABLE IF NOT EXISTS waitlist (
          id SERIAL PRIMARY KEY,
          nama TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          whatsapp TEXT NOT NULL,
          kota TEXT NOT NULL,
          peran TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create index on email for faster lookups
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email)
      `);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error initializing tables:", error);
  }
}

// Initialize tables on module load
initTables();

// User Profile Functions
export async function getProfile(
  walletAddress: string
): Promise<UserProfile | null> {
  try {
    const result = await pool.query(
      "SELECT * FROM user_profiles WHERE wallet_address = $1",
      [walletAddress]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      walletAddress: row.wallet_address,
      nama: row.nama,
      whatsapp: row.whatsapp,
      kota: row.kota,
    };
  } catch (error) {
    console.error("Error getting profile:", error);
    throw error;
  }
}

export async function upsertProfile(profile: UserProfile): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await pool.query(
      `
        INSERT INTO user_profiles (wallet_address, nama, whatsapp, kota, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT(wallet_address) DO UPDATE SET
          nama = excluded.nama,
          whatsapp = excluded.whatsapp,
          kota = excluded.kota,
          updated_at = NOW()
      `,
      [profile.walletAddress, profile.nama, profile.whatsapp, profile.kota || null]
    );

    return { success: true };
  } catch (error) {
    console.error("Error upserting profile:", error);
    return {
      success: false,
      error: "Failed to save profile",
    };
  }
}

export async function getProfilesByAddresses(
  addresses: string[]
): Promise<Map<string, UserProfile>> {
  if (addresses.length === 0) {
    return new Map();
  }

  try {
    const lowercaseAddresses = addresses.map(addr => addr.toLowerCase());
    const placeholders = lowercaseAddresses.map((_, i) => `$${i + 1}`).join(",");
    const result = await pool.query(
      `SELECT * FROM user_profiles WHERE LOWER(wallet_address) IN (${placeholders})`,
      lowercaseAddresses
    );

    const profileMap = new Map<string, UserProfile>();
    result.rows.forEach((row: any) => {
      profileMap.set(row.wallet_address.toLowerCase(), {
        walletAddress: row.wallet_address,
        nama: row.nama,
        whatsapp: row.whatsapp,
        kota: row.kota,
      });
    });

    return profileMap;
  } catch (error) {
    console.error("Error getting profiles by addresses:", error);
    return new Map();
  }
}

// Waitlist Functions
export async function addToWaitlist(entry: WaitlistEntry): Promise<{
  success: boolean;
  id?: number;
  error?: string;
}> {
  try {
    const result = await pool.query(
      `
        INSERT INTO waitlist (nama, email, whatsapp, kota, peran)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
      [entry.nama, entry.email, entry.whatsapp, entry.kota, entry.peran]
    );

    return {
      success: true,
      id: result.rows[0].id,
    };
  } catch (error: any) {
    console.error("Error adding to waitlist:", error);

    if (error.code === "23505") {
      // PostgreSQL unique constraint violation
      return {
        success: false,
        error: "Email sudah terdaftar di waiting list",
      };
    }

    return {
      success: false,
      error: "Failed to add to waitlist",
    };
  }
}

export async function getWaitlistStats() {
  try {
    // Single optimized query to get all stats
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN peran = 'Admin' THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN peran = 'Member' THEN 1 ELSE 0 END) as member_count
      FROM waitlist
    `);

    const row = result.rows[0];
    const total = Number(row.total) || 0;
    const adminCount = Number(row.admin_count) || 0;
    const memberCount = Number(row.member_count) || 0;

    // Get recent signups
    const recentResult = await pool.query(`
      SELECT nama, peran, kota, created_at
      FROM waitlist
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const recentSignups = recentResult.rows.map((row: any) => ({
      nama: row.nama,
      peran: row.peran,
      kota: row.kota,
      createdAt: row.created_at.toISOString(),
    }));

    return {
      total,
      byRole: {
        Admin: adminCount,
        Member: memberCount,
      },
      recentSignups,
    };
  } catch (error) {
    console.error("Error getting waitlist stats:", error);
    throw error;
  }
}
