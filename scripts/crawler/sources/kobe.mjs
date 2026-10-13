// 神戸市グラウンド・ゴルフ協会「年間行事予定」(/event-2/)。表: 大会日・大会名・会場。年は「2026年度大会予定」の見出しから補う（年度は4月始まり）。
// 大会名の末尾の「(4/27)」のような括弧書きは、表の日付と別の日（予備日や実施日）の可能性があるため注意に出す。
import { parseScheduleDate } from '../lib/dates.mjs';
import { classifyType } from '../lib/event.mjs';
import { findTables, rowsOf, textOf } from '../lib/html.mjs';

export const id = 'local-kobe-gga';

export function parseKobeSchedule(html, { sourceUrl }) {
  const events = [];
  const notes = [];
  const fy = /(\d{4})年度大会予定/.exec(textOf(html));
  if (!fy) return { events, notes: ['「○○○○年度大会予定」の見出しが見つからない。ページ構造が変わった可能性'] };
  const fiscalYear = Number(fy[1]);
  const tables = findTables(html, 'event-table');
  if (!tables.length) return { events, notes: ['大会予定の表が見つからない。ページ構造が変わった可能性'] };
  for (const row of rowsOf(tables[0].html)) {
    if (row.cells.length < 3 || row.cells[0].tag === 'th') continue;
    const [dateCell, nameCell, venueCell] = row.cells;
    const name = nameCell.text;
    if (!name) continue;
    const date = parseScheduleDate(dateCell.text, { fiscalYear });
    for (const w of date.warnings) notes.push(`${name}: ${w}`);
    const paren = /[(（](\d{1,2})\/(\d{1,2})[)）]\s*$/.exec(name);
    if (paren && date.start) {
      const [, m, d] = paren;
      if (date.start.slice(5) !== `${m.padStart(2, '0')}-${d.padStart(2, '0')}`) notes.push(`${name}: 大会名の括弧の日付(${m}/${d})が表の日付(${date.start})と違う。実施日・予備日の確認が必要`);
    }
    events.push({
      name,
      start: date.start,
      end: date.end,
      dateText: dateCell.text,
      prefecture: '兵庫県',
      city: '神戸市',
      venue: venueCell.text || null,
      eventType: classifyType(name),
      scope: 'in_prefecture',
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
  return parseKobeSchedule(res.text, { sourceUrl: url });
}
