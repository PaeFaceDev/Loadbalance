import {
  Product,
  Location,
  StockBalance,
  StockMovement,
  CreateProductRequest,
  UpdateProductRequest,
  CreateLocationRequest,
  UpdateLocationRequest,
  ReceiveStockRequest,
  IssueStockRequest,
  TransferStockRequest,
  AdjustStockRequest,
  SystemInfo,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Products
  async getProducts(activeOnly: boolean = false): Promise<Product[]> {
    return this.request<Product[]>(`/products?activeOnly=${activeOnly}`);
  }

  async getProductById(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(request: CreateProductRequest): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateProduct(id: string, request: UpdateProductRequest): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  // Locations
  async getLocations(activeOnly: boolean = false): Promise<Location[]> {
    return this.request<Location[]>(`/locations?activeOnly=${activeOnly}`);
  }

  async createLocation(request: CreateLocationRequest): Promise<Location> {
    return this.request<Location>('/locations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateLocation(id: string, request: UpdateLocationRequest): Promise<Location> {
    return this.request<Location>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  // Stock
  async getStockBalances(productId?: string, locationId?: string): Promise<StockBalance[]> {
    const params = new URLSearchParams();
    if (productId) params.append('productId', productId);
    if (locationId) params.append('locationId', locationId);
    return this.request<StockBalance[]>(`/stock/balances?${params.toString()}`);
  }

  async getStockMovements(limit: number = 50): Promise<StockMovement[]> {
    return this.request<StockMovement[]>(`/stock/movements?limit=${limit}`);
  }

  async receiveStock(request: ReceiveStockRequest): Promise<StockBalance> {
    return this.request<StockBalance>('/stock/receive', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async issueStock(request: IssueStockRequest): Promise<StockBalance> {
    return this.request<StockBalance>('/stock/issue', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async transferStock(request: TransferStockRequest): Promise<StockBalance[]> {
    return this.request<StockBalance[]>('/stock/transfer', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async adjustStock(request: AdjustStockRequest): Promise<StockBalance> {
    return this.request<StockBalance>('/stock/adjust', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // System
  async getSystemInfo(): Promise<SystemInfo> {
    return this.request<SystemInfo>('/system/info');
  }
}

export const apiClient = new ApiClient();
