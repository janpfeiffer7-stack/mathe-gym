/* Kernfunktionen: Schweizer Zahlenschreibweise, Bruchparser, Prüflogik. */

import { fmt, parseNum, gleichZahl, r, dezimalstellen } from '../src/core/zahl.js';
import { parseBruch, pruefeBruch, ggT, kgV, kuerze, alsGemischt } from '../src/core/bruch.js';
import { pruefeAntwort } from '../src/aufgaben/pruefer.js';

const faelle = [];
const t = (was, fn) => faelle.push({ was, fn });
const gleich = (a, b, was) => { if (a !== b) throw new Error(was + ': erhalten ' + JSON.stringify(a) + ', erwartet ' + JSON.stringify(b)); };
const wahr = (a, was) => { if (!a) throw new Error(was + ': erwartet true'); };
const falsch = (a, was) => { if (a) throw new Error(was + ': erwartet false'); };

/* ---- Anzeige ---- */
t('fmt: Tausender-Apostroph', () => {
  gleich(fmt(12500), '12\u2019500', '12500');
  gleich(fmt(1250000), '1\u2019250\u2019000', '1250000');
  gleich(fmt(999), '999', '999');
  gleich(fmt(1000), '1\u2019000', '1000');
});
t('fmt: Dezimalpunkt und echtes Minus', () => {
  gleich(fmt(3.5), '3.5', '3.5');
  gleich(fmt(0.05), '0.05', '0.05');
  gleich(fmt(-3.5), '\u22123.5', 'negativ');
  gleich(fmt(-12500), '\u221212\u2019500', 'negativ gross');
});
t('fmt: keine Exponentialschreibweise', () => {
  gleich(fmt(0.000001), '0.000001', 'sehr klein');
  gleich(fmt(4000000000), '4\u2019000\u2019000\u2019000', 'Milliarde');
});
t('fmt und parseNum sind zueinander passend', () => {
  [0, 1, 999, 1000, 13100, 1250000, 0.5, 32.5, 0.129, 200.7, -45.25, 4000000000]
    .forEach(n => { if (Math.abs(parseNum(fmt(n)) - n) > 1e-9) throw new Error('Rundlauf scheitert bei ' + n); });
});

/* ---- Eingabe ---- */
t('parseNum akzeptiert alle üblichen Schreibweisen', () => {
  gleich(parseNum('12500'), 12500, 'ohne Trennung');
  gleich(parseNum('12\u2019500'), 12500, 'Apostroph');
  gleich(parseNum("12'500"), 12500, 'gerader Apostroph');
  gleich(parseNum('12 500'), 12500, 'Leerzeichen');
  gleich(parseNum('3,5'), 3.5, 'Komma');
  gleich(parseNum('3.5'), 3.5, 'Punkt');
  gleich(parseNum('  42  '), 42, 'Leerraum');
  gleich(parseNum('\u22127'), -7, 'echtes Minus');
  gleich(parseNum('-7'), -7, 'normales Minus');
  gleich(parseNum('.5'), 0.5, 'führender Punkt');
});
t('parseNum weist Unsinn zurück', () => {
  ['', '   ', 'abc', '3..5', '3,5,7', '5 kg', '--3', '3-', null, undefined]
    .forEach(s => { if (!isNaN(parseNum(s))) throw new Error('sollte NaN sein: ' + s); });
});
t('gleichZahl toleriert Gleitkomma-Ungenauigkeit', () => {
  wahr(gleichZahl('0.3', 0.1 + 0.2), '0.1+0.2');
  wahr(gleichZahl('12\u2019500', 12500), 'Apostroph');
  falsch(gleichZahl('0.31', 0.3), 'zu ungenau');
  falsch(gleichZahl('', 5), 'leer');
});

/* ---- Brüche ---- */
t('parseBruch erkennt die erlaubten Formen', () => {
  gleich(JSON.stringify(parseBruch('3/4')), JSON.stringify({ z: 3, n: 4, form: 'bruch' }), 'einfach');
  gleich(parseBruch('7').z, 7, 'ganz');
  gleich(parseBruch('1 1/2').z, 3, 'gemischt Zähler');
  gleich(parseBruch('1 1/2').n, 2, 'gemischt Nenner');
  gleich(parseBruch('-3/4').z, -3, 'negativ');
  gleich(parseBruch('3/-4').z, -3, 'Minus im Nenner wandert nach oben');
});
t('parseBruch weist Dezimalzahlen und Unsinn zurück', () => {
  ['0.75', '0,75', '3/0', '', 'abc', '3//4', '1 2', null].forEach(s => {
    if (parseBruch(s) !== null) throw new Error('sollte null sein: ' + s);
  });
});
t('pruefeBruch: Regel gleichwertig', () => {
  wahr(pruefeBruch('1/2', 1, 2), 'identisch');
  wahr(pruefeBruch('2/4', 1, 2), 'gleichwertig ungekürzt');
  wahr(pruefeBruch('50/100', 1, 2), 'stark erweitert');
  wahr(pruefeBruch('1 1/2', 3, 2), 'gemischt');
  falsch(pruefeBruch('2/3', 1, 2), 'falscher Wert');
  falsch(pruefeBruch('0.5', 1, 2), 'Dezimalzahl nicht erlaubt');
});
t('pruefeBruch: Regel gekuerzt', () => {
  wahr(pruefeBruch('3/4', 3, 4, 'gekuerzt'), 'bereits gekürzt');
  falsch(pruefeBruch('6/8', 3, 4, 'gekuerzt'), 'nicht gekürzt');
  falsch(pruefeBruch('9/12', 3, 4, 'gekuerzt'), 'nicht gekürzt');
});
t('pruefeBruch: Regel gemischt', () => {
  wahr(pruefeBruch('1 1/2', 3, 2, 'gemischt'), 'gemischt angegeben');
  falsch(pruefeBruch('3/2', 3, 2, 'gemischt'), 'unecht statt gemischt');
  wahr(pruefeBruch('1/2', 1, 2, 'gemischt'), 'kein Ganzes vorhanden');
});
t('ggT, kgV, kürzen, gemischt', () => {
  gleich(ggT(12, 8), 4, 'ggT');
  gleich(ggT(7, 13), 1, 'teilerfremd');
  gleich(kgV(4, 6), 12, 'kgV');
  gleich(kuerze(6, 8).join('/'), '3/4', 'kürzen');
  gleich(alsGemischt(7, 2).ganz, 3, 'gemischt Ganze');
  gleich(alsGemischt(7, 2).z, 1, 'gemischt Rest');
});

/* ---- Prüflogik der Oberfläche ---- */
t('pruefeAntwort: Zahl', () => {
  wahr(pruefeAntwort({ art: 'zahl', wert: 90 }, '90').richtig, 'einfach');
  wahr(pruefeAntwort({ art: 'zahl', wert: 12500 }, '12\u2019500').richtig, 'Apostroph');
  wahr(pruefeAntwort({ art: 'zahl', wert: 3.5 }, '3,5').richtig, 'Komma');
  wahr(pruefeAntwort({ art: 'zahl', wert: 5 }, '').leer, 'leer erkannt');
  falsch(pruefeAntwort({ art: 'zahl', wert: 5 }, '6').richtig, 'falsch');
});
t('pruefeAntwort: Bruch aus getrennten Feldern', () => {
  wahr(pruefeAntwort({ art: 'bruch', z: 3, n: 4, regel: 'gleichwertig' }, { ganz: '', z: '3', n: '4' }).richtig, 'Felder');
  wahr(pruefeAntwort({ art: 'bruch', z: 3, n: 4, regel: 'gleichwertig' }, { ganz: '', z: '6', n: '8' }).richtig, 'gleichwertig');
  falsch(pruefeAntwort({ art: 'bruch', z: 3, n: 4, regel: 'gekuerzt' }, { ganz: '', z: '6', n: '8' }).richtig, 'Kürzung verlangt');
  wahr(pruefeAntwort({ art: 'bruch', z: 3, n: 2, regel: 'gleichwertig' }, { ganz: '1', z: '1', n: '2' }).richtig, 'gemischt');
  wahr(pruefeAntwort({ art: 'bruch', z: 3, n: 4 }, { ganz: '', z: '3', n: '' }).leer, 'unvollständig');
});
t('pruefeAntwort: Auswahl, Mehrfeld, Ordnen', () => {
  wahr(pruefeAntwort({ art: 'auswahl', richtig: 2 }, 2).richtig, 'Auswahl richtig');
  falsch(pruefeAntwort({ art: 'auswahl', richtig: 2 }, 1).richtig, 'Auswahl falsch');
  wahr(pruefeAntwort({ art: 'auswahl', richtig: 2 }, -1).leer, 'nichts gewählt');

  const mf = { art: 'mehrfeld', felder: [{ art: 'zahl', wert: 2 }, { art: 'zahl', wert: 5 }] };
  wahr(pruefeAntwort(mf, ['2', '5']).richtig, 'beide richtig');
  falsch(pruefeAntwort(mf, ['2', '6']).richtig, 'eines falsch');
  gleich(JSON.stringify(pruefeAntwort(mf, ['2', '6']).teile), '[true,false]', 'Teilergebnisse');

  const ord = { art: 'ordnen', werte: [1.5, 2.5, 3.5] };
  wahr(pruefeAntwort(ord, [1.5, 2.5, 3.5]).richtig, 'richtige Reihenfolge');
  falsch(pruefeAntwort(ord, [2.5, 1.5, 3.5]).richtig, 'falsche Reihenfolge');
  falsch(pruefeAntwort(ord, [1.5, 2.5]).richtig, 'unvollständig');
});

/* ---- Hilfsfunktionen ---- */
t('Rundung und Dezimalstellen', () => {
  gleich(r(0.1 + 0.2), 0.3, 'Gleitkomma');
  gleich(dezimalstellen(3.25), 2, 'zwei Stellen');
  gleich(dezimalstellen(7), 0, 'ganze Zahl');
});

export function laufen({ still = false } = {}) {
  const bericht = { gesamt: 0, fehler: [] };
  for (const f of faelle) {
    bericht.gesamt++;
    try { f.fn(); }
    catch (e) { bericht.fehler.push({ typ: f.was, grund: e.message }); }
  }
  if (!still) {
    console.log('Kernfunktionen: ' + bericht.gesamt + ' Testgruppen.');
    if (bericht.fehler.length === 0) console.log('Alle bestanden.');
    else bericht.fehler.forEach(f => console.log('  FEHLER ' + f.typ + ' → ' + f.grund));
  }
  return bericht;
}

if (process.argv[1] && process.argv[1].endsWith('core.test.js')) {
  const b = laufen();
  process.exit(b.fehler.length === 0 ? 0 : 1);
}
