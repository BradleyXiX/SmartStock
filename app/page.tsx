"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
};

type SalesChartData = {
  name: string;
  quantitySold: number;
  date: string;
};

type DashboardData = {
  salesChartData: SalesChartData[];
  lowStockProducts: Product[];
};

export default function SmartStockDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'pos'>('dashboard');

  const API_BASE_URL = 'http://localhost:3001/api';

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching from API URL:', API_BASE_URL);
      const productsResponse = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Products response status:', productsResponse.status);

      if (!productsResponse.ok) {
        const errorText = await productsResponse.text();
        throw new Error(`Products fetch failed: ${productsResponse.status} - ${errorText}`);
      }

      const productsData: Product[] = await productsResponse.json();
      console.log('Products data loaded:', productsData.length, 'products');
      setProducts(productsData);
      
      if (productsData.length > 0 && !selectedProductId) {
        setSelectedProductId(productsData[0].id.toString());
      }

      // Fetch dashboard data
      const dashboardResponse = await fetch(`${API_BASE_URL}/bi/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Dashboard response status:', dashboardResponse.status);

      if (dashboardResponse.ok) {
        const dashData: DashboardData = await dashboardResponse.json();
        console.log('Dashboard data loaded:', dashData);
        setDashboardData(dashData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Fetch error:', err);
      setError(`Failed to load data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const qty = parseInt(quantity);
    if (!selectedProductId || qty <= 0) {
      setError('Please select a valid product and quantity.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: parseInt(selectedProductId), quantitySold: qty }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to process sale.');
      } else {
        setSuccess(`Sale confirmed! ${qty} unit(s) sold.`);
        setQuantity('1');
        await fetchData();
      }
    } catch (err) {
      setError('An error occurred while processing the sale.');
    }
  };

  const calculateKPIs = () => {
    const totalInventory = products.reduce((sum, p) => sum + p.stockQuantity, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
    const totalSales = dashboardData?.salesChartData.reduce((sum, s) => sum + s.quantitySold, 0) || 0;
    return { totalInventory, totalValue, totalSales };
  };

  if (loading) {
    return (
      <div className="flex bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen items-center justify-center">
        <div className="text-center">
          {error && (
            <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg max-w-md">
              <p className="text-red-600 font-semibold text-lg mb-2">⚠️ Error Loading Data</p>
              <p className="text-red-700 text-sm">{error}</p>
              <p className="text-red-600 text-xs mt-3">
                Make sure the backend API server is running on port 3001
              </p>
            </div>
          )}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 inline-block"></div>
          <p className="text-gray-600 font-semibold">{error ? 'Retrying...' : 'Loading SmartStock...'}</p>
        </div>
      </div>
    );
  }

  const kpis = calculateKPIs();
  const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <p className="text-xs text-yellow-700">
            🔧 API: {API_BASE_URL} | Env: {process.env.NEXT_PUBLIC_API_URL || 'not set'}
          </p>
        </div>
      )}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SmartStock</h1>
                <p className="text-xs text-gray-500">Management Information System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {['dashboard', 'inventory', 'pos'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-1 py-4 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Inventory</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.totalInventory}</p>
                    <p className="text-xs text-gray-400 mt-2">units</p>
                  </div>
                  <div className="text-2xl">📦</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Inventory Value</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">${(kpis.totalValue / 1000).toFixed(1)}k</p>
                    <p className="text-xs text-gray-400 mt-2">estimated</p>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Sales</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.totalSales}</p>
                    <p className="text-xs text-gray-400 mt-2">units sold</p>
                  </div>
                  <div className="text-2xl">📊</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Sales Trends</h2>
                <div className="h-72">
                  {dashboardData?.salesChartData && dashboardData.salesChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.salesChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                        <Bar dataKey="quantitySold" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">No data</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Low Stock Alerts</h2>
                <div className="space-y-3 h-72 overflow-y-auto">
                  {dashboardData?.lowStockProducts && dashboardData.lowStockProducts.length > 0 ? (
                    dashboardData.lowStockProducts.map((p) => (
                      <div key={p.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.sku}</p>
                        </div>
                        <span className="text-lg font-bold text-orange-600">{p.stockQuantity}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">All items in stock</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Product Inventory</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">SKU</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Value</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{p.sku}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">${p.price}</td>
                      <td className="px-6 py-3 text-sm">{p.stockQuantity}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">${(p.price * p.stockQuantity).toFixed(2)}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          p.stockQuantity < 10 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {p.stockQuantity < 10 ? 'Low' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">New Sale</h2>
                <form onSubmit={handleSaleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ${p.price} ({p.stockQuantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProduct && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-gray-700">
                      Price: ${selectedProduct.price} | Stock: {selectedProduct.stockQuantity}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {selectedProduct && (
                    <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                      <span>Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${(selectedProduct.price * parseInt(quantity || '0')).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
                  {success && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">{success}</div>}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                  >
                    Complete Sale
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24 h-fit">
              <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="text-center py-4 bg-gray-50 rounded">
                  <p className="text-gray-500">{selectedProduct ? selectedProduct.name : 'Select a product'}</p>
                </div>
                {selectedProduct && (
                  <>
                    <div className="border-t pt-3">
                      <p className="text-gray-600">Unit Price: ${selectedProduct.price}</p>
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-gray-600">Qty: {quantity}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-blue-600 font-bold text-lg">
                        ${(selectedProduct.price * parseInt(quantity || '0')).toFixed(2)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
