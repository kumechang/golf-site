// 埼玉県グラウンド・ゴルフ協会 開催速報 (/info/info.php)。
// 開催前日・当日に、大会名・会場・開催日・開催速報を載せるページ。大会の「開催・中止」の確認用。
// 掲載があるときの形式がまだ分からないため、今は「掲載の有無」だけを調べ、掲載があれば人が気づけるよう注意に出す
// （形式を推測して誤った日付を作らない）。トップの大会一覧は結果（過去）で、年間予定はPDFのため対象外。
import { textOf } from '../lib/html.mjs';

export const id = 'pref-saitama';

export function parseSaitamaInfo(html) {
  const text = textOf(html);
  const body = text
    .replace(/^.*?開催状況をお知らせします/, '')
    .replace(/\d{4}\/\d{1,2}\/\d{1,2}更新/, '')
    .replace(/編集|◆|大会名|会\s*場|開催日|開催速報|掲載者|埼玉県グラウンド・ゴルフ協会/g, '')
    .trim();
  const updated = /(\d{4}\/\d{1,2}\/\d{1,2})更新/.exec(text);
  if (!/開催状況をお知らせします/.test(text)) return { events: [], notes: ['開催速報ページの見出しが見つからない。ページ構造が変わった可能性'] };
  if (!body) return { events: [], notes: [`開催速報の掲載なし（${updated ? updated[1] : '更新日不明'}更新）`] };
  return { events: [], notes: [`開催速報に掲載がある可能性（形式未対応）。人が確認し、readerを拡張する: ${body.slice(0, 80)}`] };
}

export async function run(ctx) {
  const url = ctx.source.entry_urls.find((u) => u.includes('/info/info.php'));
  if (!url) return { events: [], notes: ['台帳に /info/info.php がない'] };
  const res = await ctx.client.get(url);
  if (!res.ok) return { events: [], notes: [`取得できなかった: ${url}（${res.reason}）`] };
  return parseSaitamaInfo(res.text);
}
