/* 入力チェック共通モジュール
   - 各フォーム（purchase.js / contact.js）から Validate.create(form, rules) で使う
   - ルールは「エラーなら文言、問題なければ空文字」を返す関数の配列 */
(function (global) {
  'use strict';

  function val(el) { return (el && el.value || '').trim(); }

  /* ---------- チェック関数（ファクトリ） ---------- */
  var check = {
    required: function (msg) {
      return function (el) {
        if (el.type === 'checkbox') return el.checked ? '' : msg;
        return val(el) ? '' : msg;
      };
    },
    pattern: function (re, msg) {
      return function (el) { var v = val(el); return v === '' || re.test(v) ? '' : msg; };
    },
    email: function (msg) {
      return check.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, msg);
    },
    match: function (otherId, msg) {
      return function (el) {
        var other = document.getElementById(otherId);
        return val(el) === '' || val(el) === val(other) ? '' : msg;
      };
    },
    /* MM / YY 形式、かつ今月以降 */
    expiry: function (msg) {
      return function (el) {
        var v = val(el).replace(/\s/g, '');
        if (v === '') return '';
        var m = v.match(/^(\d{2})\/(\d{2})$/);
        if (!m) return msg;
        var month = parseInt(m[1], 10), year = 2000 + parseInt(m[2], 10);
        if (month < 1 || month > 12) return msg;
        var now = new Date();
        var thisMonth = now.getFullYear() * 12 + now.getMonth();
        return year * 12 + (month - 1) >= thisMonth ? '' : msg;
      };
    },
    custom: function (fn, msg) {
      return function (el) { return val(el) === '' || fn(val(el), el) ? '' : msg; };
    }
  };

  /* ---------- 表示 ---------- */
  function wrapperOf(el) { return el.closest('[data-field]'); }

  function setError(el, msg) {
    var wrap = wrapperOf(el);
    var errEl = document.getElementById(el.id + '-error');
    if (!wrap || !errEl) return;
    wrap.classList.toggle('is-error', !!msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    errEl.textContent = msg || '';
    errEl.hidden = !msg;
  }

  /* ---------- バリデータ ---------- */
  function create(form, rules, options) {
    options = options || {};
    var touched = {};
    var submitted = false;

    function fieldEl(id) { return document.getElementById(id); }

    function isActive(el) { return el && !el.disabled; }

    function validateField(id) {
      var el = fieldEl(id);
      if (!isActive(el)) { setError(el, ''); return ''; }
      var list = rules[id] || [];
      for (var i = 0; i < list.length; i++) {
        var msg = list[i](el);
        if (msg) { setError(el, msg); return msg; }
      }
      setError(el, '');
      return '';
    }

    function validateAll() {
      var errors = [];
      Object.keys(rules).forEach(function (id) {
        if (validateField(id)) errors.push(id);
      });
      return errors;
    }

    function countErrors() {
      return Object.keys(rules).filter(function (id) {
        var el = fieldEl(id);
        return isActive(el) && el.getAttribute('aria-invalid') === 'true';
      }).length;
    }

    /* 入力中：一度触った項目・送信後は即時に再チェック */
    Object.keys(rules).forEach(function (id) {
      var el = fieldEl(id);
      if (!el) return;
      var evt = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'input';
      el.addEventListener('blur', function () {
        if (el.type !== 'checkbox' && val(el) !== '') touched[id] = true;
        if (touched[id] || submitted) { validateField(id); if (options.onChange) options.onChange(countErrors()); }
      });
      el.addEventListener(evt, function () {
        if (touched[id] || submitted) { validateField(id); if (options.onChange) options.onChange(countErrors()); }
      });
    });

    return {
      validateAll: function () { submitted = true; return validateAll(); },
      validateField: validateField,
      setError: function (id, msg) { setError(fieldEl(id), msg); },
      countErrors: countErrors,
      clearAll: function () { Object.keys(rules).forEach(function (id) { setError(fieldEl(id), ''); }); }
    };
  }

  /* ---------- バナー表示 ---------- */
  function showAlert(alertEl, title, text, focus) {
    if (!alertEl) return;
    var t = alertEl.querySelector('[data-alert-title]');
    var x = alertEl.querySelector('[data-alert-text]');
    if (t) t.textContent = title;
    if (x) x.textContent = text;
    alertEl.hidden = false;
    if (focus) {
      alertEl.focus({ preventScroll: true });
      alertEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  function hideAlert(alertEl) { if (alertEl) alertEl.hidden = true; }

  /* 全角英数字 → 半角 */
  function toHalfWidth(s) {
    return s.replace(/[０-９Ａ-Ｚａ-ｚ／]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); });
  }

  function getState() {
    try { return new URLSearchParams(location.search).get('state') || ''; } catch (e) { return ''; }
  }

  global.Validate = {
    check: check,
    create: create,
    showAlert: showAlert,
    hideAlert: hideAlert,
    toHalfWidth: toHalfWidth,
    getState: getState
  };
})(window);
