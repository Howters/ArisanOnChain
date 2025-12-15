import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function initWaitlistTable() {
  const client = await pool.connect();
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
  const client = await pool.connect();
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
  byCity: Record<string, number>;
  recentSignups: number;
}> {
  const client = await pool.connect();
  try {
    await initWaitlistTable();
    
    const totalResult = await client.query("SELECT COUNT(*) FROM waitlist");
    const total = parseInt(totalResult.rows[0].count, 10);
    
    const roleResult = await client.query(`
      SELECT peran, COUNT(*) as count 
      FROM waitlist 
      GROUP BY peran
    `);
    const byRole = { admin: 0, member: 0 };
    roleResult.rows.forEach((row: any) => {
      if (row.peran.toLowerCase().includes("admin")) {
        byRole.admin = parseInt(row.count, 10);
      } else {
        byRole.member = parseInt(row.count, 10);
      }
    });
    
    const cityResult = await client.query(`
      SELECT kota, COUNT(*) as count 
      FROM waitlist 
      GROUP BY kota 
      ORDER BY count DESC 
      LIMIT 10
    `);
    const byCity: Record<string, number> = {};
    cityResult.rows.forEach((row: any) => {
      byCity[row.kota] = parseInt(row.count, 10);
    });
    
    const recentResult = await client.query(`
      SELECT COUNT(*) FROM waitlist 
      WHERE created_at > NOW() - INTERVAL '7 days'
    `);
    const recentSignups = parseInt(recentResult.rows[0].count, 10);
    
    return { total, byRole, byCity, recentSignups };
  } finally {
    client.release();
  }
}

export default pool;



