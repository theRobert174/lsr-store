import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  {
    path: 'auth',
    title: 'Explora la demo | LSR Librería',
    loadComponent: () =>
      import('./features/auth/pages/AuthPage/AuthPage').then((page) => page.AuthPage),
  },
  {
    path: 'seller/catalog',
    title: 'Catálogo | LSR Librería',
    loadComponent: () =>
      import('./features/seller/pages/catalog/CatalogPage').then((page) => page.CatalogPage),
  },
  {
    path: 'seller/checkout',
    title: 'Resumen de compra | LSR Librería',
    loadComponent: () =>
      import('./features/seller/pages/checkout/CheckoutPage').then((page) => page.CheckoutPage),
  },
  {
    path: 'seller/receipt/:id',
    title: 'Ticket de venta simulada | LSR Librería',
    loadComponent: () =>
      import('./features/seller/pages/receipt/ReceiptPage').then((page) => page.ReceiptPage),
  },
  { path: '**', redirectTo: 'auth' },
];
