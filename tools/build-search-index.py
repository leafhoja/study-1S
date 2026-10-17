#!/usr/bin/env python3
"""学習ノートサイト — 教科ごとの全文検索索引ジェネレーター

docs/<科目>/ 配下の *.html を走査し、id 付きセクション（<div id="...">,
<section id="..."> 等）単位でテキストを抽出し、docs/<科目>/search-data.js を
書き出す。教科をまたいだ検索は行わない設計のため、教科ごとに独立したファイルを
生成する（他教科のデータは一切含まない）。標準ライブラリのみ使用。

使い方（docs/ ディレクトリで）:
    python3 tools/build-search-index.py            # 全教科を再生成
    python3 tools/build-search-index.py 線形代数学   # 指定教科のみ再生成

新しいページを追加・編集したら実行すること。
"""
import glob
import json
import os
import re
import sys
from html.parser import HTMLParser

DOCS_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# void 要素（終了タグを持たない）。誤ってスタックに積むと深さ計算が狂うので除外する。
VOID_ELEMENTS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}

# 検索対象から除外するタグ／クラス（ナビ・目次・フッターなど、全ページ共通の外枠）
SKIP_TAGS = {"script", "style", "nav", "header", "footer"}
SKIP_CLASS_RE = re.compile(
    r"\b(navbar|sidenav|gtoc-panel|gtoc-backdrop|gtoc-toggle|site-footer|sidebar)\b"
)

HEADING_TAGS = {"h1", "h2", "h3", "h4"}


# 連続した空白や改行をひとつの空白にまとめ、前後の空白を取り除く。
def _clean(s):
    return re.sub(r"\s+", " ", s).strip()


class SectionExtractor(HTMLParser):
    """id 付き要素を境界としてページ本文をセクションに分割する。

    セクション化のルール：
    - スキップ領域（nav/script/style や navbar 等のクラス）の外側で、
      id 属性を持つ要素に出会うたびに新しいセクションを開始する（最上位の
      id のみを境界とし、その内側にネストした id は無視して同じセクションに含める）。
    - セクションのタイトルは、その中で最初に現れる見出し（h1〜h4）のテキスト。
      見出しが無ければ空のままにし、JS 側で章タイトルにフォールバックさせる。
    - id を持つ要素の外側にある地の文（見出し直後のヒーローや、セクション間の
      すきま等）は「ページ全体」バケツ（id=""）にまとめ、最後に一括で回収する。
      id 付きセクションが一つも無いページでは、結果的にページ全体が1エントリになる。
    """

    # ページの題名・節・開いているタグを記録するための空の入れ物を用意する。
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.sections = []

        self._in_title = False
        self._stack = []          # 開いているタグ名（void要素は積まない）
        self._skip_from = None    # スキップ領域に入った時点のスタック深さ
        self._capture_from = None  # 現在のセクションに入った時点のスタック深さ
        self._heading_tag = None
        self._heading_buf = []
        self._cur = {"id": "", "t": "", "x": []}

    # 開始タグを読み、検索から除く領域・節の境界・見出しの開始位置を記録する。
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self._in_title = True
            return

        cls = a.get("class") or ""
        hid = (a.get("id") or "").strip()

        if self._skip_from is None and (tag in SKIP_TAGS or SKIP_CLASS_RE.search(cls)):
            self._skip_from = len(self._stack)

        if self._skip_from is None and self._capture_from is None and hid:
            self._flush()
            self._cur = {"id": hid, "t": "", "x": []}
            self._capture_from = len(self._stack)

        if self._skip_from is None and tag in HEADING_TAGS and self._heading_tag is None \
                and not self._cur["t"]:
            self._heading_tag = tag
            self._heading_buf = []

        if tag not in VOID_ELEMENTS:
            self._stack.append(tag)

    # 終了タグに合わせて読み取り位置を戻し、完成した見出しや節を保存する。
    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
            return

        if self._heading_tag == tag:
            title = _clean("".join(self._heading_buf))
            if title and not self._cur["t"]:
                self._cur["t"] = title
            self._heading_tag = None

        if self._stack and self._stack[-1] == tag:
            self._stack.pop()
        elif tag in self._stack:
            while self._stack and self._stack[-1] != tag:
                self._stack.pop()
            if self._stack:
                self._stack.pop()

        depth = len(self._stack)

        if self._skip_from is not None and depth <= self._skip_from:
            self._skip_from = None

        if self._capture_from is not None and depth <= self._capture_from:
            self._flush()
            self._capture_from = None
            self._cur = {"id": "", "t": "", "x": []}

    # 読み取った文字を、ページの題名・見出し・本文のうち該当する場所に集める。
    def handle_data(self, data):
        if self._in_title:
            self.title += data
            return
        if self._skip_from is not None:
            return
        if self._heading_tag is not None:
            self._heading_buf.append(data)
            return
        self._cur["x"].append(data)

    # ページの末尾まで読んだ後、残っている本文を検索用の節として保存する。
    def flush_final(self):
        self._flush()

    # 集めた本文の空白を整え、内容のある節を検索データの一覧に追加する。
    def _flush(self):
        text = _clean(" ".join(self._cur["x"]))
        if text or self._cur["t"]:
            if len(text) >= 6 or self._cur["t"]:
                self.sections.append({"id": self._cur["id"], "t": self._cur["t"], "x": text})


# ページの題名を区切り文字で分け、先頭の部分を検索結果のページ名として使う。
def _chapter_label(title):
    parts = re.split(r"\s*[—–|｜]\s*", _clean(title))
    return parts[0] if parts else _clean(title)


# 科目フォルダ内のHTMLを読み、節ごとの検索データをsearch-data.jsへ書き出す。
def build_subject(subject_dir):
    name = os.path.basename(subject_dir)
    pages = sorted(glob.glob(os.path.join(subject_dir, "**", "*.html"), recursive=True))
    entries = []

    for path in pages:
        rel = os.path.relpath(path, subject_dir).replace(os.sep, "/")

        # 各階層の index.html（ハブページ）は索引化しない。カードグリッド等は
        # id を持たない要素が多く、複数ページ分の見出し・説明文が「ページ全体」
        # バケツ（id=""）に一つにまとまってしまう。これを索引に含めると、
        # アクセス制御で個別に非表示にしたページの説明文が検索結果として
        # 漏れてしまう（access_control.js の pages[] は access-guard.js の
        # リダイレクト判定と同じく index.html をページ単位の管理対象外として
        # いるが、検索はそれとは別経路なので個別に対策が必要）。
        # 各ページ自身の search-data.js エントリ（p が個別ファイル名のもの）
        # には元々フルテキストが入っているので、index.html を除外しても
        # 検索の実用性は失われない。
        if os.path.basename(path) == "index.html":
            continue

        try:
            with open(path, encoding="utf-8") as f:
                html = f.read()
        except (UnicodeDecodeError, OSError):
            continue

        # HTMLから題名と本文の節を取り出し、移動先・見出し・本文を検索用の項目にまとめる。
        ex = SectionExtractor()
        ex.feed(html)
        ex.flush_final()

        chapter = _chapter_label(ex.title) or name
        for s in ex.sections:
            if not s["x"] and not s["t"]:
                continue
            entries.append({
                "p": rel,
                "c": chapter,
                "id": s["id"],
                "t": s["t"],
                "x": s["x"],
            })

    # 集めた節をJavaScriptから読めるデータにし、科目フォルダの検索用ファイルへ保存する。
    out_path = os.path.join(subject_dir, "search-data.js")
    js = (
        "/* 自動生成: python3 tools/build-search-index.py — 手で編集しない */\n"
        "window.__SEARCH_DATA__ = "
        + json.dumps(entries, ensure_ascii=False, separators=(",", ":"))
        + ";\n"
    )
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(js)
    print(f"  {name}: {len(pages)} pages, {len(entries)} entries → search-data.js ({len(js)} bytes)")


# docs直下のフォルダを調べ、index.htmlを持つものを科目として集める。
def discover_subjects():
    subjects = []
    for entry in sorted(os.listdir(DOCS_ROOT)):
        d = os.path.join(DOCS_ROOT, entry)
        if not os.path.isdir(d) or entry in ("icons", "tools"):
            continue
        if os.path.isfile(os.path.join(d, "index.html")):
            subjects.append(d)
    return subjects


# 指定された科目、または全科目について検索用データを順番に作る。
def main():
    requested = sys.argv[1:]
    if requested:
        subjects = [os.path.join(DOCS_ROOT, name) for name in requested]
        for d in subjects:
            if not os.path.isdir(d):
                print(f"skip: {d} が見つかりません", file=sys.stderr)
                subjects.remove(d)
    else:
        subjects = discover_subjects()

    for d in subjects:
        build_subject(d)


if __name__ == "__main__":
    main()
