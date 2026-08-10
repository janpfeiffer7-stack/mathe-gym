/* Lernstand: lesen und schreiben.

   Das Buchen eines Versuchs läuft über eine einzige Datenbankfunktion
   (versuch_buchen). Sie schreibt den Versuch, aktualisiert Fortschritt,
   Punkte und Serie und pflegt den Fehlerspeicher – alles serverseitig
   und in einer Transaktion. */

import { db } from './auth.js';
import { einreihen, nachsenden, anzahlOffen, beiVerbindung } from './warteschlange.js';

/* ---------------- Lesen ---------------- */

export async function uebersicht() {
  const [stand, fortschritt, fehler, tests, abzeichen] = await Promise.all([
    db.from('konto_stand').select('*').maybeSingle(),
    db.from('thema_fortschritt').select('thema, stufe, bearbeitet, richtig'),
    db.from('fehler_offen').select('id', { count: 'exact', head: true }),
    db.from('tests').select('id, stufe, punkte, max, prozent, erstellt_am').order('erstellt_am', { ascending: false }).limit(10),
    db.from('abzeichen').select('abzeichen, erreicht_am')
  ]);

  return {
    stand: stand.data || { punkte: 0, serie: 0, beste_serie: 0, fehler_gemeistert: 0, bearbeitet: 0, richtig: 0 },
    fortschritt: fortschritt.data || [],
    offeneFehler: fehler.count || 0,
    tests: tests.data || [],
    abzeichen: (abzeichen.data || []).map(a => a.abzeichen)
  };
}

/** Fortschritt pro Thema zusammenfassen (über alle Stufen). */
export function fortschrittProThema(zeilen) {
  const karte = {};
  for (const z of zeilen) {
    const e = karte[z.thema] || (karte[z.thema] = { bearbeitet: 0, richtig: 0, stufen: {} });
    e.bearbeitet += z.bearbeitet;
    e.richtig += z.richtig;
    e.stufen[z.stufe] = { bearbeitet: z.bearbeitet, richtig: z.richtig };
  }
  return karte;
}

/** Gespeicherte Fehleraufgaben holen (älteste zuerst, portionsweise). */
export async function fehlerHolen(anzahl = 10) {
  const { data, error } = await db
    .from('fehler_offen')
    .select('id, typ, thema, stufe, params, misch_seed')
    .order('zuletzt_falsch', { ascending: true })
    .limit(anzahl);
  if (error) throw new Error('Fehlerliste konnte nicht geladen werden: ' + error.message);
  return (data || []).map(z => ({
    fehlerId: z.id, typ: z.typ, thema: z.thema, stufe: z.stufe,
    params: z.params, mischSeed: z.misch_seed
  }));
}

/* ---------------- Schreiben ---------------- */

/**
 * Einen Versuch buchen.
 * @param a        die Aufgabe
 * @param richtig  wurde sie richtig gelöst
 * @param opt      { versuchNr, hinweisBenutzt, quelle: 'ueben'|'test'|'fehler', fehlerId }
 */
export async function versuchBuchen(a, richtig, opt = {}) {
  const argumente = {
    p_thema: a.thema,
    p_generator: a.typ,
    p_stufe: a.stufe,
    p_aufgabenart: a.eingabe,
    p_richtig: !!richtig,
    p_versuch_nr: opt.versuchNr || 1,
    p_hinweis: !!opt.hinweisBenutzt,
    p_quelle: opt.quelle || 'ueben',
    p_params: a.params,
    p_misch_seed: a.mischSeed,
    p_fehler_id: opt.fehlerId || null
  };

  try {
    const { data, error } = await db.rpc('versuch_buchen', argumente);
    if (error) throw error;
    return data;
  } catch (e) {
    einreihen('versuch_buchen', argumente);
    return null;                       // Anzeige läuft lokal weiter
  }
}

/** Ergebnis eines Lernstandstests speichern. */
export async function testBuchen(stufe, punkte, max, positionen) {
  const argumente = {
    p_stufe: stufe,
    p_punkte: punkte,
    p_max: max,
    p_positionen: positionen          // [{thema, richtig}]
  };
  try {
    const { data, error } = await db.rpc('test_buchen', argumente);
    if (error) throw error;
    return data;
  } catch (e) {
    einreihen('test_buchen', argumente);
    return null;
  }
}

/** Abzeichen vergeben (mehrfaches Setzen ist unschädlich). */
export async function abzeichenSetzen(name) {
  try {
    const { error } = await db.rpc('abzeichen_setzen', { p_abzeichen: name });
    if (error) throw error;
  } catch (e) {
    einreihen('abzeichen_setzen', { p_abzeichen: name });
  }
}

/* ---------------- Nachsenden ---------------- */

export async function warteschlangeSenden() {
  return nachsenden(async (name, argumente) => {
    const { error } = await db.rpc(name, argumente);
    if (error) throw error;
  });
}

export function warteschlangeStand() {
  return anzahlOffen();
}

/** Automatisches Nachsenden einrichten. */
export function nachsendenEinrichten(beiErfolg) {
  const versuchen = async () => {
    if (anzahlOffen() === 0) return;
    const e = await warteschlangeSenden();
    if (e.gesendet > 0 && beiErfolg) beiErfolg(e);
  };
  beiVerbindung(versuchen);
  setInterval(versuchen, 45000);
  versuchen();
}
