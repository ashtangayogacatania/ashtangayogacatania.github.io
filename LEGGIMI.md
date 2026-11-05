# Sito Ashtanga Yoga Catania — guida

Sito statico (HTML + CSS + JS, nessun programma da installare) pubblicato gratis su **GitHub Pages**.
Prenotazioni gratuite su **Google Sheets** + pulsante **WhatsApp**.

## Struttura

| File / cartella | A cosa serve |
|---|---|
| `index.html` | Home: presentazione, calendario lezioni, prenotazione, dove siamo |
| `ashtanga-yoga.html`, `yoga-in-gravidanza.html`, `rosaria-torrisi.html`, `privacy.html` | Pagine interne (**generate**, vedi sotto) |
| `js/config.js` | **L'unico file da toccare di solito**: WhatsApp, email, social, link al Google Sheet, orario di riserva |
| `css/style.css` | Grafica |
| `img/` | Foto (formato .webp) |
| `google-apps-script/` | Codice delle prenotazioni + istruzioni (`LEGGIMI.md`) |
| `_pagine/` | Testi delle pagine interne (non pubblicati) |
| `_strumenti/genera-pagine.py` | Rigenera le pagine interne con il menu e il piè di pagina della home |
| `chi-sono/`, `contatti/`, … | Reindirizzamenti dai vecchi indirizzi del sito WordPress |

Per modificare il testo di una pagina interna: modifica il file in `_pagine/` e poi esegui
```
python _strumenti/genera-pagine.py
```
Se cambi menu o piè di pagina in `index.html`, esegui lo stesso comando per aggiornarli ovunque.

## Vedere il sito sul computer
```
python -m http.server 8080
```
poi apri http://localhost:8080

## Pubblicazione su GitHub Pages
1. Su GitHub: icona profilo → **Your organizations → New organization → Free**. Nome per esempio `ashtangayogacatania`.
2. Nell'organizzazione crea un repository pubblico chiamato `ashtangayogacatania.github.io`.
3. Carica i file di questa cartella (vedi i comandi git qui sotto).
4. Repository → **Settings → Pages** → Source: *Deploy from a branch*, Branch: `main` / `(root)`.
5. Dopo un minuto il sito è online su `https://ashtangayogacatania.github.io`.

## Dominio
Il dominio **ashtangayogacatania.it** esiste già ed è quello del vecchio sito. **Conviene tenerlo**, perché Google lo conosce da anni.
1. Scopri presso quale registrar è registrato e a chi è intestato: cercalo su https://whois.nic.it. Forse lo gestisce il vecchio web designer.
2. Fatti dare l'accesso al pannello DNS, oppure chiedi il codice **AuthInfo** e trasferisci il dominio a un registrar economico (circa 10 €/anno).
3. Nel pannello DNS imposta:
   - `www` → record **CNAME** → `ashtangayogacatania.github.io.`
   - dominio principale (`@`) → 4 record **A**: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
4. Su GitHub → Settings → Pages → *Custom domain*: `www.ashtangayogacatania.it` → poi spunta **Enforce HTTPS**.
5. Disdici l'hosting del vecchio WordPress **solo dopo** che il nuovo sito è online sul dominio.

## Da verificare prima della pubblicazione
- [ ] **Anni di esperienza**: il vecchio sito dice che pratica dal 1990, si diploma insegnante nel 2004 e insegna Ashtanga dal 2000. Il nuovo sito dice "dal 1990" e "oltre trent'anni". Se insegna davvero da 40 anni, correggi in `index.html` e `_pagine/rosaria-torrisi.html`.
- [ ] **Foto**: le foto più belle portano il marchio della fotografa **Mara Trovato**. Il marchio è stato lasciato e lei è citata nel piè di pagina. Conviene comunque chiederle il permesso di usarle sul nuovo sito.
- [ ] **Tipo e durata delle lezioni**: ho ipotizzato Ashtanga guidata da 90 minuti, con Mysore Style il sabato. Si cambiano dal Google Sheet (o da `js/config.js` finché il foglio non è collegato).
- [ ] **Privacy**: in `_pagine/privacy.html` inserisci il nome del titolare del trattamento, al posto di `[NOME E COGNOME DEL TITOLARE]`, poi rigenera le pagine.
- [ ] **Lezione di prova**: il vecchio sito diceva "la prima lezione è sempre gratuita". Se vale ancora, è un ottimo argomento da aggiungere in home.
- [ ] **Prezzi**: non li ho inseriti. Se volete mostrarli, si aggiunge una sezione.
