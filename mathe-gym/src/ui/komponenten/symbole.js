/* Schlichte Inline-Symbole. Keine externe Bibliothek, kein Emoji. */

const PFADE = {
  bruch:      '<path d="M5 5h6M5 19h6M15 4L9 20" stroke-linecap="round"/>',
  stellenwert:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M14 5v14" opacity=".5"/>',
  waage:      '<path d="M12 4v16M5 8h14" stroke-linecap="round"/><path d="M5 8l-3 6h6zM19 8l-3 6h6z"/>',
  rechnen:    '<path d="M4 8h6M7 5v6M14 7h6M14 17h6M17 14v6" stroke-linecap="round"/>',
  massband:   '<rect x="2" y="8" width="20" height="8" rx="2"/><path d="M7 8v3M12 8v4M17 8v3" opacity=".7"/>',
  ordnen:     '<path d="M4 7h10M4 12h14M4 17h6" stroke-linecap="round"/>',
  gleichung:  '<path d="M4 9h16M4 15h16" stroke-linecap="round"/>',
  diagramm:   '<path d="M4 20V10M10 20V4M16 20v-8M22 20h-20" stroke-linecap="round"/>',
  tempo:      '<circle cx="12" cy="13" r="8"/><path d="M12 13l4-4M9 3h6" stroke-linecap="round"/>',
  quader:     '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8" opacity=".6"/>',
  prozent:    '<circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/><path d="M19 5L5 19" stroke-linecap="round"/>',
  wuerfel:    '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.4" fill="currentColor"/><circle cx="15" cy="15" r="1.4" fill="currentColor"/>',

  stern:      '<path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.4l6-.8z"/>',
  flamme:     '<path d="M12 3s5 4.5 5 9a5 5 0 01-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3 1-6 1-7.5z"/>',
  muskel:     '<path d="M5 12c2-4 6-5 9-3 2 1.3 3 3 3 5v4H8a3 3 0 01-3-3z"/><path d="M8 12v6" opacity=".6"/>',
  haken:      '<path d="M4 12.5l5 5L20 6.5" stroke-linecap="round" stroke-linejoin="round"/>',
  medaille:   '<circle cx="12" cy="15" r="6"/><path d="M9 9L7 3M15 9l2-6" stroke-linecap="round"/>',

  training:   '<path d="M4 12h16M14 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>',
  mischen:    '<path d="M4 7h4l8 10h4M4 17h4l2-2.5M16 7h4" stroke-linecap="round"/><path d="M18 4l3 3-3 3M18 14l3 3-3 3" stroke-linecap="round" stroke-linejoin="round"/>',
  blitz:      '<path d="M13 3L5 14h6l-1 7 8-11h-6z" stroke-linejoin="round"/>',
  wiederholen:'<path d="M4 12a8 8 0 0113.7-5.7L20 8" stroke-linecap="round"/><path d="M20 4v4h-4" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 12a8 8 0 01-13.7 5.7L4 16" stroke-linecap="round"/><path d="M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>',
  pruefung:   '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3" stroke-linecap="round" opacity=".7"/>',
  pokal:      '<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 6H5v1a3 3 0 003 3M16 6h3v1a3 3 0 01-3 3M10 17h4M12 13v4M9 20h6" stroke-linecap="round"/>',

  person:     '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" stroke-linecap="round"/>',
  klasse:     '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M2 19c0-3 2.7-5 6-5M22 19c0-3-2.7-5-6-5M9 19c0-2 1.4-3 3-3s3 1 3 3" stroke-linecap="round"/>',
  drucken:    '<path d="M7 8V3h10v5"/><rect x="4" y="8" width="16" height="8" rx="2"/><path d="M7 16h10v5H7z"/>',
  abmelden:   '<path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4" stroke-linecap="round"/><path d="M15 8l4 4-4 4M19 12H9" stroke-linecap="round" stroke-linejoin="round"/>'
};

export function symbol(name, klasse = 'symbol') {
  const pfad = PFADE[name] || PFADE.rechnen;
  return '<span class="' + klasse + '" aria-hidden="true">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + pfad + '</svg></span>';
}
