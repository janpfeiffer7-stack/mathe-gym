import { fmt, r } from '../../core/zahl.js';

/**
 * Zahlenstrahl als SVG. Skaliert mit der Breite, bleibt auf dem iPad lesbar.
 */
export function zahlenstrahlSVG(min, max, wert, teile) {
  const W = 640, H = 96, padL = 40, padR = 40;
  const x = v => padL + (v - min) / (max - min) * (W - padL - padR);

  let striche = '';
  for (let i = 0; i <= teile; i++) {
    const v = r(min + (max - min) * i / teile);
    const gross = (i === 0 || i === teile);
    striche += '<line class="tick' + (gross ? ' gross' : '') + '" x1="' + x(v) + '" y1="' +
      (gross ? 34 : 42) + '" x2="' + x(v) + '" y2="' + (gross ? 62 : 54) + '"/>';
    if (gross) {
      striche += '<text class="skala" x="' + x(v) + '" y="84" text-anchor="middle">' + fmt(v) + '</text>';
    }
  }

  const mx = x(wert);
  const marker =
    '<polygon class="pfeil" points="' + mx + ',30 ' + (mx - 9) + ',10 ' + (mx + 9) + ',10"/>' +
    '<line class="pfeilLinie" x1="' + mx + '" y1="30" x2="' + mx + '" y2="48"/>';

  return '<svg class="zahlenstrahl" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
    'aria-label="Zahlenstrahl von ' + fmt(min) + ' bis ' + fmt(max) + ' mit einer Markierung">' +
    '<line class="achse" x1="' + padL + '" y1="48" x2="' + (W - padR) + '" y2="48"/>' +
    striche + marker + '</svg>';
}
