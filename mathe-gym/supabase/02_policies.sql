-- ============================================================
-- Mathe Gym – Zugriffsregeln (Row Level Security)
--
-- Grundsatz: Die Rechte werden hier durchgesetzt, nicht im Browser.
-- Ein Kind kann fremde Zeilen technisch nicht lesen, auch wenn es die
-- Oberfläche manipuliert.
-- ============================================================

-- ---------- Hilfsfunktionen ----------
-- security definer, damit die Funktionen selbst nicht durch RLS blockiert werden.

create or replace function public.meine_rolle()
returns text language sql stable security definer set search_path = public as $$
  select rolle from public.profile where id = auth.uid();
$$;

create or replace function public.meine_klasse()
returns uuid language sql stable security definer set search_path = public as $$
  select klasse_id from public.profile where id = auth.uid();
$$;

create or replace function public.ist_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select rolle = 'admin' from public.profile where id = auth.uid()), false);
$$;

create or replace function public.ist_lehrperson()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select rolle in ('lehrperson','admin') from public.profile where id = auth.uid()), false);
$$;

-- Betreut die angemeldete Lehrperson diese Klasse?
create or replace function public.betreut_klasse(p_klasse uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.ist_admin()
      or exists (select 1 from public.klassen_lehrpersonen
                 where klasse_id = p_klasse and lehrperson_id = auth.uid());
$$;

-- Betreut die angemeldete Lehrperson die Klasse dieses Kindes?
create or replace function public.betreut_kind(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.ist_admin()
      or exists (
        select 1
        from public.profile s
        join public.klassen_lehrpersonen kl on kl.klasse_id = s.klasse_id
        where s.id = p_user and kl.lehrperson_id = auth.uid()
      );
$$;

-- ---------- RLS einschalten ----------
alter table public.klassen                 enable row level security;
alter table public.profile                 enable row level security;
alter table public.klassen_lehrpersonen    enable row level security;
alter table public.versuche                enable row level security;
alter table public.fehler_offen            enable row level security;
alter table public.thema_fortschritt       enable row level security;
alter table public.tests                   enable row level security;
alter table public.test_positionen         enable row level security;
alter table public.konto_stand             enable row level security;
alter table public.abzeichen               enable row level security;
alter table public.klassen_einstellungen   enable row level security;
alter table public.plattform_einstellungen enable row level security;

-- ---------- Klassen ----------
drop policy if exists klassen_lesen on public.klassen;
create policy klassen_lesen on public.klassen
  for select using (auth.uid() is not null);          -- alle Angemeldeten dürfen Klassen sehen

drop policy if exists klassen_verwalten on public.klassen;
create policy klassen_verwalten on public.klassen
  for all using (public.ist_admin()) with check (public.ist_admin());

-- ---------- Profile ----------
drop policy if exists profil_eigenes on public.profile;
create policy profil_eigenes on public.profile
  for select using (id = auth.uid());

drop policy if exists profil_lehrperson_lesen on public.profile;
create policy profil_lehrperson_lesen on public.profile
  for select using (public.ist_lehrperson());          -- Leseeinsicht auch in fremde Klassen

drop policy if exists profil_eigene_klasse_aendern on public.profile;
create policy profil_eigene_klasse_aendern on public.profile
  for update using (public.betreut_kind(id)) with check (public.betreut_kind(id));

drop policy if exists profil_admin on public.profile;
create policy profil_admin on public.profile
  for all using (public.ist_admin()) with check (public.ist_admin());

-- ---------- Zuordnung Lehrpersonen ----------
drop policy if exists kl_lesen on public.klassen_lehrpersonen;
create policy kl_lesen on public.klassen_lehrpersonen
  for select using (public.ist_lehrperson());

drop policy if exists kl_admin on public.klassen_lehrpersonen;
create policy kl_admin on public.klassen_lehrpersonen
  for all using (public.ist_admin()) with check (public.ist_admin());

-- ---------- Lernstandsdaten ----------
-- Muster: eigene Daten lesen und schreiben, Lehrpersonen lesen alles,
-- ändern und löschen nur in der eigenen Klasse.

drop policy if exists versuche_eigene on public.versuche;
create policy versuche_eigene on public.versuche
  for select using (user_id = auth.uid() or public.ist_lehrperson());

drop policy if exists versuche_schreiben on public.versuche;
create policy versuche_schreiben on public.versuche
  for insert with check (user_id = auth.uid());

drop policy if exists versuche_loeschen on public.versuche;
create policy versuche_loeschen on public.versuche
  for delete using (public.betreut_kind(user_id));

drop policy if exists fehler_eigene on public.fehler_offen;
create policy fehler_eigene on public.fehler_offen
  for select using (user_id = auth.uid() or public.ist_lehrperson());

drop policy if exists fehler_schreiben on public.fehler_offen;
create policy fehler_schreiben on public.fehler_offen
  for insert with check (user_id = auth.uid());

drop policy if exists fehler_aendern on public.fehler_offen;
create policy fehler_aendern on public.fehler_offen
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists fehler_loeschen on public.fehler_offen;
create policy fehler_loeschen on public.fehler_offen
  for delete using (user_id = auth.uid() or public.betreut_kind(user_id));

drop policy if exists fortschritt_eigene on public.thema_fortschritt;
create policy fortschritt_eigene on public.thema_fortschritt
  for select using (user_id = auth.uid() or public.ist_lehrperson());

drop policy if exists fortschritt_schreiben on public.thema_fortschritt;
create policy fortschritt_schreiben on public.thema_fortschritt
  for insert with check (user_id = auth.uid());

drop policy if exists fortschritt_aendern on public.thema_fortschritt;
create policy fortschritt_aendern on public.thema_fortschritt
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists fortschritt_loeschen on public.thema_fortschritt;
create policy fortschritt_loeschen on public.thema_fortschritt
  for delete using (public.betreut_kind(user_id));

drop policy if exists tests_eigene on public.tests;
create policy tests_eigene on public.tests
  for select using (user_id = auth.uid() or public.ist_lehrperson());

drop policy if exists tests_schreiben on public.tests;
create policy tests_schreiben on public.tests
  for insert with check (user_id = auth.uid());

drop policy if exists tests_loeschen on public.tests;
create policy tests_loeschen on public.tests
  for delete using (public.betreut_kind(user_id));

drop policy if exists testpos_lesen on public.test_positionen;
create policy testpos_lesen on public.test_positionen
  for select using (
    exists (select 1 from public.tests t
            where t.id = test_id and (t.user_id = auth.uid() or public.ist_lehrperson()))
  );

drop policy if exists testpos_schreiben on public.test_positionen;
create policy testpos_schreiben on public.test_positionen
  for insert with check (
    exists (select 1 from public.tests t where t.id = test_id and t.user_id = auth.uid())
  );

drop policy if exists stand_eigene on public.konto_stand;
create policy stand_eigene on public.konto_stand
  for select using (user_id = auth.uid() or public.ist_lehrperson());

drop policy if exists stand_schreiben on public.konto_stand;
create policy stand_schreiben on public.konto_stand
  for insert with check (user_id = auth.uid());

drop policy if exists stand_aendern on public.konto_stand;
create policy stand_aendern on public.konto_stand
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists stand_loeschen on public.konto_stand;
create policy stand_loeschen on public.konto_stand
  for delete using (public.betreut_kind(user_id));

drop policy if exists abz_eigene on public.abzeichen;
create policy abz_eigene on public.abzeichen
  for select using (user_id = auth.uid() or public.ist_lehrperson());

drop policy if exists abz_schreiben on public.abzeichen;
create policy abz_schreiben on public.abzeichen
  for insert with check (user_id = auth.uid());

drop policy if exists abz_loeschen on public.abzeichen;
create policy abz_loeschen on public.abzeichen
  for delete using (public.betreut_kind(user_id));

-- ---------- Einstellungen ----------
drop policy if exists ke_lesen on public.klassen_einstellungen;
create policy ke_lesen on public.klassen_einstellungen
  for select using (auth.uid() is not null);

drop policy if exists ke_aendern on public.klassen_einstellungen;
create policy ke_aendern on public.klassen_einstellungen
  for all using (public.betreut_klasse(klasse_id)) with check (public.betreut_klasse(klasse_id));

drop policy if exists pe_lesen on public.plattform_einstellungen;
create policy pe_lesen on public.plattform_einstellungen
  for select using (auth.uid() is not null);

drop policy if exists pe_aendern on public.plattform_einstellungen;
create policy pe_aendern on public.plattform_einstellungen
  for all using (public.ist_admin()) with check (public.ist_admin());
