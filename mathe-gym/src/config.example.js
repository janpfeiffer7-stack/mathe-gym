/* Vorlage. Kopieren Sie diese Datei nach src/config.js und tragen Sie Ihre Werte ein.
   Beide Werte stammen aus dem Supabase-Dashboard unter "Project Settings" → "API".

   WICHTIG: Hier gehört ausschliesslich der öffentliche Schlüssel ("anon public") hinein.
   Er ist dafür gemacht, im Browser zu stehen; geschützt wird alles durch die
   Zugriffsregeln in der Datenbank. Der "service_role"-Schlüssel darf NIEMALS
   in diese Datei – er gehört ausschliesslich in die Server-Funktion. */

export const SUPABASE_URL = 'https://IHRE-PROJEKT-ID.supabase.co';
export const SUPABASE_ANON_KEY = 'IHR_OEFFENTLICHER_ANON_SCHLUESSEL';

/* Endung der internen technischen Kennungen für Schülerkonten.
   Die Kinder sehen davon nichts; sie geben nur ihren Benutzernamen ein. */
export const SCHUELER_DOMAIN = 'mathegym.local';
