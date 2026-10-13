// 金沢市グラウンドゴルフ協会「大会情報」。Jimdoの表（9列）: 日付・曜日・大会名・備考・予備日・会場・設営・実施要項・成績。
// 年はページ見出し（「2026 大会情報」）から。大会名の先頭の「市」「県」は主催の区分。
// 区分のない行（企業・団体の利用枠など）は一般向けの大会ではない可能性が高いため、公開候補にしない。
// 実施要項・成績はPDFなので取得しない。
import { parseSlashDate } from '../lib/dates.mjs';
import { classifyType, splitPlace } from '../lib/event.mjs';
import { findTables, rowsOf, textOf } from '../lib/html.mjs';

export const id = 'local-kanazawa-gga';

export function parseKanazawaSchedule(html, { sourceUrl }) {
  const events = [];
  const notes = [];
  const yearMatch = /(20\d{2})\s*大会情報/.exec(textOf(html));
  if (!yearMatch) return { events, notes: ['「○○○○ 大会情報」の見出し（年）が見つからない。ページ構造が変わった可能性'] };
  const year = Number(yearMatch[1]);
  const tables = findTables(html, 'mceEditable').filter((t) => /大会名/.test(t.html));
  if (!tables.length) return { events, notes: ['大会の表が見つからない。ページ構造が変わった可能性'] };
  const seen = new Set();
  for (const row of rowsOf(tables[0].html)) {
    if (row.cells.length < 6 || /日付/.test(row.cells[0].text)) continue;
    const [dateCell, wdCell, nameCell, , reserveCell, venueCell] = row.cells;
    const raw = nameCell.text;
    if (!raw) continue;
    const marker = /^(市|県)\s+(.*)$/.exec(raw);
    const name = marker ? marker[2].trim() : raw;
    const date = parseSlashDate(dateCell.text, wdCell.text, year);
    for (const w of date.warnings) notes.push(`${name}: ${w}`);
    const dupKey = `${date.start}|${name}`;
    if (seen.has(dupKey)) continue;
    seen.add(dupKey);
    const explicit = splitPlace(venueCell.text, null);
    events.push({
      name,
      start: date.start,
      end: date.end,
      dateText: `${dateCell.text}${wdCell.text ? `(${wdCell.text})` : ''}`,
      prefecture: explicit.prefecture || (marker && marker[1] === '市' ? '石川県' : null),
      city: explicit.prefecture ? explicit.city : marker && marker[1] === '市' ? '金沢市' : null,
      venue: venueCell.text || null,
      eventType: classifyType(name),
      scope: marker ? 'in_prefecture' : 'not_event',
      sponsorKind: marker ? (marker[1] === '市' ? '市の主催' : '県の主催') : '団体・企業の利用枠（一般向けでない可能性）',
      reserveDateText: reserveCell.text || null,
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
  const r = parseKanazawaSchedule(res.text, { sourceUrl: url });
  r.notes.push('実施要項・成績はPDFのため取得していない。予備日・設営班は出力していない');
  return r;
}
