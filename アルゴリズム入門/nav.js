// 科目内目次。ページ一覧はアクセス許可を確認してから DOM に追加する。
(function () {
  'use strict';
  var NOTE_PAGES = [
    {file:'index.html', label:'トップ'},
    {file:'lecture1.html', label:'第1回 アルゴリズムとPythonの基礎'},
    {file:'lecture2.html', label:'第2回 数値表現と計算誤差'}
  ];
  var EXAM_PAGES = [];
  for (var year = 2025; year >= 2010; year--) EXAM_PAGES.push({file:'kakomon_' + year + '.html', label:year + '年度'});
  function pageAllowed(file) {
    if (file === 'index.html') return true;
    var access = window.ACCESS_CONTROL;
    return !!access && typeof access.isAllowed === 'function' && access.isAllowed('アルゴリズム入門', file.replace(/\.html$/, ''));
  }
  function buildNav() {
    var current = document.body.getAttribute('data-nav-page');
    var nav = document.createElement('nav');
    nav.id = 'sidenav'; nav.className = 'sidenav';
    nav.setAttribute('aria-label', 'アルゴリズム入門の目次');
    nav.setAttribute('inert', '');
    var head = document.createElement('div'); head.className = 'sidenav-header';
    var brand = document.createElement('strong'); brand.textContent = 'アルゴリズム入門 · 1A';
    var close = document.createElement('button'); close.className = 'sidenav-close-btn'; close.type = 'button'; close.textContent = '✕'; close.setAttribute('aria-label', '目次を閉じる');
    head.append(brand, close); nav.appendChild(head);
    var body = document.createElement('div'); body.className = 'sidenav-body'; nav.appendChild(body);
    function buildGroup(label, items) {
      if (!items.length) return;
      var group = document.createElement('div'); group.className = 'sidenav-group';
      var title = document.createElement('div'); title.className = 'sidenav-group-title'; title.textContent = label; group.appendChild(title);
      items.forEach(function (p) {
        var a = document.createElement('a'); a.href = p.file; a.textContent = p.label; a.className = 'sidenav-item';
        if (p.file.replace(/\.html$/, '') === current) { a.classList.add('sidenav-current'); a.setAttribute('aria-current','page'); }
        group.appendChild(a);
      }); body.appendChild(group);
    }
    buildGroup('講義ノート', NOTE_PAGES.filter(function (p) { return pageAllowed(p.file); }));
    buildGroup('過去問解説', EXAM_PAGES.filter(function (p) { return pageAllowed(p.file); }));
    document.body.appendChild(nav);
    var toggle = document.createElement('button'); toggle.className = 'sidenav-toggle-btn'; toggle.type = 'button'; toggle.textContent = '☰'; toggle.setAttribute('aria-label','目次を開く'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-controls','sidenav');
    var header = document.querySelector('.navbar-inner'); if (header) header.prepend(toggle);
    var backdrop = document.createElement('div'); backdrop.className = 'sidenav-backdrop'; backdrop.hidden = true; document.body.appendChild(backdrop);
    function setOpen(open) {
      nav.classList.toggle('sidenav-open', open); nav.toggleAttribute('inert', !open); backdrop.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) close.focus(); else toggle.focus();
    }
    toggle.addEventListener('click',function () { setOpen(!nav.classList.contains('sidenav-open')); });
    close.addEventListener('click',function () { setOpen(false); });
    backdrop.addEventListener('click',function () { setOpen(false); });
    document.addEventListener('keydown',function (e) {
      if (!nav.classList.contains('sidenav-open')) return;
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab') {
        var items = nav.querySelectorAll('button,a'); var first = items[0], last = items[items.length-1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click',function () { setOpen(false); }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',buildNav); else buildNav();
})();
