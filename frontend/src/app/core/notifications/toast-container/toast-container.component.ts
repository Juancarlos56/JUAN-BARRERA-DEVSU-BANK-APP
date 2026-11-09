import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  protected readonly notificationService = inject(NotificationService);
}
