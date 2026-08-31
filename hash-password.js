// Run: node hash-password.js "your-password"
const crypto = require('crypto');
const pw = process.argv[2] || 'admin123';
console.log('Password:', pw);
console.log('SHA-256 Hash:', crypto.createHash('sha256').update(pw).digest('hex'));
console.log('\nSet this as VITE_ADMIN_PASSWORD_HASH in Netlify Environment Variables.');
