# Vorschau ansehen (ohne Einrichtung)

Sie können die Plattform anschauen und ausprobieren, **bevor** Sie Supabase und
GitHub einrichten. Dafür gibt es die Datei `demo.html`.

In der Demo sind Aufgaben, Eingaben, Rückmeldungen und Lösungswege identisch mit
der echten Plattform. Nur der Fortschritt wird nicht gespeichert, und
«Meine Fehler üben» sowie der Lehrpersonenbereich fehlen – beide brauchen ein Konto.

---

## Weg 1: Auf dem eigenen Rechner (5 Minuten)

Ein Doppelklick auf `demo.html` genügt **nicht**. Browser blockieren aus
Sicherheitsgründen das Nachladen von Code aus lokalen Dateien. Sie brauchen einen
kleinen lokalen Server – der ist bei macOS und Linux bereits vorhanden.

### macOS und Linux

1. Ordner `mathe-gym` entpacken.
2. Terminal öffnen (macOS: Programme → Dienstprogramme → Terminal).
3. Eintippen: `cd ` (mit Leerzeichen danach), dann den Ordner `mathe-gym` ins
   Terminal-Fenster ziehen und Enter drücken.
4. Eintippen:

   ```
   python3 -m http.server 8000
   ```

5. Im Browser öffnen: `http://localhost:8000/demo.html`
6. Zum Beenden im Terminal `Ctrl` + `C` drücken.

### Windows

Falls Python installiert ist, funktioniert derselbe Befehl mit `python` statt
`python3`. Ist kein Python vorhanden, nehmen Sie Weg 2 – das ist ohnehin
einfacher.

---

## Weg 2: Über GitHub Pages (10 Minuten, empfohlen)

Der Vorteil: Sie sehen die Demo sofort auch **auf dem iPad**, und Sie haben den
ersten Installationsschritt bereits erledigt.

1. Auf GitHub ein neues Repository anlegen, zum Beispiel `mathe-gym`.
2. Alle Dateien hochladen (**Add file** → **Upload files**, den ganzen
   Ordnerinhalt hineinziehen).
3. **Settings** → **Pages** → Source: *Deploy from a branch*, Branch `main`,
   Ordner `/ (root)` → **Save**.
4. Nach ein bis zwei Minuten öffnen:
   `https://ihrname.github.io/mathe-gym/demo.html`

Die Demo braucht **keine** Datei `src/config.js` und keine Datenbank. Sie
funktioniert also sofort nach dem Hochladen. Die Anmeldeseite `index.html` zeigt
zu diesem Zeitpunkt noch nichts Sinnvolles – das ist normal und ändert sich mit
Schritt 1 der Installation.

---

## Was Sie sich in der Demo ansehen sollten

| Punkt | Warum |
|---|---|
| **Bruch-Eingabe** (Thema 6.1 «Kürzen» oder 5.8) | Der wichtigste Bedienungspunkt auf dem iPad |
| **Zweiter Versuch** – absichtlich falsch antworten | Zeigt Rückmeldung, Hinweis und Lösungsweg |
| **Ordnen** (Thema 5.8, «Dezimalzahlen ordnen») | Antippen und Rücknahme einzelner Schritte |
| **Zahlenstrahl** (Thema 6.3) | Darstellung auf kleinem Bildschirm |
| **Lernstandstest** | Ablauf ohne Hilfen und die Auswertung am Schluss |
| **Schwierigkeitsstufen** | Gleiches Thema auf Basis und Profi vergleichen |
| **Übungsdauer** ein- und ausschalten | Prüfen, ob die Uhr über mehrere Aufgaben weiterläuft |

Wenn Sie dabei auf dem iPad sind, können Sie gleich die Punkte aus
`docs/ipad-pruefliste.md` abhaken.

---

## Danach

Wenn Ihnen gefällt, was Sie sehen, folgen Sie `docs/installation.md`. Sie haben
mit Weg 2 bereits Schritt 6 (Veröffentlichung) erledigt; es fehlen dann nur noch
Supabase und die Datei `src/config.js`.

## Wenn die Demo weiss bleibt

| Ursache | Lösung |
|---|---|
| `demo.html` per Doppelklick geöffnet | Lokalen Server nutzen (Weg 1) oder GitHub Pages (Weg 2) |
| Nur einzelne Dateien hochgeladen | Der ganze Ordner wird gebraucht, besonders `src/` |
| Ordnerstruktur verändert | `demo.html` muss neben dem Ordner `src/` liegen |
