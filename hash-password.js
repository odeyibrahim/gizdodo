// Run this in your site folder:
//   node hash-password.js "your-password-here"
//
// It will print the SHA-256 hash. Copy it to Netlify env var ADMIN_PASSWORD_HASH

const crypto = require('crypto');
const password = process.argv[2];

if (!password) {
  console.log('Usage: node hash-password.js "your-password"');
  console.log('Example: node hash-password.js "gizdodo2024"');
  process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('Password: ' + password);
console.log('Hash:     ' + hash);
console.log('');
console.log('Set this in Netlify > Site > Environment variables:');
console.log('  ADMIN_PASSWORD_HASH=' + hash);
