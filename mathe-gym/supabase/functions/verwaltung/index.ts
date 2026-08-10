// ============================================================
// Mathe Gym – Server-Funktion "verwaltung"
//
// Nur hier liegt der geheime Administrationsschlüssel (SERVICE_ROLE_KEY).
// Er wird als Funktionsgeheimnis hinterlegt und steht NIE im Frontend.
//
// Jeder Aufruf wird geprüft:
//   1. Ist der Aufrufer angemeldet?
//   2. Hat er die Rolle lehrperson oder admin?
//   3. Betrifft die Aktion ein Kind aus SEINER Klasse?
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': Deno.env.get('ERLAUBTE_HERKUNFT') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const URL_ = Deno.env.get('SUPABASE_URL')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
const DIENST = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SCHUELER_DOMAIN = Deno.env.get('SCHUELER_DOMAIN') ?? 'mathegym.local';

function antwort(daten: unknown, status = 200) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

function fehler(nachricht: string, status = 400) {
  return antwort({ fehler: nachricht }, status);
}

/** Erzeugt ein einfaches, gut lesbares Passwort aus drei Wörtern. */
function passwortErzeugen(): string {
  const woerter = [
    'apfel', 'baum', 'blume', 'berg', 'stern', 'wolke', 'fluss', 'stein',
    'vogel', 'katze', 'hase', 'biene', 'insel', 'segel', 'brot', 'honig',
    'gitarre', 'zelt', 'wiese', 'nebel', 'feder', 'knopf', 'welle', 'funke'
  ];
  const w = () => woerter[Math.floor(Math.random() * woerter.length)];
  return `${w()}-${w()}-${Math.floor(10 + Math.random() * 89)}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fehler('Nur POST erlaubt', 405);

  const kopf = req.headers.get('Authorization') ?? '';
  if (!kopf.startsWith('Bearer ')) return fehler('Nicht angemeldet', 401);

  // Client im Namen des Aufrufers: prüft die Anmeldung
  const alsNutzer = createClient(URL_, ANON, {
    global: { headers: { Authorization: kopf } }
  });
  const { data: nutzerDaten, error: nutzerFehler } = await alsNutzer.auth.getUser();
  if (nutzerFehler || !nutzerDaten?.user) return fehler('Nicht angemeldet', 401);
  const aufruferId = nutzerDaten.user.id;

  // Client mit Dienstschlüssel: darf Konten verwalten
  const alsDienst = createClient(URL_, DIENST, { auth: { persistSession: false } });

  const { data: aufrufer } = await alsDienst
    .from('profile')
    .select('id, rolle, klasse_id, aktiv')
    .eq('id', aufruferId)
    .maybeSingle();

  if (!aufrufer || !aufrufer.aktiv) return fehler('Konto nicht aktiv', 403);
  if (aufrufer.rolle !== 'lehrperson' && aufrufer.rolle !== 'admin') {
    return fehler('Keine Berechtigung', 403);
  }
  const istAdmin = aufrufer.rolle === 'admin';

  let anfrage: Record<string, unknown>;
  try { anfrage = await req.json(); }
  catch { return fehler('Ungültige Anfrage'); }

  const aktion = String(anfrage.aktion ?? '');

  /** Darf der Aufrufer diese Klasse verwalten? */
  async function darfKlasse(klasseId: string): Promise<boolean> {
    if (istAdmin) return true;
    const { data } = await alsDienst
      .from('klassen_lehrpersonen')
      .select('klasse_id')
      .eq('klasse_id', klasseId)
      .eq('lehrperson_id', aufruferId)
      .maybeSingle();
    return !!data;
  }

  /** Darf der Aufrufer dieses Kind verwalten? */
  async function darfKind(userId: string): Promise<{ ok: boolean; profil?: any }> {
    const { data } = await alsDienst
      .from('profile')
      .select('id, rolle, klasse_id, benutzername')
      .eq('id', userId)
      .maybeSingle();
    if (!data) return { ok: false };
    if (data.rolle !== 'schueler' && !istAdmin) return { ok: false };
    if (istAdmin) return { ok: true, profil: data };
    return { ok: await darfKlasse(data.klasse_id), profil: data };
  }

  try {
    switch (aktion) {

      // ---------- Schülerkonto anlegen ----------
      case 'konto_anlegen': {
        const benutzername = String(anfrage.benutzername ?? '').trim().toLowerCase();
        const klasseId = String(anfrage.klasse_id ?? '');
        const anzeigename = anfrage.anzeigename ? String(anfrage.anzeigename).trim() : null;

        if (!/^[a-z0-9._-]{3,40}$/.test(benutzername)) {
          return fehler('Der Benutzername darf nur Kleinbuchstaben, Ziffern, Punkt, Bindestrich und Unterstrich enthalten (3 bis 40 Zeichen).');
        }
        if (!await darfKlasse(klasseId)) return fehler('Keine Berechtigung für diese Klasse', 403);

        const { data: klasse } = await alsDienst
          .from('klassen').select('id, code').eq('id', klasseId).maybeSingle();
        if (!klasse) return fehler('Klasse nicht gefunden');

        const { data: schonDa } = await alsDienst
          .from('profile').select('id').ilike('benutzername', benutzername).maybeSingle();
        if (schonDa) return fehler('Diesen Benutzernamen gibt es bereits. Bitte einen anderen wählen.');

        const passwort = String(anfrage.passwort ?? '') || passwortErzeugen();
        if (passwort.length < 8) return fehler('Das Passwort muss mindestens 8 Zeichen haben.');

        const email = `${benutzername}@${klasse.code}.${SCHUELER_DOMAIN}`;

        const { data: neu, error: anlegeFehler } = await alsDienst.auth.admin.createUser({
          email,
          password: passwort,
          email_confirm: true,
          user_metadata: { rolle: 'schueler' }
        });
        if (anlegeFehler || !neu?.user) return fehler('Konto konnte nicht angelegt werden: ' + (anlegeFehler?.message ?? 'unbekannt'));

        const { error: profilFehler } = await alsDienst.from('profile').insert({
          id: neu.user.id, rolle: 'schueler', benutzername, anzeigename, klasse_id: klasseId, aktiv: true
        });
        if (profilFehler) {
          await alsDienst.auth.admin.deleteUser(neu.user.id);   // kein halb angelegtes Konto zurücklassen
          return fehler('Profil konnte nicht angelegt werden: ' + profilFehler.message);
        }

        // Das Passwort wird genau einmal zurückgegeben und danach nie wieder lesbar.
        return antwort({ ok: true, benutzername, klassencode: klasse.code, passwort });
      }

      // ---------- Passwort zurücksetzen ----------
      case 'passwort_zuruecksetzen': {
        const userId = String(anfrage.user_id ?? '');
        const pruefung = await darfKind(userId);
        if (!pruefung.ok) return fehler('Keine Berechtigung für dieses Konto', 403);

        const passwort = String(anfrage.passwort ?? '') || passwortErzeugen();
        if (passwort.length < 8) return fehler('Das Passwort muss mindestens 8 Zeichen haben.');

        const { error } = await alsDienst.auth.admin.updateUserById(userId, { password: passwort });
        if (error) return fehler('Passwort konnte nicht geändert werden: ' + error.message);

        return antwort({ ok: true, benutzername: pruefung.profil?.benutzername, passwort });
      }

      // ---------- Benutzername ändern ----------
      case 'benutzername_aendern': {
        const userId = String(anfrage.user_id ?? '');
        const neuerName = String(anfrage.benutzername ?? '').trim().toLowerCase();
        const pruefung = await darfKind(userId);
        if (!pruefung.ok) return fehler('Keine Berechtigung für dieses Konto', 403);
        if (!/^[a-z0-9._-]{3,40}$/.test(neuerName)) return fehler('Ungültiger Benutzername.');

        const { data: schonDa } = await alsDienst
          .from('profile').select('id').ilike('benutzername', neuerName).neq('id', userId).maybeSingle();
        if (schonDa) return fehler('Diesen Benutzernamen gibt es bereits.');

        const { data: klasse } = await alsDienst
          .from('klassen').select('code').eq('id', pruefung.profil.klasse_id).maybeSingle();
        if (!klasse) return fehler('Klasse nicht gefunden');

        const { error: mailFehler } = await alsDienst.auth.admin.updateUserById(userId, {
          email: `${neuerName}@${klasse.code}.${SCHUELER_DOMAIN}`,
          email_confirm: true
        });
        if (mailFehler) return fehler('Kennung konnte nicht geändert werden: ' + mailFehler.message);

        const { error } = await alsDienst.from('profile').update({ benutzername: neuerName }).eq('id', userId);
        if (error) return fehler('Benutzername konnte nicht geändert werden: ' + error.message);

        return antwort({ ok: true, benutzername: neuerName });
      }

      // ---------- Konto aktivieren oder deaktivieren ----------
      case 'konto_aktiv_setzen': {
        const userId = String(anfrage.user_id ?? '');
        const aktiv = !!anfrage.aktiv;
        const pruefung = await darfKind(userId);
        if (!pruefung.ok) return fehler('Keine Berechtigung für dieses Konto', 403);

        const { error } = await alsDienst.from('profile').update({ aktiv }).eq('id', userId);
        if (error) return fehler('Konto konnte nicht geändert werden: ' + error.message);
        return antwort({ ok: true, aktiv });
      }

      // ---------- Konto endgültig löschen ----------
      case 'konto_loeschen': {
        const userId = String(anfrage.user_id ?? '');
        const pruefung = await darfKind(userId);
        if (!pruefung.ok) return fehler('Keine Berechtigung für dieses Konto', 403);

        const { error } = await alsDienst.auth.admin.deleteUser(userId);
        if (error) return fehler('Konto konnte nicht gelöscht werden: ' + error.message);
        return antwort({ ok: true });                 // Profil und Daten folgen per Fremdschlüssel
      }

      // ---------- Lehrpersonenkonto anlegen (nur Admin) ----------
      case 'lehrperson_anlegen': {
        if (!istAdmin) return fehler('Nur die Administration darf Lehrpersonen anlegen', 403);
        const email = String(anfrage.email ?? '').trim().toLowerCase();
        const benutzername = String(anfrage.benutzername ?? '').trim().toLowerCase();
        const klasseId = anfrage.klasse_id ? String(anfrage.klasse_id) : null;
        const passwort = String(anfrage.passwort ?? '');

        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fehler('Ungültige E-Mail-Adresse.');
        if (passwort.length < 10) return fehler('Das Passwort muss mindestens 10 Zeichen haben.');

        const { data: neu, error: anlegeFehler } = await alsDienst.auth.admin.createUser({
          email, password: passwort, email_confirm: true, user_metadata: { rolle: 'lehrperson' }
        });
        if (anlegeFehler || !neu?.user) return fehler('Konto konnte nicht angelegt werden: ' + (anlegeFehler?.message ?? ''));

        const { error: profilFehler } = await alsDienst.from('profile').insert({
          id: neu.user.id, rolle: 'lehrperson', benutzername, klasse_id: klasseId, aktiv: true
        });
        if (profilFehler) {
          await alsDienst.auth.admin.deleteUser(neu.user.id);
          return fehler('Profil konnte nicht angelegt werden: ' + profilFehler.message);
        }
        if (klasseId) {
          await alsDienst.from('klassen_lehrpersonen').insert({ klasse_id: klasseId, lehrperson_id: neu.user.id });
        }
        return antwort({ ok: true, email, benutzername });
      }

      default:
        return fehler('Unbekannte Aktion: ' + aktion);
    }
  } catch (e) {
    return fehler('Unerwarteter Fehler: ' + (e instanceof Error ? e.message : String(e)), 500);
  }
});
