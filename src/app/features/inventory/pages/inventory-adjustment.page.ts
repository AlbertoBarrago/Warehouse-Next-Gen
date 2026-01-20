import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { ProductSearchComponent } from '../components/product-search/product-search.component';
import { ProductListComponent } from '../components/product-list/product-list.component';
import { StockAdjustmentFormComponent } from '../components/stock-adjustment-form/stock-adjustment-form.component';
import { InventoryStore } from '../store/inventory.store';
import { NotificationService } from '@core/services/notification.service';

/**
 * Inventory Adjustment Page - Smart Component
 * 
 * This is the main page for the inventory adjustment feature.
 * It orchestrates the child components and handles the flow:
 * 1. User searches for a product
 * 2. User selects a product from the list
 * 3. Adjustment form appears with Signal-based fields
 * 4. User submits adjustment
 * 
 * Demonstrates:
 * - Zoneless change detection
 * - Signal-first architecture
 * - NgRx SignalStore integration
 * - Component composition
 */
@Component({
  selector: 'app-inventory-adjustment-page',
  standalone: true,
  imports: [
    ProductSearchComponent,
    ProductListComponent,
    StockAdjustmentFormComponent,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1>Inventory Adjustment</h1>
          <p class="subtitle">
            Search for products and update stock levels
          </p>
        </div>
        
        <div class="header-stats">
          <div class="stat">
            <span class="stat-value">{{ store.productsCount() }}</span>
            <span class="stat-label">Products</span>
          </div>
          <div class="stat warning">
            <span class="stat-value">{{ store.lowStockProducts().length }}</span>
            <span class="stat-label">Low Stock</span>
          </div>
          <div class="stat danger">
            <span class="stat-value">{{ store.outOfStockProducts().length }}</span>
            <span class="stat-label">Out of Stock</span>
          </div>
        </div>
      </header>

      <div class="page-content" [class.form-open]="showAdjustmentForm()">
        <section class="products-section">
          <app-product-search />
          <app-product-list 
            (productSelect)="onProductSelected()"
          />
        </section>

        @if (showAdjustmentForm()) {
          <aside class="adjustment-section">
            <app-stock-adjustment-form
              (close)="closeForm()"
              (adjusted)="onAdjustmentComplete()"
            />
          </aside>
        }
      </div>

      @if (store.hasError()) {
        <div class="error-banner">
          <span>{{ store.error() }}</span>
          <button (click)="store.clearError()">Dismiss</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background: var(--bg-tertiary, #f3f4f6);
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px 32px;
      background: var(--bg-primary, #ffffff);
      border-bottom: 1px solid var(--border-color, #e5e7eb);
    }
    
    .header-content {
      h1 {
        margin: 0 0 4px;
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary, #1f2937);
      }
      
      .subtitle {
        margin: 0;
        font-size: 14px;
        color: var(--text-muted, #6b7280);
      }
    }
    
    .header-stats {
      display: flex;
      gap: 24px;
    }
    
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 20px;
      background: var(--bg-secondary, #f9fafb);
      border-radius: 8px;
      
      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary, #1f2937);
      }
      
      .stat-label {
        font-size: 12px;
        color: var(--text-muted, #6b7280);
        text-transform: uppercase;
      }
      
      &.warning {
        background: #fef3c7;
        .stat-value { color: #92400e; }
        .stat-label { color: #b45309; }
      }
      
      &.danger {
        background: #fee2e2;
        .stat-value { color: #991b1b; }
        .stat-label { color: #b91c1c; }
      }
    }
    
    .page-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      padding: 24px 32px;
      transition: grid-template-columns 0.3s ease;
      
      &.form-open {
        grid-template-columns: 1fr 420px;
      }
    }
    
    .products-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .adjustment-section {
      position: sticky;
      top: 24px;
      height: fit-content;
    }
    
    .error-banner {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 20px;
      background: #fee2e2;
      color: #991b1b;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      
      button {
        padding: 4px 12px;
        border: none;
        background: #fca5a5;
        color: #991b1b;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        
        &:hover {
          background: #f87171;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryAdjustmentPage {
  readonly store = inject(InventoryStore);
  private readonly notification = inject(NotificationService);

  readonly showAdjustmentForm = signal(false);

  onProductSelected(): void {
    this.showAdjustmentForm.set(true);
  }

  closeForm(): void {
    this.showAdjustmentForm.set(false);
  }

  onAdjustmentComplete(): void {
    this.notification.success('Stock adjusted successfully!');
    // Keep form open to allow multiple adjustments
  }
}
