# Benxus Group — sito vetrina

Sito statico one-page. Nessuna build, nessuna dipendenza: si pubblica così com'è.

## Contenuto della cartella

| File | A cosa serve |
|---|---|
| `index.html` | Il sito |
| `404.html` | Pagina di errore, GitHub Pages la usa in automatico |
| `og.png` | Anteprima per WhatsApp, LinkedIn, X (1200×630) |
| `favicon.svg` | Icona della scheda del browser |
| `CNAME` | Dice a GitHub Pages qual è il dominio: `benxus.ai` |
| `.nojekyll` | Disattiva Jekyll, così i file passano intatti |
| `robots.txt` | Autorizza l'indicizzazione e indica la sitemap |
| `sitemap.xml` | La mappa del sito per Google |

## 1 · Metti i file su GitHub

1. Su GitHub crea un repository nuovo, per esempio `benxus-site`. Puoi lasciarlo privato solo se hai un piano a pagamento: con l'account gratuito GitHub Pages funziona solo dai repository pubblici.
2. Carica il contenuto di questa cartella nella **radice** del repository, non dentro una sottocartella. `index.html` deve stare al primo livello.
   - Via interfaccia web: **Add file → Upload files**, trascina tutto, poi **Commit changes**.
   - Da terminale:
     ```bash
     git init
     git add .
     git commit -m "Sito Benxus Group"
     git branch -M main
     git remote add origin https://github.com/TUO-UTENTE/benxus-site.git
     git push -u origin main
     ```
   - Attenzione: `.nojekyll` è un file nascosto. Con l'upload via web trascina la cartella intera, altrimenti resta fuori.

## 2 · Attiva GitHub Pages

Nel repository: **Settings → Pages**

- **Source**: `Deploy from a branch`
- **Branch**: `main`, cartella `/ (root)` → **Save**

Dopo un paio di minuti il sito è online sull'indirizzo temporaneo `https://TUO-UTENTE.github.io/benxus-site/`. Aprilo e verifica che tutto si veda bene prima di collegare il dominio.

## 3 · Configura il DNS di benxus.ai

Dal pannello del registrar dove hai comprato il dominio (GoDaddy, se segui la stessa strada di `byside.ai`), vai nella gestione DNS e inserisci **quattro record A** sul dominio nudo:

| Tipo | Nome | Valore | TTL |
|---|---|---|---|
| A | `@` | `185.199.108.153` | 1 ora |
| A | `@` | `185.199.109.153` | 1 ora |
| A | `@` | `185.199.110.153` | 1 ora |
| A | `@` | `185.199.111.153` | 1 ora |

Poi **un record CNAME** per il `www`, così chi digita `www.benxus.ai` finisce sul sito:

| Tipo | Nome | Valore | TTL |
|---|---|---|---|
| CNAME | `www` | `TUO-UTENTE.github.io` | 1 ora |

Il punto finale nel valore del CNAME lo aggiunge il registrar da solo: non scriverlo a mano.

Se vuoi coprire anche IPv6, aggiungi quattro record AAAA su `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`. Non è obbligatorio.

Prima di aggiungerli, elimina eventuali record A o CNAME già presenti su `@` e su `www` che puntano altrove (parcheggi del registrar, vecchi hosting): due record in conflitto fanno fallire la verifica.

## 4 · Collega il dominio su GitHub

Torna in **Settings → Pages → Custom domain**, scrivi `benxus.ai` e salva. Il file `CNAME` è già nel repository, quindi il campo potrebbe risultare già compilato: in quel caso controlla solo che sia corretto.

GitHub fa un controllo DNS. Finché i record non si propagano vedrai un avviso: è normale, di solito bastano da 15 minuti a qualche ora.

Quando la verifica passa, spunta **Enforce HTTPS**. La casella resta disattivata finché GitHub non ha emesso il certificato Let's Encrypt — servono fino a 24 ore dalla prima verifica. Non toccare nulla nel frattempo.

## 5 · Verifica finale

- `https://benxus.ai` si apre con il lucchetto
- `https://www.benxus.ai` reindirizza al dominio nudo
- Incolla il link in una chat WhatsApp: deve comparire l'anteprima con la X blu
- `https://benxus.ai/pagina-inesistente` mostra la 404 del sito, non quella di GitHub

## Cose da sistemare prima di andare online

- **P. IVA**: in fondo a `index.html` c'è il segnaposto `00000000000`. Sostituiscilo con la partita IVA reale. Per una S.r.l. italiana l'indicazione di sede, numero REA e capitale sociale in home è un obbligo (art. 2250 c.c.): se la società è già costituita, aggiungi anche quelli nella riga legale.
- **Casella hello@benxus.ai**: deve esistere davvero. Se sul dominio configuri l'email, ricordati i record MX oltre a quelli qui sopra.
- **Link alle società**: `boomconnex.com` e `byside.ai` puntano già ai siti reali. Byside è in lancio ad agosto: se il sito non è ancora pubblico, valuta di lasciare la scheda senza link fino a quel momento.

## Se vuoi il www come indirizzo principale

Alcuni preferiscono `www.benxus.ai` come dominio primario, perché la CDN di GitHub lo serve meglio del dominio nudo. In quel caso: scrivi `www.benxus.ai` dentro il file `CNAME`, imposta lo stesso valore in **Custom domain**, e aggiorna nell'`index.html` il `<link rel="canonical">`, l'`og:url` e gli indirizzi nel blocco JSON-LD. I record A su `@` restano: servono a far reindirizzare il dominio nudo verso il www.

## Aggiornare il sito

Modifichi `index.html`, fai commit, e in un minuto la modifica è online. Non serve rifare nulla del DNS.
