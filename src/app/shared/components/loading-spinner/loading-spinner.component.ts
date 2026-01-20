import { Component, ChangeDetectionStrategy, input } from '@angular/core';

/**
 * Reusable loading spinner component
 * 
 * Features:
 * - Configurable size
 * - Optional overlay mode
 * - Accessible loading message
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div 
      class="spinner-container" 
      [class.overlay]="overlay()"
      [class.inline]="!overlay()"
      role="status"
      aria-live="polite"
    >
      <div 
        class="spinner"
        [style.width.px]="size()"
        [style.height.px]="size()"
      ></div>
      @if (message()) {
        <span class="spinner-message">{{ message() }}</span>
      }
      <span class="sr-only">Loading...</span>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      
      &.overlay {
        position: fixed;
        inset: 0;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(2px);
        z-index: 1000;
      }
      
      &.inline {
        padding: 24px;
      }
    }
    
    .spinner {
      border: 3px solid var(--border-color, #e5e7eb);
      border-top-color: var(--primary-color, #3b82f6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    .spinner-message {
      font-size: 14px;
      color: var(--text-muted, #6b7280);
    }
    
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  readonly size = input<number>(40);
  readonly overlay = input<boolean>(false);
  readonly message = input<string>('');
}
