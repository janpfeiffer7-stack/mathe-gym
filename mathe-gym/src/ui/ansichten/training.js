/* Trainingsablauf.

   Ablauf einer Aufgabe:
     richtig            -> Lob, Buchung, weiter
     1. Fehlversuch     -> "noch nicht", zweiter Versuch, Hinweis anbieten
     2. Fehlversuch     -> Lösungsweg, Buchung als falsch, weiter
     Im Testmodus gibt es weder Hinweis noch zweiten Versuch. */

import { aufgabeAusThema, baueAufgabe, baueAusSpeicher, THEMA_NACH_ID } from '../../aufgaben/index.js';
import { zufallsquelle } from '../../core/zufall.js';
import { pruefeAntwort } from '../../aufgaben/pruefer.js';
import { eingabeFuer } from '../komponenten/eingabe.js';
import { symbol } from '../komponenten/symbole.js';
import { T, ausListe } from '../texte.js';
import { fmt } from '../../core/zahl.js';

export function starteTraining({ wurzel, konfiguration, beiEnde, streifen, buchung }) {
  /* Die Buchung wird von aussen übergeben. Damit hängt der Trainingsablauf
     nicht an der Datenbank und lässt sich auch im Demo-Modus verwenden. */
  const b = buchung || {
    async versuchBuchen() { return null; },
    async testBuchen() { return null; },
    async abzeichenSetzen() {}
  };
  const rnd = zufallsquelle();
  const s = {
    konf: konfiguration,       // {modus, titel, meta, stufe, themaId?, liste?, laenge?, test?}
    index: 0,
    aufgabe: null,
    eingabe: null,
    versuche: 0,
    hinweisBenutzt: false,
    richtigAnzahl: 0,
    gesamtAnzahl: 0,
    testPositionen: [],
    laeuft: true,
    pruefSperre: false
  };

  wurzel.innerHTML = '';
  const kopf = document.createElement('div');
  kopf.className = 'training-kopf';
  kopf.innerHTML =
    '<button type="button" class="knopf leise" id="t-zurueck">← Zurück</button>' +
    '<div><div class="titel">' + s.konf.titel + '</div>' +
    '<div class="meta">' + (s.konf.meta || '') + '</div></div>' +
    '<span class="uhr" id="t-uhr" hidden aria-label="Übungsdauer">00:00</span>';
  wurzel.appendChild(kopf);

  /* Zeitmodus: zeigt nur die verstrichene Übungszeit an.
     Kein Zeitdruck, keine Auswirkung auf die Bewertung, standardmässig aus. */
  let uhrStart = 0, uhrZeiger = null;
  if (s.konf.zeitmodus && !s.konf.test) {
    const uhr = kopf.querySelector('#t-uhr');
    uhr.hidden = false;
    uhrStart = Date.now();
    uhrZeiger = setInterval(() => {
      const sek = Math.floor((Date.now() - uhrStart) / 1000);
      uhr.textContent = String(Math.floor(sek / 60)).padStart(2, '0') + ':' +
                        String(sek % 60).padStart(2, '0');
    }, 1000);
  }
  function uhrStoppen() { if (uhrZeiger) { clearInterval(uhrZeiger); uhrZeiger = null; } }

  const fortschritt = document.createElement('div');
  fortschritt.className = 'training-fortschritt';
  fortschritt.innerHTML =
    '<span class="balken"><span id="t-balken" style="width:0%"></span></span>' +
    '<span class="balken-text" id="t-balkentext"></span>';
  wurzel.appendChild(fortschritt);

  const bereich = document.createElement('div');
  wurzel.appendChild(bereich);

  kopf.querySelector('#t-zurueck').addEventListener('click', () => {
    s.laeuft = false;
    uhrStoppen();
    beiEnde({ abgebrochen: true, richtig: s.richtigAnzahl, gesamt: s.gesamtAnzahl,
              dauer: uhrStart ? Math.floor((Date.now() - uhrStart) / 1000) : 0 });
  });

  /* ---------------- Aufgabe holen ---------------- */
  function naechsteAufgabe() {
    const k = s.konf;
    if (k.liste) {
      if (s.index >= k.liste.length) return null;
      const e = k.liste[s.index];
      if (e.params) {                                 // gespeicherte Fehleraufgabe
        const a = baueAusSpeicher(e);
        if (a) { a.fehlerId = e.fehlerId; return a; }
        // Lässt sich eine alte Aufgabe nicht mehr aufbauen, gibt es Ersatz aus demselben Thema.
        return aufgabeAusThema(e.thema, e.stufe || k.stufe, rnd);
      }
      return baueAufgabe(e.typ, e.stufe || k.stufe, rnd);
    }
    if (k.laenge && s.index >= k.laenge) return null;
    const thema = k.themaId || rnd.wahl(k.themen);
    return aufgabeAusThema(thema, k.stufe, rnd);
  }

  /* ---------------- Anzeige ---------------- */
  function zeichne() {
    const a = s.aufgabe;
    s.versuche = 0;
    s.hinweisBenutzt = false;

    bereich.innerHTML = '';
    const karte = document.createElement('div');
    karte.className = 'aufgabe';

    const thema = THEMA_NACH_ID[a.thema];
    const lernziel = document.createElement('div');
    lernziel.className = 'lernziel';
    lernziel.textContent = (thema ? thema.titel + ' · ' : '') + (a.lernziel || '');
    karte.appendChild(lernziel);

    s.eingabe = eingabeFuer(a);

    // Bei Mehrfeld steckt die Frage bereits in der Eingabekomponente.
    if (a.pruefung.art !== 'mehrfeld') {
      const frage = document.createElement('div');
      frage.className = 'frage';
      frage.innerHTML = a.frageHTML;
      karte.appendChild(frage);
    }
    karte.appendChild(s.eingabe.knoten());

    const rueck = document.createElement('div');
    rueck.className = 'rueckmeldung';
    rueck.id = 't-rueckmeldung';
    rueck.setAttribute('role', 'status');
    rueck.setAttribute('aria-live', 'polite');
    karte.appendChild(rueck);

    const wegPlatz = document.createElement('div');
    wegPlatz.id = 't-weg';
    karte.appendChild(wegPlatz);

    const knoepfe = document.createElement('div');
    knoepfe.className = 'knopfzeile';
    knoepfe.id = 't-knoepfe';
    knoepfe.innerHTML =
      '<button type="button" class="knopf haupt gross" id="t-pruefen">Prüfen</button>' +
      (s.konf.test ? '' : '<button type="button" class="knopf" id="t-hinweis">Hinweis</button>');
    karte.appendChild(knoepfe);

    bereich.appendChild(karte);

    knoepfe.querySelector('#t-pruefen').addEventListener('click', pruefen);
    const hk = knoepfe.querySelector('#t-hinweis');
    if (hk) hk.addEventListener('click', hinweisZeigen);

    s.eingabe.fokus();
    balkenAktualisieren();
  }

  function balkenAktualisieren() {
    const gesamt = s.konf.liste ? s.konf.liste.length : (s.konf.laenge || 10);
    const anteil = Math.min(100, Math.round(s.index / gesamt * 100));
    const b = document.getElementById('t-balken');
    const bt = document.getElementById('t-balkentext');
    if (b) b.style.width = anteil + '%';
    if (bt) {
      bt.textContent = s.konf.liste || s.konf.laenge
        ? 'Aufgabe ' + Math.min(s.index + 1, gesamt) + ' von ' + gesamt
        : s.richtigAnzahl + ' richtig von ' + s.gesamtAnzahl;
    }
  }

  function rueckmeldung(art, text) {
    const r = document.getElementById('t-rueckmeldung');
    if (!r) return;
    const zeichen = art === 'gut' ? '✓' : (art === 'offen' ? '!' : 'i');
    r.className = 'rueckmeldung sichtbar ' + art;
    r.innerHTML = '<span class="zeichen" aria-hidden="true">' + zeichen + '</span><span>' + text + '</span>';
  }

  function hinweisZeigen() {
    s.hinweisBenutzt = true;
    rueckmeldung('info', s.aufgabe.hinweis || 'Geh die Aufgabe Schritt für Schritt durch.');
  }

  function loesungswegZeigen() {
    const platz = document.getElementById('t-weg');
    if (!platz || !s.aufgabe.loesungHTML) return;
    platz.innerHTML = '<div class="loesungsweg"><h4>Lösungsweg</h4>' + s.aufgabe.loesungHTML + '</div>';
  }

  /* ---------------- Prüfen ---------------- */
  async function pruefen() {
    if (s.pruefSperre || !s.laeuft) return;
    const a = s.aufgabe;
    const antwort = s.eingabe.lesen();
    const erg = pruefeAntwort(a.pruefung, antwort);

    if (erg.leer) { rueckmeldung('info', T.bitteAntwort); return; }

    s.pruefSperre = true;                       // Schutz vor Mehrfachklick
    setTimeout(() => { s.pruefSperre = false; }, 400);

    /* ---- Testmodus: keine Hilfen, direkt weiter ---- */
    if (s.konf.test) {
      s.gesamtAnzahl++;
      if (erg.richtig) s.richtigAnzahl++;
      s.testPositionen.push({ thema: a.thema, richtig: erg.richtig });
      await b.versuchBuchen(a, erg.richtig, { versuchNr: 1, quelle: 'test' });
      s.index++;
      weiterOderEnde();
      return;
    }

    if (erg.richtig) {
      s.gesamtAnzahl++;
      s.richtigAnzahl++;
      s.eingabe.sperren();
      s.eingabe.markieren(true, erg.teile, a.pruefung.richtig);
      rueckmeldung('gut', ausListe(T.lob));
      await buchen(true);
      weiterKnopf(true);
      return;
    }

    s.versuche++;
    if (s.versuche === 1) {
      rueckmeldung('offen', ausListe(T.nochNicht));
      s.eingabe.zuruecksetzen();
      const hk = document.getElementById('t-hinweis');
      if (hk) hk.classList.add('haupt');
      return;
    }

    /* zweiter Fehlversuch */
    s.gesamtAnzahl++;
    s.eingabe.sperren();
    s.eingabe.markieren(false, erg.teile, a.pruefung.richtig);
    if (a.pruefung.art === 'ordnen') s.eingabe.loesungZeigen(a.pruefung.werte);
    rueckmeldung('offen', T.zweiterVersuchVorbei);
    loesungswegZeigen();
    await buchen(false);
    weiterKnopf(false);
  }

  async function buchen(richtig) {
    const a = s.aufgabe;
    const stand = await b.versuchBuchen(a, richtig, {
      versuchNr: s.versuche + (richtig ? 1 : 0),
      hinweisBenutzt: s.hinweisBenutzt,
      quelle: s.konf.modus === 'fehler' ? 'fehler' : 'ueben',
      fehlerId: a.fehlerId || null
    });

    if (s.gesamtAnzahl >= 1) b.abzeichenSetzen('erste');
    if (stand && stand.serie >= 5) b.abzeichenSetzen('serie5');
    if (richtig && s.konf.modus === 'fehler') b.abzeichenSetzen('fehler');
  }

  function weiterKnopf(warRichtig) {
    const z = document.getElementById('t-knoepfe');
    if (!z) return;
    z.innerHTML = '<button type="button" class="knopf haupt gross" id="t-weiter">Weiter</button>' +
      (warRichtig && s.aufgabe.loesungHTML ? '<button type="button" class="knopf" id="t-weg-zeigen">Lösungsweg ansehen</button>' : '') +
      (!warRichtig && !s.konf.liste ? '<button type="button" class="knopf" id="t-aehnlich">Ähnliche Aufgabe</button>' : '');

    const w = z.querySelector('#t-weiter');
    w.addEventListener('click', () => { s.index++; weiterOderEnde(); });
    w.focus();

    const wz = z.querySelector('#t-weg-zeigen');
    if (wz) wz.addEventListener('click', () => { loesungswegZeigen(); wz.remove(); });

    const ae = z.querySelector('#t-aehnlich');
    if (ae) ae.addEventListener('click', () => {
      s.aufgabe = baueAufgabe(s.aufgabe.typ, s.aufgabe.stufe, rnd);
      zeichne();
    });
  }

  function weiterOderEnde() {
    if (!s.laeuft) return;
    const naechste = naechsteAufgabe();
    if (!naechste) { beenden(); return; }
    s.aufgabe = naechste;
    zeichne();
  }

  async function beenden() {
    s.laeuft = false;
    uhrStoppen();
    const dauer = uhrStart ? Math.floor((Date.now() - uhrStart) / 1000) : 0;
    if (s.konf.test) {
      const testId = await b.testBuchen(s.konf.stufe, s.richtigAnzahl, s.gesamtAnzahl, s.testPositionen);
      const prozent = Math.round(s.richtigAnzahl / Math.max(1, s.gesamtAnzahl) * 100);
      if (prozent >= 60) b.abzeichenSetzen('test');
      beiEnde({ test: true, richtig: s.richtigAnzahl, gesamt: s.gesamtAnzahl,
                prozent, positionen: s.testPositionen, testId, dauer });
      return;
    }
    beiEnde({ richtig: s.richtigAnzahl, gesamt: s.gesamtAnzahl, dauer });
  }

  /* Tastatur: Enter prüft bzw. geht weiter */
  function beiTaste(e) {
    if (!s.laeuft) return;
    if (e.key !== 'Enter') return;
    const w = document.getElementById('t-weiter');
    const p = document.getElementById('t-pruefen');
    if (w) { e.preventDefault(); w.click(); }
    else if (p && !p.disabled) { e.preventDefault(); p.click(); }
  }
  document.addEventListener('keydown', beiTaste);

  /* Start */
  const erste = naechsteAufgabe();
  if (!erste) { beiEnde({ richtig: 0, gesamt: 0, leer: true }); return { stoppen() {} }; }
  s.aufgabe = erste;
  zeichne();

  return {
    stoppen() {
      s.laeuft = false;
      uhrStoppen();
      document.removeEventListener('keydown', beiTaste);
    }
  };
}
