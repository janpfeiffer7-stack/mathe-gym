/* Aufgaben-Fabrik.
   baueAufgabe()      erzeugt eine neue Aufgabe (mit Validierung und Neuwurf)
   baueAusSpeicher()  stellt eine gespeicherte Fehleraufgabe exakt wieder her
   Gespeichert werden nur Typ, Stufe, Parameter und Mischwert – kein HTML. */

import { zufallsquelle } from '../core/zufall.js';
import { pruefeAufgabe } from './validator.js';
import { regelText } from './baukasten.js';
import { TYPEN, THEMEN, THEMA_NACH_ID } from './katalog.js';

export { THEMEN, THEMA_NACH_ID, TYPEN };

const MAX_VERSUCHE = 60;

/** Alle Typen eines Themas. */
export function typenDesThemas(themaId) {
  return TYPEN.filter(t => t.thema === themaId);
}

/** Rohbau ohne Validierung – aus Typ, Stufe, Parametern und Mischwert. */
function rohbau(typ, stufe, p, mischSeed) {
  const rnd = zufallsquelle(mischSeed);
  const l = typ.loesung(p);
  const f = typ.frage(p);

  const a = {
    typ: typ.id,
    thema: typ.thema,
    lernziel: typ.lernziel,
    stufe,
    params: p,
    mischSeed,
    eingabe: typ.eingabe,
    frageHTML: f.html,
    einheit: f.einheit || '',
    hinweis: f.hinweis || '',
    loesungHTML: typ.weg(p, l),
    erlaubeLoesungImText: !!typ.erlaubeLoesungImText,
    maxBetrag: typ.maxBetrag || null,
    entartet: typ.entartet ? typ.entartet(p, l) : null
  };

  if (l.art === 'auswahl') {
    const roh = typ.optionen(p, l, rnd);
    const gemischt = rnd.misch(roh);
    const richtig = gemischt.findIndex(o => gleich(o.wert, l.wert));
    a.pruefung = {
      art: 'auswahl',
      optionen: gemischt.map(o => o.text),
      werte: gemischt.map(o => o.wert),
      richtig
    };
  } else if (l.art === 'ordnen') {
    a.pruefung = { art: 'ordnen', werte: l.werte };
    a.mischWerte = rnd.misch(l.werte);
  } else if (l.art === 'mehrfeld') {
    a.pruefung = { art: 'mehrfeld', felder: l.felder };
  } else if (l.art === 'bruch') {
    a.pruefung = { art: 'bruch', z: l.z, n: l.n, regel: l.regel };
  } else {
    a.pruefung = { art: 'zahl', wert: l.wert, tol: l.tol || 1e-6 };
  }

  a.regelText = regelText(l);
  return a;
}

function gleich(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
  return a === b;
}

/**
 * Neue Aufgabe erzeugen. Ungültige Entwürfe werden verworfen und neu gewürfelt.
 * @throws wenn nach MAX_VERSUCHE keine gültige Aufgabe entsteht (Testfall!)
 */
export function baueAufgabe(typId, stufe, rnd = zufallsquelle()) {
  const typ = TYPEN.find(t => t.id === typId);
  if (!typ) throw new Error('Unbekannter Aufgabentyp: ' + typId);

  let letzteFehler = [];
  for (let i = 0; i < MAX_VERSUCHE; i++) {
    const p = typ.params(stufe, rnd);
    const seed = rnd.int(1, 1073741823);
    const a = rohbau(typ, stufe, p, seed);
    const fehler = pruefeAufgabe(a);
    if (fehler.length === 0) return a;
    letzteFehler = fehler;
  }
  throw new Error('Kein gültiger Entwurf für ' + typId + ' (' + stufe + '): ' + letzteFehler.join('; '));
}

/** Zufällige Aufgabe aus einem Thema. */
export function aufgabeAusThema(themaId, stufe, rnd = zufallsquelle()) {
  const typen = typenDesThemas(themaId);
  if (typen.length === 0) throw new Error('Thema ohne Aufgabentypen: ' + themaId);
  return baueAufgabe(rnd.wahl(typen).id, stufe, rnd);
}

/** Gespeicherte Fehleraufgabe exakt wiederherstellen. */
export function baueAusSpeicher(eintrag) {
  const typ = TYPEN.find(t => t.id === eintrag.typ);
  if (!typ) return null;
  try {
    const a = rohbau(typ, eintrag.stufe, eintrag.params, eintrag.mischSeed);
    return pruefeAufgabe(a).length === 0 ? a : null;
  } catch (e) {
    return null;
  }
}

/** Kurzfassung für die Speicherung im Fehlerspeicher. */
export function alsSpeicher(a) {
  return { typ: a.typ, thema: a.thema, stufe: a.stufe, params: a.params, mischSeed: a.mischSeed };
}
