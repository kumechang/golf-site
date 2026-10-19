// 「住所・電話番号を個別に確認できた施設」の各行の、情報の出どころ。
// 出どころの種類ごとに、読者に示す出典の表記を決める（「Web検索で確認」だけでは何が根拠か分からないため）。
import type { OsmCourseExample } from './osm-course-examples';

export type PlaceSource =
  | 'municipal' // 自治体などのウェブサイト（Web検索で確認）
  | 'association' // 島根県グラウンド・ゴルフ協会のコース一覧
  | 'web' // Web上の公開情報
  | 'osm' // OpenStreetMapの掲載情報
  | 'osm-name' // 施設名は OpenStreetMap、住所・電話は Web 上の情報
  | 'opendata' // 金沢市オープンデータ（2013年）
  | 'town-site' // 東洋町のウェブサイト
  | 'municipal-page'; // 市区町村のページに記載（取得日つき。今後の追加分）

// 既存データの sourceNote（完全一致）から種類を判定する。未知の表記は 'web' に倒す（根拠を盛らない）。
const BY_NOTE: Record<string, PlaceSource> = {
  '自治体公式サイト等をもとにWeb検索で確認': 'municipal',
  '島根県グラウンド・ゴルフ協会公式サイトの認定コース一覧をもとにWeb検索で確認': 'association',
  'Web検索により確認': 'web',
  '周辺の地図情報から施設名を特定しWeb検索で確認': 'osm-name',
  '金沢市オープンデータ（2013年）': 'opendata',
  'OpenStreetMap掲載情報': 'osm',
  '自治体公式サイト（東洋町ホームページ）をもとにユーザーが確認': 'town-site',
};

export function sourceKind(c: OsmCourseExample): PlaceSource {
  return c.source ?? BY_NOTE[c.sourceNote] ?? 'web';
}

/** OpenStreetMap 由来（ODbL の表示が要る）か。 */
export const isOsm = (k: PlaceSource) => k === 'osm' || k === 'osm-name';

const OSM_CREDIT = '© OpenStreetMap contributors';

export function sourceLabel(k: PlaceSource): string {
  switch (k) {
    case 'municipal': return '自治体などのウェブサイト（Web検索で確認）';
    case 'association': return '島根県グラウンド・ゴルフ協会のコース一覧';
    case 'web': return 'Web上の公開情報';
    case 'osm': return `OpenStreetMapの掲載情報（${OSM_CREDIT}）`;
    case 'osm-name': return `施設名は OpenStreetMap（${OSM_CREDIT}）、住所・電話番号はWeb上の情報`;
    case 'opendata': return '金沢市オープンデータ（2013年）。古い情報の可能性があります';
    case 'town-site': return '東洋町のウェブサイト';
    case 'municipal-page': return '市区町村のページに記載';
  }
}
