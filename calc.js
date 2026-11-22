if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['calc'] = '3.4.0';
/* Do it v3.4 - kalkulator di semua kolom nominal: ketik 15.000+2.500*3 atau (50000-5000)/3, hasil muncul langsung dan menggantikan
   isian saat pindah kolom/Enter. Di HP muncul baris tombol ( ) + − × ÷ = di atas papan ketik. */
(function () {
  'use strict';
  var X = window.DoIt;
  if (!X || !X.exprEval || !X.C) return;
  var C = X.C, I = window.I18N, S = X.S;
  var SEL = 'input[inputmode="numeric"], input[inputmode="decimal"]';
  function isMoney(el) { return !!(el && el.matches && el.matches(SEL) && !(el.closest && el.closest('#pal'))); }
  function hasOp(v) { return /[+×÷*\/()xX−]|\d\s*-|\)\s*-/.test(v || ''); }
  function normalize(v, dec) {
    var en = S && S.pref && S.pref.lang === 'en'; v = String(v).replace(/\s+/g, '');
    if (dec) return v.replace(/,/g, '.');
    return en ? v.replace(/,/g, '') : v.replace(/\./g, '').replace(/,/g, '.');
  }
  function evalField(el) { var dec = el.getAttribute('inputmode') === 'decimal'; return X.exprEval(normalize(el.value, dec), dec); }
  function hint(el) {
    var h = el.nextElementSibling; if (h && h.classList && h.classList.contains('calchint')) return h;
    h = document.createElement('div'); h.className = 'calchint'; el.parentNode.insertBefore(h, el.nextSibling); return h;
  }
  function showHint(el) {
    var v = evalField(el), h = hint(el), dec = el.getAttribute('inputmode') === 'decimal';
    h.textContent = isFinite(v) && v >= 0 ? '= ' + (dec ? String(v).replace('.', S.pref.lang === 'en' ? '.' : ',') : C.fmtNum(v)) : '= ?';
    h.classList.toggle('bad', !(isFinite(v) && v >= 0));
  }
  function settle(el) {
    if (!el || !el.dataset || !el.dataset.calc) return;
    var v = evalField(el), h = el.nextElementSibling; if (h && h.classList && h.classList.contains('calchint')) h.remove();
    delete el.dataset.calc; if (!(isFinite(v) && v >= 0)) { el.value = ''; } else el.value = String(v).replace('.', el.getAttribute('inputmode') === 'decimal' && S.pref.lang !== 'en' ? ',' : '.');
    el.dispatchEvent(new Event('input', {bubbles: true}));
  }
  document.addEventListener('input', function (e) {
    var el = e.target; if (!isMoney(el)) return;
    if (el.value.indexOf('=') >= 0) { el.value = el.value.replace(/=/g, ''); if (el.dataset.calc) { settle(el); e.stopImmediatePropagation(); return; } }
    if (hasOp(el.value)) { el.dataset.calc = '1'; e.stopImmediatePropagation(); showHint(el); }
    else if (el.dataset.calc) { delete el.dataset.calc; var h = el.nextElementSibling; if (h && h.classList && h.classList.contains('calchint')) h.remove(); }
  }, true);
  document.addEventListener('focusout', function (e) { if (isMoney(e.target)) settle(e.target); }, true);
  document.addEventListener('change', function (e) { if (isMoney(e.target)) settle(e.target); }, true);
  document.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === 'Tab') && isMoney(e.target)) settle(e.target); }, true);
  X.calc = {settle: settle, isMoney: isMoney};

  // ---- baris operator di atas papan ketik (HP)
  var coarse = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches, bar = null, cur = null;
  if (!coarse) return;
  var KEYS = ['(', ')', '+', '−', '×', '÷', '='];
  function place() {
    if (!bar) return; var vv = window.visualViewport; bar.style.bottom = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) + 'px' : '0px';
  }
  function hideBar() { if (bar) { bar.remove(); bar = null; } cur = null; document.documentElement.classList.remove('calcon'); }
  function showBar(el) {
    cur = el; if (!bar) {
      bar = document.createElement('div'); bar.id = 'calcbar'; bar.setAttribute('aria-label', 'Kalkulator');
      bar.innerHTML = KEYS.map(function (k) { return '<button type="button" data-ck="' + k + '">' + k + '</button>'; }).join('');
      bar.addEventListener('pointerdown', function (ev) { ev.preventDefault(); });
      bar.addEventListener('click', function (ev) {
        var b = ev.target.closest('button'); if (!b || !cur) return; var k = b.dataset.ck;
        if (k === '=') { settle(cur); return; }
        var s = cur.selectionStart == null ? cur.value.length : cur.selectionStart, en = cur.selectionEnd == null ? s : cur.selectionEnd;
        cur.value = cur.value.slice(0, s) + k + cur.value.slice(en); try { cur.setSelectionRange(s + 1, s + 1); } catch (x) { /* abaikan */ }
        cur.dispatchEvent(new Event('input', {bubbles: true}));
      });
      document.body.appendChild(bar);
    }
    document.documentElement.classList.add('calcon'); place();
  }
  document.addEventListener('focusin', function (e) { if (isMoney(e.target)) showBar(e.target); else if (!(e.target.closest && e.target.closest('#calcbar'))) hideBar(); });
  document.addEventListener('focusout', function () { setTimeout(function () { if (!isMoney(document.activeElement)) hideBar(); }, 120); });
  if (window.visualViewport) { window.visualViewport.addEventListener('resize', place); window.visualViewport.addEventListener('scroll', place); }
})();
