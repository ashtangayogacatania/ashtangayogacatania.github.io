/* =========================================================
   ACCESSO CON CODICE (temporaneo, finché il sito è in costruzione)
   Il codice si chiede una volta per visita: vale finché non si chiude la scheda.
   Per toglierlo: elimina il <script src="js/accesso.js"> e il meta robots "noindex"
   da index.html, poi rilancia _strumenti/genera-pagine.py.
   Nota: è un filtro per i visitatori, non una protezione vera (il sito è pubblico).
   ========================================================= */
(function () {
  "use strict";
  // SHA-256 del codice in minuscolo (codice attuale: quello comunicato a Valerio)
  var HASH = "a43dd97001f3a11f5fd2e1803f39cac63c51e06fab9ebf8abc91cf3dea3018ef";
  var KEY = "yoga_accesso";

  function ok() { try { return sessionStorage.getItem(KEY) === HASH; } catch (e) { return false; } }
  if (ok()) return;

  var root = document.documentElement;
  root.classList.add("locked");
  var st = document.createElement("style");
  st.textContent =
    "html.locked body>*:not(#gate){display:none!important}" +
    "#gate{position:fixed;inset:0;display:grid;place-items:center;padding:16px;background:var(--bg,#FBF9F6);z-index:9999}" +
    "#gate form{width:100%;max-width:360px;background:var(--surface,#fff);border:1px solid var(--line,#E6E0D7);border-radius:14px;padding:32px 28px;text-align:center;box-shadow:0 14px 40px rgba(42,40,38,.08)}" +
    "#gate h1{font:500 1.7rem/1.2 var(--serif,serif);margin:0 0 6px}" +
    "#gate p{color:var(--muted,#6B665F);font-size:.95rem;margin:0 0 20px}" +
    "#gate input{width:100%;box-sizing:border-box;font:inherit;font-size:1rem;padding:12px 14px;border:1px solid var(--line,#E6E0D7);border-radius:10px;margin-bottom:12px;text-align:center}" +
    "#gate input:focus{outline:2px solid var(--accent,#9E5A3C);outline-offset:1px}" +
    "#gate button{width:100%;font:600 1rem var(--sans,sans-serif);padding:12px;border:0;border-radius:999px;background:var(--accent,#9E5A3C);color:#fff;cursor:pointer}" +
    "#gate .err{color:#A33;font-size:.9rem;min-height:1.3em;margin:10px 0 0}";
  document.head.appendChild(st);

  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function hash(s) {
    if (window.crypto && crypto.subtle && window.TextEncoder) return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(hex);
    return Promise.resolve(""); // browser senza crypto.subtle: nessun accesso
  }

  function mostra() {
    var g = document.createElement("div");
    g.id = "gate";
    g.innerHTML =
      '<form autocomplete="off">' +
      "<h1>Ashtanga Yoga Catania</h1>" +
      "<p>Il sito è in costruzione. Inserisci il codice per entrare.</p>" +
      '<input type="password" name="codice" aria-label="Codice di accesso" placeholder="Codice" required>' +
      '<button type="submit">Entra</button>' +
      '<p class="err" role="alert"></p>' +
      "</form>";
    document.body.appendChild(g);
    var f = g.querySelector("form"), inp = g.querySelector("input"), err = g.querySelector(".err");
    inp.focus();
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      hash(inp.value.trim().toLowerCase()).then(function (h) {
        if (h === HASH) {
          try { sessionStorage.setItem(KEY, HASH); } catch (x) {}
          root.classList.remove("locked");
          g.remove();
          // se il link puntava a una sezione (es. #prezzi) vai lì, anche dopo il caricamento del calendario
          var t = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
          if (t) {
            var vai = function () { t.scrollIntoView({ behavior: "auto", block: "start" }); };
            requestAnimationFrame(vai); setTimeout(vai, 1200);
          }
        } else {
          err.textContent = "Codice non corretto.";
          inp.select();
        }
      });
    });
  }
  if (document.body) mostra(); else document.addEventListener("DOMContentLoaded", mostra);
})();
