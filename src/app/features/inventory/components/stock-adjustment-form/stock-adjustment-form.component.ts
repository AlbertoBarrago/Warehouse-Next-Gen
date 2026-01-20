import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { InventoryStore } from '../../store/inventory.store';
import { 
  Product, 
  StockAdjustmentFormData, 
  AdjustmentType, 
  AdjustmentReason 
} from '../../models/inventory.models';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

/**
 * Signal-based Form for Stock Adjustment
 * 
 * This component demonstrates Angular 21's Signal Forms approach:
 * - All form fields are signals
 * - Validation is computed from signals
 * - No FormGroup/FormControl from ReactiveFormsModule
 * - Change detection is automatic and granular
 * 
 * Benefits for warehouse operations:
 * - Instant feedback on stock changes
 * - Real-time validation without zone.js overhead
 * - Predictable state updates
 */
@Component({
  selector: 'app-stock-adjustment-form',
  standalone: true,
  imports: [FormsModule, LoadingSpinnerComponent, TitleCasePipe],
  template: `
    @if (product(); as prod) {
      <div class="adjustment-form">
        <header class="form-header">
          <h3>Adjust Stock</h3>
          <button 
            type="button" 
            class="close-button"
            (click)="onClose()"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <div class="product-info">
          <div class="product-header">
            <span class="sku">{{ prod.sku }}</span>
            <span class="status" [attr.data-status]="prod.status">
              {{ prod.status | titlecase }}
            </span>
          </div>
          <h4 class="product-name">{{ prod.name }}</h4>
          <p class="product-location">
            Location: {{ formatLocation(prod.location) }}
          </p>
        </div>

        <div class="stock-display">
          <div class="stock-card current">
            <span class="label">Current Stock</span>
            <span class="value">{{ prod.currentStock }}</span>
            <span class="unit">{{ prod.unit }}</span>
          </div>
          <div class="stock-arrow">→</div>
          <div class="stock-card new" [class.invalid]="!isStockValid()">
            <span class="label">New Stock</span>
            <span class="value">{{ newStock() }}</span>
            <span class="unit">{{ prod.unit }}</span>
          </div>
        </div>

        <form class="form-fields" (ngSubmit)="onSubmit()">
          <!-- Adjustment Type -->
          <div class="field">
            <label for="adjustmentType">Adjustment Type</label>
            <select
              id="adjustmentType"
              [ngModel]="adjustmentType()"
              (ngModelChange)="adjustmentType.set($event)"
              name="adjustmentType"
            >
              @for (type of adjustmentTypes; track type.value) {
                <option [value]="type.value">{{ type.label }}</option>
              }
            </select>
          </div>

          <!-- New Stock Level -->
          <div class="field">
            <label for="newStock">New Stock Level</label>
            <input
              type="number"
              id="newStock"
              [ngModel]="newStock()"
              (ngModelChange)="newStock.set($event)"
              name="newStock"
              [min]="0"
              [max]="product()?.maxStock ?? 999999"
              [class.invalid]="!isStockValid()"
            />
            @if (!isStockValid()) {
              <span class="error-message">{{ stockError() }}</span>
            }
            <span class="hint">
              Min: {{ prod.minStock }} | Max: {{ prod.maxStock }}
            </span>
          </div>

          <!-- Reason -->
          <div class="field">
            <label for="reason">Reason</label>
            <select
              id="reason"
              [ngModel]="reason()"
              (ngModelChange)="reason.set($event)"
              name="reason"
            >
              @for (r of reasons; track r.value) {
                <option [value]="r.value">{{ r.label }}</option>
              }
            </select>
          </div>

          <!-- Notes -->
          <div class="field">
            <label for="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              [ngModel]="notes()"
              (ngModelChange)="notes.set($event)"
              name="notes"
              rows="3"
              placeholder="Add any additional details..."
            ></textarea>
          </div>

          <!-- Stock Change Summary -->
          @if (stockDifference() !== 0) {
            <div class="change-summary" [class.increase]="stockDifference() > 0" [class.decrease]="stockDifference() < 0">
              <span class="change-icon">
                @if (stockDifference() > 0) { ↑ } @else { ↓ }
              </span>
              <span class="change-text">
                {{ stockDifference() > 0 ? '+' : '' }}{{ stockDifference() }} {{ prod.unit }}
              </span>
            </div>
          }

          <!-- Actions -->
          <div class="form-actions">
            <button 
              type="button" 
              class="btn btn-secondary"
              (click)="onClose()"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="!isFormValid() || store.isAdjusting()"
            >
              @if (store.isAdjusting()) {
                <app-loading-spinner [size]="16" />
                Adjusting...
              } @else {
                Confirm Adjustment
              }
            </button>
          </div>
        </form>
      </div>
    } @else {
      <div class="no-product">
        <p>Select a product to adjust stock</p>
      </div>
    }
  `,
  styles: [`
    .adjustment-form {
      background: var(--bg-primary, #ffffff);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      background: var(--bg-secondary, #f9fafb);
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
    }
    
    .close-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      color: var(--text-muted, #6b7280);
      transition: background 0.15s, color 0.15s;
      
      &:hover {
        background: var(--bg-hover, #e5e7eb);
        color: var(--text-primary, #1f2937);
      }
      
      svg {
        width: 18px;
        height: 18px;
        stroke-width: 2;
      }
    }
    
    .product-info {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
    }
    
    .product-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    
    .sku {
      font-family: monospace;
      font-size: 13px;
      color: var(--text-muted, #6b7280);
      background: var(--bg-secondary, #f3f4f6);
      padding: 2px 8px;
      border-radius: 4px;
    }
    
    .status {
      font-size: 12px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 4px;
      
      &[data-status="in_stock"] {
        background: #dcfce7;
        color: #166534;
      }
      
      &[data-status="low_stock"] {
        background: #fef3c7;
        color: #92400e;
      }
      
      &[data-status="out_of_stock"] {
        background: #fee2e2;
        color: #991b1b;
      }
    }
    
    .product-name {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 600;
    }
    
    .product-location {
      margin: 0;
      font-size: 13px;
      color: var(--text-muted, #6b7280);
    }
    
    .stock-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 20px;
      background: var(--bg-secondary, #f9fafb);
    }
    
    .stock-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 24px;
      background: var(--bg-primary, #ffffff);
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 8px;
      
      &.current {
        border-color: var(--text-muted, #9ca3af);
      }
      
      &.new {
        border-color: var(--primary-color, #3b82f6);
        
        &.invalid {
          border-color: var(--error-color, #ef4444);
        }
      }
      
      .label {
        font-size: 12px;
        text-transform: uppercase;
        color: var(--text-muted, #6b7280);
        margin-bottom: 4px;
      }
      
      .value {
        font-size: 32px;
        font-weight: 700;
        color: var(--text-primary, #1f2937);
      }
      
      .unit {
        font-size: 13px;
        color: var(--text-muted, #6b7280);
      }
    }
    
    .stock-arrow {
      font-size: 24px;
      color: var(--text-muted, #9ca3af);
    }
    
    .form-fields {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      
      label {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary, #374151);
      }
      
      input, select, textarea {
        padding: 10px 12px;
        border: 1px solid var(--border-color, #d1d5db);
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.15s, box-shadow 0.15s;
        
        &:focus {
          outline: none;
          border-color: var(--primary-color, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        &.invalid {
          border-color: var(--error-color, #ef4444);
        }
      }
      
      textarea {
        resize: vertical;
        min-height: 80px;
      }
      
      .hint {
        font-size: 12px;
        color: var(--text-muted, #6b7280);
      }
      
      .error-message {
        font-size: 12px;
        color: var(--error-color, #ef4444);
      }
    }
    
    .change-summary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border-radius: 8px;
      font-weight: 600;
      
      &.increase {
        background: #dcfce7;
        color: #166534;
      }
      
      &.decrease {
        background: #fee2e2;
        color: #991b1b;
      }
      
      .change-icon {
        font-size: 18px;
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color, #e5e7eb);
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, opacity 0.15s;
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
    
    .btn-primary {
      background: var(--primary-color, #3b82f6);
      color: white;
      
      &:hover:not(:disabled) {
        background: var(--primary-hover, #2563eb);
      }
    }
    
    .btn-secondary {
      background: var(--bg-secondary, #f3f4f6);
      color: var(--text-primary, #374151);
      
      &:hover:not(:disabled) {
        background: var(--bg-hover, #e5e7eb);
      }
    }
    
    .no-product {
      padding: 48px 24px;
      text-align: center;
      color: var(--text-muted, #9ca3af);
      border: 2px dashed var(--border-color, #e5e7eb);
      border-radius: 12px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockAdjustmentFormComponent {
  readonly store = inject(InventoryStore);

  // Output for closing the form
  readonly close = output<void>();
  readonly adjusted = output<StockAdjustmentFormData>();

  // ============================================
  // SIGNAL-BASED FORM FIELDS
  // ============================================
  // Each form field is a writable signal - no FormControl needed!
  readonly newStock = signal<number>(0);
  readonly adjustmentType = signal<AdjustmentType>('correction');
  readonly reason = signal<AdjustmentReason>('inventory_count');
  readonly notes = signal<string>('');

  // Computed: Get selected product from store
  readonly product = computed(() => this.store.selectedProduct());

  // ============================================
  // COMPUTED VALIDATIONS
  // Validation logic runs automatically when signals change
  // ============================================
  readonly isStockValid = computed(() => {
    const prod = this.product();
    const stock = this.newStock();
    
    if (!prod) return false;
    if (stock < 0) return false;
    if (stock > prod.maxStock) return false;
    
    return true;
  });

  readonly stockError = computed(() => {
    const prod = this.product();
    const stock = this.newStock();
    
    if (!prod) return '';
    if (stock < 0) return 'Stock cannot be negative';
    if (stock > prod.maxStock) return `Cannot exceed max stock (${prod.maxStock})`;
    
    return '';
  });

  readonly stockDifference = computed(() => {
    const prod = this.product();
    if (!prod) return 0;
    return this.newStock() - prod.currentStock;
  });

  readonly isFormValid = computed(() => {
    return this.isStockValid() && this.adjustmentType() && this.reason();
  });

  // ============================================
  // DROPDOWN OPTIONS
  // ============================================
  readonly adjustmentTypes: { value: AdjustmentType; label: string }[] = [
    { value: 'increase', label: 'Stock Increase' },
    { value: 'decrease', label: 'Stock Decrease' },
    { value: 'correction', label: 'Inventory Correction' },
    { value: 'transfer_in', label: 'Transfer In' },
    { value: 'transfer_out', label: 'Transfer Out' },
  ];

  readonly reasons: { value: AdjustmentReason; label: string }[] = [
    { value: 'received_shipment', label: 'Received Shipment' },
    { value: 'sold', label: 'Sold' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'lost', label: 'Lost' },
    { value: 'returned', label: 'Returned' },
    { value: 'inventory_count', label: 'Inventory Count' },
    { value: 'transfer', label: 'Warehouse Transfer' },
    { value: 'other', label: 'Other' },
  ];

  constructor() {
    // Sync newStock with selected product's current stock
    effect(() => {
      const prod = this.product();
      if (prod) {
        this.newStock.set(prod.currentStock);
      }
    });
  }

  formatLocation(location: Product['location']): string {
    return `Zone ${location.zone}, Aisle ${location.aisle}, Rack ${location.rack}, Shelf ${location.shelf}`;
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    const formData: StockAdjustmentFormData = {
      productId: this.product()!.id,
      newStock: this.newStock(),
      adjustmentType: this.adjustmentType(),
      reason: this.reason(),
      notes: this.notes() || undefined,
    };

    this.store.adjustStock(formData);
    this.adjusted.emit(formData);
  }

  onClose(): void {
    this.store.clearSelectedProduct();
    this.close.emit();
  }
}
