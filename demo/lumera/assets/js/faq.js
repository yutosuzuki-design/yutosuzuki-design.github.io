/* FAQ：SPはアコーディオン（初期は1問目のみ開く）、PCは全回答を表示 */
(function () {
  var list = document.querySelector('[data-faq]');
  if (!list) return;
  var buttons = Array.prototype.slice.call(list.querySelectorAll('.faq-item__btn'));
  var mq = window.matchMedia('(min-width: 768px)');

  function setOpen(btn, open) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', String(open));
    if (panel) panel.hidden = !open;
  }

  function applyMode() {
    buttons.forEach(function (btn, i) {
      if (mq.matches) {
        setOpen(btn, true);
        btn.setAttribute('aria-disabled', 'true');
      } else {
        btn.removeAttribute('aria-disabled');
        setOpen(btn, i === 0);
      }
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (mq.matches) return;
      setOpen(btn, btn.getAttribute('aria-expanded') !== 'true');
    });
  });

  if (mq.addEventListener) mq.addEventListener('change', applyMode);
  else mq.addListener(applyMode);
  applyMode();
})();
