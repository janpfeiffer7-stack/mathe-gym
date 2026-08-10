/* Brüche: Rechnen, Darstellen, Eingabe prüfen.
   Gegenüber der Vorversion geändert: Dezimalzahlen werden bei Bruchaufgaben
   NICHT mehr als Bruch akzeptiert (siehe docs/entscheide.md, Punkt F1). */

export function ggT(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

export function kgV(a, b) {
  return Math.abs(a * b) / ggT(a, b);
}

export function kuerze(z, n) {
  const g = ggT(z, n) || 1;
  return [z / g, n / g];
}

export function istGekuerzt(z, n) {
  return ggT(z, n) === 1;
}

/** HTML-Darstellung eines Bruchs (auch mit Platzhaltern wie "▢"). */
export function bruchHTML(z, n) {
  return '<span class="frac"><span class="fz">' + z + '</span>' +
         '<span class="fn">' + n + '</span></span>';
}

/** Gemischte Zahl als HTML, z. B. 1 3/4 */
export function gemischtHTML(ganz, z, n) {
  return '<span class="gemischt"><span class="gz">' + ganz + '</span>' + bruchHTML(z, n) + '</span>';
}

/**
 * Bruch-Eingabe auswerten.
 * Erlaubt: "3/4", "7", "1 3/4" (gemischt), auch mit Minus.
 * Nicht erlaubt: "0.75" – Dezimalzahlen sind bei Bruchaufgaben keine gültige Form.
 * Rückgabe: {z, n, ganzTeil, form} oder null.
 *   form: "bruch" | "ganz" | "gemischt"
 */
export function parseBruch(str) {
  if (str === null || str === undefined) return null;
  const s = String(str).trim().replace(/[\u2019'\s]+/g, ' ').replace(/\u2212/g, '-').trim();
  if (s === '') return null;

  let m = s.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);          // gemischte Zahl
  if (m) {
    const g = parseInt(m[1], 10), z = parseInt(m[2], 10), n = parseInt(m[3], 10);
    if (n === 0) return null;
    const vz = g < 0 ? -1 : 1;
    return { z: vz * (Math.abs(g) * n + z), n, ganzTeil: g, form: 'gemischt' };
  }
  m = s.match(/^(-?\d+)\/(-?\d+)$/);                     // einfacher Bruch
  if (m) {
    const z = parseInt(m[1], 10), n = parseInt(m[2], 10);
    if (n === 0) return null;
    return n < 0 ? { z: -z, n: -n, form: 'bruch' } : { z, n, form: 'bruch' };
  }
  m = s.match(/^-?\d+$/);                                // ganze Zahl
  if (m) return { z: parseInt(s, 10), n: 1, form: 'ganz' };

  return null;                                           // alles andere: ungültig
}

/**
 * Bruchantwort prüfen.
 * regel: "gleichwertig" (Standard) | "gekuerzt" | "gemischt"
 */
export function pruefeBruch(eingabe, z, n, regel = 'gleichwertig') {
  const u = parseBruch(eingabe);
  if (!u) return false;
  if (u.n === 0) return false;
  if (u.z * n !== z * u.n) return false;                 // Wert stimmt nicht

  if (regel === 'gekuerzt') return istGekuerzt(u.z, u.n);
  if (regel === 'gemischt') {
    if (Math.abs(z) <= Math.abs(n)) return true;         // kein Ganzes vorhanden
    return u.form === 'gemischt' || u.form === 'ganz';
  }
  return true;
}

/** Unechten Bruch in gemischte Darstellung zerlegen. */
export function alsGemischt(z, n) {
  const vz = z < 0 ? -1 : 1;
  const az = Math.abs(z);
  const ganz = Math.floor(az / n);
  const rest = az - ganz * n;
  return { ganz: vz * ganz, z: rest, n };
}
