/* Eingabekomponenten.
   Alle Komponenten liefern:
     .knoten()   -> DOM-Element zum Einhängen
     .lesen()    -> Antwort im Format, das der Prüfer erwartet
     .sperren()  -> keine weitere Eingabe
     .markieren(ergebnis) -> Rückmeldung sichtbar machen
     .fokus()    -> Eingabefokus setzen
*/

import { fmt } from '../../core/zahl.js';

/* ---------------------------------------------------------------
   Zahlentastatur: auf dem iPad zuverlässiger als die Systemtastatur,
   weil sie nicht die Ansicht verschiebt und immer dieselben Tasten zeigt.
   --------------------------------------------------------------- */
export function zahlentastatur({ aufZiffer, aufLoeschen, aufWechsel, aufFertig, mitWechsel, mitKomma }) {
  const el = document.createElement('div');
  el.className = 'tastatur';
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', 'Zahlentastatur');

  const reihen = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [mitKomma ? '.' : null, '0', 'loeschen']
  ];

  reihen.forEach(reihe => {
    const r = document.createElement('div');
    r.className = 'reihe';
    reihe.forEach(taste => {
      if (taste === null) { const platz = document.createElement('span'); platz.style.flex = '1'; r.appendChild(platz); return; }
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'taste' + (taste === 'loeschen' ? ' funktion' : '');
      if (taste === 'loeschen') { b.textContent = '⌫'; b.setAttribute('aria-label', 'Letzte Ziffer löschen'); }
      else { b.textContent = taste; b.setAttribute('aria-label', taste === '.' ? 'Dezimalpunkt' : 'Ziffer ' + taste); }
      b.addEventListener('click', () => {
        if (taste === 'loeschen') aufLoeschen();
        else aufZiffer(taste);
      });
      r.appendChild(b);
    });
    el.appendChild(r);
  });

  if (mitWechsel || aufFertig) {
    const r = document.createElement('div');
    r.className = 'reihe';
    if (mitWechsel) {
      const w = document.createElement('button');
      w.type = 'button'; w.className = 'taste funktion weit';
      w.textContent = 'Zähler / Nenner';
      w.setAttribute('aria-label', 'Zwischen Zähler und Nenner wechseln');
      w.addEventListener('click', aufWechsel);
      r.appendChild(w);
    }
    el.appendChild(r);
  }

  return el;
}

/* ---------------------------------------------------------------
   Zahleneingabe
   --------------------------------------------------------------- */
export function zahlEingabe({ einheit, tastatur = true }) {
  const wrap = document.createElement('div');
  wrap.className = 'eingabe-bereich';

  const zeile = document.createElement('div');
  zeile.className = 'eingabe-zeile';

  const feld = document.createElement('input');
  feld.type = 'text';
  feld.className = 'feld';
  feld.inputMode = 'decimal';
  feld.autocomplete = 'off';
  feld.setAttribute('aria-label', 'Deine Antwort');
  zeile.appendChild(feld);

  if (einheit) {
    const e = document.createElement('span');
    e.className = 'einheit';
    e.textContent = einheit;
    zeile.appendChild(e);
  }
  wrap.appendChild(zeile);

  if (tastatur) {
    feld.readOnly = true;                       // Systemtastatur unterdrücken
    feld.addEventListener('focus', () => feld.blur());
    wrap.appendChild(zahlentastatur({
      mitKomma: true,
      aufZiffer: (z) => { if (feld.disabled) return; if (z === '.' && feld.value.includes('.')) return; feld.value += z; },
      aufLoeschen: () => { if (!feld.disabled) feld.value = feld.value.slice(0, -1); }
    }));
  }

  return {
    knoten: () => wrap,
    lesen: () => feld.value,
    fokus: () => { if (!tastatur) feld.focus(); },
    sperren: () => { feld.disabled = true; wrap.querySelectorAll('.taste').forEach(t => t.disabled = true); },
    markieren: (richtig) => { feld.classList.add(richtig ? 'richtig' : 'falsch'); },
    zuruecksetzen: () => { feld.value = ''; feld.classList.remove('richtig', 'falsch'); },
    loesungZeigen: (wert) => { feld.value = fmt(wert); }
  };
}

/* ---------------------------------------------------------------
   Bruch-Eingabe: getrennte Felder für Ganze, Zähler und Nenner
   --------------------------------------------------------------- */
export function bruchEingabe({ mitGanzen = true, regelText = '' }) {
  const wrap = document.createElement('div');
  wrap.className = 'eingabe-bereich';

  if (regelText) {
    const regel = document.createElement('p');
    regel.className = 'formatregel';
    regel.textContent = regelText;
    wrap.appendChild(regel);
  }

  const box = document.createElement('div');
  box.className = 'bruch-eingabe';

  let ganzFeld = null;
  if (mitGanzen) {
    ganzFeld = macheFeld('bruch-feld ganzfeld', 'Ganze Zahl, optional');
    box.appendChild(ganzFeld);
  }

  const stapel = document.createElement('div');
  stapel.className = 'bruch-stapel';
  const zaehler = macheFeld('bruch-feld', 'Zähler, obere Zahl');
  const strich = document.createElement('div');
  strich.className = 'strich';
  const nenner = macheFeld('bruch-feld', 'Nenner, untere Zahl');
  stapel.append(zaehler, strich, nenner);
  box.appendChild(stapel);
  wrap.appendChild(box);

  const felder = mitGanzen ? [ganzFeld, zaehler, nenner] : [zaehler, nenner];
  let aktiv = mitGanzen ? 1 : 0;                 // startet beim Zähler

  function setzeAktiv(i) {
    aktiv = i;
    felder.forEach((f, k) => f.classList.toggle('aktiv', k === i));
  }
  felder.forEach((f, i) => {
    f.addEventListener('click', () => { if (!f.disabled) setzeAktiv(i); });
    f.addEventListener('focus', () => f.blur());
  });
  setzeAktiv(aktiv);

  wrap.appendChild(zahlentastatur({
    mitWechsel: true,
    aufZiffer: (z) => {
      const f = felder[aktiv];
      if (f.disabled) return;
      if (f.value.length >= 4) return;
      f.value += z;
      // Nach zwei Ziffern im Zähler automatisch zum Nenner wechseln,
      // aber nur wenn der Nenner noch leer ist.
      const zIdx = mitGanzen ? 1 : 0;
      if (aktiv === zIdx && f.value.length >= 2 && felder[zIdx + 1].value === '') setzeAktiv(zIdx + 1);
    },
    aufLoeschen: () => {
      const f = felder[aktiv];
      if (f.disabled) return;
      if (f.value === '' && aktiv > 0) { setzeAktiv(aktiv - 1); return; }
      f.value = f.value.slice(0, -1);
    },
    aufWechsel: () => {
      const zIdx = mitGanzen ? 1 : 0;
      setzeAktiv(aktiv === zIdx ? zIdx + 1 : zIdx);
    }
  }));

  function macheFeld(klasse, beschriftung) {
    const i = document.createElement('input');
    i.type = 'text';
    i.className = klasse;
    i.inputMode = 'numeric';
    i.readOnly = true;
    i.autocomplete = 'off';
    i.setAttribute('aria-label', beschriftung);
    return i;
  }

  return {
    knoten: () => wrap,
    lesen: () => ({
      ganz: ganzFeld ? ganzFeld.value : '',
      z: zaehler.value,
      n: nenner.value
    }),
    fokus: () => {},
    sperren: () => {
      felder.forEach(f => { f.disabled = true; f.classList.remove('aktiv'); });
      wrap.querySelectorAll('.taste').forEach(t => t.disabled = true);
    },
    markieren: (richtig) => {
      [zaehler, nenner].forEach(f => f.classList.add(richtig ? 'richtig' : 'falsch'));
      if (ganzFeld && ganzFeld.value) ganzFeld.classList.add(richtig ? 'richtig' : 'falsch');
    },
    zuruecksetzen: () => {
      felder.forEach(f => { f.value = ''; f.classList.remove('richtig', 'falsch'); });
      setzeAktiv(mitGanzen ? 1 : 0);
    },
    loesungZeigen: (z, n) => { zaehler.value = String(z); nenner.value = String(n); }
  };
}

/* ---------------------------------------------------------------
   Mehrfeld-Eingabe (Zahlenfolgen, Wertetabellen, Nachbarzahlen)
   --------------------------------------------------------------- */
export function mehrfeldEingabe({ frageHTML, felder }) {
  const wrap = document.createElement('div');
  wrap.className = 'eingabe-bereich';

  let html = frageHTML;
  felder.forEach((f, i) => {
    html = html.replace('{{' + i + '}}',
      '<input type="text" class="feld klein" data-feld="' + i + '" inputmode="decimal" ' +
      'autocomplete="off" aria-label="Feld ' + (i + 1) + ' von ' + felder.length + '">');
  });
  const frage = document.createElement('div');
  frage.className = 'frage';
  frage.innerHTML = html;
  wrap.appendChild(frage);

  const eingaben = Array.from(frage.querySelectorAll('[data-feld]'));
  let aktiv = 0;
  eingaben.forEach((e, i) => {
    e.readOnly = true;
    e.addEventListener('focus', () => e.blur());
    e.addEventListener('click', () => { if (!e.disabled) { aktiv = i; markiereAktiv(); } });
  });
  function markiereAktiv() {
    eingaben.forEach((e, i) => e.style.borderColor = (i === aktiv ? 'var(--blau)' : ''));
  }
  markiereAktiv();

  wrap.appendChild(zahlentastatur({
    mitKomma: true,
    aufZiffer: (z) => {
      const e = eingaben[aktiv];
      if (!e || e.disabled) return;
      if (z === '.' && e.value.includes('.')) return;
      e.value += z;
    },
    aufLoeschen: () => {
      const e = eingaben[aktiv];
      if (!e || e.disabled) return;
      if (e.value === '' && aktiv > 0) { aktiv--; markiereAktiv(); return; }
      e.value = e.value.slice(0, -1);
    },
    mitWechsel: eingaben.length > 1,
    aufWechsel: () => { aktiv = (aktiv + 1) % eingaben.length; markiereAktiv(); }
  }));

  return {
    knoten: () => wrap,
    lesen: () => eingaben.map(e => e.value),
    fokus: () => {},
    sperren: () => {
      eingaben.forEach(e => { e.disabled = true; e.style.borderColor = ''; });
      wrap.querySelectorAll('.taste').forEach(t => t.disabled = true);
    },
    markieren: (richtig, teile) => {
      eingaben.forEach((e, i) => {
        const ok = teile ? teile[i] : richtig;
        e.classList.add(ok ? 'richtig' : 'falsch');
      });
    },
    zuruecksetzen: () => {
      eingaben.forEach(e => { e.value = ''; e.classList.remove('richtig', 'falsch'); });
      aktiv = 0; markiereAktiv();
    },
    loesungZeigen: (werte) => { eingaben.forEach((e, i) => { e.value = fmt(werte[i]); }); }
  };
}

/* ---------------------------------------------------------------
   Auswahl (Multiple Choice) – als Radiogruppe, nicht als Listbox
   --------------------------------------------------------------- */
export function auswahlEingabe({ optionen }) {
  const wrap = document.createElement('div');
  wrap.className = 'auswahl eingabe-bereich';
  wrap.setAttribute('role', 'radiogroup');
  wrap.setAttribute('aria-label', 'Antwortmöglichkeiten');

  const marken = ['A', 'B', 'C', 'D', 'E', 'F'];
  let gewaehlt = -1;
  const knoepfe = optionen.map((text, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'option';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', 'false');
    b.innerHTML = '<span class="marke" aria-hidden="true">' + marken[i] + '</span><span>' + text + '</span>';
    b.addEventListener('click', () => {
      if (b.disabled) return;
      gewaehlt = i;
      knoepfe.forEach((k, j) => k.setAttribute('aria-checked', String(j === i)));
    });
    wrap.appendChild(b);
    return b;
  });

  return {
    knoten: () => wrap,
    lesen: () => gewaehlt,
    fokus: () => {},
    sperren: () => knoepfe.forEach(k => { k.disabled = true; }),
    markieren: (richtig, _teile, richtigerIndex) => {
      knoepfe.forEach((k, i) => {
        if (i === richtigerIndex) k.classList.add('richtig');
        else if (i === gewaehlt) k.classList.add('falsch');
      });
    },
    zuruecksetzen: () => {
      gewaehlt = -1;
      knoepfe.forEach(k => { k.setAttribute('aria-checked', 'false'); k.classList.remove('richtig', 'falsch'); });
    },
    loesungZeigen: () => {}
  };
}

/* ---------------------------------------------------------------
   Ordnen: Werte in der richtigen Reihenfolge antippen
   --------------------------------------------------------------- */
export function ordnenEingabe({ werte }) {
  const wrap = document.createElement('div');
  wrap.className = 'eingabe-bereich';

  const hinweis = document.createElement('p');
  hinweis.className = 'ordnen-hinweis';
  hinweis.textContent = 'Tippe die Zahlen der Reihe nach an: von der kleinsten zur grössten.';
  wrap.appendChild(hinweis);

  const chips = document.createElement('div');
  chips.className = 'ordnen-chips';
  wrap.appendChild(chips);

  const ziel = document.createElement('div');
  ziel.className = 'ordnen-ziel';
  ziel.setAttribute('aria-live', 'polite');
  wrap.appendChild(ziel);

  const zurueck = document.createElement('button');
  zurueck.type = 'button';
  zurueck.className = 'knopf';
  zurueck.textContent = 'Letzte Auswahl zurücknehmen';
  zurueck.disabled = true;
  wrap.appendChild(zurueck);

  let gewaehlt = [];
  const knoepfe = werte.map(w => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ordnen-chip';
    b.textContent = fmt(w);
    b.dataset.wert = String(w);
    b.setAttribute('aria-label', 'Zahl ' + fmt(w) + ' auswählen');
    b.addEventListener('click', () => {
      if (b.disabled || b.classList.contains('gewaehlt')) return;
      gewaehlt.push(w);
      b.classList.add('gewaehlt');
      const rang = document.createElement('span');
      rang.className = 'rang';
      rang.textContent = String(gewaehlt.length);
      b.appendChild(rang);
      aktualisiere();
    });
    chips.appendChild(b);
    return b;
  });

  zurueck.addEventListener('click', () => {
    if (gewaehlt.length === 0) return;
    const letzter = gewaehlt.pop();
    const b = knoepfe.find(k => Number(k.dataset.wert) === letzter && k.classList.contains('gewaehlt'));
    if (b) { b.classList.remove('gewaehlt'); const r = b.querySelector('.rang'); if (r) r.remove(); }
    // Ränge neu nummerieren
    gewaehlt.forEach((w, i) => {
      const kn = knoepfe.find(k => Number(k.dataset.wert) === w);
      const r = kn && kn.querySelector('.rang');
      if (r) r.textContent = String(i + 1);
    });
    aktualisiere();
  });

  function aktualisiere() {
    ziel.innerHTML = gewaehlt.map(w => '<span class="fixwert">' + fmt(w) + '</span>').join('');
    zurueck.disabled = gewaehlt.length === 0;
  }

  return {
    knoten: () => wrap,
    lesen: () => gewaehlt.slice(),
    fokus: () => {},
    sperren: () => { knoepfe.forEach(k => k.disabled = true); zurueck.disabled = true; },
    markieren: () => {},
    zuruecksetzen: () => {
      gewaehlt = [];
      knoepfe.forEach(k => { k.classList.remove('gewaehlt'); const r = k.querySelector('.rang'); if (r) r.remove(); });
      aktualisiere();
    },
    loesungZeigen: (richtige) => {
      ziel.innerHTML = richtige.map(w => '<span class="fixwert">' + fmt(w) + '</span>').join('');
    }
  };
}

/** Passende Komponente zu einer Aufgabe erzeugen. */
export function eingabeFuer(aufgabe) {
  const p = aufgabe.pruefung;
  if (p.art === 'bruch') {
    return bruchEingabe({
      mitGanzen: p.regel === 'gemischt' || Math.abs(p.z) > p.n,
      regelText: aufgabe.regelText
    });
  }
  if (p.art === 'mehrfeld') return mehrfeldEingabe({ frageHTML: aufgabe.frageHTML, felder: p.felder });
  if (p.art === 'auswahl') return auswahlEingabe({ optionen: p.optionen });
  if (p.art === 'ordnen') return ordnenEingabe({ werte: aufgabe.mischWerte || p.werte });
  return zahlEingabe({ einheit: aufgabe.einheit });
}
