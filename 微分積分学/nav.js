// 微分積分学のページ一覧から、画面横に開く目次を作り、ページ移動と開閉操作を扱う。
(function () {
  'use strict';

  // 講義ノートの移動先・現在ページを識別する名前・目次に出す文字をまとめる。
  var NOTE_PAGES = [
    { file: 'index.html', key: 'note-index', label: 'トップ' },
    { file: 'ch1.html',   key: 'ch1', label: 'Ch.1 コーシーの定理・ロピタルの定理' },
    { file: 'ch2.html',   key: 'ch2', label: 'Ch.2 テーラーの定理' },
    { file: 'ch3.html',   key: 'ch3', label: 'Ch.3 無限級数' },
    { file: 'ch4.html',   key: 'ch4', label: 'Ch.4 べき級数と収束半径' },
    { file: 'ch5.html',   key: 'ch5', label: 'Ch.5 偏微分と全微分' },
    { file: 'ch6.html',   key: 'ch6', label: 'Ch.6 二変数のテーラーの定理と極値問題' },
  ];

  // 過去問や試験対策の移動先・識別名・目次に出す文字をまとめる。
  var EXAM_PAGES = [
    { file: 'yosou_ch1.html',    key: 'exam-ch1',    label: '予想問題 第1回（Ch.1）' },
    { file: 'yosou_ch2.html',    key: 'exam-ch2',    label: '予想問題 第2回（Ch.2）' },
    { file: 'yosou_ch3.html',    key: 'exam-ch3',    label: '予想問題 第3回（Ch.3）' },
    { file: 'yosou_ch4.html',    key: 'exam-ch4',    label: '予想問題 第4回（Ch.4）' },
    { file: 'yosou_ch5.html',    key: 'exam-ch5',    label: '予想問題 第5回（Ch.5）' },
    { file: 'yosou_ch6.html',    key: 'exam-ch6',    label: '予想問題 第6回（Ch.6）' },
    { file: 'yosou_keisan.html', key: 'exam-keisan', label: '計算問題編（番外）' },
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
  // prefix は access_control.js の pages["微分積分学"] のキー命名（"過去問/"）に合わせる。
  function pageAllowed(prefix, file) {
    if (file === 'index.html') return true;
    if (!window.ACCESS_CONTROL) return true;
    return window.ACCESS_CONTROL.isAllowed('微分積分学', prefix + file.replace(/\.html$/, ''));
  }

  // 現在のページを調べ、科目内のページへ移動できる目次と開閉ボタンを作る。
  function buildNav() {
    var currentKey = document.body.getAttribute('data-nav-page') || '';
    var inExamDir = currentKey.indexOf('exam-') === 0;
    var notePrefix = inExamDir ? '../' : '';
    var examPrefix = inExamDir ? '' : '過去問/';

    // 目次の外枠と見出しを作り、その中にリンクを入れる領域を用意する。
    var nav = document.createElement('nav');
    nav.id = 'sidenav';
    nav.className = 'sidenav';
    nav.setAttribute('aria-label', '微分積分学① ナビゲーション');

    var head = mk('div', 'sidenav-header');
    head.appendChild(mk('span', 'sidenav-brand', '微分積分学①'));
    var closeBtn = mk('button', 'sidenav-close-btn', '✕');
    closeBtn.setAttribute('aria-label', '閉じる');
    head.appendChild(closeBtn);
    nav.appendChild(head);

    var body = mk('div', 'sidenav-body');
    nav.appendChild(body);

    var group = mk('div', 'sidenav-group');
    group.appendChild(mk('div', 'sidenav-group-title sidenav-gtitle-note', '講義ノート'));
    NOTE_PAGES.filter(function (p) { return pageAllowed('', p.file); }).forEach(function (p) {
      var a = document.createElement('a');
      a.href = notePrefix + p.file;
      a.className = 'sidenav-item sidenav-item-note' + (p.key === currentKey ? ' sidenav-current' : '');
      a.textContent = p.label;
      group.appendChild(a);
    });
    body.appendChild(group);

    var examGroup = mk('div', 'sidenav-group');
    examGroup.appendChild(mk('div', 'sidenav-group-title sidenav-gtitle-exam', '期末予想問題'));
    EXAM_PAGES.filter(function (p) { return pageAllowed('過去問/', p.file); }).forEach(function (p) {
      var a = document.createElement('a');
      a.href = examPrefix + p.file;
      a.className = 'sidenav-item sidenav-item-exam' + (p.key === currentKey ? ' sidenav-current' : '');
      a.textContent = p.label;
      examGroup.appendChild(a);
    });
    body.appendChild(examGroup);

    document.body.appendChild(nav);

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
