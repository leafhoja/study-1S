// 全科目のページで、先頭へ戻るボタン・目次・数式の横スクロール・検索語の強調・数式のコピーを扱う。
(function () {
  'use strict';

  /* ── PWA: manifest + apple-touch-icon を動的注入 ── */
  var me = document.currentScript;
  if (me && me.src) {
    var base = me.src.replace(/common\.js(\?.*)?$/, '');

    var mLink = document.createElement('link');
    mLink.rel = 'manifest';
    mLink.href = base + 'manifest.json';
    document.head.appendChild(mLink);

    var aLink = document.createElement('link');
    aLink.rel = 'apple-touch-icon';
    aLink.href = base + 'icons/apple-touch-icon.png';
    document.head.appendChild(aLink);

    [
      ['apple-mobile-web-app-capable', 'yes'],
      ['apple-mobile-web-app-status-bar-style', 'black-translucent'],
      ['apple-mobile-web-app-title', '学習ノート']
    ].forEach(function (pair) {
      var m = document.createElement('meta');
      m.name = pair[0];
      m.content = pair[1];
      document.head.appendChild(m);
    });
  }

  /* ── ページ先頭へ戻るボタン ── */
  var btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.textContent = '↑';
  btn.title = 'ページ先頭へ';
  btn.setAttribute('aria-label', 'ページ先頭へ戻る');
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(btn);

  /* ── スクロールイベント（両方まとめて） ── */
  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY;

    // back-to-top の表示切り替え
    btn.classList.toggle('visible', scrollY > 320);
  }, { passive: true });

  /* ── ナビリンク: 現在ページを自動 .active ── */
  document.addEventListener('DOMContentLoaded', function () {
    var cur = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a[href], header a[href]').forEach(function (a) {
      if (a.classList.contains('nav-back')) return;
      var href = a.getAttribute('href').split('#')[0].split('/').pop();
      if (href === cur) a.classList.add('active');
    });
  });

  /* ── キーボードショートカット ── */
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    /* t → ページ先頭へ */
    if (e.key === 't' || e.key === 'T') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      e.preventDefault();
    }
  });
})();

/* ── 汎用 目次サイドパネル ──
   ページに既存の目次ソース（すかき演習の #sidenav、熱力学ノートの
   .sidebar、線形代数学/力学の .toc ピル、現代経済理論の見出し・過去問カード）
   があれば、それを元にハンバーガーで開閉するサイドパネルを自動生成する。
   すかき演習・熱力学ノートは独自の目次UIを既に持つため、それらが
   先に読み込まれて #sidenav / .sidebar を作った場合はここでは何もしない。 */
(function () {
  'use strict';

  // ページ内の目次・見出し・問題からリンク一覧を集め、開閉できる目次を作る。
  function buildGenericToc() {
    if (document.getElementById('sidenav') || document.querySelector('.sidebar')) return;

    // 既存の目次があればそのリンクを読み、なければ見出しや問題カードから移動先を集める。
    var entries = [];
    var flatToc = document.querySelector('.toc');

    if (flatToc) {
      flatToc.querySelectorAll('a[href^="#"]').forEach(function (a) {
        entries.push({ href: a.getAttribute('href'), label: a.textContent.trim() });
      });
    } else {
      var headings = document.querySelectorAll('.container h2, .main-content h2');
      if (headings.length >= 2) {
        headings.forEach(function (h, i) {
          if (!h.id) h.id = 'gtoc-sec-' + (i + 1);
          var clone = h.cloneNode(true);
          var icon = clone.querySelector('.h2-icon');
          if (icon) icon.remove();
          entries.push({ href: '#' + h.id, label: clone.textContent.trim() });
        });
      } else {
        var qcards = document.querySelectorAll('.qcard');
        if (qcards.length >= 2) {
          qcards.forEach(function (q, i) {
            if (!q.id) q.id = 'gtoc-q-' + (i + 1);
            var numEl = q.querySelector('.q-num-badge');
            var topicEl = q.querySelector('.q-topic');
            var num = numEl ? numEl.textContent.trim() : String(i + 1);
            var topic = topicEl ? topicEl.textContent.trim() : '';
            entries.push({ href: '#' + q.id, label: '問' + num + (topic ? '　' + topic : '') });
          });
        }
      }
    }

    if (entries.length < 2) return;

    // 集めた移動先を表示する目次パネルと、外側を押すと閉じるための背景を作る。
    var backdrop = document.createElement('div');
    backdrop.className = 'gtoc-backdrop';
    document.body.appendChild(backdrop);

    var panel = document.createElement('nav');
    panel.className = 'gtoc-panel';
    panel.setAttribute('aria-label', '目次');

    var head = document.createElement('div');
    head.className = 'gtoc-head';
    var title = document.createElement('span');
    title.className = 'gtoc-title';
    title.textContent = '目次';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'gtoc-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', '閉じる');
    closeBtn.textContent = '✕';
    head.appendChild(title);
    head.appendChild(closeBtn);
    panel.appendChild(head);

    var body = document.createElement('div');
    body.className = 'gtoc-body';
    entries.forEach(function (e) {
      var a = document.createElement('a');
      a.href = e.href;
      a.textContent = e.label;
      body.appendChild(a);
    });
    panel.appendChild(body);
    document.body.appendChild(panel);

    if (flatToc) flatToc.style.display = 'none';

    var toggleBtn = document.createElement('button');
    toggleBtn.className = 'gtoc-toggle';
    toggleBtn.type = 'button';
    toggleBtn.setAttribute('aria-label', '目次を開く');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.textContent = '☰';

    var navInner = document.querySelector('.navbar-inner');
    if (navInner) navInner.insertBefore(toggleBtn, navInner.firstChild);

    // 目次と背景を表示し、開閉ボタンに開いた状態を記録する。
    function open() {
      panel.classList.add('gtoc-open');
      backdrop.classList.add('gtoc-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
    // 目次と背景を隠し、開閉ボタンに閉じた状態を記録する。
    function close() {
      panel.classList.remove('gtoc-open');
      backdrop.classList.remove('gtoc-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
    // 目次が開いていれば閉じ、閉じていれば開く。
    function toggle() {
      panel.classList.contains('gtoc-open') ? close() : open();
    }

    toggleBtn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('gtoc-open')) close();
    });
    body.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildGenericToc);
  } else {
    buildGenericToc();
  }
})();

/* ── 文中数式のはみ出し対策 + 横スクロール要素の共通インジケーター ──
   ・文中数式（mjx-container, display属性なし）は基本 display:inline のまま
     （でないと周囲の文字とベースラインがズレる）。画面に収まらない式だけ
     自然な幅を測って .mjx-inline-scroll を付与し、その式だけスライド可能にする。
   ・.mjx-inline-scroll やブロック数式・.formula・表など、実際に
     横スクロール可能なすべての要素にネイティブスクロールバーの代わりに
     独自の薄いグレーバーを表示し、操作後 1.2 秒でフェードアウトさせる。 ── */
(function () {
  /* 直近の非 inline な祖先（実際に折り返しの基準になる「箱」）の右端を返す */
  function nearestBlockRight(el) {
    var node = el.parentElement;
    while (node && node !== document.body) {
      if (getComputedStyle(node).display !== 'inline') {
        return node.getBoundingClientRect().right;
      }
      node = node.parentElement;
    }
    return document.documentElement.clientWidth;
  }

  // 文中の数式の幅を測り、画面や本文の右端を越えるものだけ横に動かせるようにする。
  function fixInlineMathOverflow() {
    var containers = document.querySelectorAll('mjx-container:not([display="true"])');
    if (containers.length === 0) return;
    /* 再計測のため一旦すべてリセット（幅が変わった場合や、行の途中から
       始まって残り幅に収まらないケースにも対応するため、まず自然な
       display:inline の状態に戻してから実際の右端を測る） */
    containers.forEach(function (el) { el.classList.remove('mjx-inline-scroll'); });
    var vw = document.documentElement.clientWidth;
    /* 読み取り（getBoundingClientRect）と書き込み（classList.add）を同じループで
       交互に行うと、要素数が多いページ（数式が数百個ある力学の過去問ページ等）で
       レイアウトの読み書きが交互に発生して強制リフローが要素数ぶん繰り返され、
       表示が大きく遅延する（レイアウト・スラッシング）。読み取りをすべて終えてから
       まとめて書き込むことでリフロー回数を1回にまとめる。 */
    var toMark = [];
    containers.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      /* ビューポート自体からはみ出す場合はもちろん、
         文中の途中から始まって「自分が属する箱」の右端に収まらない
         場合も検出する（箱の内側の余白に食い込むだけで、まだ
         ビューポート右端には届いていないケースを取りこぼさないため）。 */
      if (rect.right > vw - 2 || rect.right > nearestBlockRight(el) - 2) {
        toMark.push(el);
      }
    });
    toMark.forEach(function (el) { el.classList.add('mjx-inline-scroll'); });
  }

  var hideTimers = new WeakMap();

  // 横に動かせる範囲と現在位置を計算し、スクロール位置を示すバーの幅と位置に反映する。
  function updateIndicator(el) {
    var max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    var frac = el.clientWidth / el.scrollWidth;
    var pos = (el.scrollLeft / max) * (1 - frac) * 100;
    el.style.setProperty('--hs-width', Math.max(frac * 100, 8) + '%');
    el.style.setProperty('--hs-left', pos + '%');
  }

  // 横スクロール位置を示すバーを更新し、操作後しばらくしてバーを隠す。
  function onScroll(e) {
    var el = e.currentTarget;
    updateIndicator(el);
    el.classList.add('is-scrolling');
    clearTimeout(hideTimers.get(el));
    hideTimers.set(el, setTimeout(function () {
      el.classList.remove('is-scrolling');
    }, 1200));
  }

  // 横に動かせる要素に目印を付け、スクロール時に位置を示すバーを更新するようにする。
  function markScrollable(el) {
    if (el.classList.contains('js-hscroll')) return;
    el.classList.add('js-hscroll');
    updateIndicator(el);
    el.addEventListener('scroll', onScroll, { passive: true });
  }

  /* overflow-x: auto/scroll を持ちうる要素だけに絞った候補セレクタ。
     `body *`（全要素）を毎回スキャンして scrollWidth を読むと、数式を
     大量に含むページ（MathJax は数式1個につき数十個の要素を生成する）で
     DOM 要素数が数千〜万のオーダーになり、要素ごとに強制リフローが
     発生して表示が非常に遅くなる。overflow-x を指定しているのは
     common.css・各科目 style.css の以下のクラスだけなので、それらに限定する。
     新しく overflow-x:auto な要素を追加したときはここにも追記すること。 */
  var SCROLLABLE_CANDIDATES = '.navbar-links, mjx-container[display="true"], mjx-container.mjx-inline-scroll, .mathblock, .math-display, table';

  // 表や数式などの幅を調べ、内容がはみ出していて横に動かせる要素を集める。
  function scanScrollables() {
    var candidates = document.querySelectorAll(SCROLLABLE_CANDIDATES);
    var toMark = [];
    candidates.forEach(function (el) {
      if (el.scrollWidth > el.clientWidth + 1) {
        var ov = getComputedStyle(el).overflowX;
        if (ov === 'auto' || ov === 'scroll') toMark.push(el);
      }
    });
    toMark.forEach(markScrollable);
  }

  // 数式のはみ出しを調べた後、表や数式の横スクロール表示を整える。
  function runAll() {
    fixInlineMathOverflow();
    scanScrollables();
  }

  // 数式の表示が完成するのを待ってから、幅とはみ出しを調べる。
  function waitForMathJaxThenRun() {
    if (window.MathJax && MathJax.startup && MathJax.startup.promise) {
      MathJax.startup.promise.then(function () { setTimeout(runAll, 50); });
    } else if (document.querySelector('mjx-container') === null && !document.querySelector('script[src*="mathjax"]')) {
      /* このページに数式がそもそもない */
      runAll();
    } else {
      setTimeout(waitForMathJaxThenRun, 200);
    }
  }
  waitForMathJaxThenRun();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(runAll, 250);
  });

  /* 折り畳み要素（details, .box-prf, .exp-toggle 等）が開かれて
     数式が初めて見える幅で表示されたときにも再計測する。
     各サイトの実装に依らず class/open の変化を汎用的に監視する。
     ただし runAll/onScroll 自身が付与する class（無限ループの原因になる）は無視する。 */
  function isOwnMutation(mutations) {
    return mutations.every(function (m) {
      var t = m.target;
      return t.tagName === 'MJX-CONTAINER' || (t.classList && t.classList.contains('js-hscroll'));
    });
  }

  var mutationTimer;
  var observer = new MutationObserver(function (mutations) {
    if (isOwnMutation(mutations)) return;
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(runAll, 100);
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'open'], subtree: true });
})();

/* ── 検索結果からの遷移先ハイライト ──
   search.js は検索結果のページへ遷移する直前に検索語を sessionStorage へ保存する
   （教科をまたいでページが完全リロードされる静的サイトのため、遷移後の
   ページ側でこれを読み取るしかない）。遷移先ではリンク先のセクション（URLの
   #id）へスクロールし、そのセクション内（無ければページ全体）で検索語に
   一致する箇所をすべて <mark> で一時的にハイライトし、10秒後に元に戻す。 */
(function () {
  'use strict';
  var KEY = 'studySearchHighlight';
  var HIGHLIGHT_MS = 10000;
  var FADE_MS = 400;
  var STALE_MS = 15000; /* 遷移に時間がかかりすぎた場合は古い検索語として無視する */

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // URLに節の指定があればその節を、なければページ本文全体を検索語の強調対象にする。
  function highlightRoot() {
    if (location.hash.length > 1) {
      var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) return el;
    }
    return document.body;
  }

  // 本文の文字だけを強調対象にし、操作用の領域や数式などは除外する。
  function acceptNode(node) {
    var p = node.parentNode;
    if (!p || p.nodeType !== 1) return NodeFilter.FILTER_REJECT;
    if (/^(SCRIPT|STYLE|NAV|HEADER|FOOTER|MARK)$/.test(p.tagName)) return NodeFilter.FILTER_REJECT;
    if (p.closest && p.closest('mjx-container, .navbar, .gtoc-panel, .search-box')) return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }

  // 本文から検索語を探し、一致した文字を強調表示用のHTML要素で囲む。
  function wrapMatches(root, terms) {
    var re = new RegExp('(' + terms.map(escapeRegExp).join('|') + ')', 'ig');
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: acceptNode });
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) {
      if (re.test(n.data)) nodes.push(n);
      re.lastIndex = 0;
    }

    // 一致した文字を強調用の要素に置き換え、後で元に戻せるように一覧に保存する。
    var marks = [];
    nodes.forEach(function (node) {
      var text = node.data;
      var frag = document.createDocumentFragment();
      var last = 0;
      var m;
      re.lastIndex = 0;
      while ((m = re.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var mark = document.createElement('mark');
        mark.className = 'search-arrive-highlight';
        mark.textContent = m[0];
        frag.appendChild(mark);
        marks.push(mark);
        last = m.index + m[0].length;
        if (re.lastIndex === m.index) re.lastIndex++;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
    return marks;
  }

  // 検索語の強調色を消した後、囲みを外して元の本文の文字に戻す。
  function clearMarks(marks) {
    marks.forEach(function (mark) { mark.classList.add('search-arrive-highlight-out'); });
    setTimeout(function () {
      marks.forEach(function (mark) {
        var parent = mark.parentNode;
        if (!parent) return;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      });
    }, FADE_MS);
  }

  // 保存された検索語を読み、古いものを除外して、遷移先の本文で一致箇所を一時的に強調する。
  function run() {
    var raw;
    try { raw = sessionStorage.getItem(KEY); } catch (_) { raw = null; }
    if (!raw) return;
    try { sessionStorage.removeItem(KEY); } catch (_) {}

    // 保存した文字列を検索語のデータへ戻し、内容が空のものや時間が経ったものは使わない。
    var data;
    try { data = JSON.parse(raw); } catch (_) { return; }
    if (!data || !data.terms || !data.terms.length || Date.now() - data.ts > STALE_MS) return;
    var terms = data.terms.filter(Boolean);
    if (!terms.length) return;

    var root = highlightRoot();
    var marks;
    try { marks = wrapMatches(root, terms); } catch (_) { return; }
    if (!marks.length) return;

    marks[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
    setTimeout(function () { clearMarks(marks); }, HIGHLIGHT_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

/* ── MathJax コピー修正: ⌘C で選択中の数式全体を TeX としてコピー ── */
(function () {
  /* MathJax が保持している元の TeX を、対応する描画コンテナに保存する。 */
  function tagAll() {
    if (!window.MathJax || !MathJax.startup || !MathJax.startup.document) return;
    try {
      Array.from(MathJax.startup.document.math).forEach(function (item) {
        if (!item || !item.typesetRoot || item.math === undefined) return;
        item.typesetRoot.setAttribute('data-tex', item.math);
        item.typesetRoot.setAttribute('data-tex-d', item.display ? '1' : '0');
      });
    } catch (_) {}
  }

  // 数式の表示が完成したら、コピーに使う元の数式文字列を各数式に記録する。
  function waitAndTag() {
    if (window.MathJax && MathJax.startup && MathJax.startup.promise) {
      MathJax.startup.promise.then(tagAll);
    } else if (document.querySelector('script[src*="mathjax"]')) {
      setTimeout(waitAndTag, 200);
    }
  }
  waitAndTag();

  // 表示中の数式に記録された、元のTeX文字列と文中・独立行の区別を取り出す。
  function getTeX(container) {
    var tex = container.getAttribute('data-tex');
    if (tex !== null) {
      return { tex: tex, display: container.getAttribute('data-tex-d') === '1' };
    }
    /* data-tex がまだ付く前にコピーされた場合の予備経路。 */
    var annotations = container.getElementsByTagName('annotation');
    for (var i = 0; i < annotations.length; i++) {
      if (annotations[i].getAttribute('encoding') === 'application/x-tex') {
        return {
          tex: annotations[i].textContent.trim(),
          display: container.getAttribute('display') === 'true'
        };
      }
    }
    return null;
  }

  // 選択範囲が指定されたHTML要素や文字に重なっているかを確かめる。
  function intersects(range, node) {
    try { return range.intersectsNode(node); } catch (_) { return false; }
  }

  // ひとまとまりの文字のうち、利用者が選択した部分だけを取り出す。
  function selectedText(node, range) {
    var start = node === range.startContainer ? range.startOffset : 0;
    var end = node === range.endContainer ? range.endOffset : node.data.length;
    return node.data.slice(start, end);
  }

  // 選択範囲の始点・終点と内側を調べ、数式が含まれているかを確かめる。
  function containsMath(range) {
    var start = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
    var end = range.endContainer.nodeType === 1 ? range.endContainer : range.endContainer.parentElement;
    if ((start && start.closest('mjx-container')) || (end && end.closest('mjx-container'))) return true;

    var common = range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;
    return !!(common && Array.from(common.querySelectorAll('mjx-container')).some(function (math) {
      return intersects(range, math);
    }));
  }

  /* 通常文は選択された部分だけ、数式は一部しか選択されていなくても全体を返す。 */
  function selectionToText(node, range) {
    if (!intersects(range, node)) return '';
    if (node.nodeType === 3) return selectedText(node, range);
    if (node.nodeType !== 1) return '';

    var tag = node.tagName.toLowerCase();
    if (tag === 'mjx-assistive-mml') return '';
    if (tag === 'mjx-container') {
      var info = getTeX(node);
      if (!info || !info.tex) return '';
      /* MathJax の右クリック → TeX Commands と同じく、$ 記号は足さず元ソースを返す。 */
      return info.display ? '\n' + info.tex + '\n' : info.tex;
    }
    if (tag === 'br') return '\n';

    var value = Array.from(node.childNodes).map(function (child) {
      return selectionToText(child, range);
    }).join('');
    if (/^(p|div|h[1-6]|li|section|article|blockquote|pre|tr)$/.test(tag) && value.trim()) {
      return '\n' + value.trimEnd() + '\n';
    }
    return value;
  }

  // コピー操作の選択範囲に数式があれば、元の数式文字列を含む文字をクリップボードに渡す。
  document.addEventListener('copy', function (e) {
    var selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
    var range = selection.getRangeAt(0);
    if (!containsMath(range)) return;

    tagAll();
    var root = range.commonAncestorContainer;
    if (root.nodeType === 3) root = root.parentElement;

    /* 数式内から数式内までの選択では、必ずその数式全体まで範囲を広げる。 */
    var mathRoot = root && root.closest ? root.closest('mjx-container') : null;
    if (mathRoot) root = mathRoot;

    var text = selectionToText(root, range).replace(/\n{3,}/g, '\n\n').trim();
    if (!text || !e.clipboardData) return;
    e.preventDefault();
    e.clipboardData.setData('text/plain', text);
  });
}());
