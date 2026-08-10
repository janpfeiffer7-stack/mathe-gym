/* Schülerbereich: Startseite, Themenübersicht, Training, Testergebnis. */

import { verlangeAnmeldung, abmelden, aktivitaetMelden } from './daten/auth.js';
import { uebersicht, fortschrittProThema, fehlerHolen, nachsendenEinrichten, warteschlangeStand,
         versuchBuchen, testBuchen, abzeichenSetzen } from './daten/lernstand.js';
import { THEMEN, THEMA_NACH_ID } from './aufgaben/index.js';
import { themenDerKlasse } from './aufgaben/katalog.js';
import { starteTraining } from './ui/ansichten/training.js';
import { symbol } from './ui/komponenten/symbole.js';
import { T } from './ui/texte.js';
import { STUFE_TEXT, STUFEN } from './core/formate.js';
import { einstellungenLaden, STANDARD } from './daten/einstellungen.js';

const el = (id) => document.getElementById(id);

const zustand = {
  profil: null,
  daten: null,
  stufe: localStorage.getItem('mathegym-stufe') || 'standard',
  laufendesTraining: null,
  einstellungen: { ...STANDARD },
  zeitmodus: localStorage.getItem('mathegym-zeitmodus') === 'an',
  andereStufe: false            // Themen der anderen Klassenstufe anzeigen
};

/* ---------------- Start ---------------- */
async function start() {
  const p = await verlangeAnmeldung(['schueler']);
  if (!p) return;
  zustand.profil = p;

  document.body.setAttribute('data-klasse', p.klassen ? p.klassen.stufe : '5');
  el('benutzer-name').textContent = p.anzeigename || p.benutzername;
  el('benutzer-klasse').textContent = p.klassen ? p.klassen.name : '';

  el('knopf-abmelden').addEventListener('click', async () => {
    await abmelden();
    window.location.href = 'index.html';
  });

  nachsendenEinrichten((e) => {
    if (e.gesendet > 0) streifen(e.gesendet + ' gespeicherte Antworten wurden übertragen.');
  });

  aktivitaetMelden();
  zustand.einstellungen = await einstellungenLaden(p.klasse_id);
  if (!zustand.einstellungen.zeitmodus_erlaubt) zustand.zeitmodus = false;
  await datenLaden();
  zeigeStart();
}

async function datenLaden() {
  try {
    zustand.daten = await uebersicht();
  } catch (e) {
    meldung(T.fehlermeldungen.ladefehler);
    zustand.daten = { stand: {}, fortschritt: [], offeneFehler: 0, tests: [], abzeichen: [] };
  }
}

/* ---------------- Ansichten umschalten ---------------- */
function zeige(name) {
  ['start', 'themen', 'training', 'ergebnis'].forEach(a => {
    el('ansicht-' + a).classList.toggle('aktiv', a === name);
  });
  window.scrollTo(0, 0);
}

/* ---------------- Startseite ---------------- */
function zeigeStart() {
  if (zustand.laufendesTraining) { zustand.laufendesTraining.stoppen(); zustand.laufendesTraining = null; }

  const d = zustand.daten;
  const stand = d.stand || {};
  const quote = stand.bearbeitet ? Math.round(stand.richtig / stand.bearbeitet * 100) : 0;

  el('kennzahlen').innerHTML =
    kennzahl(stand.bearbeitet || 0, 'Aufgaben gelöst') +
    kennzahl(quote + '%', 'davon richtig') +
    kennzahl(stand.serie || 0, 'richtige in Folge') +
    kennzahl(d.offeneFehler || 0, 'Fehler zum Üben');

  /* Stufenwahl */
  el('stufenwahl').innerHTML = STUFEN.map(st =>
    '<button type="button" class="knopf' + (st === zustand.stufe ? ' haupt' : '') + '" data-stufe="' + st + '">' +
    STUFE_TEXT[st].punkte + ' ' + STUFE_TEXT[st].name + '</button>'
  ).join('');
  el('stufenwahl').querySelectorAll('[data-stufe]').forEach(b =>
    b.addEventListener('click', () => {
      zustand.stufe = b.dataset.stufe;
      localStorage.setItem('mathegym-stufe', zustand.stufe);
      zeigeStart();
    })
  );
  el('stufen-erklaerung').textContent = STUFE_TEXT[zustand.stufe].beschr;

  /* Zeitmodus: freiwillig, standardmässig aus, nur eine Anzeige der Übungsdauer */
  const zm = el('zeitmodus-zeile');
  if (zustand.einstellungen.zeitmodus_erlaubt) {
    zm.hidden = false;
    zm.innerHTML =
      '<button type="button" class="knopf" id="knopf-zeitmodus" aria-pressed="' + zustand.zeitmodus + '">' +
      'Übungsdauer anzeigen: <strong>' + (zustand.zeitmodus ? 'ein' : 'aus') + '</strong></button>' +
      '<span class="hilfetext">Nur eine Anzeige. Es gibt keinen Zeitdruck und keine Auswirkung auf die Bewertung.</span>';
    el('knopf-zeitmodus').addEventListener('click', () => {
      zustand.zeitmodus = !zustand.zeitmodus;
      localStorage.setItem('mathegym-zeitmodus', zustand.zeitmodus ? 'an' : 'aus');
      zeigeStart();
    });
  } else {
    zm.hidden = true;
  }

  /* Modi */
  const modi = ['thema', 'gemischt', 'schnell', 'fehler', 'test', 'herausforderung'];
  el('modi').innerHTML = modi.map(m => {
    const info = T.modi[m];
    const zusatz = m === 'fehler'
      ? (d.offeneFehler ? d.offeneFehler + ' Aufgaben warten' : 'Keine offenen Fehler')
      : info.zusatz;
    return '<button type="button" class="modus" data-modus="' + m + '">' +
      symbol(info.symbol) +
      '<span class="name">' + info.name + '</span>' +
      '<span class="zusatz">' + zusatz + '</span></button>';
  }).join('');
  el('modi').querySelectorAll('[data-modus]').forEach(b =>
    b.addEventListener('click', () => starteModus(b.dataset.modus))
  );

  /* Abzeichen */
  el('abzeichen').innerHTML = Object.keys(T.abzeichen).map(k => {
    const a = T.abzeichen[k];
    const hat = (d.abzeichen || []).includes(k);
    return '<span class="abzeichen' + (hat ? ' erreicht' : '') + '">' + symbol(a.symbol) + a.name + '</span>';
  }).join('');

  const offen = warteschlangeStand();
  el('netz-hinweis').style.display = offen ? 'flex' : 'none';
  if (offen) el('netz-hinweis').textContent = offen + ' Antworten warten auf die Übertragung.';

  zeige('start');
}

function kennzahl(wert, text) {
  return '<div class="kennzahl"><div class="wert">' + wert + '</div><div class="bezeichnung">' + text + '</div></div>';
}

/* ---------------- Themenübersicht ---------------- */
function eigeneStufe() {
  return zustand.profil.klassen ? zustand.profil.klassen.stufe : '5';
}
function andereStufe() {
  return eigeneStufe() === '5' ? '6' : '5';
}
function aktiveStufe() {
  return zustand.andereStufe ? andereStufe() : eigeneStufe();
}

function zeigeThemen() {
  const klasse = aktiveStufe();
  const karte = fortschrittProThema(zustand.daten.fortschritt || []);
  const ziel = zustand.einstellungen.ziel_pro_thema || 10;

  el('themen-titel').textContent = 'Themen der ' + klasse + '. Klasse';

  const umschalter = el('stufen-umschalter');
  if (zustand.einstellungen.andere_stufe_erlaubt) {
    umschalter.hidden = false;
    umschalter.innerHTML =
      '<button type="button" class="knopf' + (zustand.andereStufe ? '' : ' haupt') + '" data-andere="0">' +
      eigeneStufe() + '. Klasse</button>' +
      '<button type="button" class="knopf' + (zustand.andereStufe ? ' haupt' : '') + '" data-andere="1">' +
      andereStufe() + '. Klasse</button>';
    umschalter.querySelectorAll('[data-andere]').forEach(b =>
      b.addEventListener('click', () => {
        zustand.andereStufe = b.dataset.andere === '1';
        zeigeThemen();
      })
    );
  } else {
    umschalter.hidden = true;
    zustand.andereStufe = false;
  }
  el('themen-gitter').innerHTML = themenDerKlasse(klasse).map(t => {
    const f = karte[t.id] || { bearbeitet: 0, richtig: 0 };
    const anteil = Math.min(100, Math.round(f.richtig / ziel * 100));
    const fertig = f.richtig >= ziel;
    return '<button type="button" class="thema" data-thema="' + t.id + '">' +
      '<div class="kopfzeile">' + symbol(t.icon) +
        '<div><div class="titel">' + t.titel + '</div>' +
        '<div class="nummer">Bereich ' + t.nr + '</div></div></div>' +
      '<div class="beschreibung">' + t.beschr + '</div>' +
      '<div class="fuss">' +
        '<span class="balken' + (fertig ? ' fertig' : '') + '"><span style="width:' + anteil + '%"></span></span>' +
        '<span class="balken-text">' + (fertig ? '✓ ' : '') + f.richtig + ' / ' + ziel + '</span>' +
      '</div></button>';
  }).join('');

  el('themen-gitter').querySelectorAll('[data-thema]').forEach(b =>
    b.addEventListener('click', () => {
      const t = THEMA_NACH_ID[b.dataset.thema];
      trainingStarten({
        modus: 'thema', themaId: t.id, stufe: zustand.stufe,
        titel: t.titel, meta: 'Bereich ' + t.nr + ' · ' + STUFE_TEXT[zustand.stufe].name
      });
    })
  );

  zeige('themen');
}

/* ---------------- Modus starten ---------------- */
async function starteModus(modus) {
  const klasse = aktiveStufe();
  const themen = themenDerKlasse(klasse).map(t => t.id);
  const stufe = zustand.stufe;

  if (modus === 'thema') { zeigeThemen(); return; }

  if (modus === 'gemischt') {
    trainingStarten({ modus, themen, stufe, laenge: 10,
      titel: T.modi.gemischt.name, meta: 'Aufgaben aus allen Themen deiner Klasse' });
    return;
  }
  if (modus === 'schnell') {
    trainingStarten({ modus, themen, stufe, laenge: 5,
      titel: T.modi.schnell.name, meta: '5 Aufgaben' });
    return;
  }
  if (modus === 'herausforderung') {
    trainingStarten({ modus, themen, stufe: 'profi', laenge: 10,
      titel: T.modi.herausforderung.name, meta: 'Profi-Stufe' });
    return;
  }
  if (modus === 'test') {
    trainingStarten({ modus, test: true, themen, stufe, laenge: 10,
      titel: T.modi.test.name, meta: '10 Aufgaben, ohne Hinweise' });
    return;
  }
  if (modus === 'fehler') {
    let liste = [];
    try { liste = await fehlerHolen(10); }
    catch (e) { meldung('Die Fehlerliste konnte nicht geladen werden.'); return; }
    if (liste.length === 0) { streifen(T.fehlermeldungen.keineFehler); return; }
    trainingStarten({ modus, liste, stufe,
      titel: T.modi.fehler.name,
      meta: liste.length + ' Aufgabe' + (liste.length === 1 ? '' : 'n') + ' aus deiner Fehlerliste' });
  }
}

function trainingStarten(konfiguration) {
  konfiguration.zeitmodus = zustand.zeitmodus && zustand.einstellungen.zeitmodus_erlaubt;
  zeige('training');
  zustand.laufendesTraining = starteTraining({
    wurzel: el('training-bereich'),
    konfiguration,
    streifen,
    buchung: { versuchBuchen, testBuchen, abzeichenSetzen },
    beiEnde: async (ergebnis) => {
      if (zustand.laufendesTraining) zustand.laufendesTraining.stoppen();
      zustand.laufendesTraining = null;
      await datenLaden();
      if (ergebnis.test) { zeigeErgebnis(ergebnis); return; }
      if (!ergebnis.abgebrochen && ergebnis.gesamt > 0) {
        streifen('Fertig: ' + ergebnis.richtig + ' von ' + ergebnis.gesamt + ' richtig.');
      }
      zeigeStart();
    }
  });
}

/* ---------------- Testergebnis ---------------- */
function zeigeErgebnis(e) {
  const ring = el('ergebnis-ring');
  ring.style.setProperty('--p', e.prozent);
  el('ergebnis-prozent').textContent = e.prozent + '%';
  el('ergebnis-punkte').textContent = e.richtig + ' von ' + e.gesamt + ' Punkten';

  el('ergebnis-text').textContent =
    e.prozent >= 90 ? 'Ausgezeichnet. Das beherrschst du sicher.'
    : e.prozent >= 60 ? 'Gut gemacht – Test bestanden.'
    : 'Das wird noch. Übe die vorgeschlagenen Themen und versuch es später nochmals.';

  const schwach = {};
  (e.positionen || []).forEach(p => { if (!p.richtig) schwach[p.thema] = (schwach[p.thema] || 0) + 1; });
  const liste = Object.keys(schwach).sort((a, b) => schwach[b] - schwach[a]);

  if (liste.length === 0) {
    el('ergebnis-vorschlag').innerHTML = '<p>Alles richtig. Du kannst dir ein neues Thema aussuchen.</p>';
  } else {
    el('ergebnis-vorschlag').innerHTML =
      '<p>Diese Themen lohnen sich zum Weiterüben:</p><div class="themen-gitter">' +
      liste.map(id => {
        const t = THEMA_NACH_ID[id];
        return '<button type="button" class="thema" data-thema="' + id + '">' +
          '<div class="kopfzeile">' + symbol(t.icon) +
          '<div><div class="titel">' + t.titel + '</div>' +
          '<div class="nummer">Bereich ' + t.nr + '</div></div></div></button>';
      }).join('') + '</div>';
    el('ergebnis-vorschlag').querySelectorAll('[data-thema]').forEach(b =>
      b.addEventListener('click', () => {
        const t = THEMA_NACH_ID[b.dataset.thema];
        trainingStarten({ modus: 'thema', themaId: t.id, stufe: zustand.stufe,
          titel: t.titel, meta: 'Bereich ' + t.nr });
      })
    );
  }
  zeige('ergebnis');
}

/* ---------------- Hilfsanzeigen ---------------- */
let streifenZeit = null;
function streifen(text) {
  const s = el('streifen');
  s.textContent = text;
  s.classList.add('sichtbar');
  clearTimeout(streifenZeit);
  streifenZeit = setTimeout(() => s.classList.remove('sichtbar'), 3200);
}

function meldung(text) {
  const m = el('meldung');
  m.textContent = text;
  m.style.display = 'flex';
}

/* ---------------- Navigation ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  el('knopf-start').addEventListener('click', zeigeStart);
  el('themen-zurueck').addEventListener('click', zeigeStart);
  el('ergebnis-weiter').addEventListener('click', zeigeStart);
  start();
});
