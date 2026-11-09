import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  let fixture: ComponentFixture<AvatarComponent>;
  let element: HTMLElement;

  const render = (inputs: { src?: string; name: string }) => {
    fixture.componentRef.setInput('name', inputs.name);
    if (inputs.src !== undefined) {
      fixture.componentRef.setInput('src', inputs.src);
    }
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarComponent);
    element = fixture.nativeElement as HTMLElement;
  });

  it('muestra la imagen cuando hay una URL', () => {
    render({ src: 'https://example.com/logo.png', name: 'Tarjeta Crédito' });

    const img = element.querySelector('img')!;
    expect(img.getAttribute('src')).toBe('https://example.com/logo.png');
    expect(img.getAttribute('alt')).toBe('Logo de Tarjeta Crédito');
  });

  it('muestra las iniciales cuando no hay URL', () => {
    render({ name: 'Tarjeta Crédito' });

    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('.avatar--initials')!.textContent!.trim()).toBe('TC');
  });

  it('cambia a iniciales si la imagen falla al cargar', () => {
    render({ src: 'https://example.com/roto.png', name: 'Cuenta Ahorro' });

    element.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(element.querySelector('img')).toBeNull();
    expect(element.textContent).toContain('CA');
  });

  it('vuelve a intentar mostrar la imagen cuando cambia la URL', () => {
    render({ src: 'https://example.com/roto.png', name: 'Cuenta Ahorro' });
    element.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    render({ src: 'https://example.com/nuevo.png', name: 'Cuenta Ahorro' });

    expect(element.querySelector('img')!.getAttribute('src')).toBe('https://example.com/nuevo.png');
  });
});
