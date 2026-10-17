// ジェンダー論のページ一覧から、画面横に開く目次を作り、ページ移動と開閉操作を扱う。
(function () {
  'use strict';

  /* ================================================================
     ページ定義（2グループ構成）
       1. 講義      lec-index, lec-1〜lec-13（第9回は休講のため無し。講義/ サブフォルダ）
       2. 過去問    exam-index, exam-2004・exam-2021・exam-2025・exam-2026・exam-q99
                    （科目ルート。未作成の年度〔1996〜2019のうち未着手分〕はここに追加するまで
                    リンクを出さない。ページを追加したら忘れずにこの配列にも加えること）
  ================================================================ */
  var LEC_PAGES = [
    { file: 'index.html',  key: 'lec-index', label: '目次' },
    { file: '第1回.html',  key: 'lec-1',  label: '第1回 恋愛結婚という「変な」制度' },
    { file: '第2回.html',  key: 'lec-2',  label: '第2回 社会科学と性' },
    { file: '第3回.html',  key: 'lec-3',  label: '第3回 結婚・離婚（2）／理系とジェンダー' },
    { file: '第4回.html',  key: 'lec-4',  label: '第4回 同性愛の歴史を遡る' },
    { file: '第5回.html',  key: 'lec-5',  label: '第5回 同性愛と現代' },
    { file: '第6回.html',  key: 'lec-6',  label: '第6回 LGBTの「T」って？' },
    { file: '第7回.html',  key: 'lec-7',  label: '第7回 マスターベーションの社会学' },
    { file: '第8回.html',  key: 'lec-8',  label: '第8回 炎上CMとジェンダーの4象限' },
    { file: '第10回.html', key: 'lec-10', label: '第10回 瀬地山「ジェンダー論」を継承する' },
    { file: '第11回.html', key: 'lec-11', label: '第11回 性の商品化とセックスワーク' },
    { file: '第12回.html', key: 'lec-12', label: '第12回 東アジアの家父長制' },
    { file: '第13回.html', key: 'lec-13', label: '第13回 ケア責任を分かち合う社会へ' },
  ];

  // 過去問や試験対策の移動先・識別名・目次に出す文字をまとめる。
  var EXAM_PAGES = [
    { file: 'index.html',        key: 'exam-index',   label: '目次' },
    { file: '対策.html',         key: 'exam-taisaku', label: '試験対策まとめ' },
    { file: '予想問題.html',     key: 'exam-yosou',   label: '選択問題 予想問題120選' },
    { file: 'kakomon_1996.html',  key: 'exam-1996',   label: '1996年度' },
    { file: 'kakomon_1998.html',  key: 'exam-1998',   label: '1998年度' },
    { file: 'kakomon_1999.html',  key: 'exam-1999',   label: '1999年度' },
    { file: 'kakomon_2004.html',  key: 'exam-2004',   label: '2004年度' },
    { file: 'kakomon_2005.html',  key: 'exam-2005',   label: '2005年度' },
    { file: 'kakomon_2006.html',  key: 'exam-2006',   label: '2006年度' },
    { file: 'kakomon_2007.html',  key: 'exam-2007',   label: '2007年度' },
    { file: 'kakomon_2008.html',  key: 'exam-2008',   label: '2008年度' },
    { file: 'kakomon_2012.html',  key: 'exam-2012',   label: '2012年度' },
    { file: 'kakomon_2014.html',  key: 'exam-2014',   label: '2014年度' },
    { file: 'kakomon_2015.html',  key: 'exam-2015',   label: '2015年度' },
    { file: 'kakomon_2016.html',  key: 'exam-2016',   label: '2016年度' },
    { file: 'kakomon_2017.html',  key: 'exam-2017',   label: '2017年度' },
    { file: 'kakomon_2018.html',  key: 'exam-2018',   label: '2018年度' },
    { file: 'kakomon_2019.html',  key: 'exam-2019',   label: '2019年度' },
    { file: 'kakomon_2021.html',  key: 'exam-2021',   label: '2021年度' },
    { file: 'kakomon_2025.html',  key: 'exam-2025',   label: '2025年度' },
    { file: '2026sample.html',   key: 'exam-2026',   label: '2026年度（サンプル）' },
    { file: 'q99.html',          key: 'exam-q99',    label: '問題99（共通）' },
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
  // ここでも同じ許可判定を通す（index.html 自身は常に表示。講義は 講義/、
  // 過去問は 過去問/ サブフォルダにあるので、access_control.js の pages[] の
  // キーに合わせて prefix を付けて判定する）。
  function pageAllowed(prefix, file) {
    if (file === 'index.html') return true;
    if (!window.ACCESS_CONTROL) return true;
    return window.ACCESS_CONTROL.isAllowed('ジェンダー論', prefix + file.replace(/\.html$/, ''));
  }

  // 現在のページを調べ、科目内のページへ移動できる目次と開閉ボタンを作る。
  function buildNav() {
    var currentKey = document.body.getAttribute('data-nav-page') || '';
    var inLectureDir = currentKey.indexOf('lec-') === 0;
    var inExamDir = currentKey.indexOf('exam-') === 0;
    var lecPrefix = inLectureDir ? '' : (inExamDir ? '../講義/' : '講義/');
    var examPrefix = inExamDir ? '' : (inLectureDir ? '../過去問/' : '過去問/');
    var rootPrefix = (inLectureDir || inExamDir) ? '../' : '';
    var homeHref = rootPrefix + 'index.html';

    // 目次の外枠と見出しを作り、その中にリンクを入れる領域を用意する。
    var nav = document.createElement('nav');
    nav.id = 'sidenav';
    nav.className = 'sidenav';
    nav.setAttribute('aria-label', 'ジェンダー論 ナビゲーション');

    var head = mk('div', 'sidenav-header');
    var brand = document.createElement('a');
    brand.className = 'sidenav-brand';
    brand.href = homeHref;
    brand.textContent = 'ジェンダー論';
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
