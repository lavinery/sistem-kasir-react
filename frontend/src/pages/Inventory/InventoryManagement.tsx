import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';

interface Product {
  id: number;
  name: string;
  barcode?: string;
  price: number;
  stock: number;
  minStock: number;
  category?: {
    id: number;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StockAlert {
  product: Product;
  status: 'low' | 'out' | 'critical';
  message: string;
}

const InventoryManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  useEffect(() => {
    loadInventoryData();
  }, []);

  useEffect(() => {
    generateStockAlerts();
  }, [products]);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getCategories()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateStockAlerts = () => {
    const alerts: StockAlert[] = [];
    
    products.forEach(product => {
      if (product.stock <= 0) {
        alerts.push({
          product,
          status: 'out',
          message: 'Stok habis - perlu restock segera!'
        });
      } else if (product.stock <= product.minStock) {
        if (product.stock <= product.minStock * 0.5) {
          alerts.push({
            product,
            status: 'critical',
            message: `Stok kritis (${product.stock} tersisa)`
          });
        } else {
          alerts.push({
            product,
            status: 'low',
            message: `Stok menipis (${product.stock} tersisa)`
          });
        }
      }
    });
    
    setStockAlerts(alerts.sort((a, b) => {
      const priority = { out: 3, critical: 2, low: 1 };
      return priority[b.status] - priority[a.status];
    }));
  };

  const handleStockAdjustment = async () => {
    if (!selectedProduct || !adjustmentQuantity) return;
    
    try {
      const quantity = parseInt(adjustmentQuantity);
      const newStock = adjustmentType === 'in' 
        ? selectedProduct.stock + quantity 
        : selectedProduct.stock - quantity;
      
      if (newStock < 0) {
        alert('Stok tidak boleh minus!');
        return;
      }

      // Update product stock locally (in real app, this would be an API call)
      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, stock: newStock }
          : p
      ));
      
      // Close modal and reset form
      setShowStockModal(false);
      setSelectedProduct(null);
      setAdjustmentQuantity('');
      setAdjustmentReason('');
      
      alert('Stok berhasil disesuaikan!');
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Gagal menyesuaikan stok!');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(searchQuery));
    const matchesCategory = selectedCategory === 'all' || 
                           product.category?.id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getStockStatus = (product: Product) => {
    if (product.stock <= 0) return { text: 'Habis', color: 'bg-red-100 text-red-800' };
    if (product.stock <= product.minStock * 0.5) return { text: 'Kritis', color: 'bg-red-100 text-red-800' };
    if (product.stock <= product.minStock) return { text: 'Rendah', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Cukup', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Manajemen Inventori</h1>
        <p className="text-sm text-gray-600">Kelola stok produk dan monitor ketersediaan</p>
      </div>

      {/* Stock Alerts */}
      {stockAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Peringatan Stok ({stockAlerts.length})
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stockAlerts.slice(0, 6).map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  alert.status === 'out' ? 'bg-red-50 border-red-400' :
                  alert.status === 'critical' ? 'bg-red-50 border-red-400' :
                  'bg-yellow-50 border-yellow-400'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {alert.product.name}
                      </h4>
                      <p className={`text-sm ${
                        alert.status === 'out' || alert.status === 'critical' 
                          ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {alert.message}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduct(alert.product);
                        setShowStockModal(true);
                      }}
                      className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Atur Stok
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Produk
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nama produk atau barcode..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(category => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => loadInventoryData()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Daftar Produk ({filteredProducts.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.barcode && (
                          <div className="text-sm text-gray-500">
                            Barcode: {product.barcode}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{product.stock}</span>
                        <span className="text-gray-500"> unit</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {product.minStock} unit
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowStockModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Atur Stok
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Penyesuaian Stok: {selectedProduct.name}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Stok saat ini: <span className="font-medium">{selectedProduct.stock} unit</span>
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Penyesuaian
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="in"
                        checked={adjustmentType === 'in'}
                        onChange={(e) => setAdjustmentType(e.target.value as 'in' | 'out')}
                        className="mr-2"
                      />
                      Tambah Stok
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="out"
                        checked={adjustmentType === 'out'}
                        onChange={(e) => setAdjustmentType(e.target.value as 'in' | 'out')}
                        className="mr-2"
                      />
                      Kurangi Stok
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(e.target.value)}
                    placeholder="Masukkan jumlah..."
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan/Catatan
                  </label>
                  <textarea
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="Alasan penyesuaian stok..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {adjustmentQuantity && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      Stok setelah penyesuaian: 
                      <span className="font-medium ml-1">
                        {adjustmentType === 'in' 
                          ? selectedProduct.stock + parseInt(adjustmentQuantity)
                          : selectedProduct.stock - parseInt(adjustmentQuantity)
                        } unit
                      </span>
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowStockModal(false);
                    setSelectedProduct(null);
                    setAdjustmentQuantity('');
                    setAdjustmentReason('');
                  }}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={handleStockAdjustment}
                  disabled={!adjustmentQuantity}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Simpan Penyesuaian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;