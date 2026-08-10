import { fmt, r } from '../../core/zahl.js';
import { lZahl, rechnung, PLATZ } from '../baukasten.js';

/* 5.9 Dezimalrechnen und Gleichungen */

export default [
{
  id: '5.9.klammer', thema: '5.9', eingabe: 'zahl',
  lernziel: 'Klammern und Punkt vor Strich',
  params(stufe, rnd) {
    const form = rnd.wahl(['plusMal', 'malKlammer', 'minusMal']);
    const gross = stufe === 'profi';
    return {
      form,
      a: rnd.int(2, gross ? 15 : 9),
      b: rnd.int(2, 9),
      c: rnd.int(2, gross ? 12 : 9)
    };
  },
  loesung(p) {
    if (p.form === 'plusMal')   return lZahl(p.a + p.b * p.c);
    if (p.form === 'malKlammer') return lZahl(p.a * (p.b + p.c));
    return lZahl(p.b * p.c - p.a);
  },
  frage(p) {
    const t = p.form === 'plusMal'   ? p.a + ' + ' + p.b + ' · ' + p.c
            : p.form === 'malKlammer' ? p.a + ' · (' + p.b + ' + ' + p.c + ')'
            : p.b + ' · ' + p.c + ' − ' + p.a;
    return {
      html: 'Rechne aus:<br>' + rechnung(t),
      hinweis: p.form === 'malKlammer' ? 'Zuerst die Klammer ausrechnen.' : 'Punkt vor Strich: zuerst multiplizieren.'
    };
  },
  weg(p, l) {
    if (p.form === 'plusMal') return p.b + ' · ' + p.c + ' = ' + (p.b * p.c) + '; ' + p.a + ' + ' + (p.b * p.c) + ' = <strong>' + fmt(l.wert) + '</strong>';
    if (p.form === 'malKlammer') return p.b + ' + ' + p.c + ' = ' + (p.b + p.c) + '; ' + p.a + ' · ' + (p.b + p.c) + ' = <strong>' + fmt(l.wert) + '</strong>';
    return p.b + ' · ' + p.c + ' = ' + (p.b * p.c) + '; ' + (p.b * p.c) + ' − ' + p.a + ' = <strong>' + fmt(l.wert) + '</strong>';
  },
  entartet: (p, l) => l.wert <= 0 ? 'Ergebnis nicht positiv' : null
},

{
  id: '5.9.luecke', thema: '5.9', eingabe: 'zahl',
  lernziel: 'Fehlende Zahl in einer Gleichung finden',
  params(stufe, rnd) {
    return {
      a: rnd.int(2, 9),
      x: rnd.int(2, stufe === 'profi' ? 25 : 12),
      b: rnd.int(2, stufe === 'profi' ? 60 : 20)
    };
  },
  loesung: p => lZahl(p.x),
  frage: p => ({
    html: 'Welche Zahl gehört in die Lücke?<br>' +
      rechnung(p.b + ' + (' + p.a + ' · ' + PLATZ + ') = ' + fmt(p.b + p.a * p.x)),
    hinweis: 'Rechne rückwärts: zuerst ' + p.b + ' abziehen, dann durch ' + p.a + ' teilen.'
  }),
  weg: (p, l) => fmt(p.b + p.a * p.x) + ' − ' + p.b + ' = ' + fmt(p.a * p.x) + '; ' +
    fmt(p.a * p.x) + ' : ' + p.a + ' = <strong>' + fmt(l.wert) + '</strong>'
},

{
  id: '5.9.dezMal', thema: '5.9', eingabe: 'zahl',
  lernziel: 'Dezimalzahlen multiplizieren',
  params(stufe, rnd) {
    const nk = stufe === 'basis' ? 1 : 2;
    return { a: rnd.int(2, stufe === 'profi' ? 25 : 12), b: r(rnd.int(11, 99) / Math.pow(10, nk)) };
  },
  loesung: p => lZahl(r(p.a * p.b)),
  frage: p => ({
    html: 'Rechne aus:<br>' + rechnung(p.a + ' · ' + fmt(p.b)),
    hinweis: 'Rechne zuerst ohne Dezimalpunkt und setze den Punkt am Schluss an die richtige Stelle.'
  }),
  weg: (p, l) => p.a + ' · ' + fmt(p.b) + ' = <strong>' + fmt(l.wert) + '</strong>'
},

{
  id: '5.9.prop', thema: '5.9', eingabe: 'zahl',
  lernziel: 'Direkte Proportionalität mit Dezimalzahlen',
  params(stufe, rnd) {
    const pro = r(rnd.int(15, 90) / 10);
    const a = rnd.int(3, 6);
    const b = rnd.intAusser(2, 8, [a]);
    return { pro, a, b, ware: rnd.wahl(['Liter Most', 'kg Äpfel', 'Meter Stoff', 'kg Kirschen']) };
  },
  loesung: p => lZahl(r(p.b * p.pro)),
  frage: p => ({
    html: '<strong>' + p.a + ' ' + p.ware + '</strong> kosten <strong>' + fmt(r(p.a * p.pro)) + ' Fr.</strong><br>' +
          'Wie viel kosten <strong>' + p.b + ' ' + p.ware + '</strong>?',
    hinweis: 'Berechne zuerst den Preis für eine Einheit.',
    einheit: 'Fr.'
  }),
  weg: (p, l) => '<ol><li>1 → ' + fmt(r(p.a * p.pro)) + ' : ' + p.a + ' = ' + fmt(p.pro) + ' Fr.</li>' +
    '<li>' + p.b + ' · ' + fmt(p.pro) + ' = <strong>' + fmt(l.wert) + ' Fr.</strong></li></ol>'
}
];
