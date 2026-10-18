// 市区町村の案内に「グラウンドゴルフ」の記載がある施設。data/places/places.json（scripts/places で生成）を読み、
// 検証して都道府県ごとにまとめる。壊れたデータは黙って公開せず、ビルドを失敗させる。
// 載せるのは 施設名・市区町村・元ページのURL・取得日 だけ（自治体ページの本文は持たない）。
import raw from '../../data/places/places.json';
import overridesRaw from '../../data/places/overrides.json';
import { prefectures } from './prefectures';
import { jstDate } from './events';

// 市区町村コードの先頭2桁（JIS X 0401の都道府県番号）= この配列の位置 + 1。prefectures.ts は地方順で JIS 順ではないため別に持つ。
const JIS_ORDER = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'];

export interface PlaceItem {
  kind: 'facility' | 'listing';
  name: string | null;
  municipality: string;
  code: string;
  url: string;
  surveyedAt: string; // YYYY-MM-DD（日本時間）
}

export interface PlaceGroup {
  code: string;
  municipality: string;
  facilities: PlaceItem[];
  listings: PlaceItem[];
  count: number;
}

export interface PrefecturePlaces {
  total: number;
  municipalityCount: number;
  from: string | null;
  to: string | null;
  groups: PlaceGroup[];
}

// 運営者の判断（再生成しても消えない）。source_url をキーに、除外・名前の修正・一覧ページへの降格を指定する。
interface Override { source_url: string; exclude?: boolean; name?: string; as_listing?: boolean }

// 施設名として載せてはいけない形。当サイトが「利用できます」と言う形になるもの、手続き・UI文言・日付など。
const NAME_LINT = [
  /[\p{Extended_Pictographic}]/u,
  /\d{4}[-/年]\d{1,2}|令和\d|平成\d/,
  /別ウ[ィイ]ンドウ|PDF|ページへ|詳細ページ|はこちら/,
  /できます|ください|申請|申込|お知らせ|ルール|マナー|について/,
  /[（(][^）)]*(課|係|室)[）)]/,
  /令和|年度|学級|周年|動画|Q&A|ナイター|無料|有料|開放|\.\.|_$|[(（][^)）]*$/,
];
const MAX_NAME = 40;

function fail(where: string, msg: string): never {
  throw new Error(`[places] ${where}: ${msg}`);
}

let cache: PlaceItem[] | null = null;
let excludedCount = 0;

function load(): PlaceItem[] {
  if (cache) return cache;
  const list = (raw as { places?: unknown }).places;
  if (!Array.isArray(list)) throw new Error('[places] data/places/places.json に places がありません');
  const overrides = new Map<string, Override>(((overridesRaw as { overrides?: Override[] }).overrides ?? []).map((o) => [o.source_url, o]));
  const seenUrl = new Set<string>();
  const seenName = new Set<string>();
  const out: PlaceItem[] = [];
  for (const r of list as Record<string, unknown>[]) {
    const url = typeof r.source_url === 'string' ? r.source_url : '';
    if (!url) fail('(url なし)', '元ページのURLがありません');
    let u: URL;
    try { u = new URL(url); } catch { return fail(url, 'URLを解釈できません'); }
    if (u.protocol !== 'https:') fail(url, 'https ではありません');
    if (u.username || u.password) fail(url, 'URLにユーザー情報が含まれています');
    if (seenUrl.has(url)) fail(url, 'URLが重複しています');
    seenUrl.add(url);
    const flags = Array.isArray(r.flags) ? r.flags : [];
    if (flags.length > 0) { excludedCount++; continue; } // 確認用の印があるものは載せない
    const ov = overrides.get(url);
    if (ov?.exclude) { excludedCount++; continue; }

    let kind: PlaceItem['kind'];
    if (r.kind !== 'facility' && r.kind !== 'listing') return fail(url, 'kind が facility / listing ではありません');
    kind = r.kind;
    let name = typeof r.name === 'string' ? r.name : null;
    if (ov?.name && kind === 'facility') name = ov.name;
    if (ov?.as_listing) { kind = 'listing'; name = null; }
    if (kind === 'facility' && !name) fail(url, '施設名がありません');
    if (kind === 'listing' && name) fail(url, '一覧ページに施設名が入っています');
    if (kind === 'facility') {
      if (name!.length > MAX_NAME) fail(url, `施設名が長すぎます: ${name}`);
      for (const re of NAME_LINT) if (re.test(name!)) fail(url, `施設名に載せられない形が含まれています: ${name}（data/places/overrides.json で直すか降格してください）`);
    }
    const municipality = typeof r.municipality === 'string' ? r.municipality : '';
    const code = typeof r.municipality_code === 'string' ? r.municipality_code : '';
    const prefName = typeof r.prefecture === 'string' ? r.prefecture : '';
    const idx = JIS_ORDER.indexOf(prefName);
    if (idx < 0 || !prefectures.some((p) => p.name === prefName)) fail(url, `都道府県名が見つかりません: ${prefName}`);
    if (!/^\d{5}$/.test(code) || Number(code.slice(0, 2)) !== idx + 1) fail(url, `市区町村コードが都道府県と合いません: ${code}`);
    if (!municipality) fail(url, '市区町村名がありません');
    const surveyed = typeof r.surveyed_at === 'string' ? r.surveyed_at : '';
    if (Number.isNaN(Date.parse(surveyed))) fail(url, `取得日時が正しくありません: ${surveyed}`);
    if (kind === 'facility') {
      const key = `${code}|${name}`;
      if (seenName.has(key)) fail(url, `同じ市区町村に同じ施設名があります: ${municipality} ${name}`);
      seenName.add(key);
    }
    out.push({ kind, name, municipality, code, url, surveyedAt: jstDate(surveyed) });
  }
  cache = out;
  const oldest = out.map((p) => p.surveyedAt).sort()[0];
  if (oldest && (Date.now() - Date.parse(`${oldest}T00:00:00Z`)) / 86400e3 >= 180) {
    console.warn(`[places] 最も古い取得日（${oldest}）から180日以上たっています。再調査を検討してください。`);
  }
  console.log(`[places] 掲載 ${out.length}件（印あり・除外 ${excludedCount}件は載せていません）`);
  return out;
}

export function getPlacesBySlug(slug: string): PrefecturePlaces {
  const pref = prefectures.find((p) => p.slug === slug);
  const idx = pref ? JIS_ORDER.indexOf(pref.name) : -1;
  if (idx < 0) throw new Error(`[places] 未知の都道府県slug: ${slug}`);
  const prefix = String(idx + 1).padStart(2, '0');
  const items = load().filter((p) => p.code.startsWith(prefix));
  const byCode = new Map<string, PlaceGroup>();
  for (const it of items) {
    let g = byCode.get(it.code);
    if (!g) { g = { code: it.code, municipality: it.municipality, facilities: [], listings: [], count: 0 }; byCode.set(it.code, g); }
    (it.kind === 'facility' ? g.facilities : g.listings).push(it);
    g.count++;
  }
  const groups = [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
  const dates = items.map((i) => i.surveyedAt).sort();
  return { total: items.length, municipalityCount: groups.length, from: dates[0] ?? null, to: dates[dates.length - 1] ?? null, groups };
}

/** 2026-10-17 → 2026年10月17日 */
export function jaDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}年${m}月${d}日`;
}
