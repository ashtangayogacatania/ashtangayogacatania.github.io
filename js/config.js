/* =========================================================
   CONFIGURAZIONE DEL SITO — modifica qui, non serve toccare altro
   ========================================================= */
window.YOGA_CONFIG = {
  // WhatsApp: prefisso internazionale senza "+" e senza spazi
  whatsapp: "393516692727",
  whatsappDisplay: "351 669 2727",
  email: "talianova.veronika@gmail.com",

  // Profili social: incolla l'indirizzo quando le pagine saranno create (vuoto = icona nascosta)
  instagram: "",
  facebook: "",

  // URL della Web App di Google Apps Script (vedi cartella google-apps-script/LEGGIMI.md).
  // Finché è vuoto, il sito mostra l'orario qui sotto e le prenotazioni passano da WhatsApp.
  apiUrl: "",

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
