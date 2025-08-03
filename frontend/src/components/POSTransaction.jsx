// frontend/src/components/POSTransaction.jsx - Simplified Transaction Interface
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, Search, Star, 
  User, Percent, Calculator, CreditCard, Package
} from 'lucide-react';
import { productsAPI, salesAPI, membersAPI, settingsAPI } from '../utils/api';
import CheckoutModal from './CheckoutModal';
import BarcodeScanner from './BarcodeScanner';

const POSTransaction = ({ currentUser }) => {
  // State management
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [validatedMember, setValidatedMember] = useState(null);
  const [settings, setSettings] = useState({
    tax: 0.11,
    memberDiscountRate: 0.05,
    favoriteProductIds: [1, 2, 3, 4, 5, 6]
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, settingsData] = await Promise.all([
        productsAPI.getAll(),
        settingsAPI.getAll()
      ]);
      
      setProducts(productsData || []);
      setSettings(prev => ({ ...prev, ...settingsData }));
      
      // Load favorite products based on settings
      const favoriteProducts = (productsData || [])
        .filter(product => settingsData.favoriteProductIds?.includes(product.id))
        .slice(0, 6);
      setFavorites(favoriteProducts);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Product search and add to cart
  const handleProductSearch = (term) => {
    setSearchTerm(term);
  };

  const addToCart = (product, quantity = 1) => {
    if (product.stock < quantity) {
      alert(`Stok ${product.name} tidak mencukupi! Tersedia: ${product.stock}`);
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        alert(`Stok ${product.name} tidak mencukupi!`);
        return;
      }
      updateCartQuantity(product.id, newQuantity);
    } else {
      setCart(prev => [...prev, { ...product, quantity }]);
    }
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
      alert(`Stok ${product.name} hanya tersedia ${product.stock} pcs`);
      return;
    }

    setCart(prev => prev.map(item =>
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    if (confirm('Kosongkan seluruh keranjang?')) {
      setCart([]);
      setMemberInput('');
      setDiscountInput('');
      setValidatedMember(null);
    }
  };

  // Member validation
  const validateMember = async () => {
    if (!memberInput.trim()) {
      setValidatedMember(null);
      return;
    }

    try {
      const response = await membersAPI.validate(memberInput.trim());
      setValidatedMember(response);
    } catch (error) {
      setValidatedMember(null);
      alert('Member ID tidak ditemukan');
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let memberDiscount = 0;
    if (validatedMember) {
      memberDiscount = subtotal * settings.memberDiscountRate;
    }
    
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

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setCart([]);
    setMemberInput('');
    setDiscountInput('');
    setValidatedMember(null);
    loadData(); // Refresh product stock
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-lg">Memuat sistem transaksi...</span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Main Transaction Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Transaksi Penjualan</h1>
              <p className="text-gray-600">Kasir: {currentUser?.name}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-lg font-semibold text-blue-600">
                {new Date().toLocaleTimeString('id-ID')}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Scanner */}
        <div className="bg-white border-b p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk atau scan barcode..."
                  value={searchTerm}
                  onChange={(e) => handleProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchTerm) {
                      const product = products.find(p => 
                        p.barcode === searchTerm || 
                        p.name.toLowerCase().includes(searchTerm.toLowerCase())
                      );
                      if (product) {
                        addToCart(product);
                        setSearchTerm('');
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Favorite Products */}
        <div className="bg-white border-b p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Produk Favorit
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {favorites.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 disabled:from-gray-50 disabled:to-gray-100 border-2 border-blue-200 disabled:border-gray-200 rounded-xl p-4 text-center transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-blue-200 disabled:bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-medium text-sm text-gray-800 line-clamp-2 mb-1">
                  {product.name}
                </h4>
                <p className="text-xs text-blue-600 font-semibold">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Stok: {product.stock}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="flex-1 bg-gray-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Ringkasan Transaksi</h3>
            
            {/* Totals Display */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
              </div>
              
              {validatedMember && (
                <div className="flex justify-between text-blue-600">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Diskon Member ({(settings.memberDiscountRate * 100)}%):
                  </span>
                  <span className="font-semibold">-{formatCurrency(totals.memberDiscount)}</span>
                </div>
              )}
              
              {totals.transactionDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Percent className="w-4 h-4" />
                    Diskon Transaksi:
                  </span>
                  <span className="font-semibold">-{formatCurrency(totals.transactionDiscount)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>PPN ({(settings.tax * 100)}%):</span>
                <span className="font-semibold">{formatCurrency(totals.tax)}</span>
              </div>
              
              <div className="border-t-2 pt-3">
                <div className="flex justify-between text-2xl font-bold text-green-600">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>

            {/* Member & Discount Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    placeholder="Masukkan ID Member"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={validateMember}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Cek
                  </button>
                </div>
                {validatedMember && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    ✓ {validatedMember.name} - Diskon {(settings.memberDiscountRate * 100)}%
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diskon Tambahan
                </label>
                <input
                  type="text"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  placeholder="10000 atau 10%"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Bersihkan
              </button>
              
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="flex-2 bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-lg font-semibold"
              >
                <CreditCard className="w-5 h-5" />
                Bayar - {formatCurrency(totals.total)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      <div className="w-96 bg-white shadow-xl border-l flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Keranjang ({cart.length})
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCart className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-center text-lg font-medium">Keranjang Kosong</p>
              <p className="text-center text-sm">Scan atau pilih produk untuk memulai</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3 border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm text-gray-800 flex-1 pr-2">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cartItems={cart}
          subtotal={totals.subtotal}
          tax={totals.tax}
          total={totals.total}
          memberDiscount={totals.memberDiscount}
          transactionDiscount={totals.transactionDiscount}
          member={validatedMember}
          user={currentUser}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};

export default POSTransaction;