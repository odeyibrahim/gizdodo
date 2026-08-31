/*
  GIZDODOSPECIALS — Build Script
  Copies public/ → dist/ and injects Netlify env vars into HTML files.

  Netlify env vars expected (set in Netlify Dashboard > Environment):
    VITE_ADMIN_PASSWORD_HASH   — SHA-256 hash of admin password
    VITE_SUPABASE_URL          — e.g. https://xxx.supabase.co
    VITE_SUPABASE_ANON_KEY     — Supabase anon/public key
    VITE_WHATSAPP_PHONE        — e.g. +2349023731643

  Placeholders in HTML/JS files use the format: __ENV_VAR_NAME__
  e.g. __VITE_ADMIN_PASSWORD_HASH__ → replaced with the actual value
*/

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'public');
const DEST = path.join(__dirname, 'dist');

// Map of placeholder → env var name
const REPLACEMENTS = {
  '__VITE_ADMIN_PASSWORD_HASH__': process.env.VITE_ADMIN_PASSWORD_HASH || '',
  '__VITE_SUPABASE_URL__'       : process.env.VITE_SUPABASE_URL || '',
  '__VITE_SUPABASE_ANON_KEY__'  : process.env.VITE_SUPABASE_ANON_KEY || '',
  '__VITE_WHATSAPP_PHONE__'     : process.env.VITE_WHATSAPP_PHONE || '',
};

// Files to process (relative to public/)
const PROCESS_FILES = [
  'index.html',
  'track.html',
  'contact.html',
  'admin/index.html',
  'js/app.js',
  'js/track.js',
];

// Extensions to copy as-is
const COPY_EXTS = new Set([
  '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
  '.js', '.json', '.ico', '.webmanifest',
]);

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function processFile(relPath) {
  const srcPath = path.join(SRC, relPath);
  const destPath = path.join(DEST, relPath);
  if (!fs.existsSync(srcPath)) return;

  // Ensure dest directory exists
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  let content = fs.readFileSync(srcPath, 'utf8');
  let changed = false;

  for (const [placeholder, value] of Object.entries(REPLACEMENTS)) {
    if (content.includes(placeholder)) {
      content = content.split(placeholder).join(value);
      changed = true;
    }
  }

  fs.writeFileSync(destPath, content, 'utf8');
  if (changed) {
    console.log('  Injected env vars: ' + relPath);
  }
}

// --- Main ---
console.log('Building GIZDODOSPECIALS...');

// Clean dest
if (fs.existsSync(DEST)) {
  fs.rmSync(DEST, { recursive: true });
}

// Copy everything first
copyDir(SRC, DEST);
console.log('  Copied public/ → dist/');

// Then process specific files (overwrite with env-var-injected versions)
for (const file of PROCESS_FILES) {
  processFile(file);
}

console.log('Build complete. Output: dist/');
