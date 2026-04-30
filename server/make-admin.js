const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const email = process.argv[2];

if (!email) {
  console.log('Usage: node make-admin.js <email>');
  console.log('Example: node make-admin.js shoaibjan@unisync.com');
  process.exit(1);
}

db.run(`UPDATE users SET isAdmin = 1 WHERE email = ?`, [email], function(err) {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
  if (this.changes === 0) {
    console.log(`User with email "${email}" not found.`);
    console.log('Make sure the user has signed up first.');
    process.exit(1);
  }
  console.log(`✅ User "${email}" is now an ADMIN.`);
  console.log('Log out and log back in to see the Admin Panel.');
  process.exit(0);
});

