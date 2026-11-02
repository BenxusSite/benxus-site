# Benxus Group — sito istituzionale (v2, novembre 2026)

Sito statico: nessuna build, nessuna dipendenza esterna, nessun cookie. Si pubblica così com'è su GitHub Pages.

## Contenuto

| Percorso | A cosa serve |
|---|---|
| `index.html` | Home page |
| `startup-innovativa.html` | Informazioni obbligatorie art. 25 D.L. 179/2012 |
| `note-legali.html` · `privacy.html` · `cookie.html` | Pagine legali |
| `404.html` | Pagina di errore (GitHub Pages la usa in automatico) |
| `assets/css/site.css` | Tutto lo stile, temi chiaro e scuro |
| `assets/js/boot.js` · `assets/js/site.js` | Tema, animazioni, interazioni |
| `assets/fonts/` | Caratteri ospitati in locale (Archivo, IBM Plex Mono — licenza OFL) |
| `assets/brand/` | Logo e icona in SVG, icone PNG per smartphone |
| `favicon.svg` · `favicon-32.png` · `apple-touch-icon.png` · `site.webmanifest` | Icone del sito |
| `og.png` | Anteprima per WhatsApp, LinkedIn, X (1200×630) |
| `CNAME` | Dominio: `benxus.ai` |
| `.nojekyll` | Fa pubblicare i file così come sono (serve anche per `.well-known/`) |
| `.well-known/security.txt` · `security.txt` | Contatto per segnalazioni di sicurezza (scade il 02/11/2027: rinnovalo) |
| `robots.txt` · `sitemap.xml` | Indicizzazione |

## Pubblicare (sostituisce TUTTO il contenuto del repository)

Il repository attuale contiene file finiti nel posto sbagliato (copie di `site.css`, `site.js`, `boot.js` e dei font nella cartella principale, un file vuoto `download`, `security.txt` fuori da `.well-known`). Vanno eliminati: il modo più semplice è svuotare il repository e caricare tutto da capo.

### Opzione A — dal browser (github.dev)
1. Apri il repository su github.com e premi il tasto **.** (punto): si apre l'editor github.dev.
2. Nel pannello dei file a sinistra seleziona tutti i file e le cartelle (clic sul primo, Maiusc+clic sull'ultimo) → tasto destro → **Delete**. Lascia solo la cartella `.github` se esiste.
3. Trascina nel pannello a sinistra **il contenuto** della cartella `benxus-site` (non la cartella stessa). Su Mac, per vedere i file nascosti `.nojekyll` e `.well-known`, premi `Cmd + Shift + .` nel Finder prima di trascinare.
4. Icona del ramo a sinistra (Source Control) → scrivi un messaggio, ad es. "Sito v2" → **Commit & Push**.

### Opzione B — da terminale
```bash
git clone https://github.com/TUO-UTENTE/TUO-REPO.git
cd TUO-REPO
git rm -r -q .
cp -R /percorso/benxus-site/. .
git add -A
git commit -m "Sito v2: logo ufficiale, tema giorno/notte, sicurezza"
git push
```

Dopo 1–2 minuti il sito è online. Ricarica con `Cmd/Ctrl + Shift + R`.

### Controllo dopo la pubblicazione
- `https://benxus.ai` si apre con il lucchetto e il logo nuovo
- Il pulsante luna/sole in alto a destra cambia tema, e il tema resta uguale cambiando pagina
- `https://benxus.ai/.well-known/security.txt` si apre (se dà 404, la cartella nascosta non è stata caricata)
- Incolla il link in WhatsApp: deve comparire la nuova anteprima nera con il logo. WhatsApp e LinkedIn tengono in memoria la vecchia anteprima per qualche giorno; su LinkedIn puoi forzarla con il Post Inspector.

## Sicurezza: impostazioni da controllare una volta

- **Settings → Pages → Enforce HTTPS** spuntato.
- **Verifica del dominio** su GitHub (impostazioni del profilo → Pages → Add a domain → record TXT nel DNS).
- **Autenticazione a due fattori** sull'account GitHub.
- **DNS**: DNSSEC se il registrar lo offre; record `CAA` → `0 issue "letsencrypt.org"`.
- **Email del dominio**: SPF, DKIM e DMARC (`_dmarc` → `v=DMARC1; p=quarantine; rua=mailto:info@benxus.ai`).

## Smartphone e tablet

- Testato con l'emulazione di 8 schermi: 320, 360, 375, 393, 412, 430 px, telefono in orizzontale e iPad. Nessuno sconfinamento orizzontale, aree toccabili di almeno 44 px.
- iPhone: margini per notch, Dynamic Island e barra Home; menu che blocca lo scorrimento sottostante; niente effetto "hover appiccicato" dopo il tocco.
- Android: colore della barra del browser che segue il tema; icona adattiva per la schermata Home.
- Browser supportati: iOS/Safari 15 o successivi, Chrome e Samsung Internet recenti. Sui browser più vecchi il sito funziona, con meno animazioni.

## Logo e caratteri

- Il logo è stato estratto dai vettoriali originali del designer (cartella "2. File vettoriale"), senza ridisegnarlo.
- Il carattere del logo (Helvetica Neue LT Std Heavy) **non** è usato come font web: la licenza desktop di norma non consente di pubblicarlo su un sito. I titoli usano Archivo, molto simile e con licenza libera. Il logo resta identico perché è un disegno vettoriale.
