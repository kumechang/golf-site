// クローラー出力の「人による確認」の仕組み。
// 方針：公開するのは、人が「承認」したイベントだけ。承認は idで記録し、日程や名前が変わると id が変わるため、再確認になる。
// 判断の記録は data/crawler/review/decisions.json（コミットする）。クローラーの出力そのものはコミットしない。
import { createHash } from 'node:crypto';

// 名前から、参加対象が限られる（一般の人が申し込めない）可能性があるもの
const RESTRICTED_NAME = /指導員|有資格者|優良プレーヤー|役員|顧問|選考会|予選会|選抜/;
// 全国・ブロック大会などは、県や市の代表選手が出る大会のことが多い（一般の人が申し込む大会ではない）
const REPRESENTATIVE_NAME = /全国|ブロック|九州地区|四国|中国地区|近畿|北信越|東海|関東地区|国民スポーツ|ねんりんピック|健康福祉祭/;

export const decisionStatuses = ['approved', 'rejected', 'duplicate_of'];
export const approvalLevels = ['local', 'block', 'national'];

export function eventId(row) {
  return 'E-' + createHash('sha1').update(`${row.key}|${row.source_id}`).digest('hex').slice(0, 8);
}

// ---- 重複の疑い -------------------------------------------------------------

const GENERIC = /グラウンド[・･]?ゴルフ|グランド[・･]?ゴルフ|ＧＧ|GG|交歓|交流|親善|記念|大会|競技|杯|第?\d+回|令和\d+年度?|20\d{2}年?度?|[()（）「」『』・･、。\s]/gi;
const KEYWORDS = ['ねんりんピック', '国民スポーツ', '国スポ', 'レディス', '健康福祉祭'];

export function coreName(name) {
  return name.normalize('NFKC').replace(GENERIC, '').replace(/の/g, '');
}

function bigrams(s) {
  const out = new Map();
  for (let i = 0; i < s.length - 1; i++) out.set(s.slice(i, i + 2), (out.get(s.slice(i, i + 2)) || 0) + 1);
  return out;
}

export function similarNames(a, b) {
  const x = coreName(a);
  const y = coreName(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const [short, long] = x.length <= y.length ? [x, y] : [y, x];
  if (short.length >= 3 && long.includes(short)) return true;
  for (const k of KEYWORDS) if (x.includes(k) && y.includes(k)) return true;
  const bx = bigrams(x);
  const by = bigrams(y);
  let inter = 0;
  for (const [g, n] of bx) inter += Math.min(n, by.get(g) || 0);
  const total = [...bx.values()].reduce((s, n) => s + n, 0) + [...by.values()].reduce((s, n) => s + n, 0);
  return total > 0 && (2 * inter) / total >= 0.6;
}

// 別々の情報源で、開始日・終了日が同じ公開候補どうしを組にする。
// strong: 名前も似ている（同じ大会の可能性が高い） / weak: 日程だけ同じ（別の大会のことが多い）
export function findDuplicateCandidates(rows) {
  const cand = rows.filter((r) => r.start_date);
  const pairs = [];
  for (let i = 0; i < cand.length; i++) {
    for (let j = i + 1; j < cand.length; j++) {
      const a = cand[i];
      const b = cand[j];
      if (a.source_id === b.source_id) continue;
      if (a.start_date !== b.start_date || (a.end_date || a.start_date) !== (b.end_date || b.start_date)) continue;
      pairs.push({ a: a.id, b: b.id, strength: similarNames(a.event_name, b.event_name) ? 'strong' : 'weak' });
    }
  }
  return pairs;
}

// ---- 判断の適用 -------------------------------------------------------------

export function indexDecisions(file) {
  const map = new Map();
  for (const d of file?.decisions || []) map.set(d.id, d);
  return map;
}

// 取得結果の行に id・注意の印・判断を付ける。today は 'YYYY-MM-DD'
export function annotate(rows, decisionsFile, today) {
  const dec = indexDecisions(decisionsFile);
  return rows.map((r) => {
    const id = eventId(r);
    const flags = [];
    if (!r.prefecture) flags.push('開催地の県が不明');
    if (r.official_source === false) flags.push('非公式の情報源');
    if (r.application_deadline && r.application_deadline < today && r.event_status === '開催予定') flags.push('申込締切を過ぎている');
    if (!r.venue) flags.push('会場が未記載');
    if (r.event_type === '研修・講習' || RESTRICTED_NAME.test(r.event_name)) flags.push('参加対象が限られる可能性（研修・指導員・優良プレーヤーなど）');
    if (REPRESENTATIVE_NAME.test(r.event_name)) flags.push('代表選手などに参加が限られる可能性（全国・ブロック大会など）');
    for (const w of r.warnings || []) flags.push(w);
    return { ...r, id, flags, decision: dec.get(id) || null };
  });
}

export function pendingList(annotated) {
  return annotated.filter((r) => r.publishable && !r.decision);
}

// 記録された判断のうち、今回の取得結果に見つからないもの（日程・名前の変更、掲載の取り下げなど）
export function staleDecisions(annotated, decisionsFile) {
  const ids = new Set(annotated.map((r) => r.id));
  return (decisionsFile?.decisions || []).filter((d) => !ids.has(d.id));
}

// 承認済みの一覧（公開してよいイベント）。却下・重複の統合先に回したもの・開催済みは含めない。
export function buildApproved(annotated, today) {
  const byId = new Map(annotated.map((r) => [r.id, r]));
  const approved = annotated.filter((r) => r.decision?.status === 'approved' && r.publishable && (r.end_date || r.start_date) >= today);
  return approved.map((r) => {
    const alsoListedIn = annotated.filter((x) => x.decision?.status === 'duplicate_of' && x.decision.duplicate_of === r.id).map((x) => x.source_url);
    return {
      id: r.id,
      name: r.event_name,
      start_date: r.start_date,
      end_date: r.end_date,
      prefecture: r.prefecture,
      city: r.city,
      venue: r.venue,
      listed_by: r.listed_by,
      event_type: r.event_type,
      application_deadline: r.application_deadline,
      official_source: r.official_source,
      source_url: r.source_url,
      also_listed_in: alsoListedIn,
      last_checked_at: r.last_checked_at,
      level: r.decision.level,
      ...(r.decision.organizer ? { organizer: r.decision.organizer } : {}),
      ...(r.decision.display_name ? { display_name: r.decision.display_name } : {}),
      ...(r.decision.public_note ? { public_note: r.decision.public_note } : {}),
      note: r.decision.note || null,
    };
  }).filter((x) => byId.has(x.id));
}

export function validateDecision(d) {
  if (!d.id || !/^E-[0-9a-f]{8}$/.test(d.id)) return 'id の形式が正しくない';
  if (!decisionStatuses.includes(d.status)) return `status は ${decisionStatuses.join(' / ')} のいずれか`;
  if (d.status === 'duplicate_of' && !/^E-[0-9a-f]{8}$/.test(d.duplicate_of || '')) return 'duplicate_of に統合先の id が必要';
  // 承認には公開時の区分（level）が必須。未設定のまま県のセクションに出てしまうのを防ぐ。
  if (d.status === 'approved' && !approvalLevels.includes(d.level)) return `承認には --level=${approvalLevels.join('|')} が必要（local=県のセクション、block/national=全国・ブロック大会の別枠）`;
  return null;
}

// ---- レポート ---------------------------------------------------------------

const fmtDate = (r) => (r.end_date && r.end_date !== r.start_date ? `${r.start_date}〜${r.end_date.slice(5)}` : r.start_date);
const place = (r) => [r.prefecture, r.city].filter(Boolean).join('') || '（県不明）';
const esc = (s) => String(s ?? '').replace(/\|/g, '／');

export function renderReview({ annotated, decisionsFile, today, generatedAt }) {
  const pending = pendingList(annotated);
  const pairs = findDuplicateCandidates(annotated.filter((r) => r.publishable));
  const byId = new Map(annotated.map((r) => [r.id, r]));
  const stale = staleDecisions(annotated, decisionsFile);
  const decided = annotated.filter((r) => r.publishable && r.decision);
  const count = (s) => decided.filter((r) => r.decision.status === s).length;
  const L = [];
  L.push('# イベント確認レポート', '', `- 作成: ${generatedAt}`, `- 今日（日本時間）: ${today}`, '');
  L.push('## 概要', '', `- 公開候補: ${annotated.filter((r) => r.publishable).length}件（要判断 ${pending.length} / 承認済み ${count('approved')} / 却下 ${count('rejected')} / 重複として統合 ${count('duplicate_of')}）`);
  L.push(`- 取得した全件: ${annotated.length}件（大会以外・開催済み・日程未定を含む）`, `- 記録された判断のうち今回見つからないもの: ${stale.length}件`, '');
  L.push('判断のしかた: `npm run review:events -- decide <id> approve|reject|dup:<統合先id> "メモ"`。承認したものだけが `data/events/approved.json` に入る。', '');

  L.push('## 要判断', '');
  if (!pending.length) L.push('なし', '');
  else {
    L.push('| id | 日程 | 大会名 | 種別 | 開催地 | 会場 | 情報源 | 注意 |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const r of pending.sort((a, b) => (a.start_date || '').localeCompare(b.start_date || ''))) {
      L.push(`| ${r.id} | ${fmtDate(r)} | ${esc(r.event_name)} | ${r.event_type} | ${esc(place(r))} | ${esc(r.venue || '')} | ${r.source_id} | ${esc(r.flags.join('、'))} |`);
    }
    L.push('');
  }

  const strong = pairs.filter((p) => p.strength === 'strong');
  const weak = pairs.filter((p) => p.strength === 'weak');
  L.push('## 重複の疑い', '');
  if (!pairs.length) L.push('なし', '');
  else {
    const line = (p) => `- ${fmtDate(byId.get(p.a))}: ${p.a}「${byId.get(p.a).event_name}」（${byId.get(p.a).source_id}） と ${p.b}「${byId.get(p.b).event_name}」（${byId.get(p.b).source_id}）`;
    if (strong.length) L.push('### 同じ大会の可能性が高い（日程が同じで名前も似ている）', '', ...strong.map(line), '');
    if (weak.length) L.push('### 日程だけ同じ（別の大会のことが多い）', '', ...weak.map(line), '');
  }

  const approved = decided.filter((r) => r.decision.status === 'approved');
  L.push('## 承認済み', '');
  if (!approved.length) L.push('なし', '');
  else for (const r of approved) L.push(`- ${r.id} ${fmtDate(r)} ${r.event_name}（${place(r)}）${r.decision.note ? ` — ${r.decision.note}` : ''}`);
  if (approved.length) L.push('');

  if (stale.length) {
    L.push('## 今回見つからなかった判断（日程や名前が変わった・掲載が消えた可能性）', '');
    for (const d of stale) L.push(`- ${d.id} ${d.status}${d.note ? ` — ${d.note}` : ''}（決定日 ${d.decided_at || '不明'}）`);
    L.push('');
  }
  return L.join('\n');
}
