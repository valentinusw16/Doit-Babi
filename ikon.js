if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['ikon'] = '3.2.0';
/* Do it v3.1 - ikon kategori yang beragam: setiap subkategori punya ikon sendiri (aturan nama), dan bisa diganti sendiri
   (disimpan di Rencana tipe "tampilan" bersama gaya, jadi ikut tersinkron antar perangkat). */
(function () {
  'use strict';
  var X = window.DoIt;
  if (!X || !X.ICON || !X.hooks || !X.S) return;
  var S = X.S, t = X.t, esc = X.esc, $ = X.$, ICON = X.ICON;
  function sv(p) { return '<svg viewBox="0 0 24 24">' + p + '</svg>'; }
  var NEW = {
    sunrise: sv('<path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 5v3M4.8 9.8l1.8 1.8M19.2 9.8l-1.8 1.8"/>'),
    plate: sv('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/>'),
    drop: sv('<path d="M12 3s6.5 6.5 6.5 11a6.5 6.5 0 0 1-13 0C5.5 9.5 12 3 12 3z"/>'),
    bottle: sv('<path d="M10 3h4v3l1.5 2.5V20a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V8.5L10 6zM8.5 13h7"/>'),
    cookie: sv('<path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-5-5z"/><circle cx="9" cy="10" r=".8"/><circle cx="13" cy="15" r=".8"/><circle cx="8" cy="15" r=".8"/>'),
    cup: sv('<path d="M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v2M12 3v2"/>'),
    basket: sv('<path d="M3 9h18l-2 10.5H5zM8 9l3-5M16 9l-3-5"/>'),
    bolt: sv('<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>'),
    wash: sv('<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 6.5h.01M11 6.5h.01"/>'),
    wifi: sv('<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.7 16a5 5 0 0 1 6.6 0M12 19.5h.01"/>'),
    phone: sv('<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>'),
    trash: sv('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>'),
    bank: sv('<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>'),
    percent: sv('<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'),
    box: sv('<path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8"/>'),
    shirt: sv('<path d="M8 3L3 7l2.5 3L8 9v12h8V9l2.5 1L21 7l-5-4a4 4 0 0 1-8 0z"/>'),
    laptop: sv('<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M2.5 19h19"/>'),
    hanger: sv('<path d="M12 8a2.5 2.5 0 1 0-2.5-2.5M12 8v2l9 6a1.5 1.5 0 0 1-.8 2.8H3.8A1.5 1.5 0 0 1 3 16l9-6"/>'),
    wrench: sv('<path d="M15 4a4.5 4.5 0 0 0-4 6.2L4 17.2 6.8 20l7-7A4.5 4.5 0 0 0 20 9l-3 3-3-3z"/>'),
    train: sv('<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l2-4M15 21l-2-4M9 14h.01M15 14h.01"/>'),
    bus: sv('<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 11h16M7 17v3M17 17v3M8 14h.01M16 14h.01"/>'),
    metro: sv('<path d="M6 17V8a6 6 0 0 1 12 0v9zM6 13h12M9 21l1.5-4M15 21l-1.5-4M9.5 9.5h.01M14.5 9.5h.01"/>'),
    moto: sv('<circle cx="5.5" cy="17" r="3"/><circle cx="18.5" cy="17" r="3"/><path d="M8.5 17H13l3-7h-4M16 10l2.5 7M12 10L10 7H7"/>'),
    taxi: sv('<path d="M5 17v-5l2-5h10l2 5v5zM5 17v2.5M19 17v2.5M10 4h4v3h-4zM7.5 13h.01M16.5 13h.01"/>'),
    fuel: sv('<path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h14M5 9h10M15 8h2.5A1.5 1.5 0 0 1 19 9.5V16a1.5 1.5 0 0 0 3 0V9l-3-3"/>'),
    park: sv('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9.5 17V8h3.5a2.8 2.8 0 0 1 0 5.6H9.5"/>'),
    rail: sv('<path d="M7 3h10l2 12H5zM5 15l-2 6M19 15l2 6M8 21h8M9 10h6"/>'),
    coach: sv('<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M3 12h18M7 17v3M17 17v3M3 8.5h18"/>'),
    plane: sv('<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'),
    building: sv('<path d="M3 21h18M5 21V8l7-4 7 4v13M9 12h2M13 12h2M9 16h2M13 16h2"/>'),
    shield: sv('<path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z"/>'),
    ship: sv('<path d="M3 17l2 3h14l2-3zM6 17v-6h12v6M12 11V4h4M9 14h.01M12 14h.01M15 14h.01"/>'),
    key: sv('<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>'),
    ticket: sv('<path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3zM14 6v12"/>'),
    gamepad: sv('<rect x="3" y="7" width="18" height="11" rx="4"/><path d="M8 10.5v4M6 12.5h4M15.5 11h.01M18 14h.01"/>'),
    ball: sv('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
    luggage: sv('<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8M9 12v4M15 12v4"/>'),
    pulse: sv('<path d="M3 12h4l2-5 4 10 2-5h6"/>'),
    card: sv('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M8 15h4"/>'),
    file: sv('<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/>'),
    cap: sv('<path d="M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6"/>'),
    pill: sv('<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-40 12 12)"/><path d="M9.5 9.5l5 5"/>'),
    steth: sv('<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v2a4 4 0 0 0 8 0v-1M5 3h2M13 3h2"/><circle cx="18" cy="12" r="2"/>'),
    scissors: sv('<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5L20 18M8 16.5L20 6"/>'),
    dumbbell: sv('<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>'),
    tooth: sv('<path d="M8 3C5.5 3 4 4.8 4 7.5c0 2 1 3 1.5 5 .5 2 .5 8 2.5 8 1.6 0 1.5-5 4-5s2.4 5 4 5c2 0 2-6 2.5-8 .5-2 1.5-3 1.5-5C20 4.8 18.5 3 16 3c-1.6 0-2.2 1-4 1S9.6 3 8 3z"/>'),
    eye: sv('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    smile: sv('<circle cx="12" cy="12" r="9"/><path d="M8 14.5a5 5 0 0 0 8 0M9 9.5h.01M15 9.5h.01"/>'),
    lotion: sv('<path d="M9 3h6v3H9zM8 6h8v3l1 2v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8l1-2z"/>'),
    comb: sv('<path d="M3 8h18v4H3zM6 12v6M9 12v6M12 12v6M15 12v6M18 12v6"/>'),
    palette: sv('<path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 1.5-2.2-.6-1.3.2-2.8 1.8-2.8H18a3 3 0 0 0 3-3 9 9 0 0 0-9-10z"/><circle cx="8" cy="11" r=".8"/><circle cx="12" cy="7.5" r=".8"/><circle cx="16" cy="11" r=".8"/>'),
    glass: sv('<path d="M7 3h10l-1 7a4 4 0 0 1-8 0zM12 14v7M8 21h8"/>'),
    handheart: sv('<path d="M12 11.5a2.5 2.5 0 0 0-4 2c0 2.5 4 4.5 4 4.5s4-2 4-4.5a2.5 2.5 0 0 0-4-2z"/><path d="M3 21h18M5 21v-4M19 21v-4"/>'),
    dollar: sv('<circle cx="12" cy="12" r="9"/><path d="M12 6.5v11M9.5 9.5c0-1.1 1.1-1.5 2.5-1.5s2.5.5 2.5 1.7c0 2.3-5 1.3-5 3.6 0 1.2 1.2 1.7 2.5 1.7s2.5-.5 2.5-1.5"/>'),
    down: sv('<path d="M3 7l6 6 4-4 8 8M15 17h6v-6"/>'),
    walletplus: sv('<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M12 13v4M10 15h4"/>'),
    headset: sv('<path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H4zM17 14h3v5h-3zM17 19c0 1.5-2 2-5 2"/>'),
    truck: sv('<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'),
    sliders: sv('<path d="M4 8h10M18 8h2M4 16h2M10 16h10"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/>'),
    hourglass: sv('<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>'),
    stamp: sv('<path d="M6 16h12v4H6zM9 16c0-3 .5-4 1-6a3 3 0 1 1 4 0c.5 2 1 3 1 6"/>'),
    cash: sv('<rect x="3" y="7" width="18" height="12" rx="2"/><circle cx="12" cy="13" r="2.5"/><path d="M6.5 13h.01M17.5 13h.01"/>'),
    medal: sv('<circle cx="12" cy="9" r="5"/><path d="M8.5 13.5L7 21l5-3 5 3-1.5-7.5"/>'),
    wheat: sv('<path d="M12 21V8M12 8c0-3 2-5 4-5 0 3-1 5-4 5zM12 8c0-3-2-5-4-5 0 3 1 5 4 5zM12 14c0-3 2-5 4-5 0 3-1 5-4 5zM12 14c0-3-2-5-4-5 0 3 1 5 4 5z"/>'),
    route: sv('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6"/>'),
    clock: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    trophy: sv('<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 21h8M10 18h4"/>'),
    mic: sv('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
    undo: sv('<path d="M4 9h11a5 5 0 0 1 0 10H8M4 9l4-4M4 9l4 4"/>'),
    scroll: sv('<path d="M8 3h11v14a3 3 0 0 1-3 3H6a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zM6 3a3 3 0 0 0-3 3v1h3"/>'),
    moon: sv('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>'),
    bread: sv('<path d="M5 10a4 4 0 0 1 2-7.5h10A4 4 0 0 1 19 10v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/>'),
    cart: sv('<path d="M3 4h2.5l2.2 11h10.3l2-8H7M9.5 20h.01M17 20h.01"/>')
  };
  Object.keys(NEW).forEach(function (k) { if (!ICON[k]) ICON[k] = NEW[k]; });

  // aturan nama subkategori -> ikon (urutan penting: yang spesifik dulu)
  var SUB = [
    [/sarapan/i, 'sunrise'], [/makan siang/i, 'plate'], [/makan malam/i, 'moon'], [/air minum/i, 'bottle'], [/jajan|snack/i, 'cookie'], [/^minuman|kopi|ngopi/i, 'cup'], [/bahan makan|belanja dapur|groceries/i, 'basket'],
    [/sewa tempat|kos|kontrak/i, 'home'], [/listrik/i, 'bolt'], [/laundry/i, 'wash'], [/pdam|^air /i, 'drop'], [/wifi|internet/i, 'wifi'], [/pulsa|kuota/i, 'phone'], [/^aplikasi|langganan/i, 'grid'], [/kebersihan|sampah/i, 'trash'], [/pbb/i, 'bank'], [/pph|pajak penghasilan/i, 'bill'], [/ppn/i, 'percent'], [/pajak restoran/i, 'bill'],
    [/perawatan pakaian/i, 'hanger'], [/perawatan elektronik/i, 'wrench'], [/perawatan kendaraan/i, 'gear'], [/pakaian|baju/i, 'shirt'], [/elektronik/i, 'laptop'], [/kendaraan/i, 'car'], [/^barang$/i, 'box'],
    [/krl|commuter/i, 'train'], [/transjakarta|brt/i, 'bus'], [/mrt|lrt/i, 'metro'], [/ojol|ojek/i, 'moto'], [/taksi|taxi/i, 'taxi'], [/bbm|bensin/i, 'fuel'], [/tol|parkir/i, 'park'], [/kereta/i, 'rail'], [/bus dan travel|travel/i, 'coach'], [/pesawat/i, 'plane'], [/fasilitas umum/i, 'building'], [/asuransi/i, 'shield'], [/kapal/i, 'ship'], [/sewa kendaraan/i, 'key'],
    [/rekreasi/i, 'ticket'], [/hiburan/i, 'gamepad'], [/olahraga/i, 'ball'], [/vakansi|liburan/i, 'luggage'],
    [/bpjs/i, 'pulse'], [/potongan gaji/i, 'card'], [/administrasi/i, 'file'], [/pendidikan/i, 'cap'], [/obat/i, 'pill'], [/cek atau konsultasi|konsultasi|dokter/i, 'steth'], [/potong rambut/i, 'scissors'], [/gym/i, 'dumbbell'], [/gigi/i, 'tooth'], [/mata/i, 'eye'], [/muka|wajah/i, 'smile'], [/perawatan badan/i, 'lotion'], [/perawatan rambut/i, 'comb'], [/make ?up/i, 'palette'],
    [/keluarga/i, 'people'], [/persembahan|zakat|sedekah/i, 'heart'], [/kado/i, 'gift'], [/traktir/i, 'glass'], [/donasi/i, 'handheart'], [/tips/i, 'dollar'],
    [/rugi jual saham/i, 'down'], [/biaya arisan/i, 'people'], [/kerugian aset/i, 'alert'],
    [/top ?up/i, 'walletplus'], [/^transfer$/i, 'swap'], [/layanan/i, 'headset'], [/pengiriman|ongkir/i, 'truck'], [/admin bank/i, 'bank'], [/adjust (loss|gain)/i, 'sliders'], [/depresiasi/i, 'hourglass'], [/meterai/i, 'stamp'],
    [/gaji pokok/i, 'cash'], [/tunjangan jabatan/i, 'medal'], [/tunjangan kinerja|bonus kinerja/i, 'target'], [/tunjangan makan/i, 'food'], [/tunjangan beras/i, 'wheat'], [/hari raya|thr/i, 'gift'], [/pembulatan/i, 'coins'], [/perjalanan dinas/i, 'route'], [/lembur/i, 'clock'],
    [/^bonus$/i, 'trophy'], [/honor/i, 'mic'], [/untung jual saham/i, 'trend'], [/arisan/i, 'repeat'], [/bunga/i, 'percent'], [/jual barang/i, 'tag'], [/refund/i, 'undo'], [/warisan/i, 'scroll'], [/hadiah/i, 'gift'], [/diskon|cashback/i, 'percent']
  ];
  function custom(kode) { var m = S.pref.ico; return m && kode && m[kode] && ICON[m[kode]] ? ICON[m[kode]] : null; }
  X.hooks.subIcon = function (grp, sub, kode) {
    var c = custom(kode); if (c) return c;
    if (sub) for (var i = 0; i < SUB.length; i++) if (SUB[i][0].test(sub)) return ICON[SUB[i][1]] || null;
    return null;
  };
  X.subIconKey = function (sub) { for (var i = 0; i < SUB.length; i++) if (SUB[i][0].test(sub || '')) return SUB[i][1]; return ''; };

  // ---------------------------------------------------------------- pilih ikon sendiri
  var PICK = null;
  var LIB = Object.keys(NEW).concat(['food', 'bill', 'bag', 'car', 'spark', 'heart', 'gift', 'trend', 'coins', 'brief', 'star', 'store', 'pie', 'target', 'repeat', 'home', 'people', 'tag', 'gear', 'swap', 'alert']).filter(function (k, i, a) { return ICON[k] && a.indexOf(k) === i; });
  function gid() { return 'TAMPIL-' + (S.cfg ? S.cfg.user : ''); }
  function pickSheet() {
    var k = S.M.katByKode[PICK], auto = X.subIconKey(k && k.SubKategori), cur = (S.pref.ico && S.pref.ico[PICK]) || '';
    $('#overlay2').innerHTML = '<div class="scrim" data-act="ik-close"></div><div class="sheet ikp"><div class="sheet-h"><div class="sh-t">' + esc(t('ik.t', X.dn(k ? k.SubKategori : ''))) + '</div><button class="x" data-act="ik-close" aria-label="' + t('close') + '">' + X.ICON.x + '</button></div>' +
      '<div class="sheet-b"><div class="ikg">' + LIB.map(function (n) { return '<button class="ikb' + (cur === n ? ' on' : '') + '" data-act="ik-set" data-v="' + n + '" aria-label="' + n + '">' + ICON[n] + '</button>'; }).join('') + '</div>' +
      '<div class="btnrow2" style="margin-top:12px"><button class="btn sm" data-act="ik-set" data-v="">' + t('ik.auto') + (auto ? '' : '') + '</button></div></div></div>';
  }
  function saveIco() {
    S.pref.icoT = Date.now(); S.pref.icoPend = true; X.savePref();
    if (X.desk && X.desk.pushTampilan) X.desk.pushTampilan();
  }
  Object.assign(X.A, {
    'ik-open': function (el) { PICK = el.dataset.k; pickSheet(); },
    'ik-close': function () { $('#overlay2').innerHTML = ''; PICK = null; },
    'ik-set': function (el) {
      var v = el.dataset.v || '', m = Object.assign({}, S.pref.ico || {});
      if (v) m[PICK] = v; else delete m[PICK];
      S.pref.ico = m; saveIco(); $('#overlay2').innerHTML = ''; PICK = null; X.render();
    }
  });
  if (window.I18N && window.I18N.add) {
    window.I18N.add('id', {'ik.t': 'Ikon: {0}', 'ik.auto': 'Otomatis'});
    window.I18N.add('en', {'ik.t': 'Icon: {0}', 'ik.auto': 'Automatic'});
  }
})();
