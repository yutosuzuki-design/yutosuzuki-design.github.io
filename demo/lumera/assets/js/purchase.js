/* 購入フォーム：金額表示／お支払い方法の切替／配送希望日の選択肢 */
(function () {
  var form = document.getElementById('purchase-form');
  if (!form) return;

  var UNIT_PRICE = 2980;  // 初回特別価格（おひとり様1個限りなので、数量は1で固定）

  function yen(n) { return n.toLocaleString('ja-JP') + '円'; }

  /* ---- 金額（1個分） ---- */
  document.querySelectorAll('[data-subtotal],[data-total]').forEach(function (el) { el.textContent = yen(UNIT_PRICE); });

  /* ---- お支払い方法の切替（カード入力欄はカード選択時のみ表示） ---- */
  var cardBody = document.getElementById('card-fields');
  function renderPayment() {
    var checked = form.querySelector('input[name="payment"]:checked');
    document.querySelectorAll('.pay-option').forEach(function (opt) {
      opt.classList.toggle('is-selected', opt.contains(checked));
    });
    var isCard = checked && checked.value === 'card';
    cardBody.hidden = !isCard;
    cardBody.querySelectorAll('input').forEach(function (el) { el.disabled = !isCard; });
  }
  form.querySelectorAll('input[name="payment"]').forEach(function (r) { r.addEventListener('change', renderPayment); });
  renderPayment();

  /* ---- 配送希望日：翌日〜14日後 ---- */
  var dateSelect = document.getElementById('delivery_date');
  var week = ['日', '月', '火', '水', '木', '金', '土'];
  var today = new Date();
  for (var i = 1; i <= 14; i++) {
    var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    var opt = document.createElement('option');
    opt.value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    opt.textContent = (d.getMonth() + 1) + '月' + d.getDate() + '日（' + week[d.getDay()] + '）';
    dateSelect.appendChild(opt);
  }

  /* ---- 未選択のセレクトはプレースホルダー色 ---- */
  function paintSelects() {
    form.querySelectorAll('select').forEach(function (sel) { sel.classList.toggle('is-empty', sel.value === ''); });
  }
  form.querySelectorAll('select').forEach(function (sel) { sel.addEventListener('change', paintSelects); });
  paintSelects();

  /* ---- カード番号・有効期限の入力補助（全角→半角、4桁ごとの区切り） ---- */
  var V = window.Validate;
  var cardNumber = document.getElementById('card_number');
  var cardExp = document.getElementById('card_exp');
  cardNumber.addEventListener('input', function () {
    var digits = V.toHalfWidth(cardNumber.value).replace(/\D/g, '').slice(0, 16);
    cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  });
  cardExp.addEventListener('input', function (e) {
    var digits = V.toHalfWidth(cardExp.value).replace(/\D/g, '').slice(0, 4);
    var deleting = e.inputType && e.inputType.indexOf('delete') === 0;
    cardExp.value = digits.length > 2 || (digits.length === 2 && !deleting) ? digits.slice(0, 2) + ' / ' + digits.slice(2) : digits;
  });
  ['tel', 'zip', 'card_cvc'].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener('blur', function () { el.value = V.toHalfWidth(el.value); });
  });

  /* ---- テスト用カード ---- */
  var TEST_CARD_OK = '4242424242424242';      // 決済成功
  var TEST_CARD_DECLINE = '4000000000000002'; // 決済失敗（決済エラー表示）
  function cardDigits() { return cardNumber.value.replace(/\D/g, ''); }

  /* ---- 入力チェックのルール ---- */
  var c = V.check;
  var rules = {
    name: [c.required('お名前を入力してください')],
    kana: [c.required('フリガナを入力してください'), c.pattern(/^[ァ-ヶー\s　]+$/, '全角カタカナで入力してください')],
    tel: [c.required('電話番号を入力してください'), c.pattern(/^0\d{9,10}$/, 'ハイフンなし・半角数字で入力してください')],
    email: [c.required('メールアドレスを入力してください'), c.email('メールアドレスの形式が正しくありません')],
    email_confirm: [c.required('確認用のメールアドレスを入力してください'), c.match('email', 'メールアドレスが一致しません')],
    zip: [c.required('郵便番号を入力してください'), c.pattern(/^\d{7}$/, 'ハイフンなし・半角数字（7桁）で入力してください')],
    pref: [c.required('選択してください')],
    addr1: [c.required('住所を入力してください')],
    addr2: [c.required('住所を入力してください')],
    card_number: [c.required('カード番号を入力してください'),
      c.custom(function () { var d = cardDigits(); return d === TEST_CARD_OK || d === TEST_CARD_DECLINE; }, 'カード番号を正しく入力してください')],
    card_exp: [c.required('有効期限を入力してください'), c.expiry('有効期限をご確認ください')],
    card_cvc: [c.required('セキュリティコードを入力してください'), c.pattern(/^\d{3,4}$/, 'セキュリティコードを正しく入力してください')],
    card_name: [c.required('カード名義を入力してください'), c.pattern(/^[A-Za-z][A-Za-z .'-]*$/, '半角ローマ字で入力してください')],
    agree_course: [c.required('ご確認・ご同意が必要です')],
    agree_terms: [c.required('ご確認・ご同意が必要です')]
  };

  var formAlert = document.getElementById('form-alert');
  var paymentAlert = document.getElementById('payment-alert');
  var success = document.getElementById('form-success');
  var submitBtn = form.querySelector('.btn-submit');
  var submitLabel = submitBtn.textContent;
  var isPaymentError = false;
  var isSubmitting = false;

  function showInputErrors(count, focus) {
    if (count > 0) V.showAlert(formAlert, '入力内容に誤りがあります（' + count + '件）', '赤くなっている項目をご確認ください。', focus);
    else V.hideAlert(formAlert);
  }

  function showPaymentError(focus) {
    isPaymentError = true;
    V.showAlert(formAlert, 'カードをご利用いただけませんでした', 'お支払い方法（3）をご確認ください', focus);
    paymentAlert.hidden = false;
  }

  function clearPaymentError() {
    if (!isPaymentError) return;
    isPaymentError = false;
    paymentAlert.hidden = true;
    V.hideAlert(formAlert);
  }

  var validator = V.create(form, rules, {
    onChange: function (count) { if (!isPaymentError) showInputErrors(count, false); }
  });

  /* カード情報・支払い方法を変えたら決済エラー表示を解除 */
  ['card_number', 'card_exp', 'card_cvc', 'card_name'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', clearPaymentError);
  });
  form.querySelectorAll('input[name="payment"]').forEach(function (r) {
    r.addEventListener('change', function () {
      clearPaymentError();
      if (validator.countErrors() > 0) showInputErrors(validator.countErrors(), false);
    });
  });

  /* ---- 送信（テスト決済：実際の課金・送信は行わない） ---- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (isSubmitting) return;
    clearPaymentError();
    V.hideAlert(success);

    var errors = validator.validateAll();
    if (errors.length) { showInputErrors(errors.length, true); return; }
    V.hideAlert(formAlert);

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = '処理中…';

    var payment = form.querySelector('input[name="payment"]:checked').value;
    window.setTimeout(function () {
      isSubmitting = false;
      submitBtn.classList.remove('is-loading');
      submitBtn.removeAttribute('aria-busy');
      if (payment === 'card' && cardDigits() === TEST_CARD_DECLINE) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
        showPaymentError(true);
        return;
      }
      submitBtn.textContent = 'ご注文を受け付けました';
      success.hidden = false;
      success.focus({ preventScroll: true });
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 900);
  });

  /* ---- 表示確認用：?state=input-error / payment-error ---- */
  function fill(values) {
    Object.keys(values).forEach(function (id) {
      var el = document.getElementById(id);
      if (el.type === 'checkbox') el.checked = values[id];
      else el.value = values[id];
    });
    paintSelects();
  }
  var state = V.getState();
  if (state === 'input-error') {
    fill({ name: '', kana: 'やまだ はなこ', tel: '090-1234-5678', email: 'hanako@example.com', email_confirm: 'hanako@exmple.com',
      zip: '9000000', pref: '', addr1: '', addr2: '1-2-3 ワイズマンション101' });
    var errs = validator.validateAll();
    ['card_number', 'card_exp', 'card_cvc', 'card_name'].forEach(function (id) { validator.setError(id, ''); });
    showInputErrors(errs.filter(function (id) { return id.indexOf('card_') !== 0; }).length, false);
  } else if (state === 'payment-error') {
    fill({ name: '山田 花子', kana: 'ヤマダ ハナコ', tel: '09012345678', email: 'hanako@example.com', email_confirm: 'hanako@example.com',
      zip: '9000000', pref: '沖縄県', addr1: '那覇市おもろまち', addr2: '1-2-3 ワイズマンション101',
      card_number: '4242 4242 4242 4241', card_exp: '01 / 24', card_cvc: '123', card_name: 'HANAKO YAMADA', agree_course: true, agree_terms: true });
    validator.validateAll();
    showPaymentError(false);
  }
})();
