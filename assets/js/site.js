/* Benxus Group — interazioni del sito. Nessuna libreria, nessuna chiamata di rete,
   nessun uso di innerHTML (compatibile con Trusted Types). */
(function () {
  'use strict';

  var doc = document.documentElement;
  var EN = (doc.getAttribute('lang') || 'it').indexOf('en') === 0;
  var TXT = EN ? {
    toLight: 'Switch to light theme', toDark: 'Switch to dark theme', light: 'Light theme', dark: 'Dark theme',
    openMenu: 'Open menu', closeMenu: 'Close menu', copied: 'Copied',
    mailQ: 'Didn’t your email app open?', mailCopy: 'Copy address', mailClose: 'Close'
  } : {
    toLight: 'Passa al tema chiaro', toDark: 'Passa al tema scuro', light: 'Tema chiaro', dark: 'Tema scuro',
    openMenu: 'Apri il menu', closeMenu: 'Chiudi il menu', copied: 'Copiato',
    mailQ: 'Non si è aperto il programma di posta?', mailCopy: 'Copia indirizzo', mailClose: 'Chiudi'
  };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var sysDark = window.matchMedia('(prefers-color-scheme: dark)');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var onMQ = function (mq, fn) { if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); };
  var themeListeners = [];

  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- tema giorno / notte ---------- */
  function currentTheme() { return doc.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function paintMeta() {
    var dark = currentTheme() === 'dark';
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0D0D11' : '#F7F7F4');
    $$('.theme-btn').forEach(function (b) {
      b.setAttribute('aria-label', dark ? TXT.toLight : TXT.toDark);
      b.setAttribute('title', dark ? TXT.light : TXT.dark);
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
      doc.style.setProperty('--tx', x + 'px');
      doc.style.setProperty('--ty', y + 'px');
      doc.style.setProperty('--tr', Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 'px');
      document.startViewTransition(function () { applyTheme(next); });
    });
  });
  onMQ(sysDark, function (e) { if (!savedTheme()) applyTheme(e.matches ? 'dark' : 'light'); });
  paintMeta();

  /* ---------- scorrimento verso le sezioni (barra sempre visibile, titolo mai coperto) ---------- */
  var header = $('.site-header');
  var lastHash = location.hash.slice(1);
  function headerH() { return header ? header.getBoundingClientRect().height : 0; }
  function targetY(el) {
    if (!el || el.id === 'top') return 0;
    var anchor = el;
    if (el.tagName === 'SECTION') anchor = el.querySelector('.sec-head') || el;
    /* posizione "a riposo" (offsetTop ignora le animazioni di comparsa ancora in corso) */
    var top = 0, n = anchor;
    while (n) { top += n.offsetTop; n = n.offsetParent; }
    return Math.max(0, top - headerH() - 28);
  }
  function setHash(id) {
    if (id === lastHash) return;
    lastHash = id;
    try { history.replaceState(null, '', id ? '#' + id : location.pathname + location.search); } catch (e) {}
  }
  function goTo(id, smooth) {
    var el = id ? document.getElementById(id) : null;
    if (id && !el) return false;
    if (el) $$('.reveal', el).forEach(function (r) { r.classList.add('in'); });
    window.scrollTo({ top: id ? targetY(el) : 0, behavior: smooth && !reduced ? 'smooth' : 'auto' });
    return true;
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.target === '_blank') return;
    var href = a.getAttribute('href');
    var hashIdx = href.indexOf('#');
    if (hashIdx < 0) return;
    var path = href.slice(0, hashIdx);
    var here = location.pathname.split('/').pop();
    if (path && !(path === here || (path === 'index.html' && here === ''))) return; /* altra pagina: navigazione normale, immediata */
    var id = href.slice(hashIdx + 1);
    if (id === 'top' || id === '') { e.preventDefault(); goTo(null, true); setHash(''); return; }
    if (goTo(id, true)) { e.preventDefault(); setHash(id); }
  });
  /* arrivo da un'altra pagina con #ancora: posizione esatta, senza animazione,
     ricalcolata quando i caratteri sono caricati (il testo cambia altezza) */
  if (location.hash.length > 1) {
    var id0 = decodeURIComponent(location.hash.slice(1));
    var fix = function () { if (window.scrollY < 5 || !fix.userMoved) goTo(id0, false); };
    window.addEventListener('wheel', function () { fix.userMoved = true; }, { passive: true, once: true });
    window.addEventListener('touchmove', function () { fix.userMoved = true; }, { passive: true, once: true });
    fix();
    window.addEventListener('load', fix);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fix);
    setTimeout(fix, 450);
  }

  /* ---------- l'indirizzo segue la sezione visibile; voce di menu attiva ---------- */
  var navLinks = $$('#nav a[href^="#"]');
  var spySections = $$('main > section[id], .site-footer[id]');
  if (navLinks.length && spySections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
        if (window.scrollY > 40 && userMoved) setHash(id);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spySections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- barra di avanzamento, pulsante "torna su", manifesto ---------- */
  var progress = $('.progress');
  var toTop = $('.to-top');
  var lastY = window.scrollY, velocity = 0, ticking = false, userMoved = false;
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) {
    window.addEventListener(ev, function () { userMoved = true; }, { passive: true, once: true });
  });
  function onScroll() {
    var y = Math.max(0, window.scrollY);
    var max = doc.scrollHeight - window.innerHeight;
    velocity = y - lastY;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (toTop) toTop.classList.toggle('show', y > window.innerHeight * 0.9);
    if (y < 40 && lastHash && navLinks.length && userMoved) setHash('');
    lightUpdate();
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* ---------- emblema: leggera profondità che segue il puntatore (il logo resta intero) ---------- */
  var heroArt = $('.hero-art');
  if (heroArt && finePointer && !reduced) {
    var hero = $('.hero');
    hero.addEventListener('pointermove', function (e) {
      var r = heroArt.getBoundingClientRect();
      heroArt.style.setProperty('--px', clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1.5, 1.5).toFixed(3));
      heroArt.style.setProperty('--py', clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1.5, 1.5).toFixed(3));
    });
    hero.addEventListener('pointerleave', function () { heroArt.style.setProperty('--px', '0'); heroArt.style.setProperty('--py', '0'); });
  }

  /* ---------- menu mobile ---------- */
  var menuBtn = $('.menu-btn');
  var nav = $('#nav');
  function setMenu(open) {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? TXT.closeMenu : TXT.openMenu);
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

  /* ---------- cambio lingua: resta nella stessa sezione ---------- */
  $$('[data-lang-switch]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (lastHash) a.setAttribute('href', a.getAttribute('href').split('#')[0] + '#' + lastHash);
    });
  });

  /* ---------- comparsa degli elementi ---------- */
  var revealEls = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- manifesto: si illumina RIGA per riga, un paragrafo dopo l'altro ---------- */
  var lightRoots = reduced ? [] : $$('[data-light]');
  var lines = [];
  function splitWords(node0) {
    Array.prototype.slice.call(node0.childNodes).forEach(function (node) {
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
        node0.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        splitWords(node);
      }
    });
  }
  function buildLines() {
    var read = [];
    lines.forEach(function (L) { if (L.done) read = read.concat(L.words); });
    lines = [];
    var para = 0;
    lightRoots.forEach(function (root) {
      $$('p', root).forEach(function (p) {
        var current = null;
        $$('.w', p).forEach(function (w) {
          var r = w.getBoundingClientRect();
          var t = Math.round(r.top + window.scrollY);
          if (!current || Math.abs(t - current.top) > 8) {
            current = { words: [], para: para, top: t, bottom: t + r.height };
            lines.push(current);
          }
          current.words.push(w);
          current.bottom = Math.max(current.bottom, t + r.height);
        });
        para++;
      });
    });
    lines.forEach(function (L) { if (L.words.every(function (w) { return read.indexOf(w) >= 0; })) L.done = true; });
    lightUpdate();
  }
  function lightUpdate() {
    if (!lines.length) return;
    var vh = window.innerHeight;
    var trigger = vh * 0.68;  /* le righe si accendono all'altezza di lettura (circa 2/3 dello schermo) */
    var fade = vh * 0.10;
    var prev = 1, prevPara = -1;
    for (var i = 0; i < lines.length; i++) {
      var L = lines[i];
      var mid = (L.top + L.bottom) / 2 - window.scrollY;
      var o = clamp((trigger - mid) / fade, 0, 1);
      if (prevPara !== -1 && L.para !== prevPara && prev < 0.999) o = 0; /* il paragrafo successivo aspetta il precedente */
      else o = Math.min(o, prev);                                          /* una riga non supera mai quella sopra */
      if (L.done) o = 1;                                                   /* una riga già letta resta illuminata */
      else if (o >= 0.999) L.done = true;
      var val = String(0.16 + o * 0.84);
      for (var k = 0; k < L.words.length; k++) L.words[k].style.opacity = val;
      prev = o; prevPara = L.para;
    }
  }
  if (lightRoots.length) {
    lightRoots.forEach(splitWords);
    buildLines();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildLines);
    window.addEventListener('load', buildLines);
  }

  /* ---------- nastro scorrevole: velocità tranquilla ---------- */
  var track = $('.ribbon .track');
  if (track && !reduced) {
    var x = 0, boost = 0, ribbonOn = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { ribbonOn = en[0].isIntersecting; }).observe(track);
    var loop = function () {
      if (ribbonOn) {
        var half = track.scrollWidth / 2;
        boost += (Math.min(Math.abs(velocity) * 0.08, 1.2) - boost) * 0.05;
        velocity *= 0.85;
        x -= 0.45 + boost;
        if (half > 0 && -x >= half) x += half;
        track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- schede: inclinazione e riflesso ---------- */
  if (finePointer && !reduced) {
    $$('.card:not(.next)').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        card.style.setProperty('--rx', ((0.5 - py) * 5).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((px - 0.5) * 6).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
    });
    $$('[data-magnet]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- copia negli appunti ---------- */
  function legacyCopy(text, done) {
    var t = document.createElement('textarea');
    t.value = text; t.setAttribute('readonly', ''); t.className = 'sr';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(t);
  }
  function copyText(text, done) {
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text, done); });
    else legacyCopy(text, done);
  }
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      copyText(btn.getAttribute('data-copy'), function () {
        var old = btn.textContent;
        btn.textContent = TXT.copied; btn.classList.add('ok');
        setTimeout(function () { btn.textContent = old; btn.classList.remove('ok'); }, 1600);
      });
    });
  });

  /* ---------- email: se il programma di posta non si apre, offre alternative ---------- */
  var mailBox = null, mailTimer = null;
  function mk(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }
  function closeMail() { if (mailBox) { mailBox.remove(); mailBox = null; } }
  function showMail(addr, subject) {
    closeMail();
    mailBox = mk('div', 'mail-help');
    mailBox.setAttribute('role', 'dialog');
    mailBox.setAttribute('aria-label', TXT.mailQ);
    var x = mk('button', 'mh-x', '×'); x.type = 'button'; x.setAttribute('aria-label', TXT.mailClose);
    x.addEventListener('click', closeMail);
    var row = mk('div', 'mh-row');
    var copyB = mk('button', 'btn sm brand', TXT.mailCopy); copyB.type = 'button';
    copyB.addEventListener('click', function () { copyText(addr, function () { copyB.textContent = TXT.copied; }); });
    var su = subject ? encodeURIComponent(subject) : '';
    var gm = mk('a', 'btn sm ghost', 'Gmail');
    gm.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(addr) + (su ? '&su=' + su : '');
    var ol = mk('a', 'btn sm ghost', 'Outlook');
    ol.href = 'https://outlook.live.com/mail/0/deeplink/compose?to=' + encodeURIComponent(addr) + (su ? '&subject=' + su : '');
    [gm, ol].forEach(function (l) { l.target = '_blank'; l.rel = 'noopener noreferrer'; l.addEventListener('click', closeMail); });
    row.appendChild(copyB); row.appendChild(gm); row.appendChild(ol);
    mailBox.appendChild(x);
    mailBox.appendChild(mk('p', 'mh-q', TXT.mailQ));
    mailBox.appendChild(mk('p', 'mh-addr mono', addr));
    mailBox.appendChild(row);
    document.body.appendChild(mailBox);
    copyB.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMail(); });
  $$('a[href^="mailto:"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var href = a.getAttribute('href');
      var addr = a.getAttribute('data-mail') || href.slice(7).split('?')[0];
      var m = /[?&]subject=([^&]*)/.exec(href);
      var subject = m ? decodeURIComponent(m[1]) : '';
      clearTimeout(mailTimer);
      /* se dopo un attimo la pagina è ancora in primo piano, il programma di posta non si è aperto */
      mailTimer = setTimeout(function () { if (!document.hidden && document.hasFocus()) showMail(addr, subject); }, 1200);
    });
  });
  window.addEventListener('blur', function () { clearTimeout(mailTimer); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(mailTimer); });

  /* ---------- apertura: campo di punti che reagisce al puntatore ---------- */
  var canvas = $('.field');
  var heroSec = $('.hero');
  var rz, lastW = window.innerWidth;
  var resizeCanvas = null;
  if (canvas && heroSec && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, gap = 30;
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
      for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) {
        var px0 = ox + i * gap, py0 = oy + j * gap, dx = px0 - mouse.x, dy = py0 - mouse.y;
        if (dx * dx + dy * dy < R2) continue;
        ctx.fillRect(px0 - 0.8, py0 - 0.8, 1.6, 1.6);
      }
      ctx.fillStyle = colBlu;
      var i0 = Math.max(0, Math.floor((mouse.x - R - ox) / gap)), i1 = Math.min(cols - 1, Math.ceil((mouse.x + R - ox) / gap));
      var j0 = Math.max(0, Math.floor((mouse.y - R - oy) / gap)), j1 = Math.min(rows - 1, Math.ceil((mouse.y + R - oy) / gap));
      for (var a = i0; a <= i1; a++) for (var b = j0; b <= j1; b++) {
        var px = ox + a * gap, py = oy + b * gap, ddx = px - mouse.x, ddy = py - mouse.y, dd2 = ddx * ddx + ddy * ddy;
        if (dd2 >= R2) continue;
        var dist = Math.sqrt(dd2) || 1, f = 1 - dist / R, push = f * 16, s = 1.6 + f * 2.4;
        ctx.globalAlpha = 0.25 + f * 0.75;
        ctx.fillRect(px + ddx / dist * push - s / 2, py + ddy / dist * push - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    };
    resizeCanvas = function () {
      var r = heroSec.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = W < 700 ? 24 : 30;
      readColors(); draw();
    };
    var frame = function () {
      if (!running) return;
      draw();
      if (Math.abs(mouse.tx - mouse.x) < 0.3 && Math.abs(mouse.ty - mouse.y) < 0.3) { running = false; return; }
      requestAnimationFrame(frame);
    };
    var kick = function () { if (reduced || running || !visible || document.hidden) return; running = true; requestAnimationFrame(frame); };
    resizeCanvas();
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
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(heroSec);
  }
  /* la barra degli indirizzi dei telefoni genera "resize": si ricalcola solo se cambia la larghezza */
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      if (Math.abs(window.innerWidth - lastW) < 2) return;
      lastW = window.innerWidth;
      if (resizeCanvas) resizeCanvas();
      buildLines();
    }, 150);
  });
  window.addEventListener('orientationchange', function () { setTimeout(function () { buildLines(); onScroll(); }, 300); });
  onScroll();
})();
