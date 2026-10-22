'use client';

import { useEffect, useState } from 'react';
import { postgrestClient } from '@/lib/postgrest-client';
import { apiClient } from '@/lib/api-client';
import { SystemInfo } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, MapPin, AlertTriangle, RefreshCw, TrendingUp, Activity } from 'lucide-react';

const COLORS = ['#0066CC', '#00B4D8', '#48CAE4', '#90E0EF', '#ADE8F4'];

export default function DashboardPage() {
  const [stockOverview, setStockOverview] = useState<any[]>([]);
  const [recentMovements, setRecentMovements] = useState<any[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overview, movements, sysInfo] = await Promise.all([
        postgrestClient.getStockOverview(),
        postgrestClient.getRecentMovements(),
        apiClient.getSystemInfo(),
      ]);
      setStockOverview(overview);
      setRecentMovements(movements);
      setSystemInfo(sysInfo);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
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

  const totalProducts = stockOverview.length;
  const belowReorderCount = stockOverview.filter((item) => item.below_reorder_level).length;
  const totalStock = stockOverview.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalLocations = new Set(stockOverview.map((item) => item.location_id)).size;

  // Prepare chart data
  const locationStockData = Array.from(
    stockOverview.reduce((acc, item) => {
      const existing = acc.get(item.location_name) || { name: item.location_name, quantity: 0 };
      existing.quantity += item.quantity || 0;
      acc.set(item.location_name, existing);
      return acc;
    }, new Map()).values()
  );

  const movementTypeData = recentMovements.reduce((acc, movement) => {
    const type = movement.movement_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(movementTypeData).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Warehouse Dashboard</h1>
          {systemInfo && (
            <p className="text-sm text-gray-500 mt-2">
              Instance: <span className="font-mono bg-[#E6F2FF] text-[#0066CC] px-3 py-1.5 rounded-lg font-medium">{systemInfo.instanceId}</span>
            </p>
          )}
        </div>
        <Button onClick={loadDashboardData} variant="outline" className="gap-2 h-10 px-6">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-white to-[#F8FAFC] hover:from-[#F8FAFC] hover:to-white">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-gray-600 font-medium">
              <div className="p-2 bg-[#E6F2FF] rounded-lg">
                <Package className="h-4 w-4 text-[#0066CC]" />
              </div>
              Total Products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#0066CC]">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-[#F8FAFC] hover:from-[#F8FAFC] hover:to-white">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-gray-600 font-medium">
              <div className="p-2 bg-[#E6F2FF] rounded-lg">
                <Activity className="h-4 w-4 text-[#00B4D8]" />
              </div>
              Total Stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#00B4D8]">{totalStock.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-[#F8FAFC] hover:from-[#F8FAFC] hover:to-white">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-gray-600 font-medium">
              <div className="p-2 bg-[#E6F2FF] rounded-lg">
                <MapPin className="h-4 w-4 text-[#48CAE4]" />
              </div>
              Locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#48CAE4]">{totalLocations}</div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br from-white to-[#F8FAFC] hover:from-[#F8FAFC] hover:to-white ${belowReorderCount > 0 ? 'border-2 border-red-200' : ''}`}>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-gray-600 font-medium">
              <div className={`p-2 rounded-lg ${belowReorderCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <AlertTriangle className={`h-4 w-4 ${belowReorderCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
              </div>
              Below Reorder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${belowReorderCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {belowReorderCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-white to-[#F8FAFC]">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/products" className="block">
              <Button className="w-full gap-2 h-12 bg-gradient-to-r from-[#0066CC] to-[#00B4D8] hover:from-[#004C99] hover:to-[#0094B8]">
                <Package className="h-5 w-5" />
                Manage Products
              </Button>
            </Link>
            <Link href="/locations" className="block">
              <Button className="w-full gap-2 h-12 bg-gradient-to-r from-[#0066CC] to-[#00B4D8] hover:from-[#004C99] hover:to-[#0094B8]">
                <MapPin className="h-5 w-5" />
                Manage Locations
              </Button>
            </Link>
            <Link href="/stock" className="block">
              <Button className="w-full gap-2 h-12 bg-gradient-to-r from-[#0066CC] to-[#00B4D8] hover:from-[#004C99] hover:to-[#0094B8]">
                <TrendingUp className="h-5 w-5" />
                Stock Operations
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-white to-[#F8FAFC]">
          <CardHeader>
            <CardTitle className="text-[#0066CC]">Stock by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationStockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Bar dataKey="quantity" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066CC" />
                    <stop offset="100%" stopColor="#00B4D8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-[#F8FAFC]">
          <CardHeader>
            <CardTitle className="text-[#0066CC]">Movement Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stock Overview Table */}
      <Card className="bg-gradient-to-br from-white to-[#F8FAFC]">
        <CardHeader>
          <CardTitle className="text-[#0066CC]">Stock Overview</CardTitle>
          <CardDescription>Real-time stock levels across all locations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockOverview.map((item, index) => (
                <TableRow key={index} className="hover:bg-[#F8FAFC]">
                  <TableCell className="font-medium">
                    {item.product_name}
                    <span className="text-gray-500 text-xs ml-2">({item.product_sku})</span>
                  </TableCell>
                  <TableCell>
                    {item.location_name}
                    <span className="text-gray-500 text-xs ml-2">({item.location_code})</span>
                  </TableCell>
                  <TableCell className="font-semibold text-[#0066CC]">{item.quantity}</TableCell>
                  <TableCell>{item.reorder_level}</TableCell>
                  <TableCell>
                    {item.below_reorder_level ? (
                      <Badge variant="destructive">Below Reorder</Badge>
                    ) : (
                      <Badge variant="default">OK</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {stockOverview.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No stock data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Movements Table */}
      <Card className="bg-gradient-to-br from-white to-[#F8FAFC]">
        <CardHeader>
          <CardTitle className="text-[#0066CC]">Recent Movements</CardTitle>
          <CardDescription>Latest stock movements across the warehouse</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMovements.slice(0, 10).map((movement, index) => (
                <TableRow key={index} className="hover:bg-[#F8FAFC]">
                  <TableCell className="text-gray-500">
                    {new Date(movement.occurred_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {movement.movement_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {movement.product_name}
                    <span className="text-gray-500 text-xs ml-2">({movement.product_sku})</span>
                  </TableCell>
                  <TableCell>
                    {movement.location_name}
                    <span className="text-gray-500 text-xs ml-2">({movement.location_code})</span>
                  </TableCell>
                  <TableCell className="font-semibold text-[#0066CC]">{movement.quantity}</TableCell>
                  <TableCell className="text-gray-500">{movement.reference || '-'}</TableCell>
                </TableRow>
              ))}
              {recentMovements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No recent movements
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
