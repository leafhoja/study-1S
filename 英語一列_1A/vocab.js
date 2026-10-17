/* Sセメスターと同じ、本文の語句注・固有名詞注・三列の単語帳。 */
(function () {
  'use strict';
  // ページのURLからセッション番号を読み、必要な単語・固有名詞データがあるかを確かめる。
  const match = location.pathname.match(/session(1[4-8])(?:-taiyaku)?\.html$/);
  if (!match || typeof ENGLISH_1A_VOCAB === 'undefined' || typeof ENGLISH_1A_ENTITIES === 'undefined' || typeof ENGLISH_1A_FORM === 'undefined' || typeof ENGLISH_1A_DEPTH === 'undefined') return;
  const session = 'session' + match[1];
  // このセッションの基本語彙と追加語彙を合わせ、固有名詞として扱う語を単語一覧から除く。
  const words = Object.assign({}, ENGLISH_1A_VOCAB[session], ENGLISH_1A_EXTRA[session], ENGLISH_1A_MORE[session], ENGLISH_1A_MORE2[session]);
  const entities = ENGLISH_1A_ENTITIES[session];
  const entityOnly = new Set({
    session14: ['igwe', 'warrant chief', 'dibia', 'durbar'],
    session15: ['MRSA'],
    session16: ['bubonic plague'],
    session17: [],
    session18: []
  }[session]);
  entityOnly.forEach(key => delete words[key]);

  // 本文に出る活用形や複数形を、説明が登録されている単語の形と対応させる。
  const variants = {
    session14: { christened: 'christen', displaced: 'displace', entailed: 'entail' },
    session15: { backfiring: 'backfire', burrows: 'burrow', ousted: 'oust', pathogens: 'pathogen' },
    session16: { scurrying: 'scurry', suppressed: 'suppress', pathogens: 'pathogen' },
    session17: { burgeoned: 'burgeon', mangroves: 'mangrove', sediments: 'sediment', reservoirs: 'reservoir', tributaries: 'tributary', uprooted: 'uproot' },
    session18: { 'greenhouse gases': 'greenhouse gas', cyclones: 'cyclone', monsoons: 'monsoon', displaced: 'displace', buffeted: 'buffet', retracted: 'retract' }
  }[session];

  // セッションごとに、動詞・形容詞などの分類に属する語を縦棒で区切ってまとめる。
  const posGroups = {
    session14: {
      動: 'jettison|christen|christened|tolerate|institute|displace|abhor|entail|confer|marinate|reproaching',
      形: 'freeborn|pliable|flagrant|mediating|proximate|plenipotent|inherently|postcolonial|anomic|normative|predominantly|diffused|segmented|wayward|feudal|indiscriminate|avaricious|devalued|equivalent|constituted|stipulated|despised|wholesale|monarchical',
      副: 'inherently|predominantly|succinctly',
      熟: 'saddled with|dregs of society|bare glimpse|mushroom kingships|dramatic convenience|monopoly of power|sovereign power|executive authority|ethnic identity|legislative chambers'
    },
    session15: {
      動: 'oust|quarantine|backfire|thrive|ferried|flee|ensue|expelling|acquiring|converge|crouches|peering|adapted|absorb|urinate|swap genes',
      形: 'unfussy|parasitic|territorial|overgrown|veterinary|moderately|calorie-rich|human-dominated|genetic|methicillin-resistant|intact forest|tight-knit|single-block|place-specific|canine|age-old|characteristic|diverse',
      副: 'anecdotally|moderately',
      熟: 'ecological niche|primary forest|parasitic response|pest control|territorial battles|thrift shop|live trap'
    },
    session16: {
      動: 'euthanize|scurry|suppress|sway|malformed|infected|established|exposed to|tracking|scattered|echoed|screen for|evolves|track',
      形: 'irrepressible|viable|exotic|contagious|preventative|adjacent|potentially|intentionally|steadily|overripe|nonexistent|shortsighted|essentially|publicly funded|malformed|infected|established|scattered|real-time|confined|individual|disease free|unique',
      副: 'potentially|intentionally|hastily|steadily|essentially|actively',
      熟: 'part and parcel|political clout|fact of life|getting rid of|equilibrium with|interact with|exposed to|social justice|foreign rats|shipping port|bubonic plague'
    },
    session17: {
      動: 'burgeon|uproot|avert|underwent|propelled|encroach on|recedes|stabilizes|destabilized|replenish|epitomized|proliferated|outstrips|transformed|contrasted|intensified|buoyed|choke|diverted',
      形: 'littoral|insatiable|imperial|unintended|ever-accelerating|subsidized|predominant|perennial|changeless',
      熟: 'margins of freedom|fishing frontier|food security|flood defenses|diminishing returns|pioneer colonies|storm surge|hydraulic engineering|offshore drilling|flood-plains'
    },
    session18: {
      動: 'retract|displace|buffet|spill into|retracted|seized upon|dreaded|swept in|sloshed|buckled|abandoned',
      形: 'unprecedented|cumulative|erratic|low-lying|densely populated|catastrophic|conservative|worst-affected|devastating|unpredictable|unreliable|tumultuous|intense cyclones|discomforting|abnormally|spine-chilling|overall|distorted|temporary|short-distance',
      副: 'abnormally|permanently',
      熟: 'tipping point|coastal erosion|storm surge|planetary warming|marine pollution|greenhouse gas|land-based ice|put this in perspective|emission source|mean sea level|permanent emergency|back in fashion|furies of nature|virtual certainty|looms large|national security|climate-induced migration'
    }
  }[session];
  const pos = {};
  for (const [label, keys] of Object.entries(posGroups)) keys.split('|').forEach(key => { pos[key] = label; });
  // 単語に登録された品詞を返し、登録がなければ名詞として扱う。
  function kind(key) { return pos[key] || '名'; }

  // 重要語を先に並べ、残りの語は英字順にして単語帳の表示順を決める。
  const priority = [...ENGLISH_1A_ORDER[session].core.split('|'), ...ENGLISH_1A_ORDER[session].supporting.split('|')];
  const ordered = [...priority.filter(key => words[key]), ...Object.keys(words).filter(key => !priority.includes(key)).sort((a, b) => a.localeCompare(b, 'en'))];
  // 単語・活用形・固有名詞の別名を集め、本文で探す名前と説明のキーを対応させる。
  const aliasEntries = [];
  Object.keys(words).forEach(key => aliasEntries.push({ alias: key, key, entity: false }));
  Object.entries(variants).forEach(([alias, key]) => { if (words[key]) aliasEntries.push({ alias, key, entity: false }); });
  Object.entries(entities).forEach(([key, data]) => (data[3] || [key]).forEach(alias => aliasEntries.push({ alias, key, entity: true })));
  aliasEntries.sort((a, b) => b.alias.length - a.alias.length || Number(b.entity) - Number(a.entity));
  const aliasByName = new Map();
  aliasEntries.forEach(item => { if (!aliasByName.has(item.alias.toLowerCase())) aliasByName.set(item.alias.toLowerCase(), item); });
  const uniqueAliases = [...aliasByName.values()];
  const escaped = uniqueAliases.map(item => item.alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'));
  const pattern = new RegExp('(^|[^A-Za-z])(' + escaped.join('|') + ')(?=$|[^A-Za-z])', 'gi');

  // 単語・固有名詞の一覧を作り、英文中の語句から補足を開けるようにする。
  function init() {
    // 単語帳に、単語のボタン・品詞・日本語の意味を一行ずつ追加する。
    const bank = document.getElementById('wordbank');
    if (bank) {
      bank.replaceChildren();
      ordered.forEach(key => {
      const row = document.createElement('div');
      row.className = 'wl-row';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'vw wl-word';
      button.dataset.word = key;
      button.textContent = key;
      const type = document.createElement('span');
      type.className = 'wl-pos';
      type.textContent = kind(key);
      const meaning = document.createElement('span');
      meaning.className = 'wl-meaning';
      meaning.textContent = words[key][0];
      row.append(button, type, meaning);
        bank.append(row);
      });
    }
    // 固有名詞の一覧に、名前のボタン・分類・意味を一行ずつ追加する。
    const entityBank = document.getElementById('entitybank');
    if (entityBank) {
      entityBank.replaceChildren();
      Object.entries(entities).forEach(([key, data]) => {
      const row = document.createElement('div');
      row.className = 'wl-row';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'entity-note wl-word';
      button.dataset.entity = key;
      button.textContent = key;
      const type = document.createElement('span');
      type.className = 'wl-pos entity-pos';
      type.textContent = data[0];
      const meaning = document.createElement('span');
      meaning.className = 'wl-meaning';
      meaning.textContent = data[1];
      row.append(button, type, meaning);
        entityBank.append(row);
      });
    }

    // 英文の文字から登録語を探し、元の表記を保ったまま補足を開くボタンに置き換える。
    document.querySelectorAll('.para-en, .sent-en').forEach(block => {
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          return node.nodeValue.trim() && !node.parentElement.closest('button, a, .vw, .entity-note')
            ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        const value = node.nodeValue;
        const fragment = document.createDocumentFragment();
        let last = 0;
        let found = false;
        pattern.lastIndex = 0;
        for (const result of value.matchAll(pattern)) {
          const label = result[2];
          const item = aliasByName.get(label.toLowerCase());
          if (!item) continue;
          const start = result.index + result[1].length;
          fragment.append(document.createTextNode(value.slice(last, start)));
          const button = document.createElement('button');
          button.type = 'button';
          button.className = item.entity ? 'entity-note' : 'vw';
          button.dataset[item.entity ? 'entity' : 'word'] = item.key;
          button.textContent = label;
          button.setAttribute('aria-label', label + ' の意味を見る');
          fragment.append(button);
          last = start + label.length;
          found = true;
        }
        if (found) {
          fragment.append(document.createTextNode(value.slice(last)));
          node.replaceWith(fragment);
        }
      });
    });

    // 語句の補足を表示する欄と背景を作り、ページに追加する。
    const backdrop = document.createElement('div');
    backdrop.className = 'vw-backdrop';
    const sheet = document.createElement('div');
    sheet.className = 'vw-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', '語句の意味');
    sheet.innerHTML = '<div class="vw-sheet-head"><span class="vw-word"></span><span class="vw-pos"></span><button class="vw-close" type="button" aria-label="閉じる">✕</button></div><div class="vw-meaning"></div><div class="vw-form-block"><div class="vw-bg-label">語の成り立ち・関連語</div><div class="vw-form"></div></div><div class="vw-bg-label vw-context-label">本文での使い方</div><div class="vw-bg"></div><div class="vw-depth-block"><div class="vw-bg-label">読み解きのポイント</div><div class="vw-depth"></div></div><div class="vw-source-block"><div class="vw-bg-label">本文の表現</div><div class="vw-source"></div></div>';
    document.body.append(backdrop, sheet);
    let opener = null;
    // 補足欄を閉じ、開くときに押したボタンへキーボードの選択位置を戻す。
    function close() {
      backdrop.classList.remove('open');
      sheet.classList.remove('open');
      if (opener) opener.focus();
    }
    // 押された単語を含む英文を探し、長い場合はその単語の前後だけを抜き出す。
    function sourceExcerpt(button, key) {
      const occurrence = button.closest('.source-sentence, .sent-en') ? button
        : [...document.querySelectorAll('.para-en .vw[data-word], .sent-en .vw[data-word]')].find(item => item.dataset.word === key);
      if (!occurrence) return '';
      const source = occurrence.closest('.source-sentence, .sent-en') || occurrence.closest('.para-en');
      if (!source) return '';
      const sentence = source.textContent.replace(/\s+/g, ' ').trim();
      if (sentence.length <= 200) return sentence;
      const at = sentence.toLowerCase().indexOf(occurrence.textContent.toLowerCase());
      if (at < 0) return sentence.slice(0, 190) + '…';
      let start = Math.max(0, at - 72);
      let end = Math.min(sentence.length, at + occurrence.textContent.length + 95);
      if (start) start = sentence.indexOf(' ', start) + 1 || start;
      if (end < sentence.length) end = sentence.lastIndexOf(' ', end) || end;
      return (start ? '…' : '') + sentence.slice(start, end).trim() + (end < sentence.length ? '…' : '');
    }
    // 押された単語や固有名詞に合わせて、意味・語の成り立ち・読解メモ・本文の抜粋を入れて欄を開く。
    document.addEventListener('click', event => {
      const button = event.target.closest('.vw, .entity-note');
      if (!button) return;
      const entity = button.dataset.entity;
      const data = entity ? entities[entity] : words[button.dataset.word];
      if (!data) return;
      opener = button;
      sheet.querySelector('.vw-word').textContent = button.textContent;
      sheet.querySelector('.vw-pos').textContent = entity ? data[0] : kind(button.dataset.word);
      sheet.querySelector('.vw-meaning').textContent = entity ? data[1] : data[0];
      sheet.querySelector('.vw-form-block').hidden = !!entity;
      sheet.querySelector('.vw-form').textContent = entity ? '' : ENGLISH_1A_FORM[session][button.dataset.word];
      sheet.querySelector('.vw-bg').textContent = entity ? data[2] : data[1];
      sheet.querySelector('.vw-context-label').textContent = entity ? '背景・読解メモ' : '本文での使い方';
      const depth = entity ? '' : ENGLISH_1A_DEPTH[session][button.dataset.word] || '';
      sheet.querySelector('.vw-depth-block').hidden = !depth;
      sheet.querySelector('.vw-depth').textContent = depth;
      const excerpt = entity ? '' : sourceExcerpt(button, button.dataset.word);
      sheet.querySelector('.vw-source-block').hidden = !excerpt;
      sheet.querySelector('.vw-source').textContent = excerpt;
      backdrop.classList.add('open');
      sheet.classList.add('open');
      sheet.querySelector('.vw-close').focus();
    });
    backdrop.addEventListener('click', close);
    sheet.querySelector('.vw-close').addEventListener('click', close);
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && sheet.classList.contains('open')) close(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
