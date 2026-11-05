# Prenotazioni con Google Sheets — installazione (15 minuti, una volta sola)

Da fare con l'account Google dello studio: **ashtangayogacatania@gmail.com**.
Le email di conferma partiranno da quell'indirizzo Gmail.

## 1. Crea il foglio
1. Vai su https://sheets.new e chiama il foglio **"Prenotazioni Yoga"**.

## 2. Incolla lo script
1. Nel foglio: menu **Estensioni → Apps Script**.
2. Cancella tutto il contenuto di `Codice.gs` e incolla il contenuto del file [`Codice.gs`](Codice.gs) di questa cartella.
3. Clicca l'icona ⚙️ **Impostazioni progetto** e imposta il fuso orario **(GMT+01:00) Roma**.
4. Salva (icona del dischetto).

## 3. Crea i fogli
1. In alto scegli la funzione **`setup`** e premi **Esegui**.
2. Google chiede le autorizzazioni: *Rivedi autorizzazioni* → scegli l'account → *Avanzate* → *Vai a Prenotazioni Yoga (non sicuro)* → *Consenti*.
   (L'avviso compare perché lo script l'hai scritto tu e non è stato verificato da Google: è normale.)
3. Torna sul foglio: troverai le schede *Orario settimanale*, *Lezioni extra*, *Lezioni annullate*, *Prenotazioni*, *Impostazioni*.

## 4. Pubblica l'app web
1. In Apps Script: **Distribuisci → Nuovo deployment**.
2. Tipo (⚙️): **App web**.
3. *Esegui come*: **Me**. *Chi ha accesso*: **Chiunque**.
4. **Distribuisci** e copia l'**URL dell'app web** (finisce con `/exec`).

## 4b. Attiva il riepilogo automatico (minimo partecipanti)
1. In Apps Script scegli la funzione **`installaRiepilogo`** e premi **Esegui** (Google chiede di autorizzare anche i "trigger").
2. Nella scheda **Impostazioni** compaiono `MIN_PARTECIPANTI` (5) e gli orari del riepilogo:
   - lezioni del mattino (prima delle 13:00): riepilogo alle **20:00 del giorno prima**
   - tutte le altre: riepilogo alle **14:00 dello stesso giorno**
3. A quell'ora arriva un'email a `EMAIL_NOTIFICHE` con i prenotati e l'indicazione "minimo raggiunto" oppure "NON raggiunto".
   La decisione di annullare resta vostra: se annullate, aggiungete la data in *Lezioni annullate* e avvisate i prenotati.

Se cambiate gli orari del riepilogo, aggiornate anche il testo mostrato sul sito (`js/main.js`, funzione `scadenzaAvviso`).

## 4c. Pagina riservata delle prenotazioni (sola lettura)
Indirizzo: **https://ashtangayogacatania.github.io/gestione.html** (non è collegata da nessuna parte del sito e non compare su Google).
1. Nella scheda **Impostazioni**, alla riga `PASSWORD_GESTIONE`, scrivete una password di almeno 10 caratteri, con lettere e numeri.
2. Aprite la pagina e inserite la password. Rimane valida finché non chiudete la scheda del browser.
3. La pagina mostra le prossime lezioni e gli ultimi 7 giorni, con i prenotati, i contatti (WhatsApp, telefono ed email) e lo stato rispetto al minimo. Si aggiorna da sola ogni minuto.
4. Da lì **non si può modificare nulla**. Per annullare o cambiare una prenotazione si usa il foglio.
5. Per cambiare la password basta modificarla nel foglio. Dopo 10 tentativi sbagliati la pagina si blocca per 15 minuti.

## 5. Collega il sito
Apri `js/config.js` e incolla l'URL:
```js
apiUrl: "https://script.google.com/macros/s/XXXXXXXX/exec",
```
Salva e pubblica il sito. Da quel momento il calendario mostra i posti liberi e il pulsante "Prenota" registra direttamente nel foglio.

---

## Uso quotidiano (solo dal foglio, anche dal telefono con l'app Google Sheets)

| Voglio… | Cosa faccio |
|---|---|
| Cambiare giorni/orari fissi | Modifico la scheda **Orario settimanale** (Giorno scritto per esteso, es. `Martedì`; Ora come `18:30`) |
| Sospendere una lezione fissa | Metto `NO` nella colonna *Attiva* |
| Annullare una singola data (festa, malattia) | Aggiungo una riga in **Lezioni annullate** con la data `gg/mm/aaaa` (ora vuota = tutto il giorno) |
| Aggiungere un workshop o una lezione straordinaria | Aggiungo una riga in **Lezioni extra** |
| Annullare la prenotazione di un allievo | Nella scheda **Prenotazioni** imposto *Stato* = `Annullata` (il posto torna libero) |
| Cambiare il numero massimo di posti | Colonna *Posti* |

Le modifiche al foglio compaiono sul sito entro pochi secondi: **non serve ripubblicare nulla**.

## Se modifichi lo script
Dopo ogni modifica al codice: **Distribuisci → Gestisci deployment → ✏️ → Versione: Nuova versione → Distribuisci**.
L'URL resta lo stesso.

## Limiti del piano gratuito
- Gmail gratuito: max **100 email al giorno** inviate dallo script (ogni prenotazione ne usa 1–2): più che sufficiente.
- Nessun costo, nessuna scadenza.
