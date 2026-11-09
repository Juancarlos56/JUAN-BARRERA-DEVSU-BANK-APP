import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Envoltorio de un campo: etiqueta, control proyectado y mensaje de error o ayuda.
 * El control proyectado debe enlazar `aria-describedby` con `{{controlId}}-message`.
 */
@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly controlId = input.required<string>();
  readonly error = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly disabled = input(false);
}
