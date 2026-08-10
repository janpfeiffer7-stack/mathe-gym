import { fmt, r } from '../../core/zahl.js';
import { lZahl, lAuswahl, rechnung } from '../baukasten.js';

/* 6.4 Proportionalität und Geschwindigkeit */

const UMGEKEHRT = [
  { text: 'Zwei Malerinnen streichen eine Wand in 6 Stunden. Wie lange brauchen vier Malerinnen für dieselbe Wand?', richtig: 'halb so lange', falsch: ['doppelt so lange', 'gleich lang', 'viermal so lange'] },
  { text: 'Ein Vorrat reicht für 8 Tage. Wie lange reicht er, wenn doppelt so viele Personen davon essen?', richtig: 'halb so lange', falsch: ['doppelt so lange', 'gleich lang', 'achtmal so lange'] },
  { text: 'Ein Velofahrer fährt halb so schnell wie zuvor. Wie lange braucht er für dieselbe Strecke?', richtig: 'doppelt so lange', falsch: ['halb so lange', 'gleich lang', 'viermal so lange'] },
  { text: 'Eine Ladung wird auf dreimal so viele Kisten verteilt. Wie schwer ist eine einzelne Kiste?', richtig: 'ein Drittel so schwer', falsch: ['dreimal so schwer', 'gleich schwer', 'halb so schwer'] }
];

export default [
{
  id: '6.4.prop', thema: '6.4', eingabe: 'zahl',
  lernziel: 'Proportionale Aufgaben lösen',
  params(stufe, rnd) {
    const pro = stufe === 'profi' ? r(rnd.int(25, 95) / 10) : rnd.int(3, 12);
    const a = rnd.int(4, 9);
    const b = rnd.intAusser(3, 12, [a]);
    const k = rnd.wahl([
      { ding: 'Birnen', wert: 'Schnitze' },
      { ding: 'Meter Zaun', wert: 'Pfosten' },
      { ding: 'Portionen', wert: 'Gramm Reis' }
    ]);
    return { pro, a, b, k };
  },
  loesung: p => lZahl(r(p.b * p.pro)),
  frage: p => ({
    html: 'Aus <strong>' + p.a + ' ' + p.k.ding + '</strong> erhält man <strong>' + fmt(r(p.a * p.pro)) + ' ' +
      p.k.wert + '</strong>.<br>Wie viele ' + p.k.wert + ' erhält man aus <strong>' + p.b + ' ' + p.k.ding + '</strong>?',
    hinweis: 'Berechne zuerst den Wert für ein einziges Stück.',
    einheit: p.k.wert
  }),
  weg: (p, l) => '<ol><li>1 → ' + fmt(r(p.a * p.pro)) + ' : ' + p.a + ' = ' + fmt(p.pro) + '</li>' +
    '<li>' + p.b + ' · ' + fmt(p.pro) + ' = <strong>' + fmt(l.wert) + '</strong></li></ol>'
},

{
  id: '6.4.geschwindigkeit', thema: '6.4', eingabe: 'zahl',
  lernziel: 'Geschwindigkeit in km/h berechnen',
  params(stufe, rnd) {
    if (stufe === 'basis') {
      const kmh = rnd.int(4, 30);
      return { art: 'std', strecke: kmh * rnd.int(2, 4), stunden: 0, kmh };
    }
    const art = rnd.wahl(['min', 'sek']);
    if (art === 'min') {
      const minuten = rnd.wahl([5, 6, 10, 12, 15, 20, 30]);
      const kmh = rnd.int(4, 90);
      return { art, minuten, km: r(kmh * minuten / 60), kmh };
    }
    const sekunden = rnd.wahl([20, 30, 36, 40, 60]);
    const kmh = rnd.int(5, 60);
    return { art, sekunden, meter: r(kmh * 1000 * sekunden / 3600), kmh };
  },
  loesung: p => lZahl(p.kmh),
  frage(p) {
    if (p.art === 'std') {
      const std = p.strecke / p.kmh;
      return {
        html: 'Ein Fahrzeug legt <strong>' + fmt(p.strecke) + ' km</strong> in <strong>' + fmt(std) +
          ' Stunden</strong> zurück.<br>Wie schnell fährt es in km/h?',
        hinweis: 'Teile die Strecke durch die Anzahl Stunden.', einheit: 'km/h'
      };
    }
    if (p.art === 'min') {
      return {
        html: 'Ein Fahrzeug legt <strong>' + fmt(p.km) + ' km</strong> in <strong>' + p.minuten +
          ' Minuten</strong> zurück.<br>Wie schnell fährt es in km/h?',
        hinweis: 'Überlege, wie weit das Fahrzeug in 60 Minuten käme.', einheit: 'km/h'
      };
    }
    return {
      html: 'Ein Fahrzeug legt <strong>' + fmt(p.meter) + ' m</strong> in <strong>' + p.sekunden +
        ' Sekunden</strong> zurück.<br>Wie schnell fährt es in km/h?',
      hinweis: 'Eine Stunde hat 3600 Sekunden, ein Kilometer 1000 Meter.', einheit: 'km/h'
    };
  },
  weg(p, l) {
    if (p.art === 'std') return fmt(p.strecke) + ' km : ' + fmt(p.strecke / p.kmh) + ' h = <strong>' + fmt(l.wert) + ' km/h</strong>';
    if (p.art === 'min') return 'In 60 Minuten: ' + fmt(p.km) + ' · (60 : ' + p.minuten + ') = <strong>' + fmt(l.wert) + ' km/h</strong>';
    return fmt(p.meter) + ' m in ' + p.sekunden + ' s → in 3600 s: ' + fmt(p.meter * 3600 / p.sekunden) +
      ' m = <strong>' + fmt(l.wert) + ' km/h</strong>';
  },
  entartet(p) {
    if (p.art === 'min' && !Number.isInteger(r(p.km * 100))) return 'unschöne Streckenlänge';
    if (p.art === 'sek' && !Number.isInteger(p.meter)) return 'unschöne Streckenlänge';
    return null;
  }
},

{
  id: '6.4.umgekehrt', thema: '6.4', eingabe: 'auswahl',
  lernziel: 'Umgekehrte Proportionalität erkennen',
  params(stufe, rnd) {
    return { idx: rnd.int(0, UMGEKEHRT.length - 1) };
  },
  loesung: p => lAuswahl(UMGEKEHRT[p.idx].richtig),
  optionen(p) {
    const e = UMGEKEHRT[p.idx];
    return [e.richtig, ...e.falsch].map(t => ({ text: t, wert: t }));
  },
  frage: p => ({
    html: UMGEKEHRT[p.idx].text,
    hinweis: 'Überlege: Wird das eine grösser, wird das andere grösser oder kleiner?'
  }),
  weg: p => 'Richtig ist: <strong>' + UMGEKEHRT[p.idx].richtig + '</strong>. ' +
    'Je mehr vom einen, desto weniger vom anderen – das ist umgekehrt proportional.'
}
];
