import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  effect,
  inject,
  DestroyRef,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Reusable search input component with debounced signal output
 * 
 * Features:
 * - Signal-based input/output (Angular 21)
 * - Configurable debounce delay
 * - Clear button
 * - Loading state indicator
 */
@Component({
  selector: 'app-search-input',
  standalone: true,
  template: `
    <div class="search-container" [class.is-loading]="isLoading()">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      
      <input
        type="text"
        class="search-input"
        [placeholder]="placeholder()"
        [value]="searchTerm()"
        (input)="onInput($event)"
        [disabled]="disabled()"
      />
      
      @if (searchTerm() && !isLoading()) {
        <button 
          type="button" 
          class="clear-button"
          (click)="clear()"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      }
      
      @if (isLoading()) {
        <div class="loading-spinner"></div>
      }
    </div>
  `,
  styles: [`
    .search-container {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 8px;
      padding: 0 12px;
      transition: border-color 0.2s, box-shadow 0.2s;
      
      &:focus-within {
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      &.is-loading {
        opacity: 0.7;
      }
    }
    
    .search-icon {
      width: 20px;
      height: 20px;
      color: var(--text-muted, #9ca3af);
      stroke-width: 2;
      flex-shrink: 0;
    }
    
    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 12px 8px;
      font-size: 14px;
      color: var(--text-primary, #1f2937);
      outline: none;
      
      &::placeholder {
        color: var(--text-muted, #9ca3af);
      }
      
      &:disabled {
        cursor: not-allowed;
      }
    }
    
    .clear-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: var(--bg-tertiary, #e5e7eb);
      border-radius: 50%;
      cursor: pointer;
      color: var(--text-muted, #9ca3af);
      transition: background 0.2s, color 0.2s;
      
      &:hover {
        background: var(--bg-hover, #d1d5db);
        color: var(--text-primary, #1f2937);
      }
      
      svg {
        width: 14px;
        height: 14px;
        stroke-width: 2;
      }
    }
    
    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border-color, #e0e0e0);
      border-top-color: var(--primary-color, #3b82f6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  private readonly destroyRef = inject(DestroyRef);

  // Signal Inputs (Angular 21)
  readonly placeholder = input<string>('Search...');
  readonly debounceMs = input<number>(300);
  readonly isLoading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly initialValue = input<string>('');

  // Signal Outputs (Angular 21)
  readonly searchChange = output<string>();

  // Internal state
  readonly searchTerm = signal('');

  constructor() {
    // Initialize with initialValue
    effect(() => {
      const initial = this.initialValue();
      if (initial) {
        this.searchTerm.set(initial);
      }
    });

    // Debounced search emission
    toObservable(this.searchTerm)
      .pipe(
        skip(1), // Skip initial value
        debounceTime(this.debounceMs()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((term) => {
        this.searchChange.emit(term);
      });
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  clear(): void {
    this.searchTerm.set('');
    this.searchChange.emit('');
  }
}
