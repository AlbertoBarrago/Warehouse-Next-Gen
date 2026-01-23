import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap, debounceTime, distinctUntilChanged } from 'rxjs';

import { InventoryService } from '../services/inventory.service';
import { 
  Product, 
  StockAdjustment, 
  StockAdjustmentFormData,
  ProductSearchParams 
} from '../models/inventory.models';
import { LoadingState } from '@shared/models/base.models';

/**
 * Inventory store state interface
 */
interface InventoryState {
  // Products list
  products: Product[];
  productsLoadingState: LoadingState;
  
  // Selected product for adjustment
  selectedProduct: Product | null;
  selectedProductLoadingState: LoadingState;
  
  // Stock adjustment
  adjustmentLoadingState: LoadingState;
  lastAdjustment: StockAdjustment | null;
  
  // Search/Filter
  searchQuery: string;
  searchParams: ProductSearchParams;
  
  // Error handling
  error: string | null;
}

/**
 * Initial state
 */
const initialState: InventoryState = {
  products: [],
  productsLoadingState: 'idle',
  selectedProduct: null,
  selectedProductLoadingState: 'idle',
  adjustmentLoadingState: 'idle',
  lastAdjustment: null,
  searchQuery: '',
  searchParams: {},
  error: null,
};

/**
 * NgRx SignalStore for Inventory Management
 * 
 * Features:
 * - Functional approach with withMethods, withComputed
 * - rxMethod for async side effects
 * - Type-safe state management
 * - Signal-native integration
 */
export const InventoryStore = signalStore(
  { providedIn: 'root' },
  
  // ============================================
  // STATE
  // ============================================
  withState(initialState),

  // ============================================
  // COMPUTED SIGNALS (Derived State)
  // ============================================
  withComputed((store) => ({
    /**
     * Products filtered by current search
     */
    filteredProducts: computed(() => store.products()),

    /**
     * Check if products are currently loading
     */
    isLoadingProducts: computed(() => 
      store.productsLoadingState() === 'loading'
    ),

    /**
     * Check if the selected product is loading
     */
    isLoadingSelectedProduct: computed(() => 
      store.selectedProductLoadingState() === 'loading'
    ),

    /**
     * Check if stock adjustment is in progress
     */
    isAdjusting: computed(() => 
      store.adjustmentLoadingState() === 'loading'
    ),

    /**
     * Products count
     */
    productsCount: computed(() => store.products().length),

    /**
     * Low stock products
     */
    lowStockProducts: computed(() => 
      store.products().filter((p) => p.status === 'low_stock')
    ),

    /**
     * Out of stock products
     */
    outOfStockProducts: computed(() => 
      store.products().filter((p) => p.status === 'out_of_stock')
    ),

    /**
     * Products with critical stock (at or below minimum)
     */
    criticalStockCount: computed(() => 
      store.products().filter(
        (p) => p.currentStock <= p.minStock
      ).length
    ),

    /**
     * Has error state
     */
    hasError: computed(() => store.error() !== null),

    /**
     * Can perform adjustment (product selected, not loading)
     */
    canAdjust: computed(() => 
      store.selectedProduct() !== null && 
      store.adjustmentLoadingState() !== 'loading'
    ),
  })),

  // ============================================
  // METHODS (Actions/Reducers combined)
  // ============================================
  withMethods((store, inventoryService = inject(InventoryService)) => ({
    /**
     * Load products with optional search parameters
     * Uses rxMethod for reactive async handling
     */
    loadProducts: rxMethod<ProductSearchParams>(
      pipe(
        tap(() => patchState(store, { 
          productsLoadingState: 'loading',
          error: null 
        })),
        debounceTime(300),
        distinctUntilChanged((prev, curr) => 
          JSON.stringify(prev) === JSON.stringify(curr)
        ),
        switchMap((params) =>
          inventoryService.searchProducts(params).pipe(
            tapResponse({
              next: (products: Product[]) => patchState(store, {
                products,
                productsLoadingState: 'success',
                searchParams: params,
              }),
              error: (error: Error) => patchState(store, {
                productsLoadingState: 'error',
                error: error.message,
              }),
            })
          )
        )
      )
    ),

    /**
     * Search products by query string
     * Convenience method that wraps loadProducts
     */
    searchProducts: rxMethod<string>(
      pipe(
        tap((query) => patchState(store, { searchQuery: query })),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) =>
          inventoryService.searchProducts({ query }).pipe(
            tapResponse({
              next: (products: Product[]) => patchState(store, {
                products,
                productsLoadingState: 'success',
              }),
              error: (error: Error) => patchState(store, {
                productsLoadingState: 'error',
                error: error.message,
              }),
            })
          )
        )
      )
    ),

    /**
     * Select a product for stock adjustment
     */
    selectProduct: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { 
          selectedProductLoadingState: 'loading',
          error: null 
        })),
        switchMap((productId) =>
          inventoryService.getProductById(productId).pipe(
            tapResponse({
              next: (product: Product | null) => patchState(store, {
                selectedProduct: product,
                selectedProductLoadingState: 'success',
              }),
              error: (error: Error) => patchState(store, {
                selectedProductLoadingState: 'error',
                error: error.message,
              }),
            })
          )
        )
      )
    ),

    /**
     * Set selected product directly (no API call)
     * Use this when you already have the full product data
     */
    setSelectedProduct(product: Product): void {
      patchState(store, {
        selectedProduct: product,
        selectedProductLoadingState: 'success',
      });
    },

    /**
     * Clear selected product
     */
    clearSelectedProduct(): void {
      patchState(store, {
        selectedProduct: null,
        selectedProductLoadingState: 'idle'
      });
    },

    /**
     * Perform stock adjustment
     */
    adjustStock: rxMethod<StockAdjustmentFormData>(
      pipe(
        tap(() => patchState(store, { 
          adjustmentLoadingState: 'loading',
          error: null 
        })),
        switchMap((formData) => {
          const productId = store.selectedProduct()?.id;
          if (!productId) {
            throw new Error('No product selected');
          }
          
          return inventoryService.updateStock(productId, formData).pipe(
            tapResponse({
              next: (adjustment: StockAdjustment) => {
                // Update the product in the list
                const updatedProducts = store.products().map((p) =>
                  p.id === productId
                    ? { ...p, currentStock: formData.newStock }
                    : p
                );
                
                // Update selected product
                const selectedProduct = store.selectedProduct();
                const updatedSelectedProduct = selectedProduct
                  ? { ...selectedProduct, currentStock: formData.newStock }
                  : null;

                patchState(store, {
                  products: updatedProducts,
                  selectedProduct: updatedSelectedProduct,
                  lastAdjustment: adjustment,
                  adjustmentLoadingState: 'success',
                });
              },
              error: (error: Error) => patchState(store, {
                adjustmentLoadingState: 'error',
                error: error.message,
              }),
            })
          );
        })
      )
    ),

    /**
     * Clear error state
     */
    clearError(): void {
      patchState(store, { error: null });
    },

    /**
     * Reset store to initial state
     */
    reset(): void {
      patchState(store, initialState);
    },
  })),

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================
  withHooks({
    onInit(store) {
      // Load initial products on store initialization
      store.loadProducts({});
    },
  })
);

/**
 * Type export for injection
 */
export type InventoryStoreType = InstanceType<typeof InventoryStore>;
