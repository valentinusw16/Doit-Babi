/* Do it v2.0 - analisis laporan: tren, rasio, peringatan + saran, Budget vs Actual. */
(function () {
  'use strict';
  var X = window.DoIt, S = X.S, C = X.C, C2 = X.C2, t = X.t, esc = X.esc, ICON = X.ICON, A = X.A, dn = X.dn;
  var fm = function (n) { return C.fmtRp(n); }, N = 6;
  function lab(k) { return C.namaBulan(+k.substr(5, 2), true) + ' ' + k.substr(2, 2); }
  function pbar(p) { return '<div class="pbar ' + (p > 1 ? 'bad' : (p >= 0.8 ? 'warn' : '')) + '"><i style="width:' + Math.min(100, Math.round(p * 100)) + '%"></i></div>'; }

  function bars(ser) {
    var mx = Math.max.apply(null, ser.map(function (s) { return Math.max(s.pendapatan, s.beban); }).concat([1])), W = 320, H = 130, bw = W / ser.length;
    var g = ser.map(function (s, i) {
      var x = i * bw, hi = s.pendapatan / mx * (H - 22), ho = s.beban / mx * (H - 22);
      return '<rect class="bin" x="' + (x + bw * 0.12).toFixed(1) + '" y="' + (H - 16 - hi).toFixed(1) + '" width="' + (bw * 0.36).toFixed(1) + '" height="' + hi.toFixed(1) + '" rx="2"/><rect class="bout" x="' + (x + bw * 0.5).toFixed(1) + '" y="' + (H - 16 - ho).toFixed(1) + '" width="' + (bw * 0.36).toFixed(1) + '" height="' + ho.toFixed(1) + '" rx="2"/><text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 3) + '" class="bl">' + esc(lab(s.bulan)) + '</text>';
    }).join('');
    return '<svg class="bars" viewBox="0 0 ' + W + ' ' + H + '">' + g + '</svg><div class="legend2"><span><i class="in"></i>' + t('r.income') + '</span><span><i class="out"></i>' + t('r.expense') + '</span></div>';
  }
  function ctx(cx) {
    var end = C.todayLocal().substr(0, 7), lines = cx.lines, f = cx.f;
    return {end: end, ser: C2.monthlySeries(lines, S.M, end, N, f, C.pass), nw: C2.netWorthSeries(lines, S.M, end, N, f, C.pass)};
  }
  function trendRender(cx) {
    var d = ctx(cx), ser = d.ser, h = '', tot = ser.slice(0, -1);
    var aI = C2.avg(tot.map(function (s) { return s.pendapatan; })), aO = C2.avg(tot.map(function (s) { return s.beban; })), last = ser[ser.length - 1];
    h += '<div class="card"><div class="ch">' + t('an.inout', N) + '</div>' + bars(ser) + '</div>';
    h += '<div class="card"><dl class="dl"><dt>' + t('an.avg.in') + '</dt><dd class="in">' + esc(fm(Math.round(aI))) + '</dd><dt>' + t('an.avg.out') + '</dt><dd class="out">' + esc(fm(Math.round(aO))) + '</dd><dt>' + t('an.avg.net') + '</dt><dd>' + esc(fm(Math.round(aI - aO))) + '</dd><dt>' + t('an.this') + '</dt><dd>' + esc(fm(last.net)) + '</dd></dl></div>';
    if (d.nw.length > 1) h += '<div class="card"><div class="ch">' + t('an.networth') + '</div>' + X.sparkline(d.nw) + '</div>';
    var gm = C2.groupMonthly(cx.lines, S.M, 'Beban', d.end, N, cx.f, C.pass), rows = Object.keys(gm).map(function (k) { var v = gm[k], pv = C2.avg(v.slice(0, -1)); return {nama: k, now: v[v.length - 1], avg: pv, ch: pv > 0 ? v[v.length - 1] / pv - 1 : 0}; }).filter(function (r) { return r.now || r.avg; }).sort(function (a, b) { return b.now - a.now; }).slice(0, 8);
    if (rows.length) h += '<h2>' + t('an.cat') + '</h2><div class="card">' + rows.map(function (r) {
      return '<div class="row"><div class="grow"><div class="t">' + esc(dn(r.nama)) + '</div><div class="s">' + esc(t('an.cat.s', C.fmtNum(Math.round(r.avg)))) + '</div></div><div class="a">' + esc(C.fmtNum(r.now)) + '<small class="' + (r.ch > 0.1 ? 'out' : (r.ch < -0.1 ? 'in' : '')) + '">' + (r.avg ? (r.ch > 0 ? '+' : '') + Math.round(r.ch * 100) + '%' : '') + '</small></div></div>';
    }).join('') + '</div>';
    return h;
  }
  function trendDoc(cx) {
    var d = ctx(cx), b = [];
    b.push({k: 'head', l: t('an.inout', N), r: ''});
    d.ser.forEach(function (s) { b.push({k: 'row', l: lab(s.bulan), s: t('r.income') + ' ' + C.fmtNum(s.pendapatan), r: C.fmtNum(s.beban), c: 'out'}); });
    b.push({k: 'head', l: t('an.networth'), r: ''});
    d.nw.forEach(function (s) { b.push({k: 'row', l: lab(s.bulan), r: C.fmtNum(s.saldo)}); });
    return {title: t('r.tren'), sub: cx.f ? cx.R.who : t('r.combined'), blocks: b, foot: 'Do it · ' + C.fmtTgl(cx.today)};
  }

  // ---- data rasio
  function snapshot(cx) {
    var today = C.todayLocal(), mk = today.substr(0, 7), lines = cx.lines, f = cx.f, d = ctx(cx), cur = d.ser[d.ser.length - 1];
    var bs = C.balanceSheet(lines, S.M, today, f), kas = C.walletBalances(lines, S.M, f).reduce(function (s, w) { return s + Math.max(0, w.saldo); }, 0);
    var loans = C.openLoans(S.tx).filter(function (l) { return !f || l.pemilik === f.pemilik; });
    var cic = 0, tp = {}, hs = C2.groupMonthly(lines, S.M, 'Beban', mk, 1, f, C.pass);
    Object.keys(S.tx).forEach(function (k) { var x = S.tx[k]; if (x.Status === 'Aktif' && x.Jenis === 'Utang/Piutang' && x.SubJenis === 'Bayar utang' && x.Waktu.substr(0, 7) === mk && (!f || x.PemilikDompet === f.pemilik)) cic += +x.Jumlah; });
    var top = Object.keys(hs).map(function (k) { return {nama: k, jumlah: hs[k][0]}; }).sort(function (a, b) { return b.jumlah - a.jumlah; });
    var inv = 0, invB = 0; bs.aset.groups.forEach(function (g) { if (g.nama === 'Investasi') invB += g.total; }); try { inv = C2.portfolio(X.rc.list('aset').filter(function (a) { return a.aktif !== false; }), X.rc.list('lot'), today).total.nilai; } catch (e) {}
    var lewat = {Piutang: 0, Utang: 0}; loans.forEach(function (l) { if (l.jatuhTempo && l.jatuhTempo < today) lewat[l.kind]++; });
    var over = []; try { C2.budgetMonth(X.plan.budgetLines(), S.tx, mk, null).rows.forEach(function (r) { if (r.sisa < 0) over.push(X.dn(r.line.scope === 'sub' ? ((S.M.katByKode[r.line.key] || {}).SubKategori || r.line.key) : r.line.key)); }); } catch (e) {}
    var short = loans.filter(function (l) { return l.kind === 'Utang' && l.jangka === 'Pendek'; }).reduce(function (s, l) { return s + l.sisa; }, 0);
    return {pendapatan: cur.pendapatan, beban: cur.beban, seriBeban: d.ser.slice(0, -1).map(function (s) { return s.beban; }), kas: kas, aset: bs.aset.total, utang: bs.liabilitas.total, utangPendek: short, cicilanBulanan: cic, investasi: Math.max(inv, invB), seri: d.ser, topKategori: top, anggaranLewat: over, piutangLewat: lewat.Piutang, utangLewat: lewat.Utang, netWorth: bs.aset.total - bs.liabilitas.total};
  }
  function pc(v) { return v == null ? '—' : Math.round(v * 100) + '%'; }
  function ratioRender(cx) {
    var s = snapshot(cx), r = C2.ratios(s), T = C2.TARGET;
    function card(key, val, target, ok, hint) {
      return '<div class="card ratio"><div class="sr"><b>' + t('ra.' + key) + '</b><span class="tag ' + (val == null ? '' : (ok ? 'ok' : 'bad')) + '">' + (val == null ? '—' : t(ok ? 'ra.ok' : 'ra.no')) + '</span></div><div class="big2">' + esc(hint(val)) + '</div><div class="muted sm">' + esc(target) + '</div></div>';
    }
    return card('tabungan', r.tabungan, t('ra.t.min', pc(T.tabungan)), r.tabungan != null && r.tabungan >= T.tabungan, pc) +
      card('darurat', r.danaDarurat, t('ra.t.minm', T.darurat), r.danaDarurat != null && r.danaDarurat >= T.darurat, function (v) { return v == null ? '—' : t('ra.months', dec(v.toFixed(1))); }) +
      card('utang', r.utangAset, t('ra.t.max', pc(T.utang)), r.utangAset != null && r.utangAset <= T.utang, pc) +
      card('cicilan', r.cicilan, t('ra.t.max', pc(T.cicilan)), r.cicilan != null && r.cicilan <= T.cicilan, pc) +
      card('likuiditas', r.likuiditas, t('ra.t.min', '1×'), r.likuiditas != null && r.likuiditas >= 1, function (v) { return v == null ? '—' : dec(v.toFixed(1)) + '×'; }) +
      card('investasi', r.investasi, t('ra.t.info'), r.investasi != null && r.investasi >= 0.1, pc) +
      '<div class="note">' + t('ra.note') + '</div>';
  }
  function ratioDoc(cx) {
    var s = snapshot(cx), r = C2.ratios(s), b = [];
    [['tabungan', pc(r.tabungan)], ['darurat', r.danaDarurat == null ? '—' : t('ra.months', dec(r.danaDarurat.toFixed(1)))], ['utang', pc(r.utangAset)], ['cicilan', pc(r.cicilan)], ['likuiditas', r.likuiditas == null ? '—' : dec(r.likuiditas.toFixed(1)) + '×'], ['investasi', pc(r.investasi)]].forEach(function (x) { b.push({k: 'row', l: t('ra.' + x[0]), r: x[1]}); });
    return {title: t('r.rasio'), sub: C.fmtTgl(C.todayLocal()), blocks: b, foot: 'Do it'};
  }
  function dec(v) { return typeof v === 'string' && /^\d+\.\d$/.test(v) && S.pref.lang !== 'en' ? v.replace('.', ',') : (typeof v === 'number' ? C.fmtNum(v) : v); }
  function insightText(i) { var a = i.args.map(dec); return {w: t.apply(null, ['w.' + i.kode].concat(a)), a: t.apply(null, ['a.' + i.kode].concat(a))}; }
  function alertsFor(cx) { return C2.insights(snapshot(cx)); }
  function alertRender(cx) {
    var list = alertsFor(cx);
    if (!list.length) return '<div class="card"><div class="empty">' + t('al.empty') + '</div></div>';
    return list.map(function (i) {
      var tx = insightText(i);
      return '<div class="card alert ' + i.level + '"><div class="ah"><span class="gi">' + (i.level === 'good' ? ICON.check : ICON.alert) + '</span><span>' + esc(tx.w) + '</span></div>' + (i.level !== 'good' ? '<div class="adv"><b>' + t('al.action') + '</b> ' + esc(tx.a) + '</div>' : '') + '</div>';
    }).join('');
  }
  function alertDoc(cx) {
    var b = []; alertsFor(cx).forEach(function (i) { var tx = insightText(i); b.push({k: 'text', l: (i.level === 'good' ? '✓ ' : '! ') + tx.w}); if (i.level !== 'good') b.push({k: 'text', l: '→ ' + tx.a, ind: 1}); });
    return {title: t('r.alert'), sub: C.fmtTgl(C.todayLocal()), blocks: b, foot: 'Do it'};
  }

  // ---- Budget vs Actual
  function bvaMonth() { return S.bvam || C.todayLocal().substr(0, 7); }
  function bvaData(cx) { return C2.budgetVsActual(X.plan.budgetLines(), S.tx, bvaMonth(), cx.R.who); }
  function bvaRender(cx) {
    var k = bvaMonth(), d = bvaData(cx), T = d.total, today = C.todayLocal(), h = '';
    h += '<div class="mnav"><button class="hb" data-act="bva-prev">' + ICON.back + '</button><b>' + esc(C.namaBulan(+k.substr(5, 2)) + ' ' + k.substr(0, 4)) + '</b><button class="hb" data-act="bva-next"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div>';
    if (!d.rows.length) return h + '<div class="card"><div class="empty">' + t('bva.empty') + '</div></div>';
    var diff = T.tersedia - T.terpakai;
    h += '<div class="card hero"><div class="sr"><span>' + t('bva.budget') + '</span><b>' + esc(fm(T.tersedia)) + '</b></div><div class="sr"><span>' + t('bva.actual') + '</span><b>' + esc(fm(T.terpakai)) + '</b></div><div class="sr"><span>' + t('bva.diff') + '</span><b class="' + (diff < 0 ? 'out' : 'in') + '">' + esc(fm(diff)) + '</b></div>' + pbar(T.tersedia ? T.terpakai / T.tersedia : 0) +
      (k === today.substr(0, 7) && T.terpakai ? '<div class="sub2">' + esc(t('bl.proj', fm(C2.projection(T.terpakai, k, today)))) + '</div>' : '') + '</div>';
    h += '<div class="card"><table class="tbl"><tr><th></th><th>' + t('bva.budget') + '</th><th>' + t('bva.actual') + '</th><th>%</th></tr>' + d.rows.map(function (r) {
      var l = r.line, nm = l.scope === 'sub' ? ((S.M.katByKode[l.key] || {}).SubKategori || l.key) : l.key;
      return '<tr><td>' + esc(dn(nm)) + '</td><td>' + esc(C.fmtNum(r.tersedia)) + '</td><td>' + esc(C.fmtNum(r.terpakai)) + '</td><td class="' + (r.pct > 1 ? 'out' : '') + '">' + Math.round(r.pct * 100) + '%</td></tr>';
    }).join('') + '</table></div>';
    if (d.tanpaAnggaran.length) h += '<h2>' + t('bva.nobudget') + ' · ' + esc(C.fmtNum(d.totalTanpa)) + '</h2><div class="card">' + d.tanpaAnggaran.map(function (r) { return '<div class="row"><div class="grow"><div class="t">' + esc(dn(r.nama)) + '</div></div><div class="a out">' + esc(C.fmtNum(r.terpakai)) + '</div></div>'; }).join('') + '</div>';
    return h;
  }
  function bvaDoc(cx) {
    var k = bvaMonth(), d = bvaData(cx), b = [];
    d.rows.forEach(function (r) { var l = r.line, nm = l.scope === 'sub' ? ((S.M.katByKode[l.key] || {}).SubKategori || l.key) : l.key; b.push({k: 'row', l: dn(nm), s: C.fmtNum(r.terpakai) + ' / ' + C.fmtNum(r.tersedia), r: Math.round(r.pct * 100) + '%', c: r.pct > 1 ? 'out' : ''}, {k: 'prog', v: r.pct}); });
    b.push({k: 'total', l: t('bva.diff'), r: C.fmtNum(d.total.tersedia - d.total.terpakai)});
    return {title: t('r.bva'), sub: C.namaBulan(+k.substr(5, 2)) + ' ' + k.substr(0, 4), blocks: b, foot: 'Do it'};
  }

  X.repKinds.tren = {render: trendRender, doc: trendDoc, period: false, label: function () { return t('an.last', N); }};
  X.repKinds.rasio = {render: ratioRender, doc: ratioDoc, period: false, label: function () { return t('per.asof', C.fmtTgl(C.todayLocal())); }};
  X.repKinds.alert = {render: alertRender, doc: alertDoc, period: false, label: function () { return t('per.asof', C.fmtTgl(C.todayLocal())); }};
  X.repKinds.bva = {render: bvaRender, doc: bvaDoc, period: false, label: function () { return ''; }};
  X.analisis = {
    homeCard: function () {
      try {
        var cx = {R: S.rep, lines: X.getLines(), f: null, today: C.todayLocal()}, n = alertsFor(cx).filter(function (i) { return i.level !== 'good'; }).length;
        if (!n) return '';
        return '<button class="card tap alertcard" data-act="home-alerts"><div class="ah"><span class="gi">' + ICON.alert + '</span><span>' + esc(t('al.home', n)) + '</span><b>›</b></div></button>';
      } catch (e) { return ''; }
    }
  };
  Object.assign(A, {
    'bva-prev': function () { S.bvam = C2.addMonthKey(bvaMonth(), -1); X.render(); },
    'bva-next': function () { S.bvam = C2.addMonthKey(bvaMonth(), 1); X.render(); },
    'home-alerts': function () { S.rep.kind = 'alert'; X.setTab('laporan'); }
  });
})();
