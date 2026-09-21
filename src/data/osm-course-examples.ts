// OpenStreetMap（ODbLライセンス）の地図データをもとに存在を確認したグラウンドゴルフ施設の例。
// JGGA公式サイトのデータとは異なり、この情報は下記の手順で作成した：
//   1. Overpass API（OpenStreetMap）で `sport=ground_golf` タグおよび施設名に
//      「グラウンドゴルフ」を含む地物を全国から検索（2026年9月実施）
//   2. バス停・駐車場・トイレ等、施設そのものではない地物を除外
//   3. 住所・電話番号など詳しい情報が地図データに無い施設については、
//      各自治体の公式サイト等の公開情報でWeb検索により個別に確認
// 住所・電話番号を確認できなかった施設は掲載していない（正直な範囲のみ掲載）。
// 出典: © OpenStreetMap contributors（ODbL）、および各施設の一次情報源（自治体公式サイト等）。

export interface OsmCourseExample {
  name: string;
  address: string;
  phone: string | null;
  note: string | null;
  sourceNote: string;
}

export const osmCoursesCheckedAt = "2026年9月";

export const osmCourseExamples: Record<string, OsmCourseExample[]> = {
  chiba: [
    {
      name: "君津グラウンド・ゴルフ場",
      address: "千葉県君津市作木201-3",
      phone: "0439-55-6225",
      note: "君津市運営",
      sourceNote: "OpenStreetMap掲載情報",
    },
  ],
  oita: [
    {
      name: "実相寺多目的グラウンド",
      address: "大分県別府市鶴見3763-1",
      phone: "0977-26-0535",
      note: "別府市運営。ラグビー・サッカー・ゲートボール等と共用の多目的グラウンド",
      sourceNote: "OpenStreetMap掲載情報",
    },
  ],
  ishikawa: [
    {
      name: "こなん水辺グラウンドゴルフ場",
      address: "石川県金沢市（湖南地区）",
      phone: "076-241-0882",
      note: null,
      sourceNote: "金沢市オープンデータ（2013年）",
    },
    {
      name: "加賀朝日町グラウンドゴルフ場",
      address: "石川県金沢市（加賀朝日町）",
      phone: "076-241-0882",
      note: null,
      sourceNote: "金沢市オープンデータ（2013年）",
    },
    {
      name: "泉台グラウンドゴルフ場",
      address: "石川県能美市泉台町東10番地",
      phone: "0761-58-5973",
      note: "協会認定24ホール（白山コース・手取コース・九谷コース）。予約は寺井体育館",
      sourceNote: "周辺の地図情報から施設名を特定しWeb検索で確認",
    },
  ],
  kagoshima: [
    {
      name: "グランド・ゴルフ場 あまみティダパーク",
      address: "鹿児島県奄美市笠利町大字用安650",
      phone: "0997-63-2515",
      note: null,
      sourceNote: "Web検索により確認",
    },
  ],
  shizuoka: [
    {
      name: "浜松グラウンド・ゴルフガーデン",
      address: "静岡県浜松市中央区白洲町3649-71",
      phone: "053-525-8900",
      note: "天然芝全48ホール",
      sourceNote: "Web検索により確認",
    },
  ],
  okayama: [
    {
      name: "奈義町総合運動公園グラウンドゴルフ場",
      address: "岡山県勝田郡奈義町豊沢314",
      phone: "0868-36-7311",
      note: "営業時間9:00〜16:00、月曜定休",
      sourceNote: "Web検索により確認",
    },
    {
      name: "スポーツパーク有漢 グラウンドゴルフ場",
      address: "岡山県高梁市有漢町有漢7996-1",
      phone: "0866-57-2983",
      note: "高梁市運営。多目的グラウンド・補助グラウンドと併設",
      sourceNote: "周辺の地図情報から施設名を特定しWeb検索で確認",
    },
  ],
  mie: [
    {
      name: "大羽根運動公園グラウンドゴルフ場",
      address: "三重県三重郡菰野町（大羽根緑地内）",
      phone: "059-394-0756",
      note: "菰野町運営。電話は公園管理棟",
      sourceNote: "Web検索により確認",
    },
  ],
  tottori: [
    {
      name: "グラウンドゴルフのふる里公園「潮風の丘とまり」",
      address: "鳥取県東伯郡湯梨浜町泊1313",
      phone: "0858-34-3217",
      note: "グラウンドゴルフ発祥の地とされる湯梨浜町（旧泊村）にある施設",
      sourceNote: "Web検索により確認",
    },
    {
      name: "ふるさと日南邑運動場",
      address: "鳥取県日野郡日南町神戸上2962-1",
      phone: "0859-83-1188",
      note: "営業時間9:00〜17:00、火曜定休",
      sourceNote: "周辺の地図情報から施設名を特定しWeb検索で確認",
    },
  ],
  akita: [
    {
      name: "横手市大森グラウンド・ゴルフ場",
      address: "秋田県横手市大森町字大中島268番地（大森地域課）",
      phone: "0182-26-4073",
      note: "横手市運営",
      sourceNote: "周辺の地図情報から施設名を特定しWeb検索で確認",
    },
    {
      name: "赤坂総合公園グラウンド・ゴルフ場",
      address: "秋田県横手市赤坂字大沼沢地内",
      phone: "0182-33-2546",
      note: "8ホール×4コース。横手市運営",
      sourceNote: "周辺の地図情報から施設名を特定しWeb検索で確認",
    },
  ],
  gifu: [
    {
      name: "飛騨川公園 グラウンド・ゴルフコース",
      address: "岐阜県下呂市萩原町上呂2250-1",
      phone: "0576-52-4313",
      note: null,
      sourceNote: "Web検索により確認",
    },
  ],
  gunma: [
    {
      name: "城東グラウンドゴルフ場",
      address: "群馬県高崎市江木町1474",
      phone: "027-322-4135",
      note: "高崎市運営",
      sourceNote: "Web検索により確認",
    },
  ],
  shiga: [
    {
      name: "矢橋帰帆島公園 グラウンド・ゴルフ場",
      address: "滋賀県草津市矢橋町字帰帆2108",
      phone: "077-566-3774",
      note: "全4コース32ホール",
      sourceNote: "Web検索により確認",
    },
  ],
  nagasaki: [
    {
      name: "みずほすこやかランド グラウンド・ゴルフ場",
      address: "長崎県雲仙市瑞穂町西郷辛621-8",
      phone: "0957-77-4111",
      note: null,
      sourceNote: "Web検索により確認",
    },
  ],
  saga: [
    {
      name: "蟻尾山公園グラウンド・ゴルフ場",
      address: "佐賀県鹿島市大字高津原蟻尾山地内",
      phone: "080-5272-8407",
      note: "12ホール（15m・25m・30m・50mの各3ホール）、常設天然芝",
      sourceNote: "周辺の地図情報から施設名を特定しWeb検索で確認",
    },
  ],
  shimane: [
    {
      name: "東出雲グラウンドゴルフ場",
      address: "島根県松江市東出雲町錦新町六丁目8番1号",
      phone: "0852-52-7560",
      note: "8ホール×2面（芝コース・クレーコース）",
      sourceNote: "Web検索により確認",
    },
  ],
  osaka: [
    {
      name: "泉南グラウンド・ゴルフinロングパーク",
      address: "大阪府泉南市りんくう南浜2-211",
      phone: "072-477-9134",
      note: null,
      sourceNote: "Web検索により確認",
    },
  ],
  hyogo: [
    {
      name: "浜坂多目的公園グラウンドゴルフ場",
      address: "兵庫県美方郡新温泉町浜坂字下タ山61",
      phone: "0796-82-1616",
      note: "新温泉町体育協会（浜坂B&G海洋センター内）への申込制",
      sourceNote: "Web検索により確認",
    },
    {
      name: "しあわせの村グラウンドゴルフ場",
      address: "兵庫県神戸市北区しあわせの村1-1",
      phone: "078-743-8000",
      note: "神戸市運営の複合福祉施設内。火曜定休（春休み・GW・夏休み・祝日は無休）",
      sourceNote: "周辺の地図情報から施設名を特定しWeb検索で確認",
    },
  ],
  yamaguchi: [
    {
      name: "ながとスポーツ公園グラウンド・ゴルフ場",
      address: "山口県長門市東深川2936番地",
      phone: "0837-22-1807",
      note: "スポーツ施設と防災公園を兼ねた公園内",
      sourceNote: "周辺の地図情報から施設名を特定しWeb検索で確認",
    },
  ],
  niigata: [
    {
      name: "美山グラウンド・ゴルフ場",
      address: "新潟県糸魚川市大野65-1",
      phone: "025-552-8290",
      note: "糸魚川市運営",
      sourceNote: "Web検索により確認",
    },
  ],
};

export function getOsmCoursesBySlug(slug: string): OsmCourseExample[] {
  return osmCourseExamples[slug] ?? [];
}
