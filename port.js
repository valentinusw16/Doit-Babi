if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['port'] = '3.2.0';
/* Do it v2.1 - Portofolio: semua aset dari pembukuan + nilai terkini.
   - Kas: nilai = saldo buku.
   - Investasi (wadah): isi per emiten/produk (lot, harga rata-rata) + sisa kas; deposito/SBN dihitung dari bunga.
   - Nilai manual: tanah, bangunan, dll. diperbarui manual.
   - Penyusutan: elektronik, kendaraan; jadwal bulanan berupa kartu jatuh tempo (Beban Depresiasi).
   Selisih nilai terkini vs buku dicatat ke Laba Rugi (Untung/Rugi Belum Terealisasi) SETELAH dikonfirmasi. */
(function () {
  'use strict';
  var X = window.DoIt, S = X.S, C = X.C, C2 = X.C2, t = X.t, esc = X.esc, $ = X.$, ICON = X.ICON, A = X.A, rc = X.rc, dn = X.dn;
  var fm = function (n) { return C.fmtRp(n); };
  var KELAS = ['saham', 'emas', 'reksadana', 'sbn', 'deposito', 'kripto', 'lainnya'], FIXED = {sbn: 1, deposito: 1};
  var MODES = ['kas', 'wadah', 'manual', 'susut'];
  var PF = null;
  function sgn(n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + fm(Math.abs(n)); }
  function cls(n) { return n > 0 ? 'in' : (n < 0 ? 'out' : ''); }
  function pctT(p) { return (p > 0 ? '+' : '') + (p * 100).toFixed(1).replace('.', S.pref.lang === 'en' ? '.' : ',') + '%'; }
  /** Angka dari isian: "1.250.000" / "1250000" / "2,5" / "2.5" / "1.250,75". */
  function num(v) {
    var x = String(v == null ? '' : v).trim().replace(/\s|rp/gi, ''); if (x === '') return NaN;
    if (x.indexOf(',') >= 0) x = x.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(x)) x = x.replace(/\./g, '');
    var n = Number(x); return isFinite(n) ? n : NaN;
  }
  function today() { return C.todayLocal(); }
  function mult(a) { return a.kelas === 'saham' ? 100 : 1; }
  function unitTxt(a, u) { return a.kelas === 'saham' ? t('po.lot', C.fmtNum(Math.round(u / 100 * 100) / 100)) : (a.kelas === 'emas' ? t('po.gram', String(Math.round(u * 1000) / 1000).replace('.', ',')) : String(Math.round(u * 10000) / 10000).replace('.', ',') + ' ' + t('po.unit')); }

  // ---------------------------------------------------------------- data
  function akunRecs() { var m = {}; rc.list('akun').forEach(function (r) { m[r.dompet] = r; }); return m; }
  function holdings(dompet) { return rc.list('aset').filter(function (a) { return a.aktif !== false && (!dompet || a.akun === dompet); }); }
  function lots() { return rc.list('lot'); }
  function kelOf(d) { var a = S.M.akun[d.KodeAkun]; return a ? a.Kelompok : ''; }
  function defMode(kel) { return kel === 'Kas' ? 'kas' : kel === 'Investasi' ? 'wadah' : /elektronik|kendaraan/i.test(kel) ? 'susut' : 'manual'; }
  function modeOf(d, ar) { var r = (ar || akunRecs())[d.Nama]; return r && r.mode ? r.mode : defMode(kelOf(d)); }
  function bookMap() { var m = {}; C.walletBalances(X.getLines(), S.M, null).forEach(function (w) { m[w.nama] = w.saldo; }); return m; }
  function revalSum(dompet) {
    var s = 0; Object.keys(S.tx).forEach(function (k) { var x = S.tx[k]; if (x.Status === 'Aktif' && x.Dompet === dompet && X.isNonOp(x.KodeAkun)) s += (x.Jenis === 'Income' ? 1 : -1) * (+x.Jumlah); }); return s;
  }
  /** Nilai terkini satu akun: {buku, nilai, kas, isi:[{aset,pos}], mode, rec}. */
  function valueOf(d, book, ar, L) {
    ar = ar || akunRecs(); var mode = modeOf(d, ar), rec = ar[d.Nama] || {}, out = {buku: book, nilai: book, mode: mode, rec: rec, isi: []};
    if (mode === 'manual' && rec.nilai != null && rec.nilai !== '') out.nilai = +rec.nilai;
    if (mode === 'wadah') {
      var hs = holdings(d.Nama), ls = L || lots(), td = today();
      if (hs.length) {
        var cost = 0, proceeds = 0, val = 0;
        hs.forEach(function (a) {
          var p = C2.position(a, ls, td); out.isi.push({aset: a, pos: p}); val += p.nilai;
          if (C2.isFixed(a)) { if (a.fix.mulai <= td) cost += +a.fix.pokok; if (a.cair) proceeds += +a.cair.nilai || 0; }
          else ls.forEach(function (l) { if (l.asetId !== a.id) return; var g = (+l.unit) * (+l.harga); if (l.jenis === 'beli') cost += g + (+l.biaya || 0); else proceeds += g - (+l.biaya || 0); });
        });
        var auto = book - revalSum(d.Nama) - cost + proceeds;
        out.kasAuto = Math.round(auto); out.kas = rec.kas != null && rec.kas !== '' ? +rec.kas : out.kasAuto;
        out.nilai = Math.round(out.kas + val);
      } else if (rec.nilai != null && rec.nilai !== '') out.nilai = +rec.nilai;
    }
    out.selisih = Math.round(out.nilai - book);
    return out;
  }
  function allAccounts(owner) {
    var ar = akunRecs(), bm = bookMap(), L = lots(), rows = [];
    Object.keys(S.M.dompet).forEach(function (n) {
      var d = S.M.dompet[n], a = S.M.akun[d.KodeAkun];
      if (!a || a.Tipe !== 'Aset' || (owner && owner !== 'Semua' && d.Pemilik !== owner)) return;
      var b = bm[n] != null ? bm[n] : 0; if (!d.Aktif && Math.abs(b) < 1) return;
      rows.push(Object.assign({d: d, kel: a.Kelompok}, valueOf(d, b, ar, L)));
    });
    return rows;
  }

  // ---------------------------------------------------------------- jurnal selisih (dengan konfirmasi)
  function nonopKat(jenis) { return S.M.kategori.filter(function (k) { return k.Jenis === jenis && k.Kategori === X.NONOP_G; })[0]; }
  function canBook(d) { return d.Pemilik === S.cfg.user; }
  function askReval(nama) {
    var d = S.M.dompet[nama]; if (!d) return;
    var v = valueOf(d, bookMap()[nama] || 0);
    if (Math.abs(v.selisih) < 1 || !canBook(d) || v.mode === 'kas' || v.mode === 'susut') { X.render(); return; }
    X.closeOverlays();
    $('#overlay2').innerHTML = '<div class="scrim" data-act="pick-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + t('rv.title') + '</div></div><div class="sheet-b"><p style="margin:2px 0 10px">' + esc(t('rv.q', sgn(v.selisih), nama)) + '</p>' +
      '<div class="card"><dl class="dl"><dt>' + t('rv.book') + '</dt><dd>' + esc(fm(v.buku)) + '</dd><dt>' + t('rv.now') + '</dt><dd>' + esc(fm(v.nilai)) + '</dd><dt>' + t('rv.diff') + '</dt><dd class="' + cls(v.selisih) + '">' + esc(sgn(v.selisih)) + '</dd></dl></div>' +
      '<div class="note">' + t(v.selisih > 0 ? 'rv.note.up' : 'rv.note.down') + '</div></div>' +
      '<div class="sheet-f btnrow2"><button class="btn" data-act="pick-close">' + t('rv.later') + '</button><button class="btn primary" data-act="rv-book" data-v="' + esc(nama) + '">' + t('rv.book.btn') + '</button></div></div>';
  }
  function bookReval(nama) {
    var d = S.M.dompet[nama], v = valueOf(d, bookMap()[nama] || 0), up = v.selisih > 0, k = nonopKat(up ? 'Income' : 'Expense');
    if (!k) { X.toast(t('rv.nokat')); return; }
    var F = X.newForm({waktu: C.nowLocal(), jenis: up ? 'Income' : 'Expense', dompet: nama, kodeAkun: k.KodeAkun, jumlah: Math.abs(v.selisih), catatan: t('rv.memo', fm(v.nilai))});
    try {
      var x = C.makeTx(F, S.cfg.user, S.M, S.tx, {}); x._pending = true; S.tx[x.ID] = x;
      X.enqueue({action: 'tambah', body: {tx: C.toPayload(F)}}); X.closePicker(); X.touch(); X.render(); X.toast(t('rv.done')); X.syncNow();
    } catch (e) { X.toast(X.L.tErr(e.message)); }
  }
  function pendingBox(rows) {
    var p = rows.filter(function (r) { return Math.abs(r.selisih) >= 1 && (r.mode === 'wadah' || r.mode === 'manual'); });
    if (!p.length) return '';
    return '<div class="card pend"><div class="ah"><span class="gi">' + ICON.alert + '</span><span>' + t('rv.pending', p.length) + '</span></div>' + p.map(function (r) {
      return '<div class="row"><div class="grow"><div class="t">' + esc(r.d.Nama) + '</div><div class="s">' + esc(t('rv.line', fm(r.buku), fm(r.nilai))) + '</div></div><div class="a ' + cls(r.selisih) + '">' + esc(sgn(r.selisih)) + '</div>' +
        (canBook(r.d) ? '<button class="btn sm" data-act="rv-ask" data-v="' + esc(r.d.Nama) + '">' + t('rv.book.short') + '</button>' : '<small class="muted">' + esc(r.d.Pemilik) + '</small>') + '</div>';
    }).join('') + '</div>';
  }

  // ---------------------------------------------------------------- halaman Portofolio
  function vPort(p) {
    var rows = allAccounts(S.owner), view = S.poView || 'akun', h = ''; X.ownerChips(S.owner, 'owner');
    var tot = rows.reduce(function (a, r) { a.n += r.nilai; a.b += r.buku; return a; }, {n: 0, b: 0});
    h += '<div class="card hero"><div class="lbl">' + t('po.value') + '</div><div class="big">' + esc(fm(tot.n)) + '</div><div class="sub2">' + esc(t('po.bookline', fm(tot.b))) + (Math.abs(tot.n - tot.b) >= 1 ? ' · <span class="' + cls(tot.n - tot.b) + '">' + esc(t('po.unbooked', sgn(tot.n - tot.b))) + '</span>' : '') + '</div></div>';
    var by = {}; rows.forEach(function (r) { if (r.nilai > 0) by[r.kel] = (by[r.kel] || 0) + r.nilai; });
    var gs = Object.keys(by).map(function (k) { return {nama: dn(k), total: by[k]}; }).sort(function (a, b) { return b.total - a.total; });
    if (gs.length) h += '<div class="card"><div class="ch">' + t('po.alloc') + '</div><div class="donutrow">' + X.donut(gs, tot.n, t('po.total')) + X.legend(gs, tot.n) + '</div></div>';
    h += pendingBox(rows);
    var anyIsi = holdings().length;
    h += '<div class="btnrow"><button class="btn" data-act="w-open">' + ICON.plus + t('as.add') + '</button>' + '<button class="hb" data-act="po-share" aria-label="' + t('jpg.share') + '">' + ICON.share + '</button></div>';
    if (anyIsi) h += '<div class="seg" style="margin-bottom:10px">' + [['akun', 'po.v.akun'], ['emiten', 'po.v.emiten']].map(function (x) { return '<button class="' + (view === x[0] ? 'on' : '') + '" data-act="po-view" data-v="' + x[0] + '">' + t(x[1]) + '</button>'; }).join('') + '</div>';
    if (view === 'emiten' && anyIsi) return h + vEmiten();
    var grp = {}; rows.forEach(function (r) { (grp[r.kel] = grp[r.kel] || []).push(r); });
    Object.keys(grp).sort(function (a, b) { return (by[b] || 0) - (by[a] || 0); }).forEach(function (k) {
      var list = grp[k].sort(function (a, b) { return b.nilai - a.nilai; }), tt = list.reduce(function (s, r) { return s + r.nilai; }, 0);
      h += '<div class="card agrp' + (p && p.extra === k ? ' hl' : '') + '" id="g-' + esc(k.replace(/\W/g, '')) + '"><div class="ah"><span>' + esc(dn(k)) + '</span><b>' + esc(fm(tt)) + '</b></div>' + list.map(function (r) {
        var dif = Math.abs(r.selisih) >= 1 && r.mode !== 'kas' && r.mode !== 'susut';
        return '<div class="row tap" data-act="asset" data-v="' + esc(r.d.KodeAkun) + '"><div class="grow"><div class="t">' + esc(r.d.Nama) + '</div><div class="s">' + esc(r.d.Pemilik + ' · ' + t('po.m.' + r.mode) + (r.isi.length ? ' · ' + t('po.n.isi', r.isi.length) : '')) + '</div></div>' +
          '<div class="a">' + esc(fm(r.nilai)) + (dif ? '<small class="' + cls(r.selisih) + '">' + esc(sgn(r.selisih)) + '</small>' : '') + '</div>' + ICON.chev + '</div>';
      }).join('') + '</div>';
    });
    return h + '<div class="note">' + t('po.note21') + '</div>';
  }
  function vEmiten() {
    var ls = lots(), td = today(), m = {};
    holdings().forEach(function (a) {
      var w = S.M.dompet[a.akun]; if (S.owner !== 'Semua' && w && w.Pemilik !== S.owner) return;
      var key = (a.kode || a.nama).toUpperCase(), p = C2.position(a, ls, td), r = m[key] || (m[key] = {nama: a.kode || a.nama, kelas: a.kelas, unit: 0, modal: 0, nilai: 0, real: 0, akun: [], a: a});
      r.unit += p.unit; r.modal += p.modal; r.nilai += p.nilai; r.real += p.realisasi; if (r.akun.indexOf(a.akun) < 0) r.akun.push(a.akun);
    });
    var rows = Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return b.nilai - a.nilai; });
    if (!rows.length) return '<div class="card"><div class="empty">' + t('po.empty') + '</div></div>';
    return '<div class="card">' + rows.map(function (r) {
      var u = r.nilai - r.modal;
      return '<div class="row"><div class="ico">' + ICON.pie + '</div><div class="grow"><div class="t">' + esc(r.nama) + '</div><div class="s">' + esc((C2.isFixed(r.a) ? t('po.k.' + r.kelas) : unitTxt(r.a, r.unit)) + ' · ' + r.akun.join(', ')) + '</div></div>' +
        '<div class="a">' + esc(fm(r.nilai)) + '<small class="' + cls(u) + '">' + esc(r.modal ? sgn(u) + ' · ' + pctT(u / r.modal) : '') + '</small></div></div>';
    }).join('') + '</div>';
  }
  X.pages.portfolio = {title: function () { return t('pg.portfolio'); }, render: vPort};

  // ---------------------------------------------------------------- halaman akun (kait ke vAsset)
  X.hooks.assetHero = function (kode, d, book) {
    if (!d) return '';
    var v = valueOf(d, book);
    if (v.mode === 'kas' || v.mode === 'susut' || Math.abs(v.selisih) < 1) return '<div class="sub2">' + esc(t('po.m.' + v.mode)) + '</div>';
    return '<div class="sub2">' + esc(t('po.nowval', fm(v.nilai))) + ' · <span class="' + cls(v.selisih) + '">' + esc(sgn(v.selisih)) + '</span></div>';
  };
  X.hooks.assetTop = function (kode, d, book) {
    if (!d) return '';
    var v = valueOf(d, book), h = '<div class="ddrow" style="margin-bottom:10px"><span class="muted sm">' + t('po.mode') + '</span>' + X.dd(t('po.m.' + v.mode), 'pomode', 'po-mode', v.mode) + '</div>';
    S._poAcc = d.Nama;
    if (v.mode === 'wadah') h += wadahBlock(d, v);
    else if (v.mode === 'manual') h += manualBlock(d, v);
    else if (v.mode === 'susut') h += susutBlock(d, book);
    if ((v.mode === 'wadah' || v.mode === 'manual') && Math.abs(v.selisih) >= 1) h += canBook(d) ? '<button class="card tap pend1" data-act="rv-ask" data-v="' + esc(d.Nama) + '"><span>' + esc(t('rv.pend1', sgn(v.selisih))) + '</span><b>' + t('rv.book.short') + '</b></button>' : '<div class="note">' + esc(t('rv.other', d.Pemilik)) + '</div>';
    return h;
  };
  X.ddOpts = X.ddOpts || {};
  X.ddOpts.pomode = function () { return {title: t('po.mode'), opts: MODES.map(function (m) { return {v: m, l: t('po.m.' + m)}; })}; };
  function wadahBlock(d, v) {
    var h = '<div class="card">';
    if (!v.isi.length) h += '<div class="muted sm">' + t('po.wadah.empty') + '</div>';
    else {
      h += v.isi.map(function (r) {
        var a = r.aset, p = r.pos, fx = C2.isFixed(a);
        return '<div class="row tap" data-act="po-open" data-id="' + esc(a.id) + '"><div class="ico">' + ICON.pie + '</div><div class="grow"><div class="t">' + esc(a.kode || a.nama) + (p.aktif ? '' : '<span class="tag">' + t('po.closed') + '</span>') + '</div>' +
          '<div class="s">' + esc(fx ? t('po.fixed.s', a.fix.bunga, a.fix.tempo ? C.fmtTgl(a.fix.tempo) : '-') : unitTxt(a, p.unit) + ' · ' + C.fmtNum(a.harga || 0)) + '</div></div>' +
          '<div class="a">' + esc(fm(p.nilai)) + '<small class="' + cls(p.untung) + '">' + esc(p.modal ? sgn(p.untung) + ' · ' + pctT(p.pct || 0) : '') + '</small></div></div>';
      }).join('');
      h += '<div class="row tap" data-act="po-kas"><div class="ico">' + ICON.wallet + '</div><div class="grow"><div class="t">' + t('po.kas') + '</div><div class="s">' + esc(v.rec.kas != null && v.rec.kas !== '' ? t('po.kas.manual') : t('po.kas.auto')) + '</div></div><div class="a">' + esc(fm(v.kas)) + '</div></div>';
    }
    h += '</div><div class="btnrow"><button class="btn" data-act="po-new">' + ICON.plus + t('po.add.isi') + '</button>' + (v.isi.some(function (r) { return !C2.isFixed(r.aset) && r.pos.unit > 0; }) ? '<button class="btn primary" data-act="po-prices">' + t('po.upd.all') + '</button>' : '') +
      (!v.isi.length ? '<button class="btn" data-act="po-manual">' + t('po.setval') + '</button>' : '') + '</div>';
    return h;
  }
  function manualBlock(d, v) {
    var rec = v.rec, hist = (rec.riwayat || []).map(function (r) { return {bulan: r.tgl.substr(0, 7), saldo: r.nilai}; });
    return '<div class="card"><dl class="dl"><dt>' + t('po.nowval.l') + '</dt><dd>' + esc(fm(v.nilai)) + '</dd><dt>' + t('rv.book') + '</dt><dd>' + esc(fm(v.buku)) + '</dd>' + (rec.nilaiTgl ? '<dt>' + t('po.upd.on') + '</dt><dd>' + esc(C.fmtTgl(rec.nilaiTgl)) + '</dd>' : '') + '</dl>' +
      (hist.length >= 3 ? X.sparkline(hist.slice(-12)) : '') + '</div><div class="btnrow"><button class="btn primary" data-act="po-manual">' + t('po.setval') + '</button></div>';
  }
  function susutRec(nama) { return X.plan.recs().filter(function (r) { return r.susut && r.p && r.p.dompet === nama; })[0]; }
  function susutBlock(d, book) {
    var r = susutRec(d.Nama);
    if (!r) return '<div class="card"><div class="muted sm">' + t('su.none') + '</div><div class="btnrow" style="margin-top:10px"><button class="btn primary" data-act="su-new" data-v="' + esc(d.Nama) + '">' + t('su.set') + '</button></div></div>';
    var s = r.susut, nx = C2.nextDue(r, r.terakhir || C2.addDays(r.mulai, -1)), left = nx ? C2.monthsBetween(nx.substr(0, 7), r.akhir.substr(0, 7)) + 1 : 0;
    return '<div class="card"><dl class="dl"><dt>' + t('su.price') + '</dt><dd>' + esc(fm(s.hargaBeli)) + '</dd><dt>' + t('su.bought') + '</dt><dd>' + esc(C.fmtTgl(s.tglBeli)) + '</dd><dt>' + t('su.life') + '</dt><dd>' + esc(t('su.months', s.umur)) + '</dd>' +
      '<dt>' + t('su.residual') + '</dt><dd>' + esc(fm(s.sisa || 0)) + '</dd><dt>' + t('su.monthly') + '</dt><dd>' + esc(fm(r.p.jumlah)) + '</dd><dt>' + t('su.next') + '</dt><dd>' + esc(nx ? C.fmtTgl(nx) + ' · ' + t('su.left', Math.max(0, left)) : t('rt.ended')) + '</dd></dl>' +
      '<div class="note">' + t('su.note') + '</div></div><div class="btnrow"><button class="btn" data-act="su-edit" data-v="' + esc(d.Nama) + '">' + t('edit') + '</button><button class="btn danger" data-act="su-del" data-id="' + esc(r.id) + '">' + t('delete') + '</button></div>';
  }

  // ---------------------------------------------------------------- halaman isi (satu emiten / produk)
  function findA(id) { return rc.list('aset').filter(function (a) { return a.id === id; })[0]; }
  function vHold(p) {
    var a = findA(p.arg); if (!a) return '<div class="card"><div class="empty">—</div></div>';
    var pos = C2.position(a, lots(), today()), fixed = C2.isFixed(a), h = '';
    h += '<div class="card hero"><div class="lbl">' + esc(t('po.k.' + a.kelas) + ' · ' + a.akun) + '</div><div class="big">' + esc(fm(pos.nilai)) + '</div><div class="sr" style="margin-top:6px"><span>' + esc(t('po.cost', fm(pos.modal))) + '</span><b class="' + cls(pos.untung) + '">' + esc(sgn(pos.untung) + (pos.modal ? ' (' + pctT(pos.pct || 0) + ')' : '')) + '</b></div>' +
      '<div class="sr"><span class="muted">' + t('po.realized') + '</span><b class="' + cls(pos.realisasi) + '">' + esc(sgn(pos.realisasi)) + '</b></div></div>';
    if (fixed) {
      var f = a.fix;
      h += '<div class="card"><dl class="dl"><dt>' + t('po.f.pokok') + '</dt><dd>' + esc(fm(f.pokok)) + '</dd><dt>' + t('po.f.bunga') + '</dt><dd>' + esc(String(f.bunga)) + '% / ' + t('po.year') + '</dd><dt>' + t('po.f.mulai') + '</dt><dd>' + esc(C.fmtTgl(f.mulai)) + '</dd>' +
        '<dt>' + t('po.f.tempo') + '</dt><dd>' + esc(f.tempo ? C.fmtTgl(f.tempo) : '-') + '</dd><dt>' + t('po.f.pajak') + '</dt><dd>' + esc(String(f.pajak == null || f.pajak === '' ? 10 : f.pajak)) + '%</dd><dt>' + t('po.f.accrued') + '</dt><dd>' + esc(fm(C2.accrued(f, today()))) + '</dd></dl></div>';
      h += '<div class="btnrow">' + (a.cair ? '' : '<button class="btn" data-act="po-cair" data-id="' + esc(a.id) + '">' + t('po.cair') + '</button>') + '<button class="btn" data-act="po-edit" data-id="' + esc(a.id) + '">' + t('edit') + '</button></div>';
      if (a.cair) h += '<div class="note">' + esc(t('po.cair.done', C.fmtTgl(a.cair.tgl), fm(a.cair.nilai))) + '</div>';
      return h;
    }
    h += '<div class="card"><dl class="dl"><dt>' + t('po.units') + '</dt><dd>' + esc(unitTxt(a, pos.unit)) + '</dd><dt>' + t('po.avg') + '</dt><dd>' + esc(fm(Math.round(pos.avg))) + '</dd><dt>' + t('po.price') + '</dt><dd>' + esc(fm(a.harga || 0)) + (a.hargaTgl ? ' <small class="muted">' + esc(C.fmtTgl(a.hargaTgl)) + '</small>' : '') + '</dd></dl></div>';
    h += '<div class="btnrow"><button class="btn primary" data-act="po-price" data-id="' + esc(a.id) + '">' + t('po.upd') + '</button><button class="btn" data-act="po-lot" data-id="' + esc(a.id) + '" data-j="beli">' + t('po.buy') + '</button><button class="btn" data-act="po-lot" data-id="' + esc(a.id) + '" data-j="jual">' + t('po.sell') + '</button></div>';
    var ph = (a.riwayat || []).map(function (r) { return {bulan: r.tgl.substr(0, 7), saldo: r.harga}; });
    if (ph.length >= 3) h += '<div class="card"><div class="ch">' + t('po.pricehist') + '</div>' + X.sparkline(ph.slice(-12)) + '</div>';
    var ls = lots().filter(function (l) { return l.asetId === a.id; }).sort(function (x, y) { return x.tgl < y.tgl ? 1 : -1; });
    if (ls.length) h += '<h2>' + t('po.lots') + '</h2><div class="card">' + ls.map(function (l) {
      return '<div class="row"><div class="grow"><div class="t">' + t('po.' + (l.jenis === 'beli' ? 'buy' : 'sell')) + ' · ' + esc(unitTxt(a, +l.unit)) + ' × ' + esc(C.fmtNum(l.harga)) + '</div><div class="s">' + esc(C.fmtTgl(l.tgl)) + (+l.biaya ? ' · ' + esc(t('po.fee', C.fmtNum(l.biaya))) : '') + '</div></div><div class="a">' + esc(fm(l.unit * l.harga)) + '</div><button class="hb sm" data-act="po-lot-del" data-id="' + esc(l.id) + '" aria-label="' + t('delete') + '">' + ICON.x + '</button></div>';
    }).join('') + '</div>';
    var fl = ls.slice().reverse().map(function (l) { return {tgl: l.tgl, jumlah: (l.jenis === 'beli' ? -1 : 1) * l.unit * l.harga}; });
    if (pos.unit > 0 && fl.length && C2.daysBetween(fl[0].tgl, today()) >= 30) { fl.push({tgl: today(), jumlah: pos.nilai}); var xr = C2.xirr(fl); if (xr != null) h += '<div class="muted sm" style="margin:6px 4px">' + esc(t('po.xirr', pctT(xr))) + '</div>'; }
    return h + '<div style="margin-top:10px"><button class="link" data-act="po-edit" data-id="' + esc(a.id) + '">' + t('edit') + '</button></div>';
  }
  X.pages.holding = {title: function (p) { var a = findA(p.arg); return a ? (a.kode || a.nama) : t('pg.portfolio'); }, render: vHold};

  // ---------------------------------------------------------------- formulir
  function money(l, k, v, ph) { return '<label class="lbl2">' + l + '</label><input class="input" inputmode="decimal" data-po="' + k + '" value="' + (v === '' || v == null ? '' : esc(String(v))) + '" placeholder="' + esc(ph || '0') + '">'; }
  function txt(l, k, v, ph) { return '<label class="lbl2">' + l + '</label><input class="input" data-po="' + k + '" value="' + esc(v || '') + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '>'; }
  function dt(l, k, v) { return '<label class="lbl2">' + l + '</label><input class="input" type="date" data-po="' + k + '" value="' + esc(v || '') + '">'; }
  function render() {
    var d = PF.d, body = '';
    if (PF.kind === 'aset') {
      body = '<div class="muted sm">' + esc(t('po.in', PF.akun)) + '</div><label class="lbl2">' + t('po.class') + '</label><div class="chips">' + KELAS.map(function (k) { return '<button class="chip sm' + (d.kelas === k ? ' on' : '') + '" data-act="po-class" data-v="' + k + '"' + (PF.id ? ' disabled' : '') + '>' + t('po.k.' + k) + '</button>'; }).join('') + '</div>';
      body += txt(d.kelas === 'saham' ? t('po.code') : t('po.name'), 'nama', d.nama, d.kelas === 'saham' ? 'BMRI' : '');
      if (FIXED[d.kelas]) body += money(t('po.f.pokok'), 'pokok', d.pokok) + money(t('po.f.bunga') + ' (% / ' + t('po.year') + ')', 'bunga', d.bunga) + dt(t('po.f.mulai'), 'mulai', d.mulai) + dt(t('po.f.tempo'), 'tempo', d.tempo) + money(t('po.f.pajak') + ' (%)', 'pajak', d.pajak);
      else if (!PF.id) body += money(d.kelas === 'saham' ? t('po.lots.n') : (d.kelas === 'emas' ? t('po.grams') : t('po.units')), 'unit', d.unit) + money(t(d.kelas === 'saham' ? 'po.buyprice.sh' : 'po.buyprice'), 'harga', d.harga) + money(t('po.fee.l'), 'biaya', d.biaya) + dt(t('f.date'), 'tgl', d.tgl) +
        '<div class="note">' + t('po.buy.note') + '</div>';
    } else if (PF.kind === 'harga') body = money(t(PF.asset.kelas === 'saham' ? 'po.price.sh' : 'po.price'), 'harga', d.harga) + dt(t('f.date'), 'tgl', d.tgl);
    else if (PF.kind === 'prices') body = PF.list.map(function (a, i) { return money(esc(a.kode || a.nama), 'h' + i, d['h' + i]); }).join('') + dt(t('f.date'), 'tgl', d.tgl);
    else if (PF.kind === 'lot') body = money(PF.asset.kelas === 'saham' ? t('po.lots.n') : t('po.units'), 'unit', d.unit) + money(t(PF.asset.kelas === 'saham' ? 'po.price.sh' : 'po.price'), 'harga', d.harga) + money(t('po.fee.l'), 'biaya', d.biaya) + dt(t('f.date'), 'tgl', d.tgl);
    else if (PF.kind === 'cair') body = money(t('po.cair.amt'), 'harga', d.harga) + dt(t('f.date'), 'tgl', d.tgl) + '<div class="note">' + t('po.cair.note') + '</div>';
    else if (PF.kind === 'manual') body = money(t('po.nowval.l'), 'nilai', d.nilai) + dt(t('f.date'), 'tgl', d.tgl);
    else if (PF.kind === 'kas') body = money(t('po.kas'), 'kas', d.kas, String(PF.auto)) + '<div class="note">' + esc(t('po.kas.note', fm(PF.auto))) + '</div>';
    else if (PF.kind === 'susut') body = money(t('su.price'), 'harga', d.harga) + dt(t('su.bought'), 'tglBeli', d.tglBeli) + money(t('su.life.l'), 'umur', d.umur) + money(t('su.residual'), 'sisa', d.sisa) + dt(t('su.start'), 'mulai', d.mulai) +
      '<div class="note">' + esc(susutPreview()) + '</div>';
    var del = (PF.kind === 'aset' && PF.id) ? '<button class="btn danger" data-act="po-del">' + t('delete') + '</button>' : '';
    $('#overlay').innerHTML = '<div class="scrim" data-act="ov-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + esc(PF.title) + '</div><button class="x" data-act="ov-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div><div class="sheet-b" id="pobody">' + body + '</div><div class="sheet-f">' +
      (PF.err ? '<div class="err">' + esc(PF.err) + '</div>' : '') + '<div class="' + (del ? 'btnrow2' : '') + '">' + del + '<button class="btn primary" data-act="po-save"' + (PF.busy ? ' disabled' : '') + '>' + (PF.busy ? t('w.saving') : t('save')) + '</button></div></div></div>';
  }
  function open(kind, title, d, id, extra) { X.closeOverlays(); PF = Object.assign({kind: kind, title: title, d: d, id: id || null, err: '', busy: false}, extra || {}); render(); }
  document.addEventListener('input', function (e) {
    var el = e.target; if (!PF || !el.dataset || !el.dataset.po) return; PF.d[el.dataset.po] = el.value;
    if (PF.kind === 'susut') { var n = $('#pobody .note'); if (n) n.textContent = susutPreview(); }
  });
  function fail(m) { PF.busy = false; PF.err = m; render(); }
  function done(p, then) { PF.busy = true; PF.err = ''; render(); p.then(function () { var acc = PF && PF.akun; PF = null; X.closeOverlays(); X.toast(t('saved')); if (then) then(acc); else X.render(); }).catch(function (e) { fail(X.srvErr(e)); }); }
  function setPrice(a, harga, tgl) {
    var r = (a.riwayat || []).filter(function (x) { return x.tgl !== tgl; }).concat([{tgl: tgl, harga: harga}]).sort(function (x, y) { return x.tgl < y.tgl ? -1 : 1; }).slice(-60);
    return {op: 'simpan', tipe: 'aset', id: a.id, data: strip(Object.assign({}, a, {harga: harga, hargaTgl: tgl, riwayat: r}))};
  }
  function strip(o) { var d = Object.assign({}, o); delete d.id; delete d._oleh; return d; }
  function akunSave(nama, patch) { var ar = akunRecs(), r = ar[nama]; return rc.save('akun', Object.assign({dompet: nama}, r ? strip(r) : {}, patch), r ? r.id : undefined); }
  function thenReval(acc) { if (acc) askReval(acc); else X.render(); }

  // ---------------------------------------------------------------- penyusutan
  function susutCalc() {
    var d = PF.d, nama = PF.akun, book = bookMap()[nama] || 0, umur = Math.round(num(d.umur)), sisa = num(d.sisa) || 0, mulai = d.mulai, tb = d.tglBeli;
    if (!(umur > 0) || !tb || !mulai) return null;
    var used = C2.monthsBetween(tb.substr(0, 7), mulai.substr(0, 7)), left = umur - used;
    if (left <= 0) return {err: t('su.err.over')};
    var per = Math.round((book - sisa) / left);
    if (!(per > 0)) return {err: t('su.err.zero')};
    return {per: per, left: left, book: book, akhir: C2.addMonthsKeep(mulai, left - 1)};
  }
  function susutPreview() { var c = susutCalc(); if (!c) return t('su.prev.fill'); if (c.err) return c.err; return t('su.prev', fm(c.book), c.left, fm(c.per)); }
  function depKat() { return S.M.kategori.filter(function (k) { return k.Jenis === 'Expense' && /depresiasi|penyusutan/i.test(k.SubKategori); })[0]; }
  function openSusut(nama) {
    var r = susutRec(nama), s = r ? r.susut : null, firstTx = X.C.recent(S.tx, function (x) { return x.DompetTujuan === nama || (x.Jenis === 'Saldo awal' && x.Dompet === nama); }, 9999).pop();
    var next = C2.addMonthKey(today().substr(0, 7), 1) + '-01';
    open('susut', t('su.set'), s ? {harga: s.hargaBeli, tglBeli: s.tglBeli, umur: s.umur, sisa: s.sisa || '', mulai: r.mulai} :
      {harga: firstTx ? firstTx.Jumlah : (bookMap()[nama] || ''), tglBeli: firstTx ? firstTx.Waktu.substr(0, 10) : today(), umur: 48, sisa: '', mulai: next}, r ? r.id : null, {akun: nama});
  }

  Object.assign(A, {
    'po-view': function (el) { S.poView = el.dataset.v; X.render(); },
    'po-share': function () { X.shareDoc(docPort(), 'doit-portofolio-' + today()); },
    'po-mode': function (el) { var nama = S._poAcc; akunSave(nama, {mode: el.dataset.v}).then(function () { X.render(); }).catch(function (e) { X.toast(X.srvErr(e)); }); },
    'rv-ask': function (el) { askReval(el.dataset.v); },
    'rv-book': function (el) { bookReval(el.dataset.v); },
    'po-new': function () { open('aset', t('po.add.isi'), {nama: '', kelas: 'saham', unit: '', harga: '', biaya: '', tgl: today(), pokok: '', bunga: '', mulai: today(), tempo: '', pajak: '10'}, null, {akun: S._poAcc}); },
    'po-class': function (el) { PF.d.kelas = el.dataset.v; render(); },
    'po-open': function (el) { X.openPage('holding', el.dataset.id); },
    'po-edit': function (el) {
      var a = findA(el.dataset.id); if (!a) return; var f = a.fix || {};
      open('aset', t('edit'), {nama: a.kode || a.nama, kelas: a.kelas, pokok: f.pokok || '', bunga: f.bunga || '', mulai: f.mulai || '', tempo: f.tempo || '', pajak: f.pajak == null ? '10' : f.pajak}, a.id, {asset: a, akun: a.akun});
    },
    'po-price': function (el) { var a = findA(el.dataset.id); if (a) open('harga', t('po.upd'), {harga: a.harga || '', tgl: today()}, a.id, {asset: a, akun: a.akun}); },
    'po-prices': function () {
      var list = holdings(S._poAcc).filter(function (a) { return !C2.isFixed(a) && C2.position(a, lots(), today()).unit > 0; }), d = {tgl: today()};
      list.forEach(function (a, i) { d['h' + i] = a.harga || ''; });
      open('prices', t('po.upd.all'), d, null, {list: list, akun: S._poAcc});
    },
    'po-lot': function (el) { var a = findA(el.dataset.id); if (a) open('lot', t('po.' + (el.dataset.j === 'beli' ? 'buy' : 'sell')) + ' ' + (a.kode || a.nama), {unit: '', harga: a.harga || '', biaya: '', tgl: today()}, a.id, {asset: a, jenis: el.dataset.j, akun: a.akun}); },
    'po-lot-del': function (el) { if (!confirm(t('bl.del.q'))) return; var l = lots().filter(function (x) { return x.id === el.dataset.id; })[0], a = l && findA(l.asetId); rc.remove(el.dataset.id).then(function () { thenReval(a && a.akun); }); },
    'po-cair': function (el) { var a = findA(el.dataset.id); if (a) open('cair', t('po.cair'), {harga: Math.round(C2.position(a, [], today()).nilai), tgl: today()}, a.id, {asset: a, akun: a.akun}); },
    'po-manual': function () { var nama = S._poAcc, r = akunRecs()[nama] || {}, v = valueOf(S.M.dompet[nama], bookMap()[nama] || 0); open('manual', t('po.setval'), {nilai: v.nilai, tgl: today()}, null, {akun: nama, rec: r}); },
    'po-kas': function () { var nama = S._poAcc, v = valueOf(S.M.dompet[nama], bookMap()[nama] || 0); open('kas', t('po.kas'), {kas: v.rec.kas != null ? v.rec.kas : ''}, null, {akun: nama, auto: v.kasAuto}); },
    'po-del': function () {
      if (!confirm(t('bl.del.q'))) return; var id = PF.id, acc = PF.akun, ls = lots().filter(function (l) { return l.asetId === id; });
      PF.busy = true; rc.batch([{op: 'hapus', id: id}].concat(ls.map(function (l) { return {op: 'hapus', id: l.id}; }))).then(function () { PF = null; X.closeOverlays(); if (S.page && S.page.name === 'holding') X.goBack(); thenReval(acc); }).catch(function (e) { fail(X.srvErr(e)); });
    },
    'su-new': function (el) { openSusut(el.dataset.v); },
    'su-edit': function (el) { openSusut(el.dataset.v); },
    'su-del': function (el) { if (confirm(t('bl.del.q'))) rc.remove(el.dataset.id).then(function () { X.render(); }); },
    'su-offer': function (el) { X.closePicker(); openSusut(el.dataset.v); },
    'po-save': function () {
      var d = PF.d, td = today();
      if (PF.kind === 'aset') {
        var nama = (d.nama || '').trim(); if (nama.length < 2) return fail(t('w.short'));
        var kode = d.kelas === 'saham' ? nama.toUpperCase().replace(/\s+/g, '') : '';
        if (FIXED[d.kelas]) {
          var pk = num(d.pokok), bg = num(d.bunga), pj = d.pajak === '' ? 10 : num(d.pajak);
          if (!(pk > 0) || isNaN(bg) || bg < 0 || isNaN(pj)) return fail(t('po.err.num')); if (!d.mulai) return fail(t('rt.err.date'));
          return done(rc.save('aset', Object.assign({}, PF.asset ? strip(PF.asset) : {}, {akun: PF.akun, nama: nama, kode: kode, kelas: d.kelas, fix: {pokok: pk, bunga: bg, mulai: d.mulai, tempo: d.tempo || '', pajak: pj}, aktif: true}), PF.id || undefined), thenReval);
        }
        if (PF.id) return done(rc.save('aset', Object.assign({}, strip(PF.asset), {nama: nama, kode: kode || PF.asset.kode}), PF.id), thenReval);
        var u = num(d.unit) * mult({kelas: d.kelas}), h = num(d.harga), fee = num(d.biaya) || 0; if (!(u > 0) || !(h > 0)) return fail(t('po.err.num'));
        PF.busy = true; render(); var acc = PF.akun;
        return rc.save('aset', {akun: acc, nama: nama, kode: kode, kelas: d.kelas, harga: h, hargaTgl: d.tgl || td, riwayat: [{tgl: d.tgl || td, harga: h}], aktif: true})
          .then(function (id) { return rc.save('lot', {asetId: id, jenis: 'beli', unit: u, harga: h, biaya: fee, tgl: d.tgl || td}); })
          .then(function () { PF = null; X.closeOverlays(); X.toast(t('saved')); thenReval(acc); }).catch(function (e) { fail(X.srvErr(e)); });
      }
      if (PF.kind === 'harga') { var p = num(d.harga); if (!(p >= 0)) return fail(t('po.err.num')); return done(rc.batch([setPrice(PF.asset, p, d.tgl || td)]), thenReval); }
      if (PF.kind === 'prices') {
        var ops = []; for (var i = 0; i < PF.list.length; i++) { var v = num(d['h' + i]); if (!(v >= 0)) return fail(t('po.err.num')); if (v !== +PF.list[i].harga) ops.push(setPrice(PF.list[i], v, d.tgl || td)); }
        if (!ops.length) { PF = null; X.closeOverlays(); return; }
        return done(rc.batch(ops), thenReval);
      }
      if (PF.kind === 'lot') {
        var uu = num(d.unit) * mult(PF.asset), hh = num(d.harga), ff = num(d.biaya) || 0; if (!(uu > 0) || !(hh > 0)) return fail(t('po.err.num'));
        if (PF.jenis === 'jual') { var have = C2.position(PF.asset, lots(), td).unit; if (uu > have + 1e-9) return fail(t('po.err.sell', unitTxt(PF.asset, have))); }
        return done(rc.batch([{op: 'simpan', tipe: 'lot', data: {asetId: PF.asset.id, jenis: PF.jenis, unit: uu, harga: hh, biaya: ff, tgl: d.tgl || td}}, setPrice(PF.asset, hh, d.tgl || td)]), thenReval);
      }
      if (PF.kind === 'cair') { var n = num(d.harga); if (!(n >= 0)) return fail(t('po.err.num')); return done(rc.save('aset', Object.assign({}, strip(PF.asset), {cair: {tgl: d.tgl || td, nilai: n}}), PF.id), thenReval); }
      if (PF.kind === 'manual') {
        var nv = num(d.nilai); if (!(nv >= 0)) return fail(t('po.err.num'));
        var rr = (PF.rec.riwayat || []).filter(function (x) { return x.tgl !== (d.tgl || td); }).concat([{tgl: d.tgl || td, nilai: nv}]).sort(function (x, y) { return x.tgl < y.tgl ? -1 : 1; }).slice(-60);
        return done(akunSave(PF.akun, {nilai: nv, nilaiTgl: d.tgl || td, riwayat: rr}), thenReval);
      }
      if (PF.kind === 'kas') { var kv = d.kas === '' ? '' : num(d.kas); if (kv !== '' && isNaN(kv)) return fail(t('po.err.num')); return done(akunSave(PF.akun, {kas: kv}), thenReval); }
      if (PF.kind === 'susut') {
        var c = susutCalc(); if (!c) return fail(t('su.prev.fill')); if (c.err) return fail(c.err);
        var k = depKat(); if (!k) return fail(t('su.err.kat'));
        var data = {nama: '', susut: {hargaBeli: num(d.harga) || 0, tglBeli: d.tglBeli, umur: Math.round(num(d.umur)), sisa: num(d.sisa) || 0}, p: {jenis: 'Expense', dompet: PF.akun, kodeAkun: k.KodeAkun, jumlah: c.per, catatan: t('su.memo'), jam: '08:00'},
          frek: 'bulanan', interval: 1, mulai: d.mulai, akhir: c.akhir, terakhir: '', aktif: true};
        return done(rc.save('berulang', data, PF.id || undefined));
      }
    }
  });

  // ---------------------------------------------------------------- tawaran penyusutan setelah membeli aset
  X.hooks.afterSave = function (x) {
    var nama = x.Jenis === 'Transfer' ? x.DompetTujuan : (x.Jenis === 'Saldo awal' ? x.Dompet : ''), d = nama && S.M.dompet[nama];
    if (!d || modeOf(d) !== 'susut' || susutRec(nama) || d.Pemilik !== S.cfg.user) return;
    setTimeout(function () {
      if ($('#overlay').innerHTML || $('#overlay2').innerHTML) return;
      $('#overlay2').innerHTML = '<div class="scrim" data-act="pick-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + t('su.offer.t') + '</div></div><div class="sheet-b"><p style="margin:2px 0">' + esc(t('su.offer.q', nama)) + '</p></div>' +
        '<div class="sheet-f btnrow2"><button class="btn" data-act="pick-close">' + t('rv.later') + '</button><button class="btn primary" data-act="su-offer" data-v="' + esc(nama) + '">' + t('su.set') + '</button></div></div>';
    }, 400);
  };

  function docPort() {
    var rows = allAccounts(S.owner), b = [], tot = rows.reduce(function (a, r) { return a + r.nilai; }, 0), grp = {};
    rows.forEach(function (r) { (grp[r.kel] = grp[r.kel] || []).push(r); });
    b.push({k: 'head', l: t('po.value'), r: C.fmtNum(tot)});
    Object.keys(grp).forEach(function (k) {
      var list = grp[k], tt = list.reduce(function (s, r) { return s + r.nilai; }, 0);
      b.push({k: 'head', l: dn(k) + ' · ' + Math.round(tt / (tot || 1) * 100) + '%', r: C.fmtNum(tt)});
      list.sort(function (a, c) { return c.nilai - a.nilai; }).forEach(function (r) { b.push({k: 'row', ind: 1, l: r.d.Nama, r: C.fmtNum(r.nilai)}); });
    });
    return {title: t('pg.portfolio'), sub: C.fmtTgl(today()) + ' · ' + (S.owner === 'Semua' ? t('r.combined') : S.owner), blocks: b, foot: 'Do it'};
  }
  X.port = {valueOf: valueOf, allAccounts: allAccounts};
})();
