// このファイルのデータソース:
// - 協会連絡先（association）: 運営者が独自に調査した情報（一部の都道府県のみ公式サイトを確認済み）
// - JGGA認定コースの件数（courseCount）・出典URL（sourceUrl）:
//   公益社団法人日本グラウンド・ゴルフ協会（JGGA）公式サイトの「認定コース」ページで確認した件数です。
//   JGGAサイトポリシー（営利目的での利用不可）により、施設名・住所・電話番号等の詳細データは
//   本サイトには掲載せず、件数の案内とJGGA公式サイトへのリンクのみを掲載しています。
//   詳しい施設情報は必ずJGGA公式サイト（sourceUrl）でご確認ください。

// コース件数の確認時点
export const coursesCheckedAt = "2026年9月";

export interface PrefectureAssociation {
  url: string | null;
  urlLabel: string | null;
  note: string | null;
}

export interface PrefectureData {
  name: string;
  slug: string;
  region: string;
  association: PrefectureAssociation;
  sourceUrl: string | null;
  courseCount: number;
  // 認定コースが無い都道府県向けに、近隣で実際にコースがある都道府県のslugを案内する
  nearbySlugs: string[];
}

export const prefectures: PrefectureData[] = [
  {
    name: "北海道",
    slug: "hokkaido",
    region: "北海道・東北",
    association: {
      url: null,
      urlLabel: null,
      note: "北海道スポーツ協会経由での確認を推奨",
    },
    sourceUrl: null,
    courseCount: 0,
    nearbySlugs: [],
  },
  {
    name: "青森県",
    slug: "aomori",
    region: "北海道・東北",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/tohoku/",
    courseCount: 1,
    nearbySlugs: [],
  },
  {
    name: "岩手県",
    slug: "iwate",
    region: "北海道・東北",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/tohoku/",
    courseCount: 1,
    nearbySlugs: [],
  },
  {
    name: "宮城県",
    slug: "miyagi",
    region: "北海道・東北",
    association: {
      url: null,
      urlLabel: null,
      note: "多賀城市や山元町など市町村レベルの協会あり",
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/tohoku/",
    courseCount: 4,
    nearbySlugs: [],
  },
  {
    name: "秋田県",
    slug: "akita",
    region: "北海道・東北",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/tohoku/",
    courseCount: 14,
    nearbySlugs: [],
  },
  {
    name: "山形県",
    slug: "yamagata",
    region: "北海道・東北",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/tohoku/",
    courseCount: 6,
    nearbySlugs: [],
  },
  {
    name: "福島県",
    slug: "fukushima",
    region: "北海道・東北",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/tohoku/",
    courseCount: 3,
    nearbySlugs: [],
  },
  {
    name: "茨城県",
    slug: "ibaraki",
    region: "関東",
    association: {
      url: null,
      urlLabel: null,
      note: "事務局：常陸大宮市",
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kanto/",
    courseCount: 7,
    nearbySlugs: [],
  },
  {
    name: "栃木県",
    slug: "tochigi",
    region: "関東",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kanto/",
    courseCount: 2,
    nearbySlugs: [],
  },
  {
    name: "群馬県",
    slug: "gunma",
    region: "関東",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kanto/",
    courseCount: 2,
    nearbySlugs: [],
  },
  {
    name: "埼玉県",
    slug: "saitama",
    region: "関東",
    association: {
      url: "https://saitama-gg.jp/",
      urlLabel: null,
      note: "所在地：幸手市千塚271-6",
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kanto/",
    courseCount: 2,
    nearbySlugs: [],
  },
  {
    name: "千葉県",
    slug: "chiba",
    region: "関東",
    association: {
      url: null,
      urlLabel: null,
      note: "事務局：大網白里市／千葉県スポーツ協会加盟",
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kanto/",
    courseCount: 5,
    nearbySlugs: [],
  },
  {
    name: "東京都",
    slug: "tokyo",
    region: "関東",
    association: {
      url: null,
      urlLabel: null,
      note: "事務局：府中市／東京都レクリエーション協会加盟",
    },
    sourceUrl: null,
    courseCount: 0,
    nearbySlugs: ["saitama", "yamanashi", "chiba"],
  },
  {
    name: "神奈川県",
    slug: "kanagawa",
    region: "関東",
    association: {
      url: "http://www.kanagawa-gga.org/",
      urlLabel: null,
      note: "原則メール対応",
    },
    sourceUrl: null,
    courseCount: 0,
    nearbySlugs: ["saitama", "yamanashi", "shizuoka"],
  },
  {
    name: "山梨県",
    slug: "yamanashi",
    region: "関東",
    association: {
      url: "https://yamanashi-gga.com/",
      urlLabel: null,
      note: "所在地：南アルプス市百々",
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kanto/",
    courseCount: 1,
    nearbySlugs: [],
  },
  {
    name: "新潟県",
    slug: "niigata",
    region: "北信越・東海",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/hokushinetsu/",
    courseCount: 4,
    nearbySlugs: [],
  },
  {
    name: "富山県",
    slug: "toyama",
    region: "北信越・東海",
    association: {
      url: "http://toyamatgga.g3.xrea.com/",
      urlLabel: null,
      note: "所在地：高岡市一番町",
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/hokushinetsu/",
    courseCount: 1,
    nearbySlugs: [],
  },
  {
    name: "石川県",
    slug: "ishikawa",
    region: "北信越・東海",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/hokushinetsu/",
    courseCount: 5,
    nearbySlugs: [],
  },
  {
    name: "福井県",
    slug: "fukui",
    region: "北信越・東海",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/hokushinetsu/",
    courseCount: 3,
    nearbySlugs: [],
  },
  {
    name: "長野県",
    slug: "nagano",
    region: "北信越・東海",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/hokushinetsu/",
    courseCount: 1,
    nearbySlugs: [],
  },
  {
    name: "岐阜県",
    slug: "gifu",
    region: "北信越・東海",
    association: {
      url: "https://page.line.me/860cmqyc",
      urlLabel: "LINE公式アカウント",
      note: "LINE公式アカウント／所在地：羽島郡笠松町",
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/tokai/",
    courseCount: 5,
    nearbySlugs: [],
  },
  {
    name: "静岡県",
    slug: "shizuoka",
    region: "北信越・東海",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/tokai/",
    courseCount: 2,
    nearbySlugs: [],
  },
  {
    name: "愛知県",
    slug: "aichi",
    region: "北信越・東海",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/tokai/",
    courseCount: 3,
    nearbySlugs: [],
  },
  {
    name: "三重県",
    slug: "mie",
    region: "北信越・東海",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/tokai/",
    courseCount: 1,
    nearbySlugs: [],
  },
  {
    name: "滋賀県",
    slug: "shiga",
    region: "関西",
    association: {
      url: "http://www.gg-shiga.jp/",
      urlLabel: null,
      note: "所在地：守山市",
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kinki/",
    courseCount: 11,
    nearbySlugs: [],
  },
  {
    name: "京都府",
    slug: "kyoto",
    region: "関西",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kinki/",
    courseCount: 5,
    nearbySlugs: [],
  },
  {
    name: "大阪府",
    slug: "osaka",
    region: "関西",
    association: {
      url: null,
      urlLabel: null,
      note: "交野市、羽曳野市など市町村レベルの協会あり",
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kinki/",
    courseCount: 1,
    nearbySlugs: [],
  },
  {
    name: "兵庫県",
    slug: "hyogo",
    region: "関西",
    association: {
      url: "https://www.h-gga.com/",
      urlLabel: null,
      note: "所在地：神戸市北区",
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kinki/",
    courseCount: 2,
    nearbySlugs: [],
  },
  {
    name: "奈良県",
    slug: "nara",
    region: "関西",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kinki/",
    courseCount: 3,
    nearbySlugs: [],
  },
  {
    name: "和歌山県",
    slug: "wakayama",
    region: "関西",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kinki/",
    courseCount: 1,
    nearbySlugs: [],
  },
  {
    name: "鳥取県",
    slug: "tottori",
    region: "中国・四国",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/chugoku/",
    courseCount: 5,
    nearbySlugs: [],
  },
  {
    name: "島根県",
    slug: "shimane",
    region: "中国・四国",
    association: {
      url: "https://www.shimane-gga.com/",
      urlLabel: null,
      note: "所在地：出雲市神西新町",
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/chugoku/",
    courseCount: 16,
    nearbySlugs: [],
  },
  {
    name: "岡山県",
    slug: "okayama",
    region: "中国・四国",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/chugoku/",
    courseCount: 9,
    nearbySlugs: [],
  },
  {
    name: "広島県",
    slug: "hiroshima",
    region: "中国・四国",
    association: {
      url: null,
      urlLabel: null,
      note: "広島県協会（広島市安佐南区）、広島市協会などが存在",
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/chugoku/",
    courseCount: 11,
    nearbySlugs: [],
  },
  {
    name: "山口県",
    slug: "yamaguchi",
    region: "中国・四国",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/chugoku/",
    courseCount: 5,
    nearbySlugs: [],
  },
  {
    name: "徳島県",
    slug: "tokushima",
    region: "中国・四国",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/shikoku/",
    courseCount: 1,
    nearbySlugs: [],
  },
  {
    name: "香川県",
    slug: "kagawa",
    region: "中国・四国",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/shikoku/",
    courseCount: 1,
    nearbySlugs: [],
  },
  {
    name: "愛媛県",
    slug: "ehime",
    region: "中国・四国",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/shikoku/",
    courseCount: 1,
    nearbySlugs: [],
  },
  {
    name: "高知県",
    slug: "kochi",
    region: "中国・四国",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: null,
    courseCount: 0,
    nearbySlugs: ["tokushima", "kagawa", "ehime"],
  },
  {
    name: "福岡県",
    slug: "fukuoka",
    region: "九州・沖縄",
    association: {
      url: null,
      urlLabel: null,
      note: "飯塚市や那珂川市など各市スポーツ協会内に窓口あり",
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kyushu/",
    courseCount: 2,
    nearbySlugs: [],
  },
  {
    name: "佐賀県",
    slug: "saga",
    region: "九州・沖縄",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kyushu/",
    courseCount: 4,
    nearbySlugs: [],
  },
  {
    name: "長崎県",
    slug: "nagasaki",
    region: "九州・沖縄",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kyushu/",
    courseCount: 2,
    nearbySlugs: [],
  },
  {
    name: "熊本県",
    slug: "kumamoto",
    region: "九州・沖縄",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kyushu/",
    courseCount: 3,
    nearbySlugs: [],
  },
  {
    name: "大分県",
    slug: "oita",
    region: "九州・沖縄",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kyushu/",
    courseCount: 2,
    nearbySlugs: [],
  },
  {
    name: "宮崎県",
    slug: "miyazaki",
    region: "九州・沖縄",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kyushu/",
    courseCount: 1,
    nearbySlugs: [],
  },
  {
    name: "鹿児島県",
    slug: "kagoshima",
    region: "九州・沖縄",
    association: {
      url: null,
      urlLabel: null,
      note: null,
    },
    sourceUrl: "https://www.groundgolf.or.jp/certified-courses/kyushu/",
    courseCount: 6,
    nearbySlugs: [],
  },
  {
    name: "沖縄県",
    slug: "okinawa",
    region: "九州・沖縄",
    association: {
      url: null,
      urlLabel: null,
      note: "本土から離れた島しょ県のため、近隣県のコース情報でのご案内が難しい地域です",
    },
    sourceUrl: null,
    courseCount: 0,
    nearbySlugs: [],
  },
];

export function getPrefectureBySlug(slug: string): PrefectureData | undefined {
  return prefectures.find((p) => p.slug === slug);
}

export const regionOrder = ["北海道・東北", "関東", "北信越・東海", "関西", "中国・四国", "九州・沖縄"];

export function getPrefecturesByRegion(): { region: string; prefectures: PrefectureData[] }[] {
  return regionOrder.map((region) => ({
    region,
    prefectures: prefectures.filter((p) => p.region === region),
  }));
}
