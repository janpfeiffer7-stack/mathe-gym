import { fmt, r } from '../../core/zahl.js';
import { F, lZahl, lBruch, lAuswahl, lOrdnen, rechnung, vergleichsOptionen, jaNeinOptionen } from '../baukasten.js';

/* 5.8 Brüche ordnen und Runden */

export default [
{
  id: '5.8.bruchVergleich', thema: '5.8', eingabe: 'auswahl',
  lernziel: 'Brüche vergleichen',
  params(stufe, rnd) {
    const nenner = stufe === 'basis' ? [2, 3, 4, 5] : [2, 3, 4, 5, 6, 8, 10, 12];
    const n1 = rnd.wahl(nenner), n2 = rnd.wahl(nenner);
    return { n1, z1: rnd.int(1, n1), n2, z2: rnd.int(1, n2) };
  },
  loesung(p) {
    const w1 = p.z1 / p.n1, w2 = p.z2 / p.n2;
    return lAuswahl(Math.abs(w1 - w2) < 1e-9 ? '=' : (w1 < w2 ? '<' : '>'));
  },
  optionen: () => vergleichsOptionen(),
  frage: p => ({
    html: 'Vergleiche die beiden Brüche:<br>' +
      rechnung(F(p.z1, p.n1) + '<span class="luecke">?</span>' + F(p.z2, p.n2)),
    hinweis: 'Bringe beide Brüche auf denselben Nenner oder wandle sie in Dezimalzahlen um.'
  }),
  weg(p, l) {
    const zeichen = { '<': '&lt;', '=': '=', '>': '&gt;' }[l.wert];
    return F(p.z1, p.n1) + ' = ' + fmt(r(p.z1 / p.n1, 4)) + ' und ' + F(p.z2, p.n2) + ' = ' +
      fmt(r(p.z2 / p.n2, 4)) + ' → <strong>' + F(p.z1, p.n1) + ' ' + zeichen + ' ' + F(p.z2, p.n2) + '</strong>';
  },
  entartet: (p) => (p.z1 === p.z2 && p.n1 === p.n2) ? 'zweimal derselbe Bruch' : null
},

{
  id: '5.8.bruchAddSub', thema: '5.8', eingabe: 'bruch',
  lernziel: 'Brüche mit gleichem Nenner addieren und subtrahieren',
  params(stufe, rnd) {
    const n = rnd.wahl(stufe === 'basis' ? [4, 5, 6, 8] : [4, 5, 6, 8, 10, 12]);
    const op = rnd.wahl(['+', '−']);
    let a = rnd.int(1, n - 1), b = rnd.int(1, n - 1);
    if (op === '−' && b > a) [a, b] = [b, a];
    return { n, a, b, op };
  },
  loesung: p => lBruch(p.op === '+' ? p.a + p.b : p.a - p.b, p.n, 'gleichwertig'),
  frage: p => ({
    html: 'Rechne aus:<br>' + rechnung(F(p.a, p.n) + ' ' + p.op + ' ' + F(p.b, p.n)),
    hinweis: 'Bei gleichem Nenner rechnest du nur mit den Zählern. Der Nenner bleibt ' + p.n + '.'
  }),
  weg: (p, l) => 'Zähler: ' + p.a + ' ' + p.op + ' ' + p.b + ' = ' + l.z +
    ', der Nenner bleibt ' + p.n + ' → <strong>' + F(l.z, l.n) + '</strong>',
  entartet: (p) => (p.op === '−' && p.a === p.b) ? 'Ergebnis 0' : null
},

{
  id: '5.8.runden', thema: '5.8', eingabe: 'zahl',
  lernziel: 'Zahlen runden',
  params(stufe, rnd) {
    const stellen = stufe === 'basis' ? [['Zehner', 10]] : [['Zehner', 10], ['Hunderter', 100], ['Tausender', 1000]];
    const s = rnd.wahl(stellen);
    const grund = rnd.int(1, 99) * s[1];
    const rest = rnd.int(1, s[1] - 1);          // nie glatt: sonst wäre nichts zu runden
    return { name: s[0], einheit: s[1], zahl: grund + rest };
  },
  loesung: p => lZahl(Math.round(p.zahl / p.einheit) * p.einheit),
  frage: p => ({
    html: 'Runde auf <strong>' + p.name + '</strong>:<br>' + rechnung(fmt(p.zahl)),
    hinweis: 'Schau die Ziffer rechts der Rundungsstelle an: 0 bis 4 abrunden, 5 bis 9 aufrunden.'
  }),
  weg: (p, l) => {
    const rest = p.zahl % p.einheit;
    return 'Die Zahl liegt ' + fmt(rest) + ' über ' + fmt(p.zahl - rest) + '. Das ist ' +
      (rest * 2 >= p.einheit ? 'mehr als die Hälfte → aufrunden' : 'weniger als die Hälfte → abrunden') +
      ': <strong>' + fmt(l.wert) + '</strong>';
  }
},

{
  id: '5.8.teilbar', thema: '5.8', eingabe: 'auswahl',
  lernziel: 'Teilbarkeit prüfen',
  params(stufe, rnd) {
    const teiler = rnd.wahl(stufe === 'basis' ? [2, 5, 10] : [2, 3, 4, 5, 6, 8, 9]);
    const teilbar = rnd.zahl() < 0.5;
    let zahl;
    if (teilbar) zahl = teiler * rnd.int(20, 120);
    else { do { zahl = rnd.int(100, 999); } while (zahl % teiler === 0); }
    return { teiler, zahl };
  },
  loesung: p => lAuswahl(p.zahl % p.teiler === 0),
  optionen: () => jaNeinOptionen('Ja, sie ist teilbar', 'Nein, sie ist nicht teilbar'),
  frage: p => ({
    html: 'Ist die Zahl <strong>' + fmt(p.zahl) + '</strong> ohne Rest durch <strong>' + p.teiler + '</strong> teilbar?',
    hinweis: 'Zerlege die Zahl in Teile, die du gut durch ' + p.teiler + ' teilen kannst.'
  }),
  weg: (p) => p.zahl % p.teiler === 0
    ? fmt(p.zahl) + ' : ' + p.teiler + ' = ' + fmt(p.zahl / p.teiler) + ' ohne Rest → <strong>teilbar</strong>.'
    : fmt(p.zahl) + ' : ' + p.teiler + ' = ' + Math.floor(p.zahl / p.teiler) + ' Rest ' + (p.zahl % p.teiler) +
      ' → <strong>nicht teilbar</strong>.',
  erlaubeLoesungImText: true
},

{
  id: '5.8.divisionAlsBruch', thema: '5.8', eingabe: 'bruch',
  lernziel: 'Division als Bruch schreiben',
  params(stufe, rnd) {
    const n = rnd.int(2, 9);
    return { z: rnd.int(1, 9), n };
  },
  loesung: p => lBruch(p.z, p.n, 'gleichwertig'),
  frage: p => ({
    html: 'Schreibe die Division als Bruch:<br>' + rechnung(p.z + ' : ' + p.n),
    hinweis: 'Die erste Zahl kommt in den Zähler, die zweite in den Nenner.'
  }),
  weg: (p) => p.z + ' : ' + p.n + ' = <strong>' + F(p.z, p.n) + '</strong>'
},

{
  id: '5.8.gemischt', thema: '5.8', eingabe: 'bruch',
  lernziel: 'Gemischte Zahl in einen Bruch umwandeln',
  params(stufe, rnd) {
    const n = rnd.wahl([2, 3, 4, 5, 8]);
    return { ganz: rnd.int(1, stufe === 'profi' ? 6 : 4), n, z: rnd.int(1, n - 1) };
  },
  loesung: p => lBruch(p.ganz * p.n + p.z, p.n, 'gleichwertig'),
  frage: p => ({
    html: 'Wandle die gemischte Zahl in einen Bruch um:<br>' +
      rechnung('<span class="gemischt"><span class="gz">' + p.ganz + '</span>' + F(p.z, p.n) + '</span>'),
    hinweis: 'Ganze mal Nenner rechnen, dann den Zähler dazuzählen: ' + p.ganz + ' · ' + p.n + ' + ' + p.z + '.'
  }),
  weg: (p, l) => p.ganz + ' · ' + p.n + ' + ' + p.z + ' = ' + l.z + ' → <strong>' + F(l.z, l.n) + '</strong>'
},

{
  id: '5.8.ordnen', thema: '5.8', eingabe: 'ordnen',
  lernziel: 'Dezimalzahlen ordnen',
  params(stufe, rnd) {
    const anzahl = stufe === 'basis' ? 3 : (stufe === 'profi' ? 5 : 4);
    const menge = new Set();
    let schutz = 0;
    while (menge.size < anzahl && schutz++ < 200) {
      menge.add(r(rnd.int(5, 195) / 10));
    }
    return { werte: Array.from(menge) };
  },
  loesung: p => lOrdnen(p.werte.slice().sort((a, b) => a - b)),
  frage: () => ({
    html: 'Ordne die Zahlen der Grösse nach.<br>Tippe sie von der <strong>kleinsten</strong> zur <strong>grössten</strong> an.',
    hinweis: 'Vergleiche zuerst die Zahl vor dem Punkt, danach die Zehntel.'
  }),
  weg: (p, l) => 'Richtige Reihenfolge: <strong>' + l.werte.map(fmt).join(' &lt; ') + '</strong>'
}
];
