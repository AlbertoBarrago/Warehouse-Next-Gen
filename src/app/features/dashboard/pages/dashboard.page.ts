import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryStore } from '@features/inventory/store/inventory.store';
import { AuthService } from '@core/auth/auth.service';

/**
 * Dashboard Page - Entry point for the warehouse application
 */
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Warehouse Next-Gen</h1>
          <p class="welcome">Welcome back, {{ auth.userName() }}!</p>
        </div>
      </header>

      <main class="dashboard-content">
        <section class="quick-stats">
          <div class="stat-card">
            <div class="stat-icon products">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ inventoryStore.productsCount() }}</span>
              <span class="stat-label">Total Products</span>
            </div>
          </div>

          <div class="stat-card warning">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ inventoryStore.lowStockProducts().length }}</span>
              <span class="stat-label">Low Stock Alerts</span>
            </div>
          </div>

          <div class="stat-card danger">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ inventoryStore.outOfStockProducts().length }}</span>
              <span class="stat-label">Out of Stock</span>
            </div>
          </div>
        </section>

        <section class="quick-actions">
          <h2 class="text-white">Quick Actions</h2>
          <div class="actions-grid">
            <a routerLink="/inventory/adjustment" class="action-card">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
              <div class="action-info">
                <h3>Adjust Inventory</h3>
                <p>Update stock levels for products</p>
              </div>
            </a>
          </div>
        </section>

        <section class="signal-info">
          <h2>Signal-First Architecture Demo</h2>
          <p>
            This application demonstrates Angular 21's Signal-first approach.
            All state management uses Signals and NgRx SignalStore for
            optimal performance in warehouse environments with high-frequency updates.
          </p>
          <div class="features">
            <div class="feature">
              <strong>Zoneless Mode</strong>
              <span>No zone.js overhead</span>
            </div>
            <div class="feature">
              <strong>Signal Forms</strong>
              <span>Reactive form fields</span>
            </div>
            <div class="feature">
              <strong>SignalStore</strong>
              <span>Type-safe state</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: var(--bg-tertiary, #f3f4f6);
    }
    
    .dashboard-header {
      padding: 32px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      
      h1 {
        margin: 0 0 8px;
        font-size: 28px;
        font-weight: 700;
      }
      
      .welcome {
        margin: 0;
        opacity: 0.9;
        font-size: 16px;
      }
    }
    
    .dashboard-content {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .quick-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: #eff6ff;
        border-radius: 12px;
        
        svg {
          width: 24px;
          height: 24px;
          color: #3b82f6;
          stroke-width: 2;
        }
      }
      
      &.warning .stat-icon {
        background: #fef3c7;
        svg { color: #f59e0b; }
      }
      
      &.danger .stat-icon {
        background: #fee2e2;
        svg { color: #ef4444; }
      }
      
      .stat-value {
        display: block;
        font-size: 28px;
        font-weight: 700;
        color: #1f2937;
      }
      
      .stat-label {
        font-size: 13px;
        color: #6b7280;
      }
    }
    
    .quick-actions {
      margin-bottom: 32px;
      
      h2 {
        margin: 0 0 16px;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }
    }
    
    .quick-actions h2 {
      color: white
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    
    .action-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-decoration: none;
      transition: transform 0.15s, box-shadow 0.15s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .action-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: #eff6ff;
        border-radius: 12px;
        
        svg {
          width: 24px;
          height: 24px;
          color: #3b82f6;
          stroke-width: 2;
        }
      }
      
      h3 {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }
      
      p {
        margin: 0;
        font-size: 13px;
        color: #6b7280;
      }
    }
    
    .signal-info {
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      h2 {
        margin: 0 0 12px;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }
      
      p {
        margin: 0 0 20px;
        color: #4b5563;
        line-height: 1.6;
      }
      
      .features {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
      }
      
      .feature {
        display: flex;
        flex-direction: column;
        padding: 12px 16px;
        background: #f9fafb;
        border-radius: 8px;
        
        strong {
          font-size: 14px;
          color: #1f2937;
        }
        
        span {
          font-size: 12px;
          color: #6b7280;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  readonly inventoryStore = inject(InventoryStore);
  readonly auth = inject(AuthService);
}
