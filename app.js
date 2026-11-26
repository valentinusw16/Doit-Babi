/* Do it - aplikasi HP (v2.0). Tanpa framework; data di IndexedDB; sinkron ke Google Sheets lewat Apps Script.
   Modul tambahan (plan.js, port.js, analisis.js) memakai objek window.DoIt yang dibuat di sini. */
(function () {
  'use strict';
  var C = window.Core, C2 = window.Core2, L = window.I18N, t = L.t;
  var VERSION = '3.7.0', APP_NAME = 'Do it';
  var X = window.DoIt = {hooks: {}, pages: {}, repKinds: {}};

  // ---------------------------------------------------------------- util
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }
  function dn(s) { return L.dn ? L.dn(s) : s; }
  function sum(a, f) { return a.reduce(function (x, y) { return x + f(y); }, 0); }
  function sv(p) { return '<svg viewBox="0 0 24 24">' + p + '</svg>'; }
  var ICON = {
    home: sv('<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
    list: sv('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
    chart: sv('<path d="M5 20V11M12 20V4M19 20v-6M2 20h20"/>'),
    grid: sv('<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'),
    plus: sv('<path d="M12 5v14M5 12h14"/>'), x: sv('<path d="M6 6l12 12M18 6L6 18"/>'), back: sv('<path d="M15 5l-7 7 7 7"/>'),
    chev: sv('<path d="M9 5l7 7-7 7"/>'), up: sv('<path d="M12 19V5M6 11l6-6 6 6"/>'), down: sv('<path d="M12 5v14M6 13l6 6 6-6"/>'),
    swap: sv('<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>'),
    loan: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5c0-1 1-1.7 2.5-1.7s2.5.7 2.5 1.7-1 1.5-2.5 1.9-2.5.9-2.5 1.9 1 1.7 2.5 1.7 2.5-.7 2.5-1.7"/>'),
    sun: sv('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: sv('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
    auto: sv('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor" stroke="none"/>'),
    bksp: sv('<path d="M21 5H8l-6 7 6 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="M17 9l-5 6M12 9l5 6"/>'),
    cal: sv('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    copy: sv('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h9"/>'),
    wallet: sv('<path d="M3 7a2 2 0 0 1 2-2h13v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 13.5h.01"/>'),
    people: sv('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.5 3.3-5.5 6.5-5.5s5.9 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>'),
    tag: sv('<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/>'),
    gear: sv('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    flag: sv('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
    inArr: sv('<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>'), outArr: sv('<path d="M12 20V8M6 14l6-6 6 6M4 4h16"/>'),
    // ikon kategori
    food: sv('<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M17 21v-9c-2 0-3-1.5-3-4.5S15 3 17 3z"/>'),
    bill: sv('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3"/>'),
    bag: sv('<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>'),
    car: sv('<path d="M5 16h14v-4l-2-5H7l-2 5zM5 16v2.5M19 16v2.5M3 12h2M19 12h2"/><circle cx="8" cy="13.5" r=".6"/><circle cx="16" cy="13.5" r=".6"/>'),
    spark: sv('<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>'),
    heart: sv('<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>'),
    gift: sv('<path d="M4 10h16v4H4zM6 14h12v7H6zM12 10v11M12 10c-1.5-3.5-6-3.5-5-.5M12 10c1.5-3.5 6-3.5 5-.5"/>'),
    trend: sv('<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>'),
    coins: sv('<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.6-2.4-2.9-5.5-3"/>'),
    brief: sv('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12.5h18"/>'),
    star: sv('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
    store: sv('<path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM10 20v-5h4v5"/>'),
    bell: sv('<path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0"/>'),
    share: sv('<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>'),
    pie: sv('<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>'),
    target: sv('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r=".8"/>'),
    repeat: sv('<path d="M4 11V9a3 3 0 0 1 3-3h12M16 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H5M8 21l-3-3 3-3"/>'),
    check: sv('<path d="M5 12l5 5L20 7"/>'), chevd: sv('<path d="M6 9l6 6 6-6"/>'), alert: sv('<path d="M12 3l10 18H2zM12 10v5M12 18h.01"/>'),
    edit: sv('<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>'), plan: sv('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4M8 15h3"/>')
  };
  var CAT_ICON = [[/makan|minum|food/i, 'food'], [/tagihan|bill/i, 'bill'], [/pembelian|perawatan|belanja/i, 'bag'], [/transport/i, 'car'],
    [/gaya hidup|hiburan|lifestyle/i, 'spark'], [/kesehatan|karir|health/i, 'heart'], [/sosial|social/i, 'gift'], [/investasi|tabungan|invest/i, 'trend'],
    [/pekerjaan|gaji|work/i, 'brief'], [/profesi/i, 'star'], [/bisnis|usaha/i, 'store'], [/penerimaan/i, 'gift']];
  function catIcon(grp, sub, kode) { if (X.hooks.subIcon && (sub || kode)) { var si = X.hooks.subIcon(grp, sub, kode); if (si) return si; } for (var i = 0; i < CAT_ICON.length; i++) if (CAT_ICON[i][0].test(grp || '')) return ICON[CAT_ICON[i][1]]; return ICON.coins; }
  var CHART = ['#e4572e', '#f2a541', '#2a9d8f', '#4c6fbf', '#9b5de5', '#e05297', '#8d99ae'];

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
        return new Promise(function (res, rej) { var q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = function () { res(q.result); }; q.onerror = function () { rej(q.error); }; });
      }).catch(function () { return mem[k]; });
    },
    set: function (k, v) {
      mem[k] = v;
      return this.open().then(function (db) {
        return new Promise(function (res, rej) { var x = db.transaction('kv', 'readwrite'); x.objectStore('kv').put(v, k); x.oncomplete = function () { res(); }; x.onerror = function () { rej(x.error); }; });
      }).catch(function () {});
    }
  };
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // ---------------------------------------------------------------- state
  var S = {
    cfg: null, tx: {}, jurnalByTx: {}, master: null, M: C.indexMaster(null), rev: 0, mrev: 0, epoch: null, queue: [], prefs: {lastDompet: {}, actSeen: 0, warnSeen: {}},
    lastSync: 0, online: true, syncing: false, again: false, authFail: false, inflight: null, dirty: false,
    prev: 0, rencana: [], act: [], actReady: false, custom: null, debtF: 'Semua', tab: 'beranda', page: null, stack: [], anim: '', owner: 'Semua', q: '', showVoid: false, limit: 80, txPer: 'bulan', per: 'bulan', katJenis: 'Expense',
    rep: {kind: 'is', period: 'bulan', dim: 'pemilik', who: 'Semua', limit: 50}, _lines: null, flowK: 'expense', ntab: 'notif',
    pref: Object.assign({theme: 'rose', mode: 'auto', lang: 'id', gaya: 'kaca', sb: 'auto'}, lsGet('kk.pref') || {})
  };
  var persistT = null;
  function persist() {
    clearTimeout(persistT);
    persistT = setTimeout(function () {
      DB.set('state', {rev: S.rev, mrev: S.mrev, prev: S.prev, rencana: S.rencana, act: S.act, epoch: S.epoch, tx: S.tx, jurnalByTx: {}, master: S.master, queue: S.queue, prefs: S.prefs, lastSync: S.lastSync, user: S.cfg && S.cfg.user});
    }, 250);
  }
  var NONOP_G = 'Di Luar Operasional';
  function isNonOp(kode) { var a = S.M.akun[kode]; return !!(a && a.Kelompok === NONOP_G); }
  function getOpLines() {
    var all = getLines();
    if (S._opSrc !== all) { S._opSrc = all; S._op = all.filter(function (l) { return !isNonOp(l.kode); }); }
    return S._op;
  }
  function touch() { S._lines = null; S.dirty = true; persist(); }
  function getLines() { if (!S._lines) S._lines = C.buildLines({tx: S.tx, jurnalByTx: {}, M: S.M}); return S._lines; }
  function toast(msg) {
    var x = $('#toast'); x.textContent = msg; x.className = 'show';
    clearTimeout(toast._t); toast._t = setTimeout(function () { x.className = ''; }, 2400);
  }
  function isDark() { var m = S.pref.mode; return m === 'dark' || (m !== 'light' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }
  function applyTheme() {
    var d = document.documentElement;
    d.setAttribute('data-theme', S.pref.theme || 'rose'); d.setAttribute('data-dark', isDark() ? '1' : '0'); d.setAttribute('lang', S.pref.lang);
    d.setAttribute('data-gaya', S.pref.gaya === 'bersih' ? 'bersih' : 'kaca'); d.setAttribute('data-sb', S.pref.sb || 'auto');
    L.set(S.pref.lang); C.setLang(S.pref.lang);
    var bg = getComputedStyle(d).getPropertyValue('--bg').trim(), m = document.querySelector('meta[name=theme-color]');
    if (m && bg) m.setAttribute('content', bg);
  }
  function savePref() { lsSet('kk.pref', S.pref); applyTheme(); }

  // ---------------------------------------------------------------- API & sinkron
  function api(action, extra) {
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 60000) : null;
    var body = JSON.stringify(Object.assign({key: S.cfg.key, action: action}, extra || {}));
    return fetch(S.cfg.url, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: body, signal: ctl ? ctl.signal : undefined})
      .catch(function () { throw Object.assign(new Error(t('setup.net')), {net: true}); })
      .then(function (res) {
        if (timer) clearTimeout(timer);
        if (!res.ok) throw Object.assign(new Error('Server error ' + res.status), {net: true});
        return res.json().catch(function () { throw Object.assign(new Error('Bad response'), {net: true}); });
      })
      .then(function (j) { if (!j.ok) { var e = new Error(j.error || 'Gagal'); e.code = j.code; throw e; } return j; });
  }
  function opsFailed() { return S.queue.filter(function (o) { return o.error; }); }
  function syncState() {
    var n = S.queue.length, bad = opsFailed().length;
    if (S.authFail) return ['bad', t('app.sync.auth')];
    if (bad) return ['bad', t('app.sync.failed', bad)];
    if (n) return ['warn', t('app.sync.wait', n)];
    if (!S.online) return ['warn', t('app.sync.offline')];
    if (S.syncing) return ['busy', t('app.sync.busy')];
    return [S.lastSync ? 'ok' : 'warn', S.lastSync ? t('app.sync.ok', C.nowLocal(new Date(S.lastSync)).substr(11)) : t('app.sync.never')];
  }
  function setBadge() {
    var b = $('#sync'); if (!b) return;
    var s = syncState(); b.setAttribute('data-state', s[0]); b.setAttribute('title', s[1]); b.setAttribute('aria-label', s[1]);
    var lb = $('#synclbl'); if (lb) lb.textContent = s[1];
  }
  function enqueue(op) { op.id = 'Q' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4); S.queue.push(op); persist(); }
  function revertBatal(id) { var x = S.tx[id]; if (x && x._pendingBatal) { x.Status = 'Aktif'; delete x._pendingBatal; } }
  function onOpFail(op, e) {
    op.error = e.message || 'Gagal';
    if (op.action === 'batal' || op.action === 'koreksi') revertBatal(op.body.id);
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
    if (full) {
      var keep = {};
      Object.keys(S.tx).forEach(function (id) { if (S.tx[id]._pending && !r.transaksi.some(function (x) { return x.ID === id; })) keep[id] = S.tx[id]; });
      S.tx = keep;
    }
    r.transaksi.forEach(function (x) { S.tx[x.ID] = x; });
    S.rev = r.rev; S.mrev = r.mrev; if (r.epoch != null) S.epoch = r.epoch;
    if (r.rencana) S.rencana = r.rencana.filter(function (x) { return x.Aktif; });
    if (r.prev != null) S.prev = r.prev;
    if (r.aktivitas) mergeAct(r.aktivitas);
    touch();
  }
  function actCutoff() { return C2.addDays(C.todayLocal(), -7) + 'T00:00:00'; }
  function mergeAct(rows) {
    var seen = {}; S.act.forEach(function (a) { seen[a.ID] = 1; });
    var fresh = rows.filter(function (a) { return !seen[a.ID]; }), cut = actCutoff();
    S.act = S.act.concat(fresh).filter(function (a) { return a.Waktu >= cut; }).slice(-150);
    if (S.actReady && S.cfg) {
      var others = fresh.filter(function (a) { return a.Oleh !== S.cfg.user; });
      if (others.length) toast(others.length === 1 ? actText(others[0]) : t('n.many', others.length, others[others.length - 1].Oleh));
    }
  }
  function markActSeen() {
    var mx = S.prefs.actSeen || 0; S.act.forEach(function (a) { if (a.Rev > mx) mx = a.Rev; });
    if (mx !== S.prefs.actSeen) { S.prefs.actSeen = mx; persist(); }
  }
  function unreadCount() {
    if (!S.cfg) return 0; var cut = actCutoff(), seen = S.prefs.actSeen || 0;
    return S.act.filter(function (a) { return a.Oleh !== S.cfg.user && a.Rev > seen && a.Waktu >= cut; }).length + (X.analisis ? X.analisis.newWarnCount() : 0);
  }
  function unreadAct() { var cut = actCutoff(), seen = S.prefs.actSeen || 0; return S.cfg ? S.act.filter(function (a) { return a.Oleh !== S.cfg.user && a.Rev > seen && a.Waktu >= cut; }).length : 0; }
  function actText(a) {
    var x = S.tx[a.TransaksiID], who = a.Oleh === (S.cfg && S.cfg.user) ? t('n.you') : a.Oleh, what;
    if (x) { var v = txView(x); what = v.title + ' · ' + C.fmtRp(x.Jumlah) + (x.Dompet ? ' · ' + x.Dompet : ''); } else what = a.Ringkas;
    return who + ' ' + t('n.' + a.Aksi) + ': ' + what;
  }
  function syncNow(opt) {
    opt = opt || {};
    if (!S.cfg || S.authFail && !opt.force) return Promise.resolve();
    if (S.syncing) { S.again = true; return Promise.resolve(); }
    S.syncing = true; setBadge();
    var full = !!opt.full || !S.master;
    return flush().then(function () {
      return api('sync', {since: full ? 0 : S.rev, sinceP: S.prev, master: !!opt.master || !!S.needMaster || !S.master, tanpaJurnal: true});
    }).then(function (r) {
      // data di server diganti menyeluruh (mis. impor ulang): muat ulang semuanya
      if (!full && r.epoch != null && S.epoch != null && r.epoch !== S.epoch) return api('sync', {since: 0, sinceP: 0, master: true, tanpaJurnal: true});
      if (r.master || r.mrev === S.mrev) return r;
      return api('sync', {since: S.rev, sinceP: S.prev, master: true, tanpaJurnal: true}).then(function (m) { if (r.unchanged) return m; r.master = m.master; return r; });
    }).then(function (r) {
      S.needMaster = false;
      if (!r.unchanged) merge(r, r.since === 0);
      else if (r.epoch != null && S.epoch == null) S.epoch = r.epoch;
      S.online = true; S.authFail = false; S.lastSync = Date.now(); S.actReady = true;
    }).catch(function (e) {
      if (e.code === 'AUTH') S.authFail = true; else if (e.net) S.online = false; else toast(e.message);
    }).then(function () {
      S.syncing = false; persist(); setBadge();
      if (S.again) { S.again = false; setTimeout(syncNow, 50); }
      if (S.dirty) { S.dirty = false; render(); }
    });
  }

  // ---------------------------------------------------------------- komponen umum
  function fObj(who, dim) { return !who || who === 'Semua' ? null : (dim === 'pencatat' ? {pencatat: who} : {pemilik: who}); }
  var PER_MAIN = ['hari', 'bulan', 'lalu'];
  function periodOf(kind) {
    var today = C.todayLocal();
    if (kind === '7h') return {start: C2.addDays(today, -6), end: today};
    if (kind === '30h') return {start: C2.addDays(today, -29), end: today};
    if (kind === '3b') return {start: C2.addMonthKey(today.substr(0, 7), -2) + '-01', end: today};
    if (kind === 'custom') { var c = S.custom || {start: today, end: today}; return {start: c.start, end: c.end}; }
    return C.periodRange(kind, today);
  }
  function rangeOf(kind) { var today = C.todayLocal(), p = periodOf(kind); return {start: p.start, end: p.end > today && kind !== 'semua' ? today : p.end, today: today}; }
  function prevOf(kind) {
    if (kind === 'semua') return null;
    if (kind === '7h' || kind === '30h' || kind === '3b' || kind === 'custom') {
      var p = rangeOf(kind), len = C2.daysBetween(p.start, p.end) + 1, e = C2.addDays(p.start, -1); return {start: C2.addDays(e, -(len - 1)), end: e};
    }
    return C.prevRange(kind, C.todayLocal());
  }
  function perLabel(k) { if (k === 'custom') { var p = periodOf('custom'); return C.fmtTgl(p.start) + ' – ' + C.fmtTgl(p.end); } return t('per.' + k); }
  function dd(label, kind, forAct, cur) {
    return '<button class="dd" data-act="dd" data-k="' + kind + '" data-for="' + forAct + '" data-cur="' + esc(cur == null ? '' : cur) + '"><span>' + esc(label) + '</span><i>' + ICON.chevd + '</i></button>';
  }
  function ownerChips(cur, act) { if (act === 'owner') { S._ownTop = true; return ''; } return dd(cur === 'Semua' ? t('all') : cur, 'owner', act, cur); }
  function perChips(cur, act) { return dd(perLabel(cur), 'per', act, cur); }
  function openChoice(title, opts, cur, forAct) {
    $('#overlay2').innerHTML = '<div class="scrim" data-act="pick-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + esc(title) + '</div><button class="x" data-act="pick-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div><div class="sheet-b"><div class="card choice">' +
      opts.map(function (o) { return '<button class="row tap' + (o.v === cur ? ' on' : '') + '" data-act="dd-pick" data-for="' + forAct + '" data-v="' + esc(o.v) + '"><div class="grow"><div class="t">' + esc(o.l) + '</div></div>' + (o.v === cur ? ICON.check : '') + '</button>'; }).join('') + '</div></div></div>';
  }
  var PER_ALL = ['hari', 'bulan', 'lalu', '7h', '30h', '3b', 'tahun', 'tahunlalu', 'semua'];
  function openPerSheet(forAct) {
    var cur = {txper: S.txPer, per: S.per, 'rep-period': S.rep.period}[forAct], c = S.custom || {start: C.todayLocal(), end: C.todayLocal()};
    $('#overlay2').innerHTML = '<div class="scrim" data-act="pick-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + t('per.title') + '</div><button class="x" data-act="pick-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div><div class="sheet-b"><div class="card choice">' +
      PER_ALL.map(function (k) { return '<button class="row tap' + (k === cur ? ' on' : '') + '" data-act="per-pick" data-for="' + forAct + '" data-v="' + k + '"><div class="grow"><div class="t">' + t('per.' + k) + '</div></div>' + (k === cur ? ICON.check : '') + '</button>'; }).join('') +
      '</div><label class="lbl2">' + t('per.custom') + '</label><div class="daterow"><input class="input" type="date" id="pc-a" value="' + esc(c.start) + '"><span class="muted">–</span><input class="input" type="date" id="pc-b" value="' + esc(c.end) + '"></div>' +
      '<div style="margin-top:14px"><button class="btn' + (cur === 'custom' ? ' primary' : '') + '" data-act="per-custom" data-for="' + forAct + '">' + t('per.apply') + '</button></div></div></div>';
  }
  function jl(j) { return t('j.' + j); }
  function txView(x) {
    var title, sign = 0, ico = ICON.swap, cls = '';
    switch (x.Jenis) {
      case 'Income': title = dn(x.SubKategori); sign = 1; ico = catIcon(x.Kategori, x.SubKategori, x.KodeAkun); cls = 'in'; break;
      case 'Expense': title = dn(x.SubKategori); sign = -1; ico = catIcon(x.Kategori, x.SubKategori, x.KodeAkun); cls = 'out'; break;
      case 'Transfer': title = t('tx.to', x.DompetTujuan); break;
      case 'Utang/Piutang':
        title = t('s.' + x.SubJenis) + ' · ' + x.Pihak; ico = ICON.loan;
        sign = (x.SubJenis === 'Pinjam' || x.SubJenis === 'Terima pelunasan') ? 1 : -1; cls = sign > 0 ? 'in' : 'out'; break;
      case 'Saldo awal': title = t('tx.opening', x.Dompet || x.Pihak); ico = ICON.flag; sign = x.SubJenis === 'Dompet' ? 1 : 0; break;
      default: title = x.Jenis;
    }
    var det = [x.Dompet];
    if (x.Toko) det.push(x.Toko); else if (x.Barang) det.push(x.Barang); else if (x.Catatan) det.push(x.Catatan); else if (x.Tag) det.push(x.Tag);
    if (x.DicatatOleh && S.cfg && x.DicatatOleh !== S.cfg.user) det.push(t('tx.by', x.DicatatOleh));
    return {title: title, sign: sign, ico: ico, cls: cls, sub: det.filter(Boolean).join(' · ')};
  }
  function signAmt(v, n) { return (v.sign > 0 ? '+' : (v.sign < 0 ? '−' : '')) + C.fmtNum(n); }
  function txRow(x) {
    var v = txView(x);
    var tag = x._error ? '<span class="tag bad">' + t('tx.failed') + '</span>' : (x._pending ? '<span class="tag">' + t('tx.pending') + '</span>' : '');
    return '<div class="row tap' + (x.Status !== 'Aktif' ? ' void' : '') + '" data-act="tx-open" data-id="' + esc(x.ID) + '">' +
      '<div class="ico ' + v.cls + '">' + v.ico + '</div><div class="grow"><div class="t">' + esc(v.title) + tag + '</div><div class="s">' + esc(v.sub) + '</div></div>' +
      '<div class="a ' + (v.sign > 0 ? 'in' : (v.sign < 0 ? 'out' : '')) + '">' + esc(signAmt(v, x.Jumlah)) + '</div></div>';
  }
  function txListGrouped(rows, limit, moreAct) {
    if (!rows.length) return '<div class="card"><div class="empty">' + t('flow.empty') + '</div></div>';
    var today = C.todayLocal(), out = '', last = '', n = 0;
    for (var i = 0; i < rows.length && n < limit; i++, n++) {
      var d = rows[i].Waktu.substr(0, 10);
      if (d !== last) { if (last) out += '</div>'; out += '<div class="day' + (d === today ? ' today' : '') + '">' + esc(C.fmtHari(d, today)) + '</div><div class="card' + (d === today ? ' hl' : '') + '">'; last = d; }
      out += txRow(rows[i]);
    }
    out += '</div>';
    if (rows.length > n) out += '<div class="more-wrap"><button class="btn" data-act="' + moreAct + '">' + t('more', rows.length - n) + '</button></div>';
    return out;
  }
  function byTimeDesc(a, b) { return a.Waktu < b.Waktu ? 1 : (a.Waktu > b.Waktu ? -1 : 0); }
  function donut(groups, total, label) {
    if (!total) return '<div class="donut empty-d"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" class="ring0"/></svg><div class="dc"><b>0</b><span>' + esc(label) + '</span></div></div>';
    var parts = groups.slice(0, 6).map(function (g) { return {nama: g.nama, v: g.total}; });
    var rest = total - sum(parts, function (p) { return p.v; }); if (rest > 0) parts.push({nama: '…', v: rest});
    var C0 = 2 * Math.PI * 44, off = 0, arcs = parts.map(function (p, i) {
      var len = Math.max(0, p.v / total * C0 - (parts.length > 1 ? 1.5 : 0));
      var a = '<circle cx="60" cy="60" r="44" stroke="' + CHART[i % CHART.length] + '" stroke-dasharray="' + len.toFixed(2) + ' ' + C0.toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>';
      off += p.v / total * C0; return a;
    }).join('');
    return '<div class="donut"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" class="ring0"/><g transform="rotate(-90 60 60)">' + arcs + '</g></svg><div class="dc"><b>' + esc(shortRp(total)) + '</b><span>' + esc(label) + '</span></div></div>';
  }
  function legend(groups, total, act) {
    var parts = groups.slice(0, 6), rest = total - sum(parts, function (g) { return g.total; });
    return '<div class="legend">' + parts.map(function (g, i) {
      return '<div class="lg"' + (act ? ' data-act="' + act + '"' : '') + '><i style="background:' + CHART[i % CHART.length] + '"></i><span>' + esc(dn(g.nama)) + '</span><b>' + Math.round(g.total / total * 100) + '%</b></div>';
    }).join('') + (rest > 0 ? '<div class="lg"><i style="background:' + CHART[6] + '"></i><span>…</span><b>' + Math.round(rest / total * 100) + '%</b></div>' : '') + '</div>';
  }
  function shortRp(n) {
    var a = Math.abs(n), s = n < 0 ? '−' : '', en = S.pref.lang === 'en';
    if (a >= 1e9) return s + (a / 1e9).toFixed(1).replace('.', en ? '.' : ',').replace(/[.,]0$/, '') + (en ? 'B' : 'M');
    if (a >= 1e6) return s + (a / 1e6).toFixed(1).replace('.', en ? '.' : ',').replace(/[.,]0$/, '') + (en ? 'M' : 'jt');
    if (a >= 1e3) return s + Math.round(a / 1e3) + (en ? 'K' : 'rb');
    return s + a;
  }
  function kodeToDompet() { var m = {}; ((S.master && S.master.dompet) || []).forEach(function (d) { m[String(d.KodeAkun)] = d; }); return m; }
  function assetGroups(f) {
    var bs = C.balanceSheet(getLines(), S.M, C.todayLocal(), f);
    return {bs: bs, groups: bs.aset.groups};
  }
  function isPiutangGroup(g) { return /piutang/i.test(g.nama); }

  // ---------------------------------------------------------------- Beranda
  function vBeranda() {
    if (X.hooks.homePre) X.hooks.homePre();
    var f = fObj(S.owner), r = rangeOf('bulan'), lines = getOpLines();
    var A = assetGroups(f), is = C.incomeStatement(lines, S.M, r.start, r.end, f);
    var loans = C.openLoans(S.tx).filter(function (l) { return !f || l.pemilik === f.pemilik; });
    var piutang = sum(loans.filter(function (l) { return l.kind === 'Piutang'; }), function (l) { return l.sisa; });
    var utang = sum(loans.filter(function (l) { return l.kind === 'Utang'; }), function (l) { return l.sisa; });
    var P = {f: f, is: is, A: A, piutang: piutang, utang: utang}, failed = opsFailed();
    P.banner = (failed.length ? '<div class="err tap" data-act="page" data-v="settings">' + t('home.failed', failed.length) + '</div>' : '') + (S.authFail ? '<div class="err">' + t('home.authfail') + '</div>' : '');
    ownerChips(S.owner, 'owner'); P.owner = '';
    P.top = X.hooks.homeTop ? X.hooks.homeTop() : '';
    var hbg = X.hooks.heroBg ? X.hooks.heroBg() : null;
    P.hero = '<div class="card hero' + (hbg ? ' photo ' + hbg.cls : '') + '">' + (hbg ? hbg.html : '') + '<div class="lbl">' + t('home.net') + (S.owner !== 'Semua' ? ' · ' + esc(S.owner) : '') + '</div><div class="big">' + esc(C.fmtRp(A.bs.aset.total - A.bs.liabilitas.total)) + '</div>' +
      '<div class="sub2">' + esc(t('home.assets', C.fmtRp(A.bs.aset.total))) + ' · ' + esc(t('home.debt', C.fmtRp(A.bs.liabilitas.total))) + '</div>' +
      (X.hooks.heroExtra ? X.hooks.heroExtra(f) : '') +
      '<div class="inout"><button class="tap" data-act="page" data-v="income"><span>' + t('home.in') + '</span><b class="in">' + esc(C.fmtRp(is.pendapatan.total)) + '</b></button><button class="tap" data-act="page" data-v="expense"><span>' + t('home.out') + '</span><b class="out">' + esc(C.fmtRp(is.beban.total)) + '</b></button></div></div>';
    P.ratio = X.hooks.homeRatio ? X.hooks.homeRatio(f) : '';
    P.sankey = X.hooks.homeSankey ? X.hooks.homeSankey(is) : '';
    var PS0 = X.plan && X.plan.state ? X.plan.state(S.owner) : null;
    P.ev = PS0 && X.v361 ? X.v361.homeEv(PS0) : ''; P.gl = PS0 && X.v361 ? X.v361.homeGl(PS0) : ''; P.mid = P.ev + P.gl;
    P.assets = '<div class="h2row"><h2>' + t('home.assets.h') + '</h2><button class="link" data-act="page" data-v="portfolio">' + t('see.all') + '</button></div>' +
      (A.groups.length ? '<div class="card">' + A.groups.map(function (g) {
        var pg = isPiutangGroup(g);
        return '<div class="row tap" ' + (pg ? 'data-act="page" data-v="receivable"' : 'data-act="page" data-v="portfolio" data-g="' + esc(g.nama) + '"') + '><div class="ico">' + catIcon(g.nama) + '</div><div class="grow"><div class="t">' + esc(dn(g.nama)) + '</div><div class="s">' + esc(t('home.grp.n', g.rows.length)) + '</div></div><div class="a">' + esc(C.fmtRp(g.total)) + '</div>' + ICON.chev + '</div>';
      }).join('') + '</div>' : '<div class="card"><div class="empty">' + t('home.empty.assets') + '</div></div>');
    P.tiles = '<div class="tiles">' +
      '<button class="tile tap" data-act="page" data-v="receivable"><div class="lbl">' + t('home.recv') + '</div><div class="val">' + esc(C.fmtRp(piutang)) + '</div>' + ICON.chev + '</button>' +
      '<button class="tile tap" data-act="page" data-v="payable"><div class="lbl">' + t('home.pay') + '</div><div class="val">' + esc(C.fmtRp(utang)) + '</div>' + ICON.chev + '</button></div>';
    var recent = C.recent(S.tx, null, 5), today = C.todayLocal();
    var todayAll = Object.keys(S.tx).filter(function (k) { var x = S.tx[k]; return x.Status === 'Aktif' && x.Waktu.substr(0, 10) === today; }).length;
    var shownToday = recent.filter(function (x) { return x.Waktu.substr(0, 10) === today; }).length;
    P.recentH = '<div class="h2row"><h2>' + t('home.recent') + '</h2><button class="link" data-act="tab" data-v="transaksi">' + t('see.all') + '</button></div>';
    P.recent = '<div class="card">' + (recent.length ? recent.map(txRow).join('') : '<div class="empty">' + t('home.empty.tx') + '</div>') +
      (todayAll > shownToday ? '<button class="more-row" data-act="tx-today">' + t('home.today.more', todayAll - shownToday) + '</button>' : '') + '</div>';
    if (X.hooks.homeLayout) return X.hooks.homeLayout(P);
    return P.banner + P.owner + P.top + P.hero + P.ratio + P.sankey + P.mid + P.assets + P.tiles + P.recentH + P.recent;
  }

  // ---------------------------------------------------------------- Transaksi
  function matchQ(x, q) {
    if (!q) return true;
    var hay = [x.SubKategori, x.Kategori, x.Dompet, x.DompetTujuan, x.Toko, x.Lokasi, x.Barang, x.Tag, x.Catatan, x.Pihak, x.SubJenis, x.Jenis, x.DicatatOleh].join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function txFiltered(skipOwner) {
    var r = rangeOf(S.txPer), rows = [];
    Object.keys(S.tx).forEach(function (id) {
      var x = S.tx[id], d = x.Waktu.substr(0, 10);
      if (!S.showVoid && x.Status !== 'Aktif') return;
      if (d < r.start || d > r.end) return;
      if (!skipOwner && S.owner !== 'Semua' && x.PemilikDompet !== S.owner) return;
      if (S.txCat && x.Kategori !== S.txCat) return;
      if (S.txSub && x.KodeAkun !== S.txSub) return;
      if (!matchQ(x, S.q)) return;
      rows.push(x);
    });
    return rows.sort(byTimeDesc);
  }
  function txSummary(rows) {
    var inn = 0, out = 0;
    rows.forEach(function (x) { if (x.Status !== 'Aktif' || isNonOp(x.KodeAkun)) return; if (x.Jenis === 'Income') inn += +x.Jumlah; else if (x.Jenis === 'Expense') out += +x.Jumlah; else if (x.Jenis === 'Transfer' && +x.BiayaAdmin) out += +x.BiayaAdmin; });
    return '<div class="card sumcard"><div><span>' + t('tx.sum.in') + '</span><b class="in">' + esc(C.fmtRp(inn)) + '</b></div><div><span>' + t('tx.sum.out') + '</span><b class="out">' + esc(C.fmtRp(out)) + '</b></div>' +
      '<div><span>' + t('tx.sum.net') + '</span><b class="' + (inn - out < 0 ? 'out' : '') + '">' + esc(C.fmtRp(inn - out)) + '</b></div><small>' + t('tx.sum.count', C.fmtNum(rows.length)) + '</small></div>';
  }
  function txBody() { var rows = txFiltered(); return txSummary(rows) + (X.v36 && S.M.users.length > 1 ? X.v36.userCompare(txFiltered(true)) : '') + (X.hooks.txTable && X.wide && X.wide() ? X.hooks.txTable(rows, S.limit) : (X.hooks.txDays ? X.hooks.txDays(rows, S.limit) : txListGrouped(rows, S.limit, 'more'))); }
  function vTransaksi() {
    var tabs = X.v361 ? X.v361.txTabs() : '';
    if (X.v361 && S.txTab === 'rutin') return tabs + X.plan.vRutin();
    return tabs + '<div class="stick"><div class="ddrow">' + perChips(S.txPer, 'txper') + ownerChips(S.owner, 'owner') + (X.v36 ? X.v36.txFilters() : '') + '<button class="chip sm' + (S.showVoid ? ' on' : '') + '" data-act="void-toggle">' + t('tx.void') + '</button></div>' +
      '<input class="search" id="q" type="search" placeholder="' + esc(t('tx.search')) + '" value="' + esc(S.q) + '" autocomplete="off">' + (X.v36 ? X.v36.txBar() : '') + '</div>' +
      (X.hooks.txTop ? X.hooks.txTop() : '') + '<div id="txlist">' + txBody() + '</div>';
  }

  // ---------------------------------------------------------------- halaman Pemasukan / Pengeluaran
  function pctTxt(cur, prev) {
    if (!prev) return '';
    var p = Math.round((cur - prev) / prev * 100);
    return p === 0 ? t('flow.same') : (p > 0 ? t('flow.up', p) : t('flow.down', -p));
  }
  var flowCtx = null;
  function flowListHTML() {
    if (!flowCtx) return '';
    var rows = flowCtx.rows.filter(function (x) { return X.v36 ? X.v36.matchFlow(x, S.fq) : true; });
    return (X.v36 ? X.v36.flowResult(rows, S.fq) : '') + (rows.length ? txListGrouped(rows, S.limit, 'more') : '<div class="card"><div class="empty">' + t('flow.empty') + '</div></div>');
  }
  function vFlow(kind) {
    var isInc = kind === 'income', f = fObj(S.owner), r = rangeOf(S.per), lines = getOpLines();
    var cur = C.incomeStatement(lines, S.M, r.start, r.end, f), part = isInc ? cur.pendapatan : cur.beban;
    var pr = prevOf(S.per), prevTot = null;
    if (pr) { var pv = C.incomeStatement(lines, S.M, pr.start, pr.end, f); prevTot = isInc ? pv.pendapatan.total : pv.beban.total; }
    var h = '<div class="stick"><div class="ddrow flrow"><div class="seg sm nseg">' + [['expense', 'pg.expense'], ['income', 'pg.income']].map(function (x) { return '<button class="' + (kind === x[0] ? 'on' : '') + '" data-act="flow-k" data-v="' + x[0] + '">' + t(x[1]) + '</button>'; }).join('') + '</div>' + perChips(S.per, 'per') + ownerChips(S.owner, 'owner') +
      '<input class="search flsearch" id="fq" type="search" placeholder="' + esc(t('v36.fq')) + '" value="' + esc(S.fq || '') + '" autocomplete="off"></div></div>';
    var cmp = prevTot != null ? pctTxt(part.total, prevTot) : '';
    h += '<div class="card hero"><div class="lbl">' + t(isInc ? 'flow.total.in' : 'flow.total.out') + '</div><div class="big ' + (isInc ? 'in' : 'out') + '">' + esc(C.fmtRp(part.total)) + '</div>' +
      (cmp ? '<div class="sub2">' + esc(cmp) + ' ' + t('per.vs') + ' (' + esc(C.fmtRp(prevTot)) + ')</div>' : '') + '</div>';
    var trend = X.trendFlow ? X.trendFlow(kind, f) : '';
    if (!part.total) return h + '<div class="card"><div class="empty">' + t('flow.empty') + '</div></div>' + trend;
    var rows = Object.keys(S.tx).map(function (k) { return S.tx[k]; }).filter(function (x) {
      var d = x.Waktu.substr(0, 10); return x.Status === 'Aktif' && !isNonOp(x.KodeAkun) && x.Jenis === (isInc ? 'Income' : 'Expense') && d >= r.start && d <= r.end && (!f || x.PemilikDompet === f.pemilik);
    }).sort(byTimeDesc);
    h += '<div class="card pie-one">' + donut(part.groups, part.total, t(isInc ? 'tx.sum.in' : 'tx.sum.out')) + legend(part.groups, part.total) + '</div>' + (X.viz ? X.viz.flow(part, isInc, rows) : '') + trend;
    flowCtx = {isInc: isInc, rows: rows};
    h += '<h2>' + t('flow.list') + '</h2><div id="fl-list">' + flowListHTML() + '</div>';
    return h;
  }

  // ---------------------------------------------------------------- halaman Utang Piutang (satu menu, daftar per orang)
  function debtPeople(f) {
    var ls = C.openLoans(S.tx).filter(function (l) { return !f || l.pemilik === f.pemilik; }), by = {}, order = [];
    ls.forEach(function (l) {
      var p = by[l.pihak] || (by[l.pihak] = {nama: l.pihak, piutang: [], utang: [], tp: 0, tu: 0});
      if (l.kind === 'Piutang') { p.piutang.push(l); p.tp += l.sisa; } else { p.utang.push(l); p.tu += l.sisa; }
    });
    Object.keys(by).forEach(function (k) { by[k].net = by[k].tp - by[k].tu; order.push(by[k]); });
    order.sort(function (a, b) { return Math.abs(b.net) - Math.abs(a.net) || (b.tp + b.tu) - (a.tp + a.tu) || a.nama.localeCompare(b.nama); });
    return {people: order, tp: sum(order, function (p) { return p.tp; }), tu: sum(order, function (p) { return p.tu; })};
  }
  function loanNote(l) { var x = S.tx[l.id] || {}; return [x.Barang, x.Catatan, x.Toko, x.Tag].filter(Boolean)[0] || ''; }
  function netText(p) { return p.net > 0 ? t('debt.net.in', C.fmtRp(p.net)) : (p.net < 0 ? t('debt.net.out', C.fmtRp(-p.net)) : t('debt.net.even')); }
  function loanLine(l, today) {
    var od = l.jatuhTempo && l.jatuhTempo < today, note = loanNote(l);
    return '<div class="row loanrow tap" data-act="tx-open" data-id="' + esc(l.id) + '"><div class="grow"><div class="t">' + esc(C.fmtRp(l.sisa)) + (l.sisa !== l.jumlah ? ' <span class="muted sm">' + esc(t('loan.of', C.fmtNum(l.jumlah))) + '</span>' : '') + '</div>' +
      '<div class="s">' + esc(C.fmtTgl(l.tanggal)) + (note ? ' · ' + esc(note) : '') + ' · ' + (od ? '<span class="tag bad">' + t('loan.overdue') + '</span> ' : '') + esc(t('loan.due', C.fmtTgl(l.jatuhTempo))) + (S.M.users.length > 1 ? ' · ' + esc(l.pemilik) : '') + '</div></div>' +
      '<button class="btn sm" data-act="loan-pay" data-id="' + esc(l.id) + '">' + t('loan.act.' + l.kind) + '</button></div>';
  }
  function vDebts() {
    var f = fObj(S.owner), today = C.todayLocal(), D = debtPeople(f), F2 = S.debtF, h = '';
    h += '<div class="stick"><div class="frow">' + ownerChips(S.owner, 'owner') + '</div><div class="chips" style="margin-top:8px">' + [['Semua', 'debt.f.all'], ['Piutang', 'pg.receivable'], ['Utang', 'pg.payable']].map(function (x) {
      return '<button class="chip sm' + (F2 === x[0] ? ' on' : '') + '" data-act="debt-f" data-v="' + x[0] + '">' + t(x[1]) + '</button>'; }).join('') + '</div></div>';
    h += '<div class="card hero"><div class="lbl">' + t('debt.net') + '</div><div class="big ' + (D.tp - D.tu < 0 ? 'out' : (D.tp - D.tu > 0 ? 'in' : '')) + '">' + esc(C.fmtRp(D.tp - D.tu)) + '</div>' +
      '<div class="sub2">' + esc(t('debt.sum', C.fmtRp(D.tp), C.fmtRp(D.tu))) + '</div></div>';
    h += '<div class="btnrow"><button class="btn" data-act="loan-new" data-v="Piutang">' + ICON.plus + t('loan.new.Piutang').replace('+ ', '') + '</button><button class="btn" data-act="loan-new" data-v="Utang">' + ICON.plus + t('loan.new.Utang').replace('+ ', '') + '</button>' +
      '<button class="btn" data-act="debt-share" data-p="" aria-label="' + t('jpg.share') + '">' + ICON.share + t('debt.share') + '</button></div>';
    if (X.viz) h += X.viz.debt(f);
    var ppl = D.people.filter(function (p) { return F2 === 'Piutang' ? p.piutang.length : (F2 === 'Utang' ? p.utang.length : true); });
    if (!ppl.length) return h + '<div class="card"><div class="empty">' + t('debt.empty') + '</div></div>';
    h += ppl.map(function (p) {
      var inS = F2 !== 'Utang' && p.piutang.length, outS = F2 !== 'Piutang' && p.utang.length;
      return '<div class="card grp debt"><div class="ah"><span class="gi">' + ICON.people + '</span><span>' + esc(p.nama) + '<small class="muted sm dnet">' + esc(netText(p)) + '</small></span>' +
        '<button class="hb sm" data-act="debt-share" data-p="' + esc(p.nama) + '" aria-label="' + t('jpg.share') + '">' + ICON.share + '</button></div>' +
        (inS ? '<div class="sec in">' + t('debt.theyowe') + ' · ' + esc(C.fmtRp(p.tp)) + '</div>' + p.piutang.map(function (l) { return loanLine(l, today); }).join('') : '') +
        (outS ? '<div class="sec out">' + t('debt.iowe') + ' · ' + esc(C.fmtRp(p.tu)) + '</div>' + p.utang.map(function (l) { return loanLine(l, today); }).join('') : '') + '</div>';
    }).join('');
    return h;
  }
  function loanDoc(l) {
    var note = loanNote(l);
    return {k: 'row', ind: 1, l: C.fmtTgl(l.tanggal) + (note ? ' · ' + note : ''), s: t('loan.due', C.fmtTgl(l.jatuhTempo)) + (l.sisa !== l.jumlah ? ' · ' + t('loan.of', C.fmtNum(l.jumlah)) : ''), r: C.fmtRp(l.sisa)};
  }
  function docDebt(only) {
    var f = fObj(S.owner), D = debtPeople(f), ppl = only ? D.people.filter(function (p) { return p.nama === only; }) : D.people, b = [], today = C.todayLocal();
    ppl.forEach(function (p, i) {
      if (i) b.push({k: 'gap'});
      b.push({k: 'head', l: p.nama, r: netText(p)});
      if (p.piutang.length) { b.push({k: 'row', l: t('debt.theyowe'), r: C.fmtRp(p.tp), b: true, c: 'in'}); p.piutang.forEach(function (l) { b.push(loanDoc(l)); }); }
      if (p.utang.length) { b.push({k: 'row', l: t('debt.iowe'), r: C.fmtRp(p.tu), b: true, c: 'out'}); p.utang.forEach(function (l) { b.push(loanDoc(l)); }); }
      if (p.piutang.length && p.utang.length) b.push({k: 'total', l: t('debt.net'), r: C.fmtRp(p.net), c: p.net < 0 ? 'out' : 'in'});
    });
    if (!only) { b.push({k: 'gap'}); b.push({k: 'total', l: t('debt.net'), r: C.fmtRp(D.tp - D.tu), c: D.tp - D.tu < 0 ? 'out' : 'in'}); }
    return {title: only ? t('debt.doc.person', only) : t('debt.doc.all'), sub: C.fmtTgl(today) + (S.owner !== 'Semua' ? ' · ' + S.owner : ''), blocks: b, foot: 'Do it · ' + C.fmtTgl(today)};
  }

  // ---------------------------------------------------------------- halaman Aset
  function vAssets(focus) {
    var f = fObj(S.owner), A = assetGroups(f), k2d = kodeToDompet();
    ownerChips(S.owner, 'owner'); var h = '';
    h += '<div class="card hero"><div class="lbl">' + t('as.total') + '</div><div class="big">' + esc(C.fmtRp(A.bs.aset.total)) + '</div></div>';
    h += '<div class="btnrow"><button class="btn" data-act="w-open">' + ICON.plus + t('as.add') + '</button></div>';
    if (X.viz) h += X.viz.dist(A.groups.map(function (g) { return {nama: dn(g.nama), total: g.rows.reduce(function (s, r) { return s + Math.max(0, r.jumlah); }, 0), ico: X.genericIco ? X.genericIco(g.nama, g.nama) : '', items: g.rows.map(function (r) { var d = k2d[r.kode]; return {nama: d ? d.Nama : dn(r.nama), v: r.jumlah}; })}; }), A.bs.aset.total, t('as.total'));
    h += '<div class="ggrid">' + A.groups.map(function (g) {
      var pg = isPiutangGroup(g), rows = g.rows.slice().sort(function (a, b) { return b.jumlah - a.jumlah; });
      return '<div class="card agrp' + (focus === g.nama ? ' hl' : '') + '" id="g-' + esc(g.nama.replace(/\W/g, '')) + '"><div class="ah"><span>' + esc(dn(g.nama)) + '</span><b>' + esc(C.fmtRp(g.total)) + '</b></div>' + rows.map(function (r) {
        var d = k2d[r.kode];
        return '<div class="row tap" ' + (pg ? 'data-act="page" data-v="receivable"' : 'data-act="asset" data-v="' + esc(r.kode) + '"') + '>' + (X.hooks.assetIco && d && !pg ? X.hooks.assetIco(d, g.nama) : '') + '<div class="grow"><div class="t">' + esc(d ? d.Nama : dn(r.nama)) + '</div><div class="s">' + esc((d ? d.Pemilik + ' · ' : '') + r.kode) + '</div></div><div class="a ' + (r.jumlah < 0 ? 'out' : '') + '">' + esc(C.fmtRp(r.jumlah)) + '</div>' + ICON.chev + '</div>';
      }).join('') + '</div>';
    }).join('') + '</div>';
    return h + '<div class="note2">' + t('as.note') + '</div>';
  }
  function sparkline(pts) {
    var W = 320, H = 90, vs = pts.map(function (p) { return p.saldo; }), mn = Math.min.apply(null, vs.concat([0])), mx = Math.max.apply(null, vs);
    if (mx === mn) mx = mn + 1;
    var xy = pts.map(function (p, i) { return [(i / (pts.length - 1)) * (W - 8) + 4, H - 6 - (p.saldo - mn) / (mx - mn) * (H - 14)]; });
    var d = xy.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var area = d + ' L' + xy[xy.length - 1][0].toFixed(1) + ' ' + (H - 2) + ' L' + xy[0][0].toFixed(1) + ' ' + (H - 2) + ' Z';
    var lab = function (p) { return C.namaBulan(+p.bulan.substr(5, 2), true) + ' ' + p.bulan.substr(2, 2); };
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none"><path d="' + area + '" class="sa"/><path d="' + d + '" class="sl"/>' +
      xy.map(function (p) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.4" class="sp"/>'; }).join('') + '</svg>' +
      '<div class="sparklbl"><span>' + esc(lab(pts[0])) + '</span><span>' + esc(shortRp(mx)) + '</span><span>' + esc(lab(pts[pts.length - 1])) + '</span></div>';
  }
  function vAsset(kode) {
    var d = kodeToDompet()[kode], a = S.M.akun[kode], nama = d ? d.Nama : (a ? a.Nama : kode), r = rangeOf(S.per), lines = getLines();
    var flow = C.accountFlow(lines, kode, r.start, r.end, null), now = C.accountFlow(lines, kode, '0000-01-01', r.today, null);
    var h = '<div class="card hero"><div class="lbl">' + esc(a ? dn(a.Kelompok) : '') + (d ? ' · ' + esc(t('as.owner', d.Pemilik)) : '') + (d && !d.Aktif ? ' · ' + t('as.inactive') : '') + '</div>' +
      '<div class="big">' + esc(C.fmtRp(now.saldoAkhir)) + '</div>' + (X.hooks.assetHero ? X.hooks.assetHero(kode, d, now.saldoAkhir) : '') + '</div>';
    h += X.hooks.assetTop ? X.hooks.assetTop(kode, d, now.saldoAkhir) : '';
    h += '<div class="card"><div class="lbl3">' + t('as.trend') + '</div>' + X.sparkline(C.monthlyBalance(lines, kode, r.today, X.stockOn && X.stockOn() ? 36 : 12)) + '</div>';
    h += '<div class="stick"><div class="ddrow">' + perChips(S.per, 'per') + '</div></div>';
    h += '<div class="tiles"><div class="tile"><div class="lbl">' + t('as.flow.in') + '</div><div class="val in">' + esc(C.fmtRp(flow.masuk)) + '</div></div>' +
      '<div class="tile"><div class="lbl">' + t('as.flow.out') + '</div><div class="val out">' + esc(C.fmtRp(flow.keluar)) + '</div></div></div>';
    var rows = Object.keys(S.tx).map(function (k) { return S.tx[k]; }).filter(function (x) {
      var dd = x.Waktu.substr(0, 10);
      return x.Status === 'Aktif' && (x.Dompet === nama || x.DompetTujuan === nama) && dd >= r.start && dd <= r.end;
    }).sort(byTimeDesc);
    h += '<h2>' + t('flow.list') + '</h2>' + txListGrouped(rows, S.limit, 'more');
    return h;
  }

  // ---------------------------------------------------------------- Pihak, Kategori, Pengaturan
  function vParties() {
    var q = (S.pq || '').toLowerCase(), list = S.M.pihak.filter(function (p) { return !q || p.Nama.toLowerCase().indexOf(q) >= 0; })
      .sort(function (a, b) { return a.Nama.localeCompare(b.Nama); });
    return '<div class="btnrow"><button class="btn" data-act="pihak-add">' + ICON.plus + t('p.add') + '</button></div>' +
      '<input class="search" id="pq2" type="search" placeholder="' + esc(t('search')) + '" value="' + esc(S.pq || '') + '" autocomplete="off">' +
      '<div class="muted sm" style="margin:0 4px 8px">' + t('p.count', S.M.pihak.length) + '</div>' +
      '<div class="card" id="plist2">' + (list.length ? list.map(function (p) { return '<div class="row tap" data-act="pihak-edit" data-v="' + esc(p.Nama) + '"><div class="ico">' + ICON.people + '</div><div class="grow"><div class="t">' + esc(p.Nama) + '</div></div><span class="muted">' + ICON.edit + '</span></div>'; }).join('') : '<div class="empty">' + t('nothing') + '</div>') + '</div>';
  }
  function vCategories() {
    var j = S.katJenis, groups = {}, order = [];
    S.M.kategori.filter(function (k) { return k.Jenis === j; }).forEach(function (k) { if (!groups[k.Kategori]) { groups[k.Kategori] = []; order.push(k.Kategori); } groups[k.Kategori].push(k); });
    var h = '<div class="seg">' + [['Expense', 'pg.expense'], ['Income', 'pg.income']].map(function (s) { return '<button class="' + (j === s[0] ? 'on' : '') + '" data-act="kat-jenis" data-v="' + s[0] + '">' + t(s[1]) + '</button>'; }).join('') + '</div>';
    h += '<div class="btnrow"><button class="btn" data-act="k-open">' + ICON.plus + t('k.add') + '</button></div>';
    h += order.map(function (g) {
      return '<div class="card grp"><div class="ah"><span class="gi">' + catIcon(g) + '</span><span>' + esc(dn(g)) + '</span><b class="muted">' + groups[g].length + '</b>' + (X.A['ub-grp'] ? '<button class="hb sm" data-act="ub-grp" data-g="' + esc(g) + '" title="' + esc(t('ub.ren')) + '" aria-label="' + esc(t('ub.ren')) + '">' + ICON.edit + '</button>' : '') + '</div><div class="chips">' +
        groups[g].map(function (k) { return X.A['ik-open'] ? '<button class="chip sm ci" data-act="ik-open" data-k="' + esc(k.KodeAkun) + '" title="' + esc(t('ik.t', dn(k.SubKategori))) + '">' + catIcon(g, k.SubKategori, k.KodeAkun) + esc(dn(k.SubKategori)) + '</button>' : '<span class="chip sm static">' + esc(dn(k.SubKategori)) + '</span>'; }).join('') + '</div></div>';
    }).join('');
    return h;
  }
  var THEMES = [['rose', ['#fbf3f4', '#c0275f', '#fbe1e8']], ['navy', ['#f5efeb', '#2f4156', '#c8d9e6']], ['mono', ['#f4f4f4', '#111111', '#ebebeb']]];
  function vSettings() {
    var h = (X.hooks.settingsTop ? X.hooks.settingsTop() : '') + '<h2>' + t('set.look') + '</h2><div class="card"><div class="lbl3">' + t('set.mode') + '</div><div class="seg">' +
      ['auto', 'light', 'dark'].map(function (m) { return '<button class="' + (S.pref.mode === m ? 'on' : '') + '" data-act="pref-mode" data-v="' + m + '">' + t('set.mode.' + m) + '</button>'; }).join('') + '</div>' +
      '<div class="lbl3">' + t('set.palette') + '</div><div class="themes">' + THEMES.map(function (x) {
        return '<button class="theme' + (S.pref.theme === x[0] ? ' on' : '') + '" data-act="pref-theme" data-v="' + x[0] + '"><div class="sw">' + x[1].map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</div><b>' + t('set.pal.' + x[0]) + '</b></button>';
      }).join('') + '</div><div class="lbl3">' + t('set.lang') + '</div><div class="seg">' +
      [['id', 'Bahasa Indonesia'], ['en', 'English']].map(function (x) { return '<button class="' + (S.pref.lang === x[0] ? 'on' : '') + '" data-act="pref-lang" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>';
    var failed = opsFailed();
    h += '<h2>' + t('set.sync') + '</h2><div class="card"><div class="row"><div class="grow"><div class="t">' + t('set.queue') + '</div><div class="s" id="synclbl"></div><div class="s">' +
      (S.queue.length ? t('set.queue.n', S.queue.length) + (failed.length ? t('set.queue.f', failed.length) : '') : t('set.queue.empty')) + '</div></div><button class="btn sm" data-act="sync">' + t('set.sync.now') + '</button></div>';
    h += S.queue.map(function (o) {
      var lbl = o.action === 'tambah' ? t('q.add') : o.action === 'batal' ? t('q.batal') : o.action === 'koreksi' ? t('q.koreksi') : o.action === 'strukUnggah' ? t('q.struk') : t('q.pihak', o.body.nama || '');
      return '<div class="row"><div class="grow"><div class="t">' + esc(lbl) + '</div><div class="s' + (o.error ? ' out' : '') + '">' + esc(o.error || t('q.wait')) + '</div></div>' +
        (o.error ? '<button class="btn sm danger" data-act="q-drop" data-id="' + esc(o.id) + '">' + t('d.drop') + '</button>' : '') + '</div>';
    }).join('');
    h += '</div><h2>' + t('set.device') + '</h2><div class="card"><dl class="kv"><dt>' + t('set.user') + '</dt><dd>' + esc(S.cfg.user) + '</dd><dt>' + t('set.server') + '</dt><dd>…' + esc(S.cfg.url.slice(-18)) + '</dd><dt>' + t('set.version') + '</dt><dd>' + VERSION + '</dd></dl>' +
      '<button class="btn" style="margin-top:10px" data-act="hard-reload">' + t('set.hard') + '</button><div class="muted sm" style="margin:6px 2px 10px">' + t('set.hard.s') + '</div>' + '<div class="btnrow2"><button class="btn" data-act="full-sync">' + t('set.reload') + '</button><button class="btn danger" data-act="logout">' + t('set.logout') + '</button></div></div>';
    return h + '<div class="note2">' + t('set.note') + '</div>';
  }

  // ---------------------------------------------------------------- Laporan
  var REP_KINDS = ['ann', 'is', 'bs', 'cf', 'bva', 'event', 'tb', 'jr', 'tren', 'rasio', 'ins'];
  var DIMS = ['pemilik', 'pencatat'];
  function repCtx() {
    var R = S.rep, today = C.todayLocal(), per = periodOf(R.period);
    return {R: R, today: today, per: per, end: per.end > today ? today : per.end, f: fObj(R.who, R.dim), lines: getLines()};
  }
  /** Pisahkan kelompok "Di Luar Operasional" (untung/rugi belum terealisasi) dari laba operasional. */
  function splitIS(is) {
    var nonop = [];
    function pull(part, sign) {
      var keep = part.groups.filter(function (g) { if (g.nama === NONOP_G) { g.rows.forEach(function (r) { nonop.push({kode: r.kode, nama: r.nama, jumlah: sign * r.jumlah}); }); return false; } return true; });
      return {groups: keep, total: sum(keep, function (g) { return g.total; })};
    }
    var p = pull(is.pendapatan, 1), b = pull(is.beban, -1), nt = sum(nonop, function (r) { return r.jumlah; });
    return {pendapatan: p, beban: b, nonop: nonop, nonopTotal: nt, labaOp: p.total - b.total, laba: is.laba};
  }
  function vLaporan() {
    var cx = repCtx(), R = cx.R, today = cx.today, per = cx.per, end = cx.end, f = cx.f, lines = cx.lines, h = '', reg = X.repKinds[R.kind];
    h += '<div class="ddrow">' + dd(t('r.' + R.kind), 'rep', 'rep-kind', R.kind) + ((!reg || reg.period !== false) ? perChips(R.period, 'rep-period') : '') + ownerChips(R.who, 'rep-who') +
      (reg && reg.dim === false ? '' : dd(t(R.dim === 'pencatat' ? 'r.dim.rec' : 'r.dim.owner'), 'dim', 'rep-dim', R.dim)) +
      '<button class="hb" data-act="rep-export" aria-label="' + t('v364.export') + '" title="' + t('v364.export') + '">' + ICON.share + '</button></div>';
    var labelRange = reg ? (reg.label ? reg.label(cx) : '') : (R.kind === 'is' || R.kind === 'jr' ? (R.period === 'semua' ? t('per.alltime') : C.fmtTgl(per.start) + ' – ' + C.fmtTgl(end)) : t('per.asof', C.fmtTgl(end)));
    h += '<div class="muted sm" style="margin:6px 2px 10px">' + esc(labelRange) + (labelRange ? ' · ' : '') + esc(f ? R.who : t('r.combined')) + '</div>';
    function rows2(groups) {
      return groups.map(function (g) {
        return '<tr class="sub"><td colspan="2">' + esc(dn(g.nama)) + '</td><td>' + esc(C.fmtNum(g.total)) + '</td></tr>' +
          g.rows.map(function (r) { return '<tr><td class="kode">' + esc(r.kode) + '</td><td style="text-align:left">' + esc(dn(r.nama)) + '</td><td>' + esc(C.fmtNum(r.jumlah)) + '</td></tr>'; }).join('');
      }).join('');
    }
    if (reg) {
      h += reg.render(cx);
    } else if (R.kind === 'is') {
      var is = splitIS(C.incomeStatement(lines, S.M, per.start, end, f));
      h += '<div class="card"><table class="rep"><tr class="tot"><td colspan="2">' + t('r.income') + '</td><td>' + esc(C.fmtNum(is.pendapatan.total)) + '</td></tr>' + rows2(is.pendapatan.groups) +
        '<tr class="tot"><td colspan="2">' + t('r.expense') + '</td><td>' + esc(C.fmtNum(is.beban.total)) + '</td></tr>' + rows2(is.beban.groups) +
        (is.nonop.length ? '<tr class="tot"><td colspan="2">' + t('r.opnet') + '</td><td class="' + (is.labaOp < 0 ? 'out' : 'in') + '">' + esc(C.fmtNum(is.labaOp)) + '</td></tr>' +
          '<tr class="sub"><td colspan="2">' + t('r.nonop') + '</td><td>' + esc(C.fmtNum(is.nonopTotal)) + '</td></tr>' +
          is.nonop.map(function (r) { return '<tr><td class="kode">' + esc(r.kode) + '</td><td style="text-align:left">' + esc(dn(r.nama)) + '</td><td class="' + (r.jumlah < 0 ? 'out' : '') + '">' + esc(C.fmtNum(r.jumlah)) + '</td></tr>'; }).join('') : '') +
        '<tr class="tot"><td colspan="2">' + t('r.net') + '</td><td class="' + (is.laba < 0 ? 'out' : 'in') + '">' + esc(C.fmtNum(is.laba)) + '</td></tr></table></div>';
      if (!is.pendapatan.groups.length && !is.beban.groups.length) h += '<div class="empty">' + t('r.noact') + '</div>';
    } else if (R.kind === 'bs') {
      var bs = C.balanceSheet(lines, S.M, end, f);
      h += '<div class="card"><table class="rep"><tr class="tot"><td colspan="2">' + t('r.assets') + '</td><td>' + esc(C.fmtNum(bs.aset.total)) + '</td></tr>' + rows2(bs.aset.groups) +
        '<tr class="tot"><td colspan="2">' + t('r.liab') + '</td><td>' + esc(C.fmtNum(bs.liabilitas.total)) + '</td></tr>' + rows2(bs.liabilitas.groups) +
        '<tr class="tot"><td colspan="2">' + t('r.equity') + '</td><td>' + esc(C.fmtNum(bs.ekuitas.total)) + '</td></tr>' +
        '<tr><td class="kode"></td><td style="text-align:left">' + t('r.opening') + '</td><td>' + esc(C.fmtNum(bs.ekuitas.saldoAwal)) + '</td></tr>' +
        '<tr><td class="kode"></td><td style="text-align:left">' + t('r.retained') + '</td><td>' + esc(C.fmtNum(bs.ekuitas.laba)) + '</td></tr>' +
        bs.ekuitas.lain.map(function (x) { return '<tr><td class="kode"></td><td style="text-align:left">' + esc(dn(x.nama)) + '</td><td>' + esc(C.fmtNum(x.jumlah)) + '</td></tr>'; }).join('') +
        (bs.ekuitas.transferAntarPemilik ? '<tr><td class="kode"></td><td style="text-align:left">' + t('r.inter') + '</td><td>' + esc(C.fmtNum(bs.ekuitas.transferAntarPemilik)) + '</td></tr>' : '') +
        '<tr class="tot"><td colspan="2">' + t('r.le') + '</td><td>' + esc(C.fmtNum(bs.liabilitas.total + bs.ekuitas.total)) + '</td></tr></table></div>' +
        (bs.seimbang ? '' : '<div class="err" style="margin-top:10px">' + t('r.unbal') + '</div>');
    } else if (R.kind === 'tb') {
      var tb = C.trialBalance(lines, S.M, end, f);
      h += '<div class="card"><table class="rep"><tr><th>' + t('r.acct') + '</th><th>' + t('r.dr') + '</th><th>' + t('r.cr') + '</th></tr>' + tb.rows.map(function (r) {
        return '<tr><td><span class="muted sm">' + esc(r.kode) + '</span> ' + esc(dn(r.nama)) + '</td><td>' + (r.debit ? esc(C.fmtNum(r.debit)) : '') + '</td><td>' + (r.kredit ? esc(C.fmtNum(r.kredit)) : '') + '</td></tr>';
      }).join('') + '<tr class="tot"><td>' + t('r.total') + '</td><td>' + esc(C.fmtNum(tb.totalDebit)) + '</td><td>' + esc(C.fmtNum(tb.totalKredit)) + '</td></tr></table></div>' +
        (tb.totalDebit === tb.totalKredit ? '' : '<div class="note">' + t('r.tbnote', R.dim === 'pencatat' ? t('r.dim.rec') : t('r.dim.owner')) + '</div>');
    } else {
      var by = {}, order = [];
      lines.forEach(function (l) { if (l.tanggal < per.start || l.tanggal > end || !C.pass(l, f)) return; if (!by[l.txId]) { by[l.txId] = []; order.push(l.txId); } by[l.txId].push(l); });
      order.sort(function (a, b) { return byTimeDesc(S.tx[a], S.tx[b]); });
      h += '<div class="card">' + (order.length ? order.slice(0, R.limit).map(function (id) {
        var x = S.tx[id], v = txView(x);
        return '<div class="jr"><div class="h">' + esc(C.fmtTgl(x.Waktu.substr(0, 10))) + ' <span>' + esc(v.title) + ' · ' + esc(id) + '</span></div>' + by[id].map(function (l) {
          var nm = dn(S.M.akun[l.kode] ? S.M.akun[l.kode].Nama : l.kode);
          return l.debit ? '<div class="l"><span>' + esc(nm) + '</span><span>' + esc(C.fmtNum(l.debit)) + '</span></div>' : '<div class="l k"><span>' + esc(nm) + '</span><span>' + esc(C.fmtNum(l.kredit)) + '</span></div>';
        }).join('') + '</div>';
      }).join('') + (order.length > R.limit ? '<div class="more-wrap"><button class="btn" data-act="rep-more">' + t('more', order.length - R.limit) + '</button></div>' : '') : '<div class="empty">' + t('r.nojr') + '</div>') + '</div>';
    }
    return h;
  }

  // ---------------------------------------------------------------- dokumen JPG untuk laporan
  function groupBlocks(groups) {
    var b = [];
    groups.forEach(function (g) { b.push({k: 'row', l: dn(g.nama), r: C.fmtNum(g.total), b: true}); g.rows.forEach(function (r) { b.push({k: 'row', ind: 1, l: dn(r.nama), r: C.fmtNum(r.jumlah)}); }); });
    return b;
  }
  function repDoc() {
    var cx = repCtx(), R = cx.R, reg = X.repKinds[R.kind], per = cx.per, end = cx.end, f = cx.f, lines = cx.lines, b = [], today = cx.today;
    if (reg) return reg.doc(cx);
    var sub = (R.kind === 'is' || R.kind === 'jr' ? (R.period === 'semua' ? t('per.alltime') : C.fmtTgl(per.start) + ' – ' + C.fmtTgl(end)) : t('per.asof', C.fmtTgl(end))) + ' · ' + (f ? R.who : t('r.combined'));
    if (R.kind === 'is') {
      var is = splitIS(C.incomeStatement(lines, S.M, per.start, end, f));
      b.push({k: 'head', l: t('r.income'), r: C.fmtNum(is.pendapatan.total)}); b = b.concat(groupBlocks(is.pendapatan.groups));
      b.push({k: 'head', l: t('r.expense'), r: C.fmtNum(is.beban.total)}); b = b.concat(groupBlocks(is.beban.groups));
      if (is.nonop.length) { b.push({k: 'total', l: t('r.opnet'), r: C.fmtNum(is.labaOp)}, {k: 'head', l: t('r.nonop'), r: C.fmtNum(is.nonopTotal)}); is.nonop.forEach(function (r) { b.push({k: 'row', ind: 1, l: dn(r.nama), r: C.fmtNum(r.jumlah), c: r.jumlah < 0 ? 'out' : 'in'}); }); }
      b.push({k: 'total', l: t('r.net'), r: C.fmtNum(is.laba), c: is.laba < 0 ? 'out' : 'in'});
    } else if (R.kind === 'bs') {
      var bs = C.balanceSheet(lines, S.M, end, f);
      b.push({k: 'head', l: t('r.assets'), r: C.fmtNum(bs.aset.total)}); b = b.concat(groupBlocks(bs.aset.groups));
      b.push({k: 'head', l: t('r.liab'), r: C.fmtNum(bs.liabilitas.total)}); b = b.concat(groupBlocks(bs.liabilitas.groups));
      b.push({k: 'head', l: t('r.equity'), r: C.fmtNum(bs.ekuitas.total)});
      b.push({k: 'row', ind: 1, l: t('r.opening'), r: C.fmtNum(bs.ekuitas.saldoAwal)}, {k: 'row', ind: 1, l: t('r.retained'), r: C.fmtNum(bs.ekuitas.laba)});
      bs.ekuitas.lain.forEach(function (x) { b.push({k: 'row', ind: 1, l: dn(x.nama), r: C.fmtNum(x.jumlah)}); });
      if (bs.ekuitas.transferAntarPemilik) b.push({k: 'row', ind: 1, l: t('r.inter'), r: C.fmtNum(bs.ekuitas.transferAntarPemilik)});
      b.push({k: 'total', l: t('r.le'), r: C.fmtNum(bs.liabilitas.total + bs.ekuitas.total)});
    } else if (R.kind === 'tb') {
      var tb = C.trialBalance(lines, S.M, end, f);
      tb.rows.forEach(function (r) { b.push({k: 'row', l: r.kode + ' ' + dn(r.nama), r: (r.debit ? t('r.dr') + ' ' + C.fmtNum(r.debit) : t('r.cr') + ' ' + C.fmtNum(r.kredit))}); });
      b.push({k: 'total', l: t('r.total'), r: C.fmtNum(tb.totalDebit)});
    } else {
      var rows = Object.keys(S.tx).map(function (k) { return S.tx[k]; }).filter(function (x) { var d = x.Waktu.substr(0, 10); return x.Status === 'Aktif' && d >= per.start && d <= end && (!f || x.PemilikDompet === (f.pemilik || x.PemilikDompet)); }).sort(byTimeDesc).slice(0, 40);
      rows.forEach(function (x) { var v = txView(x); b.push({k: 'row', l: v.title, s: C.fmtTgl(x.Waktu.substr(0, 10)) + ' · ' + x.Dompet, r: signAmt(v, x.Jumlah), c: v.sign > 0 ? 'in' : (v.sign < 0 ? 'out' : '')}); });
    }
    return {title: t('r.' + R.kind), sub: sub, blocks: b, foot: 'Do it · ' + C.fmtTgl(today)};
  }

  // ---------------------------------------------------------------- notifikasi (lonceng)
  function actWhat(a) {
    var x = S.tx[a.TransaksiID];
    if (x) { var v = txView(x); return v.title + ' · ' + C.fmtRp(x.Jumlah) + (x.Dompet ? ' · ' + x.Dompet : ''); }
    return a.Ringkas;
  }
  function actWho(a) { return a.Oleh === (S.cfg && S.cfg.user) ? t('n.you') : a.Oleh; }
  function vNotif() {
    var tabs = '<div class="seg" style="margin-bottom:12px">' + [['notif', 'n.tab.notif'], ['warn', 'n.tab.warn']].map(function (x) {
      var n = x[0] === 'warn' && X.analisis ? X.analisis.newWarnCount() : 0;
      return '<button class="' + (S.ntab === x[0] ? 'on' : '') + '" data-act="n-tab" data-v="' + x[0] + '">' + t(x[1]) + (n ? ' <b class="bdg2">' + n + '</b>' : '') + '</button>'; }).join('') + '</div>';
    if (S.ntab === 'warn' && X.analisis) { var wh = X.analisis.warnView(); X.analisis.markWarnSeen(); return tabs + wh; }
    return tabs + vNotifList();
  }
  function vNotifList() {
    markActSeen();
    var cut = actCutoff(), list = S.act.filter(function (a) { return a.Waktu >= cut; }).sort(function (a, b) { return a.Waktu < b.Waktu ? 1 : (a.Waktu > b.Waktu ? -1 : 0); });
    var from = S.notifFrom || 0, me = S.cfg.user, today = C.todayLocal();
    if (!list.length) return '<div class="card"><div class="empty">' + t('n.empty') + '</div></div>';
    var nu = list.filter(function (a) { return a.Oleh !== me && a.Rev > from; }).length;
    return '<div class="muted sm" style="margin:0 4px 8px">' + t('n.note') + (nu ? ' · ' + t('n.unread', nu) : '') + '</div><div class="card">' + list.map(function (a) {
      var isNew = a.Oleh !== me && a.Rev > from, ico = a.Aksi === 'tambah' ? ICON.plus : (a.Aksi === 'koreksi' ? ICON.edit : ICON.x);
      return '<div class="row tap notif' + (isNew ? ' new' : '') + '" data-act="tx-open" data-id="' + esc(a.TransaksiID) + '"><div class="ico">' + ico + '</div><div class="grow"><div class="t">' + esc(actWho(a)) + ' ' + esc(t('n.' + a.Aksi)) + '</div>' +
        '<div class="s wrapx">' + esc(actWhat(a)) + '</div><div class="s">' + esc(C.fmtHari(a.Waktu.substr(0, 10), today) + ' ' + a.Waktu.substr(11, 5)) + '</div></div>' + (isNew ? '<i class="dot"></i>' : '') + '</div>';
    }).join('') + '</div>';
  }

  // ---------------------------------------------------------------- navigasi & render
  var TABS = ['beranda', 'transaksi', 'laporan'];
  var PAGES = {flow: 'pg.flow', asset: '', debts: 'pg.debts', notif: 'pg.notif',
    parties: 'pg.parties', categories: 'pg.categories', settings: 'pg.settings'};
  function pageTitle(p) {
    if (X.pages[p.name]) return X.pages[p.name].title(p);
    if (p.name === 'asset') { var d = kodeToDompet()[p.arg], a = S.M.akun[p.arg]; return d ? d.Nama : (a ? dn(a.Nama) : p.arg); }
    return t(PAGES[p.name]);
  }
  function pushSentinel() { try { history.pushState({kk: 'app'}, ''); } catch (e) {} }
  function openPage(name, arg, extra) {
    if (S.page && S.page.name === name && S.page.arg === arg && !extra) return;
    if (S.page) S.stack.push(S.page);
    S.page = {name: name, arg: arg, extra: extra}; S.anim = 'fwd'; S.limit = 80;
    try { history.pushState({kk: S.stack.length + 1}, ''); } catch (e) {}
    closeOverlays(); render(); window.scrollTo(0, 0);
    if (extra) setTimeout(function () { var el = document.getElementById('g-' + extra.replace(/\W/g, '')); if (el) el.scrollIntoView({block: 'start'}); }, 30);
  }
  function goBack(fromPop) {
    if (!S.page) return;
    S.page = S.stack.pop() || null; S.anim = 'back'; S.limit = 80;
    if (!fromPop) { try { history.back(); S._skipPop = true; } catch (e) {} }
    render(); window.scrollTo(0, 0);
  }
  function setTab(tab) {
    var from = TABS.indexOf(S.page ? 'x' : S.tab), to = TABS.indexOf(tab);
    S.anim = S.page ? 'fade' : (to > from ? 'fwd' : (to < from ? 'back' : ''));
    if (S.page) { var n = S.stack.length + 1; S.stack = []; S.page = null; try { S._skipPop = true; history.go(-n); } catch (e) {} }
    S.tab = tab; S.limit = 80; render(); window.scrollTo(0, 0);
  }
  function exitDialog() {
    $('#overlay2').innerHTML = '<div class="scrim" data-act="pick-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + t('exit.title') + '</div></div><div class="sheet-b"><p class="muted" style="margin:4px 0 0">' + t('exit.q') + '</p></div>' +
      '<div class="sheet-f btnrow2"><button class="btn" data-act="pick-close">' + t('exit.no') + '</button><button class="btn danger" data-act="exit-yes">' + t('exit.yes') + '</button></div></div>';
  }
  window.addEventListener('popstate', function () {
    if (S._skipPop) { S._skipPop = false; return; }
    if (S._leaving || !S.cfg) return;
    if ($('#overlay2').innerHTML) { closePicker(); pushSentinel(); return; }
    if ($('#overlay').innerHTML) { closeOverlays(); pushSentinel(); return; }
    if (S.page) { goBack(true); return; }
    if (S.tab !== 'beranda') { S.anim = 'back'; S.tab = 'beranda'; S.limit = 80; render(); window.scrollTo(0, 0); pushSentinel(); return; }
    pushSentinel(); exitDialog();
  });
  function closeOverlays() { $('#overlay').innerHTML = ''; $('#overlay2').innerHTML = ''; CAL = null; TP = null; F = null; FX = null; D = null; P = null; W = null; K = null; PR = null; }

  // geser kiri/kanan untuk pindah menu bawah (tidak aktif di atas barisan yang bisa digulir ke samping)
  function hScrollable(el) {
    while (el && el !== document.body && el.nodeType === 1) {
      var cs = getComputedStyle(el);
      if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 2) return true;
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') return true;
      el = el.parentNode;
    }
    return false;
  }
  var SW = null;
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) { SW = null; return; }
    var p0 = e.touches[0]; SW = {x: p0.clientX, y: p0.clientY, el: e.target, t: Date.now()};
  }, {passive: true});
  document.addEventListener('touchend', function (e) {
    var sw = SW; SW = null;
    if (!sw || !S.cfg || S.page || $('#overlay').innerHTML || $('#overlay2').innerHTML) return;
    var p1 = e.changedTouches[0], dx = p1.clientX - sw.x, dy = p1.clientY - sw.y;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8 || Date.now() - sw.t > 800) return;
    if (sw.x < 24 || sw.x > window.innerWidth - 24 || hScrollable(sw.el)) return;
    var i = TABS.indexOf(S.tab), n = dx < 0 ? i + 1 : i - 1;
    if (n >= 0 && n < TABS.length) setTab(TABS[n]);
  }, {passive: true});

  function render() {
    if (!S.cfg) { renderSetup(); return; }
    var y = window.scrollY, anim = S.anim; S.anim = '';
    var view, title = APP_NAME, p = S.page, pg = p && X.pages[p.name]; S._ownTop = false;
    if (p) {
      title = pageTitle(p);
      view = pg ? pg.render(p) : p.name === 'flow' ? vFlow(S.flowK) : p.name === 'debts' ? vDebts() : p.name === 'notif' ? vNotif() :
        p.name === 'asset' ? vAsset(p.arg) : p.name === 'parties' ? vParties() : p.name === 'categories' ? vCategories() : vSettings();
    } else { view = {beranda: vBeranda, transaksi: vTransaksi, laporan: vLaporan}[S.tab](); if (X.hooks.tabTitle) title = X.hooks.tabTitle(S.tab) || title; }
    var mode = S.pref.mode, mIco = mode === 'light' ? ICON.sun : (mode === 'dark' ? ICON.moon : ICON.auto);
    var cur = p ? 'menu' : S.tab, unread = unreadCount();
    var nav = [['beranda', 'nav.home', ICON.home], ['transaksi', 'nav.tx', ICON.list], ['add'], ['laporan', 'nav.report', ICON.chart], ['menu', 'nav.menu', ICON.grid]];
    document.documentElement.setAttribute('data-view', p ? p.name : S.tab);
    $('#app').innerHTML = '<div class="app"><header class="top">' +
      (p ? '<button class="hb back" data-act="back" aria-label="' + t('back') + '">' + ICON.back + '</button>' : (X.hooks.avatar ? X.hooks.avatar() : '')) +
      '<div class="title"><span class="tt">' + esc(title) + '</span><button id="sync" class="sync" data-act="sync"><i></i></button>' + (S._ownTop ? '<span class="ownd">' + dd(S.owner === 'Semua' ? t('all') : S.owner, 'owner', 'owner', S.owner) + '</span>' : '') + '</div>' +
      (X.hooks.topExtra ? X.hooks.topExtra() : '') + '<button class="hb bell" data-act="page" data-v="notif" aria-label="' + t('pg.notif') + '" title="' + t('pg.notif') + '">' + ICON.bell + (unread ? '<b class="bdg">' + (unread > 9 ? '9+' : unread) + '</b>' : '') + '</button>' +
      '<button class="hb" data-act="theme-cycle" aria-label="' + t('theme.' + mode) + '" title="' + t('theme.' + mode) + '">' + mIco + '</button>' +
      '<button class="hb lang" data-act="lang-toggle" aria-label="' + t('lang.switch') + '">' + (S.pref.lang === 'en' ? 'EN' : 'ID') + '</button>' +
      '<button class="hb gear" data-act="page" data-v="settings" aria-label="' + t('pg.settings') + '" title="' + t('pg.settings') + '">' + ICON.gear + '</button></header>' +
      '<main class="' + (anim ? 'anim-' + anim : '') + '">' + view + '</main></div>' +
      '<nav class="bottom"><div class="in">' + nav.map(function (n) {
        if (n[0] === 'add') return '<button class="addbtn" data-act="add" aria-label="' + t('nav.add') + '"><span>' + ICON.plus + '</span>' + t('nav.add') + '</button>';
        return '<button class="' + (cur === n[0] ? 'on' : '') + '" data-act="' + (n[0] === 'menu' ? 'menu' : 'tab') + '" data-v="' + n[0] + '"><span class="pill">' + n[2] + '</span>' + t(n[1]) + '</button>';
      }).join('') + '</div></nav>' + (X.hooks.sidebar ? X.hooks.sidebar(cur) : '');
    setBadge();
    if (!anim) window.scrollTo(0, y);
  }
  function showMenu() {
    var groups = [['v361.g.fin', [['flow', 'pg.flow', ICON.inArr], ['portfolio', 'pg.portfolio', ICON.pie], ['debts', 'pg.debts', ICON.loan]]],
      ['v361.plan', [['event', 'pg.event', ICON.tag], ['anggaran', 'pg.anggaran', ICON.plan], ['tujuan', 'pg.tujuan', ICON.target]]],
      ['v361.g.data', [['parties', 'pg.parties', ICON.people], ['categories', 'pg.categories', ICON.tag], ['opening', 'pg.opening', ICON.flag], ['settings', 'pg.settings', ICON.gear]]]], n = 0;
    $('#overlay').innerHTML = '<div class="scrim" data-act="ov-close"></div><div class="sheet menu-sheet"><div class="sheet-h"><div class="sh-t">' + t('nav.menu') + '</div><button class="x" data-act="ov-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div>' +
      '<div class="sheet-b">' + groups.map(function (g) {
        return '<div class="mgh">' + t(g[0]) + '</div><div class="mgrid">' + g[1].map(function (it) {
          return '<button class="mi mi' + (n++) + '" data-act="' + (it[0] === 'opening' ? 'saldo-awal' : 'page') + '" data-v="' + it[0] + '"><span>' + it[2] + '</span>' + t(it[1]) + '</button>';
        }).join('') + '</div>';
      }).join('') + '</div></div>';
  }
  function renderSetup(err) {
    $('#app').innerHTML = '<div class="setup"><div class="setup-top"><button class="hb lang" data-act="lang-toggle">' + (S.pref.lang === 'en' ? 'EN' : 'ID') + '</button></div><img src="icon-192.png" alt="" class="logo"><h1>' + esc(APP_NAME) + '</h1><p>' + t('setup.p') + '</p>' +
      (err ? '<div class="err">' + esc(err) + '</div>' : '') +
      '<label class="lbl2">' + t('setup.url') + '</label><input class="input" id="s-url" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="https://script.google.com/macros/s/…/exec">' +
      '<label class="lbl2">' + t('setup.key') + '</label><input class="input" id="s-key" type="password" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="' + esc(t('setup.key.ph')) + '">' +
      '<div style="margin-top:20px"><button class="btn primary" data-act="setup-go" id="s-go">' + t('setup.go') + '</button></div></div>';
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
    closeOverlays();
    F = newForm(init); FX = Object.assign({more: false, err: '', edit: null, replaceOp: null, copy: false}, ex || {});
    FX.kp = {open: !FX.edit, e: F.jumlah > 0 ? String(F.jumlah) : '', eq: false, err: ''};
    if (F.jenis !== 'Saldo awal' && !F.dompet) F.dompet = defaultWallet(F.jenis);
    if (F.dompet && !(S.M.dompet[F.dompet] && S.M.dompet[F.dompet].Aktif) && !FX.edit) F.dompet = defaultWallet(F.jenis);
    if (F.jenis === 'Saldo awal' && !F.waktu) F.waktu = C.todayLocal() + 'T00:00';
    FX.more = !!(F.toko || F.lokasi || F.barang || F.tag || F.catatan || (FX.edit && F.waktu));
    renderForm(true);
  }
  function rowToForm(x) {
    return {waktu: x.Waktu, jenis: x.Jenis, subJenis: x.SubJenis, dompet: x.Dompet, dompetTujuan: x.DompetTujuan, kodeAkun: x.KodeAkun, pihak: x.Pihak, jumlah: Number(x.Jumlah),
      biayaAdmin: x.BiayaAdmin, jatuhTempo: x.JatuhTempo, toko: x.Toko, lokasi: x.Lokasi, barang: x.Barang, tag: x.Tag, catatan: x.Catatan, referensi: x.Referensi, pemilik: x.PemilikDompet};
  }
  function chips(items, sel, act) {
    return '<div class="chips">' + items.map(function (i) { return '<button class="chip' + (i.v === sel ? ' on' : '') + '" data-act="' + act + '" data-v="' + esc(i.v) + '">' + esc(i.l) + '</button>'; }).join('') + '</div>';
  }
  function topKat(jenis) {
    var rows = C.recent(S.tx, function (x) { return x.Jenis === jenis; }, 400);
    var codes = C.freq(rows.map(function (x) { return x.KodeAkun; }), 7);
    S.M.kategori.filter(function (k) { return k.Jenis === jenis; }).forEach(function (k) { if (codes.length < 7 && codes.indexOf(k.KodeAkun) < 0) codes.push(k.KodeAkun); });
    if (F.kodeAkun && codes.indexOf(F.kodeAkun) < 0) codes.unshift(F.kodeAkun);
    return codes.filter(function (c) { return S.M.katByKode[c] && S.M.katByKode[c].Aktif; }).map(function (c) { return {v: c, l: dn(S.M.katByKode[c].SubKategori)}; });
  }
  function topWallets(field) {
    var col = field === 'dompetTujuan' ? 'DompetTujuan' : 'Dompet';
    var rows = C.recent(S.tx, function (x) { return x[col]; }, 300);
    var names = C.freq(rows.map(function (x) { return x[col]; }), 5).filter(function (n) { return S.M.dompet[n] && S.M.dompet[n].Aktif; });
    ownWallets().forEach(function (d) { if (names.length < 5 && names.indexOf(d.Nama) < 0) names.push(d.Nama); });
    var sel = F[field]; if (sel && names.indexOf(sel) < 0) names.unshift(sel);
    return names.map(function (n) { return {v: n, l: n}; });
  }
  function sug(field, n) {
    var rows = C.recent(S.tx, field === 'Tag' ? null : function (x) { return x.Jenis === 'Expense'; }, 400), pool = rows;
    if (field === 'Barang' && F.toko) { var p = rows.filter(function (x) { return x.Toko === F.toko; }); if (p.length) pool = p; }
    else if (F.kodeAkun && (field === 'Toko' || field === 'Lokasi')) { var q = rows.filter(function (x) { return x.KodeAkun === F.kodeAkun; }); if (q.length >= 3) pool = q; }
    return C.freq(pool.map(function (x) { return x[field]; }), n || 6);
  }
  function sugChips(field, key) {
    var s = sug(field); if (!s.length) return '';
    return '<div class="chips" style="margin-top:8px">' + s.map(function (v) { return '<button class="chip sm" data-act="f-sug" data-field="' + key + '" data-v="' + esc(v) + '">' + esc(v) + '</button>'; }).join('') + '</div>';
  }
  function dueChips() {
    var base = (F.waktu || C.nowLocal()).substr(0, 10), d14 = new Date(base + 'T00:00:00Z'); d14.setUTCDate(d14.getUTCDate() + 14);
    var opts = [['f.due.2w', d14.toISOString().substr(0, 10)], ['f.due.3m', C.addMonths(base, 3)], ['f.due.1y', C.addMonths(base, 12)], ['f.due.2y', C.addMonths(base, 24)]];
    var jg = ''; try { jg = C.jangka(base, F.jatuhTempo); } catch (e) { jg = ''; }
    return '<label class="lbl2">' + t('f.due') + '</label><div class="chips">' + opts.map(function (o) { return '<button class="chip sm' + (F.jatuhTempo === o[1] ? ' on' : '') + '" data-act="f-due" data-v="' + o[1] + '">' + t(o[0]) + '</button>'; }).join('') + '</div>' +
      '<button class="dtbig" style="margin-top:8px" data-act="f-cal" data-target="jatuhTempo">' + ICON.cal + '<span>' + esc(F.jatuhTempo ? fmtD(F.jatuhTempo) : t('f.d.pick')) + '</span></button>' +
      (jg ? '<div class="muted sm" style="margin-top:6px">' + esc(t('f.tenor', t('jg.' + jg))) + '</div>' : '');
  }
  function loanCards(kind) {
    var ls = C.openLoans(S.tx, FX.edit).filter(function (l) { return l.kind === kind; });
    if (!ls.length) return '<div class="note">' + t('f.noloan.' + kind) + '</div>';
    return ls.map(function (l) {
      return '<button class="loan' + (F.referensi === l.id ? ' on' : '') + '" data-act="f-loan" data-v="' + esc(l.id) + '"><div class="t">' + esc(l.pihak) + ' · ' + esc(t('f.loan.rest', C.fmtRp(l.sisa))) + '</div><div class="s">' + esc(t('f.loan.line', C.fmtRp(l.jumlah), C.fmtTgl(l.tanggal), C.fmtTgl(l.jatuhTempo))) + '</div></button>';
    }).join('');
  }
  function pihakChips() {
    var rows = C.recent(S.tx, function (x) { return x.Pihak; }, 300);
    var names = C.freq(rows.map(function (x) { return x.Pihak; }), 5).filter(function (n) { return S.M.pihakByNama[n.toLowerCase()]; });
    if (F.pihak && names.indexOf(F.pihak) < 0) names.unshift(F.pihak);
    return '<div class="chips">' + names.map(function (n) { return '<button class="chip' + (F.pihak === n ? ' on' : '') + '" data-act="f-pihak" data-v="' + esc(n) + '">' + esc(n) + '</button>'; }).join('') +
      '<button class="chip more" data-act="f-pihak-all">' + t('f.party.more') + '</button></div>';
  }
  function walletBlock(label, field) {
    return '<label class="lbl2">' + label + '</label><div class="chips">' + topWallets(field).map(function (i) {
      return '<button class="chip' + (F[field] === i.v ? ' on' : '') + '" data-act="f-wallet" data-field="' + field + '" data-v="' + esc(i.v) + '">' + esc(i.l) + '</button>';
    }).join('') + '<button class="chip more" data-act="f-wallet-all" data-field="' + field + '">' + t('f.wallet.more') + '</button></div>';
  }
  // ---- v2.2: tanggal & jam tanpa pemilih bawaan HP (iPhone menutup pemilih bila formulir digambar ulang)
  function addDays(ymd, n) { var d = new Date(ymd + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().substr(0, 10); }
  function dayOff(n) { return addDays(C.todayLocal(), n); }
  function dayName(ymd) { var d = new Date(ymd + 'T00:00:00Z'), i = (d.getUTCDay() + 6) % 7; return t('an.days.full').split(',')[i]; }
  function fDate() { return F.waktu ? F.waktu.substr(0, 10) : C.todayLocal(); }
  function fTime() { return F.waktu ? F.waktu.substr(11, 5) : ''; }
  function setWaktu(d, tm) {
    if (F.jenis === 'Saldo awal') { F.waktu = d + 'T00:00'; return; }
    if (!tm && d === C.todayLocal()) { F.waktu = ''; return; }
    F.waktu = d + 'T' + (tm || C.nowLocal().substr(11, 5));
  }
  function parseTime(v) {
    v = String(v || '').trim(); if (!v) return '';
    var m = /^(\d{1,2})[:.](\d{1,2})$/.exec(v), hh, mm;
    if (m) { hh = +m[1]; mm = +m[2]; }
    else { var d = v.replace(/\D/g, ''); if (!d || d.length > 4) return null; if (d.length <= 2) { hh = +d; mm = 0; } else { hh = +d.slice(0, d.length - 2); mm = +d.slice(-2); } }
    if (hh > 23 || mm > 59) return null;
    return C.pad(hh) + ':' + C.pad(mm);
  }
  function fmtD(ymd) { var d = new Date(ymd + 'T00:00:00Z'), i = (d.getUTCDay() + 6) % 7; return t('an.days').split(',')[i] + ', ' + ymd.substr(8, 2) + ' ' + C.namaBulan(+ymd.substr(5, 2), true) + ' ' + ymd.substr(0, 4); }
  function dtBlock() {
    var d = fDate(), tm = fTime(), h = '<div id="f-dt"><label class="lbl2">' + t('f.dt') + '</label>';
    if (FX.copy && FX.orig) {
      var o = FX.orig;
      h += '<div class="seg cpw"><button class="' + (F.waktu === o ? 'on' : '') + '" data-act="f-copyt" data-v="orig"><b>' + t('f.copy.orig') + '</b><small>' + esc(fmtD(o.substr(0, 10)) + ' · ' + o.substr(11, 5)) + '</small></button>' +
        '<button class="' + (!F.waktu ? 'on' : '') + '" data-act="f-copyt" data-v="now"><b>' + t('f.copy.now') + '</b><small>' + esc(t('f.t.live.s')) + '</small></button></div>';
    }
    h += '<div class="chips">' + [0, -1, -2].map(function (n) { return '<button class="chip sm' + (d === dayOff(n) ? ' on' : '') + '" data-act="f-day" data-v="' + n + '">' + t('f.d.' + (-n)) + '</button>'; }).join('') + '</div>';
    h += '<div class="dtrow"><button class="ib" data-act="f-dshift" data-v="-1" aria-label="' + t('f.d.prev') + '">‹</button><button class="dtbig" data-act="f-cal" data-target="waktu"><span>' + esc(fmtD(d)) + '</span></button>' +
      '<button class="ib" data-act="f-dshift" data-v="1" aria-label="' + t('f.d.next') + '">›</button>' +
      '<button class="dtbig tm' + (tm ? '' : ' live') + '" id="f-time" data-act="f-tp" aria-label="' + t('f.t') + '">' + (tm || C.nowLocal().substr(11, 5)) + '</button></div>';
    if (!tm) h += '<div class="muted sm" style="margin-top:6px">' + t('f.t.live') + '</div>';
    return h + '</div>';
  }
  // ---- roda jam (buatan aplikasi)
  var TP = null;
  function openTP() {
    var cur = fTime() || C.nowLocal().substr(11, 5); TP = {h: +cur.substr(0, 2), m: +cur.substr(3, 2)};
    function col(n, sel, id) { var x = '<div class="whp"></div>'; for (var i = 0; i < n; i++) x += '<button class="wi' + (i === sel ? ' on' : '') + '" data-act="tp-tap" data-col="' + id + '" data-v="' + i + '">' + C.pad(i) + '</button>'; return '<div class="wh" id="' + id + '">' + x + '<div class="whp"></div></div>'; }
    $('#overlay2').innerHTML = '<div class="scrim" data-act="tp-close"></div><div class="sheet tp"><div class="sheet-h"><div class="sh-t">' + t('f.t') + '</div><button class="x" data-act="tp-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div>' +
      '<div class="sheet-b"><div class="whw"><div class="whsel"></div>' + col(24, TP.h, 'tp-h') + '<b class="whc">:</b>' + col(60, TP.m, 'tp-m') + '</div>' +
      '<button class="btn primary" style="margin-top:14px" data-act="tp-done">' + t('f.t.done') + '</button></div></div>';
    ['tp-h', 'tp-m'].forEach(function (id) {
      var el = $('#' + id), tmr; el.scrollTop = (id === 'tp-h' ? TP.h : TP.m) * 40;
      el.addEventListener('scroll', function () { clearTimeout(tmr); tmr = setTimeout(function () { var i = Math.round(el.scrollTop / 40); if (id === 'tp-h') TP.h = Math.min(23, i); else TP.m = Math.min(59, i); [].forEach.call(el.querySelectorAll('.wi'), function (b) { b.classList.toggle('on', +b.dataset.v === i); }); }, 80); });
    });
  }
  function tpRead() { var a = $('#tp-h'), b = $('#tp-m'); if (a) TP.h = Math.min(23, Math.round(a.scrollTop / 40)); if (b) TP.m = Math.min(59, Math.round(b.scrollTop / 40)); }
  // ---- keypad nominal + kalkulator (buatan aplikasi)
  var OPS = '+−×÷';
  /** Evaluator ekspresi: + − × ÷ ( ), desimal '.', prioritas operator, kurung tak tertutup otomatis ditutup, ×/kurung tersirat. Hasil dibulatkan ke rupiah. */
  function exprEval(e, dec) {
    e = String(e || '').replace(/[+\-−×÷*/xX(]+$/, ''); if (!e) return 0;
    var tk = e.replace(/[*xX]/g, '×').replace(/\//g, '÷').replace(/-/g, '−').match(/\d+(?:\.\d+)?|\.\d+|[+−×÷()]/g) || [], p = 0, bad = false;
    function peek() { return tk[p]; }
    function factor() {
      var x = tk[p];
      if (x === '−') { p++; return -factor(); } if (x === '+') { p++; return factor(); }
      if (x === '(') { p++; var v = expr(); if (tk[p] === ')') p++; return v; }
      if (x != null && /^[\d.]/.test(x)) { p++; return parseFloat(x); }
      bad = true; return NaN;
    }
    function term() {
      var v = factor();
      while (p < tk.length) {
        var o = tk[p];
        if (o === '×') { p++; v *= factor(); } else if (o === '÷') { p++; var d = factor(); if (!d) { bad = true; return NaN; } v /= d; }
        else if (o === '(' || (o && /^[\d.]/.test(o))) { v *= factor(); } else break;
      }
      return v;
    }
    function expr() { var v = term(); while (p < tk.length && (tk[p] === '+' || tk[p] === '−')) { var o = tk[p++], r = term(); v = o === '+' ? v + r : v - r; } return v; }
    var r = expr(); while (tk[p] === ')') p++;
    if (bad || p < tk.length) return NaN;
    return isFinite(r) ? (dec ? Math.round(r * 1e6) / 1e6 : Math.round(r)) : NaN;
  }
  var kpEval = exprEval;
  function kpHasOp(e) { return /[+−×÷()]/.test(e || ''); }
  function kpPretty(e) { return String(e || '').replace(/\d+(?:\.\d*)?/g, function (m) { var q = m.split('.'); return C.fmtNum(+q[0]) + (q.length > 1 ? (S.pref.lang === 'en' ? '.' : ',') + q[1] : ''); }).replace(/([+−×÷])/g, ' $1 ').replace(/\( /g, '(').replace(/ \)/g, ')'); }
  function kpSync() { var v = kpEval(FX.kp.e); F.jumlah = v > 0 && v < 1e13 ? v : 0; }
  function kpSettle() { if (!kpHasOp(FX.kp.e)) return true; var v = kpEval(FX.kp.e); if (!(v > 0) || v >= 1e13) return false; FX.kp.e = String(v); FX.kp.eq = true; kpSync(); return true; }
  function amtHTML() {
    var k = FX.kp, op = kpHasOp(k.e), v = kpEval(k.e);
    return '<div class="amt kpa' + (k.open ? ' on' : '') + '" id="f-jumlah" data-act="kp-open" role="button" tabindex="0"><span>Rp</span><div class="amtv"><div class="amtx" id="f-amtx">' + (k.err ? '<i class="out">' + esc(k.err) + '</i>' : (op ? esc(kpPretty(k.e)) : '')) + '</div>' +
      '<div class="amtn' + (k.e ? '' : ' ph') + '" id="f-amtn">' + (k.e && isFinite(v) ? esc(C.fmtNum(Math.max(0, v))) : '0') + '</div></div></div>';
  }
  function kpPad() {
    var D = ['(', ')', ',', 'del', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '000', '0', '=', '+'];
    return '<div class="kp">' + D.map(function (k) { return '<button class="kb' + (OPS.indexOf(k) >= 0 || k === '=' ? ' op' : (/[(),]/.test(k) ? ' par' : '')) + '" data-act="kp" data-v="' + k + '"' + (k === 'del' ? ' aria-label="' + t('kp.del') + '"' : '') + '>' + (k === 'del' ? ICON.bksp : k) + '</button>'; }).join('') +
      '<button class="kb go wide" data-act="kp-next">' + t('kp.next') + ' ›</button></div>';
  }
  function kpRefresh() { var a = $('#f-jumlah'); if (a) a.outerHTML = amtHTML(); }
  function kpKey(k) {
    var x = FX.kp; x.err = '';
    if (k === 'del') { x.e = x.e.slice(0, -1); x.eq = false; }
    else if (/^\d+$/.test(k)) { if (x.eq) { x.e = ''; x.eq = false; } if (x.e.length < 60) { if (/\)$/.test(x.e)) x.e += '×'; var last = (x.e.match(/[\d.]+$/) || [''])[0]; if (k === '000' && !last) k = ''; if (last === '0') x.e = x.e.slice(0, -1); if (last.replace('.', '').length + k.length <= 13) x.e += k; } }
    else if (k === ',') { x.eq = false; var lt = (x.e.match(/[\d.]+$/) || [''])[0]; if (lt.indexOf('.') >= 0) return; x.e += lt ? '.' : (/[)]$/.test(x.e) ? '×0.' : '0.'); }
    else if (k === '(') { if (x.eq) { x.e = ''; x.eq = false; } if (/[\d).]$/.test(x.e)) x.e += '×'; x.e += '('; }
    else if (k === ')') { x.eq = false; var oc = (x.e.match(/\(/g) || []).length, cc = (x.e.match(/\)/g) || []).length; if (oc > cc && /[\d)]$/.test(x.e)) x.e += ')'; }
    else if (OPS.indexOf(k) >= 0) { x.eq = false; if (!x.e) { if (k === '−') x.e = '(−'; return kpSync(), kpRefresh(); } if (/[+−×÷]$/.test(x.e)) x.e = x.e.slice(0, -1) + k; else if (/\($/.test(x.e)) { if (k === '−') x.e += k; } else x.e += k; }
    else if (k === '=') { if (!kpSettle()) x.err = t('kp.err.res'); }
    kpSync(); kpRefresh();
  }
  function kpNext() {
    if (!kpSettle() || !(F.jumlah > 0)) { FX.kp.err = t('kp.err.amt'); kpRefresh(); return; }
    FX.kp.open = false; renderForm();
    var n = $('#f-next'); if (n) { try { n.scrollIntoView({block: 'start', behavior: 'smooth'}); } catch (e) { n.scrollIntoView(); } var nx = n.nextElementSibling; if (nx) { nx.classList.add('flash'); setTimeout(function () { nx.classList.remove('flash'); }, 1000); } }
  }
  function kpClose() { if (FX && FX.kp && FX.kp.open) { kpSettle(); FX.kp.open = false; return true; } return false; }
  // ---- kalender buatan aplikasi
  var CAL = null;
  function openCal(target) {
    var v = target === 'jatuhTempo' ? (F.jatuhTempo || addDays(fDate(), 30)) : fDate();
    CAL = {target: target, sel: target === 'jatuhTempo' ? F.jatuhTempo : v, y: +v.substr(0, 4), m: +v.substr(5, 2)};
    renderCal();
  }
  function renderCal() {
    var y = CAL.y, m = CAL.m, first = new Date(Date.UTC(y, m - 1, 1)), lead = (first.getUTCDay() + 6) % 7, days = new Date(Date.UTC(y, m, 0)).getUTCDate(), today = C.todayLocal(), cells = '';
    t('an.days').split(',').forEach(function (d) { cells += '<div class="cw">' + esc(d) + '</div>'; });
    for (var i = 0; i < lead; i++) cells += '<div></div>';
    for (var dd2 = 1; dd2 <= days; dd2++) {
      var ymd = y + '-' + C.pad(m) + '-' + C.pad(dd2);
      cells += '<button class="cd' + (ymd === CAL.sel ? ' on' : '') + (ymd === today ? ' td' : '') + '" data-act="cal-pick" data-v="' + ymd + '">' + dd2 + '</button>';
    }
    var ttl = CAL.target === 'jatuhTempo' ? t('f.due') : t('f.date');
    $('#overlay2').innerHTML = '<div class="scrim" data-act="cal-close"></div><div class="sheet cal"><div class="sheet-h"><div class="sh-t">' + esc(ttl) + '</div><button class="x" data-act="cal-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div>' +
      '<div class="sheet-b"><div class="calh"><button class="ib" data-act="cal-nav" data-v="-1">‹</button><b>' + esc(C.namaBulan(m) + ' ' + y) + '</b><button class="ib" data-act="cal-nav" data-v="1">›</button></div>' +
      '<div class="calg">' + cells + '</div><div class="btnrow2" style="margin-top:12px"><button class="btn" data-act="cal-pick" data-v="' + (CAL.target === 'jatuhTempo' ? '' : today) + '">' + t(CAL.target === 'jatuhTempo' ? 'f.d.clear' : 'f.d.0') + '</button><button class="btn" data-act="cal-close">' + t('close') + '</button></div></div></div>';
  }
  function pickCal(v) {
    var tg = CAL.target; CAL = null; $('#overlay2').innerHTML = '';
    if (!F) return;
    if (tg === 'jatuhTempo') F.jatuhTempo = v;
    else if (v) setWaktu(v, fTime());
    renderForm();
  }
  function formHTML() {
    var f = F, h = '', title = FX.planTitle ? FX.planTitle : FX.edit ? t('f.fix') : (f.jenis === 'Saldo awal' ? t('f.opening') : (FX.copy ? t('f.copy') : t('f.new')));
    h += '<div class="sheet-h"><div class="sh-t">' + title + '</div><button class="x" data-act="f-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div><div class="sheet-b" id="formbody">';
    if (f.jenis !== 'Saldo awal' && !FX.planCb) {
      h += '<div class="seg">' + ['Expense', 'Income', 'Transfer', 'Utang/Piutang'].map(function (s) {
        return '<button class="' + (f.jenis === s ? 'on' : '') + '" data-act="f-jenis" data-v="' + s + '"' + (FX.edit && s !== f.jenis ? ' disabled style="opacity:.4"' : '') + '>' + jl(s) + '</button>';
      }).join('') + '</div>';
    }
    if (!FX.edit && !FX.planCb && f.jenis !== 'Saldo awal' && X.plan && X.plan.myRecs().length) h += '<div class="fromrec"><button class="dd" data-act="f-rec"><span>' + ICON.repeat + ' ' + esc(FX.recName || t('f.fromrec')) + '</span><i>' + ICON.chevd + '</i></button></div>';
    h += amtHTML();
    if (f.jenis !== 'Saldo awal') h += dtBlock();
    if (FX.planCb && FX.pd && X.v361) h += X.v361.pdBlock(FX.pd);
    h += '<div id="f-next"></div>';
    if (f.jenis === 'Expense' || f.jenis === 'Income') {
      h += '<label class="lbl2">' + t('f.cat') + '</label><div class="chips">' + topKat(f.jenis).map(function (i) {
        var k = S.M.katByKode[i.v];
        return '<button class="chip ci' + (f.kodeAkun === i.v ? ' on' : '') + '" data-act="f-kat" data-v="' + esc(i.v) + '">' + catIcon(k && k.Kategori, k && k.SubKategori, k && k.KodeAkun) + esc(i.l) + '</button>';
      }).join('') + '<button class="chip more" data-act="f-kat-all">' + t('f.allcat') + '</button></div>';
      h += walletBlock(f.jenis === 'Expense' ? t('f.payfrom') : t('f.payto'), 'dompet');
      if (f.jenis === 'Expense' && X.hooks.formExtra) h += X.hooks.formExtra(f, FX);
    } else if (f.jenis === 'Transfer') {
      h += walletBlock(t('f.from'), 'dompet') + walletBlock(t('f.to'), 'dompetTujuan');
      h += '<label class="lbl2">' + t('f.fee') + '</label><input class="input" inputmode="numeric" placeholder="0" enterkeyhint="done" value="' + (f.biayaAdmin ? C.fmtNum(f.biayaAdmin) : '') + '" data-money="biayaAdmin">';
    } else if (f.jenis === 'Utang/Piutang') {
      h += '<label class="lbl2">' + t('f.kind') + '</label>' + chips([{v: 'Beri pinjaman', l: t('f.lend')}, {v: 'Terima pelunasan', l: t('f.recv')}, {v: 'Pinjam', l: t('f.borrow')}, {v: 'Bayar utang', l: t('f.repay')}], f.subJenis, 'f-sub');
      if (f.subJenis === 'Pinjam' || f.subJenis === 'Beri pinjaman') h += '<label class="lbl2">' + t('f.party') + '</label>' + pihakChips() + dueChips();
      else if (f.subJenis === 'Bayar utang' || f.subJenis === 'Terima pelunasan') h += '<label class="lbl2">' + t('f.loan') + '</label>' + loanCards(f.subJenis === 'Bayar utang' ? 'Utang' : 'Piutang');
      if (f.subJenis) h += walletBlock(f.subJenis === 'Pinjam' || f.subJenis === 'Terima pelunasan' ? t('f.money.in') : t('f.money.out'), 'dompet');
    } else if (f.jenis === 'Saldo awal') {
      h += '<div class="note">' + t('f.opening.note') + '</div>';
      h += '<label class="lbl2">' + t('f.kind') + '</label>' + chips(['Dompet', 'Piutang', 'Utang'].map(function (v) { return {v: v, l: t('f.opening.kind.' + v)}; }), f.subJenis, 'f-sub');
      if (f.subJenis === 'Dompet') h += walletBlock(t('d.wallet'), 'dompet');
      if (f.subJenis === 'Piutang' || f.subJenis === 'Utang') {
        h += '<label class="lbl2">' + t('f.party') + '</label>' + pihakChips() + dueChips();
        h += '<label class="lbl2">' + t('f.owner') + '</label>' + chips(S.M.users.map(function (u) { return {v: u, l: u}; }), f.pemilik || S.cfg.user, 'f-owner');
      }
      h += '<label class="lbl2">' + t('f.date') + '</label><div class="dtrow"><button class="ib" data-act="f-dshift" data-v="-1">‹</button><button class="dtbig" data-act="f-cal" data-target="open">' + ICON.cal + '<span>' + esc(fmtD(fDate())) + '</span></button><button class="ib" data-act="f-dshift" data-v="1">›</button></div>';
    }
    if (f.jenis !== 'Saldo awal') {
      function acIn(key, col, ph) { return '<div class="acw"><input class="input" data-bind="' + key + '" data-ac="' + col + '" value="' + esc(f[key]) + '" autocomplete="off" enterkeyhint="' + (key === 'catatan' ? 'done' : 'next') + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '><div class="acl"></div></div>'; }
      h += '<div class="optbox"><div class="opth">' + t('f.opt') + '</div>';
      if (f.jenis === 'Expense' || f.jenis === 'Income') {
        h += '<label class="lbl2">' + t(f.jenis === 'Income' ? 'f.source' : 'f.shop') + '</label>' + acIn('toko', 'Toko') + (f.toko ? '' : sugChips('Toko', 'toko'));
        h += '<label class="lbl2">' + t('f.loc') + '</label>' + acIn('lokasi', 'Lokasi');
        if (f.jenis === 'Expense') h += '<label class="lbl2">' + t('f.item') + '</label>' + acIn('barang', 'Barang') + (f.barang || !f.toko ? '' : sugChips('Barang', 'barang'));
      }
      h += '<label class="lbl2">' + t('f.tag') + '</label>' + acIn('tag', 'Tag', t('f.tag.ph')) + (X.v361 && !FX.planCb ? X.v361.tagSug(f) : '');
      h += '<label class="lbl2">' + t('f.note') + '</label>' + acIn('catatan', 'Catatan') + '</div>';
    }
    h += '</div>' + footHTML();
    return h;
  }
  function footHTML() {
    if (FX.kp && FX.kp.open) return '<div class="sheet-f kpf">' + kpPad() + '</div>';
    return '<div class="sheet-f">' + (FX.err ? '<div class="err">' + esc(FX.err) + '</div>' : '') + '<button class="btn primary" data-act="f-save">' + (FX.edit ? t('f.save.fix') : t('save')) + '</button></div>';
  }
  function footSwap() { var f = $('#overlay .sheet-f'); if (f && FX) f.outerHTML = footHTML(); kpRefresh(); }
  function renderForm(focus) {
    var ov = $('#overlay'), body = $('#formbody'), st = body ? body.scrollTop : 0;
    if (!FX.kp) FX.kp = {open: false, e: '', eq: false, err: ''};
    if (!kpHasOp(FX.kp.e) && String(FX.kp.e || '') !== String(F.jumlah > 0 ? F.jumlah : '')) FX.kp.e = F.jumlah > 0 ? String(F.jumlah) : '';
    ov.innerHTML = '<div class="scrim" data-act="f-close"></div><div class="sheet full">' + formHTML() + '</div>';
    var nb = $('#formbody'); if (nb && !focus) nb.scrollTop = st;
  }
  function closeForm() { var back = FX && FX.planBack; $('#overlay').innerHTML = ''; F = null; FX = null; if (back) back(); }
  function resetForJenis(j) {
    F.jenis = j; F.subJenis = ''; F.kodeAkun = ''; F.pihak = ''; F.referensi = ''; F.jatuhTempo = ''; F.dompetTujuan = ''; F.biayaAdmin = '';
    F.dompet = defaultWallet(j);
  }
  function saveForm() {
    try {
      if (FX.planCb) {
        C.makeTx(Object.assign({}, F, {waktu: F.waktu || C.nowLocal()}), S.cfg.user, S.M, S.tx, {});
        var pcb = FX.planCb, pdat = Object.assign({}, F, {_pd: FX.pd ? Object.assign({}, FX.pd) : null}); FX.planBack = null; closeForm(); pcb(pdat); return;
      }
      if (!F.waktu) F.waktu = C.nowLocal();
      var FX_wasEdit = !!FX.edit, rec = FX.rec, x = C.makeTx(F, S.cfg.user, S.M, S.tx, {ignoreId: FX.edit || null});
      if (FX.edit) {
        var old = S.tx[FX.edit];
        if (!old || old.Status !== 'Aktif') throw new Error('Transaksi yang dikoreksi sudah dibatalkan');
        old.Status = 'Dibatalkan'; old._pendingBatal = true;
        var oldKid = S.tx[old.ID + '-F']; if (oldKid && oldKid.Status === 'Aktif') { oldKid.Status = 'Dibatalkan'; oldKid._pendingBatal = true; }
        x._pending = true; S.tx[x.ID] = x;
        enqueue({action: 'koreksi', body: {id: FX.edit, tx: C.toPayload(F)}});
      } else {
        x._pending = true; S.tx[x.ID] = x;
        enqueue({action: 'tambah', body: {tx: C.toPayload(F)}});
      }
      var kid = C.feeTx(x, S.M); if (kid) { kid._pending = true; S.tx[kid.ID] = kid; }
      if (FX.replaceOp) discardOp(FX.replaceOp, true);
      if (x.Dompet && x.Jenis !== 'Saldo awal') { S.prefs.lastDompet = S.prefs.lastDompet || {}; S.prefs.lastDompet[x.Jenis] = x.Dompet; }
      if (rec && X.plan) X.plan.markDone(rec.id, rec.due, 'catat');
      var afterCb = FX.after;
      var jenis = x.Jenis; FX.planBack = null; closeForm(); if (afterCb) afterCb(x); touch(); render(); toast(jenis === 'Saldo awal' ? t('opening.saved') : t('saved')); syncNow();
      if (X.hooks.afterSave && !FX_wasEdit) X.hooks.afterSave(x);
    } catch (e) {
      FX.err = L.tErr(e.message); renderForm();
      var fb = $('.sheet-f'); if (fb) fb.scrollIntoView({block: 'end'});
    }
  }

  // ---------------------------------------------------------------- saran saat mengetik (toko, lokasi, barang, tag, catatan)
  function acIndex() {
    var key = S.rev + '|' + Object.keys(S.tx).length;
    if (S._acKey === key) return S._ac;
    var idx = {Toko: {}, Lokasi: {}, Barang: {}, Catatan: {}, Tag: {}};
    C.recent(S.tx, null, 4000).forEach(function (x) {
      ['Toko', 'Lokasi', 'Barang', 'Catatan'].forEach(function (c) { var v = C.clean(x[c]); if (!v) return; var r = idx[c][v.toLowerCase()] || (idx[c][v.toLowerCase()] = {v: v, n: 0, j: {}}); r.n++; r.j[x.Jenis] = (r.j[x.Jenis] || 0) + 1; });
      String(x.Tag || '').split(/[\s,]+/).forEach(function (tg) { tg = tg.trim(); if (!tg) return; var r = idx.Tag[tg.toLowerCase()] || (idx.Tag[tg.toLowerCase()] = {v: tg, n: 0, j: {}}); r.n++; });
    });
    S._acKey = key; S._ac = idx; return idx;
  }
  function acQuery(el) { var v = el.value; return el.dataset.ac === 'Tag' ? v.split(/[\s,]+/).pop() : v; }
  function acShow(el) {
    var box = el.nextElementSibling; if (!box) return;
    var q = acQuery(el).trim().toLowerCase(), col = el.dataset.ac;
    if (!q) { box.innerHTML = ''; return; }
    var idx = acIndex()[col], jen = F && F.jenis, out = [];
    for (var k in idx) { var i = k.indexOf(q); if (i < 0 || k === q) continue; out.push({r: idx[k], pre: i === 0 ? 1 : 0}); }
    out.sort(function (a, b) { return (b.pre - a.pre) || ((b.r.j[jen] ? 1 : 0) - (a.r.j[jen] ? 1 : 0)) || (b.r.n - a.r.n); });
    box.innerHTML = out.slice(0, 6).map(function (o) { return '<button type="button" class="aci" data-act="ac-pick" data-col="' + col + '" data-key="' + el.dataset.bind + '" data-v="' + esc(o.r.v) + '">' + esc(o.r.v) + '<small>' + o.r.n + '×</small></button>'; }).join('');
  }
  function acPick(el) {
    var key = el.dataset.key, v = el.dataset.v;
    if (key === 'tag') { var parts = String(F.tag || '').split(/\s+/); parts[parts.length - 1] = v; F.tag = parts.join(' ').trim() + ' '; }
    else F[key] = v;
    if (key === 'toko' && !FX.edit) {
      var last = C.recent(S.tx, function (x) { return x.Toko === v && x.Jenis === F.jenis; }, 1)[0];
      if (last) {
        if (last.KodeAkun && S.M.katByKode[last.KodeAkun] && S.M.katByKode[last.KodeAkun].Aktif) F.kodeAkun = last.KodeAkun;
        if (S.M.dompet[last.Dompet] && S.M.dompet[last.Dompet].Aktif) F.dompet = last.Dompet;
        if (!F.lokasi && last.Lokasi) F.lokasi = last.Lokasi;
      }
    }
    renderForm();
  }

  // ---------------------------------------------------------------- picker
  var P = null;
  function openPicker(cfg) { P = cfg; P.q = ''; renderPicker(true); }
  function pickerItems() { var q = P.q.toLowerCase().trim(); return P.items.filter(function (i) { return !q || (i.l + ' ' + (i.g || '') + ' ' + (i.s || '')).toLowerCase().indexOf(q) >= 0; }); }
  function pickerList() {
    var items = pickerItems(), out = '', last = null;
    items.forEach(function (it) {
      if (it.g !== last) { out += '<div class="day">' + esc(it.g || '') + '</div>'; last = it.g; }
      out += '<div class="card pk"><div class="row tap" data-act="pick" data-i="' + P.items.indexOf(it) + '">' + (it.ico ? '<div class="ico">' + it.ico + '</div>' : '') + '<div class="grow"><div class="t">' + esc(it.l) + '</div>' + (it.s ? '<div class="s">' + esc(it.s) + '</div>' : '') + '</div></div></div>';
    });
    if (P.allowAdd && P.q.trim().length >= 2 && !P.items.some(function (i) { return i.l.toLowerCase() === P.q.trim().toLowerCase(); })) {
      out = '<div class="card pk"><div class="row tap" data-act="pick-add"><div class="ico">' + ICON.plus + '</div><div class="grow"><div class="t">' + esc(t('f.party.add', P.q.trim())) + '</div><div class="s">' + t('f.party.add.s') + '</div></div></div></div>' + out;
    }
    return out || '<div class="empty">' + t('nothing') + '</div>';
  }
  function renderPicker(focus) {
    $('#overlay2').innerHTML = '<div class="scrim" data-act="pick-close"></div><div class="sheet full"><div class="sheet-h"><div class="sh-t">' + esc(P.title) + '</div><button class="x" data-act="pick-close">' + ICON.x + '</button></div>' +
      '<div class="sheet-b"><input class="search" id="pq" type="search" placeholder="' + esc(t('search')) + '" autocomplete="off"><div id="plist">' + pickerList() + '</div></div></div>';
    if (focus) { var a = $('#pq'); if (a) a.focus(); }
  }
  function closePicker() { $('#overlay2').innerHTML = ''; P = null; }

  // ---------------------------------------------------------------- detail transaksi
  var D = null;
  function openDetail(id) { D = {id: id, confirm: false}; renderDetail(); }
  function hasActiveRepay(id) { return Object.keys(S.tx).some(function (k) { var r = S.tx[k]; return r.Referensi === id && r.Status === 'Aktif' && C.isRepay(r); }); }
  function renderDetail() {
    var x = S.tx[D.id]; if (!x) { $('#overlay').innerHTML = ''; D = null; return; }
    var v = txView(x), lines = [];
    try { lines = C.deriveLines(x, S.M, x.Jenis === 'Transfer' && !S.tx[x.ID + '-F']); } catch (e) {}
    var kv = [['d.type', jl(x.Jenis) + (x.SubJenis ? ' · ' + t('s.' + x.SubJenis) : '')], ['d.date', C.fmtTgl(x.Waktu.substr(0, 10)) + ' ' + x.Waktu.substr(11)], ['d.wallet', x.Dompet + (x.DompetTujuan ? ' → ' + x.DompetTujuan : '')],
      ['d.cat', x.Kategori ? dn(x.Kategori) + ' / ' + dn(x.SubKategori) : ''], ['d.party', x.Pihak], ['d.due', x.JatuhTempo ? C.fmtTgl(x.JatuhTempo) + ' (' + t('jg.' + x.Jangka) + ')' : ''],
      ['d.fee', +x.BiayaAdmin ? C.fmtRp(x.BiayaAdmin) : ''], ['d.shop', x.Toko], ['d.loc', x.Lokasi], ['d.item', x.Barang], ['d.tag', x.Tag], ['d.note', x.Catatan],
      ['d.by', x.DicatatOleh], ['d.owner', x.PemilikDompet], ['d.status', t('st.' + x.Status) + (x._pending ? ' · ' + t('d.waiting') : '')], ['d.corrects', x.Mengoreksi], ['d.loan', x.Referensi], ['ID', x.ID]]
      .filter(function (r) { return r[1]; });
    var blocked = C.loanKind(x) && hasActiveRepay(x.ID), canAct = x.Status === 'Aktif' && !x._pendingBatal;
    var h = '<div class="sheet-h"><div class="sh-t">' + t('d.title') + '</div><button class="x" data-act="d-close">' + ICON.x + '</button></div><div class="sheet-b">' +
      '<div class="card hero dh"><div class="ico ' + v.cls + '">' + v.ico + '</div><div><div class="lbl">' + esc(v.title) + '</div><div class="big ' + (v.sign > 0 ? 'in' : (v.sign < 0 ? 'out' : '')) + '">' + esc((v.sign > 0 ? '+' : (v.sign < 0 ? '−' : '')) + C.fmtRp(x.Jumlah)) + '</div></div></div>' +
      (x._error ? '<div class="err" style="margin-top:10px">' + esc(t('d.failed', x._error)) + '</div>' : '') +
      '<div class="card" style="margin-top:10px"><dl class="kv">' + kv.map(function (r) { return '<dt>' + esc(r[0] === 'ID' ? 'ID' : t(r[0])) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl></div>' + repayBlock(x) +
      (X.hooks.detailExtra ? X.hooks.detailExtra(x) : '') + (x.Status === 'Aktif' && (x.Jenis === 'Income' || x.Jenis === 'Expense') && X.plan ? '<div style="margin-top:12px"><button class="link" data-act="d-recur">↻ ' + t('d.recur') + '</button></div>' : '') +
      (lines.length ? '<h2>' + t('d.journal') + '</h2><div class="card">' + lines.map(function (l) { var nm = dn(S.M.akun[l.kode] ? S.M.akun[l.kode].Nama : l.kode); return '<div class="jr" style="padding:4px 0;border:0"><div class="l' + (l.debit ? '' : ' k') + '"><span>' + esc(nm) + '</span><span>' + esc(C.fmtNum(l.debit || l.kredit)) + '</span></div></div>'; }).join('') + '</div>' : '') +
      (blocked ? '<div class="note">' + t('d.blocked') + '</div>' : '') + '</div>';
    var copyBtn = x.Jenis !== 'Saldo awal' ? '<button class="btn" data-act="d-copy">' + ICON.copy + t('d.copy') + '</button>' : '';
    if (x._error) h += '<div class="sheet-f btnrow2"><button class="btn danger" data-act="d-drop">' + t('d.drop') + '</button><button class="btn primary" data-act="d-edit-failed">' + t('d.retry') + '</button></div>';
    else if (D.confirm) h += '<div class="sheet-f btnrow2"><button class="btn" data-act="d-cancel-no">' + t('d.no') + '</button><button class="btn danger" data-act="d-cancel-yes">' + t('d.sure') + '</button></div>';
    else if (canAct && !blocked && x.Jenis !== 'Saldo awal') h += '<div class="sheet-f btnrow3">' + copyBtn + '<button class="btn danger" data-act="d-cancel">' + t('d.cancel') + '</button><button class="btn primary" data-act="d-correct">' + t('d.correct') + '</button></div>';
    else if (canAct && !blocked) h += '<div class="sheet-f"><button class="btn danger" data-act="d-cancel">' + t('d.cancel.open') + '</button></div>';
    else if (copyBtn) h += '<div class="sheet-f">' + copyBtn + '</div>';
    $('#overlay').innerHTML = '<div class="scrim" data-act="d-close"></div><div class="sheet">' + h + '</div>';
  }
  function repayBlock(x) {
    if (!C.loanKind(x)) return '';
    var reps = Object.keys(S.tx).map(function (k) { return S.tx[k]; }).filter(function (r) { return r.Referensi === x.ID && r.Status === 'Aktif' && C.isRepay(r); }).sort(byTimeDesc);
    var left = Number(x.Jumlah) - sum(reps, function (r) { return +r.Jumlah; });
    return '<h2>' + t('d.repays') + '</h2><div class="card"><div class="row"><div class="grow"><div class="t">' + t('d.left') + '</div></div><div class="a">' + esc(C.fmtRp(left)) + '</div></div>' +
      (reps.length ? reps.map(function (r) {
        return '<div class="row tap" data-act="tx-open" data-id="' + esc(r.ID) + '"><div class="grow"><div class="t">' + esc(C.fmtTgl(r.Waktu.substr(0, 10))) + '</div><div class="s">' + esc(r.Dompet) + '</div></div><div class="a in">' + esc(C.fmtRp(r.Jumlah)) + '</div></div>';
      }).join('') : '<div class="empty sm">' + t('d.norepay') + '</div>') + '</div>';
  }
  function copyTx(x) {
    var f = rowToForm(x);
    if (C.isRepay(x)) { f.referensi = ''; f.jumlah = Number(x.Jumlah); }
    if (C.loanKind(x)) f.jatuhTempo = '';
    openForm(f, {copy: true, orig: x.Waktu});
  }
  function cancelTx(id) {
    var x = S.tx[id]; if (!x) return;
    var inQ = S.queue.filter(function (o) { return o.action === 'tambah' && o.body.tx.id === id && o.id !== S.inflight && !o.error; })[0];
    var kid = S.tx[id + '-F'];
    if (x._pending && inQ) { S.queue = S.queue.filter(function (o) { return o.id !== inQ.id; }); delete S.tx[id]; delete S.tx[id + '-F']; }
    else { x._pendingBatal = true; x.Status = 'Dibatalkan'; if (kid && kid.Status === 'Aktif') { kid._pendingBatal = true; kid.Status = 'Dibatalkan'; } enqueue({action: 'batal', body: {id: id}}); }
    touch(); render(); toast(t('canceled')); syncNow();
  }
  function discardOp(opId, silent) {
    var op = S.queue.filter(function (o) { return o.id === opId; })[0]; if (!op) return;
    S.queue = S.queue.filter(function (o) { return o.id !== opId; });
    var tid = op.body && op.body.tx && op.body.tx.id;
    if (tid && S.tx[tid] && S.tx[tid]._pending) { delete S.tx[tid]; delete S.tx[tid + '-F']; }
    if (op.action === 'koreksi') { revertBatal(op.body.id); revertBatal(op.body.id + '-F'); }
    touch(); if (!silent) render();
  }

  // ---------------------------------------------------------------- tambah aset & subkategori
  var W = null, K = null;
  function openWalletForm() { closeOverlays(); W = {nama: '', jenis: 'Kas', pemilik: S.cfg.user, saldo: 0, err: '', busy: false}; renderWalletForm(true); }
  function renderWalletForm(focus) {
    var h = '<div class="sheet-h"><div class="sh-t">' + t('w.title') + '</div><button class="x" data-act="ov-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div><div class="sheet-b">' +
      '<label class="lbl2">' + t('w.name') + '</label><input class="input" id="w-nama" data-w="nama" value="' + esc(W.nama) + '" autocomplete="off" placeholder="' + esc(t('w.name.ph')) + '">' +
      '<label class="lbl2">' + t('w.kind') + '</label>' + chips([{v: 'Kas', l: t('w.kind.Kas')}, {v: 'Investasi', l: t('w.kind.Investasi')}], W.jenis, 'w-jenis') +
      '<label class="lbl2">' + t('w.owner') + '</label>' + chips(S.M.users.map(function (u) { return {v: u, l: u}; }), W.pemilik, 'w-owner') +
      '<label class="lbl2">' + t('w.saldo') + '</label><input class="input" inputmode="numeric" data-w="saldo" data-money="1" placeholder="0" value="' + (W.saldo ? C.fmtNum(W.saldo) : '') + '">' +
      '<div class="note">' + t('w.note') + '</div></div><div class="sheet-f">' + (W.err ? '<div class="err">' + esc(W.err) + '</div>' : '') +
      '<button class="btn primary" data-act="w-save"' + (W.busy ? ' disabled' : '') + '>' + (W.busy ? t('w.saving') : t('w.save')) + '</button></div>';
    $('#overlay').innerHTML = '<div class="scrim" data-act="ov-close"></div><div class="sheet full">' + h + '</div>';
    if (focus) { var a = $('#w-nama'); if (a) a.focus(); }
  }
  function waitMaster(pred, done) {
    S.needMaster = true; syncNow({master: true, force: true});
    var t0 = Date.now();
    (function wait() { if (pred() || Date.now() - t0 > 8000) return done(); setTimeout(wait, 150); })();
  }
  function srvErr(e) { return e.net ? t('need.net') : (e.code === 'AUTH' ? t('app.sync.auth') : (/Aksi tidak dikenal/.test(e.message) ? t('server.old') : e.message)); }
  function saveWallet() {
    var nama = C.clean(W.nama);
    if (nama.length < 2) { W.err = t('w.short'); renderWalletForm(); return; }
    W.busy = true; W.err = ''; renderWalletForm();
    api('dompetBaru', {nama: nama, jenis: W.jenis, pemilik: W.pemilik}).then(function (r) {
      var saldo = Number(W.saldo) || 0, real = r.nama || nama;
      waitMaster(function () { return S.M.dompet[real]; }, function () {
        W = null; toast(r.dup ? t('w.dup') : t('w.ok'));
        if (saldo > 0 && S.M.dompet[real]) { openForm({jenis: 'Saldo awal', subJenis: 'Dompet', dompet: real, jumlah: saldo, waktu: C.todayLocal() + 'T00:00'}); saveForm(); }
        else { closeOverlays(); render(); }
      });
    }).catch(function (e) { W.busy = false; W.err = srvErr(e); renderWalletForm(); });
  }
  function openKatForm() {
    closeOverlays();
    var groups = []; S.M.kategori.forEach(function (k) { if (k.Jenis === S.katJenis && groups.indexOf(k.Kategori) < 0) groups.push(k.Kategori); });
    K = {jenis: S.katJenis, groups: groups, kategori: groups[0] || '', nama: '', en: '', err: '', busy: false}; renderKatForm(true);
  }
  function renderKatForm(focus) {
    var h = '<div class="sheet-h"><div class="sh-t">' + t('k.add') + ' · ' + t(K.jenis === 'Income' ? 'pg.income' : 'pg.expense') + '</div><button class="x" data-act="ov-close">' + ICON.x + '</button></div><div class="sheet-b">' +
      '<label class="lbl2">' + t('k.group') + '</label><div class="chips">' + K.groups.map(function (g) { return '<button class="chip ci' + (K.kategori === g ? ' on' : '') + '" data-act="k-group" data-v="' + esc(g) + '">' + catIcon(g) + esc(dn(g)) + '</button>'; }).join('') + '</div>' +
      '<label class="lbl2">' + t('v364.k.id') + '</label><input class="input" id="k-nama" data-k="nama" value="' + esc(K.nama) + '" autocomplete="off" placeholder="' + esc(t('v364.k.id.ph')) + '">' +
      '<label class="lbl2">' + t('v364.k.en') + '</label><input class="input" id="k-nama-en" data-k="en" value="' + esc(K.en || '') + '" autocomplete="off" placeholder="' + esc(t('v364.k.en.ph')) + '">' +
      '<div class="note">' + t('k.note') + ' ' + t('v364.k.note') + '</div></div><div class="sheet-f">' + (K.err ? '<div class="err">' + esc(K.err) + '</div>' : '') +
      '<button class="btn primary" data-act="k-save"' + (K.busy ? ' disabled' : '') + '>' + (K.busy ? t('w.saving') : t('k.save')) + '</button></div>';
    $('#overlay').innerHTML = '<div class="scrim" data-act="ov-close"></div><div class="sheet full">' + h + '</div>';
    if (focus) { var a = $('#k-nama'); if (a) a.focus(); }
  }
  function saveKat() {
    var nid = C.clean(K.nama), nen = C.clean(K.en || ''), nama = nid || nen;
    if (nama.length < 2) { K.err = t('w.short'); renderKatForm(); return; }
    K.busy = true; K.err = ''; renderKatForm();
    api('kategoriBaru', {jenis: K.jenis, kategori: K.kategori, sub: nama}).then(function (r) {
      if (X.v361 && (nid || nen) && nid !== nen) X.v361.setNM(nama, nid, nen);
      waitMaster(function () { return S.M.katByKode[r.kode]; }, function () { K = null; closeOverlays(); toast(r.dup ? t('k.dup') : t('k.ok')); render(); });
    }).catch(function (e) { K.busy = false; K.err = srvErr(e); renderKatForm(); });
  }
  var PR = null;
  function openPihakEdit(nama) { closeOverlays(); PR = {old: nama, nama: nama, err: '', busy: false}; renderPihakEdit(true); }
  function renderPihakEdit(focus) {
    $('#overlay').innerHTML = '<div class="scrim" data-act="ov-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + t('p.rename') + '</div><button class="x" data-act="ov-close" aria-label="' + t('close') + '">' + ICON.x + '</button></div><div class="sheet-b">' +
      '<label class="lbl2">' + t('p.rename.name') + '</label><input class="input" id="pr-nama" data-pr="1" value="' + esc(PR.nama) + '" autocomplete="off"><div class="note">' + t('p.rename.note') + '</div></div>' +
      '<div class="sheet-f">' + (PR.err ? '<div class="err">' + esc(PR.err) + '</div>' : '') + '<button class="btn primary" data-act="pr-save"' + (PR.busy ? ' disabled' : '') + '>' + (PR.busy ? t('w.saving') : t('save')) + '</button></div></div>';
    if (focus) { var a = $('#pr-nama'); if (a) { a.focus(); try { a.select(); } catch (e) {} } }
  }
  function shareDoc(doc, name) {
    if (!window.DoItJpg) return;
    toast(t('jpg.making'));
    window.DoItJpg.share(doc, name).then(function (m) { if (m === 'downloaded') toast(t('jpg.saved')); }).catch(function (e) { toast(t('jpg.fail')); });
  }
  function savePihak() {
    var nama = C.clean(PR.nama), old = PR.old;
    if (nama.length < 2) { PR.err = t('w.short'); renderPihakEdit(); return; }
    if (nama === old) { closeOverlays(); return; }
    var ex = S.M.pihakByNama[nama.toLowerCase()];
    if (ex && ex.Nama.toLowerCase() !== old.toLowerCase()) { PR.err = t('p.rename.exists', ex.Nama); renderPihakEdit(); return; }
    if (S.queue.length) { PR.err = t('p.rename.queue'); renderPihakEdit(); return; }
    PR.busy = true; PR.err = ''; renderPihakEdit();
    api('pihakUbah', {nama: old, baru: nama}).then(function (r) {
      if (r.ada) { PR.busy = false; PR.err = t('p.rename.exists', r.nama); renderPihakEdit(); return; }
      waitMaster(function () { return S.M.pihakByNama[nama.toLowerCase()] && !(S.M.pihakByNama[old.toLowerCase()] && old.toLowerCase() !== nama.toLowerCase()); }, function () {
        PR = null; closeOverlays(); toast(t('p.rename.ok', r.berubah || 0)); render();
      });
    }).catch(function (e) { PR.busy = false; PR.err = srvErr(e); renderPihakEdit(); });
  }
  function addPihak(nama) {
    nama = C.clean(nama);
    if (S.M.pihakByNama[nama.toLowerCase()]) return nama;
    S.master.pihak.push({PihakID: '(baru)', Nama: nama, Aktif: true}); S.M = C.indexMaster(S.master);
    enqueue({action: 'pihakBaru', body: {nama: nama}}); touch(); syncNow();
    return nama;
  }

  // ---------------------------------------------------------------- aksi
  var A = {
    tab: function (el) { setTab(el.dataset.v); },
    page: function (el) {
      var v = el.dataset.v;
      if (v === 'receivable' || v === 'payable') { S.debtF = v === 'receivable' ? 'Piutang' : 'Utang'; v = 'debts'; }
      else if (v === 'debts') S.debtF = el.dataset.k || 'Semua';
      if (v === 'income' || v === 'expense') { S.per = 'bulan'; S.flowK = v; v = 'flow'; }
      if (v === 'flow') S.per = S.per || 'bulan';
      if (v === 'assets') v = 'portfolio';
      if (v === 'notif') { S.notifFrom = S.prefs.actSeen || 0; S.ntab = X.analisis && X.analisis.newWarnCount() && !unreadAct() ? 'warn' : 'notif'; }
      openPage(v, null, el.dataset.g);
    },
    'per-more': function (el) { openPerSheet(el.dataset.for); },
    dd: function (el) {
      var k = el.dataset.k, fr = el.dataset.for, cur = el.dataset.cur;
      if (k === 'per') return openPerSheet(fr);
      if (k === 'owner') return openChoice(t('dd.owner'), ['Semua'].concat(S.M.users).map(function (u) { return {v: u, l: u === 'Semua' ? t('all') : u}; }), cur, fr);
      if (k === 'rep') return openChoice(t('dd.rep'), REP_KINDS.map(function (x) { return {v: x, l: t('r.' + x)}; }), cur, fr);
      if (k === 'dim') return openChoice(t('dd.dim'), DIMS.map(function (x) { return {v: x, l: t(x === 'pencatat' ? 'r.dim.rec' : 'r.dim.owner')}; }), cur, fr);
      if (X.ddOpts && X.ddOpts[k]) { var o = X.ddOpts[k](); return openChoice(o.title, o.opts, cur, fr); }
    },
    'dd-pick': function (el) { closePicker(); A[el.dataset.for]({dataset: {v: el.dataset.v}}); },
    'rep-dim': function (el) { S.rep.dim = el.dataset.v; render(); },
    'flow-k': function (el) { S.flowK = el.dataset.v; S.limit = 80; render(); },
    'n-tab': function (el) { S.ntab = el.dataset.v; render(); },
    'per-pick': function (el) { closePicker(); A[el.dataset.for]({dataset: {v: el.dataset.v}}); },
    'per-custom': function (el) {
      var a = ($('#pc-a') || {}).value, b = ($('#pc-b') || {}).value;
      if (!a || !b) return; if (a > b) { var tmp = a; a = b; b = tmp; }
      S.custom = {start: a, end: b}; closePicker(); A[el.dataset.for]({dataset: {v: 'custom'}});
    },
    'debt-f': function (el) { S.debtF = el.dataset.v; render(); },
    'debt-share': function (el) { shareDoc(docDebt(el.dataset.p || ''), 'doit-utang-piutang' + (el.dataset.p ? '-' + el.dataset.p.toLowerCase().replace(/\W+/g, '-') : '')); },
    'rep-share': function () { shareDoc(repDoc(), 'doit-' + S.rep.kind + '-' + C.todayLocal()); },
    'pihak-edit': function (el) { openPihakEdit(el.dataset.v); },
    'pr-save': function () { savePihak(); },
    'exit-yes': function () { closePicker(); S._leaving = true; try { history.go(-2); } catch (e) {} try { window.close(); } catch (e2) {} setTimeout(function () { S._leaving = false; }, 800); },
    'd-recur': function () { var x = S.tx[D.id]; $('#overlay').innerHTML = ''; D = null; if (x && X.plan) X.plan.rutinFromTx(x); },
    asset: function (el) { S.per = 'bulan'; openPage('asset', el.dataset.v); },
    back: function () { goBack(false); },
    menu: showMenu, 'ov-close': function () { closeOverlays(); },
    add: function () { openForm({jenis: 'Expense'}); },
    sync: function () { S.authFail = false; syncNow({force: true}); },
    'hard-reload': function () { if (window.doitRescue) window.doitRescue(); else location.reload(); },
    'full-sync': function () { syncNow({full: true, master: true, force: true}); toast(t('set.reloading')); },
    'theme-cycle': function () { S.pref.mode = {auto: 'light', light: 'dark', dark: 'auto'}[S.pref.mode] || 'auto'; savePref(); render(); toast(t('theme.' + S.pref.mode)); },
    'lang-toggle': function () { S.pref.lang = S.pref.lang === 'en' ? 'id' : 'en'; savePref(); render(); },
    owner: function (el) { S.owner = el.dataset.v; render(); },
    txper: function (el) { S.txPer = el.dataset.v; S.limit = 80; render(); },
    per: function (el) { S.per = el.dataset.v; S.limit = 80; render(); },
    'tx-today': function () { S.txPer = 'hari'; S.q = ''; setTab('transaksi'); },
    'void-toggle': function () { S.showVoid = !S.showVoid; render(); },
    more: function () { S.limit += 80; render(); },
    'tx-open': function (el) { openDetail(el.dataset.id); },
    'rep-kind': function (el) { S.rep.kind = el.dataset.v; S.rep.limit = 50; render(); },
    'rep-period': function (el) { S.rep.period = el.dataset.v; S.rep.limit = 50; render(); },
    'rep-who': function (el) { S.rep.who = el.dataset.v; render(); },
    'rep-more': function () { S.rep.limit += 50; render(); },
    'saldo-awal': function () { openForm({jenis: 'Saldo awal', subJenis: 'Dompet'}); },
    'kat-jenis': function (el) { S.katJenis = el.dataset.v; render(); },
    'pihak-add': function () { openPicker({title: t('p.new.title'), items: [], allowAdd: true, onAdd: function (n) { addPihak(n); closePicker(); toast(t('p.added')); render(); }}); },
    'q-drop': function (el) { discardOp(el.dataset.id); },
    'pref-mode': function (el) { S.pref.mode = el.dataset.v; savePref(); render(); },
    'pref-theme': function (el) { S.pref.theme = el.dataset.v; savePref(); render(); },
    'pref-lang': function (el) { S.pref.lang = el.dataset.v; savePref(); render(); },
    logout: function () {
      if (!confirm(t('set.logout.q'))) return;
      lsSet('kk.cfg', null); DB.set('state', null); S.cfg = null; S.tx = {}; S.master = null; S.queue = []; S.rev = 0; S.mrev = 0; S.prev = 0; S.rencana = []; S.act = []; S.epoch = null; S.page = null; S.stack = []; S.M = C.indexMaster(null); render();
    },
    'setup-go': function () { doSetup(); },
    'loan-new': function (el) { openForm({jenis: 'Utang/Piutang', subJenis: el.dataset.v === 'Piutang' ? 'Beri pinjaman' : 'Pinjam'}); },
    'loan-pay': function (el) {
      var l = C.openLoans(S.tx).filter(function (x) { return x.id === el.dataset.id; })[0]; if (!l) return;
      openForm({jenis: 'Utang/Piutang', subJenis: l.kind === 'Piutang' ? 'Terima pelunasan' : 'Bayar utang', referensi: l.id, pihak: l.pihak, jumlah: l.sisa});
    },
    // aset & kategori
    'w-open': function () { openWalletForm(); },
    'w-jenis': function (el) { W.jenis = el.dataset.v; renderWalletForm(); },
    'w-owner': function (el) { W.pemilik = el.dataset.v; renderWalletForm(); },
    'w-save': function () { saveWallet(); },
    'k-open': function () { openKatForm(); },
    'k-group': function (el) { K.kategori = el.dataset.v; renderKatForm(); },
    'k-save': function () { saveKat(); },
    // form
    'f-close': function () { closeForm(); },
    'f-jenis': function (el) { if (FX.edit) return; resetForJenis(el.dataset.v); renderForm(); },
    'f-kat': function (el) { F.kodeAkun = el.dataset.v; renderForm(); },
    'f-kat-all': function () {
      var items = S.M.kategori.filter(function (k) { return k.Jenis === F.jenis; }).map(function (k) { return {v: k.KodeAkun, l: dn(k.SubKategori), g: dn(k.Kategori), ico: catIcon(k.Kategori, k.SubKategori, k.KodeAkun)}; });
      openPicker({title: t('f.cat.title'), items: items, onPick: function (it) { F.kodeAkun = it.v; closePicker(); renderForm(); }});
    },
    'f-wallet': function (el) { F[el.dataset.field] = el.dataset.v; renderForm(); },
    'f-wallet-all': function (el) {
      var field = el.dataset.field, kg = {};
      ((S.master && S.master.akun) || []).forEach(function (a) { kg[a.Kode] = a.Kelompok; });
      var items = S.M.dompetAktif.map(function (d) { return {v: d.Nama, l: d.Nama, g: d.Pemilik + ' · ' + (kg[d.KodeAkun] || ''), own: d.Pemilik}; })
        .sort(function (a, b) { if (a.own !== b.own) return a.own === S.cfg.user ? -1 : (b.own === S.cfg.user ? 1 : (a.own < b.own ? -1 : 1)); return a.g < b.g ? -1 : (a.g > b.g ? 1 : 0); });
      openPicker({title: t('f.wallet.title'), items: items, onPick: function (it) { F[field] = it.v; closePicker(); renderForm(); }});
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
      openPicker({title: t('f.party.title'), items: items, allowAdd: true, onPick: function (it) { F.pihak = it.v; closePicker(); renderForm(); }, onAdd: function (nama) { addPihak(nama); F.pihak = nama; closePicker(); renderForm(); }});
    },
    'f-due': function (el) { F.jatuhTempo = el.dataset.v; renderForm(); },
    'kp': function (el) { kpKey(el.dataset.v); },
    'kp-next': function () { kpNext(); },
    'kp-open': function () { if (!FX.kp.open) { FX.kp.open = true; FX.kp.err = ''; footSwap(); } },
    'f-tp': function () { openTP(); },
    'tp-tap': function (el) { var c = $('#' + el.dataset.col); if (c) c.scrollTo({top: +el.dataset.v * 40, behavior: 'smooth'}); },
    'tp-close': function () { TP = null; $('#overlay2').innerHTML = ''; },
    'tp-done': function () { tpRead(); var v = C.pad(TP.h) + ':' + C.pad(TP.m); TP = null; $('#overlay2').innerHTML = ''; if (F) { F.waktu = fDate() + 'T' + v; renderForm(); } },
    'f-day': function (el) { setWaktu(dayOff(+el.dataset.v), fTime()); renderForm(); },
    'f-dshift': function (el) { setWaktu(addDays(fDate(), +el.dataset.v), fTime()); renderForm(); },
    'f-cal': function (el) { openCal(el.dataset.target); },
    'cal-nav': function (el) { var m = CAL.m + (+el.dataset.v); CAL.y += m < 1 ? -1 : (m > 12 ? 1 : 0); CAL.m = m < 1 ? 12 : (m > 12 ? 1 : m); renderCal(); },
    'cal-pick': function (el) { pickCal(el.dataset.v); },
    'cal-close': function () { CAL = null; $('#overlay2').innerHTML = ''; },
    'f-copyt': function (el) { F.waktu = el.dataset.v === 'orig' ? FX.orig : ''; renderForm(); },
    'f-loan': function (el) {
      var l = C.openLoans(S.tx, FX.edit).filter(function (x) { return x.id === el.dataset.v; })[0]; if (!l) return;
      F.referensi = l.id; F.pihak = l.pihak; if (!F.jumlah || F.jumlah > l.sisa) F.jumlah = l.sisa; renderForm();
    },
    'f-rec': function () {
      var rs = X.plan.myRecs();
      openPicker({title: t('f.fromrec'), items: rs.map(function (r) { return {v: r.id, l: r._nama, s: C.fmtRp(r.p.jumlah) + ' · ' + (r.p.dompet || ''), g: t('f.fromrec.g'), ico: ICON.repeat}; }), onPick: function (it) {
        closePicker(); var fill = X.plan.formFromRec(it.v); if (!fill) return;
        Object.assign(F, fill.form); FX.rec = fill.rec; FX.recName = fill.nama; FX.err = ''; renderForm();
      }});
    },
    'ac-pick': function (el) { acPick(el); },
    'f-sug': function (el) { var k = el.dataset.field; F[k] = k === 'tag' && F.tag ? F.tag + ' ' + el.dataset.v : el.dataset.v; renderForm(); },
    'f-save': saveForm,
    pick: function (el) { P.onPick(P.items[+el.dataset.i]); },
    'pick-add': function () { var n = P.q.trim(); if (P.onAdd) P.onAdd(n); },
    'pick-close': closePicker,
    // detail
    'd-close': function () { $('#overlay').innerHTML = ''; D = null; },
    'd-cancel': function () { D.confirm = true; renderDetail(); },
    'd-cancel-no': function () { D.confirm = false; renderDetail(); },
    'd-cancel-yes': function () { var id = D.id; $('#overlay').innerHTML = ''; D = null; cancelTx(id); },
    'd-correct': function () { var x = S.tx[D.id]; D = null; openForm(rowToForm(x), {edit: x.ID}); },
    'd-copy': function () { var x = S.tx[D.id]; D = null; copyTx(x); },
    'd-drop': function () {
      var id = D.id, op = S.queue.filter(function (o) { return o.body && o.body.tx && o.body.tx.id === id; })[0];
      $('#overlay').innerHTML = ''; D = null; if (op) discardOp(op.id); render();
    },
    'd-edit-failed': function () {
      var id = D.id, x = S.tx[id], op = S.queue.filter(function (o) { return o.body && o.body.tx && o.body.tx.id === id; })[0];
      D = null; openForm(rowToForm(x), {edit: op && op.action === 'koreksi' ? op.body.id : null, replaceOp: op ? op.id : null});
    }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return;
    var act = el.dataset.act, fn = A[act];
    if (fn && F && FX && FX.kp && FX.kp.open && !/^(kp|f-close|tp-|cal-)/.test(act) && el.closest('#overlay')) { kpClose(); fn(el, e); if (F && FX && $('#overlay .kpf')) footSwap(); e.preventDefault(); return; }
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.id === 'q') { S.q = el.value; S.limit = 80; var l = $('#txlist'); if (l) l.innerHTML = txBody(); return; }
    if (el.id === 'pq' && P) { P.q = el.value; $('#plist').innerHTML = pickerList(); return; }
    if (el.id === 'pq2') { S.pq = el.value; var c = el.selectionStart; render(); var n = $('#pq2'); if (n) { n.focus(); try { n.setSelectionRange(c, c); } catch (x) {} } return; }
    if (el.dataset.w && W) {
      if (el.dataset.money) { var sv2 = el.value.replace(/\D/g, '').substr(0, 13); W.saldo = sv2 ? Number(sv2) : 0; el.value = sv2 ? C.fmtNum(sv2) : ''; }
      else W[el.dataset.w] = el.value;
      return;
    }
    if (el.dataset.pr && PR) { PR.nama = el.value; return; }
    if (el.dataset.k && K) { K[el.dataset.k] = el.value; return; }
    if (el.dataset.amt && F) { var d = el.value.replace(/\D/g, '').substr(0, 13); F.jumlah = d ? Number(d) : 0; el.value = d ? C.fmtNum(d) : ''; return; }
    if (el.dataset.money && F) { var m = el.value.replace(/\D/g, '').substr(0, 11); F[el.dataset.money] = m ? Number(m) : ''; el.value = m ? C.fmtNum(m) : ''; return; }
    if (el.dataset.bind && F && !el.dataset.rerender) { F[el.dataset.bind] = el.value; if (el.dataset.ac) acShow(el); }
  });
  document.addEventListener('focusin', function (e) { var el = e.target; if (F && FX && FX.kp && FX.kp.open && el.matches && el.matches('#overlay input, #overlay textarea')) { kpClose(); footSwap(); } });
  document.addEventListener('keydown', function (e) {
    if (!F || !FX || !FX.kp || !FX.kp.open || e.metaKey || e.ctrlKey || e.altKey) return;
    var a = document.activeElement; if (a && /INPUT|TEXTAREA/.test(a.tagName)) return;
    var k = e.key, m = {'+': '+', '-': '−', '*': '×', 'x': '×', '/': '÷', 'Backspace': 'del', '=': '=', '(': '(', ')': ')', ',': ',', '.': ','};
    if (/^\d$/.test(k)) kpKey(k); else if (m[k]) kpKey(m[k]); else if (k === 'Enter') kpNext(); else return;
    e.preventDefault();
  });
  document.addEventListener('focusin', function (e) { var el = e.target; if (F && el.dataset && el.dataset.ac) { setTimeout(function () { try { el.scrollIntoView({block: 'start', behavior: 'smooth'}); } catch (x) {} }, 250); acShow(el); } });
  document.addEventListener('focusout', function (e) { var el = e.target; if (el.dataset && el.dataset.ac) setTimeout(function () { var l = el.nextElementSibling; if (l && document.activeElement !== el) l.innerHTML = ''; }, 200); });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (!F) return;
    if (el.dataset.bind && el.dataset.rerender) { F[el.dataset.bind] = el.value; renderForm(); }
  });

  // ---------------------------------------------------------------- setup & mulai
  function doSetup() {
    var url = ($('#s-url').value || '').trim(), key = ($('#s-key').value || '').trim(), btn = $('#s-go');
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^\s]+\/exec$/.test(url) && !/^https?:\/\/(localhost|127\.0\.0\.1)/.test(url)) { renderSetup(t('setup.badurl')); $('#s-url').value = url; return; }
    if (!key) { renderSetup(t('setup.nokey')); $('#s-url').value = url; return; }
    btn.disabled = true; btn.textContent = t('setup.checking');
    S.cfg = {url: url, key: key, user: ''};
    api('ping').then(function (r) {
      S.cfg.user = r.user; lsSet('kk.cfg', S.cfg);
      S.tx = {}; S.master = null; S.queue = []; S.rev = 0; S.mrev = 0; S.prev = 0; S.rencana = []; S.act = []; S.epoch = r.epoch != null ? r.epoch : null;
      pushSentinelOnce(); render(); return syncNow({full: true, master: true});
    }).catch(function (e) {
      S.cfg = null; renderSetup(e.code === 'AUTH' ? t('setup.auth') : (e.net ? t('setup.net') : e.message)); $('#s-url').value = url;
    });
  }
  function start() {
    applyTheme();
    S.cfg = lsGet('kk.cfg');
    if (!S.cfg) { render(); return; }
    pushSentinelOnce();
    DB.get('state').then(function (st) {
      if (st && st.user === S.cfg.user) {
        S.rev = st.rev || 0; S.mrev = st.mrev || 0; S.epoch = st.epoch != null ? st.epoch : null; S.tx = st.tx || {}; S.master = st.master || null;
        S.queue = st.queue || []; S.prefs = Object.assign({lastDompet: {}, actSeen: 0}, st.prefs || {}); S.lastSync = st.lastSync || 0;
        S.prev = st.prev || 0; S.rencana = st.rencana || []; S.act = st.act || [];
        S.M = C.indexMaster(S.master);
      }
      S._lines = null; render(); syncNow();
    });
  }
  function pushSentinelOnce() { if (!S._sent) { S._sent = true; pushSentinel(); } }
  setInterval(function () { if (document.visibilityState === 'visible' && S.cfg) syncNow(); }, 15000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') syncNow(); });
  window.addEventListener('online', function () { syncNow(); });
  window.addEventListener('offline', function () { S.online = false; setBadge(); });
  if (window.matchMedia) { var mq = matchMedia('(prefers-color-scheme: dark)'), onMq = function () { if (S.pref.mode === 'auto') applyTheme(); }; if (mq.addEventListener) mq.addEventListener('change', onMq); }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  window.__KK = {S: S, syncNow: syncNow};
  // ---- antarmuka untuk modul tambahan (plan.js, port.js, analisis.js)
  function rcList(tipe) { return S.rencana.filter(function (r) { return r.Tipe === tipe; }).map(function (r) { return Object.assign({}, r.Data, {id: r.ID, _oleh: r.Oleh}); }); }
  function rcApply(id, tipe, data, hapus) {
    S.rencana = S.rencana.filter(function (r) { return r.ID !== id; });
    if (!hapus) S.rencana.push({ID: id, Tipe: tipe, Data: data, Aktif: true, Oleh: S.cfg.user});
    S.prev = -1; touch(); syncNow({force: true});
  }
  function rcSave(tipe, data, id) {
    var d = Object.assign({}, data); delete d.id; delete d._oleh;
    return api('rencanaSimpan', {tipe: tipe, data: d, id: id || undefined}).then(function (r) { rcApply(r.ids[0], tipe, d); return r.ids[0]; });
  }
  function rcRemove(id) { return api('rencanaHapus', {id: id}).then(function () { rcApply(id, null, null, true); }); }
  function rcBatch(ops) {
    return api('rencanaBatch', {ops: ops}).then(function (r) {
      ops.forEach(function (o, i) { if (o.op === 'hapus') rcApply(o.id, null, null, true); else rcApply(r.ids[i], o.tipe, o.data); });
      return r.ids;
    });
  }
  Object.assign(X, {flowList: flowListHTML, isDark: isDark, applyTheme: applyTheme, openMenu: showMenu, openSetup: renderSetup, S: S, C: C, C2: C2, L: L, t: t, esc: esc, $: $, sum: sum, ICON: ICON, A: A, dn: dn, api: api, render: render, openPage: openPage, goBack: goBack, setTab: setTab, toast: toast,
    renderForm: renderForm, getForm: function () { return F; }, closeForm: closeForm, saveFormRaw: function () { return {F: F, FX: FX}; }, openForm: openForm, rowToForm: rowToForm, openPicker: openPicker, closePicker: closePicker, closeOverlays: closeOverlays, openDetail: openDetail, txRow: txRow, txView: txView, txListGrouped: txListGrouped,
    donut: donut, legend: legend, sparkline: sparkline, shortRp: shortRp, perChips: perChips, rangeOf: rangeOf, periodOf: periodOf, prevOf: prevOf, ownerChips: ownerChips, fObj: fObj, getLines: getLines, kodeToDompet: kodeToDompet, repCtx: repCtx, repDoc: repDoc,
    assetGroups: assetGroups, byTimeDesc: byTimeDesc, catIcon: catIcon, isNonOp: isNonOp, chips: chips, enqueue: enqueue, syncNow: syncNow, persist: persist, touch: touch, srvErr: srvErr, waitMaster: waitMaster,
    isNonOp: isNonOp, getOpLines: getOpLines, splitIS: splitIS, dd: dd, openChoice: openChoice, vAsset: vAsset, NONOP_G: NONOP_G, newForm: newForm, defaultWallet: defaultWallet,
    DB: DB, lsGet: lsGet, lsSet: lsSet, savePref: savePref, parseTime: parseTime, kpEval: kpEval, exprEval: exprEval, rc: {list: rcList, save: rcSave, remove: rcRemove, batch: rcBatch}, shareDoc: shareDoc, pushSentinelOnce: pushSentinelOnce, signAmt: signAmt, debtPeople: debtPeople, unreadCount: unreadCount, VERSION: VERSION});
  X.jpg = window.DoItJpg;
  X.start = start;
})();
