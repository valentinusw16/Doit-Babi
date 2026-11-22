if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['plan'] = '3.3.0';
/* Do it v2.0 - Rencana: anggaran bulanan (+rincian, rollover, realokasi), anggaran event (tag), dana tujuan, transaksi rutin.
   Data disimpan di sheet Rencana (lewat DoIt.rc), dihitung oleh core2.js. */
(function () {
  'use strict';
  var X = window.DoIt, S = X.S, C = X.C, C2 = X.C2, t = X.t, esc = X.esc, $ = X.$, ICON = X.ICON, A = X.A, dn = X.dn, rc = X.rc;
  var fm = function (n) { return C.fmtRp(n); };
  var PF = null;   // formulir yang sedang terbuka {kind, id, d, err, busy}

  // ---------------------------------------------------------------- bantu umum
  function monthLabel(k) { return C.namaBulan(+k.substr(5, 2)) + ' ' + k.substr(0, 4); }
  function curMonth() { return S.bm || C.todayLocal().substr(0, 7); }
  function walletMap() { var m = {}; C.walletBalances(X.getLines(), S.M, null).forEach(function (w) { m[w.nama] = w.saldo; }); return m; }
  function fail(e) { if (PF) { PF.busy = false; PF.err = X.srvErr(e); renderForm(); } else X.toast(X.srvErr(e)); }
  function pbar(p, cls) { return '<div class="pbar ' + (cls || (p > 1 ? 'bad' : (p >= 0.8 ? 'warn' : ''))) + '"><i style="width:' + Math.min(100, Math.round(p * 100)) + '%"></i></div>'; }
  function pct(p) { return Math.round(p * 100) + '%'; }
  function norm(tag) { return String(tag || '').toLowerCase().trim().replace(/^#+/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function expenseGroups() {
    var g = [], seen = {};
    S.M.kategori.forEach(function (k) { if (k.Jenis === 'Expense' && !seen[k.Kategori] && k.Kategori !== X.NONOP_G) { seen[k.Kategori] = 1; g.push(k.Kategori); } });
    return g;
  }

  // ---------------------------------------------------------------- formulir umum
  function renderForm(focusId) {
    var body = $('#pfbody'), st = body ? body.scrollTop : 0, F = FORMS[PF.kind];
    $('#overlay').innerHTML = '<div class="scrim" data-act="ov-close"></div><div class="sheet full"><div class="sheet-h"><div class="sh-t">' + esc(F.title(PF)) + '</div><button class="x" data-act="ov-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div>' +
      '<div class="sheet-b" id="pfbody">' + F.body(PF) + '</div><div class="sheet-f">' + (PF.err ? '<div class="err">' + esc(PF.err) + '</div>' : '') + F.foot(PF) + '</div></div>';
    var nb = $('#pfbody'); if (nb) nb.scrollTop = st;
    if (focusId) { var a = document.getElementById(focusId); if (a) a.focus(); }
  }
  function openForm(kind, id, d, extra) { X.closeOverlays(); PF = Object.assign({kind: kind, id: id || null, d: d, err: '', busy: false}, extra || {}); renderForm(kind === 'bl' || kind === 'ev' || kind === 'gl' ? null : null); }
  function inp(label, key, val, ph) { return '<label class="lbl2">' + label + '</label><input class="input" data-pf="' + key + '" value="' + esc(val == null ? '' : val) + '" autocomplete="off"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '>'; }
  function money(label, key, val, ph) { return '<label class="lbl2">' + label + '</label><input class="input" inputmode="numeric" data-pf="' + key + '" data-pfm="1" placeholder="' + esc(ph || '0') + '" value="' + (val ? C.fmtNum(val) : '') + '">'; }
  function dateIn(label, key, val) { return '<label class="lbl2">' + label + '</label><input class="input" type="date" data-pf="' + key + '" value="' + esc(val || '') + '">'; }
  function toggle(label, key, on) { return '<button class="tog' + (on ? ' on' : '') + '" data-act="pf-toggle" data-k="' + key + '"><i></i><span>' + label + '</span></button>'; }
  function photoBlock(d) {
    return '<div class="phblk">' + (d.foto ? '<img class="phprev" src="' + esc(d.foto) + '" alt="">' : '<div class="phprev ph0">' + ICON.plus + '<span>' + t('ph.add') + '</span></div>') +
      '<div class="btnrow2"><button class="btn sm" data-act="ph-pick">' + t(d.foto ? 'ph.ch' : 'ph.up') + '</button>' + (d.foto ? '<button class="btn sm danger" data-act="ph-del">' + t('ph.del') + '</button>' : '') + '</div><input type="file" id="file-ph" accept="image/*" hidden data-phf="1"></div>';
  }
  function photoShrink(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('img')); };
      im.onload = function () {
        var out = '', W = [520, 440, 360, 300, 240], Q = [0.7, 0.6, 0.5];
        for (var i = 0; i < W.length; i++) for (var j = 0; j < Q.length; j++) {
          var k = Math.min(1, W[i] / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement('canvas'); cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k);
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); out = cv.toDataURL('image/jpeg', Q[j]); if (out.length <= 17000) { URL.revokeObjectURL(u); return res(out); }
        }
        URL.revokeObjectURL(u); rej(new Error('big'));
      };
      im.src = u;
    });
  }
  function cover(d) { return d.foto ? '<img class="cover" src="' + esc(d.foto) + '" alt="">' : ''; }
  function saveBtn(act, label) { return '<button class="btn primary" data-act="' + act + '"' + (PF.busy ? ' disabled' : '') + '>' + (PF.busy ? t('w.saving') : (label || t('save'))) + '</button>'; }
  function saveDel(act, delAct) { return (PF.id ? '<div class="btnrow2"><button class="btn danger" data-act="' + delAct + '">' + t('delete') + '</button>' + saveBtn(act) + '</div>' : saveBtn(act)); }

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!PF || !PF.d) return;
    if (el.dataset.pf) {
      if (el.dataset.pfm) { var dg = el.value.replace(/\D/g, '').substr(0, 13); PF.d[el.dataset.pf] = dg ? Number(dg) : 0; el.value = dg ? C.fmtNum(dg) : ''; }
      else PF.d[el.dataset.pf] = el.value;
      if (el.dataset.pf === 'jumlah' || el.dataset.pf === 'target') return;
      return;
    }
    if (el.dataset.pfr) {
      var row = PF.d[el.dataset.list][+el.dataset.i], f = el.dataset.pfr;
      if (f === 'j' || f === 'k') { var dd = el.value.replace(/\D/g, '').substr(0, 12); row[f] = dd ? Number(dd) : 0; if (f === 'j') el.value = dd ? C.fmtNum(dd) : ''; else el.value = dd; }
      else row[f] = el.value;
      var tt = $('#pf-total'); if (tt) tt.textContent = fm(rincianTotal(PF.d.rincian));
    }
  });
  document.addEventListener('change', function (e) {
    var el = e.target; if (!PF || !PF.d) return;
    if (el.dataset.phf) { var f = el.files && el.files[0]; el.value = ''; if (f) photoShrink(f).then(function (img) { PF.d.foto = img; renderForm(); }).catch(function () { PF.err = t('ph.fail'); renderForm(); }); return; }
    if (el.dataset.pfr === 'g') { var it = PF.d[el.dataset.list][+el.dataset.i]; it.g = el.value; if (el.dataset.list === 'items') { it.k = ''; renderForm(); } }
    if (el.dataset.pfr === 'k') PF.d[el.dataset.list][+el.dataset.i].k = el.value;
  });
  function rincianTotal(r) { return (r || []).reduce(function (a, x) { return a + (+x.j || 0) * (+x.k || 1); }, 0); }

  // ---------------------------------------------------------------- ANGGARAN
  function lineName(l) { if (l.scope === 'sub') { var k = S.M.katByKode[l.key]; return k ? dn(k.SubKategori) : l.key; } return dn(l.key); }
  function lineGroup(l) { return l.scope === 'sub' ? ((S.M.katByKode[l.key] || {}).Kategori || '') : l.key; }
  function lineJenis(l) { return l.jenis === 'Income' ? 'Income' : 'Expense'; }
  function allBudgetLines() { return rc.list('anggaran').filter(function (l) { return l.aktif !== false; }); }
  // anggaran pengeluaran (dipakai kartu Rencana, peringatan, realokasi); pemasukan dipisah supaya tidak tercampur total
  function budgetLines() { return allBudgetLines().filter(function (l) { return lineJenis(l) === 'Expense'; }); }
  function incomeLines() { return allBudgetLines().filter(function (l) { return lineJenis(l) === 'Income'; }); }
  function curJenis() { return S.bjenis === 'Income' ? 'Income' : 'Expense'; }
  function groupsOf(jenis) {
    var order = [], by = {};
    S.M.kategori.forEach(function (c) {
      if (c.Jenis !== jenis || c.Kategori === X.NONOP_G) return;
      if (!by[c.Kategori]) { by[c.Kategori] = {nama: c.Kategori, subs: []}; order.push(c.Kategori); }
      by[c.Kategori].subs.push(c);
    });
    return order.map(function (n) { return by[n]; });
  }
  function actualMaps(jenis, k, owner) {
    var m = {g: {}, s: {}}, one = owner && owner !== 'Semua';
    for (var id in S.tx) {
      var x = S.tx[id];
      if (x.Status !== 'Aktif' || x.Jenis !== jenis || C2.monthKey(x.Waktu) !== k) continue;
      if (one && x.PemilikDompet !== owner) continue;
      var v = +x.Jumlah || 0; m.g[x.Kategori] = (m.g[x.Kategori] || 0) + v; m.s[x.KodeAkun] = (m.s[x.KodeAkun] || 0) + v;
    }
    return m;
  }
  function ownerNow() { return S.owner !== 'Semua' ? S.owner : S.cfg.user; }
  function newLine(scope, key, jenis) {
    return {scope: scope, key: key, jenis: jenis, pemilik: ownerNow(), rincian: [], jumlah: 0, rollover: jenis === 'Expense', mulai: curMonth(), ov: {}, ovm: 0};
  }
  function lineRow(r, k, sub, sc, gname) {
    var l = r.line, notes = [];
    if (r.bawa) notes.push(t('bl.carry', fm(r.bawa)));
    if (l.rincian && l.rincian.length) notes.push(t('bl.detail', l.rincian.length));
    if (l.ov && l.ov[k] != null) notes.push(t('bl.ov'));
    var inc = lineJenis(l) === 'Income', neg = inc ? r.terpakai < r.tersedia : r.sisa < 0;
    return '<div class="subln tap" data-act="bl-open" data-id="' + esc(l.id) + '"><div class="sr"><span>' + (sc ? '<span class="gi sm">' + X.catIcon(gname, sc.SubKategori, sc.KodeAkun) + '</span>' : '') + esc(sub || t('bl.whole')) + (l.pemilik && S.owner === 'Semua' ? '<span class="tag">' + esc(l.pemilik) + '</span>' : '') + '</span><b>' + esc(C.fmtNum(r.tersedia)) + '</b></div>' +
      '<div class="sr muted sm"><span>' + esc(t('bl.used.of', C.fmtNum(r.terpakai), C.fmtNum(r.tersedia))) + (notes.length ? ' · ' + esc(notes.join(' · ')) : '') + '</span><b class="' + (neg && !inc ? 'out' : '') + '">' + pct(r.pct) + '</b></div>' + pbar(r.pct, inc ? (r.pct >= 1 ? 'good' : '') : null) + '</div>';
  }
  function vAnggaran() {
    var k = curMonth(), J = curJenis(), inc = J === 'Income', lines = allBudgetLines().filter(function (l) { return lineJenis(l) === J; }), bm = C2.budgetMonth(lines, S.tx, k, S.owner), today = C.todayLocal(), isNow = k === today.substr(0, 7);
    var h = '<div class="mnav"><button class="hb" data-act="bm-prev" aria-label="‹">' + ICON.back + '</button><b>' + esc(monthLabel(k)) + '</b><button class="hb" data-act="bm-next" aria-label="›">' + '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>' + '</button></div>';
    h += '<div class="seg sm" style="margin-bottom:10px">' + [['Expense', 'bl.j.exp'], ['Income', 'bl.j.inc']].map(function (x) { return '<button class="' + (J === x[0] ? 'on' : '') + '" data-act="bl-jenis" data-v="' + x[0] + '">' + t(x[1]) + '</button>'; }).join('') + '</div>';
    X.ownerChips(S.owner, 'owner');
    var T = bm.total, p = T.tersedia ? T.terpakai / T.tersedia : 0;
    h += '<div class="card hero"><div class="lbl">' + t(inc ? 'bl.total.inc' : 'bl.total') + '</div><div class="big">' + esc(fm(T.tersedia)) + '</div>' +
      '<div class="sr" style="margin-top:6px"><span>' + esc(t(inc ? 'bl.got' : 'bl.used', fm(T.terpakai))) + '</span><b class="' + (inc ? (T.terpakai >= T.tersedia ? 'in' : '') : (T.sisa < 0 ? 'out' : 'in')) + '">' + esc(inc ? t(T.terpakai >= T.tersedia ? 'bl.inc.over' : 'bl.inc.short', fm(Math.abs(T.sisa))) : t(T.sisa < 0 ? 'bl.over' : 'bl.left', fm(Math.abs(T.sisa)))) + '</b></div>' + pbar(p, inc ? (p >= 1 ? 'good' : '') : null) +
      (!inc && isNow && T.terpakai ? '<div class="sub2">' + esc(t('bl.proj', fm(C2.projection(T.terpakai, k, today)))) + '</div>' : '') + '</div>';
    if (!inc && bm.rows.length > 1) h += '<div class="btnrow"><button class="btn" data-act="bl-realok">' + ICON.swap + t('bl.realok') + '</button></div>';
    h += '<div class="muted sm" style="margin:2px 2px 10px">' + t('bl.cat.hint') + '</div>';
    var act = actualMaps(J, k, S.owner), open = S.bopen || {};
    var cards = groupsOf(J).map(function (g) {
      var rows = bm.rows.filter(function (r) { return lineGroup(r.line) === g.nama; }), bud = 0, spentLine = 0;
      rows.forEach(function (r) { bud += r.tersedia; });
      var a = act.g[g.nama] || 0, pc = bud > 0 ? a / bud : (a > 0 ? 9.99 : 0), subRows = rows.filter(function (r) { return r.line.scope === 'sub'; }), grupRows = rows.filter(function (r) { return r.line.scope !== 'sub'; });
      return {g: g, rows: rows, bud: bud, a: a, pc: pc, subRows: subRows, grupRows: grupRows};
    });
    /* v3.4b: urutan kartu mengikuti urutan kategori di CoA */
    h += cards.map(function (c) {
      var g = c.g, isOpen = !!open[J + ':' + g.nama], sisa = c.bud - c.a, neg = inc ? false : sisa < 0;
      var out = '<div class="card bl cat"><div class="ah tap" data-act="bl-cat" data-g="' + esc(g.nama) + '"><span class="gi">' + X.catIcon(g.nama) + '</span><span>' + esc(dn(g.nama)) + '</span>' +
        (c.bud > 0 ? '<b class="' + (neg ? 'out' : '') + '">' + esc(fm(inc ? c.bud - c.a < 0 ? c.a - c.bud : c.bud - c.a : sisa)) + '</b>' : '<b class="muted sm">' + esc(t('bl.none')) + '</b>') + '</div>';
      if (c.bud > 0) out += '<div class="sr"><span class="muted">' + esc(t('bl.used.of', C.fmtNum(c.a), C.fmtNum(c.bud))) + '</span><b>' + pct(c.pc) + '</b></div>' + pbar(c.pc, inc ? (c.pc >= 1 ? 'good' : '') : null);
      else out += '<div class="sr"><span class="muted">' + esc(c.a ? t(inc ? 'bl.got' : 'bl.used', fm(c.a)) : t('bl.tap.set')) + '</span></div>';
      out += '<button class="morebtn" data-act="bl-tog" data-g="' + esc(g.nama) + '">' + esc(t(isOpen ? 'bl.less' : 'bl.more', g.subs.length)) + ' <i class="' + (isOpen ? 'up' : '') + '">▾</i></button>';
      if (isOpen) {
        out += '<div class="subs">';
        c.grupRows.forEach(function (r) { out += lineRow(r, k, null); });
        g.subs.forEach(function (sc) {
          var rs = c.subRows.filter(function (r) { return r.line.key === sc.KodeAkun; });
          if (rs.length) rs.forEach(function (r) { out += lineRow(r, k, dn(sc.SubKategori), sc, g.nama); });
          else {
            var av = act.s[sc.KodeAkun] || 0;
            out += '<div class="subln empty tap" data-act="bl-sub" data-g="' + esc(g.nama) + '" data-k="' + esc(sc.KodeAkun) + '"><div class="sr"><span><span class="gi sm">' + X.catIcon(g.nama, sc.SubKategori, sc.KodeAkun) + '</span>' + esc(dn(sc.SubKategori)) + '</span><b class="muted sm">' + esc(t('bl.fill')) + '</b></div>' + (av ? '<div class="sr muted sm"><span>' + esc(t(inc ? 'bl.got' : 'bl.used', C.fmtNum(av))) + '</span></div>' : '') + '</div>';
          }
        });
        out += '</div>';
      }
      return out + '</div>';
    }).join('');
    return h;
  }
  function blPick() {
    var J = curJenis(), own = ownerNow(), have = {}; var cm = curMonth(); allBudgetLines().forEach(function (l) { if (lineJenis(l) === J && (l.pemilik || own) === own && (!l.sampai || l.sampai >= cm)) have[l.scope + ':' + l.key] = 1; });
    var items = [];
    groupsOf(J).forEach(function (g) { if (!have['grup:' + g.nama]) items.push({v: 'grup:' + g.nama, l: dn(g.nama), g: t('bl.grp'), ico: X.catIcon(g.nama)}); });
    S.M.kategori.forEach(function (c) { if (c.Jenis === J && c.Kategori !== X.NONOP_G && !have['sub:' + c.KodeAkun]) items.push({v: 'sub:' + c.KodeAkun, l: dn(c.SubKategori), g: dn(c.Kategori), s: t('bl.sub'), ico: X.catIcon(c.Kategori)}); });
    X.openPicker({title: t('bl.pick'), items: items, onPick: function (it) {
      var sp = it.v.split(':'); X.closePicker();
      openForm('bl', null, newLine(sp[0], sp.slice(1).join(':'), J));
    }});
  }
  var FORMS = {
    bl: {
      title: function (p) { return p.id ? t('bl.edit') : t('bl.add'); },
      body: function (p) {
        var d = p.d, k = curMonth(), name = lineName(d), h = '<div class="card"><div class="ah" style="padding:0"><span class="gi">' + X.catIcon(lineGroup(d)) + '</span><span>' + esc(name) + '</span><b class="muted sm">' + t(d.scope === 'sub' ? 'bl.sub' : 'bl.grp') + '</b></div></div>';
        h += '<label class="lbl2">' + t('bl.owner') + '</label><div class="chips">' + S.M.users.map(function (u) { return '<button class="chip sm' + (d.pemilik === u ? ' on' : '') + '" data-act="bl-owner" data-v="' + esc(u) + '"' + (p.id ? ' disabled' : '') + '>' + esc(u) + '</button>'; }).join('') + '</div>' + (p.id ? '' : '<div class="muted sm" style="margin-top:4px">' + t('bl.owner.hint') + '</div>');
        h += '<label class="lbl2">' + t('bl.rincian') + '</label><div class="muted sm" style="margin:-4px 0 8px">' + t('bl.rincian.hint') + '</div>';
        h += (d.rincian || []).map(function (r, i) {
          return '<div class="rrow"><input class="input" data-pfr="n" data-list="rincian" data-i="' + i + '" value="' + esc(r.n || '') + '" placeholder="' + esc(t('bl.r.name')) + '">' +
            '<input class="input" inputmode="numeric" data-pfr="j" data-list="rincian" data-i="' + i + '" value="' + (r.j ? C.fmtNum(r.j) : '') + '" placeholder="Rp"><span class="muted">×</span>' +
            '<input class="input qty" inputmode="numeric" data-pfr="k" data-list="rincian" data-i="' + i + '" value="' + (r.k == null ? '' : r.k) + '" placeholder="1"><button class="hb" data-act="pf-rdel" data-list="rincian" data-i="' + i + '" aria-label="' + t('delete') + '">' + ICON.x + '</button></div>';
        }).join('');
        h += '<button class="link" data-act="pf-radd" data-list="rincian">+ ' + t('bl.r.add') + '</button>';
        if (d.rincian && d.rincian.length) h += '<div class="card sumline"><span>' + t('bl.r.total') + '</span><b id="pf-total">' + esc(fm(rincianTotal(d.rincian))) + '</b></div>';
        else h += money(t('bl.amount'), 'jumlah', d.jumlah);
        if (lineJenis(d) === 'Expense') h += '<div style="margin-top:14px">' + toggle(t('bl.rollover'), 'rollover', d.rollover) + '<div class="muted sm" style="margin:4px 2px 0">' + t('bl.rollover.hint') + '</div></div>';
        if (d.scope === 'sub' && PF.grupId) h += '<div class="muted sm" style="margin-top:12px">' + t('bl.replace.hint') + '</div>';
        h += money(t('bl.month.only', monthLabel(k)), 'ovm', d.ovm, t('bl.month.ph'));
        return h;
      },
      foot: function () { return saveDel('bl-save', 'bl-del'); }
    },
    ev: {
      title: function (p) { return p.id ? t('ev.edit') : t('ev.add'); },
      body: function (p) {
        var d = p.d, h = photoBlock(d) + inp(t('ev.name'), 'nama', d.nama, t('ev.name.ph')) +
          '<div class="two">' + dateIn(t('ev.from'), 'mulai', d.mulai) + dateIn(t('ev.to'), 'selesai', d.selesai) + '</div>' + money(t('ev.budget'), 'anggaran', d.anggaran);
        h += '<label class="lbl2">' + t('ev.items') + '</label>' + (d.items || []).map(function (r, i) {
          var subs = S.M.kategori.filter(function (k) { return k.Jenis === 'Expense' && k.Kategori === r.g; });
          return '<div class="rrow ev3"><select class="input" data-pfr="g" data-list="items" data-i="' + i + '">' + expenseGroups().map(function (g) { return '<option value="' + esc(g) + '"' + (g === r.g ? ' selected' : '') + '>' + esc(dn(g)) + '</option>'; }).join('') + '</select>' +
            '<select class="input" data-pfr="k" data-list="items" data-i="' + i + '"><option value="">' + esc(t('ev.allsub')) + '</option>' + subs.map(function (k) { return '<option value="' + esc(k.KodeAkun) + '"' + (k.KodeAkun === r.k ? ' selected' : '') + '>' + esc(dn(k.SubKategori)) + '</option>'; }).join('') + '</select>' +
            '<input class="input" inputmode="numeric" data-pfr="j" data-list="items" data-i="' + i + '" value="' + (r.j ? C.fmtNum(r.j) : '') + '" placeholder="Rp"><button class="hb" data-act="pf-rdel" data-list="items" data-i="' + i + '" aria-label="' + t('delete') + '">' + ICON.x + '</button></div>';
        }).join('') + '<button class="link" data-act="pf-radd" data-list="items">+ ' + t('ev.items.add') + '</button>';
        h += '<details class="adv"' + (d.tag ? ' open' : '') + '><summary>' + t('pf.adv') + '</summary>' + inp(t('ev.tag'), 'tag', d.tag, '#liburan-bali') + '<div class="muted sm" style="margin:4px 2px 0">' + t('ev.tag.hint') + '</div></details>';
        return h;
      },
      foot: function () { return saveDel('ev-save', 'ev-del'); }
    },
    gl: {
      title: function (p) { return p.id ? t('gl.edit') : t('gl.add'); },
      body: function (p) {
        var d = p.d, h = photoBlock(d) + inp(t('gl.name'), 'nama', d.nama, t('gl.name.ph')) + '<div class="two">' + money(t('gl.target'), 'target', d.target) + dateIn(t('gl.due'), 'tenggat', d.tenggat) + '</div>';
        h += '<details class="adv"' + ((d.dompet && d.dompet.length) || d.awal ? ' open' : '') + '><summary>' + t('pf.adv') + '</summary><label class="lbl2">' + t('gl.wallets') + '</label><div class="muted sm" style="margin:-4px 0 8px">' + t('gl.wallets.hint') + '</div><div class="chips">' +
          (d.dompet || []).map(function (n, i) { return '<button class="chip sm on" data-act="gl-wallet-del" data-i="' + i + '">' + esc(n) + ' ✕</button>'; }).join('') + '<button class="chip sm more" data-act="gl-wallet-add">+ ' + t('gl.wallet.add') + '</button></div>';
        h += money(t('gl.start'), 'awal', d.awal) + '</details>';
        return h;
      },
      foot: function () { return saveDel('gl-save', 'gl-del'); }
    },
    setor: {
      title: function () { return t('gl.deposit'); },
      body: function (p) { return dateIn(t('f.date'), 'tgl', p.d.tgl) + money(t('gl.deposit.amt'), 'jumlah', p.d.jumlah); },
      foot: function () { return saveBtn('gl-setor-save'); }
    },
    rt: {
      title: function (p) { return p.id ? t('rt.edit') : t('rt.new'); },
      body: function (p) {
        var d = p.d, h = inp(t('rt.name'), 'nama', d.nama) + money(t('rt.amount'), 'jumlah', d.jumlah);
        h += '<label class="lbl2">' + t('rt.freq') + '</label><div class="chips">' + [['mingguan:1', 'rt.f.w1'], ['mingguan:2', 'rt.f.w2'], ['bulanan:1', 'rt.f.m1'], ['tahunan:1', 'rt.f.y1']].map(function (f) {
          return '<button class="chip' + (d.frek + ':' + d.interval === f[0] ? ' on' : '') + '" data-act="rt-freq" data-v="' + f[0] + '">' + t(f[1]) + '</button>'; }).join('') + '</div>';
        h += dateIn(t('rt.next'), 'mulai', d.mulai) + dateIn(t('rt.end'), 'akhir', d.akhir);
        if (p.id) h += '<div style="margin-top:14px">' + toggle(t('rt.active'), 'aktif', d.aktif !== false) + '</div>';
        h += '<div class="note">' + t('rt.note') + '</div>';
        return h;
      },
      foot: function () { return saveDel('rt-save', 'rt-del'); }
    },
    ro: {
      title: function () { return t('bl.realok'); },
      body: function (p) {
        var k = curMonth(), bm = C2.budgetMonth(budgetLines(), S.tx, k, S.owner), d = p.d;
        function pick(field, act) {
          var src = bm.rows.filter(function (r) { return r.line.id === d.from; })[0], rows = field === 'to' && src ? bm.rows.filter(function (r) { return (r.line.pemilik || '') === (src.line.pemilik || ''); }) : bm.rows;
          return '<div class="chips">' + rows.map(function (r) { return '<button class="chip sm' + (d[field] === r.line.id ? ' on' : '') + '" data-act="' + act + '" data-id="' + esc(r.line.id) + '">' + esc(lineName(r.line)) + (r.line.pemilik && S.owner === 'Semua' ? ' (' + esc(r.line.pemilik) + ')' : '') + ' · ' + esc(C.fmtNum(r.sisa)) + '</button>'; }).join('') + '</div>';
        }
        return '<div class="muted sm" style="margin:0 2px 6px">' + esc(monthLabel(k)) + '</div><label class="lbl2">' + t('ro.from') + '</label>' + pick('from', 'ro-from') + '<label class="lbl2">' + t('ro.to') + '</label>' + pick('to', 'ro-to') + money(t('ro.amount'), 'jumlah', d.jumlah) +
          '<div class="note">' + t('ro.note') + '</div>';
      },
      foot: function () { return saveBtn('ro-save'); }
    }
  };

  // ---------------------------------------------------------------- EVENT
  function vEvent() {
    var evs = rc.list('event').filter(function (e) { return e.aktif !== false; }), h = '<div class="btnrow"><button class="btn" data-act="ev-new">' + ICON.plus + t('ev.add') + '</button></div>';
    if (!evs.length) return h + '<div class="card"><div class="empty">' + t('ev.empty') + '</div></div>';
    return h + evs.map(function (e) {
      var a = C2.eventActual(e, S.tx), bud = +e.anggaran || 0, p = bud ? a.total / bud : 0;
      var rows = Object.keys(a.byGrup).sort(function (x, y) { return a.byGrup[y] - a.byGrup[x]; });
      var itemBud = {}; (e.items || []).forEach(function (i) { itemBud[i.g] = (itemBud[i.g] || 0) + (+i.j || 0); });
      Object.keys(itemBud).forEach(function (g) { if (rows.indexOf(g) < 0) rows.push(g); });
      var subBud = {}; (e.items || []).forEach(function (i) { if (i.k) subBud[i.k] = (subBud[i.k] || 0) + (+i.j || 0); });
      return '<div class="card bl' + (e.foto ? ' hasph' : '') + '">' + cover(e) + '<div class="ah"><span class="gi">' + ICON.tag + '</span><span>' + esc(e.nama) + '<small class="muted sm dnet">#' + esc(norm(e.tag)) + (e.mulai ? ' · ' + esc(C.fmtTgl(e.mulai)) + (e.selesai ? ' – ' + esc(C.fmtTgl(e.selesai)) : '') : '') + '</small></span>' +
        '<button class="hb sm" data-act="ev-open" data-id="' + esc(e.id) + '" aria-label="' + t('ev.edit') + '">' + ICON.edit + '</button></div>' +
        '<div class="sr"><span class="muted">' + esc(bud ? t('bl.used.of', C.fmtNum(a.total), C.fmtNum(bud)) : t('ev.spent', fm(a.total))) + '</span>' + (bud ? '<b>' + pct(p) + '</b>' : '') + '</div>' + (bud ? pbar(p) : '') +
        (bud ? '<div class="s ' + (bud - a.total < 0 ? 'out' : 'muted') + ' sm" style="margin-top:6px">' + esc(bud - a.total < 0 ? t('bl.over', fm(a.total - bud)) : t('bl.left', fm(bud - a.total))) + '</div>' : '') +
        rows.map(function (g) {
          var v = a.byGrup[g] || 0, b = itemBud[g] || 0;
          var subs = S.M.kategori.filter(function (k) { return k.Jenis === 'Expense' && k.Kategori === g && ((a.bySub && a.bySub[k.KodeAkun]) || subBud[k.KodeAkun]); }).sort(function (x, y) { return ((a.bySub && a.bySub[y.KodeAkun]) || 0) - ((a.bySub && a.bySub[x.KodeAkun]) || 0); });
          return '<div class="subrow"><div class="sr"><span><span class="gi sm">' + X.catIcon(g) + '</span>' + esc(dn(g)) + '</span><b>' + esc(C.fmtNum(v)) + (b ? ' / ' + esc(C.fmtNum(b)) : '') + '</b></div>' + (b ? pbar(v / b) : '') +
            subs.map(function (k) { var sv = (a.bySub && a.bySub[k.KodeAkun]) || 0, sb = subBud[k.KodeAkun] || 0; return '<div class="evsub"><div class="sr"><span><span class="gi sm">' + X.catIcon(g, k.SubKategori, k.KodeAkun) + '</span>' + esc(dn(k.SubKategori)) + '</span><b>' + esc(C.fmtNum(sv)) + (sb ? ' / ' + esc(C.fmtNum(sb)) : '') + '</b></div>' + (sb ? pbar(sv / sb) : '') + '</div>'; }).join('') + '</div>';
        }).join('') + '<div style="margin-top:8px"><button class="link" data-act="ev-tx" data-id="' + esc(e.id) + '">' + t('ev.tx', a.n) + '</button></div></div>';
    }).join('');
  }

  // ---------------------------------------------------------------- TUJUAN
  function vGoals() {
    var gs = rc.list('tujuan').filter(function (g) { return g.aktif !== false; }), wm = walletMap(), today = C.todayLocal(), h = '<div class="btnrow"><button class="btn" data-act="gl-new">' + ICON.plus + t('gl.add') + '</button></div>';
    if (!gs.length) return h + '<div class="card"><div class="empty">' + t('gl.empty') + '</div></div>';
    return h + gs.map(function (g) {
      var p = C2.goalProgress(g, wm, today), st = {tercapai: ['in', 'gl.s.done'], lewat: ['out', 'gl.s.late'], berjalan: ['', 'gl.s.go'], 'tanpa-tenggat': ['', 'gl.s.nodue']}[p.status];
      return '<div class="card bl' + (g.foto ? ' hasph' : '') + '">' + cover(g) + '<div class="ah"><span class="gi">' + ICON.target + '</span><span>' + esc(g.nama) + '<small class="muted sm dnet">' + esc(g.tenggat ? t('gl.by', C.fmtTgl(g.tenggat)) : t('gl.s.nodue')) + '</small></span>' +
        '<button class="hb sm" data-act="gl-open" data-id="' + esc(g.id) + '" aria-label="' + t('gl.edit') + '">' + ICON.edit + '</button></div>' +
        '<div class="sr"><span class="muted">' + esc(t('bl.used.of', C.fmtNum(p.terkumpul), C.fmtNum(p.target))) + '</span><b>' + pct(p.pct) + '</b></div>' + pbar(p.pct, p.selesai ? '' : (p.status === 'lewat' ? 'bad' : '')) +
        '<div class="sr" style="margin-top:6px"><span class="muted sm">' + esc(p.selesai ? t('gl.s.done') : t('gl.remain', fm(p.sisa))) + '</span><span class="tag ' + (st[0] === 'out' ? 'bad' : '') + '">' + esc(t(st[1])) + '</span></div>' +
        (p.perBulan != null && !p.selesai ? '<div class="s sm" style="margin-top:4px">' + esc(t('gl.permonth', fm(p.perBulan), p.bulanTersisa)) + '</div>' : '') +
        (g.dompet && g.dompet.length ? '<div class="s muted sm" style="margin-top:4px">' + esc(t('gl.linked', g.dompet.join(', '))) + '</div>' : '') +
        '<div style="margin-top:8px"><button class="link" data-act="gl-setor" data-id="' + esc(g.id) + '">+ ' + t('gl.deposit') + '</button></div></div>';
    }).join('');
  }

  // ---------------------------------------------------------------- RUTIN
  function recName(r) { if (r.susut) return t('su.name', r.p.dompet); var k = S.M.katByKode[r.p && r.p.kodeAkun]; return r.nama || (k ? dn(k.SubKategori) : (r.p && r.p.jenis)); }
  function freqText(r) { return t('rt.f.' + (r.frek === 'mingguan' ? 'w' + (r.interval || 1) : (r.frek === 'tahunan' ? 'y1' : 'm1'))); }
  function recs() { return rc.list('berulang').filter(function (r) { return !r.tolak; }); }
  /** Rutin biasa tampil di HP pembuatnya; penyusutan tampil di HP pemilik aset. */
  function owner(r) { if (r.susut) { var w = S.M.dompet[r.p && r.p.dompet]; return w ? w.Pemilik : r._oleh; } return r._oleh; }
  function myRecs() {
    var me = S.cfg.user;
    return recs().filter(function (r) { return r.aktif !== false && !r.susut && owner(r) === me && r.p; }).map(function (r) { return Object.assign({_nama: recName(r)}, r); });
  }
  function formFromRec(id) {
    var r = recs().filter(function (x) { return x.id === id; })[0]; if (!r) return null;
    var today = C.todayLocal(), ds = C2.dueDates(r, today, 24).filter(function (d) { return !S.tx[C2.recTxId(r.id, d)]; }), due = ds[0];
    var f = formFor(r, due || today); f.waktu = today + 'T' + (r.p.jam || C.nowLocal().substr(11, 5));
    if (!due) f.id = C.newId();
    return {form: f, rec: due ? {id: r.id, due: due} : null, nama: recName(r)};
  }
  /** Rutin yang jatuh tempo dan belum dicatat. Hanya milik pencatat (agar tidak ganda di dua HP). */
  function dueList() {
    var today = C.todayLocal(), me = S.cfg.user, out = [];
    recs().forEach(function (r) {
      if (r.aktif === false || owner(r) !== me) return;
      var ds = C2.dueDates(r, today, 24).filter(function (d) { return !S.tx[C2.recTxId(r.id, d)]; });
      if (ds.length) out.push({rec: r, due: ds[0], more: ds.length - 1});
    });
    return out.sort(function (a, b) { return a.due < b.due ? -1 : 1; });
  }
  function suggestions() {
    var today = C.todayLocal(), key = S.rev + '|' + Object.keys(S.tx).length + '|' + today + '|' + S.rencana.length;
    if (S._sugKey !== key) {
      var known = {}; rc.list('berulang').forEach(function (r) { if (r.key) known[r.key] = 1; });
      S._sug = C2.detectRoutine(S.tx, today).filter(function (s) { return !known[s.key]; }); S._sugKey = key;
    }
    return S._sug;
  }
  function dueCard(d) {
    var r = d.rec;
    return '<div class="card duecard"><div class="dc1"><div class="ico">' + ICON.repeat + '</div><div class="grow"><div class="t">' + esc(recName(r)) + ' · ' + esc(fm(r.p.jumlah)) + '</div><div class="s">' + esc(t('rt.due', C.fmtTgl(d.due))) + (d.more ? ' · ' + esc(t('rt.more', d.more)) : '') + ' · ' + esc(r.p.dompet || '') + '</div></div></div>' +
      '<div class="btnrow2"><button class="btn sm primary" data-act="rt-confirm" data-id="' + esc(r.id) + '" data-due="' + d.due + '">' + t('rt.log') + '</button><button class="btn sm" data-act="rt-edit-due" data-id="' + esc(r.id) + '" data-due="' + d.due + '">' + t('rt.change') + '</button><button class="btn sm" data-act="rt-skip" data-id="' + esc(r.id) + '" data-due="' + d.due + '">' + t('rt.skip') + '</button></div></div>';
  }
  function sugCard(s, i) {
    var k = S.M.katByKode[s.kodeAkun], nm = (k ? dn(k.SubKategori) : s.sub) + (s.toko ? ' · ' + s.toko : '');
    return '<div class="card duecard sug"><div class="dc1"><div class="ico">' + ICON.repeat + '</div><div class="grow"><div class="t">' + esc(t('rt.sug', nm, fm(s.jumlah))) + '</div><div class="s">' + esc(t('rt.sug.s', t('rt.f.' + (s.frek === 'mingguan' ? 'w' + s.interval : 'm1')), s.n, s.dompet)) + '</div></div></div>' +
      '<div class="btnrow2"><button class="btn sm primary" data-act="rt-accept" data-i="' + i + '">' + t('rt.make') + '</button><button class="btn sm" data-act="rt-reject" data-i="' + i + '">' + t('rt.notroutine') + '</button></div></div>';
  }
  function vRutin() {
    var due = dueList(), sg = suggestions(), rs = recs(), today = C.todayLocal(), h = '';
    if (due.length) h += '<h2>' + t('rt.h.due') + '</h2>' + due.map(dueCard).join('');
    if (sg.length) h += '<h2>' + t('rt.h.sug') + '</h2>' + sg.map(sugCard).join('');
    h += '<h2>' + t('rt.h.all') + '</h2>';
    if (!rs.length) return h + '<div class="card"><div class="empty">' + t('rt.empty') + '</div></div>';
    return h + '<div class="card">' + rs.map(function (r) {
      var nx = C2.nextDue(r, r.terakhir || C2.addDays(r.mulai, -1));
      return '<div class="row tap" data-act="rt-edit" data-id="' + esc(r.id) + '"><div class="ico">' + ICON.repeat + '</div><div class="grow"><div class="t">' + esc(recName(r)) + (r.aktif === false ? '<span class="tag">' + t('rt.paused') + '</span>' : '') + '</div><div class="s">' + esc(freqText(r) + ' · ' + (nx ? t('rt.next.on', C.fmtTgl(nx)) : t('rt.ended')) + ' · ' + (r.p.dompet || '')) + '</div></div><div class="a ' + (r.p.jenis === 'Income' ? 'in' : 'out') + '">' + esc(C.fmtNum(r.p.jumlah)) + '</div></div>';
    }).join('') + '</div>';
  }
  function blank() { return {id: '', waktu: '', jenis: 'Expense', subJenis: '', dompet: '', dompetTujuan: '', kodeAkun: '', pihak: '', jumlah: 0, biayaAdmin: '', jatuhTempo: '', toko: '', lokasi: '', barang: '', tag: '', catatan: '', referensi: '', pemilik: '', mengoreksi: ''}; }
  function formFor(r, due, amount) {
    var p = r.p || {}, today = C.todayLocal(), now = C.nowLocal();
    return Object.assign(blank(), {id: C2.recTxId(r.id, due), waktu: due + 'T' + (due === today ? now.substr(11, 5) : '12:00'), jenis: p.jenis, dompet: p.dompet, dompetTujuan: p.dompetTujuan || '', kodeAkun: p.kodeAkun, jumlah: amount || p.jumlah,
      toko: p.toko || '', lokasi: p.lokasi || '', barang: p.barang || '', tag: p.tag || '', catatan: p.catatan || '', biayaAdmin: p.biayaAdmin || ''});
  }
  function markDone(recId, due) {
    var r = rc.list('berulang').filter(function (x) { return x.id === recId; })[0]; if (!r) return Promise.resolve();
    if (r.terakhir && r.terakhir >= due) return Promise.resolve();
    return rc.save('berulang', Object.assign({}, r, {terakhir: due}), recId).catch(function () { /* offline: kartu tetap tersembunyi karena transaksinya sudah ada */ });
  }
  function logDue(recId, due) {
    var r = rc.list('berulang').filter(function (x) { return x.id === recId; })[0]; if (!r) return;
    var F = formFor(r, due);
    try {
      if (!S.tx[F.id]) {
        var x = C.makeTx(F, S.cfg.user, S.M, S.tx, {}); x._pending = true; S.tx[x.ID] = x;
        X.enqueue({action: 'tambah', body: {tx: C.toPayload(F)}});
      }
      markDone(recId, due); X.touch(); X.render(); X.toast(t('saved')); X.syncNow();
    } catch (e) { X.toast(X.L.tErr(e.message)); }
  }
  function openRutin(id, d) { openForm('rt', id, d); }
  function rutinFromTx(x) {
    var next = C2.addMonthsKeep(x.Waktu.substr(0, 10), 1), k = S.M.katByKode[x.KodeAkun];
    openRutin(null, {nama: k ? dn(k.SubKategori) + (x.Toko ? ' · ' + x.Toko : '') : (x.Toko || ''), jumlah: +x.Jumlah, frek: 'bulanan', interval: 1, mulai: next, akhir: '',
      p: {jenis: x.Jenis, dompet: x.Dompet, dompetTujuan: x.DompetTujuan, kodeAkun: x.KodeAkun, jumlah: +x.Jumlah, toko: x.Toko, lokasi: x.Lokasi, barang: x.Barang, tag: x.Tag, catatan: x.Catatan, biayaAdmin: x.BiayaAdmin, jam: x.Waktu.substr(11, 5)},
      key: [x.Jenis, x.KodeAkun, x.Dompet, String(x.Toko || '').toLowerCase()].join('|')});
  }

  // ---------------------------------------------------------------- halaman Rencana
  function vRencana() {
    var tab = S.rtab || 'anggaran';
    var h = '<div class="seg" style="margin-bottom:12px">' + [['anggaran', 'rn.bl'], ['event', 'rn.ev'], ['tujuan', 'rn.gl'], ['rutin', 'rn.rt']].map(function (x) {
      return '<button class="' + (tab === x[0] ? 'on' : '') + '" data-act="rn-tab" data-v="' + x[0] + '">' + t(x[1]) + '</button>'; }).join('') + '</div>';
    return h + (tab === 'anggaran' ? vAnggaran() : tab === 'event' ? vEvent() : tab === 'tujuan' ? vGoals() : vRutin());
  }
  X.pages.rencana = {title: function () { return t('pg.rencana'); }, render: vRencana};

  // ---------------------------------------------------------------- kait ke Beranda & Transaksi
  X.hooks.txTop = function () {
    var due = dueList().slice(0, 3), sg = suggestions().slice(0, 2);
    if (!due.length && !sg.length) return '';
    return '<div class="rutinbox">' + due.map(dueCard).join('') + sg.map(function (s, i) { return sugCard(s, i); }).join('') + '</div>';
  };
  X.hooks.homeTop = function () { var due = dueList().slice(0, 2); return due.length ? '<div class="rutinbox">' + due.map(dueCard).join('') + '</div>' : ''; };
  // ---------------------------------------------------------------- v2.3: ringkasan Rencana (anggaran, acara, tujuan) + status
  function stBud(p) { return p > 1 ? 'bad' : (p >= 0.8 ? 'warn' : 'ok'); }
  function planState(owner) {
    var today = C.todayLocal(), k = today.substr(0, 7), out = {bud: null, ev: [], gl: []};
    var lines = budgetLines();
    if (lines.length) {
      var bm = C2.budgetMonth(lines, S.tx, k, owner || 'Semua');
      if (bm.rows.length) {
        var T = bm.total, p = T.tersedia ? T.terpakai / T.tersedia : 0;
        var tight = bm.rows.filter(function (r) { return r.tersedia > 0 || r.terpakai > 0; }).sort(function (a, b) { return b.pct - a.pct; });
        out.bud = {T: T, p: p, st: stBud(p), rows: bm.rows, worst: tight[0] && tight[0].pct >= 0.8 ? tight[0] : null, nWarn: tight.filter(function (r) { return r.pct >= 0.8; }).length};
      }
    }
    rc.list('event').filter(function (e) { return e.aktif !== false; }).forEach(function (e) {
      var a = C2.eventActual(e, S.tx), bud = +e.anggaran || 0, p = bud ? a.total / bud : 0;
      var phase = e.mulai && e.mulai > today ? 1 : (e.selesai && e.selesai < today ? 2 : 0);
      out.ev.push({e: e, a: a, bud: bud, p: p, st: bud ? stBud(p) : 'ok', phase: phase});
    });
    out.ev.sort(function (x, y) { return (x.phase - y.phase) || ((x.phase === 2 ? -1 : 1) * String(x.e.mulai || '').localeCompare(String(y.e.mulai || ''))); });
    var wm = walletMap();
    rc.list('tujuan').filter(function (g) { return g.aktif !== false; }).forEach(function (g) {
      var p = C2.goalProgress(g, wm, today), st = p.selesai ? 'done' : (p.status === 'lewat' ? 'late' : (p.pct >= 0.9 ? 'near' : 'go'));
      out.gl.push({g: g, p: p, st: st});
    });
    var rank = {late: 0, near: 1, go: 2, done: 3};
    out.gl.sort(function (a, b) { return (rank[a.st] - rank[b.st]) || String(a.g.tenggat || '9999').localeCompare(String(b.g.tenggat || '9999')); });
    return out;
  }
  var BADGE = {ok: ['ok', 'pl.st.ok'], warn: ['warn', 'pl.st.warn'], bad: ['bad', 'pl.st.bad'], done: ['ok', 'pl.st.done'], near: ['ok', 'pl.st.near'], late: ['warn', 'pl.st.late'], go: ['', 'pl.st.go']};
  function badge(st) { var b = BADGE[st]; return '<span class="pst ' + b[0] + '"><i></i>' + esc(t(b[1])) + '</span>'; }
  function planRow(tab, title, sub, p, st, more) {
    return '<button class="plr tap" data-act="home-plan" data-v="' + tab + '"><div class="sr"><span class="plt">' + esc(title) + '</span>' + badge(st) + '</div>' +
      '<div class="sr"><span class="muted sm">' + esc(sub) + '</span>' + (p != null ? '<b class="sm">' + pct(p) + '</b>' : '') + '</div>' + (p != null ? pbar(p, st === 'done' || st === 'near' ? 'good' : (st === 'late' ? 'warn' : '')) : '') +
      (more ? '<div class="muted sm" style="margin-top:4px">' + esc(more) + '</div>' : '') + '</button>';
  }
  X.hooks.homeMid = function () {
    var P = planState(S.owner), rows = [];
    if (P.bud) {
      var B = P.bud, more = B.worst ? t('pl.tight', lineName(B.worst.line) + (B.worst.line.pemilik && S.owner === 'Semua' ? ' (' + B.worst.line.pemilik + ')' : ''), pct(B.worst.pct)) + (B.nWarn > 1 ? ' · ' + t('pl.more.bud', B.nWarn - 1) : '') : '';
      var bst = B.worst && B.worst.pct > 1 ? 'bad' : (B.worst && B.st === 'ok' ? 'warn' : B.st);
      rows.push(planRow('anggaran', t('home.budget'), t('bl.used.of', X.shortRp(B.T.terpakai), X.shortRp(B.T.tersedia)), B.p, bst, more));
    }
    if (P.ev.length) {
      var E = P.ev[0];
      rows.push(planRow('event', t('pl.ev', E.e.nama), E.bud ? t('bl.used.of', X.shortRp(E.a.total), X.shortRp(E.bud)) : t('ev.spent', fm(E.a.total)), E.bud ? E.p : null, E.st, P.ev.length > 1 ? t('pl.more', P.ev.length - 1) : ''));
    }
    if (P.gl.length) {
      var G = P.gl[0];
      rows.push(planRow('tujuan', t('pl.gl', G.g.nama), t('bl.used.of', X.shortRp(G.p.terkumpul), X.shortRp(G.p.target)) + (G.g.tenggat ? ' · ' + t('gl.by', C.fmtTgl(G.g.tenggat)) : ''), G.p.pct, G.st, P.gl.length > 1 ? t('pl.more', P.gl.length - 1) : ''));
    }
    if (!rows.length) return '';
    return '<div class="card plan"><div class="h2row" style="margin:0 0 4px"><h3>' + t('pl.title') + '</h3><button class="link" data-act="home-plan" data-v="' + (P.bud ? 'anggaran' : (P.ev.length ? 'event' : 'tujuan')) + '">' + t('see.all') + '</button></div>' + rows.join('') + '</div>';
  };
  /** Peringatan rencana untuk lonceng (gabungan semua pemilik). */
  function planAlerts() {
    var P = planState('Semua'), out = [];
    if (P.bud) P.bud.rows.forEach(function (r) {
      if (r.pct >= 0.8 && r.pct <= 1) out.push({level: 'warn', kode: 'pl.bud.near', id: r.line.id, args: [lineName(r.line) + (r.line.pemilik ? ' (' + r.line.pemilik + ')' : ''), Math.round(r.pct * 100), r.sisa]});
    });
    P.ev.forEach(function (E) {
      if (!E.bud || E.phase === 2) return;
      if (E.p > 1) out.push({level: 'bad', kode: 'pl.ev.over', id: E.e.id, args: [E.e.nama, E.a.total - E.bud]});
      else if (E.p >= 0.8) out.push({level: 'warn', kode: 'pl.ev.near', id: E.e.id, args: [E.e.nama, Math.round(E.p * 100)]});
    });
    P.gl.forEach(function (G) {
      if (G.st === 'done') out.push({level: 'note', kode: 'pl.gl.done', id: G.g.id, args: [G.g.nama, G.p.terkumpul]});
      else if (G.st === 'near') out.push({level: 'note', kode: 'pl.gl.near', id: G.g.id, args: [G.g.nama, Math.round(G.p.pct * 100), G.p.sisa]});
      else if (G.st === 'late') out.push({level: 'warn', kode: 'pl.gl.late', id: G.g.id, args: [G.g.nama, G.p.sisa]});
    });
    return out;
  }
  X.plan = {planState: planState, planAlerts: planAlerts, markDone: markDone, rutinFromTx: rutinFromTx, budgetLines: budgetLines, incomeLines: incomeLines, allBudgetLines: allBudgetLines, dueList: dueList, myRecs: myRecs, formFromRec: formFromRec, recs: recs};

  // ---------------------------------------------------------------- aksi
  function saveVia(promise, done) { PF.busy = true; PF.err = ''; renderForm(); promise.then(function () { PF = null; X.closeOverlays(); X.toast(t('saved')); X.render(); if (done) done(); }).catch(fail); }
  Object.assign(A, {
    'rn-tab': function (el) { S.rtab = el.dataset.v; X.render(); },
    'home-plan': function (el) { S.rtab = el.dataset.v; X.openPage('rencana'); },
    'bm-prev': function () { S.bm = C2.addMonthKey(curMonth(), -1); X.render(); },
    'bm-next': function () { S.bm = C2.addMonthKey(curMonth(), 1); X.render(); },
    'bl-new': function () { blPick(); },
    'bl-jenis': function (el) { S.bjenis = el.dataset.v; X.render(); },
    'bl-tog': function (el) { S.bopen = S.bopen || {}; var key = curJenis() + ':' + el.dataset.g; S.bopen[key] = !S.bopen[key]; X.render(); },
    'bl-cat': function (el) {
      var J = curJenis(), g = el.dataset.g, ls = allBudgetLines().filter(function (l) { return lineJenis(l) === J && lineGroup(l) === g; });
      var mine = ls.filter(function (l) { return l.scope === 'grup' && (S.owner === 'Semua' || l.pemilik === S.owner); });
      if (ls.some(function (l) { return l.scope === 'sub'; })) { S.bopen = S.bopen || {}; S.bopen[J + ':' + g] = !S.bopen[J + ':' + g]; X.render(); return; }
      if (mine.length === 1) { A['bl-open']({dataset: {id: mine[0].id}}); return; }
      var own = ls.filter(function (l) { return l.scope === 'grup' && l.pemilik === ownerNow(); })[0];
      if (own) { A['bl-open']({dataset: {id: own.id}}); return; }
      openForm('bl', null, newLine('grup', g, J));
    },
    'bl-sub': function (el) {
      var J = curJenis(), d = newLine('sub', el.dataset.k, J), grup = allBudgetLines().filter(function (l) { return l.scope === 'grup' && lineJenis(l) === J && l.key === el.dataset.g && l.pemilik === d.pemilik; })[0];
      openForm('bl', null, d, {grupId: grup ? grup.id : null});
    },
    'bl-open': function (el) {
      var l = rc.list('anggaran').filter(function (x) { return x.id === el.dataset.id; })[0]; if (!l) return; var k = curMonth();
      var grup = l.scope === 'sub' ? allBudgetLines().filter(function (g) { return g.scope === 'grup' && lineJenis(g) === lineJenis(l) && g.key === lineGroup(l) && g.pemilik === l.pemilik; })[0] : null;
      openForm('bl', l.id, Object.assign({rincian: [], ov: {}}, JSON.parse(JSON.stringify(l)), {ovm: l.ov && l.ov[k] != null ? l.ov[k] : 0}), {grupId: grup ? grup.id : null});
    },
    'bl-save': function () {
      var d = PF.d, k = curMonth(), rin = (d.rincian || []).filter(function (r) { return (r.n || '').trim() || +r.j; }).map(function (r) { return {n: (r.n || '').trim(), j: +r.j || 0, k: +r.k || 1}; });
      var jumlah = rin.length ? rincianTotal(rin) : (+d.jumlah || 0);
      if (!(jumlah > 0)) { PF.err = t('bl.err.amount'); renderForm(); return; }
      var ov = Object.assign({}, d.ov || {}); if (+d.ovm > 0) ov[k] = +d.ovm; else delete ov[k];
      if (!d.pemilik) { PF.err = t('bl.err.owner'); renderForm(); return; }
      var dup = allBudgetLines().some(function (l) { return l.id !== PF.id && lineJenis(l) === lineJenis(d) && l.scope === d.scope && l.key === d.key && l.pemilik === d.pemilik; });
      if (dup) { PF.err = t('bl.err.dup', d.pemilik); renderForm(); return; }
      var data = {scope: d.scope, key: d.key, pemilik: d.pemilik, rincian: rin, jumlah: jumlah, rollover: lineJenis(d) === 'Expense' && !!d.rollover, mulai: d.mulai || k, ov: ov, aktif: true};
      if (lineJenis(d) === 'Income') data.jenis = 'Income';
      if (d.sampai) data.sampai = d.sampai; if (d.sumber) data.sumber = d.sumber;
      // v2.4: mengisi subkategori menggantikan nominal kategori (jumlah kategori = jumlah subkategori)
      var grup = d.scope === 'sub' ? allBudgetLines().filter(function (l) { return l.scope === 'grup' && lineJenis(l) === lineJenis(d) && l.key === lineGroup(d) && l.pemilik === d.pemilik; })[0] : null;
      if (grup) saveVia(rc.batch([{op: 'simpan', tipe: 'anggaran', id: PF.id || undefined, data: data}, {op: 'hapus', id: grup.id}]));
      else saveVia(rc.save('anggaran', data, PF.id));
    },
    'bl-del': function () { if (!confirm(t('bl.del.q'))) return; var id = PF.id; saveVia(rc.remove(id)); },
    'bl-owner': function (el) { PF.d.pemilik = el.dataset.v; renderForm(); },
    'bl-realok': function () { openForm('ro', null, {from: '', to: '', jumlah: 0}); },
    'ro-from': function (el) { PF.d.from = el.dataset.id; renderForm(); },
    'ro-to': function (el) { PF.d.to = el.dataset.id; renderForm(); },
    'ro-save': function () {
      var d = PF.d, ls = budgetLines(), a = ls.filter(function (l) { return l.id === d.from; })[0], b = ls.filter(function (l) { return l.id === d.to; })[0];
      if (!a || !b || a.id === b.id || (a.pemilik || '') !== (b.pemilik || '')) { PF.err = t('ro.err.pick'); renderForm(); return; }
      if (!(+d.jumlah > 0)) { PF.err = t('bl.err.amount'); renderForm(); return; }
      var k = curMonth();
      try {
        var sp = C2.spentByMonth(S.tx, a, a.pemilik || S.owner), det = C2.monthDetail(a, k, sp);
        if (d.jumlah > Math.max(0, det.sisa)) { PF.err = t('ro.err.left', fm(Math.max(0, det.sisa))); renderForm(); return; }
        var ab = C2.reallocate(a, b, k, +d.jumlah);
        saveVia(rc.batch([{op: 'simpan', tipe: 'anggaran', id: a.id, data: strip(ab[0])}, {op: 'simpan', tipe: 'anggaran', id: b.id, data: strip(ab[1])}]));
      } catch (e) { PF.err = e.message; renderForm(); }
    },
    'pf-toggle': function (el) { PF.d[el.dataset.k] = !(PF.d[el.dataset.k] === undefined ? true : PF.d[el.dataset.k]); renderForm(); },
    'pf-radd': function (el) { var l = el.dataset.list; PF.d[l] = PF.d[l] || []; PF.d[l].push(l === 'items' ? {g: expenseGroups()[0], k: '', j: 0} : {n: '', j: 0, k: 1}); renderForm(); },
    'pf-rdel': function (el) { PF.d[el.dataset.list].splice(+el.dataset.i, 1); renderForm(); },
    // event
    'ev-new': function () { openForm('ev', null, {nama: '', tag: '', mulai: '', selesai: '', anggaran: 0, items: []}); },
    'ev-open': function (el) { var e = rc.list('event').filter(function (x) { return x.id === el.dataset.id; })[0]; if (e) openForm('ev', e.id, JSON.parse(JSON.stringify(e))); },
    'ev-save': function () {
      var d = PF.d, nama = (d.nama || '').trim(), tag = norm(d.tag || nama);
      if (nama.length < 2) { PF.err = t('w.short'); renderForm(); return; }
      var items = (d.items || []).filter(function (i) { return +i.j > 0; }).map(function (i) { return {g: i.g, k: i.k || '', j: +i.j}; });
      saveVia(rc.save('event', {nama: nama, tag: '#' + tag, mulai: d.mulai || '', selesai: d.selesai || '', anggaran: +d.anggaran || rincianTotal(items.map(function (i) { return {j: i.j, k: 1}; })), items: items, foto: d.foto || '', aktif: true}, PF.id));
    },
    'ph-pick': function () { var i = document.getElementById('file-ph'); if (i) i.click(); },
    'ph-del': function () { if (PF && PF.d) { PF.d.foto = ''; renderForm(); } },
    'ev-del': function () { if (!confirm(t('bl.del.q'))) return; saveVia(rc.remove(PF.id)); },
    'ev-tx': function (el) { var e = rc.list('event').filter(function (x) { return x.id === el.dataset.id; })[0]; if (!e) return; S.q = norm(e.tag); S.txPer = 'semua'; S.owner = 'Semua'; X.setTab('transaksi'); },
    // tujuan
    'gl-new': function () { openForm('gl', null, {nama: '', target: 0, tenggat: '', dompet: [], awal: 0, setoran: []}); },
    'gl-open': function (el) { var g = rc.list('tujuan').filter(function (x) { return x.id === el.dataset.id; })[0]; if (g) openForm('gl', g.id, JSON.parse(JSON.stringify(g))); },
    'gl-wallet-add': function () {
      var have = PF.d.dompet || [], items = S.M.dompetAktif.filter(function (w) { return have.indexOf(w.Nama) < 0; }).map(function (w) { return {v: w.Nama, l: w.Nama, g: w.Pemilik}; });
      X.openPicker({title: t('f.wallet.title'), items: items, onPick: function (it) { PF.d.dompet = (PF.d.dompet || []).concat([it.v]); X.closePicker(); renderForm(); }});
    },
    'gl-wallet-del': function (el) { PF.d.dompet.splice(+el.dataset.i, 1); renderForm(); },
    'gl-save': function () {
      var d = PF.d, nama = (d.nama || '').trim();
      if (nama.length < 2) { PF.err = t('w.short'); renderForm(); return; }
      if (!(+d.target > 0)) { PF.err = t('bl.err.amount'); renderForm(); return; }
      saveVia(rc.save('tujuan', {nama: nama, target: +d.target, tenggat: d.tenggat || '', dompet: d.dompet || [], awal: +d.awal || 0, setoran: d.setoran || [], foto: d.foto || '', aktif: true}, PF.id));
    },
    'gl-del': function () { if (!confirm(t('bl.del.q'))) return; saveVia(rc.remove(PF.id)); },
    'gl-setor': function (el) { var g = rc.list('tujuan').filter(function (x) { return x.id === el.dataset.id; })[0]; if (g) openForm('setor', g.id, {tgl: C.todayLocal(), jumlah: 0}, {goal: g}); },
    'gl-setor-save': function () {
      var d = PF.d, g = PF.goal; if (!(+d.jumlah > 0)) { PF.err = t('bl.err.amount'); renderForm(); return; }
      var data = Object.assign({}, g, {setoran: (g.setoran || []).concat([{tgl: d.tgl || C.todayLocal(), jumlah: +d.jumlah}])});
      saveVia(rc.save('tujuan', data, g.id));
    },
    // rutin
    'rt-confirm': function (el) { logDue(el.dataset.id, el.dataset.due); },
    'rt-skip': function (el) { markDone(el.dataset.id, el.dataset.due).then(function () { X.render(); }); X.toast(t('rt.skipped')); },
    'rt-edit-due': function (el) {
      var r = rc.list('berulang').filter(function (x) { return x.id === el.dataset.id; })[0]; if (!r) return;
      X.openForm(formFor(r, el.dataset.due), {rec: {id: r.id, due: el.dataset.due}});
    },
    'rt-edit': function (el) { var r = rc.list('berulang').filter(function (x) { return x.id === el.dataset.id; })[0]; if (r) openRutin(r.id, JSON.parse(JSON.stringify(Object.assign({nama: recName(r), jumlah: r.p.jumlah}, r)))); },
    'rt-freq': function (el) { var f = el.dataset.v.split(':'); PF.d.frek = f[0]; PF.d.interval = +f[1]; renderForm(); },
    'rt-save': function () {
      var d = PF.d, nama = (d.nama || '').trim();
      if (!(+d.jumlah > 0)) { PF.err = t('bl.err.amount'); renderForm(); return; }
      if (!d.mulai) { PF.err = t('rt.err.date'); renderForm(); return; }
      var p = Object.assign({}, d.p, {jumlah: +d.jumlah});
      var data = {nama: nama, p: p, frek: d.frek, interval: d.interval || 1, mulai: d.mulai, akhir: d.akhir || '', terakhir: d.terakhir || '', aktif: d.aktif !== false, key: d.key};
      if (PF.id && d.mulai !== (PF.d._mulai0 || d.mulai)) data.terakhir = '';
      saveVia(rc.save('berulang', data, PF.id));
    },
    'rt-del': function () { if (!confirm(t('bl.del.q'))) return; saveVia(rc.remove(PF.id)); },
    'rt-accept': function (el) {
      var s = suggestions()[+el.dataset.i]; if (!s) return;
      var lastTx = C.recent(S.tx, function (x) { return x.Jenis === s.jenis && x.KodeAkun === s.kodeAkun && x.Dompet === s.dompet; }, 1)[0];
      var data = {nama: '', p: {jenis: s.jenis, dompet: s.dompet, kodeAkun: s.kodeAkun, jumlah: s.jumlah, toko: s.toko, jam: lastTx ? lastTx.Waktu.substr(11, 5) : ''}, frek: s.frek, interval: s.interval, mulai: s.terakhir, akhir: '', terakhir: s.terakhir, aktif: true, key: s.key};
      rc.save('berulang', data).then(function () { X.toast(t('rt.made')); S._sugKey = null; X.render(); }).catch(function (e) { X.toast(X.srvErr(e)); });
    },
    'rt-reject': function (el) {
      var s = suggestions()[+el.dataset.i]; if (!s) return;
      rc.save('berulang', {tolak: true, key: s.key, aktif: false}).then(function () { S._sugKey = null; X.render(); }).catch(function (e) { X.toast(X.srvErr(e)); });
    }
  });
  function strip(l) { var d = Object.assign({}, l); delete d.id; delete d._oleh; return d; }
  // rutin dari transaksi: awal dibuka lewat rutinFromTx; simpan memakai 'rt-save'. Catat tanggal awal agar perubahan jadwal mengatur ulang 'terakhir'.
  var _open = openRutin; openRutin = function (id, d) { d._mulai0 = d.mulai; _open(id, d); };
})();
