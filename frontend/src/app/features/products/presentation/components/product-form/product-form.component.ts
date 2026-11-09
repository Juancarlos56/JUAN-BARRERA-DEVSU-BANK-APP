import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CLOCK } from '@core/config/clock';
import { toIsoDate } from '@shared/utils/date.utils';
import { FormFieldComponent } from '@shared/ui/form-field/form-field.component';
import { VerifyProductIdUseCase } from '../../../application';
import { PRODUCT_RULES, Product, ProductDateRules } from '../../../domain';
import {
  PRODUCT_FORM_ERROR_MESSAGES,
  ProductFormField,
  firstErrorMessage,
} from '../../forms/product-form.messages';
import {
  productIdAvailableValidator,
  releaseDateValidator,
  requiredTrimmed,
  revisionDateValidator,
} from '../../forms/product-form.validators';

/**
 * Formulario de producto (D2). Encapsula la construcción, validación y lectura del
 * formulario; quien lo usa solo recibe un `Product` válido mediante `save`.
 */
@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, FormFieldComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {
  readonly submitting = input(false);
  readonly submitLabel = input('Agregar');
  readonly save = output<Product>();

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly verifyProductId = inject(VerifyProductIdUseCase);
  private readonly clock = inject(CLOCK);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly today = (): string => toIsoDate(this.clock());

  protected readonly rules = PRODUCT_RULES;
  protected readonly minReleaseDate = this.today();

  protected readonly form = this.formBuilder.group({
    id: this.formBuilder.control('', {
      validators: [
        requiredTrimmed,
        Validators.minLength(PRODUCT_RULES.id.minLength),
        Validators.maxLength(PRODUCT_RULES.id.maxLength),
      ],
      asyncValidators: [productIdAvailableValidator(this.verifyProductId)],
    }),
    name: [
      '',
      [
        requiredTrimmed,
        Validators.minLength(PRODUCT_RULES.name.minLength),
        Validators.maxLength(PRODUCT_RULES.name.maxLength),
      ],
    ],
    description: [
      '',
      [
        requiredTrimmed,
        Validators.minLength(PRODUCT_RULES.description.minLength),
        Validators.maxLength(PRODUCT_RULES.description.maxLength),
      ],
    ],
    logo: ['', [requiredTrimmed]],
    dateRelease: ['', [Validators.required, releaseDateValidator(this.today)]],
    dateRevision: ['', [Validators.required, revisionDateValidator('dateRelease')]],
  });

  constructor() {
    const { dateRelease, dateRevision } = this.form.controls;

    // D2: la fecha de revisión se calcula automáticamente a partir de la de liberación.
    dateRelease.valueChanges.pipe(takeUntilDestroyed()).subscribe((release) => {
      dateRevision.setValue(ProductDateRules.revisionDateFor(release));
      if (dateRelease.touched) {
        dateRevision.markAsTouched();
      }
    });

    // Con OnPush y sin zone.js, los cambios de estado que no vienen de un evento del DOM
    // (p. ej. el fin de la validación asíncrona del id) deben marcar la vista para revisión.
    this.form.events.pipe(takeUntilDestroyed()).subscribe(() => this.changeDetector.markForCheck());
  }

  protected errorFor(field: ProductFormField): string | null {
    const control = this.form.controls[field];
    const shouldShow = control.invalid && (control.touched || control.dirty);
    return shouldShow
      ? firstErrorMessage(control.errors, PRODUCT_FORM_ERROR_MESSAGES[field])
      : null;
  }

  protected get isVerifyingId(): boolean {
    return this.form.controls.id.pending;
  }

  protected get canSubmit(): boolean {
    return this.form.valid && !this.submitting();
  }

  protected onSubmit(): void {
    if (!this.canSubmit) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue());
  }

  protected onReset(): void {
    this.form.reset();
  }
}
