// 数学基礎理論演習1Aのページ一覧から、画面横に開く目次を作り、ページ移動と開閉操作を扱う。
(function () {
  'use strict';

  /* ================================================================
     ページ定義（2グループ構成）
       1. トップ      note-index
       2. 過去問      kakomon-calc（微積）, kakomon-lin（線形代数）
  ================================================================ */
  var NOTE_PAGES = [
    { file: 'index.html', key: 'note-index', label: 'トップ', itemCls: 'sidenav-item-top' },
  ];

  // 過去問のページごとに、移動先とページ内の問題の見出しをまとめる。
  var KAKOMON_PAGES = [
    { file: 'kakomon_calc_01.html', key: 'kakomon-calc', label: '微分積分学演習 小テスト', itemCls: 'sidenav-item-calc' },
    { file: 'kakomon_lin_01.html',  key: 'kakomon-lin',  label: '線形代数学演習 小テスト', itemCls: 'sidenav-item-lin' },
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
  // ここでも同じ許可判定を通す（index.html 自身は常に表示。過去問は kakomon/
  // サブフォルダにあるので、access_control.js の pages[] のキーに合わせて
  // prefix を付けて判定する）。
  function pageAllowed(prefix, file) {
    if (file === 'index.html') return true;
    if (!window.ACCESS_CONTROL) return true;
    return window.ACCESS_CONTROL.isAllowed('数学基礎理論演習1A', prefix + file.replace(/\.html$/, ''));
  }

  // 現在のページを調べ、科目内のページへ移動できる目次と開閉ボタンを作る。
  function buildNav() {
    var currentKey = document.body.getAttribute('data-nav-page') || '';
    var inKakomonDir = currentKey.indexOf('kakomon-') === 0;
    var notePrefix = inKakomonDir ? '../' : '';
    var kakomonPrefix = inKakomonDir ? '' : 'kakomon/';

    // 目次の外枠と見出しを作り、その中にリンクを入れる領域を用意する。
    var nav = document.createElement('nav');
    nav.id = 'sidenav';
    nav.className = 'sidenav';
    nav.setAttribute('aria-label', '数学基礎理論演習 ナビゲーション');

    var head = mk('div', 'sidenav-header');
    head.appendChild(mk('span', 'sidenav-brand', '数学基礎理論演習'));
    var closeBtn = mk('button', 'sidenav-close-btn', '✕');
    closeBtn.setAttribute('aria-label', '閉じる');
    head.appendChild(closeBtn);
    nav.appendChild(head);

    var body = mk('div', 'sidenav-body');
    nav.appendChild(body);

    // ひとつの分類の見出しと、その分類に属するリンクをまとめて作る。
    function buildGroup(label, titleCls, items) {
      var group = mk('div', 'sidenav-group');
      group.appendChild(mk('div', 'sidenav-group-title ' + titleCls, label));
      items.forEach(function (it) {
        var a = document.createElement('a');
        a.href = it.href;
        a.className = 'sidenav-item ' + it.itemCls + (it.current ? ' sidenav-current' : '');
        a.textContent = it.label;
        group.appendChild(a);
      });
      return group;
    }

    // 閲覧が許可されたページを選び、移動先と現在ページの印を付けて分類ごとに並べる。
    body.appendChild(buildGroup('トップ', 'sidenav-gtitle-top',
      NOTE_PAGES.filter(function (p) { return pageAllowed('', p.file); }).map(function (p) {
        return { href: notePrefix + p.file, label: p.label, itemCls: p.itemCls, current: p.key === currentKey };
      })
    ));

    body.appendChild(buildGroup('過去問', 'sidenav-gtitle-kakomon',
      KAKOMON_PAGES.filter(function (p) { return pageAllowed('kakomon/', p.file); }).map(function (p) {
        return { href: kakomonPrefix + p.file, label: p.label, itemCls: p.itemCls, current: p.key === currentKey };
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
