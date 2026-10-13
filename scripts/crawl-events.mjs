// イベント情報クローラー（ドライバ）。
//   node scripts/crawl-events.mjs [--only=pref-saga] [--out-dir=<dir>] [--today=YYYY-MM-DD] [--max-pages=200]
// 取得するのは data/crawler/sources.json で status が "allowed" の情報源のうち、読み取り処理(reader)があるものだけ。
// 出力は events.json / events.csv / report.md（DBには触れない。人が確認してから取り込む）。
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient, USER_AGENT } from './crawler/lib/http.mjs';
import { eventKey, statusFor } from './crawler/lib/event.mjs';
import * as saga from './crawler/sources/saga.mjs';

const READERS = { [saga.id]: saga };
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);
const today = args.today || new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); // 日本時間の今日
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = args['out-dir'] || join(root, 'data', 'crawler', 'out', stamp);

const registry = JSON.parse(readFileSync(join(root, 'data', 'crawler', 'sources.json'), 'utf-8'));
const targets = registry.sources.filter((s) => s.status === 'allowed' && READERS[s.reader] && (!args.only || args.only === s.id));
if (!targets.length) {
  console.error('取得対象がありません（status=allowed かつ reader のある情報源が無い）');
  process.exit(1);
}

const hostDelayMs = {};
for (const s of targets) if (s.delay) hostDelayMs[new URL(s.origin).host] = s.delay * 1000;
const client = createClient({ maxPages: Number(args['max-pages'] || 200), hostDelayMs });

const nowIso = new Date().toISOString();
const rows = [];
const report = [];
for (const source of targets) {
  const reader = READERS[source.reader];
  const result = await reader.run({ source, client, today });
  const events = result.events || [];
  for (const e of events) {
    const eventStatus = statusFor(e, today);
    const publishable = e.scope !== 'not_event' && eventStatus === '開催予定';
    rows.push({
      source_id: source.id,
      event_name: e.name,
      start_date: e.start,
      end_date: e.end,
      date_text: e.dateText,
      prefecture: e.prefecture,
      city: e.city,
      venue: e.venue,
      organizer: source.organizer || null,
      event_type: e.eventType,
      scope: e.scope,
      event_status: eventStatus,
      official_source: source.official !== false,
      publishable,
      source_url: e.sourceUrl,
      last_checked_at: nowIso,
      key: eventKey({ prefecture: e.prefecture, start: e.start, name: e.name }),
    });
  }
  report.push({ source, count: events.length, notes: result.notes || [] });
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'events.json'), JSON.stringify({ generated_at: nowIso, today, user_agent: USER_AGENT, events: rows }, null, 2));
const cols = Object.keys(rows[0] || { source_id: '' });
const esc = (v) => (v === null || v === undefined ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
writeFileSync(join(outDir, 'events.csv'), '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n') + '\n');

const lines = [`# クローラー実行レポート`, ``, `- 実行日時: ${nowIso}`, `- 今日（日本時間）: ${today}`, `- User-Agent: ${USER_AGENT}`, `- 取得ページ数: ${client.stats().pages}`, ``];
for (const r of report) {
  const mine = rows.filter((x) => x.source_id === r.source.id);
  lines.push(`## ${r.source.name}（${r.source.id}）`, ``, `- 読み取った行: ${r.count}`, `- 公開候補（大会等・開催予定）: ${mine.filter((x) => x.publishable).length}`, `- 日程未定: ${mine.filter((x) => x.event_status === '日程未定').length}`, `- 開催済み: ${mine.filter((x) => x.event_status === '開催済み').length}`, `- 大会以外（会議・研修など）: ${mine.filter((x) => x.scope === 'not_event').length}`);
  if (r.notes.length) lines.push(``, `### 注意`, ...r.notes.map((n) => `- ${n}`));
  lines.push(``);
}
writeFileSync(join(outDir, 'report.md'), lines.join('\n'));
console.log(`出力: ${outDir}`);
console.log(lines.join('\n'));
