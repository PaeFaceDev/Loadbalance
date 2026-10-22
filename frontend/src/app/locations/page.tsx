'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Location } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Edit, Trash2, MapPin } from 'lucide-react';

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    filterLocations();
  }, [locations, searchTerm, showInactive]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getLocations(showInactive);
      setLocations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const filterLocations = () => {
    let filtered = locations;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(term) ||
          l.code.toLowerCase().includes(term) ||
          (l.description && l.description.toLowerCase().includes(term))
      );
    }

    if (!showInactive) {
      filtered = filtered.filter((l) => l.isActive);
    }

    setFilteredLocations(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this location?')) return;

    try {
      await apiClient.updateLocation(id, { isActive: false });
      await loadLocations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate location');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#E6F2FF] rounded-xl">
            <MapPin className="h-6 w-6 text-[#0066CC]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Locations</h1>
            <p className="text-sm text-gray-500 mt-1">Manage warehouse storage locations</p>
          </div>
        </div>
        <Link href="/locations/new">
          <Button className="gap-2 h-12 px-6 bg-gradient-to-r from-[#0066CC] to-[#00B4D8] hover:from-[#004C99] hover:to-[#0094B8]">
            <Plus className="h-5 w-5" />
            Add Location
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-white to-[#F8FAFC]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search locations by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-gray-200 focus:border-[#0066CC]"
              />
            </div>
            <Button
              variant={showInactive ? 'default' : 'outline'}
              onClick={() => {
                setShowInactive(!showInactive);
                loadLocations();
              }}
              className="h-12 px-6"
            >
              {showInactive ? 'Active Only' : 'Show All'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Locations Table */}
      <Card className="bg-gradient-to-br from-white to-[#F8FAFC]">
        <CardHeader>
          <CardTitle className="text-gray-900">
            {filteredLocations.length} {filteredLocations.length === 1 ? 'Location' : 'Locations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.map((location) => (
                <TableRow key={location.id} className="hover:bg-[#F8FAFC]">
                  <TableCell className="font-medium">{location.code}</TableCell>
                  <TableCell>{location.name}</TableCell>
                  <TableCell className="text-gray-500 max-w-xs truncate">
                    {location.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={location.isActive ? 'default' : 'secondary'}>
                      {location.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/locations/${location.id}`}>
                        <Button variant="ghost" size="icon" className="hover:bg-[#E6F2FF] hover:text-[#0066CC]">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {location.isActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(location.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLocations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No locations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
