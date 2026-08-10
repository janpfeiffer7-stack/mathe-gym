import { fmt } from '../../core/zahl.js';
import { F, lZahl, lAuswahl, rechnung } from '../baukasten.js';

/* 5.1 Brüche und Anteile */

export default [
{
  id: '5.1.anteil', thema: '5.1', eingabe: 'zahl',
  lernziel: 'Anteil einer Zahl bestimmen',
  params(stufe, rnd) {
    if (stufe === 'basis')  return { n: rnd.wahl([2, 3, 4, 5]), z: 1, teil: rnd.int(2, 9) };
    if (stufe === 'profi')  { const n = rnd.wahl([4, 5, 6, 8, 10, 20]); return { n, z: rnd.int(2, n - 1), teil: rnd.int(5, 20) }; }
    const n = rnd.wahl([3, 4, 5, 6, 8, 10]);
    return { n, z: rnd.int(1, n - 1), teil: rnd.int(2, 12) };
  },
  loesung: p => lZahl(p.teil * p.z),
  frage: p => ({
    html: 'Bestimme den Anteil:<br>' + rechnung(F(p.z, p.n) + ' von ' + fmt(p.n * p.teil)),
    hinweis: 'Teile die Zahl zuerst durch den Nenner (' + p.n + ') und nimm das Ergebnis mal den Zähler (' + p.z + ').'
  }),
  weg: (p, l) => '<ol><li>' + fmt(p.n * p.teil) + ' : ' + p.n + ' = ' + fmt(p.teil) +
    '  (das ist ' + F(1, p.n) + ')</li><li>' + fmt(p.teil) + ' · ' + p.z +
    ' = <strong>' + fmt(l.wert) + '</strong></li></ol>',
  entartet: (p) => p.z === 1 && p.n === 1 ? 'Anteil ist das Ganze' : null
},

{
  id: '5.1.sachanteil', thema: '5.1', eingabe: 'zahl',
  lernziel: 'Anteil in einer Sachaufgabe',
  params(stufe, rnd) {
    const n = rnd.wahl([3, 4, 6, 8]);
    const z = stufe === 'basis' ? 1 : rnd.int(1, n - 1);
    const kontext = rnd.wahl([
      { menge: 'Kinder', teilName: 'gehen zu Fuss zur Schule' },
      { menge: 'Bücher', teilName: 'sind Sachbücher' },
      { menge: 'Setzlinge', teilName: 'sind schon eingepflanzt' }
    ]);
    return { n, z, teil: rnd.int(2, 6), kontext };
  },
  loesung: p => lZahl(p.teil * p.z),
  frage: p => ({
    html: 'In einer Kiste sind <strong>' + (p.n * p.teil) + ' ' + p.kontext.menge + '</strong>. ' +
          F(p.z, p.n) + ' davon ' + p.kontext.teilName + '. Wie viele sind das?',
    hinweis: (p.n * p.teil) + ' : ' + p.n + ' rechnen, dann mal ' + p.z + '.'
  }),
  weg: (p, l) => '<ol><li>' + (p.n * p.teil) + ' : ' + p.n + ' = ' + p.teil +
    '</li><li>' + p.teil + ' · ' + p.z + ' = <strong>' + fmt(l.wert) + '</strong></li></ol>'
},

{
  id: '5.1.benennen', thema: '5.1', eingabe: 'auswahl',
  lernziel: 'Bruch benennen',
  params(stufe, rnd) {
    const n = rnd.int(3, 8);
    return { n, z: rnd.int(1, n - 1) };
  },
  loesung: p => lAuswahl(p.z / p.n),
  optionen(p, l, rnd) {
    const kandidaten = [
      { z: p.z, n: p.n },
      { z: p.z, n: p.n + 1 },
      { z: p.z + 1, n: p.n },
      { z: p.n - p.z, n: p.n },
      { z: p.z, n: p.n + 2 }
    ];
    const gesehen = new Set();
    const opt = [];
    for (const k of kandidaten) {
      const wert = k.z / k.n;
      const schl = wert.toFixed(9);
      if (gesehen.has(schl)) continue;          // keine wertgleichen Doppel
      if (k.z <= 0 || k.n <= 0) continue;
      gesehen.add(schl);
      opt.push({ text: F(k.z, k.n), wert });
      if (opt.length === 4) break;
    }
    return opt;
  },
  frage: p => ({
    html: 'Eine Fläche ist in <strong>' + p.n + '</strong> gleich grosse Teile geteilt. ' +
          '<strong>' + p.z + '</strong> Teile sind gefärbt.<br>Welcher Bruch ist gemeint?',
    hinweis: 'Der Zähler oben zählt die gefärbten Teile, der Nenner unten alle Teile.'
  }),
  weg: (p) => p.z + ' gefärbte von ' + p.n + ' Teilen ergeben <strong>' + F(p.z, p.n) + '</strong>.'
},

{
  id: '5.1.ganzes', thema: '5.1', eingabe: 'zahl',
  lernziel: 'Das Ganze aus einem Anteil berechnen',
  params(stufe, rnd) {
    const n = stufe === 'basis' ? rnd.wahl([2, 3, 4]) : rnd.wahl([3, 4, 5, 6, 8]);
    const teil = stufe === 'profi' ? rnd.int(6, 25) : rnd.int(3, 12);
    return { n, teil };
  },
  loesung: p => lZahl(p.n * p.teil),
  frage: p => ({
    html: F(1, p.n) + ' einer Zahl sind <strong>' + fmt(p.teil) + '</strong>.<br>Wie heisst die ganze Zahl?',
    hinweis: 'Wenn ' + F(1, p.n) + ' gleich ' + fmt(p.teil) + ' ist, dann besteht das Ganze aus ' + p.n + ' solchen Teilen.'
  }),
  weg: (p, l) => fmt(p.teil) + ' · ' + p.n + ' = <strong>' + fmt(l.wert) + '</strong>'
}
];
