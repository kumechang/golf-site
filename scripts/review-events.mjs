// イベントの確認（レポート作成・判断の記録・承認済み一覧の作成）。
//   node scripts/review-events.mjs [report] [--in=<クローラー出力のディレクトリ>] [--today=YYYY-MM-DD]
//   node scripts/review-events.mjs decide <id> approve|reject|dup:<統合先id> ["メモ"] [--in=…]
//     approve には --level=local|block|national が必須。任意: --organizer= --display-name= --public-note=
//   node scripts/review-events.mjs build [--in=…]     # 承認済みを data/events/approved.json に書く
// --decisions=<path> / --approved=<path> で保存先を変えられる（試すときに本物のファイルを汚さない）
// --in を省略すると data/crawler/out の最新の出力を使う。
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { annotate, buildApproved, renderReview, validateDecision } from './crawler/lib/review.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flags = Object.fromEntries(argv.filter((a) => a.startsWith('--')).map((a) => { const m = /^--([^=]+)(?:=(.*))?$/.exec(a); return [m[1], m[2] ?? true]; }));
const pos = argv.filter((a) => !a.startsWith('--'));
const cmd = ['report', 'decide', 'build'].includes(pos[0]) ? pos.shift() : 'report';

const decisionsPath = flags.decisions || join(root, 'data', 'crawler', 'review', 'decisions.json');
const approvedPath = flags.approved || join(root, 'data', 'events', 'approved.json');
const today = flags.today || new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

function latestOutDir() {
  const base = join(root, 'data', 'crawler', 'out');
  if (!existsSync(base)) return null;
  const dirs = readdirSync(base).filter((d) => existsSync(join(base, d, 'events.json'))).sort();
  return dirs.length ? join(base, dirs[dirs.length - 1]) : null;
}
const inDir = flags.in || latestOutDir();
if (!inDir) {
  console.error('クローラーの出力が見つかりません。先に npm run crawl:events を実行するか、--in を指定してください');
  process.exit(1);
}
const crawl = JSON.parse(readFileSync(join(inDir, 'events.json'), 'utf-8'));
const decisionsFile = existsSync(decisionsPath) ? JSON.parse(readFileSync(decisionsPath, 'utf-8')) : { version: 1, decisions: [] };
const annotated = annotate(crawl.events, decisionsFile, today);

if (cmd === 'report') {
  const md = renderReview({ annotated, decisionsFile, today, generatedAt: new Date().toISOString() });
  writeFileSync(join(inDir, 'review.md'), md);
  console.log(md);
  console.log(`\n（${join(inDir, 'review.md')} に保存）`);
} else if (cmd === 'decide') {
  const [id, action, ...rest] = pos;
  if (!id || !action) {
    console.error('使い方: decide <id> approve|reject|dup:<統合先id> ["メモ"]（approve は --level=local|block|national が必須）');
    process.exit(1);
  }
  const target = annotated.find((r) => r.id === id);
  if (!target) {
    console.error(`id ${id} が今回の出力に見つかりません`);
    process.exit(1);
  }
  const d = { id, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action.startsWith('dup:') ? 'duplicate_of' : action, decided_at: today, name: target.event_name, start_date: target.start_date, source_id: target.source_id };
  if (d.status === 'duplicate_of') {
    d.duplicate_of = action.slice(4);
    if (!annotated.some((r) => r.id === d.duplicate_of)) {
      console.error(`統合先 ${d.duplicate_of} が今回の出力に見つかりません`);
      process.exit(1);
    }
  }
  const note = rest.join(' ').trim();
  if (note) d.note = note;
  if (d.status === 'approved') {
    // level: local=県のセクション / block・national=全国・ブロック大会の別枠。organizer は要項などで主催者を確認できたときだけ。
    if (flags.level) d.level = flags.level;
    if (flags.organizer) d.organizer = flags.organizer;
    if (flags['display-name']) d.display_name = flags['display-name'];
    if (flags['public-note']) d.public_note = flags['public-note'];
  }
  const err = validateDecision(d);
  if (err) {
    console.error(err);
    process.exit(1);
  }
  decisionsFile.decisions = decisionsFile.decisions.filter((x) => x.id !== id).concat(d);
  decisionsFile.decisions.sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '') || a.id.localeCompare(b.id));
  mkdirSync(dirname(decisionsPath), { recursive: true });
  writeFileSync(decisionsPath, JSON.stringify(decisionsFile, null, 2) + '\n');
  console.log(`記録しました: ${id}「${target.event_name}」→ ${d.status}`);
} else if (cmd === 'build') {
  const events = buildApproved(annotated, today);
  const noLevel = events.filter((e) => !['local', 'block', 'national'].includes(e.level));
  if (noLevel.length) {
    console.error(`level が未設定の承認があります（decide <id> approve --level=local|block|national で付け直してください）: ${noLevel.map((e) => e.id).join(', ')}`);
    process.exit(1);
  }
  mkdirSync(dirname(approvedPath), { recursive: true });
  writeFileSync(approvedPath, JSON.stringify({ generated_at: new Date().toISOString(), today, events }, null, 2) + '\n');
  console.log(`承認済み ${events.length}件を ${approvedPath} に書きました`);
}
