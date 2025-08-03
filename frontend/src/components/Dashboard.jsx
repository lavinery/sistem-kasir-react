// frontend/src/components/Dashboard.jsx - Enhanced for Stationery Store
import React, { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI, salesAPI } from '../utils/api';
import { 
  Search, ShoppingCart, Grid, List, Minus, Plus, Trash2, CreditCard, Package,
  Star, Scan, User, UserCheck, Percent, Settings, AlertTriangle, CheckCircle
} from 'lucide-react';

const Dashboard = ({ currentUser }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // New states for enhanced features
  const [memberInput, setMemberInput] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [memberDiscount, setMemberDiscount] = useState(0);
  const [settings, setSettings] = useState({
    tax: 0.11, // 11% PPN
    memberDiscountRate: 0.05, // 5% member discount
    minStock: 10
  });
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);

  // Hardcoded favorite product IDs (would be configurable in real app)
  const defaultFavoriteIds = [1, 2, 3, 4, 5, 6]; // First 6 products

  useEffect(() => {
    loadData();
    // Check for low stock alerts
    checkLowStock();
  }, []);

  useEffect(() => {
    // Update member discount when member input changes
    if (memberInput.trim()) {
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setMemberDiscount(subtotal * settings.memberDiscountRate);
    } else {
      setMemberDiscount(0);
    }
  }, [memberInput, cart, settings.memberDiscountRate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll()
      ]);
      
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      
      // Set favorite products (first 6 or based on settings)
      const favorites = (productsData || []).filter(product => 
        defaultFavoriteIds.includes(product.id)
      ).slice(0, 6);
      setFavoriteProducts(favorites);
      
      console.log('Dashboard loaded:', { 
        products: productsData?.length || 0, 
        categories: categoriesData?.length || 0,
        favorites: favorites.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLowStock = () => {
    const lowStockItems = products.filter(product => 
      product.stock <= settings.minStock && product.stock > 0
    );
    if (lowStockItems.length > 0) {
      setShowLowStockAlert(true);
    }
  };

  // Enhanced filter with barcode search
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm) ||
                         product.id.toString().includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || 
                           product.categoryId === parseInt(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // Enhanced cart functions
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert(`❌ Stok ${product.name} sudah habis!`);
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
        showAddToCartAnimation();
      } else {
        alert(`⚠️ Stok ${product.name} tidak mencukupi!`);
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      showAddToCartAnimation();
    }
  };

  const addFavoriteToCart = (productId) => {
    const product = favoriteProducts.find(p => p.id === productId);
    if (product) {
      addToCart(product);
    }
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
      alert(`⚠️ Stok ${product.name} hanya tersedia ${product.stock} pcs`);
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    if (confirm('🗑️ Kosongkan seluruh keranjang?')) {
      setCart([]);
      setMemberInput('');
      setDiscountInput('');
    }
  };

  // Enhanced calculation with discounts
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Transaction discount calculation
    let transactionDiscount = 0;
    if (discountInput) {
      if (discountInput.includes('%')) {
        const percent = parseFloat(discountInput.replace('%', '')) / 100;
        transactionDiscount = subtotal * percent;
      } else {
        transactionDiscount = parseFloat(discountInput) || 0;
      }
    }
    
    const totalDiscount = memberDiscount + transactionDiscount;
    const afterDiscount = Math.max(0, subtotal - totalDiscount);
    const tax = afterDiscount * settings.tax;
    const total = afterDiscount + tax;

    return {
      subtotal,
      memberDiscount,
      transactionDiscount,
      totalDiscount,
      tax,
      total
    };
  };

  // Enhanced checkout with receipt generation
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('🛒 Keranjang masih kosong!');
      return;
    }

    const totals = calculateTotals();
    
    setCheckoutLoading(true);
    try {
      const saleData = {
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        discount: totals.totalDiscount,
        memberDiscount: totals.memberDiscount,
        transactionDiscount: totals.transactionDiscount,
        memberId: memberInput || null,
        paymentMethod: 'cash',
        userId: currentUser.id,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      await salesAPI.create(saleData);
      
      // Generate receipt
      generateReceipt(totals);
      
      // Clear cart and reload products
      setCart([]);
      setMemberInput('');
      setDiscountInput('');
      await loadData();
      
      showSuccessAnimation();
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('❌ Gagal memproses transaksi: ' + (error.message || 'Unknown error'));
    } finally {
      setCheckoutLoading(false);
    }
  };

  const generateReceipt = (totals) => {
    let receipt = `🧾 STRUK PEMBELIAN\n`;
    receipt += `===============================\n`;
    receipt += `TOKO ALAT TULIS & KANTOR\n`;
    receipt += `${new Date().toLocaleString('id-ID')}\n`;
    receipt += `Kasir: ${currentUser.name}\n`;
    receipt += `===============================\n\n`;
    
    cart.forEach(item => {
      receipt += `${item.name}\n`;
      receipt += `${item.barcode || item.id} | ${item.quantity}x Rp ${item.price.toLocaleString('id-ID')} = Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n\n`;
    });
    
    receipt += `===============================\n`;
    receipt += `Subtotal: Rp ${totals.subtotal.toLocaleString('id-ID')}\n`;
    
    if (memberInput) {
      receipt += `👑 Member (${memberInput}): -Rp ${totals.memberDiscount.toLocaleString('id-ID')}\n`;
    }
    if (totals.transactionDiscount > 0) {
      receipt += `🎯 Diskon Transaksi: -Rp ${totals.transactionDiscount.toLocaleString('id-ID')}\n`;
    }
    receipt += `📊 PPN (${(settings.tax * 100)}%): Rp ${totals.tax.toLocaleString('id-ID')}\n`;
    receipt += `💰 TOTAL: Rp ${totals.total.toLocaleString('id-ID')}\n`;
    receipt += `===============================\n`;
    receipt += `Terima kasih atas kunjungan Anda!\n`;
    receipt += `Selamat berbelanja kembali 😊`;

    console.log(receipt);
    alert('✅ Transaksi berhasil!\n\nStruk telah dicetak.');
  };

  // Animation functions
  const showAddToCartAnimation = () => {
    const cartTitle = document.querySelector('.cart-title');
    if (cartTitle) {
      cartTitle.style.transform = 'scale(1.1)';
      setTimeout(() => {
        cartTitle.style.transform = 'scale(1)';
      }, 300);
    }
  };

  const showSuccessAnimation = () => {
    // Success animation implementation
    console.log('🎉 Transaction completed successfully!');
  };

  // Handle barcode scanning (Enter key detection)
  const handleBarcodeInput = (e) => {
    if (e.key === 'Enter' && searchTerm) {
      const product = products.find(p => 
        p.barcode === searchTerm || 
        p.id.toString() === searchTerm
      );
      if (product) {
        addToCart(product);
        setSearchTerm('');
      } else {
        alert('❌ Produk tidak ditemukan!');
      }
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-lg font-medium">Memuat data produk...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[calc(100vh-140px)]">
      {/* Main POS Section */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <Package className="w-8 h-8" />
                  Sistem Kasir POS
                </h1>
                <p className="opacity-90 mt-1">Toko Alat Tulis & Perlengkapan Kantor</p>
              </div>
              {showLowStockAlert && (
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">Stok Menipis!</span>
                </div>
              )}
            </div>
          </div>

          {/* Favorite Products Quick Access */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Produk Favorit
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Settings className="w-4 h-4" />
                Atur Favorit
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {favoriteProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 text-center"
                >
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-blue-600 font-semibold">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Stok: {product.stock}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Search and Controls */}
          <div className="p-6 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Box with Barcode Support */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk, scan barcode, atau masukkan kode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleBarcodeInput}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Scan className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 flex items-center gap-2 transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 flex items-center gap-2 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500">Total Produk</div>
                <div className="text-lg font-bold text-blue-600">{products.length}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500">Tersedia</div>
                <div className="text-lg font-bold text-green-600">
                  {products.filter(p => p.stock > 0).length}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500">Stok Rendah</div>
                <div className="text-lg font-bold text-orange-600">
                  {products.filter(p => p.stock <= settings.minStock && p.stock > 0).length}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500">Keranjang</div>
                <div className="text-lg font-bold text-purple-600">{cart.length}</div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg font-medium">
                  {products.length === 0 
                    ? "Tidak ada produk tersedia" 
                    : searchTerm 
                      ? `Tidak ditemukan produk dengan kata kunci "${searchTerm}"`
                      : "Tidak ada produk dalam kategori ini"
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-3 text-blue-600 hover:text-blue-800"
                  >
                    Hapus filter pencarian
                  </button>
                )}
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-3"
              }>
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={addToCart}
                    viewMode={viewMode}
                    minStock={settings.minStock}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Cart Section */}
      <div className="bg-white rounded-2xl shadow-xl flex flex-col max-h-screen">
        {/* Cart Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3 cart-title">
              <ShoppingCart className="w-6 h-6" />
              Keranjang ({cart.length})
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Kosongkan keranjang"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Member & Discount Section */}
        {cart.length > 0 && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            {/* Member ID Input */}
            <div className="mb-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Member ID (Optional)
              </label>
              <input
                type="text"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                placeholder="Masukkan ID Member untuk diskon 5%"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Transaction Discount Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Percent className="w-4 h-4 text-green-600" />
                Diskon Transaksi
              </label>
              <input
                type="text"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="Contoh: 10000 atau 10%"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500 mb-2">Keranjang Kosong</p>
              <p className="text-sm text-gray-400">
                Pilih produk favorit atau cari produk untuk memulai transaksi
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateCartQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">Rp {totals.subtotal.toLocaleString('id-ID')}</span>
              </div>
              
              {memberInput && totals.memberDiscount > 0 && (
                <div className="flex justify-between text-sm text-blue-600">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Diskon Member ({(settings.memberDiscountRate * 100)}%):
                  </span>
                  <span className="font-medium">-Rp {totals.memberDiscount.toLocaleString('id-ID')}</span>
                </div>
              )}
              
              {totals.transactionDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    Diskon Transaksi:
                  </span>
                  <span className="font-medium">-Rp {totals.transactionDiscount.toLocaleString('id-ID')}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">PPN ({(settings.tax * 100)}%):</span>
                <span className="font-medium">Rp {totals.tax.toLocaleString('id-ID')}</span>
              </div>
              
              <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-2">
                <span>Total Bayar:</span>
                <span>Rp {totals.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
            >
              {checkoutLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Checkout - Rp {totals.total.toLocaleString('id-ID')}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Product Card Component
const ProductCard = ({ product, onAddToCart, viewMode, minStock }) => {
  const getStockStatus = () => {
    if (product.stock === 0) return { class: 'bg-red-100 text-red-800', text: 'Habis' };
    if (product.stock <= minStock) return { class: 'bg-orange-100 text-orange-800', text: `${product.stock} pcs` };
    return { class: 'bg-green-100 text-green-800', text: `${product.stock} pcs` };
  };

  const stockStatus = getStockStatus();

  if (viewMode === 'list') {
    return (
      <div 
        className="flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
        onClick={() => onAddToCart(product)}
      >
        <div className="w-16 h-16 bg-gray-100 rounded-lg mr-4 flex items-center justify-center">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.category?.name}</p>
          <p className="text-lg font-bold text-green-600">
            Rp {product.price.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-500">
            Kode: {product.barcode || product.id}
          </p>
        </div>
        
        <div className="text-right mr-4">
          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${stockStatus.class}`}>
            {stockStatus.text}
          </div>
          {product.stock <= minStock && product.stock > 0 && (
            <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Stok Rendah
            </div>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.stock === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 relative">
      {/* Stock Badge */}
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.class}`}>
        {stockStatus.text}
      </div>
      
      {/* Low Stock Alert */}
      {product.stock <= minStock && product.stock > 0 && (
        <div className="absolute top-3 left-3 text-orange-500">
          <AlertTriangle className="w-4 h-4" />
        </div>
      )}
      
      <div className="w-full h-20 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
        <Package className="w-10 h-10 text-gray-400" />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-tight">
          {product.name}
        </h3>
        
        <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
          {product.category?.name}
        </p>
        
        <p className="text-lg font-bold text-green-600">
          Rp {product.price.toLocaleString('id-ID')}
        </p>
        
        <p className="text-xs text-gray-500">
          Kode: {product.barcode || product.id}
        </p>
        
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          {product.stock === 0 ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              Stok Habis
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Tambah ke Keranjang
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Enhanced Cart Item Component
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 line-clamp-2 text-sm">
            {item.name}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            {item.barcode || item.id} • Rp {item.price.toLocaleString('id-ID')} per item
          </p>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <span className="w-8 text-center font-medium text-sm">
            {item.quantity}
          </span>
          
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-right">
          <p className="font-bold text-green-600">
            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-500">
            Stok tersedia: {item.stock}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;