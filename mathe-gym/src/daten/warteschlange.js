/* Warteschlange für kurze Netzunterbrüche.

   Das WLAN ist in der Regel stabil, kann aber kurz aussetzen. Damit in diesem
   Fall keine Antwort verloren geht, werden fehlgeschlagene Buchungen lokal
   zwischengespeichert und automatisch nachgesendet.

   Bewusste Grenze: Das ist KEIN Offline-Modus. Ohne Verbindung lassen sich
   keine neuen Sitzungen starten; die Warteschlange überbrückt nur Aussetzer. */

const SCHLUESSEL = 'mathegym-warteschlange';
const MAX_EINTRAEGE = 200;

function lesen() {
  try {
    const roh = localStorage.getItem(SCHLUESSEL);
    return roh ? JSON.parse(roh) : [];
  } catch (e) {
    return [];
  }
}

function schreiben(liste) {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(liste.slice(-MAX_EINTRAEGE)));
  } catch (e) {
    /* Speicher voll oder gesperrt: Die App läuft weiter, es geht nur die
       Zwischenspeicherung verloren. */
  }
}

export function anzahlOffen() {
  return lesen().length;
}

export function einreihen(name, argumente) {
  const liste = lesen();
  liste.push({ name, argumente, zeit: Date.now() });
  schreiben(liste);
}

export function leeren() {
  schreiben([]);
}

/**
 * Sendet alle wartenden Buchungen nach.
 * @param senden  async (name, argumente) => void ; wirft bei Misserfolg
 * @returns {Promise<{gesendet:number, offen:number}>}
 */
export async function nachsenden(senden) {
  const liste = lesen();
  if (liste.length === 0) return { gesendet: 0, offen: 0 };

  let gesendet = 0;
  while (liste.length > 0) {
    const eintrag = liste[0];
    try {
      await senden(eintrag.name, eintrag.argumente);
      liste.shift();
      gesendet++;
      schreiben(liste);
    } catch (e) {
      break;                       // weiterhin keine Verbindung: später erneut
    }
  }
  return { gesendet, offen: liste.length };
}

/** Ruft die Rückmeldung auf, sobald der Browser wieder online meldet. */
export function beiVerbindung(rueckruf) {
  window.addEventListener('online', rueckruf);
}
