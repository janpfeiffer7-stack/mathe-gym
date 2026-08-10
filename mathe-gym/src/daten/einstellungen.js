/* Klasseneinstellungen.
   Werden von der Lehrperson gesetzt und vom Schülerbereich gelesen. */

import { db } from './auth.js';

export const STANDARD = {
  ziel_pro_thema: 10,
  zeitmodus_erlaubt: true,
  andere_stufe_erlaubt: true
};

export async function einstellungenLaden(klasseId) {
  if (!klasseId) return { ...STANDARD };
  try {
    const { data, error } = await db
      .from('klassen_einstellungen')
      .select('ziel_pro_thema, zeitmodus_erlaubt, andere_stufe_erlaubt')
      .eq('klasse_id', klasseId)
      .maybeSingle();
    if (error || !data) return { ...STANDARD };
    return data;
  } catch (e) {
    return { ...STANDARD };
  }
}

export async function einstellungenSpeichern(klasseId, werte) {
  const { error } = await db.rpc('klasseneinstellung_setzen', {
    p_klasse: klasseId,
    p_ziel: werte.ziel_pro_thema,
    p_zeitmodus: werte.zeitmodus_erlaubt,
    p_andere_stufe: werte.andere_stufe_erlaubt
  });
  if (error) throw new Error(error.message);
}
