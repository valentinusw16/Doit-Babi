if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['v371'] = '3.7.2';
/* Do it v3.7.1/3.7.2 - Beranda disempurnakan (v3.7.2: kartu berfoto gelap & terbaca, donat pastel, Sankey proporsional, Waterfall hanya pilihan tahun): Net Worth dan Waterfall jadi dua kartu (masing-masing bisa berfoto), Aset & Utang berikon,
   Arus kas mengikuti tinggi kartu di sebelahnya, Transaksi terbaru per hari (tinggi mengikuti Kalender), Kalender lebar dengan detail
   saat diketuk dan penanda JT, Anggaran ringkas dengan peringatan subkategori, JT di Notifikasi.
   Tanpa perubahan server. */
(function () {
  'use strict';
  var X = window.DoIt; if (!X || !X.v37 || !X.desk || !X.desk.calData || !X.plan || !X.analisis) return;
  var C = X.C, C2 = X.C2, S = X.S, I = window.I18N, t = X.t, esc = X.esc, dn = X.dn, A = X.A, ICON = X.ICON, LAST = null, DESK = 900;

  I.add('id', {
    'v371.jt': 'Jatuh tempo', 'v371.jt.log': 'Catat', 'v371.jt.skip': 'Lewati', 'v371.jt.edit': 'Ubah', 'v371.jt.over': 'Perlu dicatat', 'v371.jt.done': 'Sudah dicatat', 'v371.jt.plan': 'Terjadwal',
    'v371.jt.next': 'Berikutnya', 'v371.jt.none': 'Tidak ada jatuh tempo pada hari ini.', 'v371.day.none': 'Belum ada transaksi pada hari ini.', 'v371.open': 'Lihat transaksi', 'v371.hint': 'Ketuk tanggal untuk melihat rincian.',
    'v371.s.over': 'Melebihi', 'v371.s.warn': 'Waspada', 'v371.bud.warn': 'Perlu diperhatikan', 'v371.bud.ok': 'Semua anggaran masih aman.',
    'v371.th.time': 'Jam', 'v371.th.tx': 'Transaksi', 'v371.th.who': 'Pemilik · dompet', 'v371.th.amt': 'Jumlah', 'v371.n.due': '{0} transaksi rutin jatuh tempo', 'v371.left': 'Sisa', 'v371.trend': 'Tren {0}', 'v371.comp': 'Komposisi: aset {0} · utang {1}', 'v371.in': 'Masuk', 'v371.out': 'Keluar', 'v371.health': 'Kesehatan', 'v371.flow': 'Arus kas bulan ini'
  });
  I.add('en', {
    'v371.jt': 'Due', 'v371.jt.log': 'Log', 'v371.jt.skip': 'Skip', 'v371.jt.edit': 'Edit', 'v371.jt.over': 'Needs logging', 'v371.jt.done': 'Logged', 'v371.jt.plan': 'Scheduled',
    'v371.jt.next': 'Next', 'v371.jt.none': 'Nothing due on this day.', 'v371.day.none': 'No transactions on this day.', 'v371.open': 'View transactions', 'v371.hint': 'Tap a date to see the details.',
    'v371.s.over': 'Over', 'v371.s.warn': 'Watch', 'v371.bud.warn': 'Needs attention', 'v371.bud.ok': 'All budgets are on track.',
    'v371.th.time': 'Time', 'v371.th.tx': 'Transaction', 'v371.th.who': 'Owner · wallet', 'v371.th.amt': 'Amount', 'v371.n.due': '{0} recurring transactions due', 'v371.left': 'Left', 'v371.trend': 'Trend {0}', 'v371.comp': 'Composition: assets {0} · debts {1}', 'v371.in': 'Income', 'v371.out': 'Spent', 'v371.health': 'Health', 'v371.flow': 'Cash flow this month'
  });

  var TN = {a: '#4fae9a', u: '#c9788a', i: '#3f9f6b', o: '#e08a5b', h: '#7e8fd6'};
  var PAL = ['var(--dc0)', 'var(--dc1)', 'var(--dc2)', 'var(--dc3)', 'var(--dc4)', 'var(--dc5)'];
  function frp(n) { return C.fmtRp(n); }
  function fnum(n) { return C.fmtNum(Math.round(n)); }
  function dual(n) { return '<span class="vf">' + esc(frp(n)) + '</span><span class="vs">' + esc('Rp ' + X.shortRp(n)) + '</span>'; }
  function pct1(p) { return (Math.round(p * 10) / 10).toFixed(1).replace('.', S.pref.lang === 'en' ? '.' : ',') + '%'; }
  function dayName(d) { return String(t('an.days.full')).split(',')[(new Date(d + 'T00:00:00Z').getUTCDay() + 6) % 7]; }
  function dShort(d) { return +d.substr(8, 2) + ' ' + C.namaBulan(+d.substr(5, 2), true); }
  function tint(c, p) { return 'color-mix(in srgb, ' + c + ' ' + p + '%, transparent)'; }

  // ---------------------------------------------------------------- Net Worth
  function nwCard(P) {
    var hb = X.hooks.heroBg ? X.hooks.heroBg() : null, is = P.is, ta = P.A.bs.aset.total, tu = P.A.bs.liabilitas.total, yr = +C.todayLocal().substr(0, 4);
    var hs = P.hero.indexOf('<div class="lbl">'), he = P.hero.indexOf('<div class="sub2">');
    var head = hs >= 0 ? P.hero.slice(hs, he >= 0 ? he : undefined) : '', extra = (X.hooks.heroExtra ? X.hooks.heroExtra(P.f) : '').replace(/<div class="pj">[\s\S]*$/, '');
    var spark = '';
    try {
      var nd = X.desk.nwData(P.f, yr);
      if (nd && nd.has && nd.months.length) {
        var pts = [nd.start].concat(nd.months.map(function (m) { return m.end; })), lo = Math.min.apply(null, pts), hi = Math.max.apply(null, pts), sp = (hi - lo) || 1, W = 300, H = 80, n = pts.length - 1 || 1;
        var xy = pts.map(function (v, i) { return [4 + i * (W - 8) / n, 8 + (hi - v) / sp * (H - 18)]; }), ln = xy.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '), lp = xy[xy.length - 1];
        spark = '<div class="nws"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true"><path d="M' + xy[0][0].toFixed(1) + ' ' + H + ' L' + ln.replace(/ /g, ' L') + ' L' + lp[0].toFixed(1) + ' ' + H + ' Z" class="sa"/><polyline points="' + ln + '" class="sl" vector-effect="non-scaling-stroke"/></svg></div>' +
          '<div class="nwx"><span>' + esc(C.namaBulan(1, true)) + '</span><span>' + esc(t('v371.trend', yr)) + '</span><span>' + esc(C.namaBulan(nd.months.length, true)) + '</span></div>';
      }
    } catch (e) { spark = ''; }
    var sc = X.analisis.health(P.f), lbl = sc == null ? t('v37.na') : (sc >= 75 ? t('v37.good') : (sc >= 50 ? t('v37.mid') : t('v37.low')));
    function pc(v) { return (Math.round(v * 100) / 100).toFixed(2).replace('.', S.pref.lang === 'en' ? '.' : ',') + '%'; }
    var tot = ta + tu, pa = tot > 0 ? ta / tot * 100 : 100;
    function row(tn, ico, label, val, cls, v) {
      return '<button class="nwr tap" style="--tn:' + TN[tn] + '" data-act="page" data-v="' + v + '"><span class="ti">' + ico + '</span><span class="nl">' + esc(label) + '</span><b class="' + cls + '">' + esc(frp(val)) + '</b></button>';
    }
    function tile(tn, ico, label, val, cls, act, v) {
      return '<button class="nwt tap" style="--tn:' + TN[tn] + '" data-act="' + act + '"' + (v ? ' data-v="' + v + '"' : '') + '><span class="nth"><span class="ti">' + ico + '</span><small>' + esc(label) + '</small></span><b class="' + cls + '">' + val + '</b></button>';
    }
    var rows = '<div class="nwrs">' + row('a', ICON.wallet, t('v37.aset'), ta, '', 'portfolio') + row('u', ICON.loan, t('v37.utang'), tu, tu > 0 ? 'out' : '', 'payable') +
      '<div class="nwb" aria-hidden="true"><i style="width:' + pa.toFixed(2) + '%"></i></div><small class="nwc">' + esc(t('v371.comp', pc(pa), pc(100 - pa))) + '</small></div>';
    var tiles = '<div class="nwg">' + tile('i', ICON.inArr, t('v371.in'), dual(is.pendapatan.total), 'in', 'page', 'income') + tile('o', ICON.outArr, t('v371.out'), dual(is.beban.total), 'out', 'page', 'expense') +
      tile('h', ICON.heart, t('v371.health'), '<span class="hs ' + (sc == null ? '' : (sc >= 75 ? 'in' : (sc >= 50 ? '' : 'out'))) + '">' + (sc == null ? '—' : sc + ' · ') + esc(sc == null ? '' : lbl) + '</span>', '', 'home-ratio', '') + '</div>';
    return '<div class="card hero hmain nw' + (hb ? ' photo ' + hb.cls : '') + '">' + (hb ? hb.html : '') + head + extra + spark + rows + tiles + '</div>';
  }

  // ---------------------------------------------------------------- Waterfall (kartu sendiri, foto sendiri)
  function wfCard(P) {
    var hb = X.hooks.heroBg2 ? X.hooks.heroBg2() : null, st = S.wfStyle, md = S.wfMode, h;
    S.wfStyle = 'wf'; S.wfMode = 'bulan';
    try { h = X.desk.wfCard(P); } finally { S.wfStyle = st; S.wfMode = md; }
    h = h.replace(/<select(?![^>]*id="wf-year")[^>]*>[\s\S]*?<\/select>/g, '');
    return h.replace('<div class="card wfc">', '<div class="card wfc wfx' + (hb ? ' photo ' + hb.cls : '') + '">' + (hb ? hb.html : ''));
  }

  // ---------------------------------------------------------------- Aset & Utang (berikon)
  function donut(items, total, lbl, tot) {
    var Z = 118, SW = 16, R = (Z - SW) / 2, c = Z / 2, L = 2 * Math.PI * R, off = 0, g = '';
    if (total > 0) items.forEach(function (it) {
      var d = it.v / total * L; if (d <= 0) return;
      g += '<circle cx="' + c + '" cy="' + c + '" r="' + R + '" stroke="' + it.c + '" stroke-width="' + SW + '" stroke-dasharray="' + Math.max(d - (items.length > 1 ? 2 : 0), .6).toFixed(2) + ' ' + L.toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>'; off += d;
    });
    return '<svg class="adsv" viewBox="0 0 ' + Z + ' ' + Z + '" role="img" aria-label="' + esc(lbl + ' ' + tot) + '"><g fill="none" transform="rotate(-90 ' + c + ' ' + c + ')"><circle cx="' + c + '" cy="' + c + '" r="' + R + '" stroke="var(--line)" stroke-width="' + SW + '"/>' + g + '</g>' +
      '<text x="' + c + '" y="' + (c - 2) + '" text-anchor="middle" class="adt1">' + esc(lbl) + '</text><text x="' + c + '" y="' + (c + 14) + '" text-anchor="middle" class="adt2">' + esc(tot) + '</text></svg>';
  }
  function legend(groups, total, red) {
    return groups.map(function (g, i) {
      var c = red ? 'var(--dcu)' : PAL[i % PAL.length], pg = /piutang/i.test(g.nama);
      var a = red ? 'data-act="page" data-v="payable"' : (pg ? 'data-act="page" data-v="receivable"' : 'data-act="page" data-v="portfolio" data-g="' + esc(g.nama) + '"');
      return '<div class="adr tap" ' + a + '><span class="ai" style="--tn:' + c + '">' + (red ? ICON.loan : X.catIcon(g.nama)) + '</span><span class="adn"><b>' + esc(dn(g.nama)) + '</b><small>' + esc(t('home.grp.n', g.rows.length)) + '</small></span><span class="adp">' + pct1(total ? g.total / total * 100 : 0) + '</span><b class="adv">' + esc('Rp ' + X.shortRp(g.total)) + '</b></div>';
    }).join('');
  }
  function adCard(P) {
    var A2 = P.A, ag = A2.groups.filter(function (g) { return g.total > 0; }), ug = ((A2.bs.liabilitas && A2.bs.liabilitas.groups) || []).filter(function (g) { return g.total > 0; });
    var ta = A2.bs.aset.total, tu = A2.bs.liabilitas.total, sa = ag.reduce(function (a, g) { return a + g.total; }, 0), su = ug.reduce(function (a, g) { return a + g.total; }, 0);
    return '<div class="card adc adc2"><div class="ct"><h3>' + t('v37.aset') + ' &amp; ' + t('v37.utang') + '</h3><div class="sp"></div><button class="link sm" data-act="page" data-v="portfolio">' + t('see.all') + '</button></div><div class="adw"><div class="add">' +
      '<div class="adk"><b>' + t('v37.aset') + '</b>' + donut(ag.map(function (g, i) { return {v: g.total, c: PAL[i % PAL.length]}; }), sa, t('v37.aset'), X.shortRp(ta)) + '<b class="num">' + esc(frp(ta)) + '</b></div>' +
      '<div class="adk"><b>' + t('v37.utang') + '</b>' + donut(ug.map(function (g) { return {v: g.total, c: 'var(--dcu)'}; }), su, t('v37.utang'), X.shortRp(tu)) + '<b class="num out">' + esc(frp(tu)) + '</b></div></div>' +
      '<div class="adl"><div class="adh">' + t('v37.aset') + '</div>' + (ag.length ? legend(ag, sa) : '<div class="empty">' + t('home.empty.assets') + '</div>') +
      '<div class="adsep"></div><div class="adh">' + t('v37.utang') + '</div>' + (ug.length ? legend(ug, su, true) : '<div class="muted sm">' + t('v37.noutang') + '</div>') +
      (ta > 0 ? '<div class="muted sm" style="margin-top:8px">' + esc(t('v37.ratio', pct1(tu / ta * 100))) + '</div>' : '') + '</div></div></div>';
  }

  // ---------------------------------------------------------------- Transaksi terbaru (per hari)
  function itemName(x, v) { return (x.Jenis === 'Income' || x.Jenis === 'Expense') ? (x.Barang || x.Toko || x.Catatan || v.title) : v.title; }
  function catLine(x) {
    if (x.Jenis === 'Income' || x.Jenis === 'Expense') return dn(x.Kategori) + (x.SubKategori ? ' › ' + dn(x.SubKategori) : '');
    return t('j.' + x.Jenis);
  }
  function dayTotals(days) {
    var m = {}; days.forEach(function (d) { m[d] = {i: 0, o: 0}; });
    Object.keys(S.tx).forEach(function (id) {
      var x = S.tx[id]; if (x.Status !== 'Aktif') return; var o = m[x.Waktu.substr(0, 10)]; if (!o || X.isNonOp(x.KodeAkun)) return;
      if (x.Jenis === 'Income') o.i += +x.Jumlah; else if (x.Jenis === 'Expense') o.o += +x.Jumlah; else if (x.Jenis === 'Transfer' && +x.BiayaAdmin) o.o += +x.BiayaAdmin;
    });
    return m;
  }
  function dayLabel(d, today) {
    var yd = C2.addDays(today, -1);
    return (d === today ? t('f.d.0') + ' · ' : (d === yd ? t('f.d.1') + ' · ' : '')) + dayName(d) + ', ' + dShort(d);
  }
  function recCard() {
    var rows = C.recent(S.tx, null, 16), today = C.todayLocal(), days = [], tb = '';
    rows.forEach(function (x) { var d = x.Waktu.substr(0, 10); if (days.indexOf(d) < 0) days.push(d); });
    var tot = dayTotals(days), last = '';
    tb += '<div class="card rtc2"><div class="ct"><h3>' + t('home.recent') + '</h3><div class="sp"></div><button class="link sm" data-act="tab" data-v="transaksi">' + t('see.all') + '</button></div>';
    if (!rows.length) return tb + '<div class="empty">' + t('v37.empty') + '</div></div>';
    tb += '<div class="rtr2 rth2"><span class="c-t">' + t('v371.th.time') + '</span><span>' + t('v371.th.tx') + '</span><span class="c-w">' + t('v371.th.who') + '</span><span class="r">' + t('v371.th.amt') + '</span></div>';
    rows.forEach(function (x) {
      var d = x.Waktu.substr(0, 10), v = X.txView(x);
      if (d !== last) {
        var o = tot[d]; last = d;
        tb += '<div class="rtg"><b>' + esc(dayLabel(d, today)) + '</b><span>' + (o.i ? '<i class="in">+' + esc(fnum(o.i)) + '</i>' : '') + (o.o ? '<i class="out">−' + esc(fnum(o.o)) + '</i>' : '') + '</span></div>';
      }
      tb += '<div class="rtr2 tap" data-act="tx-open" data-id="' + esc(x.ID) + '"><span class="c-t muted">' + esc(x.Waktu.substr(11, 5)) + '</span><span class="rtx"><span class="ico ' + v.cls + '">' + v.ico + '</span><span class="rti"><b>' + esc(itemName(x, v)) + '</b><small>' + esc(catLine(x)) + '</small></span></span>' +
        '<span class="c-w muted">' + esc((x.PemilikDompet || '') + (x.PemilikDompet && x.Dompet ? ' · ' : '') + (x.Dompet || '')) + '</span><b class="r ' + (v.sign > 0 ? 'in' : (v.sign < 0 ? 'out' : '')) + '">' + esc(X.signAmt(v, x.Jumlah)) + '</b></div>';
    });
    return tb + '</div>';
  }

  // ---------------------------------------------------------------- JT (transaksi rutin)
  function jtMonth(ym) {
    var out = {}, today = C.todayLocal();
    try {
      X.plan.recs().forEach(function (r) {
        if (r.aktif === false || r.susut || !r.p) return;
        if (S.owner !== 'Semua' && X.plan.ownerOf(r) !== S.owner) return;
        var d = C2.nextDue(r, C2.addDays(ym + '-01', -1)), n = 0;
        while (d && d.substr(0, 7) === ym && n++ < 40) {
          var done = !!S.tx[C2.recTxId(r.id, d)] || !!(r.terakhir && d <= r.terakhir);
          (out[d] = out[d] || []).push({r: r, d: d, name: X.plan.recName(r), v: +r.p.jumlah || 0, inc: r.p.jenis === 'Income', done: done, over: !done && d <= today});
          d = C2.nextDue(r, d);
        }
      });
    } catch (e) { out = {}; }
    return out;
  }
  function jtRow(o) {
    var mine = false; try { mine = X.plan.dueList().some(function (x) { return x.rec.id === o.r.id && x.due === o.d; }); } catch (e) {}
    var st = o.done ? '<em class="jts done">' + t('v371.jt.done') + '</em>' : (o.over ? '<em class="jts over">' + t('v371.jt.over') + '</em>' : '<em class="jts">' + t('v371.jt.plan') + '</em>');
    var act = (!o.done && o.over && mine) ? '<div class="jta"><button class="btn sm primary" data-act="rt-confirm" data-id="' + esc(o.r.id) + '" data-due="' + o.d + '">' + t('v371.jt.log') + '</button><button class="btn sm" data-act="rt-edit-due" data-id="' + esc(o.r.id) + '" data-due="' + o.d + '">' + t('v371.jt.edit') + '</button><button class="btn sm" data-act="rt-skip" data-id="' + esc(o.r.id) + '" data-due="' + o.d + '">' + t('v371.jt.skip') + '</button></div>' : '';
    return '<div class="jtr"><span class="ico">' + ICON.repeat + '</span><span class="jtn"><b>' + esc(o.name) + '</b><small>' + esc(dShort(o.d)) + '</small></span>' + st + '<b class="' + (o.inc ? 'in' : 'out') + '">' + (o.inc ? '+' : '−') + esc(fnum(o.v)) + '</b>' + act + '</div>';
  }

  // ---------------------------------------------------------------- Kalender (lebar, rincian saat diketuk)
  function calCard(P) {
    var today = C.todayLocal(), ym = S.calM || today.substr(0, 7), y = +ym.substr(0, 4), m = +ym.substr(5, 2), days = X.desk.calData(P.f, ym), jt = jtMonth(ym), dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    var off = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7, ti = 0, te = 0, d;
    Object.keys(days).forEach(function (k) { ti += days[k].i; te += days[k].e; });
    var sel = S.calSel && S.calSel.substr(0, 7) === ym ? S.calSel : (ym === today.substr(0, 7) ? today : null);
    var wk = String(t('an.days')).split(',');
    var h = '<div class="card kcc kcc2"><div class="ct"><h3>' + t('dk.cal') + '</h3><div class="sp"></div><button class="ib sm" data-act="dk-cal-m" data-v="-1" aria-label="' + esc(t('dk.cal.prev')) + '"><svg viewBox="0 0 24 24" style="transform:rotate(180deg)"><path d="M9 5l7 7-7 7"/></svg></button><b class="kcm">' + esc(C.namaBulan(m) + ' ' + y) + '</b><button class="ib sm" data-act="dk-cal-m" data-v="1" aria-label="' + esc(t('dk.cal.next')) + '">' + ICON.chev + '</button></div>' +
      '<div class="kcs"><div><span class="muted sm">' + t('dk.inc') + '</span><b class="num in">+' + esc(frp(ti)) + '</b></div><div><span class="muted sm">' + t('dk.exp') + '</span><b class="num out">−' + esc(frp(te)) + '</b></div><div><span class="muted sm">' + t('dk.cal.diff') + '</span><b class="num ' + (ti - te < 0 ? 'out' : '') + '">' + esc(frp(ti - te)) + '</b></div></div><div class="kcg">';
    for (d = 0; d < 7; d++) h += '<span class="kwd">' + esc(wk[d] || '') + '</span>';
    for (d = 0; d < off; d++) h += '<i></i>';
    for (d = 1; d <= dim; d++) {
      var ymd = ym + '-' + (d < 10 ? '0' : '') + d, v = days[ymd], fut = ymd > today, j = jt[ymd], jo = j && j.some(function (o) { return o.over && !o.done; });
      h += '<button class="kcd' + (ymd === today ? ' today' : '') + (ymd === sel ? ' sel' : '') + (fut && !j ? ' fut' : '') + (v ? '' : ' none') + '" ' + (fut && !j ? 'disabled' : 'data-act="v371-day" data-d="' + ymd + '"') + '><b>' + d + '</b>' +
        (j ? '<u class="jt' + (jo ? ' over' : '') + '" title="' + esc(t('v371.jt')) + '"></u>' : '') +
        (v && v.i > 0 ? '<span class="in"><em class="f">+' + fnum(v.i) + '</em><em class="s">+' + esc(X.shortRp(v.i)) + '</em></span>' : '') +
        (v && v.e > 0 ? '<span class="out"><em class="f">−' + fnum(v.e) + '</em><em class="s">−' + esc(X.shortRp(v.e)) + '</em></span>' : '') + '</button>';
    }
    h += '</div>';
    if (sel) {
      var dv = days[sel] || {i: 0, e: 0}, js = jt[sel] || [];
      h += '<div class="kdet"><div class="kdh"><b>' + esc(dayName(sel) + ', ' + dShort(sel)) + '</b>' + (sel <= today && (dv.i || dv.e) ? '<button class="link sm" data-act="dk-day" data-d="' + sel + '">' + t('v371.open') + '</button>' : '') + '</div>' +
        '<div class="kdt"><span>' + t('dk.inc') + ' <b class="in">' + (dv.i ? '+' + esc(frp(dv.i)) : '—') + '</b></span><span>' + t('dk.exp') + ' <b class="out">' + (dv.e ? '−' + esc(frp(dv.e)) : '—') + '</b></span></div>' +
        (js.length ? '<div class="jth">' + t('v371.jt') + '</div>' + js.map(jtRow).join('') : (dv.i || dv.e ? '' : '<div class="muted sm">' + t(sel > today ? 'v371.jt.none' : 'v371.day.none') + '</div>')) + '</div>';
    } else h += '<div class="muted sm kdet">' + t('v371.hint') + '</div>';
    var nx = null; Object.keys(jt).sort().forEach(function (k) { if (!nx && k > today) nx = jt[k][0]; });
    if (nx && ym === today.substr(0, 7)) h += '<div class="jtnx muted sm">' + ICON.repeat + '<span>' + t('v371.jt.next') + ': <b>' + esc(nx.name) + '</b> · ' + esc(dShort(nx.d)) + ' · ' + esc(frp(nx.v)) + '</span></div>';
    return h + '</div>';
  }
  A['v371-day'] = function (el) { S.calSel = el.dataset.d; X.render(); };

  // ---------------------------------------------------------------- Anggaran (ringkas + peringatan)
  function budCard(P) {
    if (!X.plan.bud || !X.v36 || !X.v36.linesOf) return X.v36 ? X.v36.budget(P) : '';
    var k = C.todayLocal().substr(0, 7), ex = C2.budgetMonth(X.v36.linesOf('Expense'), S.tx, k, S.owner);
    if (!ex.rows.length) return X.v36.budget(P);
    var B = X.plan.bud, tot = ex.total, p = tot.tersedia > 0 ? tot.terpakai / tot.tersedia : 0;
    var grp = ex.rows.filter(function (r) { return r.line.scope === 'grup'; }), base = grp.length ? grp : ex.rows;
    var use = base.slice().sort(function (a, b) { return b.terpakai - a.terpakai; }).slice(0, 4);
    function q(r) { return r.tersedia > 0 ? r.terpakai / r.tersedia : (r.terpakai > 0 ? 9.99 : 0); }
    var R = 38, L = 2 * Math.PI * R, cls = p > 1 ? 'bad' : (p >= .8 ? 'warn' : '');
    var ring = '<svg class="bring" viewBox="0 0 100 100" role="img" aria-label="' + Math.round(p * 100) + '%"><g fill="none" stroke-width="12" transform="rotate(-90 50 50)"><circle cx="50" cy="50" r="' + R + '" stroke="var(--line)"/><circle cx="50" cy="50" r="' + R + '" class="brg ' + cls + '" stroke-dasharray="' + (Math.min(1, p) * L).toFixed(1) + ' ' + L.toFixed(1) + '" stroke-linecap="round"/></g><text x="50" y="56" text-anchor="middle" class="adt2" style="font-size:20px">' + Math.round(p * 100) + '%</text></svg>';
    var bars = use.map(function (r) {
      var qq = q(r), c = qq > 1 ? 'bad' : (qq >= .8 ? 'warn' : '');
      return '<div class="bcr"><span class="bcn">' + esc(dn(B.lineName(r.line))) + '</span><div class="pbar ' + c + '"><i style="width:' + Math.min(100, Math.round(qq * 100)) + '%"></i></div><b class="bcv">' + Math.round(qq * 100) + '%</b></div>';
    }).join('');
    var shown = {}; use.forEach(function (r) { shown[r.line.scope + '|' + r.line.key + '|' + (r.line.pemilik || '')] = 1; });
    var warn = ex.rows.filter(function (r) { return q(r) >= .8 && r.line.scope !== 'grup' || (q(r) >= .8 && !shown[r.line.scope + '|' + r.line.key + '|' + (r.line.pemilik || '')]); }).sort(function (a, b) { return q(b) - q(a); }).slice(0, 4);
    var wh = warn.length ? '<div class="bwh">' + t('v371.bud.warn') + '</div>' + warn.map(function (r) {
      var qq = q(r), over = qq > 1, gname = r.line.scope !== 'grup' && B.lineGroup ? dn(B.lineGroup(r.line)) : '';
      return '<div class="bwr ' + (over ? 'bad' : 'warn') + '"><span class="bwn"><b>' + esc(dn(B.lineName(r.line))) + '</b>' + (gname ? '<small>' + esc(gname) + '</small>' : '') + '</span><em>' + t(over ? 'v371.s.over' : 'v371.s.warn') + ' ' + Math.round(qq * 100) + '%</em></div>';
    }).join('') : '<div class="bwok muted sm">' + t('v371.bud.ok') + '</div>';
    return '<div class="card bcard bud2"><div class="ct"><h3>' + t('v37.bud') + '</h3><span class="muted sm">' + esc(t('v37.bud.sub', X.shortRp(tot.terpakai), X.shortRp(tot.tersedia))) + '</span><div class="sp"></div><button class="link sm" data-act="home-plan" data-v="anggaran">' + t('see.all') + '</button></div>' +
      '<div class="budw">' + ring + '<div class="bcl">' + bars + '</div></div>' + wh + '</div>';
  }

  // ---------------------------------------------------------------- susun Beranda
  X.hooks.homeLayout = function (P) {
    LAST = P;
    function bt(c, h) { return h ? '<div class="bt ' + c + '">' + h + '</div>' : ''; }
    var n = 1 + (P.gl ? 1 : 0) + (P.ev ? 1 : 0);
    return '<div class="bwrap"><div class="bento v371 bn' + n + '">' + bt('x-ban', P.banner) + bt('x-nw', nwCard(P)) + bt('x-wf', wfCard(P)) + bt('x-ad', adCard(P)) + bt('x-fl', flowHead(P.sankey)) +
      bt('x-rec', recCard()) + bt('x-cal', calCard(P)) + bt('x-bud', budCard(P)) + bt('x-gl', P.gl) + bt('x-ev', P.ev) + '</div></div>';
  };

  function flowHead(h) {
    var n = C.todayLocal();
    return h ? h.replace(/<div class="ah">[\s\S]*?<\/div>/, '<div class="ah"><span>' + esc(t('v371.flow')) + '</span><span class="muted sm">' + esc(C.namaBulan(+n.substr(5, 2), true) + ' ' + n.substr(0, 4)) + '</span></div>') : h;
  }
  var pre0 = X.hooks.homePre;
  X.hooks.homePre = function () { if (pre0) pre0(); if (X.sankeyOpt) X.sankeyOpt = Object.assign({}, X.sankeyOpt, {fmt: X.shortRp}); };

  // ---------------------------------------------------------------- penyesuaian tinggi (desktop)
  function isDesk(g) { return g.parentNode.clientWidth >= DESK; }
  function fit() {
    var g = document.querySelector('.bento.v371'); if (!g) return;
    var dsk = isDesk(g), rc = g.querySelector('.rtc2'), cal = g.querySelector('.kcc2'), ad = g.querySelector('.adc2'), fl = g.querySelector('.x-fl'), rows, i;
    g.style.alignItems = 'start';
    if (rc) {
      rows = rc.querySelectorAll('.rtr2.tap');
      var keep = rows.length, lim = rc.clientWidth < 560 ? 6 : 8;
      if (dsk && cal) { var max = cal.offsetHeight; while (keep > 3 && rc.offsetHeight > max) { rows[--keep].remove(); } }
      else while (keep > lim) rows[--keep].remove();
      var gh = rc.querySelectorAll('.rtg');
      for (i = 0; i < gh.length; i++) { var nx = gh[i].nextElementSibling; if (!nx || nx.classList.contains('rtg')) gh[i].remove(); }
    }
    if (dsk && ad && fl && LAST && X.hooks.homeSankey) {
      var sk = fl.querySelector('.sankey'), svg = sk && sk.querySelector('svg'), old = X.sankeyOpt;
      if (svg) {
        var w = Math.round(svg.getBoundingClientRect().width), Hc = 250;
        function gen(h) { X.sankeyOpt = {W: w, Hc: h, gap: 6, fmt: X.shortRp}; try { var html = flowHead(X.hooks.homeSankey(LAST.is)); if (html) fl.innerHTML = html; } catch (e) {} }
        if (w > 200) {
          gen(Hc); var d = ad.offsetHeight - fl.offsetHeight;
          if (d > 6) gen(Hc + d);
        }
        X.sankeyOpt = old;
      }
    }
    g.style.alignItems = '';
  }
  (function () {
    var app = document.getElementById('app'), q = false, wasDesk = null, rt = null;
    if (app && window.MutationObserver) new MutationObserver(function () { if (!q) { q = true; requestAnimationFrame(function () { q = false; try { fit(); } catch (e) {} var g = document.querySelector('.bento.v371'); if (g) wasDesk = isDesk(g); }); } }).observe(app, {childList: true});
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(function () { var g = document.querySelector('.bento.v371'); if (g && wasDesk !== null && isDesk(g) !== wasDesk && S.cfg && !S.page && S.tab === 'beranda') X.render(); }, 250);
    });
  })();

  // ---------------------------------------------------------------- JT di Notifikasi
  X.hooks.extraUnread = function () { try { return X.plan.dueCount(); } catch (e) { return 0; } };
  X.hooks.notifTop = function () {
    var due = []; try { due = X.plan.dueList(); } catch (e) {}
    if (!due.length) return '';
    return '<h2>' + t('v371.jt') + '</h2>' + due.map(function (d) {
      var r = d.rec, v = +r.p.jumlah || 0;
      return '<div class="card duecard"><div class="dc1"><div class="ico">' + ICON.repeat + '</div><div class="grow"><div class="t">' + esc(X.plan.recName(r)) + ' · ' + esc(frp(v)) + '</div><div class="s">' + esc(t('rt.due', C.fmtTgl(d.due))) + (d.more ? ' · ' + esc(t('rt.more', d.more)) : '') + (r.p.dompet ? ' · ' + esc(r.p.dompet) : '') + '</div></div></div>' +
        '<div class="btnrow2"><button class="btn sm primary" data-act="rt-confirm" data-id="' + esc(r.id) + '" data-due="' + d.due + '">' + t('v371.jt.log') + '</button><button class="btn sm" data-act="rt-edit-due" data-id="' + esc(r.id) + '" data-due="' + d.due + '">' + t('v371.jt.edit') + '</button><button class="btn sm" data-act="rt-skip" data-id="' + esc(r.id) + '" data-due="' + d.due + '">' + t('v371.jt.skip') + '</button></div></div>';
    }).join('');
  };

  X.v371 = {nwCard: nwCard, wfCard: wfCard, adCard: adCard, recCard: recCard, calCard: calCard, budCard: budCard, fit: fit, jtMonth: jtMonth};
})();
