import { Pipe, PipeTransform } from '@angular/core';

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Formatea una fecha ISO (`YYYY-MM-DD`) como `dd/MM/yyyy`.
 * Trabaja sobre el texto para no depender de la zona horaria del navegador.
 */
@Pipe({ name: 'isoDate' })
export class IsoDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const match = ISO_DATE_PATTERN.exec(value);
    if (!match) {
      return value;
    }
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
}
