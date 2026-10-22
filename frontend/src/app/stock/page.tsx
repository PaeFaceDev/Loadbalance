'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { StockBalance, StockMovement, Product, Location } from '@/lib/types';

export default function StockPage() {
  const [activeTab, setActiveTab] = useState<'balances' | 'movements' | 'receive' | 'issue' | 'transfer' | 'adjust'>('balances');
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balancesData, movementsData, productsData, locationsData] = await Promise.all([
        apiClient.getStockBalances(),
        apiClient.getStockMovements(50),
        apiClient.getProducts(true),
        apiClient.getLocations(true),
      ]);
      setBalances(balancesData);
      setMovements(movementsData);
      setProducts(productsData);
      setLocations(locationsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      await apiClient.receiveStock({
        productId: formData.get('productId') as string,
        locationId: formData.get('locationId') as string,
        quantity: parseInt(formData.get('quantity') as string),
        reference: formData.get('reference') as string,
        notes: formData.get('notes') as string,
      });
      form.reset();
      loadData();
      alert('Stock received successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to receive stock');
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      await apiClient.issueStock({
        productId: formData.get('productId') as string,
        locationId: formData.get('locationId') as string,
        quantity: parseInt(formData.get('quantity') as string),
        reference: formData.get('reference') as string,
        notes: formData.get('notes') as string,
      });
      form.reset();
      loadData();
      alert('Stock issued successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to issue stock');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      await apiClient.transferStock({
        productId: formData.get('productId') as string,
        fromLocationId: formData.get('fromLocationId') as string,
        toLocationId: formData.get('toLocationId') as string,
        quantity: parseInt(formData.get('quantity') as string),
        reference: formData.get('reference') as string,
        notes: formData.get('notes') as string,
      });
      form.reset();
      loadData();
      alert('Stock transferred successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to transfer stock');
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      await apiClient.adjustStock({
        productId: formData.get('productId') as string,
        locationId: formData.get('locationId') as string,
        quantity: parseInt(formData.get('quantity') as string),
        reference: formData.get('reference') as string,
        notes: formData.get('notes') as string,
      });
      form.reset();
      loadData();
      alert('Stock adjusted successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to adjust stock');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading stock data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Stock Management</h1>

      <div className="mb-6">
        <div className="flex space-x-2 border-b">
          {['balances', 'movements', 'receive', 'issue', 'transfer', 'adjust'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'balances' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {balances.map((balance) => (
                <tr key={`${balance.productId}-${balance.locationId}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {balance.productName} ({balance.productSku})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {balance.locationName} ({balance.locationCode})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {balance.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {balance.belowReorderLevel && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Below Reorder
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {balances.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No stock balances found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(movement.occurredAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {movement.movementType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.productName} ({movement.productSku})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.locationName} ({movement.locationCode})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {movement.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {movement.reference || '-'}
                  </td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No stock movements found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'receive' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Receive Stock</h2>
          <form onSubmit={handleReceive} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Product</label>
              <select name="productId" required className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
              <select name="locationId" required className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
              <input type="number" name="quantity" required min="1" className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Reference</label>
              <input type="text" name="reference" className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Notes</label>
              <textarea name="notes" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Receive Stock
            </button>
          </form>
        </div>
      )}

      {activeTab === 'issue' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Issue Stock</h2>
          <form onSubmit={handleIssue} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Product</label>
              <select name="productId" required className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
              <select name="locationId" required className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
              <input type="number" name="quantity" required min="1" className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Reference</label>
              <input type="text" name="reference" className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Notes</label>
              <textarea name="notes" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Issue Stock
            </button>
          </form>
        </div>
      )}

      {activeTab === 'transfer' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Transfer Stock</h2>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Product</label>
              <select name="productId" required className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">From Location</label>
              <select name="fromLocationId" required className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">To Location</label>
              <select name="toLocationId" required className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
              <input type="number" name="quantity" required min="1" className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Reference</label>
              <input type="text" name="reference" className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Notes</label>
              <textarea name="notes" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Transfer Stock
            </button>
          </form>
        </div>
      )}

      {activeTab === 'adjust' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Adjust Stock</h2>
          <form onSubmit={handleAdjust} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Product</label>
              <select name="productId" required className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
              <select name="locationId" required className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">New Quantity</label>
              <input type="number" name="quantity" required min="0" className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Reference</label>
              <input type="text" name="reference" className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Notes</label>
              <textarea name="notes" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Adjust Stock
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
