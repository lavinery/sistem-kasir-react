// frontend/src/components/FavoriteProductsManager.jsx
import React, { useState, useEffect } from 'react';
import { Star, Package, Plus, X, Search, Grid } from 'lucide-react';
import { productsAPI, settingsAPI } from '../utils/api';

const FavoriteProductsManager = ({ onUpdate }) => {
  const [products, setProducts] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const maxFavorites = 6;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, settingsData, categoriesData] = await Promise.all([
        productsAPI.getAll(),
        settingsAPI.getAll(),
        fetch('http://localhost:5000/api/categories').then(res => res.json())
      ]);
      
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      
      const currentFavoriteIds = settingsData.favoriteProductIds || [];
      setFavoriteIds(currentFavoriteIds);
      
      // Get favorite products details
      const favorites = (productsData || [])
        .filter(product => currentFavoriteIds.includes(product.id))
        .sort((a, b) => currentFavoriteIds.indexOf(a.id) - currentFavoriteIds.indexOf(b.id));
      setFavoriteProducts(favorites);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFavorites = async () => {
    try {
      setSaving(true);
      await settingsAPI.update({ favoriteProductIds: favoriteIds });
      
      if (onUpdate) {
        onUpdate(favoriteIds);
      }
      
      alert('✅ Produk favorit berhasil disimpan!');
    } catch (error) {
      console.error('Error saving favorites:', error);
      alert('❌ Gagal menyimpan produk favorit');
    } finally {
      setSaving(false);
    }
  };

  const addToFavorites = (product) => {
    if (favoriteIds.length >= maxFavorites) {
      alert(`Maksimal ${maxFavorites} produk favorit`);
      return;
    }
    
    if (favoriteIds.includes(product.id)) {
      alert('Produk sudah ada dalam favorit');
      return;
    }
    
    const newFavoriteIds = [...favoriteIds, product.id];
    setFavoriteIds(newFavoriteIds);
    setFavoriteProducts(prev => [...prev, product]);
  };

  const removeFromFavorites = (productId) => {
    const newFavoriteIds = favoriteIds.filter(id => id !== productId);
    setFavoriteIds(newFavoriteIds);
    setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
  };

  const moveFavorite = (fromIndex, toIndex) => {
    const newFavorites = [...favoriteProducts];
    const newIds = [...favoriteIds];
    
    // Swap products
    [newFavorites[fromIndex], newFavorites[toIndex]] = [newFavorites[toIndex], newFavorites[fromIndex]];
    [newIds[fromIndex], newIds[toIndex]] = [newIds[toIndex], newIds[fromIndex]];
    
    setFavoriteProducts(newFavorites);
    setFavoriteIds(newIds);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || 
                           product.categoryId === parseInt(selectedCategory);
    const notInFavorites = !favoriteIds.includes(product.id);
    
    return matchesSearch && matchesCategory && notInFavorites;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Memuat produk...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Favorites */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Produk Favorit Saat Ini ({favoriteProducts.length}/{maxFavorites})
          </h3>
          <button
            onClick={saveFavorites}
            disabled={saving}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Belum ada produk favorit</p>
            <p className="text-sm">Tambahkan produk dari daftar di bawah</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteProducts.map((product, index) => (
              <div key={product.id} className="bg-white rounded-lg border p-4 relative">
                {/* Remove button */}
                <button
                  onClick={() => removeFromFavorites(product.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Position badge */}
                <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>

                {/* Product info */}
                <div className="pt-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg mb-3 flex items-center justify-center mx-auto">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <h4 className="font-medium text-sm text-center mb-2 line-clamp-2">
                    {product.name}
                  </h4>
                  
                  <div className="text-center">
                    <p className="text-blue-600 font-semibold">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Stok: {product.stock}
                    </p>
                  </div>
                </div>

                {/* Move buttons */}
                <div className="flex justify-center gap-2 mt-3">
                  <button
                    onClick={() => moveFavorite(index, index - 1)}
                    disabled={index === 0}
                    className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveFavorite(index, index + 1)}
                    disabled={index === favoriteProducts.length - 1}
                    className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick tip */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tips:</strong> Produk favorit akan muncul di halaman transaksi untuk akses cepat. 
            Urutkan sesuai prioritas dengan tombol panah. Maksimal {maxFavorites} produk.
          </p>
        </div>
      </div>

      {/* Add Products */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Tambah Produk Favorit
        </h3>

        {/* Search and filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Available products */}
        {favoriteIds.length >= maxFavorites ? (
          <div className="text-center py-8 text-gray-500">
            <Grid className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Maksimal {maxFavorites} produk favorit tercapai</p>
            <p className="text-sm">Hapus produk favorit untuk menambah yang baru</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Tidak ada produk ditemukan</p>
            {searchTerm && (
              <p className="text-sm">Coba ubah kata kunci pencarian</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {filteredProducts.slice(0, 20).map(product => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-lg mb-3 flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                
                <h4 className="font-medium text-sm text-center mb-2 line-clamp-2">
                  {product.name}
                </h4>
                
                <div className="text-center mb-3">
                  <p className="text-blue-600 font-semibold text-sm">
                    {formatCurrency(product.price)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Stok: {product.stock}
                  </p>
                  <p className="text-xs text-gray-400">
                    {product.category?.name}
                  </p>
                </div>
                
                <button
                  onClick={() => addToFavorites(product)}
                  disabled={favoriteIds.length >= maxFavorites}
                  className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Star className="w-3 h-3" />
                  Tambah
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length > 20 && (
          <div className="text-center mt-4 text-sm text-gray-500">
            Menampilkan 20 dari {filteredProducts.length} produk. Gunakan pencarian untuk hasil yang lebih spesifik.
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          📋 Cara Penggunaan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Mengelola Favorit:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Maksimal {maxFavorites} produk favorit</li>
              <li>• Gunakan tombol ↑↓ untuk mengatur urutan</li>
              <li>• Tombol ❌ untuk menghapus dari favorit</li>
              <li>• Klik "Simpan Perubahan" setelah edit</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Di Halaman Transaksi:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Produk favorit muncul di bagian atas</li>
              <li>• Klik langsung untuk tambah ke keranjang</li>
              <li>• Urutan sesuai pengaturan di sini</li>
              <li>• Shortcut keyboard F1-F6 tersedia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoriteProductsManager;