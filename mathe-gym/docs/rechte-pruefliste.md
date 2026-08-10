# Prüfliste Zugriffsrechte

Die Zugriffsregeln liegen in der Datenbank und lassen sich nur an einer
laufenden Instanz prüfen. Gehen Sie diese Liste **einmal nach der Installation**
durch – danach nur noch nach Änderungen an den Regeln.

Dauer etwa 20 Minuten. Sie brauchen: ein Lehrpersonenkonto und zwei Testkonten
für Kinder aus **verschiedenen** Klassen.

---

## Vorbereitung

1. Als Lehrperson anmelden.
2. In der eigenen Klasse ein Testkonto anlegen, zum Beispiel `testkind.a`.
3. Eine Kollegin bittet: in ihrer Klasse `testkind.b` anlegen.
   Alternativ als Administration selbst in einer zweiten Klasse anlegen.
4. Mit beiden Konten je zwei bis drei Aufgaben lösen, damit Daten vorliegen.

---

## A – Kinder sehen nur ihre eigenen Daten

Als `testkind.a` anmelden. Die Entwicklerkonsole öffnen (auf dem iPad geht das
nicht; nutzen Sie dafür einen Laptop) und eingeben:

```js
const { data, error } = await window.__db.from('profile').select('*');
console.log(data, error);
```

- [ ] Es erscheint **genau eine Zeile**: das eigene Profil. Nicht die Klasse,
      nicht andere Kinder.

```js
const { data } = await window.__db.from('versuche').select('*');
console.log(data.length);
```

- [ ] Nur die eigenen Versuche. Die Zahl entspricht den selbst gelösten Aufgaben.

```js
const { error } = await window.__db.from('konto_stand')
  .update({ punkte: 999999 }).neq('user_id', '00000000-0000-0000-0000-000000000000');
console.log(error);
```

- [ ] Fremde Punktestände lassen sich **nicht** ändern (kein Treffer oder Fehler).

> Hinweis: Falls `window.__db` nicht existiert, fügen Sie zum Testen in
> `src/daten/auth.js` vorübergehend `window.__db = db;` ein und entfernen Sie es
> danach wieder.

## B – Kinder kommen nicht in den Lehrpersonenbereich

Als `testkind.a` angemeldet die Adresse `lehrer.html` direkt aufrufen.

- [ ] Die Seite leitet zurück auf `app.html`.
- [ ] Auch bei ausgeschaltetem JavaScript in der Anzeige: Über die Konsole
      liefert `window.__db.rpc('klassen_uebersicht', {p_klasse: '…'})` **keine**
      Daten.

## C – Lehrperson: eigene Klasse vollständig

Als Lehrperson anmelden, eigene Klasse wählen.

- [ ] Alle Kinder der Klasse erscheinen.
- [ ] *Neues Schülerkonto* ist sichtbar und funktioniert.
- [ ] *Passwort*, *Umbenennen*, *Deaktivieren*, *Löschen* sind vorhanden.
- [ ] Ein Passwort-Reset funktioniert und das neue Passwort wird angezeigt.

## D – Lehrperson: fremde Klasse nur lesend

Über die Auswahl oben eine fremde Klasse öffnen.

- [ ] Der Hinweis *Diese Klasse betreuen Sie nicht* erscheint.
- [ ] Der Knopf *Neues Schülerkonto* ist ausgeblendet.
- [ ] In der Kinderliste steht *nur Ansicht* statt der Verwaltungsknöpfe.
- [ ] Die Zahlen sind trotzdem vollständig sichtbar.

**Der eigentliche Test** – Umgehung über die Konsole. Nehmen Sie die Kennung
eines Kindes aus der fremden Klasse (steht in der Tabelle im HTML-Attribut
`data-id`) und versuchen Sie:

```js
await fetch(SUPABASE_URL + '/functions/v1/verwaltung', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ aktion: 'passwort_zuruecksetzen', user_id: 'FREMDE-ID', passwort: 'test12345' })
}).then(r => r.json());
```

- [ ] Die Antwort lautet **„Keine Berechtigung für dieses Konto"**.
      Das ist der wichtigste Einzeltest dieser Liste.

## E – Lehrperson kann keine fremden Daten löschen

```js
const { error } = await window.__db.from('versuche').delete().eq('user_id', 'FREMDE-ID');
console.log(error);
```

- [ ] Es wird nichts gelöscht.

## F – Administration

Als Administration anmelden.

- [ ] Alle Klassen sind wählbar und **alle** vollständig verwaltbar.
- [ ] In `04_seed.sql` steht das Adminkonto mit der Rolle `admin`.

## G – Deaktiviertes Konto

Ein Testkonto deaktivieren und sich damit anzumelden versuchen.

- [ ] Die Anmeldung schlägt fehl beziehungsweise es erscheint die Meldung, dass
      das Konto deaktiviert ist.

## H – Abmelden

- [ ] Nach *Abmelden* führt der direkte Aufruf von `app.html` zur Anmeldeseite.
- [ ] Über die Konsole liefert eine Abfrage danach keine Daten mehr.

---

## Aufräumen

- [ ] Beide Testkonten löschen.
- [ ] Falls eingefügt: `window.__db = db;` aus `src/daten/auth.js` entfernen.

---

## Ergebnis festhalten

| Test | bestanden | Bemerkung |
|---|---|---|
| A Kinder sehen nur eigene Daten | | |
| B Kein Zugang zum Lehrerbereich | | |
| C Eigene Klasse verwaltbar | | |
| D Fremde Klasse nur lesend | | |
| E Kein Löschen fremder Daten | | |
| F Administration | | |
| G Deaktiviertes Konto | | |
| H Abmelden | | |

Fällt ein Punkt durch, bitte melden – dann stimmt etwas an den Regeln nicht, und
das muss vor dem Einsatz mit echten Klassen behoben werden.

---

## Ergänzung Etappe 2

### I – Detailauswertung nur für Berechtigte

Als `testkind.a` angemeldet in der Konsole:

```js
const { data, error } = await window.__db.rpc('kind_themen', { p_user: 'FREMDE-ID' });
console.log(data, error);
```

- [ ] Es kommen **keine** Zeilen zurück. (Für die eigene Kennung liefert dieselbe
      Abfrage Daten – das ist beabsichtigt, damit der Schülerbereich funktioniert.)

```js
await window.__db.rpc('klassen_zeitraum', {
  p_klasse: 'IRGENDEINE-KLASSEN-ID',
  p_von: '2000-01-01', p_bis: '2100-01-01', p_thema: null
});
```

- [ ] Leeres Ergebnis für Kinder.

### J – Fortschritt zurücksetzen nur in der eigenen Klasse

Als Lehrperson in der Konsole mit der Kennung eines Kindes aus einer **fremden**
Klasse:

```js
const { error } = await window.__db.rpc('fortschritt_zuruecksetzen', { p_user: 'FREMDE-ID' });
console.log(error);
```

- [ ] Es erscheint der Fehler *Keine Berechtigung für dieses Konto*.
- [ ] Danach in der fremden Klasse prüfen: Die Zahlen des Kindes sind unverändert.

### K – Klasseneinstellungen nur in der eigenen Klasse

```js
const { error } = await window.__db.rpc('klasseneinstellung_setzen', {
  p_klasse: 'FREMDE-KLASSEN-ID', p_ziel: 3, p_zeitmodus: false, p_andere_stufe: false
});
console.log(error);
```

- [ ] Fehlermeldung *Sie betreuen diese Klasse nicht …*

### Ergebnis

| Test | bestanden | Bemerkung |
|---|---|---|
| I Detailauswertung geschützt | | |
| J Zurücksetzen nur eigene Klasse | | |
| K Einstellungen nur eigene Klasse | | |
