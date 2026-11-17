/* Do it v2.0 - Portofolio (lapisan analitik, TIDAK dicatat ke pembukuan). Data: sheet Rencana tipe 'aset' dan 'lot'. */
(function () {
  'use strict';
  var X = window.DoIt, S = X.S, C = X.C, C2 = X.C2, t = X.t, esc = X.esc, $ = X.$, ICON = X.ICON, A = X.A, rc = X.rc;
  var fm = function (n) { return C.fmtRp(n); };
  var KELAS = ['emas', 'saham', 'reksadana', 'sbn', 'deposito', 'kripto', 'lainnya'];
  var FIXED = {sbn: 1, deposito: 1};
  var PF = null, hist = {};
  function assets() { return rc.list('aset').filter(function (a) { return a.aktif !== false; }); }
  function lots() { return rc.list('lot'); }
  function sgn(n) { return (n > 0 ? '+' : '') + fm(n); }
  function cls(n) { return n > 0 ? 'in' : (n < 0 ? 'out' : ''); }
  function pctT(p) { return (p > 0 ? '+' : '') + (p * 100).toFixed(1).replace('.', S.pref.lang === 'en' ? '.' : ',') + '%'; }
  function view() { return C2.portfolio(assets(), lots(), C.todayLocal()); }

  function holdingRow(r) {
    var a = r.aset, fixed = C2.isFixed(a);
    return '<div class="row tap" data-act="po-open" data-id="' + esc(a.id) + '"><div class="ico">' + ICON.pie + '</div><div class="grow"><div class="t">' + esc(a.nama) + (r.aktif ? '' : '<span class="tag">' + t('po.closed') + '</span>') + '</div>' +
      '<div class="s">' + esc(fixed ? t('po.fixed.s', a.fix.bunga, a.fix.tempo ? C.fmtTgl(a.fix.tempo) : '-') : t('po.unit.s', r.unit, fm(a.harga || 0))) + '</div></div>' +
      '<div class="a">' + esc(fm(r.nilai)) + '<small class="' + cls(r.untung) + '">' + esc(r.modal ? sgn(r.untung) + ' · ' + pctT(r.pct || 0) : '') + '</small></div></div>';
  }
  function vPort() {
    var v = view(), T = v.total, h = '';
    h += '<div class="card hero"><div class="lbl">' + t('po.value') + '</div><div class="big">' + esc(fm(T.nilai)) + '</div><div class="sr" style="margin-top:6px"><span>' + esc(t('po.cost', fm(T.modal))) + '</span><b class="' + cls(T.untung) + '">' + esc(sgn(T.untung) + (T.modal ? ' (' + pctT(T.pct) + ')' : '')) + '</b></div>' +
      '<div class="sr"><span class="muted">' + t('po.realized') + '</span><b class="' + cls(T.realisasi) + '">' + esc(sgn(T.realisasi)) + '</b></div><div class="note">' + t('po.note') + '</div></div>';
    h += '<div class="btnrow"><button class="btn" data-act="po-new">' + ICON.plus + t('po.add') + '</button><button class="hb" data-act="po-share" aria-label="' + t('jpg.share') + '">' + ICON.share + '</button></div>';
    if (!v.rows.length) return h + '<div class="card"><div class="empty">' + t('po.empty') + '</div></div>';
    if (v.alokasi.length) {
      var gs = v.alokasi.map(function (a) { return {nama: t('po.k.' + a.kelas), total: a.nilai}; });
      h += '<div class="card"><div class="ch">' + t('po.alloc') + '</div><div class="donutrow">' + X.donut(gs, T.nilai, t('po.total')) + X.legend(gs, T.nilai) + '</div></div>';
    }
    var by = {}; v.rows.forEach(function (r) { (by[r.aset.kelas || 'lainnya'] = by[r.aset.kelas || 'lainnya'] || []).push(r); });
    Object.keys(by).forEach(function (k) {
      var tot = by[k].reduce(function (s, r) { return s + r.nilai; }, 0);
      h += '<h2>' + esc(t('po.k.' + k)) + ' · ' + esc(C.fmtNum(tot)) + '</h2><div class="card">' + by[k].map(holdingRow).join('') + '</div>';
    });
    return h;
  }
  function vHold(p) {
    var a = assets().filter(function (x) { return x.id === p.arg; })[0];
    if (!a) return '<div class="card"><div class="empty">—</div></div>';
    var pos = C2.position(a, lots(), C.todayLocal()), fixed = C2.isFixed(a), h = '';
    h += '<div class="card hero"><div class="lbl">' + esc(t('po.k.' + a.kelas)) + '</div><div class="big">' + esc(fm(pos.nilai)) + '</div><div class="sr" style="margin-top:6px"><span>' + esc(t('po.cost', fm(pos.modal))) + '</span><b class="' + cls(pos.untung) + '">' + esc(sgn(pos.untung) + (pos.modal ? ' (' + pctT(pos.pct || 0) + ')' : '')) + '</b></div>' +
      '<div class="sr"><span class="muted">' + t('po.realized') + '</span><b class="' + cls(pos.realisasi) + '">' + esc(sgn(pos.realisasi)) + '</b></div></div>';
    if (fixed) {
      var f = a.fix;
      h += '<div class="card"><dl class="dl"><dt>' + t('po.f.pokok') + '</dt><dd>' + esc(fm(f.pokok)) + '</dd><dt>' + t('po.f.bunga') + '</dt><dd>' + esc(f.bunga) + '% / ' + t('po.year') + '</dd><dt>' + t('po.f.mulai') + '</dt><dd>' + esc(C.fmtTgl(f.mulai)) + '</dd>' +
        '<dt>' + t('po.f.tempo') + '</dt><dd>' + esc(f.tempo ? C.fmtTgl(f.tempo) : '-') + '</dd><dt>' + t('po.f.pajak') + '</dt><dd>' + esc(f.pajak == null || f.pajak === '' ? 10 : f.pajak) + '%</dd><dt>' + t('po.f.accrued') + '</dt><dd>' + esc(fm(C2.accrued(f, C.todayLocal()))) + '</dd></dl></div>';
      h += '<div class="btnrow2">' + (a.cair ? '' : '<button class="btn" data-act="po-cair" data-id="' + esc(a.id) + '">' + t('po.cair') + '</button>') + '<button class="btn" data-act="po-edit" data-id="' + esc(a.id) + '">' + t('edit') + '</button></div>';
      if (a.cair) h += '<div class="note">' + esc(t('po.cair.done', C.fmtTgl(a.cair.tgl), fm(a.cair.nilai))) + '</div>';
    } else {
      h += '<div class="card"><dl class="dl"><dt>' + t('po.units') + '</dt><dd>' + esc(String(pos.unit)) + '</dd><dt>' + t('po.avg') + '</dt><dd>' + esc(fm(Math.round(pos.avg))) + '</dd><dt>' + t('po.price') + '</dt><dd>' + esc(fm(a.harga || 0)) + (a.hargaTgl ? ' <small class="muted">' + esc(C.fmtTgl(a.hargaTgl)) + '</small>' : '') + '</dd></dl></div>';
      h += '<div class="btnrow"><button class="btn primary" data-act="po-price" data-id="' + esc(a.id) + '">' + t('po.upd') + '</button><button class="btn" data-act="po-lot" data-id="' + esc(a.id) + '" data-j="beli">' + t('po.buy') + '</button><button class="btn" data-act="po-lot" data-id="' + esc(a.id) + '" data-j="jual">' + t('po.sell') + '</button></div>';
      var ph = (a.riwayat || []).map(function (r) { return {bulan: r.tgl.substr(0, 7), saldo: r.harga}; });
      if (ph.length >= 3) h += '<div class="card"><div class="ch">' + t('po.pricehist') + '</div>' + X.sparkline(ph.slice(-12)) + '</div>';
      var ls = lots().filter(function (l) { return l.asetId === a.id; }).sort(function (x, y) { return x.tgl < y.tgl ? 1 : -1; });
      if (ls.length) h += '<h2>' + t('po.lots') + '</h2><div class="card">' + ls.map(function (l) {
        return '<div class="row"><div class="grow"><div class="t">' + t('po.' + (l.jenis === 'beli' ? 'buy' : 'sell')) + ' · ' + esc(String(l.unit)) + ' × ' + esc(C.fmtNum(l.harga)) + '</div><div class="s">' + esc(C.fmtTgl(l.tgl)) + (l.biaya ? ' · ' + esc(t('po.fee', C.fmtNum(l.biaya))) : '') + '</div></div><div class="a">' + esc(fm(l.unit * l.harga)) + '</div><button class="hb sm" data-act="po-lot-del" data-id="' + esc(l.id) + '" aria-label="' + t('delete') + '">' + ICON.x + '</button></div>';
      }).join('') + '</div>';
      var fl = [], ls2 = ls.slice().reverse(); ls2.forEach(function (l) { fl.push({tgl: l.tgl, jumlah: (l.jenis === 'beli' ? -1 : 1) * l.unit * l.harga}); });
      if (pos.unit > 0 && fl.length) { fl.push({tgl: C.todayLocal(), jumlah: pos.nilai}); var x = C2.xirr(fl); if (x != null && fl.length >= 2 && C2.daysBetween(fl[0].tgl, C.todayLocal()) >= 30) h += '<div class="muted sm" style="margin:6px 4px">' + esc(t('po.xirr', pctT(x))) + '</div>'; }
      h += '<div style="margin-top:10px"><button class="link" data-act="po-edit" data-id="' + esc(a.id) + '">' + t('edit') + '</button></div>';
    }
    return h;
  }
  X.pages.portfolio = {title: function () { return t('pg.portfolio'); }, render: function () { return vPort(); }};
  X.pages.holding = {title: function (p) { var a = assets().filter(function (x) { return x.id === p.arg; })[0]; return a ? a.nama : t('pg.portfolio'); }, render: vHold};

  // ---------------- formulir
  function render() {
    var d = PF.d, body = '', title = PF.title;
    function money(l, k, v) { return '<label class="lbl2">' + l + '</label><input class="input" inputmode="decimal" data-po="' + k + '" value="' + (v ? esc(String(v)) : '') + '" placeholder="0">'; }
    function txt(l, k, v) { return '<label class="lbl2">' + l + '</label><input class="input" data-po="' + k + '" value="' + esc(v || '') + '">'; }
    function dt(l, k, v) { return '<label class="lbl2">' + l + '</label><input class="input" type="date" data-po="' + k + '" value="' + esc(v || '') + '">'; }
    if (PF.kind === 'aset') {
      body = txt(t('po.name'), 'nama', d.nama) + '<label class="lbl2">' + t('po.class') + '</label><div class="chips">' + KELAS.map(function (k) { return '<button class="chip sm' + (d.kelas === k ? ' on' : '') + '" data-act="po-class" data-v="' + k + '">' + t('po.k.' + k) + '</button>'; }).join('') + '</div>';
      if (FIXED[d.kelas]) body += money(t('po.f.pokok'), 'pokok', d.pokok) + money(t('po.f.bunga') + ' (% / ' + t('po.year') + ')', 'bunga', d.bunga) + dt(t('po.f.mulai'), 'mulai', d.mulai) + dt(t('po.f.tempo'), 'tempo', d.tempo) + money(t('po.f.pajak') + ' (%)', 'pajak', d.pajak);
      else if (!PF.id) body += money(t('po.units'), 'unit', d.unit) + money(t('po.buyprice'), 'harga', d.harga) + dt(t('f.date'), 'tgl', d.tgl);
      else body += money(t('po.price'), 'harga', d.harga);
    } else if (PF.kind === 'harga') body = money(t('po.price'), 'harga', d.harga) + dt(t('f.date'), 'tgl', d.tgl);
    else if (PF.kind === 'lot') body = money(t('po.units'), 'unit', d.unit) + money(t('po.price'), 'harga', d.harga) + money(t('po.fee.l'), 'biaya', d.biaya) + dt(t('f.date'), 'tgl', d.tgl);
    else if (PF.kind === 'cair') body = money(t('po.cair.amt'), 'harga', d.harga) + dt(t('f.date'), 'tgl', d.tgl) + '<div class="note">' + t('po.cair.note') + '</div>';
    $('#overlay').innerHTML = '<div class="scrim" data-act="ov-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + esc(title) + '</div><button class="x" data-act="ov-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div><div class="sheet-b">' + body + '</div><div class="sheet-f">' +
      (PF.err ? '<div class="err">' + esc(PF.err) + '</div>' : '') + (PF.kind === 'aset' && PF.id ? '<div class="btnrow2"><button class="btn danger" data-act="po-del">' + t('delete') + '</button><button class="btn primary" data-act="po-save">' + t('save') + '</button></div>' : '<button class="btn primary" data-act="po-save"' + (PF.busy ? ' disabled' : '') + '>' + (PF.busy ? t('w.saving') : t('save')) + '</button>') + '</div></div>';
  }
  function open(kind, title, d, id, extra) { X.closeOverlays(); PF = Object.assign({kind: kind, title: title, d: d, id: id || null, err: '', busy: false}, extra || {}); render(); }
  document.addEventListener('input', function (e) { var el = e.target; if (PF && el.dataset && el.dataset.po) PF.d[el.dataset.po] = el.value; });
  function num(v) { var n = Number(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : NaN; }
  function find(id) { return assets().filter(function (a) { return a.id === id; })[0]; }
  function done(p) { PF.busy = true; PF.err = ''; render(); p.then(function () { PF = null; X.closeOverlays(); X.toast(t('saved')); X.render(); }).catch(function (e) { PF.busy = false; PF.err = X.srvErr(e); render(); }); }
  function fail(m) { PF.err = m; render(); }

  function docPort() {
    var v = view(), T = v.total, b = [], today = C.todayLocal();
    b.push({k: 'head', l: t('po.value'), r: C.fmtNum(T.nilai)}, {k: 'row', l: t('po.cost', ''), r: C.fmtNum(T.modal)}, {k: 'row', l: t('po.unreal'), r: sgn(T.untung), c: T.untung < 0 ? 'out' : 'in'}, {k: 'row', l: t('po.realized'), r: sgn(T.realisasi), c: T.realisasi < 0 ? 'out' : 'in'});
    if (v.alokasi.length) { b.push({k: 'head', l: t('po.alloc'), r: ''}); v.alokasi.forEach(function (a) { b.push({k: 'row', l: t('po.k.' + a.kelas), r: Math.round(a.pct * 100) + '%  ' + C.fmtNum(a.nilai)}); }); }
    b.push({k: 'head', l: t('pg.portfolio'), r: ''});
    v.rows.forEach(function (r) { b.push({k: 'row', l: r.aset.nama, s: t('po.k.' + r.aset.kelas), r: C.fmtNum(r.nilai), c: ''}, {k: 'row', ind: 1, l: t('po.unreal'), r: sgn(r.untung), c: r.untung < 0 ? 'out' : 'in'}); });
    return {title: t('pg.portfolio'), sub: C.fmtTgl(today), blocks: b, foot: t('po.note')};
  }
  function newLot(a, jenis, d) {
    return rc.save('lot', {asetId: a.id, jenis: jenis, unit: num(d.unit), harga: num(d.harga), biaya: num(d.biaya) || 0, tgl: d.tgl || C.todayLocal()});
  }
  function setPrice(a, harga, tgl) {
    var r = (a.riwayat || []).filter(function (x) { return x.tgl !== tgl; }).concat([{tgl: tgl, harga: harga}]).sort(function (x, y) { return x.tgl < y.tgl ? -1 : 1; }).slice(-60);
    return rc.save('aset', Object.assign({}, a, {harga: harga, hargaTgl: tgl, riwayat: r}), a.id);
  }
  Object.assign(A, {
    'po-new': function () { open('aset', t('po.add'), {nama: '', kelas: 'emas', unit: '', harga: '', tgl: C.todayLocal(), pokok: '', bunga: '', mulai: C.todayLocal(), tempo: '', pajak: '10'}); },
    'po-class': function (el) { PF.d.kelas = el.dataset.v; render(); },
    'po-open': function (el) { X.openPage('holding', el.dataset.id); },
    'po-share': function () { X.shareDoc(docPort(), 'doit-portofolio-' + C.todayLocal()); },
    'po-edit': function (el) {
      var a = find(el.dataset.id); if (!a) return;
      var f = a.fix || {}; open('aset', t('edit'), {nama: a.nama, kelas: a.kelas, harga: a.harga || '', pokok: f.pokok || '', bunga: f.bunga || '', mulai: f.mulai || '', tempo: f.tempo || '', pajak: f.pajak == null ? '10' : f.pajak}, a.id, {asset: a});
    },
    'po-price': function (el) { var a = find(el.dataset.id); if (a) open('harga', t('po.upd'), {harga: a.harga || '', tgl: C.todayLocal()}, a.id, {asset: a}); },
    'po-lot': function (el) { var a = find(el.dataset.id); if (a) open('lot', t('po.' + (el.dataset.j === 'beli' ? 'buy' : 'sell')), {unit: '', harga: a.harga || '', biaya: '', tgl: C.todayLocal()}, a.id, {asset: a, jenis: el.dataset.j}); },
    'po-lot-del': function (el) { if (confirm(t('bl.del.q'))) rc.remove(el.dataset.id).then(function () { X.render(); }); },
    'po-cair': function (el) { var a = find(el.dataset.id); if (a) open('cair', t('po.cair'), {harga: Math.round(C2.position(a, [], C.todayLocal()).nilai), tgl: C.todayLocal()}, a.id, {asset: a}); },
    'po-del': function () {
      if (!confirm(t('bl.del.q'))) return; var id = PF.id, ls = lots().filter(function (l) { return l.asetId === id; });
      PF.busy = true; rc.batch([{op: 'hapus', id: id}].concat(ls.map(function (l) { return {op: 'hapus', id: l.id}; }))).then(function () { PF = null; X.closeOverlays(); X.goBack(); }).catch(function (e) { PF.busy = false; fail(X.srvErr(e)); });
    },
    'po-save': function () {
      var d = PF.d, today = C.todayLocal();
      if (PF.kind === 'aset') {
        var nama = (d.nama || '').trim(); if (nama.length < 2) return fail(t('w.short'));
        if (FIXED[d.kelas]) {
          var pk = num(d.pokok), bg = num(d.bunga), pj = d.pajak === '' ? 10 : num(d.pajak);
          if (!(pk > 0) || isNaN(bg) || bg < 0 || isNaN(pj)) return fail(t('po.err.num')); if (!d.mulai) return fail(t('rt.err.date'));
          var base = PF.asset || {}; return done(rc.save('aset', Object.assign({}, base, {nama: nama, kelas: d.kelas, fix: {pokok: pk, bunga: bg, mulai: d.mulai, tempo: d.tempo || '', pajak: pj}, aktif: true}), PF.id));
        }
        if (PF.id) { var hg = num(d.harga); if (!(hg >= 0)) return fail(t('po.err.num')); return done(rc.save('aset', Object.assign({}, PF.asset, {nama: nama, kelas: d.kelas, harga: hg}), PF.id)); }
        var u = num(d.unit), h = num(d.harga); if (!(u > 0) || !(h > 0)) return fail(t('po.err.num'));
        PF.busy = true; render();
        return rc.save('aset', {nama: nama, kelas: d.kelas, harga: h, hargaTgl: d.tgl || today, riwayat: [{tgl: d.tgl || today, harga: h}], aktif: true}).then(function (id) { return rc.save('lot', {asetId: id, jenis: 'beli', unit: u, harga: h, biaya: 0, tgl: d.tgl || today}); }).then(function () { PF = null; X.closeOverlays(); X.toast(t('saved')); X.render(); }).catch(function (e) { PF.busy = false; fail(X.srvErr(e)); });
      }
      if (PF.kind === 'harga') { var p = num(d.harga); if (!(p >= 0)) return fail(t('po.err.num')); return done(setPrice(PF.asset, p, d.tgl || today)); }
      if (PF.kind === 'lot') {
        var uu = num(d.unit), hh = num(d.harga); if (!(uu > 0) || !(hh > 0)) return fail(t('po.err.num'));
        if (PF.jenis === 'jual') { var have = C2.position(PF.asset, lots(), today).unit; if (uu > have + 1e-9) return fail(t('po.err.sell', have)); }
        return done(newLot(PF.asset, PF.jenis, d).then(function () { return setPrice(PF.asset, hh, d.tgl || today); }));
      }
      if (PF.kind === 'cair') { var n = num(d.harga); if (!(n >= 0)) return fail(t('po.err.num')); return done(rc.save('aset', Object.assign({}, PF.asset, {cair: {tgl: d.tgl || today, nilai: n}}), PF.id)); }
    }
  });
})();
