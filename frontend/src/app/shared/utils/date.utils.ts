const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number): string => String(value).padStart(2, '0');

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/** Convierte una fecha local a `YYYY-MM-DD` (sin pasar por UTC). */
export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Verifica que el texto sea una fecha de calendario real en formato `YYYY-MM-DD`. */
export const isIsoDate = (value: string): boolean => {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

/**
 * Suma años a una fecha ISO. Si la fecha es 29 de febrero y el año destino
 * no es bisiesto, se usa el 28 de febrero. Devuelve `''` si la fecha no es válida.
 */
export const addYearsToIsoDate = (value: string, years: number): string => {
  if (!isIsoDate(value)) {
    return '';
  }
  const [year, month, day] = value.split('-').map(Number);
  const targetYear = year + years;
  const targetDay = month === 2 && day === 29 && !isLeapYear(targetYear) ? 28 : day;
  return `${targetYear}-${pad(month)}-${pad(targetDay)}`;
};
