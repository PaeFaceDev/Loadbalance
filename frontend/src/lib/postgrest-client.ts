const POSTGREST_BASE_URL = process.env.NEXT_PUBLIC_POSTGREST_URL || 'http://localhost:8080/rest';

class PostgrestClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${POSTGREST_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PostgREST Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getStockOverview(): Promise<any[]> {
    return this.request<any[]>('/stock_overview');
  }

  async getRecentMovements(): Promise<any[]> {
    return this.request<any[]>('/recent_movements');
  }
}

export const postgrestClient = new PostgrestClient();
