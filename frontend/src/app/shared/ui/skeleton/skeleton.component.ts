import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SkeletonShape = 'text' | 'circle' | 'rect';

/** Bloque de precarga (skeleton) con animación de brillo. */
@Component({
  selector: 'app-skeleton',
  template: '',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[class]': '"skeleton skeleton--" + shape()',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
  },
})
export class SkeletonComponent {
  readonly shape = input<SkeletonShape>('text');
  readonly width = input('100%');
  readonly height = input('0.875rem');
}
