if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['lap'] = '3.3.0';
/* Do it v3.2b - Laporan Setahun (laba rugi, neraca, anggaran vs realisasi per bulan; satuan Rp/ribuan/jutaan),
   Analisis (komposisi, anomali, kebutuhan/keinginan/tabungan, kontribusi pemilik, proyeksi akhir tahun, kebiasaan belanja),
   serta ekspor CSV untuk semua laporan. */
(function () {
  'use strict';
  var X = window.DoIt;
  if (!X || !X.S || !X.repKinds || !X.C2 || !(function (v) { v = String(v || '0').split('.').map(Number); return v[0] >= 3; })(X.VERSION)) return;
  var S = X.S, C = X.C, C2 = X.C2, t = X.t, esc = X.esc, A = X.A, dn = X.dn, I = window.I18N, ICON = X.ICON;
  var NONOP = X.NONOP_G; X.ddOpts = X.ddOpts || {};

  if (I && I.add) {
    I.add('id', {
      'r.ann': 'Laporan Setahun', 'r.ins': 'Analisis', 'ann.is': 'Laba Rugi', 'ann.bs': 'Neraca', 'ann.bva': 'Anggaran', 'ann.unit': 'Satuan', 'ann.year': 'Tahun', 'ann.u.rp': 'Rupiah', 'ann.u.rb': 'Ribuan', 'ann.u.jt': 'Jutaan',
      'ann.tot': 'Total', 'ann.avg': 'Rata²', 'ann.detail': 'Rincian akun', 'ann.opnet': 'Laba operasional', 'ann.nonop': 'Di luar operasional', 'ann.net': 'Laba bersih', 'ann.inunit': 'Dalam {0}', 'ann.end': 'Akhir tahun',
      'ann.bud': 'Anggaran', 'ann.act': 'Realisasi', 'ann.sel': 'Selisih', 'ann.income': 'Pendapatan', 'ann.expense': 'Pengeluaran', 'ann.surplus': 'Surplus', 'ann.nobud': 'Belum ada anggaran. Atur di menu Rencana.',
      'ann.assets': 'Aset', 'ann.liab': 'Liabilitas', 'ann.equity': 'Ekuitas', 'ann.le': 'Liabilitas + Ekuitas', 'ann.empty': 'Belum ada data pada tahun ini.',
      'rep.csv': 'Ekspor CSV', 'rep.csv.ok': 'CSV tersimpan', 'rep.csv.no': 'Tidak ada data untuk diekspor',
      'ins.comp': 'Komposisi pengeluaran', 'ins.comp.s': 'Porsi tiap kelompok dari total pengeluaran, dibanding periode sebelumnya.', 'ins.vsprev': 'vs periode lalu',
      'ins.anom': 'Deteksi anomali', 'ins.anom.s': 'Pengeluaran yang jauh di atas kebiasaan 12 bulan terakhir.', 'ins.anom.none': 'Tidak ada pengeluaran yang janggal. Pola Anda stabil.', 'ins.anom.grp': 'Kelompok bulan ini naik tajam', 'ins.anom.tx': 'Transaksi tak biasa', 'ins.anom.grp.s': 'Biasanya {0}, bulan ini {1}', 'ins.anom.tx.s': 'Biasanya sekitar {0} untuk kategori ini',
      'ins.nws': 'Kebutuhan, keinginan, tabungan', 'ins.nws.s': 'Dibanding pola 50/30/20. Ketuk kelompok untuk mengubah golongannya.', 'ins.need': 'Kebutuhan', 'ins.want': 'Keinginan', 'ins.save': 'Tabungan', 'ins.of': 'dari pendapatan', 'ins.target': 'target {0}%', 'ins.setgrp': 'Golongan kelompok',
      'ins.own': 'Kontribusi per pemilik', 'ins.own.s': 'Siapa yang menyumbang pendapatan dan pengeluaran.', 'ins.share': 'porsi',
      'ins.proj': 'Proyeksi akhir tahun', 'ins.proj.s': 'Dari kinerja tahun berjalan dan rata-rata 3 bulan terakhir.', 'ins.proj.inc': 'Pendapatan', 'ins.proj.exp': 'Pengeluaran', 'ins.proj.net': 'Sisa', 'ins.proj.ytd': 'Sampai sekarang', 'ins.proj.end': 'Perkiraan 31 Des', 'ins.proj.range': 'Rentang sisa', 'ins.proj.nodata': 'Data belum cukup untuk memproyeksikan.',
      'ins.hab': 'Kebiasaan belanja', 'ins.hab.s': 'Barang, toko, dan lokasi yang paling sering dan paling besar.', 'ins.hab.item': 'Barang', 'ins.hab.shop': 'Toko', 'ins.hab.loc': 'Lokasi', 'ins.hab.n': '{0}× · rata-rata {1}', 'ins.hab.none': 'Belum ada data barang/toko/lokasi pada periode ini.', 'ins.noexp': 'Belum ada pengeluaran pada periode ini.'
    });
    I.add('en', {
      'r.ann': 'Annual Report', 'r.ins': 'Insights', 'ann.is': 'Income Statement', 'ann.bs': 'Balance Sheet', 'ann.bva': 'Budget', 'ann.unit': 'Unit', 'ann.year': 'Year', 'ann.u.rp': 'Rupiah', 'ann.u.rb': 'Thousands', 'ann.u.jt': 'Millions',
      'ann.tot': 'Total', 'ann.avg': 'Avg', 'ann.detail': 'Account detail', 'ann.opnet': 'Operating profit', 'ann.nonop': 'Non-operating', 'ann.net': 'Net profit', 'ann.inunit': 'In {0}', 'ann.end': 'Year end',
      'ann.bud': 'Budget', 'ann.act': 'Actual', 'ann.sel': 'Variance', 'ann.income': 'Income', 'ann.expense': 'Expenses', 'ann.surplus': 'Surplus', 'ann.nobud': 'No budget yet. Set one in Plans.',
      'ann.assets': 'Assets', 'ann.liab': 'Liabilities', 'ann.equity': 'Equity', 'ann.le': 'Liabilities + Equity', 'ann.empty': 'No data for this year yet.',
      'rep.csv': 'Export CSV', 'rep.csv.ok': 'CSV saved', 'rep.csv.no': 'Nothing to export',
      'ins.comp': 'Spending mix', 'ins.comp.s': 'Share of each group in total spending, compared with the previous period.', 'ins.vsprev': 'vs previous period',
      'ins.anom': 'Anomaly detection', 'ins.anom.s': 'Spending far above your habits over the last 12 months.', 'ins.anom.none': 'Nothing unusual. Your pattern is steady.', 'ins.anom.grp': 'Groups spiking this month', 'ins.anom.tx': 'Unusual transactions', 'ins.anom.grp.s': 'Usually {0}, this month {1}', 'ins.anom.tx.s': 'Usually around {0} for this category',
      'ins.nws': 'Needs, wants, savings', 'ins.nws.s': 'Compared with the 50/30/20 pattern. Tap a group to change its class.', 'ins.need': 'Needs', 'ins.want': 'Wants', 'ins.save': 'Savings', 'ins.of': 'of income', 'ins.target': 'target {0}%', 'ins.setgrp': 'Group class',
      'ins.own': 'Contribution by owner', 'ins.own.s': 'Who contributes income and spending.', 'ins.share': 'share',
      'ins.proj': 'Year-end projection', 'ins.proj.s': 'From year-to-date results and the last 3 months average.', 'ins.proj.inc': 'Income', 'ins.proj.exp': 'Expenses', 'ins.proj.net': 'Remainder', 'ins.proj.ytd': 'So far', 'ins.proj.end': 'Estimate Dec 31', 'ins.proj.range': 'Remainder range', 'ins.proj.nodata': 'Not enough data to project.',
      'ins.hab': 'Spending habits', 'ins.hab.s': 'Items, shops and places you spend on most often and most.', 'ins.hab.item': 'Items', 'ins.hab.shop': 'Shops', 'ins.hab.loc': 'Places', 'ins.hab.n': '{0}× · avg {1}', 'ins.hab.none': 'No item/shop/place data in this period.', 'ins.noexp': 'No spending in this period.'
    });
  }

  // ---------------------------------------------------------------- bantu
  function today() { return C.todayLocal(); }
  function curYear() { return +today().substr(0, 4); }
  function who(cx) { return cx.f ? cx.R.who : t('r.combined'); }
  function fObj(R) { return !R.who || R.who === 'Semua' ? null : (R.dim === 'pencatat' ? {pencatat: R.who} : {pemilik: R.who}); }
  function unit() { return S.pref.lapUnit || 'rb'; }
  function fmtU(v, u) {
    u = u || unit(); if (v == null) return '';
    var en = S.pref.lang === 'en';
    if (u === 'jt') { var x = v / 1e6; return (x < 0 ? '−' : '') + Math.abs(x).toFixed(1).replace('.', en ? '.' : ','); }
    var n = Math.round(u === 'rb' ? v / 1000 : v); return (n < 0 ? '−' : '') + C.fmtNum(Math.abs(n));
  }
  function cls(v) { return v < 0 ? 'out' : ''; }
  function mkeys(y) { var a = []; for (var i = 1; i <= 12; i++) a.push(y + '-' + (i < 10 ? '0' : '') + i); return a; }
  function mshort(k) { return C.namaBulan(+k.substr(5, 2), true); }
  function years() {
    var ys = {}; ys[curYear()] = 1; Object.keys(S.tx).forEach(function (k) { var w = S.tx[k].Waktu; if (w) ys[+w.substr(0, 4)] = 1; });
    return Object.keys(ys).map(Number).sort(function (a, b) { return b - a; });
  }
  function lapY() { var y = S.lapY || curYear(); return years().indexOf(y) < 0 ? curYear() : y; }
  function csvEsc(v) { v = v == null ? '' : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function download(name, text) {
    var blob = new Blob(['﻿' + text], {type: 'text/csv;charset=utf-8'}), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }
  function toCsv(rows) { return rows.map(function (r) { return r.map(csvEsc).join(','); }).join('\r\n'); }
  function num(str) {
    if (typeof str === 'number') return str; if (str == null) return '';
    var s = String(str).replace(/Rp\s?/g, '').replace(/[+\s]/g, ''), neg = /^[−-]/.test(s); s = s.replace(/^[−-]/, '');
    if (!/^[\d.,]+$/.test(s)) return str; var en = S.pref.lang === 'en'; s = en ? s.replace(/,/g, '') : s.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(s); return isNaN(n) ? str : (neg ? -n : n);
  }

  // ---------------------------------------------------------------- matriks tahunan
  /** Setiap matriks: {cols:[label...], rows:[{l, v:[...], k:'sec'|'tot'|'row'|'sub'|'gap', ind, tot, cls}], totLabel} */
  function bucketGroups(groups, sign, map, order, detail) {
    groups.forEach(function (g) {
      var key = g.nama; if (!map[key]) { map[key] = {l: dn(g.nama), rows: {}}; order.push(key); }
    });
  }
  function matIS(y, f, detail) {
    var ks = mkeys(y), lines = X.getLines(), td = today(), cur = td.substr(0, 7), data = [];
    ks.forEach(function (k) { data.push(k > cur ? null : X.splitIS(C.incomeStatement(lines, S.M, k + '-01', C2.monthEnd(k), f))); });
    function section(part, sign) {
      var order = [], gm = {};
      data.forEach(function (d, i) { if (!d) return; d[part].groups.forEach(function (g) {
        var o = gm[g.nama] || (gm[g.nama] = {l: dn(g.nama), v: ks.map(function () { return 0; }), rows: {}, ro: []}); if (order.indexOf(g.nama) < 0) order.push(g.nama);
        o.v[i] = g.total; g.rows.forEach(function (r) { var q = o.rows[r.kode] || (o.rows[r.kode] = {l: dn(r.nama), v: ks.map(function () { return 0; })}); if (o.ro.indexOf(r.kode) < 0) o.ro.push(r.kode); q.v[i] = r.jumlah; });
      }); });
      order.sort(function (a, b) { var sa = gm[a].v.reduce(function (x, y2) { return x + y2; }, 0), sb = gm[b].v.reduce(function (x, y2) { return x + y2; }, 0); return sb - sa; });
      return {order: order, gm: gm};
    }
    var P = section('pendapatan'), B = section('beban'), rows = [];
    function totRow(label, getter, kind, c) { return {l: label, v: data.map(function (d, i) { return d ? getter(d, i) : null; }), k: kind || 'tot', c: c}; }
    rows.push(totRow(t('r.income'), function (d) { return d.pendapatan.total; }, 'sec'));
    P.order.forEach(function (n) { var o = P.gm[n]; rows.push({l: o.l, v: o.v.map(function (x, i) { return data[i] ? x : null; }), k: 'row', ind: 1});
      if (detail) o.ro.forEach(function (c) { rows.push({l: o.rows[c].l, v: o.rows[c].v.map(function (x, i) { return data[i] ? x : null; }), k: 'sub', ind: 2}); }); });
    rows.push(totRow(t('r.expense'), function (d) { return d.beban.total; }, 'sec'));
    B.order.forEach(function (n) { var o = B.gm[n]; rows.push({l: o.l, v: o.v.map(function (x, i) { return data[i] ? x : null; }), k: 'row', ind: 1});
      if (detail) o.ro.forEach(function (c) { rows.push({l: o.rows[c].l, v: o.rows[c].v.map(function (x, i) { return data[i] ? x : null; }), k: 'sub', ind: 2}); }); });
    rows.push(totRow(t('ann.opnet'), function (d) { return d.labaOp; }, 'tot'));
    if (data.some(function (d) { return d && d.nonop.length; })) rows.push(totRow(t('ann.nonop'), function (d) { return d.nonopTotal; }, 'row'));
    rows.push(totRow(t('ann.net'), function (d) { return d.laba; }, 'tot', 'net'));
    return {cols: ks.map(mshort), rows: rows, sum: true, any: data.some(function (d) { return d && (d.pendapatan.groups.length || d.beban.groups.length); })};
  }
  function matBS(y, f, detail) {
    var ks = mkeys(y), lines = X.getLines(), cur = today().substr(0, 7), data = ks.map(function (k) { return k > cur ? null : C.balanceSheet(lines, S.M, k === cur ? today() : C2.monthEnd(k), f); }), rows = [];
    function groupRows(part, label) {
      rows.push({l: label, v: data.map(function (d) { return d ? d[part].total : null; }), k: 'sec'});
      var names = [], gm = {};
      data.forEach(function (d, i) { if (!d) return; d[part].groups.forEach(function (g) { if (!gm[g.nama]) { gm[g.nama] = {l: dn(g.nama), v: ks.map(function () { return 0; }), rows: {}, ro: []}; names.push(g.nama); } var o = gm[g.nama]; o.v[i] = g.total;
        g.rows.forEach(function (r) { if (!o.rows[r.kode]) { o.rows[r.kode] = {l: dn(r.nama), v: ks.map(function () { return 0; })}; o.ro.push(r.kode); } o.rows[r.kode].v[i] = r.jumlah; }); }); });
      names.forEach(function (n) { var o = gm[n]; rows.push({l: o.l, v: o.v.map(function (x, i) { return data[i] ? x : null; }), k: 'row', ind: 1});
        if (detail) o.ro.forEach(function (c) { rows.push({l: o.rows[c].l, v: o.rows[c].v.map(function (x, i) { return data[i] ? x : null; }), k: 'sub', ind: 2}); }); });
    }
    groupRows('aset', t('ann.assets')); groupRows('liabilitas', t('ann.liab'));
    rows.push({l: t('ann.equity'), v: data.map(function (d) { return d ? d.ekuitas.total : null; }), k: 'sec'});
    rows.push({l: t('ann.le'), v: data.map(function (d) { return d ? d.liabilitas.total + d.ekuitas.total : null; }), k: 'tot'});
    return {cols: ks.map(mshort), rows: rows, sum: false, any: data.some(function (d) { return d && d.aset.groups.length; })};
  }
  function matBVA(y, f) {
    var ks = mkeys(y), cur = today().substr(0, 7), plan = X.plan; if (!plan || !plan.allBudgetLines) return {cols: [], rows: [], any: false};
    var BL = plan.allBudgetLines(), who2 = f && f.pemilik ? f.pemilik : 'Semua';
    var data = ks.map(function (k) { return k > cur ? null : C2.budgetReport(BL, S.tx, k, who2, S.M.kategori, NONOP); });
    var any = data.some(function (d) { return d && (d.income.bud || d.expense.bud || d.income.act || d.expense.act); }), rows = [];
    if (!any || !data.some(function (d) { return d && (d.income.bud || d.expense.bud); })) return {cols: ks.map(mshort), rows: rows, sum: true, any: false};
    function r3(label, key, kind) {
      rows.push({l: label, v: data.map(function (d) { return d ? d[key].bud : null; }), k: 'sec'});
      rows.push({l: t('ann.bud'), v: data.map(function (d) { return d ? d[key].bud : null; }), k: 'row', ind: 1});
      rows.push({l: t('ann.act'), v: data.map(function (d) { return d ? d[key].act : null; }), k: 'row', ind: 1});
      rows.push({l: t('ann.sel'), v: data.map(function (d) { return d ? d[key].sel : null; }), k: 'tot', c: 'sel'});
    }
    rows.pop; rows.length = 0;
    function block(label, key) {
      rows.push({l: label, v: data.map(function () { return null; }), k: 'head'});
      rows.push({l: t('ann.bud'), v: data.map(function (d) { return d ? d[key].bud : null; }), k: 'row', ind: 1});
      rows.push({l: t('ann.act'), v: data.map(function (d) { return d ? d[key].act : null; }), k: 'row', ind: 1});
      rows.push({l: t('ann.sel'), v: data.map(function (d) { return d ? d[key].sel : null; }), k: 'tot', c: 'sel'});
    }
    block(t('ann.income'), 'income'); block(t('ann.expense'), 'expense');
    rows.push({l: t('ann.surplus'), v: data.map(function () { return null; }), k: 'head'});
    rows.push({l: t('ann.bud'), v: data.map(function (d) { return d ? d.surplus.bud : null; }), k: 'row', ind: 1});
    rows.push({l: t('ann.act'), v: data.map(function (d) { return d ? d.surplus.act : null; }), k: 'row', ind: 1});
    rows.push({l: t('ann.sel'), v: data.map(function (d) { return d ? d.surplus.sel : null; }), k: 'tot', c: 'sel'});
    // realisasi per kelompok pengeluaran
    var gm = {}, order = [];
    data.forEach(function (d, i) { if (!d) return; d.expense.groups.forEach(function (g) { if (!gm[g.nama]) { gm[g.nama] = {act: ks.map(function () { return null; }), bud: ks.map(function () { return null; })}; order.push(g.nama); } gm[g.nama].act[i] = g.act; gm[g.nama].bud[i] = g.bud; }); });
    if (order.length) {
      rows.push({l: t('ann.expense') + ' · ' + t('ann.act') + ' / ' + t('ann.bud'), v: data.map(function () { return null; }), k: 'head'});
      order.sort(function (a, b) { return sumN(gm[b].act) - sumN(gm[a].act); }).forEach(function (n) { rows.push({l: dn(n), v: gm[n].act, bud: gm[n].bud, k: 'row', ind: 1, over: true}); });
    }
    return {cols: ks.map(mshort), rows: rows, sum: 'bva', any: true};
  }
  function sumN(a) { return a.reduce(function (s, x) { return s + (x || 0); }, 0); }
  function matrix(cx) {
    var y = lapY(), tab = S.lapTab || 'is', f = fObj(cx.R), det = !!S.lapDet;
    var m = tab === 'bs' ? matBS(y, f, det) : (tab === 'bva' ? matBVA(y, f) : matIS(y, f, det)); m.tab = tab; m.year = y; return m;
  }
  function rowTotal(r, m) {
    if (m.sum === true) { var s = sumN(r.v); return r.k === 'head' ? null : s; }
    if (m.sum === 'bva') { if (r.k === 'head') return null; return sumN(r.v); }
    var last = null; r.v.forEach(function (x) { if (x != null) last = x; }); return last;
  }
  function rowAvg(r, m) {
    if (m.sum !== true) return null; var n = r.v.filter(function (x) { return x != null; }).length; return n ? sumN(r.v) / n : null;
  }

  // ---------------------------------------------------------------- render Laporan Setahun
  function annHead(cx) {
    var y = lapY(), tabs = ['is', 'bs', 'bva'], tab = S.lapTab || 'is';
    X.ddOpts.lapY = function () { return {title: t('ann.year'), opts: years().map(function (v) { return {v: String(v), l: String(v)}; })}; };
    X.ddOpts.lapU = function () { return {title: t('ann.unit'), opts: ['rp', 'rb', 'jt'].map(function (u) { return {v: u, l: t('ann.u.' + u)}; })}; };
    return '<div class="seg" style="margin-bottom:10px">' + tabs.map(function (k) { return '<button class="' + (tab === k ? 'on' : '') + '" data-act="lap-tab" data-v="' + k + '">' + t('ann.' + k) + '</button>'; }).join('') + '</div>' +
      '<div class="lapbar"><span class="ddgrp">' + X.dd(String(y), 'lapY', 'lap-y', String(y)) + X.dd(t('ann.u.' + unit()), 'lapU', 'lap-u', unit()) + '</span>' +
      (tab !== 'bva' ? '<button class="chip sm' + (S.lapDet ? ' on' : '') + '" data-act="lap-det">' + t('ann.detail') + '</button>' : '') +
      '</div>';
  }
  function tableHTML(m) {
    var showTot = m.sum === true || m.sum === 'bva', th = '<tr><th class="c1"></th>' + m.cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') +
      (m.sum === true ? '<th class="tc">' + t('ann.tot') + '</th><th class="tc">' + t('ann.avg') + '</th>' : (m.sum === 'bva' ? '<th class="tc">' + t('ann.tot') + '</th>' : '<th class="tc">' + t('ann.end') + '</th>')) + '</tr>';
    var body = m.rows.map(function (r) {
      var tot = rowTotal(r, m), av = rowAvg(r, m), tc = r.c === 'sel' || r.c === 'net';
      return '<tr class="lr-' + r.k + '"><td class="c1" style="padding-left:' + (8 + (r.ind || 0) * 12) + 'px">' + esc(r.l) + '</td>' + r.v.map(function (x, i) {
        var c = x == null ? '' : (tc || r.k === 'tot' ? (x < 0 ? ' out' : (x > 0 && (r.c === 'sel' || r.c === 'net') ? ' in' : '')) : (x < 0 ? ' out' : ''));
        if (r.over && x != null && r.bud && r.bud[i] && x > r.bud[i]) c += ' warn';
        return '<td class="' + c.trim() + '"' + (r.over && r.bud && r.bud[i] ? ' title="' + esc(t('ann.bud') + ' ' + fmtU(r.bud[i])) + '"' : '') + '>' + (x == null || (x === 0 && r.k !== 'tot') ? (x === 0 ? '·' : '') : esc(fmtU(x))) + '</td>';
      }).join('') + '<td class="tc' + (tot != null && tot < 0 ? ' out' : '') + '">' + (tot == null ? '' : esc(fmtU(tot))) + '</td>' + (m.sum === true ? '<td class="tc">' + (av == null ? '' : esc(fmtU(av))) + '</td>' : '') + '</tr>';
    }).join('');
    return '<div class="lapw"><table class="lap">' + th + body + '</table></div>';
  }
  function annRender(cx) {
    var m = matrix(cx), h = annHead(cx);
    h += '<div class="muted sm" style="margin:2px 2px 8px">' + esc(t('ann.inunit', t('ann.u.' + unit()))) + ' · ' + m.year + ' · ' + esc(who(cx)) + '</div>';
    if (!m.any) return h + '<div class="card"><div class="empty">' + esc(m.tab === 'bva' ? t('ann.nobud') : t('ann.empty')) + '</div></div>';
    return h + '<div class="card lapcard">' + tableHTML(m) + '</div>';
  }
  function annDoc(cx) {
    var m = matrix(cx), b = [];
    m.rows.forEach(function (r) {
      var tot = rowTotal(r, m), s = tot == null ? '' : fmtU(tot);
      if (r.k === 'sec' || r.k === 'head') b.push({k: 'head', l: r.l, r: s}); else if (r.k === 'tot') b.push({k: 'total', l: r.l, r: s, c: tot < 0 ? 'out' : 'in'}); else b.push({k: 'row', ind: r.ind > 1 ? 1 : (r.ind || 0), l: r.l, r: s, c: tot < 0 ? 'out' : ''});
    });
    return {title: t('r.ann') + ' · ' + t('ann.' + m.tab) + ' ' + m.year, sub: t('ann.inunit', t('ann.u.' + unit())) + ' · ' + who(cx), blocks: b, foot: 'Do it · ' + C.fmtTgl(cx.today)};
  }
  function annCsv(cx) {
    var m = matrix(cx), head = [t('ann.' + m.tab) + ' ' + m.year + ' (' + t('ann.u.' + unit()) + ')'].concat(m.cols);
    head.push(m.sum === true || m.sum === 'bva' ? t('ann.tot') : t('ann.end')); if (m.sum === true) head.push(t('ann.avg'));
    var rows = [head];
    m.rows.forEach(function (r) {
      var tot = rowTotal(r, m), av = rowAvg(r, m), row = [r.l].concat(r.v.map(function (x) { return x == null ? '' : x; })); row.push(tot == null ? '' : tot); if (m.sum === true) row.push(av == null ? '' : Math.round(av)); rows.push(row);
    });
    return rows;
  }

  X.repKinds.ann = {render: annRender, doc: annDoc, csv: annCsv, period: false, dim: false, label: function () { return ''; }};

  // ---------------------------------------------------------------- analisis
  function expenseRows(cx) {
    var f = cx.f, a = cx.per.start, b = cx.end, out = [];
    Object.keys(S.tx).forEach(function (id) {
      var x = S.tx[id]; if (x.Status !== 'Aktif' || x.Jenis !== 'Expense') return; var d = x.Waktu.substr(0, 10); if (d < a || d > b) return;
      if (f && f.pemilik && x.PemilikDompet !== f.pemilik) return; if (f && f.pencatat && x.DicatatOleh !== f.pencatat) return;
      if (x.Kategori === NONOP || (X.isNonOp && X.isNonOp(x.KodeAkun))) return; out.push(x);
    });
    return out;
  }
  var PAL = ['#e4572e', '#f2a541', '#2a9d8f', '#4c6fbf', '#9b5de5', '#e05297', '#8d99ae', '#6a994e'];
  function card(title, sub, body) { return '<div class="card insc"><div class="ch">' + esc(title) + '</div>' + (sub ? '<div class="muted sm" style="margin:-2px 0 10px">' + esc(sub) + '</div>' : '') + body + '</div>'; }
  function pct(v) { var p = Math.round(v * 100); return p + '%'; }

  function insComp(cx) {
    var is = X.splitIS(C.incomeStatement(cx.lines, S.M, cx.per.start, cx.end, cx.f)), tot = is.beban.total, prevP = X.prevOf(cx.R.period), prev = null;
    if (!tot) return card(t('ins.comp'), t('ins.comp.s'), '<div class="empty">' + t('ins.noexp') + '</div>');
    if (prevP) { var pi = X.splitIS(C.incomeStatement(cx.lines, S.M, prevP.start, prevP.end, cx.f)); prev = {}; pi.beban.groups.forEach(function (g) { prev[g.nama] = g.total; }); prev._t = pi.beban.total; }
    var gs = is.beban.groups, bar = '<div class="stkbar">' + gs.map(function (g, i) { return '<i style="width:' + (g.total / tot * 100).toFixed(2) + '%;background:' + PAL[i % PAL.length] + '" title="' + esc(dn(g.nama)) + '"></i>'; }).join('') + '</div>';
    var list = gs.map(function (g, i) {
      var p = g.total / tot, d = '';
      if (prev && prev._t && prev[g.nama] != null) { var pp = prev[g.nama] / prev._t, dd = Math.round((p - pp) * 100); d = '<em class="' + (dd > 0 ? 'out' : (dd < 0 ? 'in' : '')) + '">' + (dd > 0 ? '▲ +' : (dd < 0 ? '▼ −' : '· ')) + Math.abs(dd) + ' pt</em>'; }
      return '<div class="cmp"><i style="background:' + PAL[i % PAL.length] + '"></i><span>' + esc(dn(g.nama)) + '</span><b>' + esc(C.fmtRp(g.total)) + '</b><span class="pc">' + pct(p) + '</span>' + d + '</div>';
    }).join('');
    return card(t('ins.comp'), t('ins.comp.s') + (prev ? ' (' + t('ins.vsprev') + ')' : ''), bar + list);
  }
  function insAnom(cx) {
    var f = cx.f, lines = X.getOpLines(), gm = C2.groupMonthly(lines, S.M, 'Beban', today().substr(0, 7), 12, f, C.pass), items = [], k;
    Object.keys(gm).forEach(function (g) {
      if (g === NONOP) return; var v = gm[g], cur = v[v.length - 1], prev = v.slice(0, -1).filter(function (x) { return x > 0; });
      if (prev.length < 3 || !cur) return; var m = C2.avg(prev), sd = Math.sqrt(prev.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / prev.length);
      if (cur > m + 2 * sd && cur > m * 1.4 && cur - m > 100000) items.push({g: g, m: m, cur: cur, z: sd ? (cur - m) / sd : 9});
    });
    items.sort(function (a, b) { return (b.cur - b.m) - (a.cur - a.m); });
    // transaksi tak biasa pada periode ini
    var a12 = C2.addDays(today(), -365), by = {};
    Object.keys(S.tx).forEach(function (id) { var x = S.tx[id]; if (x.Status !== 'Aktif' || x.Jenis !== 'Expense' || x.Kategori === NONOP) return; var d = x.Waktu.substr(0, 10); if (d < a12) return; (by[x.KodeAkun] = by[x.KodeAkun] || []).push(+x.Jumlah || 0); });
    var big = expenseRows(cx).map(function (x) {
      var arr = by[x.KodeAkun] || []; if (arr.length < 6) return null; var m = C2.avg(arr), sd = Math.sqrt(arr.reduce(function (s, v) { return s + (v - m) * (v - m); }, 0) / arr.length), j = +x.Jumlah || 0;
      return j > m + 3 * sd && j > m * 2.5 && j >= 150000 ? {x: x, m: m, j: j} : null;
    }).filter(Boolean).sort(function (a, b) { return b.j - a.j; }).slice(0, 5);
    var h = '';
    if (items.length) h += '<div class="lbl3">' + t('ins.anom.grp') + '</div>' + items.slice(0, 5).map(function (i) { return '<div class="anm"><div><b>' + esc(dn(i.g)) + '</b><small>' + esc(t('ins.anom.grp.s', C.fmtRp(Math.round(i.m)), C.fmtRp(Math.round(i.cur)))) + '</small></div><span class="out">+' + esc(X.shortRp(i.cur - i.m)) + '</span></div>'; }).join('');
    if (big.length) h += '<div class="lbl3" style="margin-top:10px">' + t('ins.anom.tx') + '</div>' + big.map(function (i) { var x = i.x; return '<div class="anm tap" data-act="tx-open" data-id="' + esc(x.ID) + '"><div><b>' + esc(x.Toko || x.Barang || dn(x.Kategori || '')) + '</b><small>' + esc(C.fmtTgl(x.Waktu.substr(0, 10))) + ' · ' + esc(t('ins.anom.tx.s', C.fmtRp(Math.round(i.m)))) + '</small></div><span class="out">' + esc(C.fmtRp(i.j)) + '</span></div>'; }).join('');
    return card(t('ins.anom'), t('ins.anom.s'), h || '<div class="empty">' + t('ins.anom.none') + '</div>');
  }
  var NEED = /tagihan|makan|minum|transport|kesehatan|rumah|sewa|kontrak|pendidikan|sekolah|cicil|utang|asuransi|pajak|listrik|air|pulsa|internet|bbm|kebutuhan|bayar|angsuran|zakat/i;
  function nwOf(g) { var o = (S.pref.nw || {})[g]; return o || (NEED.test(g) ? 'n' : 'w'); }
  function insNWS(cx) {
    var is = X.splitIS(C.incomeStatement(cx.lines, S.M, cx.per.start, cx.end, cx.f)), inc = is.pendapatan.total, n = 0, w = 0;
    if (!inc || !is.beban.total) return card(t('ins.nws'), t('ins.nws.s'), '<div class="empty">' + t('ins.noexp') + '</div>');
    is.beban.groups.forEach(function (g) { if (nwOf(g.nama) === 'n') n += g.total; else w += g.total; });
    var sv = Math.max(0, inc - n - w), tot = Math.max(inc, n + w), seg = [['n', n, t('ins.need'), 50, '#4c6fbf'], ['w', w, t('ins.want'), 30, '#f2a541'], ['s', sv, t('ins.save'), 20, '#2a9d8f']];
    var bar = '<div class="stkbar">' + seg.map(function (s) { return '<i style="width:' + (s[1] / tot * 100).toFixed(2) + '%;background:' + s[4] + '"></i>'; }).join('') + '</div>';
    var rows = seg.map(function (s) { var p = s[1] / inc, ok = s[0] === 's' ? p >= s[3] / 100 : p <= s[3] / 100; return '<div class="nws"><i style="background:' + s[4] + '"></i><b>' + s[2] + '</b><span>' + esc(C.fmtRp(Math.round(s[1]))) + '</span><span class="pc ' + (ok ? 'in' : 'out') + '">' + pct(p) + ' ' + t('ins.of') + '</span><em>' + t('ins.target', s[3]) + '</em></div>'; }).join('');
    var grp = '<div class="lbl3" style="margin-top:12px">' + t('ins.setgrp') + '</div><div class="chips">' + is.beban.groups.map(function (g) { var c = nwOf(g.nama); return '<button class="chip sm' + (c === 'n' ? ' on' : '') + '" data-act="nws-flip" data-g="' + esc(g.nama) + '">' + esc(dn(g.nama)) + ' · ' + (c === 'n' ? t('ins.need') : t('ins.want')) + '</button>'; }).join('') + '</div>';
    return card(t('ins.nws'), t('ins.nws.s'), bar + rows + grp);
  }
  function insOwn(cx) {
    var users = S.M.users || [], rows = users.map(function (u) { var is = X.splitIS(C.incomeStatement(cx.lines, S.M, cx.per.start, cx.end, {pemilik: u})); return {u: u, i: is.pendapatan.total, e: is.beban.total}; });
    var ti = rows.reduce(function (s, r) { return s + r.i; }, 0), te = rows.reduce(function (s, r) { return s + r.e; }, 0);
    if (!ti && !te) return card(t('ins.own'), t('ins.own.s'), '<div class="empty">' + t('ins.noexp') + '</div>');
    function blk(label, key, tot, color) {
      return '<div class="lbl3">' + label + '</div>' + rows.map(function (r, i) { var p = tot ? r[key] / tot : 0; return '<div class="own"><span>' + esc(r.u) + '</span><div class="pb"><i style="width:' + (p * 100).toFixed(1) + '%;background:' + color + '"></i></div><b>' + esc(X.shortRp(r[key])) + '</b><span class="pc">' + pct(p) + '</span></div>'; }).join('');
    }
    return card(t('ins.own'), t('ins.own.s'), blk(t('r.income'), 'i', ti, 'var(--in)') + '<div style="height:8px"></div>' + blk(t('r.expense'), 'e', te, 'var(--out)') +
      '<div class="lbl3" style="margin-top:10px">' + t('ann.net') + '</div>' + rows.map(function (r) { var n = r.i - r.e; return '<div class="own"><span>' + esc(r.u) + '</span><div class="pb"></div><b class="' + (n < 0 ? 'out' : 'in') + '">' + esc(C.fmtRp(n)) + '</b></div>'; }).join(''));
  }
  function projData(f) {
    var td = today(), y = td.substr(0, 4), m = +td.substr(5, 2), key = td.substr(0, 7), ser = C2.monthlySeries(X.getOpLines(), S.M, key, m, f, C.pass);
    if (m < 2 && !ser.some(function (s) { return s.pendapatan || s.beban; })) return null;
    var done = ser.slice(0, -1), last3 = ser.slice(Math.max(0, ser.length - 4), -1); if (!last3.length) last3 = ser;
    var ai = C2.avg(last3.map(function (s) { return s.pendapatan; })), ae = C2.avg(last3.map(function (s) { return s.beban; })), ci = ser[ser.length - 1];
    var ytdI = ser.reduce(function (s, x) { return s + x.pendapatan; }, 0), ytdE = ser.reduce(function (s, x) { return s + x.beban; }, 0), rem = 12 - m;
    var topI = Math.max(0, ai - ci.pendapatan), topE = Math.max(0, ae - ci.beban), pI = ytdI + topI + rem * ai, pE = ytdE + topE + rem * ae;
    var minE = Math.min.apply(null, last3.map(function (s) { return s.beban; })), maxE = Math.max.apply(null, last3.map(function (s) { return s.beban; })), minI = Math.min.apply(null, last3.map(function (s) { return s.pendapatan; }));
    var lo = (ytdI + topI + rem * minI) - (ytdE + topE + rem * maxE), hi = pI - (ytdE + topE + rem * minE);
    return {y: y, ytdI: ytdI, ytdE: ytdE, pI: pI, pE: pE, lo: Math.min(lo, hi), hi: Math.max(lo, hi), rem: rem, n: ser.length, ok: ser.some(function (s) { return s.pendapatan || s.beban; }), ser: ser, ai: ai, ae: ae};
  }
  function insProj(cx) {
    var p = projData(cx.f); if (!p || !p.ok) return card(t('ins.proj'), t('ins.proj.s'), '<div class="empty">' + t('ins.proj.nodata') + '</div>');
    var row = function (lab, a, b, c) { return '<tr><td>' + lab + '</td><td>' + esc(C.fmtRp(Math.round(a))) + '</td><td class="' + c + '">' + esc(C.fmtRp(Math.round(b))) + '</td></tr>'; };
    var h = '<table class="rep"><tr><th></th><th>' + t('ins.proj.ytd') + '</th><th>' + t('ins.proj.end') + '</th></tr>' + row(t('ins.proj.inc'), p.ytdI, p.pI, '') + row(t('ins.proj.exp'), p.ytdE, p.pE, '') + row(t('ins.proj.net'), p.ytdI - p.ytdE, p.pI - p.pE, p.pI - p.pE < 0 ? 'out' : 'in') + '</table>' +
      '<div class="muted sm" style="margin-top:8px">' + t('ins.proj.range') + ': ' + esc(C.fmtRp(Math.round(p.lo))) + ' – ' + esc(C.fmtRp(Math.round(p.hi))) + '</div>';
    return card(t('ins.proj') + ' ' + p.y, t('ins.proj.s'), h);
  }
  function insHab(cx) {
    var rows = expenseRows(cx); if (!rows.length) return card(t('ins.hab'), t('ins.hab.s'), '<div class="empty">' + t('ins.noexp') + '</div>');
    function top(field) {
      var m = {}; rows.forEach(function (x) { var v = (x[field] || '').trim(); if (!v) return; var k = v.toLowerCase(), o = m[k] || (m[k] = {n: v, c: 0, s: 0}); o.c++; o.s += +x.Jumlah || 0; });
      return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 5);
    }
    var cols = [['Barang', 'ins.hab.item'], ['Toko', 'ins.hab.shop'], ['Lokasi', 'ins.hab.loc']], h = '', any = false;
    cols.forEach(function (c) {
      var tp = top(c[0]); if (!tp.length) return; any = true;
      h += '<div class="lbl3"' + (h ? ' style="margin-top:10px"' : '') + '>' + t(c[1]) + '</div>' + tp.map(function (o) { return '<div class="hab"><div><b>' + esc(o.n) + '</b><small>' + esc(t('ins.hab.n', o.c, X.shortRp(o.s / o.c))) + '</small></div><span>' + esc(C.fmtRp(Math.round(o.s))) + '</span></div>'; }).join('');
    });
    return card(t('ins.hab'), t('ins.hab.s'), any ? h : '<div class="empty">' + t('ins.hab.none') + '</div>');
  }
  function insRender(cx) {
    return '<div class="insgrid">' + insComp(cx) + insAnom(cx) + insNWS(cx) + insOwn(cx) + insProj(cx) + insHab(cx) + '</div>';
  }
  function insDoc(cx) {
    var b = [], is = X.splitIS(C.incomeStatement(cx.lines, S.M, cx.per.start, cx.end, cx.f)), tot = is.beban.total, n = 0, w = 0;
    b.push({k: 'head', l: t('ins.comp'), r: C.fmtNum(tot)}); is.beban.groups.forEach(function (g) { b.push({k: 'row', ind: 1, l: dn(g.nama), s: tot ? pct(g.total / tot) : '', r: C.fmtNum(g.total)}); if (nwOf(g.nama) === 'n') n += g.total; else w += g.total; });
    var inc = is.pendapatan.total; b.push({k: 'head', l: t('ins.nws'), r: ''});
    b.push({k: 'row', ind: 1, l: t('ins.need'), s: inc ? pct(n / inc) : '', r: C.fmtNum(n)}, {k: 'row', ind: 1, l: t('ins.want'), s: inc ? pct(w / inc) : '', r: C.fmtNum(w)}, {k: 'row', ind: 1, l: t('ins.save'), s: inc ? pct(Math.max(0, inc - n - w) / inc) : '', r: C.fmtNum(Math.max(0, inc - n - w))});
    var p = projData(cx.f); if (p && p.ok) { b.push({k: 'head', l: t('ins.proj') + ' ' + p.y, r: ''}, {k: 'row', ind: 1, l: t('ins.proj.inc'), r: C.fmtNum(Math.round(p.pI))}, {k: 'row', ind: 1, l: t('ins.proj.exp'), r: C.fmtNum(Math.round(p.pE))}, {k: 'total', l: t('ins.proj.net'), r: C.fmtNum(Math.round(p.pI - p.pE)), c: p.pI - p.pE < 0 ? 'out' : 'in'}); }
    return {title: t('r.ins'), sub: C.fmtTgl(cx.per.start) + ' – ' + C.fmtTgl(cx.end) + ' · ' + who(cx), blocks: b, foot: 'Do it · ' + C.fmtTgl(cx.today)};
  }
  X.repKinds.ins = {render: insRender, doc: insDoc, dim: false, label: function (cx) { return C.fmtTgl(cx.per.start) + ' – ' + C.fmtTgl(cx.end); }};

  // ---------------------------------------------------------------- CSV semua laporan + aksi
  function genericCsv(doc) {
    var rows = [[doc.title, doc.sub || '']];
    (doc.blocks || []).forEach(function (b) { if (b.k === 'gap' || b.k === 'text') return; rows.push([(b.ind ? '  ' : '') + (b.l || ''), b.s || '', num(b.r)]); });
    return rows;
  }
  A['rep-csv'] = function () {
    var cx = { R: S.rep }, reg = X.repKinds[S.rep.kind], rows;
    var full = X.repCtx ? X.repCtx() : null; cx = full || cx;
    rows = reg && reg.csv ? reg.csv(cx) : genericCsv(X.repDoc());
    if (!rows || rows.length < 2) { X.toast(t('rep.csv.no')); return; }
    download('doit-' + S.rep.kind + '-' + today() + '.csv', toCsv(rows)); X.toast(t('rep.csv.ok'));
  };
  A['lap-tab'] = function (el) { S.lapTab = el.dataset.v; X.render(); };
  A['lap-y'] = function (el) { S.lapY = +el.dataset.v; X.render(); };
  A['lap-u'] = function (el) { S.pref.lapUnit = el.dataset.v; X.savePref(); X.render(); };
  A['lap-det'] = function () { S.lapDet = !S.lapDet; X.render(); };
  A['nws-flip'] = function (el) { var g = el.dataset.g, o = S.pref.nw = S.pref.nw || {}; o[g] = nwOf(g) === 'n' ? 'w' : 'n'; X.savePref(); X.render(); };
})();
