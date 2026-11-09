import { getInitials, normalizeText } from './text.utils';

describe('normalizeText', () => {
  it('quita tildes, pasa a minúsculas y recorta espacios', () => {
    expect(normalizeText('  Crédito ÁGIL ')).toBe('credito agil');
  });

  it('conserva la ñ como n para búsquedas tolerantes', () => {
    expect(normalizeText('Año')).toBe('ano');
  });
});

describe('getInitials', () => {
  it.each([
    ['Tarjetas de Crédito', 'TD'],
    ['cuenta', 'C'],
    ['  ahorro   programado  futuro ', 'AP'],
    ['', ''],
  ])('"%s" → "%s"', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});
