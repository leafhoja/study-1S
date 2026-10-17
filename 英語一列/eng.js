/* ═══════════════════════════════════════════════
   英語一列ノート — 共通スクリプト
   単語タップ → ポップアップ表示 / 単語帳フリップカード
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initEntityNotes();
  initVocabPopup();
  initFlipCards();
  initExamChoices();
});

// 英文中の人物名などを補足が開ける表示に変え、ページ末尾に固有名詞の一覧を作る。
function initEntityNotes() {
  if (typeof ENTITY_SESSIONS === 'undefined') return;
  const sessionId = document.body.dataset.navPage;
  const entities = ENTITY_SESSIONS[sessionId];
  if (!entities) return;

  // 固有名詞の別名を集め、長い名前から先に本文と照合できるように並べる。
  const aliasMap = [];
  Object.entries(entities).forEach(([key, data]) => {
    (data.aliases || [key]).forEach(alias => aliasMap.push({ alias, key }));
  });
  aliasMap.sort((a, b) => b.alias.length - a.alias.length);
  const escaped = aliasMap.map(item => item.alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(^|[^A-Za-z])(${escaped.join('|')})(?=$|[^A-Za-z])`, 'g');
  const aliasToKey = new Map(aliasMap.map(item => [item.alias, item.key]));

  // 英文の文字を読み、登録された固有名詞を補足欄が開ける表示に置き換える。
  document.querySelectorAll('.para-en').forEach(paragraph => {
    const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim() || node.parentElement.closest('.vw, .entity-note')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const text = node.nodeValue;
      let last = 0;
      let matched = false;
      const fragment = document.createDocumentFragment();
      text.replace(pattern, (whole, lead, alias, offset) => {
        matched = true;
        const nameStart = offset + lead.length;
        fragment.appendChild(document.createTextNode(text.slice(last, nameStart)));
        const mark = document.createElement('span');
        mark.className = 'entity-note';
        mark.dataset.e = aliasToKey.get(alias);
        mark.textContent = alias;
        fragment.appendChild(mark);
        last = nameStart + alias.length;
        return whole;
      });
      if (matched) {
        fragment.appendChild(document.createTextNode(text.slice(last)));
        node.replaceWith(fragment);
      }
    });
  });

  // ページ末尾に置かれた単語帳の後へ、固有名詞と意味の一覧を追加する。
  const wordlist = document.getElementById('wordbank');
  if (!wordlist) return;
  const head = document.createElement('div');
  head.className = 'wordbank-head entitybank-head';
  head.innerHTML = `
    <h2>固有名詞・背景帳 — ${sessionId.replace('session', 'Session ')}</h2>
    <p class="wordbank-hint">本文理解に必要な人物・事件・作品などの文脈注です。暗記用の単語帳とは分けています。</p>`;
  const list = document.createElement('div');
  list.className = 'wordlist entitylist';
  Object.entries(entities).forEach(([key, data]) => {
    const row = document.createElement('div');
    row.className = 'wl-row';
    row.innerHTML = `
      <span class="entity-note wl-word" data-e="${key}">${key}</span>
      <span class="wl-pos entity-pos">${data.pos}</span>
      <span class="wl-meaning">${data.meaning}</span>`;
    list.appendChild(row);
  });
  wordlist.after(head, list);
}

// 単語や固有名詞を押すと、意味・背景を別の小さな欄に表示できるようにする。
function initVocabPopup() {
  const backdrop = document.createElement('div');
  backdrop.className = 'vw-backdrop';
  const sheet = document.createElement('div');
  sheet.className = 'vw-sheet';
  sheet.innerHTML = `
    <div class="vw-sheet-head">
      <span class="vw-word"></span>
      <span class="vw-pos"></span>
      <button class="vw-close" type="button" aria-label="閉じる">✕</button>
    </div>
    <div class="vw-meaning"></div>
    <div class="vw-bg-label">背景・語源</div>
    <div class="vw-bg"></div>
  `;
  document.body.appendChild(backdrop);
  document.body.appendChild(sheet);

  const wordEl = sheet.querySelector('.vw-word');
  const posEl = sheet.querySelector('.vw-pos');
  const meaningEl = sheet.querySelector('.vw-meaning');
  const bgEl = sheet.querySelector('.vw-bg');

  // 選ばれた語句の意味と背景を補足欄に入れ、欄を開く。
  function open(data, label) {
    wordEl.textContent = label;
    posEl.textContent = data.pos || '';
    meaningEl.textContent = data.meaning || '';
    bgEl.textContent = data.background || '';
    backdrop.classList.add('open');
    sheet.classList.add('open');
  }
  // 補足欄と背景を隠す。
  function close() {
    backdrop.classList.remove('open');
    sheet.classList.remove('open');
  }

  // 押された語句の種類とセッションを調べ、対応する意味や背景を補足欄に表示する。
  document.querySelectorAll('.vw, .entity-note').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const isEntity = el.classList.contains('entity-note');
      const key = isEntity ? el.dataset.e : el.dataset.w;
      const sessionId = document.body.dataset.navPage;
      const data = isEntity && typeof ENTITY_SESSIONS !== 'undefined'
        ? ENTITY_SESSIONS[sessionId]?.[key]
        : ((typeof VOCAB !== 'undefined') ? VOCAB[key] : null);
      if (!data) return;
      el.classList.add('seen');
      open(data, isEntity ? key : el.textContent);
    });
  });

  backdrop.addEventListener('click', close);
  sheet.querySelector('.vw-close').addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}

// 単語カードをクリックすると、表と裏の表示を切り替えるようにする。
function initFlipCards() {
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
}

// 選択肢をクリックしたとき、選んだ項目と答えを表示する状態に切り替える。
function initExamChoices() {
  document.addEventListener('click', e => {
    const opt = e.target.closest('.exam-opts li');
    if (!opt) return;
    const list = opt.closest('.exam-opts');
    if (!list || list.classList.contains('revealed')) return;
    list.classList.add('revealed');
    opt.classList.add('selected');
  });
}
