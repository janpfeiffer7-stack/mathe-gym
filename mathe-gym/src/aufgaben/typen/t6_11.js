import { fmt } from '../../core/zahl.js';
import { kuerze } from '../../core/bruch.js';
import { F, lZahl, lBruch, lAuswahl, rechnung } from '../baukasten.js';

/* 6.11 Kombinatorik und Wahrscheinlichkeit */

function fakultaet(n) { let p = 1; for (let i = 2; i <= n; i++) p *= i; return p; }

const WOERTER = { 3: 'HUT', 4: 'HAUS', 5: 'BLUME' };

export default [
{
  id: '6.11.anordnungen', thema: '6.11', eingabe: 'zahl',
  lernziel: 'Alle Anordnungen bestimmen',
  params(stufe, rnd) {
    const n = stufe === 'basis' ? 3 : (stufe === 'profi' ? rnd.wahl([4, 5]) : rnd.wahl([3, 4]));
    return { n };
  },
  loesung: p => lZahl(fakultaet(p.n)),
  frage: p => ({
    html: 'Wie viele verschiedene Reihenfolgen kann man mit den <strong>' + p.n +
      '</strong> verschiedenen Buchstaben des Wortes ' + rechnung(WOERTER[p.n]) + ' bilden?',
    hinweis: 'Für den ersten Platz gibt es ' + p.n + ' Möglichkeiten, für den zweiten noch ' + (p.n - 1) + ' und so weiter.'
  }),
  weg: (p, l) => {
    const f = []; for (let i = p.n; i >= 1; i--) f.push(i);
    return f.join(' · ') + ' = <strong>' + fmt(l.wert) + '</strong>';
  }
},

{
  id: '6.11.medaillen', thema: '6.11', eingabe: 'zahl',
  lernziel: 'Geordnete Auswahl bestimmen',
  params(stufe, rnd) {
    return { n: rnd.int(4, stufe === 'profi' ? 9 : 6) };
  },
  loesung: p => lZahl(p.n * (p.n - 1) * (p.n - 2)),
  frage: p => ({
    html: '<strong>' + p.n + ' Athletinnen</strong> kämpfen um Gold, Silber und Bronze.<br>' +
      'Wie viele verschiedene Verteilungen der drei Medaillen sind möglich?',
    hinweis: 'Für Gold gibt es ' + p.n + ' Möglichkeiten, danach für Silber noch ' + (p.n - 1) + '.'
  }),
  weg: (p, l) => p.n + ' · ' + (p.n - 1) + ' · ' + (p.n - 2) + ' = <strong>' + fmt(l.wert) + '</strong>'
},

{
  id: '6.11.kombinationen', thema: '6.11', eingabe: 'zahl',
  lernziel: 'Kombinationen zählen',
  params(stufe, rnd) {
    const teile = stufe === 'basis'
      ? [{ name: 'Mützen', n: rnd.int(2, 3) }, { name: 'Jacken', n: rnd.int(2, 4) }]
      : [{ name: 'Mützen', n: rnd.int(2, 4) }, { name: 'Jacken', n: rnd.int(2, 4) }, { name: 'Paar Schuhe', n: rnd.int(2, 4) }];
    return { teile };
  },
  loesung: p => lZahl(p.teile.reduce((a, t) => a * t.n, 1)),
  frage: p => ({
    html: 'Samira besitzt ' + p.teile.map(t => '<strong>' + t.n + ' ' + t.name + '</strong>').join(', ') +
      '.<br>Wie viele verschiedene Zusammenstellungen kann sie tragen?',
    hinweis: 'Multipliziere die Anzahl der Möglichkeiten für jedes Kleidungsstück.'
  }),
  weg: (p, l) => p.teile.map(t => t.n).join(' · ') + ' = <strong>' + fmt(l.wert) + '</strong>'
},

{
  id: '6.11.wahrscheinlichkeit', thema: '6.11', eingabe: 'bruch',
  lernziel: 'Wahrscheinlichkeit als Bruch angeben',
  params(stufe, rnd) {
    const farben = [
      { name: 'rote', anzahl: rnd.int(2, 6) },
      { name: 'blaue', anzahl: rnd.int(2, 6) },
      { name: 'gelbe', anzahl: rnd.int(1, 5) }
    ];
    const gesucht = rnd.int(0, farben.length - 1);
    return { farben, gesucht };
  },
  loesung(p) {
    const gesamt = p.farben.reduce((a, f) => a + f.anzahl, 0);
    const [z, n] = kuerze(p.farben[p.gesucht].anzahl, gesamt);
    return lBruch(z, n, 'gekuerzt');
  },
  frage(p) {
    const gesamt = p.farben.reduce((a, f) => a + f.anzahl, 0);
    return {
      html: 'In einem Sack liegen ' + p.farben.map(f => '<strong>' + f.anzahl + ' ' + f.name + '</strong> Kugeln').join(', ') +
        '. Insgesamt sind es ' + gesamt + ' Kugeln.<br>Wie gross ist die Wahrscheinlichkeit, eine <strong>' +
        p.farben[p.gesucht].name + '</strong> Kugel zu ziehen? Gib sie als gekürzten Bruch an.',
      hinweis: 'Günstige Fälle im Zähler, alle Fälle im Nenner – dann kürzen.'
    };
  },
  weg(p, l) {
    const gesamt = p.farben.reduce((a, f) => a + f.anzahl, 0);
    return F(p.farben[p.gesucht].anzahl, gesamt) + ' gekürzt ergibt <strong>' + F(l.z, l.n) + '</strong>';
  },
  erlaubeLoesungImText: true
},

{
  id: '6.11.chance', thema: '6.11', eingabe: 'auswahl',
  lernziel: 'Wahrscheinlichkeiten vergleichen',
  params(stufe, rnd) {
    let a, b;
    do { a = rnd.int(2, 9); b = rnd.int(2, 9); } while (a === b);
    return { a, b, gesamtA: a + rnd.int(1, 6), gesamtB: b + rnd.int(1, 6) };
  },
  loesung(p) {
    const wa = p.a / p.gesamtA, wb = p.b / p.gesamtB;
    return lAuswahl(Math.abs(wa - wb) < 1e-9 ? 'gleich' : (wa > wb ? 'A' : 'B'));
  },
  optionen: () => [
    { text: 'Sack A', wert: 'A' },
    { text: 'Sack B', wert: 'B' },
    { text: 'In beiden gleich gross', wert: 'gleich' }
  ],
  frage: p => ({
    html: 'In <strong>Sack A</strong> sind ' + p.a + ' von ' + p.gesamtA + ' Kugeln rot.<br>' +
      'In <strong>Sack B</strong> sind ' + p.b + ' von ' + p.gesamtB + ' Kugeln rot.<br>' +
      'Bei welchem Sack ist die Wahrscheinlichkeit für Rot grösser?',
    hinweis: 'Vergleiche die beiden Brüche, zum Beispiel als Dezimalzahlen.'
  }),
  weg(p, l) {
    const wa = p.a / p.gesamtA, wb = p.b / p.gesamtB;
    return 'Sack A: ' + F(p.a, p.gesamtA) + ' = ' + fmt(Math.round(wa * 1000) / 1000) +
      '<br>Sack B: ' + F(p.b, p.gesamtB) + ' = ' + fmt(Math.round(wb * 1000) / 1000) +
      '<br>→ <strong>' + (l.wert === 'gleich' ? 'in beiden gleich gross' : 'Sack ' + l.wert) + '</strong>';
  }
}
];
