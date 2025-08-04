// frontend/src/components/FavoriteProductsManager.jsx - Drag & Drop Favorites
import React, { useState, useEffect } from 'react';
import { 
  Star, Package, Search, Plus, Trash2, Move, 
  CheckCircle, AlertCircle, Loader, Grid3X3, List
} from 'lucide-react';
import { productsAPI, favoritesAPI } from '../utils/api';

const FavoriteProductsManager = ({ onUpdate }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [draggedItem, setDraggedItem] = useState(null);

  const MAX_FAVORITES = 6;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [products, favorites] = await Promise.all([
        productsAPI.getAll(),
        favoritesAPI.getAll()
      ]);
      
      setAllProducts(products || []);
      setFavoriteProducts(favorites || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('❌ Error loading data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const saveFavorites = async () => {
    try {
      setSaving(true);
      const favoriteIds = favoriteProducts.map(p => p.id);
      await favoritesAPI.update(favoriteIds);
      
      if (onUpdate) {
        onUpdate(favoriteIds);
      }
      
      showMessage('✅ Produk favorit berhasil disimpan!', 'success');
    } catch (error) {
      console.error('Error saving favorites:', error);
      showMessage('❌ Gagal menyimpan: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const addToFavorites = (product) => {
    if (favoriteProducts.length >= MAX_FAVORITES) {
      showMessage(`⚠️ Maksimal ${MAX_FAVORITES} produk favorit`, 'warning');
      return;
    }

    if (favoriteProducts.find(p => p.id === product.id)) {
      showMessage('⚠️ Produk sudah ada di favorit', 'warning');
      return;
    }

    setFavoriteProducts(prev => [...prev, product]);
  };

  const removeFromFavorites = (productId) => {
    setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
  };

  const moveFavorite = (fromIndex, toIndex) => {
    const newFavorites = [...favoriteProducts];
    const [movedItem] = newFavorites.splice(fromIndex, 1);
    newFavorites.splice(toIndex, 0, movedItem);
    setFavoriteProducts(newFavorites);
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== dropIndex) {
      moveFavorite(draggedItem, dropIndex);
    }
    setDraggedItem(null);
  };

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !favoriteProducts.find(p => p.id === product.id)
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Kelola Produk Favorit
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Pilih maksimal {MAX_FAVORITES} produk untuk akses cepat di halaman transaksi
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={saveFavorites}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Favorit'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          message.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
          'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Current Favorites */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Produk Favorit Saat Ini ({favoriteProducts.length}/{MAX_FAVORITES})
          </h4>
          {favoriteProducts.length > 0 && (
            <p className="text-sm text-yellow-700">
              <Move className="w-4 h-4 inline mr-1" />
              Drag untuk mengubah urutan
            </p>
          )}
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="text-center py-8 text-yellow-700">
            <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Belum ada produk favorit</p>
            <p className="text-sm">Pilih produk dari daftar di bawah</p>
          </div>
        ) : (
          <div className={`grid gap-3 ${
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}>
            {favoriteProducts.map((product, index) => (
              <div
                key={product.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`bg-white rounded-lg border-2 p-4 cursor-move transition-all ${
                  draggedItem === index ? 'border-blue-400 shadow-lg scale-105' : 'border-yellow-300 hover:border-yellow-400'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                      <Move className="w-4 h-4 text-gray-400" />
                    </div>
                    <h5 className="font-semibold text-gray-800 text-sm leading-tight">
                      {product.name}
                    </h5>
                    <p className="text-xs text-gray-600 mt-1">
                      {product.category?.name || 'Tanpa Kategori'}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromFavorites(product.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-blue-600 text-sm">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Stok: {product.stock}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Search & List */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Pilih Produk untuk Ditambahkan
        </h4>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Products List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">
                {searchQuery ? 'Tidak ada produk yang sesuai' : 'Semua produk sudah menjadi favorit'}
              </p>
              {searchQuery && (
                <p className="text-sm">Coba kata kunci lain</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800">{product.name}</h5>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-600">
                        {product.category?.name || 'Tanpa Kategori'}
                      </p>
                      <p className="text-sm font-semibold text-blue-600">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stok: {product.stock}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => addToFavorites(product)}
                    disabled={favoriteProducts.length >= MAX_FAVORITES}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Tips Produk Favorit:
        </h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Pilih produk yang paling sering dijual untuk akses cepat</li>
          <li>• Maksimal {MAX_FAVORITES} produk favorit dapat ditampilkan</li>
          <li>• Drag & drop untuk mengubah urutan tampilan</li>
          <li>• Produk favorit akan muncul di halaman transaksi</li>
          <li>• Jangan lupa klik "Simpan Favorit" setelah mengubah</li>
        </ul>
      </div>
    </div>
  );
};

export default FavoriteProductsManager;