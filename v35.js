if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['v35'] = '3.5.0';
/* Do it v3.5 - jam di top bar (desktop) dan perapian biaya admin transfer lama. */
(function () {
  'use strict';
  var X = window.DoIt; if (!X || !X.C) return;
  var S = X.S, I = window.I18N, t = X.t, esc = X.esc, A = X.A;
  I.add('id', {'v35.fee.t': 'Biaya admin transfer lama', 'v35.fee.s': '{0} transfer punya biaya admin yang belum tercatat sebagai transaksi sendiri. Tekan tombol di bawah agar tiap biaya menjadi transaksi Pengeluaran "Biaya admin transfer" dari dompet asal.', 'v35.fee.go': 'Catat biaya yang tertinggal', 'v35.fee.busy': 'Memproses...', 'v35.fee.ok': '{0} biaya admin dicatat'});
  I.add('en', {'v35.fee.t': 'Older transfer fees', 'v35.fee.s': '{0} transfers have an admin fee that is not yet its own transaction. Tap below to turn each into an Expense "Biaya admin transfer" from the source wallet.', 'v35.fee.go': 'Record missing fees', 'v35.fee.busy': 'Working...', 'v35.fee.ok': '{0} fees recorded'});

  // ---------------------------------------------------------------- jam
  function clockText() {
    var en = S.pref && S.pref.lang === 'en', d = new Date(), loc = en ? 'en-GB' : 'id-ID', p2 = function (n) { return String(n).padStart(2, '0'); };
    var tg = d.toLocaleDateString(loc, {weekday: 'long'}) + ', ' + p2(d.getDate()) + ' ' + d.toLocaleDateString(loc, {month: 'short'}).replace('.', '') + ' ' + d.getFullYear();
    var jm = p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
    return {tg: tg, jm: jm};
  }
  function clockHTML() { var c = clockText(); return '<span class="clk" id="clk"><b>' + esc(c.jm) + '</b><small>' + esc(c.tg) + '</small></span>'; }
  function tick() {
    var e = document.getElementById('clk'); if (!e) return; var c = clockText();
    var b = e.querySelector('b'), s = e.querySelector('small'); if (b && b.textContent !== c.jm) b.textContent = c.jm; if (s && s.textContent !== c.tg) s.textContent = c.tg;
  }
  var prevTop = X.hooks.topExtra;
  X.hooks.topExtra = function () { return clockHTML() + (prevTop ? prevTop.apply(this, arguments) : ''); };
  setInterval(tick, 1000);

  // ---------------------------------------------------------------- biaya admin lama
  function legacyFees() {
    return Object.keys(S.tx).map(function (k) { return S.tx[k]; }).filter(function (x) {
      return x.Jenis === 'Transfer' && x.Status === 'Aktif' && !x._pending && +x.BiayaAdmin > 0 && !S.tx[x.ID + '-F'];
    });
  }
  var busy = false, msg = '';
  var prevSet = X.hooks.settingsTop;
  X.hooks.settingsTop = function () {
    var h = prevSet ? prevSet() : '', n = legacyFees().length;
    if (!n && !msg) return h;
    return h + '<div class="card"><div class="lbl3">' + t('v35.fee.t') + '</div>' + (n ? '<div class="muted sm">' + t('v35.fee.s', n) + '</div><div class="btnrow2" style="margin-top:10px"><button class="btn sm" data-act="v35-fee"' + (busy ? ' disabled' : '') + '>' + t(busy ? 'v35.fee.busy' : 'v35.fee.go') + '</button></div>' : '') +
      (msg ? '<div class="note" style="margin-top:8px">' + esc(msg) + '</div>' : '') + '</div>';
  };
  A['v35-fee'] = function () {
    if (busy) return; busy = true; msg = ''; X.render();
    var total = 0;
    (function loop(i) {
      X.api('feeMigrasi').then(function (r) {
        total += r.jumlah || 0;
        if (r.jumlah && r.sisa > 0 && i < 12) return loop(i + 1);
        busy = false; msg = t('v35.fee.ok', total); return X.syncNow().then ? X.syncNow() : null;
      }).then(function () { X.render(); }, function (e) { busy = false; msg = X.srvErr(e); X.render(); });
    })(0);
  };
})();
