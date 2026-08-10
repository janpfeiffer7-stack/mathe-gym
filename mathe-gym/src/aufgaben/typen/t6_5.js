import { fmt, r } from '../../core/zahl.js';
import { lZahl, lAuswahl, rechnung, zahlOptionen } from '../baukasten.js';

/* 6.5 Dezimalrechnen und Überschlagen */

export default [
{
  id: '6.5.addsub', thema: '6.5', eingabe: 'zahl',
  lernziel: 'Dezimalzahlen addieren und subtrahieren',
  params(stufe, rnd) {
    const nk = stufe === 'basis' ? 1 : 2;
    const t = Math.pow(10, nk);
    const op = rnd.wahl(['+', '−']);
    let a = r(rnd.int(50, stufe === 'profi' ? 9000 : 900) / t);
    let b = r(rnd.int(20, 600) / t);
    if (op === '−' && b >= a) [a, b] = [b, a];
    return { a, b, op };
  },
  loesung: p => lZahl(p.op === '+' ? r(p.a + p.b) : r(p.a - p.b)),
  frage: p => ({
    html: 'Rechne aus:<br>' + rechnung(fmt(p.a) + ' ' + p.op + ' ' + fmt(p.b)),
    hinweis: 'Achte darauf, dass die Dezimalpunkte genau untereinander stehen.'
  }),
  weg: (p, l) => fmt(p.a) + ' ' + p.op + ' ' + fmt(p.b) + ' = <strong>' + fmt(l.wert) + '</strong>',
  entartet: (p, l) => l.wert === 0 ? 'Ergebnis 0' : null
},

{
  id: '6.5.mal', thema: '6.5', eingabe: 'zahl',
  lernziel: 'Dezimalzahlen multiplizieren',
  params(stufe, rnd) {
    const nk = stufe === 'profi' ? 2 : 1;
    return { a: rnd.int(2, stufe === 'profi' ? 40 : 12), b: r(rnd.int(11, 99) / Math.pow(10, nk)) };
  },
  loesung: p => lZahl(r(p.a * p.b)),
  frage: p => ({
    html: 'Rechne aus:<br>' + rechnung(p.a + ' · ' + fmt(p.b)),
    hinweis: 'Rechne ohne Dezimalpunkt und zähle am Schluss die Dezimalstellen der Faktoren zusammen.'
  }),
  weg: (p, l) => p.a + ' · ' + fmt(p.b) + ' = <strong>' + fmt(l.wert) + '</strong>'
},

{
  id: '6.5.durch', thema: '6.5', eingabe: 'zahl',
  lernziel: 'Dezimalzahlen dividieren',
  params(stufe, rnd) {
    const teiler = rnd.int(2, 9);
    const ergebnis = r(rnd.int(11, stufe === 'profi' ? 900 : 200) / 10);
    return { teiler, ergebnis };
  },
  loesung: p => lZahl(p.ergebnis),
  frage: p => ({
    html: 'Rechne aus:<br>' + rechnung(fmt(r(p.ergebnis * p.teiler)) + ' : ' + p.teiler),
    hinweis: 'Teile wie bei ganzen Zahlen und setze den Dezimalpunkt an der richtigen Stelle.'
  }),
  weg: (p, l) => fmt(r(p.ergebnis * p.teiler)) + ' : ' + p.teiler + ' = <strong>' + fmt(l.wert) + '</strong>'
},

{
  id: '6.5.zehnerMal', thema: '6.5', eingabe: 'zahl',
  lernziel: 'Zehner- und Hunderterzahlen mit Dezimalzahlen multiplizieren',
  params(stufe, rnd) {
    const zehner = rnd.wahl(stufe === 'basis' ? [20, 30, 40, 50] : [30, 40, 60, 70, 300, 400, 500]);
    const dez = rnd.wahl([0.1, 0.2, 0.25, 0.5, 1.2, 2.5, 0.05]);
    return { zehner, dez };
  },
  loesung: p => lZahl(r(p.zehner * p.dez)),
  frage: p => ({
    html: 'Rechne aus:<br>' + rechnung(fmt(p.zehner) + ' · ' + fmt(p.dez)),
    hinweis: 'Rechne zuerst mit der Anfangsziffer und berücksichtige danach die Nullen.'
  }),
  weg: (p, l) => fmt(p.zehner) + ' · ' + fmt(p.dez) + ' = <strong>' + fmt(l.wert) + '</strong>'
},

{
  id: '6.5.ueberschlag', thema: '6.5', eingabe: 'auswahl',
  lernziel: 'Ergebnisse überschlagen',
  params(stufe, rnd) {
    const a = rnd.int(21, 89) * 100 + rnd.int(1, 99);
    const b = rnd.int(11, 59) * 100 + rnd.int(1, 99);
    return { a, b };
  },
  loesung(p) {
    return lAuswahl(Math.round((p.a + p.b) / 1000) * 1000);
  },
  optionen(p, l) {
    return zahlOptionen([l.wert - 1000, l.wert, l.wert + 1000, l.wert + 2000]);
  },
  frage: p => ({
    html: 'Welches Ergebnis liegt am nächsten?<br>' + rechnung(fmt(p.a) + ' + ' + fmt(p.b)),
    hinweis: 'Runde beide Zahlen auf Tausender, bevor du zusammenzählst.'
  }),
  weg: (p, l) => 'Gerundet: ' + fmt(Math.round(p.a / 1000) * 1000) + ' + ' + fmt(Math.round(p.b / 1000) * 1000) +
    '. Die genaue Summe ist ' + fmt(p.a + p.b) + ', am nächsten liegt <strong>' + fmt(l.wert) + '</strong>.'
}
];
