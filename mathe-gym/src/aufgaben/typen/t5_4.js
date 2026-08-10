import { fmt, r } from '../../core/zahl.js';
import { lZahl, lFelder, rechnung } from '../baukasten.js';

/* 5.4 Proportionalität und Wertetabellen */

const KONTEXTE = [
  { ding: 'Tische', wert: 'Personen', pro: 6 },
  { ding: 'Schachteln', wert: 'Eier', pro: 6 },
  { ding: 'Kisten', wert: 'Äpfel', pro: 30 },
  { ding: 'Dosen Farbe', wert: 'Liter', pro: 5 },
  { ding: 'Beete', wert: 'Setzlinge', pro: 12 }
];

export default [
{
  id: '5.4.satz', thema: '5.4', eingabe: 'zahl',
  lernziel: 'Proportionale Sätze ergänzen',
  params(stufe, rnd) {
    const k = rnd.wahl(KONTEXTE);
    const a = rnd.int(2, 6);
    const b = stufe === 'profi' ? rnd.intAusser(7, 12, [a]) : rnd.intAusser(2, 9, [a]);
    return { k, a, b };
  },
  loesung: p => lZahl(p.b * p.k.pro),
  frage: p => ({
    html: '<strong>' + p.a + ' ' + p.k.ding + '</strong> ergeben <strong>' + fmt(p.a * p.k.pro) + ' ' + p.k.wert +
          '</strong>.<br>Wie viele ' + p.k.wert + ' ergeben <strong>' + p.b + ' ' + p.k.ding + '</strong>?',
    hinweis: 'Berechne zuerst den Wert für ein einziges Stück.',
    einheit: p.k.wert
  }),
  weg: (p, l) => '<ol><li>1 → ' + fmt(p.a * p.k.pro) + ' : ' + p.a + ' = ' + fmt(p.k.pro) +
    '</li><li>' + p.b + ' · ' + fmt(p.k.pro) + ' = <strong>' + fmt(l.wert) + ' ' + p.k.wert + '</strong></li></ol>',
  entartet: (p) => p.a === p.b ? 'gesuchte Anzahl gleich gegebener Anzahl' : null
},

{
  id: '5.4.tabelle', thema: '5.4', eingabe: 'mehrfeld',
  lernziel: 'Wertetabelle ergänzen',
  params(stufe, rnd) {
    const pro = rnd.wahl(stufe === 'basis' ? [2, 3, 5] : [1.5, 0.4, 2.5, 3, 0.6]);
    const bekannt = rnd.int(2, 5);
    const frag = rnd.wahl([6, 8, 10, 12].filter(x => x !== bekannt));
    return { pro, bekannt, frag };
  },
  loesung: p => lFelder([
    { art: 'zahl', wert: r(p.pro) },
    { art: 'zahl', wert: r(p.frag * p.pro) }
  ]),
  frage: p => ({
    html: 'Die Tabelle ist proportional. Ergänze die fehlenden Werte.' +
      '<div class="tabelle-prop">' +
      '<div class="zeile"><span>' + p.bekannt + '</span><span>→</span><span>' + fmt(r(p.bekannt * p.pro)) + '</span></div>' +
      '<div class="zeile"><span>1</span><span>→</span><span>{{0}}</span></div>' +
      '<div class="zeile"><span>' + p.frag + '</span><span>→</span><span>{{1}}</span></div>' +
      '</div>',
    hinweis: 'Teile den bekannten Wert durch seine Anzahl. So erhältst du den Wert für 1.'
  }),
  weg: (p, l) => '<ol><li>1 → ' + fmt(r(p.bekannt * p.pro)) + ' : ' + p.bekannt + ' = <strong>' + fmt(p.pro) +
    '</strong></li><li>' + p.frag + ' → ' + p.frag + ' · ' + fmt(p.pro) + ' = <strong>' +
    fmt(l.felder[1].wert) + '</strong></li></ol>'
},

{
  id: '5.4.preis', thema: '5.4', eingabe: 'zahl',
  lernziel: 'Preise proportional berechnen',
  params(stufe, rnd) {
    const pro = r(rnd.int(15, 90) / 10);
    const a = rnd.int(3, 6);
    const b = rnd.intAusser(2, 9, [a]);
    const ware = rnd.wahl(['kg Äpfel', 'Meter Schnur', 'Liter Most', 'kg Mehl']);
    return { pro, a, b, ware };
  },
  loesung: p => lZahl(r(p.b * p.pro)),
  frage: p => ({
    html: '<strong>' + p.a + ' ' + p.ware + '</strong> kosten <strong>' + fmt(r(p.a * p.pro)) + ' Fr.</strong><br>' +
          'Wie viel kosten <strong>' + p.b + ' ' + p.ware + '</strong>?',
    hinweis: 'Berechne zuerst den Preis für 1 ' + p.ware.replace(/^(\S+)\s.*/, '$1') + '.',
    einheit: 'Fr.'
  }),
  weg: (p, l) => '<ol><li>1 → ' + fmt(r(p.a * p.pro)) + ' : ' + p.a + ' = ' + fmt(p.pro) + ' Fr.</li>' +
    '<li>' + p.b + ' · ' + fmt(p.pro) + ' = <strong>' + fmt(l.wert) + ' Fr.</strong></li></ol>'
}
];
