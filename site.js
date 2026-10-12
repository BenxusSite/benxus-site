/* Benxus Group — interazioni del sito. Nessuna libreria, nessuna chiamata di rete. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- anno nel copyright ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- intestazione, barra di avanzamento, X che ruota ---------- */
  var header = $('.site-header');
  var progress = $('.progress');
  var xInner = $('.hero .x-inner');
  var lastY = window.scrollY;
  var velocity = 0;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = doc.scrollHeight - window.innerHeight;
    velocity = y - lastY;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (header && !document.body.classList.contains('menu-open')) {
      if (y > 160 && velocity > 4) header.classList.add('hide');
      else if (velocity < -4 || y < 160) header.classList.remove('hide');
    }
    if (xInner && !reduced) xInner.style.transform = 'rotate(' + Math.min(y * 0.12, 90) + 'deg)';
    manifestoUpdate();
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* ---------- menu mobile ---------- */
  var menuBtn = $('.menu-btn');
  var nav = $('#nav');
  function setMenu(open) {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  /* ---------- comparsa degli elementi ---------- */
  var revealEls = $$('.reveal, .flow');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- voce di menu attiva ---------- */
  var navLinks = $$('#nav a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* ---------- manifesto: le parole si accendono scorrendo ---------- */
  var manifesto = $('.manifesto');
  var words = [];
  if (manifesto && !reduced) {
    $$('p', manifesto).forEach(function (p) {
      Array.prototype.slice.call(p.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          var frag = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.className = 'w';
            s.textContent = part;
            frag.appendChild(s);
          });
          p.replaceChild(frag, node);
        } else if (node.nodeType === 1) {
          node.classList.add('w');
        }
      });
    });
    words = $$('.w', manifesto);
  }
  function manifestoUpdate() {
    if (!words.length) return;
    var r = manifesto.getBoundingClientRect();
    var vh = window.innerHeight;
    var start = vh * 0.85, end = vh * 0.35;
    var p = clamp((start - r.top) / (r.height + start - end), 0, 1);
    var n = words.length;
    for (var i = 0; i < n; i++) {
      var o = clamp(p * n * 1.15 - i, 0, 1);
      words[i].style.opacity = String(0.14 + o * 0.86);
    }
  }

  /* ---------- nastro scorrevole: accelera con lo scroll ---------- */
  var track = $('.ribbon .track');
  if (track && !reduced) {
    var x = 0, boost = 0;
    var loop = function () {
      var half = track.scrollWidth / 2;
      boost += (Math.abs(velocity) * 0.6 - boost) * 0.08;
      velocity *= 0.9;
      x -= 0.6 + boost;
      if (half > 0 && -x >= half) x += half;
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- schede: inclinazione e riflesso che segue il puntatore ---------- */
  if (finePointer && !reduced) {
    $$('.card:not(.next)').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        card.style.setProperty('--rx', ((0.5 - py) * 6).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((px - 0.5) * 8).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
    /* pulsanti "magnetici" */
    $$('[data-magnet]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- copia negli appunti (P.IVA, PEC, REA…) ---------- */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        var old = btn.textContent;
        btn.textContent = 'Copiato';
        btn.classList.add('ok');
        setTimeout(function () { btn.textContent = old; btn.classList.remove('ok'); }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var t = document.createElement('textarea');
        t.value = text; t.setAttribute('readonly', ''); t.className = 'sr';
        document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(t);
      }
    });
  });

  /* ---------- apertura: campo di punti e impulsi lungo la X ---------- */
  var canvas = $('.field');
  var hero = $('.hero');
  if (canvas && hero && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1, gap = 30, ang = 26 * Math.PI / 180;
    var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    var colInk = '#0E0E12', colBlu = '#1B2AC8';
    var running = false, visible = true, t0 = performance.now();
    var pulses = [];

    var readColors = function () {
      var cs = getComputedStyle(doc);
      colInk = cs.getPropertyValue('--inchiostro').trim() || colInk;
      colBlu = cs.getPropertyValue('--oltremare').trim() || colBlu;
      var a = parseFloat(getComputedStyle(hero).getPropertyValue('--angolo-hero'));
      ang = (isNaN(a) ? 26 : a) * Math.PI / 180;
    };
    var resize = function () {
      var r = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = W < 700 ? 24 : 30;
      readColors();
      if (!running) draw(performance.now());
    };
    var makePulses = function () {
      pulses = [];
      for (var line = 0; line < 2; line++) {
        for (var k = 0; k < 3; k++) {
          pulses.push({ line: line, t: Math.random(), speed: 0.045 + Math.random() * 0.05, dir: Math.random() > 0.5 ? 1 : -1 });
        }
      }
    };

    var draw = function (now) {
      ctx.clearRect(0, 0, W, H);
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      var R = 150, R2 = R * R;
      var cols = Math.ceil(W / gap) + 1, rows = Math.ceil(H / gap) + 1;
      var ox = (W - (cols - 1) * gap) / 2, oy = (H - (rows - 1) * gap) / 2;

      ctx.fillStyle = colInk;
      ctx.globalAlpha = 0.15;
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var x = ox + i * gap, y = oy + j * gap;
          var dx = x - mouse.x, dy = y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < R2) continue;
          ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
        }
      }
      /* i punti vicini al puntatore si spostano e diventano blu */
      ctx.fillStyle = colBlu;
      var i0 = Math.max(0, Math.floor((mouse.x - R - ox) / gap)), i1 = Math.min(cols - 1, Math.ceil((mouse.x + R - ox) / gap));
      var j0 = Math.max(0, Math.floor((mouse.y - R - oy) / gap)), j1 = Math.min(rows - 1, Math.ceil((mouse.y + R - oy) / gap));
      for (var a = i0; a <= i1; a++) {
        for (var b = j0; b <= j1; b++) {
          var px = ox + a * gap, py = oy + b * gap;
          var ddx = px - mouse.x, ddy = py - mouse.y, dd2 = ddx * ddx + ddy * ddy;
          if (dd2 >= R2) continue;
          var dist = Math.sqrt(dd2) || 1, f = 1 - dist / R;
          var push = f * 14;
          ctx.globalAlpha = 0.25 + f * 0.75;
          var s = 1.6 + f * 2.2;
          ctx.fillRect(px + ddx / dist * push - s / 2, py + ddy / dist * push - s / 2, s, s);
        }
      }

      /* impulsi che viaggiano lungo le due diagonali */
      if (!reduced && now - t0 > 1500) {
        var cx = W / 2, cy = H / 2, L = Math.sqrt(W * W + H * H) / 2 + 60;
        var dt = 1 / 60;
        for (var p = 0; p < pulses.length; p++) {
          var pu = pulses[p];
          pu.t += pu.speed * dt * pu.dir;
          if (pu.t > 1) pu.t -= 1; if (pu.t < 0) pu.t += 1;
          var ux = Math.cos(ang), uy = pu.line === 0 ? -Math.sin(ang) : Math.sin(ang);
          var pos = (pu.t * 2 - 1) * L;
          var hx = cx + ux * pos, hy = cy + uy * pos;
          var len = 90 * pu.dir;
          var tx = hx - ux * len, ty = hy - uy * len;
          var g = ctx.createLinearGradient(tx, ty, hx, hy);
          g.addColorStop(0, 'rgba(0,0,0,0)');
          g.addColorStop(1, colBlu);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = g;
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
          ctx.fillStyle = colBlu;
          ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    var frame = function (now) {
      if (!running) return;
      draw(now);
      requestAnimationFrame(frame);
    };
    var start = function () { if (reduced || running || !visible || document.hidden) return; running = true; requestAnimationFrame(frame); };
    var stop = function () { running = false; };

    makePulses();
    resize();
    window.addEventListener('resize', function () { resize(); });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { readColors(); if (!running) draw(performance.now()); });
    if (finePointer) {
      window.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
        if (mouse.x < -5000) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
      }, { passive: true });
      hero.addEventListener('pointerleave', function () { mouse.tx = -9999; mouse.ty = -9999; mouse.x = -9999; mouse.y = -9999; });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); else stop(); }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    start();
  }

  onScroll();
})();
