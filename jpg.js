/* Do it v2.0 - membuat gambar JPG (laporan, daftar utang-piutang, dst.) dengan canvas, lalu membagikannya lewat menu bagikan HP.
 * doc = {title, sub, blocks:[...], foot}. Blok: head, row, total, text, prog, bars, gap. */
(function () {
  'use strict';
  var W = 1080, PAD = 48, FONT = '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

  function colors() {
    var cs = getComputedStyle(document.documentElement);
    function g(n, d) { return (cs.getPropertyValue(n) || '').trim() || d; }
    return {bg: g('--bg', '#fbf3f4'), card: g('--card', '#ffffff'), ink: g('--ink', '#2a1218'), muted: g('--muted', '#7a5f66'), line: g('--line', '#f0dfe2'),
      accent: g('--accent', '#c0275f'), onAccent: g('--accent-ink', '#ffffff'), soft: g('--accent-soft', '#fbe1e8'), inn: g('--in', '#0b7a43'), out: g('--out', '#b9381f'), warn: g('--warn', '#9a5b00')};
  }
  function rr(x, px, py, w, h, r) {
    x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath();
  }

  function render(doc) {
    var K = colors(), cv = document.createElement('canvas'), x = cv.getContext('2d'), CW = W - PAD * 2, inner = CW - 56;
    function font(sz, wt) { return (wt || 400) + ' ' + sz + 'px ' + FONT; }
    function wrap(text, maxW, f) {
      x.font = f; var out = [], words = String(text == null ? '' : text).split(/\s+/), cur = '';
      words.forEach(function (w) {
        var tryS = cur ? cur + ' ' + w : w;
        if (x.measureText(tryS).width <= maxW || !cur) cur = tryS; else { out.push(cur); cur = w; }
      });
      if (cur) out.push(cur);
      // kata yang sangat panjang: potong
      return out.reduce(function (a, l) {
        while (x.measureText(l).width > maxW && l.length > 4) { var n = l.length; while (n > 1 && x.measureText(l.substr(0, n)).width > maxW) n--; a.push(l.substr(0, n)); l = l.substr(n); }
        a.push(l); return a;
      }, []);
    }
    var items = [], y = 0;
    function add(h, draw) { items.push({y: y, h: h, draw: draw}); y += h; }
    function colOf(c) { return c === 'in' ? K.inn : (c === 'out' ? K.out : (c === 'warn' ? K.warn : (c === 'muted' ? K.muted : K.ink))); }

    (doc.blocks || []).forEach(function (b) {
      if (b.k === 'gap') { add(b.h || 22, function () {}); return; }
      if (b.k === 'head') {
        add(78, function (oy) {
          x.fillStyle = K.soft; rr(x, 0, oy + 14, inner, 52, 14); x.fill();
          x.fillStyle = K.accent; x.font = font(28, 800); x.textBaseline = 'middle'; x.textAlign = 'left'; x.fillText(b.l, 20, oy + 40);
          if (b.r != null) { x.textAlign = 'right'; x.fillText(b.r, inner - 20, oy + 40); x.textAlign = 'left'; }
        });
        return;
      }
      if (b.k === 'text') {
        var tl = wrap(b.l, inner, font(26, 500));
        add(tl.length * 38 + 16, function (oy) { x.fillStyle = K.muted; x.font = font(26, 500); x.textBaseline = 'top'; x.textAlign = 'left'; tl.forEach(function (s, i) { x.fillText(s, 0, oy + 8 + i * 38); }); });
        return;
      }
      if (b.k === 'prog') {
        var pl = wrap(b.l, inner * 0.6, font(28, 700)), sl = b.s ? wrap(b.s, inner, font(23, 500)) : [];
        add(pl.length * 38 + sl.length * 30 + 52, function (oy) {
          x.textBaseline = 'top'; x.textAlign = 'left'; x.fillStyle = K.ink; x.font = font(28, 700); pl.forEach(function (s, i) { x.fillText(s, 0, oy + 6 + i * 38); });
          x.textAlign = 'right'; x.fillStyle = colOf(b.c); x.fillText(b.r || '', inner, oy + 6); x.textAlign = 'left';
          var by = oy + 6 + pl.length * 38 + 4, p = Math.max(0, Math.min(1, b.pct || 0));
          x.fillStyle = K.line; rr(x, 0, by, inner, 14, 7); x.fill();
          if (p > 0) { x.fillStyle = b.c === 'out' ? K.out : (b.c === 'warn' ? K.warn : K.inn); rr(x, 0, by, Math.max(14, inner * p), 14, 7); x.fill(); }
          x.fillStyle = K.muted; x.font = font(23, 500); sl.forEach(function (s, i) { x.fillText(s, 0, by + 24 + i * 30); });
        });
        return;
      }
      if (b.k === 'bars') {
        var H = 330;
        add(H + 92, function (oy) {
          var ser = b.series || [], mx = 1; ser.forEach(function (s) { mx = Math.max(mx, s.a || 0, s.b || 0); });
          var base = oy + H, gw = inner / Math.max(1, ser.length), bw = Math.min(34, gw / 3);
          x.strokeStyle = K.line; x.lineWidth = 2; x.beginPath(); x.moveTo(0, base); x.lineTo(inner, base); x.stroke();
          ser.forEach(function (s, i) {
            var cx = gw * i + gw / 2, ha = (s.a || 0) / mx * (H - 30), hb = (s.b || 0) / mx * (H - 30);
            x.fillStyle = K.inn; rr(x, cx - bw - 2, base - ha, bw, Math.max(2, ha), 6); x.fill();
            x.fillStyle = K.out; rr(x, cx + 2, base - hb, bw, Math.max(2, hb), 6); x.fill();
            x.fillStyle = K.muted; x.font = font(21, 600); x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText(s.l, cx, base + 10);
          });
          x.textAlign = 'left'; x.fillStyle = K.inn; rr(x, 0, base + 52, 18, 18, 5); x.fill(); x.fillStyle = K.ink; x.font = font(23, 600); x.fillText(b.la || '', 28, base + 50);
          var wa = x.measureText(b.la || '').width + 70; x.fillStyle = K.out; rr(x, wa, base + 52, 18, 18, 5); x.fill(); x.fillStyle = K.ink; x.fillText(b.lb || '', wa + 28, base + 50);
        });
        return;
      }
      // row / total
      var tot = b.k === 'total', sz = tot ? 30 : 28, wt = tot || b.b ? 800 : 500, ind = b.ind ? 28 : 0;
      var ll = wrap(b.l, inner * 0.62 - ind, font(sz, wt)), ss = b.s ? wrap(b.s, inner * 0.62 - ind, font(22, 500)) : [];
      var h = Math.max(ll.length * 38, 44) + ss.length * 29 + 18;
      add(h, function (oy) {
        if (tot) { x.strokeStyle = K.ink; x.lineWidth = 3; x.beginPath(); x.moveTo(0, oy + 2); x.lineTo(inner, oy + 2); x.stroke(); }
        else { x.strokeStyle = K.line; x.lineWidth = 2; x.beginPath(); x.moveTo(0, oy + h - 1); x.lineTo(inner, oy + h - 1); x.stroke(); }
        x.textBaseline = 'top'; x.textAlign = 'left'; x.fillStyle = K.ink; x.font = font(sz, wt);
        ll.forEach(function (s, i) { x.fillText(s, ind, oy + 10 + i * 38); });
        x.fillStyle = K.muted; x.font = font(22, 500); ss.forEach(function (s, i) { x.fillText(s, ind, oy + 10 + ll.length * 38 + i * 29); });
        if (b.r != null) { x.textAlign = 'right'; x.fillStyle = colOf(b.c); x.font = font(sz, tot || b.b ? 800 : 700); x.fillText(b.r, inner, oy + 10); x.textAlign = 'left'; }
      });
    });

    var headH = 210, footH = 96, total = headH + y + footH + 40;
    cv.width = W; cv.height = Math.max(total, 500);
    x = cv.getContext('2d');
    x.fillStyle = K.bg; x.fillRect(0, 0, W, cv.height);
    // pita judul
    x.fillStyle = K.accent; rr(x, PAD, 40, CW, 150, 28); x.fill();
    x.textBaseline = 'top'; x.textAlign = 'left'; x.fillStyle = K.onAccent;
    x.font = font(44, 800); var tl2 = wrap(doc.title || 'Do it', CW - 70, font(44, 800)); x.fillText(tl2[0] || '', PAD + 34, 62);
    x.globalAlpha = 0.85; x.font = font(26, 500); if (doc.sub) x.fillText(wrap(doc.sub, CW - 70, font(26, 500))[0] || '', PAD + 34, 122); x.globalAlpha = 1;
    // kartu isi
    var cy = headH + 10;
    x.fillStyle = K.card; rr(x, PAD, cy, CW, y + 30, 28); x.fill();
    x.strokeStyle = K.line; x.lineWidth = 2; rr(x, PAD, cy, CW, y + 30, 28); x.stroke();
    x.save(); x.translate(PAD + 28, cy + 15);
    items.forEach(function (it) { x.save(); it.draw(it.y); x.restore(); });
    x.restore();
    x.fillStyle = K.muted; x.font = font(22, 600); x.textAlign = 'center'; x.textBaseline = 'top';
    x.fillText(doc.foot || '', W / 2, cy + y + 62);
    return cv;
  }

  function toBlob(cv) { return new Promise(function (res) { cv.toBlob(function (b) { res(b); }, 'image/jpeg', 0.92); }); }
  function make(doc) {
    var fl = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('500 26px "Plus Jakarta Sans"'), document.fonts.load('800 26px "Plus Jakarta Sans"')]).catch(function () {}) : Promise.resolve();
    return Promise.race([fl, new Promise(function (r) { setTimeout(r, 1500); })]).then(function () { return toBlob(render(doc)); });
  }
  function share(doc, name) {
    return make(doc).then(function (blob) {
      var file = null; try { file = new File([blob], name + '.jpg', {type: 'image/jpeg'}); } catch (e) {}
      window.__lastJpg = {name: name + '.jpg', size: blob.size};
      if (file && navigator.canShare && navigator.canShare({files: [file]})) {
        return navigator.share({files: [file], title: doc.title}).then(function () { return 'shared'; }, function (e) { if (e && e.name === 'AbortError') return 'aborted'; return download(blob, name); });
      }
      return download(blob, name);
    });
  }
  function download(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.jpg'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    return 'downloaded';
  }
  window.DoItJpg = {make: make, share: share};
})();
