export const MATRICULE_REGEX = /^\d{2}[A-Z]{5}\d{4}$/

export function normalizeMatricule(value) {
  return (value || '').trim().toUpperCase()
}

export function isValidMatricule(value) {
  return MATRICULE_REGEX.test(normalizeMatricule(value))
}

export const MATRICULE_ERROR =
  'Format du matricule invalide. Le format doit être du type : 23ENSPM0426.'
