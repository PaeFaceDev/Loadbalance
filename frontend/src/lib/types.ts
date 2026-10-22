export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  reorderLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockBalance {
  productId: string;
  productName: string;
  productSku: string;
  locationId: string;
  locationCode: string;
  locationName: string;
  quantity: number;
  belowReorderLevel: boolean;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  locationId: string;
  locationCode: string;
  locationName: string;
  movementType: string;
  quantity: number;
  reference?: string;
  notes?: string;
  occurredAt: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  reorderLevel: number;
}

export interface UpdateProductRequest {
  sku?: string;
  name?: string;
  description?: string;
  unitPrice?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface CreateLocationRequest {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateLocationRequest {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ReceiveStockRequest {
  productId: string;
  locationId: string;
  quantity: number;
  reference?: string;
  notes?: string;
}

export interface IssueStockRequest {
  productId: string;
  locationId: string;
  quantity: number;
  reference?: string;
  notes?: string;
}

export interface TransferStockRequest {
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  reference?: string;
  notes?: string;
}

export interface AdjustStockRequest {
  productId: string;
  locationId: string;
  quantity: number;
  reference?: string;
  notes?: string;
}

export interface SystemInfo {
  service: string;
  instanceId: string;
  environment: string;
  utcNow: string;
}
