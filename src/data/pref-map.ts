// 県の形をデフォルメした地図（市区町村ごとのSVGのパス）。作り方は scripts/maps/build-pref-maps.mjs。
// 元データ: 国土交通省 国土数値情報（行政区域データ）を加工して作成。形は簡略にしてあり、境界は正確ではない。
export interface PrefMapMunicipality {
  code: string;
  name: string;
  d: string; // SVG path
  label: [number, number, number, number]; // 件数の数字を置く中心 x, y と、その陸地の幅・高さ
}
export interface PrefMapData {
  prefecture: string;
  slug: string;
  width: number;
  height: number;
  municipalities: PrefMapMunicipality[];
  tiles: { code: string; name: string }[]; // 本土から離れていて、図には描かず、タイルにした市区町村（離島など）
}

const files = import.meta.glob<PrefMapData>('./pref-maps/*.json', { eager: true, import: 'default' });

export function getPrefMap(slug: string): PrefMapData | null {
  return files[`./pref-maps/${slug}.json`] ?? null;
}
