/* Do it v2.0 - teks tambahan + terjemahan nama akun/kategori. Memakai I18N.add(lang, obj) dan I18N.dn(nama). */
(function (g) {
  'use strict';
  var I = g.I18N;
  I.add = function (lang, obj) { var s = I.STR[lang] || (I.STR[lang] = {}); for (var k in obj) s[k] = obj[k]; };

  // ---------------------------------------------------------------- nama (Indonesia -> Inggris)
  var EN = {
    'Kas': 'Cash & Bank', 'Investasi': 'Investments', 'Piutang': 'Receivables', 'Piutang Pendek': 'Receivables (short)', 'Piutang Menengah': 'Receivables (medium)', 'Piutang Panjang': 'Receivables (long)',
    'Lancar': 'Current', 'Pendek': 'Short-term', 'Menengah': 'Medium-term', 'Panjang': 'Long-term', 'Utang Pendek': 'Payables (short)', 'Utang Menengah': 'Payables (medium)', 'Utang Panjang': 'Payables (long)',
    'Elektronik': 'Electronics', 'Bangunan': 'Property', 'Modal Awal': 'Opening equity', 'Saldo Laba': 'Retained earnings', 'Prive': 'Owner drawings', 'Keuntungan Belum Terealisasi': 'Unrealized gains',
    'Transfer Antar Akun': 'Inter-account transfers', 'Belum Diklasifikasikan': 'Unclassified',
    'Biaya Lainnya': 'Other Expenses', 'Bisnis': 'Business', 'Gaya Hidup': 'Lifestyle', 'Karir dan Kesehatan': 'Career & Health', 'Makan': 'Food', 'Pekerjaan': 'Employment', 'Pembelian dan Perawatan': 'Purchases & Maintenance',
    'Penerimaan': 'Other Income', 'Profesi': 'Professional', 'Sosial': 'Social', 'Tabungan dan Investasi': 'Savings & Investments', 'Tagihan': 'Bills', 'Transportasi': 'Transport',
    'Gaji Pokok': 'Basic Salary', 'Tunjangan Jabatan': 'Position Allowance', 'Tunjangan Kinerja': 'Performance Allowance', 'Tunjangan Makan': 'Meal Allowance', 'Tunjangan Beras': 'Rice Allowance', 'Tunjangan Hari Raya': 'Holiday Allowance (THR)',
    'Pembulatan': 'Rounding', 'Tunjangan Perjalanan Dinas': 'Business Trip Allowance', 'Bonus Kinerja': 'Performance Bonus', 'Uang Lembur': 'Overtime Pay', 'Bonus': 'Bonus', 'Honor': 'Honorarium',
    'Untung Jual Saham': 'Gain on Stock Sales', 'Arisan': 'Arisan (Rotating Savings)', 'Bunga Tabungan atau Bank': 'Bank Interest', 'Jual Barang': 'Sale of Goods', 'Refund': 'Refund', 'Warisan': 'Inheritance', 'Hadiah': 'Gifts Received',
    'Diskon atau Cashback': 'Discount or Cashback', 'Sarapan': 'Breakfast', 'Makan Siang': 'Lunch', 'Makan Malam': 'Dinner', 'Air Minum': 'Drinking Water', 'Jajan': 'Snacks', 'Minuman': 'Drinks', 'Bahan Makan dan Minum': 'Groceries',
    'Sewa Tempat Tinggal': 'Housing Rent', 'Listrik Pascabayar': 'Electricity (Postpaid)', 'Listrik Prabayar': 'Electricity (Prepaid)', 'Laundry': 'Laundry', 'Air PDAM': 'Water Utility', 'Wifi': 'Wi-Fi', 'Pulsa dan Kuota': 'Phone Credit & Data',
    'Aplikasi': 'Apps & Subscriptions', 'Iuran Kebersihan': 'Sanitation Fee', 'PBB': 'Property Tax', 'PPh': 'Income Tax', 'PPN': 'VAT', 'Pajak Restoran': 'Restaurant Tax', 'Barang': 'Goods', 'Pakaian': 'Clothing', 'Kendaraan': 'Vehicle',
    'Perawatan Pakaian': 'Clothing Care', 'Perawatan Elektronik': 'Electronics Care', 'Perawatan Kendaraan': 'Vehicle Care', 'KRL atau Commuter Line': 'Commuter Line (KRL)', 'Transjakarta atau BRT': 'Transjakarta / BRT', 'MRT dan LRT': 'MRT & LRT',
    'Ojol': 'Ride-hailing', 'Taksi': 'Taxi', 'BBM': 'Fuel', 'Tol dan Parkir': 'Tolls & Parking', 'Kereta Jarak Jauh': 'Long-distance Train', 'Bus dan Travel Jarak Jauh': 'Long-distance Bus & Shuttle', 'Pesawat': 'Flights', 'Fasilitas Umum': 'Public Facilities',
    'Asuransi Perjalanan': 'Travel Insurance', 'Kapal': 'Ferry / Ship', 'Sewa Kendaraan': 'Vehicle Rental', 'Rekreasi': 'Recreation', 'Hiburan': 'Entertainment', 'Olahraga': 'Sports', 'Vakansi': 'Vacation',
    'BPJS Kesehatan': 'BPJS Health Insurance', 'Potongan Gaji': 'Salary Deductions', 'Administrasi': 'Administration', 'Pendidikan': 'Education', 'Obat': 'Medicine', 'Cek atau Konsultasi': 'Check-ups & Consultations', 'Potong Rambut': 'Haircut',
    'Gym': 'Gym', 'Perawatan Gigi': 'Dental Care', 'Perawatan Mata': 'Eye Care', 'Perawatan Muka': 'Facial Care', 'Perawatan Badan': 'Body Care', 'Perawatan Rambut': 'Hair Care', 'Make Up': 'Make-up',
    'Keluarga': 'Family', 'Persembahan': 'Offerings', 'Kado': 'Gifts Given', 'Traktir': 'Treating Others', 'Donasi': 'Donations', 'Tips': 'Tips',
    'Rugi Jual Saham': 'Loss on Stock Sales', 'Biaya Arisan': 'Arisan Fees', 'Kerugian Aset': 'Asset Losses', 'Top Up': 'Top-up Fees', 'Transfer': 'Transfer Fees', 'Layanan': 'Service Fees', 'Pengiriman': 'Shipping',
    'Admin Bank': 'Bank Fees', 'Depresiasi': 'Depreciation', 'Meterai': 'Stamp Duty',
    'Rumah': 'House', 'Tanah': 'Land', 'Motor': 'Motorcycle', 'Laba': 'Retained Earnings', 'Laba Periode Berjalan': 'Current Period Earnings', 'Saldo Awal': 'Opening Balance', 'Potensi Untung Rugi': 'Unrealized Gain/Loss',
    'Kliring Transfer Antar Akun': 'Inter-account Transfer Clearing', 'Dompet': 'Wallet', 'Piutang Jangka Pendek': 'Receivables (short-term)', 'Piutang Jangka Menengah': 'Receivables (medium-term)', 'Piutang Jangka Panjang': 'Receivables (long-term)',
    'Utang Jangka Pendek': 'Payables (short-term)', 'Utang Jangka Menengah': 'Payables (medium-term)', 'Utang Jangka Panjang': 'Payables (long-term)', 'Utang Menengah 1': 'Medium-term Payable 1', 'Utang Panjang 1': 'Long-term Payable 1',
    'Adjust Gain': 'Balance Adjustment Gain', 'Adjust Loss': 'Balance Adjustment Loss'
  };
  var ID = {'Adjust Gain': 'Selisih Lebih Saldo', 'Adjust Loss': 'Selisih Kurang Saldo'};
  I.dn = function (name) {
    if (name == null) return name;
    name = String(name);
    if (I.get() === 'id') return ID[name] || name;
    if (EN[name]) return EN[name];
    var m = /^Piutang (.+)$/.exec(name); if (m) return 'Receivable ' + m[1];
    m = /^Utang ke (.+)$/.exec(name); if (m) return 'Payable to ' + m[1];
    return name;
  };

  // ---------------------------------------------------------------- teks Indonesia
  I.add('id', {
    'edit': 'Ubah', 'delete': 'Hapus',
    'pg.notif': 'Notifikasi', 'pg.debts': 'Utang Piutang', 'pg.rencana': 'Rencana', 'pg.portfolio': 'Portofolio',
    'per.other': 'Lainnya', 'per.title': 'Pilih periode', 'per.custom': 'Rentang tanggal sendiri', 'per.apply': 'Terapkan', 'per.7h': '7 hari terakhir', 'per.30h': '30 hari terakhir', 'per.3b': '3 bulan terakhir', 'per.tahunlalu': 'Tahun lalu',
    'exit.title': 'Keluar dari Do it?', 'exit.q': 'Yakin keluar dari aplikasi?', 'exit.no': 'Tetap di sini', 'exit.yes': 'Keluar',
    'p.rename': 'Ubah nama pihak', 'p.rename.name': 'Nama baru', 'p.rename.note': 'Nama baru berlaku untuk semua pinjaman dan transaksi pihak ini.', 'p.rename.exists': 'Nama "{0}" sudah dipakai pihak lain.', 'p.rename.queue': 'Masih ada perubahan yang menunggu dikirim. Tunggu sinkron dulu.', 'p.rename.ok': 'Nama diubah ({0} transaksi diperbarui)',
    'n.empty': 'Belum ada aktivitas 7 hari terakhir.', 'n.note': 'Aktivitas 7 hari terakhir', 'n.unread': '{0} belum dibaca', 'n.you': 'Kamu', 'n.many': '{0} perubahan baru, terakhir oleh {1}', 'n.tambah': 'mencatat', 'n.koreksi': 'mengoreksi', 'n.batal': 'membatalkan',
    'jpg.share': 'Bagikan sebagai gambar', 'jpg.making': 'Membuat gambar…', 'jpg.saved': 'Gambar diunduh', 'jpg.fail': 'Gagal membuat gambar',
    'd.repays': 'Riwayat pelunasan', 'd.left': 'Sisa', 'd.norepay': 'Belum ada pelunasan.', 'd.recur': 'Jadikan transaksi rutin',
    'debt.f.all': 'Semua', 'debt.sum': 'Piutang {0} · Utang {1}', 'debt.share': 'Bagikan', 'debt.iowe': 'Aku berutang', 'debt.theyowe': 'Dia berutang', 'debt.net': 'Selisih bersih', 'debt.net.in': 'Dia berutang {0}', 'debt.net.out': 'Aku berutang {0}', 'debt.net.even': 'Impas', 'debt.empty': 'Tidak ada utang piutang.', 'debt.doc.all': 'Utang Piutang', 'debt.doc.person': 'Utang Piutang · {0}',
    'r.tren': 'Tren', 'r.rasio': 'Rasio', 'r.alert': 'Peringatan', 'r.bva': 'Anggaran vs Realisasi',
    'home.budget': 'Anggaran bulan ini',
    // anggaran
    'rn.bl': 'Anggaran', 'rn.ev': 'Event', 'rn.gl': 'Tujuan', 'rn.rt': 'Rutin',
    'bl.total': 'Total anggaran', 'bl.used': 'Terpakai {0}', 'bl.over': 'Lebih {0}', 'bl.left': 'Sisa {0}', 'bl.proj': 'Proyeksi akhir bulan {0}', 'bl.used.of': '{0} dari {1}', 'bl.add': 'Tambah anggaran', 'bl.edit': 'Ubah anggaran', 'bl.realok': 'Realokasi', 'bl.empty': 'Belum ada anggaran. Mulai dari kategori, subkategori boleh menyusul.',
    'bl.carry': 'bawaan {0}', 'bl.detail': '{0} rincian', 'bl.ov': 'jumlah bulan ini diubah', 'bl.grp': 'Kategori', 'bl.sub': 'Subkategori', 'bl.pick': 'Pilih kategori', 'bl.rincian': 'Rincian (opsional)', 'bl.rincian.hint': 'mis. Sarapan 15.000 × 30 hari, atau Sewa kos 1.000.000 × 1', 'bl.r.name': 'Nama', 'bl.r.add': 'Tambah rincian', 'bl.r.total': 'Total rincian',
    'bl.amount': 'Jumlah per bulan', 'bl.rollover': 'Bawa sisa ke bulan depan', 'bl.rollover.hint': 'Hanya sisa positif yang dibawa. Kelebihan tidak mengurangi bulan depan.', 'bl.month.only': 'Jumlah khusus {0}', 'bl.month.ph': 'kosong = ikut biasa', 'bl.err.amount': 'Isi jumlah lebih dari 0.', 'bl.del.q': 'Hapus?',
    'ro.from': 'Ambil dari', 'ro.to': 'Pindahkan ke', 'ro.amount': 'Jumlah', 'ro.note': 'Hanya berlaku untuk bulan ini.', 'ro.err.pick': 'Pilih dua anggaran yang berbeda.', 'ro.err.left': 'Sisa anggaran asal hanya {0}.',
    'ev.add': 'Tambah event', 'ev.edit': 'Ubah event', 'ev.name': 'Nama event', 'ev.name.ph': 'mis. Liburan Bali', 'ev.tag': 'Tag transaksi', 'ev.tag.hint': 'Transaksi dengan tag ini otomatis dihitung ke event.', 'ev.from': 'Mulai', 'ev.to': 'Selesai', 'ev.budget': 'Total anggaran', 'ev.items': 'Rencana per kategori', 'ev.items.add': 'Tambah kategori', 'ev.empty': 'Belum ada event.', 'ev.spent': 'Terpakai {0}', 'ev.tx': 'Lihat {0} transaksi',
    'gl.add': 'Tambah tujuan', 'gl.edit': 'Ubah tujuan', 'gl.name': 'Nama tujuan', 'gl.name.ph': 'mis. Dana nikah, Beli motor', 'gl.target': 'Target', 'gl.due': 'Tenggat (opsional)', 'gl.wallets': 'Aset terkait', 'gl.wallets.hint': 'Saldo aset ini dihitung sebagai terkumpul.', 'gl.wallet.add': 'Tambah aset', 'gl.start': 'Terkumpul di luar aset (opsional)',
    'gl.deposit': 'Setoran manual', 'gl.deposit.amt': 'Jumlah setoran', 'gl.empty': 'Belum ada tujuan.', 'gl.by': 'sampai {0}', 'gl.s.done': 'Tercapai', 'gl.s.late': 'Lewat tenggat', 'gl.s.go': 'Berjalan', 'gl.s.nodue': 'Tanpa tenggat', 'gl.remain': 'Kurang {0}', 'gl.permonth': 'Perlu {0} per bulan ({1} bulan lagi)', 'gl.linked': 'Aset: {0}',
    'rt.new': 'Transaksi rutin baru', 'rt.edit': 'Ubah transaksi rutin', 'rt.name': 'Nama', 'rt.amount': 'Jumlah', 'rt.freq': 'Pengulangan', 'rt.f.w1': 'Tiap minggu', 'rt.f.w2': 'Tiap 2 minggu', 'rt.f.m1': 'Tiap bulan', 'rt.f.y1': 'Tiap tahun', 'rt.next': 'Jatuh tempo berikutnya', 'rt.end': 'Berakhir (opsional)', 'rt.active': 'Aktif',
    'rt.note': 'Tidak dicatat otomatis. Kamu tetap konfirmasi tiap jatuh tempo.', 'rt.h.due': 'Rutin jatuh tempo', 'rt.h.sug': 'Rutin terdeteksi', 'rt.h.all': 'Semua transaksi rutin', 'rt.empty': 'Belum ada transaksi rutin.', 'rt.due': 'Jatuh tempo {0}', 'rt.more': '{0} lagi tertunda', 'rt.log': 'Catat', 'rt.change': 'Ubah jumlah', 'rt.skip': 'Lewati', 'rt.skipped': 'Dilewati',
    'rt.sug': '{0} · {1}', 'rt.sug.s': '{0}, {1} kali tercatat, dari {2}', 'rt.make': 'Jadikan rutin', 'rt.notroutine': 'Bukan rutin', 'rt.made': 'Transaksi rutin dibuat', 'rt.paused': 'jeda', 'rt.next.on': 'berikutnya {0}', 'rt.ended': 'selesai', 'rt.err.date': 'Isi tanggal.',
    // portofolio
    'po.value': 'Nilai portofolio', 'po.cost': 'Modal {0}', 'po.realized': 'Untung rugi terealisasi', 'po.unreal': 'Belum terealisasi', 'po.note': 'Portofolio hanya alat analisis, tidak masuk pembukuan.', 'po.add': 'Tambah aset investasi', 'po.empty': 'Belum ada aset investasi.', 'po.alloc': 'Alokasi aset', 'po.total': 'Total',
    'po.k.emas': 'Emas', 'po.k.saham': 'Saham', 'po.k.reksadana': 'Reksa dana', 'po.k.sbn': 'SBN', 'po.k.deposito': 'Deposito', 'po.k.kripto': 'Kripto', 'po.k.lainnya': 'Lainnya',
    'po.closed': 'selesai', 'po.fixed.s': 'Bunga {0}% · tempo {1}', 'po.unit.s': '{0} unit · {1}', 'po.name': 'Nama', 'po.class': 'Kelas aset', 'po.units': 'Jumlah unit', 'po.buyprice': 'Harga beli per unit', 'po.price': 'Harga sekarang per unit', 'po.upd': 'Perbarui harga', 'po.buy': 'Beli', 'po.sell': 'Jual', 'po.avg': 'Harga rata-rata', 'po.lots': 'Riwayat transaksi', 'po.pricehist': 'Riwayat harga',
    'po.fee': 'biaya {0}', 'po.fee.l': 'Biaya (opsional)', 'po.xirr': 'Imbal hasil tahunan sekitar {0}', 'po.year': 'tahun', 'po.f.pokok': 'Pokok', 'po.f.bunga': 'Bunga', 'po.f.mulai': 'Mulai', 'po.f.tempo': 'Jatuh tempo', 'po.f.pajak': 'Pajak', 'po.f.accrued': 'Bunga berjalan (setelah pajak)',
    'po.cair': 'Cairkan', 'po.cair.amt': 'Jumlah diterima', 'po.cair.note': 'Selisih dengan pokok dicatat sebagai untung realisasi di portofolio saja.', 'po.cair.done': 'Dicairkan {0}, diterima {1}', 'po.err.num': 'Isi angka yang valid.', 'po.err.sell': 'Unit yang dimiliki hanya {0}.',
    // analisis
    'an.inout': 'Pendapatan dan beban {0} bulan', 'an.avg.in': 'Rata-rata pendapatan', 'an.avg.out': 'Rata-rata beban', 'an.avg.net': 'Rata-rata selisih', 'an.this': 'Selisih bulan ini', 'an.networth': 'Kekayaan bersih', 'an.cat': 'Beban per kategori', 'an.cat.s': 'rata-rata {0}', 'an.last': '{0} bulan terakhir',
    'ra.tabungan': 'Rasio tabungan', 'ra.darurat': 'Dana darurat', 'ra.utang': 'Utang terhadap aset', 'ra.cicilan': 'Cicilan terhadap pendapatan', 'ra.likuiditas': 'Likuiditas', 'ra.investasi': 'Porsi investasi', 'ra.ok': 'Sesuai', 'ra.no': 'Perlu perhatian', 'ra.months': '{0} bulan', 'ra.t.min': 'Target minimal {0}', 'ra.t.minm': 'Target minimal {0} bulan pengeluaran', 'ra.t.max': 'Batas maksimal {0}', 'ra.t.info': 'Acuan umum: 10% atau lebih',
    'ra.note': 'Target dapat berbeda untuk tiap keluarga. Angka ini hanya panduan.',
    'al.empty': 'Belum ada cukup data untuk dianalisis.', 'al.action': 'Saran:', 'al.home': '{0} hal perlu perhatian',
    'w.defisit': 'Bulan ini pengeluaran melebihi pendapatan sebesar Rp {0}.', 'a.defisit': 'Tinjau pengeluaran terbesar dan tunda pembelian yang belum mendesak.',
    'w.tabungan.rendah': 'Rasio tabungan hanya {0}%.', 'a.tabungan.rendah': 'Sisihkan tabungan di awal bulan sebelum membelanjakan, mulai dari 10%.',
    'w.tabungan.kurang': 'Rasio tabungan {0}%, di bawah target 25%.', 'a.tabungan.kurang': 'Cari satu atau dua pos yang bisa dipangkas agar tabungan naik bertahap.',
    'w.tabungan.baik': 'Rasio tabungan {0}%, mencapai target.', 'a.tabungan.baik': '',
    'w.darurat.rendah': 'Dana darurat baru cukup {0} bulan pengeluaran.', 'a.darurat.rendah': 'Prioritaskan mengisi dana darurat sampai minimal 3 bulan, lalu 6 bulan.',
    'w.darurat.cukup': 'Dana darurat {0} bulan, target 6 bulan.', 'a.darurat.cukup': 'Lanjutkan menabung ke aset yang mudah dicairkan.',
    'w.darurat.baik': 'Dana darurat {0} bulan, sudah aman.', 'a.darurat.baik': '',
    'w.utang.tinggi': 'Utang mencapai {0}% dari aset.', 'a.utang.tinggi': 'Hentikan utang baru dan lunasi yang bunganya paling tinggi lebih dulu.',
    'w.utang.sedang': 'Utang {0}% dari aset, di atas batas 25%.', 'a.utang.sedang': 'Percepat pelunasan dan hindari tambahan utang.',
    'w.utang.baik': 'Utang {0}% dari aset, masih aman.', 'a.utang.baik': '',
    'w.cicilan.tinggi': 'Cicilan {0}% dari pendapatan, sangat berat.', 'a.cicilan.tinggi': 'Cari cara menurunkan cicilan, misalnya pelunasan sebagian atau penjadwalan ulang.',
    'w.cicilan.sedang': 'Cicilan {0}% dari pendapatan, di atas batas 30%.', 'a.cicilan.sedang': 'Jangan menambah cicilan baru sampai rasionya turun.',
    'w.likuiditas': 'Kas hanya {0}× utang jangka pendek.', 'a.likuiditas': 'Siapkan kas untuk melunasi utang jangka pendek tepat waktu.',
    'w.investasi.rendah': 'Porsi investasi baru {0}% dari aset.', 'a.investasi.rendah': 'Tabunganmu sehat. Pertimbangkan menyalurkan sebagian ke investasi sesuai profil risiko.',
    'w.beban.naik': 'Pengeluaran bulan ini naik {0}% dari rata-rata.', 'a.beban.naik': 'Lihat tab Tren untuk kategori yang melonjak.',
    'w.tren.beban': 'Pengeluaran cenderung naik sementara pendapatan tidak.', 'a.tren.beban': 'Tetapkan anggaran untuk kategori yang naik terus.',
    'w.kategori.dominan': '{0} menyerap {1}% pengeluaran bulan ini.', 'a.kategori.dominan': 'Periksa apakah porsi ini wajar atau bisa ditekan.',
    'w.anggaran.lewat': 'Anggaran terlampaui: {0}.', 'a.anggaran.lewat': 'Geser anggaran dari pos yang masih longgar lewat Realokasi.',
    'w.piutang.lewat': '{0} piutang lewat jatuh tempo.', 'a.piutang.lewat': 'Hubungi peminjam untuk menagih atau sepakati jadwal baru.',
    'w.utang.lewat': '{0} utang lewat jatuh tempo.', 'a.utang.lewat': 'Bayar atau hubungi pemberi pinjaman untuk jadwal baru.',
    'bva.empty': 'Belum ada anggaran untuk dibandingkan.', 'bva.budget': 'Anggaran', 'bva.actual': 'Realisasi', 'bva.diff': 'Sisa', 'bva.nobudget': 'Belum dianggarkan'
  });

  // ---------------------------------------------------------------- English
  I.add('en', {
    'edit': 'Edit', 'delete': 'Delete',
    'pg.notif': 'Notifications', 'pg.debts': 'Debts & Loans', 'pg.rencana': 'Plan', 'pg.portfolio': 'Portfolio',
    'per.other': 'More', 'per.title': 'Choose period', 'per.custom': 'Custom date range', 'per.apply': 'Apply', 'per.7h': 'Last 7 days', 'per.30h': 'Last 30 days', 'per.3b': 'Last 3 months', 'per.tahunlalu': 'Last year',
    'exit.title': 'Leave Do it?', 'exit.q': 'Are you sure you want to leave the app?', 'exit.no': 'Stay', 'exit.yes': 'Leave',
    'p.rename': 'Rename person', 'p.rename.name': 'New name', 'p.rename.note': 'The new name applies to all loans and transactions with this person.', 'p.rename.exists': 'The name "{0}" is already used by someone else.', 'p.rename.queue': 'Some changes are still waiting to be sent. Wait for sync first.', 'p.rename.ok': 'Renamed ({0} transactions updated)',
    'n.empty': 'No activity in the last 7 days.', 'n.note': 'Activity in the last 7 days', 'n.unread': '{0} unread', 'n.you': 'You', 'n.many': '{0} new changes, latest by {1}', 'n.tambah': 'recorded', 'n.koreksi': 'corrected', 'n.batal': 'cancelled',
    'jpg.share': 'Share as image', 'jpg.making': 'Making image…', 'jpg.saved': 'Image downloaded', 'jpg.fail': 'Could not make the image',
    'd.repays': 'Repayment history', 'd.left': 'Remaining', 'd.norepay': 'No repayments yet.', 'd.recur': 'Make recurring',
    'debt.f.all': 'All', 'debt.sum': 'Receivable {0} · Payable {1}', 'debt.share': 'Share', 'debt.iowe': 'I owe', 'debt.theyowe': 'They owe me', 'debt.net': 'Net', 'debt.net.in': 'They owe {0}', 'debt.net.out': 'I owe {0}', 'debt.net.even': 'Even', 'debt.empty': 'No debts or loans.', 'debt.doc.all': 'Debts & Loans', 'debt.doc.person': 'Debts & Loans · {0}',
    'r.tren': 'Trends', 'r.rasio': 'Ratios', 'r.alert': 'Alerts', 'r.bva': 'Budget vs Actual',
    'home.budget': 'This month\'s budget',
    'rn.bl': 'Budget', 'rn.ev': 'Events', 'rn.gl': 'Goals', 'rn.rt': 'Recurring',
    'bl.total': 'Total budget', 'bl.used': 'Spent {0}', 'bl.over': 'Over by {0}', 'bl.left': '{0} left', 'bl.proj': 'Projected month-end {0}', 'bl.used.of': '{0} of {1}', 'bl.add': 'Add budget', 'bl.edit': 'Edit budget', 'bl.realok': 'Reallocate', 'bl.empty': 'No budgets yet. Start with a category; subcategories can come later.',
    'bl.carry': 'carried {0}', 'bl.detail': '{0} items', 'bl.ov': 'amount changed for this month', 'bl.grp': 'Category', 'bl.sub': 'Subcategory', 'bl.pick': 'Choose a category', 'bl.rincian': 'Breakdown (optional)', 'bl.rincian.hint': 'e.g. Breakfast 15,000 × 30 days, or Rent 1,000,000 × 1', 'bl.r.name': 'Name', 'bl.r.add': 'Add item', 'bl.r.total': 'Breakdown total',
    'bl.amount': 'Amount per month', 'bl.rollover': 'Carry leftover to next month', 'bl.rollover.hint': 'Only a positive leftover is carried. Overspending does not reduce next month.', 'bl.month.only': 'Special amount for {0}', 'bl.month.ph': 'empty = as usual', 'bl.err.amount': 'Enter an amount above 0.', 'bl.del.q': 'Delete?',
    'ro.from': 'Take from', 'ro.to': 'Move to', 'ro.amount': 'Amount', 'ro.note': 'Applies to this month only.', 'ro.err.pick': 'Choose two different budgets.', 'ro.err.left': 'The source budget only has {0} left.',
    'ev.add': 'Add event', 'ev.edit': 'Edit event', 'ev.name': 'Event name', 'ev.name.ph': 'e.g. Bali trip', 'ev.tag': 'Transaction tag', 'ev.tag.hint': 'Transactions with this tag count toward the event automatically.', 'ev.from': 'Start', 'ev.to': 'End', 'ev.budget': 'Total budget', 'ev.items': 'Plan by category', 'ev.items.add': 'Add category', 'ev.empty': 'No events yet.', 'ev.spent': 'Spent {0}', 'ev.tx': 'View {0} transactions',
    'gl.add': 'Add goal', 'gl.edit': 'Edit goal', 'gl.name': 'Goal name', 'gl.name.ph': 'e.g. Wedding fund, New bike', 'gl.target': 'Target', 'gl.due': 'Deadline (optional)', 'gl.wallets': 'Linked assets', 'gl.wallets.hint': 'Balances of these assets count as saved.', 'gl.wallet.add': 'Add asset', 'gl.start': 'Saved outside assets (optional)',
    'gl.deposit': 'Manual deposit', 'gl.deposit.amt': 'Deposit amount', 'gl.empty': 'No goals yet.', 'gl.by': 'by {0}', 'gl.s.done': 'Reached', 'gl.s.late': 'Past deadline', 'gl.s.go': 'In progress', 'gl.s.nodue': 'No deadline', 'gl.remain': '{0} to go', 'gl.permonth': 'Need {0} per month ({1} months left)', 'gl.linked': 'Assets: {0}',
    'rt.new': 'New recurring transaction', 'rt.edit': 'Edit recurring transaction', 'rt.name': 'Name', 'rt.amount': 'Amount', 'rt.freq': 'Repeats', 'rt.f.w1': 'Weekly', 'rt.f.w2': 'Every 2 weeks', 'rt.f.m1': 'Monthly', 'rt.f.y1': 'Yearly', 'rt.next': 'Next due date', 'rt.end': 'Ends (optional)', 'rt.active': 'Active',
    'rt.note': 'Never recorded automatically. You confirm each due date.', 'rt.h.due': 'Recurring due', 'rt.h.sug': 'Detected recurring', 'rt.h.all': 'All recurring transactions', 'rt.empty': 'No recurring transactions yet.', 'rt.due': 'Due {0}', 'rt.more': '{0} more pending', 'rt.log': 'Record', 'rt.change': 'Change amount', 'rt.skip': 'Skip', 'rt.skipped': 'Skipped',
    'rt.sug': '{0} · {1}', 'rt.sug.s': '{0}, seen {1} times, from {2}', 'rt.make': 'Make recurring', 'rt.notroutine': 'Not recurring', 'rt.made': 'Recurring transaction created', 'rt.paused': 'paused', 'rt.next.on': 'next {0}', 'rt.ended': 'ended', 'rt.err.date': 'Enter a date.',
    'po.value': 'Portfolio value', 'po.cost': 'Cost {0}', 'po.realized': 'Realized gain/loss', 'po.unreal': 'Unrealized', 'po.note': 'The portfolio is an analysis tool only and is not posted to your books.', 'po.add': 'Add investment', 'po.empty': 'No investments yet.', 'po.alloc': 'Asset allocation', 'po.total': 'Total',
    'po.k.emas': 'Gold', 'po.k.saham': 'Stocks', 'po.k.reksadana': 'Mutual funds', 'po.k.sbn': 'Gov. bonds (SBN)', 'po.k.deposito': 'Time deposit', 'po.k.kripto': 'Crypto', 'po.k.lainnya': 'Other',
    'po.closed': 'closed', 'po.fixed.s': '{0}% interest · matures {1}', 'po.unit.s': '{0} units · {1}', 'po.name': 'Name', 'po.class': 'Asset class', 'po.units': 'Units', 'po.buyprice': 'Buy price per unit', 'po.price': 'Current price per unit', 'po.upd': 'Update price', 'po.buy': 'Buy', 'po.sell': 'Sell', 'po.avg': 'Average price', 'po.lots': 'Transactions', 'po.pricehist': 'Price history',
    'po.fee': 'fee {0}', 'po.fee.l': 'Fee (optional)', 'po.xirr': 'Annualized return about {0}', 'po.year': 'year', 'po.f.pokok': 'Principal', 'po.f.bunga': 'Interest', 'po.f.mulai': 'Start', 'po.f.tempo': 'Maturity', 'po.f.pajak': 'Tax', 'po.f.accrued': 'Accrued interest (after tax)',
    'po.cair': 'Redeem', 'po.cair.amt': 'Amount received', 'po.cair.note': 'The difference from principal is recorded as realized gain in the portfolio only.', 'po.cair.done': 'Redeemed {0}, received {1}', 'po.err.num': 'Enter a valid number.', 'po.err.sell': 'You only hold {0} units.',
    'an.inout': 'Income and expenses, {0} months', 'an.avg.in': 'Average income', 'an.avg.out': 'Average expenses', 'an.avg.net': 'Average surplus', 'an.this': 'This month\'s surplus', 'an.networth': 'Net worth', 'an.cat': 'Expenses by category', 'an.cat.s': 'average {0}', 'an.last': 'Last {0} months',
    'ra.tabungan': 'Savings ratio', 'ra.darurat': 'Emergency fund', 'ra.utang': 'Debt to assets', 'ra.cicilan': 'Debt payments to income', 'ra.likuiditas': 'Liquidity', 'ra.investasi': 'Investment share', 'ra.ok': 'On target', 'ra.no': 'Needs attention', 'ra.months': '{0} months', 'ra.t.min': 'Target at least {0}', 'ra.t.minm': 'Target at least {0} months of expenses', 'ra.t.max': 'Limit {0}', 'ra.t.info': 'Common guide: 10% or more',
    'ra.note': 'Targets differ for each family. These numbers are only a guide.',
    'al.empty': 'Not enough data to analyze yet.', 'al.action': 'Suggestion:', 'al.home': '{0} things need attention',
    'w.defisit': 'This month spending exceeds income by Rp {0}.', 'a.defisit': 'Review the biggest expenses and postpone non-urgent purchases.',
    'w.tabungan.rendah': 'Savings ratio is only {0}%.', 'a.tabungan.rendah': 'Set savings aside at the start of the month, beginning with 10%.',
    'w.tabungan.kurang': 'Savings ratio is {0}%, below the 25% target.', 'a.tabungan.kurang': 'Find one or two items to trim so savings rise gradually.',
    'w.tabungan.baik': 'Savings ratio is {0}%, on target.', 'a.tabungan.baik': '',
    'w.darurat.rendah': 'Emergency fund covers only {0} months of expenses.', 'a.darurat.rendah': 'Make the emergency fund a priority: first 3 months, then 6.',
    'w.darurat.cukup': 'Emergency fund is {0} months, target is 6.', 'a.darurat.cukup': 'Keep saving into easily accessible assets.',
    'w.darurat.baik': 'Emergency fund is {0} months, well covered.', 'a.darurat.baik': '',
    'w.utang.tinggi': 'Debt is {0}% of assets.', 'a.utang.tinggi': 'Stop new borrowing and repay the highest-interest debt first.',
    'w.utang.sedang': 'Debt is {0}% of assets, above the 25% limit.', 'a.utang.sedang': 'Speed up repayment and avoid new debt.',
    'w.utang.baik': 'Debt is {0}% of assets, still healthy.', 'a.utang.baik': '',
    'w.cicilan.tinggi': 'Debt payments are {0}% of income, very heavy.', 'a.cicilan.tinggi': 'Look for ways to lower payments, such as partial repayment or rescheduling.',
    'w.cicilan.sedang': 'Debt payments are {0}% of income, above the 30% limit.', 'a.cicilan.sedang': 'Do not add new installments until the ratio falls.',
    'w.likuiditas': 'Cash is only {0}× short-term debt.', 'a.likuiditas': 'Keep enough cash to repay short-term debt on time.',
    'w.investasi.rendah': 'Investments are only {0}% of assets.', 'a.investasi.rendah': 'Your savings are healthy. Consider investing part of them to match your risk profile.',
    'w.beban.naik': 'This month\'s spending is {0}% above average.', 'a.beban.naik': 'Check the Trends tab for the categories that jumped.',
    'w.tren.beban': 'Spending is trending up while income is not.', 'a.tren.beban': 'Set budgets for the categories that keep rising.',
    'w.kategori.dominan': '{0} takes {1}% of this month\'s spending.', 'a.kategori.dominan': 'Check whether this share is reasonable or can be reduced.',
    'w.anggaran.lewat': 'Budgets exceeded: {0}.', 'a.anggaran.lewat': 'Shift budget from items with room using Reallocate.',
    'w.piutang.lewat': '{0} receivables are overdue.', 'a.piutang.lewat': 'Contact the borrower to collect or agree a new schedule.',
    'w.utang.lewat': '{0} debts are overdue.', 'a.utang.lewat': 'Pay, or contact the lender for a new schedule.',
    'bva.empty': 'No budgets to compare yet.', 'bva.budget': 'Budget', 'bva.actual': 'Actual', 'bva.diff': 'Remaining', 'bva.nobudget': 'Not budgeted'
  });
})(window);
