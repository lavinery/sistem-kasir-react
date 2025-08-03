// frontend/src/components/ProductGrid.jsx - Updated version
import React, { useState, useEffect } from 'react';
import { Search, Grid, List, ShoppingCart } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../utils/api';

const ProductGrid = ({ onAddToCart, searchTerm, setSearchTerm }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading products and categories...');
      
      // Load products and categories in parallel
      const [productsData, categoriesData] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll()
      ]);
      
      console.log('✅ Loaded products:', productsData.length);
      console.log('✅ Loaded categories:', categoriesData.length);
      
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || 
                           product.categoryId === parseInt(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">❌ Error loading data</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari produk atau scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="p-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {products.length === 0 
                ? "Tidak ada produk dalam database" 
                : "Tidak ada produk yang sesuai dengan pencarian"
              }
            </p>
            {products.length === 0 && (
              <button 
                onClick={loadData}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Refresh Data
              </button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              : "space-y-2"
          }>
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
        <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4">
          {product.image && (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.category?.name}</p>
          <p className="font-semibold text-blue-600">
            Rp {product.price.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="text-right mr-4">
          <p className="text-sm text-gray-500">Stok: {product.stock}</p>
        </div>
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-200 rounded-lg mb-3">
        {product.image && (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500">{product.category?.name}</p>
        <p className="font-semibold text-blue-600">
          Rp {product.price.toLocaleString('id-ID')}
        </p>
        <p className="text-xs text-gray-500">Stok: {product.stock}</p>
        
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 text-sm"
        >
          <ShoppingCart className="w-4 h-4 inline mr-1" />
          Tambah
        </button>
      </div>
    </div>
  );
};

export default ProductGrid;