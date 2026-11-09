import { TestBed } from '@angular/core/testing';

import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  it('aplica valores por defecto y se oculta a lectores de pantalla', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.classList).toContain('skeleton--text');
    expect(host.style.width).toBe('100%');
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('aplica la forma y el tamaño recibidos', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    fixture.componentRef.setInput('shape', 'circle');
    fixture.componentRef.setInput('width', '44px');
    fixture.componentRef.setInput('height', '44px');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.classList).toContain('skeleton--circle');
    expect(host.style.width).toBe('44px');
    expect(host.style.height).toBe('44px');
  });
});
