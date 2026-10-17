#!/usr/bin/env python3
"""ナビバー内の兄弟ページへの直リンクにも data-page を付与し、access-ui.js を
読み込ませることで、ページ単位のアクセス制御をトップページのカードだけでなく
各ページ自身のナビバーにも及ぼす。

背景：力学・英語一列・熱力学などは、各章・各回のページ自身のナビバーにも
兄弟ページへの直リンク（第1章〜第6章、Session 9〜13 等）を並べている。
トップページのカードを非表示にしても、これらのページを直接開けば、
アクセス権のない章の「タイトル」がナビバーのリンクとして見えてしまう
（access-guard.js のリダイレクト自体は機能するが、リンクという形で存在だけは
伝わってしまう）。本スクリプトはこれを塞ぐ。

判定は access_control.js の pages[科目] に実在するキーとだけ照合するので、
「トップ」「↑ 目次」「← 前の回」のような固定ナビ（página自身やハブページへの
リンク）は対象にならない。相対パスが "../" で始まるリンク（親フォルダ・ハブ
ページ等）も対象外。

冪等：data-page が既に付いているリンク／access-ui.js が既に読み込まれている
ページはスキップするので、insert_access_guard.py 同様に何度でも安全に実行できる。

使い方（docs/ ディレクトリで）:
    python3 tools/inject_nav_data_page.py
"""
import glob
import json
import os
import re
import subprocess

DOCS_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCLUDE_DIRS = {"icons", "tools"}
SKIP_PATH_PARTS = {"参考資料_遺産"}  # gitignore対象・非公開のため対象外

NAV_BLOCK_RE = re.compile(r'(<div class="navbar-links">)(.*?)(</div>)', re.S)
LINK_RE = re.compile(r'<a\s+href="([^"]+)"([^>]*)>')


# docs直下のフォルダを調べ、index.htmlを持つものを科目として集める。
def discover_subjects():
    subjects = []
    for entry in sorted(os.listdir(DOCS_ROOT)):
        d = os.path.join(DOCS_ROOT, entry)
        if not os.path.isdir(d) or entry in EXCLUDE_DIRS:
            continue
        if os.path.isfile(os.path.join(d, "index.html")):
            subjects.append(entry)
    return subjects


def load_pages_config():
    """access_control.js の pages{} を node で評価してそのまま辞書として取り出す。"""
    result = subprocess.run(
        [
            "node", "-e",
            "window={};require('./access_control.js');"
            "console.log(JSON.stringify(window.ACCESS_CONTROL.pages));",
        ],
        cwd=DOCS_ROOT, capture_output=True, text=True, check=True,
    )
    return json.loads(result.stdout)


# 登録済みページへのナビリンクに識別名を付け、必要なら表示制御用スクリプトも追加する。
def process_file(path, pages_for_subject, rel_dir, depth):
    with open(path, encoding="utf-8") as f:
        content = f.read()

    # ナビバーのリンク部分を取り出し、そこに含まれる移動先を確認する。
    m = NAV_BLOCK_RE.search(content)
    changed_links = False
    if m:
        block = m.group(2)

        # ひとつのリンクの移動先を調べ、閲覧設定に登録されたページならdata-pageを付ける。
        def repl(link_m):
            nonlocal changed_links
            href, attrs = link_m.group(1), link_m.group(2)
            if "data-page=" in attrs:
                return link_m.group(0)
            if href.startswith("../") or href.startswith("http") or href.startswith("#"):
                return link_m.group(0)
            if not href.endswith(".html"):
                return link_m.group(0)
            base = href[:-len(".html")]
            if base == "index":
                return link_m.group(0)
            page_id = (rel_dir + "/" + base) if rel_dir else base
            if page_id not in pages_for_subject:
                return link_m.group(0)
            changed_links = True
            return '<a href="{href}" data-page="{pid}"{attrs}>'.format(
                href=href, pid=page_id, attrs=attrs
            )

        new_block = LINK_RE.sub(repl, block)
        if changed_links:
            content = content[:m.start(2)] + new_block + content[m.end(2):]

    # リンクに閲覧制御の目印を追加した場合、表示を制御するスクリプトも必要に応じて読み込ませる。
    needs_ui_script = "access-ui.js" not in content
    if needs_ui_script and changed_links:
        prefix = "../" * depth
        snippet = "<script src=\"{p}access-ui.js\"></script>\n".format(p=prefix)
        idx = content.rfind("</body>")
        if idx == -1:
            print("  !! </body> not found:", path)
            return False
        content = content[:idx] + snippet + content[idx:]

    if not changed_links:
        return False

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return True


# 閲覧設定を読み、各科目の個別ページにあるナビリンクを順番に確認・更新する。
def main():
    pages_config = load_pages_config()
    total = 0
    for subject in discover_subjects():
        subject_dir = os.path.join(DOCS_ROOT, subject)
        pages_for_subject = pages_config.get(subject, {})
        if not pages_for_subject:
            continue
        for page in sorted(glob.glob(os.path.join(subject_dir, "**", "*.html"), recursive=True)):
            rel = os.path.relpath(page, DOCS_ROOT)
            parts = rel.split(os.sep)
            if any(p in SKIP_PATH_PARTS for p in parts):
                continue
            if os.path.basename(page) == "index.html":
                continue
            depth = len(parts) - 1
            rel_in_subject = os.path.relpath(page, subject_dir).replace(os.sep, "/")
            rel_dir = os.path.dirname(rel_in_subject)
            if process_file(page, pages_for_subject, rel_dir, depth):
                total += 1
                print("updated:", rel)
    print("done. updated", total, "files")


if __name__ == "__main__":
    main()
