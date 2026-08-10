# Datensicherung und Wiederherstellung

Die Gratisstufe von Supabase enthält **keine** automatische Sicherung. Deshalb
erstellt dieses Projekt seine eigene.

---

## Was automatisch läuft

| Ablauf | Wann | Was |
|---|---|---|
| *Datensicherung* | jeden Sonntag, 02:40 UTC | vollständige Kopie aller Daten und Konten, 90 Tage abrufbar |
| *Datenbank wachhalten* | Montag und Donnerstag | verhindert die Pause bei Inaktivität |
| *Tests* | bei jeder Änderung | prüft die Aufgabengeneratoren |

Alle drei finden Sie auf GitHub unter **Actions**.

---

## Sicherung herunterladen

1. GitHub-Repository öffnen → **Actions** → **Datensicherung**
2. Den gewünschten Lauf anklicken
3. Unten unter **Artifacts** die Datei `datensicherung-…` herunterladen
4. Entpacken: darin liegt `mathegym-JJJJ-MM-TT.sql.gz`

**Empfehlung:** Laden Sie einmal pro Quartal eine Sicherung herunter und legen
Sie sie ausserhalb von GitHub ab. Artefakte werden nach 90 Tagen gelöscht.

---

## Sicherung von Hand auslösen

**Actions** → **Datensicherung** → **Run workflow** → **Run workflow**.

Sinnvoll vor grösseren Änderungen, etwa vor dem Schuljahreswechsel.

---

## Wiederherstellen

> Die Wiederherstellung überschreibt den aktuellen Stand. Erstellen Sie vorher
> eine Sicherung des Ist-Zustands, falls dieser noch brauchbar ist.

### Einzelne Angaben nachschlagen

Für den häufigsten Fall – jemand hat versehentlich ein Konto gelöscht – müssen
Sie nicht die ganze Datenbank zurückspielen. Entpacken Sie die `.sql`-Datei,
öffnen Sie sie in einem Texteditor und suchen Sie nach dem Benutzernamen. Die
gefundenen `INSERT`-Zeilen können Sie einzeln im **SQL Editor** ausführen.

### Vollständige Wiederherstellung

Nötig, wenn die Datenbank unbrauchbar ist. Dafür brauchen Sie das
Datenbankpasswort aus der Installation.

Auf einem Rechner mit installiertem PostgreSQL-Client:

```bash
# 1. Sicherung entpacken
gunzip mathegym-2026-08-30.sql.gz

# 2. Verbindungszeichenfolge aus dem Supabase-Dashboard holen:
#    Project Settings → Database → Connection string → URI
#    Darin [YOUR-PASSWORD] durch das Datenbankpasswort ersetzen.

# 3. Einspielen
psql "postgresql://postgres:PASSWORT@db.IHRE-ID.supabase.co:5432/postgres" \
     -f mathegym-2026-08-30.sql
```

Danach im Browser anmelden und stichprobenweise prüfen, ob die Klassen und
einige Lernstände vorhanden sind.

### Wenn Sie keinen PostgreSQL-Client haben

Legen Sie ein neues Supabase-Projekt an, führen Sie die vier SQL-Dateien aus
`supabase/` aus und spielen Sie danach die Sicherung über den **SQL Editor** ein
(die Datei lässt sich in Abschnitten einfügen). Tragen Sie zuletzt die neuen
Werte in `src/config.js` ein.

Bei grösseren Datenmengen ist das mühsam. Falls Sie den Ernstfall zuverlässig
abdecken wollen, lohnt sich der Wechsel auf die kostenpflichtige Supabase-Stufe:
Dort gibt es tägliche Sicherungen mit Wiederherstellung per Knopfdruck.

---

## Projekt wurde pausiert

Passiert, wenn der Ablauf *Datenbank wachhalten* länger nicht lief – etwa weil
GitHub zeitgesteuerte Abläufe nach längerer Repository-Inaktivität abschaltet.

**Die Daten sind dabei nicht verloren.** So starten Sie neu:

1. Auf `supabase.com` anmelden
2. Das Projekt `mathe-gym` öffnen
3. Auf **Restore project** klicken
4. Ein bis zwei Minuten warten

Danach unter **Actions** den Ablauf *Datenbank wachhalten* einmal von Hand
starten, damit er wieder regelmässig läuft.

---

## Aufbewahrungsdauer

Lernstandsdaten von Konten, die zwölf Monate nicht benutzt wurden, werden beim
wöchentlichen Ablauf automatisch gelöscht. Die Dauer lässt sich anpassen:

```sql
update public.plattform_einstellungen
set wert = '24'::jsonb
where schluessel = 'aufbewahrung_monate';
```

---

## Notfall-Übersicht

| Situation | Was tun |
|---|---|
| Konto versehentlich gelöscht | Konto neu anlegen; Lernstand aus Sicherung nachschlagen |
| Nach den Ferien keine Anmeldung möglich | Projekt pausiert → **Restore project** |
| Falsche Daten in der Datenbank | Sicherung herunterladen, vollständig wiederherstellen |
| `src/config.js` verloren | Werte neu aus **Project Settings** → **API** eintragen |
| Datenbankpasswort vergessen | **Project Settings** → **Database** → **Reset database password** |
