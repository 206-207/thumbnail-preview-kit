(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var cv = $('#cv'), ctx = cv.getContext('2d');
  var img = null, placement = 'feed', theme = 'light';

  var MAX_BYTES = 10 * 1024 * 1024;
  var OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  var C = {
    light: { bg: '#ffffff', text: '#0f0f0f', sub: '#606060', fill: '#e3e3e3', line: '#d9d9d9', badge: 'rgba(0,0,0,0.80)', badgeFg: '#ffffff' },
    dark:  { bg: '#0f0f0f', text: '#f1f1f1', sub: '#aaaaaa', fill: '#272727', line: '#383838', badge: 'rgba(0,0,0,0.80)', badgeFg: '#ffffff' }
  };
  var P = {
    feed: { w: 880, h: 460 }, search: { w: 880, h: 460 }, watch: { w: 880, h: 470 },
    shorts: { w: 380, h: 660 }, mobile: { w: 400, h: 620 }, sidebar: { w: 420, h: 580 }
  };

  var S = { title: '', channel: '', views: '', duration: '', age: '' };

  function T() { return C[theme]; }
  function msg(s, isErr) { var m = $('#msg'); m.textContent = s || ''; m.className = 'msg' + (isErr ? ' err' : ''); }

  function rr(x, y, w, h, r) {
    r = Math.min(r || 0, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function fillRR(x, y, w, h, r, c) { ctx.fillStyle = c; rr(x, y, w, h, r); ctx.fill(); }

  function wrap(str, maxW, maxLines) {
    var words = (str || '').split(/\s+/), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var test = cur ? cur + ' ' + words[i] : words[i];
      if (cur && ctx.measureText(test).width > maxW) { lines.push(cur); cur = words[i]; if (lines.length === maxLines) break; }
      else cur = test;
    }
    if (lines.length < maxLines && cur) lines.push(cur);
    return lines.slice(0, maxLines);
  }
  function drawLines(lines, x, y, lh) {
    for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], x, y + i * lh);
    return y + lines.length * lh;
  }

  function cover(im, x, y, w, h, r) {
    ctx.save(); rr(x, y, w, h, r || 0); ctx.clip();
    var s = Math.max(w / im.width, h / im.height), dw = im.width * s, dh = im.height * s;
    ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    ctx.restore();
  }

  function badge(x, y, w, h) {
    if (!S.duration) return;
    ctx.font = '11px Arial, Helvetica, sans-serif';
    var tw = ctx.measureText(S.duration).width + 10;
    fillRR(x + w - tw - 4, y + h - 19, tw, 15, 3, T().badge);
    ctx.fillStyle = T().badgeFg; ctx.textBaseline = 'middle';
    ctx.fillText(S.duration, x + w - tw + 1, y + h - 11.5);
    ctx.textBaseline = 'alphabetic';
  }

  function realThumb(x, y, w, h, r) {
    if (img) { cover(img, x, y, w, h, r); }
    else { fillRR(x, y, w, h, r, T().fill); }
    badge(x, y, w, h);
  }
  function fillerThumb(x, y, w, h, r) {
    fillRR(x, y, w, h, r, T().fill);
    ctx.fillStyle = T().sub; ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.moveTo(x + w / 2 - 7, y + h / 2 - 10);
    ctx.lineTo(x + w / 2 + 9, y + h / 2); ctx.lineTo(x + w / 2 - 7, y + h / 2 + 10); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function metaLine() {
    var bits = [S.channel, S.views, S.age].filter(function (v) { return v; });
    return bits.join(' · ');
  }

  // ---------- placements ----------
  function drawFeed() {
    var pad = 18, gap = 14, n = 4;
    var cardW = (P.feed.w - pad * 2 - gap * (n - 1)) / n;
    var tw = cardW, th = Math.round(tw * 9 / 16);
    for (var i = 0; i < n; i++) {
      var x = pad + i * (cardW + gap), y = pad;
      if (i === 0) realThumb(x, y, tw, th, 8); else fillerThumb(x, y, tw, th, 8);
      if (i === 0) {
        ctx.font = 'bold 14px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().text;
        var ly = drawLines(wrap(S.title || 'Your video title', tw, 2), x, y + th + 20, 18);
        ctx.font = '12px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().sub;
        ctx.fillText(metaLine() || 'Channel · views · age', x, ly + 14);
      } else {
        fillRR(x, y + th + 10, tw * 0.92, 9, 4, T().line);
        fillRR(x, y + th + 25, tw * 0.6, 9, 4, T().line);
        fillRR(x, y + th + 40, tw * 0.45, 8, 4, T().line);
      }
    }
  }

  function drawSearch() {
    var pad = 18, tw = 240, th = 135, rowH = 142;
    for (var i = 0; i < 3; i++) {
      var y = pad + i * rowH;
      if (i === 0) realThumb(pad, y, tw, th, 8); else fillerThumb(pad, y, tw, th, 8);
      var tx = pad + tw + 18;
      if (i === 0) {
        ctx.font = 'bold 17px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().text;
        var ly = drawLines(wrap(S.title || 'Your video title', P.search.w - tx - pad, 2), tx, y + 26, 24);
        ctx.font = '12.5px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().sub;
        ctx.fillText(metaLine() || 'Channel · views · age', tx, ly + 16);
        fillRR(tx, ly + 28, 300, 8, 4, T().line);
        fillRR(tx, ly + 42, 240, 8, 4, T().line);
      } else {
        fillRR(tx, y + 8, 420, 11, 5, T().line);
        fillRR(tx, y + 28, 300, 11, 5, T().line);
        fillRR(tx, y + 50, 180, 9, 4, T().line);
        fillRR(tx, y + 68, 380, 8, 4, T().line);
        fillRR(tx, y + 82, 320, 8, 4, T().line);
      }
    }
  }

  function drawWatch() {
    var pad = 18, pw = 560, ph = 315;
    if (img) cover(img, pad, pad, pw, ph, 10); else fillRR(pad, pad, pw, ph, 10, T().fill);
    badge(pad, pad, pw, ph);
    ctx.font = 'bold 18px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().text;
    var ly = drawLines(wrap(S.title || 'Your video title', pw, 2), pad, pad + ph + 30, 25);
    ctx.font = '13px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().sub;
    ctx.fillText(metaLine() || 'Channel · views · age', pad, ly + 18);

    var sx = pad + pw + 26, sw = P.watch.w - sx - pad, sth = 68,stw = 120;
    ctx.font = 'bold 13px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().text;
    ctx.fillText('Up next', sx, pad + 12);
    for (var i = 0; i < 4; i++) {
      var y = pad + 24 + i * 96;
      if (i === 0) realThumb(sx, y, stw, sth, 6); else fillerThumb(sx, y, stw, sth, 6);
      var tx = sx + stw + 12, maxw = sw - stw - 12;
      if (i === 0) {
        ctx.font = 'bold 12.5px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().text;
        var ly2 = drawLines(wrap(S.title || 'Your video title', maxw, 2), tx, y + 16, 16);
        ctx.font = '11.5px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().sub;
        ctx.fillText(metaLine() || 'Channel · views', tx, ly2 + 12);
      } else {
        fillRR(tx, y + 8, maxw * 0.95, 9, 4, T().line);
        fillRR(tx, y + 22, maxw * 0.7, 9, 4, T().line);
        fillRR(tx, y + 38, maxw * 0.5, 8, 4, T().line);
      }
    }
  }

  function drawShorts() {
    var w = P.shorts.w, h = 600;
    if (img) cover(img, 0, 0, w, h, 0); else fillRR(0, 0, w, h, 0, T().fill);
    // 底部渐变遮罩
    var g = ctx.createLinearGradient(0, h - 150, 0, h);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = g; ctx.fillRect(0, h - 150, w, 150);
    ctx.font = 'bold 15px Arial, Helvetica, sans-serif'; ctx.fillStyle = '#ffffff';
    drawLines(wrap(S.title || 'Your video title', w - 90, 2), 14, h - 62, 20);
    ctx.font = '12.5px Arial, Helvetica, sans-serif'; ctx.fillStyle = '#e0e0e0';
    ctx.fillText(S.channel || 'Your Channel', 14, h - 26);
    // 右侧动作按钮
    for (var i = 0; i < 3; i++) {
      var cy = h - 210 + i * 56;
      ctx.beginPath(); ctx.arc(w - 34, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
    }
    ctx.font = '12px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().sub;
    ctx.fillText('Shorts', 14, 24);
  }

  function drawMobile() {
    var w = P.mobile.w, th = Math.round(w * 9 / 16);
    realThumb(0, 0, w, th, 0);
    ctx.font = 'bold 15px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().text;
    var ly = drawLines(wrap(S.title || 'Your video title', w - 24, 2), 12, th + 28, 20);
    ctx.font = '12px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().sub;
    ctx.fillText(metaLine() || 'Channel · views · age', 12, ly + 14);
    var y2 = th + 100;
    fillerThumb(0, y2, w, th, 0);
    fillRR(12, y2 + th + 16, w * 0.88, 10, 5, T().line);
    fillRR(12, y2 + th + 32, w * 0.55, 10, 5, T().line);
  }

  function drawSidebar() {
    var pad = 14, tw = 168, th = 94;
    ctx.font = 'bold 13px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().text;
    ctx.fillText('Up next', pad, pad + 12);
    for (var i = 0; i < 5; i++) {
      var y = pad + 24 + i * 104;
      if (i === 0) realThumb(pad, y, tw, th, 6); else fillerThumb(pad, y, tw, th, 6);
      var tx = pad + tw + 12, maxw = P.sidebar.w - tx - pad;
      if (i === 0) {
        ctx.font = 'bold 12.5px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().text;
        var ly = drawLines(wrap(S.title || 'Your video title', maxw, 2), tx, y + 16, 16);
        ctx.font = '11.5px Arial, Helvetica, sans-serif'; ctx.fillStyle = T().sub;
        ctx.fillText(metaLine() || 'Channel · views', tx, ly + 12);
      } else {
        fillRR(tx, y + 8, maxw * 0.95, 9, 4, T().line);
        fillRR(tx, y + 22, maxw * 0.72, 9, 4, T().line);
        fillRR(tx, y + 38, maxw * 0.5, 8, 4, T().line);
      }
    }
  }

  var DRAW = { feed: drawFeed, search: drawSearch, watch: drawWatch, shorts: drawShorts, mobile: drawMobile, sidebar: drawSidebar };

  function render() {
    var p = P[placement];
    cv.width = p.w; cv.height = p.h;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = T().bg; ctx.fillRect(0, 0, p.w, p.h);
    ctx.textBaseline = 'alphabetic';
    DRAW[placement]();
    $('#dim').textContent = p.w + ' × ' + p.h + ' px';
  }

  // ---------- input ----------
  function handleFile(f) {
    if (!f) return;
    if (OK_TYPES.indexOf(f.type) === -1) {
      msg('Rejected: ' + (f.type || 'unknown file type') + '. Allowed: JPG, PNG, WebP, GIF.', true); return;
    }
    if (f.size > MAX_BYTES) {
      msg('Rejected: ' + (f.size / 1048576).toFixed(1) + ' MB. The limit is 10 MB.', true); return;
    }
    // 用 data URL 而不是 blob URL：data URL 不会污染 canvas，file:// 下也能正常导出 PNG
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () { img = im; msg('Loaded ' + im.width + '×' + im.height + ' px'); render(); };
      im.onerror = function () { msg('That file could not be decoded as an image.', true); };
      im.src = fr.result;
    };
    fr.onerror = function () { msg('That file could not be read.', true); };
    fr.readAsDataURL(f);
  }

  var drop = $('#drop'), fileInput = $('#file');
  drop.addEventListener('click', function () { fileInput.click(); });
  drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
  fileInput.addEventListener('change', function () { handleFile(fileInput.files[0]); });
  ['dragenter', 'dragover'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.style.borderColor = 'var(--accent)'; });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.style.borderColor = ''; });
  });
  drop.addEventListener('drop', function (e) { if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  document.addEventListener('paste', function (e) {
    var items = e.clipboardData && e.clipboardData.items; if (!items) return;
    for (var i = 0; i < items.length; i++) {
      if (items[i].kind === 'file' && items[i].type.indexOf('image/') === 0) { handleFile(items[i].getAsFile()); break; }
    }
  });

  ['title', 'channel', 'views', 'duration', 'age'].forEach(function (k) {
    var el = $('#' + k);
    el.addEventListener('input', function () { S[k] = el.value; render(); });
  });

  $('#tabs').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-p]'); if (!b) return;
    placement = b.getAttribute('data-p');
    Array.prototype.forEach.call(this.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
    render();
  });

  $('#themeBtn').addEventListener('click', function () {
    theme = (theme === 'light') ? 'dark' : 'light';
    document.body.classList.toggle('dark', theme === 'dark');
    this.textContent = (theme === 'light') ? 'Dark mode' : 'Light mode';
    render();
  });

  $('#dl').addEventListener('click', function () {
    cv.toBlob(function (b) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'thumbnail-tester-' + placement + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    }, 'image/png');
  });

  render();
})();
