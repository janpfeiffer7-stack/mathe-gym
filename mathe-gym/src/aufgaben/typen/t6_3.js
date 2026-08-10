import { fmt, r } from '../../core/zahl.js';
import { F, lZahl, lBruch, lAuswahl, lFelder, rechnung, vergleichsOptionen } from '../baukasten.js';
import { zahlenstrahlSVG } from '../../ui/komponenten/zahlenstrahl.js';

/* 6.3 Dezimalzahlen ordnen und Brüche */

const DEZ_ZU_BRUCH = [
  [0.5, 1, 2], [0.25, 1, 4], [0.75, 3, 4], [0.2, 1, 5], [0.6, 3, 5], [0.8, 4, 5],
  [0.1, 1, 10], [0.3, 3, 10], [0.7, 7, 10], [0.05, 1, 20], [0.15, 3, 20],
  [0.12, 3, 25], [0.24, 6, 25], [0.36, 9, 25], [0.08, 2, 25], [0.125, 1, 8], [0.375, 3, 8]
];

export default [
{
  id: '6.3.zahlenstrahl', thema: '6.3', eingabe: 'zahl',
  lernziel: 'Zahlen am Zahlenstrahl ablesen',
  params(stufe, rnd) {
    const bereiche = stufe === 'basis'
      ? [[0, 1], [3, 4], [10, 11]]
      : [[0, 1], [7, 8], [120, 130], [2.4, 2.5], [0.6, 0.7]];
    const b = rnd.wahl(bereiche);
    return { min: b[0], max: b[1], teile: 10, idx: rnd.int(1, 9) };
  },
  loesung: p => lZahl(r(p.min + (p.max - p.min) * p.idx / p.teile)),
  frage: p => ({
    html: 'Welche Zahl markiert der Pfeil?' +
      zahlenstrahlSVG(p.min, p.max, r(p.min + (p.max - p.min) * p.idx / p.teile), p.teile),
    hinweis: 'Der Abschnitt ist in ' + p.teile + ' gleich grosse Teile geteilt. Wie gross ist ein Teil?'
  }),
  weg: (p, l) => 'Ein Teilstrich entspricht ' + fmt(r((p.max - p.min) / p.teile)) + '. Der Pfeil steht ' +
    p.idx + ' Teilstriche nach ' + fmt(p.min) + ': <strong>' + fmt(l.wert) + '</strong>'
},

{
  id: '6.3.nachbarn', thema: '6.3', eingabe: 'mehrfeld',
  lernziel: 'Nachbarzahlen bestimmen',
  params(stufe, rnd) {
    // Die Ausgangszahl hat IMMER eine Stelle mehr als die gefragte Nachbarstufe.
    // Damit ist die Aufgabe eindeutig und die Zahl selbst nie eine Lösung.
    const arten = [
      { name: 'Zehntel',     schritt: 0.1,  nk: 2 },
      { name: 'Hundertstel', schritt: 0.01, nk: 3 },
      { name: 'Zehner',      schritt: 10,   nk: 0 },
      { name: 'Hunderter',   schritt: 100,  nk: 0 }
    ];
    const a = stufe === 'basis' ? rnd.wahl([arten[0], arten[2]]) : rnd.wahl(arten);
    let zahl;
    if (a.nk > 0) {
      let roh;
      do { roh = rnd.int(101, 9899); } while (roh % 10 === 0);      // letzte Stelle nie 0
      zahl = r(roh / Math.pow(10, a.nk));
    } else {
      const grund = rnd.int(1, 60) * a.schritt;
      zahl = grund + rnd.int(1, a.schritt - 1);                     // nie glatt
    }
    return { art: a, zahl };
  },
  loesung(p) {
    const s = p.art.schritt;
    const unten = r(Math.floor(r(p.zahl / s, 9)) * s);
    return lFelder([
      { art: 'zahl', wert: unten },
      { art: 'zahl', wert: r(unten + s) }
    ]);
  },
  frage: p => ({
    html: 'Zwischen welchen beiden <strong>' + p.art.name + '</strong> liegt die Zahl?' +
      '<div class="nachbarn">{{0}}<span class="rel">&lt;</span><span class="fixwert">' + fmt(p.zahl) +
      '</span><span class="rel">&lt;</span>{{1}}</div>',
    hinweis: 'Der Abstand zwischen den beiden Nachbarn beträgt ' + fmt(p.art.schritt) + '.'
  }),
  weg: (p, l) => 'Die Zahl liegt zwischen <strong>' + fmt(l.felder[0].wert) + '</strong> und <strong>' +
    fmt(l.felder[1].wert) + '</strong>.',
  entartet(p, l) {
    if (Math.abs(l.felder[0].wert - p.zahl) < 1e-9) return 'Zahl ist selbst ein Nachbar';
    if (Math.abs(l.felder[1].wert - p.zahl) < 1e-9) return 'Zahl ist selbst ein Nachbar';
    return null;
  }
},

{
  id: '6.3.dezZuBruch', thema: '6.3', eingabe: 'bruch',
  lernziel: 'Dezimalzahl als gekürzten Bruch schreiben',
  params(stufe, rnd) {
    const liste = stufe === 'basis' ? DEZ_ZU_BRUCH.slice(0, 9) : DEZ_ZU_BRUCH;
    return { idx: rnd.int(0, liste.length - 1), basis: stufe === 'basis' };
  },
  loesung(p) {
    const liste = p.basis ? DEZ_ZU_BRUCH.slice(0, 9) : DEZ_ZU_BRUCH;
    const e = liste[p.idx];
    return lBruch(e[1], e[2], 'gekuerzt');
  },
  frage(p) {
    const liste = p.basis ? DEZ_ZU_BRUCH.slice(0, 9) : DEZ_ZU_BRUCH;
    return {
      html: 'Schreibe als gekürzten Bruch:<br>' + rechnung(fmt(liste[p.idx][0])),
      hinweis: 'Schreibe die Zahl zuerst als Zehntel oder Hundertstel und kürze dann.'
    };
  },
  weg(p, l) {
    const liste = p.basis ? DEZ_ZU_BRUCH.slice(0, 9) : DEZ_ZU_BRUCH;
    const d = liste[p.idx][0];
    const nenner = d.toString().split('.')[1].length === 1 ? 10 : (d.toString().split('.')[1].length === 2 ? 100 : 1000);
    return fmt(d) + ' = ' + F(Math.round(d * nenner), nenner) + ' und gekürzt <strong>' + F(l.z, l.n) + '</strong>';
  }
},

{
  id: '6.3.bruchZuDez', thema: '6.3', eingabe: 'zahl',
  lernziel: 'Bruch als Dezimalzahl schreiben',
  params(stufe, rnd) {
    const liste = stufe === 'basis' ? DEZ_ZU_BRUCH.slice(0, 9) : DEZ_ZU_BRUCH;
    return { idx: rnd.int(0, liste.length - 1), basis: stufe === 'basis' };
  },
  loesung(p) {
    const liste = p.basis ? DEZ_ZU_BRUCH.slice(0, 9) : DEZ_ZU_BRUCH;
    return lZahl(liste[p.idx][0]);
  },
  frage(p) {
    const liste = p.basis ? DEZ_ZU_BRUCH.slice(0, 9) : DEZ_ZU_BRUCH;
    const e = liste[p.idx];
    return {
      html: 'Schreibe als Dezimalzahl:<br>' + rechnung(F(e[1], e[2])),
      hinweis: 'Erweitere den Bruch so, dass der Nenner 10, 100 oder 1000 wird.'
    };
  },
  weg(p, l) {
    const liste = p.basis ? DEZ_ZU_BRUCH.slice(0, 9) : DEZ_ZU_BRUCH;
    const e = liste[p.idx];
    return F(e[1], e[2]) + ' = <strong>' + fmt(l.wert) + '</strong>';
  }
},

{
  id: '6.3.dezVergleich', thema: '6.3', eingabe: 'auswahl',
  lernziel: 'Dezimalzahlen vergleichen',
  params(stufe, rnd) {
    const nk = stufe === 'basis' ? 1 : rnd.int(1, 3);
    const a = r(rnd.int(10, 999) / Math.pow(10, nk));
    const b = rnd.zahl() < 0.25 ? a : r(rnd.int(10, 999) / Math.pow(10, rnd.int(1, 3)));
    return { a, b };
  },
  loesung: p => lAuswahl(Math.abs(p.a - p.b) < 1e-9 ? '=' : (p.a < p.b ? '<' : '>')),
  optionen: () => vergleichsOptionen(),
  frage: p => ({
    html: 'Vergleiche die beiden Zahlen:<br>' +
      rechnung(fmt(p.a) + '<span class="luecke">?</span>' + fmt(p.b)),
    hinweis: 'Vergleiche Stelle für Stelle: zuerst die Einer, dann die Zehntel, dann die Hundertstel.'
  }),
  weg(p, l) {
    const zeichen = { '<': '&lt;', '=': '=', '>': '&gt;' }[l.wert];
    return '<strong>' + fmt(p.a) + ' ' + zeichen + ' ' + fmt(p.b) + '</strong>';
  }
}
];
