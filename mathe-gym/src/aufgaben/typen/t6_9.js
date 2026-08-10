import { fmt } from '../../core/zahl.js';
import { lZahl, lAuswahl, rechnung, PLATZ } from '../baukasten.js';

/* 6.9 Terme, Klammern und Gleichungen */

/** Alle vier Zeichenkombinationen mit ihrem Wert. */
function varianten(a, b, c) {
  return [
    { ops: ['+', '·'], wert: a + b * c, text: a + ' + ' + b + ' · ' + c },
    { ops: ['·', '+'], wert: a * b + c, text: a + ' · ' + b + ' + ' + c },
    { ops: ['·', '·'], wert: a * b * c, text: a + ' · ' + b + ' · ' + c },
    { ops: ['+', '+'], wert: a + b + c, text: a + ' + ' + b + ' + ' + c }
  ];
}

export default [
{
  id: '6.9.punktVorStrich', thema: '6.9', eingabe: 'zahl',
  lernziel: 'Punkt vor Strich anwenden',
  params(stufe, rnd) {
    const gross = stufe === 'profi';
    return {
      a: rnd.int(3, gross ? 15 : 9),
      b: rnd.int(2, gross ? 12 : 9),
      c: rnd.int(5, gross ? 80 : 40),
      op: rnd.wahl(['+', '−'])
    };
  },
  loesung: p => lZahl(p.op === '+' ? p.a * p.b + p.c : p.a * p.b - p.c),
  frage: p => ({
    html: 'Rechne aus:<br>' + rechnung(p.a + ' · ' + p.b + ' ' + p.op + ' ' + p.c),
    hinweis: 'Punkt vor Strich: zuerst multiplizieren, dann addieren oder subtrahieren.'
  }),
  weg: (p, l) => p.a + ' · ' + p.b + ' = ' + (p.a * p.b) + '; ' + (p.a * p.b) + ' ' + p.op + ' ' + p.c +
    ' = <strong>' + fmt(l.wert) + '</strong>',
  entartet: (p, l) => l.wert <= 0 ? 'Ergebnis nicht positiv' : null
},

{
  id: '6.9.klammer', thema: '6.9', eingabe: 'zahl',
  lernziel: 'Klammern zuerst rechnen',
  params(stufe, rnd) {
    return {
      a: rnd.int(2, stufe === 'profi' ? 12 : 6),
      b: rnd.int(3, 14),
      c: rnd.int(2, 12),
      innen: rnd.wahl(['+', '−'])
    };
  },
  loesung: p => lZahl(p.innen === '+' ? p.a * (p.b + p.c) : p.a * (p.b - p.c)),
  frage: p => ({
    html: 'Rechne aus:<br>' + rechnung(p.a + ' · (' + p.b + ' ' + p.innen + ' ' + p.c + ')'),
    hinweis: 'Rechne zuerst aus, was in der Klammer steht.'
  }),
  weg: (p, l) => {
    const innen = p.innen === '+' ? p.b + p.c : p.b - p.c;
    return p.b + ' ' + p.innen + ' ' + p.c + ' = ' + innen + '; ' + p.a + ' · ' + innen +
      ' = <strong>' + fmt(l.wert) + '</strong>';
  },
  entartet: (p, l) => {
    if (p.innen === '−' && p.b - p.c <= 1) return 'Klammer zu klein';
    return l.wert <= 0 ? 'Ergebnis nicht positiv' : null;
  }
},

{
  id: '6.9.operationszeichen', thema: '6.9', eingabe: 'auswahl',
  lernziel: 'Passende Operationszeichen einsetzen',
  params(stufe, rnd) {
    // Nur Zahlentripel zulassen, bei denen GENAU EINE Variante den Zielwert ergibt.
    // Damit ist die in der Analyse gefundene Mehrdeutigkeit ausgeschlossen.
    for (let versuch = 0; versuch < 200; versuch++) {
      const a = rnd.int(2, 9), b = rnd.int(2, 6), c = rnd.int(2, 9);
      const v = varianten(a, b, c);
      const zielIdx = rnd.int(0, 3);
      const ziel = v[zielIdx].wert;
      const treffer = v.filter(x => x.wert === ziel).length;
      if (treffer === 1) return { a, b, c, zielIdx };
    }
    return { a: 3, b: 4, c: 5, zielIdx: 0 };     // Rückfallwert: 3 + 4·5 = 23, eindeutig
  },
  loesung(p) {
    return lAuswahl(varianten(p.a, p.b, p.c)[p.zielIdx].ops.join(''));
  },
  optionen(p) {
    return varianten(p.a, p.b, p.c).map(v => ({
      text: v.ops[0] + '  und  ' + v.ops[1], wert: v.ops.join('')
    }));
  },
  frage(p) {
    const ziel = varianten(p.a, p.b, p.c)[p.zielIdx].wert;
    return {
      html: 'Welche beiden Zeichen ergeben das Ergebnis?<br>' +
        rechnung(p.a + ' ' + PLATZ + ' ' + p.b + ' ' + PLATZ + ' ' + p.c + ' = ' + fmt(ziel)),
      hinweis: 'Denke an Punkt vor Strich und probiere die Möglichkeiten durch.'
    };
  },
  weg(p) {
    const v = varianten(p.a, p.b, p.c)[p.zielIdx];
    return '<strong>' + v.text + ' = ' + fmt(v.wert) + '</strong>';
  },
  erlaubeLoesungImText: true,
  entartet(p) {
    const v = varianten(p.a, p.b, p.c);
    const ziel = v[p.zielIdx].wert;
    return v.filter(x => x.wert === ziel).length > 1 ? 'mehrere Zeichenkombinationen passen' : null;
  }
},

{
  id: '6.9.gleichung', thema: '6.9', eingabe: 'zahl',
  lernziel: 'Gleichung umstellen',
  params(stufe, rnd) {
    const art = rnd.wahl(['plus', 'minusLinks', 'mal', 'geteilt']);
    const gross = stufe === 'profi';
    return {
      art,
      x: rnd.int(3, gross ? 90 : 40),
      k: rnd.int(2, gross ? 60 : 20),
      f: rnd.int(3, 9)
    };
  },
  loesung: p => lZahl(p.x),
  frage(p) {
    let t;
    if (p.art === 'plus')       t = PLATZ + ' + ' + p.k + ' = ' + fmt(p.x + p.k);
    else if (p.art === 'minusLinks') t = fmt(p.x + p.k) + ' − ' + PLATZ + ' = ' + p.k;
    else if (p.art === 'mal')   t = p.f + ' · ' + PLATZ + ' = ' + fmt(p.f * p.x);
    else                        t = fmt(p.x * p.f) + ' : ' + PLATZ + ' = ' + p.f;
    return {
      html: 'Welche Zahl gehört an die Stelle von ' + PLATZ + '?<br>' + rechnung(t),
      hinweis: 'Nutze die Umkehroperation.'
    };
  },
  weg(p, l) {
    if (p.art === 'plus')       return fmt(p.x + p.k) + ' − ' + p.k + ' = <strong>' + fmt(l.wert) + '</strong>';
    if (p.art === 'minusLinks') return fmt(p.x + p.k) + ' − ' + p.k + ' = <strong>' + fmt(l.wert) + '</strong>';
    if (p.art === 'mal')        return fmt(p.f * p.x) + ' : ' + p.f + ' = <strong>' + fmt(l.wert) + '</strong>';
    return fmt(p.x * p.f) + ' : ' + p.f + ' = <strong>' + fmt(l.wert) + '</strong>';
  },
  entartet: (p) => (p.art === 'minusLinks' && p.x === p.k) ? 'beide Seiten gleich' : null
},

{
  id: '6.9.datenMittelwert', thema: '6.9', eingabe: 'zahl',
  lernziel: 'Daten auswerten: Mittelwert',
  params(stufe, rnd) {
    const anzahl = stufe === 'basis' ? 4 : rnd.wahl([4, 5, 6]);
    const mittel = rnd.int(10, stufe === 'profi' ? 90 : 40);
    const abw = [];
    let summe = 0;
    for (let i = 0; i < anzahl - 1; i++) {
      const d = rnd.int(-Math.min(8, mittel - 2), 8);
      abw.push(d); summe += d;
    }
    abw.push(-summe);
    return { zahlen: abw.map(d => mittel + d) };
  },
  loesung: p => lZahl(p.zahlen.reduce((a, b) => a + b, 0) / p.zahlen.length),
  frage: p => ({
    html: 'Eine Klasse hat folgende Punktzahlen erreicht:<br>' + rechnung(p.zahlen.join(',  ')) +
      '<br>Wie hoch ist der Mittelwert?',
    hinweis: 'Summe aller Werte geteilt durch ihre Anzahl (' + p.zahlen.length + ').'
  }),
  weg: (p, l) => {
    const s = p.zahlen.reduce((a, b) => a + b, 0);
    return fmt(s) + ' : ' + p.zahlen.length + ' = <strong>' + fmt(l.wert) + '</strong>';
  },
  erlaubeLoesungImText: true,
  entartet: (p) => new Set(p.zahlen).size === 1 ? 'alle Werte gleich' : null
}
];
