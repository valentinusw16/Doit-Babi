if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['v361'] = '3.6.2';
/* Do it v3.6.2 - menu Plan dipecah (Event, Anggaran, Goals), Rutin masuk Transaksi, Event bertingkat
   (kategori, subkategori, toko, barang, jumlah x harga), kartu Event/Goals terpisah di Beranda. Tanpa perubahan server. */
(function () {
  'use strict';
  var X = window.DoIt; if (!X || !X.C || !X.plan) return;
  var C = X.C, C2 = X.C2, S = X.S, I = window.I18N, t = X.t, esc = X.esc, dn = X.dn, A = X.A, ICON = X.ICON, $ = X.$, P = X.plan;

  I.add('id', {
    'pg.event': 'Event', 'pg.anggaran': 'Anggaran', 'pg.tujuan': 'Goals', 'v361.plan': 'Plan', 'v361.g.fin': 'Keuangan', 'v361.g.data': 'Data & sistem',
    'v361.tab.list': 'Daftar', 'v361.tab.rutin': 'Rutin',
    'v361.items.hint': 'Isi sedetail yang kamu mau. Toko dan barang boleh kosong. Bila diisi, hanya transaksi yang mengandung kata itu yang dihitung ke baris ini.',
    'v361.toko': 'Toko / sumber (opsional)', 'v361.barang': 'Barang (opsional)', 'v361.qty': 'Jumlah', 'v361.price': 'Harga satuan', 'v361.total': 'Total', 'v361.sum': 'Total rincian',
    'v361.in': '{0} hari lagi', 'v361.on': 'Berlangsung, hari ke-{0} dari {1}', 'v361.on1': 'Berlangsung, hari ke-{0}', 'v361.end': 'Berakhir {0} hari lagi', 'v361.done': 'Selesai', 'v361.today': 'Hari ini',
    'v361.bud': 'Anggaran', 'v361.used': 'Terpakai', 'v361.left': 'Sisa', 'v361.over': 'Lebih', 'v361.out': 'Di luar rencana', 'v361.whole': 'Seluruh kategori', 'v361.allsub': 'Semua subkategori',
    'v361.ev.all': 'Lihat semua ({0})', 'v361.ev.none': 'Belum ada event.', 'v361.gl.t': 'Goals', 'v361.ev.t': 'Event', 'v361.nobud': 'Tanpa anggaran', 'v361.tx': 'Lihat {0} transaksi',
    'v361.plan.title': 'Rencana pengeluaran', 'v361.plan.add': 'Tambah rencana', 'v361.plan.edit': 'Ubah rencana', 'v361.plan.hint': 'Rencana tidak masuk jurnal. Isi seperti saat mencatat. Ketik 4*15000 di kolom jumlah untuk jumlah × harga.', 'v361.plan.empty': 'Belum ada rencana.', 'v361.real': 'Catat realisasi', 'v361.real.done': 'Tercatat', 'v361.real.title': 'Realisasi rencana', 'v361.plan.when': 'Tgl {0}'
  });
  I.add('en', {
    'pg.event': 'Events', 'pg.anggaran': 'Budget', 'pg.tujuan': 'Goals', 'v361.plan': 'Plan', 'v361.g.fin': 'Finance', 'v361.g.data': 'Data & system',
    'v361.tab.list': 'List', 'v361.tab.rutin': 'Recurring',
    'v361.items.hint': 'Fill in as much detail as you like. Store and item are optional. When filled, only transactions containing those words count toward the line.',
    'v361.toko': 'Store / source (optional)', 'v361.barang': 'Item (optional)', 'v361.qty': 'Quantity', 'v361.price': 'Unit price', 'v361.total': 'Total', 'v361.sum': 'Breakdown total',
    'v361.in': 'in {0} days', 'v361.on': 'Ongoing, day {0} of {1}', 'v361.on1': 'Ongoing, day {0}', 'v361.end': 'Ends in {0} days', 'v361.done': 'Finished', 'v361.today': 'Today',
    'v361.bud': 'Budget', 'v361.used': 'Spent', 'v361.left': 'Left', 'v361.over': 'Over', 'v361.out': 'Outside the plan', 'v361.whole': 'Whole category', 'v361.allsub': 'All subcategories',
    'v361.ev.all': 'See all ({0})', 'v361.ev.none': 'No events yet.', 'v361.gl.t': 'Goals', 'v361.ev.t': 'Event', 'v361.nobud': 'No budget', 'v361.tx': 'View {0} transactions',
    'v361.plan.title': 'Planned expense', 'v361.plan.add': 'Add plan', 'v361.plan.edit': 'Edit plan', 'v361.plan.hint': 'Plans do not enter the journal. Fill in like recording. Type 4*15000 in the amount for quantity × price.', 'v361.plan.empty': 'No plans yet.', 'v361.real': 'Record actual', 'v361.real.done': 'Recorded', 'v361.real.title': 'Record planned expense', 'v361.plan.when': 'On {0}'
  });

  function frp(n) { return C.fmtRp(n); }
  function sumBy(a, f) { return a.reduce(function (s, x) { return s + f(x); }, 0); }
  function dayNum(d) { return Math.round(Date.UTC(+d.substr(0, 4), +d.substr(5, 2) - 1, +d.substr(8, 2)) / 864e5); }
  function H() { return P.h; }
  function words(q, hay) { return String(q).toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) >= 0; }); }

  // ---------------------------------------------------------------- realisasi event bertingkat
  function evActual(e) {
    var tag = String(e.tag || '').toLowerCase().replace(/^#/, ''), items = (e.items || []).map(function (it, i) { return {i: i, it: it, real: 0, n: 0, sc: (it.k ? 1 : 0) + (it.s ? 1 : 0) + (it.b ? 1 : 0)}; });
    var out = {items: items, otherSub: {}, otherTot: 0, otherG: {}, total: 0, n: 0, byGrup: {}};
    if (!tag) return out;
    Object.keys(S.tx).forEach(function (id) {
      var x = S.tx[id]; if (x.Status !== 'Aktif' || x.Jenis !== 'Expense') return;
      var tags = String(x.Tag || '').toLowerCase().split(/[\s,]+/).map(function (s) { return s.replace(/^#/, ''); }); if (tags.indexOf(tag) < 0) return;
      var toko = String(x.Toko || '').toLowerCase(), barang = String(x.Barang || '').toLowerCase(), amt = +x.Jumlah, best = null;
      items.forEach(function (w) {
        var it = w.it; if (it.g !== x.Kategori) return; if (it.k && it.k !== x.KodeAkun) return; if (it.s && !words(it.s, toko)) return; if (it.b && !words(it.b, barang)) return;
        if (!best || w.sc > best.sc) best = w;
      });
      out.total += amt; out.n++; out.byGrup[x.Kategori] = (out.byGrup[x.Kategori] || 0) + amt;
      if (best) { best.real += amt; best.n++; } else { out.otherTot += amt; out.otherG[x.Kategori] = (out.otherG[x.Kategori] || 0) + amt; out.otherSub[x.KodeAkun] = (out.otherSub[x.KodeAkun] || 0) + amt; }
    });
    return out;
  }
  function evBudget(e) { return +e.anggaran || sumBy(e.items || [], function (i) { return +i.j || 0; }); }
  function evGroups(e, a) {
    var order = [], g = {};
    function G(n) { if (!g[n]) { g[n] = {nama: n, bud: 0, real: 0, subs: {}, subOrder: [], other: a.otherG[n] || 0}; order.push(n); } return g[n]; }
    a.items.forEach(function (w) {
      var G1 = G(w.it.g), k = w.it.k || '', s = G1.subs[k]; if (!s) { s = G1.subs[k] = {k: k, bud: 0, real: 0, items: []}; G1.subOrder.push(k); }
      var j = +w.it.j || 0; G1.bud += j; G1.real += w.real; s.bud += j; s.real += w.real; s.items.push(w);
    });
    Object.keys(a.byGrup).forEach(function (n) { var G1 = G(n); G1.real = (G1.real || 0) + (a.otherG[n] || 0); });
    return order.map(function (n) { return g[n]; }).sort(function (x, y) { return (y.real + y.bud) - (x.real + x.bud); });
  }
  function subName(k) { var sc = k && S.M.katByKode[k]; return sc ? dn(sc.SubKategori) : ''; }
  function phaseText(e) {
    var today = C.todayLocal(), dt = dayNum(today);
    if (e.mulai && e.mulai > today) return t('v361.in', dayNum(e.mulai) - dt);
    if (e.selesai && e.selesai < today) return t('v361.done');
    if (e.mulai) { var dd = dt - dayNum(e.mulai) + 1; if (e.selesai) { var tot = dayNum(e.selesai) - dayNum(e.mulai) + 1; return dd === 1 ? t('v361.today') + ' · ' + t('v361.on', 1, tot) : t('v361.on', dd, tot); } return t('v361.on1', dd); }
    return '';
  }
  function itemTitle(it) { var p = []; if (it.b) p.push(it.b); if (it.s) p.push((it.b ? '@ ' : '') + it.s); return p.join(' ') || subName(it.k) || t('v361.whole'); }
  function row(ico, title, sub, real, bud, cls, extra) {
    var h = H(), p = bud ? real / bud : 0;
    return '<div class="evr ' + (cls || '') + '"><div class="sr"><span class="evt">' + (ico ? '<span class="gi sm">' + ico + '</span>' : '') + '<span class="evtt">' + esc(title) + (sub ? '<small class="muted sm">' + esc(sub) + '</small>' : '') + '</span></span><b class="num">' + esc(C.fmtNum(real)) + (bud ? ' / ' + esc(C.fmtNum(bud)) : '') + '</b></div>' + (bud ? h.pbar(p) : '') + (extra || '') + '</div>';
  }
  function evCard(e) {
    var h = H(), a = evActual(e), bud = evBudget(e), p = bud ? a.total / bud : 0, gs = evGroups(e, a), left = bud - a.total;
    var st = '<div class="evstat"><div><small class="muted">' + t('v361.bud') + '</small><b class="num">' + esc(bud ? C.fmtNum(bud) : '-') + '</b></div><div><small class="muted">' + t('v361.used') + '</small><b class="num">' + esc(C.fmtNum(a.total)) + '</b></div><div><small class="muted">' + t(left < 0 && bud ? 'v361.over' : 'v361.left') + '</small><b class="num ' + (left < 0 && bud ? 'out' : 'in') + '">' + esc(bud ? C.fmtNum(Math.abs(left)) : '-') + '</b></div></div>';
    var out = '<div class="card bl evc' + (e.foto ? ' hasph' : '') + '">' + h.cover(e) + '<div class="ah"><span class="gi">' + ICON.tag + '</span><span>' + esc(e.nama) + '<small class="muted sm dnet">#' + esc(h.norm(e.tag)) + (e.mulai ? ' · ' + esc(C.fmtTgl(e.mulai)) + (e.selesai ? ' – ' + esc(C.fmtTgl(e.selesai)) : '') : '') + '</small></span>' +
      '<button class="hb sm" data-act="ev-open" data-id="' + esc(e.id) + '" aria-label="' + t('ev.edit') + '">' + ICON.edit + '</button></div>';
    var ph = phaseText(e); if (ph) out += '<div class="evph"><span class="pst ' + (e.selesai && e.selesai < C.todayLocal() ? '' : 'ok') + '"><i></i>' + esc(ph) + '</span></div>';
    out += st + (bud ? h.pbar(p) : '<div class="muted sm">' + t('v361.nobud') + '</div>');
    out += gs.map(function (g) {
      var key = e.id + ':' + g.nama, open = !S.evClosed || !S.evClosed[key];
      var body = '';
      g.subOrder.forEach(function (k) {
        var s = g.subs[k], det = s.items;
        body += row(k ? X.catIcon(g.nama, (S.M.katByKode[k] || {}).SubKategori, k) : '', k ? subName(k) : t('v361.allsub'), '', s.real, s.bud, 'evs');
        det.forEach(function (w) {
          var it = w.it, sub = [+it.q > 0 && +it.h > 0 ? C.fmtNum(it.q) + ' × ' + C.fmtNum(it.h) : '', it.w ? C.fmtTgl(it.w) : '', it.d || '', w.n ? w.n + 'x' : ''].filter(Boolean).join(' · ');
          var ex = '<div class="evact">' + (it.x ? '<span class="pst ok"><i></i>' + t('v361.real.done') + '</span>' : '<button class="link sm" data-act="ev-real" data-id="' + esc(e.id) + '" data-i="' + w.i + '">' + t('v361.real') + '</button>') + '</div>';
          body += row('', itemTitle(it), sub, w.real, +it.j || 0, 'evi2', ex);
        });
      });
      Object.keys(a.otherSub).forEach(function (k) { var sc = S.M.katByKode[k]; if (!sc || sc.Kategori !== g.nama) return; body += row('', subName(k), t('v361.out'), a.otherSub[k], 0, 'evo'); });
      return '<div class="evg"><button class="evgh" data-act="ev-tog" data-k="' + esc(key) + '" aria-expanded="' + (open ? 'true' : 'false') + '"><span class="gi sm">' + X.catIcon(g.nama) + '</span><span class="evgn">' + esc(dn(g.nama)) + '</span><b class="num">' + esc(C.fmtNum(g.real)) + (g.bud ? ' / ' + esc(C.fmtNum(g.bud)) : '') + '</b><i class="chev' + (open ? ' up' : '') + '"></i></button>' +
        (g.bud ? h.pbar(g.real / g.bud) : '') + (open ? '<div class="evb">' + body + '</div>' : '') + '</div>';
    }).join('');
    if (a.otherTot > 0 && gs.length) out += '<div class="evout muted sm">' + esc(t('v361.out')) + ': <b class="num out">' + esc(frp(a.otherTot)) + '</b></div>';
    return out + '<div style="margin-top:8px"><button class="link" data-act="ev-tx" data-id="' + esc(e.id) + '">' + t('v361.tx', a.n) + '</button></div></div>';
  }
  function vEvent() {
    var evs = P.rc.list('event').filter(function (e) { return e.aktif !== false; }), h = '<div class="btnrow"><button class="btn" data-act="ev-new">' + ICON.plus + t('ev.add') + '</button></div>';
    if (!evs.length) return h + '<div class="card"><div class="empty">' + t('ev.empty') + '</div></div>';
    return h + P.state(S.owner).ev.map(function (E) { return evCard(E.e); }).join('');
  }

  // ---------------------------------------------------------------- formulir event (item bertingkat)
  function listOf(field) {
    var m = {}; Object.keys(S.tx).forEach(function (id) { var v = String(S.tx[id][field] || '').trim(); if (v) m[v] = (m[v] || 0) + 1; });
    return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).slice(0, 60);
  }
  function evTag(d) { return '#' + H().norm(d.tag || d.nama || ''); }
  function itemLine(r) {
    var sc = r.k && S.M.katByKode[r.k], nm = (r.g ? dn(r.g) : '') + (sc ? ' › ' + dn(sc.SubKategori) : ''), who = itemTitle(r);
    return {a: nm, b: (r.s || r.b ? who : ''), c: [+r.q > 0 && +r.h > 0 ? C.fmtNum(r.q) + ' × ' + C.fmtNum(r.h) : '', r.w ? t('v361.plan.when', C.fmtTgl(r.w)) : '', r.d || ''].filter(Boolean).join(' · ')};
  }
  function evItems(d) {
    var items = d.items || [];
    var h = '<label class="lbl2">' + t('ev.items') + '</label><div class="muted sm" style="margin:-2px 2px 8px">' + t('v361.plan.hint') + '</div>';
    if (!items.length) h += '<div class="muted sm" style="margin:6px 2px">' + t('v361.plan.empty') + '</div>';
    h += items.map(function (r, i) {
      var L = itemLine(r);
      return '<div class="evi pl"><button class="evp tap" data-act="ev-pedit" data-i="' + i + '"><span class="evpa">' + esc(L.a) + '</span>' + (L.b ? '<span class="evpb">' + esc(L.b) + '</span>' : '') + (L.c ? '<small class="muted sm">' + esc(L.c) + '</small>' : '') + '</button><b class="num evpj">' + esc(C.fmtNum(r.j || 0)) + '</b>' +
        '<button class="hb" data-act="pf-rdel" data-list="items" data-i="' + i + '" aria-label="' + t('delete') + '">' + ICON.x + '</button></div>';
    }).join('');
    return h + '<button class="link" data-act="ev-padd">+ ' + t('v361.plan.add') + '</button><div class="evsum"><span class="muted">' + t('v361.sum') + '</span><b class="num" id="ev-sum">' + esc(frp(sumBy(items, function (i) { return +i.j || 0; }))) + '</b></div>';
  }
  // buka formulir Catat sebagai penyusun rencana (tidak masuk jurnal)
  function planOpen(idx) {
    var PF = P.pf(); if (!PF || !PF.d) return; var snap = {id: PF.id, d: PF.d}, it = idx >= 0 ? PF.d.items[idx] : null;
    function back() { P.bud.openForm('ev', snap.id, snap.d); }
    function cb(F) {
      var sc = S.M.katByKode[F.kodeAkun] || {}, o = {g: sc.Kategori || (it && it.g) || '', k: F.kodeAkun || '', s: F.toko || '', b: F.barang || '', j: +F.jumlah || 0, d: F.dompet || '', w: String(F.waktu || '').substr(0, 10) || C.todayLocal(), c: F.catatan || ''};
      if (it && it.q && it.h && it.q * it.h === o.j) { o.q = it.q; o.h = it.h; }
      if (it && it.x) o.x = it.x;
      snap.d.items = snap.d.items || []; if (it) snap.d.items[idx] = o; else snap.d.items.push(o);
      back();
    }
    var init = {jenis: 'Expense', kodeAkun: it ? it.k : '', dompet: it ? it.d || '' : '', jumlah: it ? +it.j || 0 : 0, toko: it ? it.s || '' : '', barang: it ? it.b || '' : '', catatan: it ? it.c || '' : '', tag: evTag(snap.d), waktu: it && it.w ? it.w + 'T12:00' : ''};
    X.openForm(init, {planCb: cb, planBack: back, planTitle: t(it ? 'v361.plan.edit' : 'v361.plan.title')});
    var fx = X.saveFormRaw().FX; if (fx) { fx.more = true; X.renderForm(); }
  }
  function evItemsOut(items) {
    return (items || []).map(function (i) {
      var q = +i.q || 0, h = +i.h || 0, j = q > 0 && h > 0 ? q * h : (+i.j || 0);
      var o = {g: i.g, k: i.k || '', j: j}; ['s', 'b', 'd', 'w', 'c', 'x'].forEach(function (f) { if (String(i[f] || '').trim()) o[f] = String(i[f]).trim(); }); if (q > 0 && h > 0) { o.q = q; o.h = h; } return o;
    }).filter(function (i) { return i.j > 0; });
  }
  // realisasi: buka formulir Catat sungguhan dari kartu event
  function realOpen(evId, idx) {
    var e = P.rc.list('event').filter(function (x) { return x.id === evId; })[0]; if (!e) return; var it = (e.items || [])[idx]; if (!it) return;
    X.openForm({jenis: 'Expense', kodeAkun: it.k || '', dompet: it.d || '', jumlah: +it.j || 0, toko: it.s || '', barang: it.b || '', catatan: it.c || '', tag: e.tag || evTag(e)}, {planTitle: t('v361.real.title'), after: function (x) {
      var items = (e.items || []).map(function (r, n) { return n === idx ? Object.assign({}, r, {x: x.ID}) : r; });
      P.rc.save('event', Object.assign({}, e, {items: items}), e.id).catch(function (er) { X.toast(X.srvErr(er)); });
    }});
  }

  // ---------------------------------------------------------------- Beranda: kartu Event dan Goals terpisah
  function homeEv(PS) {
    if (!PS.ev.length) return '';
    var h = H(), E = PS.ev[0], e = E.e, a = evActual(e), bud = evBudget(e), p = bud ? a.total / bud : 0, gs = evGroups(e, a).filter(function (g) { return g.real > 0 || g.bud > 0; }).slice(0, 3), ph = phaseText(e);
    var out = '<div class="card evh"><div class="ct"><h3>' + t('v361.ev.t') + '</h3><div class="sp"></div><button class="link sm" data-act="home-plan" data-v="event">' + (PS.ev.length > 1 ? t('v361.ev.all', PS.ev.length) : t('see.all')) + '</button></div>' +
      '<button class="plr tap" data-act="home-plan" data-v="event"><div class="sr"><span class="plt">' + esc(e.nama) + '</span>' + (ph ? '<span class="pst ' + (e.selesai && e.selesai < C.todayLocal() ? '' : 'ok') + '"><i></i>' + esc(ph) + '</span>' : '') + '</div>' +
      '<div class="sr"><span class="muted sm">' + esc(bud ? t('bl.used.of', X.shortRp(a.total), X.shortRp(bud)) : t('ev.spent', frp(a.total))) + '</span>' + (bud ? '<b class="sm">' + h.pct(p) + '</b>' : '') + '</div>' + (bud ? h.pbar(p) : '') + '</button>';
    if (gs.length) out += '<div class="evmini">' + gs.map(function (g) { return '<div class="sr"><span class="muted sm">' + esc(dn(g.nama)) + '</span><b class="sm num">' + esc(X.shortRp(g.real)) + (g.bud ? ' / ' + esc(X.shortRp(g.bud)) : '') + '</b></div>'; }).join('') + '</div>';
    return out + '</div>';
  }
  function homeGl(PS) {
    if (!PS.gl.length) return '';
    var h = H(), top = PS.gl.slice(0, 2);
    return '<div class="card glh"><div class="ct"><h3>' + t('v361.gl.t') + '</h3><div class="sp"></div><button class="link sm" data-act="home-plan" data-v="tujuan">' + (PS.gl.length > 2 ? t('v361.ev.all', PS.gl.length) : t('see.all')) + '</button></div>' +
      top.map(function (G) {
        return '<button class="plr tap" data-act="home-plan" data-v="tujuan"><div class="sr"><span class="plt">' + esc(G.g.nama) + '</span>' + h.badge(G.st) + '</div><div class="sr"><span class="muted sm">' + esc(t('bl.used.of', X.shortRp(G.p.terkumpul), X.shortRp(G.p.target)) + (G.g.tenggat ? ' · ' + t('gl.by', C.fmtTgl(G.g.tenggat)) : '')) + '</span><b class="sm">' + h.pct(G.p.pct) + '</b></div>' + h.pbar(G.p.pct, G.st === 'done' || G.st === 'near' ? 'good' : (G.st === 'late' ? 'warn' : '')) + '</button>';
      }).join('') + '</div>';
  }

  // ---------------------------------------------------------------- Transaksi: tab Daftar | Rutin
  function txTabs() {
    var due = P.dueCount ? P.dueCount() : 0, tab = S.txTab === 'rutin' ? 'rutin' : 'list';
    return '<div class="seg sm txtabs">' + [['list', 'v361.tab.list'], ['rutin', 'v361.tab.rutin']].map(function (x) { return '<button class="' + (tab === x[0] ? 'on' : '') + '" data-act="v361-txtab" data-v="' + x[0] + '">' + t(x[1]) + (x[0] === 'rutin' && due ? ' <em class="bdg">' + due + '</em>' : '') + '</button>'; }).join('') + '</div>';
  }

  Object.assign(A, {
    'ev-padd': function () { planOpen(-1); },
    'ev-pedit': function (el) { planOpen(+el.dataset.i); },
    'ev-real': function (el) { realOpen(el.dataset.id, +el.dataset.i); },
    'ev-tog': function (el) { S.evClosed = S.evClosed || {}; var k = el.dataset.k; S.evClosed[k] = !S.evClosed[k]; X.render(); },
    'v361-txtab': function (el) { S.txTab = el.dataset.v === 'rutin' ? 'rutin' : 'list'; X.render(); },
    'home-plan': function (el) {
      var v = el.dataset.v;
      if (v === 'rutin') { S.txTab = 'rutin'; X.setTab('transaksi'); return; }
      X.openPage(v === 'anggaran' ? 'anggaran' : (v === 'tujuan' ? 'tujuan' : 'event'));
    }
  });
  X.pages.event = {title: function () { return t('pg.event'); }, render: vEvent};
  X.pages.anggaran = {title: function () { return t('pg.anggaran'); }, render: P.vAnggaran};
  X.pages.tujuan = {title: function () { return t('pg.tujuan'); }, render: P.vGoals};

  X.v361 = {evItems: evItems, evItemsOut: evItemsOut, evCard: evCard, homeEv: homeEv, homeGl: homeGl, txTabs: txTabs, evActual: evActual, vEvent: vEvent};
})();
