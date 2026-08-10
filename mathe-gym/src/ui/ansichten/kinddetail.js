/* Detailansicht eines Kindes: Themen, Stufen, Verlauf, Tests, offene Fehler. */

import { db } from '../../daten/auth.js';
import { THEMA_NACH_ID } from '../../aufgaben/index.js';
import { STUFE_TEXT, STUFEN } from '../../core/formate.js';

/** Schützt vor eingeschleustem HTML in Benutzernamen. */
function text(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

function datum(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString('de-CH');
}

export async function ladeKindDaten(userId) {
  const [themen, verlauf, tests, fehler] = await Promise.all([
    db.rpc('kind_themen', { p_user: userId }),
    db.rpc('kind_verlauf', { p_user: userId, p_tage: 60 }),
    db.rpc('kind_tests', { p_user: userId }),
    db.rpc('kind_fehlerthemen', { p_user: userId })
  ]);
  const fehlerhaft = [themen, verlauf, tests, fehler].find(x => x.error);
  if (fehlerhaft) throw new Error('Daten konnten nicht geladen werden: ' + fehlerhaft.error.message);

  return {
    themen: themen.data || [],
    verlauf: verlauf.data || [],
    tests: tests.data || [],
    fehler: fehler.data || []
  };
}

/** Balkenverlauf der letzten 60 Tage als schlichtes SVG. */
function verlaufSVG(zeilen) {
  if (zeilen.length === 0) {
    return '<p class="leer">In den letzten 60 Tagen wurde nicht geübt.</p>';
  }
  const heute = new Date();
  const tage = [];
  for (let i = 59; i >= 0; i--) {
    const d = new Date(heute.getTime() - i * 86400000);
    const schluessel = d.toISOString().slice(0, 10);
    const treffer = zeilen.find(z => String(z.tag).slice(0, 10) === schluessel);
    tage.push({
      datum: d,
      bearbeitet: treffer ? Number(treffer.bearbeitet) : 0,
      richtig: treffer ? Number(treffer.richtig) : 0
    });
  }
  const max = Math.max(1, ...tage.map(t => t.bearbeitet));
  const B = 12, L = 4, H = 90;

  const balken = tage.map((t, i) => {
    const x = i * (B + L);
    const hoehe = t.bearbeitet === 0 ? 2 : Math.max(3, Math.round(t.bearbeitet / max * H));
    const hRichtig = t.bearbeitet === 0 ? 0 : Math.round(t.richtig / max * H);
    const titel = t.datum.toLocaleDateString('de-CH') + ': ' + t.bearbeitet +
                  ' Aufgaben, davon ' + t.richtig + ' richtig';
    return '<g><title>' + titel + '</title>' +
      '<rect class="v-gesamt" x="' + x + '" y="' + (H - hoehe) + '" width="' + B + '" height="' + hoehe + '" rx="2"/>' +
      (hRichtig > 0
        ? '<rect class="v-richtig" x="' + x + '" y="' + (H - hRichtig) + '" width="' + B + '" height="' + hRichtig + '" rx="2"/>'
        : '') + '</g>';
  }).join('');

  const breite = tage.length * (B + L);
  return '<div class="verlauf">' +
    '<svg viewBox="0 0 ' + breite + ' ' + (H + 18) + '" role="img" ' +
    'aria-label="Aktivität der letzten 60 Tage, höchstens ' + max + ' Aufgaben pro Tag">' +
    balken +
    '<text class="v-achse" x="0" y="' + (H + 14) + '">vor 60 Tagen</text>' +
    '<text class="v-achse" x="' + breite + '" y="' + (H + 14) + '" text-anchor="end">heute</text>' +
    '</svg>' +
    '<p class="hilfetext">Heller Balken: bearbeitete Aufgaben. Dunkler Anteil: davon richtig. ' +
    'Höchster Tag: ' + max + ' Aufgaben.</p></div>';
}

/** Themenübersicht mit Aufteilung nach Stufe. */
function themenTabelle(zeilen, ziel) {
  if (zeilen.length === 0) return '<p class="leer">Noch keine Themen bearbeitet.</p>';

  const proThema = {};
  zeilen.forEach(z => {
    const e = proThema[z.thema] || (proThema[z.thema] = { bearbeitet: 0, richtig: 0, stufen: {} });
    e.bearbeitet += z.bearbeitet;
    e.richtig += z.richtig;
    e.stufen[z.stufe] = z;
  });

  const sortiert = Object.keys(proThema).sort((a, b) => {
    const qa = proThema[a].bearbeitet ? proThema[a].richtig / proThema[a].bearbeitet : 1;
    const qb = proThema[b].bearbeitet ? proThema[b].richtig / proThema[b].bearbeitet : 1;
    return qa - qb;                                  // schwächste Themen zuoberst
  });

  return '<div class="tabellen-rahmen"><table class="tabelle">' +
    '<thead><tr><th>Thema</th><th class="zahl">bearbeitet</th><th class="zahl">richtig</th>' +
    '<th class="zahl">Quote</th><th>Stufen</th><th class="zahl">Ziel</th></tr></thead><tbody>' +
    sortiert.map(id => {
      const e = proThema[id];
      const t = THEMA_NACH_ID[id];
      const quote = e.bearbeitet ? Math.round(e.richtig / e.bearbeitet * 100) : 0;
      const stufenText = STUFEN
        .filter(st => e.stufen[st])
        .map(st => STUFE_TEXT[st].punkte + ' ' + e.stufen[st].richtig + '/' + e.stufen[st].bearbeitet)
        .join('  ');
      const erreicht = e.richtig >= ziel;
      return '<tr><td>' + (t ? t.nr + ' ' + text(t.titel) : text(id)) + '</td>' +
        '<td class="zahl">' + e.bearbeitet + '</td>' +
        '<td class="zahl">' + e.richtig + '</td>' +
        '<td class="zahl"><strong>' + quote + '%</strong></td>' +
        '<td style="font-family:var(--schrift-zahl);font-size:.85em">' + stufenText + '</td>' +
        '<td class="zahl">' + (erreicht ? '✓' : e.richtig + '/' + ziel) + '</td></tr>';
    }).join('') +
    '</tbody></table></div>';
}

function testTabelle(zeilen) {
  if (zeilen.length === 0) return '<p class="leer">Noch keine Lernstandstests absolviert.</p>';
  return '<div class="tabellen-rahmen"><table class="tabelle">' +
    '<thead><tr><th>Datum</th><th>Stufe</th><th class="zahl">Punkte</th><th class="zahl">Prozent</th>' +
    '<th>Themen mit Fehlern</th></tr></thead><tbody>' +
    zeilen.map(t => {
      const themen = (t.schwache_themen || '').split(', ').filter(Boolean)
        .map(id => THEMA_NACH_ID[id] ? THEMA_NACH_ID[id].nr : id).join(', ');
      return '<tr><td>' + datum(t.erstellt_am) + '</td>' +
        '<td>' + (STUFE_TEXT[t.stufe] ? STUFE_TEXT[t.stufe].name : t.stufe) + '</td>' +
        '<td class="zahl">' + t.punkte + '/' + t.max + '</td>' +
        '<td class="zahl"><strong>' + t.prozent + '%</strong></td>' +
        '<td>' + (themen || '<span class="leer">keine</span>') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
}

function fehlerListe(zeilen) {
  if (zeilen.length === 0) return '<p class="leer">Keine offenen Fehler.</p>';
  return '<div class="abzeichen-reihe">' + zeilen.map(z => {
    const t = THEMA_NACH_ID[z.thema];
    return '<span class="chip">' + (t ? text(t.titel) : text(z.thema)) + ': ' + z.anzahl + '</span>';
  }).join('') + '</div>';
}

/**
 * Zeichnet die Detailansicht.
 * @param wurzel   Element, in das gezeichnet wird
 * @param kind     Zeile aus klassen_uebersicht
 * @param daten    Ergebnis von ladeKindDaten
 * @param optionen { ziel, darfAendern, aufZurueck, aufZuruecksetzen, aufExport }
 */
export function zeichneKindDetail(wurzel, kind, daten, optionen) {
  const q = kind.bearbeitet ? kind.quote : 0;

  wurzel.innerHTML =
    '<div class="knopfzeile filterleiste" style="margin-bottom:var(--a4)">' +
      '<button type="button" class="knopf leise" id="d-zurueck">← Zur Klassenliste</button>' +
      '<button type="button" class="knopf" id="d-export">Diese Auswertung als CSV</button>' +
      '<button type="button" class="knopf" id="d-drucken">Drucken</button>' +
      (optionen.darfAendern
        ? '<button type="button" class="knopf gefahr" id="d-reset">Fortschritt zurücksetzen</button>'
        : '') +
    '</div>' +

    '<section class="karte">' +
      '<h2>' + text(kind.benutzername) +
        (kind.anzeigename ? ' <span style="font-weight:400;color:var(--text-leise)">· ' + text(kind.anzeigename) + '</span>' : '') +
        (kind.aktiv ? '' : ' <span class="chip">deaktiviert</span>') + '</h2>' +
      '<div class="kennzahlen">' +
        kennzahl(kind.bearbeitet, 'Aufgaben gelöst') +
        kennzahl(q + '%', 'davon richtig') +
        kennzahl(kind.offene_fehler, 'offene Fehler') +
        kennzahl(kind.gemeistert, 'verbesserte Fehler') +
        kennzahl(kind.letzter_test != null ? kind.letzter_test + '%' : '–', 'letzter Test') +
        kennzahl(datum(kind.zuletzt_aktiv), 'letzte Aktivität') +
      '</div>' +
    '</section>' +

    '<section class="karte">' +
      '<h2>Aktivität der letzten 60 Tage</h2>' +
      verlaufSVG(daten.verlauf) +
    '</section>' +

    '<section class="karte">' +
      '<h2>Lernstand pro Thema</h2>' +
      '<p class="hilfetext">Sortiert nach der tiefsten Erfolgsquote. Die Stufenspalte zeigt ' +
      'richtig/bearbeitet je Schwierigkeitsstufe.</p>' +
      themenTabelle(daten.themen, optionen.ziel) +
    '</section>' +

    '<section class="karte">' +
      '<h2>Lernstandstests</h2>' +
      testTabelle(daten.tests) +
    '</section>' +

    '<section class="karte">' +
      '<h2>Offene Fehler nach Thema</h2>' +
      '<p class="hilfetext">Diese Aufgaben erscheinen im Modus «Meine Fehler üben». ' +
      'Sie verschwinden erst, wenn sie erneut richtig gelöst wurden.</p>' +
      fehlerListe(daten.fehler) +
    '</section>';

  wurzel.querySelector('#d-zurueck').addEventListener('click', optionen.aufZurueck);
  wurzel.querySelector('#d-drucken').addEventListener('click', () => window.print());
  wurzel.querySelector('#d-export').addEventListener('click', () => optionen.aufExport(kind, daten));
  const reset = wurzel.querySelector('#d-reset');
  if (reset) reset.addEventListener('click', () => optionen.aufZuruecksetzen(kind));
}

function kennzahl(wert, bezeichnung) {
  return '<div class="kennzahl"><div class="wert">' + wert + '</div>' +
         '<div class="bezeichnung">' + bezeichnung + '</div></div>';
}

/** CSV-Zeilen für die Detailauswertung eines Kindes. */
export function detailAlsCSV(kind, daten) {
  const zeilen = [];
  zeilen.push(['Auswertung', kind.benutzername]);
  zeilen.push(['Erstellt', new Date().toLocaleDateString('de-CH')]);
  zeilen.push([]);
  zeilen.push(['Thema', 'Stufe', 'bearbeitet', 'richtig', 'Quote %']);
  daten.themen.forEach(z => {
    const t = THEMA_NACH_ID[z.thema];
    zeilen.push([t ? t.nr + ' ' + t.titel : z.thema, z.stufe, z.bearbeitet, z.richtig, z.quote]);
  });
  zeilen.push([]);
  zeilen.push(['Test vom', 'Stufe', 'Punkte', 'Maximum', 'Prozent']);
  daten.tests.forEach(t => {
    zeilen.push([datum(t.erstellt_am), t.stufe, t.punkte, t.max, t.prozent]);
  });
  return zeilen;
}
