/* Do it - aplikasi HP (Fase 1). Tanpa framework; data di IndexedDB; sinkron ke Google Sheets lewat Apps Script. */
(function () {
  'use strict';
  var C = window.Core;
  var VERSION = '1.2.0';
  var APP_NAME = 'Do it';

  // ---------------------------------------------------------------- util
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }
  function sum(a, f) { return a.reduce(function (x, y) { return x + f(y); }, 0); }
  var ICON = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M5 20V11M12 20V4M19 20v-6M2 20h20"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    swap: '<svg viewBox="0 0 24 24"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>',
    loan: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5c0-1 1-1.7 2.5-1.7s2.5.7 2.5 1.7-1 1.5-2.5 1.9-2.5.9-2.5 1.9 1 1.7 2.5 1.7 2.5-.7 2.5-1.7"/></svg>'
  };
  var JENIS_LABEL = {Income: 'Masuk', Expense: 'Keluar', Transfer: 'Pindah', 'Utang/Piutang': 'Utang/Piutang', 'Saldo awal': 'Saldo awal'};

  // ---------------------------------------------------------------- penyimpanan
  var mem = {};
  var DB = {
    _db: null,
    open: function () {
      var self = this;
      return new Promise(function (res, rej) {
        if (self._db) return res(self._db);
        if (!window.indexedDB) return rej(new Error('no idb'));
        var r = indexedDB.open('kas-keluarga', 1);
        r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
        r.onsuccess = function () { self._db = r.result; res(r.result); };
        r.onerror = function () { rej(r.error); };
      });
    },
    get: function (k) {
      return this.open().then(function (db) {
        return new Promise(function (res, rej) {
          var q = db.transaction('kv').objectStore('kv').get(k);
          q.onsuccess = function () { res(q.result); }; q.onerror = function () { rej(q.error); };
        });
      }).catch(function () { return mem[k]; });
    },
    set: function (k, v) {
      mem[k] = v;
      return this.open().then(function (db) {
        return new Promise(function (res, rej) {
          var t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k);
          t.oncomplete = function () { res(); }; t.onerror = function () { rej(t.error); };
        });
      }).catch(function () {});
    }
  };
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // ---------------------------------------------------------------- state
  var S = {
    cfg: null, tx: {}, jurnalByTx: {}, master: null, M: C.indexMaster(null), rev: 0, mrev: 0, queue: [], prefs: {lastDompet: {}},
    lastSync: 0, online: true, syncing: false, again: false, authFail: false, inflight: null, dirty: false, ver: 0,
    tab: 'beranda', owner: 'Semua', q: '', showVoid: false, limit: 80,
    rep: {kind: 'is', period: 'bulan', dim: 'pemilik', who: 'Semua', limit: 50}, _lines: null,
    pref: Object.assign({theme: 'rose', mode: 'auto'}, lsGet('kk.pref') || {})
  };
  var persistT = null;
  function persist() {
    clearTimeout(persistT);
    persistT = setTimeout(function () {
      DB.set('state', {rev: S.rev, mrev: S.mrev, tx: S.tx, jurnalByTx: {}, master: S.master, queue: S.queue, prefs: S.prefs, lastSync: S.lastSync, user: S.cfg && S.cfg.user});
    }, 250);
  }
  function touch() { S.ver++; S._lines = null; S.dirty = true; persist(); }
  function getLines() { if (!S._lines) S._lines = C.buildLines({tx: S.tx, jurnalByTx: S.jurnalByTx, M: S.M}); return S._lines; }
  function isDark() { var m = S.pref.mode; return m === 'dark' || (m !== 'light' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }
  function applyTheme() {
    var d = document.documentElement; d.setAttribute('data-theme', S.pref.theme || 'rose'); d.setAttribute('data-dark', isDark() ? '1' : '0');
    var bg = getComputedStyle(d).getPropertyValue('--bg').trim(), m = document.querySelector('meta[name=theme-color]');
    if (m && bg) m.setAttribute('content', bg);
  }
  var THEMES = [['rose', 'Merah', ['#fbf3f4', '#c0275f', '#fbe1e8']], ['navy', 'Navy', ['#f5efeb', '#2f4156', '#c8d9e6']], ['mono', 'Monokrom', ['#f4f4f4', '#111111', '#ebebeb']]];
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.className = 'show';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = ''; }, 2400);
  }

  // ---------------------------------------------------------------- API & sinkron
  function api(action, extra) {
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 30000) : null;
    var body = JSON.stringify(Object.assign({key: S.cfg.key, action: action}, extra || {}));
    return fetch(S.cfg.url, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: body, signal: ctl ? ctl.signal : undefined})
      .catch(function () { throw Object.assign(new Error('Tidak ada koneksi'), {net: true}); })
      .then(function (res) {
        if (timer) clearTimeout(timer);
        if (!res.ok) throw Object.assign(new Error('Server error ' + res.status), {net: true});
        return res.json().catch(function () { throw Object.assign(new Error('Balasan server tidak dikenali'), {net: true}); });
      })
      .then(function (j) {
        if (!j.ok) { var e = new Error(j.error || 'Gagal'); e.code = j.code; throw e; }
        return j;
      });
  }

  function opsFailed() { return S.queue.filter(function (o) { return o.error; }); }

  function setBadge() {
    var b = $('#badge'); if (!b) return;
    var n = S.queue.length, bad = opsFailed().length, cls = 'badge', txt;
    if (S.authFail) { cls += ' bad'; txt = 'Kunci ditolak'; }
    else if (bad) { cls += ' bad'; txt = bad + ' gagal dikirim'; }
    else if (n) { cls += ' warn'; txt = (S.online ? 'Mengirim ' : 'Menunggu kirim ') + n; }
    else if (!S.online) { cls += ' warn'; txt = 'Offline'; }
    else if (S.syncing) txt = 'Menyinkronkan…';
    else txt = S.lastSync ? 'Tersinkron ' + C.nowLocal(new Date(S.lastSync)).substr(11) : 'Belum sinkron';
    b.className = cls; b.textContent = txt;
  }

  function enqueue(op) {
    op.id = 'Q' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    S.queue.push(op); persist();
  }

  function revertBatal(id) {
    var t = S.tx[id];
    if (t && t._pendingBatal) { t.Status = 'Aktif'; delete t._pendingBatal; }
  }

  function onOpFail(op, e) {
    op.error = e.message || 'Gagal';
    if (op.action === 'batal') revertBatal(op.body.id);
    if (op.action === 'koreksi') { revertBatal(op.body.id); }
    var tid = op.body && op.body.tx && op.body.tx.id;
    if (tid && S.tx[tid]) S.tx[tid]._error = op.error;
    touch();
  }

  function onOpOk(op) {
    S.queue = S.queue.filter(function (o) { return o.id !== op.id; });
    if (op.action === 'pihakBaru') S.needMaster = true;
    var tid = op.body && op.body.tx && op.body.tx.id;
    if (tid && S.tx[tid]) delete S.tx[tid]._error;
  }

  function flush() {
    var op = S.queue.filter(function (o) { return !o.error; })[0];
    if (!op) return Promise.resolve();
    S.inflight = op.id;
    return api(op.action, op.body).then(function () { onOpOk(op); }, function (e) {
      if (e.net || e.code === 'AUTH') throw e;
      onOpFail(op, e);
    }).then(function () { S.inflight = null; return flush(); }, function (e) { S.inflight = null; throw e; });
  }

  function merge(r, full) {
    if (r.master) { S.master = r.master; S.M = C.indexMaster(r.master); }
    // jurnal dihitung di HP dengan aturan yang sama dengan server (lebih ringan disimpan & dikirim)
    if (full) {
      var keep = {};
      Object.keys(S.tx).forEach(function (id) { if (S.tx[id]._pending && !r.transaksi.some(function (t) { return t.ID === id; })) keep[id] = S.tx[id]; });
      S.tx = keep; S.jurnalByTx = {};
    }
    r.transaksi.forEach(function (t) { S.tx[t.ID] = t; });
    S.rev = r.rev; S.mrev = r.mrev; touch();
  }

  function syncNow(opt) {
    opt = opt || {};
    if (!S.cfg || S.authFail && !opt.force) return Promise.resolve();
    if (S.syncing) { S.again = true; return Promise.resolve(); }
    S.syncing = true; setBadge();
    var full = !!opt.full || !S.master;
    return flush().then(function () {
      return api('sync', {since: full ? 0 : S.rev, master: !!opt.master || !!S.needMaster || !S.master, tanpaJurnal: true});
    }).then(function (r) {
      if (r.master || r.mrev === S.mrev) return r;
      // data master (dompet, pihak, kategori) berubah di tempat lain: ambil juga
      return api('sync', {since: S.rev, master: true, tanpaJurnal: true}).then(function (m) {
        if (r.unchanged) return m;
        r.master = m.master; return r;
      });
    }).then(function (r) {
      S.needMaster = false;
      if (!r.unchanged) merge(r, r.since === 0);
      S.online = true; S.authFail = false; S.lastSync = Date.now();
    }).catch(function (e) {
      if (e.code === 'AUTH') S.authFail = true;
      else if (e.net) S.online = false;
      else toast(e.message);
    }).then(function () {
      S.syncing = false; persist(); setBadge();
      if (S.again) { S.again = false; setTimeout(syncNow, 50); }
      if (S.dirty) { S.dirty = false; render(); }
    });
  }

  // ---------------------------------------------------------------- tampilan umum
  function txView(t) {
    var title, sign = 0, ico = ICON.swap, cls = '';
    switch (t.Jenis) {
      case 'Income': title = t.SubKategori || 'Pemasukan'; sign = 1; ico = ICON.down; cls = 'in'; break;
      case 'Expense': title = t.SubKategori || 'Pengeluaran'; sign = -1; ico = ICON.up; cls = 'out'; break;
      case 'Transfer': title = 'Pindah ke ' + t.DompetTujuan; ico = ICON.swap; break;
      case 'Utang/Piutang':
        title = t.SubJenis + ' · ' + t.Pihak; ico = ICON.loan;
        sign = (t.SubJenis === 'Pinjam' || t.SubJenis === 'Terima pelunasan') ? 1 : -1; cls = sign > 0 ? 'in' : 'out'; break;
      case 'Saldo awal': title = 'Saldo awal · ' + (t.Dompet || t.Pihak); ico = ICON.loan; sign = t.SubJenis === 'Dompet' ? 1 : 0; break;
      default: title = t.Jenis;
    }
    var det = [t.Dompet];
    if (t.Toko) det.push(t.Toko); else if (t.Barang) det.push(t.Barang); else if (t.Catatan) det.push(t.Catatan);
    if (t.DicatatOleh && t.DicatatOleh !== S.cfg.user) det.push('oleh ' + t.DicatatOleh);
    return {title: title, sign: sign, ico: ico, cls: cls, sub: det.filter(Boolean).join(' · ')};
  }

  function txRow(t) {
    var v = txView(t), amt = (v.sign > 0 ? '+' : (v.sign < 0 ? '-' : '')) + C.fmtNum(t.Jumlah);
    var tag = t._error ? '<span class="tag bad">gagal</span>' : (t._pending ? '<span class="tag">menunggu</span>' : '');
    return '<div class="row tap' + (t.Status !== 'Aktif' ? ' void' : '') + '" data-act="tx-open" data-id="' + esc(t.ID) + '">' +
      '<div class="ico ' + v.cls + '">' + v.ico + '</div><div class="grow"><div class="t">' + esc(v.title) + tag + '</div><div class="s">' + esc(v.sub) + '</div></div>' +
      '<div class="a ' + (v.sign > 0 ? 'in' : (v.sign < 0 ? 'out' : '')) + '">' + esc(amt) + '</div></div>';
  }

  function ownerChips(cur, act) {
    var items = ['Semua'].concat(S.M.users);
    return '<div class="chips">' + items.map(function (u) { return '<button class="chip sm' + (u === cur ? ' on' : '') + '" data-act="' + act + '" data-v="' + esc(u) + '">' + esc(u) + '</button>'; }).join('') + '</div>';
  }

  function fObj(who, dim) { return !who || who === 'Semua' ? null : (dim === 'pencatat' ? {pencatat: who} : {pemilik: who}); }

  // ---------------------------------------------------------------- layar: Beranda
  function vBeranda() {
    var lines = getLines(), f = fObj(S.owner), today = C.todayLocal();
    var wb = C.walletBalances(lines, S.M, f), total = sum(wb, function (w) { return w.saldo; });
    var per = C.periodRange('bulan', today), is = C.incomeStatement(lines, S.M, per.start, per.end, f);
    var sp = C.saldoPihak(S.tx), piutang = sum(sp, function (p) { return p.piutang; }), utang = sum(sp, function (p) { return p.utang; });
    var shown = wb.filter(function (w) { return w.saldo !== 0; }).sort(function (a, b) { return b.saldo - a.saldo; });
    var recent = C.recent(S.tx, null, 5);
    var h = '';
    var failed = opsFailed();
    if (failed.length) h += '<div class="err" data-act="go-queue" style="cursor:pointer">' + failed.length + ' perubahan gagal dikirim. Ketuk untuk melihat.</div>';
    if (S.authFail) h += '<div class="err">Kunci ditolak server. Buka Lainnya, lalu Perangkat, dan masuk lagi dengan kunci yang benar.</div>';
    h += '<div style="margin:2px 0 10px">' + ownerChips(S.owner, 'owner') + '</div>';
    h += '<div class="card hero"><div class="lbl">Total saldo dompet' + (S.owner !== 'Semua' ? ' · ' + esc(S.owner) : '') + '</div><div class="big">' + esc(C.fmtRp(total)) + '</div></div>';
    h += '<div class="tiles"><div class="tile"><div class="lbl">Masuk bulan ini</div><div class="val in">' + esc(C.fmtRp(is.pendapatan.total)) + '</div></div>' +
      '<div class="tile"><div class="lbl">Keluar bulan ini</div><div class="val out">' + esc(C.fmtRp(is.beban.total)) + '</div></div>' +
      '<div class="tile"><div class="lbl">Piutang (dipinjamkan)</div><div class="val">' + esc(C.fmtRp(piutang)) + '</div></div>' +
      '<div class="tile"><div class="lbl">Utang (dipinjam)</div><div class="val">' + esc(C.fmtRp(utang)) + '</div></div></div>';
    if (is.beban.groups.length) {
      var mx = is.beban.groups[0].total;
      h += '<h2>Keluar bulan ini</h2><div class="card">' + is.beban.groups.slice(0, 5).map(function (g) {
        return '<div style="padding:6px 0"><div style="display:flex;justify-content:space-between"><span>' + esc(g.nama) + '</span><b>' + esc(C.fmtNum(g.total)) + '</b></div><div class="bar red"><i style="width:' + Math.max(3, Math.round(g.total / mx * 100)) + '%"></i></div></div>';
      }).join('') + '</div>';
    }
    h += '<h2>Dompet</h2><div class="card">' + (shown.length ? shown.map(function (w) {
      return '<div class="row"><div class="grow"><div class="t">' + esc(w.nama) + '</div><div class="s">' + esc(w.pemilik) + '</div></div><div class="a ' + (w.saldo < 0 ? 'out' : '') + '">' + esc(C.fmtRp(w.saldo)) + '</div></div>';
    }).join('') : '<div class="empty">Belum ada saldo. Isi dulu lewat Lainnya, lalu Saldo awal.</div>') + '</div>';
    h += '<h2>Terakhir dicatat</h2><div class="card">' + (recent.length ? recent.map(txRow).join('') : '<div class="empty">Belum ada transaksi. Ketuk tombol + untuk mencatat.</div>') + '</div>';
    return h;
  }

  // ---------------------------------------------------------------- layar: Transaksi
  function matchQ(t, q) {
    if (!q) return true;
    var hay = [t.SubKategori, t.Kategori, t.Dompet, t.DompetTujuan, t.Toko, t.Lokasi, t.Barang, t.Tag, t.Catatan, t.Pihak, t.SubJenis, t.Jenis, t.DicatatOleh].join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function txListHTML() {
    var rows = [];
    Object.keys(S.tx).forEach(function (id) {
      var t = S.tx[id];
      if (!S.showVoid && t.Status !== 'Aktif') return;
      if (S.owner !== 'Semua' && t.PemilikDompet !== S.owner) return;
      if (!matchQ(t, S.q)) return;
      rows.push(t);
    });
    rows.sort(function (a, b) { return a.Waktu < b.Waktu ? 1 : (a.Waktu > b.Waktu ? -1 : 0); });
    if (!rows.length) return '<div class="empty">' + (S.q ? 'Tidak ada yang cocok.' : 'Belum ada transaksi.') + '</div>';
    var today = C.todayLocal(), out = '', last = '', n = 0;
    for (var i = 0; i < rows.length && n < S.limit; i++, n++) {
      var d = rows[i].Waktu.substr(0, 10);
      if (d !== last) { if (last) out += '</div>'; out += '<div class="day">' + esc(C.fmtHari(d, today)) + '</div><div class="card">'; last = d; }
      out += txRow(rows[i]);
    }
    out += '</div>';
    if (rows.length > n) out += '<div style="margin:14px 0"><button class="btn" data-act="more">Tampilkan lebih banyak (' + (rows.length - n) + ')</button></div>';
    return out;
  }
  function vTransaksi() {
    return '<input class="search" id="q" type="search" placeholder="Cari: kategori, toko, barang, pihak…" value="' + esc(S.q) + '" autocomplete="off">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">' + ownerChips(S.owner, 'owner') +
      '<button class="chip sm' + (S.showVoid ? ' on' : '') + '" data-act="void-toggle">Dibatalkan</button></div><div id="txlist">' + txListHTML() + '</div>';
  }

  // ---------------------------------------------------------------- layar: Laporan
  function repOpts(kind) { return [['is', 'Laba rugi'], ['bs', 'Neraca'], ['tb', 'Neraca saldo'], ['jr', 'Jurnal']]; }
  function vLaporan() {
    var R = S.rep, today = C.todayLocal(), per = C.periodRange(R.period, today);
    var end = per.end > today ? today : per.end, f = fObj(R.who, R.dim), lines = getLines(), h = '';
    h += '<div class="seg" style="margin-bottom:12px">' + repOpts().map(function (o) { return '<button class="' + (R.kind === o[0] ? 'on' : '') + '" data-act="rep-kind" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>';
    var periods = [['bulan', 'Bulan ini'], ['lalu', 'Bulan lalu'], ['tahun', 'Tahun ini'], ['semua', 'Semua']];
    h += '<div class="chips" style="margin-bottom:10px">' + periods.map(function (p) { return '<button class="chip sm' + (R.period === p[0] ? ' on' : '') + '" data-act="rep-period" data-v="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</div>';
    h += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px">' + ownerChips(R.who, 'rep-who') +
      '<select class="input" style="width:auto;padding:6px 10px;font-size:13px" data-act-change="rep-dim"><option value="pemilik"' + (R.dim === 'pemilik' ? ' selected' : '') + '>Pemilik dompet</option><option value="pencatat"' + (R.dim === 'pencatat' ? ' selected' : '') + '>Pencatat</option></select></div>';
    var labelRange = R.kind === 'is' || R.kind === 'jr' ? (R.period === 'semua' ? 'Semua waktu' : C.fmtTgl(per.start) + ' – ' + C.fmtTgl(end)) : 'Per ' + C.fmtTgl(end);
    h += '<div class="muted" style="font-size:13px;margin:6px 2px 10px">' + esc(labelRange) + (f ? ' · ' + esc(R.who) : ' · Gabungan') + '</div>';
    function rows2(groups) {
      return groups.map(function (g) {
        return '<tr class="sub"><td colspan="2">' + esc(g.nama) + '</td><td>' + esc(C.fmtNum(g.total)) + '</td></tr>' +
          g.rows.map(function (r) { return '<tr><td class="kode">' + esc(r.kode) + '</td><td style="text-align:left">' + esc(r.nama) + '</td><td>' + esc(C.fmtNum(r.jumlah)) + '</td></tr>'; }).join('');
      }).join('');
    }
    if (R.kind === 'is') {
      var is = C.incomeStatement(lines, S.M, per.start, end, f);
      h += '<div class="card"><table class="rep"><tr class="tot"><td colspan="2">Pendapatan</td><td>' + esc(C.fmtNum(is.pendapatan.total)) + '</td></tr>' + rows2(is.pendapatan.groups) +
        '<tr class="tot"><td colspan="2">Beban</td><td>' + esc(C.fmtNum(is.beban.total)) + '</td></tr>' + rows2(is.beban.groups) +
        '<tr class="tot"><td colspan="2">Laba (rugi) bersih</td><td class="' + (is.laba < 0 ? 'out' : 'in') + '">' + esc(C.fmtNum(is.laba)) + '</td></tr></table></div>';
      if (!is.pendapatan.groups.length && !is.beban.groups.length) h += '<div class="empty">Tidak ada transaksi di periode ini.</div>';
    } else if (R.kind === 'bs') {
      var bs = C.balanceSheet(lines, S.M, end, f);
      h += '<div class="card"><table class="rep"><tr class="tot"><td colspan="2">Aset</td><td>' + esc(C.fmtNum(bs.aset.total)) + '</td></tr>' + rows2(bs.aset.groups) +
        '<tr class="tot"><td colspan="2">Liabilitas (utang)</td><td>' + esc(C.fmtNum(bs.liabilitas.total)) + '</td></tr>' + rows2(bs.liabilitas.groups) +
        '<tr class="tot"><td colspan="2">Ekuitas</td><td>' + esc(C.fmtNum(bs.ekuitas.total)) + '</td></tr>' +
        '<tr><td class="kode"></td><td style="text-align:left">Saldo awal</td><td>' + esc(C.fmtNum(bs.ekuitas.saldoAwal)) + '</td></tr>' +
        '<tr><td class="kode"></td><td style="text-align:left">Laba (rugi) ditahan</td><td>' + esc(C.fmtNum(bs.ekuitas.laba)) + '</td></tr>' +
        bs.ekuitas.lain.map(function (x) { return '<tr><td class="kode"></td><td style="text-align:left">' + esc(x.nama) + '</td><td>' + esc(C.fmtNum(x.jumlah)) + '</td></tr>'; }).join('') +
        (bs.ekuitas.transferAntarPemilik ? '<tr><td class="kode"></td><td style="text-align:left">Transfer antar pemilik</td><td>' + esc(C.fmtNum(bs.ekuitas.transferAntarPemilik)) + '</td></tr>' : '') +
        '<tr class="tot"><td colspan="2">Liabilitas + Ekuitas</td><td>' + esc(C.fmtNum(bs.liabilitas.total + bs.ekuitas.total)) + '</td></tr></table></div>' +
        (bs.seimbang ? '' : '<div class="err" style="margin-top:10px">Neraca tidak seimbang. Cek transaksi yang gagal atau akun yang diubah.</div>');
    } else if (R.kind === 'tb') {
      var tb = C.trialBalance(lines, S.M, end, f);
      h += '<div class="card"><table class="rep"><tr><th>Akun</th><th>Debit</th><th>Kredit</th></tr>' + tb.rows.map(function (r) {
        return '<tr><td><span class="muted" style="font-size:12px">' + esc(r.kode) + '</span> ' + esc(r.nama) + '</td><td>' + (r.debit ? esc(C.fmtNum(r.debit)) : '') + '</td><td>' + (r.kredit ? esc(C.fmtNum(r.kredit)) : '') + '</td></tr>';
      }).join('') + '<tr class="tot"><td>Total</td><td>' + esc(C.fmtNum(tb.totalDebit)) + '</td><td>' + esc(C.fmtNum(tb.totalKredit)) + '</td></tr></table></div>' +
        (tb.totalDebit === tb.totalKredit ? '' : '<div class="note">Dengan filter per ' + esc(R.dim) + ', total bisa berbeda karena transfer antar pemilik.</div>');
    } else {
      var by = {}, order = [];
      lines.forEach(function (l) { if (l.tanggal < per.start || l.tanggal > end || !pass(l, f)) return; if (!by[l.txId]) { by[l.txId] = []; order.push(l.txId); } by[l.txId].push(l); });
      order.sort(function (a, b) { var x = S.tx[a].Waktu, y = S.tx[b].Waktu; return x < y ? 1 : (x > y ? -1 : 0); });
      h += '<div class="card">' + (order.length ? order.slice(0, R.limit).map(function (id) {
        var t = S.tx[id], v = txView(t);
        return '<div class="jr"><div class="h">' + esc(C.fmtTgl(t.Waktu.substr(0, 10))) + ' <span>' + esc(v.title) + ' · ' + esc(id) + '</span></div>' + by[id].map(function (l) {
          var nm = S.M.akun[l.kode] ? S.M.akun[l.kode].Nama : l.kode;
          return l.debit ? '<div class="l"><span>' + esc(nm) + '</span><span>' + esc(C.fmtNum(l.debit)) + '</span></div>' : '<div class="l k"><span>' + esc(nm) + '</span><span>' + esc(C.fmtNum(l.kredit)) + '</span></div>';
        }).join('') + '</div>';
      }).join('') + (order.length > R.limit ? '<div style="padding-top:10px"><button class="btn" data-act="rep-more">Tampilkan lebih banyak (' + (order.length - R.limit) + ')</button></div>' : '') : '<div class="empty">Tidak ada jurnal di periode ini.</div>') + '</div>';
    }
    return h;
  }
  function pass(l, f) {
    if (!f) return true;
    if (f.pemilik && l.pemilik !== f.pemilik) return false;
    if (f.pencatat && l.pencatat !== f.pencatat) return false;
    return true;
  }

  // ---------------------------------------------------------------- layar: Lainnya
  function vLainnya() {
    var h = '', st = S.M.st, failed = opsFailed();
    h += '<h2>Catat</h2><div class="card">' +
      '<div class="row tap" data-act="saldo-awal"><div class="ico">' + ICON.loan + '</div><div class="grow"><div class="t">Saldo awal</div><div class="s">Isi saldo dompet, piutang, dan utang saat mulai memakai</div></div></div>' +
      '<div class="row tap" data-act="pihak-list"><div class="ico">' + ICON.list + '</div><div class="grow"><div class="t">Daftar pihak</div><div class="s">Piutang dan utang per orang</div></div></div>' +
      '<div class="row tap" data-act="dompet-list"><div class="ico">' + ICON.home + '</div><div class="grow"><div class="t">Dompet dan akun</div><div class="s">' + S.M.dompetAktif.length + ' dompet aktif</div></div></div></div>';
    h += '<h2>Tampilan</h2><div class="card"><div class="seg" style="margin-bottom:12px">' +
      [['auto', 'Otomatis'], ['light', 'Terang'], ['dark', 'Gelap']].map(function (m) { return '<button class="' + (S.pref.mode === m[0] ? 'on' : '') + '" data-act="pref-mode" data-v="' + m[0] + '">' + m[1] + '</button>'; }).join('') +
      '</div><div class="themes">' + THEMES.map(function (t) {
        return '<button class="theme' + (S.pref.theme === t[0] ? ' on' : '') + '" data-act="pref-theme" data-v="' + t[0] + '"><div class="sw">' + t[2].map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</div><b>' + t[1] + '</b></button>';
      }).join('') + '</div></div>';
    h += '<h2>Sinkron</h2><div class="card"><div class="row"><div class="grow"><div class="t">Antrean kirim</div><div class="s">' + (S.queue.length ? S.queue.length + ' menunggu' + (failed.length ? ', ' + failed.length + ' gagal' : '') : 'Kosong') + '</div></div><button class="btn sm" data-act="sync">Sinkron sekarang</button></div>';
    if (S.queue.length) {
      h += S.queue.map(function (o) {
        var lbl = o.action === 'tambah' ? 'Catat transaksi' : o.action === 'batal' ? 'Batalkan transaksi' : o.action === 'koreksi' ? 'Koreksi transaksi' : 'Tambah pihak ' + (o.body.nama || '');
        return '<div class="row"><div class="grow"><div class="t">' + esc(lbl) + '</div><div class="s' + (o.error ? ' out' : '') + '">' + esc(o.error || 'Menunggu kirim') + '</div></div>' +
          (o.error ? '<button class="btn sm danger" data-act="q-drop" data-id="' + esc(o.id) + '">Buang</button>' : '') + '</div>';
      }).join('');
    }
    h += '</div><h2>Perangkat</h2><div class="card"><dl class="kv"><dt>Masuk sebagai</dt><dd>' + esc(S.cfg.user) + '</dd><dt>Server</dt><dd>…' + esc(S.cfg.url.slice(-18)) + '</dd><dt>Versi</dt><dd>' + VERSION + '</dd></dl>' +
      '<div style="display:flex;gap:10px;margin-top:14px"><button class="btn" data-act="full-sync">Muat ulang semua data</button><button class="btn danger" data-act="logout">Keluar</button></div></div>';
    h += '<div class="muted" style="font-size:12.5px;margin:16px 4px">Daftar akun, kategori, dompet, dan pengguna diubah di Google Sheets (sheet Akun, Kategori, Dompet, Pengguna), lalu ketuk Muat ulang semua data.</div>';
    return h;
  }

  // ---------------------------------------------------------------- render utama
  function render() {
    if (!S.cfg) { renderSetup(); return; }
    var y = window.scrollY;
    var st = S.M.st, view = {beranda: vBeranda, transaksi: vTransaksi, laporan: vLaporan, lainnya: vLainnya}[S.tab]();
    var tabs = [['beranda', 'Beranda', ICON.home], ['transaksi', 'Transaksi', ICON.list], ['laporan', 'Laporan', ICON.chart], ['lainnya', 'Lainnya', ICON.more]];
    $('#app').innerHTML = '<div class="app"><header class="top"><div class="title">' + esc(APP_NAME) + '</div><button id="badge" class="badge" data-act="sync"></button></header><main>' + view + '</main></div>' +
      '<nav class="bottom"><div class="in">' + tabs.map(function (t) { return '<button class="' + (S.tab === t[0] ? 'on' : '') + '" data-act="tab" data-v="' + t[0] + '">' + t[2] + t[1] + '</button>'; }).join('') + '</div></nav>' +
      '<button class="fab" data-act="add" aria-label="Tambah transaksi">' + ICON.plus + 'Catat</button>';
    setBadge();
    window.scrollTo(0, y);
  }

  function renderSetup(err) {
    $('#app').innerHTML = '<div class="setup"><h1>' + esc(APP_NAME) + '</h1><p>Masukkan alamat server dan kunci pribadimu. Cukup sekali; keduanya tersimpan di HP ini.</p>' +
      (err ? '<div class="err">' + esc(err) + '</div>' : '') +
      '<label class="lbl2">Alamat server (berakhiran /exec)</label><input class="input" id="s-url" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="https://script.google.com/macros/s/…/exec">' +
      '<label class="lbl2">Kunci pribadi</label><input class="input" id="s-key" type="password" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="32 huruf dan angka">' +
      '<div style="margin-top:20px"><button class="btn primary" data-act="setup-go" id="s-go">Masuk</button></div></div>';
  }

  // ---------------------------------------------------------------- form input
  var F = null, FX = null;
  function newForm(init) {
    return Object.assign({id: C.newId(), waktu: '', jenis: 'Expense', subJenis: '', dompet: '', dompetTujuan: '', kodeAkun: '', pihak: '', jumlah: 0, biayaAdmin: '', jatuhTempo: '', toko: '', lokasi: '', barang: '', tag: '', catatan: '', referensi: '', pemilik: '', mengoreksi: ''}, init || {});
  }
  function ownWallets() { return S.M.dompetAktif.filter(function (d) { return d.Pemilik === S.cfg.user; }); }
  function defaultWallet(jenis) {
    var last = S.prefs.lastDompet && S.prefs.lastDompet[jenis];
    if (last && S.M.dompet[last] && S.M.dompet[last].Aktif) return last;
    var own = ownWallets()[0] || S.M.dompetAktif[0];
    return own ? own.Nama : '';
  }
  function openForm(init, ex) {
    F = newForm(init); FX = Object.assign({more: false, err: '', edit: null, replaceOp: null}, ex || {});
    if (F.jenis !== 'Saldo awal' && !F.dompet) F.dompet = defaultWallet(F.jenis);
    if (F.jenis === 'Saldo awal' && !F.waktu) F.waktu = C.todayLocal() + 'T00:00';
    FX.more = !!(F.toko || F.lokasi || F.barang || F.tag || F.catatan || (FX.edit && F.waktu));
    renderForm(true);
  }
  function rowToForm(t) {
    return {waktu: t.Waktu, jenis: t.Jenis, subJenis: t.SubJenis, dompet: t.Dompet, dompetTujuan: t.DompetTujuan, kodeAkun: t.KodeAkun, pihak: t.Pihak, jumlah: Number(t.Jumlah),
      biayaAdmin: t.BiayaAdmin, jatuhTempo: t.JatuhTempo, toko: t.Toko, lokasi: t.Lokasi, barang: t.Barang, tag: t.Tag, catatan: t.Catatan, referensi: t.Referensi, pemilik: t.PemilikDompet};
  }
  function chips(items, sel, act, extra) {
    return '<div class="chips">' + items.map(function (i) {
      return '<button class="chip' + (i.v === sel ? ' on' : '') + '" data-act="' + act + '" data-v="' + esc(i.v) + '"' + (extra || '') + '>' + esc(i.l) + '</button>';
    }).join('') + '</div>';
  }
  function topKat(jenis) {
    var rows = C.recent(S.tx, function (t) { return t.Jenis === jenis; }, 400);
    var codes = C.freq(rows.map(function (t) { return t.KodeAkun; }), 7);
    S.M.kategori.filter(function (k) { return k.Jenis === jenis; }).forEach(function (k) { if (codes.length < 7 && codes.indexOf(k.KodeAkun) < 0) codes.push(k.KodeAkun); });
    if (F.kodeAkun && codes.indexOf(F.kodeAkun) < 0) codes.unshift(F.kodeAkun);
    return codes.filter(function (c) { return S.M.katByKode[c]; }).map(function (c) { return {v: c, l: S.M.katByKode[c].SubKategori}; });
  }
  function topWallets(field) {
    var rows = C.recent(S.tx, function (t) { return t[field === 'dompetTujuan' ? 'DompetTujuan' : 'Dompet']; }, 300);
    var names = C.freq(rows.map(function (t) { return t[field === 'dompetTujuan' ? 'DompetTujuan' : 'Dompet']; }), 5);
    names = names.filter(function (n) { return S.M.dompet[n] && S.M.dompet[n].Aktif; });
    ownWallets().forEach(function (d) { if (names.length < 5 && names.indexOf(d.Nama) < 0) names.push(d.Nama); });
    var sel = F[field]; if (sel && names.indexOf(sel) < 0) names.unshift(sel);
    return names.map(function (n) { return {v: n, l: n}; });
  }
  function sug(field, n) {
    var rows = C.recent(S.tx, field === 'Tag' ? null : function (t) { return t.Jenis === 'Expense'; }, 400), pool = rows;
    if (field === 'Barang' && F.toko) { var p = rows.filter(function (t) { return t.Toko === F.toko; }); if (p.length) pool = p; }
    else if (F.kodeAkun && (field === 'Toko' || field === 'Lokasi')) { var q = rows.filter(function (t) { return t.KodeAkun === F.kodeAkun; }); if (q.length >= 3) pool = q; }
    return C.freq(pool.map(function (t) { return t[field]; }), n || 6);
  }
  function sugChips(field, key) {
    var s = sug(field); if (!s.length) return '';
    return '<div class="chips" style="margin-top:8px">' + s.map(function (v) { return '<button class="chip sm" data-act="f-sug" data-field="' + key + '" data-v="' + esc(v) + '">' + esc(v) + '</button>'; }).join('') + '</div>';
  }
  function dueChips() {
    var base = (F.waktu || C.nowLocal()).substr(0, 10), d14 = new Date(base + 'T00:00:00Z'); d14.setUTCDate(d14.getUTCDate() + 14);
    var opts = [['2 minggu', d14.toISOString().substr(0, 10)], ['3 bulan', C.addMonths(base, 3)], ['1 tahun', C.addMonths(base, 12)], ['2 tahun', C.addMonths(base, 24)]];
    var jg = '';
    try { jg = C.jangka(base, F.jatuhTempo); } catch (e) { jg = ''; }
    return '<label class="lbl2">Jatuh tempo</label><div class="chips">' + opts.map(function (o) { return '<button class="chip sm' + (F.jatuhTempo === o[1] ? ' on' : '') + '" data-act="f-due" data-v="' + o[1] + '">' + o[0] + '</button>'; }).join('') + '</div>' +
      '<input class="input" type="date" style="margin-top:8px" value="' + esc(F.jatuhTempo) + '" data-bind="jatuhTempo" data-rerender="1">' +
      (jg ? '<div class="muted" style="margin-top:6px;font-size:13px">Jangka: <b>' + jg + '</b> (otomatis)</div>' : '');
  }
  function loansFor(kind) { return C.openLoans(S.tx, FX.edit).filter(function (l) { return l.kind === kind; }); }
  function loanCards(kind) {
    var ls = loansFor(kind);
    if (!ls.length) return '<div class="note">Belum ada ' + (kind === 'Utang' ? 'utang' : 'piutang') + ' yang belum lunas.</div>';
    return ls.map(function (l) {
      return '<button class="loan' + (F.referensi === l.id ? ' on' : '') + '" data-act="f-loan" data-v="' + esc(l.id) + '"><div class="t">' + esc(l.pihak) + ' · sisa ' + esc(C.fmtRp(l.sisa)) + '</div><div class="s">Dari ' + esc(C.fmtRp(l.jumlah)) + ' · ' + esc(C.fmtTgl(l.tanggal)) + ' · jatuh tempo ' + esc(C.fmtTgl(l.jatuhTempo)) + '</div></button>';
    }).join('');
  }
  function pihakChips() {
    var rows = C.recent(S.tx, function (t) { return t.Pihak; }, 300);
    var names = C.freq(rows.map(function (t) { return t.Pihak; }), 5).filter(function (n) { return S.M.pihakByNama[n.toLowerCase()]; });
    if (F.pihak && names.indexOf(F.pihak) < 0) names.unshift(F.pihak);
    return '<div class="chips">' + names.map(function (n) { return '<button class="chip' + (F.pihak === n ? ' on' : '') + '" data-act="f-pihak" data-v="' + esc(n) + '">' + esc(n) + '</button>'; }).join('') +
      '<button class="chip more" data-act="f-pihak-all">Cari / tambah…</button></div>';
  }
  function walletBlock(label, field) {
    return '<label class="lbl2">' + label + '</label>' + '<div class="chips">' + topWallets(field).map(function (i) {
      var o = S.M.dompet[i.v]; return '<button class="chip' + (F[field] === i.v ? ' on' : '') + '" data-act="f-wallet" data-field="' + field + '" data-v="' + esc(i.v) + '">' + esc(i.l) + '</button>';
    }).join('') + '<button class="chip more" data-act="f-wallet-all" data-field="' + field + '">Lainnya…</button></div>';
  }

  function formHTML() {
    var f = F, h = '', title = FX.edit ? 'Koreksi transaksi' : (f.jenis === 'Saldo awal' ? 'Saldo awal' : 'Catat transaksi');
    h += '<div class="sheet-h"><div class="sh-t">' + title + '</div><button class="x" data-act="f-close" aria-label="Tutup">' + ICON.x + '</button></div><div class="sheet-b" id="formbody">';
    if (f.jenis !== 'Saldo awal') {
      var segs = [['Expense', 'Keluar'], ['Income', 'Masuk'], ['Transfer', 'Pindah'], ['Utang/Piutang', 'Utang/Piutang']];
      h += '<div class="seg">' + segs.map(function (s) { return '<button class="' + (f.jenis === s[0] ? 'on' : '') + '" data-act="f-jenis" data-v="' + s[0] + '"' + (FX.edit && FX.edit && s[0] !== f.jenis ? ' disabled style="opacity:.4"' : '') + '>' + s[1] + '</button>'; }).join('') + '</div>';
    }
    h += '<label class="amt"><span>Rp</span><input id="f-jumlah" inputmode="numeric" autocomplete="off" placeholder="0" value="' + (f.jumlah ? C.fmtNum(f.jumlah) : '') + '" data-amt="1"></label>';

    if (f.jenis === 'Expense' || f.jenis === 'Income') {
      h += '<label class="lbl2">Kategori</label><div class="chips">' + topKat(f.jenis).map(function (i) { return '<button class="chip' + (f.kodeAkun === i.v ? ' on' : '') + '" data-act="f-kat" data-v="' + esc(i.v) + '">' + esc(i.l) + '</button>'; }).join('') + '<button class="chip more" data-act="f-kat-all">Semua…</button></div>';
      h += walletBlock(f.jenis === 'Expense' ? 'Bayar dari' : 'Masuk ke', 'dompet');
    } else if (f.jenis === 'Transfer') {
      h += walletBlock('Dari dompet', 'dompet') + walletBlock('Ke dompet', 'dompetTujuan');
      h += '<label class="lbl2">Biaya admin (opsional)</label><input class="input" inputmode="numeric" placeholder="0" value="' + (f.biayaAdmin ? C.fmtNum(f.biayaAdmin) : '') + '" data-money="biayaAdmin">';
    } else if (f.jenis === 'Utang/Piutang') {
      var subs = [['Beri pinjaman', 'Beri pinjaman'], ['Terima pelunasan', 'Terima pelunasan'], ['Pinjam', 'Pinjam (saya berutang)'], ['Bayar utang', 'Bayar utang']];
      h += '<label class="lbl2">Jenis</label>' + chips(subs.map(function (s) { return {v: s[0], l: s[1]}; }), f.subJenis, 'f-sub');
      if (f.subJenis === 'Pinjam' || f.subJenis === 'Beri pinjaman') h += '<label class="lbl2">Pihak</label>' + pihakChips() + dueChips();
      else if (f.subJenis === 'Bayar utang' || f.subJenis === 'Terima pelunasan') h += '<label class="lbl2">Pinjaman yang dilunasi</label>' + loanCards(f.subJenis === 'Bayar utang' ? 'Utang' : 'Piutang');
      if (f.subJenis) h += walletBlock(f.subJenis === 'Pinjam' || f.subJenis === 'Terima pelunasan' ? 'Uang masuk ke' : 'Uang keluar dari', 'dompet');
    } else if (f.jenis === 'Saldo awal') {
      h += '<div class="note">Saldo awal dicatat sekali saat mulai memakai aplikasi. Isi tanggal sebelum transaksi pertama.</div>';
      h += '<label class="lbl2">Jenis</label>' + chips([{v: 'Dompet', l: 'Saldo dompet'}, {v: 'Piutang', l: 'Piutang'}, {v: 'Utang', l: 'Utang'}], f.subJenis, 'f-sub');
      if (f.subJenis === 'Dompet') h += walletBlock('Dompet', 'dompet');
      if (f.subJenis === 'Piutang' || f.subJenis === 'Utang') {
        h += '<label class="lbl2">Pihak</label>' + pihakChips() + dueChips();
        h += '<label class="lbl2">Pemilik</label>' + chips(S.M.users.map(function (u) { return {v: u, l: u}; }), f.pemilik || S.cfg.user, 'f-owner');
      }
      h += '<label class="lbl2">Tanggal</label><input class="input" type="date" value="' + esc((f.waktu || '').substr(0, 10)) + '" data-date="1" data-rerender="1">';
    }

    var showMore = FX.more;
    if (f.jenis !== 'Saldo awal') {
      h += '<div style="margin-top:16px"><button class="link" data-act="f-more">' + (showMore ? 'Sembunyikan detail' : '+ Tambah detail (toko, lokasi, barang, catatan)') + '</button></div>';
      if (showMore) {
        if (f.jenis === 'Expense') {
          h += '<label class="lbl2">Toko / tempat</label><input class="input" data-bind="toko" value="' + esc(f.toko) + '" autocomplete="off">' + sugChips('Toko', 'toko');
          h += '<label class="lbl2">Lokasi</label><input class="input" data-bind="lokasi" value="' + esc(f.lokasi) + '" autocomplete="off">' + sugChips('Lokasi', 'lokasi');
          h += '<label class="lbl2">Barang</label><input class="input" data-bind="barang" value="' + esc(f.barang) + '" autocomplete="off">' + sugChips('Barang', 'barang');
        }
        h += '<label class="lbl2">Tag</label><input class="input" data-bind="tag" value="' + esc(f.tag) + '" autocomplete="off" placeholder="mis. bulanan, liburan">' + sugChips('Tag', 'tag');
        h += '<label class="lbl2">Catatan</label><input class="input" data-bind="catatan" value="' + esc(f.catatan) + '" autocomplete="off">';
        h += '<label class="lbl2">Tanggal dan jam (kosong = sekarang)</label><input class="input" type="datetime-local" value="' + esc(f.waktu) + '" data-bind="waktu" data-rerender="1">';
      }
    }
    h += '</div><div class="sheet-f">' + (FX.err ? '<div class="err">' + esc(FX.err) + '</div>' : '') + '<button class="btn primary" data-act="f-save">' + (FX.edit ? 'Simpan koreksi' : 'Simpan') + '</button></div>';
    return h;
  }

  function renderForm(focus) {
    var ov = $('#overlay'), body = $('#formbody'), st = body ? body.scrollTop : 0;
    var ae = document.activeElement, keep = ae && ae.id === 'f-jumlah';
    ov.innerHTML = '<div class="scrim" data-act="f-close"></div><div class="sheet full">' + formHTML() + '</div>';
    var nb = $('#formbody'); if (nb && !focus) nb.scrollTop = st;
    if (focus || keep) { var a = $('#f-jumlah'); if (a) { try { a.focus(); } catch (e) {} } }
  }
  function closeForm() { $('#overlay').innerHTML = ''; F = null; FX = null; }

  function resetForJenis(j) {
    F.jenis = j; F.subJenis = ''; F.kodeAkun = ''; F.pihak = ''; F.referensi = ''; F.jatuhTempo = ''; F.dompetTujuan = ''; F.biayaAdmin = '';
    F.dompet = defaultWallet(j);
  }

  function saveForm() {
    try {
      if (!F.waktu) F.waktu = C.nowLocal();
      var ignore = FX.edit || null;
      var tx = C.makeTx(F, S.cfg.user, S.M, S.tx, {ignoreId: ignore});
      if (FX.edit) {
        var old = S.tx[FX.edit];
        if (!old || old.Status !== 'Aktif') throw new Error('Transaksi yang dikoreksi sudah dibatalkan');
        old._prevStatus = old.Status; old.Status = 'Dibatalkan'; old._pendingBatal = true;
        tx._pending = true; S.tx[tx.ID] = tx;
        enqueue({action: 'koreksi', body: {id: FX.edit, tx: C.toPayload(F)}});
      } else {
        tx._pending = true; S.tx[tx.ID] = tx;
        enqueue({action: 'tambah', body: {tx: C.toPayload(F)}});
      }
      if (FX.replaceOp) discardOp(FX.replaceOp, true);
      if (tx.Dompet && tx.Jenis !== 'Saldo awal') { S.prefs.lastDompet = S.prefs.lastDompet || {}; S.prefs.lastDompet[tx.Jenis] = tx.Dompet; }
      var jenis = tx.Jenis; closeForm(); touch(); render(); toast(jenis === 'Saldo awal' ? 'Saldo awal tersimpan' : 'Tersimpan'); syncNow();
    } catch (e) {
      FX.err = e.message; renderForm();
      var fb = $('.sheet-f'); if (fb) fb.scrollIntoView({block: 'end'});
    }
  }

  // ---------------------------------------------------------------- picker
  var P = null;
  function openPicker(cfg) { P = cfg; P.q = ''; renderPicker(true); }
  function pickerItems() {
    var q = P.q.toLowerCase().trim();
    return P.items.filter(function (i) { return !q || (i.l + ' ' + (i.g || '') + ' ' + (i.s || '')).toLowerCase().indexOf(q) >= 0; });
  }
  function pickerList() {
    var items = pickerItems(), out = '', last = null;
    items.forEach(function (it) {
      if (it.g !== last) { out += '<div class="day">' + esc(it.g || '') + '</div>'; last = it.g; }
      out += '<div class="card" style="padding:0 14px;margin-bottom:6px"><div class="row tap" data-act="pick" data-i="' + P.items.indexOf(it) + '"><div class="grow"><div class="t">' + esc(it.l) + '</div>' + (it.s ? '<div class="s">' + esc(it.s) + '</div>' : '') + '</div></div></div>';
    });
    if (P.allowAdd && P.q.trim().length >= 2 && !P.items.some(function (i) { return i.l.toLowerCase() === P.q.trim().toLowerCase(); })) {
      out = '<div class="card" style="padding:0 14px;margin-bottom:6px"><div class="row tap" data-act="pick-add"><div class="ico">' + ICON.plus + '</div><div class="grow"><div class="t">Tambah "' + esc(P.q.trim()) + '"</div><div class="s">Sebagai pihak baru</div></div></div></div>' + out;
    }
    return out || '<div class="empty">Tidak ada yang cocok.</div>';
  }
  function renderPicker(focus) {
    $('#overlay2').innerHTML = '<div class="scrim" data-act="pick-close"></div><div class="sheet full"><div class="sheet-h"><div class="sh-t">' + esc(P.title) + '</div><button class="x" data-act="pick-close">' + ICON.x + '</button></div>' +
      '<div class="sheet-b"><input class="search" id="pq" type="search" placeholder="Cari…" autocomplete="off"><div id="plist">' + pickerList() + '</div></div></div>';
    if (focus) { var a = $('#pq'); if (a) a.focus(); }
  }
  function closePicker() { $('#overlay2').innerHTML = ''; P = null; }

  // ---------------------------------------------------------------- detail transaksi
  var D = null;
  function openDetail(id) { D = {id: id, confirm: false}; renderDetail(); }
  function hasActiveRepay(id) {
    return Object.keys(S.tx).some(function (k) { var r = S.tx[k]; return r.Referensi === id && r.Status === 'Aktif' && C.isRepay(r); });
  }
  function renderDetail() {
    var t = S.tx[D.id]; if (!t) { $('#overlay').innerHTML = ''; D = null; return; }
    var v = txView(t), lines = [];
    try { lines = (!t._pending && S.jurnalByTx[t.ID]) ? S.jurnalByTx[t.ID].map(function (j) { return {kode: String(j.KodeAkun), debit: Number(j.Debit), kredit: Number(j.Kredit)}; }) : C.deriveLines(t, S.M); } catch (e) {}
    var kv = [['Jenis', t.Jenis + (t.SubJenis ? ' · ' + t.SubJenis : '')], ['Tanggal', C.fmtTgl(t.Waktu.substr(0, 10)) + ' ' + t.Waktu.substr(11)], ['Dompet', t.Dompet + (t.DompetTujuan ? ' → ' + t.DompetTujuan : '')],
      ['Kategori', t.Kategori ? t.Kategori + ' / ' + t.SubKategori : ''], ['Pihak', t.Pihak], ['Jatuh tempo', t.JatuhTempo ? C.fmtTgl(t.JatuhTempo) + ' (' + t.Jangka + ')' : ''],
      ['Biaya admin', t.BiayaAdmin ? C.fmtRp(t.BiayaAdmin) : ''], ['Toko', t.Toko], ['Lokasi', t.Lokasi], ['Barang', t.Barang], ['Tag', t.Tag], ['Catatan', t.Catatan],
      ['Dicatat oleh', t.DicatatOleh], ['Pemilik dompet', t.PemilikDompet], ['Status', t.Status + (t._pending ? ' · menunggu kirim' : '')], ['Mengoreksi', t.Mengoreksi], ['Pinjaman', t.Referensi], ['ID', t.ID]]
      .filter(function (r) { return r[1]; });
    var blocked = (C.loanKind(t) && hasActiveRepay(t.ID));
    var canAct = t.Status === 'Aktif' && !t._pendingBatal;
    var h = '<div class="sheet-h"><div class="sh-t">Detail transaksi</div><button class="x" data-act="d-close">' + ICON.x + '</button></div><div class="sheet-b">' +
      '<div class="card hero"><div class="lbl">' + esc(v.title) + '</div><div class="big ' + (v.sign > 0 ? 'in' : (v.sign < 0 ? 'out' : '')) + '">' + esc((v.sign > 0 ? '+' : (v.sign < 0 ? '-' : '')) + C.fmtRp(t.Jumlah).replace('-', '')) + '</div></div>' +
      (t._error ? '<div class="err" style="margin-top:10px">Gagal dikirim: ' + esc(t._error) + '</div>' : '') +
      '<div class="card" style="margin-top:10px"><dl class="kv">' + kv.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl></div>' +
      (lines.length ? '<h2>Jurnal</h2><div class="card">' + lines.map(function (l) { var nm = S.M.akun[l.kode] ? S.M.akun[l.kode].Nama : l.kode; return l.debit ? '<div class="jr" style="padding:4px 0;border:0"><div class="l"><span>' + esc(nm) + '</span><span>' + esc(C.fmtNum(l.debit)) + '</span></div></div>' : '<div class="jr" style="padding:4px 0;border:0"><div class="l k"><span>' + esc(nm) + '</span><span>' + esc(C.fmtNum(l.kredit)) + '</span></div></div>'; }).join('') + '</div>' : '') +
      (blocked ? '<div class="note">Pinjaman ini sudah punya pelunasan. Batalkan pelunasannya dulu sebelum mengubah atau membatalkan pinjaman.</div>' : '') + '</div>';
    if (t._error) {
      h += '<div class="sheet-f" style="display:flex;gap:10px"><button class="btn danger" data-act="d-drop">Buang</button><button class="btn primary" data-act="d-edit-failed">Ubah dan kirim ulang</button></div>';
    } else if (canAct && !blocked && t.Jenis !== 'Saldo awal') {
      h += '<div class="sheet-f" style="display:flex;gap:10px">' + (D.confirm ? '<button class="btn" data-act="d-cancel-no">Tidak jadi</button><button class="btn danger" data-act="d-cancel-yes">Ya, batalkan</button>' : '<button class="btn danger" data-act="d-cancel">Batalkan</button><button class="btn primary" data-act="d-correct">Koreksi</button>') + '</div>';
    } else if (canAct && !blocked && t.Jenis === 'Saldo awal') {
      h += '<div class="sheet-f">' + (D.confirm ? '<div style="display:flex;gap:10px"><button class="btn" data-act="d-cancel-no">Tidak jadi</button><button class="btn danger" data-act="d-cancel-yes">Ya, batalkan</button></div>' : '<button class="btn danger" data-act="d-cancel">Batalkan saldo awal</button>') + '</div>';
    }
    $('#overlay').innerHTML = '<div class="scrim" data-act="d-close"></div><div class="sheet">' + h + '</div>';
  }
  function cancelTx(id) {
    var t = S.tx[id]; if (!t) return;
    var inQ = S.queue.filter(function (o) { return o.action === 'tambah' && o.body.tx.id === id && o.id !== S.inflight && !o.error; })[0];
    if (t._pending && inQ) {
      S.queue = S.queue.filter(function (o) { return o.id !== inQ.id; }); delete S.tx[id];
    } else {
      t._pendingBatal = true; t.Status = 'Dibatalkan'; enqueue({action: 'batal', body: {id: id}});
    }
    touch(); render(); toast('Dibatalkan'); syncNow();
  }
  function discardOp(opId, silent) {
    var op = S.queue.filter(function (o) { return o.id === opId; })[0]; if (!op) return;
    S.queue = S.queue.filter(function (o) { return o.id !== opId; });
    var tid = op.body && op.body.tx && op.body.tx.id;
    if (tid && S.tx[tid] && S.tx[tid]._pending) delete S.tx[tid];
    if (op.action === 'koreksi') revertBatal(op.body.id);
    touch(); if (!silent) { render(); }
  }

  // ---------------------------------------------------------------- daftar pihak / dompet
  function showPihak() {
    var sp = C.saldoPihak(S.tx), bySaldo = {};
    sp.forEach(function (p) { bySaldo[p.pihak] = p; });
    var rest = S.M.pihak.filter(function (p) { return !bySaldo[p.Nama]; });
    var h = '<div class="sheet-h"><div class="sh-t">Daftar pihak</div><button class="x" data-act="info-close">' + ICON.x + '</button></div><div class="sheet-b">';
    h += '<div class="card">' + (sp.length ? sp.map(function (p) {
      return '<div class="row"><div class="grow"><div class="t">' + esc(p.pihak) + '</div><div class="s">' + p.pinjaman.map(function (l) { return (l.kind === 'Piutang' ? 'Piutang ' : 'Utang ') + C.fmtNum(l.sisa) + ' · tempo ' + C.fmtTgl(l.jatuhTempo); }).join(' | ') + '</div></div>' +
        '<div class="a">' + (p.piutang ? '<div class="in">+' + esc(C.fmtNum(p.piutang)) + '</div>' : '') + (p.utang ? '<div class="out">-' + esc(C.fmtNum(p.utang)) + '</div>' : '') + '</div></div>';
    }).join('') : '<div class="empty">Tidak ada piutang atau utang yang belum lunas.</div>') + '</div>';
    h += '<h2>Pihak lain (' + rest.length + ')</h2><div class="card">' + (rest.length ? '<div class="chips">' + rest.map(function (p) { return '<span class="chip sm">' + esc(p.Nama) + '</span>'; }).join('') + '</div>' : '<div class="empty">Semua pihak punya saldo.</div>') + '</div>';
    h += '<div style="margin-top:14px"><button class="btn" data-act="pihak-add">Tambah pihak baru</button></div></div>';
    $('#overlay').innerHTML = '<div class="scrim" data-act="info-close"></div><div class="sheet full">' + h + '</div>';
  }
  function showDompet() {
    var wb = C.walletBalances(getLines(), S.M, null);
    var h = '<div class="sheet-h"><div class="sh-t">Dompet dan akun</div><button class="x" data-act="info-close">' + ICON.x + '</button></div><div class="sheet-b"><div class="card">' +
      wb.map(function (w) { return '<div class="row"><div class="grow"><div class="t">' + esc(w.nama) + '</div><div class="s">' + esc(w.pemilik) + ' · akun ' + esc(w.kode) + '</div></div><div class="a ' + (w.saldo < 0 ? 'out' : '') + '">' + esc(C.fmtRp(w.saldo)) + '</div></div>'; }).join('') +
      '</div><div style="margin-top:14px"><button class="btn primary" data-act="w-open">Tambah dompet</button></div><div class="muted" style="font-size:12.5px;margin:12px 4px">Untuk menonaktifkan dompet, buka sheet Dompet di Google Sheets dan isi Aktif = FALSE (jangan hapus baris).</div></div>';
    $('#overlay').innerHTML = '<div class="scrim" data-act="info-close"></div><div class="sheet full">' + h + '</div>';
  }

  // ---------------------------------------------------------------- tambah dompet
  var W = null;
  function openWalletForm() { W = {nama: '', jenis: 'Kas', pemilik: S.cfg.user, saldo: 0, err: '', busy: false}; renderWalletForm(true); }
  function renderWalletForm(focus) {
    var h = '<div class="sheet-h"><div class="sh-t">Tambah dompet</div><button class="x" data-act="w-close" aria-label="Kembali">' + ICON.x + '</button></div><div class="sheet-b">' +
      '<label class="lbl2">Nama dompet</label><input class="input" id="w-nama" data-w="nama" value="' + esc(W.nama) + '" autocomplete="off" placeholder="mis. Dana, BRI, Tabungan Haji">' +
      '<label class="lbl2">Jenis</label>' + chips([{v: 'Kas', l: 'Kas / e-wallet / bank'}, {v: 'Investasi', l: 'Investasi'}], W.jenis, 'w-jenis') +
      '<label class="lbl2">Pemilik</label>' + chips(S.M.users.map(function (u) { return {v: u, l: u}; }), W.pemilik, 'w-owner') +
      '<label class="lbl2">Saldo awal (opsional)</label><input class="input" inputmode="numeric" data-w="saldo" data-money="1" placeholder="0" value="' + (W.saldo ? C.fmtNum(W.saldo) : '') + '">' +
      '<div class="note">Kode akun dibuat otomatis. Dompet baru langsung muncul di HP lain.</div></div>' +
      '<div class="sheet-f">' + (W.err ? '<div class="err">' + esc(W.err) + '</div>' : '') + '<button class="btn primary" data-act="w-save"' + (W.busy ? ' disabled' : '') + '>' + (W.busy ? 'Menyimpan…' : 'Simpan dompet') + '</button></div>';
    $('#overlay').innerHTML = '<div class="scrim" data-act="w-close"></div><div class="sheet full">' + h + '</div>';
    if (focus) { var a = $('#w-nama'); if (a) a.focus(); }
  }
  function saveWallet() {
    var nama = C.clean(W.nama);
    if (nama.length < 2) { W.err = 'Nama dompet minimal 2 huruf'; renderWalletForm(); return; }
    W.busy = true; W.err = ''; renderWalletForm();
    api('dompetBaru', {nama: nama, jenis: W.jenis, pemilik: W.pemilik}).then(function (r) {
      var saldo = Number(W.saldo) || 0, real = r.nama || nama;
      S.needMaster = true; syncNow({master: true, force: true});
      var t0 = Date.now();
      (function wait() {
        if (S.M.dompet[real] || Date.now() - t0 > 8000) {
          W = null;
          if (r.dup) toast('Dompet itu sudah ada'); else toast('Dompet ditambahkan');
          if (saldo > 0 && S.M.dompet[real]) {
            openForm({jenis: 'Saldo awal', subJenis: 'Dompet', dompet: real, jumlah: saldo, waktu: C.todayLocal() + 'T00:00'});
            saveForm();
          } else showDompet();
          return;
        }
        setTimeout(wait, 150);
      })();
    }).catch(function (e) {
      W.busy = false; W.err = e.net ? 'Perlu koneksi internet untuk menambah dompet.' : (e.code === 'AUTH' ? 'Kunci ditolak server.' : e.message); renderWalletForm();
    });
  }

  // ---------------------------------------------------------------- aksi
  var A = {
    tab: function (el) { S.tab = el.dataset.v; S.limit = 80; render(); window.scrollTo(0, 0); },
    add: function () { openForm({jenis: 'Expense'}); },
    sync: function () { S.authFail = false; syncNow({force: true}); },
    'full-sync': function () { syncNow({full: true, master: true, force: true}); toast('Memuat ulang…'); },
    owner: function (el) { S.owner = el.dataset.v; render(); },
    'void-toggle': function () { S.showVoid = !S.showVoid; render(); },
    more: function () { S.limit += 80; render(); },
    'go-queue': function () { S.tab = 'lainnya'; render(); },
    'tx-open': function (el) { openDetail(el.dataset.id); },
    'rep-kind': function (el) { S.rep.kind = el.dataset.v; S.rep.limit = 50; render(); },
    'rep-period': function (el) { S.rep.period = el.dataset.v; S.rep.limit = 50; render(); },
    'rep-who': function (el) { S.rep.who = el.dataset.v; render(); },
    'rep-more': function () { S.rep.limit += 50; render(); },
    'saldo-awal': function () { openForm({jenis: 'Saldo awal', subJenis: 'Dompet'}); },
    'pihak-list': showPihak, 'dompet-list': showDompet,
    'info-close': function () { $('#overlay').innerHTML = ''; },
    'pref-mode': function (el) { S.pref.mode = el.dataset.v; lsSet('kk.pref', S.pref); applyTheme(); render(); },
    'pref-theme': function (el) { S.pref.theme = el.dataset.v; lsSet('kk.pref', S.pref); applyTheme(); render(); },
    'w-open': function () { openWalletForm(); },
    'w-close': function () { W = null; showDompet(); },
    'w-jenis': function (el) { W.jenis = el.dataset.v; renderWalletForm(); },
    'w-owner': function (el) { W.pemilik = el.dataset.v; renderWalletForm(); },
    'w-save': saveWallet,
    'pihak-add': function () { addPihakPicker(function () { showPihak(); }); },
    'q-drop': function (el) { discardOp(el.dataset.id); },
    logout: function () {
      if (!confirm('Keluar dari aplikasi di HP ini? Data yang belum terkirim akan hilang.')) return;
      lsSet('kk.cfg', null); DB.set('state', null); S.cfg = null; S.tx = {}; S.jurnalByTx = {}; S.master = null; S.queue = []; S.rev = 0; S.mrev = 0; S.M = C.indexMaster(null); render();
    },
    'setup-go': function () { doSetup(); },
    // form
    'f-close': function () { closeForm(); },
    'f-jenis': function (el) { if (FX.edit) return; resetForJenis(el.dataset.v); renderForm(); },
    'f-kat': function (el) { F.kodeAkun = el.dataset.v; renderForm(); },
    'f-kat-all': function () {
      var items = S.M.kategori.filter(function (k) { return k.Jenis === F.jenis; }).map(function (k) { return {v: k.KodeAkun, l: k.SubKategori, g: k.Kategori}; });
      openPicker({title: 'Kategori', items: items, onPick: function (it) { F.kodeAkun = it.v; closePicker(); renderForm(); }});
    },
    'f-wallet': function (el) { F[el.dataset.field] = el.dataset.v; renderForm(); },
    'f-wallet-all': function (el) {
      var field = el.dataset.field;
      var items = S.M.dompetAktif.map(function (d) { return {v: d.Nama, l: d.Nama, g: d.Pemilik}; }).sort(function (a, b) { return a.g === b.g ? 0 : (a.g === S.cfg.user ? -1 : (b.g === S.cfg.user ? 1 : (a.g < b.g ? -1 : 1))); });
      openPicker({title: 'Pilih dompet', items: items, onPick: function (it) { F[field] = it.v; closePicker(); renderForm(); }});
    },
    'f-sub': function (el) {
      var v = el.dataset.v; F.subJenis = v; F.referensi = ''; F.pihak = F.jenis === 'Saldo awal' ? F.pihak : ''; F.jatuhTempo = '';
      if (F.jenis === 'Saldo awal' && v !== 'Dompet' && !F.pemilik) F.pemilik = S.cfg.user;
      if (F.jenis === 'Saldo awal' && v === 'Dompet' && !F.dompet) F.dompet = defaultWallet('Saldo awal');
      renderForm();
    },
    'f-owner': function (el) { F.pemilik = el.dataset.v; renderForm(); },
    'f-pihak': function (el) { F.pihak = el.dataset.v; renderForm(); },
    'f-pihak-all': function () {
      var items = S.M.pihak.map(function (p) { return {v: p.Nama, l: p.Nama}; });
      openPicker({title: 'Pilih pihak', items: items, allowAdd: true, onPick: function (it) { F.pihak = it.v; closePicker(); renderForm(); }, onAdd: function (nama) { addPihak(nama); F.pihak = nama; closePicker(); renderForm(); }});
    },
    'f-due': function (el) { F.jatuhTempo = el.dataset.v; renderForm(); },
    'f-loan': function (el) {
      var l = C.openLoans(S.tx, FX.edit).filter(function (x) { return x.id === el.dataset.v; })[0]; if (!l) return;
      F.referensi = l.id; F.pihak = l.pihak; if (!F.jumlah || F.jumlah > l.sisa) F.jumlah = l.sisa; renderForm();
    },
    'f-more': function () { FX.more = !FX.more; renderForm(); },
    'f-sug': function (el) { var k = el.dataset.field; F[k] = k === 'tag' && F.tag ? F.tag + ', ' + el.dataset.v : el.dataset.v; renderForm(); },
    'f-save': saveForm,
    // picker
    'pick': function (el) { var it = P.items[+el.dataset.i]; P.onPick(it); },
    'pick-add': function () { var n = P.q.trim(); if (P.onAdd) P.onAdd(n); },
    'pick-close': closePicker,
    // detail
    'd-close': function () { $('#overlay').innerHTML = ''; D = null; },
    'd-cancel': function () { D.confirm = true; renderDetail(); },
    'd-cancel-no': function () { D.confirm = false; renderDetail(); },
    'd-cancel-yes': function () { var id = D.id; $('#overlay').innerHTML = ''; D = null; cancelTx(id); },
    'd-correct': function () { var t = S.tx[D.id]; $('#overlay').innerHTML = ''; D = null; openForm(rowToForm(t), {edit: t.ID}); },
    'd-drop': function () {
      var id = D.id, op = S.queue.filter(function (o) { return o.body && o.body.tx && o.body.tx.id === id; })[0];
      $('#overlay').innerHTML = ''; D = null; if (op) discardOp(op.id); render();
    },
    'd-edit-failed': function () {
      var id = D.id, t = S.tx[id], op = S.queue.filter(function (o) { return o.body && o.body.tx && o.body.tx.id === id; })[0];
      $('#overlay').innerHTML = ''; D = null;
      openForm(rowToForm(t), {edit: op && op.action === 'koreksi' ? op.body.id : null, replaceOp: op ? op.id : null});
    }
  };

  function addPihak(nama) {
    nama = C.clean(nama);
    if (S.M.pihakByNama[nama.toLowerCase()]) return nama;
    S.master.pihak.push({PihakID: '(baru)', Nama: nama, Aktif: true}); S.M = C.indexMaster(S.master);
    enqueue({action: 'pihakBaru', body: {nama: nama}}); touch(); syncNow();
    return nama;
  }
  function addPihakPicker(done) {
    openPicker({title: 'Tambah pihak baru', items: [], allowAdd: true, onAdd: function (n) { addPihak(n); closePicker(); toast('Pihak ditambahkan'); done(); }});
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return;
    var fn = A[el.dataset.act]; if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.id === 'q') { S.q = el.value; S.limit = 80; var l = $('#txlist'); if (l) l.innerHTML = txListHTML(); return; }
    if (el.dataset.w && W) {
      if (el.dataset.money) { var sv = el.value.replace(/\D/g, '').substr(0, 13); W.saldo = sv ? Number(sv) : 0; el.value = sv ? C.fmtNum(sv) : ''; }
      else W[el.dataset.w] = el.value;
      return;
    }
    if (el.id === 'pq' && P) { P.q = el.value; $('#plist').innerHTML = pickerList(); return; }
    if (el.dataset.amt && F) {
      var d = el.value.replace(/\D/g, '').substr(0, 13); F.jumlah = d ? Number(d) : 0; el.value = d ? C.fmtNum(d) : ''; return;
    }
    if (el.dataset.money && F) {
      var m = el.value.replace(/\D/g, '').substr(0, 11); F[el.dataset.money] = m ? Number(m) : ''; el.value = m ? C.fmtNum(m) : ''; return;
    }
    if (el.dataset.bind && F && !el.dataset.rerender) F[el.dataset.bind] = el.value;
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.dataset.actChange === 'rep-dim') { S.rep.dim = el.value; render(); return; }
    if (!F) return;
    if (el.dataset.date) { F.waktu = el.value ? el.value + 'T00:00' : ''; renderForm(); return; }
    if (el.dataset.bind && el.dataset.rerender) { F[el.dataset.bind] = el.value; renderForm(); }
  });

  // ---------------------------------------------------------------- setup & mulai
  function doSetup() {
    var url = ($('#s-url').value || '').trim(), key = ($('#s-key').value || '').trim(), btn = $('#s-go');
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^\s]+\/exec$/.test(url) && !/^https?:\/\/(localhost|127\.0\.0\.1)/.test(url)) { renderSetup('Alamat server harus berupa https://script.google.com/macros/s/…/exec'); $('#s-url').value = url; return; }
    if (!key) { renderSetup('Kunci belum diisi'); $('#s-url').value = url; return; }
    btn.disabled = true; btn.textContent = 'Memeriksa…';
    S.cfg = {url: url, key: key, user: ''};
    api('ping').then(function (r) {
      S.cfg.user = r.user; lsSet('kk.cfg', S.cfg);
      S.tx = {}; S.jurnalByTx = {}; S.master = null; S.queue = []; S.rev = 0; S.mrev = 0;
      render(); return syncNow({full: true, master: true});
    }).catch(function (e) {
      S.cfg = null; renderSetup(e.code === 'AUTH' ? 'Kunci salah atau pengguna nonaktif.' : (e.net ? 'Tidak bisa menghubungi server. Cek alamat dan koneksi.' : e.message));
      $('#s-url').value = url;
    });
  }

  function start() {
    applyTheme();
    S.cfg = lsGet('kk.cfg');
    if (!S.cfg) { render(); return; }
    DB.get('state').then(function (st) {
      if (st && st.user === S.cfg.user) {
        S.rev = st.rev || 0; S.mrev = st.mrev || 0; S.tx = st.tx || {}; S.jurnalByTx = {}; S.master = st.master || null;
        S.queue = st.queue || []; S.prefs = st.prefs || {lastDompet: {}}; S.lastSync = st.lastSync || 0;
        S.M = C.indexMaster(S.master);
      }
      S._lines = null; render(); syncNow();
    });
  }
  setInterval(function () { if (document.visibilityState === 'visible' && S.cfg) syncNow(); }, 15000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') syncNow(); });
  window.addEventListener('online', function () { syncNow(); });
  window.addEventListener('offline', function () { S.online = false; setBadge(); });
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  if (window.matchMedia) { var mq = matchMedia('(prefers-color-scheme: dark)'), onMq = function () { if (S.pref.mode === 'auto') applyTheme(); }; if (mq.addEventListener) mq.addEventListener('change', onMq); }
  window.__KK = {S: S, syncNow: syncNow};
  start();
})();
