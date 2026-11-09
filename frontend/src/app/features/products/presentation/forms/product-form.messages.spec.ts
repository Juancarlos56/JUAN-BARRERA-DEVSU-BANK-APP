import {
  FALLBACK_ERROR_MESSAGE,
  PRODUCT_FORM_ERROR_MESSAGES,
  firstErrorMessage,
} from './product-form.messages';

describe('firstErrorMessage', () => {
  const messages = PRODUCT_FORM_ERROR_MESSAGES.id;

  it('devuelve null si no hay errores', () => {
    expect(firstErrorMessage(null, messages)).toBeNull();
  });

  it('devuelve el mensaje del error conocido', () => {
    expect(firstErrorMessage({ idTaken: true }, messages)).toBe(
      'ID no válido! Ya existe un producto con este ID.',
    );
  });

  it('usa los límites definidos en las reglas del dominio', () => {
    expect(firstErrorMessage({ minlength: {} }, messages)).toContain('mínimo 3');
    expect(firstErrorMessage({ maxlength: {} }, PRODUCT_FORM_ERROR_MESSAGES.name)).toContain(
      'máximo 100',
    );
  });

  it('usa un mensaje genérico para errores sin texto definido', () => {
    expect(firstErrorMessage({ pattern: true }, messages)).toBe(FALLBACK_ERROR_MESSAGE);
  });
});
