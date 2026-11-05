(function () {
  "use strict";
  var C = window.YOGA_CONFIG || {};
  var GIORNI = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  var MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function waLink(text) { return "https://wa.me/" + C.whatsapp + (text ? "?text=" + encodeURIComponent(text) : ""); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseDate(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function longDate(s) { var d = parseDate(s); return GIORNI[d.getDay()] + " " + d.getDate() + " " + MESI[d.getMonth()]; }
  function lunedi(iso) { var d = parseDate(iso); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return isoDate(d); }
  function addMin(hhmm, min) { var p = hhmm.split(":"); var t = +p[0] * 60 + +p[1] + (+min || 0); return pad(Math.floor(t / 60) % 24) + ":" + pad(t % 60); }

  /* ---------- Contatti, link WhatsApp e social ---------- */
  $$("[data-wa]").forEach(function (a) {
    a.href = waLink(a.getAttribute("data-wa") || "Ciao! Vorrei qualche informazione sulle lezioni di yoga.");
    a.target = "_blank"; a.rel = "noopener";
  });
  $$("[data-email]").forEach(function (a) { a.href = "mailto:" + C.email; if (!a.children.length && !a.textContent.trim()) a.textContent = C.email; });
  $$("[data-wa-number]").forEach(function (el) { el.textContent = C.whatsappDisplay; });
  ["instagram", "facebook"].forEach(function (k) {
    $$("[data-social=" + k + "]").forEach(function (a) { if (C[k]) { a.href = C[k]; } else { a.remove(); } });
  });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Menu mobile + header ---------- */
  var toggle = $(".menu-toggle"), menu = $(".menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }); });
  }
  var header = $(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- Comparsa morbida ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- Calendario lezioni ---------- */
  var box = $("#calendario-lezioni");
  if (!box) return;
  var lezioni = [];
  var online = false; // true quando le prenotazioni passano dal Google Sheet

  function fallbackLezioni() {
    var out = [], now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var giorni = (C.settimaneVisibili || 3) * 7;
    for (var i = 0; i < giorni; i++) {
      var d = new Date(start); d.setDate(start.getDate() + i);
      (C.orario || []).forEach(function (o) {
        if (o.giorno !== d.getDay()) return;
        var p = o.ora.split(":"), when = new Date(d); when.setHours(+p[0], +p[1], 0, 0);
        if (when < now) return;
        out.push({ id: isoDate(d) + " " + o.ora, data: isoDate(d), ora: o.ora, durata: o.durata, titolo: o.titolo, livello: o.livello, sede: o.sede, posti: o.posti, prenotati: null });
      });
    }
    return out;
  }

  function render() {
    if (!lezioni.length) {
      box.innerHTML = '<p class="loading">Al momento non ci sono lezioni in calendario. Scrivici su WhatsApp per informazioni o per una lezione individuale.</p>';
      return;
    }
    var html = "", lastWeek = "";
    var oggi = isoDate(new Date()), d1 = new Date(); d1.setDate(d1.getDate() + 1);
    var domani = isoDate(d1);
    var lunediOggi = lunedi(oggi);
    lezioni.forEach(function (l, i) {
      // separatore per settimana: "Questa settimana", "Settimana prossima", "Dal 23 novembre"
      var w = lunedi(l.data);
      if (w !== lastWeek) {
        var diff = Math.round((parseDate(w) - parseDate(lunediOggi)) / 864e5 / 7);
        var lab = diff <= 0 ? "Questa settimana" : diff === 1 ? "Settimana prossima" : "Dal " + parseDate(w).getDate() + " " + MESI[parseDate(w).getMonth()];
        html += '<div class="day-label">' + esc(lab) + "</div>"; lastWeek = w;
      }
      var dt = parseDate(l.data);
      var rel = l.data === oggi ? "Oggi" : l.data === domani ? "Domani" : "";
      var liberi = (l.prenotati == null || !l.posti) ? null : Math.max(0, l.posti - l.prenotati);
      var full = liberi === 0;
      var seats = liberi == null ? "" : full ? '<span class="seats full">Completo</span>' : liberi <= 5 ? '<span class="seats">' + liberi + (liberi === 1 ? " posto" : " posti") + "</span>" : "";
      html += '<div class="session' + (full ? " is-full" : "") + '">' +
        '<div class="date-tile' + (rel ? " soon" : "") + '" aria-hidden="true"><span>' + GIORNI[dt.getDay()].slice(0, 3) + "</span><b>" + dt.getDate() + "</b><span>" + MESI[dt.getMonth()].slice(0, 3) + "</span></div>" +
        '<div class="s-body"><div class="s-when"><time datetime="' + esc(l.data + "T" + l.ora) + '"><span class="sr">' + esc(longDate(l.data)) + ", </span>" + esc(l.ora) + "–" + esc(addMin(l.ora, l.durata)) + "</time>" + (rel ? '<span class="rel">' + rel + "</span>" : "") + "</div>" +
        "<h3>" + esc(l.titolo) + seats + '</h3><div class="meta">' + esc([l.livello, l.sede].filter(Boolean).join(" · ")) + "</div></div>" +
        (full
          ? '<a class="btn btn-ghost btn-sm" data-wa-full="' + i + '">Lista d\'attesa</a>'
          : '<button class="btn btn-primary btn-sm" type="button" data-book="' + i + '">Prenota</button>') +
        "</div>";
    });
    box.innerHTML = html;
    $$("[data-book]", box).forEach(function (b) { b.addEventListener("click", function () { openBooking(lezioni[+b.getAttribute("data-book")]); }); });
    $$("[data-wa-full]", box).forEach(function (a) {
      var l = lezioni[+a.getAttribute("data-wa-full")];
      a.href = waLink("Ciao! La lezione di " + longDate(l.data) + " alle " + l.ora + " risulta completa: posso mettermi in lista d'attesa?");
      a.target = "_blank"; a.rel = "noopener";
    });
  }

  function load() {
    if (!C.apiUrl) { lezioni = fallbackLezioni(); render(); return; }
    var ctrl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, 9000);
    fetch(C.apiUrl + "?action=lezioni", ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(t); if (!j.ok) throw new Error(j.error); lezioni = j.lezioni || []; online = true; render(); })
      .catch(function () { clearTimeout(t); lezioni = fallbackLezioni(); online = false; render(); });
  }
  load();

  /* ---------- Modale di prenotazione ---------- */
  var dlg = $("#prenota-dialog"), form = $("#prenota-form"), current = null;

  // Le lezioni del mattino si confermano la sera prima, le altre entro le 14 del giorno stesso
  // (stesse regole del riepilogo automatico nel Google Sheet)
  function scadenzaAvviso(l) {
    return +l.ora.split(":")[0] < 13 ? "entro le 20:00 del giorno prima" : "entro le 14:00 del giorno stesso";
  }
  function minNote(l) {
    var min = +C.minimoPartecipanti || 0;
    if (!min) return "";
    return "La lezione si svolge con almeno " + min + " partecipanti. Se non si raggiunge il numero ti avvisiamo " + scadenzaAvviso(l) + ", così potrai spostarti su un'altra lezione.";
  }

  function openBooking(l) {
    current = l;
    var mn = minNote(l);
    $("#dlg-min").textContent = mn; $("#dlg-min").hidden = !mn;
    $("#dlg-title").textContent = l.titolo;
    $("#dlg-when").textContent = longDate(l.data) + ", ore " + l.ora + " – " + addMin(l.ora, l.durata) + " · " + (l.sede || "");
    $("#dlg-form-wrap").hidden = false; $("#dlg-success").hidden = true;
    $("#form-msg").textContent = ""; $("#form-msg").className = "form-msg";
    $("#dlg-submit").textContent = online ? "Conferma prenotazione" : "Invia richiesta su WhatsApp";
    $("#dlg-submit").className = "btn " + (online ? "btn-primary" : "btn-wa");
    $("#dlg-alt").hidden = !online;
    $("#dlg-wa-alt").href = waLink("Ciao! Vorrei prenotare la lezione di " + longDate(l.data) + " alle " + l.ora + " (" + l.titolo + ").");
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    setTimeout(function () { $("#f-nome").focus(); }, 50);
  }
  function closeBooking() { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); }
  $("#dlg-close").addEventListener("click", closeBooking);
  $("#dlg-done").addEventListener("click", closeBooking);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeBooking(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = $("#form-msg");
    var data = {
      action: "prenota", id: current.id, data: current.data, ora: current.ora, titolo: current.titolo,
      nome: form.nome.value.trim(), telefono: form.telefono.value.trim(), email: form.email.value.trim(),
      note: form.note.value.trim(), privacy: form.privacy.checked, hp: form.sito.value
    };
    if (!data.nome || !data.telefono) { msg.textContent = "Inserisci nome e numero di telefono."; msg.className = "form-msg err"; return; }
    if (!data.privacy) { msg.textContent = "Per procedere serve il consenso al trattamento dei dati."; msg.className = "form-msg err"; return; }

    if (!online) {
      var txt = "Ciao! Vorrei prenotare questa lezione:\n" + current.titolo + "\n" + longDate(current.data) + " ore " + current.ora + "\n\nNome: " + data.nome + "\nTelefono: " + data.telefono + (data.email ? "\nEmail: " + data.email : "") + (data.note ? "\nNote: " + data.note : "");
      window.open(waLink(txt), "_blank", "noopener");
      closeBooking(); return;
    }

    var btn = $("#dlg-submit"); btn.disabled = true; btn.textContent = "Invio in corso…";
    // text/plain evita la richiesta "preflight" CORS, non supportata da Google Apps Script
    fetch(C.apiUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        btn.disabled = false; btn.textContent = "Conferma prenotazione";
        if (!j.ok) { msg.textContent = j.error || "Non è stato possibile completare la prenotazione."; msg.className = "form-msg err"; if (j.lezioni) { lezioni = j.lezioni; render(); } return; }
        $("#dlg-form-wrap").hidden = true; $("#dlg-success").hidden = false;
        $("#dlg-success-text").textContent = "Ti aspettiamo " + longDate(current.data).toLowerCase() + " alle " + current.ora + "." + (data.email ? " Ti abbiamo inviato una email di conferma." : "");
        $("#dlg-success-min").textContent = (+C.minimoPartecipanti) ? "Ricorda: se non si raggiungono " + C.minimoPartecipanti + " partecipanti ti avvisiamo " + scadenzaAvviso(current) + "." : "";
        form.reset(); load();
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = "Conferma prenotazione";
        msg.innerHTML = 'Connessione non riuscita. Riprova oppure <a href="' + esc($("#dlg-wa-alt").href) + '" target="_blank" rel="noopener">prenota su WhatsApp</a>.';
        msg.className = "form-msg err";
      });
  });
})();
