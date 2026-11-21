/* Do it v2.2 - teks tambahan: tanggal & jam, foto profil, foto kartu utama. */
(function (w) {
  var I = w.I18N;
  I.add('id', {
    'f.dt': 'Tanggal & jam', 'f.d.0': 'Hari ini', 'f.d.1': 'Kemarin', 'f.d.2': '2 hari lalu', 'f.d.pick': 'Pilih tanggal', 'f.d.clear': 'Kosongkan',
    'f.d.prev': 'Hari sebelumnya', 'f.d.next': 'Hari berikutnya', 'f.t': 'Jam (24 jam)', 'f.t.now': 'Sekarang', 'f.t.pagi': 'Pagi', 'f.t.siang': 'Siang', 'f.t.sore': 'Sore', 'f.t.malam': 'Malam',
    'f.t.min': 'mnt', 'f.t.live': 'Jam mengikuti waktu saat disimpan.', 'f.t.bad': 'Jam tidak valid. Contoh: 0730 atau 1530.',
    'f.copy.orig': 'Sesuai yang disalin', 'f.copy.now': 'Sekarang',
    'av.t': 'Foto profil', 'av.change': 'Ganti foto', 'av.del': 'Hapus foto', 'av.mine': 'Foto kamu', 'av.other': 'Hanya {0} yang bisa mengganti fotonya.',
    'av.saved': 'Foto profil disimpan', 'av.deleted': 'Foto profil dihapus', 'av.fail': 'Foto gagal disimpan. Periksa koneksi lalu coba lagi.', 'av.note': 'Foto profil tampil di kedua HP. Foto diperkecil otomatis.',
    'av.srv': 'Server belum diperbarui ke v2.2, jadi foto profil belum bisa disimpan.',
    'cp.t': 'Foto kartu utama', 'cp.s': 'Latar kartu Kekayaan bersih. Hanya tersimpan di HP ini.', 'cp.pick': 'Pilih foto', 'cp.change': 'Ganti foto', 'cp.del': 'Hapus foto',
    'cp.blur': 'Blur', 'cp.blur.0': 'Tidak', 'cp.blur.1': 'Sedikit', 'cp.blur.2': 'Kuat', 'cp.dim': 'Lapisan gelap', 'cp.dim.0': 'Tipis', 'cp.dim.1': 'Sedang', 'cp.dim.2': 'Tebal',
    'cp.pos': 'Posisi foto', 'cp.pos.top': 'Atas', 'cp.pos.center': 'Tengah', 'cp.pos.bottom': 'Bawah', 'cp.saved': 'Foto kartu disimpan', 'cp.deleted': 'Foto kartu dihapus', 'cp.fail': 'Foto tidak bisa dibuka.',
    'set.photos': 'Foto',
    'f.t.done': 'Selesai', 'set.hard': 'Muat ulang aplikasi (bersih)', 'set.hard.s': 'Ambil ulang semua file aplikasi dari server. Data transaksi tidak terhapus.', 'f.t.live.s': 'waktu saat disimpan', 'kp.next': 'Lanjut', 'kp.del': 'Hapus', 'kp.err.amt': 'Isi nominal lebih dari 0', 'kp.err.res': 'Hasil harus lebih dari 0'
    , 'pl.title': 'Rencana', 'pl.ev': 'Acara · {0}', 'pl.gl': 'Tujuan · {0}', 'pl.tight': 'Paling mepet: {0} {1}', 'pl.more': '+{0} lainnya', 'pl.more.bud': '{0} pos lain juga perlu dicek',
    'pl.st.ok': 'Aman', 'pl.st.warn': 'Hampir', 'pl.st.bad': 'Lewat', 'pl.st.done': 'Tercapai', 'pl.st.near': 'Hampir tercapai', 'pl.st.late': 'Terlambat', 'pl.st.go': 'Berjalan',
    'w.pl.bud.near': 'Anggaran {0} sudah terpakai {1}%. Sisa Rp {2}.', 'a.pl.bud.near': 'Tahan pengeluaran di pos ini, atau realokasi dari pos lain.',
    'w.pl.ev.over': 'Anggaran acara {0} terlewati Rp {1}.', 'a.pl.ev.over': 'Periksa pengeluaran acara ini di menu Rencana.',
    'w.pl.ev.near': 'Anggaran acara {0} sudah terpakai {1}%.', 'a.pl.ev.near': 'Sisakan untuk kebutuhan acara yang belum dibayar.',
    'w.pl.gl.done': 'Tujuan {0} tercapai: terkumpul Rp {1}.', 'a.pl.gl.done': 'Tandai selesai atau naikkan targetnya di menu Rencana.',
    'w.pl.gl.near': 'Tujuan {0} hampir tercapai ({1}%). Kurang Rp {2}.', 'a.pl.gl.near': 'Sedikit lagi.',
    'w.pl.gl.late': 'Tenggat tujuan {0} sudah lewat, masih kurang Rp {1}.', 'a.pl.gl.late': 'Perpanjang tenggat atau tambah setoran.'
    , 'bl.j.exp': 'Pengeluaran', 'bl.j.inc': 'Pendapatan', 'bl.total.inc': 'Target pendapatan', 'bl.got': 'Terealisasi {0}', 'bl.inc.over': 'Lebih {0}', 'bl.inc.short': 'Kurang {0}',
    'bl.cat.hint': 'Isi anggaran per kategori. Ketuk "Lainnya" untuk merinci per subkategori.', 'bl.none': 'Belum dianggarkan', 'bl.tap.set': 'Ketuk untuk mengisi anggaran',
    'bl.more': 'Lainnya ({0} subkategori)', 'bl.less': 'Tutup', 'bl.fill': 'Isi anggaran', 'bl.whole': 'Seluruh kategori',
    'bl.replace.hint': 'Mengisi subkategori menggantikan nominal anggaran kategori ini. Jumlah kategori mengikuti jumlah subkategorinya.',
    'bva.surplus': 'Surplus', 'bva.note': 'Selisih positif berarti menguntungkan: pendapatan di atas anggaran atau pengeluaran di bawah anggaran. Kategori tanpa anggaran dihitung 0.'
    , 'bva.diff': 'Selisih'
  });
  I.add('en', {
    'f.dt': 'Date & time', 'f.d.0': 'Today', 'f.d.1': 'Yesterday', 'f.d.2': '2 days ago', 'f.d.pick': 'Pick date', 'f.d.clear': 'Clear',
    'f.d.prev': 'Previous day', 'f.d.next': 'Next day', 'f.t': 'Time (24h)', 'f.t.now': 'Now', 'f.t.pagi': 'Morning', 'f.t.siang': 'Noon', 'f.t.sore': 'Afternoon', 'f.t.malam': 'Evening',
    'f.t.min': 'min', 'f.t.live': 'Time follows the moment you save.', 'f.t.bad': 'Invalid time. Example: 0730 or 1530.',
    'f.copy.orig': 'As copied', 'f.copy.now': 'Now',
    'av.t': 'Profile photo', 'av.change': 'Change photo', 'av.del': 'Remove photo', 'av.mine': 'Your photo', 'av.other': 'Only {0} can change their photo.',
    'av.saved': 'Profile photo saved', 'av.deleted': 'Profile photo removed', 'av.fail': 'Could not save the photo. Check the connection and try again.', 'av.note': 'Profile photos show on both phones. Photos are resized automatically.',
    'av.srv': 'The server is not on v2.2 yet, so profile photos cannot be saved.',
    'cp.t': 'Main card photo', 'cp.s': 'Background of the Net worth card. Stored on this phone only.', 'cp.pick': 'Choose photo', 'cp.change': 'Change photo', 'cp.del': 'Remove photo',
    'cp.blur': 'Blur', 'cp.blur.0': 'None', 'cp.blur.1': 'Light', 'cp.blur.2': 'Strong', 'cp.dim': 'Dark overlay', 'cp.dim.0': 'Light', 'cp.dim.1': 'Medium', 'cp.dim.2': 'Heavy',
    'cp.pos': 'Photo position', 'cp.pos.top': 'Top', 'cp.pos.center': 'Center', 'cp.pos.bottom': 'Bottom', 'cp.saved': 'Card photo saved', 'cp.deleted': 'Card photo removed', 'cp.fail': 'Could not open the photo.',
    'set.photos': 'Photos',
    'f.t.done': 'Done', 'set.hard': 'Reload app (clean)', 'set.hard.s': 'Fetch all app files again from the server. Your data is not deleted.', 'f.t.live.s': 'time of saving', 'kp.next': 'Next', 'kp.del': 'Delete', 'kp.err.amt': 'Enter an amount above 0', 'kp.err.res': 'Result must be above 0'
    , 'pl.title': 'Plan', 'pl.ev': 'Event · {0}', 'pl.gl': 'Goal · {0}', 'pl.tight': 'Tightest: {0} {1}', 'pl.more': '+{0} more', 'pl.more.bud': '{0} more lines to check',
    'pl.st.ok': 'On track', 'pl.st.warn': 'Close', 'pl.st.bad': 'Over', 'pl.st.done': 'Reached', 'pl.st.near': 'Almost there', 'pl.st.late': 'Late', 'pl.st.go': 'In progress',
    'w.pl.bud.near': 'Budget {0} is {1}% used. Rp {2} left.', 'a.pl.bud.near': 'Hold spending here, or reallocate from another line.',
    'w.pl.ev.over': 'Event budget {0} is over by Rp {1}.', 'a.pl.ev.over': 'Review this event\'s spending in Plan.',
    'w.pl.ev.near': 'Event budget {0} is {1}% used.', 'a.pl.ev.near': 'Keep some for event costs not yet paid.',
    'w.pl.gl.done': 'Goal {0} reached: Rp {1} saved.', 'a.pl.gl.done': 'Mark it done or raise the target in Plan.',
    'w.pl.gl.near': 'Goal {0} is almost there ({1}%). Rp {2} to go.', 'a.pl.gl.near': 'Nearly done.',
    'w.pl.gl.late': 'Goal {0} is past its deadline, Rp {1} still to go.', 'a.pl.gl.late': 'Extend the deadline or add deposits.'
    , 'bl.j.exp': 'Expenses', 'bl.j.inc': 'Income', 'bl.total.inc': 'Income target', 'bl.got': 'Received {0}', 'bl.inc.over': 'Over by {0}', 'bl.inc.short': '{0} short',
    'bl.cat.hint': 'Set budgets per category. Tap "More" to break them down by subcategory.', 'bl.none': 'No budget', 'bl.tap.set': 'Tap to set a budget',
    'bl.more': 'More ({0} subcategories)', 'bl.less': 'Close', 'bl.fill': 'Set budget', 'bl.whole': 'Whole category',
    'bl.replace.hint': 'Filling a subcategory replaces this category\'s own amount. The category total follows the sum of its subcategories.',
    'bva.surplus': 'Surplus', 'bva.note': 'A positive difference is favourable: income above budget or spending below budget. Categories without a budget count as 0.'
    , 'bva.diff': 'Difference'
  });
})(window);
