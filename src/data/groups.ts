// 市区町村の資料に載っていた、グラウンド・ゴルフの団体（協会・連盟・クラブ・同好会など）。data/places/groups.json
// （scripts/places/import-groups.mjs で生成）を読み、検証して都道府県ごとに返す。壊れたデータは黙って公開せず、ビルドを失敗させる。
// 載せるのは 団体名・種類・活動の場所・活動日の文・元の資料のURL・資料の年度（古いときだけ）。代表者名・電話・メールは持たない。
import raw from '../../data/places/groups.json';
import { prefectures } from './prefectures';

// 市区町村コードの先頭2桁（JIS X 0401の都道府県番号）= この配列の位置 + 1
const JIS_ORDER = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'];
const KINDS = ['協会', '連盟', 'クラブ', '同好会'];
const PERSONAL = /代表|会長|氏名|携帯|メール|@|https?:|0\d{1,4}-\d{1,4}-\d{3,4}/;

export interface GroupItem {
  id: string;
  municipality: string;
  code: string;
  name: string;
  kind: string | null;
  place: string | null;
  schedule: string | null;
  url: string;
  sourceYear: string | null; // 資料が古いときだけ入る（画面に年度を出す）
  search: string;
}

function fail(where: string, msg: string): never {
  throw new Error(`[groups] ${where}: ${msg}`);
}

let cache: GroupItem[] | null = null;
function load(): GroupItem[] {
  if (cache) return cache;
  const list = (raw as { groups?: unknown }).groups;
  if (!Array.isArray(list)) throw new Error('[groups] data/places/groups.json に groups がありません');
  const seen = new Set<string>();
  const out: GroupItem[] = [];
  for (const r of list as Record<string, unknown>[]) {
    const id = String(r.id ?? '');
    if (!id) fail('(id なし)', 'id がありません');
    if (seen.has(id)) fail(id, 'id が重複しています');
    seen.add(id);
    const name = typeof r.name === 'string' ? r.name : '';
    if (!name || name.length > 40) fail(id, `団体名が正しくありません: ${name}`);
    if (PERSONAL.test(name)) fail(id, `団体名に個人情報とみられる語があります: ${name}`);
    const code = typeof r.municipality_code === 'string' ? r.municipality_code : '';
    const idx = JIS_ORDER.indexOf(String(r.prefecture));
    if (idx < 0 || !prefectures.some((p) => p.name === r.prefecture)) fail(id, `都道府県名が見つかりません: ${r.prefecture}`);
    if (!/^\d{5}$/.test(code) || Number(code.slice(0, 2)) !== idx + 1) fail(id, `市区町村コードが都道府県と合いません: ${code}`);
    const municipality = typeof r.municipality === 'string' ? r.municipality : '';
    if (!municipality) fail(id, '市区町村名がありません');
    const url = typeof r.source_url === 'string' ? r.source_url : '';
    try { const u = new URL(url); if (u.protocol !== 'https:' || u.username || u.password) fail(id, 'https でないか、URLにユーザー情報が含まれています'); } catch { fail(id, `URLを解釈できません: ${url}`); }
    const kind = r.kind == null ? null : String(r.kind);
    if (kind !== null && !KINDS.includes(kind)) fail(id, `種類が正しくありません: ${kind}`);
    const place = r.place == null ? null : String(r.place);
    const schedule = r.schedule == null ? null : String(r.schedule);
    for (const [k, v] of [['場所', place], ['活動日', schedule]] as const) {
      if (v !== null && (v.length > 100 || PERSONAL.test(v))) fail(id, `${k}に載せられない形があります: ${v}`);
    }
    const stale = r.stale === true;
    const sourceYear = r.source_year == null ? null : String(r.source_year);
    if (stale && !sourceYear) fail(id, '古い資料なのに年度がありません');
    out.push({ id, municipality, code, name, kind, place, schedule, url, sourceYear: stale ? sourceYear : null, search: `${municipality} ${name} ${kind ?? ''} ${place ?? ''}` });
  }
  cache = out;
  return out;
}

export function getGroupsBySlug(slug: string): GroupItem[] {
  const pref = prefectures.find((p) => p.slug === slug);
  const idx = pref ? JIS_ORDER.indexOf(pref.name) : -1;
  if (idx < 0) throw new Error(`[groups] 未知の都道府県slug: ${slug}`);
  const prefix = String(idx + 1).padStart(2, '0');
  return load().filter((g) => g.code.startsWith(prefix));
}

// 団体を載せている市区町村の数（検証・記録用）
export const groupsSummary = () => ({ groups: load().length, municipalities: new Set(load().map((g) => g.code)).size });
