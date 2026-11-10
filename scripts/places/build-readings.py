#!/usr/bin/env python3
"""総務省「全国地方公共団体コード」のExcelから、市区町村の読み仮名（ひらがな）を作る。

使い方:
  curl -L -o code.xlsx https://www.soumu.go.jp/main_content/000925835.xlsx
  python3 -I scripts/places/build-readings.py code.xlsx data/places/municipality-readings.json

出力: {"source": ..., "readings": {"13101": "ちよだく", ...}}（団体コードの先頭5桁がキー）
標準ライブラリだけで動く。元ファイルは信頼できないデータとして扱い、リポジトリの外に置く。
"""
import json
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
import zipfile

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def to_hiragana(s: str) -> str:
    s = unicodedata.normalize('NFKC', s)  # 半角カナ → 全角カナ（濁点も合成）
    return ''.join(chr(ord(c) - 0x60) if 'ァ' <= c <= 'ヶ' else c for c in s)


def sheet_rows(z: zipfile.ZipFile, shared: list[str], path: str):
    root = ET.fromstring(z.read(path))
    for r in root.iter('{%s}row' % NS['m']):
        row = {}
        for c in r.findall('m:c', NS):
            col = re.match(r'[A-Z]+', c.get('r')).group(0)
            v = c.find('m:v', NS)
            if v is None:
                continue
            row[col] = shared[int(v.text)] if c.get('t') == 's' else v.text
        yield row


def main(src: str, dst: str) -> None:
    z = zipfile.ZipFile(src)
    shared = [''.join(t.text or '' for t in si.iter('{%s}t' % NS['m'])) for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', NS)]
    sheets = sorted(n for n in z.namelist() if re.fullmatch(r'xl/worksheets/sheet\d+\.xml', n))
    readings: dict[str, str] = {}
    names: dict[str, str] = {}
    for path in sheets:
        for row in sheet_rows(z, shared, path):
            code, name, kana = row.get('A', ''), row.get('C', ''), row.get('E', '')
            if not re.fullmatch(r'\d{6}', code) or not name or not kana:
                continue  # 見出し行・都道府県の行
            key = code[:5]
            readings[key] = to_hiragana(kana)
            names[key] = name
    out = {
        'source': '総務省「全国地方公共団体コード」（令和6年1月1日現在の団体）。市区町村名（カナ）をひらがなにした。',
        'sourceUrl': 'https://www.soumu.go.jp/denshijiti/code.html',
        'readings': dict(sorted(readings.items())),
        'names': dict(sorted(names.items())),
    }
    with open(dst, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=0)
        f.write('\n')
    print(f'{len(readings)} 件を書きました: {dst}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
