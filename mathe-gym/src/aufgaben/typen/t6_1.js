import { fmt } from '../../core/zahl.js';
import { ggT, kgV, kuerze } from '../../core/bruch.js';
import { F, lZahl, lBruch, lAuswahl, rechnung, jaNeinOptionen, PLATZ } from '../baukasten.js';

/* 6.1 Erweitern, Kürzen, ggT und kgV */

const PRIMZAHLEN = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
const KEINE_PRIM = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 25, 26, 27, 28, 33, 35, 39, 49, 51];

export default [
{
  id: '6.1.ggT', thema: '6.1', eingabe: 'zahl',
  lernziel: 'Grössten gemeinsamen Teiler bestimmen',
  params(stufe, rnd) {
    const g = rnd.int(2, stufe === 'profi' ? 15 : 10);
    const f1 = rnd.int(2, 7);
    const f2 = rnd.intAusser(2, 9, [f1]);
    return { a: g * f1, b: g * f2 };
  },
  loesung: p => lZahl(ggT(p.a, p.b)),
  frage: p => ({
    html: 'Bestimme den <strong>ggT</strong> (grössten gemeinsamen Teiler):<br>' +
      rechnung('ggT(' + fmt(p.a) + ', ' + fmt(p.b) + ')'),
    hinweis: 'Suche die grösste Zahl, durch die sich beide Zahlen ohne Rest teilen lassen.'
  }),
  weg(p, l) {
    const teilerA = []; for (let i = 1; i <= p.a; i++) if (p.a % i === 0) teilerA.push(i);
    const gemeinsam = teilerA.filter(t => p.b % t === 0);
    return 'Gemeinsame Teiler: ' + gemeinsam.join(', ') + '<br>Der grösste davon ist <strong>' + fmt(l.wert) + '</strong>.';
  },
  entartet: (p, l) => (l.wert === p.a || l.wert === p.b) ? 'eine Zahl teilt die andere' : null
},

{
  id: '6.1.kgV', thema: '6.1', eingabe: 'zahl',
  lernziel: 'Kleinstes gemeinsames Vielfaches bestimmen',
  params(stufe, rnd) {
    const a = rnd.int(2, stufe === 'profi' ? 15 : 10);
    const b = rnd.intAusser(2, 12, [a]);
    return { a, b };
  },
  loesung: p => lZahl(kgV(p.a, p.b)),
  frage: p => ({
    html: 'Bestimme das <strong>kgV</strong> (kleinste gemeinsame Vielfache):<br>' +
      rechnung('kgV(' + p.a + ', ' + p.b + ')'),
    hinweis: 'Zähle die Vielfachen beider Zahlen auf und suche das erste, das in beiden Reihen vorkommt.'
  }),
  weg(p, l) {
    const va = []; for (let i = 1; i <= 6; i++) va.push(p.a * i);
    const vb = []; for (let i = 1; i <= 6; i++) vb.push(p.b * i);
    return 'Vielfache von ' + p.a + ': ' + va.join(', ') + ' …<br>Vielfache von ' + p.b + ': ' + vb.join(', ') +
      ' …<br>Das erste gemeinsame ist <strong>' + fmt(l.wert) + '</strong>.';
  },
  entartet: (p, l) => (l.wert === p.a || l.wert === p.b) ? 'eine Zahl ist Vielfaches der anderen' : null
},

{
  id: '6.1.primzahl', thema: '6.1', eingabe: 'auswahl',
  lernziel: 'Primzahlen erkennen',
  params(stufe, rnd) {
    const istPrim = rnd.zahl() < 0.5;
    return { zahl: istPrim ? rnd.wahl(PRIMZAHLEN) : rnd.wahl(KEINE_PRIM) };
  },
  loesung: p => lAuswahl(PRIMZAHLEN.includes(p.zahl)),
  optionen: () => jaNeinOptionen('Ja, es ist eine Primzahl', 'Nein, es ist keine Primzahl'),
  frage: p => ({
    html: 'Ist <strong>' + p.zahl + '</strong> eine Primzahl?',
    hinweis: 'Eine Primzahl lässt sich nur durch 1 und durch sich selbst ohne Rest teilen.'
  }),
  weg(p) {
    if (PRIMZAHLEN.includes(p.zahl)) {
      return p.zahl + ' hat nur die Teiler 1 und ' + p.zahl + ' → <strong>Primzahl</strong>.';
    }
    const teiler = [];
    for (let i = 2; i < p.zahl; i++) if (p.zahl % i === 0) teiler.push(i);
    return p.zahl + ' ist auch durch ' + teiler.join(' und ') + ' teilbar → <strong>keine Primzahl</strong>.';
  },
  erlaubeLoesungImText: true
},

{
  id: '6.1.erweitern', thema: '6.1', eingabe: 'zahl',
  lernziel: 'Brüche erweitern',
  params(stufe, rnd) {
    const n = rnd.wahl([3, 4, 5, 6, 8, 10]);
    return { z: rnd.int(1, n - 1), n, faktor: rnd.wahl(stufe === 'profi' ? [3, 4, 5, 6, 7] : [2, 3, 4, 5]) };
  },
  loesung: p => lZahl(p.z * p.faktor),
  frage: p => ({
    html: 'Erweitere den Bruch:<br>' + rechnung(F(p.z, p.n) + ' = ' + F(PLATZ, p.n * p.faktor)),
    hinweis: 'Der Nenner ' + p.n + ' wurde mit ' + p.faktor + ' multipliziert. Mach mit dem Zähler dasselbe.'
  }),
  weg: (p, l) => p.n + ' · ' + p.faktor + ' = ' + (p.n * p.faktor) + ', also auch ' + p.z + ' · ' + p.faktor +
    ' = <strong>' + fmt(l.wert) + '</strong>'
},

{
  id: '6.1.kuerzen', thema: '6.1', eingabe: 'bruch',
  lernziel: 'Brüche vollständig kürzen',
  params(stufe, rnd) {
    const g = rnd.int(2, stufe === 'profi' ? 12 : 8);
    const zk = rnd.int(1, 6);
    let nk = rnd.intAusser(2, 9, [zk]);
    return { z: zk * g, n: nk * g, g };
  },
  loesung(p) {
    const [z, n] = kuerze(p.z, p.n);
    return lBruch(z, n, 'gekuerzt');
  },
  frage: p => ({
    html: 'Kürze so weit wie möglich:<br>' + rechnung(F(p.z, p.n)),
    hinweis: 'Teile Zähler und Nenner durch ihren grössten gemeinsamen Teiler.'
  }),
  weg: (p, l) => 'ggT(' + p.z + ', ' + p.n + ') = ' + ggT(p.z, p.n) + '<br>' +
    p.z + ' : ' + ggT(p.z, p.n) + ' = ' + l.z + ' und ' + p.n + ' : ' + ggT(p.z, p.n) + ' = ' + l.n +
    ' → <strong>' + F(l.z, l.n) + '</strong>',
  entartet: (p) => ggT(p.z, p.n) === 1 ? 'Bruch ist bereits gekürzt' : null
},

{
  id: '6.1.gleichwertig', thema: '6.1', eingabe: 'auswahl',
  lernziel: 'Gleichwertige Brüche finden',
  params(stufe, rnd) {
    const n = rnd.wahl([2, 3, 4, 5, 6]);
    const z = rnd.int(1, n - 1);            // echter Bruch: schliesst z = n aus
    return { z, n, faktor: rnd.wahl([2, 3, 4]) };
  },
  loesung: p => lAuswahl((p.z * p.faktor) / (p.n * p.faktor)),
  optionen(p, l, rnd) {
    const richtig = { z: p.z * p.faktor, n: p.n * p.faktor };
    const kandidaten = [
      richtig,
      { z: richtig.z, n: richtig.n + 1 },
      { z: richtig.z + 1, n: richtig.n },
      { z: p.z + p.faktor, n: p.n + p.faktor },
      { z: richtig.z, n: richtig.n + 2 },
      { z: richtig.z + 2, n: richtig.n }
    ];
    const zielwert = l.wert;
    const gesehen = new Set([zielwert.toFixed(9)]);
    const opt = [{ text: F(richtig.z, richtig.n), wert: zielwert }];
    for (const k of kandidaten.slice(1)) {
      if (k.z <= 0 || k.n <= 0) continue;
      const w = k.z / k.n;
      const schl = w.toFixed(9);
      if (gesehen.has(schl)) continue;      // verhindert eine zweite richtige Antwort
      gesehen.add(schl);
      opt.push({ text: F(k.z, k.n), wert: w });
      if (opt.length === 4) break;
    }
    return opt;
  },
  frage: p => ({
    html: 'Welcher Bruch ist gleichwertig zu ' + F(p.z, p.n) + '?',
    hinweis: 'Bei gleichwertigen Brüchen werden Zähler und Nenner mit derselben Zahl multipliziert.'
  }),
  weg: p => F(p.z, p.n) + ' mit ' + p.faktor + ' erweitert: ' + p.z + ' · ' + p.faktor + ' = ' + (p.z * p.faktor) +
    ' und ' + p.n + ' · ' + p.faktor + ' = ' + (p.n * p.faktor) + ' → <strong>' + F(p.z * p.faktor, p.n * p.faktor) + '</strong>'
}
];
