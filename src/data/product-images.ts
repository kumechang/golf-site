// 商品画像（ASIN -> 画像）の一元管理。Amazon検索結果ページの保存HTMLから抽出した
// 実商品サムネイルを src/assets/products/ に配置し、astro:assets で最適化して表示する。
import type { ImageMetadata } from 'astro';

import hatachiEntry from '../assets/products/B0CZ9BJ1W5.webp';
import hatachiStandard from '../assets/products/B0GG9NTFVW.webp';
import mizunoStandard from '../assets/products/B009C09W6C.webp';
import nichiyoEntry from '../assets/products/B0D7PXWGSW.webp';
import asicsStandard from '../assets/products/B07JJS595M.webp';
import arukaEntry from '../assets/products/B0H2XHN15X.webp';
import marushinPremium from '../assets/products/B0BGLBR5XH.webp';
import hatachiBall from '../assets/products/B0DSNXZK5F.webp';
import lezaxGloves from '../assets/products/B0GV212R9H.webp';
import hatachiStretchGloves from '../assets/products/B0856V2YPP.webp';
import hatachiMarker from '../assets/products/B0DPVXVL1G.webp';
import waterproofScoreCard from '../assets/products/B09FH8WQ1W.webp';
import hatachiClubCase from '../assets/products/B07RXVTCP9.webp';
import hatachiBallPouch from '../assets/products/B0CMXSC8S6.webp';
import nichiyoPracticeSet from '../assets/products/B0HFZBL1HH.webp';
import dunlopRefinedShoes from '../assets/products/B09VNPYGGF.webp';
import achillesWalkingShoes from '../assets/products/B0GT44W584.webp';
import hatachiAeroBall from '../assets/products/B0FJRGRHDV.webp';
import hatachiBladeBall from '../assets/products/B08WHWN7WT.webp';
import hatachiWin4Ball from '../assets/products/B0D3DVDNC9.webp';
import gokeiSunVisor from '../assets/products/B07BNBZVBG.webp';
import hatachiBh8080Gloves from '../assets/products/B01ENUC6L8.webp';
import asicsMagnetGloves from '../assets/products/B0BJD5777F.webp';
import northwayWaistPouch from '../assets/products/B0CMTFDW6Y.webp';

export const productImages: Record<string, ImageMetadata> = {
  B0CZ9BJ1W5: hatachiEntry,
  B0GG9NTFVW: hatachiStandard,
  B009C09W6C: mizunoStandard,
  B0D7PXWGSW: nichiyoEntry,
  B07JJS595M: asicsStandard,
  B0H2XHN15X: arukaEntry,
  B0BGLBR5XH: marushinPremium,
  B0DSNXZK5F: hatachiBall,
  B0GV212R9H: lezaxGloves,
  B0856V2YPP: hatachiStretchGloves,
  B0DPVXVL1G: hatachiMarker,
  B09FH8WQ1W: waterproofScoreCard,
  B07RXVTCP9: hatachiClubCase,
  B0CMXSC8S6: hatachiBallPouch,
  B0HFZBL1HH: nichiyoPracticeSet,
  B09VNPYGGF: dunlopRefinedShoes,
  B0GT44W584: achillesWalkingShoes,
  B0FJRGRHDV: hatachiAeroBall,
  B08WHWN7WT: hatachiBladeBall,
  B0D3DVDNC9: hatachiWin4Ball,
  B07BNBZVBG: gokeiSunVisor,
  B01ENUC6L8: hatachiBh8080Gloves,
  B0BJD5777F: asicsMagnetGloves,
  B0CMTFDW6Y: northwayWaistPouch,
};
