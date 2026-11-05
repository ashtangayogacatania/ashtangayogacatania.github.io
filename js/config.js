/* =========================================================
   CONFIGURAZIONE DEL SITO — modifica qui, non serve toccare altro
   ========================================================= */
window.YOGA_CONFIG = {
  // WhatsApp: prefisso internazionale senza "+" e senza spazi
  whatsapp: "393516692727",
  whatsappDisplay: "351 669 2727",
  email: "ashtangayogacatania@gmail.com",

  // Profili social: incolla l'indirizzo quando le pagine saranno create (vuoto = icona nascosta)
  instagram: "",
  facebook: "",

  // URL della Web App di Google Apps Script (vedi cartella google-apps-script/LEGGIMI.md).
  // Finché è vuoto, il sito mostra l'orario qui sotto e le prenotazioni passano da WhatsApp.
  apiUrl: "https://script.google.com/macros/s/AKfycbwEwE68fnzhHsf_4HCQn6X1bRfRR1C6Og1bq0BJD36NgQwm4WtasKkj1W3lpihlkAPZ_g/exec",

  // Numero minimo di partecipanti perché la lezione si svolga (0 = nessun minimo).
  // Deve corrispondere a MIN_PARTECIPANTI nella scheda Impostazioni del Google Sheet.
  minimoPartecipanti: 5,

  // LISTINO (quote ASD, pagamento in contanti prima della lezione).
  // Usato sia dalla sezione Prezzi del sito sia dal modulo "Registra pagamento" della pagina riservata.
  //   lezioni: quante lezioni comprende (0 = illimitate nel periodo)
  //   mesi: validità in mesi dalla data di pagamento · meseSolare: vale fino a fine mese
  //   evidenza: "principale" = card in alto sul sito, "consigliato" = card evidenziata
  listino: [
    { id: "singola", nome: "Lezione singola", prezzo: 18, lezioni: 1, evidenza: "principale", nota: "Per provare o per chi viene ogni tanto." },
    { id: "carnet10", nome: "Carnet 10 lezioni", prezzo: 150, lezioni: 10, mesi: 3, evidenza: "consigliato", nota: "Valido 3 mesi dal primo ingresso. Risparmi 30 €." },
    { id: "mensile", nome: "Mensile libero", prezzo: 90, lezioni: 0, meseSolare: true, evidenza: "principale", nota: "Tutte le lezioni del mese, quante ne vuoi." },
    { id: "prova", nome: "Prima lezione", prezzo: 10, lezioni: 1, nota: "Solo per chi viene per la prima volta. I 10 € si scalano dal carnet se lo acquisti entro 7 giorni." },
    { id: "gravidanza8", nome: "Yoga in gravidanza · ciclo di 8 incontri", prezzo: 120, lezioni: 8, mesi: 3, nota: "Dalla 13ª settimana, anche senza esperienza." },
    { id: "individuale", nome: "Lezione individuale", prezzo: 40, lezioni: 1, nota: "Su appuntamento, costruita su di te." },
    { id: "individuale5", nome: "5 lezioni individuali", prezzo: 180, lezioni: 5, mesi: 3, nota: "36 € a lezione · valide 3 mesi." }
  ],
  // Quota associativa annuale ASD (tessera + assicurazione), es. 20. Vuoto = mostra solo la frase senza importo.
  quotaAssociativa: "",

  // Quante settimane di lezioni mostrare nel calendario
  settimaneVisibili: 3,

  // Orario settimanale di riserva (usato solo se apiUrl è vuoto o non raggiungibile).
  // giorno: 1 = lunedì … 6 = sabato, 0 = domenica
  orario: [
    { giorno: 1, ora: "18:30", durata: 90, titolo: "Ashtanga Yoga — lezione guidata", livello: "Tutti i livelli", sede: "Istituto Leonardo da Vinci", posti: 15 },
    { giorno: 3, ora: "18:30", durata: 90, titolo: "Ashtanga Yoga — lezione guidata", livello: "Tutti i livelli", sede: "Istituto Leonardo da Vinci", posti: 15 },
    { giorno: 6, ora: "10:30", durata: 90, titolo: "Ashtanga Yoga — guidata & Mysore Style", livello: "Principianti e praticanti", sede: "Istituto Leonardo da Vinci", posti: 15 }
  ]
};
