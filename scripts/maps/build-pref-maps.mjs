// 使い方: node scripts/maps/build-pref-maps.mjs <全国のTopoJSON> [--out=src/data/pref-maps]
// 都道府県ごとの「デフォルメした県の形」を、市区町村ごとのSVGのパスとして書き出す（src/data/pref-maps/<slug>.json）。
// 元データ: 国土交通省 国土数値情報（行政区域データ）2021年版を、スマートニュース メディア研究所が簡素化したもの
//   https://github.com/smartnews-smri/japan-topography （data/municipality/topojson/s0010/N03-21_210101_designated_city.json。政令指定都市の区は市に結合済み）
// 加工:
//   ・本土（いちばん大きい陸地と、25km以内でつながる陸地）だけを、その県の図として描く
//   ・本土から離れた島だけの市区町村は、形を描かず、図の下の小さなタイルとして並べる
//   ・座標は小数1桁に丸める。元のデータ（市区町村の境界の詳細）は保存しない
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import { geoArea, geoCentroid, geoDistance, geoMercator, geoPath } from 'd3-geo';
import { JIS_PREFECTURES } from '../../src/data/pref-events-core.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const outDir = args.find((a) => a.startsWith('--out='))?.slice(6) || join(root, 'src', 'data', 'pref-maps');
if (!input) { console.error('使い方: node scripts/maps/build-pref-maps.mjs <全国のTopoJSON>'); process.exit(1); }

const topo = JSON.parse(readFileSync(input, 'utf8'));
const objName = Object.keys(topo.objects)[0];
const fc = feature(topo, topo.objects[objName]);
const EARTH_KM = 6371;
const NEAR_KM = 25; // この距離以内でつながる陸地は、同じ「本土」とみなす
const W = 360; // viewBox の幅
const MAX_H = 420;
const PAD = 6;

/** ポリゴンの、重心と半径（km）。陸地どうしの近さを、輪郭の点ではなく、この円で見積もる（速くするため） */
function circleOf(geom) {
  const c = geoCentroid(geom);
  let r = 0;
  const ring = geom.coordinates[0];
  const step = Math.max(1, Math.floor(ring.length / 60));
  for (let i = 0; i < ring.length; i += step) r = Math.max(r, geoDistance(c, ring[i]) * EARTH_KM);
  return { c, r };
}
const gapKm = (a, b) => geoDistance(a.c, b.c) * EARTH_KM - a.r - b.r;

mkdirSync(outDir, { recursive: true });
let total = 0;
for (const [prefName, slug] of JIS_PREFECTURES) {
  // 北方領土の6村（色丹村・泊村（国後島）・留夜別村・留別村・紗那村・蘂取村）は、現在は訪れられず、図が小さくなるので描かない
  const NORTHERN = new Set(['01695', '01696', '01697', '01698', '01699', '01700']);
  const feats = fc.features.filter((f) => f.properties.N03_001 === prefName && f.properties.N03_007 && !NORTHERN.has(f.properties.N03_007));
  // ポリゴン（陸地）に分ける
  const parts = [];
  for (const f of feats) {
    const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
    for (const coords of polys) {
      const geom = { type: 'Polygon', coordinates: coords };
      parts.push({ code: f.properties.N03_007, name: f.properties.N03_003 && !f.properties.N03_004 ? f.properties.N03_003 : (f.properties.N03_004 || f.properties.N03_003), coords, geom, area: geoArea(geom), circle: circleOf(geom) });
    }
  }
  // 陸地を、25km以内でつながるものどうしのまとまり（クラスター）に分け、面積の合計がいちばん大きいまとまりを「本土」にする
  const parent = parts.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      if (find(i) !== find(j) && gapKm(parts[i].circle, parts[j].circle) <= NEAR_KM) parent[find(i)] = find(j);
    }
  }
  const areaByRoot = new Map();
  parts.forEach((p, i) => areaByRoot.set(find(i), (areaByRoot.get(find(i)) ?? 0) + p.area));
  const mainRoot = [...areaByRoot.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const main = new Set(parts.filter((_, i) => find(i) === mainRoot));
  // 本土の陸地を1つも持たない市区町村は、タイルにする
  const drawnCodes = new Set([...main].map((p) => p.code));
  const nameOf = new Map(parts.map((p) => [p.code, p.name]));
  const tiles = [...nameOf.entries()].filter(([c]) => !drawnCodes.has(c)).map(([code, name]) => ({ code, name })).sort((a, b) => a.code.localeCompare(b.code));

  // 本土の陸地をまとめた図形にあわせて投影する
  const mainFc = { type: 'FeatureCollection', features: [...main].map((p) => ({ type: 'Feature', properties: {}, geometry: p.geom })) };
  const proj = geoMercator().fitExtent([[PAD, PAD], [W - PAD, 100000]], mainFc);
  // 高さを求める
  const bounds = geoPath(proj).bounds(mainFc);
  const rawH = bounds[1][1] + PAD;
  let H = rawH;
  if (rawH > MAX_H) {
    proj.fitExtent([[PAD, PAD], [W - PAD, MAX_H - PAD]], mainFc);
    H = MAX_H;
  }
  const bb = geoPath(proj).bounds(mainFc);
  // 余白を詰める（横長・縦長の県で、図が中央に来るようにする）
  const offX = (W - (bb[1][0] - bb[0][0])) / 2 - bb[0][0];
  const offY = PAD - bb[0][1];
  H = Math.ceil(bb[1][1] - bb[0][1] + PAD * 2);
  proj.translate([proj.translate()[0] + offX, proj.translate()[1] + offY]); // 図を枠の中央に寄せる（座標に反映する）
  // 投影した座標で、点を間引く（Ramer–Douglas–Peucker）。点の数を減らして、SVGを軽くする
  const TOL = 0.8;
  const rdp = (pts) => {
    if (pts.length < 3) return pts;
    const [x1, y1] = pts[0], [x2, y2] = pts[pts.length - 1];
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1e-9;
    let maxD = 0, idx = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / len;
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD <= TOL) return [pts[0], pts[pts.length - 1]];
    return [...rdp(pts.slice(0, idx + 1)).slice(0, -1), ...rdp(pts.slice(idx))];
  };
  const ringArea = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; a += x1 * y2 - x2 * y1; } return Math.abs(a) / 2; };
  const r1 = (n) => Math.round(n * 10) / 10;
  const pathOf = (coords) => {
    let d = '';
    coords.forEach((ring, k) => {
      const projected = ring.map((c) => proj(c)).slice(0, -1); // 最後の点は、最初の点と同じなので除く
      // 閉じた輪は、最初の点からいちばん遠い点で2つに分けて、それぞれ間引く
      let far = 0, fd = -1;
      projected.forEach(([x, y], i) => { const d = Math.hypot(x - projected[0][0], y - projected[0][1]); if (d > fd) { fd = d; far = i; } });
      const first = rdp(projected.slice(0, far + 1));
      const second = rdp(projected.slice(far).concat([projected[0]]));
      const pts = [...first.slice(0, -1), ...second.slice(0, -1)];
      if (pts.length < 3) return;
      if (ringArea(pts) < (k === 0 ? 1.5 : 4)) return; // 小さすぎる島・穴は描かない
      d += 'M' + pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join('L') + 'Z';
    });
    return d;
  };
  const byCode = new Map();
  for (const p of main) {
    const d = pathOf(p.coords);
    if (!d) continue;
    const ring = p.coords[0].map((c) => proj(c));
    const xs = ring.map((q) => q[0]), ys = ring.map((q) => q[1]);
    const e = byCode.get(p.code) ?? { code: p.code, name: p.name, d: [], parts: [] };
    e.d.push(d);
    e.parts.push({ area: ringArea(ring), cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2, w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) });
    byCode.set(p.code, e);
  }
  // 件数の数字を置く位置は、その市区町村でいちばん大きい陸地の中心。広さ（幅と高さ）も添える
  const municipalities = [...byCode.values()].map((e) => {
    const big = e.parts.sort((a, b) => b.area - a.area)[0];
    return { code: e.code, name: e.name, d: e.d.join(''), label: [r1(big.cx), r1(big.cy), r1(big.w), r1(big.h)] };
  }).sort((a, b) => a.code.localeCompare(b.code));
  const json = { prefecture: prefName, slug, width: W, height: H, municipalities, tiles };
  writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(json));
  total += municipalities.length + tiles.length;
  console.log(`${prefName}: 図 ${municipalities.length} / タイル ${tiles.length} / ${W}×${H} / ${Math.round(JSON.stringify(json).length / 1024)}KB`);
}
console.log('合計', total, '市区町村');
