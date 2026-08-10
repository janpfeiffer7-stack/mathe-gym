import { fmt, r } from '../../core/zahl.js';
import { F, lZahl, lAuswahl, rechnung } from '../baukasten.js';

/* 5.7 Grössen und Umwandeln */

const UMWANDLUNGEN = [
  { von: 'cm', zu: 'm',   f: 0.01,  werte: () => [5, 10, 25, 50, 75, 120, 250, 340, 450] },
  { von: 'm',  zu: 'km',  f: 0.001, werte: () => [50, 100, 250, 500, 750, 1200, 2500] },
  { von: 'kg', zu: 'g',   f: 1000,  werte: () => [0.5, 1.5, 2, 2.5, 3, 4.5, 7] },
  { von: 'g',  zu: 'kg',  f: 0.001, werte: () => [100, 250, 500, 750, 1500, 2000] },
  { von: 'l',  zu: 'dl',  f: 10,    werte: () => [0.5, 1, 1.5, 2, 3.5, 5, 7.5] },
  { von: 'l',  zu: 'ml',  f: 1000,  werte: () => [0.25, 0.5, 1, 1.5, 2, 3] },
  { von: 'dl', zu: 'l',   f: 0.1,   werte: () => [5, 10, 15, 20, 35, 50, 80] },
  { von: 'min', zu: 's',  f: 60,    werte: () => [2, 3, 5, 6, 10, 12, 15] },
  { von: 'Fr.', zu: 'Rp.', f: 100,  werte: () => [0.5, 1.2, 2.5, 3.05, 4.5, 7.8] }
];

const BEGRIFFE = [
  { begriff: 'das Doppelte',   bedeutung: 'mit 2 multiplizieren' },
  { begriff: 'das Dreifache',  bedeutung: 'mit 3 multiplizieren' },
  { begriff: 'das Vierfache',  bedeutung: 'mit 4 multiplizieren' },
  { begriff: 'das Zehnfache',  bedeutung: 'mit 10 multiplizieren' },
  { begriff: 'die Hälfte',     bedeutung: 'durch 2 teilen' },
  { begriff: 'ein Drittel',    bedeutung: 'durch 3 teilen' },
  { begriff: 'ein Viertel',    bedeutung: 'durch 4 teilen' }
];

export default [
{
  id: '5.7.umwandeln', thema: '5.7', eingabe: 'zahl',
  lernziel: 'Grössen umwandeln',
  params(stufe, rnd) {
    const u = rnd.wahl(UMWANDLUNGEN);
    const liste = u.werte();
    const wert = stufe === 'basis' ? rnd.wahl(liste.slice(0, 5)) : rnd.wahl(liste);
    return { vonIdx: UMWANDLUNGEN.indexOf(u), wert };
  },
  loesung(p) {
    const u = UMWANDLUNGEN[p.vonIdx];
    return lZahl(r(p.wert * u.f));
  },
  frage(p) {
    const u = UMWANDLUNGEN[p.vonIdx];
    return {
      html: 'Wandle um:<br>' + rechnung(fmt(p.wert) + ' ' + u.von + '  =  ?  ' + u.zu),
      hinweis: '1 ' + u.von + ' = ' + fmt(u.f) + ' ' + u.zu + '.',
      einheit: u.zu
    };
  },
  weg(p, l) {
    const u = UMWANDLUNGEN[p.vonIdx];
    return fmt(p.wert) + ' ' + u.von + ' = <strong>' + fmt(l.wert) + ' ' + u.zu + '</strong>';
  }
},

{
  id: '5.7.bruchGroesse', thema: '5.7', eingabe: 'zahl',
  lernziel: 'Bruchteil einer Grösse berechnen',
  params(stufe, rnd) {
    const paare = [
      { gross: 'kg', klein: 'g', f: 1000 },
      { gross: 'm', klein: 'cm', f: 100 },
      { gross: 'l', klein: 'ml', f: 1000 },
      { gross: 'km', klein: 'm', f: 1000 },
      { gross: 'h', klein: 'min', f: 60 }
    ];
    const pa = rnd.wahl(paare);
    const teiler = rnd.wahl(pa.f === 60 ? [2, 3, 4, 5, 6] : [2, 4, 5, 8, 10]);
    const ganze = stufe === 'profi' ? rnd.int(2, 4) : 1;
    return { pa, teiler, ganze };
  },
  loesung: p => lZahl((p.ganze * p.pa.f) / p.teiler),
  frage: p => ({
    html: 'Berechne:<br>' + rechnung(F(1, p.teiler) + ' von ' + p.ganze + ' ' + p.pa.gross + '  =  ?  ' + p.pa.klein),
    hinweis: 'Wandle ' + p.ganze + ' ' + p.pa.gross + ' zuerst in ' + p.pa.klein + ' um und teile dann durch ' + p.teiler + '.',
    einheit: p.pa.klein
  }),
  weg: (p, l) => p.ganze + ' ' + p.pa.gross + ' = ' + fmt(p.ganze * p.pa.f) + ' ' + p.pa.klein + '; ' +
    fmt(p.ganze * p.pa.f) + ' : ' + p.teiler + ' = <strong>' + fmt(l.wert) + ' ' + p.pa.klein + '</strong>',
  entartet: (p) => (p.ganze * p.pa.f) % p.teiler !== 0 ? 'kein glattes Ergebnis' : null
},

{
  id: '5.7.begriff', thema: '5.7', eingabe: 'auswahl',
  lernziel: 'Rechenbegriffe verstehen',
  params(stufe, rnd) {
    // Auswahl über eindeutige Bedeutungen: verhindert zwei gleichlautende Optionen.
    const gewaehlt = rnd.auswahl(BEGRIFFE, 4);
    return { richtig: gewaehlt[0], falsche: gewaehlt.slice(1) };
  },
  loesung: p => lAuswahl(p.richtig.bedeutung),
  optionen: p => [p.richtig, ...p.falsche].map(b => ({ text: b.bedeutung, wert: b.bedeutung })),
  frage: p => ({
    html: 'Was bedeutet <strong>' + p.richtig.begriff + '</strong> einer Zahl?',
    hinweis: 'Überlege zuerst, ob die Zahl grösser oder kleiner wird.'
  }),
  weg: p => '<strong>' + p.richtig.begriff + '</strong> bedeutet: ' + p.richtig.bedeutung + '.'
},

{
  id: '5.7.zahlenraetsel', thema: '5.7', eingabe: 'zahl',
  lernziel: 'Zahlenrätsel rückwärts lösen',
  params(stufe, rnd) {
    const schritte = [
      { art: 'mal', zahl: rnd.wahl([2, 3, 4]) },
      { art: 'plus', zahl: rnd.int(5, 40) },
      { art: 'minus', zahl: rnd.int(5, 30) },
      { art: 'geteilt', zahl: rnd.wahl([2, 3, 4, 5]) }
    ];
    const gewaehlt = rnd.auswahl(schritte, 2);
    const gesucht = rnd.int(4, stufe === 'profi' ? 60 : 30) * 12;   // durch viele Teiler teilbar
    return { gesucht, schritte: gewaehlt };
  },
  loesung: p => lZahl(p.gesucht),
  frage(p) {
    const text = p.schritte.map(s => ({
      mal: 'mit ' + s.zahl + ' multiplizierst',
      geteilt: 'durch ' + s.zahl + ' teilst',
      plus: s.zahl + ' addierst',
      minus: s.zahl + ' subtrahierst'
    })[s.art]);
    return {
      html: 'Wenn du die gesuchte Zahl ' + text[0] + ' und danach ' + text[1] +
            ', erhältst du ' + rechnung(fmt(ergebnisVon(p))) + '<br>Wie heisst die gesuchte Zahl?',
      hinweis: 'Rechne rückwärts und kehre dabei jeden Schritt um.'
    };
  },
  weg(p, l) {
    const umkehr = { mal: 'teile durch', geteilt: 'multipliziere mit', plus: 'subtrahiere', minus: 'addiere' };
    const s = p.schritte;
    return '<ol><li>Vom Ergebnis ' + fmt(ergebnisVon(p)) + ': ' + umkehr[s[1].art] + ' ' + s[1].zahl +
      '</li><li>Dann: ' + umkehr[s[0].art] + ' ' + s[0].zahl +
      '</li><li>Gesuchte Zahl: <strong>' + fmt(l.wert) + '</strong></li></ol>';
  },
  entartet(p) {
    const e = ergebnisVon(p);
    if (!Number.isInteger(e) || e <= 0) return 'kein ganzzahliges Ergebnis';
    if (e === p.gesucht) return 'Schritte heben sich auf';
    const a = p.schritte[0], b = p.schritte[1];
    if (a.art === 'mal' && b.art === 'geteilt' && a.zahl === b.zahl) return 'Schritte heben sich auf';
    if (a.art === 'plus' && b.art === 'minus' && a.zahl === b.zahl) return 'Schritte heben sich auf';
    return null;
  }
}
];

function ergebnisVon(p) {
  let x = p.gesucht;
  for (const s of p.schritte) {
    if (s.art === 'mal') x = x * s.zahl;
    else if (s.art === 'geteilt') x = x / s.zahl;
    else if (s.art === 'plus') x = x + s.zahl;
    else x = x - s.zahl;
  }
  return x;
}
