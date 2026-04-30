const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection failed:', err.message);
  else console.log('Connected to SQLite database.');
});

function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
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
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Email OTP codes table
    db.run(`CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Connection requests table
    db.run(`CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER NOT NULL,
      receiverId INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(senderId, receiverId)
    )`);

    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requestId INTEGER NOT NULL,
      senderId INTEGER NOT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Migrations for existing databases
    db.run(`ALTER TABLE users ADD COLUMN isVerified INTEGER DEFAULT 0`, (err) => {
      if (err && !err.message.includes('duplicate column')) console.log('Migration: isVerified column already exists or added');
    });

    db.run(`ALTER TABLE users ADD COLUMN isAdmin INTEGER DEFAULT 0`, (err) => {
      if (err && !err.message.includes('duplicate column')) console.log('Migration: isAdmin column already exists or added');
    });

    db.run(`ALTER TABLE users ADD COLUMN approvalStatus TEXT DEFAULT 'pending'`, (err) => {
      if (err && !err.message.includes('duplicate column')) console.log('Migration: approvalStatus column already exists or added');
    });

    db.run(`ALTER TABLE users ADD COLUMN rejectionReason TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) console.log('Migration: rejectionReason column already exists or added');
    });

    db.run(`ALTER TABLE users ADD COLUMN semester TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) console.log('Migration: semester column already exists or added');
    });
  });
}

module.exports = { db, initDatabase };
