import { ProductDateRules } from './product-date.rules';

describe('ProductDateRules', () => {
  const today = '2026-11-09';

  describe('isReleaseDateAllowed', () => {
    it.each([
      ['2026-11-09', true],
      ['2026-11-10', true],
      ['2026-11-08', false],
      ['fecha', false],
    ])('liberación %s con hoy %s → %s', (release, expected) => {
      expect(ProductDateRules.isReleaseDateAllowed(release, today)).toBe(expected);
    });
  });

  describe('revisionDateFor', () => {
    it('calcula un año después de la liberación', () => {
      expect(ProductDateRules.revisionDateFor('2026-11-09')).toBe('2027-11-09');
    });

    it('devuelve vacío si la liberación no es válida', () => {
      expect(ProductDateRules.revisionDateFor('')).toBe('');
    });
  });

  describe('isRevisionDateValid', () => {
    it('acepta exactamente un año después', () => {
      expect(ProductDateRules.isRevisionDateValid('2026-11-09', '2027-11-09')).toBe(true);
    });

    it.each(['2027-11-08', '2027-11-10', '2028-11-09', ''])('rechaza %p', (revision) => {
      expect(ProductDateRules.isRevisionDateValid('2026-11-09', revision)).toBe(false);
    });
  });
});
