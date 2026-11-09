import { TestBed } from '@angular/core/testing';

import { DEFAULT_NOTIFICATION_DURATION_MS, NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => jest.useRealTimers());

  it('agrega notificaciones de cada tipo', () => {
    service.success('Creado');
    service.error('Falló');
    service.info('Aviso');

    expect(service.notifications().map(({ type, message }) => ({ type, message }))).toEqual([
      { type: 'success', message: 'Creado' },
      { type: 'error', message: 'Falló' },
      { type: 'info', message: 'Aviso' },
    ]);
  });

  it('asigna ids únicos a cada notificación', () => {
    service.info('a');
    service.info('b');

    const [first, second] = service.notifications();
    expect(first.id).not.toBe(second.id);
  });

  it('elimina una notificación al descartarla', () => {
    service.success('Creado');
    const [notification] = service.notifications();

    service.dismiss(notification.id);

    expect(service.notifications()).toEqual([]);
  });

  it('se descarta automáticamente después del tiempo configurado', () => {
    service.error('Falló');

    jest.advanceTimersByTime(DEFAULT_NOTIFICATION_DURATION_MS - 1);
    expect(service.notifications()).toHaveLength(1);

    jest.advanceTimersByTime(1);
    expect(service.notifications()).toHaveLength(0);
  });
});
