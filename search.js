/* ── 教科内検索（サイト共通） ──
   各科目の index.html に置かれた `[data-search]` ボックスを自動的に有効化する。
   同じ科目フォルダ内の search-data.js（tools/build-search-index.py が生成）を
   読み込み、タイトル・本文に対してあいまい一致（部分一致 + 文字2-gram重なり率）で
   スコアリングする。科目をまたいだ検索は行わない（search-data.js はページと
   同じフォルダにあるものだけを読む）。 */
(function () {
  'use strict';

  var FUZZY_MIN = 0.5;   // これ未満の重なり率は「無関係」とみなして除外する
  var MAX_RESULTS = 12;

  // アクセス制御との連携: search-data.js は build-search-index.py が生成する
  // 静的データで、access_control.js の許可設定を一切知らない。そのままでは
  // ページ単位で非表示にしたページの説明文が検索結果として漏れてしまうため、
  // 表示直前に item.p（教科フォルダ起点の相対パス）から access-guard.js と
  // 同じ方法でページIDを求め、isAllowed で許可されない項目は結果から除外する。
  var el = document.currentScript;
  var src = (el && el.getAttribute('src')) || '';
  var depth = (src.match(/\.\.\//g) || []).length || 1;
  var pathParts = location.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  // 教科カードは href="力学/" のようにディレクトリ形式で張られており、この形で
  // 遷移すると location.pathname は "/study/力学/" のように末尾がそのフォルダ名で
  // 終わり、"index.html" は一切現れない。access-guard.js と同じ理由で補正する。
  if (/\/$/.test(location.pathname)) pathParts.push('index.html');
  var subjectIdx = pathParts.length - 1 - depth;
  var currentSubject = subjectIdx >= 0 ? pathParts[subjectIdx] : '';

  // 検索候補のページが、現在の科目の閲覧設定で表示を許可されているかを調べる。
  function isItemAllowed(item) {
    if (!currentSubject || !window.ACCESS_CONTROL) return true;
    var pageId = (item.p || '').replace(/\.html$/, '');
    if (!pageId || /(^|\/)index$/.test(pageId)) {
      return window.ACCESS_CONTROL.isAllowed(currentSubject);
    }
    return window.ACCESS_CONTROL.isAllowed(currentSubject, pageId);
  }

  // 全角・半角などの表記をそろえ、英字を小文字にして比較しやすくする。
  function normalize(s) {
    s = s || '';
    return (s.normalize ? s.normalize('NFKC') : s).toLowerCase();
  }

  // 文字列を指定した文字数ずつ切り出し、似た語句を比べるための一覧にする。
  function ngrams(s, n) {
    if (s.length <= n) return [s];
    var g = [];
    for (var i = 0; i <= s.length - n; i++) g.push(s.slice(i, i + n));
    return g;
  }

  /* term が text に対してどれだけ「らしい」か（0〜1）。
     完全な部分文字列一致なら 1。そうでなくても、2-gram の重なり率が高ければ
     タイポや語尾の揺れを許容して一致とみなす（＝確率が高ければヒットさせる）。 */
  function overlapScore(term, text) {
    if (!term || !text) return 0;
    if (text.indexOf(term) !== -1) return 1;
    var tg = ngrams(term, 2);
    if (!tg.length) return 0;
    var bag = {};
    ngrams(text, 2).forEach(function (g) { bag[g] = (bag[g] || 0) + 1; });
    var hits = 0;
    tg.forEach(function (g) { if (bag[g] > 0) { hits++; bag[g]--; } });
    return hits / tg.length;
  }

  // 検索語と見出し・本文の一致度を計算し、見出しの一致を高く評価する。
  function scoreItem(terms, item) {
    var title = normalize(item.t);
    var body = normalize(item.x);
    var total = 0;
    var bestTermScore = 0;
    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      var ts = overlapScore(term, title);
      var bs = overlapScore(term, body);
      var best = Math.max(ts, bs);
      if (best < FUZZY_MIN) return -1; /* このキーワードがどこにも十分一致しない → 除外 */
      bestTermScore = Math.max(bestTermScore, best);
      total += ts * 8 + bs * 1;
    }
    return total;
  }

  /* 検索結果のページへ遷移する直前に検索語を保存しておく。遷移先では
     common.js がこれを読み取り、一致箇所を一時的にハイライトする
     （sessionStorage はページ遷移をまたいで残るがタブを閉じれば消える）。 */
  function saveHighlightTerms(terms) {
    try {
      sessionStorage.setItem('studySearchHighlight', JSON.stringify({ terms: terms, ts: Date.now() }));
    } catch (_) { /* private mode 等で使えない場合はハイライトを諦めるだけ */ }
  }

  // 文字列に含まれる記号を、HTMLのタグとして解釈されず文字として表示できる形にする。
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // 検索語に含まれる記号を、検索の特別な命令として扱わず、その文字のまま探せる形にする。
  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 検索語の近くから短い本文を抜き出し、一致した語を強調した結果表示を作る。
  function snippet(text, terms) {
    var norm = normalize(text);
    var idx = -1;
    for (var i = 0; i < terms.length && idx === -1; i++) {
      idx = norm.indexOf(terms[i]);
    }
    var start = idx === -1 ? 0 : Math.max(0, idx - 28);
    var raw = text.slice(start, start + 96);
    var prefix = start > 0 ? '…' : '';
    var suffix = start + 96 < text.length ? '…' : '';
    var html = escapeHtml(raw);
    terms.forEach(function (term) {
      if (!term) return;
      var re = new RegExp('(' + escapeRegExp(term) + ')', 'ig');
      html = html.replace(re, '<mark>$1</mark>');
    });
    return prefix + html + suffix;
  }

  // 検索の入力欄と結果欄を取得し、文字入力・矢印キー・クリックに応じた動作を用意する。
  function init(box) {
    var input = box.querySelector('.search-input');
    var resultsEl = box.querySelector('.search-results');
    if (!input || !resultsEl) return;

    var dataPromise = null;
    var selIndex = -1;
    var debounceTimer = null;
    var lastTerms = [];

    // その科目の検索用データを必要になったときに読み込み、次の検索でも同じデータを使う。
    function loadData() {
      if (dataPromise) return dataPromise;
      dataPromise = new Promise(function (resolve) {
        if (window.__SEARCH_DATA__) { resolve(window.__SEARCH_DATA__); return; }
        var s = document.createElement('script');
        s.src = 'search-data.js';
        s.onload = function () { resolve(window.__SEARCH_DATA__ || []); };
        s.onerror = function () { resolve([]); };
        document.head.appendChild(s);
      });
      return dataPromise;
    }

    // 検索結果欄を隠して内容を消し、キーボードでの選択状態も解除する。
    function close() {
      resultsEl.hidden = true;
      resultsEl.innerHTML = '';
      selIndex = -1;
    }

    // 検索語に合う閲覧可能な項目を一致度順に並べ、リンクと本文の抜粋を結果欄に表示する。
    function render(query, data) {
      var terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
      selIndex = -1;
      lastTerms = terms;
      if (!terms.length) { close(); return; }

      // 閲覧できる項目だけを対象に一致度を計算し、上位の検索結果に絞る。
      var scored = [];
      data.forEach(function (item) {
        if (!isItemAllowed(item)) return;
        var s = scoreItem(terms, item);
        if (s > 0) scored.push({ item: item, score: s });
      });
      scored.sort(function (a, b) { return b.score - a.score; });
      scored = scored.slice(0, MAX_RESULTS);

      resultsEl.hidden = false;
      if (!scored.length) {
        resultsEl.innerHTML = '<div class="search-empty">一致する内容が見つかりませんでした</div>';
        return;
      }

      // 検索結果ごとに移動先リンク・見出し・本文の抜粋を組み立て、結果欄に入れる。
      resultsEl.innerHTML = scored.map(function (r) {
        var item = r.item;
        var href = item.p + (item.id ? '#' + item.id : '');
        var title = item.t || item.c;
        return '<a class="search-hit" href="' + escapeHtml(href) + '">' +
          '<div class="search-hit-path">' + escapeHtml(item.c) + '</div>' +
          '<div class="search-hit-title">' + escapeHtml(title) + '</div>' +
          '<div class="search-hit-snippet">' + snippet(item.x || item.t || '', terms) + '</div>' +
          '</a>';
      }).join('');
    }

    // 入力欄の文字を読み、空でなければ検索データを使って結果を表示する。
    function runSearch() {
      var query = input.value;
      if (!normalize(query.trim())) { close(); return; }
      loadData().then(function (data) { render(query, data); });
    }

    // 文字入力後に少し待ってから検索する。続けて入力されたら待ち時間を数え直す。
    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runSearch, 120);
    });

    input.addEventListener('focus', loadData);

    // Escapeで結果を閉じ、上下キーで選び、Enterで選択したページへ移動する。
    input.addEventListener('keydown', function (e) {
      var hits = resultsEl.querySelectorAll('.search-hit');
      if (e.key === 'Escape') {
        close();
        input.blur();
        return;
      }
      if (!hits.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selIndex = Math.min(selIndex + 1, hits.length - 1);
        updateSelection(hits);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selIndex = Math.max(selIndex - 1, 0);
        updateSelection(hits);
      } else if (e.key === 'Enter') {
        /* 矢印キーで明示的に選択していない限り、Enterでは先頭の結果へ飛ばず
           一覧を表示したままにする（誤って無関係なページに遷移するのを防ぐ）。 */
        e.preventDefault();
        if (selIndex >= 0 && hits[selIndex]) {
          saveHighlightTerms(lastTerms);
          window.location.href = hits[selIndex].getAttribute('href');
        }
      }
    });

    // 矢印キーで選んだ検索結果を目立たせ、結果欄の見える位置に移す。
    function updateSelection(hits) {
      hits.forEach(function (h, i) { h.classList.toggle('sel', i === selIndex); });
      if (hits[selIndex]) hits[selIndex].scrollIntoView({ block: 'nearest' });
    }

    resultsEl.addEventListener('click', function (e) {
      if (e.target.closest('.search-hit')) saveHighlightTerms(lastTerms);
    });

    document.addEventListener('click', function (e) {
      if (!box.contains(e.target)) close();
    });
  }

  // ページに置かれた検索ボックスを探し、それぞれで検索できるようにする。
  function initAll() {
    document.querySelectorAll('[data-search]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
