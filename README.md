# Benxus Group — sito istituzionale

Sito statico, nessuna build e nessuna dipendenza esterna: si pubblica così com'è su GitHub Pages.

## Contenuto

| Percorso | A cosa serve |
|---|---|
| `index.html` | Home page |
| `startup-innovativa.html` | Informazioni obbligatorie art. 25 D.L. 179/2012 |
| `note-legali.html` · `privacy.html` · `cookie.html` | Pagine legali |
| `404.html` | Pagina di errore (GitHub Pages la usa in automatico) |
| `assets/css/site.css` · `assets/js/` · `assets/fonts/` | Stile, interazioni, caratteri ospitati in locale |
| `og.png` · `favicon.svg` · `apple-touch-icon.png` | Anteprima social e icone |
| `CNAME` | Dominio: `benxus.ai` |
| `.nojekyll` | Disattiva Jekyll (serve anche per pubblicare `.well-known/`) |
| `.well-known/security.txt` | Contatto per segnalazioni di sicurezza (scade il 12/10/2027: rinnovalo) |
| `robots.txt` · `sitemap.xml` | Indicizzazione |

## Aggiornare il repository esistente

**Da interfaccia web**
1. Apri il repository → elimina i vecchi `index.html` e `404.html` oppure caricali sopra (stesso nome = sostituiti).
2. **Add file → Upload files** → trascina il *contenuto* della cartella (non la cartella stessa), comprese le sottocartelle `assets` e `.well-known`.
3. I file nascosti (`.nojekyll`, `.well-known`) su Mac non si vedono nel Finder: premi `Cmd + Shift + .` per mostrarli prima di trascinare.
4. **Commit changes**.

**Da terminale**
```bash
git clone https://github.com/TUO-UTENTE/benxus-site.git
cd benxus-site
# copia qui dentro tutto il contenuto della cartella nuova, sovrascrivendo
git add -A
git commit -m "Nuovo sito: dati societari, pagine legali, sicurezza"
git push
```

Dopo 1–2 minuti il sito è online. Ricarica con `Cmd/Ctrl + Shift + R` per evitare la cache.

## Sicurezza: impostazioni da controllare una volta

- **Settings → Pages → Enforce HTTPS**: deve essere spuntato.
- **Verifica del dominio** (protegge da furti del dominio su GitHub Pages): *Settings del tuo profilo → Pages → Add a domain* → aggiungi `benxus.ai` → inserisci nel DNS il record TXT che GitHub ti mostra.
- **Autenticazione a due fattori** sull'account GitHub.
- **DNS (GoDaddy)**: attiva DNSSEC se disponibile; aggiungi un record `CAA` → `0 issue "letsencrypt.org"`.
- **Email del dominio**: configura SPF, DKIM e un record DMARC (`_dmarc` → `v=DMARC1; p=quarantine; rua=mailto:info@benxus.ai`) così nessuno può spedire email false a nome di `@benxus.ai`.

## Prima di pubblicare

Apri `startup-innovativa.html` e sostituisci i riquadri gialli **DA INSERIRE**. Cerca il testo `class="todo"` nel file per trovarli tutti.
