// Encrypts the course for the protected site (enc/ at the top of the repository).
// usage: node tools/build.js <course folder> <key file>
// The key file holds the 32-byte key in base64. It must NEVER be committed:
// the same key goes only into the Google Apps Script of the seller's sheet.
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const [src, keyFile] = process.argv.slice(2);
if (!src || !keyFile) { console.error('usage: node build.js <course folder> <key file>'); process.exit(1); }
const key = Buffer.from(fs.readFileSync(keyFile, 'utf8').trim(), 'base64');
if (key.length !== 32) throw new Error('key must be 32 bytes');
const out = path.join(__dirname, '..', 'enc');
// only files that changed are encrypted again (so an update does not re-upload the whole course)
const manFile = path.join(__dirname, 'enc-manifest.json');
const old = fs.existsSync(manFile) ? JSON.parse(fs.readFileSync(manFile, 'utf8')) : {};
const man = {};
let n = 0, bytes = 0, kept = 0;
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    const rel = path.relative(src, p).split(path.sep).join('/');
    const plain = fs.readFileSync(p);
    const h = crypto.createHash('sha256').update(key).update(plain).digest('hex').slice(0, 24);
    man[rel] = h;
    const dst0 = path.join(out, rel + '.bin');
    if (old[rel] === h && fs.existsSync(dst0)) { kept++; continue; }
    const iv = crypto.randomBytes(12);
    const c = crypto.createCipheriv('aes-256-gcm', key, iv);
    const body = Buffer.concat([iv, c.update(plain), c.final(), c.getAuthTag()]);
    const dst = path.join(out, rel + '.bin');
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, body);
    n++; bytes += body.length;
  }
})(src);
// files that are no longer in the course
(function prune(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { prune(p); continue; }
    const rel = path.relative(out, p).split(path.sep).join('/').replace(/\.bin$/, '');
    if (!(rel in man)) fs.rmSync(p);
  }
})(out);
fs.writeFileSync(manFile, JSON.stringify(man, null, 0));
console.log(`encrypted ${n} files (${(bytes / 1048576).toFixed(1)} MB), unchanged ${kept}`);
