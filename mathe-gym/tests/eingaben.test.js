/* Eingabeverhalten und Grenzfälle.
   Prüft, wie die Plattform auf ungültige, alternative und grenzwertige
   Eingaben reagiert – einschliesslich der Ablaufregeln beim Prüfen. */

import { pruefeAntwort } from '../src/aufgaben/pruefer.js';
import { baueAufgabe } from '../src/aufgaben/index.js';
import { zufallsquelle } from '../src/core/zufall.js';
import { TYPEN } from '../src/aufgaben/katalog.js';
import { fmt } from '../src/core/zahl.js';

const faelle = [];
const t = (was, fn) => faelle.push({ was, fn });
const wahr = (a, was) => { if (!a) throw new Error(was); };
const falsch = (a, was) => { if (a) throw new Error(was); };

/* ---- Ungültige Eingaben dürfen nie als richtig gelten ---- */
t('Unsinnige Eingaben werden abgelehnt', () => {
  const p = { art: 'zahl', wert: 42 };
  ['abc', '4 2 x', '42kg', '4.2.3', '--42', '4,2,0', '∞', 'NaN'].forEach(s => {
    falsch(pruefeAntwort(p, s).richtig, 'sollte abgelehnt werden: ' + s);
  });
});

t('Leere Eingaben werden als leer erkannt, nicht als falsch', () => {
  wahr(pruefeAntwort({ art: 'zahl', wert: 5 }, '').leer, 'Zahl leer');
  wahr(pruefeAntwort({ art: 'zahl', wert: 5 }, '   ').leer, 'nur Leerzeichen');
  wahr(pruefeAntwort({ art: 'bruch', z: 1, n: 2 }, { ganz: '', z: '', n: '' }).leer, 'Bruch leer');
  wahr(pruefeAntwort({ art: 'auswahl', richtig: 0 }, -1).leer, 'Auswahl leer');
  wahr(pruefeAntwort({ art: 'ordnen', werte: [1, 2] }, []).leer, 'Ordnen leer');
  wahr(pruefeAntwort({ art: 'mehrfeld', felder: [{ art: 'zahl', wert: 1 }] }, ['']).leer, 'Mehrfeld leer');
});

/* ---- Alternative korrekte Schreibweisen ---- */
t('Dieselbe Zahl in verschiedenen Schreibweisen', () => {
  const p = { art: 'zahl', wert: 12500 };
  ['12500', '12\u2019500', "12'500", '12 500', ' 12500 '].forEach(s => {
    wahr(pruefeAntwort(p, s).richtig, 'sollte richtig sein: ' + s);
  });
  const q = { art: 'zahl', wert: 3.25 };
  ['3.25', '3,25', ' 3.25'].forEach(s => wahr(pruefeAntwort(q, s).richtig, 'sollte richtig sein: ' + s));
});

t('Negative Zahlen mit beiden Minuszeichen', () => {
  const p = { art: 'zahl', wert: -7.5 };
  wahr(pruefeAntwort(p, '-7.5').richtig, 'normales Minus');
  wahr(pruefeAntwort(p, '\u22127,5').richtig, 'echtes Minus mit Komma');
});

t('Brüche: gleichwertige Formen', () => {
  const p = { art: 'bruch', z: 1, n: 2, regel: 'gleichwertig' };
  [['', '1', '2'], ['', '2', '4'], ['', '50', '100']].forEach(f => {
    wahr(pruefeAntwort(p, { ganz: f[0], z: f[1], n: f[2] }).richtig, 'sollte richtig sein: ' + f.join('/'));
  });
  falsch(pruefeAntwort(p, { ganz: '', z: '1', n: '3' }).richtig, 'falscher Wert');
  falsch(pruefeAntwort(p, { ganz: '', z: '1', n: '0' }).richtig, 'Nenner 0');
});

t('Brüche: Kürzungspflicht wird durchgesetzt', () => {
  const p = { art: 'bruch', z: 2, n: 5, regel: 'gekuerzt' };
  wahr(pruefeAntwort(p, { ganz: '', z: '2', n: '5' }).richtig, 'gekürzt');
  falsch(pruefeAntwort(p, { ganz: '', z: '4', n: '10' }).richtig, 'ungekürzt abgelehnt');
  falsch(pruefeAntwort(p, { ganz: '', z: '20', n: '50' }).richtig, 'stark erweitert abgelehnt');
});

t('Mehrfeld: Teilergebnisse werden einzeln zurückgemeldet', () => {
  const p = { art: 'mehrfeld', felder: [{ art: 'zahl', wert: 1.5 }, { art: 'zahl', wert: 9 }] };
  const e = pruefeAntwort(p, ['1,5', '8']);
  falsch(e.richtig, 'insgesamt falsch');
  wahr(e.teile[0] === true && e.teile[1] === false, 'erstes richtig, zweites falsch');
});

t('Ordnen: Reihenfolge muss stimmen', () => {
  const p = { art: 'ordnen', werte: [1.2, 2.4, 3.6] };
  wahr(pruefeAntwort(p, [1.2, 2.4, 3.6]).richtig, 'richtig');
  falsch(pruefeAntwort(p, [3.6, 2.4, 1.2]).richtig, 'rückwärts');
  falsch(pruefeAntwort(p, [1.2, 3.6, 2.4]).richtig, 'vertauscht');
  falsch(pruefeAntwort(p, [1.2, 2.4]).richtig, 'unvollständig');
});

/* ---- Ablaufregeln: Mehrfachklick, zweiter Versuch ---- */
t('Mehrfachklick-Schutz sperrt kurzzeitig', async () => {
  // Nachbildung der Sperre aus training.js
  let sperre = false, treffer = 0;
  const pruefen = () => {
    if (sperre) return;
    sperre = true;
    treffer++;
    setTimeout(() => { sperre = false; }, 400);
  };
  for (let i = 0; i < 10; i++) pruefen();
  if (treffer !== 1) throw new Error('Mehrfachklick nicht abgefangen: ' + treffer + ' statt 1');
});

t('Zweiter Versuch verändert das Prüfergebnis nicht', () => {
  const p = { art: 'zahl', wert: 12 };
  falsch(pruefeAntwort(p, '11').richtig, 'erster Versuch falsch');
  wahr(pruefeAntwort(p, '12').richtig, 'zweiter Versuch richtig');
});

/* ---- Grenzfälle je Generator ---- */
t('Jeder Generator liefert auf jeder Stufe eine gültige Aufgabe', () => {
  const rnd = zufallsquelle(4711);
  for (const typ of TYPEN) {
    for (const stufe of ['basis', 'standard', 'profi']) {
      const a = baueAufgabe(typ.id, stufe, rnd);
      if (!a.frageHTML || !a.pruefung) throw new Error(typ.id + '/' + stufe + ': unvollständig');
      if (!a.loesungHTML) throw new Error(typ.id + '/' + stufe + ': kein Lösungsweg');
      if (!a.hinweis) throw new Error(typ.id + '/' + stufe + ': kein Hinweis');
    }
  }
});

t('Bruchaufgaben zeigen immer eine Formatregel an', () => {
  const rnd = zufallsquelle(99);
  for (const typ of TYPEN.filter(x => x.eingabe === 'bruch')) {
    for (const stufe of ['basis', 'standard', 'profi']) {
      const a = baueAufgabe(typ.id, stufe, rnd);
      if (!a.regelText) throw new Error(typ.id + '/' + stufe + ': Formatregel fehlt');
    }
  }
});

t('Auswahlaufgaben haben mindestens zwei und höchstens sechs Optionen', () => {
  const rnd = zufallsquelle(1234);
  for (const typ of TYPEN.filter(x => x.eingabe === 'auswahl')) {
    for (let i = 0; i < 60; i++) {
      const a = baueAufgabe(typ.id, 'standard', rnd);
      const n = a.pruefung.optionen.length;
      if (n < 2 || n > 6) throw new Error(typ.id + ': ' + n + ' Optionen');
    }
  }
});

t('Musterlösung wird bei allen Aufgabenarten akzeptiert', () => {
  const rnd = zufallsquelle(2026);
  for (const typ of TYPEN) {
    const a = baueAufgabe(typ.id, 'standard', rnd);
    const p = a.pruefung;
    let antwort;
    if (p.art === 'zahl') antwort = fmt(p.wert);
    else if (p.art === 'bruch') antwort = { ganz: '', z: String(p.z), n: String(p.n) };
    else if (p.art === 'auswahl') antwort = p.richtig;
    else if (p.art === 'ordnen') antwort = p.werte.slice();
    else antwort = p.felder.map(f => f.art === 'bruch' ? { ganz: '', z: String(f.z), n: String(f.n) } : fmt(f.wert));
    if (!pruefeAntwort(p, antwort).richtig) throw new Error(typ.id + ': Musterlösung abgelehnt');
  }
});

export async function laufen({ still = false } = {}) {
  const bericht = { gesamt: 0, fehler: [] };
  for (const f of faelle) {
    bericht.gesamt++;
    try { await f.fn(); }
    catch (e) { bericht.fehler.push({ typ: f.was, grund: e.message }); }
  }
  if (!still) {
    console.log('Eingaben und Grenzfälle: ' + bericht.gesamt + ' Testgruppen.');
    if (bericht.fehler.length === 0) console.log('Alle bestanden.');
    else bericht.fehler.forEach(f => console.log('  FEHLER ' + f.typ + ' → ' + f.grund));
  }
  return bericht;
}

if (process.argv[1] && process.argv[1].endsWith('eingaben.test.js')) {
  laufen().then(b => process.exit(b.fehler.length === 0 ? 0 : 1));
}
