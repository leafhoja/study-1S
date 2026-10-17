// 数学基礎理論演習1Sのページ一覧から、画面横に開く目次を作り、ページ移動と開閉操作を扱う。
(function () {
  'use strict';

  /* ================================================================
     ページ定義
  ================================================================ */
  // 微分積分のページごとに、移動先とページ内の問題の見出しをまとめる。
  var CALC_PAGES = [
    { file: 'calc_01.html', num: '第1回', title: 'ε-N論法と数列の収束',
      problems: [
        { id: 'problem1', title: '極限の一意性' },
        { id: 'problem2', title: '極限の演算' },
        { id: 'problem3', title: '0.999… = 1' },
        { id: 'problem4', title: '部分和と収束' },
      ]},
    { file: 'calc_02.html', num: '第2回', title: '上界・下限とWeierstrass定理',
      problems: [
        { id: 'problem1', title: '上限・下限' },
        { id: 'problem2', title: '収束数列は有界' },
        { id: 'problem3', title: '単調増加＆有界→収束' },
        { id: 'problem4', title: 'はさみうちの原理' },
      ]},
    { file: 'calc_03.html', num: '第3回', title: '微分の定義とCauchy方程式',
      problems: [
        { id: 'problem1', title: 'x²sin(1/x) の微分' },
        { id: 'problem2', title: 'Cauchy 関数方程式' },
        { id: 'problem3', title: '塔型累乗の極限' },
      ]},
    { file: 'calc_04.html', num: '第4回', title: '常微分方程式',
      problems: [
        { id: 'problem1', title: '4種の ODE の解' },
        { id: 'problem2', title: '平衡点と変数変換' },
        { id: 'problem3', title: '二階線形 ODE' },
      ]},
    { file: 'calc_05.html', num: '第5回', title: '凸関数・縮小写像・方程式の根',
      problems: [
        { id: 'problem1', title: '凸関数と Jensen 不等式' },
        { id: 'problem2', title: '縮小写像' },
        { id: 'problem3', title: '方程式の根の極限' },
      ]},
  ];

  // 線形代数のページごとに、移動先とページ内の問題の見出しをまとめる。
  var LIN_PAGES = [
    { file: 'lin_01.html', num: '第1回', title: '線形写像と行列表現',
      problems: [
        { id: 'problem1', title: '線形写像の証明' },
        { id: 'problem2', title: '表現行列を求める' },
        { id: 'problem3', title: '合成と行列の積' },
        { id: 'problem4', title: '単射・全射と det' },
      ]},
    { file: 'lin_02.html', num: '第2回', title: '回転・鏡映・直交行列',
      problems: [
        { id: 'problem1', title: '回転行列 Rθ' },
        { id: 'problem2', title: '鏡映行列 Tτ' },
        { id: 'problem3', title: '合成の法則' },
        { id: 'problem4', title: '直交行列の特徴' },
      ]},
    { file: 'lin_03.html', num: '第3回', title: '行列式・逆行列・固有値・対角化',
      problems: [
        { id: 'problem1', title: 'detA=0 ⟺ Av=0' },
        { id: 'problem2', title: 'det(AB) と逆行列' },
        { id: 'problem3', title: '固有値・対角化' },
      ]},
    { file: 'lin_04.html', num: '第4回', title: '核と像・双対空間・内積',
      problems: [
        { id: 'problem1', title: '核と像が部分空間' },
        { id: 'problem2', title: '単射 ⟺ ker={0}' },
        { id: 'problem3', title: '双対空間 V*' },
        { id: 'problem4', title: '内積と双対写像' },
      ]},
  ];

  // 過去問のページごとに、移動先とページ内の問題の見出しをまとめる。
  var KAKOMON_PAGES = [
    { file: 'kakomon_calc_01.html', num: '微積 小テスト', title: 'ε-N・Cesàro・高階微分・gₙ',
      problems: [
        { id: 'problem1', title: 'ε-N論法：e^{aₙ}→eᵃ' },
        { id: 'problem2', title: 'Cesàro 平均' },
        { id: 'problem3', title: 'arcsinh の高階微分' },
        { id: 'problem4', title: 'xⁿsin(1/x) の微分可能性' },
        { id: 'problem5', title: '指数部分和 gₙ(x)' },
      ]},
    { file: 'kakomon_lin_01.html', num: '線形 小テスト', title: '固有値・直交行列・Hom',
      problems: [
        { id: 'problem1', title: '表現行列・核・像' },
        { id: 'problem2', title: '直交行列と冪' },
        { id: 'problem3', title: '固有値・対角化' },
        { id: 'problem4', title: 'Hom空間と同型' },
      ]},
  ];

  // 予想問題のページごとに、移動先とページ内の問題の見出しをまとめる。
  var YOSOU_PAGES = [
    { file: 'yosou_calc_01.html', num: '予想 第1回', title: 'ε-N論法と数列の収束',
      problems: [
        { id: 'problem1', title: 'ε-Nによる直接証明' },
        { id: 'problem2', title: 'はさみうちの原理' },
        { id: 'problem3', title: '部分列と発散の判定' },
        { id: 'problem4', title: 'Cesàro平均の応用' },
      ]},
    { file: 'yosou_calc_02.html', num: '予想 第2回', title: '上界・下限とWeierstrass定理',
      problems: [
        { id: 'problem1', title: '具体的な集合の上限・下限' },
        { id: 'problem2', title: 'Cauchy列は有界' },
        { id: 'problem3', title: 'Newton法による√2の近似' },
        { id: 'problem4', title: '上極限の劣加法性' },
      ]},
    { file: 'yosou_calc_03.html', num: '予想 第3回', title: '微分の定義・Taylor展開とCauchy方程式',
      problems: [
        { id: 'problem1', title: '接続点における微分可能性' },
        { id: 'problem2', title: '乗法的Cauchy方程式' },
        { id: 'problem3', title: 'Taylorの定理と誤差評価' },
        { id: 'problem4', title: 'マクローリン展開と極限計算' },
      ]},
    { file: 'yosou_calc_04.html', num: '予想 第4回', title: '常微分方程式',
      problems: [
        { id: 'problem1', title: '変数分離形と有限時間爆発' },
        { id: 'problem2', title: 'ロジスティック型の定性的分類' },
        { id: 'problem3', title: '重解をもつ2階線形ODE' },
        { id: 'problem4', title: '非自励Riccati方程式' },
      ]},
    { file: 'yosou_calc_05.html', num: '予想 第5回', title: '凸関数・縮小写像・方程式の根',
      problems: [
        { id: 'problem1', title: 'べき平均不等式' },
        { id: 'problem2', title: '縮小写像による√3の近似' },
        { id: 'problem3', title: 'cos x = x の解と逐次近似' },
        { id: 'problem4', title: '一般化Bernoulli不等式' },
      ]},
    { file: 'yosou_calc_keisan.html', num: '番外編', title: '極限計算とその正当化',
      problems: [
        { id: 'problem1', title: 'Taylor展開とロピタルの一致確認' },
        { id: 'problem2', title: '同次数展開の必要性' },
        { id: 'problem3', title: '収束半径の外側での誤用' },
        { id: 'problem4', title: 'ロピタルが使えない例' },
      ]},
    { file: 'yosou_lin_01.html', num: '予想 第1回', title: '表現行列・核と像',
      problems: [
        { id: 'problem1', title: '表現行列と逆写像' },
        { id: 'problem2', title: '3次元の表現行列と単射性' },
        { id: 'problem3', title: 'パラメータと階数分析' },
        { id: 'problem4', title: '核・像の部分空間性と次元定理' },
        { id: 'problem5', title: '核を指定した写像の構成' },
      ]},
    { file: 'yosou_lin_02.html', num: '予想 第2回', title: '回転・鏡映・直交行列',
      problems: [
        { id: 'problem1', title: '回転行列の逆行列と転置' },
        { id: 'problem2', title: '鏡映変換による点の像' },
        { id: 'problem3', title: '直交行列の未知成分' },
        { id: 'problem4', title: 'A⁴=E を満たす直交行列' },
        { id: 'problem5', title: '鏡映の合成の数値検証' },
      ]},
    { file: 'yosou_lin_03.html', num: '予想 第3回', title: '固有値・対角化',
      problems: [
        { id: 'problem1', title: '固有値・対角化の基本' },
        { id: 'problem2', title: '3×3行列の対角化' },
        { id: 'problem3', title: 'Cayley-Hamilton の応用' },
        { id: 'problem4', title: '対称行列の直交対角化' },
        { id: 'problem5', title: 'パラメータと対角化可能性' },
      ]},
    { file: 'yosou_lin_04.html', num: '予想 第4回', title: '核と像の一般論・双対空間',
      problems: [
        { id: 'problem1', title: '核・像の部分空間性' },
        { id: 'problem2', title: 'Hom(V,W)がベクトル空間' },
        { id: 'problem3', title: '双対基底の計算' },
        { id: 'problem4', title: 'dim Hom(V,W)=dimV×dimW' },
        { id: 'problem5', title: '冪等行列と直和分解' },
      ]},
  ];

  /* ================================================================
     ユーティリティ
  ================================================================ */
  // 指定された種類のHTML要素を作り、見た目の名前と表示する文字を付ける。
  function mk(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  // アクセス制御との連携: トップページのカードを非表示にしても、このハンバーガー
  // メニューは access_control.js を見ずに全ページのタイトルを並べてしまうため、
  // ここでも同じ許可判定を通す。各グループはそれぞれ別のサブフォルダにあるので、
  // access_control.js の pages[] のキーに合わせて prefix を付けて判定する。
  function pageAllowed(prefix, file) {
    if (!window.ACCESS_CONTROL) return true;
    return window.ACCESS_CONTROL.isAllowed('数学基礎理論演習1S', prefix + file.replace(/\.html$/, ''));
  }

  /* ================================================================
     buildNav — サイドナビ構築
  ================================================================ */
  function buildNav() {
    var pathname = location.pathname;
    var currentFile = pathname.split('/').pop() || '';
    var isIndex = (currentFile === 'index.html' || currentFile === '');
    var inSubdir = /\/(calculus|linear|kakomon|yosou)\//.test(pathname);
    var prefix     = inSubdir ? '../' : '';
    var calcPrefix = prefix + 'calculus/';
    var linPrefix  = prefix + 'linear/';

    /* インデックスページにはサイドナビ不要 */
    if (isIndex) return;

    var calcPages    = CALC_PAGES.filter(function (p) { return pageAllowed('calculus/', p.file); });
    var linPages     = LIN_PAGES.filter(function (p) { return pageAllowed('linear/', p.file); });
    var kakomonPages = KAKOMON_PAGES.filter(function (p) { return pageAllowed('kakomon/', p.file); });
    var yosouPages   = YOSOU_PAGES.filter(function (p) { return pageAllowed('yosou/', p.file); });

    /* ---- sidebar ---- */
    // 目次の外枠と見出しを作り、その中にリンクを入れる領域を用意する。
    var nav = document.createElement('nav');
    nav.id = 'sidenav';
    nav.className = 'sidenav';
    nav.setAttribute('aria-label', '問題ナビゲーション');

    var sideHead = mk('div', 'sidenav-header');
    sideHead.appendChild(mk('span', 'sidenav-brand', '問題一覧'));
    var closeBtn = mk('button', 'sidenav-close-btn');
    closeBtn.setAttribute('aria-label', '閉じる');
    closeBtn.textContent = '✕';
    sideHead.appendChild(closeBtn);
    nav.appendChild(sideHead);

    var indexRow = mk('div', 'sidenav-index-row');
    var indexA = mk('a', 'sidenav-index-link', '↑ トップページ');
    indexA.href = prefix + 'index.html';
    indexRow.appendChild(indexA);
    nav.appendChild(indexRow);

    var body = mk('div', 'sidenav-body');
    nav.appendChild(body);

    // ひとつの分類の見出しと、その分類に属するリンクをまとめて作る。
    function buildGroup(pages, base, label, titleCls, itemCls, probCls) {
      var group = mk('div', 'sidenav-group');
      group.appendChild(mk('div', 'sidenav-group-title ' + titleCls, label));

      for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var isCurrent = currentFile === page.file;

        var item = mk('div', 'sidenav-item ' + itemCls + (isCurrent ? ' sidenav-current' : ''));

        /* 展開ボタン */
        var expandBtn = mk('button', 'sidenav-expand-btn' + (isCurrent ? ' sidenav-expand-open' : ''));
        expandBtn.setAttribute('type', 'button');
        expandBtn.setAttribute('aria-label', '問題一覧を展開');
        item.appendChild(expandBtn);

        /* ページリンク */
        var link = document.createElement('a');
        link.href = base + page.file;
        link.className = 'sidenav-item-link';
        link.appendChild(mk('span', 'sidenav-item-num', page.num));
        var titleSpan = mk('span', 'sidenav-item-title', page.title);
        link.appendChild(titleSpan);
        item.appendChild(link);

        group.appendChild(item);

        /* 問題リスト */
        var probWrap = mk('div', 'sidenav-problems ' + probCls + (isCurrent ? '' : ' sidenav-problems-hidden'));
        for (var j = 0; j < page.problems.length; j++) {
          var p = page.problems[j];
          var pnum = p.id.replace('problem', '');
          var a = document.createElement('a');
          a.href = (isCurrent ? '' : base + page.file) + '#' + p.id;
          a.className = 'sidenav-problem';
          a.dataset.target = p.id;
          a.appendChild(mk('span', 'sidenav-prob-num', '問' + pnum));
          a.appendChild(mk('span', 'sidenav-prob-title', p.title));
          probWrap.appendChild(a);
        }
        group.appendChild(probWrap);

        (function (btn, wrap) {
          btn.addEventListener('click', function (evt) {
            evt.stopPropagation();
            var isOpen = !wrap.classList.contains('sidenav-problems-hidden');
            if (isOpen) {
              wrap.classList.add('sidenav-problems-hidden');
              btn.classList.remove('sidenav-expand-open');
            } else {
              wrap.classList.remove('sidenav-problems-hidden');
              btn.classList.add('sidenav-expand-open');
            }
          });
        })(expandBtn, probWrap);
      }
      return group;
    }

    // 閲覧が許可されたページを選び、移動先と現在ページの印を付けて分類ごとに並べる。
    body.appendChild(buildGroup(
      calcPages, calcPrefix,
      '📐 微分積分学', 'sidenav-gtitle-calc', 'sidenav-item-calc', 'sidenav-problems-calc'
    ));
    body.appendChild(buildGroup(
      linPages, linPrefix,
      '🔷 線形代数学', 'sidenav-gtitle-lin', 'sidenav-item-lin', 'sidenav-problems-lin'
    ));
    body.appendChild(buildGroup(
      kakomonPages, prefix + 'kakomon/',
      '📝 過去問', 'sidenav-gtitle-lin', 'sidenav-item-lin', 'sidenav-problems-lin'
    ));
    body.appendChild(buildGroup(
      yosouPages, prefix + 'yosou/',
      '🔮 予想問題', 'sidenav-gtitle-lin', 'sidenav-item-lin', 'sidenav-problems-lin'
    ));

    document.body.appendChild(nav);

    /* ---- トグルボタン（navbar-inner に挿入） ---- */
    var toggleBtn = mk('button', 'sidenav-toggle-btn');
    toggleBtn.id = 'sidenav-toggle';
    toggleBtn.setAttribute('aria-label', '問題一覧');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', 'sidenav');
    toggleBtn.textContent = '☰';

    var headerInner = document.querySelector('.header-inner, .navbar-inner');
    if (headerInner) headerInner.insertBefore(toggleBtn, headerInner.firstChild);

    /* ---- open / close ---- */
    // 目次を開き、開閉ボタンを「閉じる」状態にする。
    function openNav() {
      nav.classList.add('sidenav-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.textContent = '✕';
    }
    // 目次を閉じ、開閉ボタンを「開く」状態に戻す。
    function closeNav() {
      nav.classList.remove('sidenav-open');
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
      if (nav.classList.contains('sidenav-open') &&
          !nav.contains(evt.target) && evt.target !== toggleBtn) closeNav();
    });

    /* モバイルで問題リンク押下時に閉じる */
    nav.querySelectorAll('.sidenav-problem').forEach(function (a) {
      a.addEventListener('click', function () { if (window.innerWidth < 900) closeNav(); });
    });

    /* サイドナビは手動で開く（他セクションと統一のため自動展開しない） */

    /* ================================================================
       スクロールスパイ
    ================================================================ */
    var probLinks = nav.querySelectorAll('.sidenav-problem');
    if (probLinks.length > 0) {
      var sections = [];
      probLinks.forEach(function (a) {
        var sec = document.getElementById(a.dataset.target);
        if (sec) sections.push({ el: sec, link: a });
      });
      // 画面上端に近い問題を調べ、目次の対応するリンクを目立たせる。
      function updateSpy() {
        var scrollY = window.scrollY + 120;
        var active = null;
        for (var k = 0; k < sections.length; k++) {
          if (sections[k].el.offsetTop <= scrollY) active = sections[k].link;
        }
        probLinks.forEach(function (a) { a.classList.remove('sidenav-problem-active'); });
        if (active) active.classList.add('sidenav-problem-active');
      }
      window.addEventListener('scroll', updateSpy, { passive: true });
      updateSpy();
    }

    /* ================================================================
       キーボードナビゲーション
       Escape : サイドナビを閉じる
       [ / ]  : 前後のページへ移動
    ================================================================ */
    var ALL_SEQUENCES = [
      { pages: calcPages,   base: calcPrefix },
      { pages: linPages,    base: linPrefix  },
      { pages: kakomonPages, base: prefix + 'kakomon/' },
      { pages: yosouPages, base: prefix + 'yosou/' },
    ];

    // 同じ分類のページ一覧から、現在のページの前後の移動先を探す。
    function findNeighbors() {
      for (var s = 0; s < ALL_SEQUENCES.length; s++) {
        var seq = ALL_SEQUENCES[s];
        for (var i = 0; i < seq.pages.length; i++) {
          if (seq.pages[i].file === currentFile) {
            return {
              prev: i > 0 ? seq.base + seq.pages[i - 1].file : null,
              next: i < seq.pages.length - 1 ? seq.base + seq.pages[i + 1].file : null,
            };
          }
        }
      }
      return { prev: null, next: null };
    }

    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case 'Escape':
          if (nav.classList.contains('sidenav-open')) { closeNav(); e.preventDefault(); }
          break;
        case '[': {
          var nb = findNeighbors();
          if (nb.prev) { location.href = nb.prev; e.preventDefault(); }
          break;
        }
        case ']': {
          var nb2 = findNeighbors();
          if (nb2.next) { location.href = nb2.next; e.preventDefault(); }
          break;
        }
      }
    });

  }

  // HTMLの読み込みが終わってから、目次をページに追加する。
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})();
