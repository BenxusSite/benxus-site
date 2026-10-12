/* Caricato nel <head>, prima del rendering.
   1) segnala che JavaScript è attivo (le animazioni di comparsa partono solo in quel caso);
   2) impedisce che il sito venga caricato dentro un iframe altrui (difesa da clickjacking:
      GitHub Pages non permette di inviare l'intestazione X-Frame-Options). */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  if (window.top !== window.self) {
    try { window.top.location.replace(window.self.location.href); }
    catch (e) { d.style.display = 'none'; }
  }
})();
