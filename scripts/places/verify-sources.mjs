// 使い方: node scripts/places/verify-sources.mjs --out=<出力JSON> [--delay=2000] [--hosts=12]
// 掲載しているデータが、元のページにいまも書かれているかを確かめる（本文を読む。外部リンクの生存確認は check-links.mjs）。
//  ・施設・一覧ページ（data/places/places.json）: ページに「グラウンド・ゴルフ」の記載があるか
//  ・住所・電話番号（data/places/details.json）: 電話番号・住所がページの本文にあるか（表記ゆれ、全角・半角、ハイフンの違いは吸収）
//  ・イベント（data/events/municipal.json）: 大会名と開催日がページの本文にあるか
//   --since=YYYY-MM-DD で、その日以降に足したものだけに絞れる。
// 同じホストには間隔をあけて1件ずつ、ホストどうしは並行して取得。TLS検証は外さず、User-Agent は名乗る（偽装しない）。PDFは読まない。
// 除外している（overrides）ものは対象外。結果は「確認できた／確認できない／ページが読めない」。「確認できない」は、人が見て決める材料で、自動では消さない。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (k, d) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d;
const out = flag('out', null);
const since = flag('since', null); // 例: --since=2026-11-26 … その日以降に足した掲載（取得日・取得日時）だけを確かめる
const delay = Number(flag('delay', 2000));
const concurrency = Number(flag('hosts', 12));
const rd = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const places = rd('data/places/places.json').places;
const details = rd('data/places/details.json').details;
const events = rd('data/events/municipal.json').events;
const exclude = new Set([...(rd('data/places/overrides.json').overrides ?? [])].filter((o) => o.exclude).map((o) => o.source_url));
const httpsUp = (() => { try { return rd('data/places/https-upgrades.json').upgrades ?? {}; } catch { return {}; } })();

const nfkc = (s) => s.normalize('NFKC');
const GG = /グラウンド.{0,3}ゴルフ|グランド.{0,3}ゴルフ|ground.?golf/i;
const phoneRe = (p) => { const d = p.split('-'); return new RegExp(d.join('[\\s\\-－ー‐−()（）]{0,3}')); };
const addrCore = (a) => nfkc(a).replace(/\s+/g, '').replace(/^.{2,3}[都道府県]/, '');
const normAddr = (a) => nfkc(a).replace(/\s+/g, '').replace(/[‐−－ー―]/g, '-').replace(/番地/g, '-').replace(/番/g, '-').replace(/号/g, '').replace(/丁目/g, '-').replace(/-+$/, '');

// 取得する URL と、その URL にぶら下がる確認事項
const jobs = new Map();
const job = (url) => { if (!jobs.has(url)) jobs.set(url, { place: [], detail: [], event: [] }); return jobs.get(url); };
const isNew = (d) => !since || String(d ?? '').slice(0, 10) >= since;
for (const p of places) { if ((p.flags ?? []).length || exclude.has(p.source_url) || !isNew(p.surveyed_at)) continue; job(p.source_url).place.push(p); }
for (const d of details) { if (exclude.has(d.source_url) || !isNew(d.fetched_at)) continue; job(d.source_url).detail.push(d); }
for (const e of events) { if (!isNew(e.extracted_at)) continue; job(e.source_url).event.push(e); }

const decode = async (res) => {
  const buf = new Uint8Array(await res.arrayBuffer());
  const head = new TextDecoder('latin1').decode(buf.slice(0, 4000));
  const cs = (res.headers.get('content-type')?.match(/charset=([\w-]+)/i)?.[1] ?? head.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1] ?? 'utf-8').toLowerCase();
  try { return new TextDecoder(/shift_?jis|sjis|x-sjis|windows-31j|cp932/.test(cs) ? 'shift_jis' : cs).decode(buf); } catch { return new TextDecoder('utf-8').decode(buf); }
};
const UA = 'GroundGolfNaviBot/1.0 (+https://ground-golf-navi.com/about/)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pages = new Map(); // url -> {status, text}
async function fetchPage(u) {
  if (/\.pdf($|\?)/i.test(u)) return { status: 'pdf' };
  try {
    const res = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(30000), headers: { 'user-agent': UA, accept: 'text/html,*/*;q=0.5' } });
    const ct = res.headers.get('content-type') ?? '';
    if (!res.ok) { res.body?.cancel().catch(() => {}); return { status: res.status }; }
    if (!/html|text|xml/i.test(ct)) { res.body?.cancel().catch(() => {}); return { status: 'non-html', ct }; }
    const raw = await decode(res);
    const text = nfkc(raw.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' '));
    return { status: res.status, text, len: text.length };
  } catch (e) { return { status: 'error', note: String(e.cause?.code ?? e.message).slice(0, 40) }; }
}
const byHost = new Map();
for (const u of jobs.keys()) { const h = new URL(u).hostname; byHost.set(h, [...(byHost.get(h) ?? []), u]); }
const queue = [...byHost.values()];
async function worker() { while (queue.length) { for (const u of queue.shift()) { pages.set(u, await fetchPage(u)); await sleep(delay); } } }
console.error(`取得するURL: ${jobs.size}件 / ホスト ${byHost.size}`);
await Promise.all(Array.from({ length: concurrency }, worker));
// 失敗は1回だけ再試行
for (const [u, r] of [...pages]) if (r.status === 'error' || (typeof r.status === 'number' && r.status >= 500)) { await sleep(delay); pages.set(u, await fetchPage(u)); }

const findings = [];
const tally = {};
const t = (k) => (tally[k] = (tally[k] ?? 0) + 1);
const md = (iso) => { const m = iso?.match(/^\d{4}-(\d{2})-(\d{2})$/); return m ? [Number(m[1]), Number(m[2])] : null; };
for (const [url, j] of jobs) {
  const pg = pages.get(url) ?? { status: 'none' };
  const readable = typeof pg.status === 'number' && pg.status < 400 && pg.text && pg.len > 300;
  const note = readable ? '' : `ページが読めない（${pg.status}${pg.note ? ' ' + pg.note : ''}）`;
  for (const p of j.place) {
    if (!readable) { t(`施設・一覧: 読めない(${typeof pg.status === 'number' ? pg.status : pg.status})`); continue; }
    if (GG.test(pg.text)) t('施設・一覧: 記載あり'); else { t('施設・一覧: 記載なし'); findings.push({ type: 'place_no_gg', url, kind: p.kind, name: p.name, municipality: p.municipality }); }
  }
  for (const d of j.detail) {
    if (!readable) { t('住所電話: 読めない'); continue; }
    if (d.phone) {
      if (phoneRe(d.phone).test(pg.text)) t('電話: 確認できた'); else { t('電話: 確認できない'); findings.push({ type: 'phone_missing', url, name: d.name, municipality: d.municipality, phone: d.phone }); }
    }
    if (d.address) {
      const a = normAddr(addrCore(d.address)), body = normAddr(pg.text);
      if (body.includes(a)) t('住所: 確認できた');
      else {
        const nums = (nfkc(d.address).match(/\d+/g) ?? []);
        const street = addrCore(d.address).replace(/\d.*$/, '').replace(/^.+?[市区町村郡]/, '');
        const loose = nums.length && body.includes(normAddr(street)) && nums.every((n) => body.includes(n));
        if (loose) t('住所: おおむね確認できた'); else { t('住所: 確認できない'); findings.push({ type: 'address_missing', url, name: d.name, municipality: d.municipality, address: d.address }); }
      }
    }
  }
  for (const e of j.event) {
    if (!readable) { t('イベント: 読めない'); continue; }
    const nm = nfkc(e.name).replace(/[\s（）()［］\[\]【】]/g, '');
    const body = pg.text.replace(/[\s（）()［］\[\]【】]/g, '');
    const key = nm.replace(/第\d+回/g, '').replace(/令和\d+年度?/g, '').slice(0, 9);
    const nameOk = body.includes(nm) || (key.length >= 5 && body.includes(key));
    const d = md(e.start);
    const dateOk = d ? new RegExp(`${d[0]}月\\s*${d[1]}日|${d[0]}/${d[1]}(?!\\d)|${d[0]}\\.${d[1]}(?!\\d)`).test(pg.text) : null;
    if (nameOk && dateOk !== false) t('イベント: 名前・日付とも確認できた');
    else { t(nameOk ? 'イベント: 日付が確認できない' : 'イベント: 名前が確認できない'); findings.push({ type: nameOk ? 'event_date_missing' : 'event_name_missing', url, id: e.id, name: e.name, municipality: e.municipality, start: e.start }); }
  }
}
const statusTally = {};
for (const r of pages.values()) { const k = String(r.status); statusTally[k] = (statusTally[k] ?? 0) + 1; }
console.log(JSON.stringify({ 取得したURL: pages.size, 状態: statusTally, 結果: tally }, null, 1));
if (out) writeFileSync(out, JSON.stringify({ checked_at: new Date().toISOString(), tally, statusTally, findings }, null, 2) + '\n');
