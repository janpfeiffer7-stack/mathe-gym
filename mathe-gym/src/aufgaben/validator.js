/* Validator: prüft jede erzeugte Aufgabe, BEVOR sie einem Kind gezeigt wird.
   Verstösst eine Aufgabe gegen eine Regel, wird sie verworfen und neu gewürfelt.
   Damit werden die in der Analyse gefundenen Fehlerklassen strukturell verhindert
   und nicht nur einzeln geflickt. */

import { dezimalstellen, fmt, r } from '../core/zahl.js';
import { ggT } from '../core/bruch.js';
import { MAX_DEZIMALSTELLEN, MAX_BETRAG } from '../core/formate.js';

/** Entfernt HTML und normalisiert Leerzeichen. */
export function nurText(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Zerlegt einen Aufgabentext in einzelne Zahl-Zeichenketten. */
function zahlenImText(text) {
  return (text.match(/\u2212?\d[\d\u2019']*(?:\.\d+)?/g) || [])
    .map(s => s.replace(/[\u2019']/g, '').replace(/\u2212/g, '-'))
    .map(s => parseFloat(s))
    .filter(n => !isNaN(n));
}

/**
 * Prüft eine fertig gebaute Aufgabe.
 * Rückgabe: [] wenn in Ordnung, sonst Liste der verletzten Regeln.
 */
export function pruefeAufgabe(a) {
  const fehler = [];
  const stufe = a.stufe || 'standard';
  const maxDez = MAX_DEZIMALSTELLEN[stufe];
  // Einzelne Aufgabentypen (z. B. grosse Zahlen) dürfen den Bereich bewusst weiten.
  const maxBetrag = a.maxBetrag || MAX_BETRAG[stufe];
  const fragetext = nurText(a.frageHTML);

  if (!fragetext) fehler.push('leerer Aufgabentext');
  if (/NaN|undefined|null|\[object/.test(fragetext)) fehler.push('kaputter Textbaustein in der Frage');
  if (/NaN|undefined|null|\[object/.test(nurText(a.loesungHTML))) fehler.push('kaputter Textbaustein im Lösungsweg');
  if (/NaN|undefined|null|\[object/.test(nurText(a.hinweis))) fehler.push('kaputter Textbaustein im Hinweis');

  const p = a.pruefung;

  // ---- Zahlantworten ----
  const zahlwerte = [];
  if (p.art === 'zahl') zahlwerte.push(p.wert);
  if (p.art === 'mehrfeld') p.felder.forEach(f => { if (f.art === 'zahl') zahlwerte.push(f.wert); });

  for (const w of zahlwerte) {
    if (typeof w !== 'number' || !isFinite(w)) { fehler.push('Antwort ist keine endliche Zahl'); continue; }
    if (dezimalstellen(w) > maxDez) fehler.push('Antwort hat zu viele Dezimalstellen: ' + w);
    if (Math.abs(w) > maxBetrag) fehler.push('Antwort ausserhalb des Wertebereichs: ' + w);
  }

  // ---- Brüche ----
  const brueche = [];
  if (p.art === 'bruch') brueche.push(p);
  if (p.art === 'mehrfeld') p.felder.forEach(f => { if (f.art === 'bruch') brueche.push(f); });

  for (const b of brueche) {
    if (!Number.isInteger(b.z) || !Number.isInteger(b.n)) fehler.push('Bruch mit nicht ganzzahligen Teilen');
    if (b.n === 0) fehler.push('Nenner 0');
    if (b.n < 0) fehler.push('negativer Nenner');
    if (b.z === 0) fehler.push('Zähler 0 als erwartete Antwort');
    if (b.regel === 'gekuerzt' && ggT(Math.abs(b.z), b.n) !== 1) {
      fehler.push('Kürzungsaufgabe, aber Sollwert selbst nicht gekürzt');
    }
  }

  // ---- Auswahlaufgaben ----
  if (p.art === 'auswahl') {
    const opt = p.optionen || [];
    if (opt.length < 2) fehler.push('Auswahl mit weniger als 2 Optionen');
    if (p.richtig < 0 || p.richtig >= opt.length) fehler.push('kein gültiger richtiger Index');

    const texte = opt.map(o => nurText(o));
    if (new Set(texte).size !== texte.length) fehler.push('doppelte Antwortoptionen (Text)');

    const werte = (p.werte || []).map(w => (typeof w === 'number' ? r(w, 9) : JSON.stringify(w)));
    if (werte.length === opt.length && new Set(werte).size !== werte.length) {
      fehler.push('doppelte Antwortoptionen (Wert) – mehrere richtige Antworten möglich');
    }
  }

  // ---- Ordnen ----
  if (p.art === 'ordnen') {
    const w = p.werte || [];
    if (w.length < 3) fehler.push('Ordnen mit weniger als 3 Werten');
    if (new Set(w.map(x => r(x, 9))).size !== w.length) fehler.push('Ordnen mit doppelten Werten – Reihenfolge nicht eindeutig');
  }

  // ---- Mehrfeld: Platzhalter vorhanden? ----
  if (p.art === 'mehrfeld') {
    for (let i = 0; i < p.felder.length; i++) {
      if (a.frageHTML.indexOf('{{' + i + '}}') === -1) fehler.push('Platzhalter {{' + i + '}} fehlt im Aufgabentext');
    }
    const rest = a.frageHTML.match(/\{\{(\d+)\}\}/g) || [];
    if (rest.length !== p.felder.length) fehler.push('Anzahl Platzhalter passt nicht zur Anzahl Felder');
  }

  // ---- Lösung darf nicht im Aufgabentext stehen ----
  if (a.erlaubeLoesungImText !== true) {
    const imText = zahlenImText(fragetext).map(x => r(x, 9));
    for (const w of zahlwerte) {
      if (Math.abs(w) < 10) continue;               // kleine Zahlen sind häufig Zufall
      if (imText.includes(r(w, 9))) fehler.push('Lösung ' + fmt(w) + ' steht bereits im Aufgabentext');
    }
  }

  // ---- typspezifische Entartung ----
  if (a.entartet) fehler.push('entartete Aufgabe: ' + a.entartet);

  return fehler;
}
