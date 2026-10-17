// 線形代数学のページ一覧から、画面横に開く目次を作り、ページ移動と開閉操作を扱う。
(function () {
  'use strict';

  /* ================================================================
     ページ定義（3グループ構成）
       1. 授業ノート      note-index, s1〜s10
       2. 過去問解説      exam-2025, exam-2024
       3. 重要定義・定理一覧  index.html 内のアンカー §1〜§6
  ================================================================ */
  var NOTE_PAGES = [
    { file: 'index.html', key: 'note-index', label: 'トップ' },
    { file: 's1.html',    key: 's1', label: '§1 ベクトル空間' },
    { file: 's2.html',    key: 's2', label: '§2 部分空間' },
    { file: 's3.html',    key: 's3', label: '§3 Kernel / Image' },
    { file: 's4.html',    key: 's4', label: '§4 次元' },
    { file: 's5.html',    key: 's5', label: '§5 K^n 写像' },
    { file: 's6.html',    key: 's6', label: '§6 基底' },
    { file: 's7.html',    key: 's7', label: '§7 有限次元' },
    { file: 's8.html',    key: 's8', label: '§8 行列表示' },
    { file: 's9.html',    key: 's9', label: '§9 座標変換' },
    { file: 's10.html',   key: 's10', label: '§10 基底延長定理の応用' },
  ];

  // 過去問や試験対策の移動先・識別名・目次に出す文字をまとめる。
  var EXAM_PAGES = [
    { file: '最終確認.html', key: 'exam-final', label: '🔥 最終確認予想問題' },
    { file: 'kakomon_2025.html',  key: 'exam-2025', label: '2025年度' },
    { file: 'kakomon_2024.html',  key: 'exam-2024', label: '2024年度' },
    { file: '予想問題.html', key: 'exam-yosou', label: '予想問題' },
    { file: '予想問題_第1回.html', key: 'exam-yosou-1', label: '予想問題 第1回' },
    { file: '予想問題_第2回.html', key: 'exam-yosou-2', label: '予想問題 第2回' },
    { file: '予想問題_第3回.html', key: 'exam-yosou-3', label: '予想問題 第3回' },
    { file: '予想問題_第4回.html', key: 'exam-yosou-4', label: '予想問題 第4回' },
    { file: 'ばらし問題.html', key: 'exam-barashi', label: '期末前ばらし問題' },
  ];

  // トップページの重要事項へ移動するための、節の目印と目次の表示名をまとめる。
  var REF_ITEMS = [
    { anchor: 'ref-s1', label: '§1 の主要事項' },
    { anchor: 'ref-s2', label: '§2 の主要事項' },
    { anchor: 'ref-s3', label: '§3 の主要事項' },
    { anchor: 'ref-s4', label: '§4 の主要事項' },
    { anchor: 'ref-s5', label: '§5 の主要事項' },
    { anchor: 'ref-s6', label: '§6 の主要事項' },
    { anchor: 'ref-s7', label: '§7 の主要事項' },
    { anchor: 'ref-s8', label: '§8 の主要事項' },
    { anchor: 'ref-s9', label: '§9 の主要事項' },
    { anchor: 'ref-s10', label: '§10 の主要事項' },
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
  // ここでも同じ許可判定を通す（index.html 自身は常に表示。過去問は 過去問/
  // サブフォルダにあるので、access_control.js の pages[] のキーに合わせて
  // prefix を付けて判定する）。
  function pageAllowed(prefix, file) {
    if (file === 'index.html') return true;
    if (!window.ACCESS_CONTROL) return true;
    return window.ACCESS_CONTROL.isAllowed('線形代数学', prefix + file.replace(/\.html$/, ''));
  }

  // 現在のページを調べ、科目内のページへ移動できる目次と開閉ボタンを作る。
  function buildNav() {
    var currentKey = document.body.getAttribute('data-nav-page') || '';
    var inExamDir = currentKey.indexOf('exam-') === 0;
    var notePrefix = inExamDir ? '../' : '';
    var examPrefix = inExamDir ? '' : '過去問/';
    var refHref = notePrefix + 'index.html';

    // 目次の外枠と見出しを作り、その中にリンクを入れる領域を用意する。
    var nav = document.createElement('nav');
    nav.id = 'sidenav';
    nav.className = 'sidenav';
    nav.setAttribute('aria-label', '線形代数学① ナビゲーション');

    var head = mk('div', 'sidenav-header');
    head.appendChild(mk('span', 'sidenav-brand', '線形代数学①'));
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
    body.appendChild(buildGroup('授業ノート', 'sidenav-gtitle-note', 'sidenav-item-note',
      NOTE_PAGES.filter(function (p) { return pageAllowed('', p.file); }).map(function (p) {
        return { href: notePrefix + p.file, label: p.label, current: p.key === currentKey };
      })
    ));

    body.appendChild(buildGroup('過去問解説', 'sidenav-gtitle-exam', 'sidenav-item-exam',
      EXAM_PAGES.filter(function (p) { return pageAllowed('過去問/', p.file); }).map(function (p) {
        return { href: examPrefix + p.file, label: p.label, current: p.key === currentKey };
      })
    ));

    body.appendChild(buildGroup('重要定義・定理一覧', 'sidenav-gtitle-ref', 'sidenav-item-ref',
      REF_ITEMS.map(function (r) {
        return { href: refHref + '#' + r.anchor, label: r.label, current: false };
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
