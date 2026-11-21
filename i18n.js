/* Do it - teks antarmuka dua bahasa. Kunci yang tidak ada di 'en' memakai teks 'id'. */
(function (g) {
  'use strict';
  var STR = {
    id: {
      // umum
      'app.sync.ok': 'Tersinkron {0}', 'app.sync.never': 'Belum sinkron', 'app.sync.busy': 'Menyinkronkan…', 'app.sync.offline': 'Offline',
      'app.sync.wait': '{0} menunggu kirim', 'app.sync.failed': '{0} gagal dikirim', 'app.sync.auth': 'Kunci ditolak',
      'theme.auto': 'Tema: otomatis', 'theme.light': 'Tema: terang', 'theme.dark': 'Tema: gelap', 'lang.switch': 'Ganti bahasa',
      'back': 'Kembali', 'close': 'Tutup', 'save': 'Simpan', 'cancel': 'Batal', 'more': 'Tampilkan lebih banyak ({0})', 'others': '+ {0} lainnya',
      'see.all': 'Lihat semua', 'search': 'Cari…', 'nothing': 'Tidak ada yang cocok.', 'all': 'Semua',
      'saved': 'Tersimpan', 'canceled': 'Dibatalkan', 'need.net': 'Perlu koneksi internet.', 'server.old': 'Server belum diperbarui. Pasang Code.gs versi terbaru dulu.',
      // navigasi
      'nav.home': 'Beranda', 'nav.tx': 'Transaksi', 'nav.add': 'Catat', 'nav.report': 'Laporan', 'nav.menu': 'Menu',
      'pg.income': 'Pendapatan', 'pg.expense': 'Pengeluaran', 'pg.assets': 'Aset', 'pg.receivable': 'Piutang', 'pg.payable': 'Utang',
      'pg.parties': 'Pihak', 'pg.categories': 'Kategori', 'pg.opening': 'Saldo awal', 'pg.settings': 'Pengaturan',
      // periode
      'per.hari': 'Hari ini', 'per.bulan': 'Bulan ini', 'per.lalu': 'Bulan lalu', 'per.tahun': 'Tahun ini', 'per.semua': 'Semua',
      'per.vs': 'vs periode sebelumnya', 'per.alltime': 'Semua waktu', 'per.asof': 'Per {0}',
      // jenis
      'j.Income': 'Masuk', 'j.Expense': 'Keluar', 'j.Transfer': 'Pindah', 'j.Utang/Piutang': 'Utang/Piutang', 'j.Saldo awal': 'Saldo awal',
      's.Pinjam': 'Pinjam', 's.Bayar utang': 'Bayar utang', 's.Beri pinjaman': 'Beri pinjaman', 's.Terima pelunasan': 'Terima pelunasan',
      's.Dompet': 'Saldo aset', 's.Piutang': 'Piutang', 's.Utang': 'Utang', 'jg.Pendek': 'Pendek', 'jg.Menengah': 'Menengah', 'jg.Panjang': 'Panjang',
      // beranda
      'home.net': 'Kekayaan bersih', 'home.assets': 'Aset {0}', 'home.debt': 'Utang {0}', 'home.in': 'Masuk bulan ini', 'home.out': 'Keluar bulan ini',
      'home.recv': 'Piutang (dipinjamkan)', 'home.pay': 'Utang (dipinjam)', 'home.month': 'Bulan ini', 'home.assets.h': 'Aset', 'home.recent': 'Terakhir dicatat',
      'home.today.more': '+ {0} transaksi lain hari ini', 'home.empty.assets': 'Belum ada saldo. Isi lewat Menu, lalu Saldo awal.',
      'home.empty.tx': 'Belum ada transaksi. Ketuk tombol Catat.', 'home.empty.month': 'Belum ada', 'home.failed': '{0} perubahan gagal dikirim. Ketuk untuk melihat.',
      'home.authfail': 'Kunci ditolak server. Buka Menu, Pengaturan, lalu masuk lagi dengan kunci yang benar.',
      // transaksi
      'tx.search': 'Cari: kategori, toko, barang, pihak…', 'tx.void': 'Dibatalkan', 'tx.sum.in': 'Masuk', 'tx.sum.out': 'Keluar', 'tx.sum.net': 'Selisih',
      'tx.sum.count': '{0} transaksi', 'tx.empty': 'Belum ada transaksi.', 'tx.pending': 'menunggu', 'tx.failed': 'gagal', 'tx.by': 'oleh {0}',
      'tx.to': 'Pindah ke {0}', 'tx.opening': 'Saldo awal · {0}',
      // detail
      'd.title': 'Detail transaksi', 'd.type': 'Jenis', 'd.date': 'Tanggal', 'd.wallet': 'Aset', 'd.cat': 'Kategori', 'd.party': 'Pihak', 'd.due': 'Jatuh tempo',
      'd.fee': 'Biaya admin', 'd.shop': 'Toko', 'd.loc': 'Lokasi', 'd.item': 'Barang', 'd.tag': 'Tag', 'd.note': 'Catatan', 'd.by': 'Dicatat oleh',
      'd.owner': 'Pemilik aset', 'd.status': 'Status', 'd.corrects': 'Mengoreksi', 'd.loan': 'Pinjaman', 'd.journal': 'Jurnal', 'd.waiting': 'menunggu kirim',
      'd.blocked': 'Pinjaman ini sudah punya pelunasan. Batalkan pelunasannya dulu sebelum mengubah atau membatalkan pinjaman.',
      'd.failed': 'Gagal dikirim: {0}', 'd.cancel': 'Batalkan', 'd.correct': 'Koreksi', 'd.copy': 'Salin', 'd.sure': 'Ya, batalkan', 'd.no': 'Tidak jadi',
      'd.drop': 'Buang', 'd.retry': 'Ubah dan kirim ulang', 'd.cancel.open': 'Batalkan saldo awal', 'st.Aktif': 'Aktif', 'st.Dibatalkan': 'Dibatalkan',
      // form
      'f.new': 'Catat transaksi', 'f.fix': 'Koreksi transaksi', 'f.copy': 'Salin transaksi', 'f.opening': 'Saldo awal', 'f.cat': 'Kategori', 'f.allcat': 'Semua…',
      'f.payfrom': 'Bayar dari', 'f.payto': 'Masuk ke', 'f.from': 'Dari', 'f.to': 'Ke', 'f.fee': 'Biaya admin (opsional)', 'f.kind': 'Jenis',
      'f.lend': 'Beri pinjaman', 'f.recv': 'Terima pelunasan', 'f.borrow': 'Pinjam (saya berutang)', 'f.repay': 'Bayar utang', 'f.party': 'Pihak',
      'f.party.more': 'Cari / tambah…', 'f.due': 'Jatuh tempo', 'f.due.2w': '2 minggu', 'f.due.3m': '3 bulan', 'f.due.1y': '1 tahun', 'f.due.2y': '2 tahun',
      'f.tenor': 'Jangka: {0} (otomatis)', 'f.loan': 'Pinjaman yang dilunasi', 'f.noloan.Utang': 'Belum ada utang yang belum lunas.',
      'f.noloan.Piutang': 'Belum ada piutang yang belum lunas.', 'f.loan.line': 'Dari {0} · {1} · jatuh tempo {2}', 'f.loan.rest': 'sisa {0}',
      'f.money.in': 'Uang masuk ke', 'f.money.out': 'Uang keluar dari', 'f.opening.note': 'Saldo awal dicatat sekali saat mulai memakai aplikasi. Isi tanggal sebelum transaksi pertama.',
      'f.opening.kind.Dompet': 'Saldo aset', 'f.opening.kind.Piutang': 'Piutang', 'f.opening.kind.Utang': 'Utang', 'f.owner': 'Pemilik', 'f.date': 'Tanggal',
      'f.more': '+ Tambah detail (toko, lokasi, barang, catatan)', 'f.less': 'Sembunyikan detail', 'f.shop': 'Toko / tempat', 'f.loc': 'Lokasi', 'f.item': 'Barang',
      'f.tag': 'Tag', 'f.tag.ph': 'mis. bulanan, liburan', 'f.note': 'Catatan', 'f.when': 'Tanggal dan jam (kosong = sekarang)', 'f.save.fix': 'Simpan koreksi',
      'f.cat.title': 'Kategori', 'f.wallet.title': 'Pilih aset', 'f.party.title': 'Pilih pihak', 'f.party.add': 'Tambah "{0}"', 'f.party.add.s': 'Sebagai pihak baru',
      'f.wallet.more': 'Lainnya…', 'opening.saved': 'Saldo awal tersimpan',
      // halaman arus
      'flow.total.in': 'Total pendapatan', 'flow.total.out': 'Total pengeluaran', 'flow.bygroup': 'Per kategori', 'flow.list': 'Transaksi', 'flow.empty': 'Tidak ada transaksi di periode ini.',
      'flow.up': 'naik {0}%', 'flow.down': 'turun {0}%', 'flow.same': 'sama',
      // pinjaman
      'loan.total.Piutang': 'Total piutang belum lunas', 'loan.total.Utang': 'Total utang belum lunas', 'loan.overdue': 'lewat tempo', 'loan.due': 'tempo {0}',
      'loan.of': 'dari {0}', 'loan.act.Piutang': 'Terima pelunasan', 'loan.act.Utang': 'Bayar utang', 'loan.new.Piutang': '+ Beri pinjaman', 'loan.new.Utang': '+ Pinjam',
      'loan.empty.Piutang': 'Tidak ada piutang yang belum lunas.', 'loan.empty.Utang': 'Tidak ada utang yang belum lunas.',
      // aset
      'as.total': 'Total aset', 'as.add': 'Tambah aset', 'as.flow.in': 'Masuk', 'as.flow.out': 'Keluar', 'as.balance': 'Saldo', 'as.trend': 'Saldo 12 bulan terakhir',
      'as.owner': 'Pemilik: {0}', 'as.inactive': 'Aset nonaktif', 'as.note': 'Untuk menonaktifkan aset, buka sheet Dompet di Google Sheets dan isi Aktif = FALSE (jangan hapus baris).',
      'w.title': 'Tambah aset', 'w.name': 'Nama aset', 'w.name.ph': 'mis. Dana, BRI, Tabungan Haji', 'w.kind': 'Jenis', 'w.kind.Kas': 'Kas / e-wallet / bank',
      'w.kind.Investasi': 'Investasi', 'w.owner': 'Pemilik', 'w.saldo': 'Saldo awal (opsional)', 'w.note': 'Kode akun dibuat otomatis. Aset baru langsung muncul di HP lain.',
      'w.save': 'Simpan aset', 'w.saving': 'Menyimpan…', 'w.short': 'Nama minimal 2 huruf', 'w.dup': 'Aset itu sudah ada', 'w.ok': 'Aset ditambahkan',
      // pihak & kategori
      'p.add': 'Tambah pihak', 'p.count': '{0} pihak', 'p.added': 'Pihak ditambahkan', 'p.new.title': 'Tambah pihak baru',
      'k.add': 'Tambah subkategori', 'k.group': 'Kelompok', 'k.name': 'Nama subkategori', 'k.name.ph': 'mis. Kopi, Parkir Kantor', 'k.ok': 'Subkategori ditambahkan',
      'k.dup': 'Subkategori itu sudah ada', 'k.note': 'Kode akun dibuat otomatis di dalam kelompoknya dan langsung muncul di HP lain.', 'k.save': 'Simpan subkategori',
      // pengaturan
      'set.look': 'Tampilan', 'set.mode': 'Mode', 'set.mode.auto': 'Otomatis', 'set.mode.light': 'Terang', 'set.mode.dark': 'Gelap', 'set.palette': 'Warna',
      'set.pal.rose': 'Merah', 'set.pal.navy': 'Navy', 'set.pal.mono': 'Monokrom', 'set.lang': 'Bahasa', 'set.sync': 'Sinkron', 'set.queue': 'Antrean kirim',
      'set.queue.empty': 'Kosong', 'set.queue.n': '{0} menunggu', 'set.queue.f': ', {0} gagal', 'set.sync.now': 'Sinkron sekarang', 'set.device': 'Perangkat',
      'set.user': 'Masuk sebagai', 'set.server': 'Server', 'set.version': 'Versi', 'set.reload': 'Muat ulang semua data', 'set.logout': 'Keluar',
      'set.logout.q': 'Keluar dari aplikasi di HP ini? Data yang belum terkirim akan hilang.', 'set.note': 'Daftar akun, dompet, dan pengguna tetap bisa diubah di Google Sheets, lalu ketuk Muat ulang semua data.',
      'set.reloading': 'Memuat ulang…', 'q.add': 'Catat transaksi', 'q.batal': 'Batalkan transaksi', 'q.koreksi': 'Koreksi transaksi', 'q.pihak': 'Tambah pihak {0}', 'q.wait': 'Menunggu kirim',
      // laporan
      'r.is': 'Laba rugi', 'r.bs': 'Neraca', 'r.tb': 'Neraca saldo', 'r.jr': 'Jurnal', 'r.dim.owner': 'Pemilik aset', 'r.dim.rec': 'Pencatat', 'r.combined': 'Gabungan',
      'r.income': 'Pendapatan', 'r.expense': 'Beban', 'r.net': 'Laba (rugi) bersih', 'r.assets': 'Aset', 'r.liab': 'Liabilitas (utang)', 'r.equity': 'Ekuitas',
      'r.opening': 'Saldo awal', 'r.retained': 'Laba (rugi) ditahan', 'r.inter': 'Transfer antar pemilik', 'r.le': 'Liabilitas + Ekuitas',
      'r.unbal': 'Neraca tidak seimbang. Cek transaksi yang gagal atau akun yang diubah.', 'r.acct': 'Akun', 'r.dr': 'Debit', 'r.cr': 'Kredit', 'r.total': 'Total',
      'r.tbnote': 'Dengan filter per {0}, total bisa berbeda karena transfer antar pemilik.', 'r.nojr': 'Tidak ada jurnal di periode ini.', 'r.noact': 'Tidak ada transaksi di periode ini.',
      // setup
      'setup.p': 'Masukkan alamat server dan kunci pribadimu. Cukup sekali; keduanya tersimpan di HP ini.', 'setup.url': 'Alamat server (berakhiran /exec)',
      'setup.key': 'Kunci pribadi', 'setup.key.ph': '32 huruf dan angka', 'setup.go': 'Masuk', 'setup.checking': 'Memeriksa…',
      'setup.badurl': 'Alamat server harus berupa https://script.google.com/macros/s/…/exec', 'setup.nokey': 'Kunci belum diisi',
      'setup.auth': 'Kunci salah atau pengguna nonaktif.', 'setup.net': 'Tidak bisa menghubungi server. Cek alamat dan koneksi.',
      // galat dari core
      'e.Pilih kategori': 'Pilih kategori', 'e.Pilih dompet': 'Pilih aset'
    },
    en: {
      'app.sync.ok': 'Synced {0}', 'app.sync.never': 'Not synced yet', 'app.sync.busy': 'Syncing…', 'app.sync.offline': 'Offline',
      'app.sync.wait': '{0} waiting to send', 'app.sync.failed': '{0} failed to send', 'app.sync.auth': 'Key rejected',
      'theme.auto': 'Theme: auto', 'theme.light': 'Theme: light', 'theme.dark': 'Theme: dark', 'lang.switch': 'Switch language',
      'back': 'Back', 'close': 'Close', 'save': 'Save', 'cancel': 'Cancel', 'more': 'Show more ({0})', 'others': '+ {0} more',
      'see.all': 'See all', 'search': 'Search…', 'nothing': 'Nothing matches.', 'all': 'All',
      'saved': 'Saved', 'canceled': 'Cancelled', 'need.net': 'An internet connection is needed.', 'server.old': 'The server is not updated yet. Install the latest Code.gs first.',
      'nav.home': 'Home', 'nav.tx': 'Transactions', 'nav.add': 'Add', 'nav.report': 'Reports', 'nav.menu': 'Menu',
      'pg.income': 'Income', 'pg.expense': 'Expenses', 'pg.assets': 'Assets', 'pg.receivable': 'Receivables', 'pg.payable': 'Payables',
      'pg.parties': 'People', 'pg.categories': 'Categories', 'pg.opening': 'Opening balance', 'pg.settings': 'Settings',
      'per.hari': 'Today', 'per.bulan': 'This month', 'per.lalu': 'Last month', 'per.tahun': 'This year', 'per.semua': 'All',
      'per.vs': 'vs previous period', 'per.alltime': 'All time', 'per.asof': 'As of {0}',
      'j.Income': 'Income', 'j.Expense': 'Expense', 'j.Transfer': 'Transfer', 'j.Utang/Piutang': 'Loans', 'j.Saldo awal': 'Opening balance',
      's.Pinjam': 'Borrow', 's.Bayar utang': 'Repay debt', 's.Beri pinjaman': 'Lend', 's.Terima pelunasan': 'Receive repayment',
      's.Dompet': 'Asset balance', 's.Piutang': 'Receivable', 's.Utang': 'Payable', 'jg.Pendek': 'Short', 'jg.Menengah': 'Medium', 'jg.Panjang': 'Long',
      'home.net': 'Net worth', 'home.assets': 'Assets {0}', 'home.debt': 'Debts {0}', 'home.in': 'Income this month', 'home.out': 'Spent this month',
      'home.recv': 'Receivables (lent)', 'home.pay': 'Payables (borrowed)', 'home.month': 'This month', 'home.assets.h': 'Assets', 'home.recent': 'Recently added',
      'home.today.more': '+ {0} more today', 'home.empty.assets': 'No balances yet. Use Menu, then Opening balance.',
      'home.empty.tx': 'No transactions yet. Tap Add.', 'home.empty.month': 'Nothing yet', 'home.failed': '{0} changes failed to send. Tap to view.',
      'home.authfail': 'The server rejected your key. Open Menu, Settings, and sign in again with the right key.',
      'tx.search': 'Search: category, shop, item, person…', 'tx.void': 'Cancelled', 'tx.sum.in': 'In', 'tx.sum.out': 'Out', 'tx.sum.net': 'Net',
      'tx.sum.count': '{0} transactions', 'tx.empty': 'No transactions yet.', 'tx.pending': 'waiting', 'tx.failed': 'failed', 'tx.by': 'by {0}',
      'tx.to': 'Transfer to {0}', 'tx.opening': 'Opening balance · {0}',
      'd.title': 'Transaction details', 'd.type': 'Type', 'd.date': 'Date', 'd.wallet': 'Asset', 'd.cat': 'Category', 'd.party': 'Person', 'd.due': 'Due date',
      'd.fee': 'Admin fee', 'd.shop': 'Shop', 'd.loc': 'Location', 'd.item': 'Item', 'd.tag': 'Tag', 'd.note': 'Note', 'd.by': 'Recorded by',
      'd.owner': 'Asset owner', 'd.status': 'Status', 'd.corrects': 'Corrects', 'd.loan': 'Loan', 'd.journal': 'Journal', 'd.waiting': 'waiting to send',
      'd.blocked': 'This loan already has repayments. Cancel the repayments first before changing or cancelling the loan.',
      'd.failed': 'Failed to send: {0}', 'd.cancel': 'Cancel', 'd.correct': 'Correct', 'd.copy': 'Copy', 'd.sure': 'Yes, cancel it', 'd.no': 'Keep it',
      'd.drop': 'Discard', 'd.retry': 'Edit and resend', 'd.cancel.open': 'Cancel opening balance', 'st.Aktif': 'Active', 'st.Dibatalkan': 'Cancelled',
      'f.new': 'Add transaction', 'f.fix': 'Correct transaction', 'f.copy': 'Copy transaction', 'f.opening': 'Opening balance', 'f.cat': 'Category', 'f.allcat': 'All…',
      'f.payfrom': 'Paid from', 'f.payto': 'Received in', 'f.from': 'From', 'f.to': 'To', 'f.fee': 'Admin fee (optional)', 'f.kind': 'Type',
      'f.lend': 'Lend', 'f.recv': 'Receive repayment', 'f.borrow': 'Borrow (I owe)', 'f.repay': 'Repay debt', 'f.party': 'Person',
      'f.party.more': 'Search / add…', 'f.due': 'Due date', 'f.due.2w': '2 weeks', 'f.due.3m': '3 months', 'f.due.1y': '1 year', 'f.due.2y': '2 years',
      'f.tenor': 'Term: {0} (automatic)', 'f.loan': 'Loan being repaid', 'f.noloan.Utang': 'No unpaid debts.', 'f.noloan.Piutang': 'No unpaid receivables.',
      'f.loan.line': 'Of {0} · {1} · due {2}', 'f.loan.rest': '{0} left',
      'f.money.in': 'Money goes into', 'f.money.out': 'Money comes from', 'f.opening.note': 'Opening balances are recorded once when you start. Use a date before your first transaction.',
      'f.opening.kind.Dompet': 'Asset balance', 'f.opening.kind.Piutang': 'Receivable', 'f.opening.kind.Utang': 'Payable', 'f.owner': 'Owner', 'f.date': 'Date',
      'f.more': '+ Add details (shop, location, item, note)', 'f.less': 'Hide details', 'f.shop': 'Shop / place', 'f.loc': 'Location', 'f.item': 'Item',
      'f.tag': 'Tag', 'f.tag.ph': 'e.g. monthly, holiday', 'f.note': 'Note', 'f.when': 'Date and time (empty = now)', 'f.save.fix': 'Save correction',
      'f.cat.title': 'Category', 'f.wallet.title': 'Choose asset', 'f.party.title': 'Choose person', 'f.party.add': 'Add "{0}"', 'f.party.add.s': 'As a new person',
      'f.wallet.more': 'More…', 'opening.saved': 'Opening balance saved',
      'flow.total.in': 'Total income', 'flow.total.out': 'Total spending', 'flow.bygroup': 'By category', 'flow.list': 'Transactions', 'flow.empty': 'No transactions in this period.',
      'flow.up': 'up {0}%', 'flow.down': 'down {0}%', 'flow.same': 'unchanged',
      'loan.total.Piutang': 'Total unpaid receivables', 'loan.total.Utang': 'Total unpaid debts', 'loan.overdue': 'overdue', 'loan.due': 'due {0}',
      'loan.of': 'of {0}', 'loan.act.Piutang': 'Receive repayment', 'loan.act.Utang': 'Repay', 'loan.new.Piutang': '+ Lend', 'loan.new.Utang': '+ Borrow',
      'loan.empty.Piutang': 'No unpaid receivables.', 'loan.empty.Utang': 'No unpaid debts.',
      'as.total': 'Total assets', 'as.add': 'Add asset', 'as.flow.in': 'In', 'as.flow.out': 'Out', 'as.balance': 'Balance', 'as.trend': 'Balance, last 12 months',
      'as.owner': 'Owner: {0}', 'as.inactive': 'Inactive asset', 'as.note': 'To deactivate an asset, open the Dompet sheet in Google Sheets and set Aktif = FALSE (do not delete rows).',
      'w.title': 'Add asset', 'w.name': 'Asset name', 'w.name.ph': 'e.g. Dana, BRI, savings', 'w.kind': 'Type', 'w.kind.Kas': 'Cash / e-wallet / bank',
      'w.kind.Investasi': 'Investment', 'w.owner': 'Owner', 'w.saldo': 'Opening balance (optional)', 'w.note': 'The account code is created automatically. The new asset appears on other phones right away.',
      'w.save': 'Save asset', 'w.saving': 'Saving…', 'w.short': 'Name needs at least 2 letters', 'w.dup': 'That asset already exists', 'w.ok': 'Asset added',
      'p.add': 'Add person', 'p.count': '{0} people', 'p.added': 'Person added', 'p.new.title': 'Add a new person',
      'k.add': 'Add subcategory', 'k.group': 'Group', 'k.name': 'Subcategory name', 'k.name.ph': 'e.g. Coffee, Office parking', 'k.ok': 'Subcategory added',
      'k.dup': 'That subcategory already exists', 'k.note': 'The account code is created automatically inside its group and appears on other phones right away.', 'k.save': 'Save subcategory',
      'set.look': 'Appearance', 'set.mode': 'Mode', 'set.mode.auto': 'Auto', 'set.mode.light': 'Light', 'set.mode.dark': 'Dark', 'set.palette': 'Colour',
      'set.pal.rose': 'Rose', 'set.pal.navy': 'Navy', 'set.pal.mono': 'Mono', 'set.lang': 'Language', 'set.sync': 'Sync', 'set.queue': 'Send queue',
      'set.queue.empty': 'Empty', 'set.queue.n': '{0} waiting', 'set.queue.f': ', {0} failed', 'set.sync.now': 'Sync now', 'set.device': 'Device',
      'set.user': 'Signed in as', 'set.server': 'Server', 'set.version': 'Version', 'set.reload': 'Reload all data', 'set.logout': 'Sign out',
      'set.logout.q': 'Sign out on this phone? Unsent changes will be lost.', 'set.note': 'Accounts, wallets and users can still be edited in Google Sheets; then tap Reload all data.',
      'set.reloading': 'Reloading…', 'q.add': 'Add transaction', 'q.batal': 'Cancel transaction', 'q.koreksi': 'Correct transaction', 'q.pihak': 'Add person {0}', 'q.wait': 'Waiting to send',
      'r.is': 'Income statement', 'r.bs': 'Balance sheet', 'r.tb': 'Trial balance', 'r.jr': 'Journal', 'r.dim.owner': 'Asset owner', 'r.dim.rec': 'Recorder', 'r.combined': 'Combined',
      'r.income': 'Income', 'r.expense': 'Expenses', 'r.net': 'Net profit (loss)', 'r.assets': 'Assets', 'r.liab': 'Liabilities (debts)', 'r.equity': 'Equity',
      'r.opening': 'Opening balance', 'r.retained': 'Retained earnings', 'r.inter': 'Transfers between owners', 'r.le': 'Liabilities + Equity',
      'r.unbal': 'The balance sheet does not balance. Check failed transactions or changed accounts.', 'r.acct': 'Account', 'r.dr': 'Debit', 'r.cr': 'Credit', 'r.total': 'Total',
      'r.tbnote': 'Filtered by {0}, totals can differ because of transfers between owners.', 'r.nojr': 'No journal entries in this period.', 'r.noact': 'No transactions in this period.',
      'setup.p': 'Enter your server address and personal key. Just once; both are stored on this phone.', 'setup.url': 'Server address (ends with /exec)',
      'setup.key': 'Personal key', 'setup.key.ph': '32 letters and numbers', 'setup.go': 'Sign in', 'setup.checking': 'Checking…',
      'setup.badurl': 'The server address must look like https://script.google.com/macros/s/…/exec', 'setup.nokey': 'Enter your key',
      'setup.auth': 'Wrong key or inactive user.', 'setup.net': 'Cannot reach the server. Check the address and connection.',
      'e.Pilih kategori': 'Choose a category', 'e.Pilih dompet': 'Choose an asset', 'e.Isi jumlah dengan angka rupiah lebih dari 0': 'Enter an amount above 0',
      'e.Dompet asal dan tujuan tidak boleh sama': 'From and to must be different assets', 'e.Jatuh tempo wajib diisi': 'Enter a due date',
      'e.Jatuh tempo tidak boleh sebelum tanggal transaksi': 'The due date cannot be before the transaction date', 'e.Pilih pinjaman yang dilunasi': 'Choose the loan being repaid',
      'e.Pilih pihak dari daftar atau tambahkan dulu': 'Choose a person from the list or add them first', 'e.Pilih jenis saldo awal': 'Choose the opening balance type',
      'e.Tanggal atau jam tidak valid': 'Invalid date or time', 'e.Biaya admin harus angka rupiah': 'The admin fee must be a rupiah amount',
      'e.Pilih jenis: pinjam, bayar utang, beri pinjaman, atau terima pelunasan': 'Choose: borrow, repay, lend, or receive repayment',
      'e.Melebihi sisa pinjaman': 'More than what is left on the loan'
    }
  };
  var lang = 'id';
  function t(k) {
    var s = (STR[lang] && STR[lang][k] != null) ? STR[lang][k] : (STR.id[k] != null ? STR.id[k] : k), a = arguments;
    return String(s).replace(/\{(\d)\}/g, function (m, i) { return a[+i + 1] == null ? '' : a[+i + 1]; });
  }
  function tErr(msg) {
    if (lang === 'id') return msg;
    var keys = Object.keys(STR.en).filter(function (k) { return k.indexOf('e.') === 0; });
    for (var i = 0; i < keys.length; i++) { var src = keys[i].substr(2); if (msg === src || msg.indexOf(src) === 0) return STR.en[keys[i]] + msg.substr(src.length); }
    return msg;
  }
  g.I18N = {t: t, tErr: tErr, set: function (l) { lang = l === 'en' ? 'en' : 'id'; }, get: function () { return lang; }, STR: STR};
})(window);
