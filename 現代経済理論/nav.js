// 現代経済理論のページ一覧から、画面横に開く目次を作り、ページ移動と開閉操作を扱う。
(function () {
  'use strict';

  /* ================================================================
     ページ定義（2グループ構成）
       1. 講義      lec-index, lec-1〜lec-13（講義/ サブフォルダ）
       2. 過去問    exam-2023〜exam-2025（科目ルート）
  ================================================================ */
  var LEC_PAGES = [
    { file: 'index.html',  key: 'lec-index', label: '目次' },
    { file: '第1回.html',  key: 'lec-1',  label: '第1回 実証ミクロ経済学入門' },
    { file: '第2回.html',  key: 'lec-2',  label: '第2回 金融政策と物価' },
    { file: '第3回.html',  key: 'lec-3',  label: '第3回 構造推定アプローチ' },
    { file: '第4回.html',  key: 'lec-4',  label: '第4回 マーケットデザイン' },
    { file: '第5回.html',  key: 'lec-5',  label: '第5回 実証会計理論入門' },
    { file: '第6回.html',  key: 'lec-6',  label: '第6回 開発経済学' },
    { file: '第7回.html',  key: 'lec-7',  label: '第7回 交通政策の経済学' },
    { file: '第8回.html',  key: 'lec-8',  label: '第8回 都市経済学入門' },
    { file: '第9回.html',  key: 'lec-9',  label: '第9回 産業組織：価格設定' },
    { file: '第10回.html', key: 'lec-10', label: '第10回 経済史' },
    { file: '第11回.html', key: 'lec-11', label: '第11回 マクロモデルと政策分析' },
    { file: '第12回.html', key: 'lec-12', label: '第12回 金融工学入門' },
    { file: '第13回.html', key: 'lec-13', label: '第13回 情報カスケードと群衆行動' },
  ];

  // 過去問や試験対策の移動先・識別名・目次に出す文字をまとめる。
  var EXAM_PAGES = [
    { file: 'kakomon_2023.html', key: 'exam-2023', label: '2023年度' },
    { file: 'kakomon_2024.html', key: 'exam-2024', label: '2024年度' },
    { file: 'kakomon_2025.html', key: 'exam-2025', label: '2025年度' },
  ];

  // 指定された種類のHTML要素を作り、見た目の名前と表示する文字を付ける。
  function mk(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  // アクセス制御との連携: トップページのカードを非表示にしても、このハンバーガー
  // メニューは access_control.js を見ずに全ページのタイトルを並べてしまうため、
  // ここでも同じ許可判定を通す（index.html 自身は常に表示。講義は 講義/
  // サブフォルダにあるので、access_control.js の pages[] のキーに合わせて
  // prefix を付けて判定する）。
  function pageAllowed(prefix, file) {
    if (file === 'index.html') return true;
    if (!window.ACCESS_CONTROL) return true;
    return window.ACCESS_CONTROL.isAllowed('現代経済理論', prefix + file.replace(/\.html$/, ''));
  }

  // 現在のページを調べ、科目内のページへ移動できる目次と開閉ボタンを作る。
  function buildNav() {
    var currentKey = document.body.getAttribute('data-nav-page') || '';
    var inLectureDir = currentKey.indexOf('lec-') === 0;
    var lecPrefix = inLectureDir ? '' : '講義/';
    var rootPrefix = inLectureDir ? '../' : '';
    var homeHref = rootPrefix + 'index.html';

    // 目次の外枠と見出しを作り、その中にリンクを入れる領域を用意する。
    var nav = document.createElement('nav');
    nav.id = 'sidenav';
    nav.className = 'sidenav';
    nav.setAttribute('aria-label', '現代経済理論 ナビゲーション');

    var head = mk('div', 'sidenav-header');
    var brand = document.createElement('a');
    brand.className = 'sidenav-brand';
    brand.href = homeHref;
    brand.textContent = '現代経済理論';
    head.appendChild(brand);
    var closeBtn = mk('button', 'sidenav-close-btn', '✕');
    closeBtn.setAttribute('aria-label', '閉じる');
    head.appendChild(closeBtn);
    nav.appendChild(head);

    var body = mk('div', 'sidenav-body');
    nav.appendChild(body);

    // ひとつの分類の見出しと、その分類に属するリンクをまとめて作る。
    function buildGroup(label, titleCls, itemCls, items) {
      var group = mk('div', 'sidenav-group');
      group.appendChild(mk('div', 'sidenav-group-title ' + titleCls, label));
      items.forEach(function (it) {
        var a = document.createElement('a');
        a.href = it.href;
        a.className = 'sidenav-item ' + itemCls + (it.current ? ' sidenav-current' : '');
        a.textContent = it.label;
        group.appendChild(a);
      });
      return group;
    }

    // 閲覧が許可されたページを選び、移動先と現在ページの印を付けて分類ごとに並べる。
    body.appendChild(buildGroup('講義', 'sidenav-gtitle-lec', 'sidenav-item-lec',
      LEC_PAGES.filter(function (p) { return pageAllowed('講義/', p.file); }).map(function (p) {
        return { href: lecPrefix + p.file, label: p.label, current: p.key === currentKey };
      })
    ));

    body.appendChild(buildGroup('過去問', 'sidenav-gtitle-exam', 'sidenav-item-exam',
      EXAM_PAGES.filter(function (p) { return pageAllowed('', p.file); }).map(function (p) {
        return { href: rootPrefix + p.file, label: p.label, current: p.key === currentKey };
      })
    ));

    document.body.appendChild(nav);

    /* ---- トグルボタン ---- */
    var toggleBtn = mk('button', 'sidenav-toggle-btn', '☰');
    toggleBtn.id = 'sidenav-toggle';
    toggleBtn.setAttribute('aria-label', '目次を開く');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', 'sidenav');
    var headerInner = document.querySelector('.navbar-inner');
    if (headerInner) headerInner.insertBefore(toggleBtn, headerInner.firstChild);

    // 目次を開き、開閉ボタンを「閉じる」状態にする。
    function openNav() {
      nav.classList.add('sidenav-open');
      document.body.classList.add('sidenav-body-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.textContent = '✕';
    }
    // 目次を閉じ、開閉ボタンを「開く」状態に戻す。
    function closeNav() {
      nav.classList.remove('sidenav-open');
      document.body.classList.remove('sidenav-body-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.textContent = '☰';
    }
    // 目次が開いていれば閉じ、閉じていれば開く。
    function toggleNav() {
      nav.classList.contains('sidenav-open') ? closeNav() : openNav();
    }

    // ボタン・目次の外側・Escapeキーの操作に応じて、目次を開閉する。
    toggleBtn.addEventListener('click', function (evt) { evt.stopPropagation(); toggleNav(); });
    closeBtn.addEventListener('click', closeNav);
    document.addEventListener('click', function (evt) {
      if (nav.classList.contains('sidenav-open') && !nav.contains(evt.target) && evt.target !== toggleBtn) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('sidenav-open')) closeNav();
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { if (window.innerWidth < 900) closeNav(); });
    });
  }

  // HTMLの読み込みが終わってから、目次をページに追加する。
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})();
