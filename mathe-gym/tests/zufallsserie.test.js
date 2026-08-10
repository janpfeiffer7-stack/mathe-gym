/* Grosse Zufallsserie über alle Aufgabentypen und Stufen.
   Prüft, dass jede erzeugte Aufgabe die Validierung besteht, die hinterlegte
   Lösung von der Prüflogik akzeptiert wird und aus dem Speicher exakt
   rekonstruierbar ist. */

import { zufallsquelle } from '../src/core/zufall.js';
import { TYPEN, katalogPruefen } from '../src/aufgaben/katalog.js';
import { baueAufgabe, baueAusSpeicher, alsSpeicher } from '../src/aufgaben/index.js';
import { pruefeAufgabe, nurText } from '../src/aufgaben/validator.js';
import { pruefeAntwort } from '../src/aufgaben/pruefer.js';
import { fmt } from '../src/core/zahl.js';
import { STUFEN } from '../src/core/formate.js';

const PRO_TYP_UND_STUFE = Number(process.env.N || 450);

/** Erzeugt die korrekte Antwort zu einer Aufgabe (so, wie ein Kind sie eingäbe). */
export function musterAntwort(a) {
  const p = a.pruefung;
  if (p.art === 'zahl') return fmt(p.wert);
  if (p.art === 'bruch') return { ganz: '', z: String(p.z), n: String(p.n) };
  if (p.art === 'auswahl') return p.richtig;
  if (p.art === 'ordnen') return p.werte.slice();
  if (p.art === 'mehrfeld') {
    return p.felder.map(f => f.art === 'bruch' ? { ganz: '', z: String(f.z), n: String(f.n) } : fmt(f.wert));
  }
  return null;
}

export function laufen({ proTypUndStufe = PRO_TYP_UND_STUFE, seed = 20260807, still = false } = {}) {
  const bericht = { gesamt: 0, fehler: [], proTyp: {}, verworfen: 0 };

  const katalogFehler = katalogPruefen();
  katalogFehler.forEach(f => bericht.fehler.push({ typ: '(Katalog)', grund: f }));

  for (const typ of TYPEN) {
    bericht.proTyp[typ.id] = { anzahl: 0, fehler: 0, stufen: {} };

    for (const stufe of STUFEN) {
      const rnd = zufallsquelle(seed + hash(typ.id + stufe));
      let ok = 0;

      for (let i = 0; i < proTypUndStufe; i++) {
        let a;
        try {
          a = baueAufgabe(typ.id, stufe, rnd);
        } catch (e) {
          bericht.fehler.push({ typ: typ.id, stufe, grund: 'Erzeugung fehlgeschlagen: ' + e.message });
          continue;
        }
        bericht.gesamt++;
        ok++;

        // 1) Validierung muss bestanden sein
        const v = pruefeAufgabe(a);
        if (v.length) {
          bericht.fehler.push({ typ: typ.id, stufe, grund: 'Validierung: ' + v.join('; '),
            frage: nurText(a.frageHTML).slice(0, 110) });
        }

        // 2) Die hinterlegte Lösung muss von der Prüflogik akzeptiert werden
        const erg = pruefeAntwort(a.pruefung, musterAntwort(a));
        if (!erg.richtig) {
          bericht.fehler.push({ typ: typ.id, stufe, grund: 'Musterlösung wird nicht akzeptiert',
            frage: nurText(a.frageHTML).slice(0, 110) });
        }

        // 3) Rekonstruktion aus dem Fehlerspeicher muss identisch sein
        const wieder = baueAusSpeicher(alsSpeicher(a));
        if (!wieder || wieder.frageHTML !== a.frageHTML ||
            JSON.stringify(wieder.pruefung) !== JSON.stringify(a.pruefung)) {
          bericht.fehler.push({ typ: typ.id, stufe, grund: 'Rekonstruktion aus dem Speicher weicht ab' });
        }
      }
      bericht.proTyp[typ.id].stufen[stufe] = ok;
      bericht.proTyp[typ.id].anzahl += ok;
    }
    bericht.proTyp[typ.id].fehler = bericht.fehler.filter(f => f.typ === typ.id).length;
  }

  if (!still) {
    console.log('Zufallsserie: ' + bericht.gesamt + ' Aufgaben über ' + TYPEN.length + ' Typen.');
    if (bericht.fehler.length === 0) {
      console.log('Keine Verstösse.');
    } else {
      console.log(bericht.fehler.length + ' Verstösse:');
      const gruppiert = {};
      bericht.fehler.forEach(f => {
        const k = f.typ + ' | ' + f.grund.split(':')[0];
        gruppiert[k] = (gruppiert[k] || 0) + 1;
      });
      Object.keys(gruppiert).sort().forEach(k => console.log('  ' + String(gruppiert[k]).padStart(5) + ' × ' + k));
      bericht.fehler.slice(0, 12).forEach(f => console.log('   → ' + f.typ + ' [' + (f.stufe || '') + '] ' + f.grund + (f.frage ? '  « ' + f.frage : '')));
    }
  }
  return bericht;
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 100000;
}

if (process.argv[1] && process.argv[1].endsWith('zufallsserie.test.js')) {
  const b = laufen();
  process.exit(b.fehler.length === 0 ? 0 : 1);
}
