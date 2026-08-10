/* Baukasten für Aufgabentypen.
   Grundregel: Ein Aufgabentyp beschreibt NUR Parameter. Die Lösung wird in einer
   getrennten Funktion aus diesen Parametern berechnet. Die Frage darf die Lösung
   nicht kennen; nur der Lösungsweg bekommt sie übergeben.

   Ein Aufgabentyp hat die Form:
   {
     id, thema, lernziel, eingabe,
     params(stufe, rnd)        -> Parameterobjekt (reine Daten)
     loesung(p)                -> Lösungsobjekt (siehe unten)
     frage(p)                  -> { html, hinweis, einheit? }
     optionen(p, l, rnd)       -> nur bei eingabe "auswahl": [{text, wert}]
     weg(p, l)                 -> Lösungsweg als HTML
     entartet(p, l)            -> optional: true, wenn die Aufgabe verworfen werden soll
   }

   Lösungsobjekte:
     { art:'zahl',     wert }
     { art:'bruch',    z, n, regel }
     { art:'mehrfeld', felder:[{wert}|{z,n,regel}] }
     { art:'auswahl',  wert }              // Wert der richtigen Option
     { art:'ordnen',   werte:[...] }       // in der richtigen Reihenfolge
*/

import { fmt } from '../core/zahl.js';
import { bruchHTML } from '../core/bruch.js';
import { BRUCHREGEL_TEXT } from '../core/formate.js';

export const F = bruchHTML;

/** Zahlenlösung. */
export const lZahl = (wert) => ({ art: 'zahl', wert });
/** Bruchlösung mit Formatregel. */
export const lBruch = (z, n, regel = 'gleichwertig') => ({ art: 'bruch', z, n, regel });
/** Mehrere Felder. */
export const lFelder = (felder) => ({ art: 'mehrfeld', felder });
/** Auswahl: Wert der richtigen Option. */
export const lAuswahl = (wert) => ({ art: 'auswahl', wert });
/** Ordnen: Werte in richtiger Reihenfolge. */
export const lOrdnen = (werte) => ({ art: 'ordnen', werte });

/** Hilfszeichen für Aufgabentexte. */
export const MAL = '\u00B7';
export const GETEILT = ':';
export const MINUS = '\u2212';
export const PLATZ = '\u25A2';

/** Grosse, hervorgehobene Rechnung im Aufgabentext. */
export function rechnung(text) {
  return '<span class="rechnung">' + text + '</span>';
}

/** Regeltext zu einer Bruchlösung. */
export function regelText(loesung) {
  if (loesung.art === 'bruch') return BRUCHREGEL_TEXT[loesung.regel] || '';
  if (loesung.art === 'mehrfeld') {
    const b = loesung.felder.find(f => f.z !== undefined);
    if (b) return BRUCHREGEL_TEXT[b.regel] || '';
  }
  return '';
}

/** Optionen für Vergleichsaufgaben (<, =, >). */
export function vergleichsOptionen() {
  return [
    { text: 'ist kleiner als  (&lt;)', wert: '<' },
    { text: 'ist gleich  (=)',         wert: '=' },
    { text: 'ist grösser als  (&gt;)', wert: '>' }
  ];
}

/** Ja/Nein-Optionen. */
export function jaNeinOptionen(jaText = 'Ja', neinText = 'Nein') {
  return [{ text: jaText, wert: true }, { text: neinText, wert: false }];
}

/** Baut Zahloptionen aus einer Werteliste (Text automatisch im CH-Format). */
export function zahlOptionen(werte) {
  return werte.map(w => ({ text: fmt(w), wert: w }));
}
