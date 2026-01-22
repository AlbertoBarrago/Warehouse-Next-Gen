# Playground Angualar 21 – Architecture Documentation

## Project Overview

**Playground Angualar 21** is a study project designed to explore Angular 21's cutting-edge features, specifically focusing on Zoneless mode and Signal-based reactivity with NgRx SignalStore.

---

## What Has Been Built

### 1. Project Initialization

- **Package Manager**: Bun (v1.3.0) - chosen for its speed and modern JavaScript runtime
- **Framework**: Angular 21 with full Zoneless mode
- **State Management**: NgRx SignalStore (@ngrx/signals)
- **Testing**: Vitest (unit) + Playwright (E2E)

### 2. Folder Structure (Enterprise Folder-by-Feature)

```
playground-angular-21/
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton services, guards, interceptors
│   │   │   ├── auth/                # Authentication (Signal-based)
│   │   │   │   └── auth.service.ts
│   │   │   ├── guards/              # Functional route guards
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/        # Functional HTTP interceptors
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   └── services/            # Core services
│   │   │       ├── api.service.ts
│   │   │       └── notification.service.ts
│   │   │
│   │   ├── shared/                  # Reusable, stateless components
│   │   │   ├── components/
│   │   │   │   ├── search-input/    # Debounced search (Signal-based)
│   │   │   │   ├── loading-spinner/ # Loading indicator
│   │   │   │   └── data-table/      # Generic table component
│   │   │   ├── utils/
│   │   │   │   └── signal.utils.ts  # Signal utilities (debounce, persist, etc.)
│   │   │   ├── models/
│   │   │   │   └── base.models.ts   # Shared TypeScript interfaces
│   │   │   └── index.ts             # Public API barrel export
│   │   │
│   │   └── features/                # Feature modules (smart components)
│   │       ├── dashboard/
│   │       │   └── pages/
│   │       │       └── dashboard.page.ts
│   │       └── inventory/           # Main feature
│   │           ├── components/
│   │           │   ├── product-search/
│   │           │   ├── product-list/
│   │           │   └── stock-adjustment-form/  # Signal Forms demo
│   │           ├── models/
│   │           │   └── inventory.models.ts
│   │           ├── services/
│   │           │   └── inventory.service.ts
│   │           ├── store/
│   │           │   └── inventory.store.ts      # NgRx SignalStore
│   │           ├── pages/
│   │           │   └── inventory-adjustment.page.ts
│   │           └── inventory.routes.ts
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── styles/
│       └── main.scss                # Design system variables
│
├── e2e/                             # Playwright E2E tests
│   └── inventory-adjustment.spec.ts
├── tests/                           # Vitest unit tests
│   ├── setup.ts
│   └── inventory.store.spec.ts
├── package.json
├── angular.json
├── tsconfig.json
├── vitest.config.ts
└── playwright.config.ts
```

### 3. Configuration Files Created

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: Angular 21, NgRx Signals, Vitest, Playwright |
| `angular.json` | OnPush default, SCSS, standalone components |
| `tsconfig.json` | Strict TypeScript, path aliases |
| `vitest.config.ts` | Unit testing with @analogjs/vitest-angular |
| `playwright.config.ts` | E2E testing across browsers |
| `src/app/app.config.ts` | **Zoneless mode** + HTTP interceptors |
| `src/app/app.routes.ts` | Lazy-loaded feature routes |

### 4. Path Aliases

```typescript
"@core/*"     → "src/app/core/*"
"@shared/*"   → "src/app/shared/*"
"@features/*" → "src/app/features/*"
"@env/*"      → "src/environments/*"
```

---

## Key Implementation Details

### App Configuration (Zoneless Mode)

```typescript
// src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    // ZONELESS MODE - No zone.js!
    provideExperimentalZonelessChangeDetection(),
    
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
  ],
};
```

### NgRx SignalStore (Functional Approach)

```typescript
// src/app/features/inventory/store/inventory.store.ts
export const InventoryStore = signalStore(
  { providedIn: 'root' },
  
  withState(initialState),
  
  withComputed((store) => ({
    isLoadingProducts: computed(() => store.productsLoadingState() === 'loading'),
    lowStockProducts: computed(() => store.products().filter(p => p.status === 'low_stock')),
  })),
  
  withMethods((store, inventoryService = inject(InventoryService)) => ({
    // rxMethod for async operations with RxJS
    searchProducts: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => inventoryService.searchProducts({ query }).pipe(
          tapResponse({
            next: (products) => patchState(store, { products }),
            error: (error) => patchState(store, { error: error.message }),
          })
        ))
      )
    ),
  })),
);
```

### Signal-Based Form (No FormControl!)

```typescript
// src/app/features/inventory/components/stock-adjustment-form/
export class StockAdjustmentFormComponent {
  // Form fields as signals
  readonly newStock = signal<number>(0);
  readonly adjustmentType = signal<AdjustmentType>('correction');
  readonly reason = signal<AdjustmentReason>('inventory_count');
  
  // Computed validation
  readonly isStockValid = computed(() => {
    const stock = this.newStock();
    return stock >= 0 && stock <= this.product()?.maxStock;
  });
  
  readonly stockDifference = computed(() => 
    this.newStock() - (this.product()?.currentStock ?? 0)
  );
}
```

### Debounced Signal Utility

```typescript
// src/app/shared/utils/signal.utils.ts
export function debouncedSignal<T>(source: Signal<T>, delayMs = 300): Signal<T> {
  const source$ = toObservable(source).pipe(
    debounceTime(delayMs),
    distinctUntilChanged()
  );
  return toSignal(source$, { initialValue: source() });
}
```

---

## Why Signal-First Architecture is Superior for Warehouse Operations

### The Problem with Zone.js in High-Frequency Environments

Warehouse management systems deal with:
- Real-time stock updates from multiple sources
- Barcode scanner inputs (rapid-fire events)
- Live inventory counts
- Concurrent user operations

Zone.js triggers change detection on **every async event**, leading to:
- Unnecessary re-renders
- Performance bottlenecks
- Unpredictable UI updates

### The Signal-First Solution

| Traditional (Zone.js) | Signal-First (Zoneless) |
|----------------------|------------------------|
| Change detection runs on ALL async events | Change detection only when signals change |
| ~15KB zone.js overhead | Zero zone.js bundle cost |
| Implicit reactivity (magical) | Explicit reactivity (predictable) |
| Difficult to debug | Clear data flow |

### Benefits for Warehouse Dashboard

1. **Granular Updates**: Only components subscribed to changed signals re-render
2. **Predictable Performance**: No surprise change detection cycles
3. **Better Memory**: No zone.js context tracking
4. **Simpler Mental Model**: Data flows explicitly through signals

### Example: High-Frequency Stock Updates

```typescript
// In a warehouse, stock might update every second from sensors
// With Zone.js: Every update triggers full change detection
// With Signals: Only the stock display component updates

readonly currentStock = signal(100);

// Component only re-renders when currentStock changes
template: `<span>Stock: {{ currentStock() }}</span>`
```

### Form Reactivity Without FormControl Overhead

Traditional Reactive Forms create:
- FormControl instances
- ValueChanges observables
- Validation status streams

Signal Forms provide:
- Direct signal binding
- Computed validation
- Zero subscription management

```typescript
// Signal Form - simpler, more efficient
readonly quantity = signal(0);
readonly isValid = computed(() => this.quantity() > 0);

// vs Traditional - more overhead
this.form = new FormGroup({
  quantity: new FormControl(0, Validators.min(1))
});
this.form.get('quantity').valueChanges.subscribe(...);
```

---

## Commands

```bash
# Install dependencies
bun install

# Start development server
bun start

# Run unit tests (Vitest)
bun test

# Run tests with UI
bun run test:ui

# Run E2E tests (Playwright)
bun run e2e

# Run E2E with UI
bun run e2e:ui

# Build for production
bun run build:prod
```

---

## Files Created Summary

| Category | Files |
|----------|-------|
| **Config** | `package.json`, `angular.json`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts` |
| **Core** | `auth.service.ts`, `auth.guard.ts`, `auth.interceptor.ts`, `error.interceptor.ts`, `api.service.ts`, `notification.service.ts` |
| **Shared** | `signal.utils.ts`, `base.models.ts`, `search-input.component.ts`, `loading-spinner.component.ts`, `data-table.component.ts` |
| **Inventory Feature** | `inventory.models.ts`, `inventory.service.ts`, `inventory.store.ts`, `product-search.component.ts`, `product-list.component.ts`, `stock-adjustment-form.component.ts`, `inventory-adjustment.page.ts` |
| **Dashboard** | `dashboard.page.ts` |
| **Tests** | `setup.ts`, `inventory.store.spec.ts`, `inventory-adjustment.spec.ts` |
| **Styles** | `main.scss` |

---

## Architecture Principles Applied

1. **Single Responsibility**: Each service/component has one job
2. **Type Safety**: Strict TypeScript, no `any` types
3. **Separation of Concerns**: Smart/Dumb component pattern
4. **Functional Approach**: Pure functions, immutable state updates
5. **Lazy Loading**: Features loaded on-demand
6. **Accessibility**: ARIA labels, keyboard navigation
