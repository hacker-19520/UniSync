const { Pool } = require("pg");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Check if DATABASE_URL is a Supabase PostgreSQL URL
const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgresql");

let pool;
let sqliteDb;

if (isPostgres) {
  // Use PostgreSQL (Supabase)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  async function initDatabase() {
    const client = await pool.connect();
    try {
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
      await client.query(`
        CREATE TABLE IF NOT EXISTS otp_codes (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL,
          code TEXT NOT NULL,
          expiresAt TIMESTAMP NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
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

  module.exports = { pool, initDatabase };
} else {
  // Fallback to SQLite for local development
  console.log("📦 Using SQLite for local development");
  
  const dbPath = process.env.DB_PATH || path.join(__dirname, "database.sqlite");
  sqliteDb = new sqlite3.Database(dbPath);

  // Create pool-like interface for SQLite
  pool = {
    query: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        // Handle INSERT with RETURNING
        if (sql.toUpperCase().includes("RETURNING")) {
          sql = sql.replace(/RETURNING.*$/i, "");
          sqliteDb.run(sql, params, function (err) {
            if (err) return reject(err);
            // Get last inserted row
            sqliteDb.get("SELECT last_insert_rowid() as id", [], (err2, row) => {
              if (err2) return reject(err2);
              resolve({ rows: [{ id: row?.id || this.lastID }], rowCount: 1 });
            });
          });
        } else if (sql.trim().toUpperCase().startsWith("SELECT")) {
          sqliteDb.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve({ rows: rows || [], rowCount: rows?.length || 0 });
          });
        } else {
          sqliteDb.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ rows: [], rowCount: this.changes, lastID: this.lastID });
          });
        }
      });
    },
  };

  function initDatabase() {
    return new Promise((resolve, reject) => {
      sqliteDb.serialize(() => {
        // USERS TABLE
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS otp_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            expiresAt TIMESTAMP NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // REQUESTS TABLE
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            senderId INTEGER NOT NULL,
            receiverId INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(senderId, receiverId)
          )
        `);

        // MESSAGES TABLE
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            requestId INTEGER NOT NULL,
            senderId INTEGER NOT NULL,
            content TEXT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        console.log("✅ SQLite database initialized");
        resolve();
      });
    });
  }

  module.exports = { pool, initDatabase };
}
