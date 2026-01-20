import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('@features/dashboard/pages/dashboard.page').then(
        (m) => m.DashboardPage
      ),
    canActivate: [authGuard],
  },
  {
    path: 'inventory',
    loadChildren: () =>
      import('@features/inventory/inventory.routes').then(
        (m) => m.INVENTORY_ROUTES
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
