import { addYearsToIsoDate, isIsoDate, toIsoDate } from './date.utils';

describe('toIsoDate', () => {
  it('usa la fecha local con ceros a la izquierda', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('isIsoDate', () => {
  it.each([
    ['2026-11-09', true],
    ['2024-02-29', true],
    ['2025-02-29', false],
    ['2026-13-01', false],
    ['2026-1-01', false],
    ['09/11/2026', false],
    ['', false],
  ])('%s → %s', (value, expected) => {
    expect(isIsoDate(value)).toBe(expected);
  });
});

describe('addYearsToIsoDate', () => {
  it('suma un año manteniendo mes y día', () => {
    expect(addYearsToIsoDate('2026-11-09', 1)).toBe('2027-11-09');
  });

  it('ajusta el 29 de febrero al 28 si el año destino no es bisiesto', () => {
    expect(addYearsToIsoDate('2028-02-29', 1)).toBe('2029-02-28');
  });

  it('mantiene el 29 de febrero si el año destino es bisiesto', () => {
    expect(addYearsToIsoDate('2028-02-29', 4)).toBe('2032-02-29');
  });

  it('devuelve vacío para fechas no válidas', () => {
    expect(addYearsToIsoDate('', 1)).toBe('');
    expect(addYearsToIsoDate('2026-02-30', 1)).toBe('');
  });
});
