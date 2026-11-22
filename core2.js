/* Do it v2.0 - logika murni (tanpa tampilan): berulang, anggaran, tujuan, portofolio, analisis. Bisa dites di Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Core2 = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function pad(n, w) { var s = String(n); while (s.length < (w || 2)) s = '0' + s; return s; }
  function ymd(d) { return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function parse(s) { return new Date(Date.UTC(+s.substr(0, 4), +s.substr(5, 2) - 1, +s.substr(8, 2))); }
  function addDays(s, n) { var d = parse(s); d.setUTCDate(d.getUTCDate() + n); return ymd(d); }
  function addMonthsKeep(s, n, day) {
    var y = +s.substr(0, 4), m = +s.substr(5, 2) - 1, first = new Date(Date.UTC(y, m + n, 1));
    var last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    return pad(first.getUTCFullYear(), 4) + '-' + pad(first.getUTCMonth() + 1) + '-' + pad(Math.min(day || +s.substr(8, 2), last));
  }
  function daysBetween(a, b) { return Math.round((parse(b) - parse(a)) / 864e5); }
  function monthKey(s) { return s.substr(0, 7); }
  function addMonthKey(k, n) { var y = +k.substr(0, 4), m = +k.substr(5, 2) - 1 + n, d = new Date(Date.UTC(y, m, 1)); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1); }
  function monthEnd(k) { return ymd(new Date(Date.UTC(+k.substr(0, 4), +k.substr(5, 2), 0))); }
  function monthsBetween(a, b) { return (+b.substr(0, 4) - +a.substr(0, 4)) * 12 + (+b.substr(5, 2) - +a.substr(5, 2)); }
  function round(n) { return Math.round(n); }

  // ------------------------------------------------------------ transaksi berulang
  // rec: {frek:'harian'|'mingguan'|'bulanan'|'tahunan', interval, mulai, akhir, terakhir}
  function step(rec, d) {
    var iv = Math.max(1, +rec.interval || 1), hari = +rec.mulai.substr(8, 2);
    if (rec.frek === 'harian') return addDays(d, iv);
    if (rec.frek === 'mingguan') return addDays(d, 7 * iv);
    if (rec.frek === 'tahunan') return addMonthsKeep(d, 12 * iv, hari);
    return addMonthsKeep(d, iv, hari);
  }
  function eachDate(rec, fn) {
    var d = rec.mulai, guard = 0;
    while (d && guard++ < 6000) {
      if (rec.akhir && d > rec.akhir) return;
      if (fn(d) === false) return;
      d = step(rec, d);
    }
  }
  /** Tanggal pertama setelah `after` (atau mulai bila kosong). */
  function nextDue(rec, after) {
    var res = null;
    eachDate(rec, function (d) { if (!after || d > after) { res = d; return false; } });
    return res;
  }
  /** Semua tanggal jatuh tempo yang belum diproses (setelah rec.terakhir) sampai hari ini, maks limit. */
  function dueDates(rec, today, limit) {
    var out = [];
    eachDate(rec, function (d) {
      if (d > today || out.length >= (limit || 12)) return false;
      if (!rec.terakhir || d > rec.terakhir) out.push(d);
    });
    return out;
  }
  /** Jadwal berikutnya yang masih di depan (setelah hari ini). */
  function nextAfterToday(rec, today) { return nextDue(rec, today); }
  function recTxId(recId, date) { return ('R' + String(recId).replace(/[^A-Za-z0-9]/g, '').slice(-8) + date.replace(/-/g, '')).substr(0, 40); }

  // ------------------------------------------------------------ anggaran bulanan
  // line: {id, scope:'grup'|'sub', key, jumlah, ov:{'YYYY-MM':n}, rollover:bool, mulai:'YYYY-MM', sampai:'YYYY-MM' (opsional), pemilik}
  function lineMatch(line, x) {
    if ((line.jenis || 'Expense') !== x.Jenis) return false;
    if (line.scope === 'sub') return x.KodeAkun === line.key;
    return x.Kategori === line.key;
  }
  /** Pengeluaran per bulan untuk satu baris anggaran: {'YYYY-MM': jumlah}. */
  function spentByMonth(txMap, line, owner) {
    var m = {};
    for (var id in txMap) {
      var x = txMap[id];
      if (x.Status !== 'Aktif' || !lineMatch(line, x)) continue;
      if (owner && owner !== 'Semua' && x.PemilikDompet !== owner) continue;
      var k = monthKey(x.Waktu); m[k] = (m[k] || 0) + (+x.Jumlah || 0);
    }
    return m;
  }
  function baseFor(line, k) { return line.ov && line.ov[k] != null ? +line.ov[k] : (+line.jumlah || 0); }
  /** Rincian satu bulan: {dasar, bawa, tersedia, terpakai, sisa, pct}. Rollover hanya meneruskan sisa positif. */
  function monthDetail(line, k, spent) {
    var start = line.mulai || addMonthKey(k, -0), bawa = 0, i, cur;
    if (line.rollover) {
      var from = line.mulai && line.mulai < k ? line.mulai : k;
      if (monthsBetween(from, k) > 36) from = addMonthKey(k, -36);
      for (cur = from; cur < k; cur = addMonthKey(cur, 1)) {
        var av = baseFor(line, cur) + bawa, sp = spent[cur] || 0;
        bawa = Math.max(0, av - sp);
      }
    }
    var dasar = baseFor(line, k), tersedia = dasar + bawa, terpakai = spent[k] || 0;
    return {dasar: dasar, bawa: bawa, tersedia: tersedia, terpakai: terpakai, sisa: tersedia - terpakai, pct: tersedia > 0 ? terpakai / tersedia : (terpakai > 0 ? 9.99 : 0)};
  }
  function budgetMonth(lines, txMap, k, owner) {
    var one = owner && owner !== 'Semua';
    var rows = lines.filter(function (l) { return l.aktif !== false && (!l.mulai || l.mulai <= k) && (!l.sampai || l.sampai >= k) && (!one || !l.pemilik || l.pemilik === owner); }).map(function (l) {
      var d = monthDetail(l, k, spentByMonth(txMap, l, l.pemilik || owner));
      return Object.assign({line: l}, d);
    });
    var tot = rows.reduce(function (a, r) { a.tersedia += r.tersedia; a.terpakai += r.terpakai; a.dasar += r.dasar; return a; }, {tersedia: 0, terpakai: 0, dasar: 0});
    tot.sisa = tot.tersedia - tot.terpakai;
    return {rows: rows, total: tot};
  }
  /** Realokasi: pindahkan amt dari baris a ke b pada bulan k. Mengembalikan dua baris baru (salinan). */
  function reallocate(a, b, k, amt) {
    var A = JSON.parse(JSON.stringify(a)), B = JSON.parse(JSON.stringify(b));
    A.ov = A.ov || {}; B.ov = B.ov || {};
    A.ov[k] = baseFor(a, k) - amt; B.ov[k] = baseFor(b, k) + amt;
    if (A.ov[k] < 0) throw new Error('Anggaran sumber tidak cukup untuk dipindahkan');
    return [A, B];
  }
  /** Budget vs Actual untuk laporan: gabung per baris + kategori tanpa anggaran. */
  function budgetVsActual(lines, txMap, k, owner) {
    var bm = budgetMonth(lines, txMap, k, owner), covered = {}, extra = {};
    bm.rows.forEach(function (r) { var o = r.line.pemilik || '*'; covered[(r.line.scope === 'grup' ? 'g:' : 's:') + r.line.key + '|' + o] = 1; });
    function cov(x) { return ['*', x.PemilikDompet].some(function (o) { return covered['g:' + x.Kategori + '|' + o] || covered['s:' + x.KodeAkun + '|' + o]; }); }
    for (var id in txMap) {
      var x = txMap[id];
      if (x.Status !== 'Aktif' || x.Jenis !== 'Expense' || monthKey(x.Waktu) !== k) continue;
      if (owner && owner !== 'Semua' && x.PemilikDompet !== owner) continue;
      if (cov(x) || x.Kategori === 'Di Luar Operasional') continue;
      extra[x.Kategori] = (extra[x.Kategori] || 0) + (+x.Jumlah || 0);
    }
    var tanpa = Object.keys(extra).map(function (g) { return {nama: g, terpakai: extra[g]}; }).sort(function (a, b) { return b.terpakai - a.terpakai; });
    return {rows: bm.rows, total: bm.total, tanpaAnggaran: tanpa, totalTanpa: tanpa.reduce(function (a, r) { return a + r.terpakai; }, 0)};
  }
  /** v2.4: Laporan anggaran vs realisasi gaya laba rugi. jenis 'Income'|'Expense' per kategori + subkategori.
   *  lines = semua baris anggaran (pemasukan & pengeluaran). Selisih: positif = menguntungkan
   *  (pemasukan: realisasi - anggaran; pengeluaran: anggaran - realisasi). */
  function budgetReport(lines, txMap, k, owner, kategori, nonopG) {
    var one = owner && owner !== 'Semua';
    function part(jenis) {
      var act = {g: {}, s: {}}, rows = budgetMonth(lines.filter(function (l) { return (l.jenis || 'Expense') === jenis; }), txMap, k, owner).rows;
      for (var id in txMap) {
        var x = txMap[id];
        if (x.Status !== 'Aktif' || x.Jenis !== jenis || monthKey(x.Waktu) !== k) continue;
        if (one && x.PemilikDompet !== owner) continue;
        var v = +x.Jumlah || 0; act.g[x.Kategori] = (act.g[x.Kategori] || 0) + v; act.s[x.KodeAkun] = (act.s[x.KodeAkun] || 0) + v;
      }
      var order = [], by = {};
      kategori.forEach(function (c) { if (c.Jenis !== jenis || c.Kategori === nonopG) return; if (!by[c.Kategori]) { by[c.Kategori] = {nama: c.Kategori, bud: 0, act: 0, subs: [], umum: 0, subBud: false}; order.push(c.Kategori); } by[c.Kategori].subs.push({kode: c.KodeAkun, nama: c.SubKategori, bud: 0, act: act.s[c.KodeAkun] || 0}); });
      rows.forEach(function (r) {
        var l = r.line, g = l.scope === 'sub' ? ((kategori.filter(function (c) { return c.KodeAkun === l.key; })[0] || {}).Kategori) : l.key;
        if (!g || !by[g]) return;
        by[g].bud += r.tersedia;
        if (l.scope === 'sub') { by[g].subBud = true; by[g].subs.forEach(function (s) { if (s.kode === l.key) s.bud += r.tersedia; }); } else by[g].umum += r.tersedia;
      });
      var groups = [], tb = 0, ta = 0;
      order.forEach(function (n) {
        var g = by[n]; g.act = act.g[n] || 0;
        if (!g.bud && !g.act) return;
        g.subs = g.subs.filter(function (s) { return s.bud || s.act; }); g.sel = jenis === 'Income' ? g.act - g.bud : g.bud - g.act;
        g.subs.forEach(function (s) { s.sel = jenis === 'Income' ? s.act - s.bud : s.bud - s.act; });
        groups.push(g); tb += g.bud; ta += g.act;
      });
      return {groups: groups, bud: tb, act: ta, sel: jenis === 'Income' ? ta - tb : tb - ta};
    }
    var inc = part('Income'), exp = part('Expense');
    return {income: inc, expense: exp, surplus: {bud: inc.bud - exp.bud, act: inc.act - exp.act, sel: (inc.act - exp.act) - (inc.bud - exp.bud)}};
  }
  /** Proyeksi akhir bulan: laju harian x hari dalam bulan. */
  function projection(terpakai, k, today) {
    var dim = +monthEnd(k).substr(8, 2), day = monthKey(today) === k ? +today.substr(8, 2) : (today > monthEnd(k) ? dim : 1);
    return day >= dim ? terpakai : Math.round(terpakai / Math.max(1, day) * dim);
  }

  // ------------------------------------------------------------ event
  function eventActual(ev, txMap) {
    var tag = String(ev.tag || '').toLowerCase().replace(/^#/, ''), total = 0, byGrup = {}, bySub = {}, n = 0;
    if (!tag) return {total: 0, byGrup: {}, bySub: {}, n: 0};
    for (var id in txMap) {
      var x = txMap[id];
      if (x.Status !== 'Aktif' || x.Jenis !== 'Expense') continue;
      var tags = String(x.Tag || '').toLowerCase().split(/[\s,]+/).map(function (s) { return s.replace(/^#/, ''); });
      if (tags.indexOf(tag) < 0) continue;
      total += +x.Jumlah; n++; byGrup[x.Kategori] = (byGrup[x.Kategori] || 0) + (+x.Jumlah); bySub[x.KodeAkun] = (bySub[x.KodeAkun] || 0) + (+x.Jumlah);
    }
    return {total: total, byGrup: byGrup, bySub: bySub, n: n};
  }

  // ------------------------------------------------------------ tujuan (dana goals)
  // g: {target, tenggat:'YYYY-MM-DD', dompet:[nama], awal, setoran:[{tgl,jumlah}]}
  function goalProgress(g, walletBal, today) {
    var fromWallet = (g.dompet || []).reduce(function (a, n) { return a + (walletBal[n] || 0); }, 0);
    var manual = (+g.awal || 0) + (g.setoran || []).reduce(function (a, s) { return a + (+s.jumlah || 0); }, 0);
    var terkumpul = fromWallet + manual, target = +g.target || 0, sisa = Math.max(0, target - terkumpul);
    var out = {terkumpul: terkumpul, target: target, sisa: sisa, pct: target ? Math.min(1, terkumpul / target) : 0, selesai: target > 0 && terkumpul >= target, bulanTersisa: null, perBulan: null, status: 'tanpa-tenggat'};
    if (g.tenggat) {
      var bln = Math.max(0, monthsBetween(today, g.tenggat) + (g.tenggat.substr(8, 2) >= today.substr(8, 2) ? 0 : -1));
      out.bulanTersisa = bln;
      if (out.selesai) out.status = 'tercapai';
      else if (g.tenggat < today) out.status = 'lewat';
      else { out.perBulan = Math.ceil(sisa / Math.max(1, bln)); out.status = 'berjalan'; }
    } else if (out.selesai) out.status = 'tercapai';
    return out;
  }

  // ------------------------------------------------------------ portofolio
  // aset: {kelas, nama, satuan, harga, hargaTgl, hist:[[tgl,harga]], fix:{pokok,bunga,mulai,tempo,pajak}, cair:{tgl,nilai}}
  // lot : {asetId, tgl, jenis:'beli'|'jual', unit, harga, biaya}
  var FIXED = {Deposito: 1, SBN: 1, Obligasi: 1};
  function isFixed(a) { return !!(a.fix && a.fix.pokok); }
  function accrued(fix, today) {
    var end = fix.tempo && fix.tempo < today ? fix.tempo : today, days = Math.max(0, daysBetween(fix.mulai, end));
    var gross = (+fix.pokok) * (+fix.bunga || 0) / 100 * days / 365, tax = (fix.pajak != null && fix.pajak !== '' ? +fix.pajak : 10) / 100;
    return round(gross * (1 - tax));
  }
  /** Posisi satu aset: {unit, biaya (modal sisa), nilai, belumRealisasi, realisasi, pct}. Metode biaya rata-rata. */
  function position(a, lots, today) {
    var out = {unit: 0, modal: 0, nilai: 0, untung: 0, realisasi: 0, avg: 0, tipe: 'harga', aktif: true};
    if (isFixed(a)) {
      out.tipe = 'tetap'; out.unit = 1;
      if (a.cair) { out.aktif = false; out.realisasi = round((+a.cair.nilai || 0) - a.fix.pokok); out.nilai = 0; out.modal = 0; return out; }
      out.modal = +a.fix.pokok; out.nilai = out.modal + accrued(a.fix, today); out.untung = out.nilai - out.modal;
      out.pct = out.modal ? out.untung / out.modal : 0; return out;
    }
    var units = 0, cost = 0, real = 0;
    lots.filter(function (l) { return l.asetId === a.id; }).sort(function (x, y) { return x.tgl < y.tgl ? -1 : (x.tgl > y.tgl ? 1 : 0); }).forEach(function (l) {
      var u = +l.unit || 0, h = +l.harga || 0, fee = +l.biaya || 0;
      if (l.jenis === 'beli') { units += u; cost += u * h + fee; }
      else {
        var avg = units > 0 ? cost / units : 0, take = Math.min(u, units);
        real += take * h - fee - take * avg; cost -= take * avg; units -= take;
      }
    });
    var price = +a.harga || 0;
    out.unit = units; out.modal = round(cost); out.avg = units > 0 ? cost / units : 0; out.nilai = round(units * price); out.untung = out.nilai - out.modal;
    out.realisasi = round(real); out.pct = out.modal > 0 ? out.untung / out.modal : 0; out.aktif = units > 0 || !lots.some(function (l) { return l.asetId === a.id; });
    return out;
  }
  function portfolio(asets, lots, today) {
    var rows = asets.map(function (a) { return Object.assign({aset: a}, position(a, lots, today)); });
    var tot = rows.reduce(function (t, r) { t.nilai += r.nilai; t.modal += r.modal; t.untung += r.untung; t.realisasi += r.realisasi; return t; }, {nilai: 0, modal: 0, untung: 0, realisasi: 0});
    tot.pct = tot.modal ? tot.untung / tot.modal : 0;
    var alloc = {};
    rows.forEach(function (r) { if (r.nilai > 0) alloc[r.aset.kelas || 'Lainnya'] = (alloc[r.aset.kelas || 'Lainnya'] || 0) + r.nilai; });
    var al = Object.keys(alloc).map(function (k) { return {kelas: k, nilai: alloc[k], pct: tot.nilai ? alloc[k] / tot.nilai : 0}; }).sort(function (a, b) { return b.nilai - a.nilai; });
    return {rows: rows, total: tot, alokasi: al};
  }
  /** XIRR sederhana (Newton) dari arus kas [{tgl, jumlah}] ; negatif = keluar. Mengembalikan null bila gagal. */
  function xirr(flows) {
    if (flows.length < 2) return null;
    var t0 = flows[0].tgl, f = function (r) { return flows.reduce(function (s, c) { return s + c.jumlah / Math.pow(1 + r, daysBetween(t0, c.tgl) / 365); }, 0); };
    var lo = -0.99, hi = 10, flo = f(lo), fhi = f(hi);
    if (flo * fhi > 0) return null;
    for (var i = 0; i < 100; i++) { var mid = (lo + hi) / 2, fm = f(mid); if (Math.abs(fm) < 1e-6) return mid; if (flo * fm < 0) { hi = mid; } else { lo = mid; flo = fm; } }
    return (lo + hi) / 2;
  }

  // ------------------------------------------------------------ analisis
  /** Deret bulanan {bulan, pendapatan, beban, net} dari baris jurnal (satu kali lewat). */
  function monthlySeries(lines, M, endKey, n, f, pass) {
    var keys = [], idx = {}, i;
    for (i = n - 1; i >= 0; i--) { var k = addMonthKey(endKey, -i); idx[k] = keys.length; keys.push({bulan: k, pendapatan: 0, beban: 0, net: 0}); }
    var first = keys[0].bulan + '-01', last = monthEnd(endKey);
    lines.forEach(function (l) {
      if (l.tanggal < first || l.tanggal > last || (pass && !pass(l, f))) return;
      var a = M.akun[l.kode]; if (!a) return;
      var o = keys[idx[monthKey(l.tanggal)]];
      if (a.Tipe === 'Pendapatan') o.pendapatan += l.kredit - l.debit; else if (a.Tipe === 'Beban') o.beban += l.debit - l.kredit;
    });
    keys.forEach(function (o) { o.net = o.pendapatan - o.beban; });
    return keys;
  }
  function avg(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }
  function slope(vals) { // kemiringan regresi linear sederhana per langkah
    var n = vals.length; if (n < 2) return 0;
    var mx = (n - 1) / 2, my = avg(vals), num = 0, den = 0;
    vals.forEach(function (v, i) { num += (i - mx) * (v - my); den += (i - mx) * (i - mx); });
    return den ? num / den : 0;
  }
  /**
   * Rasio keuangan. in: {pendapatan, beban (bulan terpilih), seriBeban: [bulan terakhir], kas (aset likuid), aset, utang, utangPendek,
   * cicilanBulanan, investasi, netWorth}
   */
  function ratios(x) {
    var r = {};
    r.tabungan = x.pendapatan > 0 ? (x.pendapatan - x.beban) / x.pendapatan : null;
    var avgOut = avg(x.seriBeban || []) || x.beban;
    r.danaDarurat = avgOut > 0 ? x.kas / avgOut : null;           // bulan
    r.likuiditas = x.utangPendek > 0 ? x.kas / x.utangPendek : null;
    r.utangAset = x.aset > 0 ? x.utang / x.aset : null;
    r.cicilan = x.pendapatan > 0 ? (x.cicilanBulanan || 0) / x.pendapatan : null;
    r.investasi = x.aset > 0 ? x.investasi / x.aset : null;
    r.pengeluaranPendapatan = x.pendapatan > 0 ? x.beban / x.pendapatan : null;
    return r;
  }
  /** Peringatan + saran. Setiap item: {level:'bad'|'warn'|'good', kode, args:[]} - teks disusun di tampilan (dua bahasa). */
  var TARGET = {tabungan: 0.25, darurat: 6, utang: 0.25, cicilan: 0.30};
  function insights(x) {
    var out = [], r = ratios(x), ser = x.seri || [], T = TARGET;
    if (r.tabungan != null) {
      if (r.tabungan < 0) out.push({level: 'bad', kode: 'defisit', args: [Math.abs(x.pendapatan - x.beban)]});
      else if (r.tabungan < 0.1) out.push({level: 'bad', kode: 'tabungan.rendah', args: [Math.round(r.tabungan * 100)]});
      else if (r.tabungan < T.tabungan) out.push({level: 'warn', kode: 'tabungan.kurang', args: [Math.round(r.tabungan * 100)]});
      else out.push({level: 'good', kode: 'tabungan.baik', args: [Math.round(r.tabungan * 100)]});
    }
    if (r.danaDarurat != null) {
      if (r.danaDarurat < 3) out.push({level: 'bad', kode: 'darurat.rendah', args: [r.danaDarurat.toFixed(1)]});
      else if (r.danaDarurat < T.darurat) out.push({level: 'warn', kode: 'darurat.cukup', args: [r.danaDarurat.toFixed(1)]});
      else out.push({level: 'good', kode: 'darurat.baik', args: [r.danaDarurat.toFixed(1)]});
    }
    if (r.utangAset != null) {
      if (r.utangAset > 0.5) out.push({level: 'bad', kode: 'utang.tinggi', args: [Math.round(r.utangAset * 100)]});
      else if (r.utangAset > T.utang) out.push({level: 'warn', kode: 'utang.sedang', args: [Math.round(r.utangAset * 100)]});
      else if (x.utang > 0) out.push({level: 'good', kode: 'utang.baik', args: [Math.round(r.utangAset * 100)]});
    }
    if (r.cicilan != null) {
      if (r.cicilan > 0.45) out.push({level: 'bad', kode: 'cicilan.tinggi', args: [Math.round(r.cicilan * 100)]});
      else if (r.cicilan > T.cicilan) out.push({level: 'warn', kode: 'cicilan.sedang', args: [Math.round(r.cicilan * 100)]});
    }
    if (r.likuiditas != null && r.likuiditas < 1) out.push({level: 'warn', kode: 'likuiditas', args: [r.likuiditas.toFixed(1)]});
    if (r.investasi != null && r.investasi < 0.1 && r.tabungan != null && r.tabungan >= 0.1) out.push({level: 'warn', kode: 'investasi.rendah', args: [Math.round(r.investasi * 100)]});
    if (ser.length >= 4) {
      var prev = ser.slice(0, -1).map(function (s) { return s.beban; }), base = avg(prev.slice(-6)), last = ser[ser.length - 1];
      if (base > 0 && last.beban > base * 1.25) out.push({level: 'warn', kode: 'beban.naik', args: [Math.round((last.beban / base - 1) * 100)]});
      if (ser.length >= 6 && slope(ser.slice(-6).map(function (s) { return s.beban; })) > 0 && slope(ser.slice(-6).map(function (s) { return s.pendapatan; })) <= 0) out.push({level: 'warn', kode: 'tren.beban', args: []});
    }
    if (x.topKategori && x.topKategori.length && x.beban > 0) {
      var t0 = x.topKategori[0];
      if (t0.jumlah / x.beban > 0.4) out.push({level: 'warn', kode: 'kategori.dominan', args: [t0.nama, Math.round(t0.jumlah / x.beban * 100)]});
    }
    if (x.anggaranLewat && x.anggaranLewat.length) out.push({level: 'warn', kode: 'anggaran.lewat', args: [x.anggaranLewat.join(', ')]});
    if (x.piutangLewat > 0) out.push({level: 'warn', kode: 'piutang.lewat', args: [x.piutangLewat]});
    if (x.utangLewat > 0) out.push({level: 'bad', kode: 'utang.lewat', args: [x.utangLewat]});
    var order = {bad: 0, warn: 1, good: 2};
    return out.sort(function (a, b) { return order[a.level] - order[b.level]; });
  }

  /** Kekayaan bersih akhir tiap bulan (aset - liabilitas) untuk n bulan. */
  function netWorthSeries(lines, M, endKey, n, f, pass) {
    var keys = [], idx = {}, base = 0, i;
    for (i = n - 1; i >= 0; i--) { var k = addMonthKey(endKey, -i); idx[k] = keys.length; keys.push({bulan: k, saldo: 0}); }
    var first = keys[0].bulan + '-01', last = monthEnd(endKey);
    lines.forEach(function (l) {
      if (l.tanggal > last || (pass && !pass(l, f))) return;
      var a = M.akun[l.kode]; if (!a || (a.Tipe !== 'Aset' && a.Tipe !== 'Liabilitas')) return;
      var d = l.debit - l.kredit;   // aset: debit menambah; liabilitas: kredit menambah utang, jadi mengurangi kekayaan
      if (l.tanggal < first) base += d; else keys[idx[monthKey(l.tanggal)]].saldo += d;
    });
    var run = base; keys.forEach(function (o) { run += o.saldo; o.saldo = run; });
    return keys;
  }
  /** Beban per kelompok per bulan: {nama: [v...]} (n bulan berakhir di endKey). */
  function groupMonthly(lines, M, tipe, endKey, n, f, pass) {
    var idx = {}, out = {}, i;
    for (i = n - 1; i >= 0; i--) idx[addMonthKey(endKey, -i)] = n - 1 - i;
    var first = addMonthKey(endKey, -(n - 1)) + '-01', last = monthEnd(endKey);
    lines.forEach(function (l) {
      if (l.tanggal < first || l.tanggal > last || (pass && !pass(l, f))) return;
      var a = M.akun[l.kode]; if (!a || a.Tipe !== tipe) return;
      var arr = out[a.Kelompok] || (out[a.Kelompok] = new Array(n).fill(0));
      arr[idx[monthKey(l.tanggal)]] += tipe === 'Beban' ? l.debit - l.kredit : l.kredit - l.debit;
    });
    return out;
  }

  // ------------------------------------------------------------ deteksi transaksi rutin
  function median(a) { var b = a.slice().sort(function (x, y) { return x - y; }), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
  /** Cari pola berulang dari riwayat. Mengembalikan saran: {key, jenis, dompet, kodeAkun, toko, jumlah, frek, interval, terakhir, n}. */
  function detectRoutine(txMap, today) {
    var since = addDays(today, -210), groups = {}, out = [];
    for (var id in txMap) {
      var x = txMap[id], d = String(x.Waktu).substr(0, 10);
      if (x.Status !== 'Aktif' || (x.Jenis !== 'Expense' && x.Jenis !== 'Income') || d < since || x._pending) continue;
      var key = [x.Jenis, x.KodeAkun, x.Dompet, String(x.Toko || '').toLowerCase()].join('|');
      (groups[key] || (groups[key] = [])).push({d: d, j: +x.Jumlah, x: x});
    }
    Object.keys(groups).forEach(function (key) {
      var g = groups[key].sort(function (a, b) { return a.d < b.d ? -1 : (a.d > b.d ? 1 : 0); });
      if (g.length < 3) return;
      var m = median(g.map(function (r) { return r.j; }));
      g = g.filter(function (r) { return Math.abs(r.j - m) <= m * 0.15; });
      if (g.length < 3) return;
      var ds = [], iv = [], i;
      g.forEach(function (r) { if (!ds.length || ds[ds.length - 1] !== r.d) ds.push(r.d); });
      if (ds.length < 3) return;
      for (i = 1; i < ds.length; i++) iv.push(daysBetween(ds[i - 1], ds[i]));
      var med = median(iv), frek, interval;
      if (med >= 6 && med <= 8) { frek = 'mingguan'; interval = 1; }
      else if (med >= 13 && med <= 15) { frek = 'mingguan'; interval = 2; }
      else if (med >= 27 && med <= 34) { frek = 'bulanan'; interval = 1; }
      else return;
      var okIv = iv.filter(function (v) { return Math.abs(v - med) <= 3; }).length;
      if (okIv / iv.length < 0.7) return;
      var last = ds[ds.length - 1];
      if (daysBetween(last, today) > med * 1.6) return;
      var lx = g[g.length - 1].x;
      out.push({key: key, jenis: lx.Jenis, dompet: lx.Dompet, kodeAkun: lx.KodeAkun, kategori: lx.Kategori, sub: lx.SubKategori, toko: lx.Toko || '', jumlah: Math.round(m),
        frek: frek, interval: interval, terakhir: last, n: ds.length, hari: +last.substr(8, 2)});
    });
    return out.sort(function (a, b) { return b.n - a.n || b.jumlah - a.jumlah; });
  }

  return {
    addDays: addDays, addMonthsKeep: addMonthsKeep, daysBetween: daysBetween, monthKey: monthKey, addMonthKey: addMonthKey, monthEnd: monthEnd, monthsBetween: monthsBetween,
    nextDue: nextDue, dueDates: dueDates, recTxId: recTxId, nextAfterToday: nextAfterToday,
    spentByMonth: spentByMonth, monthDetail: monthDetail, budgetMonth: budgetMonth, reallocate: reallocate, budgetVsActual: budgetVsActual, budgetReport: budgetReport, projection: projection,
    eventActual: eventActual, goalProgress: goalProgress,
    isFixed: isFixed, accrued: accrued, position: position, portfolio: portfolio, xirr: xirr,
    monthlySeries: monthlySeries, ratios: ratios, insights: insights, slope: slope, avg: avg, TARGET: TARGET,
    netWorthSeries: netWorthSeries, groupMonthly: groupMonthly, detectRoutine: detectRoutine
  };
});
