/* Do it v2.2 - teks tambahan: tanggal & jam, foto profil, foto kartu utama. */
(function (w) {
  var I = w.I18N;
  I.add('id', {
    'f.dt': 'Tanggal & jam', 'f.d.0': 'Hari ini', 'f.d.1': 'Kemarin', 'f.d.2': '2 hari lalu', 'f.d.pick': 'Pilih tanggal', 'f.d.clear': 'Kosongkan',
    'f.d.prev': 'Hari sebelumnya', 'f.d.next': 'Hari berikutnya', 'f.t': 'Jam (24 jam)', 'f.t.now': 'Sekarang', 'f.t.pagi': 'Pagi', 'f.t.siang': 'Siang', 'f.t.sore': 'Sore', 'f.t.malam': 'Malam',
    'f.t.min': 'mnt', 'f.t.live': 'Jam mengikuti waktu saat disimpan. Ketik mis. 1530 untuk 15:30.', 'f.t.bad': 'Jam tidak valid. Contoh: 0730 atau 1530.',
    'f.copy.orig': 'Sesuai yang disalin', 'f.copy.now': 'Sekarang',
    'av.t': 'Foto profil', 'av.change': 'Ganti foto', 'av.del': 'Hapus foto', 'av.mine': 'Foto kamu', 'av.other': 'Hanya {0} yang bisa mengganti fotonya.',
    'av.saved': 'Foto profil disimpan', 'av.deleted': 'Foto profil dihapus', 'av.fail': 'Foto gagal disimpan. Periksa koneksi lalu coba lagi.', 'av.note': 'Foto profil tampil di kedua HP. Foto diperkecil otomatis.',
    'av.srv': 'Server belum diperbarui ke v2.2, jadi foto profil belum bisa disimpan.',
    'cp.t': 'Foto kartu utama', 'cp.s': 'Latar kartu Kekayaan bersih. Hanya tersimpan di HP ini.', 'cp.pick': 'Pilih foto', 'cp.change': 'Ganti foto', 'cp.del': 'Hapus foto',
    'cp.blur': 'Blur', 'cp.blur.0': 'Tidak', 'cp.blur.1': 'Sedikit', 'cp.blur.2': 'Kuat', 'cp.dim': 'Lapisan gelap', 'cp.dim.0': 'Tipis', 'cp.dim.1': 'Sedang', 'cp.dim.2': 'Tebal',
    'cp.pos': 'Posisi foto', 'cp.pos.top': 'Atas', 'cp.pos.center': 'Tengah', 'cp.pos.bottom': 'Bawah', 'cp.saved': 'Foto kartu disimpan', 'cp.deleted': 'Foto kartu dihapus', 'cp.fail': 'Foto tidak bisa dibuka.',
    'set.photos': 'Foto'
  });
  I.add('en', {
    'f.dt': 'Date & time', 'f.d.0': 'Today', 'f.d.1': 'Yesterday', 'f.d.2': '2 days ago', 'f.d.pick': 'Pick date', 'f.d.clear': 'Clear',
    'f.d.prev': 'Previous day', 'f.d.next': 'Next day', 'f.t': 'Time (24h)', 'f.t.now': 'Now', 'f.t.pagi': 'Morning', 'f.t.siang': 'Noon', 'f.t.sore': 'Afternoon', 'f.t.malam': 'Evening',
    'f.t.min': 'min', 'f.t.live': 'Time follows the moment you save. Type e.g. 1530 for 15:30.', 'f.t.bad': 'Invalid time. Example: 0730 or 1530.',
    'f.copy.orig': 'As copied', 'f.copy.now': 'Now',
    'av.t': 'Profile photo', 'av.change': 'Change photo', 'av.del': 'Remove photo', 'av.mine': 'Your photo', 'av.other': 'Only {0} can change their photo.',
    'av.saved': 'Profile photo saved', 'av.deleted': 'Profile photo removed', 'av.fail': 'Could not save the photo. Check the connection and try again.', 'av.note': 'Profile photos show on both phones. Photos are resized automatically.',
    'av.srv': 'The server is not on v2.2 yet, so profile photos cannot be saved.',
    'cp.t': 'Main card photo', 'cp.s': 'Background of the Net worth card. Stored on this phone only.', 'cp.pick': 'Choose photo', 'cp.change': 'Change photo', 'cp.del': 'Remove photo',
    'cp.blur': 'Blur', 'cp.blur.0': 'None', 'cp.blur.1': 'Light', 'cp.blur.2': 'Strong', 'cp.dim': 'Dark overlay', 'cp.dim.0': 'Light', 'cp.dim.1': 'Medium', 'cp.dim.2': 'Heavy',
    'cp.pos': 'Photo position', 'cp.pos.top': 'Top', 'cp.pos.center': 'Center', 'cp.pos.bottom': 'Bottom', 'cp.saved': 'Card photo saved', 'cp.deleted': 'Card photo removed', 'cp.fail': 'Could not open the photo.',
    'set.photos': 'Photos'
  });
})(window);
