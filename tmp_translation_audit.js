const fs = require('fs');
const path = require('path');
const root = '.';
const files = fs.readdirSync(root).filter(f => f.endsWith('.html'));
const data = [];
files.forEach(file => {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const regex = /<([a-zA-Z0-9-_]+)([^>]*)>([^<]+?)</g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const tag = m[1];
    const attrs = m[2];
    const text = m[3].trim();
    if (!text) continue;
    if (/data-i18n\s*=/.test(attrs)) continue;
    if (/^\s*$/.test(text)) continue;
    // skip only markup symbols and numbers
    if (/^[^\p{L}]*$/u.test(text)) continue;
    data.push({file, tag, attrs, text, index: m.index});
  }
});
if (!data.length) {
  console.log('No untranslated text nodes detected by regex.');
  process.exit(0);
}
const grouped = data.reduce((acc, cur) => {
  (acc[cur.file] = acc[cur.file] || []).push(cur);
  return acc;
}, {});
for (const file of Object.keys(grouped)) {
  console.log('FILE', file);
  grouped[file].forEach(item => {
    console.log(' ', item.tag, JSON.stringify(item.text), item.attrs.trim().slice(0, 120));
  });
  console.log();
}
