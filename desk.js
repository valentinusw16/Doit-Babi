if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['desk'] = '3.3.0';
/* Do it v3.1 - tampilan responsif: sidebar, Beranda bento (waterfall, kalender, proyeksi), tabel Transaksi desktop,
   gaya Kaca/Bersih (tersinkron lewat Rencana tipe "tampilan"), foto latar per perangkat. */
(function () {
  'use strict';
  var X = window.DoIt;
  // Bila app.js yang termuat versi lama (cache belum sinkron), modul ini dilewati supaya aplikasi tetap jalan.
  if (!X || !X.S || !X.rc || !X.savePref || !X.getLines || !(function (v) { v = String(v || '0').split('.').map(Number); return v[0] >= 3; })(X.VERSION)) return;
  var S = X.S, C = X.C, t = X.t, esc = X.esc, $ = X.$, ICON = X.ICON, A = X.A, I = window.I18N;

  // ---------------------------------------------------------------- teks
  if (I && I.add) {
    I.add('id', {
      'dk.g.fin': 'Keuangan', 'dk.g.plan': 'Perencanaan', 'dk.g.data': 'Data', 'dk.g.sys': 'Sistem', 'dk.add': 'Catat', 'dk.collapse': 'Ciutkan menu', 'dk.expand': 'Lebarkan menu', 'dk.search': 'Cari transaksi',
      'dk.month': 'Bulan ini', 'dk.inc': 'Pendapatan', 'dk.exp': 'Pengeluaran', 'dk.left': 'Sisa bulan ini', 'dk.vs': '{0} dari bulan lalu', 'dk.ofinc': '{0}% dari pendapatan', 'dk.mix.exp': 'Pengeluaran {0}%', 'dk.mix.left': 'Sisa {0}%',
      'dk.aset': 'Aset dan utang', 'dk.aset.total': 'Total aset',
      'dk.since': 'sejak 1 Jan {0}', 'dk.proj': 'Proyeksi 31 Des {0}', 'dk.proj.add': 'Perkiraan tambahan', 'dk.proj.range': 'Rentang', 'dk.proj.basis': 'Dari rata-rata perubahan {0} bulan terakhir.', 'dk.proj.none': 'Proyeksi muncul setelah ada 2 bulan penuh.',
      'dk.now': 'Sekarang', 'dk.dec': 'Des (proyeksi)', 'dk.jan': 'Jan',
      'dk.wf.t': 'Perubahan kekayaan bersih {0}', 'dk.wf.month': 'Per bulan', 'dk.wf.comp': 'Per komponen', 'dk.wf.start': 'Awal', 'dk.wf.start.s': 'Awal', 'dk.wf.end': 'Sekarang', 'dk.wf.end.past': 'Akhir', 'dk.wf.end.s': 'Kini', 'dk.wf.unit': 'juta rupiah', 'dk.wf.hint': 'Arahkan atau ketuk batang untuk angka lengkap.',
      'dk.c.inc': 'Pendapatan', 'dk.c.exp': 'Pengeluaran', 'dk.c.mkt': 'Nilai pasar aset', 'dk.c.oth': 'Lainnya', 'dk.wf.nw': 'Kekayaan bersih', 'dk.wf.chg': 'Perubahan', 'dk.wf.empty': 'Belum ada data untuk tahun ini.',
      'dk.cal': 'Kalender', 'dk.cal.diff': 'Selisih', 'dk.cal.prev': 'Bulan sebelumnya', 'dk.cal.next': 'Bulan berikutnya',
      'dk.th.date': 'Tanggal', 'dk.th.tx': 'Transaksi', 'dk.th.cat': 'Kategori', 'dk.th.wal': 'Dompet', 'dk.th.own': 'Pemilik', 'dk.th.amt': 'Jumlah',
      'dk.set.t': 'Gaya tampilan', 'dk.gaya.kaca': 'Kaca', 'dk.gaya.bersih': 'Bersih', 'dk.gaya.s': 'Kaca: kartu tembus pandang dengan latar warna. Bersih: kartu polos. Berlaku di semua perangkatmu.', 'dk.gaya.srv': 'Server belum diperbarui ke v3.0, jadi gaya hanya tersimpan di perangkat ini.',
      'dk.bg.t': 'Foto latar', 'dk.bg.s': 'Tampil di gaya Kaca. Hanya tersimpan di perangkat ini.', 'dk.bg.pick': 'Pilih foto', 'dk.bg.change': 'Ganti foto', 'dk.bg.del': 'Hapus foto', 'dk.bg.dim': 'Gelapkan latar', 'dk.dim.0': 'Ringan', 'dk.dim.1': 'Sedang', 'dk.dim.2': 'Gelap',
      'dk.bg.saved': 'Foto latar disimpan', 'dk.bg.deleted': 'Foto latar dihapus', 'dk.bg.fail': 'Foto gagal diproses. Coba foto lain.',
      'dk.fab': 'Catat', 'dk.fab.x': 'Tutup', 'dk.day.in': 'Masuk', 'dk.day.out': 'Keluar', 'dk.day.n': '{0} transaksi',
      'dk.sb.t': 'Menu samping', 'dk.sb.auto': 'Otomatis', 'dk.sb.open': 'Terbuka', 'dk.sb.rail': 'Ringkas', 'dk.sb.s': 'Hanya tampil di layar lebar (tablet dan laptop).'
    });
    I.add('en', {
      'dk.g.fin': 'Finance', 'dk.g.plan': 'Planning', 'dk.g.data': 'Data', 'dk.g.sys': 'System', 'dk.add': 'Add', 'dk.collapse': 'Collapse menu', 'dk.expand': 'Expand menu', 'dk.search': 'Search transactions',
      'dk.month': 'This month', 'dk.inc': 'Income', 'dk.exp': 'Expenses', 'dk.left': 'Left this month', 'dk.vs': '{0} vs last month', 'dk.ofinc': '{0}% of income', 'dk.mix.exp': 'Expenses {0}%', 'dk.mix.left': 'Left {0}%',
      'dk.aset': 'Assets and debts', 'dk.aset.total': 'Total assets',
      'dk.since': 'since Jan 1 {0}', 'dk.proj': 'Projection Dec 31 {0}', 'dk.proj.add': 'Expected gain', 'dk.proj.range': 'Range', 'dk.proj.basis': 'From the average change over the last {0} months.', 'dk.proj.none': 'The projection appears after 2 full months.',
      'dk.now': 'Now', 'dk.dec': 'Dec (projected)', 'dk.jan': 'Jan',
      'dk.wf.t': 'Net worth change {0}', 'dk.wf.month': 'By month', 'dk.wf.comp': 'By component', 'dk.wf.start': 'Start', 'dk.wf.start.s': 'Start', 'dk.wf.end': 'Now', 'dk.wf.end.past': 'End', 'dk.wf.end.s': 'Now', 'dk.wf.unit': 'million rupiah', 'dk.wf.hint': 'Hover or tap a bar for exact numbers.',
      'dk.c.inc': 'Income', 'dk.c.exp': 'Expenses', 'dk.c.mkt': 'Market value', 'dk.c.oth': 'Other', 'dk.wf.nw': 'Net worth', 'dk.wf.chg': 'Change', 'dk.wf.empty': 'No data for this year yet.',
      'dk.cal': 'Calendar', 'dk.cal.diff': 'Difference', 'dk.cal.prev': 'Previous month', 'dk.cal.next': 'Next month',
      'dk.th.date': 'Date', 'dk.th.tx': 'Transaction', 'dk.th.cat': 'Category', 'dk.th.wal': 'Wallet', 'dk.th.own': 'Owner', 'dk.th.amt': 'Amount',
      'dk.set.t': 'Display style', 'dk.gaya.kaca': 'Glass', 'dk.gaya.bersih': 'Clean', 'dk.gaya.s': 'Glass: translucent cards over a colored backdrop. Clean: plain cards. Applies on all your devices.', 'dk.gaya.srv': 'The server is not updated to v3.0 yet, so the style is only saved on this device.',
      'dk.bg.t': 'Background photo', 'dk.bg.s': 'Shown in the Glass style. Saved on this device only.', 'dk.bg.pick': 'Choose photo', 'dk.bg.change': 'Change photo', 'dk.bg.del': 'Remove photo', 'dk.bg.dim': 'Darken backdrop', 'dk.dim.0': 'Light', 'dk.dim.1': 'Medium', 'dk.dim.2': 'Dark',
      'dk.bg.saved': 'Background saved', 'dk.bg.deleted': 'Background removed', 'dk.bg.fail': 'The photo could not be processed. Try another one.',
      'dk.fab': 'Add', 'dk.fab.x': 'Close', 'dk.day.in': 'In', 'dk.day.out': 'Out', 'dk.day.n': '{0} transactions',
      'dk.sb.t': 'Side menu', 'dk.sb.auto': 'Automatic', 'dk.sb.open': 'Open', 'dk.sb.rail': 'Compact', 'dk.sb.s': 'Only shown on wide screens (tablet and laptop).'
    });
  }

  // ---------------------------------------------------------------- ukuran layar
  function bucket() { var w = window.innerWidth; return w >= 1100 ? 'd' : (w >= 820 ? 't' : 'm'); }
  function wide() { return window.innerWidth >= 1100; }
  X.wide = wide;
  function sbState() {
    var w = window.innerWidth, p = S.pref.sb || 'auto';
    if (w < 820) return 'none';
    if (p === 'open') return 'open';
    if (p === 'rail') return 'rail';
    return w >= 1100 ? 'open' : 'rail';
  }
  function setSbs() { document.documentElement.setAttribute('data-sbs', sbState()); }
  var lastKey = bucket() + sbState(), rT = null;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () {
      setSbs(); var k = bucket() + sbState();
      if (k !== lastKey) { lastKey = k; if (S.cfg && S.master && !document.querySelector('#overlay2 .sheet')) X.render(); }
    }, 150);
  });
  setSbs();

  // ---------------------------------------------------------------- utilitas angka
  function fnum(n) { return C.fmtNum(Math.round(n)); }
  function frp(n) { return (n < 0 ? '−' : '') + 'Rp ' + C.fmtNum(Math.round(Math.abs(n))); }
  function sgn(n) { return n > 0 ? '+' : (n < 0 ? '−' : ''); }
  function jt1(n) { var a = Math.abs(n) / 1e6; return (n < 0 ? '−' : '') + (a >= 100 ? Math.round(a) : a.toFixed(1)).toString().replace('.', S.pref.lang === 'en' ? '.' : ','); }
  function ownerOf(f) { return f && f.pemilik && f.pemilik !== 'Semua' ? f.pemilik : null; }

  // ---------------------------------------------------------------- data kekayaan bersih (per bulan dan komponen)
  var NWC = {};
  function nwData(f, year) {
    var lines = X.getLines(), owner = ownerOf(f), today = C.todayLocal(), k = year + '|' + (owner || '') + '|' + today;
    if (NWC.lines === lines && NWC.k === k) return NWC.v;
    var M = S.M, cy = +today.substr(0, 4), y0 = year + '-01-01', y1 = year === cy ? today : year + '-12-31';
    var nm = year === cy ? +today.substr(5, 2) : 12, months = [], m, start = 0;
    for (m = 1; m <= nm; m++) months.push({m: m, inc: 0, exp: 0, non: 0, d: 0});
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      if (l.tanggal > y1 || (owner && l.pemilik !== owner)) continue;
      var a = M.akun[l.kode]; if (!a) continue;
      var net = l.debit - l.kredit, bal = a.Tipe === 'Aset' || a.Tipe === 'Liabilitas';
      if (l.tanggal < y0) { if (bal) start += net; continue; }
      var mo = months[+l.tanggal.substr(5, 2) - 1]; if (!mo) continue;
      if (bal) mo.d += net;
      else if (a.Tipe === 'Pendapatan') { if (a.Kelompok === X.NONOP_G) mo.non -= net; else mo.inc -= net; }
      else if (a.Tipe === 'Beban') { if (a.Kelompok === X.NONOP_G) mo.non -= net; else mo.exp += net; }
    }
    var run = start, tot = {inc: 0, exp: 0, non: 0, oth: 0};
    months.forEach(function (mo2) {
      mo2.oth = mo2.d - (mo2.inc - mo2.exp + mo2.non);
      run += mo2.d; mo2.end = run;
      tot.inc += mo2.inc; tot.exp += mo2.exp; tot.non += mo2.non; tot.oth += mo2.oth;
    });
    var v = {year: year, start: start, months: months, end: run, tot: tot, has: lines.length > 0};
    NWC = {lines: lines, k: k, v: v};
    return v;
  }
  function firstYear() {
    var y = +C.todayLocal().substr(0, 4), min = y;
    Object.keys(S.tx).forEach(function (id) { var yy = +String(S.tx[id].Waktu).substr(0, 4); if (yy > 1990 && yy < min) min = yy; });
    return min;
  }
  function projection(f) {
    var today = C.todayLocal(), y = +today.substr(0, 4), mo = +today.substr(5, 2), d = nwData(f, y), done = d.months.slice(0, mo - 1);
    if (done.length < 2) return null;
    var last = done.slice(-3).map(function (m) { return m.d; }), avg = last.reduce(function (a, b) { return a + b; }, 0) / last.length;
    var dim = new Date(Date.UTC(y, mo, 0)).getUTCDate(), dn = +today.substr(8, 2), remain = (12 - mo) + (dim - dn) / dim, now = d.end;
    return {now: now, dec: now + avg * remain, lo: now + Math.min.apply(null, last) * remain, hi: now + Math.max.apply(null, last) * remain, add: avg * remain, n: last.length, year: y};
  }

  // ---------------------------------------------------------------- sidebar
  var MAPP = {income: 'flow', expense: 'flow', receivable: 'debts', payable: 'debts', asset: 'portfolio', assets: 'portfolio'};
  var NAV = [
    [null, [['beranda', 'home', 'nav.home', 'tab'], ['transaksi', 'list', 'nav.tx', 'tab'], ['laporan', 'chart', 'nav.report', 'tab']]],
    ['dk.g.fin', [['flow', 'inArr', 'pg.flow', 'page'], ['portfolio', 'pie', 'pg.portfolio', 'page'], ['debts', 'loan', 'pg.debts', 'page']]],
    ['dk.g.plan', [['event', 'tag', 'pg.event', 'page'], ['anggaran', 'plan', 'pg.anggaran', 'page'], ['tujuan', 'target', 'pg.tujuan', 'page']]],
    ['dk.g.data', [['categories', 'tag', 'pg.categories', 'page'], ['parties', 'people', 'pg.parties', 'page'], ['opening', 'flag', 'pg.opening', 'saldo-awal']]],
    ['dk.g.sys', [['notif', 'bell', 'pg.notif', 'page'], ['settings', 'gear', 'pg.settings', 'page']]]
  ];
  X.hooks.sidebar = function () {
    pullGaya(); setSbs();
    var cur = S.page ? (MAPP[S.page.name] || S.page.name) : S.tab, unread = X.unreadCount ? X.unreadCount() : 0, open = sbState() === 'open';
    var h = '<aside class="side" aria-label="Menu"><div class="sb-brand">' + (X.hooks.avatarMe ? X.hooks.avatarMe() : '<span class="logo">D</span>') + '<div class="who lbl"><b>Do it</b><small>' + esc(S.owner && S.owner !== 'Semua' ? S.owner : (S.cfg ? S.cfg.user : '')) + '</small></div></div><nav class="sb-nav">';
    NAV.forEach(function (g) {
      if (g[0]) h += '<div class="sb-grp"><span class="lbl">' + t(g[0]) + '</span></div>';
      g[1].forEach(function (n) {
        var on = n[3] === 'tab' ? (!S.page && S.tab === n[0]) : cur === n[0];
        h += '<button class="nv' + (on ? ' on' : '') + '" data-act="' + n[3] + '" data-v="' + n[0] + '" title="' + esc(t(n[2])) + '"><span class="ni">' + (ICON[n[1]] || ICON.grid) + '</span><span class="lbl">' + esc(t(n[2])) + '</span>' +
          (n[0] === 'notif' && unread ? '<b class="bdg">' + (unread > 9 ? '9+' : unread) + '</b>' : '') + '</button>';
      });
    });
    h += '</nav><div class="sb-foot"><small class="lbl muted">v' + esc(X.VERSION) + '</small>' +
      '<button class="sb-tg" data-act="sb-toggle" title="' + esc(t(open ? 'dk.collapse' : 'dk.expand')) + '" aria-label="' + esc(t(open ? 'dk.collapse' : 'dk.expand')) + '">' + ICON.chev + '</button></div></aside>' + fabHTML();
    return h;
  };
  function fabHTML() {
    var on = !!$('#overlay .sheet');
    return '<button class="catfab' + (on ? ' x' : '') + '" data-act="catat-toggle" aria-label="' + esc(t('dk.fab')) + '"><span class="c"><i>' + ICON.plus + '</i><b>' + t('dk.fab') + '</b></span><span class="o"><i>' + ICON.x + '</i><b>' + t('dk.fab.x') + '</b></span><kbd>N</kbd></button>';
  }
  X.hooks.tabTitle = function (tab) {
    if (sbState() === 'none') return '';
    return t({beranda: 'nav.home', transaksi: 'nav.tx', laporan: 'nav.report'}[tab] || 'nav.home');
  };
  X.hooks.topExtra = function () {
    return '<button class="hb palbtn" data-act="pal-open" aria-label="' + esc(t('dk.search')) + '" title="' + esc(t('dk.search')) + '"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg></button><input class="gsearch" id="gq" type="search" placeholder="' + esc(t('dk.search')) + ' (Ctrl K)" value="" autocomplete="off" aria-label="' + esc(t('dk.search')) + '">';
  };

  // ---------------------------------------------------------------- Beranda: kartu-kartu
  X.hooks.homePre = function () {
    X.sankeyOpt = wide() ? {W: 520, Hc: 290, gap: 6, fmt: function (n) { return fnum(n); }} : null;
  };
  var CPAL = ['var(--accent)', 'var(--in)', '#d6a24c', '#7e8fd6', '#5db8a8', '#b561a8'];

  function projChart(pj, d) {
    var W = 340, H = 150, pts = d.months.map(function (m) { return m.end; });
    pts.unshift(d.start);
    var lo = Math.min.apply(null, pts.concat([pj.lo])), hi = Math.max.apply(null, pts.concat([pj.hi])), span = (hi - lo) || 1, xa = W * 0.74, n = pts.length - 1 || 1;
    function Y(v) { return 8 + (hi - v) / span * (H - 18); }
    function Xp(i) { return 4 + i * (xa - 4) / n; }
    var line = pts.map(function (v, i) { return Xp(i).toFixed(1) + ',' + Y(v).toFixed(1); }).join(' '), xe = W - 6, x0 = Xp(pts.length - 1), y0 = Y(pj.now);
    var area = 'M' + Xp(0).toFixed(1) + ' ' + H + ' L' + pts.map(function (v, i) { return Xp(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' L') + ' L' + x0.toFixed(1) + ' ' + H + ' Z';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(t('dk.proj', pj.year)) + '"><path d="' + area + '" fill="var(--accent)" opacity=".12" stroke="none"/>' +
      '<path d="M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' L' + xe + ' ' + Y(pj.hi).toFixed(1) + ' L' + xe + ' ' + Y(pj.lo).toFixed(1) + ' Z" fill="var(--accent)" opacity=".16" stroke="none"/>' +
      '<polyline points="' + line + '" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<line x1="' + x0.toFixed(1) + '" y1="' + y0.toFixed(1) + '" x2="' + xe + '" y2="' + Y(pj.dec).toFixed(1) + '" stroke="var(--accent)" stroke-width="2.6" stroke-dasharray="6 5" stroke-linecap="round"/>' +
      '<circle cx="' + x0.toFixed(1) + '" cy="' + y0.toFixed(1) + '" r="4.5" fill="var(--accent)"/><circle cx="' + xe + '" cy="' + Y(pj.dec).toFixed(1) + '" r="5" fill="var(--card)" stroke="var(--accent)" stroke-width="2.5"/></svg>';
  }
  X.hooks.heroExtra = function (f) {
    var y = +C.todayLocal().substr(0, 4), d = nwData(f, y);
    if (!d.has) return '';
    var now = d.end, chg = now - d.start, pct = d.start ? chg / Math.abs(d.start) * 100 : null;
    var h = '<div class="ytd"><span class="dtag ' + (chg >= 0 ? 'up' : 'dn') + '">' + (chg >= 0 ? ICON.up : ICON.down) + sgn(chg || 1) + frp(Math.abs(chg)) + '</span><span class="muted sm">' + esc(t('dk.since', y)) + (pct == null ? '' : ' · ' + sgn(pct) + Math.abs(pct).toFixed(1).replace('.', S.pref.lang === 'en' ? '.' : ',') + '%') + '</span></div>';
    if (wide()) {
      var pj = projection(f);
      h += '<div class="pj">' + (pj ?
        projChart(pj, d) + '<div class="pjx muted sm"><span>' + t('dk.jan') + '</span><span>' + t('dk.now') + '</span><span>' + t('dk.dec') + '</span></div>' +
        '<div class="pjr"><div class="pjh"><span class="muted sm">' + esc(t('dk.proj', pj.year)) + '</span><b class="num">' + esc(frp(pj.dec)) + '</b></div>' +
        '<div class="pjl sm"><span class="muted">' + t('dk.proj.add') + '</span><b class="num ' + (pj.add >= 0 ? 'in' : 'out') + '">' + sgn(pj.add) + esc(frp(Math.abs(pj.add))) + '</b></div>' +
        '<div class="pjl sm"><span class="muted">' + t('dk.proj.range') + '</span><span class="num">' + fnum(pj.lo) + ' – ' + fnum(pj.hi) + '</span></div>' +
        '<div class="muted sm">' + esc(t('dk.proj.basis', pj.n)) + '</div></div>'
        : '<div class="muted sm" style="margin-top:12px">' + t('dk.proj.none') + '</div>') + '</div>';
    }
    return h;
  };

  function monthCard(P) {
    var r = X.rangeOf('bulan'), pr = X.prevOf('bulan'), f = P.f, is = P.is, inc = is.pendapatan.total, exp = is.beban.total, left = inc - exp, pis = null;
    if (pr) {
      var day = +r.end.substr(8, 2), pend = pr.end < C2add(pr.start, day - 1) ? pr.end : C2add(pr.start, day - 1);
      pis = C.incomeStatement(X.getOpLines(), S.M, pr.start, pend, f);
    }
    function tag(cur, prev, upGood) {
      if (!pis || !prev) return '';
      var p = (cur - prev) / Math.abs(prev) * 100, good = upGood ? p >= 0 : p <= 0;
      return '<span class="dtag ' + (good ? 'up' : 'dn') + '">' + (p >= 0 ? ICON.up : ICON.down) + t('dk.vs', Math.abs(Math.round(p)) + '%') + '</span>';
    }
    function row(lbl, v, cls, tg) { return '<div class="mr"><div><div class="muted sm">' + esc(lbl) + '</div><div class="num mv ' + cls + '">' + esc(frp(v)) + '</div></div>' + tg + '</div>'; }
    var pe = inc > 0 ? Math.round(exp / inc * 100) : 0, pl = inc > 0 ? Math.max(0, 100 - pe) : 0;
    return '<div class="card mcard"><div class="ct"><h3>' + t('dk.month') + '</h3><span class="muted sm">' + esc(C.namaBulan(+r.start.substr(5, 2)) + ' ' + r.start.substr(0, 4)) + '</span></div>' +
      '<button class="tap mrb" data-act="page" data-v="income">' + row(t('dk.inc'), inc, 'in', tag(inc, pis && pis.pendapatan.total, true)) + '</button>' +
      '<button class="tap mrb" data-act="page" data-v="expense">' + row(t('dk.exp'), exp, 'out', tag(exp, pis && pis.beban.total, false)) + '</button>' +
      row(t('dk.left'), left, left < 0 ? 'out' : '', inc > 0 ? '<span class="dtag ' + (left >= 0 ? 'up' : 'dn') + '">' + t('dk.ofinc', Math.round(left / inc * 100)) + '</span>' : '') +
      '<div class="mix"><div class="mixb"><i class="e" style="width:' + Math.min(100, pe) + '%"></i><i class="l" style="width:' + pl + '%"></i></div><div class="mixl muted sm"><span>' + t('dk.mix.exp', pe) + '</span><span>' + t('dk.mix.left', pl) + '</span></div></div></div>';
  }
  function C2add(ymd, n) { return X.C2.addDays(ymd, n); }

  function asetCard(P) {
    var A2 = P.A, tot = A2.bs.aset.total, gs = A2.groups, sumg = gs.reduce(function (a, g) { return a + Math.max(0, g.total); }, 0) || 1;
    var h = '<div class="card acard"><div class="ct"><h3>' + t('dk.aset') + '</h3><button class="link sm" data-act="page" data-v="portfolio">' + t('see.all') + '</button></div>' +
      '<div class="muted sm">' + t('dk.aset.total') + '</div><div class="num amain">' + esc(frp(tot)) + '</div>';
    if (gs.length) h += '<div class="dist">' + gs.map(function (g, i) { return '<i style="width:' + Math.max(1.5, Math.max(0, g.total) / sumg * 100).toFixed(1) + '%; background:' + CPAL[i % CPAL.length] + '"></i>'; }).join('') + '</div>';
    h += gs.length ? gs.map(function (g, i) {
      var pg = /piutang/i.test(g.nama);
      return '<div class="row tap" ' + (pg ? 'data-act="page" data-v="receivable"' : 'data-act="page" data-v="portfolio" data-g="' + esc(g.nama) + '"') + '><div class="ico" style="color:' + CPAL[i % CPAL.length] + '">' + X.catIcon(g.nama) + '</div><div class="grow"><div class="t">' + esc(X.dn(g.nama)) + '</div><div class="s">' + esc(t('home.grp.n', g.rows.length)) + '</div></div><div class="a">' + esc(frp(g.total)) + '</div></div>';
    }).join('') : '<div class="empty">' + t('home.empty.assets') + '</div>';
    return h + P.tiles + '</div>';
  }

  // ---- waterfall
  var WF = {tips: [], animFor: ''};
  function wfBars(d, mode) {
    var bars = [], lv = d.start, past = d.year < +C.todayLocal().substr(0, 4);
    bars.push({l: t(wide() ? 'dk.wf.start' : 'dk.wf.start.s'), tot: true, from: 0, to: d.start, level: d.start, tip: {title: t('dk.wf.start') + ' ' + d.year, amt: d.start, nw: d.start, rows: []}});
    if (mode === 'komponen') {
      [['inc', 'dk.c.inc', d.tot.inc], ['exp', 'dk.c.exp', -d.tot.exp], ['mkt', 'dk.c.mkt', d.tot.non], ['oth', 'dk.c.oth', d.tot.oth]].forEach(function (c) {
        if (c[0] === 'oth' && Math.abs(c[2]) < 1) return;
        bars.push({l: t(c[1]), from: lv, to: lv + c[2], level: lv + c[2], delta: c[2], tip: {title: t(c[1]) + ' ' + d.year, amt: c[2], nw: lv + c[2], rows: []}});
        lv += c[2];
      });
    } else {
      d.months.forEach(function (m) {
        bars.push({l: C.namaBulan(m.m, true), from: lv, to: m.end, level: m.end, delta: m.d, tip: {title: C.namaBulan(m.m) + ' ' + d.year, amt: m.d, nw: m.end, rows: [[t('dk.c.inc'), m.inc], [t('dk.c.exp'), -m.exp], [t('dk.c.mkt'), m.non]].concat(Math.abs(m.oth) >= 1 ? [[t('dk.c.oth'), m.oth]] : [])}});
        lv = m.end;
      });
    }
    bars.push({l: t(past ? 'dk.wf.end.past' : (wide() ? 'dk.wf.end' : 'dk.wf.end.s')), tot: true, from: 0, to: d.end, level: d.end, tip: {title: t(past ? 'dk.wf.end.past' : 'dk.wf.end') + ' ' + d.year, amt: d.end, nw: d.end, rows: []}, last: true});
    return bars;
  }
  function wfSvg(bars, W, H, big) {
    var padL = big ? 44 : 34, padR = 6, padT = big ? 22 : 14, padB = 22, iw = W - padL - padR, ih = H - padT - padB, n = bars.length;
    var lo = Infinity, hi = -Infinity;
    bars.forEach(function (b) { lo = Math.min(lo, b.from || b.to, b.to); hi = Math.max(hi, b.from, b.to); if (b.tot) lo = Math.min(lo, b.to); });
    if (!isFinite(lo)) { lo = 0; hi = 1; }
    var rng = (hi - lo) || Math.max(Math.abs(hi), 1e6) * .1, y0 = lo - rng * .22, y1 = hi + rng * .18, step = niceStep((y1 - y0) / 4);
    y0 = Math.floor(y0 / step) * step; y1 = Math.ceil(y1 / step) * step;
    function Y(v) { return padT + (y1 - v) / (y1 - y0) * ih; }
    var bw = iw / n, w = Math.min(46, bw * .62), svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="wfs" role="img" aria-label="' + esc(t('dk.wf.t', '')) + '">';
    for (var g = Math.ceil(y0 / step) * step; g <= y1 + 1; g += step) svg += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + Y(g).toFixed(1) + '" y2="' + Y(g).toFixed(1) + '" class="gl"/><text x="' + (padL - 6) + '" y="' + (Y(g) + 3.5).toFixed(1) + '" text-anchor="end" class="ax">' + esc(jt0(g)) + '</text>';
    bars.forEach(function (b, i) {
      var cx = padL + bw * i + bw / 2, top = Y(Math.max(b.from, b.to)), bot = Y(Math.min(b.from, b.to));
      if (b.tot) { top = Y(b.to); bot = Y(y0); }
      var h = Math.max(2, bot - top), cls = b.tot ? 'tot' : (b.delta >= 0 ? 'up' : 'dn');
      if (i > 0) { var pv = bars[i - 1], ly = Y(pv.level); svg += '<line x1="' + (cx - bw - -w / 2 - 0).toFixed(1) + '" x2="' + (cx - w / 2).toFixed(1) + '" y1="' + ly.toFixed(1) + '" y2="' + ly.toFixed(1) + '" class="cn"/>'; }
      svg += '<g class="wfb' + (WF.sel === i ? ' sel' : '') + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(b.tip.title + ' ' + frp(b.tip.amt)) + '"><rect x="' + (cx - bw / 2).toFixed(1) + '" y="0" width="' + bw.toFixed(1) + '" height="' + H + '" fill="transparent"/>' +
        '<rect class="wbar ' + cls + '" x="' + (cx - w / 2).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="4" style="--i:' + i + '"/>';
      if (big) { var v = b.tot ? b.to : b.delta; svg += '<text x="' + cx.toFixed(1) + '" y="' + (top - 5).toFixed(1) + '" text-anchor="middle" class="vl ' + cls + '">' + (b.tot ? '' : sgn(v)) + esc(jt1(Math.abs(v))) + '</text>'; }
      svg += '<text x="' + cx.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" class="ax">' + esc(b.l) + '</text></g>';
    });
    return svg + '</svg>';
  }
  function niceStep(raw) { var p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), m = raw / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
  function jt0(v) { return String(Math.round(v / 1e6)).replace('-', '−'); }
  function wfTip(i) {
    var b = WF.bars && WF.bars[i]; if (!b) return '';
    var tp = b.tip, h = '<div class="wth"><b>' + esc(tp.title) + '</b>' + (b.tot ? '' : '<span class="dtag ' + (tp.amt >= 0 ? 'up' : 'dn') + '">' + sgn(tp.amt || 1) + esc(frp(Math.abs(tp.amt))) + '</span>') + '</div><div class="wtr">';
    if (b.tot) h += '<span class="muted">' + t('dk.wf.nw') + '</span><b class="num">' + esc(frp(tp.amt)) + '</b>';
    else {
      tp.rows.forEach(function (r) { h += '<span class="muted">' + esc(r[0]) + '</span><b class="num ' + (r[1] > 0 ? 'in' : (r[1] < 0 ? 'out' : '')) + '">' + sgn(r[1]) + esc(frp(Math.abs(r[1]))) + '</b>'; });
      h += '<span class="muted wsum">' + t('dk.wf.nw') + '</span><b class="num wsum">' + esc(frp(tp.nw)) + '</b>';
    }
    return h + '</div>';
  }
  function wfCard(P) {
    var cy = +C.todayLocal().substr(0, 4), year = S.wfYear || cy, mode = S.wfMode || 'bulan', d = nwData(P.f, year), big = wide(), yrs = '', y;
    for (y = cy; y >= Math.min(firstYear(), cy); y--) yrs += '<option value="' + y + '"' + (y === year ? ' selected' : '') + '>' + y + '</option>';
    var sel = '<select id="wf-mode" class="sel" aria-label="' + esc(t('dk.wf.month')) + '"><option value="bulan"' + (mode === 'bulan' ? ' selected' : '') + '>' + t('dk.wf.month') + '</option><option value="komponen"' + (mode === 'komponen' ? ' selected' : '') + '>' + t('dk.wf.comp') + '</option></select>' +
      '<select id="wf-year" class="sel" aria-label="' + esc(t('dk.set.t')) + '">' + yrs + '</select>';
    var cdl = S.wfStyle === 'candle' && X.v36;
    if (cdl) sel = '<select id="wf-year" class="sel" aria-label="' + esc(t('dk.set.t')) + '">' + yrs + '</select>';
    if (X.v36) sel = X.v36.styleSelect() + sel;
    var h = '<div class="card wfc"><div class="ct"><h3>' + esc(t('dk.wf.t', year)) + '</h3><div class="sp"></div>' + sel + '</div>';
    if (!d.has || !d.months.length) return h + '<div class="empty">' + t('dk.wf.empty') + '</div></div>';
    if (cdl) return h + X.v36.candle(d, P.f) + '</div>';
    var bars = wfBars(d, mode), key = mode + year + (S._wfN || 0), anim = WF.animFor !== key;
    WF.bars = bars; WF.animFor = key;
    if (WF.sel == null || WF.sel >= bars.length || WF.selKey !== mode + year) { WF.sel = Math.max(0, bars.length - (mode === 'bulan' ? 2 : 2)); WF.selKey = mode + year; }
    h += '<div class="wfw' + (anim ? ' anim' : '') + '">' + wfSvg(bars, big ? 760 : 342, big ? 300 : 230, big) + '</div><div class="muted sm wfu">' + t('dk.wf.unit') + ' · ' + t('dk.wf.hint') + '</div><div id="wf-tip" class="wtip">' + wfTip(WF.sel) + '</div></div>';
    return h;
  }

  // ---- kalender
  var CAL = {};
  function calData(f, ym) {
    var lines = X.getOpLines(), owner = ownerOf(f), k = ym + '|' + (owner || '');
    if (CAL.lines === lines && CAL.k === k) return CAL.v;
    var M = S.M, days = {};
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i]; if (l.tanggal.substr(0, 7) !== ym || (owner && l.pemilik !== owner)) continue;
      var a = M.akun[l.kode]; if (!a) continue;
      var dd = days[l.tanggal] || (days[l.tanggal] = {i: 0, e: 0});
      if (a.Tipe === 'Pendapatan') dd.i += l.kredit - l.debit; else if (a.Tipe === 'Beban') dd.e += l.debit - l.kredit;
    }
    CAL = {lines: lines, k: k, v: days};
    return days;
  }
  function calCard(P) {
    var today = C.todayLocal(), ym = S.calM || today.substr(0, 7), y = +ym.substr(0, 4), m = +ym.substr(5, 2), days = calData(P.f, ym), dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    var off = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7, ti = 0, te = 0, d;
    Object.keys(days).forEach(function (k) { ti += days[k].i; te += days[k].e; });
    var wk = String(t('an.days')).split(',');
    var h = '<div class="card kcc"><div class="ct"><h3>' + t('dk.cal') + '</h3><div class="sp"></div><button class="ib sm" data-act="dk-cal-m" data-v="-1" aria-label="' + esc(t('dk.cal.prev')) + '">' + '<svg viewBox="0 0 24 24" style="transform:rotate(180deg)"><path d="M9 5l7 7-7 7"/></svg>' + '</button><b class="kcm">' + esc(C.namaBulan(m) + ' ' + y) + '</b><button class="ib sm" data-act="dk-cal-m" data-v="1" aria-label="' + esc(t('dk.cal.next')) + '">' + ICON.chev + '</button></div>' +
      '<div class="kcs"><div><span class="muted sm">' + t('dk.inc') + '</span><b class="num in">+' + esc(frp(ti)) + '</b></div><div><span class="muted sm">' + t('dk.exp') + '</span><b class="num out">−' + esc(frp(te)) + '</b></div><div><span class="muted sm">' + t('dk.cal.diff') + '</span><b class="num ' + (ti - te < 0 ? 'out' : '') + '">' + esc(frp(ti - te)) + '</b></div></div><div class="kcg">';
    for (d = 0; d < 7; d++) h += '<span class="kwd">' + esc(wk[d] || '') + '</span>';
    for (d = 0; d < off; d++) h += '<i></i>';
    for (d = 1; d <= dim; d++) {
      var ymd = ym + '-' + (d < 10 ? '0' : '') + d, v = days[ymd], fut = ymd > today;
      h += '<button class="kcd' + (ymd === today ? ' today' : '') + (fut ? ' fut' : '') + (v ? '' : ' none') + '" ' + (fut ? 'disabled' : 'data-act="dk-day" data-d="' + ymd + '"') + '><b>' + d + '</b>' +
        (v && v.i > 0 ? '<span class="in"><em class="f">+' + fnum(v.i) + '</em><em class="s">+' + esc(X.shortRp(v.i)) + '</em></span>' : '') +
        (v && v.e > 0 ? '<span class="out"><em class="f">−' + fnum(v.e) + '</em><em class="s">−' + esc(X.shortRp(v.e)) + '</em></span>' : '') + '</button>';
    }
    return h + '</div></div>';
  }

  // ---- susun Beranda
  X.hooks.homeLayout = function (P) {
    function bt(c, h) { return h ? '<div class="bt ' + c + '">' + h + '</div>' : ''; }
    var rec = P.recent.replace('<div class="card">', '<div class="card rcard"><div class="ct"><h3>' + esc(t('home.recent')) + '</h3><span class="sp"></span><button class="link" data-act="tab" data-v="transaksi">' + esc(t('see.all')) + '</button></div>');
    var s1 = bt('b-month', X.v36 ? X.v36.stat(P) : monthCard(P)) + bt('b-ratio', P.ratio), s2 = bt('b-bud', X.v36 ? X.v36.budget(P) : '') + bt('b-ev', P.ev) + bt('b-gl', P.gl) + bt('b-rec', rec);
    return '<div class="bwrap"><div class="bento">' + bt('b-ban', P.banner) + bt('b-own', P.owner) + bt('b-top', P.top) + bt('b-hero', P.hero) +
      (s1 ? '<div class="stk s1">' + s1 + '</div>' : '') + bt('b-aset' + (P.mid ? '' : ' solo'), asetCard(P)) + bt('b-wf', wfCard(P)) +
      (s2 ? '<div class="stk s2">' + s2 + '</div>' : '') + bt('b-d14', X.v36 ? X.v36.d14(P) : '') + bt('b-flow', P.sankey) + bt('b-cal', calCard(P)) + '</div></div>';
  };
  function dayTotals(rows) {
    var m = {};
    rows.forEach(function (x) {
      var d = x.Waktu.substr(0, 10), o = m[d] || (m[d] = {inn: 0, out: 0, n: 0});
      o.n++;
      if (x.Status !== 'Aktif' || X.isNonOp(x.KodeAkun)) return;
      if (x.Jenis === 'Income') o.inn += +x.Jumlah; else if (x.Jenis === 'Expense') o.out += +x.Jumlah; else if (x.Jenis === 'Transfer' && +x.BiayaAdmin) o.out += +x.BiayaAdmin;
    });
    return m;
  }
  function dayName(d) { return t('an.days.full').split(',')[(new Date(d + 'T00:00:00Z').getUTCDay() + 6) % 7]; }
  X.hooks.txDays = function (rows, limit) {
    if (!rows.length) return '<div class="card"><div class="empty">' + t('flow.empty') + '</div></div>';
    var today = C.todayLocal(), n = Math.min(limit, rows.length), tot = dayTotals(rows), h = '', last = '';
    for (var i = 0; i < n; i++) {
      var x = rows[i], d = x.Waktu.substr(0, 10);
      if (d !== last) {
        if (last) h += '</section>';
        var o = tot[d];
        h += '<section class="card mday' + (d === today ? ' hl' : '') + '" data-d="' + d + '"><div class="mdh"><b>' + esc(dayName(d).substr(0, 3) + ', ' + d.substr(8, 2) + ' ' + C.namaBulan(+d.substr(5, 2), true)) + '</b><span><i class="in">+' + esc(frp(o.inn)) + '</i> · <i class="ex">−' + esc(frp(o.out)) + '</i></span></div>';
        last = d;
      }
      h += X.txRow(x);
    }
    h += '</section>';
    if (rows.length > n) h += '<div class="more-wrap"><button class="btn" data-act="more">' + t('more', rows.length - n) + '</button></div>';
    return h;
  };
  X.hooks.txTable = function (rows, limit) {
    if (!rows.length) return '<div class="card"><div class="empty">' + t('flow.empty') + '</div></div>';
    var today = C.todayLocal(), n = Math.min(limit, rows.length), tot = dayTotals(rows), yd = new Date(today + 'T00:00:00Z'); yd.setUTCDate(yd.getUTCDate() - 1); yd = yd.toISOString().substr(0, 10);
    var h = '<div class="dgh dgr"><span>' + t('dk.th.date') + '</span><span>' + t('dk.th.tx') + '</span><span>' + t('dk.th.cat') + '</span><span>' + t('dk.th.wal') + '</span><span>' + t('dk.th.own') + '</span><span class="r">' + t('dk.th.amt') + '</span></div>', last = '';
    for (var i = 0; i < n; i++) {
      var x = rows[i], v = X.txView(x), d = x.Waktu.substr(0, 10), sub = x.Toko || x.Barang || x.Catatan || x.Tag || '';
      if (d !== last) {
        if (last) h += '</div></section>';
        var o = tot[d], rel = d === today ? t('f.d.0') : (d === yd ? t('f.d.1') : '');
        h += '<section class="card dcard' + (d === today ? ' hl' : '') + '" data-d="' + d + '"><header class="dch"><div class="dcd"><b>' + esc(dayName(d)) + '</b><span>' + esc(d.substr(8, 2) + ' ' + C.namaBulan(+d.substr(5, 2), true) + ' ' + d.substr(0, 4)) + '</span>' + (rel ? '<em>' + esc(rel) + '</em>' : '') + '</div>' +
          '<div class="dct"><span class="in">' + t('dk.day.in') + ' <b>' + (o.inn ? '+' : '') + esc(frp(o.inn)) + '</b></span><span class="out">' + t('dk.day.out') + ' <b>' + (o.out ? '−' : '') + esc(frp(o.out)) + '</b></span><small>' + t('dk.day.n', o.n) + '</small></div></header><div class="dgb">';
        last = d;
      }
      var tag = x._error ? '<span class="tag bad">' + t('tx.failed') + '</span>' : (x._pending ? '<span class="tag">' + t('tx.pending') + '</span>' : '');
      h += '<div class="dgr dr' + (x.Status !== 'Aktif' ? ' void' : '') + (D_ID() === x.ID ? ' cur' : '') + '" role="button" tabindex="0" data-act="tx-open" data-id="' + esc(x.ID) + '"><span class="dt">' + esc(x.Waktu.substr(11, 5)) + '</span>' +
        '<span class="tt"><span class="ico ' + v.cls + '">' + v.ico + '</span><span class="tx"><b>' + esc(v.title) + '</b>' + tag + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span></span>' +
        '<span class="cl">' + esc(x.Kategori ? X.dn(x.Kategori) : jlabel(x.Jenis)) + '</span><span class="cl">' + esc(x.Dompet || '') + (x.DompetTujuan ? '<small>→ ' + esc(x.DompetTujuan) + '</small>' : '') + '</span><span class="cl">' + esc(x.PemilikDompet || '') + '</span>' +
        '<span class="r a ' + (v.sign > 0 ? 'in' : (v.sign < 0 ? 'out' : '')) + '">' + esc(X.signAmt(v, x.Jumlah)) + '</span></div>';
    }
    h += '</div></section>';
    if (rows.length > n) h += '<div class="more-wrap"><button class="btn" data-act="more">' + t('more', rows.length - n) + '</button></div>';
    return h;
  };
  function jlabel(j) { return t('j.' + j); }
  function D_ID() { return (window.__KK && window.__KK.D && window.__KK.D.id) || ''; }

  // ---------------------------------------------------------------- Pengaturan: gaya, foto latar, menu samping
  function gid() { return 'TAMPIL-' + String(S.cfg.user).replace(/[^A-Za-z0-9_-]/g, '').substr(0, 24); }
  function pushGaya() {
    if (!(S.pref.gayaPend || S.pref.icoPend) || !S.cfg || !S.master) return;
    S.pref.gayaPend = false; S.pref.icoPend = false; X.savePref();
    X.rc.save('tampilan', {gaya: S.pref.gaya, t: S.pref.gayaT || Date.now(), ico: S.pref.ico || {}}, gid()).catch(function (e) {
      var m = String(e && e.message || e);
      if (/tidak dikenal|unknown/i.test(m)) { S.pref.gayaSrv = 1; X.savePref(); X.toast(t('dk.gaya.srv')); }
      else { S.pref.gayaPend = true; X.savePref(); }
    });
  }
  function pullGaya() {
    if (!S.cfg || S.pref.gayaPend || S.pref.icoPend) return;
    var r = S.rencana.filter(function (x) { return x.Tipe === 'tampilan' && x.ID === gid(); })[0], dt = r && r.Data, g = dt && dt.gaya;
    if ((g === 'kaca' || g === 'bersih') && g !== S.pref.gaya) { S.pref.gaya = g; X.savePref(); }
    if (dt && dt.ico && typeof dt.ico === 'object' && JSON.stringify(dt.ico) !== JSON.stringify(S.pref.ico || {})) { S.pref.ico = dt.ico; X.savePref(); }
  }
  function setGaya(g) { S.pref.gaya = g; S.pref.gayaT = Date.now(); S.pref.gayaPend = true; S.pref.gayaSrv = 0; X.savePref(); X.render(); pushGaya(); }

  var BG = {url: null};
  function applyBg() {
    var d = document.documentElement;
    if (BG.url) { d.style.setProperty('--bgimg', 'url("' + BG.url + '")'); d.setAttribute('data-bgimg', '1'); d.setAttribute('data-bgdim', String(S.pref.bgdim == null ? 1 : S.pref.bgdim)); }
    else { d.style.removeProperty('--bgimg'); d.removeAttribute('data-bgimg'); d.removeAttribute('data-bgdim'); }
  }
  function loadBg() {
    return X.DB.get('bgimg').then(function (b) {
      if (BG.url) { URL.revokeObjectURL(BG.url); BG.url = null; }
      if (b && (b instanceof Blob)) BG.url = URL.createObjectURL(b);
      applyBg();
    });
  }
  function bgBlob(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var max = 1920, k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement('canvas');
        cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); URL.revokeObjectURL(u);
        cv.toBlob(function (b) { b ? res(b) : rej(new Error('blob')); }, 'image/jpeg', 0.82);
      };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('img')); };
      im.src = u;
    });
  }
  function seg(act, cur, vals, pre) {
    return '<div class="seg">' + vals.map(function (v) { return '<button class="' + (String(cur) === String(v) ? 'on' : '') + '" data-act="' + act + '" data-v="' + v + '">' + t(pre + v) + '</button>'; }).join('') + '</div>';
  }
  var prevSet = X.hooks.settingsTop;
  X.hooks.settingsTop = function () {
    var h = (prevSet ? prevSet() : '') + '<h2>' + t('dk.set.t') + '</h2><div class="card"><div class="lbl3">' + t('dk.set.t') + '</div>' + seg('dk-gaya', S.pref.gaya === 'bersih' ? 'bersih' : 'kaca', ['kaca', 'bersih'], 'dk.gaya.') +
      '<div class="muted sm" style="margin-top:8px">' + t('dk.gaya.s') + '</div>' + (S.pref.gayaSrv ? '<div class="muted sm out" style="margin-top:6px">' + t('dk.gaya.srv') + '</div>' : '') +
      '<div class="lbl3">' + t('dk.sb.t') + '</div>' + seg('dk-sb', S.pref.sb || 'auto', ['auto', 'open', 'rail'], 'dk.sb.') + '<div class="muted sm" style="margin-top:8px">' + t('dk.sb.s') + '</div></div>';
    h += '<div class="card"><div class="t" style="font-weight:600">' + t('dk.bg.t') + '</div><div class="muted sm">' + t('dk.bg.s') + '</div>';
    if (BG.url) h += '<div class="bgprev" style="background-image:url(\'' + BG.url + '\')"></div><div class="lbl3">' + t('dk.bg.dim') + '</div>' + seg('dk-bgdim', S.pref.bgdim == null ? 1 : S.pref.bgdim, [0, 1, 2], 'dk.dim.');
    h += '<div class="btnrow2" style="margin-top:12px"><button class="btn sm" data-act="dk-bg-pick">' + t(BG.url ? 'dk.bg.change' : 'dk.bg.pick') + '</button>' + (BG.url ? '<button class="btn sm danger" data-act="dk-bg-del">' + t('dk.bg.del') + '</button>' : '') + '</div><input type="file" id="file-bg" accept="image/*" hidden data-bgfile="1"></div>';
    return h;
  };

  // ---------------------------------------------------------------- aksi
  Object.assign(A, {
    'sb-toggle': function () { S.pref.sb = sbState() === 'open' ? 'rail' : 'open'; X.savePref(); setSbs(); lastKey = bucket() + sbState(); X.render(); },
    'dk-gaya': function (el) { setGaya(el.dataset.v === 'bersih' ? 'bersih' : 'kaca'); },
    'dk-sb': function (el) { S.pref.sb = el.dataset.v; X.savePref(); setSbs(); lastKey = bucket() + sbState(); X.render(); },
    'dk-bgdim': function (el) { S.pref.bgdim = +el.dataset.v; X.savePref(); applyBg(); X.render(); },
    'dk-bg-pick': function () { var i = $('#file-bg'); if (i) i.click(); },
    'dk-bg-del': function () { X.DB.set('bgimg', null).then(loadBg).then(function () { X.toast(t('dk.bg.deleted')); X.render(); }); },
    'dk-cal-m': function (el) {
      var ym = S.calM || C.todayLocal().substr(0, 7), y = +ym.substr(0, 4), m = +ym.substr(5, 2) + (+el.dataset.v);
      while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; }
      S.calM = y + '-' + (m < 10 ? '0' : '') + m; X.render();
    },
    'catat-toggle': function () { if ($('#overlay .sheet')) closeSheet(); else if (A.add) A.add(); },
    'dk-day': function (el) { S.custom = {start: el.dataset.d, end: el.dataset.d}; S.txPer = 'custom'; S.q = ''; X.setTab('transaksi'); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.id === 'wf-mode') { S.wfMode = el.value; X.render(); return; }
    if (el.id === 'wf-year') { S.wfYear = +el.value; X.render(); return; }
    if (el.dataset && el.dataset.bgfile) {
      var f = el.files && el.files[0]; if (!f) return;
      bgBlob(f).then(function (b) { return X.DB.set('bgimg', b); }).then(loadBg).then(function () { X.toast(t('dk.bg.saved')); X.render(); }).catch(function () { X.toast(t('dk.bg.fail')); });
      el.value = '';
    }
  });
  function closeSheet() { var x = $('#overlay .sheet .x'); if (x) x.click(); else $('#overlay').innerHTML = ''; }
  function pickBar(g) { var i = +g.getAttribute('data-i'); if (isNaN(i) || WF.sel === i) return; WF.sel = i; var tip = $('#wf-tip'); if (tip) tip.innerHTML = wfTip(i); document.querySelectorAll('.wfs .wfb').forEach(function (n) { n.classList.toggle('sel', n === g); }); }
  document.addEventListener('mouseover', function (e) { var g = e.target.closest && e.target.closest('.wfs .wfb'); if (g) pickBar(g); });
  document.addEventListener('click', function (e) { var g = e.target.closest && e.target.closest('.wfs .wfb'); if (g) pickBar(g); });
  document.addEventListener('focusin', function (e) { var g = e.target.closest && e.target.closest('.wfs .wfb'); if (g) pickBar(g); });
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase(), typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
    if (e.key === 'Escape') {
      if ($('#overlay2 .sheet')) { X.closePicker(); return; }
      var x = $('#overlay .sheet .x'); if (x) { x.click(); return; }
    }
    if (!S.cfg || !S.master) return;
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { var g = $('#gq'); if (g) { e.preventDefault(); g.focus(); g.select(); } return; }
    if (e.key === 'Enter' && e.target.id === 'gq') {
      S.q = e.target.value.trim(); S.limit = 80;
      if (S.page || S.tab !== 'transaksi') X.setTab('transaksi'); else X.render();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && e.target.matches && e.target.matches('#formbody .optbox input, #formbody input[data-money]')) {
      var ins = [].slice.call(document.querySelectorAll('#formbody .optbox input, #formbody input[data-money]')), nx = ins[ins.indexOf(e.target) + 1];
      e.preventDefault();
      if (nx) nx.focus(); else { e.target.blur(); var sv = $('#overlay .sheet-f [data-act="f-save"]'); if (sv) sv.focus(); }
      return;
    }
    if (!typing && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'n' || e.key === 'N') && sbState() !== 'none' && !$('#overlay2 .sheet')) {
      e.preventDefault();
      if ($('#overlay #formbody')) closeSheet(); else if (A.add) A.add();
    }
  });
  // panel samping: tandai bila ada lembar terbuka agar halaman bergeser
  (function () {
    var ov = $('#overlay'); if (!ov || !window.MutationObserver) return;
    new MutationObserver(function () { var on = !!ov.querySelector('.sheet'); document.documentElement.toggleAttribute('data-panel', on); var f = $('.catfab'); if (f) f.classList.toggle('x', on); }).observe(ov, {childList: true});
  })();

  var start0 = X.start;
  X.start = function () {
    start0();
    try { loadBg().catch(function () {}); } catch (e) {}
  };
  X.desk = {wfCard: wfCard, calCard: calCard, nwData: nwData, projection: projection, wide: wide, pushTampilan: pushGaya};
})();
