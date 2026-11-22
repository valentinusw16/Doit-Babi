if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['struk'] = '3.5.0';
/* Do it v3.5 - Pecah struk (satu struk, beberapa kategori) dan foto struk ke Google Drive pemilik server.
   Pecah struk = beberapa transaksi Pengeluaran dengan ID <dasar>-S1, -S2, ... dan Referensi = <dasar>.
   Foto dikecilkan di HP lalu dikirim lewat antrean (aksi strukUnggah), disimpan di folder Drive "Do it - Struk". */
(function () {
  'use strict';
  var X = window.DoIt; if (!X || !X.C) return;
  var S = X.S, C = X.C, I = window.I18N, t = X.t, esc = X.esc, A = X.A, $ = X.$, ICON = X.ICON, rc = X.rc;
  I.add('id', {'st.photo': 'Foto struk', 'st.pick': 'Ambil / pilih foto', 'st.change': 'Ganti foto', 'st.rm': 'Hapus foto', 'st.split': 'Pecah struk', 'st.split.h': 'Satu struk, beberapa kategori', 'st.total': 'Total struk', 'st.total.h': 'Isi bila ingin dicek cocok dengan struk',
    'st.line': 'Rincian {0}', 'st.add': 'Tambah baris', 'st.sum': 'Jumlah rincian', 'st.left': 'Selisih', 'st.err.min': 'Isi minimal 2 baris lengkap (kategori dan jumlah)', 'st.err.tot': 'Jumlah rincian harus sama dengan total struk (selisih {0})', 'st.save': 'Simpan {0} transaksi',
    'st.saved': '{0} transaksi dari satu struk tersimpan', 'st.view': 'Lihat foto struk di Drive', 'st.attach': 'Lampirkan foto struk', 'st.wait': 'Foto struk menunggu dikirim', 'st.err.img': 'Foto tidak bisa dibaca', 'st.part': 'Bagian dari satu struk', 'q.struk': 'Foto struk', 'st.item': 'Barang (opsional)', 'st.note.drive': 'Foto disimpan di Google Drive pemilik server, folder "Do it - Struk".'});
  I.add('en', {'st.photo': 'Receipt photo', 'st.pick': 'Take / choose photo', 'st.change': 'Change photo', 'st.rm': 'Remove photo', 'st.split': 'Split receipt', 'st.split.h': 'One receipt, several categories', 'st.total': 'Receipt total', 'st.total.h': 'Fill in to check it matches the receipt',
    'st.line': 'Line {0}', 'st.add': 'Add line', 'st.sum': 'Lines total', 'st.left': 'Difference', 'st.err.min': 'Fill at least 2 complete lines (category and amount)', 'st.err.tot': 'The lines must add up to the receipt total (off by {0})', 'st.save': 'Save {0} transactions',
    'st.saved': '{0} transactions from one receipt saved', 'st.view': 'View receipt photo in Drive', 'st.attach': 'Attach receipt photo', 'st.wait': 'Receipt photo is waiting to upload', 'st.err.img': 'Could not read the photo', 'st.part': 'Part of one receipt', 'q.struk': 'Receipt photo', 'st.item': 'Item (optional)', 'st.note.drive': 'The photo is stored in the server owner\'s Google Drive, folder "Do it - Struk".'});

  // ---------------------------------------------------------------- foto
  var PH = null;   // {fid: id form, data: dataURL}
  function shrink(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('img')); };
      im.onload = function () {
        var out = '', mx = [1600, 1300, 1000, 800];
        for (var i = 0; i < mx.length; i++) {
          var k = Math.min(1, mx[i] / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(im.naturalWidth * k)); cv.height = Math.max(1, Math.round(im.naturalHeight * k));
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); out = cv.toDataURL('image/jpeg', 0.72);
          if (out.length <= 1600000) break;
        }
        URL.revokeObjectURL(u); /^data:image\/jpeg/.test(out) && out.length <= 2100000 ? res(out) : rej(new Error('big'));
      };
      im.src = u;
    });
  }
  function photoFor(x) {
    var ids = [x.ID]; if (x.Referensi && /-S\d+$/.test(x.ID)) Object.keys(S.tx).forEach(function (k) { if (S.tx[k].Referensi === x.Referensi) ids.push(k); });
    var hit = rc.list('struk').filter(function (r) { return ids.indexOf(r.tx) >= 0 && r.url; })[0];
    return hit || null;
  }
  function queuedFor(id) { return S.queue.filter(function (o) { return o.action === 'strukUnggah' && o.body && o.body.txId === id; })[0]; }
  function sendPhoto(txId, data) {
    S.queue = S.queue.filter(function (o) { return !(o.action === 'strukUnggah' && o.body && o.body.txId === txId); });
    X.enqueue({action: 'strukUnggah', body: {txId: txId, img: data}});
  }

  X.hooks.formExtra = function (f, fx) {
    if (fx.edit) return '';
    if (PH && PH.fid !== f.id) PH = null;
    var h = '<label class="lbl2">' + t('st.photo') + '</label><div class="stbar">' + (PH ? '<img class="stthumb" src="' + PH.data + '" alt="">' : '') +
      '<button class="btn sm" data-act="st-pick">' + ICON.plus + ' ' + t(PH ? 'st.change' : 'st.pick') + '</button>' + (PH ? '<button class="btn sm danger" data-act="st-rm">' + t('st.rm') + '</button>' : '') +
      (!fx.edit ? '<button class="btn sm" data-act="st-split">' + t('st.split') + '</button>' : '') + '</div><input type="file" id="file-st" accept="image/*" hidden>';
    return h;
  };
  document.addEventListener('change', function (e) {
    var el = e.target; if (!el || (el.id !== 'file-st' && el.id !== 'file-st2') || !el.files || !el.files[0]) return;
    var file = el.files[0], isDetail = el.id === 'file-st2'; el.value = '';
    shrink(file).then(function (data) {
      if (isDetail) { sendPhoto(DETAIL, data); X.touch(); X.openDetail(DETAIL); X.syncNow(); X.toast(t('st.wait')); }
      else { var F = X.getForm(); PH = {fid: F && F.id, data: data}; X.renderForm(); }
    }).catch(function () { X.toast(t('st.err.img')); });
  });
  var DETAIL = null;
  X.hooks.detailExtra = function (x) {
    DETAIL = x.ID; var ph = photoFor(x), q = queuedFor(x.ID), h = '<div style="margin-top:12px" class="stbar">';
    if (x.Jenis !== 'Expense' && x.Jenis !== 'Income') return '';
    if (ph) h += '<a class="btn sm" target="_blank" rel="noopener" href="' + esc(ph.url) + '">' + t('st.view') + '</a>';
    if (q) h += '<span class="muted sm">' + t('st.wait') + '</span>';
    if (x.Status === 'Aktif') h += '<button class="link" data-act="st-attach">' + t(ph ? 'st.change' : 'st.attach') + '</button><input type="file" id="file-st2" accept="image/*" hidden>';
    if (x.Referensi && /-S\d+$/.test(x.ID)) h += '<div class="muted sm" style="width:100%">' + t('st.part') + '</div>';
    return h + '</div>';
  };
  X.hooks.afterSave = (function (prev) { return function (x) {
    if (prev) prev(x);
    if (PH && PH.fid === x.ID) { sendPhoto(x.ID, PH.data); PH = null; X.syncNow(); }
  }; })(X.hooks.afterSave);

  // ---------------------------------------------------------------- pecah struk
  var PS = null;
  function katOptions(sel) {
    var groups = [], by = {};
    S.M.kategori.forEach(function (k) { if (k.Jenis !== 'Expense' || k.Kategori === X.NONOP_G) return; if (!by[k.Kategori]) { by[k.Kategori] = []; groups.push(k.Kategori); } by[k.Kategori].push(k); });
    return '<option value="">—</option>' + groups.map(function (g) { return '<optgroup label="' + esc(X.dn(g)) + '">' + by[g].map(function (k) { return '<option value="' + esc(k.KodeAkun) + '"' + (k.KodeAkun === sel ? ' selected' : '') + '>' + esc(X.dn(k.SubKategori)) + '</option>'; }).join('') + '</optgroup>'; }).join('');
  }
  function psSum() { return PS.lines.reduce(function (a, l) { return a + (Number(l.jumlah) > 0 ? Number(l.jumlah) : 0); }, 0); }
  function renderPS() {
    if (!PS) { $('#overlay2').innerHTML = ''; return; }
    var ok = PS.lines.filter(function (l) { return l.kode && Number(l.jumlah) > 0; }).length, sum = psSum(), tot = Number(PS.total) || 0;
    var h = '<div class="scrim" data-act="ps-close"></div><div class="sheet full"><div class="sheet-h"><div class="sh-t">' + t('st.split.h') + '</div><button class="x" data-act="ps-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div><div class="sheet-b">' +
      '<label class="lbl2">' + t('st.total') + ' <span class="muted sm">· ' + t('st.total.h') + '</span></label><input class="input" inputmode="numeric" data-ps="total" value="' + (PS.total ? esc(String(PS.total)) : '') + '" placeholder="Rp">' +
      PS.lines.map(function (l, i) {
        return '<div class="card psl"><div class="lbl3">' + t('st.line', i + 1) + (PS.lines.length > 2 ? '<button class="hb sm" style="float:right" data-act="ps-del" data-i="' + i + '" aria-label="' + t('delete') + '">' + ICON.x + '</button>' : '') + '</div>' +
          '<select class="input" data-ps="kode" data-i="' + i + '">' + katOptions(l.kode) + '</select>' +
          '<input class="input" inputmode="numeric" data-ps="jumlah" data-i="' + i + '" value="' + (l.jumlah ? esc(String(l.jumlah)) : '') + '" placeholder="Rp" style="margin-top:6px">' +
          '<input class="input" data-ps="barang" data-i="' + i + '" value="' + esc(l.barang || '') + '" placeholder="' + esc(t('st.item')) + '" style="margin-top:6px"></div>';
      }).join('') + '<button class="link" data-act="ps-add">+ ' + t('st.add') + '</button>' +
      '<div class="card"><dl class="kv"><dt>' + t('st.sum') + '</dt><dd>' + esc(C.fmtRp(sum)) + '</dd>' + (tot ? '<dt>' + t('st.left') + '</dt><dd class="' + (tot === sum ? 'in' : 'out') + '">' + esc(C.fmtRp(tot - sum)) + '</dd>' : '') + '</dl></div></div>' +
      '<div class="sheet-f">' + (PS.err ? '<div class="err">' + esc(PS.err) + '</div>' : '') + '<button class="btn primary" data-act="ps-save"' + (PS.busy ? ' disabled' : '') + '>' + t('st.save', Math.max(ok, 2)) + '</button></div></div>';
    $('#overlay2').innerHTML = h;
  }
  document.addEventListener('input', function (e) {
    var el = e.target; if (!PS || !el.dataset || !el.dataset.ps) return;
    var v = el.value, k = el.dataset.ps, i = +el.dataset.i;
    if (k === 'total') PS.total = v.replace(/[^\d]/g, ''); else if (k === 'jumlah') PS.lines[i].jumlah = v.replace(/[^\d]/g, ''); else if (k === 'barang') PS.lines[i].barang = v;
    if (k === 'total' || k === 'jumlah') { var card = document.querySelector('#overlay2 .kv'); if (card) { var sum = psSum(), tot = Number(PS.total) || 0; card.innerHTML = '<dt>' + t('st.sum') + '</dt><dd>' + esc(C.fmtRp(sum)) + '</dd>' + (tot ? '<dt>' + t('st.left') + '</dt><dd class="' + (tot === sum ? 'in' : 'out') + '">' + esc(C.fmtRp(tot - sum)) + '</dd>' : ''); } }
  });
  document.addEventListener('change', function (e) { var el = e.target; if (!PS || !el.dataset || el.dataset.ps !== 'kode') return; PS.lines[+el.dataset.i].kode = el.value; renderPS(); });
  function savePS() {
    var s = X.saveFormRaw(), F = s.F; if (!F) return;
    var lines = PS.lines.filter(function (l) { return l.kode && Number(l.jumlah) > 0; }), sum = psSum(), tot = Number(PS.total) || 0;
    if (lines.length < 2) { PS.err = t('st.err.min'); renderPS(); return; }
    if (tot && tot !== sum) { PS.err = t('st.err.tot', C.fmtRp(Math.abs(tot - sum))); renderPS(); return; }
    var base = C.newId(), made = [];
    try {
      if (!F.waktu) F.waktu = C.nowLocal();
      lines.forEach(function (l, i) {
        var f = Object.assign({}, F, {id: base + '-S' + (i + 1), kodeAkun: l.kode, jumlah: Number(l.jumlah), barang: l.barang || F.barang || '', referensi: base, jenis: 'Expense', subJenis: '', biayaAdmin: ''});
        var x = C.makeTx(f, S.cfg.user, S.M, S.tx, {}); x.Referensi = base; made.push({f: f, x: x});
      });
    } catch (e) { PS.err = X.L.tErr(e.message); renderPS(); return; }
    made.forEach(function (m) { m.x._pending = true; S.tx[m.x.ID] = m.x; X.enqueue({action: 'tambah', body: {tx: C.toPayload(m.f)}}); });
    if (PH && PH.fid === F.id) { sendPhoto(made[0].x.ID, PH.data); }
    PH = null; PS = null; renderPS(); X.closeForm(); X.touch(); X.render(); X.toast(t('st.saved', made.length)); X.syncNow();
  }
  Object.assign(A, {
    'st-pick': function () { var e = $('#file-st'); if (e) e.click(); },
    'st-rm': function () { PH = null; X.renderForm(); },
    'st-attach': function () { var e = $('#file-st2'); if (e) e.click(); },
    'st-split': function () { var F = X.getForm(); if (!F) return; PS = {total: F.jumlah > 0 ? String(F.jumlah) : '', err: '', busy: false, lines: [{kode: F.kodeAkun || '', jumlah: '', barang: ''}, {kode: '', jumlah: '', barang: ''}]}; renderPS(); },
    'ps-close': function () { PS = null; renderPS(); },
    'ps-add': function () { PS.lines.push({kode: '', jumlah: '', barang: ''}); renderPS(); },
    'ps-del': function (el) { PS.lines.splice(+el.dataset.i, 1); renderPS(); },
    'ps-save': savePS
  });
})();
