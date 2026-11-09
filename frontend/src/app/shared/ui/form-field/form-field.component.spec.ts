import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { FormFieldComponent } from './form-field.component';

@Component({
  imports: [FormFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-field
      label="Nombre"
      controlId="name"
      [error]="error()"
      [hint]="hint()"
      [disabled]="disabled()"
    >
      <input id="name" class="projected" />
    </app-form-field>
  `,
})
class HostComponent {
  readonly error = signal<string | null>(null);
  readonly hint = signal<string | null>(null);
  readonly disabled = signal(false);
}

describe('FormFieldComponent', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  };

  it('asocia la etiqueta al control proyectado', () => {
    const { element } = setup();

    expect(element.querySelector('label')!.getAttribute('for')).toBe('name');
    expect(element.querySelector('label')!.textContent).toContain('Nombre');
    expect(element.querySelector('input.projected')).not.toBeNull();
  });

  it('muestra el error con prioridad sobre la ayuda', () => {
    const { fixture, element } = setup();

    fixture.componentInstance.hint.set('Ayuda');
    fixture.componentInstance.error.set('Este campo es requerido!');
    fixture.detectChanges();

    const message = element.querySelector('#name-message')!;
    expect(message.querySelector('.form-field__error')!.textContent).toContain(
      'Este campo es requerido!',
    );
    expect(message.textContent).not.toContain('Ayuda');
  });

  it('muestra la ayuda cuando no hay error', () => {
    const { fixture, element } = setup();

    fixture.componentInstance.hint.set('Verificando ID...');
    fixture.detectChanges();

    expect(element.querySelector('.form-field__hint')!.textContent).toContain('Verificando ID...');
  });

  it('aplica el estilo deshabilitado', () => {
    const { fixture, element } = setup();

    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    expect(element.querySelector('.form-field--disabled')).not.toBeNull();
  });
});
