import { fmt, r } from '../../core/zahl.js';
import { kgV, kuerze } from '../../core/bruch.js';
import { F, lZahl, lBruch, lAuswahl, rechnung, PLATZ } from '../baukasten.js';

/* 6.8 Anteile, Prozente und Zahlen untersuchen */

const PROZENT_FORMEN = [
  { proz: 50, z: 1, n: 2, dez: 0.5 },
  { proz: 25, z: 1, n: 4, dez: 0.25 },
  { proz: 75, z: 3, n: 4, dez: 0.75 },
  { proz: 20, z: 1, n: 5, dez: 0.2 },
  { proz: 40, z: 2, n: 5, dez: 0.4 },
  { proz: 60, z: 3, n: 5, dez: 0.6 },
  { proz: 10, z: 1, n: 10, dez: 0.1 },
  { proz: 30, z: 3, n: 10, dez: 0.3 },
  { proz: 5,  z: 1, n: 20, dez: 0.05 }
];

const GROSSE_ZAHLEN = [
  ['3 Millionen', 3000000], ['12 Millionen', 12000000], ['45 Millionen', 45000000],
  ['250 Millionen', 250000000], ['1 Milliarde', 1000000000], ['4 Milliarden', 4000000000],
  ['7 Millionen', 7000000], ['80 Millionen', 80000000]
];

const PRIMFAKTOREN = [
  [12, [2, 2, 3]], [18, [2, 3, 3]], [36, [2, 2, 3, 3]], [60, [2, 2, 3, 5]],
  [72, [2, 2, 2, 3, 3]], [80, [2, 2, 2, 2, 5]], [90, [2, 3, 3, 5]], [210, [2, 3, 5, 7]],
  [100, [2, 2, 5, 5]], [126, [2, 3, 3, 7]]
];

export default [
{
  id: '6.8.prozentwert', thema: '6.8', eingabe: 'zahl',
  lernziel: 'Prozentwert berechnen',
  params(stufe, rnd) {
    const proz = rnd.wahl(stufe === 'basis' ? [10, 25, 50, 75] : [5, 10, 15, 20, 25, 30, 40, 60, 75, 80]);
    const grund = rnd.wahl(stufe === 'profi' ? [80, 120, 160, 240, 320, 500, 640] : [20, 40, 60, 80, 100, 200]);
    return { proz, grund };
  },
  loesung: p => lZahl(r(p.grund * p.proz / 100)),
  frage: p => ({
    html: 'Berechne:<br>' + rechnung(p.proz + ' % von ' + fmt(p.grund)),
    hinweis: p.proz + ' % bedeutet ' + F(p.proz, 100) + ' des Ganzen.'
  }),
  weg: (p, l) => fmt(p.grund) + ' : 100 = ' + fmt(r(p.grund / 100)) + ' (das ist 1 %); ' +
    fmt(r(p.grund / 100)) + ' · ' + p.proz + ' = <strong>' + fmt(l.wert) + '</strong>',
  entartet: (p, l) => l.wert === p.grund ? 'Prozentwert gleich Grundwert' : null
},

{
  id: '6.8.prozentForm', thema: '6.8', eingabe: 'auswahl',
  lernziel: 'Prozent, Bruch und Dezimalzahl verbinden',
  params(stufe, rnd) {
    const richtig = rnd.wahl(PROZENT_FORMEN);
    const andere = PROZENT_FORMEN.filter(f => f.proz !== richtig.proz);
    return { richtig, falsche: rnd.auswahl(andere, 3), zeigeBruch: rnd.zahl() < 0.5 };
  },
  loesung: p => lAuswahl(p.zeigeBruch ? p.richtig.z / p.richtig.n : p.richtig.dez),
  optionen(p) {
    const alle = [p.richtig, ...p.falsche];
    return alle.map(f => p.zeigeBruch
      ? { text: F(f.z, f.n), wert: f.z / f.n }
      : { text: fmt(f.dez), wert: f.dez });
  },
  frage: p => ({
    html: 'Welche Angabe entspricht <strong>' + p.richtig.proz + ' %</strong>?',
    hinweis: p.zeigeBruch ? 'Schreibe zuerst Prozent als Hundertstel und kürze dann.' : 'Prozent geteilt durch 100 ergibt die Dezimalzahl.'
  }),
  weg: p => p.richtig.proz + ' % = ' + F(p.richtig.proz, 100) + ' = <strong>' +
    (p.zeigeBruch ? F(p.richtig.z, p.richtig.n) : fmt(p.richtig.dez)) + '</strong>'
},

{
  id: '6.8.ganzes', thema: '6.8', eingabe: 'zahl',
  lernziel: 'Das Ganze aus einem Anteil berechnen',
  params(stufe, rnd) {
    const n = rnd.wahl([3, 4, 5, 6, 8, 10]);
    const teil = stufe === 'profi' ? rnd.int(8, 30) : rnd.int(3, 15);
    return { n, teil };
  },
  loesung: p => lZahl(p.n * p.teil),
  frage: p => ({
    html: F(1, p.n) + ' einer Menge sind <strong>' + fmt(p.teil) + '</strong>.<br>Wie gross ist ' +
      rechnung('die ganze Menge ' + PLATZ) + '?',
    hinweis: 'Das Ganze besteht aus ' + p.n + ' solchen Teilen.'
  }),
  weg: (p, l) => fmt(p.teil) + ' · ' + p.n + ' = <strong>' + fmt(l.wert) + '</strong>'
},

{
  id: '6.8.grosseZahl', thema: '6.8', eingabe: 'zahl',
  lernziel: 'Grosse Zahlen mit Ziffern schreiben',
  maxBetrag: 1e10,                                  // Millionen und Milliarden sind hier erwünscht
  params(stufe, rnd) {
    // Basis: nur Millionen. Standard und Profi: auch Milliarden.
    const bis = stufe === 'basis' ? 4 : GROSSE_ZAHLEN.length - 1;
    return { idx: rnd.int(0, bis) };
  },
  loesung: p => lZahl(GROSSE_ZAHLEN[p.idx][1]),
  frage: p => ({
    html: 'Schreibe mit Ziffern:<br>' + rechnung(GROSSE_ZAHLEN[p.idx][0]),
    hinweis: 'Eine Million hat 6 Nullen, eine Milliarde 9 Nullen.'
  }),
  weg: (p, l) => GROSSE_ZAHLEN[p.idx][0] + ' = <strong>' + fmt(l.wert) + '</strong>'
},

{
  id: '6.8.primfaktoren', thema: '6.8', eingabe: 'auswahl',
  lernziel: 'Primfaktorzerlegung',
  params(stufe, rnd) {
    const richtig = rnd.wahl(PRIMFAKTOREN);
    const andere = PRIMFAKTOREN.filter(f => f[0] !== richtig[0]);
    return { richtig, falsche: rnd.auswahl(andere, 3) };
  },
  loesung: p => lAuswahl(p.richtig[1].join('·')),
  optionen(p) {
    return [p.richtig, ...p.falsche].map(f => ({
      text: f[1].join(' · '), wert: f[1].join('·')
    }));
  },
  frage: p => ({
    html: 'Welches ist die Primfaktorzerlegung von <strong>' + p.richtig[0] + '</strong>?',
    hinweis: 'Teile die Zahl immer wieder durch die kleinste passende Primzahl.'
  }),
  weg(p) {
    const f = p.richtig[1];
    let text = '', rest = p.richtig[0];
    for (const x of f) { text += rest + ' : ' + x + ' = ' + (rest / x) + '<br>'; rest = rest / x; }
    return text + '<strong>' + p.richtig[0] + ' = ' + f.join(' · ') + '</strong>';
  }
},

{
  id: '6.8.bruchAddVerschieden', thema: '6.8', eingabe: 'bruch',
  lernziel: 'Brüche mit verschiedenen Nennern addieren',
  params(stufe, rnd) {
    const paare = stufe === 'basis'
      ? [[1, 2, 1, 4], [1, 3, 1, 6], [1, 2, 1, 6], [1, 4, 1, 8]]
      : [[1, 3, 1, 5], [1, 2, 1, 5], [1, 3, 1, 4], [1, 5, 1, 4], [2, 3, 1, 6], [1, 4, 2, 3], [3, 4, 1, 6], [2, 5, 1, 3]];
    const q = rnd.wahl(paare);
    return { z1: q[0], n1: q[1], z2: q[2], n2: q[3] };
  },
  loesung(p) {
    const n = kgV(p.n1, p.n2);
    const z = p.z1 * (n / p.n1) + p.z2 * (n / p.n2);
    const [zk, nk] = kuerze(z, n);
    return lBruch(zk, nk, 'gekuerzt');
  },
  frage: p => ({
    html: 'Rechne aus und kürze das Ergebnis:<br>' + rechnung(F(p.z1, p.n1) + ' + ' + F(p.z2, p.n2)),
    hinweis: 'Bringe beide Brüche zuerst auf den gemeinsamen Nenner ' + kgV(p.n1, p.n2) + '.'
  }),
  weg(p, l) {
    const n = kgV(p.n1, p.n2);
    const a = p.z1 * (n / p.n1), b = p.z2 * (n / p.n2);
    return '<ol><li>Gemeinsamer Nenner: ' + n + '</li><li>' + F(p.z1, p.n1) + ' = ' + F(a, n) + ' und ' +
      F(p.z2, p.n2) + ' = ' + F(b, n) + '</li><li>' + F(a, n) + ' + ' + F(b, n) + ' = ' + F(a + b, n) +
      ' = <strong>' + F(l.z, l.n) + '</strong></li></ol>';
  }
}
];
