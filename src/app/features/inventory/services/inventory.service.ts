import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { 
  Product, 
  StockAdjustment, 
  StockAdjustmentFormData,
  ProductSearchParams 
} from '../models/inventory.models';

/**
 * Mock data for development - simulates API responses
 */
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'ELEC-001',
    name: 'Wireless Keyboard',
    description: 'Ergonomic wireless keyboard with backlit keys',
    category: 'electronics',
    currentStock: 150,
    minStock: 20,
    maxStock: 500,
    unit: 'pieces',
    location: { zone: 'A', aisle: '01', rack: 'R1', shelf: 'S3' },
    price: 49.99,
    status: 'in_stock',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-10'),
  },
  {
    id: '2',
    sku: 'ELEC-002',
    name: 'USB-C Hub 7-in-1',
    description: 'Multi-port USB-C hub with HDMI and card reader',
    category: 'electronics',
    currentStock: 8,
    minStock: 15,
    maxStock: 200,
    unit: 'pieces',
    location: { zone: 'A', aisle: '01', rack: 'R2', shelf: 'S1' },
    price: 39.99,
    status: 'low_stock',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-06-12'),
  },
  {
    id: '3',
    sku: 'FURN-001',
    name: 'Standing Desk Frame',
    description: 'Electric height-adjustable desk frame',
    category: 'furniture',
    currentStock: 0,
    minStock: 5,
    maxStock: 50,
    unit: 'pieces',
    location: { zone: 'B', aisle: '03', rack: 'R1', shelf: 'S1' },
    price: 299.99,
    status: 'out_of_stock',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-06-08'),
  },
  {
    id: '4',
    sku: 'PACK-001',
    name: 'Cardboard Boxes (Medium)',
    description: '12x12x12 inch shipping boxes',
    category: 'packaging',
    currentStock: 2500,
    minStock: 500,
    maxStock: 5000,
    unit: 'pieces',
    location: { zone: 'C', aisle: '01', rack: 'R1', shelf: 'S1' },
    price: 1.25,
    status: 'in_stock',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-15'),
  },
  {
    id: '5',
    sku: 'TOOL-001',
    name: 'Cordless Drill Set',
    description: '20V cordless drill with battery and case',
    category: 'tools',
    currentStock: 45,
    minStock: 10,
    maxStock: 100,
    unit: 'pieces',
    location: { zone: 'D', aisle: '02', rack: 'R3', shelf: 'S2' },
    price: 129.99,
    status: 'in_stock',
    createdAt: new Date('2024-04-10'),
    updatedAt: new Date('2024-06-14'),
  },
  {
    id: '6',
    sku: 'ELEC-003',
    name: 'Bluetooth Mouse',
    description: 'Ergonomic vertical mouse with adjustable DPI',
    category: 'electronics',
    currentStock: 78,
    minStock: 25,
    maxStock: 300,
    unit: 'pieces',
    location: { zone: 'A', aisle: '01', rack: 'R1', shelf: 'S4' },
    price: 34.99,
    status: 'in_stock',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-06-11'),
  },
];

/**
 * Inventory service for product and stock management
 * Uses mock data for development, can be switched to real API
 */
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly api = inject(ApiService);

  /**
   * Search products with optional filters
   * Simulates API call with debounce-friendly delay
   */
  searchProducts(params: ProductSearchParams): Observable<Product[]> {
    // Simulate API delay
    return of(this.filterProducts(params)).pipe(delay(300));
    
    // Real API call would be:
    // return this.api.get<Product[]>('inventory/products', params);
  }

  /**
   * Get a single product by ID
   */
  getProductById(id: string): Observable<Product | null> {
    const product = MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
    return of(product).pipe(delay(150));
  }

  /**
   * Get a product by SKU
   */
  getProductBySku(sku: string): Observable<Product | null> {
    const product = MOCK_PRODUCTS.find(
      (p) => p.sku.toLowerCase() === sku.toLowerCase()
    ) ?? null;
    return of(product).pipe(delay(150));
  }

  /**
   * Update product stock level
   */
  updateStock(
    productId: string, 
    formData: StockAdjustmentFormData
  ): Observable<StockAdjustment> {
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const adjustment: StockAdjustment = {
      id: crypto.randomUUID(),
      productId,
      productSku: product.sku,
      productName: product.name,
      previousStock: product.currentStock,
      newStock: formData.newStock,
      adjustmentType: formData.adjustmentType,
      reason: formData.reason,
      notes: formData.notes,
      adjustedBy: 'current-user', // Would come from auth service
      adjustedAt: new Date(),
    };

    // Update mock data (in real app, this would be done by API)
    product.currentStock = formData.newStock;
    product.status = this.calculateStatus(product);
    product.updatedAt = new Date();

    return of(adjustment).pipe(delay(500));
  }

  /**
   * Get recent stock adjustments for a product
   */
  getAdjustmentHistory(productId: string): Observable<StockAdjustment[]> {
    // Return empty for mock - real API would return actual history
    return of([]).pipe(delay(200));
  }

  /**
   * Filter products based on search parameters
   */
  private filterProducts(params: ProductSearchParams): Product[] {
    let results = [...MOCK_PRODUCTS];

    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (params.category) {
      results = results.filter((p) => p.category === params.category);
    }

    if (params.status) {
      results = results.filter((p) => p.status === params.status);
    }

    return results;
  }

  /**
   * Calculate product status based on stock levels
   */
  private calculateStatus(product: Product): Product['status'] {
    if (product.currentStock === 0) return 'out_of_stock';
    if (product.currentStock <= product.minStock) return 'low_stock';
    return 'in_stock';
  }
}
