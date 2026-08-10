/* Führt alle Tests aus und schreibt docs/testbericht.md.
   Aufruf:  npm test          (Standardumfang, >20'000 Aufgaben)
            N=900 M=800 npm test   (grösserer Umfang) */

import { writeFileSync, mkdirSync } from 'node:fs';
import { laufen as kern } from './core.test.js';
import { laufen as zufall } from './zufallsserie.test.js';
import { laufen as unabhaengig } from './generatoren.test.js';
import { laufen as eingaben } from './eingaben.test.js';
import { TYPEN, THEMEN } from '../src/aufgaben/katalog.js';

const proTypUndStufe = Number(process.env.N || 100);
const proNachrechnung = Number(process.env.M || 200);

console.log('Mathe Gym – Testlauf\n' + '='.repeat(50));

const k = kern();
console.log('');
const z = zufall({ proTypUndStufe });
console.log('');
const u = unabhaengig({ proFall: proNachrechnung });
console.log('');
const e = await eingaben();
console.log('');
const { execFileSync } = await import('node:child_process');
let etappe2Ok = true;
try {
  console.log(execFileSync('node', ['tests/etappe2.test.js'], { encoding: 'utf8' }).trim());
} catch (err) {
  etappe2Ok = false;
  console.log((err.stdout || '') + (err.stderr || ''));
}

const gesamtAufgaben = z.gesamt + u.gesamt;
const gesamtFehler = k.fehler.length + z.fehler.length + u.fehler.length + e.fehler.length + (etappe2Ok ? 0 : 1);

console.log('\n' + '='.repeat(50));
console.log('Erzeugte Testaufgaben: ' + gesamtAufgaben.toLocaleString('de-CH'));
console.log('Offene Befunde: ' + gesamtFehler);

/* ---------------- Bericht schreiben ---------------- */
const datum = new Date().toISOString().slice(0, 10);
const nachrechnungTypen = Object.keys(u.abgedeckt);

const zeilen = [];
zeilen.push('# Testbericht Mathe Gym');
zeilen.push('');
zeilen.push('Erstellt am ' + datum + ' durch `npm test`. Dieser Bericht wird bei jedem Lauf neu geschrieben.');
zeilen.push('');
zeilen.push('## Zusammenfassung');
zeilen.push('');
zeilen.push('| Kennzahl | Wert |');
zeilen.push('|---|---|');
zeilen.push('| Themen | ' + THEMEN.length + ' |');
zeilen.push('| Aufgabentypen | ' + TYPEN.length + ' |');
zeilen.push('| Automatisch erzeugte Testaufgaben | **' + gesamtAufgaben.toLocaleString('de-CH') + '** |');
zeilen.push('| Typen mit unabhängiger Nachrechnung | ' + nachrechnungTypen.length + ' von ' + TYPEN.length + ' |');
zeilen.push('| Offene Befunde | ' + gesamtFehler + ' |');
zeilen.push('');

zeilen.push('## Was geprüft wurde');
zeilen.push('');
zeilen.push('| Testart | Umfang | Befunde |');
zeilen.push('|---|---|---|');
zeilen.push('| Kernfunktionen (Zahlformat, Bruchparser, Prüflogik) | ' + k.gesamt + ' Testgruppen | ' + k.fehler.length + ' |');
zeilen.push('| Zufallsserie (Validierung, Musterlösung, Rekonstruktion) | ' + z.gesamt.toLocaleString('de-CH') + ' Aufgaben | ' + z.fehler.length + ' |');
zeilen.push('| Unabhängige Nachrechnung aus dem gerenderten Text | ' + u.gesamt.toLocaleString('de-CH') + ' Aufgaben | ' + u.fehler.length + ' |');
zeilen.push('| Eingaben und Grenzfälle | ' + e.gesamt + ' Testgruppen | ' + e.fehler.length + ' |');
zeilen.push('| Auswertungslogik (Etappe 2) | 18 Prüfungen | ' + (etappe2Ok ? 0 : 1) + ' |');
zeilen.push('');

zeilen.push('### Zufallsserie');
zeilen.push('');
zeilen.push('Für jede erzeugte Aufgabe wird geprüft:');
zeilen.push('');
zeilen.push('- Sie besteht sämtliche Validierungsregeln (siehe unten).');
zeilen.push('- Die hinterlegte Lösung wird von der Prüflogik als richtig akzeptiert.');
zeilen.push('- Sie lässt sich aus den gespeicherten Parametern zeichengenau rekonstruieren (nötig für den Fehlerspeicher).');
zeilen.push('');
zeilen.push('Geprüfte Validierungsregeln: kaputte Textbausteine, Nenner 0, Zähler 0, nicht gekürzte Sollwerte bei');
zeilen.push('Kürzungsaufgaben, zu viele Dezimalstellen, Werte ausserhalb der Stufe, doppelte Antwortoptionen nach');
zeilen.push('Text und nach Wert, mehrere richtige Auswahlantworten, doppelte Werte beim Ordnen, fehlende oder');
zeilen.push('überzählige Platzhalter, im Aufgabentext sichtbare Lösung sowie typspezifische Entartungen.');
zeilen.push('');

zeilen.push('### Unabhängige Nachrechnung');
zeilen.push('');
zeilen.push('Dieser Test benutzt die Lösungsfunktion des Generators **nicht**. Er liest den fertig gerenderten');
zeilen.push('Aufgabentext, rechnet mit einem eigenen Verfahren nach und vergleicht. Damit wird ein Fehler auch');
zeilen.push('dann gefunden, wenn Generator und Lösung denselben Denkfehler teilen.');
zeilen.push('');
zeilen.push('| Aufgabentyp | Art der Nachrechnung |');
zeilen.push('|---|---|');
nachrechnungTypen.sort().forEach(typ => {
  zeilen.push('| `' + typ + '` | ' + [...new Set(u.abgedeckt[typ])].join('; ') + ' |');
});
zeilen.push('');

zeilen.push('## Abdeckung je Aufgabentyp');
zeilen.push('');
zeilen.push('| Typ | Thema | erzeugte Aufgaben | unabhängig nachgerechnet |');
zeilen.push('|---|---|---|---|');
TYPEN.forEach(typ => {
  const s = z.proTyp[typ.id] || { anzahl: 0 };
  zeilen.push('| `' + typ.id + '` | ' + typ.thema + ' | ' + s.anzahl.toLocaleString('de-CH') + ' | ' +
    (nachrechnungTypen.includes(typ.id) ? 'ja' : '— *(nur Validierung)*') + ' |');
});
zeilen.push('');

zeilen.push('## Befunde');
zeilen.push('');
const alleFehler = [
  ...k.fehler.map(f => ({ quelle: 'Kernfunktionen', ...f })),
  ...z.fehler.map(f => ({ quelle: 'Zufallsserie', ...f })),
  ...u.fehler.map(f => ({ quelle: 'Nachrechnung', ...f })),
  ...e.fehler.map(f => ({ quelle: 'Eingaben', ...f }))
];
if (alleFehler.length === 0) {
  zeilen.push('In diesem Lauf wurden keine Abweichungen festgestellt.');
} else {
  zeilen.push('| Quelle | Typ | Stufe | Befund |');
  zeilen.push('|---|---|---|---|');
  alleFehler.slice(0, 200).forEach(f => {
    zeilen.push('| ' + f.quelle + ' | `' + (f.typ || '') + '` | ' + (f.stufe || '') + ' | ' + f.grund + ' |');
  });
  if (alleFehler.length > 200) zeilen.push('');
  if (alleFehler.length > 200) zeilen.push('… und ' + (alleFehler.length - 200) + ' weitere.');
}
zeilen.push('');

zeilen.push('## Verbleibende Risiken');
zeilen.push('');
zeilen.push('Diese Punkte sind **nicht** durch die Tests abgedeckt und bleiben offen:');
zeilen.push('');
zeilen.push('1. **Kein Test auf echtem Gerät.** Alle Tests laufen in Node. Das Verhalten von Safari auf iPadOS');
zeilen.push('   (Bildschirmtastatur, Fokusreihenfolge, VoiceOver, Touch-Latenz, Druckausgabe) ist nicht gemessen.');
zeilen.push('   Bitte die Prüfliste in `docs/ipad-pruefliste.md` einmal auf einem echten iPad durchgehen.');
zeilen.push('2. **Didaktische Passung nicht prüfbar.** Die Tests belegen mathematische Richtigkeit, nicht, ob eine');
zeilen.push('   Aufgabe zum Unterrichtsstand passt. Das kann nur eine Lehrperson beurteilen.');
zeilen.push('3. **' + (TYPEN.length - nachrechnungTypen.length) + ' von ' + TYPEN.length + ' Typen ohne unabhängige Nachrechnung.** Bei diesen Typen prüft nur der Validator.');
zeilen.push('   Ein Denkfehler, der Aufgabe und Lösung gleichermassen betrifft, würde dort nicht auffallen.');
zeilen.push('   Betroffen sind vor allem Sachaufgaben, deren Text sich nicht zuverlässig maschinell auslesen lässt.');
zeilen.push('4. **Berechtigungen sind nicht automatisch getestet.** Die Zugriffsregeln liegen in der Datenbank und');
zeilen.push('   lassen sich ohne laufende Instanz nicht prüfen. Die Handprüfung steht in `docs/rechte-pruefliste.md`.');
zeilen.push('5. **Textformulierungen ungeprüft.** Verständlichkeit und Rechtschreibung der Aufgabentexte sind');
zeilen.push('   nicht automatisch geprüft.');
zeilen.push('');
zeilen.push('Kein Generator wird in diesem Bericht als fehlerfrei bezeichnet. Die Tabelle oben zeigt für jeden Typ,');
zeilen.push('**wogegen** er geprüft wurde.');
zeilen.push('');

mkdirSync('docs', { recursive: true });
writeFileSync('docs/testbericht.md', zeilen.join('\n'), 'utf8');
console.log('Bericht geschrieben: docs/testbericht.md');

process.exit(gesamtFehler === 0 ? 0 : 1);
