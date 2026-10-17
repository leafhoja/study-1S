#!/usr/bin/env python3
"""「情報」過去問ページの構造・必須本文・参照を一括検証する。"""

from pathlib import Path
from urllib.parse import unquote

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
SUBJECT = ROOT / "情報"

# 確認する年度と、各年度のページに必要な大問の数を指定する。
EXPECTED = {
    "共通問題": {
        2006: 3, 2007: 3, 2008: 3, 2009: 3, 2010: 3, 2011: 3,
        2012: 3, 2013: 3, 2014: 3, 2015: 3, 2016: 3, 2017: 3,
        2018: 3, 2019: 3, 2021: 3, 2022: 3, 2023: 3, 2024: 3,
        2025: 3,
    },
    "個別問題": {
        2006: 2, 2007: 2, 2008: 2, 2009: 2, 2010: 2, 2011: 2,
        2012: 2, 2013: 2, 2014: 2, 2015: 2, 2018: 2, 2019: 2,
        2022: 3, 2024: 2, 2025: 2,
    },
}

# 特定の過去問で欠けていないことを確認する、本文中の語句をまとめる。
CONTENT_SENTINELS = {
    ("共通問題", 2011): ["1万2700件", "7700万件", "g123456$"],
    ("共通問題", 2015): ["著作権・ICTと社会", "アルゴリズム1", "1001 load 2003"],
    ("共通問題", 2018): ["log_y x", "下線部イを", "x=1000"],
    ("共通問題", 2024): [
        "マウスなどのポインティングデバイス",
        "仮の目標地点",
        "アメリカ運輸省高速道路交通安全局",
    ],
    ("個別問題", 2007): ["LOAD n", "8n+1"],
    ("個別問題", 2008): ["オートマトンを作成して図にしなさい"],
    ("個別問題", 2018): ["基本素子AND", "真理値表"],
}


# 見つかった問題を、対象ファイル名と説明を組にしてエラー一覧へ追加する。
def fail(errors: list[str], path: Path, message: str) -> None:
    errors.append(f"{path.relative_to(ROOT)}: {message}")


# 情報の過去問を読み、年度・問題数・本文・数式・参照先を検証して結果を表示する。
def main() -> int:
    errors: list[str] = []
    checked = 0

    # 共通問題と個別問題のフォルダを調べ、存在する年度が確認対象の一覧と一致するかを比べる。
    for group, years in EXPECTED.items():
        directory = SUBJECT / "過去問" / group
        actual = {int(path.stem.split("_")[1]) for path in directory.glob("kakomon_*.html")}
        expected = set(years)
        if actual != expected:
            errors.append(
                f"{directory.relative_to(ROOT)}: 年度一覧が不一致 "
                f"(不足={sorted(expected-actual)}, 余分={sorted(actual-expected)})"
            )

        for year, section_count in years.items():
            path = directory / f"kakomon_{year}.html"
            soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
            checked += 1

            # 問題のまとまりを数え、それぞれに見出しと問題文があり、本文の長さが足りるかを調べる。
            sections = soup.select(".section")
            if len(sections) != section_count:
                fail(errors, path, f"大問数が{len(sections)}（期待値{section_count}）")

            for index, section in enumerate(sections, 1):
                if not section.select_one(".sec-header"):
                    fail(errors, path, f"大問{index}に見出しがない")
                if not section.select_one(".ex"):
                    fail(errors, path, f"大問{index}に問題文ブロックがない")
                if len(section.get_text("", strip=True)) < 120:
                    fail(errors, path, f"大問{index}の本文が短すぎる")

            if "tex-chtml.js" not in path.read_text(encoding="utf-8"):
                fail(errors, path, "MathJaxの読込みがない")
            if soup.select(".original-exam-text, .original-major-text"):
                fail(errors, path, "廃止したPDF機械抽出ブロックが残っている")
            if "……" in " ".join(node.get_text() for node in soup.select(".ex")):
                fail(errors, path, "問題文内に省略記号「……」が残っている")

            # 節の目印に重複がないか、ページ内リンクの移動先が存在するかを調べる。
            ids = {node.get("id") for node in soup.select("[id]")}
            id_list = [node.get("id") for node in soup.select("[id]")]
            if len(ids) != len(id_list):
                fail(errors, path, "重複したid属性がある")
            for anchor in soup.select('a[href^="#"]'):
                target = unquote(anchor["href"][1:])
                if target and target not in ids:
                    fail(errors, path, f"存在しないページ内リンク: #{target}")

            # ページに書かれた画像の場所を読み、ローカル画像のファイルが実際に存在するかを調べる。
            for image in soup.select("img[src]"):
                source = unquote(image["src"])
                if source.startswith(("http://", "https://", "data:")):
                    continue
                if not (path.parent / source).resolve().exists():
                    fail(errors, path, f"画像が存在しない: {source}")

            normalized = soup.get_text("", strip=True).replace(" ", "")
            for sentinel in CONTENT_SENTINELS.get((group, year), []):
                if sentinel.replace(" ", "") not in normalized:
                    fail(errors, path, f"必須本文が見つからない: {sentinel}")

            # コード例やスクリプトを除いた本文で、数式の区切り文字が対になっているかを数える。
            math_soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
            for ignored in math_soup.select("script, style, code, pre"):
                ignored.decompose()
            math_text = math_soup.get_text("\n")
            display_count = math_text.count("$$")
            if display_count % 2:
                fail(errors, path, "ディスプレイ数式の$$が対応していない")
            if math_text.replace("$$", "").count("$") % 2:
                fail(errors, path, "インライン数式の$が対応していない")

    # 集めたエラーがあれば一覧を表示して失敗を返し、なければ確認完了を表示する。
    if errors:
        print(f"情報過去問チェック: {checked}ページ、{len(errors)}件のエラー")
        print("\n".join(f"- {error}" for error in errors))
        return 1

    print(f"情報過去問チェック: {checked}ページ、エラー0件")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
