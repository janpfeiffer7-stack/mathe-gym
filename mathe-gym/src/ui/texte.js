/* Alle Oberflächentexte an einer Stelle.
   Eine spätere Übersetzung wäre damit ohne Änderung am übrigen Code möglich. */

export const T = {
  marke: 'Mathe Gym',

  /* Rückmeldungen bei richtiger Antwort – wechseln zufällig */
  lob: [
    'Richtig, gut gemacht!',
    'Das stimmt genau.',
    'Sehr schön gerechnet.',
    'Richtig – weiter so!',
    'Genau richtig.',
    'Das sitzt.',
    'Stimmt, saubere Arbeit.',
    'Richtig gelöst.',
    'Perfekt.',
    'Das war richtig.'
  ],

  /* Rückmeldungen beim ersten Fehlversuch – nie abwertend */
  nochNicht: [
    'Noch nicht ganz. Schau nochmals hin.',
    'Fast. Versuch es gleich nochmals.',
    'Das stimmt noch nicht – du hast einen zweiten Versuch.',
    'Noch nicht richtig. Nimm dir kurz Zeit.',
    'Da hat sich etwas eingeschlichen. Probier es nochmals.',
    'Nicht ganz. Der Hinweis kann helfen.'
  ],

  zweiterVersuchVorbei: 'Kein Problem. So geht die Aufgabe:',
  bitteAntwort: 'Bitte gib zuerst eine Antwort ein.',

  modi: {
    thema:           { name: 'Nach Thema üben',   zusatz: 'Du wählst das Thema selbst',    symbol: 'training' },
    gemischt:        { name: 'Gemischt üben',     zusatz: 'Aufgaben aus mehreren Themen',  symbol: 'mischen' },
    schnell:         { name: 'Schnelltraining',   zusatz: '5 Aufgaben',                    symbol: 'blitz' },
    fehler:          { name: 'Meine Fehler üben', zusatz: '',                              symbol: 'wiederholen' },
    test:            { name: 'Lernstand testen',  zusatz: '10 Aufgaben, ohne Hilfen',      symbol: 'pruefung' },
    herausforderung: { name: 'Herausforderung',   zusatz: 'Schwierigere Aufgaben',         symbol: 'pokal' }
  },

  abzeichen: {
    erste:   { name: 'Erste Aufgabe geschafft', symbol: 'stern' },
    serie5:  { name: '5 richtige in Folge',     symbol: 'flamme' },
    fehler:  { name: 'Fehler verbessert',       symbol: 'muskel' },
    thema:   { name: 'Ein Thema abgeschlossen', symbol: 'haken' },
    test:    { name: 'Lernstandstest bestanden', symbol: 'medaille' }
  },

  fehlermeldungen: {
    keinNetz:    'Keine Verbindung. Deine Antworten werden gespeichert und später übertragen.',
    ladefehler:  'Die Daten konnten nicht geladen werden. Bitte lade die Seite neu.',
    keineFehler: 'Du hast zurzeit keine Fehler zum Üben. Sehr gut!'
  }
};

/** Zufälliger Text aus einer Liste. */
export function ausListe(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}
