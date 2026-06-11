const MATRICULE_REGEX = /^\d{2}[A-Z]{5}\d{4}$/;

function normalizeMatricule(value) {
  return (value || '').trim().toUpperCase();
}

function isValidMatricule(value) {
  return MATRICULE_REGEX.test(normalizeMatricule(value));
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { MATRICULE_REGEX, normalizeMatricule, isValidMatricule, escapeRegex };
