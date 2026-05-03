import sql from './database.js';

const email = process.argv[2];

if (!email) {
  console.log('Usage: node make-admin.js <email>');
  console.log('Example: node make-admin.js shoaibjan@unisync.com');
  process.exit(1);
}

(async () => {
  try {
    const result = await sql`UPDATE users SET "isAdmin" = 1 WHERE email = ${email} RETURNING *`;
    if (result.length === 0) {
      console.log(`User with email "${email}" not found.`);
      console.log('Make sure the user has signed up first.');
      process.exit(1);
    }
    console.log(`✅ User "${email}" is now an ADMIN.`);
    console.log('Log out and log back in to see the Admin Panel.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();

