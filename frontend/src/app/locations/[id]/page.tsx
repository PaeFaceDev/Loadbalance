'use client';

import { Suspense, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Location, UpdateLocationRequest } from '@/lib/types';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

function EditLocationContent({ id }: { id: string }) {
  const router = useRouter();

  const [location, setLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<UpdateLocationRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLocation = async () => {
      try {
        setLoading(true);

        const data = await apiClient.getLocations();
        const locationData = data.find((l) => l.id === id);

        if (!locationData) {
          setLocation(null);
          setError('Location not found');
          return;
        }

        setLocation(locationData);
        setFormData({
          code: locationData.code,
          name: locationData.name,
          description: locationData.description,
          isActive: locationData.isActive,
        });
        setError(null);
      } catch (err) {
        setLocation(null);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load location'
        );
      } finally {
        setLoading(false);
      }
    };

    void loadLocation();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await apiClient.updateLocation(id, formData);
      router.push('/locations');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update location'
      );
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
          : value,
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading location...</div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-600">
          {error || 'Location not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Location</h1>

          <Link
            href="/locations"
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Locations
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
              htmlFor="code"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Code
            </label>

            <input
              id="code"
              type="text"
              name="code"
              value={formData.code || ''}
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
              href="/locations"
              className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditLocationParams() {
  const params = useParams<{ id: string }>();

  return <EditLocationContent id={params.id} />;
}

export default function EditLocationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      }
    >
      <EditLocationParams />
    </Suspense>
  );
}