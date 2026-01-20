import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'adjustment',
    pathMatch: 'full',
  },
  {
    path: 'adjustment',
    loadComponent: () =>
      import('./pages/inventory-adjustment.page').then(
        (m) => m.InventoryAdjustmentPage
      ),
    title: 'Inventory Adjustment | Warehouse Next-Gen',
  },
];
