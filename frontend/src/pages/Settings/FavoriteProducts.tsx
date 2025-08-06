import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category?: {
    id: number;
    name: string;
  };
}

const FavoriteProducts: React.FC = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [favoritesData, availableData] = await Promise.all([
        ApiService.getFavorites(),
        ApiService.getAvailableProducts()
      ]);
      
      setFavorites(favoritesData);
      setAvailableProducts(availableData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (product: Product) => {
    if (favorites.length >= 6) {
      alert('Maksimal 6 produk favorit!');
      return;
    }

    try {
      await ApiService.addToFavorites(product.id);
      setFavorites([...favorites, product]);
      setAvailableProducts(availableProducts.filter(p => p.id !== product.id));
    } catch (error) {
      console.error('Error adding to favorites:', error);
      alert('Gagal menambahkan ke favorit: ' + (error as Error).message);
    }
  };

  const removeFromFavorites = async (productId: number) => {
    try {
      await ApiService.removeFromFavorites(productId);
      const removedProduct = favorites.find(p => p.id === productId);
      if (removedProduct) {
        setFavorites(favorites.filter(p => p.id !== productId));
        setAvailableProducts([...availableProducts, removedProduct].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Gagal menghapus dari favorit: ' + (error as Error).message);
    }
  };

  const updateFavoritesOrder = async (newOrder: Product[]) => {
    setSaving(true);
    try {
      const favoriteIds = newOrder.map(p => p.id);
      await ApiService.updateFavorites(favoriteIds);
      setFavorites(newOrder);
    } catch (error) {
      console.error('Error updating favorites order:', error);
      alert('Gagal mengubah urutan favorit: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...favorites];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      updateFavoritesOrder(newOrder);
    }
  };

  const moveDown = (index: number) => {
    if (index < favorites.length - 1) {
      const newOrder = [...favorites];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      updateFavoritesOrder(newOrder);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const filteredAvailableProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Produk Favorit</h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola produk favorit yang akan ditampilkan di halaman POS (maksimal 6 produk)
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Favorites */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Produk Favorit Saat Ini ({favorites.length}/6)
            </h3>
            
            {favorites.length === 0 ? (
              <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
                Belum ada produk favorit
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0 || saving}
                        className="w-6 h-6 bg-gray-100 rounded text-xs hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === favorites.length - 1 || saving}
                        className="w-6 h-6 bg-gray-100 rounded text-xs hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↓
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{product.name}</div>
                      <div className="text-sm text-blue-600 font-semibold">
                        {formatCurrency(product.price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Stok: {product.stock}
                        {product.category && ` • ${product.category.name}`}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 font-mono">
                      #{index + 1}
                    </div>
                    
                    <button
                      onClick={() => removeFromFavorites(product.id)}
                      className="w-8 h-8 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Products */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Produk Tersedia</h3>
            
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {filteredAvailableProducts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {searchQuery ? 'Produk tidak ditemukan' : 'Semua produk sudah menjadi favorit'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailableProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{product.name}</div>
                        <div className="text-sm text-blue-600 font-semibold">
                          {formatCurrency(product.price)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Stok: {product.stock}
                          {product.category && ` • ${product.category.name}`}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => addToFavorites(product)}
                        disabled={favorites.length >= 6}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          favorites.length >= 6
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        Tambah
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Petunjuk:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Produk favorit akan ditampilkan di bagian atas halaman POS untuk akses cepat</li>
            <li>• Gunakan tombol ↑↓ untuk mengubah urutan produk favorit</li>
            <li>• Maksimal 6 produk favorit yang dapat dipilih</li>
            <li>• Produk favorit akan tersimpan otomatis saat diubah</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FavoriteProducts;