/* Lehrpersonenbereich.

   Eigene Klasse: vollständige Verwaltung.
   Fremde Klassen: ausschliesslich Leseansicht – durchgesetzt in der Datenbank,
   die Oberfläche blendet die Bedienelemente zusätzlich aus. */

import { db, verlangeAnmeldung, abmelden } from './daten/auth.js';
import { THEMA_NACH_ID } from './aufgaben/index.js';
import { themenDerKlasse } from './aufgaben/katalog.js';
import { einstellungenLaden, einstellungenSpeichern, STANDARD } from './daten/einstellungen.js';
import { ladeKindDaten, zeichneKindDetail, detailAlsCSV } from './ui/ansichten/kinddetail.js';
import { STUFE_TEXT } from './core/formate.js';
import { SUPABASE_URL } from './config.js';

const el = (id) => document.getElementById(id);

const ZEITRAEUME = [
  { id: 'alles', name: 'Gesamter Zeitraum', tage: null },
  { id: '7',     name: 'Letzte 7 Tage',     tage: 7 },
  { id: '30',    name: 'Letzte 30 Tage',    tage: 30 },
  { id: '90',    name: 'Letzte 90 Tage',    tage: 90 }
];

const zustand = {
  profil: null,
  klassen: [],
  betreute: new Set(),
  aktuelleKlasse: null,
  einstellungen: { ...STANDARD },
  kinder: [],
  themenZeilen: [],
  stufenZeilen: [],
  zeitraum: 'alles',
  themaFilter: '',
  suchtext: '',
  detailKind: null
};

/* ---------------- Start ---------------- */
async function start() {
  const p = await verlangeAnmeldung(['lehrperson', 'admin']);
  if (!p) return;
  zustand.profil = p;
  el('lp-name').textContent = p.anzeigename || p.benutzername;
  el('druck-datum').textContent = new Date().toLocaleDateString('de-CH');

  el('knopf-abmelden').addEventListener('click', async () => {
    await abmelden();
    window.location.href = 'index.html';
  });
  el('knopf-drucken').addEventListener('click', () => window.print());
  el('knopf-export').addEventListener('click', klassenExport);
  el('knopf-neues-konto').addEventListener('click', neuesKontoFormular);
  el('knopf-einstellungen').addEventListener('click', einstellungenFormular);

  el('suche').addEventListener('input', (e) => {
    zustand.suchtext = e.target.value.trim().toLowerCase();
    zeichneKinder();
  });
  el('zeitraumwahl').innerHTML = ZEITRAEUME.map(z =>
    '<option value="' + z.id + '">' + z.name + '</option>').join('');
  el('zeitraumwahl').addEventListener('change', (e) => {
    zustand.zeitraum = e.target.value;
    klasseLaden();
  });
  el('themawahl').addEventListener('change', (e) => {
    zustand.themaFilter = e.target.value;
    klasseLaden();
  });

  el('abfrage-abbrechen').addEventListener('click', abfrageSchliessen);
  el('abfrage-hg').addEventListener('click', (e) => { if (e.target === el('abfrage-hg')) abfrageSchliessen(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') abfrageSchliessen(); });

  await klassenLaden();
}

async function klassenLaden() {
  const [{ data: klassen, error: kf }, { data: zuordnung }] = await Promise.all([
    db.from('klassen').select('id, name, code, stufe, schuljahr').order('name'),
    db.from('klassen_lehrpersonen').select('klasse_id').eq('lehrperson_id', zustand.profil.id)
  ]);
  if (kf) { meldung('Klassen konnten nicht geladen werden: ' + kf.message); return; }

  zustand.klassen = klassen || [];
  zustand.betreute = new Set((zuordnung || []).map(z => z.klasse_id));
  if (zustand.profil.rolle === 'admin') zustand.klassen.forEach(k => zustand.betreute.add(k.id));

  const eigene = zustand.profil.klasse_id || (zustand.klassen[0] && zustand.klassen[0].id);
  zustand.aktuelleKlasse = eigene;

  el('klassenwahl').innerHTML = zustand.klassen.map(k =>
    '<option value="' + k.id + '"' + (k.id === eigene ? ' selected' : '') + '>' +
    k.name + ' (' + k.stufe + '. Klasse)' + (zustand.betreute.has(k.id) ? '' : ' – nur Ansicht') +
    '</option>').join('');
  el('klassenwahl').addEventListener('change', (e) => {
    zustand.aktuelleKlasse = e.target.value;
    zustand.themaFilter = '';
    klasseLaden();
  });

  await klasseLaden();
}

function darfAendern() {
  return zustand.betreute.has(zustand.aktuelleKlasse);
}

function aktuelleKlasseObjekt() {
  return zustand.klassen.find(k => k.id === zustand.aktuelleKlasse) || null;
}

function zeitfenster() {
  const z = ZEITRAEUME.find(x => x.id === zustand.zeitraum) || ZEITRAEUME[0];
  const bis = new Date(Date.now() + 86400000);
  const von = z.tage ? new Date(Date.now() - z.tage * 86400000) : new Date('2000-01-01');
  return { von: von.toISOString(), bis: bis.toISOString(), name: z.name, gefiltert: !!z.tage };
}

/* ---------------- Klasse laden ---------------- */
async function klasseLaden() {
  zeigeAnsicht('klasse');

  const darf = darfAendern();
  el('nur-lesen-hinweis').style.display = darf ? 'none' : 'flex';
  el('knopf-neues-konto').style.display = darf ? '' : 'none';
  el('knopf-einstellungen').style.display = darf ? '' : 'none';

  const klasse = aktuelleKlasseObjekt();
  document.body.setAttribute('data-klasse', klasse ? klasse.stufe : '5');

  /* Themenfilter passend zur Klassenstufe */
  const themen = themenDerKlasse(klasse ? klasse.stufe : '5');
  el('themawahl').innerHTML = '<option value="">Alle Themen</option>' +
    themen.map(t => '<option value="' + t.id + '"' +
      (t.id === zustand.themaFilter ? ' selected' : '') + '>' + t.nr + ' ' + t.titel + '</option>').join('');

  const f = zeitfenster();
  el('zeitraum-anzeige').textContent = f.name +
    (zustand.themaFilter && THEMA_NACH_ID[zustand.themaFilter]
      ? ' · nur ' + THEMA_NACH_ID[zustand.themaFilter].titel : '');

  zustand.einstellungen = await einstellungenLaden(zustand.aktuelleKlasse);

  try {
    if (f.gefiltert || zustand.themaFilter) {
      /* Gefilterte Ansicht: Zahlen aus den Einzelversuchen */
      const [kinder, themenZeilen, stufenZeilen, gesamt] = await Promise.all([
        db.rpc('klassen_zeitraum', { p_klasse: zustand.aktuelleKlasse, p_von: f.von, p_bis: f.bis,
                                     p_thema: zustand.themaFilter || null }),
        db.rpc('klassen_themen_zeitraum', { p_klasse: zustand.aktuelleKlasse, p_von: f.von, p_bis: f.bis }),
        db.rpc('klassen_stufen', { p_klasse: zustand.aktuelleKlasse, p_von: f.von, p_bis: f.bis }),
        db.rpc('klassen_uebersicht', { p_klasse: zustand.aktuelleKlasse })
      ]);
      const fehler = [kinder, themenZeilen, stufenZeilen, gesamt].find(x => x.error);
      if (fehler) throw new Error(fehler.error.message);

      /* Stammdaten aus der Gesamtübersicht ergänzen (offene Fehler, letzter Test) */
      const stamm = {};
      (gesamt.data || []).forEach(k => { stamm[k.user_id] = k; });
      zustand.kinder = (kinder.data || []).map(k => ({
        ...k,
        bearbeitet: Number(k.bearbeitet),
        richtig: Number(k.richtig),
        offene_fehler: stamm[k.user_id] ? stamm[k.user_id].offene_fehler : 0,
        gemeistert: stamm[k.user_id] ? stamm[k.user_id].gemeistert : 0,
        letzter_test: stamm[k.user_id] ? stamm[k.user_id].letzter_test : null,
        anzeigename: stamm[k.user_id] ? stamm[k.user_id].anzeigename : null
      }));
      zustand.themenZeilen = themenZeilen.data || [];
      zustand.stufenZeilen = stufenZeilen.data || [];
    } else {
      const [kinder, themenZeilen, stufenZeilen] = await Promise.all([
        db.rpc('klassen_uebersicht', { p_klasse: zustand.aktuelleKlasse }),
        db.rpc('klassen_themen', { p_klasse: zustand.aktuelleKlasse }),
        db.rpc('klassen_stufen', { p_klasse: zustand.aktuelleKlasse, p_von: f.von, p_bis: f.bis })
      ]);
      const fehler = [kinder, themenZeilen, stufenZeilen].find(x => x.error);
      if (fehler) throw new Error(fehler.error.message);
      zustand.kinder = kinder.data || [];
      zustand.themenZeilen = themenZeilen.data || [];
      zustand.stufenZeilen = stufenZeilen.data || [];
    }
  } catch (e) {
    meldung('Daten konnten nicht geladen werden: ' + e.message);
    return;
  }

  el('meldung').style.display = 'none';
  zeichneKennzahlen();
  zeichneStufen();
  zeichneThemen();
  zeichneKinder();
}

/* ---------------- Überblick ---------------- */
function zeichneKennzahlen() {
  const k = zustand.kinder;
  const aktive = k.filter(x => x.aktiv);
  const mitDaten = k.filter(x => Number(x.bearbeitet) > 0);
  const quote = mitDaten.length
    ? Math.round(mitDaten.reduce((s, x) => s + x.quote, 0) / mitDaten.length) : 0;
  const grenze = Date.now() - 14 * 86400000;
  const still = k.filter(x => !x.zuletzt_aktiv || new Date(x.zuletzt_aktiv).getTime() < grenze).length;
  const ohneUebung = k.filter(x => Number(x.bearbeitet) === 0).length;

  el('lp-kennzahlen').innerHTML =
    kennzahl(aktive.length, 'aktive Konten') +
    kennzahl(quote + '%', 'Erfolgsquote im Schnitt') +
    kennzahl(k.reduce((s, x) => s + Number(x.bearbeitet), 0), 'gelöste Aufgaben') +
    kennzahl(ohneUebung, 'ohne Übung im Zeitraum') +
    kennzahl(still, 'seit 14 Tagen inaktiv');
}

function kennzahl(wert, bezeichnung) {
  return '<div class="kennzahl"><div class="wert">' + wert + '</div>' +
         '<div class="bezeichnung">' + bezeichnung + '</div></div>';
}

function zeichneStufen() {
  const z = zustand.stufenZeilen;
  if (z.length === 0) { el('stufen-verteilung').innerHTML = '<p class="leer">Keine Daten im Zeitraum.</p>'; return; }
  const gesamt = z.reduce((s, x) => s + Number(x.bearbeitet), 0) || 1;
  el('stufen-verteilung').innerHTML = z.map(x => {
    const anteil = Math.round(Number(x.bearbeitet) / gesamt * 100);
    const name = STUFE_TEXT[x.stufe] ? STUFE_TEXT[x.stufe].punkte + ' ' + STUFE_TEXT[x.stufe].name : x.stufe;
    return '<div style="margin-bottom:var(--a2)">' +
      '<div style="display:flex;gap:var(--a3);align-items:center">' +
      '<span style="min-width:150px;font-weight:600">' + name + '</span>' +
      '<span class="balken" style="flex:1"><span style="width:' + anteil + '%"></span></span>' +
      '<span class="balken-text">' + anteil + '% · ' + x.quote + '% richtig</span></div></div>';
  }).join('');
}

/* ---------------- Themen ---------------- */
function zeichneThemen() {
  const koerper = el('tabelle-themen').querySelector('tbody');
  if (zustand.themenZeilen.length === 0) {
    koerper.innerHTML = '<tr><td colspan="5" class="leer">Keine Daten im gewählten Zeitraum.</td></tr>';
    return;
  }
  koerper.innerHTML = zustand.themenZeilen.map(z => {
    const t = THEMA_NACH_ID[z.thema];
    const schwach = z.quote < 60 && Number(z.bearbeitet) >= 10;
    return '<tr' + (schwach ? ' style="background:var(--offen-flaeche)"' : '') + '>' +
      '<td>' + (t ? t.nr + ' ' + sicher(t.titel) : sicher(z.thema)) + '</td>' +
      '<td class="zahl">' + z.bearbeitet + '</td>' +
      '<td class="zahl">' + z.richtig + '</td>' +
      '<td class="zahl"><strong>' + z.quote + '%</strong></td>' +
      '<td class="zahl">' + z.kinder + '</td></tr>';
  }).join('');
}

/* ---------------- Kinderliste ---------------- */
function zeichneKinder() {
  const koerper = el('tabelle-kinder').querySelector('tbody');
  const darf = darfAendern();
  const liste = zustand.kinder.filter(k =>
    !zustand.suchtext || k.benutzername.toLowerCase().includes(zustand.suchtext));

  if (liste.length === 0) {
    koerper.innerHTML = '<tr><td colspan="8" class="leer">Keine Konten gefunden.</td></tr>';
    return;
  }

  koerper.innerHTML = liste.map(k =>
    '<tr' + (k.aktiv ? '' : ' style="opacity:.55"') + '>' +
    '<td><button type="button" class="namensknopf" data-detail="' + k.user_id + '">' +
      sicher(k.benutzername) + '</button>' +
      (k.aktiv ? '' : ' <span class="chip">deaktiviert</span>') + '</td>' +
    '<td>' + datumAnzeige(k.zuletzt_aktiv) + '</td>' +
    '<td class="zahl">' + k.bearbeitet + '</td>' +
    '<td class="zahl">' + (Number(k.bearbeitet) ? k.quote + '%' : '–') + '</td>' +
    '<td class="zahl">' + (k.offene_fehler ?? 0) + '</td>' +
    '<td class="zahl">' + (k.gemeistert ?? 0) + '</td>' +
    '<td class="zahl">' + (k.letzter_test != null ? k.letzter_test + '%' : '–') + '</td>' +
    '<td>' + (darf
      ? '<div class="knopfzeile">' +
        '<button type="button" class="knopf" data-aktion="passwort" data-id="' + k.user_id + '">Passwort</button>' +
        '<button type="button" class="knopf" data-aktion="umbenennen" data-id="' + k.user_id + '">Umbenennen</button>' +
        '<button type="button" class="knopf" data-aktion="aktiv" data-id="' + k.user_id + '" data-aktiv="' + k.aktiv + '">' +
          (k.aktiv ? 'Deaktivieren' : 'Aktivieren') + '</button>' +
        '<button type="button" class="knopf gefahr" data-aktion="loeschen" data-id="' + k.user_id + '">Löschen</button>' +
        '</div>'
      : '<span class="leer">nur Ansicht</span>') +
    '</td></tr>'
  ).join('');

  koerper.querySelectorAll('[data-detail]').forEach(b =>
    b.addEventListener('click', () => detailOeffnen(b.dataset.detail)));
  koerper.querySelectorAll('[data-aktion]').forEach(b =>
    b.addEventListener('click', () => aktion(b.dataset.aktion, b.dataset.id, b.dataset)));
}

function sicher(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

function datumAnzeige(iso) {
  if (!iso) return '<span class="leer">noch nie</span>';
  const d = new Date(iso);
  const tage = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (tage === 0) return 'heute';
  if (tage === 1) return 'gestern';
  const anzeige = d.toLocaleDateString('de-CH');
  return tage > 14 ? '<strong>' + anzeige + '</strong>' : anzeige;
}

/* ---------------- Ansicht umschalten ---------------- */
function zeigeAnsicht(name) {
  el('ansicht-klasse').classList.toggle('aktiv', name === 'klasse');
  el('ansicht-detail').classList.toggle('aktiv', name === 'detail');
  el('filterleiste-klasse').style.display = name === 'klasse' ? '' : 'none';
  window.scrollTo(0, 0);
}

/* ---------------- Detailansicht ---------------- */
async function detailOeffnen(userId) {
  const kind = zustand.kinder.find(k => k.user_id === userId);
  if (!kind) return;
  zustand.detailKind = kind;

  el('detail-bereich').innerHTML = '<div class="laedt"><span class="spinner"></span>Daten werden geladen …</div>';
  zeigeAnsicht('detail');

  try {
    const daten = await ladeKindDaten(userId);
    zeichneKindDetail(el('detail-bereich'), kind, daten, {
      ziel: zustand.einstellungen.ziel_pro_thema || 10,
      darfAendern: darfAendern(),
      aufZurueck: () => { zeigeAnsicht('klasse'); },
      aufZuruecksetzen: fortschrittZuruecksetzen,
      aufExport: detailExport
    });
  } catch (e) {
    el('detail-bereich').innerHTML =
      '<div class="meldung fehler">' + sicher(e.message) + '</div>' +
      '<button type="button" class="knopf" id="d-zurueck2">← Zur Klassenliste</button>';
    el('d-zurueck2').addEventListener('click', () => zeigeAnsicht('klasse'));
  }
}

function fortschrittZuruecksetzen(kind) {
  abfrage('Fortschritt zurücksetzen',
    '<p>Alle Lernstandsdaten von <strong>' + sicher(kind.benutzername) + '</strong> werden gelöscht: ' +
    'bearbeitete Aufgaben, Fortschritt pro Thema, offene Fehler, Testergebnisse, Punkte und Abzeichen.</p>' +
    '<p>Das Konto selbst und das Passwort bleiben bestehen. Der Vorgang lässt sich nicht rückgängig machen.</p>' +
    '<div class="feldgruppe"><label for="a-best2">Tippen Sie zur Bestätigung den Benutzernamen ein</label>' +
    '<input type="text" id="a-best2" autocomplete="off" autocapitalize="none"></div>',
    async () => {
      const eingabe = ((document.getElementById('a-best2') || {}).value || '').trim().toLowerCase();
      if (eingabe !== kind.benutzername.toLowerCase()) throw new Error('Der Benutzername stimmt nicht überein.');
      const { error } = await db.rpc('fortschritt_zuruecksetzen', { p_user: kind.user_id });
      if (error) throw new Error(error.message);
      streifen('Fortschritt zurückgesetzt.');
      await klasseLaden();
    });
}

/* ---------------- Klasseneinstellungen ---------------- */
function einstellungenFormular() {
  const e = zustand.einstellungen;
  const klasse = aktuelleKlasseObjekt();
  abfrage('Einstellungen für ' + (klasse ? klasse.name : 'die Klasse'),
    '<div class="feldgruppe"><label for="e-ziel">Ziel pro Thema (richtige Aufgaben)</label>' +
    '<input type="text" id="e-ziel" inputmode="numeric" value="' + (e.ziel_pro_thema || 10) + '"></div>' +
    '<p class="hilfetext">Ab dieser Anzahl gilt ein Thema für das Kind als abgeschlossen. Erlaubt: 3 bis 50.</p>' +
    '<div class="feldgruppe"><label><input type="checkbox" id="e-zeit" style="width:auto;min-height:0;margin-right:8px"' +
    (e.zeitmodus_erlaubt ? ' checked' : '') + '> Anzeige der Übungsdauer erlauben</label></div>' +
    '<div class="feldgruppe"><label><input type="checkbox" id="e-stufe" style="width:auto;min-height:0;margin-right:8px"' +
    (e.andere_stufe_erlaubt ? ' checked' : '') + '> Themen der anderen Klassenstufe erlauben</label></div>' +
    '<p class="hilfetext">Die Übungsdauer ist nur eine Anzeige ohne Zeitdruck. Die andere Klassenstufe ' +
    'ermöglicht Wiederholung und Förderung.</p>',
    async () => {
      const ziel = parseInt((document.getElementById('e-ziel') || {}).value, 10);
      if (isNaN(ziel) || ziel < 3 || ziel > 50) throw new Error('Die Zielmarke muss zwischen 3 und 50 liegen.');
      await einstellungenSpeichern(zustand.aktuelleKlasse, {
        ziel_pro_thema: ziel,
        zeitmodus_erlaubt: !!(document.getElementById('e-zeit') || {}).checked,
        andere_stufe_erlaubt: !!(document.getElementById('e-stufe') || {}).checked
      });
      streifen('Einstellungen gespeichert.');
      await klasseLaden();
    });
}

/* ---------------- Kontoverwaltung ---------------- */
async function verwaltung(nutzlast) {
  const { data: sitzung } = await db.auth.getSession();
  if (!sitzung || !sitzung.session) throw new Error('Nicht angemeldet.');

  const antwort = await fetch(SUPABASE_URL + '/functions/v1/verwaltung', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + sitzung.session.access_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nutzlast)
  });
  const daten = await antwort.json().catch(() => ({}));
  if (!antwort.ok || daten.fehler) throw new Error(daten.fehler || 'Die Aktion ist fehlgeschlagen.');
  return daten;
}

function aktion(art, id, daten) {
  const kind = zustand.kinder.find(k => k.user_id === id);
  if (!kind) return;

  if (art === 'passwort') {
    abfrage('Neues Passwort für ' + kind.benutzername,
      '<p>Das Konto erhält ein neues Passwort. Das alte gilt danach nicht mehr.</p>' +
      '<div class="feldgruppe"><label for="a-pw">Neues Passwort (leer lassen für einen Vorschlag)</label>' +
      '<input type="text" id="a-pw" autocomplete="off"></div>',
      async () => {
        const pw = (document.getElementById('a-pw') || {}).value || '';
        const e = await verwaltung({ aktion: 'passwort_zuruecksetzen', user_id: id, passwort: pw });
        zeigePasswort(kind.benutzername, e.passwort);
      });
    return;
  }

  if (art === 'umbenennen') {
    abfrage('Benutzername ändern',
      '<div class="feldgruppe"><label for="a-name">Neuer Benutzername</label>' +
      '<input type="text" id="a-name" value="' + sicher(kind.benutzername) + '" autocapitalize="none" autocomplete="off"></div>' +
      '<p class="hilfetext">Erlaubt sind Kleinbuchstaben, Ziffern, Punkt, Bindestrich und Unterstrich. ' +
      'Der Lernstand bleibt erhalten.</p>',
      async () => {
        const neu = (document.getElementById('a-name') || {}).value || '';
        await verwaltung({ aktion: 'benutzername_aendern', user_id: id, benutzername: neu });
        streifen('Benutzername geändert.');
        await klasseLaden();
      });
    return;
  }

  if (art === 'aktiv') {
    const aktivieren = daten.aktiv !== 'true';
    abfrage(aktivieren ? 'Konto aktivieren' : 'Konto deaktivieren',
      '<p>' + (aktivieren
        ? 'Das Kind kann sich danach wieder anmelden.'
        : 'Das Kind kann sich danach nicht mehr anmelden. Alle Daten bleiben erhalten.') + '</p>',
      async () => {
        await verwaltung({ aktion: 'konto_aktiv_setzen', user_id: id, aktiv: aktivieren });
        streifen(aktivieren ? 'Konto aktiviert.' : 'Konto deaktiviert.');
        await klasseLaden();
      });
    return;
  }

  if (art === 'loeschen') {
    abfrage('Konto endgültig löschen',
      '<p>Das Konto <strong>' + sicher(kind.benutzername) + '</strong> und alle zugehörigen ' +
      'Lernstandsdaten werden gelöscht. Das kann nicht rückgängig gemacht werden.</p>' +
      '<div class="feldgruppe"><label for="a-best">Tippen Sie zur Bestätigung den Benutzernamen ein</label>' +
      '<input type="text" id="a-best" autocomplete="off" autocapitalize="none"></div>',
      async () => {
        const eingabe = ((document.getElementById('a-best') || {}).value || '').trim().toLowerCase();
        if (eingabe !== kind.benutzername.toLowerCase()) throw new Error('Der Benutzername stimmt nicht überein.');
        await verwaltung({ aktion: 'konto_loeschen', user_id: id });
        streifen('Konto gelöscht.');
        await klasseLaden();
      });
  }
}

function neuesKontoFormular() {
  const klasse = aktuelleKlasseObjekt();
  abfrage('Neues Schülerkonto in ' + (klasse ? klasse.name : ''),
    '<div class="feldgruppe"><label for="a-benutzer">Benutzername</label>' +
    '<input type="text" id="a-benutzer" placeholder="z. B. anna.m.5a" autocapitalize="none" autocomplete="off"></div>' +
    '<div class="feldgruppe"><label for="a-anzeige">Vorname (freiwillig)</label>' +
    '<input type="text" id="a-anzeige" autocomplete="off"></div>' +
    '<div class="feldgruppe"><label for="a-pw2">Passwort (leer lassen für einen Vorschlag)</label>' +
    '<input type="text" id="a-pw2" autocomplete="off"></div>' +
    '<p class="hilfetext">Es werden keine Nachnamen gespeichert.</p>',
    async () => {
      const benutzer = ((document.getElementById('a-benutzer') || {}).value || '').trim();
      const anzeige = ((document.getElementById('a-anzeige') || {}).value || '').trim();
      const pw = (document.getElementById('a-pw2') || {}).value || '';
      if (!benutzer) throw new Error('Bitte einen Benutzernamen eingeben.');
      const e = await verwaltung({
        aktion: 'konto_anlegen', benutzername: benutzer, anzeigename: anzeige,
        klasse_id: zustand.aktuelleKlasse, passwort: pw
      });
      zeigePasswort(e.benutzername, e.passwort, e.klassencode);
      await klasseLaden();
    });
}

function zeigePasswort(benutzername, passwort, klassencode) {
  el('abfrage-titel').textContent = 'Zugangsdaten notieren';
  el('abfrage-inhalt').innerHTML =
    '<div class="meldung gut"><div>' +
    (klassencode ? '<div><strong>Klasse:</strong> ' + sicher(klassencode) + '</div>' : '') +
    '<div><strong>Benutzername:</strong> ' + sicher(benutzername) + '</div>' +
    '<div><strong>Passwort:</strong> <span style="font-family:var(--schrift-zahl);font-size:1.15rem">' +
    sicher(passwort) + '</span></div></div></div>' +
    '<p class="hilfetext">Notieren Sie das Passwort jetzt. Es lässt sich später nicht mehr anzeigen, ' +
    'sondern nur neu setzen.</p>';
  el('abfrage-ok').textContent = 'Notiert';
  el('abfrage-ok').onclick = abfrageSchliessen;
  el('abfrage-abbrechen').style.display = 'none';
  el('abfrage-hg').classList.add('offen');
}

/* ---------------- Abfrage-Fenster ---------------- */
function abfrage(titel, inhaltHTML, beiOk) {
  el('abfrage-titel').textContent = titel;
  el('abfrage-inhalt').innerHTML = inhaltHTML;
  el('abfrage-ok').textContent = 'Bestätigen';
  el('abfrage-ok').disabled = false;
  el('abfrage-abbrechen').style.display = '';
  el('abfrage-hg').classList.add('offen');

  el('abfrage-ok').onclick = async () => {
    el('abfrage-ok').disabled = true;
    el('abfrage-ok').textContent = 'Einen Moment …';
    try {
      await beiOk();
      abfrageSchliessen();
    } catch (e) {
      const alt = el('abfrage-inhalt').querySelector('.meldung.fehler');
      if (alt) alt.remove();
      const m = document.createElement('div');
      m.className = 'meldung fehler';
      m.textContent = e.message;
      el('abfrage-inhalt').appendChild(m);
      el('abfrage-ok').disabled = false;
      el('abfrage-ok').textContent = 'Bestätigen';
    }
  };
}

function abfrageSchliessen() {
  el('abfrage-hg').classList.remove('offen');
  el('abfrage-ok').onclick = null;
}

/* ---------------- Export ---------------- */
function csvHerunterladen(zeilen, dateiname) {
  const csv = zeilen
    .map(z => z.map(f => '"' + String(f ?? '').replace(/"/g, '""') + '"').join(';'))
    .join('\r\n');
  // Byte-Order-Mark, damit Excel die Umlaute korrekt anzeigt
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = dateiname;
  a.click();
  URL.revokeObjectURL(a.href);
}

function klassenExport() {
  const klasse = aktuelleKlasseObjekt();
  const f = zeitfenster();
  const zeilen = [];
  zeilen.push(['Mathe Gym – Klassenauswertung']);
  zeilen.push(['Klasse', klasse ? klasse.name : '']);
  zeilen.push(['Zeitraum', f.name]);
  zeilen.push(['Themenfilter', zustand.themaFilter && THEMA_NACH_ID[zustand.themaFilter]
    ? THEMA_NACH_ID[zustand.themaFilter].titel : 'alle']);
  zeilen.push(['Erstellt', new Date().toLocaleDateString('de-CH')]);
  zeilen.push([]);
  zeilen.push(['Benutzername', 'Aktiv', 'Letzte Aktivitaet', 'Aufgaben', 'Richtig', 'Quote %',
               'Offene Fehler', 'Verbesserte Fehler', 'Letzter Test %']);
  zustand.kinder.forEach(k => zeilen.push([
    k.benutzername, k.aktiv ? 'ja' : 'nein',
    k.zuletzt_aktiv ? new Date(k.zuletzt_aktiv).toLocaleDateString('de-CH') : '',
    k.bearbeitet, k.richtig, k.quote, k.offene_fehler ?? 0, k.gemeistert ?? 0,
    k.letzter_test != null ? k.letzter_test : ''
  ]));
  zeilen.push([]);
  zeilen.push(['Thema', 'bearbeitet', 'richtig', 'Quote %', 'Kinder']);
  zustand.themenZeilen.forEach(z => {
    const t = THEMA_NACH_ID[z.thema];
    zeilen.push([t ? t.nr + ' ' + t.titel : z.thema, z.bearbeitet, z.richtig, z.quote, z.kinder]);
  });

  csvHerunterladen(zeilen, 'mathe-gym-' + (klasse ? klasse.name : 'klasse') + '-' +
    new Date().toISOString().slice(0, 10) + '.csv');
}

function detailExport(kind, daten) {
  csvHerunterladen(detailAlsCSV(kind, daten),
    'mathe-gym-' + kind.benutzername + '-' + new Date().toISOString().slice(0, 10) + '.csv');
}

/* ---------------- Hilfsanzeigen ---------------- */
let streifenZeit = null;
function streifen(t) {
  const s = el('streifen');
  s.textContent = t;
  s.classList.add('sichtbar');
  clearTimeout(streifenZeit);
  streifenZeit = setTimeout(() => s.classList.remove('sichtbar'), 3200);
}

function meldung(t) {
  const m = el('meldung');
  m.textContent = t;
  m.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', start);
