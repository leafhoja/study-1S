// docs/index.html: 不許可の教科カード（[data-subject]）を非表示にする。
// 各教科の index.html（および講義一覧などのサブハブページ）: 不許可の個別ページ
// へのリンク（[data-page]）を非表示にする。
// どちらも同じこのファイルで対応する。自分の <script src> に含まれる ../ の
// 数から、今何階層目のページか（＝教科フォルダの中かどうか）を判定する。
// グレーアウトではなく display:none による完全非表示（style.display はどんな
// CSS よりも優先されるので、カード側の style.css を気にせず確実に消せる）。
(function () {
  // 設定ファイルが未読込・破損している場合は表示を許可しない。
  // index.html は access-pending のままになり、拒否対象を含む一覧が漏れない。
  if (!window.ACCESS_CONTROL || typeof window.ACCESS_CONTROL.isAllowed !== "function") {
    console.error("Access control is unavailable; protected content remains hidden.");
    return;
  }

  var el = document.currentScript;
  var src = (el && el.getAttribute("src")) || "";
  var depth = (src.match(/\.\.\//g) || []).length;

  var parts = location.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  // 教科カードは href="力学/" のようにディレクトリ形式で張られており、この形で
  // 遷移すると location.pathname は "/study/力学/" のように末尾がそのフォルダ名で
  // 終わり、"index.html" は一切現れない（GitHub Pages がリダイレクトなしで
  // index.html を直接返すため）。この場合は明示的に index.html を末尾に
  // 補うことで、"/index.html" 明示アクセスの場合と同じ扱いにする。
  if (/\/$/.test(location.pathname)) parts.push("index.html");
  // depth === 0 なら docs/index.html 自身（教科フォルダの中ではない）
  var subjectIdx = depth > 0 ? parts.length - 1 - depth : -1;
  var currentSubject = subjectIdx >= 0 ? parts[subjectIdx] : "";

  // data-page の付け忘れがあっても、access_control.js に登録済みの
  // 同一教科内ページへのリンクは自動的に制御対象にする。これにより、章末の
  // 「前へ／次へ」などから不許可ページの存在が漏れることも防ぐ。
  function markConfiguredPageLinks() {
    if (!currentSubject || !window.ACCESS_CONTROL.pages[currentSubject]) return;
    var configured = window.ACCESS_CONTROL.pages[currentSubject];
    var subjectPos = parts.indexOf(currentSubject);
    if (subjectPos < 0) return;

    document.querySelectorAll("a[href]").forEach(function (link) {
      if (link.hasAttribute("data-page")) return;
      var url;
      try {
        url = new URL(link.getAttribute("href"), location.href);
      } catch (e) {
        return;
      }
      if (url.origin !== location.origin) return;
      var targetParts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
      var targetSubjectPos = targetParts.indexOf(currentSubject);
      if (targetSubjectPos < 0) return;
      var relative = targetParts.slice(targetSubjectPos + 1).join("/")
        .replace(/\.html$/, "")
        .replace(/\/$/, "");
      if (!relative || relative === "index") return;
      if (Object.prototype.hasOwnProperty.call(configured, relative)) {
        link.setAttribute("data-page", relative);
      }
    });
  }

  // トップページ（docs/index.html）: 不許可の教科カードを非表示に
  function applySubjectLocks() {
    var cards = document.querySelectorAll("[data-subject]");
    cards.forEach(function (card) {
      var subject = card.getAttribute("data-subject");
      if (!window.ACCESS_CONTROL.isAllowed(subject)) {
        card.style.display = "none";
      }
    });
  }

  // 教科ページ内: 不許可の個別ページ（章・回・年度など）へのリンクを非表示に。
  // data-page は <a> 自身、または <a> を内包するカード用の div のどちらに
  // 付けてもよい（どちらの場合もその要素ごと非表示にする）。
  function applyPageLocks() {
    if (!currentSubject) return;
    var items = document.querySelectorAll("[data-page]");
    items.forEach(function (item) {
      var pageId = item.getAttribute("data-page");
      if (!window.ACCESS_CONTROL.isAllowed(currentSubject, pageId)) {
        item.style.display = "none";
      }
    });
  }

  // docs/index.html 最下部までスクロールしたときだけ管理者ページへのリンクを表示
  function setupAdminReveal() {
    var reveal = document.getElementById("admin-reveal");
    if (!reveal) return;
    // 画面がページの最下部に達しているかを調べ、管理者ページへのリンクの表示を切り替える。
    function check() {
      var atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 6;
      reveal.classList.toggle("visible", atBottom);
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    window.addEventListener("hashchange", check);
    check();
  }

  try {
    markConfiguredPageLinks();
    applySubjectLocks();
    applyPageLocks();
    setupAdminReveal();
    // 全判定に成功した場合だけ、許可項目を初めて表示する。
    document.documentElement.classList.add("access-ready");
    document.documentElement.classList.remove("access-pending");
  } catch (error) {
    // 途中で失敗しても fail-open せず、保護対象は非表示のままにする。
    console.error("Access check failed; protected content remains hidden.", error);
  }
})();
