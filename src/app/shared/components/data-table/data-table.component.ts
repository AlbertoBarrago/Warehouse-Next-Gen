import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  contentChild,
  TemplateRef,
} from '@angular/core';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

/**
 * Generic data table component with Signal-based inputs
 * 
 * Features:
 * - Generic typing for row data
 * - Configurable columns
 * - Loading state
 * - Empty state
 * - Row click handling
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  template: `
    <div class="table-container">
      @if (isLoading()) {
        <app-loading-spinner [overlay]="true" message="Loading data..." />
      }
      
      <table class="data-table">
        <thead>
          <tr>
            @for (column of columns(); track column.key) {
              <th 
                [style.width]="column.width"
                [style.text-align]="column.align ?? 'left'"
              >
                {{ column.header }}
              </th>
            }
          </tr>
        </thead>
        
        <tbody>
          @if (data().length === 0 && !isLoading()) {
            <tr class="empty-row">
              <td [attr.colspan]="columns().length">
                <div class="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4"/>
                  </svg>
                  <span>{{ emptyMessage() }}</span>
                </div>
              </td>
            </tr>
          } @else {
            @for (row of data(); track trackByFn()(row); let i = $index) {
              <tr 
                class="data-row"
                [class.clickable]="rowClickable()"
                (click)="onRowClick(row)"
              >
                @for (column of columns(); track column.key) {
                  <td [style.text-align]="column.align ?? 'left'">
                    {{ getCellValue(row, column.key) }}
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
      
      @if (showPagination() && totalItems() > 0) {
        <div class="pagination">
          <span class="pagination-info">
            Showing {{ startItem() }}-{{ endItem() }} of {{ totalItems() }}
          </span>
        </div>
      }
    </div>
  `,
  styles: [`
    .table-container {
      position: relative;
      background: var(--bg-primary, #ffffff);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-color, #e5e7eb);
      }
      
      th {
        background: var(--bg-secondary, #f9fafb);
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted, #6b7280);
      }
      
      td {
        font-size: 14px;
        color: var(--text-primary, #1f2937);
      }
    }
    
    .data-row {
      transition: background 0.15s;
      
      &:hover {
        background: var(--bg-hover, #f3f4f6);
      }
      
      &.clickable {
        cursor: pointer;
      }
      
      &:last-child td {
        border-bottom: none;
      }
    }
    
    .empty-row td {
      padding: 48px 16px;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--text-muted, #9ca3af);
      
      svg {
        width: 48px;
        height: 48px;
        stroke-width: 1.5;
      }
    }
    
    .pagination {
      display: flex;
      justify-content: flex-end;
      padding: 12px 16px;
      background: var(--bg-secondary, #f9fafb);
      border-top: 1px solid var(--border-color, #e5e7eb);
    }
    
    .pagination-info {
      font-size: 13px;
      color: var(--text-muted, #6b7280);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T> {
  // Signal Inputs
  readonly data = input.required<T[]>();
  readonly columns = input.required<TableColumn<T>[]>();
  readonly isLoading = input<boolean>(false);
  readonly emptyMessage = input<string>('No data available');
  readonly rowClickable = input<boolean>(false);
  readonly trackByFn = input<(item: T) => unknown>((item: T) => (item as Record<string, unknown>)['id'] ?? item);
  readonly showPagination = input<boolean>(false);
  readonly totalItems = input<number>(0);
  readonly currentPage = input<number>(1);
  readonly pageSize = input<number>(10);

  // Signal Outputs
  readonly rowClick = output<T>();

  // Computed values for pagination
  readonly startItem = computed(() => 
    (this.currentPage() - 1) * this.pageSize() + 1
  );
  
  readonly endItem = computed(() => 
    Math.min(this.currentPage() * this.pageSize(), this.totalItems())
  );

  getCellValue(row: T, key: keyof T | string): unknown {
    return (row as Record<string, unknown>)[key as string];
  }

  onRowClick(row: T): void {
    if (this.rowClickable()) {
      this.rowClick.emit(row);
    }
  }
}
