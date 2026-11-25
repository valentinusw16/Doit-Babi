if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['ubah'] = '3.5.0';
/* Do it v3.5 - ubah nama dan pindah kategori: dompet, kategori (grup), subkategori. Perlu server v3.5.
   Ditolak bila masih ada antrean sinkron yang belum terkirim (nama lama masih dipakai antrean itu). */
(function () {
  'use strict';
  var X = window.DoIt; if (!X || !X.C) return;
  var S = X.S, I = window.I18N, t = X.t, esc = X.esc, A = X.A, $ = X.$, ICON = X.ICON;
  I.add('id', {'ub.ren': 'Ubah nama', 'ub.move': 'Pindah ke kategori', 'ub.name': 'Nama baru', 'ub.save': 'Simpan nama', 'ub.q': 'Masih ada {0} catatan yang belum terkirim. Tunggu sampai tersinkron dulu, lalu ubah nama.',
    'ub.note': 'Nama diubah di semua transaksi, jurnal, anggaran, dan rencana. HP lain memuat ulang datanya otomatis. Pastikan HP lain tidak punya catatan yang belum terkirim.', 'ub.sub': 'Atur subkategori', 'ub.grp': 'Ubah nama kategori', 'ub.wal': 'Ubah nama dompet', 'ub.ok': 'Tersimpan', 'ub.ico': 'Ubah ikon', 'ub.busy': 'Menyimpan...', 'ub.same': 'Nama belum berubah'});
  I.add('en', {'ub.ren': 'Rename', 'ub.move': 'Move to category', 'ub.name': 'New name', 'ub.save': 'Save name', 'ub.q': '{0} entries have not been sent yet. Wait until they sync, then rename.',
    'ub.note': 'The name changes in every transaction, journal line, budget and plan. Other phones reload their data automatically. Make sure other phones have no unsent entries.', 'ub.sub': 'Subcategory settings', 'ub.grp': 'Rename category', 'ub.wal': 'Rename wallet', 'ub.ok': 'Saved', 'ub.ico': 'Change icon', 'ub.busy': 'Saving...', 'ub.same': 'Name is unchanged'});
  var U = null;
  function render() {
    if (!U) { $('#overlay2').innerHTML = ''; return; }
    var h = '<div class="scrim" data-act="ub-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + esc(U.title) + '</div><button class="x" data-act="ub-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div><div class="sheet-b">' +
      '<label class="lbl2">' + t('ub.name') + '</label><input class="input" id="ub-nama" value="' + esc(U.nama) + '" autocomplete="off" maxlength="40">';
    if (U.kind === 'sub') {
      h += '<label class="lbl2">' + t('ub.move') + '</label><div class="chips">' + U.groups.map(function (g) { return '<button class="chip' + (g === U.kategori ? ' on' : '') + '" data-act="ub-move" data-v="' + esc(g) + '">' + esc(X.dn(g)) + '</button>'; }).join('') + '</div>' +
        (X.A['ik-open'] && U.ik ? '<div class="btnrow2" style="margin-top:12px"><button class="btn sm" data-act="ub-ico">' + t('ub.ico') + '</button></div>' : '');
    }
    if ((U.kind === 'sub' || U.kind === 'kategori') && X.v361) h += X.v361.trBlock(U.lama);
    h += '<div class="note">' + t('ub.note') + '</div></div><div class="sheet-f">' + (U.err ? '<div class="err">' + esc(U.err) + '</div>' : '') +
      '<button class="btn primary" data-act="ub-save"' + (U.busy ? ' disabled' : '') + '>' + t(U.busy ? 'ub.busy' : 'ub.save') + '</button></div></div>';
    $('#overlay2').innerHTML = h;
  }
  function guard() { if (S.queue && S.queue.length) { U.err = t('ub.q', S.queue.length); render(); return false; } return true; }
  function call(req, okMsg) {
    if (!guard()) return;
    U.busy = true; U.err = ''; render();
    X.api('ubahNama', req).then(function (r) {
      if (r.tetap) { U.busy = false; U.err = t('ub.same'); render(); return; }
      var lp = S.prefs && S.prefs.lastDompet; if (lp && req.kind === 'dompet') Object.keys(lp).forEach(function (k) { if (lp[k] === req.lama) lp[k] = req.baru; });
      return X.syncNow({full: true, master: true}).then(function () { U = null; render(); X.toast(okMsg || t('ub.ok')); X.render(); });
    }).catch(function (e) { U.busy = false; U.err = X.srvErr(e); render(); });
  }
  function open(o) { U = Object.assign({err: '', busy: false}, o); render(); var i = $('#ub-nama'); if (i) { i.focus(); i.select(); } }
  X.openUbah = open;
  document.addEventListener('input', function (e) { if (U && e.target && e.target.id === 'ub-nama') U.nama = e.target.value; });
  Object.assign(A, {
    'ub-close': function () { U = null; render(); },
    'ub-save': function () {
      var nama = X.C.clean(U.nama); if (nama.length < 2) { U.err = X.t('w.short'); render(); return; }
      if (U.kind === 'dompet') call({kind: 'dompet', lama: U.lama, baru: nama});
      else if (U.kind === 'kategori') call({kind: 'kategori', jenis: U.jenis, lama: U.lama, baru: nama});
      else call({kind: 'sub', kode: U.kode, baru: nama});
    },
    'ub-move': function (el) { var g = el.dataset.v; if (g === U.kategori) return; call({kind: 'pindah', kode: U.kode, baru: g}); },
    'ub-ico': function () { var k = U.kode; U = null; render(); A['ik-open']({dataset: {k: k}}); },
    'ub-grp': function (el) { open({kind: 'kategori', title: t('ub.grp'), jenis: S.katJenis, lama: el.dataset.g, nama: el.dataset.g}); },
    'ub-wal': function (el) { open({kind: 'dompet', title: t('ub.wal'), lama: el.dataset.n, nama: el.dataset.n}); }
  });
  var origIk = A['ik-open'];
  A['ik-open'] = function (el) {
    var kode = el.dataset.k, k = S.M.katByKode[kode]; if (!k) return origIk && origIk(el);
    var groups = []; S.M.kategori.forEach(function (x) { if (x.Jenis === k.Jenis && x.Kategori !== X.NONOP_G && groups.indexOf(x.Kategori) < 0) groups.push(x.Kategori); });
    open({kind: 'sub', title: t('ub.sub') + ' · ' + X.dn(k.SubKategori), kode: kode, lama: k.SubKategori, nama: k.SubKategori, kategori: k.Kategori, groups: groups, ik: true});
    A['ub-ico'] = function () { var kk = kode; U = null; render(); origIk({dataset: {k: kk}}); };
  };
  var prevAsset = X.hooks.assetTop;
  X.hooks.assetTop = function (kode, d, book) {
    var h = prevAsset ? prevAsset(kode, d, book) : '';
    if (d) h += '<div style="margin:0 0 10px"><button class="link" data-act="ub-wal" data-n="' + esc(d.Nama) + '">' + t('ub.ren') + '</button></div>';
    return h;
  };
})();
