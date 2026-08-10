-- ============================================================
-- Mathe Gym – Startdaten
--
-- ANLEITUNG (siehe auch docs/konten.md):
--   1. Legen Sie zuerst im Supabase-Dashboard unter "Authentication" → "Users"
--      vier Konten mit E-Mail und Passwort an:
--        - ein Administratorkonto
--        - drei Lehrpersonenkonten
--      Setzen Sie dabei jeweils den Haken "Auto Confirm User".
--   2. Kopieren Sie die vier User-IDs (UUID) aus derselben Liste.
--   3. Tragen Sie die IDs und Namen unten ein und führen Sie dieses Skript aus.
--
-- Die Klassencodes können Sie frei wählen; die Kinder tippen sie bei der
-- Anmeldung ein. Verwenden Sie ausschliesslich Kleinbuchstaben und Ziffern.
-- ============================================================

-- ---------- Klassen ----------
insert into public.klassen (name, code, stufe, schuljahr)
values
  ('5a', '5a', '5', '2026/27'),
  ('5b', '5b', '5', '2026/27'),
  ('6a', '6a', '6', '2026/27')
on conflict (code) do nothing;

-- Voreinstellungen je Klasse
insert into public.klassen_einstellungen (klasse_id, ziel_pro_thema, zeitmodus_erlaubt, andere_stufe_erlaubt)
select id, 10, true, true from public.klassen
on conflict (klasse_id) do nothing;

-- ---------- Administratorkonto ----------
-- HIER die UUID des Administratorkontos eintragen:
insert into public.profile (id, rolle, benutzername, anzeigename, aktiv)
values ('00000000-0000-0000-0000-000000000001', 'admin', 'admin', 'Administration', true)
on conflict (id) do update set rolle = 'admin', aktiv = true;

-- ---------- Lehrpersonen ----------
-- HIER die drei UUIDs und Benutzernamen eintragen:
insert into public.profile (id, rolle, benutzername, anzeigename, klasse_id, aktiv)
values
  ('00000000-0000-0000-0000-000000000002', 'lehrperson', 'lehrperson1', 'Lehrperson 5a',
   (select id from public.klassen where code = '5a'), true),
  ('00000000-0000-0000-0000-000000000003', 'lehrperson', 'lehrperson2', 'Lehrperson 5b',
   (select id from public.klassen where code = '5b'), true),
  ('00000000-0000-0000-0000-000000000004', 'lehrperson', 'lehrperson3', 'Lehrperson 6a',
   (select id from public.klassen where code = '6a'), true)
on conflict (id) do update set rolle = 'lehrperson', aktiv = true;

-- ---------- Zuordnung Lehrperson zu Klasse ----------
-- Jede Lehrperson betreut ihre eigene Klasse. Fremde Klassen sind ohne
-- Eintrag hier trotzdem lesbar, aber nicht veränderbar.
insert into public.klassen_lehrpersonen (klasse_id, lehrperson_id)
select p.klasse_id, p.id
from public.profile p
where p.rolle = 'lehrperson' and p.klasse_id is not null
on conflict do nothing;

-- ---------- Kontrolle ----------
-- Diese Abfrage sollte vier Zeilen ergeben (1 Admin, 3 Lehrpersonen):
--   select rolle, benutzername, klasse_id from public.profile order by rolle;
