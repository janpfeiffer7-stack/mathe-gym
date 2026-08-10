-- ============================================================
-- Mathe Gym – Datenbankfunktionen
-- ============================================================

-- ---------- Letzte Aktivität festhalten ----------
create or replace function public.aktivitaet_melden()
returns void language sql security definer set search_path = public as $$
  update public.profile set zuletzt_aktiv = now() where id = auth.uid();
$$;

-- ---------- Einen Versuch buchen ----------
-- Schreibt den Versuch, aktualisiert Fortschritt, Punkte und Serie und
-- pflegt den Fehlerspeicher. Alles in einem Aufruf und einer Transaktion.
create or replace function public.versuch_buchen(
  p_thema       text,
  p_generator   text,
  p_stufe       text,
  p_aufgabenart text,
  p_richtig     boolean,
  p_versuch_nr  smallint,
  p_hinweis     boolean,
  p_quelle      text,
  p_params      jsonb,
  p_misch_seed  bigint,
  p_fehler_id   bigint default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user   uuid := auth.uid();
  v_punkte integer;
  v_stand  public.konto_stand%rowtype;
begin
  if v_user is null then
    raise exception 'Nicht angemeldet';
  end if;
  if p_stufe not in ('basis','standard','profi') then
    raise exception 'Ungültige Stufe: %', p_stufe;
  end if;
  if p_quelle not in ('ueben','test','fehler') then
    raise exception 'Ungültige Quelle: %', p_quelle;
  end if;

  insert into public.versuche
    (user_id, thema, generator, stufe, aufgabenart, richtig, versuch_nr, hinweis, quelle)
  values
    (v_user, p_thema, p_generator, p_stufe, p_aufgabenart, p_richtig, coalesce(p_versuch_nr,1),
     coalesce(p_hinweis,false), p_quelle);

  -- Fortschritt pro Thema und Stufe
  insert into public.thema_fortschritt (user_id, thema, stufe, bearbeitet, richtig, aktualisiert)
  values (v_user, p_thema, p_stufe, 1, case when p_richtig then 1 else 0 end, now())
  on conflict (user_id, thema, stufe) do update
    set bearbeitet   = public.thema_fortschritt.bearbeitet + 1,
        richtig      = public.thema_fortschritt.richtig + case when p_richtig then 1 else 0 end,
        aktualisiert = now();

  -- Punkte: richtig auf Anhieb zählt mehr als richtig im zweiten Versuch
  v_punkte := case
                when not p_richtig then 0
                when coalesce(p_versuch_nr,1) = 1 and not coalesce(p_hinweis,false) then 10
                when coalesce(p_versuch_nr,1) = 1 then 7
                else 5
              end;

  insert into public.konto_stand (user_id, punkte, serie, beste_serie, bearbeitet, richtig, aktualisiert)
  values (v_user, v_punkte, case when p_richtig then 1 else 0 end,
          case when p_richtig then 1 else 0 end, 1, case when p_richtig then 1 else 0 end, now())
  on conflict (user_id) do update
    set punkte       = public.konto_stand.punkte + v_punkte,
        serie        = case when p_richtig then public.konto_stand.serie + 1 else 0 end,
        beste_serie  = greatest(public.konto_stand.beste_serie,
                                case when p_richtig then public.konto_stand.serie + 1 else 0 end),
        bearbeitet   = public.konto_stand.bearbeitet + 1,
        richtig      = public.konto_stand.richtig + case when p_richtig then 1 else 0 end,
        aktualisiert = now();

  -- Fehlerspeicher pflegen
  if p_richtig then
    if p_quelle = 'fehler' then
      -- Eine Aufgabe gilt erst als gemeistert, wenn sie erneut richtig gelöst wurde.
      delete from public.fehler_offen
        where user_id = v_user
          and (id = p_fehler_id or (typ = p_generator and misch_seed = p_misch_seed));
      if found then
        update public.konto_stand
          set fehler_gemeistert = fehler_gemeistert + 1
          where user_id = v_user;
      end if;
    end if;
  else
    if p_quelle <> 'fehler' then
      insert into public.fehler_offen (user_id, typ, thema, stufe, params, misch_seed, zuletzt_falsch)
      values (v_user, p_generator, p_thema, p_stufe, p_params, p_misch_seed, now())
      on conflict (user_id, typ, misch_seed) do update set zuletzt_falsch = now();

      -- Obergrenze 200: älteste Einträge entfernen
      delete from public.fehler_offen
        where id in (
          select id from public.fehler_offen
          where user_id = v_user
          order by zuletzt_falsch desc
          offset 200
        );
    else
      update public.fehler_offen set zuletzt_falsch = now()
        where user_id = v_user and (id = p_fehler_id or (typ = p_generator and misch_seed = p_misch_seed));
    end if;
  end if;

  update public.profile set zuletzt_aktiv = now() where id = v_user;

  select * into v_stand from public.konto_stand where user_id = v_user;

  return json_build_object(
    'punkte', v_stand.punkte,
    'serie', v_stand.serie,
    'beste_serie', v_stand.beste_serie,
    'bearbeitet', v_stand.bearbeitet,
    'richtig', v_stand.richtig,
    'fehler_gemeistert', v_stand.fehler_gemeistert
  );
end;
$$;

-- ---------- Lernstandstest buchen ----------
create or replace function public.test_buchen(
  p_stufe      text,
  p_punkte     smallint,
  p_max        smallint,
  p_positionen jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id   bigint;
  v_pos  jsonb;
begin
  if v_user is null then raise exception 'Nicht angemeldet'; end if;
  if p_max <= 0 then raise exception 'Ungültige Testlänge'; end if;

  insert into public.tests (user_id, stufe, punkte, max, prozent)
  values (v_user, p_stufe, p_punkte, p_max, round(100.0 * p_punkte / p_max))
  returning id into v_id;

  for v_pos in select * from jsonb_array_elements(coalesce(p_positionen, '[]'::jsonb))
  loop
    insert into public.test_positionen (test_id, thema, richtig)
    values (v_id, v_pos->>'thema', (v_pos->>'richtig')::boolean);
  end loop;

  update public.profile set zuletzt_aktiv = now() where id = v_user;
  return v_id;
end;
$$;

-- ---------- Abzeichen setzen ----------
create or replace function public.abzeichen_setzen(p_abzeichen text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Nicht angemeldet'; end if;
  insert into public.abzeichen (user_id, abzeichen)
  values (v_user, p_abzeichen)
  on conflict (user_id, abzeichen) do nothing;
end;
$$;

-- ---------- Fortschritt eines Kindes zurücksetzen (Lehrperson) ----------
create or replace function public.fortschritt_zuruecksetzen(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.betreut_kind(p_user) then
    raise exception 'Keine Berechtigung für dieses Konto';
  end if;
  delete from public.versuche          where user_id = p_user;
  delete from public.fehler_offen      where user_id = p_user;
  delete from public.thema_fortschritt where user_id = p_user;
  delete from public.tests             where user_id = p_user;
  delete from public.abzeichen         where user_id = p_user;
  delete from public.konto_stand       where user_id = p_user;
end;
$$;

-- ---------- Klassenübersicht für den Lehrpersonenbereich ----------
create or replace function public.klassen_uebersicht(p_klasse uuid)
returns table (
  user_id       uuid,
  benutzername  text,
  anzeigename   text,
  aktiv         boolean,
  zuletzt_aktiv timestamptz,
  bearbeitet    integer,
  richtig       integer,
  quote         integer,
  offene_fehler integer,
  gemeistert    integer,
  letzter_test  integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.benutzername,
    p.anzeigename,
    p.aktiv,
    p.zuletzt_aktiv,
    coalesce(k.bearbeitet, 0),
    coalesce(k.richtig, 0),
    case when coalesce(k.bearbeitet,0) = 0 then 0
         else round(100.0 * k.richtig / k.bearbeitet)::int end,
    coalesce((select count(*)::int from public.fehler_offen f where f.user_id = p.id), 0),
    coalesce(k.fehler_gemeistert, 0),
    (select t.prozent from public.tests t where t.user_id = p.id order by t.erstellt_am desc limit 1)
  from public.profile p
  left join public.konto_stand k on k.user_id = p.id
  where p.klasse_id = p_klasse
    and p.rolle = 'schueler'
    and public.ist_lehrperson()
  order by lower(p.benutzername);
$$;

-- ---------- Themenauswertung einer Klasse ----------
create or replace function public.klassen_themen(p_klasse uuid)
returns table (thema text, bearbeitet bigint, richtig bigint, quote int, kinder bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    f.thema,
    sum(f.bearbeitet)::bigint,
    sum(f.richtig)::bigint,
    case when sum(f.bearbeitet) = 0 then 0
         else round(100.0 * sum(f.richtig) / sum(f.bearbeitet))::int end,
    count(distinct f.user_id)::bigint
  from public.thema_fortschritt f
  join public.profile p on p.id = f.user_id
  where p.klasse_id = p_klasse
    and public.ist_lehrperson()
  group by f.thema
  order by 4 asc;
$$;

-- ---------- Aufräumen nach 12 Monaten Inaktivität ----------
-- Wird vom wöchentlichen Ablauf aufgerufen (siehe .github/workflows).
create or replace function public.alte_daten_aufraeumen()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_monate int;
  v_anzahl int := 0;
begin
  select (wert #>> '{}')::int into v_monate
    from public.plattform_einstellungen where schluessel = 'aufbewahrung_monate';
  v_monate := coalesce(v_monate, 12);

  with alt as (
    select id from public.profile
    where rolle = 'schueler'
      and coalesce(zuletzt_aktiv, erstellt_am) < now() - (v_monate || ' months')::interval
  )
  delete from public.versuche v using alt where v.user_id = alt.id;
  get diagnostics v_anzahl = row_count;

  return v_anzahl;
end;
$$;
