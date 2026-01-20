import {
  Component,
  ChangeDetectionStrategy,
  inject,
  output,
} from '@angular/core';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { InventoryStore } from '../../store/inventory.store';

/**
 * Product search component with debounced Signal-based search
 * 
 * Connects the shared SearchInput to the InventoryStore
 * Demonstrates Signal-first architecture in action
 */
@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [SearchInputComponent],
  template: `
    <div class="product-search">
      <app-search-input
        placeholder="Search by SKU, name, or description..."
        [debounceMs]="300"
        [isLoading]="store.isLoadingProducts()"
        (searchChange)="onSearch($event)"
      />
      
      @if (store.productsCount() > 0) {
        <div class="search-stats">
          <span class="count">{{ store.productsCount() }} products found</span>
          @if (store.criticalStockCount() > 0) {
            <span class="warning">
              {{ store.criticalStockCount() }} with critical stock
            </span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .product-search {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .search-stats {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 13px;
      padding: 0 4px;
    }
    
    .count {
      color: var(--text-muted, #6b7280);
    }
    
    .warning {
      color: var(--warning-color, #f59e0b);
      font-weight: 500;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSearchComponent {
  readonly store = inject(InventoryStore);
  readonly productSelected = output<string>();

  onSearch(query: string): void {
    this.store.searchProducts(query);
  }
}
