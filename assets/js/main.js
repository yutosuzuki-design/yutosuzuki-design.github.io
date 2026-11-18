/* =========================================================
   鈴木優斗 ポートフォリオ：動きは2つだけ
   1. 作品名にマウスを乗せると、ページの色がその作品の色に変わる
   2. メールアドレスをコピーするボタン
   ========================================================= */

/* ---------- 1. 作品の色に切り替える ---------- */
(function () {
  var items = document.querySelectorAll('.index__item');
  var preview = document.querySelector('.index__preview img');
  var root = document.documentElement;
  // マウスで操作できる端末だけで動かす（スマホでは一覧に小さな画像を出す）
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!items.length || !preview || !canHover) return;

  // 切り替えでちらつかないよう、カバー画像を先に読み込んでおく
  items.forEach(function (item) { new Image().src = item.dataset.img; });

  function activate(item) {
    items.forEach(function (i) { i.classList.toggle('is-active', i === item); });
    root.style.setProperty('--theme-bg', item.dataset.bg);
    root.style.setProperty('--theme-fg', item.dataset.fg);
    if (preview.getAttribute('src') !== item.dataset.img) {
      preview.classList.add('is-changing');           // いったん消して
      setTimeout(function () {
        preview.src = item.dataset.img;               // 画像を入れ替え
        preview.classList.remove('is-changing');      // 表示し直す
      }, 150);
    }
  }

  function reset() {
    items.forEach(function (i) { i.classList.remove('is-active'); });
    root.style.removeProperty('--theme-bg');
    root.style.removeProperty('--theme-fg');
  }

  items.forEach(function (item) {
    item.addEventListener('mouseenter', function () { activate(item); });
    item.addEventListener('focus', function () { activate(item); }); // キーボード操作でも同じ動きにする
  });
  document.querySelector('.index').addEventListener('mouseleave', reset);
  document.querySelector('.index').addEventListener('focusout', function (e) {
    if (!e.currentTarget.contains(e.relatedTarget)) reset();
  });
})();

/* ---------- 2. メールアドレスをコピー ---------- */
(function () {
  var button = document.querySelector('[data-copy]');
  var status = document.querySelector('.contact__status');
  if (!button || !status) return;

  button.addEventListener('click', function () {
    var text = button.dataset.copy;
    if (!navigator.clipboard) { status.textContent = 'コピーできませんでした。アドレスを選択してコピーしてください'; return; }
    navigator.clipboard.writeText(text).then(function () {
      status.textContent = 'コピーしました';
      setTimeout(function () { status.textContent = ''; }, 3000);
    }, function () {
      status.textContent = 'コピーできませんでした。アドレスを選択してコピーしてください';
    });
  });
})();
