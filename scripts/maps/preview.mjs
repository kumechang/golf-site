// 使い方: node scripts/maps/preview.mjs <出力HTML> [slug...]
// 作った県の図を、1枚のHTMLに並べる（見た目の確認用。サイトには入れない）。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const [out, ...slugs] = process.argv.slice(2);
const cells = slugs.map((slug) => {
  const m = JSON.parse(readFileSync(join(root, 'src', 'data', 'pref-maps', `${slug}.json`), 'utf8'));
  const paths = m.municipalities.map((x, i) => `<path d="${x.d}" fill="${['#bbf7d0', '#86efac', '#fde68a', '#fecaca', '#bfdbfe'][i % 5]}" stroke="#fff" stroke-width="0.8"/>`).join('');
  const tiles = m.tiles.map((t) => `<span style="border:1px solid #888;padding:2px 6px;margin:2px;display:inline-block;font-size:12px">${t.name}</span>`).join('');
  return `<div style="width:360px;display:inline-block;vertical-align:top;margin:8px"><div>${m.prefecture} ${m.width}×${m.height}</div><svg viewBox="0 0 ${m.width} ${m.height}" width="360" height="${m.height}" style="background:#f8fafc">${paths}</svg><div>${tiles}</div></div>`;
});
writeFileSync(out, `<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif">${cells.join('')}`);
