import { fmt } from '../../core/zahl.js';
import { lZahl, rechnung } from '../baukasten.js';

/* 5.11 Mittelwert und Sachaufgaben */

export default [
{
  id: '5.11.durchschnitt', thema: '5.11', eingabe: 'zahl',
  lernziel: 'Durchschnitt berechnen',
  params(stufe, rnd) {
    const anzahl = stufe === 'basis' ? 3 : rnd.wahl([3, 4, 5]);
    const mittel = rnd.int(8, stufe === 'profi' ? 120 : 40);
    // Abweichungen, die sich zu 0 addieren: der Mittelwert ist damit ganzzahlig.
    const abw = [];
    let summe = 0;
    for (let i = 0; i < anzahl - 1; i++) {
      const d = rnd.int(-Math.min(6, mittel - 2), 6);
      abw.push(d); summe += d;
    }
    abw.push(-summe);
    return { zahlen: abw.map(d => mittel + d), mittel };
  },
  loesung: p => lZahl(p.zahlen.reduce((a, b) => a + b, 0) / p.zahlen.length),
  frage: p => ({
    html: 'Berechne den Durchschnitt (Mittelwert):<br>' + rechnung(p.zahlen.join(',  ')),
    hinweis: 'Zähle alle Zahlen zusammen und teile die Summe durch ihre Anzahl (' + p.zahlen.length + ').'
  }),
  weg: (p, l) => {
    const s = p.zahlen.reduce((a, b) => a + b, 0);
    return '(' + p.zahlen.join(' + ') + ') = ' + fmt(s) + '; ' + fmt(s) + ' : ' + p.zahlen.length +
      ' = <strong>' + fmt(l.wert) + '</strong>';
  },
  erlaubeLoesungImText: true,
  entartet: (p) => new Set(p.zahlen).size === 1 ? 'alle Zahlen gleich' : null
},

{
  id: '5.11.fehlenderWert', thema: '5.11', eingabe: 'zahl',
  lernziel: 'Fehlenden Wert über den Durchschnitt finden',
  params(stufe, rnd) {
    const anzahl = 3;
    const mittel = rnd.int(20, stufe === 'profi' ? 200 : 80);
    const bekannt = [];
    for (let i = 0; i < anzahl; i++) bekannt.push(mittel + rnd.int(-15, 15));
    return { bekannt, mittel };
  },
  loesung(p) {
    const gesamt = p.mittel * (p.bekannt.length + 1);
    return lZahl(gesamt - p.bekannt.reduce((a, b) => a + b, 0));
  },
  frage: p => ({
    html: 'Eine Klasse misst vier Werte. Drei davon sind:<br>' + rechnung(p.bekannt.join(',  ')) +
          '<br>Der Durchschnitt aller vier Werte beträgt <strong>' + fmt(p.mittel) + '</strong>.<br>Wie heisst der vierte Wert?',
    hinweis: 'Gesamtsumme = Durchschnitt · Anzahl. Ziehe davon die drei bekannten Werte ab.'
  }),
  weg(p, l) {
    const gesamt = p.mittel * (p.bekannt.length + 1);
    return '<ol><li>Summe aller vier Werte: ' + fmt(p.mittel) + ' · 4 = ' + fmt(gesamt) +
      '</li><li>' + fmt(gesamt) + ' − (' + p.bekannt.join(' + ') + ') = <strong>' + fmt(l.wert) + '</strong></li></ol>';
  },
  entartet: (p, l) => l.wert <= 0 ? 'vierter Wert nicht positiv' : null
},

{
  id: '5.11.sachaufgabe', thema: '5.11', eingabe: 'zahl',
  lernziel: 'Sachaufgabe in mehreren Schritten',
  params(stufe, rnd) {
    const personen = rnd.int(3, 8);
    const preis = rnd.int(4, stufe === 'profi' ? 35 : 15);
    const gutschein = rnd.int(2, 20);
    return { personen, preis, gutschein, sache: rnd.wahl(['Eintritt', 'Mittagessen', 'Kinoticket']) };
  },
  loesung: p => lZahl(p.personen * p.preis - p.gutschein),
  frage: p => ({
    html: 'Eine Gruppe von <strong>' + p.personen + ' Personen</strong> bezahlt je <strong>' + fmt(p.preis) +
          ' Fr.</strong> für ' + p.sache + '. Ein Gutschein über <strong>' + fmt(p.gutschein) +
          ' Fr.</strong> wird abgezogen.<br>Wie viel bezahlt die Gruppe insgesamt?',
    hinweis: 'Berechne zuerst den Gesamtbetrag ohne Gutschein.',
    einheit: 'Fr.'
  }),
  weg: (p, l) => '<ol><li>' + p.personen + ' · ' + fmt(p.preis) + ' = ' + fmt(p.personen * p.preis) + ' Fr.</li>' +
    '<li>' + fmt(p.personen * p.preis) + ' − ' + fmt(p.gutschein) + ' = <strong>' + fmt(l.wert) + ' Fr.</strong></li></ol>',
  entartet: (p, l) => l.wert <= 0 ? 'Gutschein grösser als Betrag' : null
}
];
