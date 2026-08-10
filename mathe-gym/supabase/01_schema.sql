-- ============================================================
-- Mathe Gym – Datenbankschema
-- Reihenfolge: 01_schema.sql → 02_policies.sql → 03_funktionen.sql → 04_seed.sql
-- ============================================================

-- ---------- Klassen ----------
create table if not exists public.klassen (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,                       -- z. B. "5a"
  code        text not null unique,                -- Anmeldecode, klein geschrieben
  stufe       text not null check (stufe in ('5','6')),
  schuljahr   text not null default '2026/27',
  aktiv       boolean not null default true,
  erstellt_am timestamptz not null default now()
);

comment on table public.klassen is 'Eine Zeile pro Schulklasse. Der Code wird bei der Anmeldung der Kinder eingegeben.';

-- ---------- Profile ----------
-- Eine Zeile pro Person. Bewusst OHNE Nachname, Geburtsdatum oder E-Mail von Kindern.
create table if not exists public.profile (
  id            uuid primary key references auth.users(id) on delete cascade,
  rolle         text not null check (rolle in ('schueler','lehrperson','admin')),
  benutzername  text not null,
  anzeigename   text,                              -- optionaler Vorname
  klasse_id     uuid references public.klassen(id) on delete set null,
  aktiv         boolean not null default true,
  erstellt_am   timestamptz not null default now(),
  zuletzt_aktiv timestamptz
);

create unique index if not exists profile_benutzername_idx
  on public.profile (lower(benutzername));

create index if not exists profile_klasse_idx on public.profile (klasse_id);

comment on table public.profile is 'Rollen und Klassenzugehörigkeit. Enthält keine Nachnamen und keine E-Mail-Adressen von Kindern.';

-- ---------- Zuordnung Lehrperson zu Klasse ----------
create table if not exists public.klassen_lehrpersonen (
  klasse_id     uuid not null references public.klassen(id) on delete cascade,
  lehrperson_id uuid not null references public.profile(id) on delete cascade,
  primary key (klasse_id, lehrperson_id)
);

-- ---------- Versuche ----------
-- Ein Datensatz pro bearbeiteter Aufgabe. Die eingegebene Antwort wird
-- bewusst NICHT gespeichert (Datensparsamkeit).
create table if not exists public.versuche (
  id           bigserial primary key,
  user_id      uuid not null references public.profile(id) on delete cascade,
  thema        text not null,
  generator    text not null,
  stufe        text not null check (stufe in ('basis','standard','profi')),
  aufgabenart  text not null,
  richtig      boolean not null,
  versuch_nr   smallint not null default 1,
  hinweis      boolean not null default false,
  quelle       text not null default 'ueben' check (quelle in ('ueben','test','fehler')),
  erstellt_am  timestamptz not null default now()
);

create index if not exists versuche_user_zeit_idx on public.versuche (user_id, erstellt_am desc);
create index if not exists versuche_thema_idx     on public.versuche (user_id, thema);

-- ---------- Fehlerspeicher ----------
-- Speichert Parameter statt HTML: die Aufgabe wird daraus exakt neu aufgebaut.
create table if not exists public.fehler_offen (
  id             bigserial primary key,
  user_id        uuid not null references public.profile(id) on delete cascade,
  typ            text not null,
  thema          text not null,
  stufe          text not null,
  params         jsonb not null,
  misch_seed     bigint not null,
  zuletzt_falsch timestamptz not null default now(),
  unique (user_id, typ, misch_seed)
);

create index if not exists fehler_user_idx on public.fehler_offen (user_id, zuletzt_falsch);

-- ---------- Fortschritt pro Thema und Stufe ----------
create table if not exists public.thema_fortschritt (
  user_id      uuid not null references public.profile(id) on delete cascade,
  thema        text not null,
  stufe        text not null,
  bearbeitet   integer not null default 0,
  richtig      integer not null default 0,
  aktualisiert timestamptz not null default now(),
  primary key (user_id, thema, stufe)
);

-- ---------- Lernstandstests ----------
create table if not exists public.tests (
  id          bigserial primary key,
  user_id     uuid not null references public.profile(id) on delete cascade,
  stufe       text not null,
  punkte      smallint not null,
  max         smallint not null,
  prozent     smallint not null,
  erstellt_am timestamptz not null default now()
);

create table if not exists public.test_positionen (
  id      bigserial primary key,
  test_id bigint not null references public.tests(id) on delete cascade,
  thema   text not null,
  richtig boolean not null
);

create index if not exists tests_user_idx on public.tests (user_id, erstellt_am desc);

-- ---------- Punkte, Serien ----------
create table if not exists public.konto_stand (
  user_id           uuid primary key references public.profile(id) on delete cascade,
  punkte            integer not null default 0,
  serie             integer not null default 0,
  beste_serie       integer not null default 0,
  fehler_gemeistert integer not null default 0,
  bearbeitet        integer not null default 0,
  richtig           integer not null default 0,
  aktualisiert      timestamptz not null default now()
);

-- ---------- Abzeichen ----------
create table if not exists public.abzeichen (
  user_id     uuid not null references public.profile(id) on delete cascade,
  abzeichen   text not null,
  erreicht_am timestamptz not null default now(),
  primary key (user_id, abzeichen)
);

-- ---------- Einstellungen ----------
create table if not exists public.klassen_einstellungen (
  klasse_id            uuid primary key references public.klassen(id) on delete cascade,
  ziel_pro_thema       smallint not null default 10,
  zeitmodus_erlaubt    boolean not null default true,
  andere_stufe_erlaubt boolean not null default true
);

create table if not exists public.plattform_einstellungen (
  schluessel text primary key,
  wert       jsonb not null
);

-- Rangliste ist vorbereitet, aber ausgeschaltet (Anforderung Punkt 6).
insert into public.plattform_einstellungen (schluessel, wert)
values ('rangliste_aktiv', 'false'::jsonb)
on conflict (schluessel) do nothing;

insert into public.plattform_einstellungen (schluessel, wert)
values ('aufbewahrung_monate', '12'::jsonb)
on conflict (schluessel) do nothing;
