import { BaseEntity } from '@shared/models/base.models';

/**
 * Product entity in the warehouse
 */
export interface Product extends BaseEntity {
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: StockUnit;
  location: WarehouseLocation;
  price: number;
  status: ProductStatus;
}

/**
 * Stock adjustment record
 */
export interface StockAdjustment {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  previousStock: number;
  newStock: number;
  adjustmentType: AdjustmentType;
  reason: AdjustmentReason;
  notes?: string;
  adjustedBy: string;
  adjustedAt: Date;
}

/**
 * Form data for creating a stock adjustment
 */
export interface StockAdjustmentFormData {
  productId: string;
  newStock: number;
  adjustmentType: AdjustmentType;
  reason: AdjustmentReason;
  notes?: string;
}

/**
 * Product categories
 */
export type ProductCategory = 
  | 'electronics'
  | 'furniture'
  | 'clothing'
  | 'food'
  | 'tools'
  | 'packaging'
  | 'other';

/**
 * Stock measurement units
 */
export type StockUnit = 'pieces' | 'boxes' | 'pallets' | 'kg' | 'liters';

/**
 * Product availability status
 */
export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';

/**
 * Type of stock adjustment
 */
export type AdjustmentType = 
  | 'increase' 
  | 'decrease' 
  | 'correction' 
  | 'transfer_in' 
  | 'transfer_out';

/**
 * Reason for stock adjustment
 */
export type AdjustmentReason =
  | 'received_shipment'
  | 'sold'
  | 'damaged'
  | 'lost'
  | 'returned'
  | 'inventory_count'
  | 'transfer'
  | 'other';

/**
 * Warehouse location
 */
export interface WarehouseLocation {
  zone: string;
  aisle: string;
  rack: string;
  shelf: string;
}

/**
 * Search/filter parameters for products
 */
export interface ProductSearchParams {
  query?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  minStock?: number;
  maxStock?: number;
}
