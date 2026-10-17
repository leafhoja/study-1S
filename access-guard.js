// 各教科ページの <head> 先頭で access_control.js の直後に読み込む。
// アクセス不可の場合はトップページ（docs/index.html）へ戻す。
// このファイル自身は "../access-guard.js" や "../../access-guard.js" のように
// 相対階層の深さ分だけ ../ を重ねて読み込まれる想定で、自身の <script src>
// に含まれる ../ の数から、今何階層目のページかを逆算する。
(function () {
  var el = document.currentScript;
  var src = (el && el.getAttribute("src")) || "";
  var depth = (src.match(/\.\.\//g) || []).length || 1;

  var parts = location.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  // 教科カードは href="力学/" のようにディレクトリ形式で張られており、この形で
  // 遷移すると location.pathname は "/study/力学/" のように末尾がそのフォルダ名で
  // 終わり、"index.html" は一切現れない（GitHub Pages がリダイレクトなしで
  // index.html を直接返すため）。この場合は明示的に index.html を末尾に
  // 補うことで、"/index.html" 明示アクセスの場合と同じ扱いにする。
  if (/\/$/.test(location.pathname)) parts.push("index.html");
  var subjectIdx = parts.length - 1 - depth;
  var subject = subjectIdx >= 0 ? parts[subjectIdx] : "";

  if (!subject || !window.ACCESS_CONTROL) return;

  // 教科フォルダを起点とした相対パス（拡張子なし）＝ページID。
  //   例: 現代経済理論/講義/第1回.html → "講義/第1回"
  var pageId = parts.slice(subjectIdx + 1).join("/").replace(/\.html$/, "");

  // 各階層の index ページ（ハブページ）はページ単位では管理しない。
  // 教科レベルの許可だけで判定する（access_control.js の pages には載せない）。
  var isHubPage = /(^|\/)index$/.test(pageId);

  var allowed = isHubPage
    ? window.ACCESS_CONTROL.isAllowed(subject)
    : window.ACCESS_CONTROL.isAllowed(subject, pageId);

  if (!allowed) {
    var backPath = new Array(depth + 1).join("../") + "index.html";
    location.replace(backPath);
  }
})();
