import 'dotenv/config';
import sql from '../database.js';

async function initDatabase() {
  try {
    // USERS TABLE
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        "rollNo" TEXT UNIQUE,
        "sapId" TEXT UNIQUE,
        university TEXT NOT NULL,
        department TEXT NOT NULL,
        course TEXT NOT NULL,
        shift TEXT,
        section TEXT,
        semester TEXT,
        image TEXT NOT NULL,
        reason TEXT NOT NULL,
        qualities TEXT,
        "isVerified" INTEGER DEFAULT 0,
        "isAdmin" INTEGER DEFAULT 0,
        "approvalStatus" TEXT DEFAULT 'pending',
        "rejectionReason" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // OTP TABLE
    await sql`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // REQUESTS TABLE
    await sql`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        senderId INTEGER NOT NULL REFERENCES users(id),
        receiverId INTEGER NOT NULL REFERENCES users(id),
        status TEXT DEFAULT 'pending',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(senderId, receiverId)
      )
    `;

    // MESSAGES TABLE
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        requestId INTEGER NOT NULL REFERENCES requests(id),
        senderId INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("✅ Database tables created/verified");
  } catch (err) {
    console.error("❌ Database init error:", err);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
}

export default initDatabase;

