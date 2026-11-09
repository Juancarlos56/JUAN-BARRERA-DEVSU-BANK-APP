import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';

import { getInitials } from '../../utils/text.utils';

/** Muestra una imagen circular y, si no existe o falla al cargar, las iniciales del nombre. */
@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  readonly src = input<string>('');
  readonly name = input.required<string>();

  /** Se reinicia cada vez que cambia `src`. */
  protected readonly imageFailed = linkedSignal({ source: this.src, computation: () => false });
  protected readonly initials = computed(() => getInitials(this.name()));
  protected readonly showImage = computed(() => !!this.src()?.trim() && !this.imageFailed());

  protected onImageError(): void {
    this.imageFailed.set(true);
  }
}
