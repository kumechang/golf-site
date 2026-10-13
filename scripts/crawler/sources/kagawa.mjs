// 香川県グラウンド・ゴルフ協会「大会情報」(/games/) の「開催予定 > 開催要項」の一覧。
// robots.txt が /taikai/ /result/ /pdf/ *.pdf などを禁止しているため、それらは取得しない（HTTPクライアントが拒否する）。
// 「大会結果」の一覧は過去の結果なので対象外。開催要項の案内ページ(/info/…)だけを1件ずつ読む。
import { parseSingleDate, resolveDeadline, normalize } from '../lib/dates.mjs';
import { classifyType } from '../lib/event.mjs';
import { decodeEntities, textOf } from '../lib/html.mjs';

export const id = 'pref-kagawa';

function sliceSection(html) {
  const start = html.search(/<h3[^>]*>\s*開催要項\s*<\/h3>/);
  if (start < 0) return null;
  const rest = html.slice(start);
  const end = rest.search(/<h2[^>]*>/);
  return end < 0 ? rest : rest.slice(0, end);
}

export function parseKagawaList(html, { sourceUrl }) {
  const events = [];
  const notes = [];
  const section = sliceSection(html);
  if (!section) return { events, notes: ['「開催要項」の見出しが見つからない。ページ構造が変わった可能性'] };
  for (const m of section.matchAll(/<li>\s*(R\d{1,2}\.\d{1,2}\.\d{1,2})\s*(?:<span[^>]*>[^<]*<\/span>)?\s*<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const start = parseSingleDate(m[1]);
    const name = textOf(m[3]).replace(/\s*\((?:案内\/)?開催要項\)\s*$/, '').trim();
    if (!start || !name) {
      notes.push(`行を解釈できない: ${textOf(m[0]).slice(0, 60)}`);
      continue;
    }
    events.push({
      name,
      start,
      end: start,
      dateText: m[1],
      prefecture: '香川県',
      city: null,
      venue: null,
      eventType: classifyType(name),
      scope: 'in_prefecture',
      sourceUrl: decodeEntities(m[2]),
      detailUrl: decodeEntities(m[2]),
      listUrl: sourceUrl,
    });
  }
  if (!events.length) notes.push('開催要項の一覧が空（現在、開催予定の掲載がない可能性）');
  return { events, notes };
}

// 開催要項の案内ページから、場所・申込締切を補う（開催日が一覧と食い違えば注意を出す）
export function parseKagawaDetail(html, event) {
  const text = normalize(textOf(html).replace(/\s+/g, ''));
  const notes = [];
  const out = {};
  const date = /開催日[:：]?(?:\(\d{4}年\))?令和(\d{1,2})年(\d{1,2})月(\d{1,2})日/.exec(text);
  if (date) {
    const iso = `${2018 + Number(date[1])}-${String(date[2]).padStart(2, '0')}-${String(date[3]).padStart(2, '0')}`;
    if (iso !== event.start) notes.push(`${event.name}: 一覧の日付(${event.start})と案内ページの開催日(${iso})が違う`);
  }
  const place = /場所[:：]([^プ募そ各]+?)(?=プレー方法|募集人数|その他|各種資料|$)/.exec(text);
  if (place) {
    out.venue = place[1].trim() || null;
    const city = /^([一-龥ぁ-んァ-ヶ]{1,4}[市町村])立/.exec(out.venue || '');
    if (city) out.city = city[1];
  }
  const deadline = /申込締切(\d{1,2}月\d{1,2}日)/.exec(text);
  if (deadline) out.applicationDeadline = resolveDeadline(deadline[1], event.start);
  return { fields: out, notes };
}

export async function run(ctx) {
  const url = ctx.source.entry_urls[0];
  const res = await ctx.client.get(url);
  if (!res.ok) return { events: [], notes: [`取得できなかった: ${url}（${res.reason}）`] };
  const { events, notes } = parseKagawaList(res.text, { sourceUrl: url });
  for (const e of events) {
    if (e.end < ctx.today) continue; // 終わった大会の案内ページは取らない
    const d = await ctx.client.get(e.detailUrl);
    if (!d.ok) {
      notes.push(`${e.name}: 案内ページを取得できなかった（${d.reason}）。一覧の情報のみ`);
      continue;
    }
    const r = parseKagawaDetail(d.text, e);
    Object.assign(e, r.fields);
    notes.push(...r.notes);
  }
  return { events, notes };
}
