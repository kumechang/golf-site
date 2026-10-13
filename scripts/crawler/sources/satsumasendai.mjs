// 薩摩川内市スポーツ協会「年間スケジュール」。全競技の事業計画が1ページにあるため、
// 「グラウンド・ゴルフ協会」の見出し（h5）の直後の表だけを読む。他の団体の表（高齢者の活動などに「グランドゴルフ」が出る）は読まない。
// 表: 開催日（「4月 16日」）・事業内容・開催場所・参加人数。年は「令和N年度」の見出しから補う（年度は4月始まり）。
import { parseMonthDayCell, reiwaToYear, yearInFiscal } from '../lib/dates.mjs';
import { classifyType } from '../lib/event.mjs';
import { findTables, rowsOf, textOf } from '../lib/html.mjs';

export const id = 'local-satsumasendai';

export function parseSatsumaSchedule(html, { sourceUrl }) {
  const events = [];
  const notes = [];
  const reiwa = /令和\s*([0-9０-９]+)\s*年度/.exec(textOf(html));
  if (!reiwa) return { events, notes: ['「令和○年度」の見出しが見つからない。ページ構造が変わった可能性'] };
  const fiscalYear = reiwaToYear(Number(reiwa[1].replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))));
  const heading = /<h5[^>]*>\s*グラウンド・ゴルフ協会\s*<\/h5>/.exec(html);
  if (!heading) return { events, notes: ['「グラウンド・ゴルフ協会」の見出しが見つからない。ページ構造が変わった可能性'] };
  const rest = html.slice(heading.index + heading[0].length);
  const nextHeading = rest.search(/<h[1-5][^>]*>/);
  const section = nextHeading < 0 ? rest : rest.slice(0, nextHeading);
  const tables = findTables(section, '');
  if (!tables.length) return { events, notes: ['グラウンド・ゴルフ協会の表が見つからない'] };
  for (const row of rowsOf(tables[0].html)) {
    if (row.cells.length < 3 || row.cells[0].tag === 'th') continue;
    const [dateCell, nameCell, venueCell, peopleCell] = row.cells;
    const name = nameCell.text;
    if (!name) continue;
    const md = /(\d{1,2})月/.exec(dateCell.text.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)));
    // 月が書かれていない行（「未定」など）は、日程未定のまま残す
    const date = md ? parseMonthDayCell(dateCell.text, yearInFiscal(fiscalYear, Number(md[1]))) : { start: null, end: null, reason: '月が未記載' };
    if (!date.start) notes.push(`${name}: ${date.reason}（${dateCell.text.replace(/\s+/g, ' ').trim()}）`);
    events.push({
      name,
      start: date.start,
      end: date.end,
      dateText: dateCell.text,
      prefecture: '鹿児島県',
      city: '薩摩川内市',
      venue: venueCell.text || null,
      eventType: classifyType(name),
      scope: 'in_prefecture',
      expectedParticipants: peopleCell && /^\d+$/.test(peopleCell.text) ? Number(peopleCell.text) : null,
      sourceUrl,
    });
  }
  if (!events.length) notes.push('表から行を1件も読み取れなかった');
  return { events, notes };
}

export async function run(ctx) {
  const url = ctx.source.entry_urls[0];
  const res = await ctx.client.get(url);
  if (!res.ok) return { events: [], notes: [`取得できなかった: ${url}（${res.reason}）`] };
  const r = parseSatsumaSchedule(res.text, { sourceUrl: url });
  r.notes.push('全競技の年間スケジュールから「グラウンド・ゴルフ協会」の表のみを読んでいる。「事業内容」は大会名ではなく協会大会の通し番号の場合がある');
  return r;
}
