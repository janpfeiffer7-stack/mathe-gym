import { fmt } from '../../core/zahl.js';
import { lZahl, rechnung } from '../baukasten.js';

/* 5.5 Rechnen und flexibel rechnen */

export default [
{
  id: '5.5.kopf', thema: '5.5', eingabe: 'zahl',
  lernziel: 'Im Kopf addieren und subtrahieren',
  params(stufe, rnd) {
    const einheit = stufe === 'basis' ? 10 : (stufe === 'profi' ? 1000 : 100);
    const op = rnd.wahl(['+', '−']);
    let a = rnd.int(2, 90) * einheit;
    let b = rnd.int(1, 80) * einheit;
    if (op === '−' && b >= a) [a, b] = [b, a];
    return { a, b, op };
  },
  loesung: p => lZahl(p.op === '+' ? p.a + p.b : p.a - p.b),
  frage: p => ({
    html: 'Rechne im Kopf:<br>' + rechnung(fmt(p.a) + ' ' + p.op + ' ' + fmt(p.b)),
    hinweis: 'Rechne mit den Tausendern, Hundertern und Zehnern getrennt und zähle am Schluss zusammen.'
  }),
  weg: (p, l) => fmt(p.a) + ' ' + p.op + ' ' + fmt(p.b) + ' = <strong>' + fmt(l.wert) + '</strong>',
  entartet: (p, l) => l.wert === 0 ? 'Ergebnis 0' : null
},

{
  id: '5.5.malzehner', thema: '5.5', eingabe: 'zahl',
  lernziel: 'Mit Zehner- und Hunderterzahlen multiplizieren',
  params(stufe, rnd) {
    const a = rnd.int(2, 9) * rnd.wahl(stufe === 'basis' ? [1, 10] : [10, 100]);
    const b = rnd.int(2, 9) * rnd.wahl(stufe === 'basis' ? [10] : (stufe === 'profi' ? [100, 1000] : [10, 100]));
    return { a, b };
  },
  loesung: p => lZahl(p.a * p.b),
  frage: p => ({
    html: 'Rechne aus:<br>' + rechnung(fmt(p.a) + ' · ' + fmt(p.b)),
    hinweis: 'Multipliziere zuerst die beiden Anfangsziffern und hänge dann alle Nullen an.'
  }),
  weg: (p, l) => {
    const za = p.a / Math.pow(10, String(p.a).length - 1);
    const zb = p.b / Math.pow(10, String(p.b).length - 1);
    const nullen = (String(p.a).length - 1) + (String(p.b).length - 1);
    return za + ' · ' + zb + ' = ' + (za * zb) + ', dann ' + nullen +
      (nullen === 1 ? ' Null' : ' Nullen') + ' anhängen → <strong>' + fmt(l.wert) + '</strong>';
  }
},

{
  id: '5.5.durchzehner', thema: '5.5', eingabe: 'zahl',
  lernziel: 'Durch Zehner- und Hunderterzahlen dividieren',
  params(stufe, rnd) {
    const ergebnis = rnd.int(3, 40) * rnd.wahl(stufe === 'basis' ? [1] : [1, 10]);
    const divisor = rnd.int(2, 9) * rnd.wahl(stufe === 'basis' ? [10] : [10, 100]);
    return { ergebnis, divisor };
  },
  loesung: p => lZahl(p.ergebnis),
  frage: p => ({
    html: 'Rechne aus:<br>' + rechnung(fmt(p.ergebnis * p.divisor) + ' : ' + fmt(p.divisor)),
    hinweis: 'Streiche bei Dividend und Divisor gleich viele Nullen weg.'
  }),
  weg: (p, l) => fmt(p.ergebnis * p.divisor) + ' : ' + fmt(p.divisor) + ' = <strong>' + fmt(l.wert) + '</strong>'
},

{
  id: '5.5.verteilung', thema: '5.5', eingabe: 'zahl',
  lernziel: 'Verteilungsgesetz anwenden',
  params(stufe, rnd) {
    const a = rnd.wahl([3, 4, 6, 7, 8, 9]);
    const zehner = rnd.int(2, stufe === 'profi' ? 12 : 9) * 10;
    const einer = rnd.int(1, 9);
    return { a, zehner, einer };
  },
  loesung: p => lZahl(p.a * (p.zehner + p.einer)),
  frage: p => ({
    html: 'Rechne geschickt mit dem Verteilungsgesetz:<br>' + rechnung(p.a + ' · ' + (p.zehner + p.einer)),
    hinweis: 'Zerlege ' + (p.zehner + p.einer) + ' in ' + p.zehner + ' + ' + p.einer +
             ' und multipliziere beide Teile einzeln mit ' + p.a + '.'
  }),
  weg: (p, l) => p.a + ' · ' + (p.zehner + p.einer) + ' = (' + p.a + ' · ' + p.zehner + ') + (' +
    p.a + ' · ' + p.einer + ') = ' + fmt(p.a * p.zehner) + ' + ' + fmt(p.a * p.einer) +
    ' = <strong>' + fmt(l.wert) + '</strong>'
},

{
  id: '5.5.schriftlich', thema: '5.5', eingabe: 'zahl',
  lernziel: 'Mehrere Zahlen addieren',
  params(stufe, rnd) {
    const anzahl = stufe === 'basis' ? 3 : rnd.int(3, 5);
    const max = stufe === 'profi' ? 90000 : 900;
    const zahlen = [];
    for (let i = 0; i < anzahl; i++) zahlen.push(rnd.int(101, max));
    return { zahlen };
  },
  loesung: p => lZahl(p.zahlen.reduce((a, b) => a + b, 0)),
  frage: p => ({
    html: 'Addiere:<br>' + rechnung(p.zahlen.map(fmt).join(' + ')),
    hinweis: 'Schreibe die Zahlen stellengerecht untereinander und addiere von rechts nach links.'
  }),
  weg: (p, l) => 'Summe = <strong>' + fmt(l.wert) + '</strong>'
}
];
