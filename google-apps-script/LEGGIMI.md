# Prenotazioni con Google Sheets — installazione (15 minuti, una volta sola)

Da fare con l'account Google di **chi gestisce le prenotazioni** (Veronika).
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
