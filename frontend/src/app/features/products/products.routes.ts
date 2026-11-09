import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    title: 'Banco | Productos Financieros',
    loadComponent: () =>
      import('./presentation/pages/product-list/product-list.page').then((m) => m.ProductListPage),
  },
  {
    path: 'new',
    title: 'Banco | Agregar producto',
    loadComponent: () =>
      import('./presentation/pages/product-create/product-create.page').then(
        (m) => m.ProductCreatePage,
      ),
  },
  {
    path: ':id/edit',
    title: 'Banco | Editar producto',
    loadComponent: () =>
      import('./presentation/pages/product-edit/product-edit.page').then((m) => m.ProductEditPage),
  },
];
