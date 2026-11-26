if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['v37'] = '3.7.0';
/* Do it v3.7.0 - Beranda ringkas: kartu utama (foto + waterfall + Masuk/Keluar/Kesehatan), Aset & Utang (donut),
   Sankey dan Kalender terpisah, Transaksi terbaru (tabel di desktop), Anggaran lebar + Goals + Event. Tanpa perubahan server. */
(function () {
  'use strict';
  var X = window.DoIt; if (!X || !X.C || !X.desk || !X.plan || !X.analisis) return;
  var C = X.C, C2 = X.C2, S = X.S, I = window.I18N, t = X.t, esc = X.esc, dn = X.dn, A = X.A;

  I.add('id', {
    'v37.good': 'Sehat', 'v37.mid': 'Cukup', 'v37.low': 'Perlu perhatian', 'v37.na': 'Belum cukup data',
    'v37.aset': 'Aset', 'v37.utang': 'Utang', 'v37.tot.a': 'Total aset', 'v37.tot.u': 'Total utang', 'v37.noutang': 'Tidak ada utang', 'v37.ratio': 'Rasio utang terhadap aset {0}',
    'v37.all': 'Semua', 'v37.tin': 'Masuk', 'v37.tout': 'Keluar', 'v37.empty': 'Belum ada transaksi.',
    'v37.due': 'Jatuh tempo 7 hari', 'v37.due.none': 'Tidak ada transaksi rutin dalam 7 hari.', 'v37.top': 'Pengeluaran terbesar bulan ini', 'v37.top.none': 'Belum ada pengeluaran bulan ini.',
    'v37.bud': 'Anggaran', 'v37.bud.sub': 'Terpakai {0} dari {1}', 'v37.proj': 'Dengan laju sekarang, akhir bulan terpakai sekitar {0}%', 'v37.over': '{0} kategori melebihi batas'
  });
  I.add('en', {
    'v37.good': 'Healthy', 'v37.mid': 'Fair', 'v37.low': 'Needs attention', 'v37.na': 'Not enough data',
    'v37.aset': 'Assets', 'v37.utang': 'Debts', 'v37.tot.a': 'Total assets', 'v37.tot.u': 'Total debts', 'v37.noutang': 'No debts', 'v37.ratio': 'Debt to asset ratio {0}',
    'v37.all': 'All', 'v37.tin': 'Income', 'v37.tout': 'Expense', 'v37.empty': 'No transactions yet.',
    'v37.due': 'Due in 7 days', 'v37.due.none': 'No recurring transactions in the next 7 days.', 'v37.top': 'Biggest expenses this month', 'v37.top.none': 'No expenses this month yet.',
    'v37.bud': 'Budget', 'v37.bud.sub': 'Spent {0} of {1}', 'v37.proj': 'At the current pace, about {0}% will be spent by month end', 'v37.over': '{0} categories over the limit'
  });

  var PAL = ['var(--accent)', 'var(--in)', '#d6a24c', '#7e8fd6', '#5db8a8', '#b561a8'];
  function frp(n) { return C.fmtRp(n); }
  function dual(n) { return '<span class="vf">' + esc(frp(n)) + '</span><span class="vs">' + esc('Rp ' + X.shortRp(n)) + '</span>'; }
  function pct1(p) { return (Math.round(p * 10) / 10).toFixed(1).replace('.', S.pref.lang === 'en' ? '.' : ',') + '%'; }

  // ---------------------------------------------------------------- kartu utama
  function mainCard(P) {
    var hb = X.hooks.heroBg ? X.hooks.heroBg() : null, hs = P.hero.indexOf('<div class="lbl">'), he = P.hero.indexOf('<div class="inout">');
    var head = (hs >= 0 ? P.hero.slice(hs, he >= 0 ? he : undefined) : '').replace(/<div class="pj">[\s\S]*$/, '');
    var sc = X.analisis.health(P.f), lbl = sc == null ? t('v37.na') : (sc >= 75 ? t('v37.good') : (sc >= 50 ? t('v37.mid') : t('v37.low')));
    var tiles = '<div class="hm-tiles"><button class="tap" data-act="page" data-v="income"><span>' + t('home.in') + '</span><b class="in">' + dual(P.is.pendapatan.total) + '</b></button>' +
      '<button class="tap" data-act="page" data-v="expense"><span>' + t('home.out') + '</span><b class="out">' + dual(P.is.beban.total) + '</b></button>' +
      '<button class="tap" data-act="home-ratio"><span>' + t('home.ratio') + '</span><b class="hs ' + (sc == null ? '' : (sc >= 75 ? 'in' : (sc >= 50 ? '' : 'out'))) + '">' + (sc == null ? '—' : sc + ' · ') + esc(sc == null ? '' : lbl) + '</b></button></div>';
    var wf = X.desk.wfCard(P).replace('<div class="card wfc">', '<div class="wfc">');
    return '<div class="card hero hmain' + (hb ? ' photo ' + hb.cls : '') + '">' + (hb ? hb.html : '') + head + wf + tiles + '</div>';
  }

  // ---------------------------------------------------------------- Aset & Utang
  function donut(items, total, lbl, tot) {
    var R = 38, L = 2 * Math.PI * R, off = 0, g = '';
    if (total > 0) items.forEach(function (it) {
      var d = it.v / total * L; if (d <= 0) return;
      g += '<circle cx="50" cy="50" r="' + R + '" stroke="' + it.c + '" stroke-dasharray="' + Math.max(d - (items.length > 1 ? 1.2 : 0), .6).toFixed(2) + ' ' + L.toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>'; off += d;
    }); else g = '<circle cx="50" cy="50" r="' + R + '" stroke="var(--line)"/>';
    return '<svg class="adsv" viewBox="0 0 100 100" role="img" aria-label="' + esc(lbl + ' ' + tot) + '"><g fill="none" stroke-width="14" transform="rotate(-90 50 50)">' + g + '</g>' +
      '<text x="50" y="47" text-anchor="middle" class="adt1">' + esc(lbl) + '</text><text x="50" y="60" text-anchor="middle" class="adt2">' + esc(tot) + '</text></svg>';
  }
  function legend(groups, total, red, act) {
    return groups.map(function (g, i) {
      var c = red ? 'var(--out)' : PAL[i % PAL.length], pg = /piutang/i.test(g.nama);
      var a = red ? 'data-act="page" data-v="payable"' : (pg ? 'data-act="page" data-v="receivable"' : 'data-act="page" data-v="portfolio" data-g="' + esc(g.nama) + '"');
      return '<div class="adr tap" ' + a + '><i style="background:' + c + '"></i><span class="adn"><b>' + esc(dn(g.nama)) + '</b><small>' + esc(t('home.grp.n', g.rows.length)) + '</small></span><span class="adp">' + pct1(total ? g.total / total * 100 : 0) + '</span><b class="adv">' + esc(frp(g.total)) + '</b></div>';
    }).join('');
  }
  function adCard(P) {
    var A2 = P.A, ag = A2.groups.filter(function (g) { return g.total > 0; }), ug = ((A2.bs.liabilitas && A2.bs.liabilitas.groups) || []).filter(function (g) { return g.total > 0; });
    var ta = A2.bs.aset.total, tu = A2.bs.liabilitas.total, sa = ag.reduce(function (a, g) { return a + g.total; }, 0), su = ug.reduce(function (a, g) { return a + g.total; }, 0);
    var h = '<div class="card adc"><div class="ct"><h3>' + t('v37.aset') + ' &amp; ' + t('v37.utang') + '</h3><div class="sp"></div><button class="link sm" data-act="page" data-v="portfolio">' + t('see.all') + '</button></div><div class="adw"><div class="add">' +
      '<div class="adk"><b>' + t('v37.aset') + '</b>' + donut(ag.map(function (g, i) { return {v: g.total, c: PAL[i % PAL.length]}; }), sa, t('v37.tot.a'), X.shortRp(ta)) + '<b class="num">' + esc(frp(ta)) + '</b></div>' +
      '<div class="adk"><b>' + t('v37.utang') + '</b>' + donut(ug.map(function (g) { return {v: g.total, c: 'var(--out)'}; }), su, t('v37.tot.u'), X.shortRp(tu)) + '<b class="num out">' + esc(frp(tu)) + '</b></div></div>' +
      '<div class="adl"><div class="adh">' + t('v37.aset') + '</div>' + (ag.length ? legend(ag, sa) : '<div class="empty">' + t('home.empty.assets') + '</div>') +
      '<div class="adsep"></div><div class="adh">' + t('v37.utang') + '</div>' + (ug.length ? legend(ug, su, true) : '<div class="muted sm">' + t('v37.noutang') + '</div>') +
      (ta > 0 ? '<div class="muted sm" style="margin-top:8px">' + esc(t('v37.ratio', pct1(tu / ta * 100))) + '</div>' : '') + '</div></div></div>';
    return h;
  }

  // ---------------------------------------------------------------- Transaksi terbaru
  function dShort(d) { return +d.substr(8, 2) + ' ' + C.namaBulan(+d.substr(5, 2), true); }
  function recCards(P) {
    var tab = S.recTab || 'all', pred = tab === 'in' ? function (x) { return x.Jenis === 'Income'; } : (tab === 'out' ? function (x) { return x.Jenis === 'Expense'; } : null);
    var rows = C.recent(S.tx, pred, 8), mob = '<div class="rec-m">' + P.recentH + P.recent + '</div>';
    var tabs = '<div class="rtabs">' + [['all', 'v37.all'], ['in', 'v37.tin'], ['out', 'v37.tout']].map(function (a) { return '<button class="' + (tab === a[0] ? 'on' : '') + '" data-act="v37-rt" data-v="' + a[0] + '">' + t(a[1]) + '</button>'; }).join('') + '</div>';
    var tb = '<div class="card rtc"><div class="ct"><h3>' + t('home.recent') + '</h3><div class="sp"></div><button class="link sm" data-act="tab" data-v="transaksi">' + t('see.all') + '</button></div>' + tabs;
    if (!rows.length) tb += '<div class="empty">' + t('v37.empty') + '</div>';
    else {
      tb += '<div class="rtr rth"><span>' + t('dk.th.date') + '</span><span>' + t('dk.th.tx') + '</span><span>' + t('dk.th.cat') + '</span><span>' + t('dk.th.wal') + '</span><span class="r">' + t('dk.th.amt') + '</span></div>';
      rows.forEach(function (x) {
        var v = X.txView(x), cat = x.Jenis === 'Income' || x.Jenis === 'Expense' ? dn(x.Kategori) : x.Jenis;
        tb += '<div class="rtr tap" data-act="tx-open" data-id="' + esc(x.ID) + '"><span class="muted sm">' + esc(dShort(x.Waktu.substr(0, 10))) + '</span><span class="rtn">' + esc(v.title) + '</span><span><em class="chip">' + esc(cat) + '</em></span><span class="muted sm">' + esc(x.Dompet || '') + '</span><b class="r ' + (v.sign > 0 ? 'in' : (v.sign < 0 ? 'out' : '')) + '">' + esc(X.signAmt(v, x.Jumlah)) + '</b></div>';
      });
    }
    tb += '</div>';
    return mob + '<div class="rec-d">' + tb + '<div class="rside">' + dueCard() + topCard() + '</div></div>';
  }
  function dueCard() {
    var today = C.todayLocal(), lim = C2.addDays(today, 7), out = [];
    try {
      X.plan.recs().forEach(function (r) {
        if (r.aktif === false || r.susut || !r.p) return;
        if (S.owner !== 'Semua' && X.plan.ownerOf(r) !== S.owner) return;
        var nx = C2.nextDue(r, r.terakhir || C2.addDays(r.mulai, -1)); if (nx && nx <= lim) out.push({n: X.plan.recName(r), d: nx, v: +r.p.jumlah || 0});
      });
    } catch (e) { out = []; }
    out.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
    return '<div class="card rsc"><div class="ct"><h3>' + t('v37.due') + '</h3></div>' + (out.length ? out.slice(0, 4).map(function (o) { return '<div class="rsr"><span><b>' + esc(o.n) + '</b><small>' + esc(dShort(o.d)) + '</small></span><b>' + esc(frp(o.v)) + '</b></div>'; }).join('') : '<div class="muted sm">' + t('v37.due.none') + '</div>') + '</div>';
  }
  function topCard() {
    var k = C.todayLocal().substr(0, 7), rows = [];
    Object.keys(S.tx).forEach(function (id) {
      var x = S.tx[id]; if (x.Status !== 'Aktif' || x.Jenis !== 'Expense' || x.Waktu.substr(0, 7) !== k || X.isNonOp(x.KodeAkun)) return;
      if (S.owner !== 'Semua' && x.PemilikDompet !== S.owner) return; rows.push(x);
    });
    rows.sort(function (a, b) { return (+b.Jumlah) - (+a.Jumlah); });
    return '<div class="card rsc"><div class="ct"><h3>' + t('v37.top') + '</h3></div>' + (rows.length ? rows.slice(0, 5).map(function (x) { return '<div class="rsr tap" data-act="tx-open" data-id="' + esc(x.ID) + '"><span><b>' + esc(x.Barang || x.Toko || dn(x.SubKategori)) + '</b><small>' + esc(dShort(x.Waktu.substr(0, 10))) + '</small></span><b class="out">' + esc(frp(+x.Jumlah)) + '</b></div>'; }).join('') : '<div class="muted sm">' + t('v37.top.none') + '</div>') + '</div>';
  }

  // ---------------------------------------------------------------- Anggaran
  function budCard(P) {
    if (!X.plan.bud || !X.v36 || !X.v36.linesOf) return X.v36 ? X.v36.budget(P) : '';
    var k = C.todayLocal().substr(0, 7), ex = C2.budgetMonth(X.v36.linesOf('Expense'), S.tx, k, S.owner);
    if (!ex.rows.length) return X.v36.budget(P);
    var B = X.plan.bud, tot = ex.total, p = tot.tersedia > 0 ? tot.terpakai / tot.tersedia : 0, today = C.todayLocal(), dim = new Date(Date.UTC(+k.substr(0, 4), +k.substr(5, 2), 0)).getUTCDate(), dom = +today.substr(8, 2);
    var grp = ex.rows.filter(function (r) { return r.line.scope === 'grup'; }), use = (grp.length ? grp : ex.rows).slice().sort(function (a, b) { return b.terpakai - a.terpakai; }).slice(0, 6);
    var over = ex.rows.filter(function (r) { return r.terpakai > r.tersedia && r.tersedia > 0; }).length;
    var R = 38, L = 2 * Math.PI * R, cls = p > 1 ? 'bad' : (p >= .8 ? 'warn' : '');
    var ring = '<svg class="bring" viewBox="0 0 100 100" role="img" aria-label="' + Math.round(p * 100) + '%"><g fill="none" stroke-width="12" transform="rotate(-90 50 50)"><circle cx="50" cy="50" r="' + R + '" stroke="var(--line)"/><circle cx="50" cy="50" r="' + R + '" class="brg ' + cls + '" stroke-dasharray="' + (Math.min(1, p) * L).toFixed(1) + ' ' + L.toFixed(1) + '" stroke-linecap="round"/></g><text x="50" y="56" text-anchor="middle" class="adt2" style="font-size:20px">' + Math.round(p * 100) + '%</text></svg>';
    var bars = use.map(function (r) {
      var q = r.tersedia > 0 ? r.terpakai / r.tersedia : (r.terpakai > 0 ? 9.99 : 0), c = q > 1 ? 'bad' : (q >= .8 ? 'warn' : '');
      return '<div class="bcr"><span class="bcn">' + esc(dn(B.lineName(r.line))) + '</span><div class="pbar ' + c + '"><i style="width:' + Math.min(100, Math.round(q * 100)) + '%"></i></div><b class="bcv">' + esc(X.shortRp(r.terpakai) + ' / ' + X.shortRp(r.tersedia)) + '</b></div>';
    }).join('');
    var note = '';
    if (dom >= 3 && tot.tersedia > 0) { var pr = tot.terpakai / (dom / dim) / tot.tersedia; note = esc(t('v37.proj', Math.round(pr * 100))) + (over ? ' · ' + esc(t('v37.over', over)) : ''); }
    else if (over) note = esc(t('v37.over', over));
    return '<div class="card bcard bud2"><div class="ct"><h3>' + t('v37.bud') + '</h3><span class="muted sm">' + esc(t('v37.bud.sub', X.shortRp(tot.terpakai), X.shortRp(tot.tersedia))) + '</span><div class="sp"></div><button class="link sm" data-act="home-plan" data-v="anggaran">' + t('see.all') + '</button></div>' +
      '<div class="budw">' + ring + '<div class="bcl">' + bars + '</div></div>' + (note ? '<div class="bnote">' + note + '</div>' : '') + '</div>';
  }

  A['v37-rt'] = function (el) { S.recTab = el.dataset.v; X.render(); };

  // ---------------------------------------------------------------- susun Beranda
  X.hooks.homeLayout = function (P) {
    function bt(c, h) { return h ? '<div class="bt ' + c + '">' + h + '</div>' : ''; }
    var cal = X.desk.calCard(P), pe = bt('b-gl', P.gl) + bt('b-ev', P.ev);
    return '<div class="bwrap"><div class="bento v37">' + bt('b-ban', P.banner) + bt('b-own', P.owner) + bt('b-top', P.top) + bt('b-main', mainCard(P)) + bt('b-ad', adCard(P)) +
      bt('b-flow', P.sankey) + bt('b-cal', cal) + bt('b-rec', recCards(P)) + bt('b-bud', budCard(P)) + (pe ? '<div class="pe">' + pe + '</div>' : '') + '</div></div>';
  };
  X.v37 = {mainCard: mainCard, adCard: adCard, recCards: recCards, budCard: budCard, dueCard: dueCard, topCard: topCard};
})();
