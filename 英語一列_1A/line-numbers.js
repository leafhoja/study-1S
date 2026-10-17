// 英文の原文行番号を表示・非表示に切り替えるボタンを作り、選択を保存する。
(function () {
  'use strict';
  // 行番号を持つ英文があるページに切替ボタンを追加し、保存された表示設定を反映する。
  function init() {
    var blocks = document.querySelectorAll('.sent-block[data-lines], .source-sentence[data-lines]');
    if (!blocks.length) return;
    var body = document.querySelector('.eng-body');
    if (!body) return;
    var button = document.createElement('button');
    button.className = 'line-toggle';
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    // 原文行番号の表示とボタンの文字を切り替え、その選択をブラウザに保存する。
    function setVisible(visible) {
      document.body.classList.toggle('show-source-lines', visible);
      button.setAttribute('aria-pressed', String(visible));
      button.textContent = visible ? '原文行番号を隠す' : '原文行番号を表示';
      try { localStorage.setItem('english1a-source-lines', visible ? '1' : '0'); } catch (e) {}
    }
    var lead = document.createElement('div');
    lead.className = 'line-controls';
    lead.appendChild(button);
    var hint = document.createElement('span');
    hint.textContent = '行番号は配布本文の印刷行に対応します。';
    lead.appendChild(hint);
    body.insertBefore(lead, body.firstChild);
    button.addEventListener('click', function () {
      setVisible(!document.body.classList.contains('show-source-lines'));
    });
    try { setVisible(localStorage.getItem('english1a-source-lines') === '1'); }
    catch (e) { setVisible(false); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
