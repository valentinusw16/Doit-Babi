/* Kas Keluarga - logika inti (tanpa DOM). Dipakai aplikasi dan diuji di Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Core = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SUB_UP = ['Pinjam', 'Bayar utang', 'Beri pinjaman', 'Terima pelunasan'];

  // ------------------------------------------------------------ format & tanggal
  function pad(n, w) { var s = String(n); while (s.length < (w || 2)) s = '0' + s; return s; }
  function fmtNum(n) {
    n = Math.round(Number(n) || 0);
    var neg = n < 0; n = Math.abs(n);
    var s = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '-' : '') + s;
  }
  function fmtRp(n) {
    n = Math.round(Number(n) || 0);
    return (n < 0 ? '-' : '') + 'Rp ' + fmtNum(Math.abs(n));
  }
  function nowLocal(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function todayLocal(d) { return nowLocal(d).substr(0, 10); }
  function isDate(ymd) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd || '')) return false;
    var y = +ymd.substr(0, 4), m = +ymd.substr(5, 2), d = +ymd.substr(8, 2);
    var t = new Date(Date.UTC(y, m - 1, d));
    return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
  }
  function addMonths(ymd, n) {
    var y = +ymd.substr(0, 4), m = +ymd.substr(5, 2) - 1, d = +ymd.substr(8, 2);
    var first = new Date(Date.UTC(y, m + n, 1));
    var last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    return pad(first.getUTCFullYear(), 4) + '-' + pad(first.getUTCMonth() + 1) + '-' + pad(Math.min(d, last));
  }
  function jangka(tanggal, tempo) {
    if (!isDate(tempo)) throw new Error('Jatuh tempo wajib diisi');
    if (tempo < tanggal) throw new Error('Jatuh tempo tidak boleh sebelum tanggal transaksi');
    if (tempo < addMonths(tanggal, 1)) return 'Pendek';
    if (tempo <= addMonths(tanggal, 12)) return 'Menengah';
    return 'Panjang';
  }
  function newId() {
    var d = new Date(), r = '';
    var ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (var i = 0; i < 5; i++) r += ch.charAt(Math.floor(Math.random() * ch.length));
    return 'T' + String(d.getFullYear()).substr(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + r;
  }
  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  function fmtTgl(ymd) {
    if (!isDate(ymd)) return ymd || '';
    return +ymd.substr(8, 2) + ' ' + BULAN[+ymd.substr(5, 2) - 1].substr(0, 3) + ' ' + ymd.substr(0, 4);
  }
  function fmtHari(ymd, today) {
    if (ymd === today) return 'Hari ini';
    var y = new Date(today + 'T00:00:00Z'); y.setUTCDate(y.getUTCDate() - 1);
    if (ymd === y.toISOString().substr(0, 10)) return 'Kemarin';
    return fmtTgl(ymd);
  }
  function periodRange(kind, today) {
    var y = +today.substr(0, 4), m = +today.substr(5, 2);
    function lastDay(yy, mm) { return pad(new Date(Date.UTC(yy, mm, 0)).getUTCDate()); }
    if (kind === 'bulan') return {start: y + '-' + pad(m) + '-01', end: y + '-' + pad(m) + '-' + lastDay(y, m)};
    if (kind === 'lalu') {
      var py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1;
      return {start: py + '-' + pad(pm) + '-01', end: py + '-' + pad(pm) + '-' + lastDay(py, pm)};
    }
    if (kind === 'tahun') return {start: y + '-01-01', end: y + '-12-31'};
    return {start: '0000-01-01', end: '9999-12-31'};
  }

  // ------------------------------------------------------------ master
  function indexMaster(master) {
    var M = {raw: master || {}, akun: {}, dompet: {}, dompetAktif: [], kategori: [], katByKode: {}, pihak: [], pihakByNama: {}, st: {}, users: []};
    if (!master) return M;
    master.akun.forEach(function (a) { M.akun[a.Kode] = a; });
    master.dompet.forEach(function (d) { M.dompet[d.Nama] = d; if (d.Aktif) M.dompetAktif.push(d); });
    master.kategori.forEach(function (k) { M.katByKode[k.KodeAkun] = k; if (k.Aktif) M.kategori.push(k); });
    master.pihak.forEach(function (p) { M.pihakByNama[p.Nama.toLowerCase()] = p; if (p.Aktif) M.pihak.push(p); });
    M.st = master.pengaturan || {};
    M.users = master.pengguna || [];
    return M;
  }

  // ------------------------------------------------------------ pinjaman
  function loanKind(tx) {
    if (tx.Jenis === 'Utang/Piutang') return tx.SubJenis === 'Pinjam' ? 'Utang' : (tx.SubJenis === 'Beri pinjaman' ? 'Piutang' : null);
    if (tx.Jenis === 'Saldo awal') return tx.SubJenis === 'Utang' ? 'Utang' : (tx.SubJenis === 'Piutang' ? 'Piutang' : null);
    return null;
  }
  function isRepay(tx) {
    return tx.Jenis === 'Utang/Piutang' && (tx.SubJenis === 'Bayar utang' || tx.SubJenis === 'Terima pelunasan');
  }
  function sisa(txMap, id, ignoreId) {
    var loan = txMap[id]; if (!loan) return 0;
    var paid = 0;
    for (var k in txMap) {
      var r = txMap[k];
      if (r.Referensi === id && r.Status === 'Aktif' && k !== ignoreId && isRepay(r)) paid += Number(r.Jumlah) || 0;
    }
    return Number(loan.Jumlah) - paid;
  }
  function openLoans(txMap, ignoreId) {
    var out = [];
    for (var k in txMap) {
      var r = txMap[k], kind = loanKind(r);
      if (!kind || r.Status !== 'Aktif') continue;
      var s = sisa(txMap, k, ignoreId);
      if (s > 0) out.push({id: k, kind: kind, pihak: r.Pihak, jumlah: Number(r.Jumlah), sisa: s, jatuhTempo: r.JatuhTempo, jangka: r.Jangka, pemilik: r.PemilikDompet, tanggal: String(r.Waktu).substr(0, 10)});
    }
    out.sort(function (a, b) { return a.jatuhTempo < b.jatuhTempo ? -1 : (a.jatuhTempo > b.jatuhTempo ? 1 : 0); });
    return out;
  }
  function saldoPihak(txMap) {
    var by = {};
    openLoans(txMap).forEach(function (l) {
      var p = by[l.pihak] || (by[l.pihak] = {pihak: l.pihak, piutang: 0, utang: 0, pinjaman: []});
      if (l.kind === 'Piutang') p.piutang += l.sisa; else p.utang += l.sisa;
      p.pinjaman.push(l);
    });
    return Object.keys(by).map(function (k) { return by[k]; })
      .sort(function (a, b) { return (b.piutang + b.utang) - (a.piutang + a.utang); });
  }

  // ------------------------------------------------------------ jurnal turunan (cermin Code.gs)
  function tierAkun(M, jenis, jg) {
    var kode = M.st['Akun' + jenis + jg];
    if (!kode) throw new Error('Pengaturan akun ' + jenis + ' ' + jg + ' belum ada');
    return kode;
  }
  function walletInfo(M, nama) {
    var d = M.dompet[nama];
    if (!d || !d.Aktif) throw new Error('Dompet tidak dikenal atau nonaktif: ' + nama);
    return {nama: d.Nama, kode: d.KodeAkun, pemilik: d.Pemilik};
  }
  function deriveLines(tx, M) {
    var L = [], j = Number(tx.Jumlah);
    function dr(k, a, o) { L.push({kode: k, debit: a, kredit: 0, pemilik: o}); }
    function cr(k, a, o) { L.push({kode: k, debit: 0, kredit: a, pemilik: o}); }
    var own = tx.PemilikDompet, w;
    if (tx.Jenis === 'Income') {
      w = walletInfo(M, tx.Dompet); dr(w.kode, j, w.pemilik); cr(tx.KodeAkun, j, w.pemilik);
    } else if (tx.Jenis === 'Expense') {
      w = walletInfo(M, tx.Dompet); dr(tx.KodeAkun, j, w.pemilik); cr(w.kode, j, w.pemilik);
    } else if (tx.Jenis === 'Transfer') {
      var a = walletInfo(M, tx.Dompet), b = walletInfo(M, tx.DompetTujuan);
      dr(b.kode, j, b.pemilik); cr(a.kode, j, a.pemilik);
      var fee = Number(tx.BiayaAdmin) || 0;
      if (fee > 0) { dr(M.st.AkunBiayaTransfer, fee, a.pemilik); cr(a.kode, fee, a.pemilik); }
    } else if (tx.Jenis === 'Utang/Piutang') {
      w = walletInfo(M, tx.Dompet);
      if (tx.SubJenis === 'Pinjam') { dr(w.kode, j, w.pemilik); cr(tierAkun(M, 'Utang', tx.Jangka), j, w.pemilik); }
      else if (tx.SubJenis === 'Beri pinjaman') { dr(tierAkun(M, 'Piutang', tx.Jangka), j, w.pemilik); cr(w.kode, j, w.pemilik); }
      else if (tx.SubJenis === 'Bayar utang') { dr(tierAkun(M, 'Utang', tx.Jangka), j, w.pemilik); cr(w.kode, j, w.pemilik); }
      else if (tx.SubJenis === 'Terima pelunasan') { dr(w.kode, j, w.pemilik); cr(tierAkun(M, 'Piutang', tx.Jangka), j, w.pemilik); }
    } else if (tx.Jenis === 'Saldo awal') {
      var eq = M.st.AkunSaldoAwal;
      if (tx.SubJenis === 'Dompet') { w = walletInfo(M, tx.Dompet); dr(w.kode, j, w.pemilik); cr(eq, j, w.pemilik); }
      else if (tx.SubJenis === 'Piutang') { dr(tierAkun(M, 'Piutang', tx.Jangka), j, own); cr(eq, j, own); }
      else if (tx.SubJenis === 'Utang') { dr(eq, j, own); cr(tierAkun(M, 'Utang', tx.Jangka), j, own); }
    }
    return L;
  }

  // ------------------------------------------------------------ form -> baris transaksi (validasi cepat)
  function clean(v) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().substr(0, 200); }

  function makeTx(f, user, M, txMap, opts) {
    opts = opts || {};
    var jenis = f.jenis, sub = f.subJenis || '';
    var waktu = f.waktu || nowLocal();
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(waktu) || !isDate(waktu.substr(0, 10))) throw new Error('Tanggal atau jam tidak valid');
    var tanggal = waktu.substr(0, 10);
    var jumlah = Number(f.jumlah);
    if (!(jumlah > 0) || Math.floor(jumlah) !== jumlah) throw new Error('Isi jumlah dengan angka rupiah lebih dari 0');
    var tx = {
      ID: f.id || newId(), Waktu: waktu, Jenis: jenis, SubJenis: '', Dompet: '', DompetTujuan: '', KodeAkun: '', Kategori: '',
      SubKategori: '', Pihak: '', Jumlah: jumlah, BiayaAdmin: '', JatuhTempo: '', Jangka: '', Toko: clean(f.toko),
      Lokasi: clean(f.lokasi), Barang: clean(f.barang), Tag: clean(f.tag), Catatan: clean(f.catatan), DicatatOleh: user,
      PemilikDompet: '', Status: 'Aktif', Referensi: '', Mengoreksi: f.mengoreksi || '', DibatalkanOleh: '',
      DibatalkanPada: '', DibuatPada: '', Rev: 0
    };
    var w, k;
    function kat(jn) {
      k = M.katByKode[f.kodeAkun];
      if (!f.kodeAkun) throw new Error('Pilih kategori');
      if (!k || !k.Aktif || k.Jenis !== jn) throw new Error('Kategori tidak valid');
      tx.KodeAkun = k.KodeAkun; tx.Kategori = k.Kategori; tx.SubKategori = k.SubKategori;
    }
    function dompet(nama) {
      if (!nama) throw new Error('Pilih dompet');
      return walletInfo(M, nama);
    }
    if (jenis === 'Income' || jenis === 'Expense') {
      w = dompet(f.dompet); kat(jenis);
      tx.Dompet = w.nama; tx.PemilikDompet = w.pemilik;
    } else if (jenis === 'Transfer') {
      var a = dompet(f.dompet), b = dompet(f.dompetTujuan);
      if (a.nama === b.nama) throw new Error('Dompet asal dan tujuan tidak boleh sama');
      tx.Dompet = a.nama; tx.DompetTujuan = b.nama; tx.PemilikDompet = a.pemilik;
      var fee = (f.biayaAdmin === '' || f.biayaAdmin == null) ? 0 : Number(f.biayaAdmin);
      if (!(fee >= 0) || Math.floor(fee) !== fee) throw new Error('Biaya admin harus angka rupiah');
      if (fee > 0) tx.BiayaAdmin = fee;
    } else if (jenis === 'Utang/Piutang') {
      if (SUB_UP.indexOf(sub) < 0) throw new Error('Pilih jenis: pinjam, bayar utang, beri pinjaman, atau terima pelunasan');
      tx.SubJenis = sub;
      w = dompet(f.dompet); tx.Dompet = w.nama; tx.PemilikDompet = w.pemilik;
      if (sub === 'Pinjam' || sub === 'Beri pinjaman') {
        var p = M.pihakByNama[clean(f.pihak).toLowerCase()];
        if (!p || !p.Aktif) throw new Error('Pilih pihak dari daftar atau tambahkan dulu');
        tx.Pihak = p.Nama;
        tx.JatuhTempo = f.jatuhTempo || '';
        tx.Jangka = jangka(tanggal, tx.JatuhTempo);
      } else {
        var loan = txMap[f.referensi];
        if (!loan || loan.Status !== 'Aktif') throw new Error('Pilih pinjaman yang dilunasi');
        var kind = loanKind(loan);
        if ((sub === 'Bayar utang' && kind !== 'Utang') || (sub === 'Terima pelunasan' && kind !== 'Piutang')) throw new Error('Pinjaman tidak cocok dengan jenis');
        var rest = sisa(txMap, loan.ID, opts.ignoreId);
        if (jumlah > rest) throw new Error('Melebihi sisa pinjaman (sisa ' + fmtRp(rest) + ')');
        tx.Referensi = loan.ID; tx.Pihak = loan.Pihak; tx.Jangka = loan.Jangka;
      }
    } else if (jenis === 'Saldo awal') {
      if (['Dompet', 'Piutang', 'Utang'].indexOf(sub) < 0) throw new Error('Pilih jenis saldo awal');
      tx.SubJenis = sub;
      if (sub === 'Dompet') { w = dompet(f.dompet); tx.Dompet = w.nama; tx.PemilikDompet = w.pemilik; }
      else {
        var own = f.pemilik || user;
        if (M.users.indexOf(own) < 0) throw new Error('Pemilik tidak dikenal');
        var pp = M.pihakByNama[clean(f.pihak).toLowerCase()];
        if (!pp || !pp.Aktif) throw new Error('Pilih pihak dari daftar atau tambahkan dulu');
        tx.PemilikDompet = own; tx.Pihak = pp.Nama; tx.JatuhTempo = f.jatuhTempo || '';
        tx.Jangka = jangka(tanggal, tx.JatuhTempo);
      }
    } else throw new Error('Pilih jenis transaksi');
    return tx;
  }

  // payload ke server = isian form apa adanya (server memvalidasi ulang)
  function toPayload(f) {
    return {
      id: f.id, waktu: f.waktu, jenis: f.jenis, subJenis: f.subJenis || '', dompet: f.dompet || '', dompetTujuan: f.dompetTujuan || '',
      kodeAkun: f.kodeAkun || '', pihak: f.pihak || '', jumlah: Number(f.jumlah), biayaAdmin: f.biayaAdmin === '' || f.biayaAdmin == null ? '' : Number(f.biayaAdmin),
      jatuhTempo: f.jatuhTempo || '', toko: f.toko || '', lokasi: f.lokasi || '', barang: f.barang || '', tag: f.tag || '',
      catatan: f.catatan || '', referensi: f.referensi || '', pemilik: f.pemilik || ''
    };
  }

  // ------------------------------------------------------------ baris jurnal efektif
  // S: {tx: {id: row}, jurnalByTx: {id: [baris jurnal server]}, M}
  function buildLines(S) {
    var out = [];
    for (var id in S.tx) {
      var t = S.tx[id];
      if (t.Status !== 'Aktif') continue;
      var tanggal = String(t.Waktu).substr(0, 10), src = !t._pending && S.jurnalByTx[id];
      if (src && src.length) {
        src.forEach(function (j) { out.push({txId: id, tanggal: tanggal, kode: String(j.KodeAkun), debit: Number(j.Debit), kredit: Number(j.Kredit), pemilik: j.Pemilik, pencatat: t.DicatatOleh}); });
      } else {
        var ls; try { ls = deriveLines(t, S.M); } catch (e) { ls = []; }
        ls.forEach(function (l) { out.push({txId: id, tanggal: tanggal, kode: String(l.kode), debit: l.debit, kredit: l.kredit, pemilik: l.pemilik, pencatat: t.DicatatOleh}); });
      }
    }
    return out;
  }

  function pass(l, f) {
    if (!f) return true;
    if (f.pemilik && f.pemilik !== 'Semua' && l.pemilik !== f.pemilik) return false;
    if (f.pencatat && f.pencatat !== 'Semua' && l.pencatat !== f.pencatat) return false;
    return true;
  }

  function saldoMap(lines, end, f) {
    var m = {};
    lines.forEach(function (l) {
      if (l.tanggal > end || !pass(l, f)) return;
      var r = m[l.kode] || (m[l.kode] = {d: 0, k: 0}); r.d += l.debit; r.k += l.kredit;
    });
    return m;
  }

  function walletBalances(lines, M, f) {
    var m = saldoMap(lines, '9999-12-31', f);
    return M.dompetAktif.filter(function (d) { return !f || !f.pemilik || f.pemilik === 'Semua' || d.Pemilik === f.pemilik; })
      .map(function (d) { var r = m[d.KodeAkun] || {d: 0, k: 0}; return {nama: d.Nama, kode: d.KodeAkun, pemilik: d.Pemilik, saldo: r.d - r.k}; });
  }

  function trialBalance(lines, M, end, f) {
    var m = saldoMap(lines, end, f), rows = [], td = 0, tk = 0;
    Object.keys(m).sort().forEach(function (kode) {
      var s = m[kode].d - m[kode].k; if (s === 0 && m[kode].d === 0) return;
      var a = M.akun[kode] || {Nama: kode, Tipe: ''};
      var d = s > 0 ? s : 0, k = s < 0 ? -s : 0;
      td += d; tk += k; rows.push({kode: kode, nama: a.Nama, tipe: a.Tipe, debit: d, kredit: k});
    });
    return {rows: rows, totalDebit: td, totalKredit: tk};
  }

  function incomeStatement(lines, M, start, end, f) {
    var m = {};
    lines.forEach(function (l) {
      if (l.tanggal < start || l.tanggal > end || !pass(l, f)) return;
      var r = m[l.kode] || (m[l.kode] = {d: 0, k: 0}); r.d += l.debit; r.k += l.kredit;
    });
    function group(tipe, sign) {
      var groups = {}, total = 0;
      Object.keys(m).sort().forEach(function (kode) {
        var a = M.akun[kode]; if (!a || a.Tipe !== tipe) return;
        var amt = sign * (m[kode].k - m[kode].d); if (amt === 0) return;
        var g = groups[a.Kelompok] || (groups[a.Kelompok] = {nama: a.Kelompok, rows: [], total: 0});
        g.rows.push({kode: kode, nama: a.Nama, jumlah: amt}); g.total += amt; total += amt;
      });
      var arr = Object.keys(groups).map(function (k) { return groups[k]; }).sort(function (a, b) { return b.total - a.total; });
      arr.forEach(function (g) { g.rows.sort(function (a, b) { return b.jumlah - a.jumlah; }); });
      return {groups: arr, total: total};
    }
    var p = group('Pendapatan', 1), b = group('Beban', -1);
    return {pendapatan: p, beban: {groups: b.groups, total: b.total}, laba: p.total - b.total};
  }

  function balanceSheet(lines, M, end, f) {
    var m = saldoMap(lines, end, f);
    var groups = {Aset: {}, Liabilitas: {}}, tot = {Aset: 0, Liabilitas: 0, Pendapatan: 0, Beban: 0, Ekuitas: 0};
    var saldoAwal = 0, ekuitasLain = [];
    Object.keys(m).sort().forEach(function (kode) {
      var a = M.akun[kode]; if (!a) return;
      var s = m[kode].d - m[kode].k;
      if (a.Tipe === 'Aset' || a.Tipe === 'Liabilitas') {
        var amt = a.Tipe === 'Aset' ? s : -s; if (amt === 0) return;
        var g = groups[a.Tipe][a.Kelompok] || (groups[a.Tipe][a.Kelompok] = {nama: a.Kelompok, rows: [], total: 0});
        g.rows.push({kode: kode, nama: a.Nama, jumlah: amt}); g.total += amt; tot[a.Tipe] += amt;
      } else if (a.Tipe === 'Pendapatan') tot.Pendapatan += -s;
      else if (a.Tipe === 'Beban') tot.Beban += s;
      else if (a.Tipe === 'Ekuitas') {
        if (kode === M.st.AkunSaldoAwal) saldoAwal += -s; else if (-s !== 0) ekuitasLain.push({nama: a.Nama, jumlah: -s});
      }
    });
    function arr(o) { return Object.keys(o).map(function (k) { return o[k]; }).sort(function (a, b) { return b.total - a.total; }); }
    var laba = tot.Pendapatan - tot.Beban;
    var ekLain = ekuitasLain.reduce(function (a, x) { return a + x.jumlah; }, 0);
    var transfer = tot.Aset - tot.Liabilitas - (saldoAwal + laba + ekLain);
    return {
      aset: {groups: arr(groups.Aset), total: tot.Aset}, liabilitas: {groups: arr(groups.Liabilitas), total: tot.Liabilitas},
      ekuitas: {saldoAwal: saldoAwal, laba: laba, lain: ekuitasLain, transferAntarPemilik: transfer, total: saldoAwal + laba + ekLain + transfer},
      seimbang: tot.Aset === tot.Liabilitas + saldoAwal + laba + ekLain + transfer
    };
  }

  // ------------------------------------------------------------ saran isian
  function freq(arr, n) {
    var c = {}, order = [];
    arr.forEach(function (v) { if (!v) return; if (!(v in c)) { c[v] = 0; order.push(v); } c[v]++; });
    order.sort(function (a, b) { return c[b] - c[a] || order.indexOf(a) - order.indexOf(b); });
    return order.slice(0, n);
  }
  function recent(txMap, pred, limit) {
    var rows = [];
    for (var k in txMap) { var t = txMap[k]; if (t.Status === 'Aktif' && (!pred || pred(t))) rows.push(t); }
    rows.sort(function (a, b) { return a.Waktu < b.Waktu ? 1 : (a.Waktu > b.Waktu ? -1 : 0); });
    return rows.slice(0, limit || 300);
  }

  return {
    pad: pad, fmtNum: fmtNum, fmtRp: fmtRp, nowLocal: nowLocal, todayLocal: todayLocal, isDate: isDate, addMonths: addMonths,
    jangka: jangka, newId: newId, fmtTgl: fmtTgl, fmtHari: fmtHari, periodRange: periodRange, indexMaster: indexMaster,
    loanKind: loanKind, isRepay: isRepay, sisa: sisa, openLoans: openLoans, saldoPihak: saldoPihak, deriveLines: deriveLines,
    makeTx: makeTx, toPayload: toPayload, buildLines: buildLines, saldoMap: saldoMap, walletBalances: walletBalances,
    trialBalance: trialBalance, incomeStatement: incomeStatement, balanceSheet: balanceSheet, freq: freq, recent: recent, clean: clean
  };
});
