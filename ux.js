if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['ux'] = '3.3.0';
/* Do it v3.3 - palet perintah (Ctrl/Cmd+K) dan animasi: kartu muncul berurutan, angka utama menghitung naik,
   grafik tergambar, panel Catat meluncur. Animasi bisa dimatikan di Pengaturan dan mengikuti "kurangi gerak" sistem. */
(function () {
  'use strict';
  var X = window.DoIt;
  if (!X || !X.S || !X.A || !X.t || !(function (v) { v = String(v || '0').split('.').map(Number); return v[0] >= 3; })(X.VERSION)) return;
  var S = X.S, C = X.C, A = X.A, t = X.t, esc = X.esc, I = window.I18N, dn = X.dn;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  if (I && I.add) {
    I.add('id', {
      'pal.ph': 'Ketik perintah, halaman, atau cari transaksi…', 'pal.nav': 'Halaman', 'pal.cmd': 'Perintah', 'pal.rep': 'Laporan', 'pal.tx': 'Transaksi', 'pal.recent': 'Terakhir dipakai', 'pal.none': 'Tidak ada yang cocok',
      'pal.hint': '↑↓ pilih · Enter jalankan · Esc tutup', 'pal.search': 'Cari “{0}” di Transaksi', 'pal.add': 'Catat transaksi baru', 'pal.add.e': 'Catat pengeluaran', 'pal.add.i': 'Catat pendapatan', 'pal.add.t': 'Catat transfer',
      'pal.theme.l': 'Tema terang', 'pal.theme.d': 'Tema gelap', 'pal.theme.a': 'Tema otomatis', 'pal.lang': 'Ganti bahasa (ID/EN)', 'pal.gaya.k': 'Gaya Kaca', 'pal.gaya.b': 'Gaya Bersih', 'pal.sb': 'Ciutkan/lebarkan menu samping',
      'pal.sync': 'Sinkronkan sekarang', 'pal.who': 'Tampilkan: {0}', 'pal.csv': 'Ekspor CSV laporan ini', 'pal.jpg': 'Bagikan laporan ini (JPG)', 'pal.open': 'Buka palet perintah',
      'ux.t': 'Animasi', 'ux.on': 'Hidup', 'ux.off': 'Mati', 'ux.s': 'Kartu muncul berurutan, angka menghitung naik, grafik tergambar. Mati bila perangkat Anda meminta gerak dikurangi.'
    });
    I.add('en', {
      'pal.ph': 'Type a command, page, or search transactions…', 'pal.nav': 'Pages', 'pal.cmd': 'Commands', 'pal.rep': 'Reports', 'pal.tx': 'Transactions', 'pal.recent': 'Recent', 'pal.none': 'Nothing matches',
      'pal.hint': '↑↓ select · Enter run · Esc close', 'pal.search': 'Search “{0}” in Transactions', 'pal.add': 'New transaction', 'pal.add.e': 'Add expense', 'pal.add.i': 'Add income', 'pal.add.t': 'Add transfer',
      'pal.theme.l': 'Light theme', 'pal.theme.d': 'Dark theme', 'pal.theme.a': 'Automatic theme', 'pal.lang': 'Switch language (ID/EN)', 'pal.gaya.k': 'Glass style', 'pal.gaya.b': 'Clean style', 'pal.sb': 'Collapse/expand side menu',
      'pal.sync': 'Sync now', 'pal.who': 'Show: {0}', 'pal.csv': 'Export this report as CSV', 'pal.jpg': 'Share this report (JPG)', 'pal.open': 'Open command palette',
      'ux.t': 'Animations', 'ux.on': 'On', 'ux.off': 'Off', 'ux.s': 'Cards appear in sequence, numbers count up, charts draw in. Off when your device asks for reduced motion.'
    });
  }

  // ---------------------------------------------------------------- animasi: pengaturan
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function animOn() { return false; } /* v3.4.2: semua animasi dimatikan */
  function applyAnim() { document.documentElement.setAttribute('data-anim', animOn() ? 'on' : 'off'); }
  applyAnim(); if (mq && mq.addEventListener) mq.addEventListener('change', applyAnim);
  A['ux-anim'] = function (el) { S.pref.anim = el.dataset.v === 'off' ? 'off' : 'on'; X.savePref(); applyAnim(); X.render(); };

  // ---------------------------------------------------------------- animasi: kartu berurutan + hitung naik
  function countUp(el) {
    if (el.dataset.cu) return; var txt = el.textContent.trim(), m = txt.match(/^([+−-]?\s*(?:Rp\s?)?)(\d{1,3}(?:[.,]\d{3})*|\d+)(\D*)$/); if (!m) return;
    var digits = m[2].replace(/\D/g, ''), v = parseInt(digits, 10); if (!isFinite(v) || v < 1000) return; el.dataset.cu = '1';
    var sepM = m[2].match(/[.,]/), sep = sepM ? sepM[0] : '.', t0 = null, dur = 650;
    function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep); }
    function step(ts) { if (t0 == null) t0 = ts; var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = m[1] + fmt(Math.round(v * e)) + m[3]; if (p < 1) requestAnimationFrame(step); else el.textContent = txt; }
    el.textContent = m[1] + '0' + m[3]; requestAnimationFrame(step);
  }
  var first = true, queued = false;
  function afterRender() {
    queued = false; var main = $('main'); if (!main) return;
    var nav = /(^|\s)anim-/.test(main.className); if (!nav && !first) return; if (main.dataset.ux) return; main.dataset.ux = '1'; first = false;
    if (!animOn()) return; main.classList.add('ux-in');
    var i = 0; [].forEach.call(main.querySelectorAll('.card, .bt, .insc'), function (c) { c.style.setProperty('--i', Math.min(i++, 12)); });
    [].forEach.call(main.querySelectorAll('.b-hero .big, .b-month .big, .sumcard b, .inout b, .big.nw'), countUp);
  }
  var app = $('#app');
  if (app && window.MutationObserver) new MutationObserver(function () { if (!queued) { queued = true; requestAnimationFrame(afterRender); } }).observe(app, {childList: true});

  // ---------------------------------------------------------------- palet perintah
  var P = null, items = [], shown = [], act = 0;
  function norm(s) { return String(s || '').toLowerCase(); }
  function score(it, q) {
    if (!q) return 1; var hay = norm(it.label + ' ' + (it.kw || '')), lab = norm(it.label), i = lab.indexOf(q);
    if (i === 0) return 300; if (i > 0) return 220 - Math.min(i, 60); i = hay.indexOf(q); if (i >= 0) return 150 - Math.min(i, 60);
    var ws = q.split(/\s+/).filter(Boolean); if (ws.length > 1 && ws.every(function (w) { return hay.indexOf(w) >= 0; })) return 120;
    var j = 0, gaps = 0, last = -1; for (var k = 0; k < hay.length && j < q.length; k++) if (hay[k] === q[j]) { if (last >= 0 && k - last > 1) gaps++; last = k; j++; }
    return j === q.length && q.length >= 2 ? 60 - Math.min(gaps * 4, 50) : 0;
  }
  var NAVS = [['beranda', 'nav.home', 'tab', 'home'], ['transaksi', 'nav.tx', 'tab', 'list'], ['laporan', 'nav.report', 'tab', 'chart'], ['flow', 'pg.flow', 'page', 'inArr'], ['portfolio', 'pg.portfolio', 'page', 'pie'], ['debts', 'pg.debts', 'page', 'loan'],
    ['event', 'pg.event', 'page', 'tag'], ['anggaran', 'pg.anggaran', 'page', 'plan'], ['tujuan', 'pg.tujuan', 'page', 'target'],  ['categories', 'pg.categories', 'page', 'tag'], ['parties', 'pg.parties', 'page', 'people'], ['opening', 'pg.opening', 'saldo-awal', 'flag'], ['notif', 'pg.notif', 'page', 'bell'], ['settings', 'pg.settings', 'page', 'gear']];
  var REPK = ['ann', 'is', 'bs', 'cf', 'bva', 'tb', 'jr', 'tren', 'rasio', 'ins'];
  function sbsNone() { return document.documentElement.getAttribute('data-sbs') === 'none'; }
  function build() {
    var L = [], who = ['Semua'].concat(S.M && S.M.users || []);
    NAVS.forEach(function (n) { L.push({id: 'nav-' + n[0], g: 'pal.nav', label: t(n[1]), ico: n[3], kw: n[0], run: function () { if (n[2] === 'tab') X.setTab(n[0]); else if (n[2] === 'page') X.openPage(n[0]); else A['saldo-awal'](); }}); });
    REPK.forEach(function (k) { L.push({id: 'rep-' + k, g: 'pal.rep', label: t('r.' + k), ico: 'chart', kw: 'laporan report ' + k, run: function () { S.rep.kind = k; S.rep.limit = 50; if (S.page) X.goBack && 0; X.setTab('laporan'); X.render(); }}); });
    L.push({id: 'c-add', g: 'pal.cmd', label: t('pal.add'), ico: 'plus', kw: 'catat tambah add new transaksi', run: function () { if (A['catat-toggle'] && !sbsNone()) A['catat-toggle'](); else A.add(); }});
    [['e', 'Expense', 'pengeluaran expense'], ['i', 'Income', 'pendapatan income'], ['t', 'Transfer', 'transfer pindah']].forEach(function (j) { L.push({id: 'c-add-' + j[0], g: 'pal.cmd', label: t('pal.add.' + j[0]), ico: 'plus', kw: 'catat ' + j[2], run: function () { X.openForm({jenis: j[1]}); }}); });
    L.push({id: 'c-th-l', g: 'pal.cmd', label: t('pal.theme.l'), ico: 'sun', kw: 'terang light tema theme', run: function () { S.pref.mode = 'light'; X.savePref(); X.render(); }});
    L.push({id: 'c-th-d', g: 'pal.cmd', label: t('pal.theme.d'), ico: 'moon', kw: 'gelap dark malam tema theme', run: function () { S.pref.mode = 'dark'; X.savePref(); X.render(); }});
    L.push({id: 'c-th-a', g: 'pal.cmd', label: t('pal.theme.a'), ico: 'auto', kw: 'otomatis auto tema theme', run: function () { S.pref.mode = 'auto'; X.savePref(); X.render(); }});
    L.push({id: 'c-lang', g: 'pal.cmd', label: t('pal.lang'), ico: 'spark', kw: 'bahasa language indonesia english', run: function () { A['lang-toggle'](); }});
    if (A['dk-gaya']) { L.push({id: 'c-g-k', g: 'pal.cmd', label: t('pal.gaya.k'), ico: 'spark', kw: 'kaca glass gaya style', run: function () { A['dk-gaya']({dataset: {v: 'kaca'}}); }}); L.push({id: 'c-g-b', g: 'pal.cmd', label: t('pal.gaya.b'), ico: 'spark', kw: 'bersih clean minimal gaya style', run: function () { A['dk-gaya']({dataset: {v: 'bersih'}}); }}); }
    if (A['sb-toggle'] && !sbsNone()) L.push({id: 'c-sb', g: 'pal.cmd', label: t('pal.sb'), ico: 'list', kw: 'sidebar menu samping ciut', run: function () { A['sb-toggle'](); }});
    L.push({id: 'c-sync', g: 'pal.cmd', label: t('pal.sync'), ico: 'repeat', kw: 'sinkron sync refresh muat', run: function () { X.syncNow && X.syncNow(); }});
    who.forEach(function (u) { L.push({id: 'c-who-' + u, g: 'pal.cmd', label: t('pal.who', u === 'Semua' ? t('all') : u), ico: 'people', kw: 'pengguna pemilik owner filter ' + u, run: function () { S.owner = u; X.render(); }}); });
    if (!S.page && S.tab === 'laporan') {
      L.push({id: 'c-csv', g: 'pal.cmd', label: t('pal.csv'), ico: 'copy', kw: 'csv ekspor export unduh', run: function () { A['rep-csv'] && A['rep-csv'](); }});
      L.push({id: 'c-jpg', g: 'pal.cmd', label: t('pal.jpg'), ico: 'share', kw: 'jpg bagikan share gambar', run: function () { A['rep-share'] && A['rep-share'](); }});
    }
    return L;
  }
  function txMatches(q) {
    if (!q || q.length < 2) return [];
    var out = [], re = q.split(/\s+/).filter(Boolean);
    Object.keys(S.tx).forEach(function (id) {
      var x = S.tx[id]; if (x.Status !== 'Aktif') return;
      var hay = norm([x.Toko, x.Barang, x.Catatan, x.Kategori, x.SubKategori, x.Pihak, x.Dompet, x.Tag, x.Jumlah].join(' '));
      if (re.every(function (w) { return hay.indexOf(w) >= 0; })) out.push(x);
    });
    out.sort(function (a, b) { return a.Waktu < b.Waktu ? 1 : -1; });
    return out.slice(0, 6).map(function (x) {
      var v = X.txView(x); return {id: 'tx-' + x.ID, g: 'pal.tx', label: v.title, sub: C.fmtTgl(x.Waktu.substr(0, 10)) + ' · ' + (x.Dompet || '') + ' · ' + X.signAmt(v, x.Jumlah), ico: 'list', run: function () { X.openDetail(x.ID); }, noRecent: true};
    });
  }
  function recent() { return (S.pref.palRecent || []); }
  function remember(id) { if (/^tx-/.test(id)) return; var r = recent().filter(function (x) { return x !== id; }); r.unshift(id); S.pref.palRecent = r.slice(0, 5); X.savePref(); }
  function compute(q) {
    var raw = String(q || '').trim(); q = norm(q).trim(); var res = [];
    if (!q) {
      var rc = recent().map(function (id) { return items.filter(function (i) { return i.id === id; })[0]; }).filter(Boolean).map(function (i) { return Object.assign({}, i, {g: 'pal.recent'}); });
      res = rc.concat(items.filter(function (i) { return !rc.some(function (r) { return r.id === i.id; }); }));
    } else {
      res = items.map(function (i) { return {i: i, s: score(i, q)}; }).filter(function (o) { return o.s > 0; }).sort(function (a, b) { return b.s - a.s; }).map(function (o) { return o.i; }).slice(0, 12);
      res = res.concat(txMatches(q));
      res.push({id: 'q-search', g: 'pal.tx', label: t('pal.search', raw), ico: 'list', noRecent: true, run: function () { S.q = raw; S.limit = 80; if (S.page || S.tab !== 'transaksi') X.setTab('transaksi'); else X.render(); }});
    }
    return res;
  }
  function row(it, i) {
    return '<button class="pal-i' + (i === act ? ' on' : '') + '" data-i="' + i + '" role="option"><span class="pi">' + (X.ICON[it.ico] || X.ICON.grid) + '</span><span class="pt"><b>' + esc(it.label) + '</b>' + (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</span></button>';
  }
  function paint() {
    var list = $('.pal-l', P), h = '', lastG = '';
    if (!shown.length) h = '<div class="pal-e">' + esc(t('pal.none')) + '</div>';
    shown.forEach(function (it, i) { if (it.g !== lastG) { h += '<div class="pal-g">' + esc(t(it.g)) + '</div>'; lastG = it.g; } h += row(it, i); });
    list.innerHTML = h; var on = $('.pal-i.on', list); if (on && on.scrollIntoView) on.scrollIntoView({block: 'nearest'});
  }
  function openPal(pre) {
    if (P) { $('.pal-q', P).focus(); return; } if (!S.cfg || !S.master) return;
    items = build(); P = document.createElement('div'); P.id = 'pal'; P.setAttribute('role', 'dialog'); P.setAttribute('aria-label', t('pal.open'));
    P.innerHTML = '<div class="pal-s" data-pal="close"></div><div class="pal-b"><div class="pal-h"><span class="pal-k">' + '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' + '</span><input class="pal-q" type="text" placeholder="' + esc(t('pal.ph')) + '" autocomplete="off" spellcheck="false" aria-label="' + esc(t('pal.open')) + '"></div><div class="pal-l" role="listbox"></div><div class="pal-f">' + esc(t('pal.hint')) + '</div></div>';
    document.body.appendChild(P); var q = $('.pal-q', P); q.value = pre || ''; act = 0; shown = compute(q.value); paint(); q.focus();
    q.addEventListener('input', function () { act = 0; shown = compute(q.value); paint(); });
  }
  function closePal() { if (!P) return; P.remove(); P = null; }
  function runAt(i) { var it = shown[i]; if (!it) return; if (!it.noRecent) remember(it.id); closePal(); setTimeout(function () { it.run(); }, 20); }
  X.palette = {open: openPal, close: closePal, isOpen: function () { return !!P; }};

  window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); e.stopImmediatePropagation(); if (P) closePal(); else openPal(); return; }
    if (!P) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closePal(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopImmediatePropagation(); if (shown.length) act = (act + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length; paint(); return; }
    if (e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); runAt(act); return; }
    if (e.key === 'Tab') { e.preventDefault(); }
    e.stopImmediatePropagation();
  }, true);
  document.addEventListener('click', function (e) {
    if (!P) return; if (e.target.closest && e.target.closest('[data-pal="close"]')) { closePal(); return; }
    var b = e.target.closest && e.target.closest('.pal-i'); if (b) { e.stopPropagation(); runAt(+b.dataset.i); }
  }, true);
  document.addEventListener('mousemove', function (e) { if (!P) return; var b = e.target.closest && e.target.closest('.pal-i'); if (b && +b.dataset.i !== act) { act = +b.dataset.i; [].forEach.call(P.querySelectorAll('.pal-i'), function (n) { n.classList.toggle('on', +n.dataset.i === act); }); } });
  document.addEventListener('focusin', function (e) { if (e.target && e.target.id === 'gq') { var v = e.target.value; e.target.blur(); openPal(v); } });
  A['pal-open'] = function () { openPal(); };
})();
