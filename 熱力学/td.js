/* ═══════════════════════════════════════════════
   熱力学ノート 2025 — 共通スクリプト
   ═══════════════════════════════════════════════ */

/* ─── 証明ボックスの折り畳み ─── */
document.addEventListener('DOMContentLoaded', () => {
  // 証明ボックス: デフォルトで折り畳む
  document.querySelectorAll('.box-prf').forEach(box => {
    box.classList.add('collapsed');
    box.querySelector('.box-head').addEventListener('click', () => {
      box.classList.toggle('collapsed');
    });
  });

  // サイドバー: スクロールで現在位置をハイライト
  initSidebarHighlight();

  // サイドバー: ハンバーガーボタンで開閉
  initSidebarToggle();
});

// 目次を開閉するボタンと背景を作り、クリックやEscapeキーで閉じられるようにする。
function initSidebarToggle() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  document.body.appendChild(backdrop);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'gtoc-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', '閉じる');
  closeBtn.textContent = '✕';
  sidebar.insertBefore(closeBtn, sidebar.firstChild);

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'gtoc-toggle';
  toggleBtn.type = 'button';
  toggleBtn.setAttribute('aria-label', '目次を開く');
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.textContent = '☰';

  const navInner = document.querySelector('.navbar-inner');
  if (navInner) navInner.insertBefore(toggleBtn, navInner.firstChild);

  // 目次とその背景を表示し、ボタンに「開いている」状態を記録する。
  function openSidebar() {
    sidebar.classList.add('sidebar-open');
    backdrop.classList.add('sidebar-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }
  // 目次とその背景を隠し、ボタンに「閉じている」状態を記録する。
  function closeSidebar() {
    sidebar.classList.remove('sidebar-open');
    backdrop.classList.remove('sidebar-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }
  // 目次の現在の状態に応じて、開く処理か閉じる処理を選ぶ。
  function toggleSidebar() {
    sidebar.classList.contains('sidebar-open') ? closeSidebar() : openSidebar();
  }

  toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleSidebar(); });
  closeBtn.addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('sidebar-open')) closeSidebar();
  });
  sidebar.querySelectorAll('.sidebar-nav a').forEach((a) => {
    a.addEventListener('click', closeSidebar);
  });
}

// 目次のリンクと本文の節を対応させ、読んでいる節に合わせて目次の強調を変える。
function initSidebarHighlight() {
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');
  if (!sidebarLinks.length) return;

  const sections = Array.from(sidebarLinks).map(a => {
    const id = a.getAttribute('href').slice(1);
    return { link: a, el: document.getElementById(id) };
  }).filter(s => s.el);

  let ticking = false;
  // 画面上端に近い節を探し、目次の対応するリンクだけを強調する。
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY + 90;
        let active = sections[0];
        for (const s of sections) {
          if (s.el.offsetTop <= scrollY) active = s;
        }
        sidebarLinks.forEach(a => a.classList.remove('active'));
        if (active) active.link.classList.add('active');
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
