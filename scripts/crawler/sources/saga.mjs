// 佐賀県グラウンド・ゴルフ協会「大会スケジュール」(schedule.html)
// 表の行クラス: 無印=県内の大会 / not_saga=県外の大会 / not_convention=大会以外（会議・研修など）
import { parseScheduleDate } from '../lib/dates.mjs';
import { classifyType, splitPlace } from '../lib/event.mjs';
import { findTables, rowsOf, textOf } from '../lib/html.mjs';

export const id = 'pref-saga';

export function parseSagaSchedule(html, { sourceUrl, today }) {
  const events = [];
  const notes = [];
  const fy = /(\d{4})年度大会スケジュール/.exec(textOf(html));
  if (!fy) return { events, notes: ['年度の見出し（○○○○年度大会スケジュール）が見つからない。ページ構造が変わった可能性'] };
  const fiscalYear = Number(fy[1]);
  const tables = findTables(html, 'schedule');
  if (!tables.length) return { events, notes: ['スケジュールの表が見つからない。ページ構造が変わった可能性'] };
  for (const row of rowsOf(tables[0].html)) {
    if (row.cells.length < 4 || row.cells[0].tag === 'th') continue;
    const [dateCell, nameCell, cityCell, venueCell] = row.cells;
    const name = nameCell.text;
    if (!name) continue;
    const date = parseScheduleDate(dateCell.text, { fiscalYear });
    for (const w of date.warnings) notes.push(`${name}: ${w}`);
    const { prefecture, city } = splitPlace(cityCell.text, '佐賀県');
    const scope = /not_convention/.test(row.className) ? 'not_event' : /not_saga/.test(row.className) ? 'out_of_prefecture' : 'in_prefecture';
    events.push({
      name,
      start: date.start,
      end: date.end,
      dateText: dateCell.text,
      dateReason: date.reason || null,
      prefecture,
      city,
      venue: venueCell.text || null,
      eventType: classifyType(name),
      scope,
      sourceUrl,
    });
  }
  if (!events.length) notes.push('表から行を1件も読み取れなかった');
  return { events, notes, fiscalYear };
}

export async function run(ctx) {
  const url = ctx.source.entry_urls[0];
  const res = await ctx.client.get(url);
  if (!res.ok) return { events: [], notes: [`取得できなかった: ${url}（${res.reason}）`] };
  return parseSagaSchedule(res.text, { sourceUrl: url, today: ctx.today });
}
