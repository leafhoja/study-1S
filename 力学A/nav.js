// 力学Aのページ一覧から、画面横に開く目次を作り、ページ移動と開閉操作を扱う。
(function () {
  'use strict';

  /* ================================================================
     ページ定義（2グループ構成）
       1. 講義ノート      note-index, n1〜n6
       2. 過去問解説      kakomon_2020〜kakomon_2025
  ================================================================ */
  var NOTE_PAGES = [
    { file: 'index.html', key: 'note-index', label: 'トップ' },
    { file: 'n1.html',    key: 'n1', label: '第1章 抵抗力と運動方程式' },
    { file: 'n2.html',    key: 'n2', label: '第2章 仕事とエネルギー' },
    { file: 'n3.html',    key: 'n3', label: '第3章 振り子の運動' },
    { file: 'n4.html',    key: 'n4', label: '第4章 万有引力とケプラーの法則' },
    { file: 'n5.html',    key: 'n5', label: '第5章 地球の重力場と回転座標系' },
    { file: 'n6.html',    key: 'n6', label: '第6章 剛体の運動' },
  ];

  // 過去問や試験対策の移動先・識別名・目次に出す文字をまとめる。
  var EXAM_PAGES = [
    { file: 'kakomon_2020.html', key: 'kakomon_2020', label: '2020年度' },
    { file: 'kakomon_2021.html', key: 'kakomon_2021', label: '2021年度' },
    { file: 'kakomon_2022.html', key: 'kakomon_2022', label: '2022年度' },
    { file: 'kakomon_2023.html', key: 'kakomon_2023', label: '2023年度' },
    { file: 'kakomon_2024.html', key: 'kakomon_2024', label: '2024年度' },
    { file: 'kakomon_2025.html', key: 'kakomon_2025', label: '2025年度' },
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
  // ここでも同じ許可判定を通す（index.html 自身は常に表示）。
  function pageAllowed(file) {
    if (file === 'index.html') return true;
    if (!window.ACCESS_CONTROL) return true;
    return window.ACCESS_CONTROL.isAllowed('力学A', file.replace(/\.html$/, ''));
  }

  // 現在のページを調べ、科目内のページへ移動できる目次と開閉ボタンを作る。
  function buildNav() {
    var currentKey = document.body.getAttribute('data-nav-page') || '';

    // 目次の外枠と見出しを作り、その中にリンクを入れる領域を用意する。
    var nav = document.createElement('nav');
    nav.id = 'sidenav';
    nav.className = 'sidenav';
    nav.setAttribute('aria-label', '力学A ナビゲーション');

    var head = mk('div', 'sidenav-header');
    head.appendChild(mk('span', 'sidenav-brand', '力学A'));
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
    body.appendChild(buildGroup('講義ノート', 'sidenav-gtitle-note', 'sidenav-item-note',
      NOTE_PAGES.filter(function (p) { return pageAllowed(p.file); }).map(function (p) {
        return { href: p.file, label: p.label, current: p.key === currentKey };
      })
    ));

    body.appendChild(buildGroup('過去問解説', 'sidenav-gtitle-exam', 'sidenav-item-exam',
      EXAM_PAGES.filter(function (p) { return pageAllowed(p.file); }).map(function (p) {
        return { href: p.file, label: p.label, current: p.key === currentKey };
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
