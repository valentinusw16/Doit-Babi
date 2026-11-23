if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['viz'] = '3.4.2';
/* Do it v3.4.2 - visualisasi: batang persen, donat, kartu per kelompok CoA, kartu pendapatan/pengeluaran sampai subkategori, kartu utang/piutang. */
(function () {
  'use strict';
  var X = window.DoIt; if (!X) return;
  var C = X.C, S = X.S, I = window.I18N, esc = X.esc, t = X.t, dn = X.dn, C2 = X.C2;
  I.add('id', {'vz.comp': 'Komposisi', 'vz.group': 'Per kelompok', 'vz.top': 'Subkategori terbesar', 'vz.topn': 'Transaksi terbesar', 'vz.other': 'Lainnya ({0})', 'vz.share': 'dari total', 'vz.debt.mix': 'Piutang dan utang', 'vz.debt.who': 'Saldo bersih per orang', 'vz.debt.term': 'Per jangka waktu', 'vz.debt.due': 'Jatuh tempo', 'vz.due.late': 'Lewat tempo', 'vz.due.30': '30 hari ke depan', 'vz.due.far': 'Lebih dari 30 hari', 'vz.due.none': 'Tanpa tenggat', 'vz.in': 'Piutang', 'vz.out': 'Utang', 'vz.kelas': 'Per jenis isi', 'vz.empty': 'Belum ada data', 'vz.n': '{0} item', 'vz.acc': 'akun'});
  I.add('en', {'vz.comp': 'Composition', 'vz.group': 'By group', 'vz.top': 'Largest subcategories', 'vz.topn': 'Largest transactions', 'vz.other': 'Others ({0})', 'vz.share': 'of total', 'vz.debt.mix': 'Receivable and payable', 'vz.debt.who': 'Net per person', 'vz.debt.term': 'By term', 'vz.debt.due': 'Due dates', 'vz.due.late': 'Overdue', 'vz.due.30': 'Next 30 days', 'vz.due.far': 'Later than 30 days', 'vz.due.none': 'No due date', 'vz.in': 'Receivable', 'vz.out': 'Payable', 'vz.kelas': 'By holding type', 'vz.empty': 'No data yet', 'vz.n': '{0} items', 'vz.acc': 'accounts'});
  var PAL = ['#c2185b', '#1f9d63', '#d6a24c', '#5c6bc0', '#26a69a', '#8e5bd1', '#e0703a', '#4f8fc0', '#a0a64a', '#7a7a7a'];
  function col(i) { return PAL[i % PAL.length]; }
  function pc(v, tot) { var p = tot ? v / tot * 100 : 0; return (p >= 10 ? Math.round(p) : Math.round(p * 10) / 10).toString().replace('.', S.pref.lang === 'en' ? '.' : ',') + '%'; }
  function fm(n) { return C.fmtRp(n); }
  /** daftar batang persen. items: [{nama, v, ico?, c?}] */
  function rows(items, tot, o) {
    o = o || {}; var mx = items.reduce(function (m, x) { return Math.max(m, Math.abs(x.v)); }, 1), lim = o.limit || 8, shown = items.slice(0, lim), rest = items.slice(lim);
    if (rest.length) shown = shown.concat([{nama: t('vz.other', rest.length), v: rest.reduce(function (s, x) { return s + x.v; }, 0), c: '#9aa0a6'}]);
    return shown.map(function (x, i) {
      return '<div class="vzr"><div class="vzt">' + (x.ico ? '<span class="vzi">' + x.ico + '</span>' : '<i style="background:' + (x.c || o.color || col(i)) + '"></i>') + '<span class="vzn">' + esc(x.nama) + '</span><b>' + esc(fm(x.v)) + '</b><em>' + pc(Math.abs(x.v), tot) + '</em></div>' +
        '<div class="vzb"><i style="width:' + Math.max(2, Math.abs(x.v) / mx * 100) + '%;background:' + (x.c || o.color || col(i)) + '"></i></div></div>';
    }).join('');
  }
  function stack(items, tot) {
    return '<div class="vzs">' + items.map(function (x, i) { return '<i style="width:' + (tot ? Math.abs(x.v) / tot * 100 : 0) + '%;background:' + (x.c || col(i)) + '" title="' + esc(x.nama) + ' ' + pc(Math.abs(x.v), tot) + '"></i>'; }).join('') + '</div>';
  }
  function legend(items, tot) { return '<div class="vzl">' + items.slice(0, 8).map(function (x, i) { return '<span><i style="background:' + (x.c || col(i)) + '"></i>' + esc(x.nama) + ' <b>' + pc(Math.abs(x.v), tot) + '</b></span>'; }).join('') + '</div>'; }
  /** groups: [{nama, total, items:[{nama,v}], extra:[{title, items}], ico}] */
  function dist(groups, tot, label) {
    groups = groups.filter(function (g) { return g.total > 0; }).sort(function (a, b) { return b.total - a.total; }); if (!groups.length) return '';
    var gi = groups.map(function (g, i) { return {nama: g.nama, v: g.total, c: col(i)}; });
    var h = '<div class="g2"><div class="card"><div class="ch">' + t('vz.comp') + '</div><div class="donutrow">' + X.donut(groups.map(function (g) { return {nama: g.nama, total: g.total}; }), tot, label || t('po.total')) + '<div class="vzl col">' + gi.map(function (x) { return '<span><i style="background:' + x.c + '"></i>' + esc(x.nama) + ' <b>' + pc(x.v, tot) + '</b></span>'; }).join('') + '</div></div></div>' +
      '<div class="card"><div class="ch">' + t('vz.group') + '</div>' + stack(gi, tot) + rows(gi, tot, {limit: 12}) + '</div></div>';
    h += '<div class="g3">' + groups.map(function (g, gi2) {
      var its = g.items.filter(function (x) { return x.v > 0; }).sort(function (a, b) { return b.v - a.v; });
      return '<div class="card vzg"><div class="ah"><span class="gi" style="color:' + col(gi2) + '">' + (g.ico || '') + '</span><span>' + esc(g.nama) + '<small class="muted sm dnet">' + esc(t('vz.n', its.length)) + '</small></span><b>' + esc(fm(g.total)) + '</b></div>' +
        '<div class="vzsub">' + pc(g.total, tot) + ' ' + t('vz.share') + '</div>' + stack(its, g.total) + rows(its, g.total, {limit: 7}) +
        (g.extra || []).map(function (e) { var ex = e.items.filter(function (x) { return x.v > 0; }).sort(function (a, b) { return b.v - a.v; }); return ex.length ? '<div class="vzex">' + esc(e.title) + '</div>' + stack(ex, g.total) + rows(ex, g.total, {limit: 6}) : ''; }).join('') + '</div>';
    }).join('') + '</div>';
    return h;
  }
  /** Pendapatan/Pengeluaran: part.groups = [{nama,total,rows:[{nama,jumlah,kode?}]}] */
  function flow(part, isInc, txs) {
    var col0 = isInc ? '#1f9d63' : '#e4572e', gs = part.groups.filter(function (g) { return g.nama !== X.NONOP_G && g.total > 0; });
    var gi = gs.map(function (g, i) { return {nama: dn(g.nama), v: g.total, ico: X.catIcon(g.nama), c: col(i)}; });
    var subs = []; gs.forEach(function (g, i) { g.rows.forEach(function (x) { subs.push({nama: dn(x.nama) + ' · ' + dn(g.nama), v: x.jumlah, ico: X.catIcon(g.nama, x.nama, x.kode), c: col(i)}); }); });
    subs.sort(function (a, b) { return b.v - a.v; });
    var h = '<div class="g2">';
    if (txs && txs.length) {
      var top = txs.slice().sort(function (a, b) { return +b.Jumlah - +a.Jumlah; }).slice(0, 6);
      h += '<div class="card"><div class="ch">' + t('vz.topn') + '</div>' + top.map(function (x) { var k = S.M.katByKode[x.KodeAkun] || {}; return '<div class="row tap" data-act="tx-open" data-id="' + esc(x.ID) + '"><div class="grow"><div class="t">' + esc(x.Barang || x.Toko || dn(k.SubKategori || '') || '-') + '</div><div class="s">' + esc(C.fmtTgl(x.Waktu.substr(0, 10))) + ' · ' + esc(dn(k.Kategori || '')) + '</div></div><div class="a ' + (isInc ? 'in' : 'out') + '">' + esc(fm(+x.Jumlah)) + '</div></div>'; }).join('') + '</div>';
    }
    return h + '</div>';
  }
  /** Utang Piutang */
  function debt(f) {
    var ls = C.openLoans(S.tx).filter(function (l) { return !f || l.pemilik === f.pemilik; }), today = C.todayLocal(); if (!ls.length) return '';
    var tp = 0, tu = 0, by = {}, term = {}, due = {late: 0, d30: 0, far: 0, none: 0}, d30 = C2.addDays ? C2.addDays(today, 30) : today;
    ls.forEach(function (l) {
      var s = l.kind === 'Piutang' ? l.sisa : -l.sisa; if (l.kind === 'Piutang') tp += l.sisa; else tu += l.sisa; by[l.pihak] = (by[l.pihak] || 0) + s;
      var k = l.kind + ':' + (l.jangka || '-'); term[k] = (term[k] || 0) + l.sisa;
      if (!l.jatuhTempo) due.none += l.sisa; else if (l.jatuhTempo < today) due.late += l.sisa; else if (l.jatuhTempo <= d30) due.d30 += l.sisa; else due.far += l.sisa;
    });
    var tot = tp + tu, mix = [{nama: t('vz.in'), v: tp, c: '#1f9d63'}, {nama: t('vz.out'), v: tu, c: '#e4572e'}];
    var who = Object.keys(by).map(function (k) { return {nama: k, v: Math.abs(by[k]), c: by[k] >= 0 ? '#1f9d63' : '#e4572e', s: by[k]}; }).sort(function (a, b) { return b.v - a.v; }), wt = who.reduce(function (s, x) { return s + x.v; }, 0);
    var tm = Object.keys(term).map(function (k) { var p = k.split(':'); return {nama: t(p[0] === 'Piutang' ? 'vz.in' : 'vz.out') + ' · ' + (p[1] === '-' ? '—' : p[1]), v: term[k], c: p[0] === 'Piutang' ? '#1f9d63' : '#e4572e'}; }).sort(function (a, b) { return b.v - a.v; });
    var dd = [{nama: t('vz.due.late'), v: due.late, c: '#d6455d'}, {nama: t('vz.due.30'), v: due.d30, c: '#d6a24c'}, {nama: t('vz.due.far'), v: due.far, c: '#26a69a'}, {nama: t('vz.due.none'), v: due.none, c: '#9aa0a6'}].filter(function (x) { return x.v > 0; });
    return '<div class="g2"><div class="card"><div class="ch">' + t('vz.debt.mix') + '</div>' + stack(mix, tot) + rows(mix, tot) + '</div>' +
      '<div class="card"><div class="ch">' + t('vz.debt.due') + '</div>' + stack(dd, tot) + rows(dd, tot) + '</div>' +
      '<div class="card"><div class="ch">' + t('vz.debt.who') + '</div>' + rows(who.map(function (x) { return {nama: x.nama + (x.s >= 0 ? '' : ' (−)'), v: x.v, c: x.c}; }), wt, {limit: 8}) + '</div>' +
      '<div class="card"><div class="ch">' + t('vz.debt.term') + '</div>' + rows(tm, tot) + '</div></div>';
  }
  X.viz = {dist: dist, flow: flow, debt: debt, rows: rows, stack: stack, pc: pc, col: col};
})();
