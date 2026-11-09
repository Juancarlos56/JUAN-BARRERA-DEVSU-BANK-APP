/** Normaliza texto para búsquedas: minúsculas, sin tildes y sin espacios extremos. */
export const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/** Obtiene hasta dos iniciales de un nombre (`Tarjetas de Crédito` → `TD`). */
export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
