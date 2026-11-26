if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['v36'] = '3.6.0';
/* Do it v3.6 - Beranda (statistik donat, anggaran, 14 hari, candlestick), Anggaran (alur dana, roll over manual, alokasi),
   Pendapatan/Pengeluaran (pencarian) dan Transaksi (filter kategori, banding pengguna, waktu sinkron). Tanpa perubahan server. */
(function () {
  'use strict';
  var X = window.DoIt; if (!X || !X.C) return;
  var C = X.C, C2 = X.C2, S = X.S, I = window.I18N, t = X.t, esc = X.esc, dn = X.dn, A = X.A, ICON = X.ICON, rc = X.rc, $ = X.$;
  var CH = ['#e4572e', '#f2a541', '#2a9d8f', '#4c6fbf', '#9b5de5', '#e05297', '#8d99ae'];

  I.add('id', {
    'v36.stat': 'Statistik', 'v36.st.exp': 'Pengeluaran', 'v36.st.inc': 'Pendapatan', 'v36.st.more': 'Lihat rincian', 'v36.other': 'Lainnya',
    'v36.d14': 'Pendapatan vs pengeluaran, 14 hari terakhir', 'v36.d14.avg.in': 'rata-rata harian masuk {0}', 'v36.d14.avg.out': 'rata-rata harian keluar {0}', 'v36.d14.hint': 'Arahkan atau ketuk batang untuk rinciannya. Garis putus-putus: rata-rata harian bulan ini.', 'v36.d14.net': 'Selisih',
    'v36.bud': 'Anggaran', 'v36.bud.none': 'Belum ada anggaran bulan ini.', 'v36.bud.set': 'Atur anggaran', 'v36.bud.in': 'Pendapatan', 'v36.bud.out': 'Pengeluaran', 'v36.bud.of': '{0} dari {1}', 'v36.bud.left': 'Sisa {0}', 'v36.bud.over': 'Lebih {0}', 'v36.bud.short': 'Kurang {0}', 'v36.bud.hit': 'Target tercapai, lebih {0}', 'v36.bud.day': 'Boleh dipakai {0} per hari ({1} hari lagi)',
    'v36.wf.style': 'Gaya grafik', 'v36.wf.wf': 'Waterfall', 'v36.wf.cd': 'Candlestick', 'v36.cd.open': 'Buka', 'v36.cd.close': 'Tutup', 'v36.cd.high': 'Tertinggi', 'v36.cd.low': 'Terendah', 'v36.cd.hint': 'Satu batang = satu bulan. Hijau: kekayaan bersih naik. Merah: turun. Garis tipis: titik tertinggi dan terendah.',
    'v36.flow.h': 'Dana yang bisa dianggarkan', 'v36.flow.in': 'Pendapatan sudah masuk', 'v36.flow.tgt': 'Target pendapatan belum masuk', 'v36.flow.bud': 'Sudah dianggarkan', 'v36.flow.free': 'Belum dianggarkan', 'v36.flow.over': 'Melebihi dana sebesar {0}', 'v36.flow.note': 'Dana = pendapatan yang sudah masuk, atau target pendapatan bila lebih besar.', 'v36.flow.noinc': 'Belum ada pendapatan atau target pendapatan bulan ini. Isi target di tab Pendapatan.',
    'v36.al.cat': 'Alokasi per kategori', 'v36.al.sub': 'Alokasi per subkategori', 'v36.al.pick': 'Kategori', 'v36.al.whole': 'Seluruh kategori', 'v36.al.none': 'Belum ada anggaran untuk dialokasikan.', 'v36.al.of': '{0} dari total',
    'v36.ro': 'Bawa sisa ke bulan depan', 'v36.ro.t': 'Bawa sisa anggaran', 'v36.ro.to': '{0} ke {1}', 'v36.ro.hint': 'Hanya sisa positif yang bisa dibawa. Kamu menentukan sendiri tiap bulan: pilih kategori yang sisanya mau dibawa.', 'v36.ro.apply': 'Bawa yang dipilih', 'v36.ro.none': 'Tidak ada sisa positif untuk dibawa.', 'v36.ro.done': 'Sudah dibawa {0}', 'v36.ro.undo': 'Batalkan', 'v36.ro.ok': '{0} sisa anggaran dibawa ke {1}', 'v36.ro.undone': 'Bawaan dibatalkan', 'v36.ro.auto': 'Roll over otomatis aktif di {0} anggaran. Bawaan dari bulan-bulan lalu ikut terhitung otomatis.', 'v36.ro.auto.off': 'Matikan otomatis', 'v36.ro.auto.q': 'Matikan roll over otomatis di semua anggaran pengeluaran? Bawaan otomatis tidak dihitung lagi, dan kamu membawa sisa lewat tombol ini.', 'v36.ro.sel': 'Pilih semua', 'v36.ro.left': 'sisa {0}',
    'v36.form.free': 'Belum dianggarkan bulan ini (di luar anggaran ini): {0}', 'v36.form.over': 'Sudah melebihi dana bulan ini sebesar {0}',
    'v36.fq': 'Cari kategori, subkategori, tag, barang, lokasi…', 'v36.fq.res': '{0} transaksi · {1}',
    'v36.tx.cat': 'Semua kategori', 'v36.tx.sub': 'Semua subkategori', 'v36.sync': 'Sinkron terakhir {0}', 'v36.sync.never': 'Belum pernah sinkron', 'v36.sync.wait': '{0} menunggu dikirim',
    'v36.vs': 'Perbandingan pengguna', 'v36.vs.in': 'Pendapatan', 'v36.vs.out': 'Pengeluaran'
  });
  I.add('en', {
    'v36.stat': 'Statistics', 'v36.st.exp': 'Expense', 'v36.st.inc': 'Income', 'v36.st.more': 'See details', 'v36.other': 'Others',
    'v36.d14': 'Income vs spending, last 14 days', 'v36.d14.avg.in': 'daily average in {0}', 'v36.d14.avg.out': 'daily average out {0}', 'v36.d14.hint': 'Hover or tap a bar for details. Dashed lines: this month\'s daily average.', 'v36.d14.net': 'Net',
    'v36.bud': 'Budget', 'v36.bud.none': 'No budget for this month yet.', 'v36.bud.set': 'Set budget', 'v36.bud.in': 'Income', 'v36.bud.out': 'Spending', 'v36.bud.of': '{0} of {1}', 'v36.bud.left': '{0} left', 'v36.bud.over': '{0} over', 'v36.bud.short': '{0} short', 'v36.bud.hit': 'Target reached, {0} above', 'v36.bud.day': 'You can spend {0} per day ({1} days left)',
    'v36.wf.style': 'Chart style', 'v36.wf.wf': 'Waterfall', 'v36.wf.cd': 'Candlestick', 'v36.cd.open': 'Open', 'v36.cd.close': 'Close', 'v36.cd.high': 'High', 'v36.cd.low': 'Low', 'v36.cd.hint': 'One candle = one month. Green: net worth rose. Red: fell. Thin line: highest and lowest point.',
    'v36.flow.h': 'Money available to budget', 'v36.flow.in': 'Income received', 'v36.flow.tgt': 'Income target not yet received', 'v36.flow.bud': 'Already budgeted', 'v36.flow.free': 'Not yet budgeted', 'v36.flow.over': 'Over the available money by {0}', 'v36.flow.note': 'Available = income received, or the income target if that is larger.', 'v36.flow.noinc': 'No income or income target this month. Set a target in the Income tab.',
    'v36.al.cat': 'Allocation by category', 'v36.al.sub': 'Allocation by subcategory', 'v36.al.pick': 'Category', 'v36.al.whole': 'Whole category', 'v36.al.none': 'No budget to allocate yet.', 'v36.al.of': '{0} of total',
    'v36.ro': 'Carry leftover to next month', 'v36.ro.t': 'Carry leftover budget', 'v36.ro.to': '{0} to {1}', 'v36.ro.hint': 'Only a positive leftover can be carried. You decide each month: pick the categories whose leftover you want to carry.', 'v36.ro.apply': 'Carry selected', 'v36.ro.none': 'No positive leftover to carry.', 'v36.ro.done': 'Already carried {0}', 'v36.ro.undo': 'Undo', 'v36.ro.ok': '{0} leftover budget(s) carried to {1}', 'v36.ro.undone': 'Carry undone', 'v36.ro.auto': 'Automatic carry-over is on for {0} budget(s). Carries from earlier months are counted automatically.', 'v36.ro.auto.off': 'Turn off automatic', 'v36.ro.auto.q': 'Turn off automatic carry-over on all spending budgets? Automatic carries are no longer counted, and you carry leftovers with this button.', 'v36.ro.sel': 'Select all', 'v36.ro.left': 'left {0}',
    'v36.form.free': 'Not yet budgeted this month (excluding this budget): {0}', 'v36.form.over': 'Already over the money available this month by {0}',
    'v36.fq': 'Search category, subcategory, tag, item, place…', 'v36.fq.res': '{0} transactions · {1}',
    'v36.tx.cat': 'All categories', 'v36.tx.sub': 'All subcategories', 'v36.sync': 'Last synced {0}', 'v36.sync.never': 'Never synced', 'v36.sync.wait': '{0} waiting to send',
    'v36.vs': 'Compare users', 'v36.vs.in': 'Income', 'v36.vs.out': 'Spending'
  });

  function frp(n) { return C.fmtRp(n); }
  function sumBy(a, f) { return a.reduce(function (s, x) { return s + f(x); }, 0); }
  function wide() { return !!(X.desk && X.desk.wide && X.desk.wide()); }
  function monthLbl(ym) { return C.namaBulan(+ym.substr(5, 2)) + ' ' + ym.substr(0, 4); }
  function pc(v, tot) { return X.viz ? X.viz.pc(v, tot) : Math.round(tot ? v / tot * 100 : 0) + '%'; }
  function ownerName(f) { return f && f.pemilik && f.pemilik !== 'Semua' ? f.pemilik : null; }
  function dim(n, s) { return Math.round(n) < 0 ? '−' : s; }

  // ---------------------------------------------------------------- Beranda: statistik donat (menggantikan kartu Bulan ini)
  function stat(P) {
    var tab = S.stTab === 'inc' ? 'inc' : 'exp', part = tab === 'inc' ? P.is.pendapatan : P.is.beban, tot = part.total, r = X.rangeOf('bulan');
    var gs = (part.groups || []).filter(function (g) { return g.total > 0; });
    var h = '<div class="card scard"><div class="ct"><h3>' + t('v36.stat') + '</h3><span class="muted sm">' + esc(monthLbl(r.start)) + '</span></div>' +
      '<div class="seg sm stseg">' + [['exp', 'v36.st.exp'], ['inc', 'v36.st.inc']].map(function (x) { return '<button class="' + (tab === x[0] ? 'on' : '') + '" data-act="v36-st" data-v="' + x[0] + '">' + t(x[1]) + '</button>'; }).join('') + '</div>';
    if (!tot || !gs.length) return h + '<div class="empty">' + t('flow.empty') + '</div></div>';
    var top = gs.slice(0, 6), rest = tot - sumBy(top, function (g) { return g.total; });
    h += '<div class="stdn">' + X.donut(gs, tot, t(tab === 'inc' ? 'v36.st.inc' : 'v36.st.exp')) + '</div><div class="stlist">' + top.map(function (g, i) {
      return '<div class="stl"><i style="background:' + CH[i] + '"></i><span class="stn">' + esc(dn(g.nama)) + '</span><em>' + esc(X.shortRp(g.total)) + '</em><b>' + pc(g.total, tot) + '</b></div>';
    }).join('') + (rest > 0 ? '<div class="stl"><i style="background:' + CH[6] + '"></i><span class="stn">' + t('v36.other') + '</span><em>' + esc(X.shortRp(rest)) + '</em><b>' + pc(rest, tot) + '</b></div>' : '') + '</div>' +
      '<button class="link stmore" data-act="page" data-v="' + (tab === 'inc' ? 'income' : 'expense') + '">' + t('v36.st.more') + '</button></div>';
    return h;
  }

  // ---------------------------------------------------------------- Beranda: pendapatan vs pengeluaran 14 hari
  var D14 = {days: [], sel: -1};
  function d14data(f) {
    var today = C.todayLocal(), start = C2.addDays(today, -13), lines = X.getOpLines(), owner = ownerName(f), M = S.M, m = {}, i, d;
    for (i = 0; i < 14; i++) { d = C2.addDays(start, i); m[d] = {d: d, inc: 0, exp: 0}; }
    for (i = 0; i < lines.length; i++) {
      var l = lines[i]; if (l.tanggal < start || l.tanggal > today || (owner && l.pemilik !== owner)) continue;
      var a = M.akun[l.kode]; if (!a) continue;
      if (a.Tipe === 'Pendapatan') m[l.tanggal].inc += l.kredit - l.debit; else if (a.Tipe === 'Beban') m[l.tanggal].exp += l.debit - l.kredit;
    }
    return Object.keys(m).sort().map(function (k) { var o = m[k]; o.inc = Math.max(0, Math.round(o.inc)); o.exp = Math.max(0, Math.round(o.exp)); return o; });
  }
  function dayLbl(d) { return +d.substr(8, 2) + ' ' + C.namaBulan(+d.substr(5, 2), true); }
  function d14tip(i) {
    var x = D14.days[i]; if (!x) return '';
    var net = x.inc - x.exp;
    return '<div class="wth"><b>' + esc(dayLbl(x.d)) + '</b><span class="dtag ' + (net >= 0 ? 'up' : 'dn') + '">' + (net > 0 ? '+' : (net < 0 ? '−' : '')) + esc(frp(Math.abs(net))) + '</span></div><div class="wtr">' +
      '<span class="muted">' + t('v36.st.inc') + '</span><b class="num in">+' + esc(frp(x.inc)) + '</b><span class="muted">' + t('v36.st.exp') + '</span><b class="num out">−' + esc(frp(x.exp)) + '</b></div>';
  }
  function d14card(P) {
    var days = d14data(P.f), big = wide(), W = big ? 760 : 342, H = big ? 250 : 220, padL = 6, padR = 6, padT = big ? 22 : 16, padB = big ? 34 : 22;
    var today = C.todayLocal(), dom = +today.substr(8, 2), avgIn = dom ? P.is.pendapatan.total / dom : 0, avgOut = dom ? P.is.beban.total / dom : 0;
    var mxI = Math.max(avgIn, 1), mxO = Math.max(avgOut, 1);
    days.forEach(function (x) { mxI = Math.max(mxI, x.inc); mxO = Math.max(mxO, x.exp); });
    var ih = H - padT - padB, sc = ih / (mxI + mxO), y0 = padT + mxI * sc, iw = W - padL - padR, bw = iw / 14, w = Math.min(34, bw * .62);
    if (D14.sel < 0 || D14.sel > 13 || D14.key !== today) { D14.key = today; D14.sel = 13; for (var q = 13; q >= 0; q--) if (days[q].inc || days[q].exp) { D14.sel = q; break; } }
    D14.days = days;
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="d14s" role="img" aria-label="' + esc(t('v36.d14')) + '">';
    svg += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y0.toFixed(1) + '" y2="' + y0.toFixed(1) + '" class="zl"/>';
    days.forEach(function (x, i) {
      var cx = padL + bw * i + bw / 2, hi = x.inc * sc, ho = x.exp * sc;
      svg += '<g class="d14g' + (D14.sel === i ? ' sel' : '') + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(dayLbl(x.d) + ' ' + frp(x.inc) + ' / ' + frp(x.exp)) + '"><rect x="' + (cx - bw / 2).toFixed(1) + '" y="0" width="' + bw.toFixed(1) + '" height="' + H + '" fill="transparent"/>' +
        (x.inc > 0 ? '<rect class="dbar in" x="' + (cx - w / 2).toFixed(1) + '" y="' + (y0 - Math.max(2, hi)).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(2, hi).toFixed(1) + '" rx="4"/>' : '') +
        (x.exp > 0 ? '<rect class="dbar out" x="' + (cx - w / 2).toFixed(1) + '" y="' + y0.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(2, ho).toFixed(1) + '" rx="4"/>' : '');
      if (big) {
        if (x.inc > 0) svg += '<text x="' + cx.toFixed(1) + '" y="' + (y0 - Math.max(2, hi) - 4).toFixed(1) + '" text-anchor="middle" class="vl in">' + esc(X.shortRp(x.inc)) + '</text>';
        if (x.exp > 0) svg += '<text x="' + cx.toFixed(1) + '" y="' + (y0 + Math.max(2, ho) + 11).toFixed(1) + '" text-anchor="middle" class="vl out">' + esc(X.shortRp(x.exp)) + '</text>';
      }
      svg += '<text x="' + cx.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" class="ax' + (x.d === today ? ' now' : '') + '">' + (big ? esc(dayLbl(x.d)) : +x.d.substr(8, 2)) + '</text></g>';
    });
    if (avgIn > 0) { var ya = y0 - avgIn * sc; svg += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + ya.toFixed(1) + '" y2="' + ya.toFixed(1) + '" class="avg in"/>'; }
    if (avgOut > 0) { var yb = y0 + avgOut * sc; svg += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + yb.toFixed(1) + '" y2="' + yb.toFixed(1) + '" class="avg out"/>'; }
    svg += '</svg>';
    var leg = '<div class="d14l"><span class="in"><i></i>' + t('v36.st.inc') + '</span><span class="out"><i></i>' + t('v36.st.exp') + '</span>' +
      '<span class="avl in"><s></s>' + esc(t('v36.d14.avg.in', X.shortRp(avgIn))) + '</span><span class="avl out"><s></s>' + esc(t('v36.d14.avg.out', X.shortRp(avgOut))) + '</span></div>';
    return '<div class="card d14c"><div class="ct"><h3>' + t('v36.d14') + '</h3></div>' + leg + '<div class="d14w">' + svg + '</div><div class="muted sm wfu">' + t('v36.d14.hint') + '</div><div id="d14-tip" class="wtip">' + d14tip(D14.sel) + '</div></div>';
  }
  function d14pick(g) {
    var i = +g.getAttribute('data-i'); if (isNaN(i) || D14.sel === i) return; D14.sel = i;
    var tip = $('#d14-tip'); if (tip) tip.innerHTML = d14tip(i);
    document.querySelectorAll('.d14s .d14g').forEach(function (n) { n.classList.toggle('sel', +n.getAttribute('data-i') === i); });
  }
  document.addEventListener('mouseover', function (e) { var g = e.target.closest && e.target.closest('.d14s .d14g'); if (g) d14pick(g); });
  document.addEventListener('click', function (e) { var g = e.target.closest && e.target.closest('.d14s .d14g'); if (g) d14pick(g); });
  document.addEventListener('focusin', function (e) { var g = e.target.closest && e.target.closest('.d14s .d14g'); if (g) d14pick(g); });

  // ---------------------------------------------------------------- anggaran: helper data
  function B() { return X.plan && X.plan.bud; }
  function linesOf(J) { return X.plan.allBudgetLines().filter(function (l) { return B().lineJenis(l) === J; }); }
  function incomeActual(k, owner) {
    var m = B().actualMaps('Income', k, owner), s = 0; Object.keys(m.g).forEach(function (g) { if (g !== X.NONOP_G) s += m.g[g]; }); return s;
  }
  /** Dana yang bisa dianggarkan: pendapatan yang sudah masuk, atau target pendapatan bila lebih besar. */
  function funds(k, owner) {
    var inc = C2.budgetMonth(linesOf('Income'), S.tx, k, owner), target = inc.total.tersedia, actual = incomeActual(k, owner);
    return {actual: actual, target: target, dana: Math.max(actual, target), belum: Math.max(0, target - actual)};
  }

  // ---------------------------------------------------------------- Beranda: kartu Anggaran berdiri sendiri
  function budRow(label, used, avail, kind, k) {
    var p = avail > 0 ? used / avail : (used > 0 ? 9.99 : 0), inc = kind === 'in', st = inc ? 'good' : (p > 1 ? 'bad' : (p >= .8 ? 'warn' : ''));
    var chip = inc ? (used >= avail ? t('v36.bud.hit', frp(used - avail)) : t('v36.bud.short', frp(avail - used))) : (avail - used >= 0 ? t('v36.bud.left', frp(avail - used)) : t('v36.bud.over', frp(used - avail)));
    var cls = inc ? (used >= avail ? 'in' : '') : (avail - used < 0 ? 'out' : 'in');
    var h = '<div class="bdr"><div class="bdh"><span>' + esc(label) + '</span><b>' + Math.round(p * 100) + '%</b></div><div class="bdv"><span class="num">' + esc(frp(used)) + '</span><small class="muted">' + esc((S.pref.lang === 'en' ? 'of ' : 'dari ') + X.shortRp(avail)) + '</small></div>' +
      '<div class="bdbar ' + st + '"><i style="width:' + Math.min(100, Math.round(p * 100)) + '%"></i></div><div class="bdf"><span class="' + cls + '">' + esc(chip) + '</span>';
    if (!inc) {
      var today = C.todayLocal(), dim2 = new Date(Date.UTC(+k.substr(0, 4), +k.substr(5, 2), 0)).getUTCDate(), left = dim2 - +today.substr(8, 2) + 1;
      if (k === today.substr(0, 7) && avail - used > 0 && left > 0) h += '<small class="muted">' + esc(t('v36.bud.day', X.shortRp((avail - used) / left), left)) + '</small>';
    }
    return h + '</div></div>';
  }
  function budget(P) {
    if (!X.plan || !X.plan.bud) return '';
    var k = C.todayLocal().substr(0, 7), owner = S.owner;
    var ex = C2.budgetMonth(linesOf('Expense'), S.tx, k, owner), inc = C2.budgetMonth(linesOf('Income'), S.tx, k, owner);
    var h = '<div class="card bcard"><div class="ct"><h3>' + t('v36.bud') + '</h3><span class="muted sm">' + esc(monthLbl(k)) + '</span><div class="sp"></div><button class="link sm" data-act="home-plan" data-v="anggaran">' + t('see.all') + '</button></div>';
    if (!ex.rows.length && !inc.rows.length) return h + '<div class="empty">' + t('v36.bud.none') + '</div><button class="btn sm" data-act="home-plan" data-v="anggaran">' + t('v36.bud.set') + '</button></div>';
    if (inc.rows.length) h += budRow(t('v36.bud.in'), inc.total.terpakai, inc.total.tersedia, 'in', k);
    if (ex.rows.length) h += budRow(t('v36.bud.out'), ex.total.terpakai, ex.total.tersedia, 'out', k);
    return h + '</div>';
  }

  // ---------------------------------------------------------------- Rencana > Anggaran: alur dana, alokasi, roll over
  function anggaranTop(J, k, bm, lines) {
    var b = B(), h = '', owner = S.owner;
    if (J === 'Expense') {
      var F = funds(k, owner), bud = bm.total.tersedia, free = F.dana - bud, p = F.dana > 0 ? bud / F.dana : (bud > 0 ? 9.99 : 0);
      h += '<div class="card flowc"><div class="ct"><h3>' + t('v36.flow.h') + '</h3></div>';
      if (!F.dana) h += '<div class="muted sm">' + t('v36.flow.noinc') + '</div>';
      else {
        h += '<div class="big2 num">' + esc(frp(F.dana)) + '</div><div class="sr muted sm"><span>' + t('v36.flow.in') + '</span><b>' + esc(frp(F.actual)) + '</b></div>' +
          (F.belum > 0 ? '<div class="sr muted sm"><span>' + t('v36.flow.tgt') + '</span><b>' + esc(frp(F.belum)) + '</b></div>' : '');
      }
      h += '<div class="flwsep"></div><div class="sr"><span>' + t('v36.flow.bud') + '</span><b class="num">' + esc(frp(bud)) + '</b></div>' +
        '<div class="pbar ' + (p > 1 ? 'bad' : (p >= .95 ? 'warn' : '')) + '"><i style="width:' + Math.min(100, Math.round(p * 100)) + '%"></i></div>' +
        '<div class="sr" style="margin-top:8px"><span>' + t('v36.flow.free') + '</span><b class="num ' + (free < 0 ? 'out' : 'in') + '">' + esc((free < 0 ? '−' : '') + frp(Math.abs(free))) + '</b></div>' +
        (free < 0 && F.dana ? '<div class="muted sm out">' + esc(t('v36.flow.over', frp(-free))) + '</div>' : '') +
        '<div class="muted sm" style="margin-top:6px">' + t('v36.flow.note') + '</div></div>';
      h += '<div class="btnrow"><button class="btn" data-act="v36-ro">' + ICON.swap + t('v36.ro') + '</button></div>';
    }
    // alokasi kategori + subkategori
    var cats = {}, order = [];
    bm.rows.forEach(function (r) { var g = b.lineGroup(r.line); if (!cats[g]) { cats[g] = {nama: g, total: 0, subs: [], whole: 0}; order.push(g); } cats[g].total += r.tersedia; if (r.line.scope === 'sub') cats[g].subs.push(r); else cats[g].whole += r.tersedia; });
    var groups = order.map(function (g) { return cats[g]; }).filter(function (g) { return g.total > 0; }).sort(function (a, c) { return c.total - a.total; }), tot = sumBy(groups, function (g) { return g.total; });
    if (!groups.length) return h + '<div class="card"><div class="empty">' + t('v36.al.none') + '</div></div>';
    var items = groups.map(function (g, i) { return {nama: dn(g.nama), v: g.total, ico: X.catIcon(g.nama)}; });
    var c1 = '<div class="card alc"><div class="ch">' + t('v36.al.cat') + '</div><div class="donutrow">' + X.donut(groups, tot, t(J === 'Income' ? 'v36.st.inc' : 'v36.bud')) + '<div class="alr">' + (X.viz ? X.viz.rows(items, tot, {limit: 8, color: J === 'Income' ? '#1f9d63' : null}) : '') + '</div></div></div>';
    var cur = groups.filter(function (g) { return g.nama === S.alCat; })[0] || groups[0], subItems = [];
    cur.subs.slice().sort(function (a, c) { return c.tersedia - a.tersedia; }).forEach(function (r) { var sc = S.M.katByKode[r.line.key]; subItems.push({nama: sc ? dn(sc.SubKategori) : r.line.key, v: r.tersedia, ico: X.catIcon(cur.nama, sc && sc.SubKategori, r.line.key)}); });
    if (cur.whole > 0) subItems.push({nama: t('v36.al.whole'), v: cur.whole, ico: X.catIcon(cur.nama)});
    var c2 = '<div class="card alc"><div class="ch">' + t('v36.al.sub') + '</div><div class="alpick"><label class="muted sm" for="v36-alcat">' + t('v36.al.pick') + '</label><select id="v36-alcat" class="sel">' +
      groups.map(function (g) { return '<option value="' + esc(g.nama) + '"' + (g.nama === cur.nama ? ' selected' : '') + '>' + esc(dn(g.nama)) + '</option>'; }).join('') + '</select><b class="num">' + esc(frp(cur.total)) + '</b></div>' +
      '<div class="muted sm">' + esc(t('v36.al.of', pc(cur.total, tot))) + '</div>' + (X.viz ? X.viz.rows(subItems, cur.total, {limit: 12, color: J === 'Income' ? '#1f9d63' : null}) : '') + '</div>';
    return h + '<div class="g2 alg">' + c1 + c2 + '</div>';
  }
  function formSisa(d) {
    var b = B(), k = b.curMonth(), F = funds(k, S.owner), bm = C2.budgetMonth(linesOf('Expense'), S.tx, k, S.owner), mine = bm.rows.filter(function (r) { return d.id && r.line.id === d.id; })[0];
    var free = F.dana - (bm.total.tersedia - (mine ? mine.tersedia : 0));
    if (!F.dana && !bm.total.tersedia) return '';
    return '<div class="card flowf ' + (free < 0 ? 'bad' : '') + '"><div class="sr"><span class="muted sm">' + esc(free < 0 ? t('v36.form.over', frp(-free)) : t('v36.form.free', frp(free))) + '</span></div></div>';
  }
  document.addEventListener('change', function (e) {
    var el = e.target; if (!el) return;
    if (el.id === 'v36-alcat') { S.alCat = el.value; X.render(); }
  });

  // ---- roll over manual
  var RO = null;
  function nextKey(k) { return C2.addMonthKey(k, 1); }
  function roRows() {
    var b = B(), k = RO.k, nk = RO.nk, bm = C2.budgetMonth(linesOf('Expense'), S.tx, k, S.owner), rows = [];
    bm.rows.forEach(function (r) {
      var l = r.line, done = l.ro && +l.ro[nk] > 0 ? +l.ro[nk] : 0, left = Math.max(0, r.sisa);
      rows.push({id: l.id, line: l, name: b.lineName(l) + (l.scope === 'sub' ? ' · ' + dn(b.lineGroup(l)) : ''), owner: l.pemilik, sisa: left, auto: !!l.rollover, done: done});
    });
    return rows.filter(function (x) { return x.sisa > 0 || x.done; }).sort(function (a, c) { return c.sisa - a.sisa; });
  }
  function roRender() {
    var ov = $('#overlay2'); if (!RO) { if (ov) ov.innerHTML = ''; return; }
    var rows = roRows(), autoN = sumBy(rows, function (x) { return x.auto ? 1 : 0; }), allAuto = linesOf('Expense').filter(function (l) { return l.rollover; }).length, b = B();
    var body = '<div class="muted sm" style="margin-bottom:10px">' + t('v36.ro.hint') + '</div>';
    if (allAuto) body += '<div class="note2">' + esc(t('v36.ro.auto', allAuto)) + ' <button class="link" data-act="v36-ro-auto">' + t('v36.ro.auto.off') + '</button></div>';
    var usable = rows.filter(function (x) { return !x.auto && x.sisa > 0; });
    if (!rows.length) body += '<div class="empty">' + t('v36.ro.none') + '</div>';
    else {
      if (usable.length > 1) body += '<button class="link" data-act="v36-ro-all">' + t('v36.ro.sel') + '</button>';
      body += rows.map(function (x) {
        var on = !!RO.sel[x.id] && !x.auto && x.sisa > 0;
        return '<div class="ror' + (x.auto ? ' dis' : '') + '"><button class="tog' + (on ? ' on' : '') + '" data-act="v36-ro-tog" data-id="' + esc(x.id) + '"' + (x.auto || x.sisa <= 0 ? ' disabled' : '') + '><i></i><span>' + esc(x.name) + (x.owner && S.owner === 'Semua' ? ' (' + esc(x.owner) + ')' : '') + '</span></button>' +
          '<div class="ra"><b class="num">' + esc(frp(x.sisa)) + '</b>' + (x.done ? '<small class="muted">' + esc(t('v36.ro.done', frp(x.done))) + ' <button class="link" data-act="v36-ro-undo" data-id="' + esc(x.id) + '">' + t('v36.ro.undo') + '</button></small>' : '') + '</div></div>';
      }).join('');
    }
    var n = usable.filter(function (x) { return RO.sel[x.id]; }).length, tot = sumBy(usable.filter(function (x) { return RO.sel[x.id]; }), function (x) { return x.sisa; });
    $('#overlay2').innerHTML = '<div class="scrim" data-act="v36-ro-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + esc(t('v36.ro.t')) + ' · ' + esc(t('v36.ro.to', monthLbl(RO.k), monthLbl(RO.nk))) + '</div><button class="x" data-act="v36-ro-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div><div class="sheet-b">' + body + '</div>' +
      '<div class="sheet-f">' + (RO.err ? '<div class="err">' + esc(RO.err) + '</div>' : '') + '<button class="btn primary" data-act="v36-ro-go"' + (n && !RO.busy ? '' : ' disabled') + '>' + t('v36.ro.apply') + (n ? ' · ' + esc(frp(tot)) : '') + '</button></div></div>';
  }
  function roSave(ops, msg) {
    RO.busy = true; RO.err = ''; roRender();
    return rc.batch(ops).then(function () { RO.busy = false; RO.sel = {}; X.toast(msg); roRender(); X.render(); }).catch(function (e) { RO.busy = false; RO.err = X.srvErr ? X.srvErr(e) : String(e && e.message || e); roRender(); });
  }
  Object.assign(A, {
    'v36-st': function (el) { S.stTab = el.dataset.v === 'inc' ? 'inc' : 'exp'; X.render(); },
    'v36-ro': function () {
      var k = B().curMonth(); RO = {k: k, nk: nextKey(k), sel: {}, busy: false, err: ''};
      roRows().forEach(function (x) { if (!x.auto && x.sisa > 0 && !x.done) RO.sel[x.id] = 1; });
      roRender();
    },
    'v36-ro-close': function () { RO = null; roRender(); },
    'v36-ro-tog': function (el) { var id = el.dataset.id; if (RO.sel[id]) delete RO.sel[id]; else RO.sel[id] = 1; roRender(); },
    'v36-ro-all': function () { var rs = roRows().filter(function (x) { return !x.auto && x.sisa > 0; }), full = rs.every(function (x) { return RO.sel[x.id]; }); RO.sel = {}; if (!full) rs.forEach(function (x) { RO.sel[x.id] = 1; }); roRender(); },
    'v36-ro-go': function () {
      var b = B(), ops = [], n = 0;
      roRows().forEach(function (x) {
        if (!RO.sel[x.id] || x.auto || x.sisa <= 0) return;
        var d = b.strip(JSON.parse(JSON.stringify(x.line))); d.ro = Object.assign({}, d.ro || {}); d.ro[RO.nk] = x.sisa; ops.push({op: 'simpan', tipe: 'anggaran', id: x.id, data: d}); n++;
      });
      if (!ops.length) return;
      roSave(ops, t('v36.ro.ok', n, monthLbl(RO.nk)));
    },
    'v36-ro-undo': function (el) {
      var b = B(), l = rc.list('anggaran').filter(function (x) { return x.id === el.dataset.id; })[0]; if (!l) return;
      var d = b.strip(JSON.parse(JSON.stringify(l))); d.ro = Object.assign({}, d.ro || {}); delete d.ro[RO.nk];
      roSave([{op: 'simpan', tipe: 'anggaran', id: l.id, data: d}], t('v36.ro.undone'));
    },
    'v36-ro-auto': function () {
      if (!confirm(t('v36.ro.auto.q'))) return;
      var b = B(), ops = linesOf('Expense').filter(function (l) { return l.rollover; }).map(function (l) { var d = b.strip(JSON.parse(JSON.stringify(l))); d.rollover = false; return {op: 'simpan', tipe: 'anggaran', id: l.id, data: d}; });
      if (ops.length) roSave(ops, t('saved'));
    }
  });

  // ---------------------------------------------------------------- candlestick kekayaan bersih
  var CD = {bars: [], sel: -1};
  function candleData(d, f) {
    var lines = X.getLines(), owner = ownerName(f), M = S.M, y0 = d.year + '-01-01', y1 = d.year + '-12-31', delta = {}, i;
    for (i = 0; i < lines.length; i++) {
      var l = lines[i]; if (l.tanggal < y0 || l.tanggal > y1 || (owner && l.pemilik !== owner)) continue;
      var a = M.akun[l.kode]; if (!a || (a.Tipe !== 'Aset' && a.Tipe !== 'Liabilitas')) continue;
      delta[l.tanggal] = (delta[l.tanggal] || 0) + l.debit - l.kredit;
    }
    var dates = Object.keys(delta).sort();
    return d.months.map(function (mo) {
      var o = mo.m === 1 ? d.start : d.months[mo.m - 2].end, lvl = o, hi = o, lo = o, pre = d.year + '-' + (mo.m < 10 ? '0' : '') + mo.m;
      dates.forEach(function (dt) { if (dt.substr(0, 7) !== pre) return; lvl += delta[dt]; hi = Math.max(hi, lvl); lo = Math.min(lo, lvl); });
      var c = mo.end; hi = Math.max(hi, c, o); lo = Math.min(lo, c, o);
      return {m: mo.m, l: C.namaBulan(mo.m, true), o: o, c: c, h: hi, lo: lo, title: C.namaBulan(mo.m) + ' ' + d.year};
    });
  }
  function jt(v) { return String(Math.round(v / 1e6)).replace('-', '−'); }
  function niceStep(raw) { var p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), m = raw / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
  function cdTip(i) {
    var b = CD.bars[i]; if (!b) return '';
    var ch = b.c - b.o;
    return '<div class="wth"><b>' + esc(b.title) + '</b><span class="dtag ' + (ch >= 0 ? 'up' : 'dn') + '">' + (ch > 0 ? '+' : (ch < 0 ? '−' : '')) + esc(frp(Math.abs(ch))) + '</span></div><div class="wtr">' +
      [['v36.cd.open', b.o], ['v36.cd.close', b.c], ['v36.cd.high', b.h], ['v36.cd.low', b.lo]].map(function (r) { return '<span class="muted">' + t(r[0]) + '</span><b class="num">' + esc(frp(r[1])) + '</b>'; }).join('') + '</div>';
  }
  function candle(d, f) {
    var bars = candleData(d, f), big = wide(), W = big ? 760 : 342, H = big ? 300 : 230, padL = big ? 44 : 34, padR = 6, padT = big ? 16 : 12, padB = 22, iw = W - padL - padR, ih = H - padT - padB, n = bars.length;
    CD.bars = bars; if (CD.sel < 0 || CD.sel >= n) CD.sel = Math.max(0, n - 1);
    var lo = Infinity, hi = -Infinity; bars.forEach(function (b) { lo = Math.min(lo, b.lo); hi = Math.max(hi, b.h); });
    var rng = (hi - lo) || Math.max(Math.abs(hi), 1e6) * .1, a0 = lo - rng * .12, a1 = hi + rng * .12, step = niceStep((a1 - a0) / 4);
    a0 = Math.floor(a0 / step) * step; a1 = Math.ceil(a1 / step) * step;
    function Y(v) { return padT + (a1 - v) / (a1 - a0) * ih; }
    var bw = iw / n, w = Math.min(30, bw * .56), svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="cds" role="img" aria-label="' + esc(t('v36.wf.cd')) + '">';
    for (var g = Math.ceil(a0 / step) * step; g <= a1 + 1; g += step) svg += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + Y(g).toFixed(1) + '" y2="' + Y(g).toFixed(1) + '" class="gl"/><text x="' + (padL - 6) + '" y="' + (Y(g) + 3.5).toFixed(1) + '" text-anchor="end" class="ax">' + esc(jt(g)) + '</text>';
    bars.forEach(function (b, i) {
      var cx = padL + bw * i + bw / 2, up = b.c >= b.o, top = Y(Math.max(b.o, b.c)), bot = Y(Math.min(b.o, b.c)), bh = Math.max(2, bot - top);
      svg += '<g class="cg' + (CD.sel === i ? ' sel' : '') + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(b.title + ' ' + frp(b.o) + ' - ' + frp(b.c)) + '"><rect x="' + (cx - bw / 2).toFixed(1) + '" y="0" width="' + bw.toFixed(1) + '" height="' + H + '" fill="transparent"/>' +
        '<line class="wk ' + (up ? 'up' : 'dn') + '" x1="' + cx.toFixed(1) + '" x2="' + cx.toFixed(1) + '" y1="' + Y(b.h).toFixed(1) + '" y2="' + Y(b.lo).toFixed(1) + '"/>' +
        '<rect class="cbody ' + (up ? 'up' : 'dn') + '" x="' + (cx - w / 2).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="3"/>' +
        '<text x="' + cx.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" class="ax">' + esc(b.l) + '</text></g>';
    });
    return '<div class="cdw">' + svg + '</svg></div><div class="muted sm wfu">' + t('dk.wf.unit') + ' · ' + t('v36.cd.hint') + '</div><div id="wf-tip" class="wtip">' + cdTip(CD.sel) + '</div>';
  }
  function cdPick(g) {
    var i = +g.getAttribute('data-i'); if (isNaN(i) || CD.sel === i) return; CD.sel = i;
    var tip = $('#wf-tip'); if (tip) tip.innerHTML = cdTip(i);
    document.querySelectorAll('.cds .cg').forEach(function (n) { n.classList.toggle('sel', +n.getAttribute('data-i') === i); });
  }
  document.addEventListener('mouseover', function (e) { var g = e.target.closest && e.target.closest('.cds .cg'); if (g) cdPick(g); });
  document.addEventListener('click', function (e) { var g = e.target.closest && e.target.closest('.cds .cg'); if (g) cdPick(g); });
  document.addEventListener('focusin', function (e) { var g = e.target.closest && e.target.closest('.cds .cg'); if (g) cdPick(g); });
  document.addEventListener('change', function (e) { if (e.target && e.target.id === 'wf-style') { S.wfStyle = e.target.value === 'candle' ? 'candle' : 'wf'; X.render(); } });
  function styleSelect() {
    var s = S.wfStyle === 'candle' ? 'candle' : 'wf';
    return '<select id="wf-style" class="sel" aria-label="' + esc(t('v36.wf.style')) + '"><option value="wf"' + (s === 'wf' ? ' selected' : '') + '>' + t('v36.wf.wf') + '</option><option value="candle"' + (s === 'candle' ? ' selected' : '') + '>' + t('v36.wf.cd') + '</option></select>';
  }

  // ---------------------------------------------------------------- Pendapatan & Pengeluaran: pencarian
  function matchFlow(x, q) {
    if (!q) return true;
    var hay = [x.Kategori, x.SubKategori, x.Tag, x.Barang, x.Lokasi, x.Toko].join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function flowResult(rows, q) {
    var tot = sumBy(rows, function (x) { return +x.Jumlah || 0; });
    return (q ? '<div class="muted sm flres">' + esc(t('v36.fq.res', C.fmtNum(rows.length), frp(tot))) + '</div>' : '');
  }
  document.addEventListener('input', function (e) {
    if (!e.target || e.target.id !== 'fq') return;
    S.fq = e.target.value; S.limit = 80; var l = $('#fl-list'); if (l && X.flowList) l.innerHTML = X.flowList();
  });

  // ---------------------------------------------------------------- Transaksi: filter kategori/subkategori, banding pengguna, waktu sinkron
  function catList() { var seen = {}, out = []; S.M.kategori.forEach(function (c) { if (c.Kategori && !seen[c.Kategori]) { seen[c.Kategori] = 1; out.push(c.Kategori); } }); return out; }
  function subList(cat) { return S.M.kategori.filter(function (c) { return !cat || c.Kategori === cat; }); }
  function txFilters() {
    var cat = S.txCat || '', sub = S.txSub || '';
    if (sub && !S.M.katByKode[sub]) sub = S.txSub = '';
    var h = '<select id="tx-cat" class="sel" aria-label="' + esc(t('v36.tx.cat')) + '"><option value="">' + t('v36.tx.cat') + '</option>' + catList().map(function (g) { return '<option value="' + esc(g) + '"' + (g === cat ? ' selected' : '') + '>' + esc(dn(g)) + '</option>'; }).join('') + '</select>' +
      '<select id="tx-sub" class="sel" aria-label="' + esc(t('v36.tx.sub')) + '"><option value="">' + t('v36.tx.sub') + '</option>' + subList(cat).map(function (c) { return '<option value="' + esc(c.KodeAkun) + '"' + (c.KodeAkun === sub ? ' selected' : '') + '>' + esc(dn(c.SubKategori) + (cat ? '' : ' · ' + dn(c.Kategori))) + '</option>'; }).join('') + '</select>';
    return h;
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function syncText() {
    var n = S.queue ? S.queue.length : 0, base;
    if (!S.lastSync) base = t('v36.sync.never');
    else { var d = new Date(S.lastSync); base = t('v36.sync', d.getDate() + ' ' + C.namaBulan(d.getMonth() + 1, true) + ' ' + d.getFullYear() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds())); }
    return base + (n ? ' · ' + t('v36.sync.wait', n) : '');
  }
  function txBar() { return '<div class="txbar"><small class="muted txsync" id="txsync">' + esc(syncText()) + '</small></div>'; }
  function userCompare(rows) {
    var us = (S.M.users || []).slice(); if (us.length < 2) return '';
    var agg = {}; us.forEach(function (u) { agg[u] = {inc: 0, out: 0}; });
    rows.forEach(function (x) {
      if (x.Status !== 'Aktif' || X.isNonOp(x.KodeAkun) || !agg[x.PemilikDompet]) return;
      var a = agg[x.PemilikDompet];
      if (x.Jenis === 'Income') a.inc += +x.Jumlah; else if (x.Jenis === 'Expense') a.out += +x.Jumlah; else if (x.Jenis === 'Transfer' && +x.BiayaAdmin) a.out += +x.BiayaAdmin;
    });
    function block(key, label, cls) {
      var tot = sumBy(us, function (u) { return agg[u][key]; }), mx = Math.max.apply(null, us.map(function (u) { return agg[u][key]; }).concat([1]));
      return '<div class="vsb"><div class="vsh"><span>' + esc(label) + '</span><b class="' + cls + '">' + esc(frp(tot)) + '</b></div>' + us.map(function (u, i) {
        var v = agg[u][key];
        return '<div class="vsr"><span class="vsn">' + esc(u) + '</span><div class="vsbar"><i class="' + cls + ' u' + (i % 2) + '" style="width:' + (v ? Math.max(2, v / mx * 100) : 0) + '%"></i></div><b class="num">' + esc(X.shortRp(v)) + '</b><em>' + (tot ? pc(v, tot) : '0%') + '</em></div>';
      }).join('') + '</div>';
    }
    return '<div class="card vsc"><div class="ch">' + esc(us.join(' vs ')) + '</div><div class="vsg">' + block('inc', t('v36.vs.in'), 'in') + block('out', t('v36.vs.out'), 'out') + '</div></div>';
  }
  document.addEventListener('change', function (e) {
    var el = e.target; if (!el) return;
    if (el.id === 'tx-cat') { S.txCat = el.value; S.txSub = ''; S.limit = 80; X.render(); }
    else if (el.id === 'tx-sub') { S.txSub = el.value; if (el.value && S.M.katByKode[el.value]) S.txCat = S.M.katByKode[el.value].Kategori; S.limit = 80; X.render(); }
  });

  X.v36 = {linesOf: linesOf, stat: stat, d14: d14card, budget: budget, anggaranTop: anggaranTop, formSisa: formSisa, candle: candle, styleSelect: styleSelect, matchFlow: matchFlow, flowResult: flowResult, txFilters: txFilters, txBar: txBar, userCompare: userCompare, syncText: syncText, funds: funds};
})();
