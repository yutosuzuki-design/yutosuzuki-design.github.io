/* お問い合わせフォーム：同意チェックで送信ボタンを有効化／入力チェック／送信（デモ） */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var V = window.Validate;
  var c = V.check;
  var agree = document.getElementById('agree_privacy');
  var submitBtn = form.querySelector('.btn-submit');
  var submitLabel = submitBtn.textContent;
  var note = document.getElementById('submit-note');
  var NOTE_DISABLED = '※ プライバシーポリシーに同意すると、送信できます';
  var NOTE_ENABLED = '通常、3営業日以内にメールでご返信いたします。';
  var formAlert = document.getElementById('form-alert');
  var success = document.getElementById('form-success');
  var isSubmitting = false;
  var isDone = false;

  /* ---- 同意チェック → ボタンの有効／無効 ---- */
  function renderAgree() {
    if (isDone) return;
    submitBtn.disabled = !agree.checked;
    note.textContent = agree.checked ? NOTE_ENABLED : NOTE_DISABLED;
  }
  agree.addEventListener('change', renderAgree);

  /* ---- 入力チェック ---- */
  var rules = {
    name: [c.required('お名前を入力してください')],
    email: [c.required('メールアドレスを入力してください'), c.email('メールアドレスの形式が正しくありません')],
    tel: [c.pattern(/^0\d{9,10}$/, 'ハイフンなし・半角数字で入力してください')],
    type: [c.required('選択してください')],
    order_no: [c.pattern(/^[A-Za-z0-9-]+$/, '半角英数字で入力してください')],
    message: [c.required('お問い合わせ内容を入力してください')],
    agree_privacy: [c.required('同意が必要です')]
  };
  function showInputErrors(count, focus) {
    if (count > 0) V.showAlert(formAlert, '入力内容に誤りがあります（' + count + '件）', '赤くなっている項目をご確認ください。', focus);
    else V.hideAlert(formAlert);
  }
  var validator = V.create(form, rules, { onChange: function (n) { showInputErrors(n, false); } });

  document.getElementById('tel').addEventListener('blur', function (e) { e.target.value = V.toHalfWidth(e.target.value); });

  var typeSelect = document.getElementById('type');
  function paintSelect() { typeSelect.classList.toggle('is-empty', typeSelect.value === ''); }
  typeSelect.addEventListener('change', paintSelect);

  /* ---- 送信（デモ：実際には送信しない） ---- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (isSubmitting || isDone || submitBtn.disabled) return;
    var errors = validator.validateAll();
    if (errors.length) { showInputErrors(errors.length, true); return; }
    V.hideAlert(formAlert);

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = '送信中…';
    window.setTimeout(function () {
      isSubmitting = false;
      isDone = true;
      submitBtn.classList.remove('is-loading');
      submitBtn.removeAttribute('aria-busy');
      submitBtn.textContent = '送信しました';
      success.hidden = false;
      success.focus({ preventScroll: true });
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 900);
  });

  /* ---- 表示確認用：?state=input-error / disabled ---- */
  if (V.getState() === 'input-error') {
    document.getElementById('email').value = 'hanako@';
    document.getElementById('tel').value = '09012345678';
    agree.checked = true;
    var errs = validator.validateAll();
    showInputErrors(errs.length, false);
  }

  paintSelect();
  renderAgree();
})();
