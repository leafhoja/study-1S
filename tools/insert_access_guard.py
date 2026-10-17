#!/usr/bin/env python3
"""各教科ページの <head> 先頭に access_control.js / access-guard.js の
読み込みを一括挿入する。新しい教科ページを追加・移動したら再実行すること。

  python3 tools/build-search-index.py 同様、docs/ 直下から実行しても
  tools/ 内から実行しても、自分自身の場所から docs ルートを逆算するので問題ない。
"""
import glob
import os

DOCS_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCLUDE_DIRS = {"icons", "tools"}
SKIP_PATH_PARTS = {"参考資料_遺産"}  # gitignore対象・非公開のため対象外


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


# HTMLを読み、閲覧制限用スクリプトが未追加なら、文字コード指定の直後へ追加する。
def insert_guard(path, depth):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if "access_control.js" in content:
        return False  # 挿入済み

    marker = '<meta charset="UTF-8">\n'
    pos = content.find(marker)
    if pos == -1:
        print("  !! charset meta not found:", path)
        return False

    # ページの深さに応じた相対パスで、設定と閲覧確認のスクリプトを読み込む文字列を作る。
    prefix = "../" * depth
    snippet = (
        "  " + '<script src="{p}access_control.js"></script>\n'.format(p=prefix) +
        "  " + '<script src="{p}access-guard.js"></script>\n'.format(p=prefix)
    )
    insert_at = pos + len(marker)
    new_content = content[:insert_at] + snippet + content[insert_at:]

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True


# 各科目のHTMLを探し、フォルダの深さに合う閲覧制限用スクリプトを追加する。
def main():
    total = 0
    for subject in discover_subjects():
        subject_dir = os.path.join(DOCS_ROOT, subject)
        pages = sorted(glob.glob(os.path.join(subject_dir, "**", "*.html"), recursive=True))
        for page in pages:
            rel = os.path.relpath(page, DOCS_ROOT)
            parts = rel.split(os.sep)
            if any(p in SKIP_PATH_PARTS for p in parts):
                continue
            depth = len(parts) - 1
            if insert_guard(page, depth):
                total += 1
                print("inserted:", rel)
    print("done. inserted into", total, "files")


if __name__ == "__main__":
    main()
