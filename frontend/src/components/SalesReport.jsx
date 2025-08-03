// frontend/src/components/SalesReport.jsx - Enhanced with Real Data
import React, { useState, useEffect } from 'react';
import { salesAPI } from '../utils/api';
import { Calendar, TrendingUp, ShoppingCart, DollarSign, Package, Users } from 'lucide-react';

const SalesReport = () => {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    today: { sales: 0, transactions: 0, itemsSold: 0 },
    overall: { totalSales: 0, totalRevenue: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load sales data
      const salesData = await salesAPI.getAll();
      setSales(salesData || []);
      
      // Load stats (if endpoint exists)
      try {
        const statsResponse = await fetch('http://localhost:5000/api/sales/stats/summary', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.log('Stats endpoint not available, using calculated stats');
        calculateStats(salesData);
      }
      
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (salesData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySales = salesData.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });

    const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
    const totalItemsSold = salesData.reduce((sum, sale) => 
      sum + (sale.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0
    );

    setStats({
      today: {
        sales: todayTotal,
        transactions: todaySales.length,
        itemsSold: todaySales.reduce((sum, sale) => 
          sum + (sale.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0
        )
      },
      overall: {
        totalSales: salesData.length,
        totalRevenue: totalRevenue
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h2>
            <p className="text-gray-600">Monitor your sales performance and trends</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="all">Semua</option>
            </select>
            <button
              onClick={loadData}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Penjualan Hari Ini</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.today.sales)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShoppingCart className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Transaksi Hari Ini</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.today.transactions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Item Terjual Hari Ini</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.today.itemsSold}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.overall.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kasir
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Belum ada transaksi</p>
                  </td>
                </tr>
              ) : (
                sales.slice(0, 10).map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        #{sale.id.toString().padStart(6, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.user?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sale.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                        sale.paymentMethod === 'card' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {sales.length > 10 && (
          <div className="p-4 border-t bg-gray-50 text-center">
            <p className="text-sm text-gray-600">
              Menampilkan 10 dari {sales.length} transaksi
            </p>
          </div>
        )}
      </div>

      {/* Sales Summary by Payment Method */}
      {sales.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {['cash', 'card', 'digital'].map(method => {
                const methodSales = sales.filter(sale => sale.paymentMethod === method);
                const methodTotal = methodSales.reduce((sum, sale) => sum + sale.total, 0);
                const percentage = sales.length > 0 ? (methodSales.length / sales.length) * 100 : 0;
                
                return (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        method === 'cash' ? 'bg-green-500' :
                        method === 'card' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></div>
                      <span className="text-sm font-medium capitalize">{method}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(methodTotal)}</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Transaction:</span>
                <span className="text-sm font-medium">
                  {sales.length > 0 ? formatCurrency(stats.overall.totalRevenue / sales.length) : formatCurrency(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Transactions:</span>
                <span className="text-sm font-medium">{stats.overall.totalSales}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Best Day:</span>
                <span className="text-sm font-medium">
                  {sales.length > 0 ? formatDate(sales[0]?.createdAt) : 'No data'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;