// 英語一列のページ一覧から、画面横に開く目次を作り、ページ移動と開閉操作を扱う。
(function () {
  'use strict';

  /* ================================================================
     ページ定義（2グループ構成）
       1. Session一覧   各 Session の読解ノートページと、その一文対訳
                        （構文解説）ページをペアで並べる。一文対訳ページには
                        sub: true を付け、サイドナビ上で字下げ表示する
                        （.sidenav-item-sub）。科目ルートに配置。
       2. 過去問        本文と重複する過去問のセッション対応分。過去問/
                        サブフォルダに配置。
  ================================================================ */
  var PAGES = [
    { file: 'index.html',              key: 'index',              label: 'トップ' },
    { file: 'session9.html',           key: 'session9',           label: 'Session 9' },
    { file: 'session9-taiyaku.html',   key: 'session9-taiyaku',   label: 'Session 9 一文対訳',  sub: true },
    { file: 'session10.html',          key: 'session10',          label: 'Session 10' },
    { file: 'session10-taiyaku.html',  key: 'session10-taiyaku',  label: 'Session 10 一文対訳', sub: true },
    { file: 'session11.html',          key: 'session11',          label: 'Session 11' },
    { file: 'session11-taiyaku.html',  key: 'session11-taiyaku',  label: 'Session 11 一文対訳', sub: true },
    { file: 'session12.html',          key: 'session12',          label: 'Session 12' },
    { file: 'session12-taiyaku.html',  key: 'session12-taiyaku',  label: 'Session 12 一文対訳', sub: true },
    { file: 'session13.html',          key: 'session13',          label: 'Session 13' },
    { file: 'session13-taiyaku.html',  key: 'session13-taiyaku',  label: 'Session 13 一文対訳', sub: true },
  ];

  // 過去問や試験対策の移動先・識別名・目次に出す文字をまとめる。
  var EXAM_PAGES = [
    { file: 'index.html',      key: 'exam-index',      label: '過去問トップ' },
    { file: 'session11.html',  key: 'exam-session11',  label: 'Session 11 対応分（2024）' },
    { file: 'session12.html',  key: 'exam-session12',  label: 'Session 12 対応分（2024）' },
    { file: 'session13.html',  key: 'exam-session13',  label: 'Session 13 対応分（2024）' },
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
  // ここでも同じ許可判定を通す（各グループの index.html は常に表示）。
  function pageAllowed(prefix, file) {
    if (file === 'index.html') return true;
    if (!window.ACCESS_CONTROL) return true;
    return window.ACCESS_CONTROL.isAllowed('英語一列', prefix + file.replace(/\.html$/, ''));
  }

  // 現在のページを調べ、科目内のページへ移動できる目次と開閉ボタンを作る。
  function buildNav() {
    var currentKey = document.body.getAttribute('data-nav-page') || '';
    var inExamDir = currentKey.indexOf('exam-') === 0;
    var examPrefix = inExamDir ? '' : '過去問/';
    var rootPrefix = inExamDir ? '../' : '';

    // 目次の外枠と見出しを作り、その中にリンクを入れる領域を用意する。
    var nav = document.createElement('nav');
    nav.id = 'sidenav';
    nav.className = 'sidenav';
    nav.setAttribute('aria-label', '英語一列① ナビゲーション');

    var head = mk('div', 'sidenav-header');
    head.appendChild(mk('span', 'sidenav-brand', '英語一列①'));
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
        a.className = 'sidenav-item ' + itemCls + (it.sub ? ' sidenav-item-sub' : '') +
          (it.current ? ' sidenav-current' : '');
        a.textContent = it.label;
        group.appendChild(a);
      });
      return group;
    }

    // 閲覧が許可されたページを選び、移動先と現在ページの印を付けて分類ごとに並べる。
    body.appendChild(buildGroup('Session一覧', 'sidenav-gtitle-eng', 'sidenav-item-eng',
      PAGES.filter(function (p) { return pageAllowed('', p.file); }).map(function (p) {
        return { href: rootPrefix + p.file, label: p.label, sub: p.sub, current: p.key === currentKey };
      })
    ));

    body.appendChild(buildGroup('過去問（セッション対応分）', 'sidenav-gtitle-exam', 'sidenav-item-exam',
      EXAM_PAGES.filter(function (p) { return pageAllowed('過去問/', p.file); }).map(function (p) {
        return { href: examPrefix + p.file, label: p.label, current: p.key === currentKey };
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
