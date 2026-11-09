import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationService } from '../notification.service';
import { ToastContainerComponent } from './toast-container.component';

describe('ToastContainerComponent', () => {
  let fixture: ComponentFixture<ToastContainerComponent>;
  let service: NotificationService;
  let element: HTMLElement;

  beforeEach(async () => {
    jest.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ToastContainerComponent);
    service = TestBed.inject(NotificationService);
    element = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => jest.useRealTimers());

  const toasts = () => Array.from(element.querySelectorAll<HTMLElement>('.toast'));

  it('no muestra toasts cuando no hay notificaciones', () => {
    fixture.detectChanges();

    expect(toasts()).toHaveLength(0);
  });

  it('muestra los errores con role="alert" y su estilo', () => {
    service.error('No se pudo conectar');
    fixture.detectChanges();

    const [toast] = toasts();
    expect(toast.textContent).toContain('No se pudo conectar');
    expect(toast.getAttribute('role')).toBe('alert');
    expect(toast.classList).toContain('toast--error');
  });

  it('muestra los mensajes de éxito con role="status"', () => {
    service.success('Producto agregado');
    fixture.detectChanges();

    const [toast] = toasts();
    expect(toast.getAttribute('role')).toBe('status');
    expect(toast.classList).toContain('toast--success');
  });

  it('cierra el toast al presionar el botón de cerrar', () => {
    service.info('Aviso');
    fixture.detectChanges();

    toasts()[0].querySelector<HTMLButtonElement>('.toast__close')!.click();
    fixture.detectChanges();

    expect(toasts()).toHaveLength(0);
  });
});
