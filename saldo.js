if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['saldo'] = '3.4.0';
/* Do it v3.4 - Edit saldo + Rekonsiliasi. Isi saldo sebenarnya; selisih dicatat otomatis sebagai Selisih Lebih/Kurang Saldo (Adjust Gain/Loss).
   Saldo awal hanya dipakai saat akun baru dibuat. */
(function () {
  'use strict';
  var X = window.DoIt; if (!X) return;
  var C = X.C, S = X.S, I = window.I18N, esc = X.esc, t = X.t;
  I.add('id', {'pg.opening': 'Edit saldo', 'home.empty.assets': 'Belum ada saldo. Buat akun lewat Menu, lalu isi saldonya lewat Edit saldo.', 'sd.title': 'Edit saldo', 'sd.one': 'Satu akun', 'sd.all': 'Rekonsiliasi', 'sd.acc': 'Akun', 'sd.app': 'Saldo di aplikasi', 'sd.real': 'Saldo sebenarnya', 'sd.date': 'Tanggal penyesuaian',
      'sd.diff': 'Selisih', 'sd.save': 'Simpan penyesuaian', 'sd.none': 'Tidak ada selisih untuk dicatat', 'sd.done': '{0} penyesuaian dicatat', 'sd.note': 'Selisih dicatat otomatis sebagai Selisih Lebih/Kurang Saldo. Bisa dikoreksi lewat Catat. Kolom boleh diisi hitungan, mis. 100.000+12.500.',
      'sd.memo': 'Edit saldo: aplikasi {0}, sebenarnya {1}', 'sd.nokat': 'Kategori Selisih Saldo belum ada di daftar kategori', 'sd.empty': 'Belum ada akun milikmu', 'sd.allnote': 'Isi saldo sebenarnya di akun yang mau disesuaikan. Yang dikosongkan dilewati.', 'sd.close': 'Tutup', 'sd.minus': 'kurang', 'sd.plus': 'lebih'});
  I.add('en', {'pg.opening': 'Edit balance', 'sd.title': 'Edit balance', 'sd.one': 'One account', 'sd.all': 'Reconcile', 'sd.acc': 'Account', 'sd.app': 'Balance in app', 'sd.real': 'Actual balance', 'sd.date': 'Adjustment date',
      'sd.diff': 'Difference', 'sd.save': 'Save adjustment', 'sd.none': 'No difference to record', 'sd.done': '{0} adjustment(s) recorded', 'sd.note': 'The difference is booked automatically as Balance Adjustment Gain/Loss. You can fix it from Add. Fields accept maths, e.g. 100,000+12,500.',
      'sd.memo': 'Balance edit: app {0}, actual {1}', 'sd.nokat': 'Balance adjustment category is missing', 'sd.empty': 'You have no accounts yet', 'sd.allnote': 'Fill in the actual balance of accounts to adjust. Blank ones are skipped.', 'sd.close': 'Close', 'sd.minus': 'short', 'sd.plus': 'over'});
  var SD = null;
  function fm(n) { return 'Rp ' + C.fmtNum(n); }
  function mine() {
    var bal = {}; C.walletBalances(X.getLines(), S.M, null).forEach(function (w) { bal[w.nama] = w.saldo; });
    return S.M.dompetAktif.filter(function (d) { return d.Pemilik === S.cfg.user; }).map(function (d) { return {nama: d.Nama, kode: d.KodeAkun, saldo: bal[d.Nama] || 0}; });
  }
  function kat(up) {
    var j = up ? 'Income' : 'Expense', sub = up ? 'Adjust Gain' : 'Adjust Loss';
    return S.M.kategori.filter(function (k) { return k.Jenis === j && k.SubKategori === sub; })[0] || S.M.kategori.filter(function (k) { return k.Jenis === j && k.Kategori === X.NONOP_G; })[0];
  }
  function field(id) { var el = document.getElementById(id); if (!el) return NaN; if (X.calc) X.calc.settle(el); var v = el.value.replace(/\s/g, ''); if (!v) return NaN; return Number(S.pref.lang === 'en' ? v.replace(/,/g, '') : v.replace(/\./g, '').replace(/,/g, '.')); }
  function when() { var el = document.getElementById('sd-date'), d = el && el.value || C.todayLocal(); return d === C.todayLocal() ? C.nowLocal() : d + 'T23:59'; }
  function post(w, real, waktu) {
    var diff = real - w.saldo; if (!diff) return 0;
    var k = kat(diff > 0); if (!k) throw new Error(t('sd.nokat'));
    var F = X.newForm({waktu: waktu, jenis: diff > 0 ? 'Income' : 'Expense', dompet: w.nama, kodeAkun: k.KodeAkun, jumlah: Math.abs(diff), catatan: t('sd.memo', fm(w.saldo), fm(real))});
    var x = C.makeTx(F, S.cfg.user, S.M, S.tx, {}); x._pending = true; S.tx[x.ID] = x;
    X.enqueue({action: 'tambah', body: {tx: C.toPayload(F)}}); return 1;
  }
  function render() {
    var ws = mine(), h;
    var tabs = '<div class="seg"><button class="' + (SD.mode === 'one' ? 'on' : '') + '" data-act="sd-tab" data-v="one">' + t('sd.one') + '</button><button class="' + (SD.mode === 'all' ? 'on' : '') + '" data-act="sd-tab" data-v="all">' + t('sd.all') + '</button></div>';
    if (!ws.length) h = '<p class="muted">' + t('sd.empty') + '</p>';
    else if (SD.mode === 'one') {
      var w = ws.filter(function (x) { return x.nama === SD.sel; })[0] || ws[0]; SD.sel = w.nama;
      h = '<label class="lbl2">' + t('sd.acc') + '</label><select class="input" id="sd-acc" data-act="sd-sel">' + ws.map(function (x) { return '<option' + (x.nama === w.nama ? ' selected' : '') + ' value="' + esc(x.nama) + '">' + esc(x.nama) + '</option>'; }).join('') + '</select>' +
        '<div class="card" style="margin:10px 0"><dl class="dl"><dt>' + t('sd.app') + '</dt><dd>' + esc(fm(w.saldo)) + '</dd></dl></div>' +
        '<label class="lbl2">' + t('sd.real') + '</label><input class="input" id="sd-real" inputmode="numeric" placeholder="Rp" autocomplete="off"><div id="sd-diff" class="calchint"></div>';
    } else {
      h = '<p class="muted" style="margin:2px 0 8px">' + t('sd.allnote') + '</p>' + ws.map(function (x, i) {
        return '<div class="sdrow"><div class="sdn"><b>' + esc(x.nama) + '</b><span class="muted">' + esc(fm(x.saldo)) + '</span></div><input class="input" id="sd-r' + i + '" data-i="' + i + '" inputmode="numeric" placeholder="Rp" autocomplete="off"></div>';
      }).join('');
    }
    h += '<label class="lbl2">' + t('sd.date') + '</label><input class="input" type="date" id="sd-date" value="' + (SD.date || C.todayLocal()) + '" max="' + C.todayLocal() + '"><div class="note" style="margin-top:10px">' + t('sd.note') + '</div>';
    $('#overlay2').innerHTML = '<div class="scrim" data-act="sd-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + t('sd.title') + '</div></div><div class="sheet-b">' + tabs + h + '</div><div class="sheet-f btnrow2"><button class="btn" data-act="sd-close">' + t('sd.close') + '</button><button class="btn primary" data-act="sd-save">' + t('sd.save') + '</button></div></div>';
    SD.ws = ws;
  }
  function $(s) { return document.querySelector(s); }
  function open() { X.closeOverlays && X.closeOverlays(); SD = {mode: 'one', sel: '', date: ''}; render(); }
  function diffHint() {
    var el = $('#sd-diff'); if (!el || !SD) return; var w = SD.ws.filter(function (x) { return x.nama === SD.sel; })[0], el2 = $('#sd-real');
    if (!w || !el2 || el2.dataset.calc || !el2.value) { el.textContent = ''; return; }
    var v = field('sd-real'); if (!isFinite(v)) { el.textContent = ''; return; } var d = v - w.saldo;
    el.textContent = d ? t('sd.diff') + ': ' + (d > 0 ? '+' : '−') + fm(Math.abs(d)) + ' (' + t(d > 0 ? 'sd.plus' : 'sd.minus') + ')' : t('sd.none');
  }
  document.addEventListener('input', function (e) { if (SD && e.target.id === 'sd-real') diffHint(); });
  document.addEventListener('change', function (e) {
    if (!SD) return; if (e.target.id === 'sd-real') diffHint(); if (e.target.id === 'sd-date') SD.date = e.target.value;
    if (e.target.id === 'sd-acc') { SD.sel = e.target.value; SD.date = ($('#sd-date') || {}).value || ''; render(); }
  });
  X.A['saldo-awal'] = open; X.A['sd-open'] = open;
  X.A['sd-close'] = function () { SD = null; $('#overlay2').innerHTML = ''; };
  X.A['sd-tab'] = function (el) { SD.date = ($('#sd-date') || {}).value || ''; SD.mode = el.dataset.v; render(); };
  X.A['sd-sel'] = function () { /* ditangani oleh change */ };
  X.A['sd-save'] = function () {
    if (!SD) return; var n = 0, waktu = when();
    try {
      if (SD.mode === 'one') { var w = SD.ws.filter(function (x) { return x.nama === SD.sel; })[0], v = field('sd-real'); if (w && isFinite(v) && v >= 0) n += post(w, v, waktu); }
      else SD.ws.forEach(function (w, i) { var v = field('sd-r' + i); if (isFinite(v) && v >= 0) n += post(w, v, waktu); });
    } catch (err) { X.toast(X.L && X.L.tErr ? X.L.tErr(err.message) : err.message); return; }
    if (!n) { X.toast(t('sd.none')); return; }
    SD = null; $('#overlay2').innerHTML = ''; X.touch(); X.render(); X.toast(t('sd.done', n)); X.syncNow();
  };
  X.saldo = {open: open};

  // ================= Kupon dan bunga obligasi (SBN / deposito) =================
  I.add('id', {'kp.btn': 'Catat kupon/bunga', 'kp.title': 'Catat kupon/bunga', 'kp.amt': 'Jumlah diterima (setelah pajak)', 'kp.to': 'Masuk ke akun', 'kp.date': 'Tanggal diterima', 'kp.cat': 'Dicatat sebagai Pendapatan: Kupon dan Bunga Obligasi', 'kp.save': 'Catat pendapatan', 'kp.done': 'Kupon/bunga dicatat', 'kp.memo': 'Kupon/bunga {0}', 'kp.err.amt': 'Isi jumlah yang diterima', 'kp.mk': 'Menyiapkan kategori…', 'kp.hint': 'Perkiraan bunga berjalan {0}'});
  I.add('en', {'kp.btn': 'Record coupon/interest', 'kp.title': 'Record coupon/interest', 'kp.amt': 'Amount received (after tax)', 'kp.to': 'Paid into', 'kp.date': 'Date received', 'kp.cat': 'Booked as Income: Bond Coupon and Interest', 'kp.save': 'Record income', 'kp.done': 'Coupon/interest recorded', 'kp.memo': 'Coupon/interest {0}', 'kp.err.amt': 'Enter the amount received', 'kp.mk': 'Preparing category…', 'kp.hint': 'Estimated accrued interest {0}'});
  var KP = null, KP_NAME = 'Kupon dan Bunga Obligasi';
  function kupKat() { return S.M.kategori.filter(function (k) { return k.Jenis === 'Income' && /kupon/i.test(k.SubKategori); })[0]; }
  function kupOpen(nama, est) {
    X.closeOverlays && X.closeOverlays(); KP = {nama: nama, est: est || 0, busy: false, err: ''}; kupRender();
  }
  function kupRender() {
    var ws = mine().filter(function (w) { return true; }), last = S.prefs.lastDompet && S.prefs.lastDompet.Income;
    var sel = KP.to || (ws.filter(function (w) { return w.nama === last; })[0] || ws[0] || {}).nama;
    $('#overlay2').innerHTML = '<div class="scrim" data-act="kp-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + t('kp.title') + ' · ' + esc(KP.nama) + '</div></div><div class="sheet-b">' +
      (KP.est ? '<div class="note" style="margin:0 0 8px">' + t('kp.hint', fm(KP.est)) + '</div>' : '') +
      '<label class="lbl2">' + t('kp.amt') + '</label><input class="input" id="kp-amt" inputmode="numeric" placeholder="Rp" autocomplete="off" value="' + (KP.est ? C.fmtNum(KP.est) : '') + '">' +
      '<label class="lbl2">' + t('kp.to') + '</label><select class="input" id="kp-to">' + ws.map(function (w) { return '<option value="' + esc(w.nama) + '"' + (w.nama === sel ? ' selected' : '') + '>' + esc(w.nama) + '</option>'; }).join('') + '</select>' +
      '<label class="lbl2">' + t('kp.date') + '</label><input class="input" type="date" id="kp-date" value="' + C.todayLocal() + '" max="' + C.todayLocal() + '"><div class="note" style="margin-top:10px">' + t('kp.cat') + '</div></div>' +
      '<div class="sheet-f">' + (KP.err ? '<div class="err">' + esc(KP.err) + '</div>' : '') + '<button class="btn primary" data-act="kp-save"' + (KP.busy ? ' disabled' : '') + '>' + (KP.busy ? t('kp.mk') : t('kp.save')) + '</button></div></div>';
  }
  function kupPost(kode) {
    var v = field('kp-amt'), to = $('#kp-to').value, d = $('#kp-date').value || C.todayLocal();
    if (!(v > 0)) { KP.err = t('kp.err.amt'); KP.busy = false; kupRender(); return; }
    var F = X.newForm({waktu: d === C.todayLocal() ? C.nowLocal() : d + 'T12:00', jenis: 'Income', dompet: to, kodeAkun: kode, jumlah: v, catatan: t('kp.memo', KP.nama), toko: KP.nama});
    try {
      var x = C.makeTx(F, S.cfg.user, S.M, S.tx, {}); x._pending = true; S.tx[x.ID] = x;
      X.enqueue({action: 'tambah', body: {tx: C.toPayload(F)}});
    } catch (e) { KP.err = X.L && X.L.tErr ? X.L.tErr(e.message) : e.message; KP.busy = false; kupRender(); return; }
    KP = null; $('#overlay2').innerHTML = ''; X.touch(); X.render(); X.toast(t('kp.done')); X.syncNow();
  }
  X.A['kp-close'] = function () { KP = null; $('#overlay2').innerHTML = ''; };
  X.A['kp-save'] = function () {
    if (!KP || KP.busy) return; var k = kupKat();
    if (k) { kupPost(k.KodeAkun); return; }
    var inv = S.M.kategori.filter(function (c) { return c.Jenis === 'Income' && /bunga|dividen|investasi/i.test(c.SubKategori + ' ' + c.Kategori); })[0], parent = inv ? inv.Kategori : (S.M.kategori.filter(function (c) { return c.Jenis === 'Income'; })[0] || {}).Kategori;
    if (!parent) { KP.err = t('sd.nokat'); kupRender(); return; }
    KP.busy = true; KP.err = ''; var a = $('#kp-amt'), keepAmt = a && a.value, keepTo = $('#kp-to') && $('#kp-to').value; KP.to = keepTo; kupRender(); if ($('#kp-amt')) $('#kp-amt').value = keepAmt;
    X.api('kategoriBaru', {jenis: 'Income', kategori: parent, sub: KP_NAME}).then(function (r) {
      X.waitMaster(function () { return S.M.katByKode[r.kode]; }, function () { KP.busy = false; kupPost(r.kode); });
    }).catch(function (e) { KP.busy = false; KP.err = X.srvErr(e); kupRender(); if ($('#kp-amt')) $('#kp-amt').value = keepAmt; });
  };
  X.kupon = {open: kupOpen};
})();
