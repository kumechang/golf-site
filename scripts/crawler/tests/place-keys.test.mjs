import test from 'node:test';
import assert from 'node:assert/strict';
import { digits, normAddr, locationKey, mergeSameLocation } from '../../../src/data/place-keys.mjs';

test('電話番号：ハイフン・括弧・空白・全角を取り去った数字で比べる', () => {
  assert.equal(digits('0297-74-2141'), '0297742141');
  assert.equal(digits('０２９７（７４）２１４１'), '0297742141');
  assert.equal(digits(' 0297 74 2141 '), '0297742141');
  assert.equal(digits(null), '');
});

test('住所：都道府県・括弧書き・丁目/番地/号・漢数字・ハイフンの種類の違いをそろえる', () => {
  assert.equal(normAddr('茨城県取手市取手1丁目地先'), normAddr('取手市取手１丁目地先'));
  assert.equal(normAddr('東京都江東区辰巳二丁目1番35号'), normAddr('江東区辰巳2-1-35'));
  assert.equal(normAddr('東京都北区神谷2−47−6'), normAddr('北区神谷2-47-6'));
  assert.equal(normAddr('福山市加茂町字北山176番地5'), normAddr('福山市加茂町字北山176-5'));
  assert.equal(normAddr('大田区本羽田三丁目（本羽田公園内）'), normAddr('大田区本羽田3丁目'));
  assert.notEqual(normAddr('三島市南田町4-40'), normAddr('三島市南田町4-41'));
});

test('場所の照合キー：電話がなければ作らない（住所だけでは同じ場所とは言わない）', () => {
  assert.equal(locationKey('取手市取手1丁目地先', null), null);
  assert.equal(locationKey('取手市取手1丁目地先', '0297-74-2141'), locationKey('茨城県取手市取手１丁目地先', '0297742141'));
});

test('同じ場所のまとめ：名前が違っても住所・電話が同じなら1件に。電話なし・別の市区町村・一覧ページはまとめない', () => {
  const f = (o) => ({ kind: 'facility', code: '08217', name: 'A', address: '取手市取手1丁目地先', phone: '0297-74-2141', ...o });
  const out = mergeSameLocation([
    f({ name: '取手緑地運動公園' }),
    f({ name: '取手緑地運動公園グラウンドゴルフ場', phone: '0297742141' }),
    f({ name: '取手緑地運動公園' }), // 同じ名前の重複は alsoNames に入れない
    f({ name: '電話なしA', phone: undefined }),
    f({ name: '電話なしB', phone: undefined }),
    f({ name: '別の市', code: '08999' }),
    { kind: 'listing', code: '08217', name: null },
  ]);
  assert.deepEqual(out.map((x) => x.name), ['取手緑地運動公園', '電話なしA', '電話なしB', '別の市', null]);
  assert.deepEqual(out[0].alsoNames, ['取手緑地運動公園グラウンドゴルフ場']);
});
