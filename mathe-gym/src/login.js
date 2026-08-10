/* Anmeldeseite. */

import { anmeldenSchueler, anmeldenErwachsen, profil, db } from './daten/auth.js';

const el = (id) => document.getElementById(id);

function zeigeFehler(id, text) {
  const m = el(id);
  m.textContent = text;
  m.style.display = 'flex';
}
function verbergeFehler(id) {
  el(id).style.display = 'none';
}

async function weiterleiten() {
  const p = await profil();
  if (!p) return false;
  window.location.href = p.rolle === 'schueler' ? 'app.html' : 'lehrer.html';
  return true;
}

/* Bereits angemeldet? Dann direkt weiter (persönliche iPads bleiben angemeldet). */
(async () => {
  try {
    const { data } = await db.auth.getSession();
    if (data && data.session) await weiterleiten();
  } catch (e) { /* Anmeldeseite bleibt sichtbar */ }
})();

/* Umschalten zwischen den beiden Formularen */
el('zu-erwachsen').addEventListener('click', () => {
  el('form-schueler').style.display = 'none';
  el('form-erwachsen').style.display = 'block';
  el('email').focus();
});
el('zu-schueler').addEventListener('click', () => {
  el('form-erwachsen').style.display = 'none';
  el('form-schueler').style.display = 'block';
  el('klassencode').focus();
});

/* Anmeldung Kinder */
el('form-schueler').addEventListener('submit', async (e) => {
  e.preventDefault();
  verbergeFehler('fehler-schueler');
  const knopf = el('knopf-anmelden');

  const code = el('klassencode').value.trim();
  const name = el('benutzername').value.trim();
  const pw = el('passwort').value;

  if (!code || !name || !pw) {
    zeigeFehler('fehler-schueler', 'Bitte fülle alle drei Felder aus.');
    return;
  }

  knopf.disabled = true;
  knopf.textContent = 'Einen Moment …';
  try {
    await anmeldenSchueler(code, name, pw);
    if (!await weiterleiten()) {
      zeigeFehler('fehler-schueler', 'Dein Konto ist noch nicht vollständig eingerichtet. Bitte wende dich an deine Lehrperson.');
    }
  } catch (err) {
    zeigeFehler('fehler-schueler', err.message);
  } finally {
    knopf.disabled = false;
    knopf.textContent = 'Anmelden';
  }
});

/* Anmeldung Lehrpersonen und Administration */
el('form-erwachsen').addEventListener('submit', async (e) => {
  e.preventDefault();
  verbergeFehler('fehler-erwachsen');
  const knopf = el('knopf-anmelden-erwachsen');

  const email = el('email').value.trim();
  const pw = el('passwort-erwachsen').value;
  if (!email || !pw) {
    zeigeFehler('fehler-erwachsen', 'Bitte E-Mail-Adresse und Passwort eingeben.');
    return;
  }

  knopf.disabled = true;
  knopf.textContent = 'Einen Moment …';
  try {
    await anmeldenErwachsen(email, pw);
    if (!await weiterleiten()) {
      zeigeFehler('fehler-erwachsen', 'Zu diesem Konto fehlt ein Profil. Bitte die Administration kontaktieren.');
    }
  } catch (err) {
    zeigeFehler('fehler-erwachsen', err.message);
  } finally {
    knopf.disabled = false;
    knopf.textContent = 'Anmelden';
  }
});
