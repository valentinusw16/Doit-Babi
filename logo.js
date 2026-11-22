if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['logo'] = '3.4.0';
/* Do it v3.4b - ikon aset: gambar yang kamu unggah sendiri (disimpan di data akun/isi, ikut tersinkron), default ikon generik.
   Aplikasi tidak menyertakan logo merek apa pun. */
(function () {
  'use strict';
  var X = window.DoIt; if (!X || !X.rc || !X.hooks || !X.S) return;
  var S = X.S, t = X.t, esc = X.esc, I = window.I18N, C = X.C;
  I.add('id', {'lg.t': 'Ikon', 'lg.up': 'Unggah gambar', 'lg.ch': 'Ganti', 'lg.del': 'Hapus', 'lg.note': 'Gambar dikecilkan otomatis dan ikut tersinkron ke HP lain. Tanpa gambar, dipakai ikon generik.', 'lg.ok': 'Ikon tersimpan', 'lg.gone': 'Ikon dihapus', 'lg.fail': 'Gambar tidak bisa diproses', 'lg.srv': 'Gagal menyimpan ikon'});
  I.add('en', {'lg.t': 'Icon', 'lg.up': 'Upload image', 'lg.ch': 'Change', 'lg.del': 'Remove', 'lg.note': 'The image is shrunk automatically and syncs to your other devices. Without one, a generic icon is used.', 'lg.ok': 'Icon saved', 'lg.gone': 'Icon removed', 'lg.fail': 'Could not process image', 'lg.srv': 'Could not save icon'});
  function sv(p) { return '<svg viewBox="0 0 24 24">' + p + '</svg>'; }
  var G = {
    bank: sv('<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>'),
    wallet: sv('<path d="M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zM16 14.5h.01"/>'),
    chart: sv('<path d="M3 17l5-6 4 3 8-9M16 5h4v4"/>'),
    coin: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.5h-3a1.8 1.8 0 0 0 0 3.5h4.5"/>'),
    house: sv('<path d="M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6"/>'),
    car: sv('<path d="M4 16v-4l2-5h12l2 5v4zM4 16v3M20 16v3M7.5 13h.01M16.5 13h.01"/>'),
    phone: sv('<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>'),
    card: sv('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M8 15h4"/>'),
    people: sv('<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5M18 20a5 5 0 0 0-2.5-4.3"/>'),
    box: sv('<path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8"/>')
  };
  function generic(nama, kel) {
    var s = (nama || '') + ' ' + (kel || '');
    if (/kripto|crypto|bitcoin/i.test(s)) return G.coin;
    if (/saham|reksa|sekuritas|rdn|invest|sbn|obligasi|deposito|emas|portofolio/i.test(s)) return G.chart;
    if (/rumah|tanah|properti|bangunan|apartemen/i.test(s)) return G.house;
    if (/mobil|motor|kendaraan/i.test(s)) return G.car;
    if (/hp|ponsel|laptop|elektronik|tablet|gadget/i.test(s)) return G.phone;
    if (/kartu|kredit/i.test(s)) return G.card;
    if (/piutang|pinjam/i.test(s)) return G.people;
    if (/bank|tabungan|giro|rekening|bca|bri|bni|mandiri|cimb|bsi|jago|permata|danamon|btn|ocbc|seabank/i.test(s)) return G.bank;
    if (/dompet|tunai|cash|e-?wallet|gopay|ovo|dana|shopee|linkaja|kas/i.test(s)) return G.wallet;
    return G.box;
  }
  function akunRec(n) { return X.rc.list('akun').filter(function (r) { return r.dompet === n; })[0]; }
  function holdRec(id) { return X.rc.list('aset').filter(function (r) { return r.id === id; })[0]; }
  function logoOf(kind, key) { var r = kind === 'aset' ? holdRec(key) : akunRec(key); return r && r.logo || ''; }
  /** ikon baris aset (HTML) */
  X.assetIco = function (kind, key, nama, kel) {
    var img = logoOf(kind, key);
    return '<span class="ico aico' + (img ? ' has' : '') + '">' + (img ? '<img src="' + esc(img) + '" alt="">' : generic(nama, kel)) + '</span>';
  };
  X.hooks.assetIco = function (d, kel) { return d ? X.assetIco('akun', d.Nama, d.Nama, kel) : ''; };
  function strip(o) { var d = Object.assign({}, o); delete d.id; delete d._oleh; return d; }
  function saveLogo(kind, key, img) {
    var r = kind === 'aset' ? holdRec(key) : akunRec(key), data = Object.assign(kind === 'aset' ? {} : {dompet: key}, r ? strip(r) : {});
    if (img) data.logo = img; else delete data.logo;
    return X.rc.save(kind, data, r ? r.id : undefined).then(function () { X.toast(t(img ? 'lg.ok' : 'lg.gone')); X.render(); }).catch(function () { X.toast(t('lg.srv')); });
  }
  function shrink(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('img')); };
      im.onload = function () {
        var out = '', sz = [96, 80, 64, 48];
        for (var i = 0; i < sz.length; i++) {
          var cv = document.createElement('canvas'), s = sz[i]; cv.width = cv.height = s; var cx = cv.getContext('2d'), k = Math.min(s / im.naturalWidth, s / im.naturalHeight), w = im.naturalWidth * k, h = im.naturalHeight * k;
          cx.drawImage(im, (s - w) / 2, (s - h) / 2, w, h); out = cv.toDataURL('image/webp', 0.85); if (!/^data:image\/webp/.test(out)) out = cv.toDataURL('image/png');
          if (out.length <= 9000) break;
        }
        URL.revokeObjectURL(u); out.length > 14000 ? rej(new Error('big')) : res(out);
      };
      im.src = u;
    });
  }
  /** blok pengatur ikon: kind 'akun' | 'aset' */
  X.logoBlock = function (kind, key, nama, kel) {
    var has = !!logoOf(kind, key);
    return '<div class="card lgblk"><div class="lgrow">' + X.assetIco(kind, key, nama, kel).replace('aico', 'aico big') + '<div class="grow"><div class="t">' + t('lg.t') + '</div><div class="s">' + t('lg.note') + '</div></div></div>' +
      '<div class="btnrow2"><button class="btn sm" data-act="lg-pick" data-k="' + kind + '" data-id="' + esc(key) + '">' + t(has ? 'lg.ch' : 'lg.up') + '</button>' + (has ? '<button class="btn sm danger" data-act="lg-del" data-k="' + kind + '" data-id="' + esc(key) + '">' + t('lg.del') + '</button>' : '') + '</div>' +
      '<input type="file" id="file-lg" accept="image/*" hidden data-lgf="1" data-k="' + kind + '" data-id="' + esc(key) + '"></div>';
  };
  Object.assign(X.A, {
    'lg-pick': function (el) { var i = document.getElementById('file-lg'); if (i) i.click(); },
    'lg-del': function (el) { saveLogo(el.dataset.k, el.dataset.id, ''); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target; if (!el.dataset || !el.dataset.lgf) return; var f = el.files && el.files[0]; if (!f) return;
    var k = el.dataset.k, id = el.dataset.id; el.value = '';
    shrink(f).then(function (img) { return saveLogo(k, id, img); }).catch(function () { X.toast(t('lg.fail')); });
  }, true);
  var top0 = X.hooks.assetTop;
  X.hooks.assetTop = function (kode, d, book) {
    var h = top0 ? top0(kode, d, book) : ''; if (!d || d.Pemilik !== S.cfg.user) return h;
    var a = S.M.akun[kode]; return X.logoBlock('akun', d.Nama, d.Nama, a && a.Kelompok) + h;
  };
})();
