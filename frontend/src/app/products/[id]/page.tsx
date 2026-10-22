'use client';

import { Suspense, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Product, UpdateProductRequest } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function EditProductContent({ id }: { id: string }) {
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<UpdateProductRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getProductById(id);
        setProduct(data);
        setFormData({
          sku: data.sku,
          name: data.name,
          description: data.description,
          unitPrice: data.unitPrice,
          reorderLevel: data.reorderLevel,
          isActive: data.isActive,
        });
        setError(null);
      } catch (err) {
        setProduct(null);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await apiClient.updateProduct(id, formData);
      router.push('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'unitPrice' || name === 'reorderLevel'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-600">{error || 'Product not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <Link
            href="/products"
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Products
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-white p-6 shadow-md"
        >
          <div className="mb-4">
            <label
              htmlFor="sku"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              SKU
            </label>
            <input
              id="sku"
              type="text"
              name="sku"
              value={formData.sku || ''}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="unitPrice"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Unit Price
            </label>
            <input
              id="unitPrice"
              type="number"
              name="unitPrice"
              value={formData.unitPrice || 0}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="reorderLevel"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Reorder Level
            </label>
            <input
              id="reorderLevel"
              type="number"
              name="reorderLevel"
              value={formData.reorderLevel || 0}
              onChange={handleChange}
              min="0"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive ?? true}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href="/products"
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      }
    >
      <EditProductContent id={params.id} />
    </Suspense>
  );
}
