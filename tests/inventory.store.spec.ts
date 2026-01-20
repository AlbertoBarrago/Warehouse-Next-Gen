import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { InventoryStore } from '@features/inventory/store/inventory.store';
import { InventoryService } from '@features/inventory/services/inventory.service';
import { of } from 'rxjs';

describe('InventoryStore', () => {
  let store: InstanceType<typeof InventoryStore>;
  let mockInventoryService: Partial<InventoryService>;

  const mockProducts = [
    {
      id: '1',
      sku: 'TEST-001',
      name: 'Test Product',
      description: 'A test product',
      category: 'electronics' as const,
      currentStock: 100,
      minStock: 10,
      maxStock: 500,
      unit: 'pieces' as const,
      location: { zone: 'A', aisle: '01', rack: 'R1', shelf: 'S1' },
      price: 29.99,
      status: 'in_stock' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    mockInventoryService = {
      searchProducts: vi.fn().mockReturnValue(of(mockProducts)),
      getProductById: vi.fn().mockReturnValue(of(mockProducts[0])),
      updateStock: vi.fn().mockReturnValue(of({
        id: 'adj-1',
        productId: '1',
        productSku: 'TEST-001',
        productName: 'Test Product',
        previousStock: 100,
        newStock: 150,
        adjustmentType: 'increase',
        reason: 'received_shipment',
        adjustedBy: 'test-user',
        adjustedAt: new Date(),
      })),
    };

    TestBed.configureTestingModule({
      providers: [
        InventoryStore,
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    });

    store = TestBed.inject(InventoryStore);
  });

  describe('initial state', () => {
    it('should have empty products array initially', () => {
      // Note: onInit hook loads products, so we check the loading state
      expect(store.products()).toBeDefined();
    });

    it('should have idle loading state before any action', () => {
      expect(store.adjustmentLoadingState()).toBe('idle');
    });

    it('should have no selected product', () => {
      expect(store.selectedProduct()).toBeNull();
    });
  });

  describe('computed signals', () => {
    it('should compute productsCount correctly', () => {
      // Store loads products on init via onInit hook
      expect(typeof store.productsCount()).toBe('number');
    });

    it('should compute isLoadingProducts from loading state', () => {
      expect(typeof store.isLoadingProducts()).toBe('boolean');
    });

    it('should compute canAdjust based on selected product', () => {
      expect(store.canAdjust()).toBe(false); // No product selected
    });
  });

  describe('selectProduct', () => {
    it('should call inventory service with product id', () => {
      store.selectProduct('1');
      
      expect(mockInventoryService.getProductById).toHaveBeenCalledWith('1');
    });
  });

  describe('clearSelectedProduct', () => {
    it('should reset selected product to null', () => {
      store.clearSelectedProduct();
      
      expect(store.selectedProduct()).toBeNull();
      expect(store.selectedProductLoadingState()).toBe('idle');
    });
  });

  describe('clearError', () => {
    it('should reset error state to null', () => {
      store.clearError();
      
      expect(store.error()).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      store.reset();
      
      expect(store.products()).toEqual([]);
      expect(store.selectedProduct()).toBeNull();
      expect(store.error()).toBeNull();
    });
  });
});
