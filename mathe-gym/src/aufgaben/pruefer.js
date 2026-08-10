/* Prüfer: vergleicht die Antwort des Kindes mit der Lösung.
   Bewusst getrennt vom Generator – der Prüfer kennt nur das Prüfobjekt,
   nicht die Parameter, aus denen die Aufgabe entstanden ist. */

import { gleichZahl } from '../core/zahl.js';
import { pruefeBruch } from '../core/bruch.js';

/**
 * @param pruefung  Prüfobjekt der Aufgabe
 * @param antwort   Antwort des Kindes:
 *                  zahl      -> String
 *                  bruch     -> {ganz, z, n} oder String
 *                  mehrfeld  -> Array
 *                  auswahl   -> Index
 *                  ordnen    -> Array von Werten
 * @returns {{leer:boolean, richtig:boolean, teile?:boolean[]}}
 */
export function pruefeAntwort(pruefung, antwort) {
  switch (pruefung.art) {

    case 'zahl': {
      const leer = String(antwort ?? '').trim() === '';
      return { leer, richtig: !leer && gleichZahl(antwort, pruefung.wert, pruefung.tol || 1e-6) };
    }

    case 'bruch': {
      const text = bruchAlsText(antwort);
      const leer = text === '';
      return { leer, richtig: !leer && pruefeBruch(text, pruefung.z, pruefung.n, pruefung.regel) };
    }

    case 'mehrfeld': {
      const werte = Array.isArray(antwort) ? antwort : [];
      let leer = false;
      const teile = pruefung.felder.map((f, i) => {
        const a = werte[i];
        if (f.art === 'bruch') {
          const t = bruchAlsText(a);
          if (t === '') { leer = true; return false; }
          return pruefeBruch(t, f.z, f.n, f.regel);
        }
        if (String(a ?? '').trim() === '') { leer = true; return false; }
        return gleichZahl(a, f.wert, f.tol || 1e-6);
      });
      return { leer, richtig: !leer && teile.every(Boolean), teile };
    }

    case 'auswahl': {
      const leer = antwort === null || antwort === undefined || antwort === -1;
      return { leer, richtig: !leer && Number(antwort) === pruefung.richtig };
    }

    case 'ordnen': {
      const g = Array.isArray(antwort) ? antwort : [];
      const leer = g.length === 0;
      const soll = pruefung.werte;
      const richtig = g.length === soll.length && soll.every((v, i) => Math.abs(v - g[i]) < 1e-9);
      return { leer, richtig };
    }

    default:
      return { leer: true, richtig: false };
  }
}

/** Bruch-Eingabe der Oberfläche in Text umwandeln. */
export function bruchAlsText(a) {
  if (a === null || a === undefined) return '';
  if (typeof a === 'string') return a.trim();
  const ganz = String(a.ganz ?? '').trim();
  const z = String(a.z ?? '').trim();
  const n = String(a.n ?? '').trim();
  if (ganz && !z && !n) return ganz;
  if (!z || !n) return '';
  return ganz ? ganz + ' ' + z + '/' + n : z + '/' + n;
}
