// 山梨県グラウンドゴルフ協会「大会結果」一覧 (/tournament/)。WordPress の投稿一覧。
// 名前は「結果」だが、開催前の大会が載ることもあるため、日付で状態を判定する。1ページ目（最新）だけを読む。
import { parseSingleDate } from '../lib/dates.mjs';
import { classifyType } from '../lib/event.mjs';
import { decodeEntities, textOf } from '../lib/html.mjs';

export const id = 'pref-yamanashi';

export function parseYamanashiList(html) {
  const events = [];
  const notes = [];
  for (const m of html.matchAll(/<li class="box_conpe">([\s\S]*?)<\/li>/gi)) {
    const block = m[1];
    const href = /<a[^>]+href="([^"]+)"/i.exec(block);
    const time = /<time>([^<]*)<\/time>/i.exec(block);
    const ttl = /<p class="ttl">([\s\S]*?)<\/p>/i.exec(block);
    if (!href || !time || !ttl) {
      notes.push('一覧の1件を解釈できない（構造が変わった可能性）');
      continue;
    }
    const start = parseSingleDate(time[1]);
    const name = textOf(ttl[1]);
    if (!start || !name) {
      notes.push(`日付または名前を解釈できない: ${textOf(time[1])} / ${name}`);
      continue;
    }
    events.push({
      name,
      start,
      end: start,
      dateText: textOf(time[1]),
      prefecture: '山梨県',
      city: null,
      venue: null,
      eventType: classifyType(name),
      scope: 'in_prefecture',
      sourceUrl: decodeEntities(href[1]),
    });
  }
  if (!events.length) notes.push('一覧から1件も読み取れなかった（構造が変わった可能性）');
  return { events, notes };
}

export async function run(ctx) {
  const url = ctx.source.entry_urls[0];
  const res = await ctx.client.get(url);
  if (!res.ok) return { events: [], notes: [`取得できなかった: ${url}（${res.reason}）`] };
  const r = parseYamanashiList(res.text);
  r.notes.push('1ページ目（最新の一覧）のみ。詳細ページ（会場・要項）は取得していない');
  return r;
}
