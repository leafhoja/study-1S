// 熱力学のページ一覧から、画面横に開く目次を作り、ページ移動と開閉操作を扱う。
(function () {
  'use strict';

  /* ================================================================
     ページ定義（3グループ構成）
       1. 講義ノート      note-index, ch0〜ch5
       2. 試験対策        taisaku-yosou, taisaku-essence（過去問とは別枠）
       3. 過去問解説      exam-2007〜exam-2025（フラットに熱力学/直下）
  ================================================================ */
  var NOTE_PAGES = [
    { file: 'index.html', key: 'note-index', label: 'トップ' },
    { file: 'ch0.html',   key: 'ch0', label: '第0章 ガイダンス' },
    { file: 'ch1.html',   key: 'ch1', label: '第1章 熱力学の基本概念' },
    { file: 'ch2.html',   key: 'ch2', label: '第2章 熱力学第一法則' },
    { file: 'ch3.html',   key: 'ch3', label: '第3章 熱力学第二法則' },
    { file: 'ch4.html',   key: 'ch4', label: '第4章 熱力学関数' },
    { file: 'ch5.html',   key: 'ch5', label: '第5章 応用例' },
  ];

  // 試験対策ページの移動先と、目次に出す文字をまとめる。
  var TAISAKU_PAGES = [
    { file: 'taisaku_yosou.html', key: 'taisaku-yosou', label: '予想問題（2026）' },
    { file: 'taisaku_essence.html', key: 'taisaku-essence', label: '精選：本質問題集' },
  ];

  // 過去問や試験対策の移動先・識別名・目次に出す文字をまとめる。
  var EXAM_PAGES = [
    { file: 'kakomon_2025.html', key: 'exam-2025', label: '2025年度' },
    { file: 'kakomon_2023.html', key: 'exam-2023', label: '2023年度' },
    { file: 'kakomon_2014.html', key: 'exam-2014', label: '2014年度' },
    { file: 'kakomon_2012.html', key: 'exam-2012', label: '2012年度' },
    { file: 'kakomon_2011.html', key: 'exam-2011', label: '2011年度' },
    { file: 'kakomon_2010.html', key: 'exam-2010', label: '2010年度' },
    { file: 'kakomon_2009.html', key: 'exam-2009', label: '2009年度' },
    { file: 'kakomon_2008.html', key: 'exam-2008', label: '2008年度' },
    { file: 'kakomon_2007.html', key: 'exam-2007', label: '2007年度' },
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
    return window.ACCESS_CONTROL.isAllowed('熱力学', file.replace(/\.html$/, ''));
  }

  // 現在のページを調べ、科目内のページへ移動できる目次と開閉ボタンを作る。
  function buildNav() {
    var currentKey = document.body.getAttribute('data-nav-page') || '';

    // 目次の外枠と見出しを作り、その中にリンクを入れる領域を用意する。
    var nav = document.createElement('nav');
    nav.id = 'sidenav';
    nav.className = 'sidenav';
    nav.setAttribute('aria-label', '熱力学 ナビゲーション');

    var head = mk('div', 'sidenav-header');
    head.appendChild(mk('span', 'sidenav-brand', '熱力学ノート'));
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

    body.appendChild(buildGroup('試験対策', 'sidenav-gtitle-taisaku', 'sidenav-item-taisaku',
      TAISAKU_PAGES.filter(function (p) { return pageAllowed(p.file); }).map(function (p) {
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
