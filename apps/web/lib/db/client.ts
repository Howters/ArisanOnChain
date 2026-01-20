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
  kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  zkProofHash?: string;
  isAdult?: boolean;
  kycSubmittedAt?: string;
}

export interface KYCData {
  walletAddress: string;
  ktpNumber: string;
  fullName: string;
  birthDate: string;
  address: string;
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
          kyc_status TEXT DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),
          zk_proof_hash TEXT,
          is_adult BOOLEAN,
          kyc_submitted_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Add columns if they don't exist (for existing tables)
      await client.query(`
        ALTER TABLE user_profiles
        ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),
        ADD COLUMN IF NOT EXISTS zk_proof_hash TEXT,
        ADD COLUMN IF NOT EXISTS is_adult BOOLEAN,
        ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMP
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
      kycStatus: row.kyc_status,
      zkProofHash: row.zk_proof_hash,
      isAdult: row.is_adult,
      kycSubmittedAt: row.kyc_submitted_at?.toISOString(),
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
        INSERT INTO user_profiles (wallet_address, nama, whatsapp, kota, kyc_status, zk_proof_hash, is_adult, kyc_submitted_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT(wallet_address) DO UPDATE SET
          nama = excluded.nama,
          whatsapp = excluded.whatsapp,
          kota = excluded.kota,
          kyc_status = COALESCE(excluded.kyc_status, user_profiles.kyc_status),
          zk_proof_hash = COALESCE(excluded.zk_proof_hash, user_profiles.zk_proof_hash),
          is_adult = COALESCE(excluded.is_adult, user_profiles.is_adult),
          kyc_submitted_at = COALESCE(excluded.kyc_submitted_at, user_profiles.kyc_submitted_at),
          updated_at = NOW()
      `,
      [
        profile.walletAddress,
        profile.nama,
        profile.whatsapp,
        profile.kota || null,
        profile.kycStatus || 'unverified',
        profile.zkProofHash || null,
        profile.isAdult || null,
        profile.kycSubmittedAt ? new Date(profile.kycSubmittedAt) : null
      ]
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

// KYC Functions

// Mock ZK proof generation (simplified for demo)
function generateZKProof(ktpData: KYCData): string {
  // In a real ZK system, this would generate a cryptographic proof
  // For demo, we create a hash that proves age >= 17 without revealing DOB
  const age = calculateAge(ktpData.birthDate);
  const isAdult = age >= 17;

  // Mock ZK proof: hash of (ktpNumber + age_verification + salt)
  const salt = Math.random().toString(36).substring(2, 15);
  const proofData = `${ktpData.ktpNumber}:${isAdult ? 'adult' : 'minor'}:${salt}`;
  const proofHash = require('crypto').createHash('sha256').update(proofData).digest('hex');

  return proofHash;
}

// Calculate age from birth date
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

// Mock KTP validation
function validateKTP(ktpData: KYCData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // KTP number should be 16 digits
  if (!/^\d{16}$/.test(ktpData.ktpNumber)) {
    errors.push("Nomor KTP harus 16 digit");
  }

  // Name should not be empty and reasonable length
  if (!ktpData.fullName || ktpData.fullName.length < 2) {
    errors.push("Nama lengkap harus diisi");
  }

  // Birth date should be valid and not in future
  const birthDate = new Date(ktpData.birthDate);
  const today = new Date();
  if (isNaN(birthDate.getTime())) {
    errors.push("Tanggal lahir tidak valid");
  } else if (birthDate > today) {
    errors.push("Tanggal lahir tidak boleh di masa depan");
  }

  // Address should not be empty
  if (!ktpData.address || ktpData.address.length < 10) {
    errors.push("Alamat harus diisi dengan lengkap");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export async function submitKYC(walletAddress: string, kycData: KYCData): Promise<{
  success: boolean;
  error?: string;
  kycStatus?: string;
}> {
  try {
    // Validate KTP data
    const validation = validateKTP(kycData);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(", ")
      };
    }

    // Generate mock ZK proof
    const zkProofHash = generateZKProof(kycData);
    const age = calculateAge(kycData.birthDate);
    const isAdult = age >= 17;

    // Update profile with KYC data
    await pool.query(
      `
        UPDATE user_profiles
        SET kyc_status = 'pending',
            zk_proof_hash = $1,
            is_adult = $2,
            kyc_submitted_at = NOW(),
            updated_at = NOW()
        WHERE wallet_address = $3
      `,
      [zkProofHash, isAdult, walletAddress]
    );

    return {
      success: true,
      kycStatus: 'pending'
    };
  } catch (error) {
    console.error("Error submitting KYC:", error);
    return {
      success: false,
      error: "Failed to submit KYC"
    };
  }
}

export async function verifyKYC(walletAddress: string): Promise<{
  success: boolean;
  error?: string;
  kycStatus?: string;
}> {
  try {
    // Mock verification - in real system, this would verify ZK proof
    // For demo, we'll randomly approve/reject pending applications
    const result = await pool.query(
      "SELECT kyc_status, zk_proof_hash FROM user_profiles WHERE wallet_address = $1",
      [walletAddress]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Profile not found"
      };
    }

    const profile = result.rows[0];

    if (profile.kyc_status !== 'pending') {
      return {
        success: false,
        error: "KYC not submitted or already verified"
      };
    }

    // Mock verification logic - approve 90% of applications
    const isApproved = Math.random() > 0.1;
    const newStatus = isApproved ? 'verified' : 'rejected';

    await pool.query(
      "UPDATE user_profiles SET kyc_status = $1, updated_at = NOW() WHERE wallet_address = $2",
      [newStatus, walletAddress]
    );

    return {
      success: true,
      kycStatus: newStatus
    };
  } catch (error) {
    console.error("Error verifying KYC:", error);
    return {
      success: false,
      error: "Failed to verify KYC"
    };
  }
}

export async function getKYCStatus(walletAddress: string): Promise<{
  kycStatus: string;
  isAdult: boolean | null;
  zkProofHash: string | null;
  submittedAt: string | null;
} | null> {
  try {
    const result = await pool.query(
      "SELECT kyc_status, is_adult, zk_proof_hash, kyc_submitted_at FROM user_profiles WHERE wallet_address = $1",
      [walletAddress]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      kycStatus: row.kyc_status || 'unverified',
      isAdult: row.is_adult,
      zkProofHash: row.zk_proof_hash,
      submittedAt: row.kyc_submitted_at?.toISOString() || null
    };
  } catch (error) {
    console.error("Error getting KYC status:", error);
    return null;
  }
}
