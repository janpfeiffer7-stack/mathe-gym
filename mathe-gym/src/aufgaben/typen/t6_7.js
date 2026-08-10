import { fmt, r } from '../../core/zahl.js';
import { lZahl, rechnung } from '../baukasten.js';

/* 6.7 Flächen und Volumen */

const FLAECHEN_UM = [
  { gross: 'cm²', klein: 'mm²', f: 100 },
  { gross: 'dm²', klein: 'cm²', f: 100 },
  { gross: 'm²',  klein: 'dm²', f: 100 },
  { gross: 'a',   klein: 'm²',  f: 100 }
];

export default [
{
  id: '6.7.flaeche', thema: '6.7', eingabe: 'zahl',
  lernziel: 'Fläche eines Rechtecks berechnen',
  params(stufe, rnd) {
    if (stufe === 'profi') {
      return { l: r(rnd.int(25, 150) / 10), b: r(rnd.int(20, 90) / 10), einheit: rnd.wahl(['m', 'cm']) };
    }
    return { l: rnd.int(3, 18), b: rnd.int(2, 14), einheit: rnd.wahl(['m', 'cm', 'dm']) };
  },
  loesung: p => lZahl(r(p.l * p.b)),
  frage: p => ({
    html: 'Ein Rechteck ist <strong>' + fmt(p.l) + ' ' + p.einheit + '</strong> lang und <strong>' +
      fmt(p.b) + ' ' + p.einheit + '</strong> breit.<br>Wie gross ist seine Fläche?',
    hinweis: 'Fläche = Länge · Breite.',
    einheit: p.einheit + '²'
  }),
  weg: (p, l) => fmt(p.l) + ' · ' + fmt(p.b) + ' = <strong>' + fmt(l.wert) + ' ' + p.einheit + '²</strong>',
  entartet: (p) => p.l === p.b ? 'Quadrat statt Rechteck' : null
},

{
  id: '6.7.umfang', thema: '6.7', eingabe: 'zahl',
  lernziel: 'Umfang eines Rechtecks berechnen',
  params(stufe, rnd) {
    return { l: rnd.int(3, 25), b: rnd.int(2, 18), einheit: rnd.wahl(['m', 'cm', 'mm']) };
  },
  loesung: p => lZahl(2 * (p.l + p.b)),
  frage: p => ({
    html: 'Ein Rechteck ist <strong>' + p.l + ' ' + p.einheit + '</strong> lang und <strong>' +
      p.b + ' ' + p.einheit + '</strong> breit.<br>Wie gross ist sein Umfang?',
    hinweis: 'Umfang = 2 · (Länge + Breite).',
    einheit: p.einheit
  }),
  weg: (p, l) => '2 · (' + p.l + ' + ' + p.b + ') = 2 · ' + (p.l + p.b) + ' = <strong>' +
    fmt(l.wert) + ' ' + p.einheit + '</strong>',
  entartet: (p) => p.l === p.b ? 'Quadrat statt Rechteck' : null
},

{
  id: '6.7.flaechenUmwandeln', thema: '6.7', eingabe: 'zahl',
  lernziel: 'Flächenmasse umwandeln',
  params(stufe, rnd) {
    const u = rnd.wahl(FLAECHEN_UM);
    const richtung = rnd.wahl(['grossZuKlein', 'kleinZuGross']);
    const wert = richtung === 'grossZuKlein'
      ? (stufe === 'profi' ? r(rnd.int(15, 400) / 10) : rnd.int(2, 40))
      : rnd.int(1, 90) * 100;
    return { u, richtung, wert };
  },
  loesung: p => lZahl(p.richtung === 'grossZuKlein' ? r(p.wert * p.u.f) : r(p.wert / p.u.f)),
  frage: p => ({
    html: 'Wandle um:<br>' + rechnung(fmt(p.wert) + ' ' +
      (p.richtung === 'grossZuKlein' ? p.u.gross + '  =  ?  ' + p.u.klein : p.u.klein + '  =  ?  ' + p.u.gross)),
    hinweis: 'Bei Flächenmassen geht es in Hunderterschritten: 1 ' + p.u.gross + ' = 100 ' + p.u.klein + '.',
    einheit: p.richtung === 'grossZuKlein' ? p.u.klein : p.u.gross
  }),
  weg: (p, l) => fmt(p.wert) + ' ' + (p.richtung === 'grossZuKlein' ? p.u.gross : p.u.klein) +
    ' = <strong>' + fmt(l.wert) + ' ' + (p.richtung === 'grossZuKlein' ? p.u.klein : p.u.gross) + '</strong>'
},

{
  id: '6.7.volumen', thema: '6.7', eingabe: 'zahl',
  lernziel: 'Volumen eines Quaders berechnen',
  params(stufe, rnd) {
    const max = stufe === 'basis' ? 8 : (stufe === 'profi' ? 20 : 12);
    return { a: rnd.int(2, max), b: rnd.int(2, max), c: rnd.int(2, max) };
  },
  loesung: p => lZahl(p.a * p.b * p.c),
  frage: p => ({
    html: 'Ein Quader ist <strong>' + p.a + ' cm</strong> lang, <strong>' + p.b + ' cm</strong> breit und <strong>' +
      p.c + ' cm</strong> hoch.<br>Wie gross ist sein Volumen?',
    hinweis: 'Volumen = Länge · Breite · Höhe.',
    einheit: 'cm³'
  }),
  weg: (p, l) => p.a + ' · ' + p.b + ' = ' + (p.a * p.b) + '; ' + (p.a * p.b) + ' · ' + p.c +
    ' = <strong>' + fmt(l.wert) + ' cm³</strong>'
},

{
  id: '6.7.flaecheRueck', thema: '6.7', eingabe: 'zahl',
  lernziel: 'Fehlende Seitenlänge aus der Fläche berechnen',
  params(stufe, rnd) {
    const l = rnd.int(3, stufe === 'profi' ? 30 : 15);
    const b = rnd.int(2, stufe === 'profi' ? 24 : 12);
    return { l, b, einheit: rnd.wahl(['m', 'cm']) };
  },
  loesung: p => lZahl(p.b),
  frage: p => ({
    html: 'Ein Rechteck hat eine Fläche von <strong>' + fmt(p.l * p.b) + ' ' + p.einheit + '²</strong> und ist <strong>' +
      p.l + ' ' + p.einheit + '</strong> lang.<br>Wie breit ist es?',
    hinweis: 'Teile die Fläche durch die bekannte Seitenlänge.',
    einheit: p.einheit
  }),
  weg: (p, l) => fmt(p.l * p.b) + ' : ' + p.l + ' = <strong>' + fmt(l.wert) + ' ' + p.einheit + '</strong>',
  entartet: (p) => p.l === p.b ? 'Quadrat statt Rechteck' : null
}
];
