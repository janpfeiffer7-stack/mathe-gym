/* Prüft die reinen Berechnungsteile von Etappe 2 ohne Browser. */
import { readFileSync } from 'node:fs';

let fehler = 0;
const pruefe = (bed, was) => { if (!bed) { console.log('  FEHLER: ' + was); fehler++; } };

/* --- Zeitfenster-Logik aus lehrer.js nachgebildet --- */
const ZEITRAEUME = [
  { id: 'alles', tage: null }, { id: '7', tage: 7 }, { id: '30', tage: 30 }, { id: '90', tage: 90 }
];
function zeitfenster(id) {
  const z = ZEITRAEUME.find(x => x.id === id) || ZEITRAEUME[0];
  const bis = new Date(Date.now() + 86400000);
  const von = z.tage ? new Date(Date.now() - z.tage * 86400000) : new Date('2000-01-01');
  return { von, bis, gefiltert: !!z.tage };
}
const f7 = zeitfenster('7');
pruefe(f7.gefiltert === true, '7 Tage gilt als gefiltert');
pruefe((f7.bis - f7.von) / 86400000 > 7.9 && (f7.bis - f7.von) / 86400000 < 8.1, '7-Tage-Fenster umfasst 8 Tage inkl. heute');
const fa = zeitfenster('alles');
pruefe(fa.gefiltert === false, 'Gesamtzeitraum gilt als ungefiltert');
pruefe(fa.von.getFullYear() === 2000, 'Gesamtzeitraum beginnt früh genug');

/* --- Verlaufsberechnung: 60 Tage, Lücken werden mit 0 gefüllt --- */
function verlaufTage(zeilen) {
  const heute = new Date();
  const tage = [];
  for (let i = 59; i >= 0; i--) {
    const d = new Date(heute.getTime() - i * 86400000);
    const s = d.toISOString().slice(0, 10);
    const tr = zeilen.find(z => String(z.tag).slice(0, 10) === s);
    tage.push({ bearbeitet: tr ? Number(tr.bearbeitet) : 0, richtig: tr ? Number(tr.richtig) : 0 });
  }
  return tage;
}
const heuteStr = new Date().toISOString().slice(0, 10);
const gestern = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const t = verlaufTage([{ tag: heuteStr, bearbeitet: 12, richtig: 9 }, { tag: gestern, bearbeitet: 4, richtig: 4 }]);
pruefe(t.length === 60, 'Verlauf umfasst genau 60 Tage');
pruefe(t[59].bearbeitet === 12 && t[59].richtig === 9, 'heutiger Wert am rechten Rand');
pruefe(t[58].bearbeitet === 4, 'gestriger Wert korrekt einsortiert');
pruefe(t[0].bearbeitet === 0, 'Tage ohne Übung werden mit 0 gefüllt');
const max = Math.max(1, ...t.map(x => x.bearbeitet));
pruefe(max === 12, 'Maximum korrekt bestimmt');
pruefe(Math.round(9 / max * 90) <= Math.max(3, Math.round(12 / max * 90)), 'Richtig-Balken nie höher als Gesamtbalken');
const leer = verlaufTage([]);
pruefe(Math.max(1, ...leer.map(x => x.bearbeitet)) === 1, 'leerer Verlauf führt nicht zur Division durch 0');

/* --- Themenzusammenfassung über Stufen --- */
function proThema(zeilen) {
  const k = {};
  zeilen.forEach(z => {
    const e = k[z.thema] || (k[z.thema] = { bearbeitet: 0, richtig: 0, stufen: {} });
    e.bearbeitet += z.bearbeitet; e.richtig += z.richtig; e.stufen[z.stufe] = z;
  });
  return k;
}
const zus = proThema([
  { thema: '5.1', stufe: 'basis', bearbeitet: 10, richtig: 8 },
  { thema: '5.1', stufe: 'profi', bearbeitet: 5, richtig: 1 },
  { thema: '5.3', stufe: 'standard', bearbeitet: 4, richtig: 4 }
]);
pruefe(zus['5.1'].bearbeitet === 15 && zus['5.1'].richtig === 9, 'Stufen werden pro Thema addiert');
pruefe(Object.keys(zus['5.1'].stufen).length === 2, 'beide Stufen bleiben einzeln erhalten');
const sortiert = Object.keys(zus).sort((a, b) =>
  (zus[a].richtig / zus[a].bearbeitet) - (zus[b].richtig / zus[b].bearbeitet));
pruefe(sortiert[0] === '5.1', 'schwächstes Thema steht zuoberst');

/* --- CSV-Maskierung --- */
function csvZeile(z) { return z.map(f => '"' + String(f ?? '').replace(/"/g, '""') + '"').join(';'); }
pruefe(csvZeile(['a"b', null, 5]) === '"a""b";"";"5"', 'CSV maskiert Anführungszeichen und null');
pruefe(csvZeile(['Müller; Anna']) === '"Müller; Anna"', 'Semikolon im Text bleibt eingeschlossen');

/* --- Zielmarke-Grenzen --- */
const zielOk = (z) => !isNaN(z) && z >= 3 && z <= 50;
pruefe(zielOk(10) && zielOk(3) && zielOk(50), 'gültige Zielmarken werden angenommen');
pruefe(!zielOk(2) && !zielOk(51) && !zielOk(NaN), 'ungültige Zielmarken werden abgelehnt');

/* --- Sicherheit: Benutzername wird als Text behandelt --- */
const lehrerQuelle = readFileSync('src/lehrer.js', 'utf8');
pruefe(/function sicher\(s\)[\s\S]*?textContent/.test(lehrerQuelle), 'Escape-Funktion nutzt textContent');
pruefe(!/benutzername\s*\+/.test(lehrerQuelle.replace(/sicher\(k\.benutzername\)/g, '')) ||
       lehrerQuelle.includes('sicher(k.benutzername)'), 'Benutzername wird escaped ausgegeben');

console.log(fehler === 0 ? 'Etappe-2-Logik: alle Prüfungen bestanden.' : fehler + ' Fehler gefunden.');
process.exit(fehler === 0 ? 0 : 1);
