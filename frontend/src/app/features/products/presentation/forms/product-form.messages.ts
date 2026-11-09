import { ValidationErrors } from '@angular/forms';

import { PRODUCT_RULES } from '../../domain';

export type ProductFormField =
  'id' | 'name' | 'description' | 'logo' | 'dateRelease' | 'dateRevision';

type ErrorMessages = Readonly<Record<string, string>>;

const REQUIRED = 'Este campo es requerido!';
const INVALID_DATE = 'Ingresa una fecha válida.';
const { id, name, description } = PRODUCT_RULES;

/** Mensajes visibles por campo y por tipo de error de validación. */
export const PRODUCT_FORM_ERROR_MESSAGES: Readonly<Record<ProductFormField, ErrorMessages>> = {
  id: {
    required: REQUIRED,
    minlength: `ID no válido! Debe tener mínimo ${id.minLength} caracteres.`,
    maxlength: `ID no válido! Debe tener máximo ${id.maxLength} caracteres.`,
    idTaken: 'ID no válido! Ya existe un producto con este ID.',
    idUnverified: 'No se pudo verificar el ID. Intenta nuevamente.',
  },
  name: {
    required: REQUIRED,
    minlength: `Debe tener mínimo ${name.minLength} caracteres.`,
    maxlength: `Debe tener máximo ${name.maxLength} caracteres.`,
  },
  description: {
    required: REQUIRED,
    minlength: `Debe tener mínimo ${description.minLength} caracteres.`,
    maxlength: `Debe tener máximo ${description.maxLength} caracteres.`,
  },
  logo: {
    required: REQUIRED,
  },
  dateRelease: {
    required: REQUIRED,
    invalidDate: INVALID_DATE,
    releaseDateInPast: 'La fecha debe ser igual o mayor a la fecha actual.',
  },
  dateRevision: {
    required: REQUIRED,
    invalidDate: INVALID_DATE,
    revisionDateMismatch: 'Debe ser exactamente un año posterior a la fecha de liberación.',
  },
};

export const FALLBACK_ERROR_MESSAGE = 'Campo no válido.';

/** Devuelve el mensaje del primer error conocido del campo, o `null` si no hay errores. */
export const firstErrorMessage = (
  errors: ValidationErrors | null,
  messages: ErrorMessages,
): string | null => {
  if (!errors) {
    return null;
  }
  const key = Object.keys(errors).find((errorKey) => errorKey in messages);
  return key ? messages[key] : FALLBACK_ERROR_MESSAGE;
};
