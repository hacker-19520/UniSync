const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Supabase
  },
});

async function initDatabase() {
  const client = await pool.connect();

  try {
    // USERS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        rollNo TEXT UNIQUE,
        sapId TEXT UNIQUE,
        university TEXT NOT NULL,
        department TEXT NOT NULL,
        course TEXT NOT NULL,
        shift TEXT,
        section TEXT,
        semester TEXT,
        image TEXT NOT NULL,
        reason TEXT NOT NULL,
        qualities TEXT,
        isVerified INTEGER DEFAULT 0,
        isAdmin INTEGER DEFAULT 0,
        approvalStatus TEXT DEFAULT 'pending',
        rejectionReason TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // OTP TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expiresAt TIMESTAMP NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // REQUESTS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        senderId INTEGER NOT NULL,
        receiverId INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(senderId, receiverId)
      )
    `);

    // MESSAGES TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        requestId INTEGER NOT NULL,
        senderId INTEGER NOT NULL,
        content TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ PostgreSQL database initialized");
  } catch (err) {
    console.error("❌ DB Init Error:", err);
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  initDatabase,
};