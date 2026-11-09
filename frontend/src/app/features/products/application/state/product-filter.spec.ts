import { buildProduct } from '../../testing/product.fixtures';
import { filterProducts } from './product-filter';

describe('filterProducts', () => {
  const products = [
    buildProduct({ id: 'trj-crd', name: 'Tarjeta de Crédito', description: 'Consumo a crédito' }),
    buildProduct({ id: 'cta-aho', name: 'Cuenta de Ahorros', description: 'Ahorro programado' }),
    buildProduct({ id: 'inv-01', name: 'Inversión a plazo', description: 'Rentabilidad fija' }),
  ];

  it('devuelve todos los productos si el término está vacío', () => {
    expect(filterProducts(products, '   ')).toEqual(products);
  });

  it('busca por nombre sin distinguir mayúsculas ni tildes', () => {
    expect(filterProducts(products, 'CREDITO').map((p) => p.id)).toEqual(['trj-crd']);
  });

  it('busca por descripción', () => {
    expect(filterProducts(products, 'rentabilidad').map((p) => p.id)).toEqual(['inv-01']);
  });

  it('busca por id', () => {
    expect(filterProducts(products, 'cta').map((p) => p.id)).toEqual(['cta-aho']);
  });

  it('devuelve una lista vacía si no hay coincidencias', () => {
    expect(filterProducts(products, 'hipoteca')).toEqual([]);
  });
});
