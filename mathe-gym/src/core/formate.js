/* Antwortformate und die dazugehörigen Regeltexte.
   Der Regeltext wird dem Kind IMMER vor der Eingabe angezeigt (Anforderung 9). */

export const STUFEN = ['basis', 'standard', 'profi'];

export const STUFE_TEXT = {
  basis:    { name: 'Basis',    punkte: '●',   beschr: 'Einfache Zahlen, wenige Rechenschritte.' },
  standard: { name: 'Standard', punkte: '●●',  beschr: 'Reguläres Niveau der Klassenstufe.' },
  profi:    { name: 'Profi',    punkte: '●●●', beschr: 'Grössere Zahlen, mehrere Schritte.' }
};

/** Regeltexte für Bruchaufgaben. */
export const BRUCHREGEL_TEXT = {
  gleichwertig: 'Jede gleichwertige Schreibweise zählt.',
  gekuerzt:     'So weit wie möglich kürzen.',
  gemischt:     'Als gemischte Zahl schreiben, z. B. 1 3/4.'
};

/** Maximale Anzahl Dezimalstellen einer erwarteten Antwort, je Stufe. */
export const MAX_DEZIMALSTELLEN = { basis: 2, standard: 3, profi: 3 };

/** Grösster erlaubter Betrag einer erwarteten Antwort, je Stufe. */
export const MAX_BETRAG = { basis: 100000, standard: 10000000, profi: 10000000000 };

/** Eingabearten, die die Oberfläche kennt. */
export const EINGABEART = {
  ZAHL: 'zahl',
  BRUCH: 'bruch',
  MEHRFELD: 'mehrfeld',
  AUSWAHL: 'auswahl',
  ORDNEN: 'ordnen'
};
