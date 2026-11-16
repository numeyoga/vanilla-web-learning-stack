// @ts-check
import { ROLES, createParticipant, sortByName } from './lib/participants.js';
import { formatCount } from './lib/counter.js';
import { loadTheme, nextTheme, saveTheme } from './lib/theme.js';
import { filterByName } from './lib/search.js';
import { isNew } from './lib/recent.js';
import { SEED_PARTICIPANTS } from './data/seed.js';

/** @typedef {import('./lib/participants.js').Participant} Participant */
/** @typedef {import('./lib/participants.js').Role} Role */
/** @typedef {import('./lib/theme.js').Theme} Theme */

/**
 * Récupère un élément obligatoire de la page par son attribut data-testid.
 *
 * @template {Element} T
 * @param {string} testId
 * @param {new () => T} type  Classe attendue (HTMLInputElement, HTMLUListElement, …).
 * @returns {T}
 */
function byTestId(testId, type) {
  const element = document.querySelector(`[data-testid="${testId}"]`);
  if (!(element instanceof type)) {
    throw new Error(`Élément introuvable ou de mauvais type : ${testId}`);
  }
  return element;
}

const form = byTestId('add-form', HTMLFormElement);
const nameInput = byTestId('name-input', HTMLInputElement);
const roleSelect = byTestId('role-select', HTMLSelectElement);
const formError = byTestId('form-error', HTMLParagraphElement);
const list = byTestId('participant-list', HTMLUListElement);
const headerActions = byTestId('header-actions', HTMLDivElement);
const listTools = byTestId('list-tools', HTMLDivElement);

/** État de l'application : la liste n'est pas persistée (rechargement = données initiales). */
const state = {
  /** @type {Participant[]} */
  participants: [...SEED_PARTICIPANTS],
  query: '',
  /** @type {Theme} */
  theme: loadTheme(localStorage),
};

// --- TASK-001 : compteur ---------------------------------------------------
const counter = document.createElement('span');
counter.className = 'participant-count';
counter.dataset.testid = 'participant-count';

// --- TASK-002 : bascule de thème -------------------------------------------
const themeToggle = document.createElement('button');
themeToggle.type = 'button';
themeToggle.className = 'theme-toggle';
themeToggle.dataset.testid = 'theme-toggle';
themeToggle.textContent = 'Thème sombre';

headerActions.append(counter, themeToggle);

/** Applique le thème courant à la page et au bouton. */
function applyTheme() {
  const dark = state.theme === 'dark';
  document.body.classList.toggle('theme-dark', dark);
  themeToggle.setAttribute('aria-pressed', String(dark));
}

themeToggle.addEventListener('click', () => {
  state.theme = nextTheme(state.theme);
  saveTheme(localStorage, state.theme);
  applyTheme();
});

// --- TASK-003 : recherche --------------------------------------------------
const searchInput = document.createElement('input');
searchInput.type = 'search';
searchInput.placeholder = 'Rechercher par nom…';
searchInput.setAttribute('aria-label', 'Rechercher un participant par nom');
searchInput.dataset.testid = 'search-input';

const emptyState = document.createElement('p');
emptyState.className = 'empty-state';
emptyState.dataset.testid = 'empty-state';
emptyState.hidden = true;

listTools.append(searchInput);
list.after(emptyState);

searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  render();
});

// --- Rendu -----------------------------------------------------------------

/**
 * Construit l'élément <li> d'un participant.
 *
 * @param {Participant} participant
 * @returns {HTMLLIElement}
 */
function renderParticipant(participant) {
  const item = document.createElement('li');
  item.className = 'participant-item';
  item.dataset.testid = 'participant-item';

  const name = document.createElement('span');
  name.className = 'participant-name';
  name.dataset.testid = 'participant-name';
  name.textContent = participant.name;

  item.append(name);

  // TASK-004 : badge « Nouveau »
  if (isNew(participant)) {
    const badge = document.createElement('span');
    badge.className = 'new-badge';
    badge.dataset.testid = 'new-badge';
    badge.textContent = 'Nouveau';
    item.append(badge);
  }

  const role = document.createElement('span');
  role.className = 'participant-role';
  role.textContent = participant.role;

  item.append(role);
  return item;
}

/** Réaffiche le compteur et la liste filtrée à partir de l'état. */
function render() {
  counter.textContent = formatCount(state.participants.length);

  const visible = filterByName(sortByName(state.participants), state.query);
  list.replaceChildren(...visible.map(renderParticipant));

  emptyState.hidden = visible.length > 0;
  emptyState.textContent = `Aucun participant ne correspond à « ${state.query.trim()} ».`;
}

/** @param {string} message Message à afficher, ou chaîne vide pour masquer l'erreur. */
function showError(message) {
  formError.textContent = message;
  formError.hidden = message === '';
}

function initRoleSelect() {
  for (const role of ROLES) {
    roleSelect.append(new Option(role, role));
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    const role = /** @type {Role} */ (roleSelect.value);
    state.participants.push(createParticipant(nameInput.value, role));
    showError('');
    form.reset();
    nameInput.focus();
    render();
  } catch (error) {
    showError(error instanceof Error ? error.message : String(error));
  }
});

initRoleSelect();
applyTheme();
render();
