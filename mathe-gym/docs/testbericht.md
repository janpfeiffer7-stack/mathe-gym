# Testbericht Mathe Gym

Erstellt am 2026-08-08 durch `npm test`. Dieser Bericht wird bei jedem Lauf neu geschrieben.

## Zusammenfassung

| Kennzahl | Wert |
|---|---|
| Themen | 16 |
| Aufgabentypen | 74 |
| Automatisch erzeugte Testaufgaben | **65'550** |
| Typen mit unabhängiger Nachrechnung | 43 von 74 |
| Offene Befunde | 0 |

## Was geprüft wurde

| Testart | Umfang | Befunde |
|---|---|---|
| Kernfunktionen (Zahlformat, Bruchparser, Prüflogik) | 17 Testgruppen | 0 |
| Zufallsserie (Validierung, Musterlösung, Rekonstruktion) | 33'300 Aufgaben | 0 |
| Unabhängige Nachrechnung aus dem gerenderten Text | 32'250 Aufgaben | 0 |
| Eingaben und Grenzfälle | 14 Testgruppen | 0 |
| Auswertungslogik (Etappe 2) | 18 Prüfungen | 0 |

### Zufallsserie

Für jede erzeugte Aufgabe wird geprüft:

- Sie besteht sämtliche Validierungsregeln (siehe unten).
- Die hinterlegte Lösung wird von der Prüflogik als richtig akzeptiert.
- Sie lässt sich aus den gespeicherten Parametern zeichengenau rekonstruieren (nötig für den Fehlerspeicher).

Geprüfte Validierungsregeln: kaputte Textbausteine, Nenner 0, Zähler 0, nicht gekürzte Sollwerte bei
Kürzungsaufgaben, zu viele Dezimalstellen, Werte ausserhalb der Stufe, doppelte Antwortoptionen nach
Text und nach Wert, mehrere richtige Auswahlantworten, doppelte Werte beim Ordnen, fehlende oder
überzählige Platzhalter, im Aufgabentext sichtbare Lösung sowie typspezifische Entartungen.

### Unabhängige Nachrechnung

Dieser Test benutzt die Lösungsfunktion des Generators **nicht**. Er liest den fertig gerenderten
Aufgabentext, rechnet mit einem eigenen Verfahren nach und vergleicht. Damit wird ein Fehler auch
dann gefunden, wenn Generator und Lösung denselben Denkfehler teilen.

| Aufgabentyp | Art der Nachrechnung |
|---|---|
| `5.1.benennen` | Eindeutigkeit der Antwortoptionen |
| `5.11.durchschnitt` | Mittelwert aus der Zahlenreihe nachgerechnet |
| `5.3.addsub` | Term aus dem Aufgabentext neu berechnet |
| `5.3.mal10` | Term aus dem Aufgabentext neu berechnet |
| `5.5.durchzehner` | Term aus dem Aufgabentext neu berechnet |
| `5.5.kopf` | Term aus dem Aufgabentext neu berechnet |
| `5.5.malzehner` | Term aus dem Aufgabentext neu berechnet |
| `5.5.schriftlich` | Term aus dem Aufgabentext neu berechnet |
| `5.5.verteilung` | Term aus dem Aufgabentext neu berechnet |
| `5.7.begriff` | Eindeutigkeit der Antwortoptionen |
| `5.8.bruchVergleich` | Bruchvergleich nachgerechnet |
| `5.8.ordnen` | Sortierreihenfolge geprüft |
| `5.8.runden` | Rundung nachgerechnet |
| `5.8.teilbar` | Teilbarkeit nachgerechnet |
| `5.9.dezMal` | Term aus dem Aufgabentext neu berechnet |
| `5.9.klammer` | Term aus dem Aufgabentext neu berechnet |
| `6.1.erweitern` | Erweiterung nachgerechnet |
| `6.1.ggT` | ggT per Brute Force nachgerechnet |
| `6.1.gleichwertig` | Eindeutigkeit der Antwortoptionen |
| `6.1.kgV` | kgV per Brute Force nachgerechnet |
| `6.1.kuerzen` | Kürzung auf Wertgleichheit und Teilerfremdheit geprüft |
| `6.1.primzahl` | Primzahl per Probedivision geprüft |
| `6.11.anordnungen` | Fakultät nachgerechnet |
| `6.11.medaillen` | Geordnete Auswahl nachgerechnet |
| `6.3.dezVergleich` | Dezimalvergleich nachgerechnet |
| `6.3.nachbarn` | Nachbarzahlen auf echte Zwischenlage geprüft |
| `6.3.zahlenstrahl` | Position am Zahlenstrahl geprüft |
| `6.4.umgekehrt` | Eindeutigkeit der Antwortoptionen |
| `6.5.addsub` | Term aus dem Aufgabentext neu berechnet |
| `6.5.durch` | Term aus dem Aufgabentext neu berechnet |
| `6.5.mal` | Term aus dem Aufgabentext neu berechnet |
| `6.5.ueberschlag` | Eindeutigkeit der Antwortoptionen |
| `6.5.zehnerMal` | Term aus dem Aufgabentext neu berechnet |
| `6.7.flaeche` | Rechtecksfläche nachgerechnet |
| `6.7.umfang` | Rechtecksumfang nachgerechnet |
| `6.7.volumen` | Quadervolumen nachgerechnet |
| `6.8.primfaktoren` | Eindeutigkeit der Antwortoptionen |
| `6.8.prozentForm` | Eindeutigkeit der Antwortoptionen |
| `6.8.prozentwert` | Prozentwert nachgerechnet |
| `6.9.datenMittelwert` | Mittelwert aus der Zahlenreihe nachgerechnet |
| `6.9.klammer` | Term aus dem Aufgabentext neu berechnet |
| `6.9.operationszeichen` | Mehrdeutigkeit der Operationszeichen ausgeschlossen |
| `6.9.punktVorStrich` | Term aus dem Aufgabentext neu berechnet |

## Abdeckung je Aufgabentyp

| Typ | Thema | erzeugte Aufgaben | unabhängig nachgerechnet |
|---|---|---|---|
| `5.1.anteil` | 5.1 | 450 | — *(nur Validierung)* |
| `5.1.sachanteil` | 5.1 | 450 | — *(nur Validierung)* |
| `5.1.benennen` | 5.1 | 450 | ja |
| `5.1.ganzes` | 5.1 | 450 | — *(nur Validierung)* |
| `5.3.stellenwert` | 5.3 | 450 | — *(nur Validierung)* |
| `5.3.mal10` | 5.3 | 450 | ja |
| `5.3.addsub` | 5.3 | 450 | ja |
| `5.3.folge` | 5.3 | 450 | — *(nur Validierung)* |
| `5.4.satz` | 5.4 | 450 | — *(nur Validierung)* |
| `5.4.tabelle` | 5.4 | 450 | — *(nur Validierung)* |
| `5.4.preis` | 5.4 | 450 | — *(nur Validierung)* |
| `5.5.kopf` | 5.5 | 450 | ja |
| `5.5.malzehner` | 5.5 | 450 | ja |
| `5.5.durchzehner` | 5.5 | 450 | ja |
| `5.5.verteilung` | 5.5 | 450 | ja |
| `5.5.schriftlich` | 5.5 | 450 | ja |
| `5.7.umwandeln` | 5.7 | 450 | — *(nur Validierung)* |
| `5.7.bruchGroesse` | 5.7 | 450 | — *(nur Validierung)* |
| `5.7.begriff` | 5.7 | 450 | ja |
| `5.7.zahlenraetsel` | 5.7 | 450 | — *(nur Validierung)* |
| `5.8.bruchVergleich` | 5.8 | 450 | ja |
| `5.8.bruchAddSub` | 5.8 | 450 | — *(nur Validierung)* |
| `5.8.runden` | 5.8 | 450 | ja |
| `5.8.teilbar` | 5.8 | 450 | ja |
| `5.8.divisionAlsBruch` | 5.8 | 450 | — *(nur Validierung)* |
| `5.8.gemischt` | 5.8 | 450 | — *(nur Validierung)* |
| `5.8.ordnen` | 5.8 | 450 | ja |
| `5.9.klammer` | 5.9 | 450 | ja |
| `5.9.luecke` | 5.9 | 450 | — *(nur Validierung)* |
| `5.9.dezMal` | 5.9 | 450 | ja |
| `5.9.prop` | 5.9 | 450 | — *(nur Validierung)* |
| `5.11.durchschnitt` | 5.11 | 450 | ja |
| `5.11.fehlenderWert` | 5.11 | 450 | — *(nur Validierung)* |
| `5.11.sachaufgabe` | 5.11 | 450 | — *(nur Validierung)* |
| `6.1.ggT` | 6.1 | 450 | ja |
| `6.1.kgV` | 6.1 | 450 | ja |
| `6.1.primzahl` | 6.1 | 450 | ja |
| `6.1.erweitern` | 6.1 | 450 | ja |
| `6.1.kuerzen` | 6.1 | 450 | ja |
| `6.1.gleichwertig` | 6.1 | 450 | ja |
| `6.3.zahlenstrahl` | 6.3 | 450 | ja |
| `6.3.nachbarn` | 6.3 | 450 | ja |
| `6.3.dezZuBruch` | 6.3 | 450 | — *(nur Validierung)* |
| `6.3.bruchZuDez` | 6.3 | 450 | — *(nur Validierung)* |
| `6.3.dezVergleich` | 6.3 | 450 | ja |
| `6.4.prop` | 6.4 | 450 | — *(nur Validierung)* |
| `6.4.geschwindigkeit` | 6.4 | 450 | — *(nur Validierung)* |
| `6.4.umgekehrt` | 6.4 | 450 | ja |
| `6.5.addsub` | 6.5 | 450 | ja |
| `6.5.mal` | 6.5 | 450 | ja |
| `6.5.durch` | 6.5 | 450 | ja |
| `6.5.zehnerMal` | 6.5 | 450 | ja |
| `6.5.ueberschlag` | 6.5 | 450 | ja |
| `6.7.flaeche` | 6.7 | 450 | ja |
| `6.7.umfang` | 6.7 | 450 | ja |
| `6.7.flaechenUmwandeln` | 6.7 | 450 | — *(nur Validierung)* |
| `6.7.volumen` | 6.7 | 450 | ja |
| `6.7.flaecheRueck` | 6.7 | 450 | — *(nur Validierung)* |
| `6.8.prozentwert` | 6.8 | 450 | ja |
| `6.8.prozentForm` | 6.8 | 450 | ja |
| `6.8.ganzes` | 6.8 | 450 | — *(nur Validierung)* |
| `6.8.grosseZahl` | 6.8 | 450 | — *(nur Validierung)* |
| `6.8.primfaktoren` | 6.8 | 450 | ja |
| `6.8.bruchAddVerschieden` | 6.8 | 450 | — *(nur Validierung)* |
| `6.9.punktVorStrich` | 6.9 | 450 | ja |
| `6.9.klammer` | 6.9 | 450 | ja |
| `6.9.operationszeichen` | 6.9 | 450 | ja |
| `6.9.gleichung` | 6.9 | 450 | — *(nur Validierung)* |
| `6.9.datenMittelwert` | 6.9 | 450 | ja |
| `6.11.anordnungen` | 6.11 | 450 | ja |
| `6.11.medaillen` | 6.11 | 450 | ja |
| `6.11.kombinationen` | 6.11 | 450 | — *(nur Validierung)* |
| `6.11.wahrscheinlichkeit` | 6.11 | 450 | — *(nur Validierung)* |
| `6.11.chance` | 6.11 | 450 | — *(nur Validierung)* |

## Befunde

In diesem Lauf wurden keine Abweichungen festgestellt.

## Verbleibende Risiken

Diese Punkte sind **nicht** durch die Tests abgedeckt und bleiben offen:

1. **Kein Test auf echtem Gerät.** Alle Tests laufen in Node. Das Verhalten von Safari auf iPadOS
   (Bildschirmtastatur, Fokusreihenfolge, VoiceOver, Touch-Latenz, Druckausgabe) ist nicht gemessen.
   Bitte die Prüfliste in `docs/ipad-pruefliste.md` einmal auf einem echten iPad durchgehen.
2. **Didaktische Passung nicht prüfbar.** Die Tests belegen mathematische Richtigkeit, nicht, ob eine
   Aufgabe zum Unterrichtsstand passt. Das kann nur eine Lehrperson beurteilen.
3. **31 von 74 Typen ohne unabhängige Nachrechnung.** Bei diesen Typen prüft nur der Validator.
   Ein Denkfehler, der Aufgabe und Lösung gleichermassen betrifft, würde dort nicht auffallen.
   Betroffen sind vor allem Sachaufgaben, deren Text sich nicht zuverlässig maschinell auslesen lässt.
4. **Berechtigungen sind nicht automatisch getestet.** Die Zugriffsregeln liegen in der Datenbank und
   lassen sich ohne laufende Instanz nicht prüfen. Die Handprüfung steht in `docs/rechte-pruefliste.md`.
5. **Textformulierungen ungeprüft.** Verständlichkeit und Rechtschreibung der Aufgabentexte sind
   nicht automatisch geprüft.

Kein Generator wird in diesem Bericht als fehlerfrei bezeichnet. Die Tabelle oben zeigt für jeden Typ,
**wogegen** er geprüft wurde.
