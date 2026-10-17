// 情報のページ一覧から、画面横に開く目次を作り、ページ移動と開閉操作を扱う。
(function () {
  'use strict';

  /* ================================================================
     ページ定義（3グループ構成）
       1. 過去問・共通問題   kyotsu-index, kyotsu-2006〜kyotsu-2025
       2. 過去問・個別問題   kobetsu-index, kobetsu-2006〜kobetsu-2025
  ================================================================ */
  var LECTURE_PAGES = [
    { file: 'index.html', key: 'lecture-index', label: '講義ノート トップ' },
    { file: 'introduction.html', key: 'lecture-introduction', label: '導入　ガイダンス' },
    { file: '第1章.html', key: 'lecture-第1章', label: '第1章　情報の学び方' },
    { file: '第2章.html', key: 'lecture-第2章', label: '第2章　情報システム' },
    { file: '第3章.html', key: 'lecture-第3章', label: '第3章　情報の表現' },
    { file: '第4章.html', key: 'lecture-第4章', label: '第4章　情報の伝達と通信' },
    { file: '第5章.html', key: 'lecture-第5章', label: '第5章　計算の方法' },
    { file: '第6章.html', key: 'lecture-第6章', label: '第6章　問題解決のための情報表現' },
    { file: '第7章.html', key: 'lecture-第7章', label: '第7章　機械学習と人工知能' },
    { file: '第8章.html', key: 'lecture-第8章', label: '第8章　コンピュータの仕組み' },
    { file: '第9章.html', key: 'lecture-第9章', label: '第9章　ユーザインタフェース' },
    { file: '第10章.html', key: 'lecture-第10章', label: '第10章　情報技術と社会' },
  ];
  var KYOTSU_PAGES = [
    { file: 'index.html',  key: 'kyotsu-index', label: '共通問題 トップ' },
    { file: 'kakomon_2025.html',   key: 'kyotsu-2025', label: '2025年度' },
    { file: 'kakomon_2024.html',   key: 'kyotsu-2024', label: '2024年度' },
    { file: 'kakomon_2023.html',   key: 'kyotsu-2023', label: '2023年度' },
    { file: 'kakomon_2022.html',   key: 'kyotsu-2022', label: '2022年度' },
    { file: 'kakomon_2021.html',   key: 'kyotsu-2021', label: '2021年度' },
    { file: 'kakomon_2019.html',   key: 'kyotsu-2019', label: '2019年度' },
    { file: 'kakomon_2018.html',   key: 'kyotsu-2018', label: '2018年度' },
    { file: 'kakomon_2017.html',   key: 'kyotsu-2017', label: '2017年度' },
    { file: 'kakomon_2016.html',   key: 'kyotsu-2016', label: '2016年度' },
    { file: 'kakomon_2015.html',   key: 'kyotsu-2015', label: '2015年度' },
    { file: 'kakomon_2014.html',   key: 'kyotsu-2014', label: '2014年度' },
    { file: 'kakomon_2013.html',   key: 'kyotsu-2013', label: '2013年度' },
    { file: 'kakomon_2012.html',   key: 'kyotsu-2012', label: '2012年度' },
    { file: 'kakomon_2011.html',   key: 'kyotsu-2011', label: '2011年度' },
    { file: 'kakomon_2010.html',   key: 'kyotsu-2010', label: '2010年度' },
    { file: 'kakomon_2009.html',   key: 'kyotsu-2009', label: '2009年度' },
    { file: 'kakomon_2008.html',   key: 'kyotsu-2008', label: '2008年度' },
    { file: 'kakomon_2007.html',   key: 'kyotsu-2007', label: '2007年度' },
    { file: 'kakomon_2006.html',   key: 'kyotsu-2006', label: '2006年度' },
  ];

  var KOBETSU_PAGES = [
    { file: 'index.html',  key: 'kobetsu-index', label: '個別問題 トップ' },
    { file: 'kakomon_2025.html',   key: 'kobetsu-2025', label: '2025年度' },
    { file: 'kakomon_2024.html',   key: 'kobetsu-2024', label: '2024年度' },
    { file: 'kakomon_2022.html',   key: 'kobetsu-2022', label: '2022年度' },
    { file: 'kakomon_2019.html',   key: 'kobetsu-2019', label: '2019年度' },
    { file: 'kakomon_2018.html',   key: 'kobetsu-2018', label: '2018年度' },
    { file: 'kakomon_2015.html',   key: 'kobetsu-2015', label: '2015年度' },
    { file: 'kakomon_2014.html',   key: 'kobetsu-2014', label: '2014年度' },
    { file: 'kakomon_2013.html',   key: 'kobetsu-2013', label: '2013年度' },
    { file: 'kakomon_2012.html',   key: 'kobetsu-2012', label: '2012年度' },
    { file: 'kakomon_2011.html',   key: 'kobetsu-2011', label: '2011年度' },
    { file: 'kakomon_2010.html',   key: 'kobetsu-2010', label: '2010年度' },
    { file: 'kakomon_2009.html',   key: 'kobetsu-2009', label: '2009年度' },
    { file: 'kakomon_2008.html',   key: 'kobetsu-2008', label: '2008年度' },
    { file: 'kakomon_2007.html',   key: 'kobetsu-2007', label: '2007年度' },
    { file: 'kakomon_2006.html',   key: 'kobetsu-2006', label: '2006年度' },
  ];

  var TANGO_PAGES = [
    { file: 'index.html',                                     key: 'tango-index', label: '単語帳 トップ' },
    { file: '01-符号化と情報量-word.html',                     key: 'tango-01-word', label: '01 符号化と情報量・用語' },
    { file: '01-符号化と情報量-keypoints.html',                key: 'tango-01-kp', label: '01 符号化と情報量・重要事項' },
    { file: '01-符号化と情報量-descriptive.html',              key: 'tango-01-desc', label: '01 符号化と情報量・記述対策' },
    { file: '02-ネットワークとセキュリティ-word.html',         key: 'tango-02-word', label: '02 ネットワークとセキュリティ・用語' },
    { file: '02-ネットワークとセキュリティ-keypoints.html',    key: 'tango-02-kp', label: '02 ネットワークとセキュリティ・重要事項' },
    { file: '02-ネットワークとセキュリティ-descriptive.html',  key: 'tango-02-desc', label: '02 ネットワークとセキュリティ・記述対策' },
    { file: '03-アルゴリズムと計算量-word.html',               key: 'tango-03-word', label: '03 アルゴリズムと計算量・用語' },
    { file: '03-アルゴリズムと計算量-keypoints.html',          key: 'tango-03-kp', label: '03 アルゴリズムと計算量・重要事項' },
    { file: '03-アルゴリズムと計算量-descriptive.html',        key: 'tango-03-desc', label: '03 アルゴリズムと計算量・記述対策' },
    { file: '04-コンピュータの仕組みと論理回路-word.html',        key: 'tango-04-word', label: '04 コンピュータと論理回路・用語' },
    { file: '04-コンピュータの仕組みと論理回路-keypoints.html',   key: 'tango-04-kp', label: '04 コンピュータと論理回路・重要事項' },
    { file: '04-コンピュータの仕組みと論理回路-descriptive.html', key: 'tango-04-desc', label: '04 コンピュータと論理回路・記述対策' },
    { file: '05-オートマトンとデータモデル-word.html',         key: 'tango-05-word', label: '05 オートマトンとデータモデル・用語' },
    { file: '05-オートマトンとデータモデル-keypoints.html',    key: 'tango-05-kp', label: '05 オートマトンとデータモデル・重要事項' },
    { file: '05-オートマトンとデータモデル-descriptive.html',  key: 'tango-05-desc', label: '05 オートマトンとデータモデル・記述対策' },
    { file: '06-UIと情報社会-word.html',                       key: 'tango-06-word', label: '06 UIと情報社会・用語' },
    { file: '06-UIと情報社会-keypoints.html',                  key: 'tango-06-kp', label: '06 UIと情報社会・重要事項' },
    { file: '06-UIと情報社会-descriptive.html',                key: 'tango-06-desc', label: '06 UIと情報社会・記述対策' },
  ];

  var KAMI_PAGES = [
    { file: 'index.html',                  key: 'kami-index', label: '神シケプリ トップ' },
    { file: '01-情報量.html',               key: 'kami-01', label: '01 情報量' },
    { file: '02-符号化.html',               key: 'kami-02', label: '02 符号化' },
    { file: '03-標本化と量子化.html',       key: 'kami-03', label: '03 標本化・量子化' },
    { file: '04-ネットワーク.html',         key: 'kami-04', label: '04 ネットワーク' },
    { file: '05-インターネット通信.html',   key: 'kami-05', label: '05 インターネット通信' },
    { file: '06-安全な通信.html',           key: 'kami-06', label: '06 安全な通信' },
    { file: '07-プログラミング.html',       key: 'kami-07', label: '07 プログラミング' },
    { file: '08-論理関数.html',             key: 'kami-08', label: '08 論理関数' },
    { file: '09-データモデル.html',         key: 'kami-09', label: '09 データモデル' },
    { file: '10-ユーザインターフェース.html', key: 'kami-10', label: '10 ユーザインターフェース' },
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
  // ここでも同じ許可判定を通す。index.html（各階層のハブページ）は常に表示。
  function pageAllowed(prefix, file) {
    if (file === 'index.html') return true;
    if (!window.ACCESS_CONTROL) return true;
    return window.ACCESS_CONTROL.isAllowed('情報', prefix + file.replace(/\.html$/, ''));
  }

  // 現在のページを調べ、科目内のページへ移動できる目次と開閉ボタンを作る。
  function buildNav() {
    var currentKey = document.body.getAttribute('data-nav-page') || '';
    var inKyotsu = currentKey.indexOf('kyotsu-') === 0;
    var inKobetsu = currentKey.indexOf('kobetsu-') === 0;
    var inLecture = currentKey.indexOf('lecture-') === 0;
    var inKami = currentKey.indexOf('kami-') === 0;
    var inTango = currentKey.indexOf('tango-') === 0;

    // 現在地からの相対パス prefix を組み立てる
    var topPrefix, lecturePrefix, kyotsuPrefix, kobetsuPrefix, kamiPrefix, tangoPrefix;
    if (inKyotsu) {
      topPrefix = '../../';
      kyotsuPrefix = '';
      kobetsuPrefix = '../個別問題/';
      lecturePrefix = '../../講義ノート/';
      kamiPrefix = '../../神シケプリ/';
      tangoPrefix = '../../単語帳/';
    } else if (inKobetsu) {
      topPrefix = '../../';
      kyotsuPrefix = '../共通問題/';
      kobetsuPrefix = '';
      lecturePrefix = '../../講義ノート/';
      kamiPrefix = '../../神シケプリ/';
      tangoPrefix = '../../単語帳/';
    } else if (inLecture) {
      topPrefix = '../';
      lecturePrefix = '';
      kyotsuPrefix = '../過去問/共通問題/';
      kobetsuPrefix = '../過去問/個別問題/';
      kamiPrefix = '../神シケプリ/';
      tangoPrefix = '../単語帳/';
    } else if (inKami) {
      topPrefix = '../';
      lecturePrefix = '../講義ノート/';
      kyotsuPrefix = '../過去問/共通問題/';
      kobetsuPrefix = '../過去問/個別問題/';
      kamiPrefix = '';
      tangoPrefix = '../単語帳/';
    } else if (inTango) {
      topPrefix = '../';
      lecturePrefix = '../講義ノート/';
      kyotsuPrefix = '../過去問/共通問題/';
      kobetsuPrefix = '../過去問/個別問題/';
      kamiPrefix = '../神シケプリ/';
      tangoPrefix = '';
    } else {
      topPrefix = '';
      kyotsuPrefix = '過去問/共通問題/';
      kobetsuPrefix = '過去問/個別問題/';
      lecturePrefix = '講義ノート/';
      kamiPrefix = '神シケプリ/';
      tangoPrefix = '単語帳/';
    }

    // 目次の外枠と見出しを作り、その中にリンクを入れる領域を用意する。
    var nav = document.createElement('nav');
    nav.id = 'sidenav';
    nav.className = 'sidenav';
    nav.setAttribute('aria-label', '情報 ナビゲーション');

    var head = mk('div', 'sidenav-header');
    head.appendChild(mk('span', 'sidenav-brand', '情報'));
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

    var topLink = document.createElement('a');
    topLink.href = topPrefix + 'index.html';
    topLink.className = 'sidenav-item' + (currentKey === 'top' ? ' sidenav-current' : '');
    topLink.textContent = '情報 トップ';
    var topGroup = mk('div', 'sidenav-group');
    topGroup.appendChild(topLink);
    body.appendChild(topGroup);

    // 閲覧が許可されたページを選び、移動先と現在ページの印を付けて分類ごとに並べる。
    body.appendChild(buildGroup('講義ノート', 'sidenav-gtitle-lecture', 'sidenav-item-lecture',
      LECTURE_PAGES.filter(function (p) { return pageAllowed('講義ノート/', p.file); }).map(function (p) {
        return { href: lecturePrefix + p.file, label: p.label, current: p.key === currentKey };
      })
    ));

    body.appendChild(buildGroup('過去問・共通問題', 'sidenav-gtitle-kyotsu', 'sidenav-item-kyotsu',
      KYOTSU_PAGES.filter(function (p) { return pageAllowed('過去問/共通問題/', p.file); }).map(function (p) {
        return { href: kyotsuPrefix + p.file, label: p.label, current: p.key === currentKey };
      })
    ));

    body.appendChild(buildGroup('過去問・個別問題', 'sidenav-gtitle-kobetsu', 'sidenav-item-kobetsu',
      KOBETSU_PAGES.filter(function (p) { return pageAllowed('過去問/個別問題/', p.file); }).map(function (p) {
        return { href: kobetsuPrefix + p.file, label: p.label, current: p.key === currentKey };
      })
    ));

    body.appendChild(buildGroup('神シケプリ', 'sidenav-gtitle-kami', 'sidenav-item-kami',
      KAMI_PAGES.filter(function (p) { return pageAllowed('神シケプリ/', p.file); }).map(function (p) {
        return { href: kamiPrefix + p.file, label: p.label, current: p.key === currentKey };
      })
    ));

    body.appendChild(buildGroup('単語帳', 'sidenav-gtitle-tango', 'sidenav-item-tango',
      TANGO_PAGES.filter(function (p) { return pageAllowed('単語帳/', p.file); }).map(function (p) {
        return { href: tangoPrefix + p.file, label: p.label, current: p.key === currentKey };
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
