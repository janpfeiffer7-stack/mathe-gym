/* Anmeldung und Sitzung.
   Kinder melden sich mit Klassencode, Benutzername und Passwort an. Intern
   wird daraus eine technische Kennung gebildet, damit keine E-Mail-Adressen
   von Kindern nötig sind. */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SCHUELER_DOMAIN } from '../config.js';

export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,          // persönliche iPads: angemeldet bleiben
    autoRefreshToken: true,
    storageKey: 'mathegym-sitzung'
  }
});

/** Technische Kennung aus Klassencode und Benutzername. */
export function kennung(klassencode, benutzername) {
  const b = String(benutzername).trim().toLowerCase().replace(/\s+/g, '');
  const k = String(klassencode).trim().toLowerCase().replace(/\s+/g, '');
  return b + '@' + k + '.' + SCHUELER_DOMAIN;
}

export async function anmeldenSchueler(klassencode, benutzername, passwort) {
  const { data, error } = await db.auth.signInWithPassword({
    email: kennung(klassencode, benutzername),
    password: passwort
  });
  if (error) throw new Error(lesbarerFehler(error));
  return data;
}

export async function anmeldenErwachsen(email, passwort) {
  const { data, error } = await db.auth.signInWithPassword({
    email: String(email).trim().toLowerCase(),
    password: passwort
  });
  if (error) throw new Error(lesbarerFehler(error));
  return data;
}

export async function abmelden() {
  await db.auth.signOut();
}

/** Aktuelles Profil laden (Rolle, Benutzername, Klasse). */
export async function profil() {
  const { data: sitzung } = await db.auth.getSession();
  if (!sitzung || !sitzung.session) return null;

  const { data, error } = await db
    .from('profile')
    .select('id, rolle, benutzername, anzeigename, aktiv, klasse_id, klassen!profile_klasse_id_fkey(id, name, code, stufe)')
    .eq('id', sitzung.session.user.id)
    .maybeSingle();

  if (error) throw new Error('Profil konnte nicht geladen werden: ' + error.message);
  if (!data) return null;
  if (!data.aktiv) { await abmelden(); throw new Error('Dieses Konto ist zurzeit deaktiviert. Bitte wende dich an deine Lehrperson.'); }
  return data;
}

/** Leitet auf die Anmeldeseite um, wenn keine gültige Sitzung besteht. */
export async function verlangeAnmeldung(erlaubteRollen) {
  let p = null;
  try { p = await profil(); } catch (e) { /* unten behandelt */ }
  if (!p) { window.location.href = 'index.html'; return null; }
  if (erlaubteRollen && !erlaubteRollen.includes(p.rolle)) {
    window.location.href = p.rolle === 'schueler' ? 'app.html' : 'lehrer.html';
    return null;
  }
  return p;
}

/** Letzte Aktivität festhalten (einmal pro Sitzungsstart). */
export async function aktivitaetMelden() {
  try { await db.rpc('aktivitaet_melden'); } catch (e) { /* nicht kritisch */ }
}

function lesbarerFehler(error) {
  const m = String(error.message || '').toLowerCase();
  if (m.includes('invalid login')) return 'Benutzername oder Passwort stimmt nicht. Bitte nochmals versuchen.';
  if (m.includes('email not confirmed')) return 'Dieses Konto ist noch nicht freigeschaltet. Bitte wende dich an deine Lehrperson.';
  if (m.includes('too many') || m.includes('rate limit')) return 'Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Keine Verbindung zum Internet. Bitte prüfe das WLAN.';
  return 'Anmeldung nicht möglich: ' + error.message;
}
