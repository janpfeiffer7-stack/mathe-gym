/* Demo-Modus.

   Zeigt den Trainingsbereich ohne Anmeldung und ohne Datenbank. Der Fortschritt
   wird nur im Browser dieses Geräts gehalten und beim Schliessen des Tabs
   verworfen. Gedacht zum Anschauen und Ausprobieren, nicht für den Unterricht.

   Der Demo-Modus benutzt denselben Trainingsablauf, dieselben Aufgabentypen und
   dieselbe Bruch-Eingabe wie die echte Plattform. */

import { THEMA_NACH_ID } from './aufgaben/index.js';
import { themenDerKlasse } from './aufgaben/katalog.js';
import { starteTraining } from './ui/ansichten/training.js';
import { symbol } from './ui/komponenten/symbole.js';
import { T } from './ui/texte.js';
import { STUFE_TEXT, STUFEN } from './core/formate.js';

const el = (id) => document.getElementById(id);

/* Fortschritt nur im Arbeitsspeicher – nichts wird dauerhaft gespeichert. */
const stand = {
  klasse: '5',
  stufe: 'standard',
  zeitmodus: false,
  andereStufe: false,
  bearbeitet: 0,
  richtig: 0,
  serie: 0,
  besteSerie: 0,
  proThema: {},
  abzeichen: new Set(),
  laufendesTraining: null
};

const ZIEL = 10;

/* Buchung für die Demo: hält den Stand lokal, schreibt nichts weg. */
const buchung = {
  async versuchBuchen(a, richtig) {
    stand.bearbeitet++;
    const p = stand.proThema[a.thema] || (stand.proThema[a.thema] = { bearbeitet: 0, richtig: 0 });
    p.bearbeitet++;
    if (richtig) {
      stand.richtig++;
      p.richtig++;
      stand.serie++;
      stand.besteSerie = Math.max(stand.besteSerie, stand.serie);
    } else {
      stand.serie = 0;
    }
    return { serie: stand.serie, punkte: stand.richtig * 10 };
  },
  async testBuchen() { return null; },
  async abzeichenSetzen(name) {
    if (!stand.abzeichen.has(name)) {
      stand.abzeichen.add(name);
      const a = T.abzeichen[name];
      if (a) streifen('Abzeichen erhalten: ' + a.name);
    }
  }
};

/* ---------------- Ansichten ---------------- */
function zeige(name) {
  ['start', 'themen', 'training', 'ergebnis'].forEach(a =>
    el('ansicht-' + a).classList.toggle('aktiv', a === name));
  window.scrollTo(0, 0);
}

function eigeneStufe() { return stand.klasse; }
function andereStufe() { return stand.klasse === '5' ? '6' : '5'; }
function aktiveStufe() { return stand.andereStufe ? andereStufe() : eigeneStufe(); }

/* ---------------- Startseite ---------------- */
function zeigeStart() {
  if (stand.laufendesTraining) { stand.laufendesTraining.stoppen(); stand.laufendesTraining = null; }

  document.body.setAttribute('data-klasse', stand.klasse);
  const quote = stand.bearbeitet ? Math.round(stand.richtig / stand.bearbeitet * 100) : 0;

  el('kennzahlen').innerHTML =
    kennzahl(stand.bearbeitet, 'Aufgaben gelöst') +
    kennzahl(quote + '%', 'davon richtig') +
    kennzahl(stand.serie, 'richtige in Folge') +
    kennzahl(stand.besteSerie, 'längste Serie');

  /* Klassenwahl – in der echten Plattform kommt sie aus dem Konto */
  el('klassenwahl-demo').innerHTML = ['5', '6'].map(k =>
    '<button type="button" class="knopf' + (k === stand.klasse ? ' haupt' : '') + '" data-klasse="' + k + '">' +
    k + '. Klasse</button>').join('');
  el('klassenwahl-demo').querySelectorAll('[data-klasse]').forEach(b =>
    b.addEventListener('click', () => {
      stand.klasse = b.dataset.klasse;
      stand.andereStufe = false;
      zeigeStart();
    }));

  el('stufenwahl').innerHTML = STUFEN.map(st =>
    '<button type="button" class="knopf' + (st === stand.stufe ? ' haupt' : '') + '" data-stufe="' + st + '">' +
    STUFE_TEXT[st].punkte + ' ' + STUFE_TEXT[st].name + '</button>').join('');
  el('stufenwahl').querySelectorAll('[data-stufe]').forEach(b =>
    b.addEventListener('click', () => { stand.stufe = b.dataset.stufe; zeigeStart(); }));
  el('stufen-erklaerung').textContent = STUFE_TEXT[stand.stufe].beschr;

  el('zeitmodus-zeile').innerHTML =
    '<button type="button" class="knopf" id="knopf-zeitmodus" aria-pressed="' + stand.zeitmodus + '">' +
    'Übungsdauer anzeigen: <strong>' + (stand.zeitmodus ? 'ein' : 'aus') + '</strong></button>' +
    '<span class="hilfetext">Nur eine Anzeige. Kein Zeitdruck, keine Auswirkung auf die Bewertung.</span>';
  el('knopf-zeitmodus').addEventListener('click', () => {
    stand.zeitmodus = !stand.zeitmodus;
    zeigeStart();
  });

  const modi = ['thema', 'gemischt', 'schnell', 'test', 'herausforderung'];
  el('modi').innerHTML = modi.map(m => {
    const info = T.modi[m];
    return '<button type="button" class="modus" data-modus="' + m + '">' +
      symbol(info.symbol) +
      '<span class="name">' + info.name + '</span>' +
      '<span class="zusatz">' + info.zusatz + '</span></button>';
  }).join('') +
  '<button type="button" class="modus" disabled style="opacity:.5;cursor:default">' +
    symbol('wiederholen') +
    '<span class="name">Meine Fehler üben</span>' +
    '<span class="zusatz">nur mit Konto verfügbar</span></button>';

  el('modi').querySelectorAll('[data-modus]').forEach(b =>
    b.addEventListener('click', () => starteModus(b.dataset.modus)));

  el('abzeichen').innerHTML = Object.keys(T.abzeichen).map(k => {
    const a = T.abzeichen[k];
    return '<span class="abzeichen' + (stand.abzeichen.has(k) ? ' erreicht' : '') + '">' +
      symbol(a.symbol) + a.name + '</span>';
  }).join('');

  zeige('start');
}

function kennzahl(wert, text) {
  return '<div class="kennzahl"><div class="wert">' + wert + '</div>' +
         '<div class="bezeichnung">' + text + '</div></div>';
}

/* ---------------- Themen ---------------- */
function zeigeThemen() {
  const klasse = aktiveStufe();
  el('themen-titel').textContent = 'Themen der ' + klasse + '. Klasse';

  el('stufen-umschalter').innerHTML =
    '<button type="button" class="knopf' + (stand.andereStufe ? '' : ' haupt') + '" data-andere="0">' +
    eigeneStufe() + '. Klasse</button>' +
    '<button type="button" class="knopf' + (stand.andereStufe ? ' haupt' : '') + '" data-andere="1">' +
    andereStufe() + '. Klasse</button>';
  el('stufen-umschalter').querySelectorAll('[data-andere]').forEach(b =>
    b.addEventListener('click', () => { stand.andereStufe = b.dataset.andere === '1'; zeigeThemen(); }));

  el('themen-gitter').innerHTML = themenDerKlasse(klasse).map(t => {
    const f = stand.proThema[t.id] || { bearbeitet: 0, richtig: 0 };
    const anteil = Math.min(100, Math.round(f.richtig / ZIEL * 100));
    const fertig = f.richtig >= ZIEL;
    return '<button type="button" class="thema" data-thema="' + t.id + '">' +
      '<div class="kopfzeile">' + symbol(t.icon) +
        '<div><div class="titel">' + t.titel + '</div>' +
        '<div class="nummer">Bereich ' + t.nr + '</div></div></div>' +
      '<div class="beschreibung">' + t.beschr + '</div>' +
      '<div class="fuss">' +
        '<span class="balken' + (fertig ? ' fertig' : '') + '"><span style="width:' + anteil + '%"></span></span>' +
        '<span class="balken-text">' + (fertig ? '✓ ' : '') + f.richtig + ' / ' + ZIEL + '</span>' +
      '</div></button>';
  }).join('');

  el('themen-gitter').querySelectorAll('[data-thema]').forEach(b =>
    b.addEventListener('click', () => {
      const t = THEMA_NACH_ID[b.dataset.thema];
      trainingStarten({ modus: 'thema', themaId: t.id, stufe: stand.stufe,
        titel: t.titel, meta: 'Bereich ' + t.nr + ' · ' + STUFE_TEXT[stand.stufe].name });
    }));

  zeige('themen');
}

/* ---------------- Modi ---------------- */
function starteModus(modus) {
  const themen = themenDerKlasse(aktiveStufe()).map(t => t.id);

  if (modus === 'thema') { zeigeThemen(); return; }
  if (modus === 'gemischt') {
    trainingStarten({ modus, themen, stufe: stand.stufe, laenge: 10,
      titel: T.modi.gemischt.name, meta: 'Aufgaben aus allen Themen' });
    return;
  }
  if (modus === 'schnell') {
    trainingStarten({ modus, themen, stufe: stand.stufe, laenge: 5,
      titel: T.modi.schnell.name, meta: '5 Aufgaben' });
    return;
  }
  if (modus === 'herausforderung') {
    trainingStarten({ modus, themen, stufe: 'profi', laenge: 10,
      titel: T.modi.herausforderung.name, meta: 'Profi-Stufe' });
    return;
  }
  if (modus === 'test') {
    trainingStarten({ modus, test: true, themen, stufe: stand.stufe, laenge: 10,
      titel: T.modi.test.name, meta: '10 Aufgaben, ohne Hinweise' });
  }
}

function trainingStarten(konfiguration) {
  konfiguration.zeitmodus = stand.zeitmodus;
  zeige('training');
  stand.laufendesTraining = starteTraining({
    wurzel: el('training-bereich'),
    konfiguration,
    streifen,
    buchung,
    beiEnde: (ergebnis) => {
      if (stand.laufendesTraining) stand.laufendesTraining.stoppen();
      stand.laufendesTraining = null;
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
  el('ergebnis-ring').style.setProperty('--p', e.prozent);
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
        trainingStarten({ modus: 'thema', themaId: t.id, stufe: stand.stufe,
          titel: t.titel, meta: 'Bereich ' + t.nr });
      }));
  }
  zeige('ergebnis');
}

/* ---------------- Streifen ---------------- */
let streifenZeit = null;
function streifen(text) {
  const s = el('streifen');
  s.textContent = text;
  s.classList.add('sichtbar');
  clearTimeout(streifenZeit);
  streifenZeit = setTimeout(() => s.classList.remove('sichtbar'), 3200);
}

document.addEventListener('DOMContentLoaded', () => {
  el('knopf-start').addEventListener('click', zeigeStart);
  el('themen-zurueck').addEventListener('click', zeigeStart);
  el('ergebnis-weiter').addEventListener('click', zeigeStart);
  zeigeStart();
});
