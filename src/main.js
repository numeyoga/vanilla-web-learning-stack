// @ts-check
import { ROLES, createParticipant, sortByName } from './lib/participants.js';
import { SEED_PARTICIPANTS } from './data/seed.js';

/** @typedef {import('./lib/participants.js').Participant} Participant */
/** @typedef {import('./lib/participants.js').Role} Role */

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

/** État de l'application : la liste n'est pas persistée (rechargement = données initiales). */
const state = {
  /** @type {Participant[]} */
  participants: [...SEED_PARTICIPANTS],
};

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

  const role = document.createElement('span');
  role.className = 'participant-role';
  role.textContent = participant.role;

  item.append(name, role);
  return item;
}

/** Réaffiche la liste complète à partir de l'état. */
function render() {
  list.replaceChildren(...sortByName(state.participants).map(renderParticipant));
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
render();
