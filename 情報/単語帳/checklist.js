// 情報の単語帳で、チェック状態の保存・表示の絞り込み・チェック済み件数の表示を行う。
(function () {
  'use strict';
  var STORAGE_KEY = 'info-tango-checklist-v1';

  // このブラウザに保存された単語のチェック状態を読み、読めなければ空の状態を返す。
  function loadState() {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  // 現在の単語のチェック状態を、このブラウザに保存する。
  function saveState(state) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // 単語一覧を読み、保存されたチェックを復元して、絞り込みと解除ボタンを使えるようにする。
  function init() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.word-item'));
    if (!items.length) return;

    var state = loadState();
    var toolbar = document.querySelector('.word-toolbar');
    var progressFill = toolbar ? toolbar.querySelector('.wp-fill') : null;
    var progressText = toolbar ? toolbar.querySelector('.wp-text') : null;
    var currentFilter = 'all';

    // チェック済みの単語を数え、件数の文字と割合を示すバーを更新する。
    function updateProgress() {
      var total = items.length;
      var checked = items.filter(function (it) { return it.classList.contains('is-checked'); }).length;
      if (progressText) progressText.textContent = 'チェック済み ' + checked + ' / ' + total;
      if (progressFill) progressFill.style.width = (total ? Math.round((checked / total) * 100) : 0) + '%';
    }

    // 選ばれた「すべて・チェック済み・未チェック」の条件に合う単語だけを表示する。
    function applyFilter() {
      items.forEach(function (it) {
        var checked = it.classList.contains('is-checked');
        var show = currentFilter === 'all' ||
          (currentFilter === 'checked' && checked) ||
          (currentFilter === 'unchecked' && !checked);
        it.classList.toggle('is-hidden', !show);
      });
    }

    // 保存済みのチェックを各単語に戻し、変更されるたびに保存・件数・絞り込みを更新する。
    items.forEach(function (item) {
      var id = item.getAttribute('data-term-id');
      var checkbox = item.querySelector('.term-checkbox');
      if (!id || !checkbox) return;
      if (state[id]) {
        checkbox.checked = true;
        item.classList.add('is-checked');
      }
      checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
          state[id] = true;
          item.classList.add('is-checked');
        } else {
          delete state[id];
          item.classList.remove('is-checked');
        }
        saveState(state);
        updateProgress();
        applyFilter();
      });
    });

    // 絞り込みボタンと全解除ボタンを、クリックしたときに働くようにする。
    if (toolbar) {
      var filterBtns = Array.prototype.slice.call(toolbar.querySelectorAll('.word-filter-btn'));
      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          currentFilter = btn.getAttribute('data-filter') || 'all';
          filterBtns.forEach(function (b) { b.classList.toggle('active', b === btn); });
          applyFilter();
        });
      });
      var resetBtn = toolbar.querySelector('.word-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          if (!window.confirm('このページのチェックをすべて解除しますか？')) return;
          items.forEach(function (item) {
            var id = item.getAttribute('data-term-id');
            var checkbox = item.querySelector('.term-checkbox');
            if (id) delete state[id];
            if (checkbox) checkbox.checked = false;
            item.classList.remove('is-checked');
          });
          saveState(state);
          updateProgress();
          applyFilter();
        });
      }
    }

    updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
