export interface Product {
  id: string;
  sku: string;
  name: string;
  unit: string;
  reorderLevel: number;
  isActive: boolean;
  createdAt: string;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  zone: string;
  isActive: boolean;
  createdAt: string;
}

export interface StockBalance {
  productId: string;
  productSku: string;
  productName: string;
  locationId: string;
  locationCode: string;
  quantity: number;
  reorderLevel: number;
  belowReorderLevel: boolean;
}

export interface StockMovement {
  id: string;
  productId: string;
  productSku: string;
  locationId: string;
  locationCode: string;
  type: string;
  quantity: number;
  reference: string;
  note?: string;
  createdAt: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  unit: string;
  reorderLevel: number;
}

export interface UpdateProductRequest {
  name: string;
  unit: string;
  reorderLevel: number;
  isActive: boolean;
}

export interface CreateLocationRequest {
  code: string;
  name: string;
  zone: string;
}

export interface UpdateLocationRequest {
  name: string;
  zone: string;
  isActive: boolean;
}

export interface ReceiveStockRequest {
  productId: string;
  locationId: string;
  quantity: number;
  reference: string;
  note?: string;
}

export interface IssueStockRequest {
  productId: string;
  locationId: string;
  quantity: number;
  reference: string;
  note?: string;
}

export interface TransferStockRequest {
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  reference: string;
  note?: string;
}

export interface AdjustStockRequest {
  productId: string;
  locationId: string;
  delta: number;
  reference: string;
  note?: string;
}

export interface SystemInfo {
  service: string;
  instanceId: string;
  environment: string;
  utcNow: string;
}

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: 'Admin' | 'Manager' | 'Operator' | string;
  warehouse: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface WarehouseTask {
  id: string;
  type: 'putaway' | 'pick' | 'replenish' | 'count';
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'done';
  reference?: string;
}
