# Mathe Gym

Rechentraining für die 5. und 6. Klasse (Lehrplan 21, Schweizer Zahlenschreibweise).
Läuft im Browser, hauptsächlich auf iPads. Frontend auf GitHub Pages, Anmeldung
und Datenhaltung über Supabase.

---

## Aufbau

```
index.html          Anmeldung
app.html            Trainingsbereich für Kinder
lehrer.html         Lehrpersonenbereich
demo.html           Vorschau ohne Anmeldung und ohne Datenbank

src/core/           Zahlformat, Brüche, Zufall, Formatregeln
src/aufgaben/       Generatoren, Solver, Validator, Prüfer, Katalog
src/ui/             Eingabekomponenten, Trainingsablauf, Texte, Symbole
src/daten/          Anmeldung, Lernstand, Warteschlange
src/styles/         Design-Tokens, Basis, Komponenten, Druck

supabase/           Schema, Zugriffsregeln, Funktionen, Startdaten,
                    Auswertung, Server-Funktion
tests/              Testsuite
docs/               Anleitungen, Prüflisten, Testbericht
legacy/             Vorgängerversion als Referenz
```

Kein Build-Schritt: reine ES-Module, die der Browser direkt lädt.

---

## Zuerst anschauen

Ohne jede Einrichtung ansehen: **`demo.html`** zeigt den Trainingsbereich ohne
Anmeldung und ohne Datenbank. Anleitung: **[docs/vorschau.md](docs/vorschau.md)**

## Einrichten

Vollständige Anleitung: **[docs/installation.md](docs/installation.md)**

Kurzfassung:

1. Supabase-Projekt anlegen (Region Zürich)
2. `supabase/01`–`03` im SQL Editor ausführen
3. Admin- und Lehrpersonenkonten anlegen, IDs in `04_seed.sql` eintragen,
   ausführen, danach `05_auswertung.sql`
4. E-Mail-Bestätigung ausschalten
5. Server-Funktion `verwaltung` veröffentlichen
6. Dateien auf GitHub hochladen, `src/config.js` aus der Vorlage erstellen,
   GitHub Pages einschalten

---

## Weitere Anleitungen

| Datei | Inhalt |
|---|---|
| [docs/vorschau.md](docs/vorschau.md) | Demo ansehen ohne Einrichtung |
| [docs/konten.md](docs/konten.md) | Schülerkonten anlegen, Passwörter, Klassen |
| [docs/backup.md](docs/backup.md) | Sicherung und Wiederherstellung |
| [docs/ipad-pruefliste.md](docs/ipad-pruefliste.md) | Prüfung auf einem echten iPad |
| [docs/rechte-pruefliste.md](docs/rechte-pruefliste.md) | Prüfung der Zugriffsrechte |
| [docs/eltern.md](docs/eltern.md) | Elterninformation zum Datenschutz |
| [docs/testbericht.md](docs/testbericht.md) | Aktueller Testbericht |

---

## Tests

```bash
node tests/alle.test.js              # Standardumfang, über 20'000 Aufgaben
N=400 M=500 node tests/alle.test.js  # grösserer Umfang
```

Läuft ausserdem bei jeder Änderung automatisch auf GitHub und schreibt
`docs/testbericht.md` neu.

Geprüft werden: Zahlformat und Bruchparser, jede erzeugte Aufgabe gegen die
Validierungsregeln, die Musterlösung gegen die Prüflogik, die Rekonstruktion aus
dem Fehlerspeicher, eine unabhängige Nachrechnung aus dem gerenderten
Aufgabentext sowie ungültige und alternative Eingaben.

---

## Sicherheit

- Alle Zugriffsrechte werden **in der Datenbank** durchgesetzt (Row Level
  Security), nicht im Browser.
- Im Frontend steht ausschliesslich der öffentliche Schlüssel. Er ist dafür
  gemacht, öffentlich zu sein.
- Der geheime Schlüssel liegt einzig in der Server-Funktion `verwaltung`, die bei
  jedem Aufruf Rolle und Klassenzugehörigkeit des Aufrufers prüft.
- Passwörter werden ausschliesslich als Hash gespeichert und sind für niemanden
  lesbar – auch nicht für Lehrpersonen.
- Benutzernamen werden nie als HTML eingesetzt, sondern ausschliesslich als Text.

---

## Bekannte Einschränkungen

1. **Internet nötig.** Kurze Aussetzer werden abgefangen: Antworten landen in
   einer lokalen Warteschlange und werden nachgesendet. Ein vollwertiger
   Offline-Modus ist nicht vorhanden.
2. **Gratisstufe pausiert nach sieben Tagen ohne Aktivität.** Der Ablauf
   *Datenbank wachhalten* verhindert das; nach längerer Repository-Inaktivität
   kann GitHub zeitgesteuerte Abläufe abschalten. Siehe
   [docs/backup.md](docs/backup.md).
3. **Keine plattformseitige Datensicherung** auf der Gratisstufe – deshalb der
   eigene wöchentliche Ablauf.
4. **Öffentliches Repository** bei kostenlosem GitHub-Konto. Eingeplant und
   unkritisch, weil kein Geheimnis im Code steht.
5. **Kein Test auf echtem iPad möglich** in der Entwicklungsumgebung. Bitte
   [docs/ipad-pruefliste.md](docs/ipad-pruefliste.md) einmal durchgehen.
6. **Zugriffsrechte nicht automatisch getestet.** Handprüfung:
   [docs/rechte-pruefliste.md](docs/rechte-pruefliste.md).
7. **Reine Geometrie- und Zeichenbereiche fehlen** (5.2, 5.6, 5.10, 6.2, 6.6,
   6.10). Sie lassen sich nicht sinnvoll per Zahleneingabe automatisch bewerten.
   Die Datenstruktur hält den Platz dafür frei.
8. **Kein automatischer Test der Auswertungsabfragen.** Die Funktionen in
   `05_auswertung.sql` liefern erst an einer laufenden Instanz Daten. Die
   Berechnungslogik im Frontend ist getestet, die SQL-Abfragen selbst nicht.

---

## Funktionsumfang

**Für Kinder:** 16 Themen, 74 Aufgabentypen, drei Schwierigkeitsstufen, sechs
Trainingsarten (nach Thema, gemischt, Schnelltraining, Fehlertraining,
Lernstandstest, Herausforderung), Hinweise, zweiter Versuch, Lösungswege,
ähnliche Aufgaben, Punkte, Serien, fünf Abzeichen, optionale Anzeige der
Übungsdauer, auf Wunsch Themen der anderen Klassenstufe.

**Für Lehrpersonen:** Klassenüberblick mit Kennzahlen, Verteilung nach
Schwierigkeitsstufe, Themen mit Unterstützungsbedarf, Kinderliste, Detailansicht
pro Kind mit 60-Tage-Verlauf, Lernstand pro Thema und Stufe, Testverlauf, offene
Fehler nach Thema. Filter nach Klasse, Zeitraum, Thema und Benutzername.
Kontoverwaltung (anlegen, umbenennen, Passwort zurücksetzen, deaktivieren,
löschen), Fortschritt zurücksetzen, Klasseneinstellungen (Zielmarke,
Übungsdauer, andere Klassenstufe), CSV-Export und Druckansicht.

## Bewusst nicht enthalten

Keine Rangliste, kein Wettbewerb zwischen Kindern, keine Hausaufgabenfunktion,
keine Elternzugänge, keine Werbung, keine Trackingdienste. Die Rangliste ist in
der Datenstruktur vorbereitet und ausgeschaltet.
