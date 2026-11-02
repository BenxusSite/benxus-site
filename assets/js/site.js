/* Benxus Group — interazioni del sito. Nessuna libreria, nessuna chiamata di rete,
   nessun uso di innerHTML (compatibile con Trusted Types). */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var sysDark = window.matchMedia('(prefers-color-scheme: dark)');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var themeListeners = [];
  var onMQ = function (mq, fn) { if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); };

  /* ---------- anno nel copyright ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- tema giorno / notte ---------- */
  function currentTheme() { return doc.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function paintMeta() {
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', currentTheme() === 'dark' ? '#0D0D11' : '#F7F7F4');
    $$('.theme-btn').forEach(function (b) {
      var dark = currentTheme() === 'dark';
      b.setAttribute('aria-label', dark ? 'Passa al tema chiaro' : 'Passa al tema scuro');
      b.setAttribute('title', dark ? 'Tema chiaro' : 'Tema scuro');
    });
    themeListeners.forEach(function (fn) { fn(); });
  }
  function applyTheme(t) { doc.setAttribute('data-theme', t); paintMeta(); }
  function savedTheme() { try { return localStorage.getItem('benxus-theme'); } catch (e) { return null; } }

  $$('.theme-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('benxus-theme', next); } catch (e) {}
      if (!document.startViewTransition || reduced) { applyTheme(next); return; }
      var r = btn.getBoundingClientRect();
      var x = r.left + r.width / 2, y = r.top + r.height / 2;
      var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      doc.style.setProperty('--tx', x + 'px');
      doc.style.setProperty('--ty', y + 'px');
      doc.style.setProperty('--tr', radius + 'px');
      document.startViewTransition(function () { applyTheme(next); });
    });
  });
  /* se l'utente non ha scelto, segue il sistema anche a pagina aperta */
  onMQ(sysDark, function (e) { if (!savedTheme()) applyTheme(e.matches ? 'dark' : 'light'); });
  paintMeta();

  /* ---------- intestazione, barra di avanzamento, emblema che ruota ---------- */
  var header = $('.site-header');
  var progress = $('.progress');
  var heroArt = $('.hero-art');
  var lastY = window.scrollY;
  var velocity = 0;
  var ticking = false;

  function onScroll() {
    var y = Math.max(0, window.scrollY);
    var max = doc.scrollHeight - window.innerHeight;
    velocity = y - lastY;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (header && !document.body.classList.contains('menu-open')) {
      if (y > 180 && velocity > 4) header.classList.add('hide');
      else if (velocity < -4 || y < 180) header.classList.remove('hide');
    }
    manifestoUpdate();
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* emblema: profondità che segue il puntatore */
  if (heroArt && finePointer && !reduced) {
    var hero = $('.hero');
    hero.addEventListener('pointermove', function (e) {
      var r = heroArt.getBoundingClientRect();
      var px = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1.5, 1.5);
      var py = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1.5, 1.5);
      heroArt.style.setProperty('--px', px.toFixed(3));
      heroArt.style.setProperty('--py', py.toFixed(3));
    });
    hero.addEventListener('pointerleave', function () {
      heroArt.style.setProperty('--px', '0');
      heroArt.style.setProperty('--py', '0');
    });
  }

  /* ---------- menu mobile ---------- */
  var menuBtn = $('.menu-btn');
  var nav = $('#nav');
  function setMenu(open) {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    doc.classList.toggle('menu-open', open);
    if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
    onMQ(window.matchMedia('(min-width: 1061px)'), function (m) { if (m.matches) setMenu(false); });
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
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
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
    navLinks.forEach(function (a) { var s = document.getElementById(a.getAttribute('href').slice(1)); if (s) spy.observe(s); });
  }

  /* ---------- manifesto: le parole si accendono scorrendo (ogni blocco [data-light]) ---------- */
  var lightBlocks = [];
  function splitWords(el) {
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
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
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        splitWords(node);
      }
    });
  }
  if (!reduced) {
    $$('[data-light]').forEach(function (block) {
      splitWords(block);
      lightBlocks.push({ el: block, words: $$('.w', block) });
    });
  }
  function manifestoUpdate() {
    var vh = window.innerHeight;
    var start = vh * 0.85, end = vh * 0.35;
    lightBlocks.forEach(function (b) {
      var r = b.el.getBoundingClientRect();
      var p = clamp((start - r.top) / (r.height + start - end), 0, 1);
      var n = b.words.length;
      for (var i = 0; i < n; i++) {
        var o = clamp(p * n * 1.15 - i, 0, 1);
        b.words[i].style.opacity = String(0.16 + o * 0.84);
      }
    });
  }

  /* ---------- nastro scorrevole: accelera con lo scroll, si ferma fuori schermo ---------- */
  var track = $('.ribbon .track');
  if (track && !reduced) {
    var x = 0, boost = 0, ribbonOn = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { ribbonOn = en[0].isIntersecting; }).observe(track);
    }
    var loop = function () {
      if (ribbonOn) {
        var half = track.scrollWidth / 2;
        boost += (Math.abs(velocity) * 0.6 - boost) * 0.08;
        velocity *= 0.9;
        x -= 0.6 + boost;
        if (half > 0 && -x >= half) x += half;
        track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      }
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
    $$('[data-magnet]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + 'px)';
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

  /* ---------- apertura: campo di punti che reagisce al puntatore ---------- */
  var canvas = $('.field');
  var heroSec = $('.hero');
  if (canvas && heroSec && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1, gap = 30;
    var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    var colDot = '13,13,17', colBlu = '#7B86FF';
    var running = false, visible = true;

    var readColors = function () {
      var cs = getComputedStyle(doc);
      colDot = cs.getPropertyValue('--dot').trim() || colDot;
      colBlu = cs.getPropertyValue('--brand').trim() || colBlu;
    };
    var draw = function () {
      ctx.clearRect(0, 0, W, H);
      mouse.x += (mouse.tx - mouse.x) * 0.14;
      mouse.y += (mouse.ty - mouse.y) * 0.14;
      var R = 160, R2 = R * R;
      var cols = Math.ceil(W / gap) + 1, rows = Math.ceil(H / gap) + 1;
      var ox = (W - (cols - 1) * gap) / 2, oy = (H - (rows - 1) * gap) / 2;
      ctx.fillStyle = 'rgba(' + colDot + ',.16)';
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var x = ox + i * gap, y = oy + j * gap;
          var dx = x - mouse.x, dy = y - mouse.y;
          if (dx * dx + dy * dy < R2) continue;
          ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
        }
      }
      ctx.fillStyle = colBlu;
      var i0 = Math.max(0, Math.floor((mouse.x - R - ox) / gap)), i1 = Math.min(cols - 1, Math.ceil((mouse.x + R - ox) / gap));
      var j0 = Math.max(0, Math.floor((mouse.y - R - oy) / gap)), j1 = Math.min(rows - 1, Math.ceil((mouse.y + R - oy) / gap));
      for (var a = i0; a <= i1; a++) {
        for (var b = j0; b <= j1; b++) {
          var px = ox + a * gap, py = oy + b * gap;
          var ddx = px - mouse.x, ddy = py - mouse.y, dd2 = ddx * ddx + ddy * ddy;
          if (dd2 >= R2) continue;
          var dist = Math.sqrt(dd2) || 1, f = 1 - dist / R;
          var push = f * 16, s = 1.6 + f * 2.4;
          ctx.globalAlpha = 0.25 + f * 0.75;
          ctx.fillRect(px + ddx / dist * push - s / 2, py + ddy / dist * push - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;
    };
    var resize = function () {
      var r = heroSec.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = W < 700 ? 24 : 30;
      readColors();
      draw();
    };
    var frame = function () {
      if (!running) return;
      draw();
      /* si ferma da solo quando il puntatore è fermo: zero consumo a riposo */
      if (Math.abs(mouse.tx - mouse.x) < 0.3 && Math.abs(mouse.ty - mouse.y) < 0.3) { running = false; return; }
      requestAnimationFrame(frame);
    };
    var kick = function () { if (reduced || running || !visible || document.hidden) return; running = true; requestAnimationFrame(frame); };

    resize();
    var rz, lastW = window.innerWidth;
    window.addEventListener('resize', function () {
      if (Math.abs(window.innerWidth - lastW) < 2) return;
      lastW = window.innerWidth; clearTimeout(rz); rz = setTimeout(resize, 150);
    });
    themeListeners.push(function () { readColors(); draw(); });
    if (finePointer) {
      window.addEventListener('pointermove', function (e) {
        var r = heroSec.getBoundingClientRect();
        mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
        if (mouse.x < -5000) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
        kick();
      }, { passive: true });
      heroSec.addEventListener('pointerleave', function () { mouse.tx = mouse.ty = mouse.x = mouse.y = -9999; draw(); });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(heroSec);
    }
  }

  window.addEventListener('orientationchange', function () { setTimeout(onScroll, 300); });
  onScroll();
})();
