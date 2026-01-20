/**
 * Shared base models and types used across the application
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Paginated response for list endpoints
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Generic entity with timestamp tracking
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Loading state enum for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generic store state interface
 */
export interface StoreState {
  loadingState: LoadingState;
  error: string | null;
}

/**
 * Form validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}
