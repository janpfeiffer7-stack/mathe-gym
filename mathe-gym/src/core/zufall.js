/* Zufall mit optionalem Startwert (Seed).
   Ein fester Startwert macht jede gefundene Aufgabe im Test reproduzierbar. */

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Erzeugt eine Zufallsquelle. Ohne Startwert echt zufällig. */
export function zufallsquelle(seed) {
  const f = (seed === undefined || seed === null) ? Math.random : mulberry32(seed);
  return {
    zahl: () => f(),
    /** Ganze Zahl von min bis max, beide einschliesslich. */
    int(min, max) {
      if (max < min) [min, max] = [max, min];
      return Math.floor(f() * (max - min + 1)) + min;
    },
    /** Ein Element aus einer Liste. */
    wahl(liste) {
      if (!liste || liste.length === 0) throw new Error('zufall.wahl: leere Liste');
      return liste[Math.floor(f() * liste.length)];
    },
    /** Liste mischen (neue Liste). */
    misch(liste) {
      const a = liste.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(f() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    /** n verschiedene Elemente. */
    auswahl(liste, n) {
      return this.misch(liste).slice(0, n);
    },
    /** Ganze Zahl aus min..max, aber nicht in "ausser". */
    intAusser(min, max, ausser) {
      const menge = [];
      for (let i = min; i <= max; i++) if (!ausser.includes(i)) menge.push(i);
      if (menge.length === 0) throw new Error('zufall.intAusser: keine Kandidaten');
      return this.wahl(menge);
    }
  };
}
