-- ============================================================
-- Mathe Gym – Etappe 2: Auswertungsfunktionen
--
-- Im SQL Editor ausführen, nachdem 01 bis 04 gelaufen sind.
-- Alle Funktionen prüfen selbst, ob der Aufrufer Lehrperson oder
-- Administration ist. Ohne diese Rolle liefern sie keine Zeilen.
-- ============================================================

-- ---------- Detail: Fortschritt eines Kindes pro Thema ----------
create or replace function public.kind_themen(p_user uuid)
returns table (thema text, stufe text, bearbeitet integer, richtig integer, quote integer)
language sql stable security definer set search_path = public as $$
  select f.thema, f.stufe, f.bearbeitet, f.richtig,
         case when f.bearbeitet = 0 then 0
              else round(100.0 * f.richtig / f.bearbeitet)::int end
  from public.thema_fortschritt f
  where f.user_id = p_user
    and (p_user = auth.uid() or public.ist_lehrperson())
  order by f.thema, f.stufe;
$$;

-- ---------- Detail: Tagesverlauf ----------
create or replace function public.kind_verlauf(p_user uuid, p_tage integer default 60)
returns table (tag date, bearbeitet bigint, richtig bigint)
language sql stable security definer set search_path = public as $$
  select (v.erstellt_am at time zone 'Europe/Zurich')::date as tag,
         count(*)::bigint,
         count(*) filter (where v.richtig)::bigint
  from public.versuche v
  where v.user_id = p_user
    and v.erstellt_am >= now() - (p_tage || ' days')::interval
    and (p_user = auth.uid() or public.ist_lehrperson())
  group by 1
  order by 1;
$$;

-- ---------- Detail: Testverlauf ----------
create or replace function public.kind_tests(p_user uuid)
returns table (id bigint, stufe text, punkte smallint, max smallint, prozent smallint,
               erstellt_am timestamptz, schwache_themen text)
language sql stable security definer set search_path = public as $$
  select t.id, t.stufe, t.punkte, t.max, t.prozent, t.erstellt_am,
         coalesce((
           select string_agg(distinct tp.thema, ', ' order by tp.thema)
           from public.test_positionen tp
           where tp.test_id = t.id and tp.richtig = false
         ), '')
  from public.tests t
  where t.user_id = p_user
    and (p_user = auth.uid() or public.ist_lehrperson())
  order by t.erstellt_am desc
  limit 30;
$$;

-- ---------- Detail: offene Fehler nach Thema ----------
create or replace function public.kind_fehlerthemen(p_user uuid)
returns table (thema text, anzahl bigint)
language sql stable security definer set search_path = public as $$
  select f.thema, count(*)::bigint
  from public.fehler_offen f
  where f.user_id = p_user
    and (p_user = auth.uid() or public.ist_lehrperson())
  group by f.thema
  order by 2 desc;
$$;

-- ---------- Klasse im Zeitraum ----------
-- Werte aus der Tabelle "versuche", damit sich ein Zeitraum eingrenzen lässt.
create or replace function public.klassen_zeitraum(
  p_klasse uuid,
  p_von timestamptz,
  p_bis timestamptz,
  p_thema text default null
)
returns table (
  user_id uuid, benutzername text, aktiv boolean, zuletzt_aktiv timestamptz,
  bearbeitet bigint, richtig bigint, quote integer, tage_aktiv bigint
)
language sql stable security definer set search_path = public as $$
  select
    p.id, p.benutzername, p.aktiv, p.zuletzt_aktiv,
    count(v.id)::bigint,
    count(v.id) filter (where v.richtig)::bigint,
    case when count(v.id) = 0 then 0
         else round(100.0 * count(v.id) filter (where v.richtig) / count(v.id))::int end,
    count(distinct (v.erstellt_am at time zone 'Europe/Zurich')::date)::bigint
  from public.profile p
  left join public.versuche v
         on v.user_id = p.id
        and v.erstellt_am >= p_von
        and v.erstellt_am < p_bis
        and (p_thema is null or v.thema = p_thema)
  where p.klasse_id = p_klasse
    and p.rolle = 'schueler'
    and public.ist_lehrperson()
  group by p.id, p.benutzername, p.aktiv, p.zuletzt_aktiv
  order by lower(p.benutzername);
$$;

-- ---------- Themen der Klasse im Zeitraum ----------
create or replace function public.klassen_themen_zeitraum(
  p_klasse uuid,
  p_von timestamptz,
  p_bis timestamptz
)
returns table (thema text, bearbeitet bigint, richtig bigint, quote integer, kinder bigint)
language sql stable security definer set search_path = public as $$
  select
    v.thema,
    count(*)::bigint,
    count(*) filter (where v.richtig)::bigint,
    case when count(*) = 0 then 0
         else round(100.0 * count(*) filter (where v.richtig) / count(*))::int end,
    count(distinct v.user_id)::bigint
  from public.versuche v
  join public.profile p on p.id = v.user_id
  where p.klasse_id = p_klasse
    and v.erstellt_am >= p_von
    and v.erstellt_am < p_bis
    and public.ist_lehrperson()
  group by v.thema
  order by 4 asc;
$$;

-- ---------- Stufenverteilung einer Klasse ----------
create or replace function public.klassen_stufen(p_klasse uuid, p_von timestamptz, p_bis timestamptz)
returns table (stufe text, bearbeitet bigint, richtig bigint, quote integer)
language sql stable security definer set search_path = public as $$
  select
    v.stufe,
    count(*)::bigint,
    count(*) filter (where v.richtig)::bigint,
    case when count(*) = 0 then 0
         else round(100.0 * count(*) filter (where v.richtig) / count(*))::int end
  from public.versuche v
  join public.profile p on p.id = v.user_id
  where p.klasse_id = p_klasse
    and v.erstellt_am >= p_von
    and v.erstellt_am < p_bis
    and public.ist_lehrperson()
  group by v.stufe
  order by case v.stufe when 'basis' then 1 when 'standard' then 2 else 3 end;
$$;

-- ---------- Klasseneinstellungen ändern ----------
-- Ergänzt die Regel aus 02_policies.sql um eine klare Fehlermeldung.
create or replace function public.klasseneinstellung_setzen(
  p_klasse uuid,
  p_ziel smallint,
  p_zeitmodus boolean,
  p_andere_stufe boolean
)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.betreut_klasse(p_klasse) then
    raise exception 'Sie betreuen diese Klasse nicht und können ihre Einstellungen nicht ändern.';
  end if;
  if p_ziel < 3 or p_ziel > 50 then
    raise exception 'Die Zielmarke muss zwischen 3 und 50 liegen.';
  end if;

  insert into public.klassen_einstellungen (klasse_id, ziel_pro_thema, zeitmodus_erlaubt, andere_stufe_erlaubt)
  values (p_klasse, p_ziel, p_zeitmodus, p_andere_stufe)
  on conflict (klasse_id) do update
    set ziel_pro_thema       = excluded.ziel_pro_thema,
        zeitmodus_erlaubt    = excluded.zeitmodus_erlaubt,
        andere_stufe_erlaubt = excluded.andere_stufe_erlaubt;
end;
$$;
