import { fmt, r } from '../../core/zahl.js';
import { lZahl, lAuswahl, lFelder, rechnung } from '../baukasten.js';

/* 5.3 Dezimalzahlen und Stellenwert */

const STELLEN = ['Zehntel', 'Hundertstel', 'Tausendstel'];

export default [
{
  id: '5.3.stellenwert', thema: '5.3', eingabe: 'auswahl',
  lernziel: 'Stellenwert benennen',
  params(stufe, rnd) {
    const anzahl = stufe === 'basis' ? 2 : 3;
    const ziffern = [];
    for (let i = 0; i < anzahl; i++) ziffern.push(rnd.int(0, 9));
    const pos = rnd.int(0, anzahl - 1);
    if (ziffern[pos] === 0) ziffern[pos] = rnd.int(1, 9);
    return { ganz: rnd.int(0, 49), ziffern, pos };
  },
  loesung: p => lAuswahl(p.pos),
  optionen(p) {
    const ziffer = p.ziffern[p.pos];
    const opt = STELLEN.map((name, i) => ({ text: ziffer + ' ' + name, wert: i }));
    opt.push({ text: ziffer + ' Einer', wert: 99 });
    return opt;
  },
  frage: p => {
    let anzeige = '';
    p.ziffern.forEach((z, i) => {
      anzeige += (i === p.pos) ? '<u class="markiert">' + z + '</u>' : String(z);
    });
    return {
      html: 'Welchen Wert hat die markierte Ziffer?<br>' + rechnung(p.ganz + '.' + anzeige),
      hinweis: 'Nach dem Punkt kommen zuerst die Zehntel, dann die Hundertstel, dann die Tausendstel.'
    };
  },
  weg: p => 'Die ' + (p.pos + 1) + '. Stelle nach dem Punkt sind die ' + STELLEN[p.pos] +
    '. Also: <strong>' + p.ziffern[p.pos] + ' ' + STELLEN[p.pos] + '</strong>.',
  erlaubeLoesungImText: true
},

{
  id: '5.3.mal10', thema: '5.3', eingabe: 'zahl',
  lernziel: 'Mit 10, 100 und 1000 multiplizieren und dividieren',
  params(stufe, rnd) {
    const faktor = rnd.wahl(stufe === 'basis' ? [10, 100] : [10, 100, 1000]);
    const op = rnd.wahl(['mal', 'geteilt']);
    if (op === 'mal') {
      const nk = stufe === 'basis' ? 1 : rnd.int(1, 2);
      const basis = r(rnd.int(1, 99) / Math.pow(10, nk));
      return { op, faktor, basis };
    }
    // Bei der Division so wählen, dass höchstens 3 Dezimalstellen entstehen.
    const stellen = Math.log10(faktor);
    const nk = Math.max(0, 3 - stellen);
    const basis = r(rnd.int(1, 999) / Math.pow(10, nk));
    return { op, faktor, basis };
  },
  loesung: p => lZahl(p.op === 'mal' ? r(p.basis * p.faktor) : r(p.basis / p.faktor)),
  frage: p => ({
    html: 'Rechne aus:<br>' + rechnung(
      p.op === 'mal' ? fmt(p.basis) + ' · ' + fmt(p.faktor) : fmt(p.basis) + ' : ' + fmt(p.faktor)),
    hinweis: p.op === 'mal'
      ? 'Beim Multiplizieren wandert der Dezimalpunkt nach rechts – pro Null eine Stelle.'
      : 'Beim Dividieren wandert der Dezimalpunkt nach links – pro Null eine Stelle.'
  }),
  weg: (p, l) => {
    const nullen = String(p.faktor).length - 1;
    return 'Der Faktor ' + p.faktor + ' hat ' + nullen + (nullen === 1 ? ' Null' : ' Nullen') +
      '. Verschiebe den Dezimalpunkt um ' + nullen + ' Stelle' + (nullen === 1 ? '' : 'n') + ' nach ' +
      (p.op === 'mal' ? 'rechts' : 'links') + ': <strong>' + fmt(l.wert) + '</strong>';
  }
},

{
  id: '5.3.addsub', thema: '5.3', eingabe: 'zahl',
  lernziel: 'Dezimalzahlen addieren und subtrahieren',
  params(stufe, rnd) {
    const nk = stufe === 'basis' ? 1 : 2;
    const t = Math.pow(10, nk);
    const op = rnd.wahl(['+', '−']);
    let a = r(rnd.int(11, stufe === 'profi' ? 3000 : 400) / t);
    let b = r(rnd.int(11, 200) / t);
    if (op === '−' && b > a) [a, b] = [b, a];
    return { a, b, op };
  },
  loesung: p => lZahl(p.op === '+' ? r(p.a + p.b) : r(p.a - p.b)),
  frage: p => ({
    html: 'Rechne aus:<br>' + rechnung(fmt(p.a) + ' ' + p.op + ' ' + fmt(p.b)),
    hinweis: 'Schreibe die Zahlen so untereinander, dass die Dezimalpunkte genau übereinander stehen.'
  }),
  weg: (p, l) => fmt(p.a) + ' ' + p.op + ' ' + fmt(p.b) + ' = <strong>' + fmt(l.wert) + '</strong>',
  entartet: (p, l) => l.wert === 0 ? 'Ergebnis 0' : null
},

{
  id: '5.3.folge', thema: '5.3', eingabe: 'mehrfeld',
  lernziel: 'In gleichen Schritten zählen',
  params(stufe, rnd) {
    const schritt = stufe === 'basis' ? rnd.wahl([0.1, 0.5, 1])
                  : stufe === 'profi' ? rnd.wahl([0.05, 0.25, 0.4])
                  : rnd.wahl([0.1, 0.2, 0.25, 0.5]);
    const start = r(rnd.int(0, 40) / 10);
    const luecken = rnd.auswahl([1, 2, 3, 4, 5], stufe === 'basis' ? 2 : 3).sort((a, b) => a - b);
    return { start, schritt, luecken };
  },
  loesung(p) {
    const felder = p.luecken.map(i => ({ art: 'zahl', wert: r(p.start + i * p.schritt) }));
    return lFelder(felder);
  },
  frage: p => {
    let html = 'Setze die Zahlenfolge fort. Die Schrittweite beträgt <strong>' + fmt(p.schritt) + '</strong>.' +
               '<div class="folge">';
    let feldNr = 0;
    for (let i = 0; i < 6; i++) {
      if (p.luecken.includes(i)) { html += '{{' + (feldNr++) + '}}'; }
      else { html += '<span class="fixwert">' + fmt(r(p.start + i * p.schritt)) + '</span>'; }
    }
    html += '</div>';
    return { html, hinweis: 'Zähle von einer bekannten Zahl aus in Schritten von ' + fmt(p.schritt) + ' weiter.' };
  },
  weg: (p) => {
    const alle = [];
    for (let i = 0; i < 6; i++) alle.push(fmt(r(p.start + i * p.schritt)));
    return 'Vollständige Folge: <strong>' + alle.join(', ') + '</strong>';
  },
  erlaubeLoesungImText: true
}
];
