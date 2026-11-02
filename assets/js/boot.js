/* Caricato nel <head>, prima del rendering.
   1) applica subito il tema (salvato o di sistema), così la pagina non "lampeggia";
   2) segnala che JavaScript è attivo (le animazioni di comparsa partono solo in quel caso);
   3) impedisce che il sito venga caricato dentro un iframe altrui (clickjacking:
      GitHub Pages non permette di inviare l'intestazione X-Frame-Options). */
(function () {
  var d = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('benxus-theme'); } catch (e) {}
  var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  d.setAttribute('data-theme', dark ? 'dark' : 'light');
  d.classList.add('js');
  if (window.top !== window.self) {
    try { window.top.location.replace(window.self.location.href); }
    catch (e) { d.style.display = 'none'; }
  }
})();
