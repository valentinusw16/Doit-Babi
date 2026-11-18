if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['analisis'] = '2.3.1';
/* Do it v2.1 - analisis: Tren (6/12 bulan, per kategori, tahun lalu, naik/turun, per hari), Rasio + rincian hitungan,
   Peringatan (di lonceng), Sankey Beranda, Arus Kas, Anggaran vs Realisasi. Semua memakai garis operasional
   (tanpa "Di Luar Operasional" = untung/rugi belum terealisasi). */
(function () {
  'use strict';
  var X = window.DoIt, S = X.S, C = X.C, C2 = X.C2, t = X.t, esc = X.esc, ICON = X.ICON, A = X.A, dn = X.dn;
  var fm = function (n) { return C.fmtRp(n); };
  var CH = ['#e4572e', '#f2a541', '#2a9d8f', '#4c6fbf', '#9b5de5', '#e05297', '#8d99ae'];
  var CHI = ['#1b7f4b', '#3aa36a', '#6cc08f', '#a5d9b9', '#8d99ae'];
  function nM() { return S.trN || 6; }
  function lab(k) { return C.namaBulan(+k.substr(5, 2), true) + ' ' + k.substr(2, 2); }
  function pbar(p) { return '<div class="pbar ' + (p > 1 ? 'bad' : (p >= 0.8 ? 'warn' : '')) + '"><i style="width:' + Math.min(100, Math.round(p * 100)) + '%"></i></div>'; }
  function dec(v) { return typeof v === 'string' && /^-?\d+\.\d$/.test(v) && S.pref.lang !== 'en' ? v.replace('.', ',') : (typeof v === 'number' ? C.fmtNum(v) : v); }
  function pc(v) { return v == null ? '—' : Math.round(v * 100) + '%'; }
  function curKey() { return C.todayLocal().substr(0, 7); }
  function nSeg() { return '<div class="seg sm nseg">' + [6, 12].map(function (n) { return '<button class="' + (nM() === n ? 'on' : '') + '" data-act="tr-n" data-v="' + n + '">' + t('an.nmonth', n) + '</button>'; }).join('') + '</div>'; }

  // ---------------------------------------------------------------- grafik
  function bars(ser, keys) {
    keys = keys || ['pendapatan', 'beban'];
    var mx = Math.max.apply(null, ser.map(function (s) { return Math.max.apply(null, keys.map(function (k) { return s[k]; })); }).concat([1])), W = 320, H = 130, bw = W / ser.length, one = keys.length === 1;
    var g = ser.map(function (s, i) {
      var x = i * bw, out = '';
      keys.forEach(function (k, j) {
        var hh = s[k] / mx * (H - 22), w = one ? bw * 0.6 : bw * 0.36, xx = one ? x + bw * 0.2 : x + bw * (0.12 + 0.38 * j);
        out += '<rect class="' + (k === 'pendapatan' ? 'bin' : 'bout') + '" x="' + xx.toFixed(1) + '" y="' + (H - 16 - hh).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(0, hh).toFixed(1) + '" rx="2"/>';
      });
      return out + (ser.length <= 6 || i % 2 === (ser.length - 1) % 2 ? '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 3) + '" class="bl">' + esc(lab(s.bulan)) + '</text>' : '');
    }).join('');
    return '<svg class="bars" viewBox="0 0 ' + W + ' ' + H + '">' + g + '</svg>' + (one ? '' : '<div class="legend2"><span><i class="in"></i>' + t('r.income') + '</span><span><i class="out"></i>' + t('r.expense') + '</span></div>');
  }
  function line(vals, labels, color) {
    var W = 320, H = 90, mx = Math.max.apply(null, vals.concat([1])), n = vals.length;
    var xy = vals.map(function (v, i) { return [(n === 1 ? 0.5 : i / (n - 1)) * (W - 8) + 4, H - 8 - v / mx * (H - 16)]; });
    var d = xy.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none"><path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2.4"/>' +
      xy.map(function (p) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.6" fill="' + color + '"/>'; }).join('') + '</svg>' +
      '<div class="sparklbl"><span>' + esc(labels[0]) + '</span><span>' + esc(X.shortRp(mx)) + '</span><span>' + esc(labels[labels.length - 1]) + '</span></div>';
  }

  // ---------------------------------------------------------------- data tren
  function series(f) { return C2.monthlySeries(X.getOpLines(), S.M, curKey(), nM(), f, C.pass); }
  function groupSeries(tipe, f, n) { return C2.groupMonthly(X.getOpLines(), S.M, tipe, curKey(), n || nM(), f, C.pass); }
  function catOpts(tipe, f) {
    var gm = groupSeries(tipe, f);
    return Object.keys(gm).filter(function (k) { return k !== X.NONOP_G; }).map(function (k) { return {v: k, l: dn(k), tot: gm[k].reduce(function (a, b) { return a + b; }, 0)}; }).sort(function (a, b) { return b.tot - a.tot; });
  }
  function catTrend(tipe, f, key) {
    var opts = catOpts(tipe, f); if (!opts.length) return '';
    var cur = S[key] && opts.some(function (o) { return o.v === S[key]; }) ? S[key] : opts[0].v, gm = groupSeries(tipe, f), vals = gm[cur] || [], keys = [], i;
    for (i = nM() - 1; i >= 0; i--) keys.push(lab(C2.addMonthKey(curKey(), -i)));
    var prev = vals.slice(0, -1), av = C2.avg(prev);
    X.ddOpts[key] = function () { return {title: t('an.pickcat'), opts: opts.map(function (o) { return {v: o.v, l: o.l}; })}; };
    return '<div class="card"><div class="sr" style="margin:0 0 8px"><b>' + t('an.cattrend') + '</b>' + X.dd(dn(cur), key, 'tr-cat-' + key, cur) + '</div>' + line(vals, keys, tipe === 'Pendapatan' ? '#1b7f4b' : '#c0392b') +
      '<div class="muted sm" style="margin-top:6px">' + esc(t('an.cat.avg', fm(Math.round(av)), fm(vals[vals.length - 1] || 0))) + '</div></div>';
  }
  /** (b) bulan ini (hari 1..sekarang) dibanding periode yang sama tahun lalu. */
  function yoy(f, which) {
    var today = C.todayLocal(), s1 = today.substr(0, 8) + '01', ly = (+today.substr(0, 4) - 1) + today.substr(4), lyS = ly.substr(0, 8) + '01';
    var lyE = ly; if (!C.isDate(lyE)) lyE = ly.substr(0, 8) + '28';
    var L = X.getOpLines(), a = C.incomeStatement(L, S.M, s1, today, f), b = C.incomeStatement(L, S.M, lyS, lyE, f);
    function row(lbl, x, y, cls) {
      var p = y ? Math.round((x - y) / y * 100) : null;
      return '<div class="row"><div class="grow"><div class="t">' + lbl + '</div><div class="s">' + esc(t('an.yoy.then', fm(y))) + '</div></div><div class="a ' + cls + '">' + esc(fm(x)) + '<small class="' + (p == null ? '' : ((cls === 'out' ? p > 0 : p < 0) ? 'out' : 'in')) + '">' + (p == null ? '—' : (p > 0 ? '+' : '') + p + '%') + '</small></div></div>';
    }
    var h = '<h2>' + esc(t('an.yoy', '1–' + (+today.substr(8, 2)) + ' ' + C.namaBulan(+today.substr(5, 2), true))) + '</h2><div class="card">';
    if (!b.pendapatan.total && !b.beban.total) return h + '<div class="empty sm">' + t('an.yoy.none') + '</div></div>';
    if (which !== 'expense') h += row(t('r.income'), a.pendapatan.total, b.pendapatan.total, 'in');
    if (which !== 'income') h += row(t('r.expense'), a.beban.total, b.beban.total, 'out');
    if (which) {
      var part = which === 'income' ? 'pendapatan' : 'beban', pb = {}; b[part].groups.forEach(function (g) { pb[g.nama] = g.total; });
      a[part].groups.filter(function (g) { return g.nama !== X.NONOP_G; }).slice(0, 5).forEach(function (g) { h += row(esc(dn(g.nama)), g.total, pb[g.nama] || 0, which === 'income' ? 'in' : 'out'); });
    }
    return h + '</div>';
  }
  /** (f) kategori paling naik / turun: rata-rata 3 bulan terakhir (lengkap) vs 3 bulan sebelumnya. */
  function movers(f) {
    var gm = C2.groupMonthly(X.getOpLines(), S.M, 'Beban', C2.addMonthKey(curKey(), -1), 6, f, C.pass), rows = [];
    Object.keys(gm).forEach(function (k) { if (k === X.NONOP_G) return; var v = gm[k], a = C2.avg(v.slice(0, 3)), b = C2.avg(v.slice(3)); if (a || b) rows.push({nama: k, a: a, b: b, d: b - a}); });
    if (!rows.length) return '';
    var up = rows.filter(function (r) { return r.d > 0; }).sort(function (x, y) { return y.d - x.d; }).slice(0, 3), dn2 = rows.filter(function (r) { return r.d < 0; }).sort(function (x, y) { return x.d - y.d; }).slice(0, 3);
    function li(r) { return '<div class="row"><div class="grow"><div class="t">' + esc(dn(r.nama)) + '</div><div class="s">' + esc(t('an.mv.s', fm(Math.round(r.a)), fm(Math.round(r.b)))) + '</div></div><div class="a ' + (r.d > 0 ? 'out' : 'in') + '">' + (r.d > 0 ? '+' : '−') + esc(C.fmtNum(Math.round(Math.abs(r.d)))) + '</div></div>'; }
    return '<h2>' + t('an.movers') + '</h2><div class="muted sm" style="margin:-4px 4px 8px">' + t('an.movers.s') + '</div><div class="card">' +
      (up.length ? '<div class="sec out">' + t('an.up') + '</div>' + up.map(li).join('') : '') + (dn2.length ? '<div class="sec in">' + t('an.down') + '</div>' + dn2.map(li).join('') : '') + '</div>';
  }
  /** (g) rata-rata pengeluaran per hari dalam seminggu. */
  function weekday(f) {
    var today = C.todayLocal(), start = C2.addMonthKey(curKey(), -(nM() - 1)) + '-01', tot = [0, 0, 0, 0, 0, 0, 0], cnt = [0, 0, 0, 0, 0, 0, 0], d;
    for (d = start; d <= today; d = C2.addDays(d, 1)) cnt[new Date(d + 'T00:00:00Z').getUTCDay()]++;
    Object.keys(S.tx).forEach(function (k) {
      var x = S.tx[k], dd = x.Waktu.substr(0, 10);
      if (x.Status !== 'Aktif' || x.Jenis !== 'Expense' || dd < start || dd > today || X.isNonOp(x.KodeAkun) || (f && x.PemilikDompet !== f.pemilik)) return;
      tot[new Date(dd + 'T00:00:00Z').getUTCDay()] += +x.Jumlah;
    });
    var order = [1, 2, 3, 4, 5, 6, 0], av = order.map(function (i) { return cnt[i] ? tot[i] / cnt[i] : 0; }), mx = Math.max.apply(null, av.concat([1])), top = av.indexOf(Math.max.apply(null, av));
    var names = t('an.days').split(',');
    return '<h2>' + t('an.weekday') + '</h2><div class="card">' + order.map(function (i, j) {
      return '<div class="wd' + (j === top ? ' top' : '') + '"><span>' + esc(names[j]) + '</span><div class="bar red"><i style="width:' + Math.max(2, Math.round(av[j] / mx * 100)) + '%"></i></div><b>' + esc(X.shortRp(Math.round(av[j]))) + '</b></div>';
    }).join('') + '<div class="muted sm" style="margin-top:8px">' + esc(t('an.weekday.s', t('an.days.full').split(',')[top])) + '</div></div>';
  }

  function trendRender(cx) {
    var f = cx.f, ser = series(f), prev = ser.slice(0, -1), h = nSeg();
    var aI = C2.avg(prev.map(function (s) { return s.pendapatan; })), aO = C2.avg(prev.map(function (s) { return s.beban; })), last = ser[ser.length - 1];
    h += '<div class="card"><div class="ch">' + t('an.inout', nM()) + '</div>' + bars(ser) + '</div>';
    h += '<div class="card"><dl class="dl"><dt>' + t('an.avg.in') + '</dt><dd class="in">' + esc(fm(Math.round(aI))) + '</dd><dt>' + t('an.avg.out') + '</dt><dd class="out">' + esc(fm(Math.round(aO))) + '</dd><dt>' + t('an.avg.net') + '</dt><dd>' + esc(fm(Math.round(aI - aO))) + '</dd><dt>' + t('an.this') + '</dt><dd>' + esc(fm(last.net)) + '</dd></dl></div>';
    var nw = C2.netWorthSeries(X.getLines(), S.M, curKey(), nM(), f, C.pass);
    if (nw.length > 1) h += '<div class="card"><div class="ch">' + t('an.networth') + '</div>' + X.sparkline(nw) + '</div>';
    h += catTrend('Beban', f, 'trcat');
    h += yoy(f) + movers(f) + weekday(f);
    return h;
  }
  function trendDoc(cx) {
    var ser = series(cx.f), b = [];
    b.push({k: 'head', l: t('an.inout', nM()), r: ''});
    ser.forEach(function (s) { b.push({k: 'row', l: lab(s.bulan), s: t('r.income') + ' ' + C.fmtNum(s.pendapatan), r: C.fmtNum(s.beban), c: 'out'}); });
    var nw = C2.netWorthSeries(X.getLines(), S.M, curKey(), nM(), cx.f, C.pass);
    b.push({k: 'head', l: t('an.networth'), r: ''}); nw.forEach(function (s) { b.push({k: 'row', l: lab(s.bulan), r: C.fmtNum(s.saldo)}); });
    return {title: t('r.tren'), sub: cx.f ? cx.R.who : t('r.combined'), blocks: b, foot: 'Do it · ' + C.fmtTgl(cx.today)};
  }
  /** Tren di halaman Pemasukan & Pengeluaran. */
  X.trendFlow = function (kind, f) {
    var inc = kind === 'income', ser = series(f), key = inc ? 'pendapatan' : 'beban', prev = ser.slice(0, -1);
    var h = '<div class="h2row"><h2>' + t('an.trend.h') + '</h2>' + nSeg() + '</div><div class="card">' + bars(ser, [key]) +
      '<div class="muted sm" style="margin-top:6px">' + esc(t('an.avg.month', fm(Math.round(C2.avg(prev.map(function (s) { return s[key]; })))))) + '</div></div>';
    return h + catTrend(inc ? 'Pendapatan' : 'Beban', f, inc ? 'trcatI' : 'trcat') + yoy(f, kind);
  };

  // ---------------------------------------------------------------- rasio
  function kasNow(lines, f) {
    var m = C.walletBalances(lines, S.M, f), tot = 0;
    m.forEach(function (w) { var a = S.M.akun[w.kode]; if (a && a.Kelompok === 'Kas') tot += Math.max(0, w.saldo); });
    return tot;
  }
  function snapshot(f) {
    var today = C.todayLocal(), mk = today.substr(0, 7), L = X.getLines(), op = X.getOpLines();
    var ser = C2.monthlySeries(op, S.M, mk, 6, f, C.pass), cur = ser[ser.length - 1];
    var bs = C.balanceSheet(L, S.M, today, f), kas = kasNow(L, f);
    var loans = C.openLoans(S.tx).filter(function (l) { return !f || l.pemilik === f.pemilik; });
    var cic = 0, hs = C2.groupMonthly(op, S.M, 'Beban', mk, 1, f, C.pass);
    Object.keys(S.tx).forEach(function (k) { var x = S.tx[k]; if (x.Status === 'Aktif' && x.Jenis === 'Utang/Piutang' && x.SubJenis === 'Bayar utang' && x.Waktu.substr(0, 7) === mk && (!f || x.PemilikDompet === f.pemilik)) cic += +x.Jumlah; });
    var top = Object.keys(hs).map(function (k) { return {nama: k, jumlah: hs[k][0]}; }).sort(function (a, b) { return b.jumlah - a.jumlah; });
    var inv = 0; bs.aset.groups.forEach(function (g) { if (g.nama === 'Investasi') inv += g.total; });
    var lewat = {Piutang: 0, Utang: 0}; loans.forEach(function (l) { if (l.jatuhTempo && l.jatuhTempo < today) lewat[l.kind]++; });
    var over = []; try { C2.budgetMonth(X.plan.budgetLines(), S.tx, mk, f ? f.pemilik : null).rows.forEach(function (r) { if (r.sisa < 0) over.push(dn(r.line.scope === 'sub' ? ((S.M.katByKode[r.line.key] || {}).SubKategori || r.line.key) : r.line.key) + (r.line.pemilik && !f ? ' (' + r.line.pemilik + ')' : '')); }); } catch (e) {}
    var short = loans.filter(function (l) { return l.kind === 'Utang' && l.jangka === 'Pendek'; }).reduce(function (s, l) { return s + l.sisa; }, 0);
    return {pendapatan: cur.pendapatan, beban: cur.beban, seriBeban: ser.slice(0, -1).map(function (s) { return s.beban; }), kas: kas, aset: bs.aset.total, utang: bs.liabilitas.total, utangPendek: short, cicilanBulanan: cic, investasi: inv, seri: ser, topKategori: top, anggaranLewat: over, piutangLewat: lewat.Piutang, utangLewat: lewat.Utang, netWorth: bs.aset.total - bs.liabilitas.total};
  }
  function insightText(i) { var a = i.args.map(dec); return {w: t.apply(null, ['w.' + i.kode].concat(a)), a: t.apply(null, ['a.' + i.kode].concat(a))}; }
  var RA = [
    {k: 'tabungan', key: 'tabungan', fmt: pc, ok: function (v) { return v >= C2.TARGET.tabungan; }, tgt: function () { return t('ra.t.min', pc(C2.TARGET.tabungan)); }, ins: /^(defisit|tabungan)/,
      calc: function (s, v) { return [[t('ra.c.in'), fm(s.pendapatan)], [t('ra.c.out'), fm(s.beban)], [t('ra.c.save'), fm(s.pendapatan - s.beban)], [t('ra.c.formula.tab'), pc(v)]]; }},
    {k: 'darurat', key: 'danaDarurat', fmt: function (v) { return v == null ? '—' : t('ra.months', dec(v.toFixed(1))); }, ok: function (v) { return v >= C2.TARGET.darurat; }, tgt: function () { return t('ra.t.minm', C2.TARGET.darurat); }, ins: /^darurat/,
      calc: function (s, v) { var a = C2.avg(s.seriBeban) || s.beban; return [[t('ra.c.kas'), fm(s.kas)], [t('ra.c.avgout'), fm(Math.round(a))], [t('ra.c.formula.dar'), v == null ? '—' : t('ra.months', dec(v.toFixed(1)))]]; }},
    {k: 'utang', key: 'utangAset', fmt: pc, ok: function (v) { return v <= C2.TARGET.utang; }, tgt: function () { return t('ra.t.max', pc(C2.TARGET.utang)); }, ins: /^utang\.(tinggi|sedang|baik)/,
      calc: function (s, v) { return [[t('ra.c.debt'), fm(s.utang)], [t('ra.c.assets'), fm(s.aset)], [t('ra.c.formula.ut'), pc(v)]]; }},
    {k: 'cicilan', key: 'cicilan', fmt: pc, ok: function (v) { return v <= C2.TARGET.cicilan; }, tgt: function () { return t('ra.t.max', pc(C2.TARGET.cicilan)); }, ins: /^cicilan/,
      calc: function (s, v) { return [[t('ra.c.inst'), fm(s.cicilanBulanan)], [t('ra.c.in'), fm(s.pendapatan)], [t('ra.c.formula.cic'), pc(v)]]; }},
    {k: 'likuiditas', key: 'likuiditas', fmt: function (v) { return v == null ? '—' : dec(v.toFixed(1)) + '×'; }, ok: function (v) { return v >= 1; }, tgt: function () { return t('ra.t.min', '1×'); }, ins: /^likuiditas/,
      calc: function (s, v) { return [[t('ra.c.kas'), fm(s.kas)], [t('ra.c.short'), fm(s.utangPendek)], [t('ra.c.formula.liq'), v == null ? '—' : dec(v.toFixed(1)) + '×']]; }},
    {k: 'investasi', key: 'investasi', fmt: pc, ok: function (v) { return v >= 0.1; }, tgt: function () { return t('ra.t.info'); }, ins: /^investasi/,
      calc: function (s, v) { return [[t('ra.c.inv'), fm(s.investasi)], [t('ra.c.assets'), fm(s.aset)], [t('ra.c.formula.inv'), pc(v)]]; }}
  ];
  function ratioRender(cx) {
    var s = snapshot(cx.f), r = C2.ratios(s), ins = C2.insights(s);
    return '<div class="muted sm" style="margin:0 4px 8px">' + t('ra.tap') + '</div>' + RA.map(function (d) {
      var v = r[d.key], ok = v != null && d.ok(v), open = S.raOpen === d.k, it = ins.filter(function (i) { return d.ins.test(i.kode); })[0];
      var h = '<div class="card ratio tap' + (open ? ' open' : '') + '" data-act="ra-open" data-v="' + d.k + '"><div class="sr" style="margin:0"><b>' + t('ra.' + d.k) + '</b><span class="tag ' + (v == null ? '' : (ok ? 'ok' : 'bad')) + '">' + (v == null ? '—' : t(ok ? 'ra.ok' : 'ra.no')) + '</span></div>' +
        '<div class="big2">' + esc(d.fmt(v)) + '</div><div class="muted sm">' + esc(d.tgt()) + '</div>';
      if (open) {
        h += '<div class="calc"><div class="ch sm">' + t('ra.how') + '</div>' + d.calc(s, v).map(function (c, i, arr) { return '<div class="sr' + (i === arr.length - 1 ? ' res' : '') + '"><span>' + esc(c[0]) + '</span><b>' + esc(c[1]) + '</b></div>'; }).join('') +
          '<div class="muted sm" style="margin-top:6px">' + t('ra.src.' + d.k) + '</div>';
        if (it) { var tx = insightText(it); h += '<div class="adv"><b>' + t('ra.comment') + '</b> ' + esc(tx.w) + (tx.a ? ' ' + esc(tx.a) : '') + '</div>'; }
        else h += '<div class="adv"><b>' + t('ra.comment') + '</b> ' + esc(v == null ? t('ra.nodata') : t(ok ? 'ra.gen.ok' : 'ra.gen.no')) + '</div>';
        h += '</div>';
      }
      return h + '</div>';
    }).join('') + '<div class="note">' + t('ra.note') + '</div>';
  }
  function ratioDoc(cx) {
    var s = snapshot(cx.f), r = C2.ratios(s), b = [];
    RA.forEach(function (d) { b.push({k: 'row', l: t('ra.' + d.k), s: d.tgt(), r: d.fmt(r[d.key])}); });
    return {title: t('r.rasio'), sub: C.fmtTgl(C.todayLocal()) + ' · ' + (cx.f ? cx.R.who : t('r.combined')), blocks: b, foot: 'Do it'};
  }
  X.hooks.homeRatio = function (f) {
    var s = snapshot(f), r = C2.ratios(s);
    if (!s.pendapatan && !s.beban && !s.aset) return '';
    return '<button class="card tap rgrid" data-act="home-ratio"><div class="ah"><span>' + t('home.ratio') + '</span><b>' + ICON.chev + '</b></div><div class="rg">' + RA.slice(0, 4).map(function (d) {
      var v = r[d.key], ok = v != null && d.ok(v);
      return '<div class="ri"><span class="dot2 ' + (v == null ? '' : (ok ? 'ok' : 'bad')) + '"></span><div><small>' + t('ra.s.' + d.k) + '</small><b>' + esc(d.fmt(v)) + '</b></div></div>';
    }).join('') + '</div></button>';
  };

  // ---------------------------------------------------------------- Sankey (Beranda)
  X.hooks.homeSankey = function (is) {
    var I = is.pendapatan.total, E = is.beban.total; if (!I && !E) return '';
    function top(groups, n) { var g = groups.filter(function (x) { return x.total > 0; }), a = g.slice(0, n), rest = g.slice(n).reduce(function (s, x) { return s + x.total; }, 0); if (rest > 0) a = a.concat([{nama: t('sk.other'), total: rest, other: 1}]); return a; }
    var left = top(is.pendapatan.groups, 4).map(function (g, i) { return {l: dn(g.nama), v: g.total, c: CHI[Math.min(i, 4)]}; });
    var right = top(is.beban.groups, 5).map(function (g, i) { return {l: g.other ? g.nama : dn(g.nama), v: g.total, c: CH[Math.min(i, 6)]}; });
    if (I > E) right.push({l: t('sk.save'), v: I - E, c: 'var(--accent)', save: 1});
    if (E > I) left.push({l: t('sk.deficit'), v: E - I, c: '#8d99ae'});
    var T = Math.max(I, E), W = 340, nw = 8, gap = 6, Hc = 200, mid = (W - nw) / 2;
    var nL = left.length, nR = right.length, H = Hc + gap * Math.max(nL, nR) + 30, sc = Hc / T;
    function stack(arr, x) { var y = 22 + (Math.max(nL, nR) - arr.length) * gap / 2; arr.forEach(function (n) { n.x = x; n.y = y; n.h = Math.max(1.5, n.v * sc); y += n.h + gap; }); }
    stack(left, 0); stack(right, W - nw);
    var my = 22 + (Math.max(nL, nR) - 1) * gap / 2, mh = T * sc, svg = '';
    function link(x1, y1, x2, y2, h, c) { var cx = (x1 + x2) / 2; return '<path d="M' + x1 + ' ' + y1 + ' C' + cx + ' ' + y1 + ' ' + cx + ' ' + y2 + ' ' + x2 + ' ' + y2 + ' L' + x2 + ' ' + (y2 + h) + ' C' + cx + ' ' + (y2 + h) + ' ' + cx + ' ' + (y1 + h) + ' ' + x1 + ' ' + (y1 + h) + ' Z" fill="' + c + '" opacity=".28"/>'; }
    var off = my; left.forEach(function (n) { svg += link(nw, n.y, mid, off, n.v * sc, n.c); off += n.v * sc; });
    off = my; right.forEach(function (n) { svg += link(mid + nw, off, W - nw, n.y, n.v * sc, n.c); off += n.v * sc; });
    left.concat(right).forEach(function (n) { svg += '<rect x="' + n.x + '" y="' + n.y.toFixed(1) + '" width="' + nw + '" height="' + n.h.toFixed(1) + '" rx="2" fill="' + n.c + '"/>'; });
    svg += '<rect x="' + mid + '" y="' + my.toFixed(1) + '" width="' + nw + '" height="' + mh.toFixed(1) + '" rx="2" fill="var(--ink)"/>';
    function lbl(n, right) {
      if (n.h < 9) return ''; var x = right ? W - nw - 4 : nw + 4, y = n.y + Math.min(n.h / 2, 12) + 3.5;
      return '<text x="' + x + '" y="' + y.toFixed(1) + '" class="skl" text-anchor="' + (right ? 'end' : 'start') + '">' + esc(n.l) + ' <tspan class="skv">' + esc(X.shortRp(n.v)) + '</tspan></text>';
    }
    left.forEach(function (n) { svg += lbl(n, false); }); right.forEach(function (n) { svg += lbl(n, true); });
    svg += '<text x="' + (mid + nw / 2) + '" y="14" class="skl" text-anchor="middle">' + esc(t('sk.mid', X.shortRp(I))) + '</text>';
    return '<div class="card sankey"><div class="ah"><span>' + t('home.flow') + '</span><button class="link" data-act="page" data-v="expense">' + t('see.all') + '</button></div><svg viewBox="0 0 ' + W + ' ' + H.toFixed(0) + '">' + svg + '</svg></div>';
  };

  // ---------------------------------------------------------------- peringatan (di lonceng)
  function warnList() {
    var key = (S._lines && S._lines.length) + '|' + S.rev + '|' + S.rencana.length + '|' + C.todayLocal();
    if (S._wKey !== key) {
      S._wKey = key; try { S._w = C2.insights(snapshot(null)); } catch (e) { S._w = []; }
      try { if (X.plan && X.plan.planAlerts) { var pa = X.plan.planAlerts(), ord = {bad: 0, warn: 1, note: 2, good: 3}; S._w = S._w.concat(pa).sort(function (a, b) { return ord[a.level] - ord[b.level]; }); } } catch (e) {}
    }
    return S._w;
  }
  function sig(i) { return i.kode + ':' + i.level + (i.id ? ':' + i.id : ''); }
  X.analisis = {
    newWarnCount: function () { if (!S.cfg) return 0; var seen = S.prefs.warnSeen || {}; return warnList().filter(function (i) { return i.level !== 'good' && !seen[sig(i)]; }).length; },
    markWarnSeen: function () { var m = {}; warnList().forEach(function (i) { m[sig(i)] = 1; }); S.prefs.warnSeen = m; X.persist(); },
    warnView: function () {
      var list = warnList(), seen = S.prefs.warnSeen || {}, bad = list.filter(function (i) { return i.level !== 'good'; }), good = list.filter(function (i) { return i.level === 'good'; });
      if (!list.length) return '<div class="card"><div class="empty">' + t('al.empty') + '</div></div>';
      function card(i) { var tx = insightText(i), nw = i.level !== 'good' && !seen[sig(i)]; return '<div class="card alert ' + i.level + (nw ? ' new' : '') + '"><div class="ah"><span class="gi">' + (i.level === 'good' ? ICON.check : (i.level === 'note' ? ICON.target : ICON.alert)) + '</span><span>' + esc(tx.w) + '</span>' + (nw ? '<i class="dot"></i>' : '') + '</div>' + (i.level !== 'good' && tx.a && t('a.' + i.kode) !== 'a.' + i.kode ? '<div class="adv"><b>' + t('al.action') + '</b> ' + esc(tx.a) + '</div>' : '') + '</div>'; }
      return '<div class="muted sm" style="margin:0 4px 8px">' + t('al.note') + '</div>' + (bad.length ? bad.map(card).join('') : '<div class="card"><div class="empty">' + t('al.none') + '</div></div>') +
        (good.length ? '<h2>' + t('al.good') + '</h2>' + good.map(card).join('') : '') + '<div style="margin-top:8px"><button class="link" data-act="home-ratio">' + t('al.toratio') + '</button></div>';
    }
  };

  // ---------------------------------------------------------------- Arus Kas
  function kelompok(nama) { var d = S.M.dompet[nama], a = d && S.M.akun[d.KodeAkun]; return a ? a.Kelompok : ''; }
  function cashFlow(cx) {
    var f = cx.f, start = cx.per.start, end = cx.end, own = f && f.pemilik;
    function isK(nama) { var d = S.M.dompet[nama]; return !!d && kelompok(nama) === 'Kas' && (!own || d.Pemilik === own); }
    var sec = {op: {}, inv: {}, up: {}, tr: {}, lain: {}};
    function add(s, lbl, inn, out) { var r = sec[s][lbl] || (sec[s][lbl] = {l: lbl, masuk: 0, keluar: 0}); r.masuk += inn || 0; r.keluar += out || 0; }
    Object.keys(S.tx).forEach(function (k) {
      var x = S.tx[k], d = x.Waktu.substr(0, 10), j = +x.Jumlah || 0;
      if (x.Status !== 'Aktif' || d < start || d > end) return;
      if (x.Jenis === 'Income' && isK(x.Dompet)) add(X.isNonOp(x.KodeAkun) ? 'lain' : 'op', dn(x.Kategori || ''), j, 0);
      else if (x.Jenis === 'Expense' && isK(x.Dompet)) add(X.isNonOp(x.KodeAkun) ? 'lain' : 'op', dn(x.Kategori || ''), 0, j);
      else if (x.Jenis === 'Transfer') {
        var a = isK(x.Dompet), b = isK(x.DompetTujuan), fee = +x.BiayaAdmin || 0;
        if (a && fee) add('op', t('cf.fee'), 0, fee);
        if (a) { var kb = kelompok(x.DompetTujuan); if (b || kb === 'Kas') add('tr', t('cf.to', x.DompetTujuan), 0, j); else add('inv', t('cf.to', x.DompetTujuan), 0, j); }
        if (b) { var ka = kelompok(x.Dompet); if (a || ka === 'Kas') add('tr', t('cf.from', x.Dompet), j, 0); else add('inv', t('cf.from', x.Dompet), j, 0); }
      } else if (x.Jenis === 'Utang/Piutang' && isK(x.Dompet)) {
        var inn = x.SubJenis === 'Pinjam' || x.SubJenis === 'Terima pelunasan';
        add('up', t('cf.up.' + x.SubJenis.replace(/\s/g, '')), inn ? j : 0, inn ? 0 : j);
      } else if (x.Jenis === 'Saldo awal' && x.SubJenis === 'Dompet' && isK(x.Dompet)) add('lain', t('cf.opening'), j, 0);
    });
    var L = X.getLines(), kodes = {}; S.M.dompetAktif.concat(Object.keys(S.M.dompet).map(function (n) { return S.M.dompet[n]; })).forEach(function (d) { if (isK(d.Nama)) kodes[d.KodeAkun] = 1; });
    function bal(upto) { var s = 0; L.forEach(function (l) { if (kodes[l.kode] && l.tanggal <= upto) s += l.debit - l.kredit; }); return s; }
    var out = {awal: bal(C2.addDays(start, -1)), akhir: bal(end), sec: []};
    ['op', 'inv', 'up', 'tr', 'lain'].forEach(function (s) {
      var rows = Object.keys(sec[s]).map(function (k) { return sec[s][k]; }).sort(function (a, b) { return (b.masuk + b.keluar) - (a.masuk + a.keluar); });
      if (!rows.length) return;
      var m = rows.reduce(function (a, r) { return a + r.masuk; }, 0), kk = rows.reduce(function (a, r) { return a + r.keluar; }, 0);
      out.sec.push({k: s, rows: rows, masuk: m, keluar: kk, net: m - kk});
    });
    out.net = out.sec.reduce(function (a, s) { return a + s.net; }, 0);
    return out;
  }
  function cfRender(cx) {
    var cf = cashFlow(cx), h = '<div class="card hero"><div class="sr" style="margin:0"><span>' + t('cf.open') + '</span><b>' + esc(fm(cf.awal)) + '</b></div><div class="sr"><span>' + t('cf.net') + '</span><b class="' + (cf.net < 0 ? 'out' : 'in') + '">' + esc((cf.net > 0 ? '+' : '') + fm(cf.net)) + '</b></div><div class="sr"><span>' + t('cf.close') + '</span><b>' + esc(fm(cf.akhir)) + '</b></div></div>';
    if (!cf.sec.length) return h + '<div class="card"><div class="empty">' + t('r.noact') + '</div></div>';
    h += cf.sec.map(function (s) {
      return '<div class="card cf"><div class="ah"><span>' + t('cf.s.' + s.k) + '</span><b class="' + (s.net < 0 ? 'out' : 'in') + '">' + esc((s.net > 0 ? '+' : '') + C.fmtNum(s.net)) + '</b></div>' +
        '<div class="sr muted sm"><span>' + esc(t('cf.inout', C.fmtNum(s.masuk), C.fmtNum(s.keluar))) + '</span></div>' + s.rows.map(function (r) {
          return '<div class="row"><div class="grow"><div class="t">' + esc(r.l) + '</div></div><div class="a">' + (r.masuk ? '<span class="in">+' + esc(C.fmtNum(r.masuk)) + '</span>' : '') + (r.masuk && r.keluar ? '<br>' : '') + (r.keluar ? '<span class="out">−' + esc(C.fmtNum(r.keluar)) + '</span>' : '') + '</div></div>';
        }).join('') + '</div>';
    }).join('');
    var diff = cf.awal + cf.net - cf.akhir;
    if (Math.abs(diff) > 0.5) h += '<div class="note">' + esc(t('cf.diff', fm(diff))) + '</div>';
    return h + '<div class="note">' + t('cf.note') + '</div>';
  }
  function cfDoc(cx) {
    var cf = cashFlow(cx), b = [{k: 'row', l: t('cf.open'), r: C.fmtNum(cf.awal)}];
    cf.sec.forEach(function (s) { b.push({k: 'head', l: t('cf.s.' + s.k), r: C.fmtNum(s.net)}); s.rows.forEach(function (r) { b.push({k: 'row', ind: 1, l: r.l, r: (r.masuk ? '+' + C.fmtNum(r.masuk) : '') + (r.masuk && r.keluar ? ' / ' : '') + (r.keluar ? '−' + C.fmtNum(r.keluar) : ''), c: r.masuk - r.keluar < 0 ? 'out' : 'in'}); }); });
    b.push({k: 'total', l: t('cf.close'), r: C.fmtNum(cf.akhir)});
    return {title: t('r.cf'), sub: C.fmtTgl(cx.per.start) + ' – ' + C.fmtTgl(cx.end) + ' · ' + (cx.f ? cx.R.who : t('r.combined')), blocks: b, foot: 'Do it'};
  }

  // ---------------------------------------------------------------- Anggaran vs Realisasi
  function bvaMonth() { return S.bvam || C.todayLocal().substr(0, 7); }
  function bvaData(cx) { return C2.budgetVsActual(X.plan.budgetLines(), S.tx, bvaMonth(), cx.R.who); }
  function lname(l) { var nm = l.scope === 'sub' ? ((S.M.katByKode[l.key] || {}).SubKategori || l.key) : l.key; return dn(nm) + (l.pemilik && S.rep.who === 'Semua' ? ' (' + l.pemilik + ')' : ''); }
  function bvaRender(cx) {
    var k = bvaMonth(), d = bvaData(cx), T = d.total, today = C.todayLocal(), h = '';
    h += '<div class="mnav"><button class="hb" data-act="bva-prev">' + ICON.back + '</button><b>' + esc(C.namaBulan(+k.substr(5, 2)) + ' ' + k.substr(0, 4)) + '</b><button class="hb" data-act="bva-next">' + ICON.chev + '</button></div>';
    if (!d.rows.length) return h + '<div class="card"><div class="empty">' + t('bva.empty') + '</div></div>';
    var diff = T.tersedia - T.terpakai;
    h += '<div class="card hero"><div class="sr"><span>' + t('bva.budget') + '</span><b>' + esc(fm(T.tersedia)) + '</b></div><div class="sr"><span>' + t('bva.actual') + '</span><b>' + esc(fm(T.terpakai)) + '</b></div><div class="sr"><span>' + t('bva.diff') + '</span><b class="' + (diff < 0 ? 'out' : 'in') + '">' + esc(fm(diff)) + '</b></div>' + pbar(T.tersedia ? T.terpakai / T.tersedia : 0) +
      (k === today.substr(0, 7) && T.terpakai ? '<div class="sub2">' + esc(t('bl.proj', fm(C2.projection(T.terpakai, k, today)))) + '</div>' : '') + '</div>';
    h += '<div class="card"><table class="tbl"><tr><th></th><th>' + t('bva.budget') + '</th><th>' + t('bva.actual') + '</th><th>%</th></tr>' + d.rows.map(function (r) {
      return '<tr><td>' + esc(lname(r.line)) + '</td><td>' + esc(C.fmtNum(r.tersedia)) + '</td><td>' + esc(C.fmtNum(r.terpakai)) + '</td><td class="' + (r.pct > 1 ? 'out' : '') + '">' + Math.round(r.pct * 100) + '%</td></tr>';
    }).join('') + '</table></div>';
    if (d.tanpaAnggaran.length) h += '<h2>' + t('bva.nobudget') + ' · ' + esc(C.fmtNum(d.totalTanpa)) + '</h2><div class="card">' + d.tanpaAnggaran.map(function (r) { return '<div class="row"><div class="grow"><div class="t">' + esc(dn(r.nama)) + '</div></div><div class="a out">' + esc(C.fmtNum(r.terpakai)) + '</div></div>'; }).join('') + '</div>';
    return h;
  }
  function bvaDoc(cx) {
    var k = bvaMonth(), d = bvaData(cx), b = [];
    d.rows.forEach(function (r) { b.push({k: 'row', l: lname(r.line), s: C.fmtNum(r.terpakai) + ' / ' + C.fmtNum(r.tersedia), r: Math.round(r.pct * 100) + '%', c: r.pct > 1 ? 'out' : ''}, {k: 'prog', v: r.pct}); });
    b.push({k: 'total', l: t('bva.diff'), r: C.fmtNum(d.total.tersedia - d.total.terpakai)});
    return {title: t('r.bva'), sub: C.namaBulan(+k.substr(5, 2)) + ' ' + k.substr(0, 4), blocks: b, foot: 'Do it'};
  }

  X.ddOpts = X.ddOpts || {};
  X.repKinds.tren = {render: trendRender, doc: trendDoc, period: false, dim: false, label: function () { return t('an.last', nM()); }};
  X.repKinds.rasio = {render: ratioRender, doc: ratioDoc, period: false, dim: false, label: function () { return t('per.asof', C.fmtTgl(C.todayLocal())); }};
  X.repKinds.bva = {render: bvaRender, doc: bvaDoc, period: false, dim: false, label: function () { return ''; }};
  X.repKinds.cf = {render: cfRender, doc: cfDoc, dim: false, label: function (cx) { return C.fmtTgl(cx.per.start) + ' – ' + C.fmtTgl(cx.end); }};
  Object.assign(A, {
    'bva-prev': function () { S.bvam = C2.addMonthKey(bvaMonth(), -1); X.render(); },
    'bva-next': function () { S.bvam = C2.addMonthKey(bvaMonth(), 1); X.render(); },
    'tr-n': function (el) { S.trN = +el.dataset.v; X.render(); },
    'tr-cat-trcat': function (el) { S.trcat = el.dataset.v; X.render(); },
    'tr-cat-trcatI': function (el) { S.trcatI = el.dataset.v; X.render(); },
    'ra-open': function (el) { S.raOpen = S.raOpen === el.dataset.v ? null : el.dataset.v; X.render(); },
    'home-ratio': function () { S.rep.kind = 'rasio'; S.rep.who = S.owner; S.raOpen = null; X.setTab('laporan'); }
  });
})();
