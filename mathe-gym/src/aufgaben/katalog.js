/* Themenkatalog: Metadaten und Registrierung aller Aufgabentypen. */

import t5_1 from './typen/t5_1.js';
import t5_3 from './typen/t5_3.js';
import t5_4 from './typen/t5_4.js';
import t5_5 from './typen/t5_5.js';
import t5_7 from './typen/t5_7.js';
import t5_8 from './typen/t5_8.js';
import t5_9 from './typen/t5_9.js';
import t5_11 from './typen/t5_11.js';
import t6_1 from './typen/t6_1.js';
import t6_3 from './typen/t6_3.js';
import t6_4 from './typen/t6_4.js';
import t6_5 from './typen/t6_5.js';
import t6_7 from './typen/t6_7.js';
import t6_8 from './typen/t6_8.js';
import t6_9 from './typen/t6_9.js';
import t6_11 from './typen/t6_11.js';

export const TYPEN = [].concat(
  t5_1, t5_3, t5_4, t5_5, t5_7, t5_8, t5_9, t5_11,
  t6_1, t6_3, t6_4, t6_5, t6_7, t6_8, t6_9, t6_11
);

export const THEMEN = [
  { id: '5.1',  klasse: '5', nr: '5.1',  titel: 'Brüche und Anteile', icon: 'bruch',
    beschr: 'Bruchteile benennen, Anteile von Zahlen bestimmen, das Ganze berechnen.',
    lernziele: ['Anteil einer Zahl bestimmen', 'Anteile in Sachaufgaben anwenden', 'Brüche benennen', 'Das Ganze aus einem Anteil berechnen'] },

  { id: '5.3',  klasse: '5', nr: '5.3',  titel: 'Dezimalzahlen und Stellenwert', icon: 'stellenwert',
    beschr: 'Stellenwerte benennen, mit 10, 100 und 1000 rechnen, Zahlenfolgen fortsetzen.',
    lernziele: ['Zehntel, Hundertstel und Tausendstel benennen', 'Mit 10, 100 und 1000 multiplizieren und dividieren', 'Dezimalzahlen addieren und subtrahieren', 'In gleichen Schritten zählen'] },

  { id: '5.4',  klasse: '5', nr: '5.4',  titel: 'Proportionalität und Wertetabellen', icon: 'waage',
    beschr: 'Proportionale Sätze ergänzen, Wertetabellen füllen, Preise berechnen.',
    lernziele: ['Proportionale Sätze ergänzen', 'Wertetabellen ergänzen', 'Preise proportional berechnen'] },

  { id: '5.5',  klasse: '5', nr: '5.5',  titel: 'Rechnen und flexibel rechnen', icon: 'rechnen',
    beschr: 'Kopfrechnen, Zehnerzahlen, Verteilungsgesetz, schriftliche Addition.',
    lernziele: ['Im Kopf addieren und subtrahieren', 'Mit Zehner- und Hunderterzahlen rechnen', 'Verteilungsgesetz anwenden', 'Mehrere Zahlen addieren'] },

  { id: '5.7',  klasse: '5', nr: '5.7',  titel: 'Grössen und Umwandeln', icon: 'massband',
    beschr: 'Grössen umwandeln, Bruchteile von Grössen, Rechenbegriffe, Zahlenrätsel.',
    lernziele: ['Grössen umwandeln', 'Bruchteil einer Grösse berechnen', 'Rechenbegriffe verstehen', 'Zahlenrätsel rückwärts lösen'] },

  { id: '5.8',  klasse: '5', nr: '5.8',  titel: 'Brüche ordnen und Runden', icon: 'ordnen',
    beschr: 'Brüche vergleichen und rechnen, runden, Teilbarkeit prüfen, Zahlen ordnen.',
    lernziele: ['Brüche vergleichen', 'Brüche mit gleichem Nenner addieren und subtrahieren', 'Zahlen runden', 'Teilbarkeit prüfen', 'Gemischte Zahlen umwandeln', 'Dezimalzahlen ordnen'] },

  { id: '5.9',  klasse: '5', nr: '5.9',  titel: 'Dezimalrechnen und Gleichungen', icon: 'gleichung',
    beschr: 'Klammern, Punkt vor Strich, fehlende Zahlen, Proportionalität.',
    lernziele: ['Klammern und Punkt vor Strich', 'Fehlende Zahl in einer Gleichung finden', 'Dezimalzahlen multiplizieren', 'Direkte Proportionalität'] },

  { id: '5.11', klasse: '5', nr: '5.11', titel: 'Mittelwert und Sachaufgaben', icon: 'diagramm',
    beschr: 'Durchschnitt berechnen, fehlende Werte finden, mehrschrittige Sachaufgaben.',
    lernziele: ['Durchschnitt berechnen', 'Fehlenden Wert über den Durchschnitt finden', 'Sachaufgaben in mehreren Schritten lösen'] },

  { id: '6.1',  klasse: '6', nr: '6.1',  titel: 'Erweitern, Kürzen, ggT und kgV', icon: 'bruch',
    beschr: 'Grösster gemeinsamer Teiler, kleinstes gemeinsames Vielfaches, Primzahlen, Brüche erweitern und kürzen.',
    lernziele: ['ggT bestimmen', 'kgV bestimmen', 'Primzahlen erkennen', 'Brüche erweitern', 'Brüche vollständig kürzen', 'Gleichwertige Brüche finden'] },

  { id: '6.3',  klasse: '6', nr: '6.3',  titel: 'Dezimalzahlen ordnen und Brüche', icon: 'stellenwert',
    beschr: 'Zahlenstrahl, Nachbarzahlen, Brüche und Dezimalzahlen ineinander umwandeln.',
    lernziele: ['Zahlen am Zahlenstrahl ablesen', 'Nachbarzahlen bestimmen', 'Dezimalzahl als gekürzten Bruch schreiben', 'Bruch als Dezimalzahl schreiben', 'Dezimalzahlen vergleichen'] },

  { id: '6.4',  klasse: '6', nr: '6.4',  titel: 'Proportionalität und Geschwindigkeit', icon: 'tempo',
    beschr: 'Proportionale Aufgaben, Geschwindigkeit in km/h, umgekehrte Proportionalität.',
    lernziele: ['Proportionale Aufgaben lösen', 'Geschwindigkeit in km/h berechnen', 'Umgekehrte Proportionalität erkennen'] },

  { id: '6.5',  klasse: '6', nr: '6.5',  titel: 'Dezimalrechnen und Überschlagen', icon: 'rechnen',
    beschr: 'Dezimalzahlen multiplizieren und dividieren, Zehnerzahlen, überschlagen.',
    lernziele: ['Dezimalzahlen addieren und subtrahieren', 'Dezimalzahlen multiplizieren', 'Dezimalzahlen dividieren', 'Mit Zehnerzahlen rechnen', 'Ergebnisse überschlagen'] },

  { id: '6.7',  klasse: '6', nr: '6.7',  titel: 'Flächen und Volumen', icon: 'quader',
    beschr: 'Fläche und Umfang von Rechtecken, Flächenmasse umwandeln, Volumen von Quadern.',
    lernziele: ['Fläche eines Rechtecks berechnen', 'Umfang eines Rechtecks berechnen', 'Flächenmasse umwandeln', 'Volumen eines Quaders berechnen', 'Fehlende Seitenlänge berechnen'] },

  { id: '6.8',  klasse: '6', nr: '6.8',  titel: 'Anteile, Prozente und Zahlen', icon: 'prozent',
    beschr: 'Prozentwerte, Prozentformen, das Ganze berechnen, grosse Zahlen, Primfaktoren.',
    lernziele: ['Prozentwert berechnen', 'Prozent, Bruch und Dezimalzahl verbinden', 'Das Ganze aus einem Anteil berechnen', 'Grosse Zahlen schreiben', 'Primfaktorzerlegung', 'Brüche mit verschiedenen Nennern addieren'] },

  { id: '6.9',  klasse: '6', nr: '6.9',  titel: 'Terme, Klammern und Gleichungen', icon: 'gleichung',
    beschr: 'Punkt vor Strich, Klammern, Operationszeichen, Gleichungen umstellen, Mittelwert.',
    lernziele: ['Punkt vor Strich anwenden', 'Klammern zuerst rechnen', 'Operationszeichen einsetzen', 'Gleichungen umstellen', 'Daten auswerten'] },

  { id: '6.11', klasse: '6', nr: '6.11', titel: 'Kombinatorik und Wahrscheinlichkeit', icon: 'wuerfel',
    beschr: 'Anordnungen und Kombinationen zählen, Wahrscheinlichkeiten angeben und vergleichen.',
    lernziele: ['Alle Anordnungen bestimmen', 'Geordnete Auswahl bestimmen', 'Kombinationen zählen', 'Wahrscheinlichkeit als Bruch angeben', 'Wahrscheinlichkeiten vergleichen'] }
];

export const THEMA_NACH_ID = {};
THEMEN.forEach(t => { THEMA_NACH_ID[t.id] = t; });

export function themenDerKlasse(klasse) {
  return THEMEN.filter(t => t.klasse === String(klasse));
}

/** Prüfung beim Laden: Jedes Thema braucht mindestens einen Aufgabentyp. */
export function katalogPruefen() {
  const fehler = [];
  for (const t of THEMEN) {
    const n = TYPEN.filter(x => x.thema === t.id).length;
    if (n === 0) fehler.push('Thema ohne Aufgabentypen: ' + t.id);
  }
  for (const typ of TYPEN) {
    if (!THEMA_NACH_ID[typ.thema]) fehler.push('Aufgabentyp mit unbekanntem Thema: ' + typ.id);
  }
  const ids = TYPEN.map(t => t.id);
  if (new Set(ids).size !== ids.length) fehler.push('doppelte Aufgabentyp-IDs');
  return fehler;
}
