// 都道府県別の予定表のデータを作る。ビルド（ページ）と astro.config.mjs（sitemap・noindexの判定）の両方から使うため、
// 型に依存しない .mjs にしてある。データは、運営者が確認して承認した大会（data/events/approved.json）と、
// 市区町村の公式サイトから集めて整えたもの（data/events/municipal.json。scripts/events/clean-municipal.mjs が作る）。

export const PAST_DAYS = 365; // 終了した予定を載せる期間（日）
export const MIN_DATED_FOR_INDEX = 5; // 検索に載せる（index）ための、日付の分かる予定の最低件数（終了分を含む）
export const MIN_MUNICIPALITIES_FOR_INDEX = 2;

export const JIS_PREFECTURES = [
  ['北海道', 'hokkaido'], ['青森県', 'aomori'], ['岩手県', 'iwate'], ['宮城県', 'miyagi'], ['秋田県', 'akita'], ['山形県', 'yamagata'], ['福島県', 'fukushima'],
  ['茨城県', 'ibaraki'], ['栃木県', 'tochigi'], ['群馬県', 'gunma'], ['埼玉県', 'saitama'], ['千葉県', 'chiba'], ['東京都', 'tokyo'], ['神奈川県', 'kanagawa'],
  ['新潟県', 'niigata'], ['富山県', 'toyama'], ['石川県', 'ishikawa'], ['福井県', 'fukui'], ['山梨県', 'yamanashi'], ['長野県', 'nagano'], ['岐阜県', 'gifu'],
  ['静岡県', 'shizuoka'], ['愛知県', 'aichi'], ['三重県', 'mie'], ['滋賀県', 'shiga'], ['京都府', 'kyoto'], ['大阪府', 'osaka'], ['兵庫県', 'hyogo'],
  ['奈良県', 'nara'], ['和歌山県', 'wakayama'], ['鳥取県', 'tottori'], ['島根県', 'shimane'], ['岡山県', 'okayama'], ['広島県', 'hiroshima'], ['山口県', 'yamaguchi'],
  ['徳島県', 'tokushima'], ['香川県', 'kagawa'], ['愛媛県', 'ehime'], ['高知県', 'kochi'], ['福岡県', 'fukuoka'], ['佐賀県', 'saga'], ['長崎県', 'nagasaki'],
  ['熊本県', 'kumamoto'], ['大分県', 'oita'], ['宮崎県', 'miyazaki'], ['鹿児島県', 'kagoshima'], ['沖縄県', 'okinawa'],
];
const PREF_NAMES = new Set(JIS_PREFECTURES.map(([n]) => n));

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isRealDate = (s) => typeof s === 'string' && DATE.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const jst = (iso) => new Date(Date.parse(iso) + 9 * 3600e3).toISOString().slice(0, 10);
const addDays = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86400e3).toISOString().slice(0, 10);
const fail = (id, msg) => { throw new Error(`[pref-events] ${id}: ${msg}`); };

/** 名前の比較用（回数・年度・記号を除く） */
const key = (n) => String(n).normalize('NFKC').replace(/第\s*\d+\s*回/g, '').replace(/(令和|R)\s*\d+年度?/g, '').replace(/20\d{2}年?度?/g, '').replace(/[\s・･\-ー「」『』（）()]/g, '').toLowerCase();
const bigrams = (s) => { const set = new Set(); for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2)); return set; };
function similar(a, b) {
  const x = bigrams(key(a)), y = bigrams(key(b));
  if (!x.size || !y.size) return false;
  let inter = 0; for (const g of x) if (y.has(g)) inter++;
  return inter / (x.size + y.size - inter) >= 0.5;
}

/** 承認済みの大会と、市区町村の予定を、同じ形にそろえる（検証つき）。同じ大会の重複はまとめる。 */
export function normalizeAll(approved, municipal) {
  const out = [];
  const seen = new Set();
  for (const r of approved?.events ?? []) {
    const id = r.id;
    if (!str(r.name) || !PREF_NAMES.has(r.prefecture) || !isRealDate(r.start_date)) fail(id, '承認済みの大会の項目が正しくありません');
    out.push({
      id: String(id), source: 'association', kind: 'association', name: str(r.display_name) ?? str(r.name), prefecture: r.prefecture, municipality: str(r.city),
      start: r.start_date, end: isRealDate(r.end_date) ? r.end_date : r.start_date, dateKind: 'exact', venue: str(r.venue), organizer: str(r.organizer), listedBy: str(r.listed_by),
      target: null, fee: null, deadline: isRealDate(r.application_deadline) ? r.application_deadline : null, contactDept: null, contactPhone: null,
      cancelled: false, postponed: false, sourceUrl: r.source_url, readAt: jst(r.last_checked_at),
    });
  }
  for (const r of municipal?.events ?? []) {
    const id = r.id;
    if (typeof id !== 'string' || !/^M-[0-9a-f]{8}$/.test(id)) fail(id, 'id の形式が正しくありません');
    if (seen.has(id)) fail(id, 'id が重複しています');
    seen.add(id);
    if (!str(r.name)) fail(id, '名前がありません');
    if (!PREF_NAMES.has(r.prefecture)) fail(id, `都道府県名が見つかりません: ${r.prefecture}`);
    if (!/^https:\/\//.test(r.source_url ?? '')) fail(id, '元ページのURLが https ではありません');
    if (r.start != null && (!isRealDate(r.start) || !isRealDate(r.end) || r.end < r.start)) fail(id, `日付が正しくありません（${r.start}〜${r.end}）`);
    if (r.contact_phone != null && !/^\d{2,4}-\d{2,4}-\d{3,4}$/.test(r.contact_phone)) fail(id, '電話番号の形式が正しくありません');
    if (!r.extracted_at || Number.isNaN(Date.parse(r.extracted_at))) fail(id, '読み取り日時が正しくありません');
    out.push({
      id, source: 'municipal', kind: r.kind === 'multi' ? 'multi' : 'gg', name: str(r.name), prefecture: r.prefecture, municipality: str(r.municipality),
      start: r.start ?? null, end: r.end ?? null, dateKind: r.start ? (r.date_kind === 'range' ? 'range' : 'exact') : 'unknown',
      venue: str(r.venue), organizer: str(r.organizer), listedBy: null, target: str(r.target), fee: str(r.fee),
      deadline: isRealDate(r.deadline) ? r.deadline : null, contactDept: str(r.contact_dept), contactPhone: str(r.contact_phone),
      cancelled: Boolean(r.cancelled), postponed: Boolean(r.postponed), sourceUrl: r.source_url, readAt: jst(r.extracted_at),
    });
  }
  // 承認済みの大会と市区町村の予定が同じ大会なら、承認済みのほうを残し、足りない項目を補う
  const merged = [];
  for (const e of out) {
    const twin = e.source === 'municipal' && e.start ? out.find((a) => a.source === 'association' && a.prefecture === e.prefecture && a.start === e.start && similar(a.name, e.name)) : null;
    if (twin) {
      for (const f of ['venue', 'organizer', 'target', 'fee', 'deadline', 'contactDept', 'contactPhone']) if (!twin[f] && e[f]) twin[f] = e[f];
      continue;
    }
    merged.push(e);
  }
  return merged;
}

/** 今日（日本時間）を基準に、今後・日程不明・終了（直近 PAST_DAYS 日）に分ける */
export function classify(events, today) {
  const cutoff = addDays(today, -PAST_DAYS);
  const up = [], undated = [], past = [];
  for (const e of events) {
    if (!e.start) undated.push(e);
    else if (e.end >= today) up.push(e);
    else if (e.end >= cutoff) past.push(e);
  }
  up.sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end) || a.id.localeCompare(b.id));
  past.sort((a, b) => b.start.localeCompare(a.start) || a.id.localeCompare(b.id));
  undated.sort((a, b) => (a.municipality ?? '').localeCompare(b.municipality ?? '') || a.name.localeCompare(b.name));
  return { up, undated, past };
}

/** 県ごとの集計。ページを作るか、検索に載せるか（index）を決める。 */
export function summarize(events, today) {
  const by = new Map();
  for (const e of events) { if (!by.has(e.prefecture)) by.set(e.prefecture, []); by.get(e.prefecture).push(e); }
  const result = new Map();
  for (const [name, slug] of JIS_PREFECTURES) {
    const list = by.get(name) ?? [];
    const { up, undated, past } = classify(list, today);
    const shown = [...up, ...undated, ...past];
    const municipalities = new Set(shown.map((e) => e.municipality).filter(Boolean));
    const dated = up.length + past.length;
    const readAts = shown.map((e) => e.readAt).sort();
    result.set(name, {
      name, slug, up, undated, past,
      municipalityCount: municipalities.size,
      hasPage: shown.length > 0,
      indexable: dated >= MIN_DATED_FOR_INDEX && municipalities.size >= MIN_MUNICIPALITIES_FOR_INDEX,
      latestReadAt: readAts.at(-1) ?? null,
      oldestReadAt: [...up, ...undated].map((e) => e.readAt).sort()[0] ?? readAts[0] ?? null,
    });
  }
  return result;
}
