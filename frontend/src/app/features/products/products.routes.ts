import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    title: 'Banco | Productos Financieros',
    loadComponent: () =>
      import('./presentation/pages/product-list/product-list.page').then((m) => m.ProductListPage),
  },
];
