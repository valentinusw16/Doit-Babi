if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['foto'] = '3.3.0';
/* Do it v2.2 - foto profil (disinkronkan lewat Google Sheet, Rencana tipe "foto", hanya pemilik yang boleh mengganti)
   dan foto latar kartu Kekayaan bersih (hanya di HP ini, IndexedDB). */
(function () {
  'use strict';
  var X = window.DoIt;
  // Bila app.js yang termuat versi lama (cache/GitHub Pages belum sinkron), modul foto dilewati supaya aplikasi tetap jalan.
  if (!X || !X.DB || !X.A || !X.rc || !X.savePref || !(function (v) { v = String(v || '0').split('.').map(Number); return v[0] > 2 || (v[0] === 2 && v[1] >= 2); })(X.VERSION)) return;
  var S = X.S, t = X.t, esc = X.esc, $ = X.$;
  var card = {url: null, loaded: false}, card2 = {url: null};
  if (window.I18N && window.I18N.add) {
    window.I18N.add('id', {'cp2.t': 'Foto kartu Waterfall', 'cp2.s': 'Latar kartu Perubahan kekayaan bersih. Pilih foto sendiri, samakan dengan kartu Net Worth, atau tanpa foto.', 'cp2.m.beda': 'Foto beda', 'cp2.m.sama': 'Foto sama', 'cp2.m.tanpa': 'Tanpa foto', 'cp2.fallback': 'Belum ada foto kedua, jadi sementara memakai foto kartu Net Worth.'});
    window.I18N.add('en', {'cp2.t': 'Waterfall card photo', 'cp2.s': 'Background of the Net worth change card. Use its own photo, the same as the Net worth card, or none.', 'cp2.m.beda': 'Own photo', 'cp2.m.sama': 'Same photo', 'cp2.m.tanpa': 'No photo', 'cp2.fallback': 'No second photo yet, so the Net worth card photo is used for now.'});
  }

  // ---------------------------------------------------------------- olah gambar
  function loadImg(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { res({im: im, u: u}); };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('img')); };
      im.src = u;
    });
  }
  function avatarData(file) {
    return loadImg(file).then(function (o) {
      var im = o.im, sz = Math.min(im.naturalWidth, im.naturalHeight), cv = document.createElement('canvas'), out = 160, q = 0.82, d;
      cv.width = cv.height = out;
      cv.getContext('2d').drawImage(im, (im.naturalWidth - sz) / 2, (im.naturalHeight - sz) / 2, sz, sz, 0, 0, out, out);
      URL.revokeObjectURL(o.u);
      do { d = cv.toDataURL('image/jpeg', q); q -= 0.12; } while (d.length > 28000 && q > 0.2);
      return d;
    });
  }
  function cardBlob(file) {
    return loadImg(file).then(function (o) {
      var im = o.im, max = 1200, k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement('canvas');
      cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k);
      cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(o.u);
      return new Promise(function (res, rej) { cv.toBlob(function (b) { b ? res(b) : rej(new Error('blob')); }, 'image/jpeg', 0.82); });
    });
  }

  // ---------------------------------------------------------------- foto profil
  function avImg(user) {
    var r = S.rencana.filter(function (x) { return x.Tipe === 'foto' && x.ID === 'FOTO-' + user; })[0];
    return r && r.Data && r.Data.img || '';
  }
  function initials(n) { return String(n || '?').trim().charAt(0).toUpperCase() || '?'; }
  function avHTML(user, cls) {
    var img = avImg(user);
    return '<span class="av ' + (cls || '') + '">' + (img ? '<img src="' + esc(img) + '" alt="">' : '<b>' + esc(initials(user)) + '</b>') + '</span>';
  }
  function currentAv() { return S.owner && S.owner !== 'Semua' ? S.owner : S.cfg.user; }
  X.hooks.avatar = function () {
    return '<button class="avbtn" data-act="av-open" aria-label="' + esc(t('av.t')) + '">' + avHTML(currentAv()) + '</button>';
  };
  X.hooks.avatarMe = function () {
    var us = S.M && S.M.users || [], all = (!S.owner || S.owner === 'Semua') && us.length > 1, who = all ? us.slice(0, 2) : [currentAv()];
    return '<button class="avbtn' + (all ? ' duo' : '') + '" data-act="av-open" aria-label="' + esc(t('av.t')) + '">' + who.map(function (u) { return avHTML(u, 'brand'); }).join('') + '</button>';
  };
  function avSheet() {
    var me = S.cfg.user, users = (S.M.users && S.M.users.length ? S.M.users : [me]);
    var h = '<div class="scrim" data-act="av-close"></div><div class="sheet"><div class="sheet-h"><div class="sh-t">' + t('av.t') + '</div><button class="x" data-act="av-close" aria-label="' + t('close') + '">' + X.ICON.x + '</button></div><div class="sheet-b">';
    h += avBlock();
    users.filter(function (u) { return u !== me; }).forEach(function (u) {
      h += '<div class="card avrow">' + avHTML(u, 'lg') + '<div class="grow"><div class="t">' + esc(u) + '</div><div class="s">' + esc(t('av.other', u)) + '</div></div></div>';
    });
    h += '<div class="note2">' + t('av.note') + '</div></div></div>';
    $('#overlay').innerHTML = h;
  }
  function avBlock() {
    var me = S.cfg.user, has = !!avImg(me);
    return '<div class="card avrow">' + avHTML(me, 'lg') + '<div class="grow"><div class="t">' + esc(me) + '</div><div class="s">' + t('av.mine') + '</div>' +
      '<div class="btnrow2" style="margin-top:10px"><button class="btn sm" data-act="av-pick">' + t('av.change') + '</button>' + (has ? '<button class="btn sm danger" data-act="av-del">' + t('av.del') + '</button>' : '') + '</div></div>' +
      '<input type="file" id="file-av" accept="image/*" hidden data-file="av"></div>';
  }
  function avSave(img) {
    var me = S.cfg.user, id = 'FOTO-' + me, p = img ? X.rc.save('foto', {img: img}, id) : X.rc.remove(id);
    return p.then(function () {
      X.toast(t(img ? 'av.saved' : 'av.deleted'));
      if ($('#overlay .avrow')) avSheet();
      X.render();
    }).catch(function (e) {
      var m = String(e && e.message || e);
      X.toast(/tidak dikenal|unknown/i.test(m) ? t('av.srv') : t('av.fail'));
    });
  }

  // ---------------------------------------------------------------- foto kartu utama
  function cpPref() { return Object.assign({blur: 1, dim: 1, pos: 'center'}, S.pref.card || {}); }
  function loadCard() {
    return X.DB.get('cardimg').then(function (b) {
      if (card.url) { URL.revokeObjectURL(card.url); card.url = null; }
      if (b && (b instanceof Blob)) card.url = URL.createObjectURL(b);
      card.loaded = true;
    });
  }
  function loadCard2() {
    return X.DB.get('cardimg2').then(function (b) {
      if (card2.url) { URL.revokeObjectURL(card2.url); card2.url = null; }
      if (b && (b instanceof Blob)) card2.url = URL.createObjectURL(b);
    });
  }
  function bgOf(url) {
    var p = cpPref(), pos = {top: '0%', center: '50%', bottom: '100%'}[p.pos] || '50%';
    return {cls: 'bl' + p.blur + ' dm' + p.dim, html: '<div class="hbg" style="background-image:url(\'' + url + '\');background-position:50% ' + pos + '"></div><div class="hdim"></div>'};
  }
  function wfMode() { var m = S.pref.wfPhoto; return m === 'sama' || m === 'tanpa' ? m : 'beda'; }
  /** Latar kartu Waterfall: foto sendiri (beda), foto yang sama dengan Net Worth (sama), atau tanpa foto. */
  X.hooks.heroBg2 = function () {
    var m = wfMode(); if (m === 'tanpa') return null;
    var url = m === 'sama' ? card.url : (card2.url || card.url);
    return url ? bgOf(url) : null;
  };
  X.hooks.heroBg = function () {
    if (!card.url) return null;
    var p = cpPref(), pos = {top: '0%', center: '50%', bottom: '100%'}[p.pos] || '50%';
    return {cls: 'bl' + p.blur + ' dm' + p.dim, html: '<div class="hbg" style="background-image:url(\'' + card.url + '\');background-position:50% ' + pos + '"></div><div class="hdim"></div>'};
  };
  function seg(act, cur, vals, pre) {
    return '<div class="seg">' + vals.map(function (v) { return '<button class="' + (String(cur) === String(v) ? 'on' : '') + '" data-act="' + act + '" data-v="' + v + '">' + t(pre + v) + '</button>'; }).join('') + '</div>';
  }
  X.hooks.settingsTop = function () {
    var p = cpPref(), h = '<h2>' + t('set.photos') + '</h2>' + avBlock();
    h += '<div class="card"><div class="t" style="font-weight:600">' + t('cp.t') + '</div><div class="muted sm">' + t('cp.s') + '</div>';
    if (card.url) {
      var bg = X.hooks.heroBg();
      h += '<div class="card hero photo cprev ' + bg.cls + '">' + bg.html + '<div class="lbl">' + t('home.net') + '</div><div class="big">Rp 123.456.789</div></div>';
      h += '<div class="lbl3">' + t('cp.blur') + '</div>' + seg('cp-blur', p.blur, [0, 1, 2], 'cp.blur.');
      h += '<div class="lbl3">' + t('cp.dim') + '</div>' + seg('cp-dim', p.dim, [0, 1, 2], 'cp.dim.');
      h += '<div class="lbl3">' + t('cp.pos') + '</div>' + seg('cp-pos', p.pos, ['top', 'center', 'bottom'], 'cp.pos.');
    }
    h += '<div class="btnrow2" style="margin-top:12px"><button class="btn sm" data-act="cp-pick">' + t(card.url ? 'cp.change' : 'cp.pick') + '</button>' + (card.url ? '<button class="btn sm danger" data-act="cp-del">' + t('cp.del') + '</button>' : '') + '</div>' +
      '<input type="file" id="file-cp" accept="image/*" hidden data-file="cp"></div>';
    var wm = wfMode();
    h += '<div class="card"><div class="t" style="font-weight:600">' + t('cp2.t') + '</div><div class="muted sm">' + t('cp2.s') + '</div>' +
      '<div class="seg" style="margin-top:8px">' + ['beda', 'sama', 'tanpa'].map(function (v) { return '<button class="' + (wm === v ? 'on' : '') + '" data-act="wf-photo" data-v="' + v + '">' + t('cp2.m.' + v) + '</button>'; }).join('') + '</div>';
    if (wm === 'beda') {
      var bg2 = X.hooks.heroBg2();
      if (bg2) h += '<div class="card hero photo cprev ' + bg2.cls + '" style="margin-top:10px">' + bg2.html + '<div class="lbl">' + t('dk.wf.t', new Date().getFullYear()) + '</div></div>';
      h += '<div class="btnrow2" style="margin-top:12px"><button class="btn sm" data-act="cp2-pick">' + t(card2.url ? 'cp.change' : 'cp.pick') + '</button>' + (card2.url ? '<button class="btn sm danger" data-act="cp2-del">' + t('cp.del') + '</button>' : '') + '</div>' +
        '<input type="file" id="file-cp2" accept="image/*" hidden data-file="cp2">';
      if (!card2.url && card.url) h += '<div class="muted sm" style="margin-top:8px">' + t('cp2.fallback') + '</div>';
    }
    return h + '</div>';
  };
  function setCp(k, v) { var p = cpPref(); p[k] = v; S.pref.card = p; X.savePref(); X.render(); }

  // ---------------------------------------------------------------- aksi
  Object.assign(X.A, {
    'av-open': function () { avSheet(); },
    'av-close': function () { $('#overlay').innerHTML = ''; },
    'av-pick': function () { var i = $('#file-av'); if (i) i.click(); },
    'av-del': function () { avSave(''); },
    'cp-pick': function () { var i = $('#file-cp'); if (i) i.click(); },
    'cp2-pick': function () { var i = $('#file-cp2'); if (i) i.click(); },
    'cp2-del': function () { X.DB.set('cardimg2', null).then(loadCard2).then(function () { X.toast(t('cp.deleted')); X.render(); }); },
    'wf-photo': function (el) { S.pref.wfPhoto = el.dataset.v; X.savePref(); X.render(); },
    'cp-del': function () { X.DB.set('cardimg', null).then(loadCard).then(function () { X.toast(t('cp.deleted')); X.render(); }); },
    'cp-blur': function (el) { setCp('blur', +el.dataset.v); },
    'cp-dim': function (el) { setCp('dim', +el.dataset.v); },
    'cp-pos': function (el) { setCp('pos', el.dataset.v); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target; if (!el.dataset || !el.dataset.file) return;
    var f = el.files && el.files[0]; if (!f) return;
    if (el.dataset.file === 'av') avatarData(f).then(avSave).catch(function () { X.toast(t('cp.fail')); });
    else if (el.dataset.file === 'cp2') cardBlob(f).then(function (b) { return X.DB.set('cardimg2', b); }).then(loadCard2).then(function () { X.toast(t('cp.saved')); X.render(); }).catch(function () { X.toast(t('cp.fail')); });
    else cardBlob(f).then(function (b) { return X.DB.set('cardimg', b); }).then(loadCard).then(function () { X.toast(t('cp.saved')); X.render(); }).catch(function () { X.toast(t('cp.fail')); });
    el.value = '';
  });
  var start0 = X.start;
  X.start = function () {
    start0();
    try { Promise.all([loadCard(), loadCard2()]).then(function () { if ((card.url || card2.url) && S.cfg && S.master) X.render(); }).catch(function () {}); } catch (e) {}
  };
  X.foto = {avImg: avImg, avHTML: avHTML, avatarData: avatarData, loadCard: loadCard, loadCard2: loadCard2};
})();
