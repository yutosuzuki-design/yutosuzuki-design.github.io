/* 共通 */
(function () {
  /* 無効リンク（aria-disabled）の遷移抑止 */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[aria-disabled="true"]');
    if (a) e.preventDefault();
  });

  /* iOS：16px未満の入力欄にフォーカスした際の自動ズームを防ぐ
     （iOS はこの指定があってもピンチ操作での拡大は可能） */
  var isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var viewport = document.querySelector('meta[name="viewport"]');
  if (isIOS && viewport && viewport.content.indexOf('maximum-scale') === -1) {
    viewport.setAttribute('content', viewport.content + ',maximum-scale=1');
  }
})();
