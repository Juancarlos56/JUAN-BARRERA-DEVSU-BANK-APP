import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  readonly id: number;
  readonly type: NotificationType;
  readonly message: string;
}

export const DEFAULT_NOTIFICATION_DURATION_MS = 4000;

/** Gestiona los mensajes visuales (toasts) que se muestran al usuario. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationsState = signal<readonly AppNotification[]>([]);
  private nextId = 0;

  readonly notifications = this.notificationsState.asReadonly();

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  dismiss(id: number): void {
    this.notificationsState.update((list) => list.filter((item) => item.id !== id));
  }

  private show(
    type: NotificationType,
    message: string,
    durationMs = DEFAULT_NOTIFICATION_DURATION_MS,
  ): void {
    const notification: AppNotification = { id: ++this.nextId, type, message };
    this.notificationsState.update((list) => [...list, notification]);
    setTimeout(() => this.dismiss(notification.id), durationMs);
  }
}
