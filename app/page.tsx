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

type LowStockProduct = Product;

type SalesChartData = {
  name: string;
  quantitySold: number;
  date: string;
};

type DashboardData = {
  salesChartData: SalesChartData[];
  lowStockProducts: LowStockProduct[];
};

export default function SmartStockDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // In production, configure next.config.js rewrites or use absolute URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, dashboardRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/bi/dashboard`)
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
        // Default to first product if none selected
        if (productsData.length > 0 && !selectedProductId) {
          setSelectedProductId(productsData[0].id.toString());
        }
      }

      if (dashboardRes.ok) {
        setDashboardData(await dashboardRes.json());
      }
    } catch (err) {
      console.error("Error fetching data:", err);
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

    if (!selectedProductId || quantity <= 0) {
      setError('Please select a valid product and quantity.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: parseInt(selectedProductId),
          quantitySold: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to process sale.');
      } else {
        setSuccess('Sale processed successfully!');
        setQuantity(1);
        fetchData(); // Refresh data to immediately reflect updated stock
      }
    } catch (err) {
      setError('An error occurred while processing the sale.');
      console.error(err);
    }
  };

  if (loading && !dashboardData) {
    return <div className="flex bg-gray-50 min-h-screen items-center justify-center font-semibold text-gray-500">Loading SmartStock...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="mb-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-900">SmartStock</h1>
          <p className="text-gray-500 mt-2 text-lg">Management Information System</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Point of Sale Section */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Point of Sale</h2>
            <form onSubmit={handleSaleSubmit} className="space-y-5 flex-1 flex flex-col">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="" disabled>Select a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              {error && <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg">{error}</div>}
              {success && <div className="text-green-700 text-sm font-medium bg-green-50 p-3 rounded-lg">{success}</div>}

              <div className="mt-auto pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
                >
                  Confirm Sale
                </button>
              </div>
            </form>
          </div>

          {/* Business Intelligence Chart Section */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales Trends</h2>
            <div className="flex-1 w-full min-h-[300px]">
              {dashboardData?.salesChartData && dashboardData.salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.salesChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 13}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 13}} />
                    <Tooltip 
                      cursor={{fill: '#F3F4F6'}}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '10px'}} />
                    <Bar dataKey="quantitySold" name="Quantity Sold" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No recent sales data available.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Low Stock Alerts Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="bg-orange-100 p-2 rounded-lg text-orange-600">⚠️</span> Low Stock Alerts
          </h2>
          {dashboardData?.lowStockProducts && dashboardData.lowStockProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {dashboardData.lowStockProducts.map((p) => (
                <div key={p.id} className="border border-orange-200 bg-orange-50/50 rounded-xl p-5 flex justify-between items-center transition-transform hover:scale-[1.02] hover:shadow-sm">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{p.name}</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-3xl font-extrabold text-orange-600 leading-none">{p.stockQuantity}</span>
                    <span className="text-xs uppercase tracking-wider text-orange-500 font-bold mt-1">Amount Left</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center bg-gray-50 py-8 rounded-xl border border-dashed border-gray-200">
               <p className="font-medium text-gray-500">Inventory levels are healthy. No items are below the safety threshold.</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
