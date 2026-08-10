/* Schweizer Zahlenschreibweise.
   Anzeige : Dezimalpunkt, Tausender-Apostroph (’), echtes Minuszeichen (−)
   Eingabe : Punkt oder Komma als Dezimaltrennzeichen, Apostroph/Leerzeichen
             als Tausendertrennung erlaubt, aber nicht verlangt.
   Diese Funktionen stammen unverändert aus der bewährten Vorversion. */

/** Rundung gegen Gleitkomma-Artefakte. */
export function r(x, dez = 6) {
  const f = Math.pow(10, dez);
  return Math.round(x * f) / f;
}

/** Zahl -> Anzeigetext, z. B. 12500 -> "12’500", -3.5 -> "−3.5" */
export function fmt(n) {
  if (typeof n !== 'number' || !isFinite(n)) return String(n);
  n = r(n, 9);
  const neg = n < 0;
  n = Math.abs(n);
  let s = n.toString();
  if (s.indexOf('e') !== -1) s = n.toFixed(9).replace(/0+$/, '').replace(/\.$/, '');
  let [ganz, dez] = s.split('.');
  ganz = ganz.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2019');
  const out = dez ? ganz + '.' + dez : ganz;
  return (neg ? '\u2212' : '') + out;
}

/** Eingabetext -> Zahl. NaN, wenn die Eingabe keine gültige Zahl ist. */
export function parseNum(str) {
  if (str === null || str === undefined) return NaN;
  let s = String(str).trim();
  if (s === '') return NaN;
  s = s.replace(/[\u2019'\s]/g, '');   // Tausendertrennung entfernen
  s = s.replace(/\u2212/g, '-');       // echtes Minus -> normales Minus
  s = s.replace(',', '.');             // Komma als Dezimaltrennzeichen
  if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
  return parseFloat(s);
}

/** Vergleich Kinderantwort <-> Sollwert mit kleiner Toleranz. */
export function gleichZahl(eingabe, sollwert, tol = 1e-6) {
  const u = parseNum(eingabe);
  if (isNaN(u)) return false;
  return Math.abs(u - sollwert) < tol;
}

/** Anzahl Dezimalstellen einer Zahl (für die Validierung). */
export function dezimalstellen(n) {
  const s = String(r(n, 9));
  const i = s.indexOf('.');
  return i === -1 ? 0 : s.length - i - 1;
}
