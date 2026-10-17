# docs/ — 学習ノートサイト 共通デザイン規約

GitHub Pages で公開する静的サイト（`leafhoja.github.io/study`）。各科目は `docs/<科目名>/` に
独立したフォルダを持ち、`../common.css` / `../common.js`（サイト共通）＋ 科目ごとの `style.css`
（配色・科目固有コンポーネント）を読み込む構成。**新しい科目を追加するときは、このファイルの
パターンに合わせること。** 既存の実装例：`力学/`・`線形代数学/`・`現代経済理論/`・`すかき演習1S/`・
`数学基礎理論演習1A/`。

## 1. ナビバー（全ページ共通）

```html
<nav class="navbar">
  <div class="navbar-inner">
    <a class="navbar-brand" href="index.html">科目名</a>
    <div class="navbar-links">
      <a href="../index.html" class="nav-back">← 学習ノート</a>
      <a href="index.html" class="active">トップ</a>
      <!-- 各章・各年度への直リンクをここに並べる（多くてもOK、横スクロールする） -->
    </div>
  </div>
</nav>
```

- `.nav-back` は常に先頭、`../index.html`（サイトのトップ）に戻るリンク。
- 現在ページに `class="active"` を付ける。
- リンクが多くても `.navbar-links` は `overflow-x:auto` で横スクロールするので詰め込んでよい
  （`common.css` 側で対応済み）。

## 2. ヒーロー（`.hero`）

```html
<div class="hero">
  <h1>科目名</h1>
  <p class="subtitle">一言サブタイトル（例：講義ノートの解説と過去問の解答・解説）</p>
  <p class="meta">補足情報（担当教員・ターム等、省略可）</p>
</div>
```

**やってはいけないこと**：
- `.subtitle`/`.meta` を使わず、素の `<p>` に独自の大きなフォントサイズを当てた説明文を
  長々と書かない（すかき演習1S・数学基礎理論演習1Aで実際にやってしまい、後から撤去した）。
  `.subtitle`/`.meta` は `common.css`側で既に上品なサイズに調整済みなので、それに乗ること。
- 科目タグを並べた「ヒーローバッジ行」（🔢 微分積分学演習／🔷 線形代数学演習／実施時期、のような
  ピル状バッジの列）を追加しない。情報として不要と判断され撤去された。

## 3. トップページのタブ／カードUI

### 3.0 教科トップページの共通レイアウト（必須）

`docs/<科目名>/index.html` は、ジェンダー論・現代経済理論のトップページを基準にした
`docs/subject-home.css` を必ず使う。新しい教科を追加するときも独自のトップページデザインを
作らず、次の順序でCSSを読み込むこと。

```html
<link rel="stylesheet" href="../common.css">
<link rel="stylesheet" href="style.css"><!-- 科目固有の本文・配色 -->
<link rel="stylesheet" href="../subject-home.css"><!-- トップページ共通（必ず最後） -->
```

`body` には `subject-home` と科目別配色クラスを付ける。

```html
<body class="subject-home home-科目識別子" data-nav-page="index">
```

新しい科目の配色は `subject-home.css` に `home-科目識別子` を追加し、`--home-accent`、
`--home-deep`、`--home-soft`、必要なら `--home-bg` を定義する。トップページ内へ同じスタイルを
インラインで再実装しない。

標準の並びは次のとおり。

1. 共通ナビバー
2. `.hero`（`h1`＋`.subtitle`＋必要なら`.meta`）
3. 教科内検索 `.search-box`
4. `.container`（または既存互換の `.index-body` / `.eng-body`）
5. 紹介文 `.intro-box`（必要な場合）
6. `.home-section-title` とカード／一覧
7. 共通フッター

セクション見出しは次の形を使う。色・余白・罫線をインライン指定しない。

```html
<h2 class="home-section-title">講義ノート</h2>
```

**情報量を減らさないこと**：デザイン統一は表示内容の削除を意味しない。数学・理科にある
「重要定義・定理 一覧」「重要公式クイックリファレンス」「記号・用語一覧」「依存関係」など、
科目固有の参照情報は全項目を残す。長い表や数式一覧も省略・折りたたみ・別ページへの追い出しを
行わず、`subject-home.css` で箱・表・見出しの見た目だけを統一する。既存トップページを改修する
場合は、改修前後でリンク、カード、表の行、説明文が減っていないことを確認する。

カードコンポーネントは複数あり、**すべて同じ配色・ホバー挙動**で統一するが、
色線の位置だけは「講義ノート系＝上、過去問系＝左（横）」で使い分ける：

```css
/* 共通の見た目（色・ホバーはこれで統一） */
background: var(--surface);
border-radius: 10px; /* card は10px、year-card/lecture-cardは12px系でも可 */
box-shadow: 0 2px 14px rgba(0,0,0,.08);
transition: transform .18s, box-shadow .18s;

/* 講義ノート系（.card / .chapter-card / .lecture-card / .lec-card）は上に色線 */
border-top: 4px solid var(--accent);   /* カテゴリ色で塗り分けてもよい */

/* 過去問系（.year-card）と講義タブ（.lec-tab）は左に色線 */
border-left: 4px solid var(--accent);

/* hover */
transform: translateY(-5px);
box-shadow: 0 10px 28px rgba(0,0,0,.13);
```

使い分け：

| コンポーネント | 用途 | 構造 | 色線 |
|---|---|---|---|
| `.card-grid` / `.card` | 説明文が長い項目（講義の章など） | `.card-tag`（§1等）+ `h3`（タイトル）+ `p`（説明文） | 上 |
| `.lec-tab-grid` / `.lec-tab` | 番号付きの回が多い講義ノート一覧 | `.ln-badge`（回数）+ `.ln-title` + `.ln-detail` | 左 |
| `.year-grid` / `.year-card` | 均質で短い項目（過去問の年度など） | `.yn`（大きな数字）+ 必要な場合だけ `.yl`（補足） | 左 |
| `.lecture-grid` / `.lecture-card` | 番号付きの回・小テスト一覧 | `.lc-num` + `.lc-title` + `.lc-status` | 上 |

**過去問カードは西暦だけを主役にする**：`.yn` には `R2` ではなく `2020` を大きく表示する。
令和・平成などの元号表記は付けない（`.yl` に元号を添える旧パターンは廃止）。
「解答つき」「26問」などの自明な補助ピルは置かない。日付や試験種別など、年度だけでは
区別できない情報が必要な場合に限り `.yl` を添える。

```html
<a class="year-card" href="kakomon_2020.html">
  <div class="yn">2020</div>
</a>
```

**過去問ファイルの命名**：年度ごとのページは `kakomon_2020.html` のように
`kakomon_` + 西暦4桁 + `.html` に統一する（`r2.html`・`2020kakomon.html`・`2020.html` の
ような表記はすべてこの形に揃える）。年度で分類できないページ（対策・予想問題・サンプル問題等）
は `kakomon_taisaku.html` のように `kakomon_` + 短い英字スラグ + `.html` にする。

`.lecture-card` でカテゴリ色を出したい場合（微積＝青、線形代数＝緑、等）は
`border-top-color` だけを変える（全周ボーダーにしない）：

```css
.lecture-card.available     { border-top-color: var(--calc-accent); }
.lecture-card.lin-available { border-top-color: var(--lin-accent); }
```

`過去問`/`予想問題` のように専用の修飾クラスを作るほどでもない一回限りの色は、
`<div class="lecture-card" style="border-color:#805ad5;">` のようにインラインで
`border-color`（前面の色だけ変わる。他辺は幅0なので実害なし）を上書きしてよい。

## 4. 定義・定理・証明などの箱コンポーネント（数式が多い科目）

```css
.def, .thm, .prop, .cor, .ex, .note, .mot, .sol, .warn { ... }
```

`<div class="def"><span class="box-label">定義 1.1　◯◯</span> ... </div>` の形。
証明・導出は `<details><summary>導出を見る</summary><div class="proof-body">...</div></details>`
で折りたたみにする（既定は閉じておく。ただし章の核心的な導出は `<details open>` で開いておいてよい）。

MathJax設定の定番：

```html
<script>
  MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      tags: 'ams'
    },
    options: { skipHtmlTags: ['script','noscript','style','textarea','pre'] }
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" async></script>
```

## 5. ハンバーガー目次（`nav.js` パターン）

ページ数が一定以上ある科目（複数章＋複数年度の過去問など）には、**左上に `☰` を出す
オフキャンバス目次**を付ける。既存実装：`線形代数学/nav.js`（シンプル・フラットなページ一覧）、
`すかき演習1S/nav.js`（章ごとにグループ化＋各章内の問題アンカーまで展開できる版）。

最小構成（線形代数学版がテンプレートとして扱いやすい）：

- `<script src="nav.js"></script>` を各ページの `</body>` 直前で読み込む。
- `nav.js` が起動時に `.navbar-inner` の先頭に `☰` ボタンを挿入し、クリックで
  `#sidenav`（固定オフキャンバスパネル）を開閉する。
- ページ一覧はグループ化した配列（例：`NOTE_PAGES`, `EXAM_PAGES`）として `nav.js` の先頭で定義し、
  現在ページには `sidenav-current` クラスを付けてハイライトする。
- 外側クリック／Escapeキー／リンククリック（モバイル時）で自動的に閉じる。
- 対応するCSS（`.sidenav`, `.sidenav-toggle-btn`, `.sidenav-group` 等）は
  `すかき演習1S/style.css` または `線形代数学/style.css` からほぼそのまま流用できる。

**アクセス制御との連携（必須）**：`nav.js` はページ一覧を DOM 生成で毎回組み立てる
ため、素のままだと access_control.js を一切見ずに全ページの正式タイトルを並べて
しまう（トップページのカードを非表示にしても、こちらは別経路のため無関係に漏れる）。
各 `nav.js` には `pageAllowed(prefix, file)`（サブフォルダが1つなら `pageAllowed(file)`）
という判定関数を定義し、ページ一覧配列を `buildGroup`/`forEach` に渡す前に
`.filter(function (p) { return pageAllowed(..., p.file); })` で絞り込むこと。
`prefix` は access_control.js の `pages[教科]` のキー命名（例：`過去問/`, `講義/`,
`calculus/` 等）に合わせた、そのグループの科目フォルダ起点の相対パス。
`file === 'index.html'`（ハブページへのリンク）は判定をスキップして常に表示する。
新しいページ・グループを `nav.js` に追加したら、この `.filter(...)` の対象に
含めるのを忘れないこと。

**閲覧履歴・進捗トラッキング機能は追加しない**：`localStorage` でページ訪問履歴を記録し
進捗バーやバッジを出す機能を過去に実装したが、不要と判断され撤去済み（すかき演習1S）。
今後もこの種の機能は付けない。

## 5.5. 教科内検索（`search.js` パターン）

各科目トップページには**その科目内だけ**を対象にした全文検索ボックスを置く（教科をまたいだ
横断検索はしない設計）。共有コードはすべて `docs/` 直下：

- `docs/tools/build-search-index.py` — 科目フォルダ配下の `*.html` を走査し、id 付き
  セクション（`<div class="section" id="...">` 等）単位でテキストを抽出して
  `docs/<科目>/search-data.js` を生成する（標準ライブラリのみ・全科目共通の1本）。
  ページを追加・編集したら **`python3 tools/build-search-index.py` を再実行**すること
  （引数なしで全科目、`python3 tools/build-search-index.py 線形代数学` で1科目だけも可）。
- `docs/search.js` — 検索ボックスの動作（全科目共通の1本）。ページ内の `[data-search]`
  要素を自動検出し、同じフォルダの `search-data.js` を遅延読み込みして検索する。
  部分一致に加えて文字2-gramの重なり率によるあいまい一致を行い、完全一致でなくても
  一致度が高ければ結果に出す（タイポや表記ゆれを許容するため）。
- スタイルは `common.css` の `.search-box` 系クラス（全科目共通）。
- **アクセス制御との連携**：`search-data.js` は access_control.js の許可設定を知らない
  静的データなので、素通しにすると非表示にしたページの説明文が検索結果として漏れる。
  これを2重に防いでいる：①`build-search-index.py` は各階層の `index.html`（ハブページ）
  を索引化しない（カードグリッドは id を持たないため、複数ページ分の説明文が1つの
  ブロックに混ざってしまい、ページ単位では除外できなくなるため）。②`search.js` は
  表示直前に各結果の `item.p` から `access-guard.js` と同じ方法でページIDを求め、
  `isAllowed` で許可されないものを除外する。新しいページを足したときは通常どおり
  `build-search-index.py` を再実行すればよく、追加対応は不要。

新しい科目のトップページに設置する最小構成：

```html
<div class="hero"> ... </div>

<div class="search-box" data-search>
  <div class="search-input-row">
    <span class="search-icon" aria-hidden="true">🔍</span>
    <input type="search" class="search-input" placeholder="◯◯のノート内を検索（用語・キーワード）…" autocomplete="off" aria-label="◯◯内を検索">
  </div>
  <div class="search-results" hidden></div>
</div>
```

`</body>` 直前、`common.js` の後に `<script src="../search.js"></script>` を追加する。
検索ボックスは**トップページにのみ**置く（他のページには置かない）。

## 6. 表記・命名

- 「授業」ではなく「講義」を使う（配布される手書きノート自体が講義そのもの、という理解のため）。
  フォルダ名も `講義ノート/` のように統一する（`授業ノート/` は使わない）。
- 過去問・生の手書きノートPDF・音声など、著作物性のある原本資料は**リポジトリに含めない**。
  `docs/<科目>/講義ノート/`・`docs/<科目>/過去問/` のようなフォルダを作ったら、必ず
  ルートの `.gitignore` に追記すること（既存エントリを参照）。
- トップレベル `docs/index.html` の科目カードの `.sub` は、実態に合わせて
  「講義ノート・過去問解説」のように過不足なく書く（過去問セクションがあるのに
  「講義ノート」とだけ書かない、など）。

## 7. アクセス制御

全教科・教科ごと・**教科内の個別ページごと**の公開可否は `docs/access_control.js`
（`all` / `subjects` / `pages` / `adminPassword`）で一元管理する。静的サイトなので
厳格な保護ではなく、あくまでソフトな閲覧制限。優先順位は `all` → `subjects[教科]` →
`pages[教科][ページID]` の順（`all=0` がすべてに優先）。

- **ページID** は「教科フォルダを起点とした相対パス・拡張子なし」。
  例：`現代経済理論/講義/第1回.html` → `"講義/第1回"`、`英語一列/session9.html` → `"session9"`。
  各階層の `index.html`（ハブページ）はページ単位では管理しない設計（`pages` には載せない。
  常に教科レベルの許可だけで判定される）。
- 不許可の教科は `docs/index.html` でカード自体が非表示になり、不許可の個別ページは
  各教科の `index.html`（および `現代経済理論/講義/index.html` のようなサブハブページ）
  内のリンクが同様に非表示になる（`access-ui.js`。対象要素に `data-subject="教科名"`
  または `data-page="ページID"` を付与しておく必要がある）。
  教科ページ・個別ページのURLを直接開いた場合も、不許可なら `docs/index.html` に
  戻される（各ページ先頭の `access-guard.js`。こちらは属性付与不要、自動判定）。
  検索ボックス経由での漏えい対策は §5.5 を参照（`search-data.js` はカード非表示とは
  別経路なので、これらとは別に対策している）。
- 力学・英語一列・熱力学・微分積分学・すかき演習1S・現代経済理論の一部のように、
  各ページ自身のナビバーにも兄弟ページ（第N章・SessionN・過去問の年度など）への
  直リンクが並んでいる科目では、トップページのカードを非表示にしただけでは
  不十分（そのページを直接開けば、アクセス権のない章のタイトルがナビバーの
  リンクとして見えてしまう）。`python3 tools/inject_nav_data_page.py` が、
  ナビバー内のリンクのうち `pages[教科]` に実在するページIDと一致するものへ
  自動で `data-page` を付与し、`access-ui.js` の読み込みも追加する（`../` で
  始まるリンクや `index.html` へのリンクは対象外）。**ナビバーに兄弟ページへの
  直リンクを追加・変更したら再実行**すること（`insert_access_guard.py` 同様、
  既に付与済みの箇所は上書きしないので何度でも安全に実行できる）。
- **新しい教科・新しいページを追加したら**：
  1. `python3 tools/insert_access_guard.py` を再実行し、`<meta charset="UTF-8">` の直後に
     `access_control.js`／`access-guard.js` の読み込みを（相対階層に応じて）挿入する
     （未挿入のページは保護されない）。
  2. `access_control.js` の `subjects`（新教科の場合）・`pages[教科]`（新ページの場合）に
     エントリを追加する（`pages` に書き忘れても「教科が許可されていれば許可」がデフォルトなので
     誤って閉じることはないが、個別に管理したいなら明示的に追加すること）。
  3. そのページへのリンクをその教科の `index.html`（トップハブ）に置く場合は、
     リンク要素（または `<a>` を内包するカード用の div）に `data-page="ページID"` を付与する。
- `docs/admin.html` は管理者用の全教科・全ページアクセスページ。初期パスワードは `1234`
  （`access_control.js` の `adminPassword` で変更可）。認証成功はブラウザの
  `localStorage` に保存され、同じ端末なら再入力不要（`adminPassword` を変更すると
  保存済みの認証は自動的に無効化される）。`docs/index.html` を最下部までスクロールすると
  現れるリンクから入れる。
