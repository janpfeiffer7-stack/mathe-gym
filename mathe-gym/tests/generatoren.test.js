/* Unabhängige mathematische Prüfung.

   Wichtig: Dieser Test benutzt NICHT die Lösungsfunktion des Generators.
   Er liest den fertig gerenderten Aufgabentext, rechnet selbst nach und
   vergleicht das Ergebnis mit der hinterlegten Lösung. Damit wird ein Fehler
   auch dann gefunden, wenn Generator und Lösung denselben Denkfehler teilen. */

import { zufallsquelle } from '../src/core/zufall.js';
import { baueAufgabe } from '../src/aufgaben/index.js';
import { nurText } from '../src/aufgaben/validator.js';
import { STUFEN } from '../src/core/formate.js';
import { ggT as ggTref, kgV as kgVref } from '../src/core/bruch.js';

const PRO_FALL = Number(process.env.M || 400);

/** "12’500" / "−3.5" -> Zahl */
function z(s) {
  return parseFloat(String(s).replace(/[\u2019']/g, '').replace(/\u2212/g, '-'));
}

/** Wertet einen einfachen Term mit + − · : und Klammern aus (Punkt vor Strich). */
function auswerten(term) {
  const t = term.replace(/[\u2019']/g, '').replace(/\u2212/g, '-')
               .replace(/·/g, '*').replace(/:/g, '/').replace(/\s+/g, '');
  if (!/^[-0-9.+*/()]+$/.test(t)) return null;
  try { return Function('"use strict";return (' + t + ')')(); } catch (e) { return null; }
}

/** Extrahiert die grosse Rechnung aus dem Aufgabentext.
    Berücksichtigt verschachtelte <span>-Elemente (Brüche, Lücken). */
function rechnungAus(a) {
  const start = a.frageHTML.indexOf('<span class="rechnung">');
  if (start === -1) return null;
  let i = start + '<span class="rechnung">'.length;
  let tiefe = 1;
  const inhalt = [];
  while (i < a.frageHTML.length && tiefe > 0) {
    if (a.frageHTML.startsWith('<span', i)) tiefe++;
    else if (a.frageHTML.startsWith('</span>', i)) {
      tiefe--;
      if (tiefe === 0) break;
    }
    inhalt.push(a.frageHTML[i]);
    i++;
  }
  return nurText(inhalt.join(''));
}

const PRUEFUNGEN = [];
const P = (typ, fn, was) => PRUEFUNGEN.push({ typ, fn, was });

/* --- Terme, die sich direkt nachrechnen lassen --- */
const TERM_TYPEN = [
  '5.3.mal10', '5.3.addsub', '5.5.kopf', '5.5.malzehner', '5.5.durchzehner',
  '5.5.verteilung', '5.5.schriftlich', '5.9.klammer', '5.9.dezMal',
  '6.5.addsub', '6.5.mal', '6.5.durch', '6.5.zehnerMal',
  '6.9.punktVorStrich', '6.9.klammer'
];
for (const t of TERM_TYPEN) {
  P(t, (a) => {
    const term = rechnungAus(a);
    if (!term) return 'keine Rechnung im Aufgabentext gefunden';
    const wert = auswerten(term);
    if (wert === null) return 'Term nicht auswertbar: ' + term;
    if (Math.abs(wert - a.pruefung.wert) > 1e-6) {
      return 'Term "' + term + '" ergibt ' + wert + ', hinterlegt ist ' + a.pruefung.wert;
    }
    return null;
  }, 'Term aus dem Aufgabentext neu berechnet');
}

/* --- ggT und kgV per Brute Force --- */
P('6.1.ggT', (a) => {
  const m = nurText(a.frageHTML).match(/ggT\((.+?),\s*(.+?)\)/);
  if (!m) return 'Zahlen nicht gefunden';
  const x = z(m[1]), y = z(m[2]);
  let g = 1; for (let i = 1; i <= Math.min(x, y); i++) if (x % i === 0 && y % i === 0) g = i;
  return g === a.pruefung.wert ? null : 'ggT(' + x + ',' + y + ') ist ' + g + ', hinterlegt ' + a.pruefung.wert;
}, 'ggT per Brute Force nachgerechnet');

P('6.1.kgV', (a) => {
  const m = nurText(a.frageHTML).match(/kgV\((\d+),\s*(\d+)\)/);
  if (!m) return 'Zahlen nicht gefunden';
  const x = +m[1], y = +m[2];
  let k = 0; for (let i = 1; i <= x * y; i++) if (i % x === 0 && i % y === 0) { k = i; break; }
  return k === a.pruefung.wert ? null : 'kgV(' + x + ',' + y + ') ist ' + k + ', hinterlegt ' + a.pruefung.wert;
}, 'kgV per Brute Force nachgerechnet');

/* --- Primzahlen per Probedivision --- */
P('6.1.primzahl', (a) => {
  const m = nurText(a.frageHTML).match(/Ist (\d+) eine Primzahl/);
  if (!m) return 'Zahl nicht gefunden';
  const n = +m[1];
  let prim = n > 1;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) { prim = false; break; }
  const gewaehlt = a.pruefung.werte[a.pruefung.richtig];
  return gewaehlt === prim ? null : n + ': Probedivision ergibt prim=' + prim + ', hinterlegt ' + gewaehlt;
}, 'Primzahl per Probedivision geprüft');

/* --- Kürzen: Ergebnis muss wertgleich UND teilerfremd sein --- */
P('6.1.kuerzen', (a) => {
  const m = a.frageHTML.match(/<span class="fz">(\d+)<\/span><span class="fn">(\d+)<\/span>/);
  if (!m) return 'Bruch nicht gefunden';
  const zz = +m[1], nn = +m[2];
  const p = a.pruefung;
  if (zz * p.n !== p.z * nn) return zz + '/' + nn + ' ist nicht wertgleich zu ' + p.z + '/' + p.n;
  if (ggTref(p.z, p.n) !== 1) return 'Ergebnis ' + p.z + '/' + p.n + ' ist nicht vollständig gekürzt';
  return null;
}, 'Kürzung auf Wertgleichheit und Teilerfremdheit geprüft');

/* --- Erweitern --- */
P('6.1.erweitern', (a) => {
  const m = a.frageHTML.match(/<span class="fz">(\d+)<\/span><span class="fn">(\d+)<\/span>[\s\S]*?<span class="fz">.<\/span><span class="fn">(\d+)<\/span>/);
  if (!m) return 'Brüche nicht gefunden';
  const zz = +m[1], nn = +m[2], zielN = +m[3];
  const soll = zz * (zielN / nn);
  return soll === a.pruefung.wert ? null : 'erwartet ' + soll + ', hinterlegt ' + a.pruefung.wert;
}, 'Erweiterung nachgerechnet');

/* --- Auswahlaufgaben: genau eine Option darf richtig sein --- */
P('6.1.gleichwertig', (a) => eindeutigkeit(a), 'Eindeutigkeit der Antwortoptionen');
P('5.1.benennen',    (a) => eindeutigkeit(a), 'Eindeutigkeit der Antwortoptionen');
P('6.8.prozentForm', (a) => eindeutigkeit(a), 'Eindeutigkeit der Antwortoptionen');
P('6.8.primfaktoren',(a) => eindeutigkeit(a), 'Eindeutigkeit der Antwortoptionen');
P('5.7.begriff',     (a) => eindeutigkeit(a), 'Eindeutigkeit der Antwortoptionen');
P('6.5.ueberschlag', (a) => eindeutigkeit(a), 'Eindeutigkeit der Antwortoptionen');
P('6.4.umgekehrt',   (a) => eindeutigkeit(a), 'Eindeutigkeit der Antwortoptionen');

function eindeutigkeit(a) {
  const w = a.pruefung.werte;
  const richtig = w[a.pruefung.richtig];
  const gleich = w.filter(x => (typeof x === 'number' && typeof richtig === 'number')
    ? Math.abs(x - richtig) < 1e-9 : x === richtig).length;
  if (gleich !== 1) return 'mehrere Optionen tragen denselben Wert';
  const texte = a.pruefung.optionen.map(nurText);
  if (new Set(texte).size !== texte.length) return 'doppelte Optionstexte';
  return null;
}

/* --- Operationszeichen: darf nur eine passende Kombination geben --- */
P('6.9.operationszeichen', (a) => {
  const m = nurText(a.frageHTML).match(/(\d+)\s*\u25A2\s*(\d+)\s*\u25A2\s*(\d+)\s*=\s*([\d\u2019']+)/);
  if (!m) return 'Aufgabe nicht lesbar';
  const x = +m[1], y = +m[2], c = +m[3], ziel = z(m[4]);
  const werte = [x + y * c, x * y + c, x * y * c, x + y + c];
  const treffer = werte.filter(v => v === ziel).length;
  return treffer === 1 ? null : treffer + ' Zeichenkombinationen ergeben ' + ziel;
}, 'Mehrdeutigkeit der Operationszeichen ausgeschlossen');

/* --- Prozentwert --- */
P('6.8.prozentwert', (a) => {
  const m = nurText(a.frageHTML).match(/(\d+) % von ([\d\u2019'.]+)/);
  if (!m) return 'Angaben nicht gefunden';
  const soll = z(m[2]) * (+m[1]) / 100;
  return Math.abs(soll - a.pruefung.wert) < 1e-9 ? null : 'erwartet ' + soll + ', hinterlegt ' + a.pruefung.wert;
}, 'Prozentwert nachgerechnet');

/* --- Fläche, Umfang, Volumen --- */
P('6.7.flaeche', (a) => {
  const m = nurText(a.frageHTML).match(/([\d\u2019'.]+) \w+² ?/) ? null : null;
  const t = nurText(a.frageHTML).match(/([\d\u2019'.]+) (\w+) lang und ([\d\u2019'.]+) \2 breit/);
  if (!t) return 'Masse nicht gefunden';
  const soll = z(t[1]) * z(t[3]);
  return Math.abs(soll - a.pruefung.wert) < 1e-9 ? null : 'erwartet ' + soll + ', hinterlegt ' + a.pruefung.wert;
}, 'Rechtecksfläche nachgerechnet');

P('6.7.umfang', (a) => {
  const t = nurText(a.frageHTML).match(/([\d\u2019'.]+) (\w+) lang und ([\d\u2019'.]+) \2 breit/);
  if (!t) return 'Masse nicht gefunden';
  const soll = 2 * (z(t[1]) + z(t[3]));
  return Math.abs(soll - a.pruefung.wert) < 1e-9 ? null : 'erwartet ' + soll + ', hinterlegt ' + a.pruefung.wert;
}, 'Rechtecksumfang nachgerechnet');

P('6.7.volumen', (a) => {
  const t = nurText(a.frageHTML).match(/(\d+) cm lang, (\d+) cm breit und (\d+) cm hoch/);
  if (!t) return 'Masse nicht gefunden';
  const soll = (+t[1]) * (+t[2]) * (+t[3]);
  return soll === a.pruefung.wert ? null : 'erwartet ' + soll + ', hinterlegt ' + a.pruefung.wert;
}, 'Quadervolumen nachgerechnet');

/* --- Kombinatorik --- */
P('6.11.anordnungen', (a) => {
  const m = nurText(a.frageHTML).match(/den (\d+) verschiedenen Buchstaben/);
  if (!m) return 'Anzahl nicht gefunden';
  let f = 1; for (let i = 2; i <= +m[1]; i++) f *= i;
  return f === a.pruefung.wert ? null : 'erwartet ' + f + ', hinterlegt ' + a.pruefung.wert;
}, 'Fakultät nachgerechnet');

P('6.11.medaillen', (a) => {
  const m = nurText(a.frageHTML).match(/(\d+) Athletinnen/);
  if (!m) return 'Anzahl nicht gefunden';
  const n = +m[1], soll = n * (n - 1) * (n - 2);
  return soll === a.pruefung.wert ? null : 'erwartet ' + soll + ', hinterlegt ' + a.pruefung.wert;
}, 'Geordnete Auswahl nachgerechnet');

/* --- Durchschnitt --- */
for (const t of ['5.11.durchschnitt', '6.9.datenMittelwert']) {
  P(t, (a) => {
    const term = rechnungAus(a);
    if (!term) return 'Zahlenreihe nicht gefunden';
    const zahlen = term.split(',').map(s => z(s.trim())).filter(n => !isNaN(n));
    if (zahlen.length < 2) return 'zu wenige Zahlen gelesen';
    const soll = zahlen.reduce((x, y) => x + y, 0) / zahlen.length;
    return Math.abs(soll - a.pruefung.wert) < 1e-9 ? null : 'erwartet ' + soll + ', hinterlegt ' + a.pruefung.wert;
  }, 'Mittelwert aus der Zahlenreihe nachgerechnet');
}

/* --- Ordnen: Reihenfolge muss echt aufsteigend sein --- */
P('5.8.ordnen', (a) => {
  const w = a.pruefung.werte;
  for (let i = 1; i < w.length; i++) if (w[i] <= w[i - 1]) return 'Reihenfolge nicht streng aufsteigend';
  return null;
}, 'Sortierreihenfolge geprüft');

/* --- Nachbarzahlen: Zahl muss echt dazwischen liegen --- */
P('6.3.nachbarn', (a) => {
  const m = a.frageHTML.match(/<span class="fixwert">([^<]+)<\/span>/);
  if (!m) return 'Zahl nicht gefunden';
  const x = z(m[1]);
  const u = a.pruefung.felder[0].wert, o = a.pruefung.felder[1].wert;
  if (!(u < x && x < o)) return 'Zahl ' + x + ' liegt nicht echt zwischen ' + u + ' und ' + o;
  return null;
}, 'Nachbarzahlen auf echte Zwischenlage geprüft');

/* --- Zahlenstrahl --- */
P('6.3.zahlenstrahl', (a) => {
  const m = a.frageHTML.match(/aria-label="Zahlenstrahl von ([^ ]+) bis ([^ ]+) /);
  if (!m) return 'Bereich nicht gefunden';
  const min = z(m[1]), max = z(m[2]), w = a.pruefung.wert;
  if (!(w > min && w < max)) return 'Markierung ' + w + ' liegt nicht im Bereich';
  const schritt = (max - min) / 10;
  const n = (w - min) / schritt;
  if (Math.abs(n - Math.round(n)) > 1e-9) return 'Markierung liegt nicht auf einem Teilstrich';
  return null;
}, 'Position am Zahlenstrahl geprüft');

/* --- Bruchvergleich --- */
for (const t of ['5.8.bruchVergleich']) {
  P(t, (a) => {
    const f = [...a.frageHTML.matchAll(/<span class="fz">(\d+)<\/span><span class="fn">(\d+)<\/span>/g)];
    if (f.length < 2) return 'Brüche nicht gefunden';
    const w1 = +f[0][1] / +f[0][2], w2 = +f[1][1] / +f[1][2];
    const soll = Math.abs(w1 - w2) < 1e-9 ? '=' : (w1 < w2 ? '<' : '>');
    const gewaehlt = a.pruefung.werte[a.pruefung.richtig];
    return soll === gewaehlt ? null : 'erwartet ' + soll + ', hinterlegt ' + gewaehlt;
  }, 'Bruchvergleich nachgerechnet');
}

/* --- Dezimalvergleich --- */
P('6.3.dezVergleich', (a) => {
  const term = rechnungAus(a);
  if (!term) return 'Zahlen nicht gefunden';
  const teile = term.split('?').map(s => z(s.trim()));
  if (teile.length !== 2 || teile.some(isNaN)) return 'Zahlen nicht lesbar';
  const soll = Math.abs(teile[0] - teile[1]) < 1e-9 ? '=' : (teile[0] < teile[1] ? '<' : '>');
  const gewaehlt = a.pruefung.werte[a.pruefung.richtig];
  return soll === gewaehlt ? null : 'erwartet ' + soll + ', hinterlegt ' + gewaehlt;
}, 'Dezimalvergleich nachgerechnet');

/* --- Teilbarkeit --- */
P('5.8.teilbar', (a) => {
  const m = nurText(a.frageHTML).match(/Zahl ([\d\u2019']+) ohne Rest durch (\d+)/);
  if (!m) return 'Angaben nicht gefunden';
  const soll = z(m[1]) % (+m[2]) === 0;
  const gewaehlt = a.pruefung.werte[a.pruefung.richtig];
  return soll === gewaehlt ? null : 'erwartet ' + soll + ', hinterlegt ' + gewaehlt;
}, 'Teilbarkeit nachgerechnet');

/* --- Runden --- */
P('5.8.runden', (a) => {
  const t = nurText(a.frageHTML);
  const mS = t.match(/Runde auf (\w+)/);
  const term = rechnungAus(a);
  if (!mS || !term) return 'Angaben nicht gefunden';
  const einheit = { Zehner: 10, Hunderter: 100, Tausender: 1000 }[mS[1]];
  const zahl = z(term);
  if (!einheit || isNaN(zahl)) return 'Angaben nicht lesbar';
  const soll = Math.round(zahl / einheit) * einheit;
  return soll === a.pruefung.wert ? null : 'erwartet ' + soll + ', hinterlegt ' + a.pruefung.wert;
}, 'Rundung nachgerechnet');

/* ---------------------------------------------------------------- */

export function laufen({ proFall = PRO_FALL, seed = 771120, still = false } = {}) {
  const bericht = { gesamt: 0, fehler: [], abgedeckt: {} };

  for (const pr of PRUEFUNGEN) {
    bericht.abgedeckt[pr.typ] = bericht.abgedeckt[pr.typ] || [];
    bericht.abgedeckt[pr.typ].push(pr.was);

    for (const stufe of STUFEN) {
      const rnd = zufallsquelle(seed + pr.typ.length * 977 + stufe.length);
      for (let i = 0; i < proFall; i++) {
        let a;
        try { a = baueAufgabe(pr.typ, stufe, rnd); }
        catch (e) { bericht.fehler.push({ typ: pr.typ, stufe, grund: 'Erzeugung: ' + e.message }); continue; }
        bericht.gesamt++;
        const problem = pr.fn(a);
        if (problem) {
          bericht.fehler.push({ typ: pr.typ, stufe, grund: problem, frage: nurText(a.frageHTML).slice(0, 100) });
        }
      }
    }
  }

  if (!still) {
    console.log('Unabhängige Nachrechnung: ' + bericht.gesamt + ' Aufgaben, ' +
      Object.keys(bericht.abgedeckt).length + ' Typen mit eigener Prüfregel.');
    if (bericht.fehler.length === 0) console.log('Keine Abweichungen.');
    else {
      const g = {};
      bericht.fehler.forEach(f => { const k = f.typ + ': ' + f.grund.split(',')[0]; g[k] = (g[k] || 0) + 1; });
      Object.keys(g).sort().forEach(k => console.log('  ' + String(g[k]).padStart(5) + ' × ' + k));
      bericht.fehler.slice(0, 10).forEach(f => console.log('   → ' + f.typ + ' [' + f.stufe + '] ' + f.grund + '  « ' + (f.frage || '')));
    }
  }
  return bericht;
}

if (process.argv[1] && process.argv[1].endsWith('generatoren.test.js')) {
  const b = laufen();
  process.exit(b.fehler.length === 0 ? 0 : 1);
}
