if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['v361'] = '3.6.4';
/* Do it v3.6.4 - menu Plan dipecah (Event, Anggaran, Goals), Rutin masuk Transaksi, Event bertingkat
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
    'v361.plan.title': 'Rencana pengeluaran', 'v361.plan.add': 'Tambah rencana', 'v361.plan.edit': 'Ubah rencana', 'v361.plan.hint': 'Rencana tidak masuk jurnal. Isi seperti saat mencatat. Ketik 4*15000 di kolom jumlah untuk jumlah × harga.', 'v361.plan.empty': 'Belum ada rencana.', 'v361.real': 'Catat realisasi', 'v361.real.done': 'Tercatat', 'v361.real.title': 'Realisasi rencana', 'v361.plan.when': 'Tgl {0}',
    'v361.daily': 'Berulang harian', 'v361.daily.n': 'Jumlah hari', 'v361.daily.hint': 'Mulai = tanggal di atas. Jumlah di atas = jatah per hari.', 'v361.days': '{0} hari × {1}', 'v361.day.catat': 'Catat', 'v361.day.none': 'belum dicatat', 'v361.day.today': 'hari ini', 'v361.day.future': 'belum',
    'r.event': 'Laporan event', 'v361.r.pick': 'Pilih event', 'v361.r.none': 'Belum ada event. Buat dulu di menu Event.', 'v361.r.cat': 'Per kategori', 'v361.r.det': 'Rencana vs realisasi', 'v361.r.daily': 'Tabel harian', 'v361.r.out': 'Di luar rencana', 'v361.r.pend': 'Rencana belum direalisasikan', 'v361.r.plan': 'Rencana', 'v361.r.real': 'Realisasi', 'v361.r.diff': 'Selisih', 'v361.r.day': 'Hari', 'v361.r.quota': 'Jatah', 'v361.r.act': 'Aktual', 'v361.r.avg': 'Rata-rata per hari {0}', 'v361.r.proj': 'Proyeksi akhir {0}', 'v361.r.pdf': 'PDF', 'v361.r.open': 'Laporan', 'v361.r.cnt': 'Rencana tercatat {0} dari {1}, di luar rencana {2} transaksi', 'v361.tagsug': 'Tambah {0}', 'v361.r.pct': 'Terpakai', 'v361.r.total': 'Total', 'v364.k.id': 'Nama subkategori (Indonesia)', 'v364.k.id.ph': 'mis. Akomodasi', 'v364.k.en': 'Nama subkategori (Inggris)', 'v364.k.en.ph': 'e.g. Accommodation', 'v364.k.note': 'Isi dua bahasa agar nama ikut berganti saat bahasa aplikasi diubah. Cukup satu bahasa pun boleh.', 'v364.tr.t': 'Terjemahan nama', 'v364.tr.id': 'Indonesia', 'v364.tr.en': 'Inggris', 'v364.tr.save': 'Simpan terjemahan', 'v364.tr.ok': 'Terjemahan disimpan', 'v364.export': 'Ekspor', 'v364.exp.jpg': 'Gambar (JPG)', 'v364.exp.pdf': 'PDF', 'v364.exp.jpg.s': 'Bagikan sebagai gambar', 'v364.exp.pdf.s': 'Cetak atau simpan sebagai PDF'
  });
  I.add('en', {
    'pg.event': 'Events', 'pg.anggaran': 'Budget', 'pg.tujuan': 'Goals', 'v361.plan': 'Plan', 'v361.g.fin': 'Finance', 'v361.g.data': 'Data & system',
    'v361.tab.list': 'List', 'v361.tab.rutin': 'Recurring',
    'v361.items.hint': 'Fill in as much detail as you like. Store and item are optional. When filled, only transactions containing those words count toward the line.',
    'v361.toko': 'Store / source (optional)', 'v361.barang': 'Item (optional)', 'v361.qty': 'Quantity', 'v361.price': 'Unit price', 'v361.total': 'Total', 'v361.sum': 'Breakdown total',
    'v361.in': 'in {0} days', 'v361.on': 'Ongoing, day {0} of {1}', 'v361.on1': 'Ongoing, day {0}', 'v361.end': 'Ends in {0} days', 'v361.done': 'Finished', 'v361.today': 'Today',
    'v361.bud': 'Budget', 'v361.used': 'Spent', 'v361.left': 'Left', 'v361.over': 'Over', 'v361.out': 'Outside the plan', 'v361.whole': 'Whole category', 'v361.allsub': 'All subcategories',
    'v361.ev.all': 'See all ({0})', 'v361.ev.none': 'No events yet.', 'v361.gl.t': 'Goals', 'v361.ev.t': 'Event', 'v361.nobud': 'No budget', 'v361.tx': 'View {0} transactions',
    'v361.plan.title': 'Planned expense', 'v361.plan.add': 'Add plan', 'v361.plan.edit': 'Edit plan', 'v361.plan.hint': 'Plans do not enter the journal. Fill in like recording. Type 4*15000 in the amount for quantity × price.', 'v361.plan.empty': 'No plans yet.', 'v361.real': 'Record actual', 'v361.real.done': 'Recorded', 'v361.real.title': 'Record planned expense', 'v361.plan.when': 'On {0}',
    'v361.daily': 'Repeat daily', 'v361.daily.n': 'Number of days', 'v361.daily.hint': 'Start = the date above. Amount above = allowance per day.', 'v361.days': '{0} days × {1}', 'v361.day.catat': 'Record', 'v361.day.none': 'not recorded', 'v361.day.today': 'today', 'v361.day.future': 'upcoming',
    'r.event': 'Event report', 'v361.r.pick': 'Pick an event', 'v361.r.none': 'No events yet. Create one in the Event menu.', 'v361.r.cat': 'By category', 'v361.r.det': 'Plan vs actual', 'v361.r.daily': 'Daily table', 'v361.r.out': 'Outside the plan', 'v361.r.pend': 'Plans not yet recorded', 'v361.r.plan': 'Plan', 'v361.r.real': 'Actual', 'v361.r.diff': 'Difference', 'v361.r.day': 'Day', 'v361.r.quota': 'Allowance', 'v361.r.act': 'Actual', 'v361.r.avg': 'Average per day {0}', 'v361.r.proj': 'Projected end {0}', 'v361.r.pdf': 'PDF', 'v361.r.open': 'Report', 'v361.r.cnt': 'Plans recorded {0} of {1}, {2} transactions outside the plan', 'v361.tagsug': 'Add {0}', 'v361.r.pct': 'Used', 'v361.r.total': 'Total', 'v364.k.id': 'Subcategory name (Indonesian)', 'v364.k.id.ph': 'e.g. Akomodasi', 'v364.k.en': 'Subcategory name (English)', 'v364.k.en.ph': 'e.g. Accommodation', 'v364.k.note': 'Fill in both languages so the name follows the app language. One language is fine too.', 'v364.tr.t': 'Name translation', 'v364.tr.id': 'Indonesian', 'v364.tr.en': 'English', 'v364.tr.save': 'Save translation', 'v364.tr.ok': 'Translation saved', 'v364.export': 'Export', 'v364.exp.jpg': 'Image (JPG)', 'v364.exp.pdf': 'PDF', 'v364.exp.jpg.s': 'Share as an image', 'v364.exp.pdf.s': 'Print or save as PDF'
  });

  function frp(n) { return C.fmtRp(n); }
  function dayIso(n) { return new Date(n * 864e5).toISOString().substr(0, 10); }
  function sumBy(a, f) { return a.reduce(function (s, x) { return s + f(x); }, 0); }
  function dayNum(d) { return Math.round(Date.UTC(+d.substr(0, 4), +d.substr(5, 2) - 1, +d.substr(8, 2)) / 864e5); }
  function H() { return P.h; }
  function words(q, hay) { return String(q).toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) >= 0; }); }

  // ---------------------------------------------------------------- realisasi event bertingkat
  function evActual(e) {
    var tag = String(e.tag || '').toLowerCase().replace(/^#/, ''), items = (e.items || []).map(function (it, i) { return {i: i, it: it, real: 0, n: 0, days: {}, end: it.n && it.w ? dayIso(dayNum(it.w) + (+it.n) - 1) : '', sc: (it.k ? 1 : 0) + (it.s ? 1 : 0) + (it.b ? 1 : 0)}; });
    var out = {items: items, otherSub: {}, otherTot: 0, otherG: {}, total: 0, n: 0, byGrup: {}};
    if (!tag) return out;
    var xmap = {}; items.forEach(function (w) { if (w.it.x) xmap[String(w.it.x)] = w; });
    Object.keys(S.tx).forEach(function (id) {
      var x = S.tx[id]; if (x.Status !== 'Aktif' || x.Jenis !== 'Expense') return;
      var forced = xmap[id], tags = String(x.Tag || '').toLowerCase().split(/[\s,]+/).map(function (s) { return s.replace(/^#/, ''); }); if (!forced && tags.indexOf(tag) < 0) return;
      var txd = String(x.Waktu || '').substr(0, 10), toko = String(x.Toko || '').toLowerCase(), barang = String(x.Barang || '').toLowerCase(), amt = +x.Jumlah, best = null;
      items.forEach(function (w) {
        var it = w.it; if (it.g !== x.Kategori) return; if (w.end && (txd < it.w || txd > w.end)) return; if (it.k && it.k !== x.KodeAkun) return; if (it.s && !words(it.s, toko)) return; if (it.b && !words(it.b, barang)) return;
        if (!best || w.sc > best.sc) best = w;
      });
      if (forced) { best = forced; }
      out.total += amt; out.n++; out.byGrup[x.Kategori] = (out.byGrup[x.Kategori] || 0) + amt;
      if (best) { best.real += amt; best.n++; if (best.end) best.days[txd] = (best.days[txd] || 0) + amt; } else { out.otherTot += amt; out.otherG[x.Kategori] = (out.otherG[x.Kategori] || 0) + amt; out.otherSub[x.KodeAkun] = (out.otherSub[x.KodeAkun] || 0) + amt; }
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
          if (+it.n > 0) { sub = t('v361.days', it.n, C.fmtNum(it.per)) + (w.n ? ' · ' + w.n + 'x' : ''); ex = dailyTable(e, w); }
          body += row('', itemTitle(it), sub, w.real, +it.j || 0, 'evi2', ex);
        });
      });
      Object.keys(a.otherSub).forEach(function (k) { var sc = S.M.katByKode[k]; if (!sc || sc.Kategori !== g.nama) return; body += row('', subName(k), t('v361.out'), a.otherSub[k], 0, 'evo'); });
      return '<div class="evg"><button class="evgh" data-act="ev-tog" data-k="' + esc(key) + '" aria-expanded="' + (open ? 'true' : 'false') + '"><span class="gi sm">' + X.catIcon(g.nama) + '</span><span class="evgn">' + esc(dn(g.nama)) + '</span><b class="num">' + esc(C.fmtNum(g.real)) + (g.bud ? ' / ' + esc(C.fmtNum(g.bud)) : '') + '</b><i class="chev' + (open ? ' up' : '') + '"></i></button>' +
        (g.bud ? h.pbar(g.real / g.bud) : '') + (open ? '<div class="evb">' + body + '</div>' : '') + '</div>';
    }).join('');
    if (a.otherTot > 0 && gs.length) out += '<div class="evout muted sm">' + esc(t('v361.out')) + ': <b class="num out">' + esc(frp(a.otherTot)) + '</b></div>';
    return out + '<div style="margin-top:8px;display:flex;gap:14px"><button class="link" data-act="ev-lap" data-id="' + esc(e.id) + '">' + t('v361.r.open') + '</button><button class="link" data-act="ev-tx" data-id="' + esc(e.id) + '">' + t('v361.tx', a.n) + '</button></div></div>';
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
    return {a: nm, b: (r.s || r.b ? who : ''), c: [+r.n > 0 ? t('v361.days', r.n, C.fmtNum(r.per)) : (+r.q > 0 && +r.h > 0 ? C.fmtNum(r.q) + ' × ' + C.fmtNum(r.h) : ''), r.w ? t('v361.plan.when', C.fmtTgl(r.w)) : '', r.d || ''].filter(Boolean).join(' · ')};
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
      var pd = F._pd; if (pd && pd.on && +pd.n > 0) { o.n = +pd.n; o.per = +F.jumlah || 0; o.j = o.n * o.per; } else if (it && it.q && it.h && it.q * it.h === o.j) { o.q = it.q; o.h = it.h; }
      if (it && it.x) o.x = it.x;
      snap.d.items = snap.d.items || []; if (it) snap.d.items[idx] = o; else snap.d.items.push(o);
      back();
    }
    var init = {jenis: 'Expense', kodeAkun: it ? it.k : '', dompet: it ? it.d || '' : '', jumlah: it ? (+it.n > 0 ? +it.per || 0 : +it.j || 0) : 0, toko: it ? it.s || '' : '', barang: it ? it.b || '' : '', catatan: it ? it.c || '' : '', tag: evTag(snap.d), waktu: it && it.w ? it.w + 'T12:00' : ''};
    X.openForm(init, {planCb: cb, planBack: back, planTitle: t(it ? 'v361.plan.edit' : 'v361.plan.title'), pd: {on: !!(it && +it.n > 0), n: it && +it.n > 0 ? +it.n : 10}});
    var fx = X.saveFormRaw().FX; if (fx) { fx.more = true; X.renderForm(); }
  }
  function evItemsOut(items) {
    return (items || []).map(function (i) {
      var q = +i.q || 0, h = +i.h || 0, j = q > 0 && h > 0 ? q * h : (+i.j || 0);
      var o = {g: i.g, k: i.k || '', j: j}; ['s', 'b', 'd', 'w', 'c', 'x'].forEach(function (f) { if (String(i[f] || '').trim()) o[f] = String(i[f]).trim(); }); if (q > 0 && h > 0) { o.q = q; o.h = h; } if (+i.n > 0 && +i.per > 0) { o.n = +i.n; o.per = +i.per; o.j = o.n * o.per; delete o.q; delete o.h; } return o;
    }).filter(function (i) { return i.j > 0; });
  }
  // realisasi: buka formulir Catat sungguhan dari kartu event
  function realOpen(evId, idx, day) {
    var e = P.rc.list('event').filter(function (x) { return x.id === evId; })[0]; if (!e) return; var it = (e.items || [])[idx]; if (!it) return;
    X.openForm({jenis: 'Expense', kodeAkun: it.k || '', dompet: it.d || '', jumlah: day ? +it.per || 0 : +it.j || 0, toko: it.s || '', barang: it.b || '', catatan: it.c || '', tag: e.tag || evTag(e), waktu: day ? (day === C.todayLocal() ? C.nowLocal() : day + 'T12:00') : ''}, {planTitle: t('v361.real.title'), after: function (x) {
      if (day) return;
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


  // ---------------------------------------------------------------- terjemahan nama kategori/subkategori (disimpan di aplikasi, tersinkron lewat Rencana)
  var NMID = 'NAMA-KATEGORI', nmArr = null, NM = {}, dn0 = I.dn;
  function nmGet() {
    if (nmArr !== S.rencana) { nmArr = S.rencana; var r = (S.rencana || []).filter(function (x) { return x.Tipe === 'tampilan' && x.ID === NMID; })[0]; NM = (r && r.Data && r.Data.nm) || {}; }
    return NM;
  }
  I.dn = function (name) {
    if (name == null) return name; var m = nmGet()[String(name)], lang = I.get();
    if (m && m[lang]) return m[lang];
    return dn0(name);
  };
  function setNM(key, idn, en) {
    var all = Object.assign({}, nmGet()), cur = {}; if (String(idn || '').trim()) cur.id = String(idn).trim(); if (String(en || '').trim()) cur.en = String(en).trim();
    if (cur.id || cur.en) all[key] = cur; else delete all[key];
    return P.rc.save('tampilan', {nm: all}, NMID).then(function () { X.render(); }).catch(function (er) { X.toast(X.srvErr(er)); });
  }
  function trBlock(key) {
    var m = nmGet()[String(key)] || {};
    return '<div class="trblk"><label class="lbl2">' + t('v364.tr.t') + '</label><div class="eg2b"><input class="input" id="tr-id" placeholder="' + esc(t('v364.tr.id')) + '" value="' + esc(m.id || '') + '" autocomplete="off" maxlength="40"><input class="input" id="tr-en" placeholder="' + esc(t('v364.tr.en')) + '" value="' + esc(m.en || '') + '" autocomplete="off" maxlength="40"></div>' +
      '<div class="btnrow2" style="margin-top:8px"><button class="btn sm" data-act="tr-save" data-key="' + esc(key) + '">' + t('v364.tr.save') + '</button></div></div>';
  }

  // ---------------------------------------------------------------- tabel harian
  function wk(d) { try { return new Date(d + 'T00:00:00Z').toLocaleDateString(S.pref && S.pref.lang === 'en' ? 'en-GB' : 'id-ID', {weekday: 'short', timeZone: 'UTC'}); } catch (e) { return ''; } }
  function dayRows(w) {
    var it = w.it, today = C.todayLocal(), out = [];
    for (var i = 0; i < +it.n; i++) {
      var d = dayIso(dayNum(it.w) + i), act = w.days[d] || 0, q = +it.per || 0;
      out.push({i: i + 1, d: d, q: q, act: act, diff: q - act, st: d === today ? 'today' : (d > today ? 'future' : (act ? 'past' : 'none'))});
    }
    return out;
  }
  function dailyTable(e, w) {
    var rows = dayRows(w);
    return '<div class="evdaily"><div class="evdh"><span>' + t('v361.r.day') + '</span><span>' + t('v361.r.quota') + '</span><span>' + t('v361.r.act') + '</span><span></span></div>' + rows.map(function (r) {
      var lab = r.i + ' · ' + wk(r.d) + ' ' + C.fmtTgl(r.d).replace(/\s\d{4}$/, '');
      var st = r.st === 'today' ? '<span class="pst ok"><i></i>' + t('v361.day.today') + '</span>' : (r.st === 'none' ? '<small class="muted sm">' + t('v361.day.none') + '</small>' : '');
      return '<div class="evdr' + (r.st === 'today' ? ' now' : '') + '"><span>' + esc(lab) + (st ? '<br>' + st : '') + '</span><span class="num">' + esc(C.fmtNum(r.q)) + '</span><span class="num ' + (r.act > r.q ? 'out' : '') + '">' + esc(r.act ? C.fmtNum(r.act) : '-') + '</span>' +
        '<button class="link sm" data-act="ev-real" data-id="' + esc(e.id) + '" data-i="' + w.i + '" data-d="' + r.d + '">' + t('v361.day.catat') + '</button></div>';
    }).join('') + '</div>';
  }

  // ---------------------------------------------------------------- Laporan event
  function evModel(e) {
    var a = evActual(e), bud = evBudget(e), gs = evGroups(e, a), today = C.todayLocal(), m = {e: e, a: a, bud: bud, real: a.total, left: bud - a.total, gs: gs, pct: bud ? a.total / bud : 0, today: today};
    if (e.mulai && e.mulai <= today) {
      var last = e.selesai && e.selesai < today ? e.selesai : today, el = dayNum(last) - dayNum(e.mulai) + 1; m.avg = el > 0 ? a.total / el : 0;
      if (e.selesai && el >= 3) m.proj = m.avg * (dayNum(e.selesai) - dayNum(e.mulai) + 1);
      m.day = el;
    }
    m.phase = phaseText(e);
    m.nPlan = a.items.length; m.nDone = a.items.filter(function (w) { return w.it.x || (w.it.n ? w.real > 0 : w.real > 0); }).length;
    m.pend = a.items.filter(function (w) { return !w.it.n && !w.it.x && w.real === 0; });
    m.daily = a.items.filter(function (w) { return +w.it.n > 0; });
    m.other = Object.keys(a.otherSub).map(function (k) { var sc = S.M.katByKode[k] || {}; return {g: sc.Kategori || '', nama: subName(k) || k, v: a.otherSub[k]}; });
    return m;
  }
  function sgn(n) { return (n > 0 ? '+' : (n < 0 ? '-' : '')) + C.fmtNum(Math.abs(n)); }
  function repEvents() { return P.rc.list('event').filter(function (e) { return e.aktif !== false; }); }
  function repPick() {
    var evs = repEvents(), id = S.evRep, e = evs.filter(function (x) { return x.id === id; })[0];
    if (!e && evs.length) { var st = P.state('Semua').ev; e = (st[0] && st[0].e) || evs[0]; S.evRep = e.id; }
    return e;
  }
  function reportHTML(m, forPrint) {
    var h = H(), e = m.e, out = '';
    out += '<div class="card evrep"><div class="evrt"><b>' + esc(e.nama) + '</b><div class="muted sm">#' + esc(h.norm(e.tag)) + (e.mulai ? ' · ' + esc(C.fmtTgl(e.mulai)) + (e.selesai ? ' – ' + esc(C.fmtTgl(e.selesai)) : '') : '') + (m.phase ? ' · ' + esc(m.phase) : '') + '</div></div>' +
      '<div class="evstat"><div><small class="muted">' + t('v361.bud') + '</small><b class="num">' + esc(m.bud ? C.fmtNum(m.bud) : '-') + '</b></div><div><small class="muted">' + t('v361.r.real') + '</small><b class="num">' + esc(C.fmtNum(m.real)) + '</b></div><div><small class="muted">' + t(m.left < 0 && m.bud ? 'v361.over' : 'v361.left') + '</small><b class="num ' + (m.left < 0 && m.bud ? 'out' : 'in') + '">' + esc(m.bud ? C.fmtNum(Math.abs(m.left)) : '-') + '</b></div></div>' + (m.bud ? h.pbar(m.pct) : '') +
      '<div class="muted sm" style="margin-top:6px">' + [m.avg != null ? t('v361.r.avg', frp(Math.round(m.avg))) : '', m.proj != null ? t('v361.r.proj', frp(Math.round(m.proj))) : '', t('v361.r.cnt', m.nDone, m.nPlan, m.a.n - sumBy(m.a.items, function (w) { return w.n; }))].filter(Boolean).join('. ') + '</div></div>';
    if (m.gs.length) {
      var mx = 1; m.gs.forEach(function (g) { mx = Math.max(mx, g.bud, g.real); });
      out += '<div class="card"><h3 class="evh3">' + t('v361.r.cat') + '</h3>' + m.gs.map(function (g) {
        return '<div class="evbc"><div class="sr"><span>' + esc(dn(g.nama)) + '</span><b class="num">' + esc(C.fmtNum(g.real)) + (g.bud ? ' / ' + esc(C.fmtNum(g.bud)) : '') + '</b></div>' +
          (g.bud ? '<div class="evbb"><i class="pl" style="width:' + Math.round(g.bud / mx * 100) + '%"></i></div>' : '') + '<div class="evbb"><i class="' + (g.bud && g.real > g.bud ? 'bad' : 'ok') + '" style="width:' + Math.round(g.real / mx * 100) + '%"></i></div></div>';
      }).join('') + '<div class="muted sm" style="margin-top:6px"><span class="lg pl"></span>' + t('v361.r.plan') + ' <span class="lg ok"></span>' + t('v361.r.real') + '</div></div>';
      out += '<div class="card"><h3 class="evh3">' + t('v361.r.det') + '</h3><table class="rep evrp"><tr class="hdr"><th></th><th>' + t('v361.r.plan') + '</th><th>' + t('v361.r.real') + '</th><th class="evc4">' + t('v361.r.diff') + '</th></tr>' + m.gs.map(function (g) {
        var dg = g.bud - g.real, r = '<tr class="tot"><td>' + esc(dn(g.nama)) + (g.bud ? '<span class="evsd ' + (dg < 0 ? 'out' : 'in') + '">' + esc(sgn(dg)) + '</span>' : '') + '</td><td>' + esc(C.fmtNum(g.bud)) + '</td><td>' + esc(C.fmtNum(g.real)) + '</td><td class="evc4 ' + (dg < 0 ? 'out' : 'in') + '">' + esc(g.bud ? sgn(dg) : '') + '</td></tr>';
        g.subOrder.forEach(function (k) {
          var s = g.subs[k], ds = s.bud - s.real; r += '<tr class="sub"><td>' + esc(k ? subName(k) : t('v361.allsub')) + (s.bud ? '<span class="evsd ' + (ds < 0 ? 'out' : '') + '">' + esc(sgn(ds)) + '</span>' : '') + '</td><td>' + esc(C.fmtNum(s.bud)) + '</td><td>' + esc(C.fmtNum(s.real)) + '</td><td class="evc4">' + esc(s.bud ? sgn(ds) : '') + '</td></tr>';
          s.items.filter(function (w) { return w.it.s || w.it.b || w.it.w || w.it.c; }).forEach(function (w) { var sm = [w.it.w ? C.fmtTgl(w.it.w) : '', w.it.c || '', w.it.x ? t('v361.real.done') : ''].filter(Boolean).join(' · '); r += '<tr class="det"><td>' + esc(itemTitle(w.it)) + (sm ? '<small class="evsm">' + esc(sm) + '</small>' : '') + '</td><td>' + esc(C.fmtNum(w.it.j)) + '</td><td>' + esc(C.fmtNum(w.real)) + '</td><td class="evc4"></td></tr>'; });
        });
        return r;
      }).join('') + '</table></div>';
    }
    m.daily.forEach(function (w) {
      var rows = dayRows(w), tq = sumBy(rows, function (r) { return r.q; }), ta = sumBy(rows, function (r) { return r.act; });
      out += '<div class="card"><h3 class="evh3">' + t('v361.r.daily') + ': ' + esc(itemTitle(w.it)) + '</h3><div class="muted sm" style="margin-bottom:4px">' + t('v361.days', w.it.n, C.fmtNum(w.it.per)) + '</div><table class="rep evrp"><tr class="hdr"><th>' + t('v361.r.day') + '</th><th>' + t('v361.r.quota') + '</th><th>' + t('v361.r.act') + '</th><th>' + t('v361.r.diff') + '</th></tr>' +
        rows.map(function (r) { var fut = r.st === 'future'; return '<tr class="' + (fut ? 'muted' : '') + '"><td>' + r.i + ' · ' + esc(wk(r.d) + ' ' + C.fmtTgl(r.d).replace(/\s\d{4}$/, '')) + (r.st === 'today' ? ' *' : '') + '</td><td>' + esc(C.fmtNum(r.q)) + '</td><td>' + esc(r.act ? C.fmtNum(r.act) : (fut ? '' : '-')) + '</td><td class="' + (r.diff < 0 ? 'out' : 'in') + '">' + esc(fut ? '' : sgn(r.diff)) + '</td></tr>'; }).join('') +
        '<tr class="tot"><td>' + t('v361.r.total') + '</td><td>' + esc(C.fmtNum(tq)) + '</td><td>' + esc(C.fmtNum(ta)) + '</td><td>' + esc(sgn(tq - ta)) + '</td></tr></table></div>';
    });
    if (m.other.length) out += '<div class="card"><h3 class="evh3">' + t('v361.r.out') + '</h3><table class="rep evrp">' + m.other.map(function (o) { return '<tr><td>' + esc((o.g ? dn(o.g) + ' › ' : '') + o.nama) + '</td><td>' + esc(C.fmtNum(o.v)) + '</td></tr>'; }).join('') + '</table></div>';
    if (m.pend.length) out += '<div class="card"><h3 class="evh3">' + t('v361.r.pend') + '</h3><table class="rep evrp">' + m.pend.map(function (w) { return '<tr><td>' + esc(itemTitle(w.it) + (w.it.w ? ' · ' + C.fmtTgl(w.it.w) : '')) + '</td><td>' + esc(C.fmtNum(w.it.j)) + '</td></tr>'; }).join('') + '</table></div>';
    return out;
  }
  function evRender() {
    var evs = repEvents(); if (!evs.length) return '<div class="card"><div class="empty">' + t('v361.r.none') + '</div></div>';
    var e = repPick(), m = evModel(e);
    return '<div class="chips" style="margin:0 0 10px">' + evs.map(function (x) { return '<button class="chip sm' + (x.id === e.id ? ' on' : '') + '" data-act="ev-rpick" data-id="' + esc(x.id) + '">' + esc(x.nama) + '</button>'; }).join('') + '</div>' + reportHTML(m);
  }
  function evDoc() {
    var e = repPick(), b = [], m, today = C.todayLocal(); if (!e) return {title: t('r.event'), sub: '', blocks: [{k: 'text', l: t('v361.r.none')}], foot: 'Do it · ' + C.fmtTgl(today)};
    m = evModel(e);
    b.push({k: 'prog', l: t('v361.r.real'), r: frp(m.real) + (m.bud ? ' / ' + frp(m.bud) : ''), pct: m.pct, c: m.pct > 1 ? 'out' : (m.pct >= 0.8 ? 'warn' : 'in'), s: [m.bud ? t(m.left < 0 ? 'v361.over' : 'v361.left') + ' ' + frp(Math.abs(m.left)) : '', m.avg != null ? t('v361.r.avg', frp(Math.round(m.avg))) : '', m.proj != null ? t('v361.r.proj', frp(Math.round(m.proj))) : ''].filter(Boolean).join(' · ')});
    if (m.gs.length) {
      b.push({k: 'gap'}); b.push({k: 'head', l: t('v361.r.cat'), r: ''});
      m.gs.forEach(function (g) { b.push({k: 'prog', l: dn(g.nama), r: C.fmtNum(g.real) + (g.bud ? ' / ' + C.fmtNum(g.bud) : ''), pct: g.bud ? g.real / g.bud : 0, c: g.bud && g.real > g.bud ? 'out' : 'in', s: g.bud ? sgn(g.bud - g.real) : ''}); });
      b.push({k: 'gap'}); b.push({k: 'head', l: t('v361.r.det'), r: ''}); b.push({k: 'cols', hdr: true, l: '', cols: [t('v361.r.plan'), t('v361.r.real'), t('v361.r.diff')]});
      m.gs.forEach(function (g) {
        b.push({k: 'cols', tot: true, l: dn(g.nama), cols: [C.fmtNum(g.bud), C.fmtNum(g.real), g.bud ? sgn(g.bud - g.real) : ''], cc: ['', '', g.bud - g.real < 0 ? 'out' : 'in']});
        g.subOrder.forEach(function (k) { var s = g.subs[k]; b.push({k: 'cols', b: true, ind: true, l: k ? subName(k) : t('v361.allsub'), cols: [C.fmtNum(s.bud), C.fmtNum(s.real), s.bud ? sgn(s.bud - s.real) : ''], cc: ['', '', s.bud - s.real < 0 ? 'out' : '']}); });
      });
    }
    m.daily.forEach(function (w) {
      var rows = dayRows(w); b.push({k: 'gap'}); b.push({k: 'head', l: t('v361.r.daily') + ': ' + itemTitle(w.it), r: ''}); b.push({k: 'cols', hdr: true, l: t('v361.r.day'), cols: [t('v361.r.quota'), t('v361.r.act'), t('v361.r.diff')]});
      rows.forEach(function (r) { var fut = r.st === 'future'; b.push({k: 'cols', ind: true, l: r.i + ' · ' + wk(r.d) + ' ' + C.fmtTgl(r.d).replace(/\s\d{4}$/, ''), cols: [C.fmtNum(r.q), r.act ? C.fmtNum(r.act) : (fut ? '' : '-'), fut ? '' : sgn(r.diff)], cc: ['', '', r.diff < 0 ? 'out' : 'in']}); });
    });
    if (m.other.length) { b.push({k: 'gap'}); b.push({k: 'head', l: t('v361.r.out'), r: ''}); m.other.forEach(function (o) { b.push({k: 'row', ind: true, l: (o.g ? dn(o.g) + ' › ' : '') + o.nama, r: C.fmtNum(o.v)}); }); }
    if (m.pend.length) { b.push({k: 'gap'}); b.push({k: 'head', l: t('v361.r.pend'), r: ''}); m.pend.forEach(function (w) { b.push({k: 'row', ind: true, l: itemTitle(w.it) + (w.it.w ? ' · ' + C.fmtTgl(w.it.w) : ''), r: C.fmtNum(w.it.j)}); }); }
    return {title: e.nama, sub: '#' + H().norm(e.tag) + (e.mulai ? ' · ' + C.fmtTgl(e.mulai) + (e.selesai ? ' – ' + C.fmtTgl(e.selesai) : '') : ''), blocks: b, foot: 'Do it · ' + C.fmtTgl(today)};
  }
  function docHTML(doc) {
    var o = '<div class="pdoc"><div class="pdt">' + esc(doc.title || '') + '</div>' + (doc.sub ? '<div class="pds">' + esc(doc.sub) + '</div>' : '');
    function cl(c) { return c === 'out' ? ' out' : (c === 'in' ? ' in' : (c === 'warn' ? ' warn' : (c === 'muted' ? ' muted' : ''))); }
    (doc.blocks || []).forEach(function (b) {
      if (b.k === 'gap') { o += '<div class="pdg"></div>'; return; }
      if (b.k === 'head') { o += '<div class="pdh"><span>' + esc(b.l) + '</span><b>' + esc(b.r == null ? '' : b.r) + '</b></div>'; return; }
      if (b.k === 'text') { o += '<p class="pdx">' + esc(b.l) + '</p>'; return; }
      if (b.k === 'prog') { var pc = Math.max(0, Math.min(1, b.pct || 0)); o += '<div class="pdp"><div class="pdr"><span>' + esc(b.l) + '</span><b class="' + cl(b.c) + '">' + esc(b.r || '') + '</b></div><div class="pdb"><i class="' + cl(b.c) + '" style="width:' + Math.round(pc * 100) + '%"></i></div>' + (b.s ? '<div class="pds">' + esc(b.s) + '</div>' : '') + '</div>'; return; }
      if (b.k === 'cols') { var cs = b.cols || [], cc = b.cc || []; o += '<div class="pdc' + (b.hdr ? ' hdr' : '') + (b.tot ? ' tot' : '') + (b.b ? ' bd' : '') + (b.ind ? ' ind' : '') + '"><span>' + esc(b.l) + '</span>' + cs.map(function (c, i) { return '<span class="n' + cl(cc[i]) + '">' + esc(c) + '</span>'; }).join('') + '</div>'; return; }
      if (b.k === 'bars') { o += '<div class="pdc hdr"><span></span><span class="n">' + esc(b.la || '') + '</span><span class="n">' + esc(b.lb || '') + '</span><span></span></div>' + (b.series || []).map(function (s) { return '<div class="pdc"><span>' + esc(s.l) + '</span><span class="n">' + esc(C.fmtNum(s.a || 0)) + '</span><span class="n">' + esc(C.fmtNum(s.b || 0)) + '</span><span></span></div>'; }).join(''); return; }
      o += '<div class="pdr' + (b.k === 'total' ? ' tot' : '') + (b.b ? ' bd' : '') + (b.ind ? ' ind' : '') + '"><span>' + esc(b.l) + '</span><b class="' + cl(b.c) + '">' + esc(b.r == null ? '' : b.r) + '</b></div>';
    });
    return o + '<div class="prtf">' + esc(doc.foot || '') + '</div></div>';
  }
  function printDoc(doc) {
    var root = document.getElementById('printroot');
    if (!root) { root = document.createElement('div'); root.id = 'printroot'; document.body.appendChild(root); }
    root.innerHTML = '<div class="prt">' + docHTML(doc) + '</div>';
    document.body.classList.add('printing');
    function done() { document.body.classList.remove('printing'); root.innerHTML = ''; window.removeEventListener('afterprint', done); }
    window.addEventListener('afterprint', done); setTimeout(function () { try { window.print(); } catch (er) { done(); } }, 60);
  }
  function printPDF() { printDoc(X.repDoc()); }
  function exportSheet() {
    var tile = function (act, ico, ttl, sub) { return '<button class="exr tap" data-act="' + act + '"><span class="gi">' + ico + '</span><span class="ext"><b>' + t(ttl) + '</b><small class="muted sm">' + t(sub) + '</small></span></button>'; };
    $('#overlay').innerHTML = '<div class="scrim" data-act="ov-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + t('v364.export') + '</div><button class="x" data-act="ov-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div><div class="sheet-b">' +
      tile('rep-exp-jpg', ICON.share, 'v364.exp.jpg', 'v364.exp.jpg.s') + tile('rep-exp-pdf', ICON.list, 'v364.exp.pdf', 'v364.exp.pdf.s') + '</div></div>';
  }
  X.repKinds.event = {render: evRender, doc: evDoc, period: false, dim: false, label: function () { var e = repPick(); return e ? e.nama : ''; }};

  // ---------------------------------------------------------------- saran tag event di form Catat
  function tagSug(f) {
    if (!f || f.jenis !== 'Expense') return '';
    var d = String(f.waktu || '').substr(0, 10) || C.todayLocal(), have = String(f.tag || '').toLowerCase();
    var evs = repEvents().filter(function (e) { return e.mulai && e.mulai <= d && (!e.selesai || e.selesai >= d) && e.tag && have.indexOf(String(e.tag).toLowerCase()) < 0; });
    if (!evs.length) return '';
    return '<div class="chips" style="margin-top:8px">' + evs.map(function (e) { return '<button class="chip sm" data-act="f-sug" data-field="tag" data-v="' + esc(e.tag) + '">+ ' + esc(e.tag) + '</button>'; }).join('') + '</div>';
  }
  // ---------------------------------------------------------------- form rencana: saklar berulang harian
  function pdBlock(pd) {
    pd = pd || {on: false, n: 10};
    return '<div class="pdblk"><button class="tog' + (pd.on ? ' on' : '') + '" data-act="pd-tog"><i></i><span>' + t('v361.daily') + '</span></button>' + (pd.on ? '<label class="lbl2">' + t('v361.daily.n') + '</label><input class="input" inputmode="numeric" data-pdn="1" value="' + esc(pd.n || '') + '" autocomplete="off"><div class="muted sm" style="margin:4px 2px 0">' + t('v361.daily.hint') + '</div>' : '') + '</div>';
  }
  document.addEventListener('input', function (e) {
    var el = e.target; if (!el || !el.dataset || !el.dataset.pdn) return; var fx = X.saveFormRaw().FX; if (!fx || !fx.pd) return;
    var dg = el.value.replace(/\D/g, '').substr(0, 3); el.value = dg; fx.pd.n = dg ? Number(dg) : 0;
  });

  Object.assign(A, {
    'pd-tog': function () { var fx = X.saveFormRaw().FX; if (!fx || !fx.pd) return; fx.pd.on = !fx.pd.on; X.renderForm(); },
    'ev-lap': function (el) { S.rep = S.rep || {}; S.rep.kind = 'event'; S.evRep = el.dataset.id; X.setTab('laporan'); },
    'ev-rpick': function (el) { S.evRep = el.dataset.id; X.render(); },
        'tr-save': function (el) { var a = $('#tr-id'), b = $('#tr-en'); setNM(el.dataset.key, a && a.value, b && b.value).then(function () { X.toast(t('v364.tr.ok')); }); },
    'rep-export': exportSheet,
    'rep-exp-jpg': function () { X.closeOverlays(); A['rep-share'](); },
    'rep-exp-pdf': function () { X.closeOverlays(); printPDF(); },
    'ev-padd': function () { planOpen(-1); },
    'ev-pedit': function (el) { planOpen(+el.dataset.i); },
    'ev-real': function (el) { realOpen(el.dataset.id, +el.dataset.i, el.dataset.d); },
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

  X.v361 = {setNM: setNM, trBlock: trBlock, printDoc: printDoc, docHTML: docHTML, tagSug: tagSug, pdBlock: pdBlock, evModel: evModel, dayRows: dayRows, printPDF: printPDF, evItems: evItems, evItemsOut: evItemsOut, evCard: evCard, homeEv: homeEv, homeGl: homeGl, txTabs: txTabs, evActual: evActual, vEvent: vEvent};
})();
