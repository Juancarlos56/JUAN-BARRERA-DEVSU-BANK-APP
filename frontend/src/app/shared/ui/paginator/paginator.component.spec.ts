import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {
  let fixture: ComponentFixture<PaginatorComponent>;
  let emitted: number[];

  const render = (page: number, totalPages: number) => {
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('totalPages', totalPages);
    fixture.detectChanges();
  };
  const button = (label: string) =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      `[aria-label="${label}"]`,
    )!;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginatorComponent);
    emitted = [];
    fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));
  });

  it('muestra la página actual y el total', () => {
    render(2, 5);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Página 2 de 5');
  });

  it('deshabilita "anterior" en la primera página', () => {
    render(1, 3);

    expect(button('Página anterior').disabled).toBe(true);
    expect(button('Página siguiente').disabled).toBe(false);
  });

  it('deshabilita "siguiente" en la última página', () => {
    render(3, 3);

    expect(button('Página siguiente').disabled).toBe(true);
  });

  it('emite la página anterior y la siguiente', () => {
    render(2, 3);

    button('Página anterior').click();
    button('Página siguiente').click();

    expect(emitted).toEqual([1, 3]);
  });

  it('no emite fuera de los límites', () => {
    render(1, 1);
    const component = fixture.componentInstance as unknown as { previous(): void; next(): void };

    component.previous();
    component.next();

    expect(emitted).toEqual([]);
  });
});
