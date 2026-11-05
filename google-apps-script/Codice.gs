/**
 * ASHTANGA YOGA CATANIA — prenotazioni con Google Sheets
 * --------------------------------------------------------
 * Questo script trasforma un Foglio Google in un piccolo sistema di prenotazione gratuito:
 *  - il sito legge da qui il calendario delle lezioni (con i posti liberi)
 *  - le prenotazioni vengono scritte nel foglio "Prenotazioni"
 *  - chi gestisce riceve un'email per ogni prenotazione, il cliente una conferma
 *
 * Installazione: vedi LEGGIMI.md nella stessa cartella.
 */

var FOGLI = {
  ORARIO: "Orario settimanale",
  EXTRA: "Lezioni extra",
  ANNULLATE: "Lezioni annullate",
  PRENOTAZIONI: "Prenotazioni",
  IMPOSTAZIONI: "Impostazioni"
};
var GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
var TZ = "Europe/Rome";

// Impostazioni predefinite (scheda "Impostazioni"). Le righe mancanti vengono aggiunte da installaRiepilogo().
var IMPOSTAZIONI_DEFAULT = [
  ["EMAIL_NOTIFICHE", "ashtangayogacatania@gmail.com", "Dove arrivano le nuove prenotazioni e i riepiloghi"],
  ["NOME_STUDIO", "Ashtanga Yoga Catania", "Nome usato nelle email"],
  ["WHATSAPP", "+39 351 669 2727", "Numero mostrato nelle email di conferma"],
  ["INDIRIZZO", "Istituto Leonardo da Vinci, Via G.B. De La Salle 10/12, Catania (zona Canalicchio)", "Indirizzo nelle email"],
  ["SETTIMANE_VISIBILI", 3, "Quante settimane mostrare sul sito"],
  ["CHIUSURA_PRENOTAZIONI_MIN", 60, "Minuti prima dell'inizio in cui le prenotazioni si chiudono"],
  ["MIN_PARTECIPANTI", 5, "Numero minimo di partecipanti perché la lezione si svolga (0 = nessun minimo)"],
  ["RIEPILOGO_ORA_STESSO_GIORNO", "14:00", "Ora del riepilogo per le lezioni dal pomeriggio in poi (stesso giorno)"],
  ["RIEPILOGO_ORA_GIORNO_PRIMA", "20:00", "Ora del riepilogo per le lezioni del mattino (giorno prima)"],
  ["LEZIONI_MATTINO_FINO_ALLE", "13:00", "Le lezioni che iniziano prima di quest'ora contano come lezioni del mattino"],
  ["PASSWORD_GESTIONE", "", "Password della pagina riservata gestione.html (almeno 10 caratteri; vuota = pagina disattivata)"]
];

/* ============ 1) DA ESEGUIRE UNA SOLA VOLTA: crea i fogli ============ */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(TZ);

  crea_(ss, FOGLI.ORARIO,
    ["Giorno", "Ora", "Durata (min)", "Lezione", "Livello", "Sede", "Posti", "Attiva (SI/NO)"],
    [["Lunedì", "18:30", 90, "Ashtanga Yoga — lezione guidata", "Tutti i livelli", "Istituto Leonardo da Vinci", 15, "SI"],
     ["Mercoledì", "18:30", 90, "Ashtanga Yoga — lezione guidata", "Tutti i livelli", "Istituto Leonardo da Vinci", 15, "SI"],
     ["Sabato", "10:30", 90, "Ashtanga Yoga — guidata & Mysore Style", "Principianti e praticanti", "Istituto Leonardo da Vinci", 15, "SI"]],
    [2]);
  crea_(ss, FOGLI.EXTRA,
    ["Data (gg/mm/aaaa)", "Ora", "Durata (min)", "Lezione", "Livello", "Sede", "Posti"],
    [], [1, 2]);
  crea_(ss, FOGLI.ANNULLATE,
    ["Data (gg/mm/aaaa)", "Ora (vuoto = tutto il giorno)", "Motivo (facoltativo)"],
    [], [1, 2]);
  crea_(ss, FOGLI.PRENOTAZIONI,
    ["Ricevuta il", "Data lezione", "Ora", "Lezione", "Nome", "Telefono", "Email", "Note", "Stato"],
    [], [2, 3]);
  crea_(ss, FOGLI.IMPOSTAZIONI,
    ["Impostazione", "Valore", "Spiegazione"],
    IMPOSTAZIONI_DEFAULT, [2]);
  var s = ss.getSheetByName("Foglio1") || ss.getSheetByName("Sheet1");
  if (s && ss.getSheets().length > 1) ss.deleteSheet(s);

  // Menu di validazione per la colonna Stato
  var p = ss.getSheetByName(FOGLI.PRENOTAZIONI);
  p.getRange("I2:I").setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(["Confermata", "Annullata", "Presente"]).build());
  try { SpreadsheetApp.getUi().alert("Fogli creati! Ora segui il punto 4 del LEGGIMI: Distribuisci → Nuovo deployment → App web."); }
  catch (e) { console.log("Fogli creati! Ora segui il punto 4 del LEGGIMI."); } // dall'editor non si può mostrare l'avviso
}

function crea_(ss, nome, intestazioni, righe, colonneTesto) {
  var sh = ss.getSheetByName(nome) || ss.insertSheet(nome);
  if (sh.getLastRow() > 0) return; // non sovrascrive fogli esistenti
  sh.getRange(1, 1, 1, intestazioni.length).setValues([intestazioni]).setFontWeight("bold").setBackground("#F3EEE7");
  sh.setFrozenRows(1);
  // colonne di testo: evita che Google converta "18:30" in un orario o le date in numeri
  (colonneTesto || []).forEach(function (c) { sh.getRange(2, c, 1000, 1).setNumberFormat("@"); });
  if (righe.length) sh.getRange(2, 1, righe.length, intestazioni.length).setValues(righe);
  sh.autoResizeColumns(1, intestazioni.length);
}

/* ============ 2) API usata dal sito ============ */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || "lezioni";
    if (action === "lezioni") return json_({ ok: true, lezioni: lezioni_() });
    return json_({ ok: false, error: "Azione non valida" });
  } catch (err) {
    return json_({ ok: false, error: "Errore del server" });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var d = JSON.parse(e.postData.contents || "{}");
    if (d.action === "gestione") return json_(gestione_(d));
    if (d.action !== "prenota") return json_({ ok: false, error: "Azione non valida" });
    if (d.hp) return json_({ ok: true }); // trappola anti-spam: i bot compilano il campo nascosto

    var nome = pulisci_(d.nome, 80), tel = pulisci_(d.telefono, 30), email = pulisci_(d.email, 120), note = pulisci_(d.note, 500);
    if (nome.length < 2 || tel.replace(/\D/g, "").length < 6) return json_({ ok: false, error: "Inserisci nome e un numero di telefono valido." });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json_({ ok: false, error: "L'indirizzo email non sembra corretto." });
    if (!d.privacy) return json_({ ok: false, error: "Serve il consenso al trattamento dei dati." });

    // limite anti-abuso: max 6 prenotazioni all'ora dallo stesso numero
    var cache = CacheService.getScriptCache(), k = "t" + tel.replace(/\D/g, "");
    var n = +(cache.get(k) || 0);
    if (n >= 6) return json_({ ok: false, error: "Troppe richieste: riprova più tardi o scrivici su WhatsApp." });
    cache.put(k, String(n + 1), 3600);

    lock.waitLock(15000);
    var tutte = lezioni_();
    var l = tutte.filter(function (x) { return x.data === d.data && x.ora === d.ora; })[0];
    if (!l) return json_({ ok: false, error: "Questa lezione non è più prenotabile.", lezioni: tutte });
    if (l.posti && l.prenotati >= l.posti) return json_({ ok: false, error: "Ci dispiace, la lezione è al completo. Scrivici su WhatsApp per la lista d'attesa.", lezioni: tutte });

    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FOGLI.PRENOTAZIONI);
    var telN = tel.replace(/\D/g, "");
    var gia = sh.getLastRow() > 1 && sh.getRange(2, 2, sh.getLastRow() - 1, 8).getDisplayValues().some(function (r) {
      return isoDa_(r[0]) === l.data && r[1] === l.ora && r[4].replace(/\D/g, "") === telN && r[7] !== "Annullata";
    });
    if (gia) return json_({ ok: false, error: "Risulti già prenotato/a per questa lezione. A presto!" });

    sh.appendRow([new Date(), "'" + itDa_(l.data), "'" + l.ora, l.titolo, nome, "'" + tel, email, note, "Confermata"]);
    SpreadsheetApp.flush();
    lock.releaseLock();

    notifica_(l, nome, tel, email, note);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "Si è verificato un errore. Riprova o prenota su WhatsApp." });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/* ============ Calcolo delle lezioni ============ */
function lezioni_(ignoraChiusura) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var imp = impostazioni_();
  var settimane = +imp.SETTIMANE_VISIBILI || 3;
  var chiusura = ignoraChiusura ? 0 : (+imp.CHIUSURA_PRENOTAZIONI_MIN || 0) * 60000;
  var now = new Date();
  var oggi = Utilities.formatDate(now, TZ, "yyyy-MM-dd");
  var lista = [];

  // lezioni ricorrenti
  var orario = righe_(ss.getSheetByName(FOGLI.ORARIO));
  var mezzogiorno = Utilities.parseDate(oggi + " 12:00", TZ, "yyyy-MM-dd HH:mm"); // evita problemi col cambio d'ora
  for (var i = 0; i < settimane * 7; i++) {
    var giorno = new Date(mezzogiorno.getTime() + i * 86400000);
    var iso = Utilities.formatDate(giorno, TZ, "yyyy-MM-dd");
    var dow = +Utilities.formatDate(giorno, TZ, "u") % 7; // 1=lun … 7=dom → 0=dom
    orario.forEach(function (r) {
      if (String(r[7]).trim().toUpperCase() === "NO") return;
      if (GIORNI.indexOf(String(r[0]).trim().toLowerCase().replace("lunedi", "lunedì").replace("martedi", "martedì").replace("mercoledi", "mercoledì").replace("giovedi", "giovedì").replace("venerdi", "venerdì")) !== dow) return;
      lista.push(lez_(iso, r[1], r[2], r[3], r[4], r[5], r[6]));
    });
  }
  // lezioni extra (workshop, eventi, lezioni straordinarie)
  righe_(ss.getSheetByName(FOGLI.EXTRA)).forEach(function (r) {
    var iso = isoDa_(r[0]);
    if (iso && iso >= oggi) lista.push(lez_(iso, r[1], r[2], r[3], r[4], r[5], r[6]));
  });
  // annullamenti
  var annullate = righe_(ss.getSheetByName(FOGLI.ANNULLATE)).map(function (r) { return { data: isoDa_(r[0]), ora: ora_(r[1]) }; });
  lista = lista.filter(function (l) {
    if (!l.ora || !l.titolo) return false;
    if (annullate.some(function (a) { return a.data === l.data && (!a.ora || a.ora === l.ora); })) return false;
    return inizio_(l).getTime() - chiusura > now.getTime();
  });
  // posti occupati
  var conta = {};
  righe_(ss.getSheetByName(FOGLI.PRENOTAZIONI)).forEach(function (r) {
    if (String(r[8]).trim() === "Annullata") return;
    var key = isoDa_(r[1]) + " " + ora_(r[2]);
    conta[key] = (conta[key] || 0) + 1;
  });
  lista.forEach(function (l) { l.prenotati = conta[l.id] || 0; });
  lista.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
  return lista;
}

function lez_(iso, ora, durata, titolo, livello, sede, posti) {
  var o = ora_(ora);
  return { id: iso + " " + o, data: iso, ora: o, durata: +durata || 60, titolo: String(titolo || "").trim(), livello: String(livello || "").trim(), sede: String(sede || "").trim(), posti: +posti || 0, prenotati: 0 };
}

/* ============ Email ============ */
function notifica_(l, nome, tel, email, note) {
  var imp = impostazioni_();
  var studio = imp.NOME_STUDIO || "Ashtanga Yoga Catania";
  var quando = dataLunga_(l.data) + " alle " + l.ora;
  var liberi = l.posti ? (l.posti - l.prenotati - 1) : "—";
  var min = +imp.MIN_PARTECIPANTI || 0;
  var totale = l.prenotati + 1;
  try {
    if (imp.EMAIL_NOTIFICHE) {
      MailApp.sendEmail({
        to: imp.EMAIL_NOTIFICHE,
        replyTo: email || imp.EMAIL_NOTIFICHE,
        subject: "Nuova prenotazione: " + nome + " — " + quando,
        body: "Nuova prenotazione dal sito\n\nLezione: " + l.titolo + "\nQuando: " + quando + "\n\nNome: " + nome + "\nTelefono: " + tel + "\nEmail: " + (email || "-") + "\nNote: " + (note || "-") + "\n\nPrenotati ora: " + totale + (min ? " (minimo " + min + (totale >= min ? " raggiunto ✓)" : ", ne mancano " + (min - totale) + ")") : "") + "\nPosti ancora liberi: " + liberi + "\n\nApri il foglio: " + SpreadsheetApp.getActiveSpreadsheet().getUrl()
      });
    }
    if (email) {
      MailApp.sendEmail({
        to: email,
        replyTo: imp.EMAIL_NOTIFICHE,
        name: studio,
        subject: "Prenotazione confermata — " + quando,
        body: "Ciao " + nome + ",\n\nla tua prenotazione è confermata:\n\n" + l.titolo + "\n" + quando + " (durata " + l.durata + " minuti)\n" + (imp.INDIRIZZO || l.sede) + (min ? "\n\nLa lezione si svolge con almeno " + min + " partecipanti: se non si raggiunge il numero ti avvisiamo " + scadenzaTesto_(l, imp) + ", così potrai spostarti su un'altra lezione." : "") + "\n\nPorta abbigliamento comodo, il tuo tappetino e una copertina per il rilassamento finale.\n\nSe non puoi più venire, avvisaci rispondendo a questa email o su WhatsApp al " + (imp.WHATSAPP || "") + ": così liberiamo il posto per qualcun altro.\n\nA presto!\n" + studio
      });
    }
  } catch (err) { console.error("Email non inviata: " + err); }
}

/* ============ Riepilogo automatico prima di ogni lezione ============ */
/**
 * DA ESEGUIRE UNA SOLA VOLTA dall'editor: attiva il controllo automatico ogni 15 minuti
 * e aggiunge alla scheda Impostazioni le voci nuove (minimo partecipanti, orari del riepilogo).
 */
function installaRiepilogo() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "controllaRiepiloghi") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("controllaRiepiloghi").timeBased().everyMinutes(15).create();
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FOGLI.IMPOSTAZIONI);
  var esistenti = righe_(sh).map(function (r) { return String(r[0]).trim(); });
  IMPOSTAZIONI_DEFAULT.forEach(function (r) {
    if (esistenti.indexOf(r[0]) >= 0) return;
    sh.appendRow(r);
    // gli orari restano testo, altrimenti Google li converte in date
    if (typeof r[1] === "string" && /^\d{1,2}:\d{2}$/.test(r[1])) sh.getRange(sh.getLastRow(), 2).setNumberFormat("@").setValue(r[1]);
  });
  console.log("Riepilogo automatico attivato.");
}

/** Eseguita in automatico ogni 15 minuti: invia allo studio il riepilogo delle lezioni in arrivo. */
function controllaRiepiloghi() {
  var imp = impostazioni_();
  var props = PropertiesService.getScriptProperties();
  var now = new Date();
  lezioniRiepilogo_().forEach(function (l) {
    var key = "riep_" + l.id;
    if (props.getProperty(key)) return;
    if (now < momentoRiepilogo_(l, imp)) return;
    inviaRiepilogo_(l, imp);
    props.setProperty(key, "1");
  });
  // pulizia dei promemoria passati
  var oggi = Utilities.formatDate(now, TZ, "yyyy-MM-dd");
  Object.keys(props.getProperties()).forEach(function (k) {
    if (k.indexOf("riep_") === 0 && k.substr(5, 10) < oggi) props.deleteProperty(k);
  });
}

// Lezioni che iniziano nelle prossime 36 ore (ignora la chiusura delle prenotazioni)
function lezioniRiepilogo_() {
  var now = new Date().getTime();
  return lezioni_(true).filter(function (l) {
    var t = inizio_(l).getTime();
    return t > now && t - now < 36 * 3600000;
  });
}

function eMattino_(l, imp) { return l.ora < (ora_(imp.LEZIONI_MATTINO_FINO_ALLE) || "13:00"); }

function momentoRiepilogo_(l, imp) {
  if (eMattino_(l, imp)) {
    var mezzogiorno = Utilities.parseDate(l.data + " 12:00", TZ, "yyyy-MM-dd HH:mm");
    var ieri = Utilities.formatDate(new Date(mezzogiorno.getTime() - 86400000), TZ, "yyyy-MM-dd");
    return Utilities.parseDate(ieri + " " + (ora_(imp.RIEPILOGO_ORA_GIORNO_PRIMA) || "20:00"), TZ, "yyyy-MM-dd HH:mm");
  }
  return Utilities.parseDate(l.data + " " + (ora_(imp.RIEPILOGO_ORA_STESSO_GIORNO) || "14:00"), TZ, "yyyy-MM-dd HH:mm");
}

function scadenzaTesto_(l, imp) {
  return eMattino_(l, imp)
    ? "entro le " + (ora_(imp.RIEPILOGO_ORA_GIORNO_PRIMA) || "20:00") + " del giorno prima"
    : "entro le " + (ora_(imp.RIEPILOGO_ORA_STESSO_GIORNO) || "14:00") + " del giorno stesso";
}

function inviaRiepilogo_(l, imp) {
  if (!imp.EMAIL_NOTIFICHE) return;
  var min = +imp.MIN_PARTECIPANTI || 0;
  var iscritti = righe_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FOGLI.PRENOTAZIONI)).filter(function (r) {
    return isoDa_(r[1]) === l.data && ora_(r[2]) === l.ora && String(r[8]).trim() !== "Annullata";
  });
  var n = iscritti.length;
  var ok = !min || n >= min;
  var quando = dataLunga_(l.data) + " alle " + l.ora;
  var stato = n === 0 ? "nessun prenotato" : ok ? "minimo raggiunto" : "minimo NON raggiunto (" + n + " su " + min + ")";
  var elenco = iscritti.map(function (r, i) {
    return (i + 1) + ". " + r[4] + " — " + String(r[5]).replace(/^'/, "") + (r[7] ? " (" + r[7] + ")" : "");
  }).join("\n");
  var corpo = "Riepilogo della lezione\n\n" + l.titolo + "\n" + quando + "\n\n" +
    "Prenotati: " + n + (min ? " (minimo " + min + ")" : "") + "\n" +
    (elenco ? "\n" + elenco + "\n" : "") +
    (ok ? "\nLa lezione può svolgersi regolarmente."
        : "\nIl minimo non è stato raggiunto. Se decidete di annullare:\n" +
          "1) aggiungete la data nella scheda \"Lezioni annullate\" (la lezione sparisce dal sito);\n" +
          "2) avvisate i prenotati qui sopra, ad esempio su WhatsApp, proponendo un'altra lezione.") +
    "\n\nApri il foglio: " + SpreadsheetApp.getActiveSpreadsheet().getUrl();
  MailApp.sendEmail({ to: imp.EMAIL_NOTIFICHE, subject: (ok ? "✓ " : "⚠ ") + "Lezione di " + quando + ": " + stato, body: corpo });
}

/* Prova manuale dall'editor: mostra nel log quando partirebbero i riepiloghi delle prossime lezioni */
function provaRiepilogo() {
  var imp = impostazioni_();
  lezioniRiepilogo_().forEach(function (l) {
    console.log(l.id + " → riepilogo il " + Utilities.formatDate(momentoRiepilogo_(l, imp), TZ, "dd/MM 'alle' HH:mm") + " (prenotati " + l.prenotati + ")");
  });
}

/* ============ Pagina riservata (gestione.html): sola lettura, protetta da password ============ */
function gestione_(d) {
  var imp = impostazioni_();
  var pwd = String(imp.PASSWORD_GESTIONE || "");
  if (pwd.length < 10) return { ok: false, error: "Pagina non attiva: imposta PASSWORD_GESTIONE (almeno 10 caratteri) nella scheda Impostazioni del foglio." };

  // Blocco anti-tentativi: dopo 10 password errate la pagina si blocca per 15 minuti
  var cache = CacheService.getScriptCache();
  var errori = +(cache.get("gestione_err") || 0);
  if (errori >= 10) return { ok: false, error: "Troppi tentativi errati. Riprova tra 15 minuti." };
  if (!uguali_(String(d.password || ""), pwd)) {
    cache.put("gestione_err", String(errori + 1), 900);
    Utilities.sleep(800);
    return { ok: false, auth: false, error: "Password errata." };
  }

  var now = new Date();
  var oggi = Utilities.formatDate(now, TZ, "yyyy-MM-dd");
  var da = Utilities.formatDate(new Date(now.getTime() - 7 * 86400000), TZ, "yyyy-MM-dd");
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var prenotazioni = righe_(ss.getSheetByName(FOGLI.PRENOTAZIONI)).map(function (r) {
    return {
      ricevuta: r[0] instanceof Date ? Utilities.formatDate(r[0], TZ, "dd/MM HH:mm") : String(r[0]),
      data: isoDa_(r[1]), ora: ora_(r[2]), titolo: String(r[3] || ""),
      nome: String(r[4] || ""), telefono: String(r[5] || "").replace(/^'/, ""),
      email: String(r[6] || ""), note: String(r[7] || ""),
      stato: String(r[8] || "").trim() || "Confermata"
    };
  }).filter(function (p) { return p.data && p.data >= da; });

  var lezioni = lezioni_(true).map(function (l) {
    return { id: l.id, data: l.data, ora: l.ora, durata: l.durata, titolo: l.titolo, sede: l.sede, posti: l.posti };
  });
  var annullate = righe_(ss.getSheetByName(FOGLI.ANNULLATE)).map(function (r) {
    return { data: isoDa_(r[0]), ora: ora_(r[1]), motivo: String(r[2] || "") };
  }).filter(function (a) { return a.data && a.data >= da; });

  return {
    ok: true,
    aggiornato: Utilities.formatDate(now, TZ, "dd/MM/yyyy HH:mm"),
    oggi: oggi,
    minimo: +imp.MIN_PARTECIPANTI || 0,
    lezioni: lezioni,
    prenotazioni: prenotazioni,
    annullate: annullate,
    foglio: ss.getUrl()
  };
}

function uguali_(a, b) { // confronto a tempo costante
  if (a.length !== b.length) return false;
  var x = 0;
  for (var i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

/* ============ Utilità ============ */
function impostazioni_() {
  var o = {};
  righe_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FOGLI.IMPOSTAZIONI)).forEach(function (r) { if (r[0]) o[String(r[0]).trim()] = r[1]; });
  return o;
}
function righe_(sh) {
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues().filter(function (r) { return r.join("") !== ""; });
}
function ora_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TZ, "HH:mm");
  var m = String(v || "").trim().match(/^(\d{1,2})[:.](\d{2})/);
  return m ? ("0" + m[1]).slice(-2) + ":" + m[2] : "";
}
function isoDa_(v) { // accetta Date, "gg/mm/aaaa" o "aaaa-mm-gg"
  if (v instanceof Date) return Utilities.formatDate(v, TZ, "yyyy-MM-dd");
  var s = String(v || "").trim(), m;
  if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return m[1] + "-" + m[2] + "-" + m[3];
  if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))) return m[3] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[1]).slice(-2);
  return "";
}
function itDa_(iso) { var p = iso.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
function inizio_(l) { return Utilities.parseDate(l.data + " " + l.ora, TZ, "yyyy-MM-dd HH:mm"); }
function dataLunga_(iso) {
  var mesi = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  var d = Utilities.parseDate(iso + " 12:00", TZ, "yyyy-MM-dd HH:mm");
  var dow = +Utilities.formatDate(d, TZ, "u") % 7;
  var p = iso.split("-");
  return GIORNI[dow] + " " + (+p[2]) + " " + mesi[+p[1] - 1];
}
function pulisci_(v, max) { return String(v || "").replace(/[\u0000-\u001F<>]/g, " ").trim().slice(0, max); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* Prova rapida dall'editor: Esegui → provaLezioni, poi guarda il "Log di esecuzione" */
function provaLezioni() { console.log(JSON.stringify(lezioni_(), null, 2)); }
