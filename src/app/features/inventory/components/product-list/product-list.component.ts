import {
  Component,
  ChangeDetectionStrategy,
  inject,
  output,
} from '@angular/core';
import { DataTableComponent, TableColumn } from '@shared/components/data-table/data-table.component';
import { InventoryStore } from '../../store/inventory.store';
import { Product } from '../../models/inventory.models';

/**
 * Product list component displaying inventory items
 * 
 * Uses the shared DataTable with Signal-based data binding
 */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [DataTableComponent],
  template: `
    <app-data-table
      [data]="store.products()"
      [columns]="columns"
      [isLoading]="store.isLoadingProducts()"
      [rowClickable]="true"
      emptyMessage="No products found. Try a different search."
      (rowClick)="onProductSelect($event)"
    />
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  readonly store = inject(InventoryStore);
  readonly productSelect = output<Product>();

  readonly columns: TableColumn<Product>[] = [
    { key: 'sku', header: 'SKU', width: '120px' },
    { key: 'name', header: 'Product Name' },
    { key: 'category', header: 'Category', width: '120px' },
    { key: 'currentStock', header: 'Stock', width: '100px', align: 'right' },
    { key: 'unit', header: 'Unit', width: '80px' },
    { key: 'status', header: 'Status', width: '120px' },
  ];

  onProductSelect(product: Product): void {
    this.store.selectProduct(product.id);
    this.productSelect.emit(product);
  }
}
