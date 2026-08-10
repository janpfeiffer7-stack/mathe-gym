# Installation

Diese Anleitung führt von null zur laufenden Plattform. Rechnen Sie mit rund
einer Stunde. Programmierkenntnisse sind nicht nötig – Sie füllen Formulare aus
und kopieren Texte.

Sie brauchen: ein GitHub-Konto, eine E-Mail-Adresse für das Supabase-Konto,
und für jede Lehrperson eine E-Mail-Adresse.

---

> **Vorher anschauen?** Mit `demo.html` sehen Sie die Plattform ohne jede
> Einrichtung. Siehe [vorschau.md](vorschau.md).

## Schritt 1 – Supabase-Projekt anlegen (etwa 15 Minuten)

1. Gehen Sie auf `https://supabase.com` und erstellen Sie ein Konto.
2. Klicken Sie auf **New project**.
3. Füllen Sie aus:
   - **Name:** `mathe-gym`
   - **Database Password:** Ein starkes Passwort. **Notieren Sie es** – Sie brauchen es
     später für die Datensicherung, und es lässt sich nicht mehr anzeigen.
   - **Region:** Wählen Sie **Zurich** oder, falls nicht verfügbar, **Frankfurt**.
     Damit liegen die Daten in der Schweiz beziehungsweise in der EU.
4. Klicken Sie auf **Create new project** und warten Sie ein bis zwei Minuten.

## Schritt 2 – Datenbank einrichten (etwa 10 Minuten)

Öffnen Sie links im Menü **SQL Editor** und führen Sie die vier Dateien
**in dieser Reihenfolge** aus. Für jede Datei: Inhalt kopieren, ins Eingabefeld
einfügen, auf **Run** klicken, auf die Erfolgsmeldung warten.

1. `supabase/01_schema.sql` – legt die Tabellen an
2. `supabase/02_policies.sql` – schaltet die Zugriffsregeln ein
3. `supabase/03_funktionen.sql` – legt die Datenbankfunktionen an
4. `supabase/04_seed.sql` – **erst nach Schritt 3 ausführen** (siehe dort)
5. `supabase/05_auswertung.sql` – Auswertungsfunktionen für den Lehrpersonenbereich

Nach Datei 2 sollte unter **Table Editor** bei jeder Tabelle ein grünes
Schloss-Symbol erscheinen. Fehlt es irgendwo, führen Sie Datei 2 nochmals aus.

## Schritt 3 – Konten für Erwachsene anlegen (etwa 10 Minuten)

Öffnen Sie **Authentication** → **Users** → **Add user** → **Create new user**.

Legen Sie vier Konten an und setzen Sie bei jedem den Haken bei
**Auto Confirm User**:

| Konto | E-Mail | Passwort |
|---|---|---|
| Administration | Ihre Adresse | mindestens 12 Zeichen |
| Lehrperson 1 | Adresse Lehrperson 1 | mindestens 12 Zeichen |
| Lehrperson 2 | Adresse Lehrperson 2 | mindestens 12 Zeichen |
| Lehrperson 3 | Adresse Lehrperson 3 | mindestens 12 Zeichen |

Kopieren Sie danach aus der Liste die vier **User UID** (lange Zeichenfolgen).

Öffnen Sie `supabase/04_seed.sql`, ersetzen Sie die vier Platzhalter-IDs
(`00000000-0000-...`) durch die echten IDs, passen Sie Klassennamen und
Klassencodes an Ihre Situation an und führen Sie die Datei im **SQL Editor** aus.

Zur Kontrolle im SQL Editor:

```sql
select rolle, benutzername, klasse_id from public.profile order by rolle;
```

Es sollten vier Zeilen erscheinen: einmal `admin`, dreimal `lehrperson`.

## Schritt 4 – E-Mail-Bestätigung ausschalten (wichtig)

Kinder haben keine E-Mail-Adresse. Damit ihre Konten sofort nutzbar sind:

**Authentication** → **Sign In / Providers** → **Email**:
Schalten Sie **Confirm email** aus und speichern Sie.

Ohne diesen Schritt können sich neu angelegte Schülerkonten nicht anmelden.

## Schritt 5 – Server-Funktion einrichten (etwa 10 Minuten)

Diese Funktion legt Schülerkonten an und setzt Passwörter zurück. Nur hier liegt
der geheime Schlüssel.

1. **Edge Functions** → **Deploy a new function** → Name: `verwaltung`
2. Fügen Sie den Inhalt von `supabase/functions/verwaltung/index.ts` ein und
   klicken Sie auf **Deploy**.
3. Öffnen Sie **Edge Functions** → **Secrets** und legen Sie an:
   - `SCHUELER_DOMAIN` = `mathegym.local`
   - `ERLAUBTE_HERKUNFT` = die Adresse Ihrer GitHub-Pages-Seite,
     zum Beispiel `https://ihrname.github.io`

   Die Schlüssel `SUPABASE_URL`, `SUPABASE_ANON_KEY` und
   `SUPABASE_SERVICE_ROLE_KEY` sind bereits vorhanden und müssen nicht
   eingetragen werden.

## Schritt 6 – Auf GitHub veröffentlichen (etwa 10 Minuten)

1. Erstellen Sie auf GitHub ein neues Repository, zum Beispiel `mathe-gym`.
2. Laden Sie sämtliche Dateien dieses Projekts hoch
   (**Add file** → **Upload files**, den ganzen Ordnerinhalt).
3. Erstellen Sie die Datei `src/config.js`:
   - Kopieren Sie `src/config.example.js`.
   - Tragen Sie **Project URL** und **anon public key** ein. Beide finden Sie
     unter **Project Settings** → **API**.
   - **Nur den `anon public` Schlüssel eintragen.** Der `service_role`-Schlüssel
     darf niemals in diese Datei.
4. **Settings** → **Pages** → **Source: Deploy from a branch** → Branch `main`,
   Ordner `/ (root)` → **Save**.
5. Nach ein bis zwei Minuten ist die Seite erreichbar unter
   `https://ihrname.github.io/mathe-gym/`

### Hinweis zum öffentlichen Repository

Bei einem kostenlosen GitHub-Konto ist das Repository öffentlich, der Code also
weltweit lesbar. Das ist eingeplant: Im Frontend steht kein Geheimnis. Der
`anon public` Schlüssel ist dafür gemacht, öffentlich zu sein – geschützt wird
alles durch die Zugriffsregeln in der Datenbank.

## Schritt 7 – Automatische Abläufe einrichten (etwa 5 Minuten)

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Name | Wert | Wofür |
|---|---|---|
| `SUPABASE_URL` | Project URL | Wachhalten, Aufräumen |
| `SUPABASE_ANON_KEY` | anon public key | Wachhalten |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | Aufräumen |
| `SUPABASE_DB_URL` | Verbindungszeichenfolge | Datensicherung |

Die Verbindungszeichenfolge finden Sie unter **Project Settings** → **Database**
→ **Connection string** → **URI**. Setzen Sie darin `[YOUR-PASSWORD]` durch das
Datenbankpasswort aus Schritt 1 ein.

Starten Sie danach unter **Actions** die Abläufe *Datenbank wachhalten* und
*Datensicherung* einmal von Hand, um zu prüfen, dass sie durchlaufen.

## Schritt 8 – Prüfen

1. Öffnen Sie die Seite und melden Sie sich als Lehrperson an
   (Knopf *Ich bin eine Lehrperson*).
2. Legen Sie ein Testkonto an. Notieren Sie das angezeigte Passwort.
3. Melden Sie sich ab, melden Sie sich als Testkind an und lösen Sie einige
   Aufgaben.
4. Melden Sie sich wieder als Lehrperson an: Die Zahlen müssen erscheinen.
5. Löschen Sie das Testkonto.

Läuft alles, folgen `docs/konten.md` für die Schülerkonten und
`docs/ipad-pruefliste.md` für den Test auf einem echten Gerät.

---

## Wenn etwas nicht klappt

| Symptom | Ursache und Lösung |
|---|---|
| Anmeldung sagt „Benutzername oder Passwort stimmt nicht" | Klassencode falsch geschrieben. Er muss genau dem Feld `code` in der Tabelle `klassen` entsprechen. |
| Neues Schülerkonto kann sich nicht anmelden | Schritt 4 fehlt: **Confirm email** ist noch eingeschaltet. |
| „Keine Berechtigung" beim Anlegen eines Kontos | Die Lehrperson ist der Klasse nicht zugeordnet. Prüfen Sie die Tabelle `klassen_lehrpersonen`. |
| Lehrpersonenbereich bleibt leer | `src/config.js` fehlt oder enthält falsche Werte. |
| Seite zeigt nur weissen Hintergrund | `src/config.js` wurde nicht erstellt. Konsole im Browser öffnen: Dort steht der Ladefehler. |
| Nach den Ferien geht nichts mehr | Das Supabase-Projekt wurde pausiert. Im Dashboard auf **Restore project** klicken; die Daten sind vollständig erhalten. |
