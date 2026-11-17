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
    S.M.kategori.forEach(function (k) { if (k.Jenis === 'Expense' && !seen[k.Kategori]) { seen[k.Kategori] = 1; g.push(k.Kategori); } });
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
    if (el.dataset.pfr === 'g') PF.d[el.dataset.list][+el.dataset.i].g = el.value;
  });
  function rincianTotal(r) { return (r || []).reduce(function (a, x) { return a + (+x.j || 0) * (+x.k || 1); }, 0); }

  // ---------------------------------------------------------------- ANGGARAN
  function lineName(l) { if (l.scope === 'sub') { var k = S.M.katByKode[l.key]; return k ? dn(k.SubKategori) : l.key; } return dn(l.key); }
  function lineGroup(l) { return l.scope === 'sub' ? ((S.M.katByKode[l.key] || {}).Kategori || '') : l.key; }
  function budgetLines() { return rc.list('anggaran').filter(function (l) { return l.aktif !== false; }); }
  function vAnggaran() {
    var k = curMonth(), lines = budgetLines(), bm = C2.budgetMonth(lines, S.tx, k, S.owner), today = C.todayLocal(), isNow = k === today.substr(0, 7);
    var h = '<div class="mnav"><button class="hb" data-act="bm-prev" aria-label="‹">' + ICON.back + '</button><b>' + esc(monthLabel(k)) + '</b><button class="hb" data-act="bm-next" aria-label="›">' + '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>' + '</button></div>';
    h += '<div class="stick"><div class="frow">' + X.ownerChips(S.owner, 'owner') + '</div></div>';
    var T = bm.total, p = T.tersedia ? T.terpakai / T.tersedia : 0;
    h += '<div class="card hero"><div class="lbl">' + t('bl.total') + '</div><div class="big">' + esc(fm(T.tersedia)) + '</div>' +
      '<div class="sr" style="margin-top:6px"><span>' + esc(t('bl.used', fm(T.terpakai))) + '</span><b class="' + (T.sisa < 0 ? 'out' : 'in') + '">' + esc(t(T.sisa < 0 ? 'bl.over' : 'bl.left', fm(Math.abs(T.sisa)))) + '</b></div>' + pbar(p) +
      (isNow && T.terpakai ? '<div class="sub2">' + esc(t('bl.proj', fm(C2.projection(T.terpakai, k, today)))) + '</div>' : '') + '</div>';
    h += '<div class="btnrow"><button class="btn" data-act="bl-new">' + ICON.plus + t('bl.add') + '</button>' + (bm.rows.length > 1 ? '<button class="btn" data-act="bl-realok">' + ICON.swap + t('bl.realok') + '</button>' : '') + '</div>';
    if (!bm.rows.length) return h + '<div class="card"><div class="empty">' + t('bl.empty') + '</div></div>';
    h += bm.rows.slice().sort(function (a, b) { return b.pct - a.pct; }).map(function (r) {
      var l = r.line, notes = [];
      if (r.bawa) notes.push(t('bl.carry', fm(r.bawa)));
      if (l.rincian && l.rincian.length) notes.push(t('bl.detail', l.rincian.length));
      if (l.ov && l.ov[k] != null) notes.push(t('bl.ov'));
      return '<div class="card bl tap" data-act="bl-open" data-id="' + esc(l.id) + '"><div class="ah"><span class="gi">' + X.catIcon(lineGroup(l)) + '</span><span>' + esc(lineName(l)) + '</span><b class="' + (r.sisa < 0 ? 'out' : '') + '">' + esc(fm(r.sisa)) + '</b></div>' +
        '<div class="sr"><span class="muted">' + esc(t('bl.used.of', C.fmtNum(r.terpakai), C.fmtNum(r.tersedia))) + '</span><b>' + pct(r.pct) + '</b></div>' + pbar(r.pct) +
        (notes.length ? '<div class="s muted sm" style="margin-top:6px">' + esc(notes.join(' · ')) + '</div>' : '') + '</div>';
    }).join('');
    return h;
  }
  function blPick() {
    var have = {}; budgetLines().forEach(function (l) { have[l.scope + ':' + l.key] = 1; });
    var items = [];
    expenseGroups().forEach(function (g) { if (!have['grup:' + g]) items.push({v: 'grup:' + g, l: dn(g), g: t('bl.grp'), ico: X.catIcon(g)}); });
    S.M.kategori.forEach(function (c) { if (c.Jenis === 'Expense' && !have['sub:' + c.KodeAkun]) items.push({v: 'sub:' + c.KodeAkun, l: dn(c.SubKategori), g: dn(c.Kategori), s: t('bl.sub'), ico: X.catIcon(c.Kategori)}); });
    X.openPicker({title: t('bl.pick'), items: items, onPick: function (it) {
      var sp = it.v.split(':'); X.closePicker();
      openForm('bl', null, {scope: sp[0], key: sp.slice(1).join(':'), rincian: [], jumlah: 0, rollover: true, mulai: curMonth(), ov: {}, ovm: 0});
    }});
  }
  var FORMS = {
    bl: {
      title: function (p) { return p.id ? t('bl.edit') : t('bl.add'); },
      body: function (p) {
        var d = p.d, k = curMonth(), name = lineName(d), h = '<div class="card"><div class="ah" style="padding:0"><span class="gi">' + X.catIcon(lineGroup(d)) + '</span><span>' + esc(name) + '</span><b class="muted sm">' + t(d.scope === 'sub' ? 'bl.sub' : 'bl.grp') + '</b></div></div>';
        h += '<label class="lbl2">' + t('bl.rincian') + '</label><div class="muted sm" style="margin:-4px 0 8px">' + t('bl.rincian.hint') + '</div>';
        h += (d.rincian || []).map(function (r, i) {
          return '<div class="rrow"><input class="input" data-pfr="n" data-list="rincian" data-i="' + i + '" value="' + esc(r.n || '') + '" placeholder="' + esc(t('bl.r.name')) + '">' +
            '<input class="input" inputmode="numeric" data-pfr="j" data-list="rincian" data-i="' + i + '" value="' + (r.j ? C.fmtNum(r.j) : '') + '" placeholder="Rp"><span class="muted">×</span>' +
            '<input class="input qty" inputmode="numeric" data-pfr="k" data-list="rincian" data-i="' + i + '" value="' + (r.k == null ? '' : r.k) + '" placeholder="1"><button class="hb" data-act="pf-rdel" data-list="rincian" data-i="' + i + '" aria-label="' + t('delete') + '">' + ICON.x + '</button></div>';
        }).join('');
        h += '<button class="link" data-act="pf-radd" data-list="rincian">+ ' + t('bl.r.add') + '</button>';
        if (d.rincian && d.rincian.length) h += '<div class="card sumline"><span>' + t('bl.r.total') + '</span><b id="pf-total">' + esc(fm(rincianTotal(d.rincian))) + '</b></div>';
        else h += money(t('bl.amount'), 'jumlah', d.jumlah);
        h += '<div style="margin-top:14px">' + toggle(t('bl.rollover'), 'rollover', d.rollover) + '<div class="muted sm" style="margin:4px 2px 0">' + t('bl.rollover.hint') + '</div></div>';
        h += money(t('bl.month.only', monthLabel(k)), 'ovm', d.ovm, t('bl.month.ph'));
        return h;
      },
      foot: function () { return saveDel('bl-save', 'bl-del'); }
    },
    ev: {
      title: function (p) { return p.id ? t('ev.edit') : t('ev.add'); },
      body: function (p) {
        var d = p.d, h = inp(t('ev.name'), 'nama', d.nama, t('ev.name.ph')) + inp(t('ev.tag'), 'tag', d.tag, '#liburan-bali') + '<div class="muted sm" style="margin:4px 2px 0">' + t('ev.tag.hint') + '</div>' +
          dateIn(t('ev.from'), 'mulai', d.mulai) + dateIn(t('ev.to'), 'selesai', d.selesai) + money(t('ev.budget'), 'anggaran', d.anggaran);
        h += '<label class="lbl2">' + t('ev.items') + '</label>' + (d.items || []).map(function (r, i) {
          return '<div class="rrow"><select class="input" data-pfr="g" data-list="items" data-i="' + i + '">' + expenseGroups().map(function (g) { return '<option value="' + esc(g) + '"' + (g === r.g ? ' selected' : '') + '>' + esc(dn(g)) + '</option>'; }).join('') + '</select>' +
            '<input class="input" inputmode="numeric" data-pfr="j" data-list="items" data-i="' + i + '" value="' + (r.j ? C.fmtNum(r.j) : '') + '" placeholder="Rp"><button class="hb" data-act="pf-rdel" data-list="items" data-i="' + i + '" aria-label="' + t('delete') + '">' + ICON.x + '</button></div>';
        }).join('') + '<button class="link" data-act="pf-radd" data-list="items">+ ' + t('ev.items.add') + '</button>';
        return h;
      },
      foot: function () { return saveDel('ev-save', 'ev-del'); }
    },
    gl: {
      title: function (p) { return p.id ? t('gl.edit') : t('gl.add'); },
      body: function (p) {
        var d = p.d, h = inp(t('gl.name'), 'nama', d.nama, t('gl.name.ph')) + money(t('gl.target'), 'target', d.target) + dateIn(t('gl.due'), 'tenggat', d.tenggat);
        h += '<label class="lbl2">' + t('gl.wallets') + '</label><div class="muted sm" style="margin:-4px 0 8px">' + t('gl.wallets.hint') + '</div><div class="chips">' +
          (d.dompet || []).map(function (n, i) { return '<button class="chip sm on" data-act="gl-wallet-del" data-i="' + i + '">' + esc(n) + ' ✕</button>'; }).join('') + '<button class="chip sm more" data-act="gl-wallet-add">+ ' + t('gl.wallet.add') + '</button></div>';
        h += money(t('gl.start'), 'awal', d.awal);
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
          return '<div class="chips">' + bm.rows.map(function (r) { return '<button class="chip sm' + (d[field] === r.line.id ? ' on' : '') + '" data-act="' + act + '" data-id="' + esc(r.line.id) + '">' + esc(lineName(r.line)) + ' · ' + esc(C.fmtNum(r.sisa)) + '</button>'; }).join('') + '</div>';
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
      return '<div class="card bl"><div class="ah"><span class="gi">' + ICON.tag + '</span><span>' + esc(e.nama) + '<small class="muted sm dnet">#' + esc(norm(e.tag)) + (e.mulai ? ' · ' + esc(C.fmtTgl(e.mulai)) + (e.selesai ? ' – ' + esc(C.fmtTgl(e.selesai)) : '') : '') + '</small></span>' +
        '<button class="hb sm" data-act="ev-open" data-id="' + esc(e.id) + '" aria-label="' + t('ev.edit') + '">' + ICON.edit + '</button></div>' +
        '<div class="sr"><span class="muted">' + esc(bud ? t('bl.used.of', C.fmtNum(a.total), C.fmtNum(bud)) : t('ev.spent', fm(a.total))) + '</span>' + (bud ? '<b>' + pct(p) + '</b>' : '') + '</div>' + (bud ? pbar(p) : '') +
        (bud ? '<div class="s ' + (bud - a.total < 0 ? 'out' : 'muted') + ' sm" style="margin-top:6px">' + esc(bud - a.total < 0 ? t('bl.over', fm(a.total - bud)) : t('bl.left', fm(bud - a.total))) + '</div>' : '') +
        rows.map(function (g) {
          var v = a.byGrup[g] || 0, b = itemBud[g] || 0;
          return '<div class="subrow"><div class="sr"><span>' + esc(dn(g)) + '</span><b>' + esc(C.fmtNum(v)) + (b ? ' / ' + esc(C.fmtNum(b)) : '') + '</b></div>' + (b ? pbar(v / b) : '') + '</div>';
        }).join('') + '<div style="margin-top:8px"><button class="link" data-act="ev-tx" data-id="' + esc(e.id) + '">' + t('ev.tx', a.n) + '</button></div></div>';
    }).join('');
  }

  // ---------------------------------------------------------------- TUJUAN
  function vGoals() {
    var gs = rc.list('tujuan').filter(function (g) { return g.aktif !== false; }), wm = walletMap(), today = C.todayLocal(), h = '<div class="btnrow"><button class="btn" data-act="gl-new">' + ICON.plus + t('gl.add') + '</button></div>';
    if (!gs.length) return h + '<div class="card"><div class="empty">' + t('gl.empty') + '</div></div>';
    return h + gs.map(function (g) {
      var p = C2.goalProgress(g, wm, today), st = {tercapai: ['in', 'gl.s.done'], lewat: ['out', 'gl.s.late'], berjalan: ['', 'gl.s.go'], 'tanpa-tenggat': ['', 'gl.s.nodue']}[p.status];
      return '<div class="card bl"><div class="ah"><span class="gi">' + ICON.target + '</span><span>' + esc(g.nama) + '<small class="muted sm dnet">' + esc(g.tenggat ? t('gl.by', C.fmtTgl(g.tenggat)) : t('gl.s.nodue')) + '</small></span>' +
        '<button class="hb sm" data-act="gl-open" data-id="' + esc(g.id) + '" aria-label="' + t('gl.edit') + '">' + ICON.edit + '</button></div>' +
        '<div class="sr"><span class="muted">' + esc(t('bl.used.of', C.fmtNum(p.terkumpul), C.fmtNum(p.target))) + '</span><b>' + pct(p.pct) + '</b></div>' + pbar(p.pct, p.selesai ? '' : (p.status === 'lewat' ? 'bad' : '')) +
        '<div class="sr" style="margin-top:6px"><span class="muted sm">' + esc(p.selesai ? t('gl.s.done') : t('gl.remain', fm(p.sisa))) + '</span><span class="tag ' + (st[0] === 'out' ? 'bad' : '') + '">' + esc(t(st[1])) + '</span></div>' +
        (p.perBulan != null && !p.selesai ? '<div class="s sm" style="margin-top:4px">' + esc(t('gl.permonth', fm(p.perBulan), p.bulanTersisa)) + '</div>' : '') +
        (g.dompet && g.dompet.length ? '<div class="s muted sm" style="margin-top:4px">' + esc(t('gl.linked', g.dompet.join(', '))) + '</div>' : '') +
        '<div style="margin-top:8px"><button class="link" data-act="gl-setor" data-id="' + esc(g.id) + '">+ ' + t('gl.deposit') + '</button></div></div>';
    }).join('');
  }

  // ---------------------------------------------------------------- RUTIN
  function recName(r) { var k = S.M.katByKode[r.p && r.p.kodeAkun]; return r.nama || (k ? dn(k.SubKategori) : (r.p && r.p.jenis)); }
  function freqText(r) { return t('rt.f.' + (r.frek === 'mingguan' ? 'w' + (r.interval || 1) : (r.frek === 'tahunan' ? 'y1' : 'm1'))); }
  function recs() { return rc.list('berulang').filter(function (r) { return !r.tolak; }); }
  /** Rutin yang jatuh tempo dan belum dicatat. Hanya milik pencatat (agar tidak ganda di dua HP). */
  function dueList() {
    var today = C.todayLocal(), me = S.cfg.user, out = [];
    recs().forEach(function (r) {
      if (r.aktif === false || r._oleh !== me) return;
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
      p: {jenis: x.Jenis, dompet: x.Dompet, dompetTujuan: x.DompetTujuan, kodeAkun: x.KodeAkun, jumlah: +x.Jumlah, toko: x.Toko, lokasi: x.Lokasi, barang: x.Barang, tag: x.Tag, catatan: x.Catatan, biayaAdmin: x.BiayaAdmin},
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
  X.hooks.homeMid = function () {
    var h = '', lines = budgetLines();
    if (lines.length) {
      var k = C.todayLocal().substr(0, 7), bm = C2.budgetMonth(lines, S.tx, k, null), T = bm.total, p = T.tersedia ? T.terpakai / T.tersedia : 0;
      h += '<button class="card tap bl homebud" data-act="page" data-v="rencana"><div class="ah"><span class="gi">' + ICON.plan + '</span><span>' + t('home.budget') + '</span><b class="' + (T.sisa < 0 ? 'out' : '') + '">' + esc(fm(T.sisa)) + '</b></div>' +
        '<div class="sr"><span class="muted">' + esc(t('bl.used.of', C.fmtNum(T.terpakai), C.fmtNum(T.tersedia))) + '</span><b>' + pct(p) + '</b></div>' + pbar(p) + '</button>';
    }
    if (X.analisis) h += X.analisis.homeCard();
    return h;
  };
  X.plan = {markDone: markDone, rutinFromTx: rutinFromTx, budgetLines: budgetLines, dueList: dueList};

  // ---------------------------------------------------------------- aksi
  function saveVia(promise, done) { PF.busy = true; PF.err = ''; renderForm(); promise.then(function () { PF = null; X.closeOverlays(); X.toast(t('saved')); X.render(); if (done) done(); }).catch(fail); }
  Object.assign(A, {
    'rn-tab': function (el) { S.rtab = el.dataset.v; X.render(); },
    'bm-prev': function () { S.bm = C2.addMonthKey(curMonth(), -1); X.render(); },
    'bm-next': function () { S.bm = C2.addMonthKey(curMonth(), 1); X.render(); },
    'bl-new': function () { blPick(); },
    'bl-open': function (el) { var l = rc.list('anggaran').filter(function (x) { return x.id === el.dataset.id; })[0]; if (!l) return; var k = curMonth(); openForm('bl', l.id, Object.assign({rincian: [], ov: {}}, JSON.parse(JSON.stringify(l)), {ovm: l.ov && l.ov[k] != null ? l.ov[k] : 0})); },
    'bl-save': function () {
      var d = PF.d, k = curMonth(), rin = (d.rincian || []).filter(function (r) { return (r.n || '').trim() || +r.j; }).map(function (r) { return {n: (r.n || '').trim(), j: +r.j || 0, k: +r.k || 1}; });
      var jumlah = rin.length ? rincianTotal(rin) : (+d.jumlah || 0);
      if (!(jumlah > 0)) { PF.err = t('bl.err.amount'); renderForm(); return; }
      var ov = Object.assign({}, d.ov || {}); if (+d.ovm > 0) ov[k] = +d.ovm; else delete ov[k];
      var data = {scope: d.scope, key: d.key, rincian: rin, jumlah: jumlah, rollover: !!d.rollover, mulai: d.mulai || k, ov: ov, aktif: true};
      saveVia(rc.save('anggaran', data, PF.id));
    },
    'bl-del': function () { if (!confirm(t('bl.del.q'))) return; var id = PF.id; saveVia(rc.remove(id)); },
    'bl-realok': function () { openForm('ro', null, {from: '', to: '', jumlah: 0}); },
    'ro-from': function (el) { PF.d.from = el.dataset.id; renderForm(); },
    'ro-to': function (el) { PF.d.to = el.dataset.id; renderForm(); },
    'ro-save': function () {
      var d = PF.d, ls = budgetLines(), a = ls.filter(function (l) { return l.id === d.from; })[0], b = ls.filter(function (l) { return l.id === d.to; })[0];
      if (!a || !b || a.id === b.id) { PF.err = t('ro.err.pick'); renderForm(); return; }
      if (!(+d.jumlah > 0)) { PF.err = t('bl.err.amount'); renderForm(); return; }
      var k = curMonth();
      try {
        var sp = C2.spentByMonth(S.tx, a, S.owner), det = C2.monthDetail(a, k, sp);
        if (d.jumlah > Math.max(0, det.sisa)) { PF.err = t('ro.err.left', fm(Math.max(0, det.sisa))); renderForm(); return; }
        var ab = C2.reallocate(a, b, k, +d.jumlah);
        saveVia(rc.batch([{op: 'simpan', tipe: 'anggaran', id: a.id, data: strip(ab[0])}, {op: 'simpan', tipe: 'anggaran', id: b.id, data: strip(ab[1])}]));
      } catch (e) { PF.err = e.message; renderForm(); }
    },
    'pf-toggle': function (el) { PF.d[el.dataset.k] = !(PF.d[el.dataset.k] === undefined ? true : PF.d[el.dataset.k]); renderForm(); },
    'pf-radd': function (el) { var l = el.dataset.list; PF.d[l] = PF.d[l] || []; PF.d[l].push(l === 'items' ? {g: expenseGroups()[0], j: 0} : {n: '', j: 0, k: 1}); renderForm(); },
    'pf-rdel': function (el) { PF.d[el.dataset.list].splice(+el.dataset.i, 1); renderForm(); },
    // event
    'ev-new': function () { openForm('ev', null, {nama: '', tag: '', mulai: '', selesai: '', anggaran: 0, items: []}); },
    'ev-open': function (el) { var e = rc.list('event').filter(function (x) { return x.id === el.dataset.id; })[0]; if (e) openForm('ev', e.id, JSON.parse(JSON.stringify(e))); },
    'ev-save': function () {
      var d = PF.d, nama = (d.nama || '').trim(), tag = norm(d.tag || nama);
      if (nama.length < 2) { PF.err = t('w.short'); renderForm(); return; }
      var items = (d.items || []).filter(function (i) { return +i.j > 0; }).map(function (i) { return {g: i.g, j: +i.j}; });
      saveVia(rc.save('event', {nama: nama, tag: '#' + tag, mulai: d.mulai || '', selesai: d.selesai || '', anggaran: +d.anggaran || rincianTotal(items.map(function (i) { return {j: i.j, k: 1}; })), items: items, aktif: true}, PF.id));
    },
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
      saveVia(rc.save('tujuan', {nama: nama, target: +d.target, tenggat: d.tenggat || '', dompet: d.dompet || [], awal: +d.awal || 0, setoran: d.setoran || [], aktif: true}, PF.id));
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
      var data = {nama: '', p: {jenis: s.jenis, dompet: s.dompet, kodeAkun: s.kodeAkun, jumlah: s.jumlah, toko: s.toko}, frek: s.frek, interval: s.interval, mulai: s.terakhir, akhir: '', terakhir: s.terakhir, aktif: true, key: s.key};
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
