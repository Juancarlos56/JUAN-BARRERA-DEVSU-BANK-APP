import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from '@core/layout/header/header.component';
import { ToastContainerComponent } from '@core/notifications/toast-container/toast-container.component';

/** Shell de la aplicación: header, contenido enrutado y notificaciones globales. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
