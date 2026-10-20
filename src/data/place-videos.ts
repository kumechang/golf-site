// 施設を紹介する動画（YouTube）。都道府県ページの「施設を紹介する動画」に並べる。
// 選ぶ基準: 施設・自治体・地域の情報サイト・運営団体などが公開している動画で、施設が分かるもの。個人のブログ由来や、施設の紹介が主目的でないものは載せない。
// facility を書いた動画は、その施設のカードが載っているページでは、カードの中に載せる（載っていないときは「施設を紹介する動画」の節）。
// 題名と投稿者は YouTube に公開されているとおり（oEmbed で確認、2026-10-20）。
import type { VideoItem } from '../components/VideoEmbed.astro';

export const placeVideos: Record<string, VideoItem[]> = {
  shiga: [
    { id: 'XEuj4vyuYYg', title: 'グラウンド・ゴルフ場　誕生！！', channel: '大津市役所YouTubeチャンネル', note: '大津市が公開した、大津大石淀グラウンド・ゴルフ場の紹介動画です。', facility: '大津大石淀' },
  ],
  ishikawa: [
    { id: 'PO61rISumOQ', title: '【2026年5月】かなざわでスポーツ！「戸室スポーツ広場」グラウンドゴルフ、マレットゴルフに挑戦！', channel: '金沢市公式YouTubeチャンネルCityofKanazawa', note: '金沢市が公開した、戸室スポーツ広場でグラウンドゴルフを体験する動画です。' },
    { id: '_104yikeeN0', title: '白山ろくテーマパーク河合下野園地PV', channel: '岸グリーンサービス指定管理', note: '白山ろくテーマパーク河合・下野園地の紹介動画です。' },
  ],
  nara: [
    { id: 'JGlLEDVSGdU', title: 'グラウンドゴルフ　福コース', channel: '大和高原ボスコヴィラ', note: '大和高原ボスコヴィラが公開した、福コースの動画です。', facility: 'ボスコヴィラ' },
  ],
  shizuoka: [
    { id: 'J_TcLMVYdDQ', title: '【観光】【グラウンドゴルフ初心者】国内屈指のコースに挑戦！（静岡県浜松市）', channel: '【まいぷれ浜松】ちゃんねる', note: '浜松グラウンド・ゴルフガーデンを紹介する、地域情報サイトの動画です。', facility: '浜松グラウンド・ゴルフガーデン' },
  ],
  tottori: [
    { id: 'km7Uz0Emtuc', title: '【鳥取県編②】海の見えるグラウンドゴルフ場「潮風の丘とまり」を紹介！ぐらごる王子の人生初食レポはいかに？！【グラウンドゴルフ】【グランドゴルフ】', channel: 'ぐらごるTV(グラゴルてぃーびー)', note: '湯梨浜町の「潮風の丘とまり」を紹介する動画です。', facility: '潮風の丘とまり' },
  ],
};
