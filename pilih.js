if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['pilih'] = '3.4.0';
/* Do it v3.4 - pilih banyak transaksi: tekan lama (HP) atau tombol Pilih (desktop) lalu ketuk baris. Aksi: pindah kategori, beri tag, batalkan, salin. */
(function () {
  'use strict';
  var X = window.DoIt; if (!X) return;
  var C = X.C, S = X.S, I = window.I18N, esc = X.esc, t = X.t;
  I.add('id', {'ps.btn': 'Pilih', 'ps.n': '{0} dipilih', 'ps.cat': 'Kategori', 'ps.tag': 'Tag', 'ps.cancel': 'Batalkan', 'ps.copy': 'Salin', 'ps.done': 'Selesai', 'ps.all': 'Semua', 'ps.cat.t': 'Pindah kategori', 'ps.tag.t': 'Beri tag', 'ps.tag.ph': 'Tag (pisahkan dengan koma)', 'ps.apply': 'Terapkan',
    'ps.mixed': 'Pilih transaksi dengan jenis yang sama (Masuk atau Keluar) untuk pindah kategori', 'ps.cancel.q': 'Batalkan {0} transaksi yang dipilih?', 'ps.yes': 'Ya, batalkan', 'ps.no': 'Tidak', 'ps.ok': '{0} transaksi diproses', 'ps.skip': '{0} dilewati (bukan milikmu atau tidak bisa diubah)', 'ps.copy.ok': '{0} transaksi disalin dengan waktu sekarang', 'ps.cat.pick': 'Kategori baru'});
  I.add('en', {'ps.btn': 'Select', 'ps.n': '{0} selected', 'ps.cat': 'Category', 'ps.tag': 'Tag', 'ps.cancel': 'Cancel', 'ps.copy': 'Copy', 'ps.done': 'Done', 'ps.all': 'All', 'ps.cat.t': 'Move category', 'ps.tag.t': 'Add tag', 'ps.tag.ph': 'Tag (comma separated)', 'ps.apply': 'Apply',
    'ps.mixed': 'Select transactions of the same type (Income or Expense) to change category', 'ps.cancel.q': 'Cancel {0} selected transactions?', 'ps.yes': 'Yes, cancel', 'ps.no': 'No', 'ps.ok': '{0} transaction(s) processed', 'ps.skip': '{0} skipped (not yours or cannot be changed)', 'ps.copy.ok': '{0} transaction(s) copied with the current time', 'ps.cat.pick': 'New category'});
  var SEL = {on: false, ids: {}}, mode = '', lp = null;
  function $(s) { return document.querySelector(s); }
  function count() { return Object.keys(SEL.ids).length; }
  function rowsOf() { return Array.prototype.slice.call(document.querySelectorAll('main [data-act="tx-open"][data-id]')); }
  function paint() {
    var m = $('main'); if (!m) return;
    rowsOf().forEach(function (r) {
      var on = !!SEL.ids[r.dataset.id]; r.classList.toggle('psel', on); r.classList.toggle('pmode', SEL.on);
      var cb = r.querySelector(':scope > .pcb'); if (SEL.on && !cb) { cb = document.createElement('i'); cb.className = 'pcb'; r.insertBefore(cb, r.firstChild); } else if (!SEL.on && cb) cb.remove();
    });
    var bt = $('.pbtn'); if (S.tab === 'transaksi' && !S.page) { if (!bt) { bt = document.createElement('button'); bt.className = 'pbtn'; bt.dataset.act = 'ps-toggle'; var hd = m.querySelector('.stick .txbar') || m.querySelector('.stick .ddrow'); if (hd) hd.appendChild(bt); else m.insertBefore(bt, m.firstChild); } bt.textContent = SEL.on ? t('ps.done') : t('ps.btn'); bt.classList.toggle('on', SEL.on); } else if (bt) bt.remove();
    bar();
  }
  function bar() {
    var b = $('#psbar');
    if (!SEL.on || mode) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('div'); b.id = 'psbar'; document.body.appendChild(b); }
    var n = count();
    b.innerHTML = '<b>' + t('ps.n', n) + '</b><button data-act="ps-all">' + t('ps.all') + '</button><button data-act="ps-cat"' + (n ? '' : ' disabled') + '>' + t('ps.cat') + '</button><button data-act="ps-tag"' + (n ? '' : ' disabled') + '>' + t('ps.tag') + '</button><button data-act="ps-copy"' + (n ? '' : ' disabled') + '>' + t('ps.copy') + '</button><button class="dng" data-act="ps-cancel"' + (n ? '' : ' disabled') + '>' + t('ps.cancel') + '</button><button data-act="ps-toggle" aria-label="' + t('ps.done') + '">✕</button>';
  }
  function exit() { SEL = {on: false, ids: {}}; mode = ''; var o = $('#overlay2'); if (o) o.innerHTML = ''; paint(); }
  function toggle(id) { if (SEL.ids[id]) delete SEL.ids[id]; else SEL.ids[id] = 1; if (!count() && lp === 'auto') { /* tetap di mode pilih */ } paint(); }
  var pend = null;
  function later() { if (pend) return; pend = setTimeout(function () { pend = null; if (SEL.on && (S.tab !== 'transaksi' || S.page)) SEL = {on: false, ids: {}}; paint(); }, 0); }
  function own(n) { return n.nodeType !== 1 || n.id === 'psbar' || (n.classList && (n.classList.contains('pbtn') || n.classList.contains('pcb'))); }
  var app = $('#app'); if (app) new MutationObserver(function (m) { if (m.some(function (r) { return !(Array.prototype.every.call(r.addedNodes, own) && Array.prototype.every.call(r.removedNodes, own)); })) later(); }).observe(app, {childList: true, subtree: true});
  // klik baris saat mode pilih
  document.addEventListener('click', function (e) {
    if (!SEL.on) return; var r = e.target.closest && e.target.closest('main [data-act="tx-open"][data-id]'); if (!r) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); toggle(r.dataset.id);
  }, true);
  // tekan lama (HP)
  var timer = null, sx = 0, sy = 0, fired = false;
  document.addEventListener('touchstart', function (e) {
    var r = e.target.closest && e.target.closest('main [data-act="tx-open"][data-id]'); if (!r || SEL.on) return; var p = e.touches[0]; sx = p.clientX; sy = p.clientY; fired = false;
    timer = setTimeout(function () { fired = true; SEL.on = true; SEL.ids[r.dataset.id] = 1; try { navigator.vibrate && navigator.vibrate(15); } catch (x) { /* abaikan */ } paint(); }, 480);
  }, {passive: true});
  document.addEventListener('touchmove', function (e) { var p = e.touches[0]; if (timer && (Math.abs(p.clientX - sx) > 8 || Math.abs(p.clientY - sy) > 8)) { clearTimeout(timer); timer = null; } }, {passive: true});
  ['touchend', 'touchcancel'].forEach(function (n) { document.addEventListener(n, function () { clearTimeout(timer); timer = null; }, {passive: true}); });
  document.addEventListener('click', function (e) { if (fired) { fired = false; e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); } }, true);
  document.addEventListener('contextmenu', function (e) { if (fired && e.target.closest && e.target.closest('main [data-act="tx-open"]')) e.preventDefault(); });

  function selTx() { return Object.keys(SEL.ids).map(function (id) { return S.tx[id]; }).filter(function (x) { return x && x.Status === 'Aktif' && !x._pendingBatal; }); }
  function editable(x) { return !(x.Jenis === 'Saldo awal') && !C.loanKind(x) && !C.isRepay(x) && x.DicatatOleh === S.cfg.user || (x.PemilikDompet === S.cfg.user && !C.loanKind(x) && !C.isRepay(x) && x.Jenis !== 'Saldo awal'); }
  function replace(x, patch) {
    var F = X.newForm(Object.assign(X.rowToForm(x), patch)), old = S.tx[x.ID];
    var nx = C.makeTx(F, S.cfg.user, S.M, S.tx, {ignoreId: x.ID});
    old.Status = 'Dibatalkan'; old._pendingBatal = true; nx._pending = true; S.tx[nx.ID] = nx;
    X.enqueue({action: 'koreksi', body: {id: x.ID, tx: C.toPayload(F)}});
  }
  function finish(n, skip, msg) { exit(); X.touch(); X.render(); X.toast((msg || t('ps.ok', n)) + (skip ? ' · ' + t('ps.skip', skip) : '')); X.syncNow(); }
  function sheet(title, body, foot) { $('#overlay2').innerHTML = '<div class="scrim" data-act="ps-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + title + '</div></div><div class="sheet-b">' + body + '</div><div class="sheet-f">' + foot + '</div></div>'; }
  var A = X.A;
  A['ps-toggle'] = function () { if (SEL.on) exit(); else { SEL.on = true; paint(); } };
  A['ps-all'] = function () { var all = rowsOf(), full = all.every(function (r) { return SEL.ids[r.dataset.id]; }); SEL.ids = {}; if (!full) all.forEach(function (r) { SEL.ids[r.dataset.id] = 1; }); paint(); };
  A['ps-close'] = function () { mode = ''; $('#overlay2').innerHTML = ''; paint(); };
  A['ps-cat'] = function () {
    var rows = selTx().filter(editable), js = {}; rows.forEach(function (x) { js[x.Jenis] = 1; }); var jn = Object.keys(js);
    if (jn.length !== 1 || (jn[0] !== 'Income' && jn[0] !== 'Expense')) { X.toast(t('ps.mixed')); return; }
    mode = 'cat'; bar();
    var groups = {}, order = []; S.M.kategori.filter(function (k) { return k.Jenis === jn[0]; }).forEach(function (k) { if (!groups[k.Kategori]) { groups[k.Kategori] = []; order.push(k.Kategori); } groups[k.Kategori].push(k); });
    sheet(t('ps.cat.t') + ' · ' + t('ps.n', rows.length), '<label class="lbl2">' + t('ps.cat.pick') + '</label><select class="input" id="ps-kat">' + order.map(function (g) { return '<optgroup label="' + esc(X.dn(g)) + '">' + groups[g].map(function (k) { return '<option value="' + esc(k.KodeAkun) + '">' + esc(X.dn(k.SubKategori)) + '</option>'; }).join('') + '</optgroup>'; }).join('') + '</select>', '<button class="btn primary" data-act="ps-cat-go">' + t('ps.apply') + '</button>');
  };
  A['ps-cat-go'] = function () {
    var kode = $('#ps-kat').value, n = 0, skip = count() - selTx().filter(editable).length;
    selTx().filter(editable).forEach(function (x) { try { if (x.KodeAkun !== kode) replace(x, {kodeAkun: kode}); n++; } catch (e) { skip++; } });
    finish(n, skip);
  };
  A['ps-tag'] = function () { mode = 'tag'; bar(); sheet(t('ps.tag.t') + ' · ' + t('ps.n', count()), '<label class="lbl2">' + t('ps.tag') + '</label><input class="input" id="ps-tagv" placeholder="' + esc(t('ps.tag.ph')) + '" autocomplete="off">', '<button class="btn primary" data-act="ps-tag-go">' + t('ps.apply') + '</button>'); };
  A['ps-tag-go'] = function () {
    var tag = C.clean($('#ps-tagv').value); if (!tag) return; var n = 0, skip = count() - selTx().filter(editable).length;
    selTx().filter(editable).forEach(function (x) { try { var cur = x.Tag ? String(x.Tag).split(/\s*,\s*/) : []; tag.split(/\s*,\s*/).forEach(function (g) { if (g && cur.indexOf(g) < 0) cur.push(g); }); replace(x, {tag: cur.join(', ')}); n++; } catch (e) { skip++; } });
    finish(n, skip);
  };
  A['ps-cancel'] = function () { mode = 'cancel'; bar(); sheet(t('ps.cancel'), '<p>' + esc(t('ps.cancel.q', count())) + '</p>', '<div class="btnrow2"><button class="btn" data-act="ps-close">' + t('ps.no') + '</button><button class="btn danger" data-act="ps-cancel-go">' + t('ps.yes') + '</button></div>'); };
  A['ps-cancel-go'] = function () {
    var n = 0, skip = 0;
    Object.keys(SEL.ids).forEach(function (id) {
      var x = S.tx[id]; if (!x || x.Status !== 'Aktif' || x._pendingBatal || !editable(x) || (C.loanKind(x) && Object.keys(S.tx).some(function (k) { var r = S.tx[k]; return r.Referensi === id && r.Status === 'Aktif' && C.isRepay(r); }))) { skip++; return; }
      var inQ = S.queue.filter(function (o) { return o.action === 'tambah' && o.body.tx.id === id && o.id !== S.inflight && !o.error; })[0];
      if (x._pending && inQ) { S.queue = S.queue.filter(function (o) { return o.id !== inQ.id; }); delete S.tx[id]; } else { x._pendingBatal = true; x.Status = 'Dibatalkan'; X.enqueue({action: 'batal', body: {id: id}}); }
      n++;
    });
    finish(n, skip);
  };
  A['ps-copy'] = function () {
    var n = 0, skip = 0, now = C.nowLocal();
    selTx().forEach(function (x) {
      if (x.Jenis === 'Saldo awal' || C.isRepay(x)) { skip++; return; }
      try { var F = X.newForm(Object.assign(X.rowToForm(x), {waktu: now, referensi: ''})); if (C.loanKind(x)) F.jatuhTempo = ''; var nx = C.makeTx(F, S.cfg.user, S.M, S.tx, {}); nx._pending = true; S.tx[nx.ID] = nx; X.enqueue({action: 'tambah', body: {tx: C.toPayload(F)}}); n++; } catch (e) { skip++; }
    });
    finish(n, skip, t('ps.copy.ok', n));
  };
  X.pilih = {isOn: function () { return SEL.on; }, exit: exit};
})();
