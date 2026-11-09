// 県ページの「施設を探す」節の表示用データ。places.ts の施設（市区町村の案内ページ）と、
// 住所・電話番号を個別に確認した施設（osm-course-examples.ts）を、1つの見方（3つの区分）にまとめる。
//   ① 住所・電話番号が載っていた施設（カード）  ② 住所・電話番号が載っていない施設（1行）  ③ 施設名が載っていない案内ページ（市区町村ごとに1行）
import { getPlacesBySlug, type PlaceItem } from './places';
import { getPrefMap } from './pref-map';
import type { OsmCourseExample } from './osm-course-examples';
import { sourceKind, sourceLabel, isOsm } from './place-sources';

export type MunicipalityState = 'detail' | 'link' | 'none';

export interface DetailCard {
  id: string; // 例: p1。ページ内の目印
  anchor?: string; // その市区町村の最初の項目なら m-<code>
  name: string;
  municipality: string | null;
  code: string | null;
  address: string | null;
  phone: string | null;
  phoneIsContact: boolean;
  note: string | null;
  alsoNames: string[];
  url: string | null; // 市区町村の案内ページ（なければ null）
  sourceText: string;
  search: string;
  place: PlaceItem | null; // 動画の対応づけ用
  verified: OsmCourseExample | null;
}
export interface PlainRow { place: PlaceItem; anchor?: string; search: string }
export interface ListingRow { code: string; municipality: string; links: PlaceItem[]; total: number; anchor?: string; search: string }
export interface MuniChip { code: string; name: string; count: number; state: MunicipalityState; target: string | null }

export interface PlacesView {
  total: number;
  municipalityCount: number;
  from: string | null;
  to: string | null;
  cards: DetailCard[];
  plain: PlainRow[];
  listings: ListingRow[];
  chips: MuniChip[];
  states: Map<string, MunicipalityState>;
  counts: Map<string, number>;
  hasWeb: boolean;
  hasOtherSport: boolean;
  hasOsm: boolean;
}

const MAX_LISTINGS = 3;
const OTHER_SPORT = /(野球場|サッカー場|球技場|庭球場|テニス)/;

export function buildPlacesView(slug: string, prefName: string, verified: OsmCourseExample[]): PlacesView {
  const data = getPlacesBySlug(slug);
  const map = getPrefMap(slug);
  // 市区町村の名前→コード（住所から市区町村を見つけるため）
  const nameToCode = new Map<string, string>();
  for (const m of map?.municipalities ?? []) nameToCode.set(m.name, m.code);
  for (const t of map?.tiles ?? []) nameToCode.set(t.name, t.code);
  for (const g of data.groups) nameToCode.set(g.municipality, g.code);
  const codeToName = new Map<string, string>();
  for (const [n, c] of nameToCode) codeToName.set(c, n);
  const muniOf = (address: string): { code: string; name: string } | null => {
    const rest = address.replace(/^日本[、,]?\s*/, '').replace(prefName, '');
    let best: string | null = null;
    for (const n of nameToCode.keys()) if (rest.startsWith(n) && (!best || n.length > best.length)) best = n;
    return best ? { code: nameToCode.get(best)!, name: best } : null;
  };

  // ① 住所・電話番号が載っていた施設
  const cards: DetailCard[] = [];
  const plain: PlainRow[] = [];
  for (const g of data.groups) {
    for (const f of g.facilities) {
      if (f.address || f.phone) {
        cards.push({
          id: '', name: f.name!, municipality: f.municipality, code: f.code, address: f.address ?? null, phone: f.phone ?? null, phoneIsContact: Boolean(f.phoneIsContact),
          note: null, alsoNames: f.alsoNames ?? [], url: f.url,
          sourceText: f.detailSource === 'web' ? 'Web上の公開情報で補ったもの' : '市区町村のページに記載', search: `${f.municipality} ${f.name} ${(f.alsoNames ?? []).join(' ')} ${f.address ?? ''}`, place: f, verified: null,
        });
      } else plain.push({ place: f, search: `${f.municipality} ${f.name}` });
    }
  }
  for (const c of verified) {
    const m = muniOf(c.address);
    cards.push({
      id: '', name: c.name, municipality: m?.name ?? null, code: m?.code ?? null, address: c.address, phone: c.phone, phoneIsContact: false, note: c.note, alsoNames: [], url: null,
      sourceText: sourceLabel(sourceKind(c)), search: `${m?.name ?? ''} ${c.name} ${c.address}`, place: null, verified: c,
    });
  }
  cards.sort((a, b) => (a.code ?? '99999').localeCompare(b.code ?? '99999') || a.name.localeCompare(b.name));
  plain.sort((a, b) => a.place.code.localeCompare(b.place.code) || (a.place.name ?? '').localeCompare(b.place.name ?? ''));

  // ③ 施設名が載っていない案内ページ（市区町村ごとに1行、3件まで）
  const listings: ListingRow[] = data.groups.filter((g) => g.listings.length > 0).map((g) => ({
    code: g.code, municipality: g.municipality, links: g.listings.slice(0, MAX_LISTINGS), total: g.listings.length, search: g.municipality,
  }));

  // 市区町村ごとの件数・状態・ジャンプ先（その市区町村の最初の項目）
  const counts = new Map<string, number>();
  const states = new Map<string, MunicipalityState>();
  const targets = new Map<string, string>();
  const bump = (code: string | null, n: number) => { if (code) counts.set(code, (counts.get(code) ?? 0) + n); };
  cards.forEach((c, i) => { c.id = `p${i + 1}`; bump(c.code, 1); if (c.code) { states.set(c.code, 'detail'); if (!targets.has(c.code)) { targets.set(c.code, `m-${c.code}`); c.anchor = `m-${c.code}`; } } });
  for (const r of plain) {
    bump(r.place.code, 1);
    if (!states.has(r.place.code)) states.set(r.place.code, 'link');
    if (!targets.has(r.place.code)) { targets.set(r.place.code, `m-${r.place.code}`); r.anchor = `m-${r.place.code}`; }
  }
  for (const r of listings) {
    bump(r.code, r.links.length);
    if (!states.has(r.code)) states.set(r.code, 'link');
    if (!targets.has(r.code)) { targets.set(r.code, `m-${r.code}`); r.anchor = `m-${r.code}`; }
  }
  const chips: MuniChip[] = [...counts.keys()].sort().map((code) => ({ code, name: codeToName.get(code) ?? code, count: counts.get(code)!, state: states.get(code) ?? 'link', target: targets.get(code) ?? null }));

  return {
    total: cards.length + plain.length + listings.reduce((s, r) => s + r.links.length, 0),
    municipalityCount: chips.length,
    from: data.from, to: data.to,
    cards, plain, listings, chips, states, counts,
    hasWeb: cards.some((c) => c.sourceText.startsWith('Web上')),
    hasOtherSport: [...cards, ...plain.map((p) => ({ name: p.place.name }))].some((c) => OTHER_SPORT.test(c.name ?? '')),
    hasOsm: verified.some((c) => isOsm(sourceKind(c))),
  };
}
