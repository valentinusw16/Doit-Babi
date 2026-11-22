if (window.DoIt) (window.DoIt.ver = window.DoIt.ver || {})['chart'] = '3.2.1';
/* Do it v3.2 - grafik gaya saham untuk layar lebar (>= 1100px): pemilih rentang, crosshair + tooltip,
   zoom (Ctrl + gulir atau tombol +/-), geser (seret), panel angka. HP tetap memakai grafik sederhana. */
(function () {
  'use strict';
  var X = window.DoIt;
  if (!X || !X.S || !X.esc || !X.t || !(function (v) { v = String(v || '0').split('.').map(Number); return v[0] >= 3; })(X.VERSION)) return;
  var S = X.S, esc = X.esc, I = window.I18N;
  if (I && I.add) {
    I.add('id', {'st.all': 'Semua', 'st.ytd': 'YTD', 'st.m': '{0}B', 'st.hint': 'Seret untuk geser · Ctrl + gulir untuk zoom', 'st.hi': 'Tertinggi', 'st.lo': 'Terendah', 'st.chg': 'Perubahan', 'st.avg': 'Rata-rata', 'st.zin': 'Perbesar', 'st.zout': 'Perkecil', 'st.rng': 'Rentang grafik'});
    I.add('en', {'st.all': 'All', 'st.ytd': 'YTD', 'st.m': '{0}M', 'st.hint': 'Drag to pan · Ctrl + scroll to zoom', 'st.hi': 'High', 'st.lo': 'Low', 'st.chg': 'Change', 'st.avg': 'Average', 'st.zin': 'Zoom in', 'st.zout': 'Zoom out', 'st.rng': 'Chart range'});
  }
  var t = X.t;
  var REG = {}, ST = {}, W = 760, H = 270, PL = 52, PR = 14, PT = 12, PB = 26;
  function wide() { return window.innerWidth >= 1100; }
  function fmtFull(n) { return (n < 0 ? '−' : '') + 'Rp ' + X.C.fmtNum(Math.round(Math.abs(n))); }
  function nice(mx, mn) {
    var span = (mx - mn) || 1, raw = span / 4, p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), f = raw / p, st = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
    var lo = Math.floor(mn / st) * st, hi = Math.ceil(mx / st) * st; if (hi === lo) hi = lo + st;
    var ticks = []; for (var v = lo; v <= hi + st / 2; v += st) ticks.push(v);
    return {lo: lo, hi: hi, ticks: ticks};
  }
  function win(c, s) {
    var n = c.labels.length, a = s.a, b = s.b; if (a == null) { a = Math.max(0, n - Math.min(n, c.def || 12)); b = n; }
    a = Math.max(0, Math.min(a, n - 2)); b = Math.max(a + 2, Math.min(b, n)); if (n < 2) { a = 0; b = n; }
    return [a, b];
  }
  function rangeMonths(c, m) { var n = c.labels.length; return [Math.max(0, n - m), n]; }
  function ytdRange(c) {
    if (!c.keys) return null; var n = c.labels.length, y = c.keys[n - 1].substr(0, 4), a = 0;
    for (var i = 0; i < n; i++) if (c.keys[i].substr(0, 4) === y) { a = i; break; }
    a = Math.max(0, a - 1); return [a, n];
  }
  function pills(c, id) {
    var n = c.labels.length, h = '<div class="stk-r" role="group" aria-label="' + esc(t('st.rng')) + '">';
    [3, 6, 12, 24, 36].forEach(function (m) { if (m < n) h += '<button data-act="st-r" data-id="' + id + '" data-m="' + m + '">' + t('st.m', m) + '</button>'; });
    if (c.keys && ytdRange(c) && n > 3) h += '<button data-act="st-r" data-id="' + id + '" data-m="ytd">' + t('st.ytd') + '</button>';
    h += '<button data-act="st-r" data-id="' + id + '" data-m="all">' + t('st.all') + '</button></div>';
    return h;
  }
  function stats(c, a, b) {
    var s0 = c.series[0], v = s0.v.slice(a, b), first = v[0], last = v[v.length - 1], hi = Math.max.apply(null, v), lo = Math.min.apply(null, v), sum = 0;
    v.forEach(function (x) { sum += x; });
    return {first: first, last: last, hi: hi, lo: lo, avg: sum / v.length};
  }
  function chgHTML(d, base) {
    var p = base ? d / Math.abs(base) * 100 : null;
    return '<span class="' + (d >= 0 ? 'up' : 'dn') + '">' + (d >= 0 ? '▲ +' : '▼ −') + esc(X.shortRp(Math.abs(d))) + (p == null || !isFinite(p) ? '' : ' (' + (d >= 0 ? '+' : '−') + Math.abs(p).toFixed(1).replace('.', S.pref.lang === 'en' ? '.' : ',') + '%)') + '</span>';
  }
  function panel(c, a, b) {
    var st = stats(c, a, b), s0 = c.series[0], multi = c.series.length > 1, h = '';
    if (multi) {
      h = c.series.map(function (s) { var v = s.v.slice(a, b), sum = 0; v.forEach(function (x) { sum += x; }); return '<div><small><i style="background:' + s.c + '"></i>' + esc(s.n) + '</small><b>' + esc(X.shortRp(sum / v.length)) + '</b><em>' + esc(t('st.avg')) + '</em></div>'; }).join('');
    } else {
      h = '<div><small>' + esc(c.labels[b - 1]) + '</small><b>' + esc((c.fmt || fmtFull)(st.last)) + '</b>' + chgHTML(st.last - st.first, st.first) + '</div>' +
        '<div><small>' + esc(t('st.hi')) + '</small><b>' + esc(X.shortRp(st.hi)) + '</b></div><div><small>' + esc(t('st.lo')) + '</small><b>' + esc(X.shortRp(st.lo)) + '</b></div><div><small>' + esc(t('st.avg')) + '</small><b>' + esc(X.shortRp(st.avg)) + '</b></div>';
    }
    return h;
  }
  function geom(c, a, b) {
    var lo = Infinity, hi = -Infinity, hasBar = false;
    c.series.forEach(function (s) { if (s.k === 'bar') hasBar = true; for (var i = a; i < b; i++) { var v = s.v[i]; if (v < lo) lo = v; if (v > hi) hi = v; } });
    if (hasBar || c.zero) lo = Math.min(lo, 0);
    var sp = hi - lo || Math.abs(hi) * .1 || 1; if (!hasBar && !c.zero) { lo -= sp * .08; hi += sp * .08; } else hi += sp * .05;
    var nz = nice(hi, lo), n = b - a, iw = W - PL - PR, ih = H - PT - PB, step = iw / n;
    return {nz: nz, n: n, iw: iw, ih: ih, step: step, hasBar: hasBar,
      x: function (i) { return PL + (hasBar ? (i - a + .5) * step : (n === 1 ? iw / 2 : (i - a) / (n - 1) * iw)); },
      y: function (v) { return PT + (1 - (v - nz.lo) / (nz.hi - nz.lo)) * ih; }};
  }
  function svgHTML(c, id, a, b) {
    var g = geom(c, a, b), h = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="stk-svg" data-id="' + id + '" role="img" aria-label="' + esc(c.title || '') + '">';
    g.nz.ticks.forEach(function (v) { var y = g.y(v).toFixed(1); h += '<line x1="' + PL + '" x2="' + (W - PR) + '" y1="' + y + '" y2="' + y + '" class="gl' + (v === 0 ? ' z' : '') + '"/><text x="' + (PL - 8) + '" y="' + (+y + 3.5) + '" class="yl" text-anchor="end">' + esc(X.shortRp(v)) + '</text>'; });
    var every = Math.max(1, Math.ceil(g.n / Math.floor(g.iw / 62)));
    for (var i = a; i < b; i++) if ((b - 1 - i) % every === 0) h += '<text x="' + g.x(i).toFixed(1) + '" y="' + (H - 8) + '" class="xl" text-anchor="middle">' + esc(c.labels[i]) + '</text>';
    var nb = c.series.filter(function (s) { return s.k === 'bar'; }).length, bi = 0;
    c.series.forEach(function (s, si) {
      if (s.k === 'bar') {
        var bw = Math.min(40, g.step * (nb > 1 ? .7 : .6) / nb), y0 = g.y(0);
        for (var j = a; j < b; j++) { var yy = g.y(s.v[j]), xx = g.x(j) - (nb * bw) / 2 + bi * bw; h += '<rect class="sbr" x="' + xx.toFixed(1) + '" y="' + Math.min(yy, y0).toFixed(1) + '" width="' + (bw - 1).toFixed(1) + '" height="' + Math.max(1, Math.abs(y0 - yy)).toFixed(1) + '" rx="2" fill="' + s.c + '"/>'; }
        bi++;
      } else {
        var d = ''; for (var k = a; k < b; k++) d += (k === a ? 'M' : 'L') + g.x(k).toFixed(1) + ' ' + g.y(s.v[k]).toFixed(1);
        if (s.k === 'area' || (c.series.length === 1)) h += '<path d="' + d + 'L' + g.x(b - 1).toFixed(1) + ' ' + g.y(g.nz.lo).toFixed(1) + 'L' + g.x(a).toFixed(1) + ' ' + g.y(g.nz.lo).toFixed(1) + 'Z" fill="' + s.c + '" opacity=".13"/>';
        h += '<path d="' + d + '" fill="none" stroke="' + s.c + '" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>';
        if (g.n <= 24) for (var m = a; m < b; m++) h += '<circle cx="' + g.x(m).toFixed(1) + '" cy="' + g.y(s.v[m]).toFixed(1) + '" r="2.4" fill="var(--card)" stroke="' + s.c + '" stroke-width="1.5"/>';
      }
    });
    h += '<g class="xh" style="display:none"><line y1="' + PT + '" y2="' + (H - PB) + '"/>' + c.series.map(function (s) { return '<circle r="4.5" fill="' + s.c + '" stroke="var(--card)" stroke-width="2"/>'; }).join('') + '</g>';
    return h + '<rect class="hit" x="' + PL + '" y="' + PT + '" width="' + g.iw + '" height="' + g.ih + '" fill="transparent"/></svg>';
  }
  function draw(id) {
    var el = document.querySelector('.stk-c[data-sid="' + id + '"]'), c = REG[id]; if (!el || !c) return;
    var s = ST[id] || (ST[id] = {}), w = win(c, s), a = w[0], b = w[1];
    s.a = a; s.b = b;
    el.querySelector('.stk-p').innerHTML = panel(c, a, b);
    el.querySelector('.stk-w').innerHTML = svgHTML(c, id, a, b) + '<div class="stk-tip" style="display:none"></div>';
    var n = c.labels.length, act = null;
    if (a === 0 && b === n) act = 'all'; else {
      for (var m = 3; m <= 36; m++) if (b === n && b - a === m) { act = String(m); break; }
      var y = ytdRange(c); if (y && y[0] === a && y[1] === b) act = 'ytd';
    }
    [].forEach.call(el.querySelectorAll('.stk-r button'), function (btn) { btn.classList.toggle('on', btn.dataset.m === act); });
  }
  X.stock = function (c) {
    if (!c || !c.labels || c.labels.length < 2) return '';
    var id = c.id || ('s' + Math.random().toString(36).substr(2, 6)); c.id = id; REG[id] = c;
    var s = ST[id] || (ST[id] = {}); if (s.n !== c.labels.length) { s.a = null; s.b = null; s.n = c.labels.length; }
    var w = win(c, s), a = w[0], b = w[1]; s.a = a; s.b = b;
    var n = c.labels.length, act = (a === 0 && b === n) ? 'all' : (b === n ? String(b - a) : '');
    var pl = pills(c, id).replace('data-m="' + act + '"', 'data-m="' + act + '" class="on"');
    return '<div class="stk-c" data-sid="' + id + '"><div class="stk-top"><div class="stk-p">' + panel(c, a, b) + '</div><div class="stk-ctl">' + pl +
      '<span class="stk-z"><button data-act="st-z" data-id="' + id + '" data-d="1" aria-label="' + esc(t('st.zin')) + '">+</button><button data-act="st-z" data-id="' + id + '" data-d="-1" aria-label="' + esc(t('st.zout')) + '">−</button></span></div></div>' +
      '<div class="stk-w">' + svgHTML(c, id, a, b) + '<div class="stk-tip" style="display:none"></div></div>' +
      (c.series.length > 1 ? '<div class="legend2">' + c.series.map(function (s) { return '<span><i style="background:' + s.c + '"></i>' + esc(s.n) + '</span>'; }).join('') + '</div>' : '') +
      '<div class="stk-h">' + esc(t('st.hint')) + '</div></div>';
  };
  X.stockOn = wide;

  // ---------------------------------------------------------------- aksi
  function zoom(id, dir, cx) {
    var c = REG[id], s = ST[id]; if (!c || !s) return; var n = c.labels.length, len = s.b - s.a, nl = dir > 0 ? Math.max(4, Math.round(len * .7)) : Math.min(n, Math.round(len / .7) + 1);
    if (nl === len) return; var f = cx == null ? 1 : cx; s.a = Math.round(s.a + (len - nl) * f); s.b = s.a + nl;
    if (s.b > n) { s.b = n; s.a = n - nl; } if (s.a < 0) { s.a = 0; s.b = nl; } draw(id);
  }
  X.A['st-r'] = function (el) {
    var id = el.dataset.id, c = REG[id], s = ST[id] || (ST[id] = {}), m = el.dataset.m, r; if (!c) return;
    r = m === 'all' ? [0, c.labels.length] : (m === 'ytd' ? ytdRange(c) : rangeMonths(c, +m)); s.a = r[0]; s.b = r[1]; draw(id);
  };
  X.A['st-z'] = function (el) { zoom(el.dataset.id, +el.dataset.d, 1); };

  function pos(svg, e) {
    var r = svg.getBoundingClientRect(), id = svg.dataset.id, c = REG[id], s = ST[id]; if (!c || !s || !r.width) return null;
    var vx = (e.clientX - r.left) / r.width * W, g = geom(c, s.a, s.b), i;
    if (g.hasBar) i = Math.floor((vx - PL) / g.step) + s.a; else i = Math.round((vx - PL) / g.iw * (g.n - 1)) + s.a;
    i = Math.max(s.a, Math.min(s.b - 1, i)); return {i: i, g: g, r: r, vx: vx, c: c, s: s};
  }
  function hover(svg, e) {
    var p = pos(svg, e); if (!p) return; var c = p.c, g = p.g, i = p.i, xh = svg.querySelector('.xh'), tip = svg.parentNode.querySelector('.stk-tip'), sc = p.r.width / W;
    xh.style.display = ''; var gx = g.x(i); xh.querySelector('line').setAttribute('x1', gx); xh.querySelector('line').setAttribute('x2', gx);
    var cs = xh.querySelectorAll('circle'); c.series.forEach(function (s, k) { cs[k].setAttribute('cx', gx); cs[k].setAttribute('cy', g.y(s.v[i])); cs[k].style.display = s.k === 'bar' ? 'none' : ''; });
    var f = c.fmt || fmtFull, rows = c.series.map(function (s) {
      var prev = i > 0 ? s.v[i - 1] : null, d = prev == null ? '' : ' <em class="' + (s.v[i] - prev >= 0 ? 'up' : 'dn') + '">' + (s.v[i] - prev >= 0 ? '+' : '−') + esc(X.shortRp(Math.abs(s.v[i] - prev))) + '</em>';
      return '<div><i style="background:' + s.c + '"></i><span>' + esc(s.n) + '</span><b>' + esc(f(s.v[i])) + '</b>' + d + '</div>';
    }).join('');
    tip.innerHTML = '<strong>' + esc(c.labels[i]) + '</strong>' + rows; tip.style.display = '';
    var tw = tip.offsetWidth, left = gx * sc + 14; if (left + tw > p.r.width - 4) left = gx * sc - tw - 14; tip.style.left = Math.max(2, left) + 'px'; tip.style.top = '10px';
    var pn = svg.closest('.stk-c').querySelector('.stk-p'); if (c.series.length === 1) {
      var st = stats(c, p.s.a, p.s.b), v = c.series[0].v[i]; pn.firstChild.innerHTML = '<small>' + esc(c.labels[i]) + '</small><b>' + esc(f(v)) + '</b>' + chgHTML(v - st.first, st.first);
    }
  }
  function leave(svg) {
    var xh = svg.querySelector('.xh'), tip = svg.parentNode.querySelector('.stk-tip'); if (xh) xh.style.display = 'none'; if (tip) tip.style.display = 'none';
    var id = svg.dataset.id, c = REG[id], s = ST[id], pn = svg.closest('.stk-c'); if (c && s && pn) pn.querySelector('.stk-p').innerHTML = panel(c, s.a, s.b);
  }
  var drag = null;
  document.addEventListener('pointerdown', function (e) {
    var svg = e.target.closest && e.target.closest('.stk-svg'); if (!svg || e.button) return; var p = pos(svg, e); if (!p) return;
    drag = {svg: svg, x: e.clientX, a: p.s.a, b: p.s.b, id: svg.dataset.id, moved: false}; try { svg.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ }
  });
  document.addEventListener('pointermove', function (e) {
    if (drag) {
      var c = REG[drag.id], s = ST[drag.id], r = drag.svg.getBoundingClientRect(), n = c.labels.length, len = drag.b - drag.a, per = r.width * (W - PL - PR) / W / len, di = Math.round((drag.x - e.clientX) / per);
      if (Math.abs(e.clientX - drag.x) > 4) drag.moved = true;
      if (drag.moved) { var a = Math.max(0, Math.min(n - len, drag.a + di)); if (a !== s.a) { s.a = a; s.b = a + len; var svg2 = drag.svg; draw(drag.id); drag.svg = document.querySelector('.stk-c[data-sid="' + drag.id + '"] .stk-svg'); try { drag.svg.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ } } }
      if (drag.svg) hover(drag.svg, e); return;
    }
    var svg = e.target.closest && e.target.closest('.stk-svg'); if (svg) hover(svg, e);
  });
  document.addEventListener('pointerup', function () { drag = null; });
  document.addEventListener('pointerout', function (e) { var svg = e.target.closest && e.target.closest('.stk-svg'); if (svg && !drag && !(e.relatedTarget && svg.contains(e.relatedTarget))) leave(svg); });
  document.addEventListener('wheel', function (e) {
    var svg = e.target.closest && e.target.closest('.stk-svg'); if (!svg || !(e.ctrlKey || e.metaKey)) return; e.preventDefault();
    var p = pos(svg, e); zoom(svg.dataset.id, e.deltaY < 0 ? 1 : -1, p ? (p.i - p.s.a) / Math.max(1, p.s.b - p.s.a - 1) : .5);
  }, {passive: false});

  // ---------------------------------------------------------------- sambungan ke grafik lama
  var spark0 = X.sparkline;
  X.sparkline = function (pts, opt) {
    if (!wide() || !pts || pts.length < 3 || !pts[0] || pts[0].bulan == null) return spark0 ? spark0(pts) : '';
    return X.stock({id: (opt && opt.id) || 'sp-' + pts.length + '-' + Math.round(pts[pts.length - 1].saldo) + '-' + pts[0].bulan, title: opt && opt.title, def: 12, zero: false,
      labels: pts.map(function (p) { return X.C.namaBulan(+p.bulan.substr(5, 2), true) + ' ' + p.bulan.substr(2, 2); }), keys: pts.map(function (p) { return p.bulan; }),
      series: [{n: (opt && opt.name) || t('an.networth'), c: 'var(--accent)', k: 'area', v: pts.map(function (p) { return p.saldo; })}]});
  };
})();
