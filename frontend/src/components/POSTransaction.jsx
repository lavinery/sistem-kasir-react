// frontend/src/components/POSTransaction.jsx - Futuristic Design with Cyber Theme
import React, { useState, useEffect } from 'react';
import { 
  Search, Scan, ShoppingCart, Plus, Star, User, 
  CreditCard, Calculator, Package, Zap, Settings,
  Sparkles, TrendingUp, Target, Wifi, Battery,
  Clock, DollarSign, Gift
} from 'lucide-react';
import { productsAPI, favoritesAPI, settingsAPI } from '../utils/api';
import ShoppingCartComponent from './ShoppingCartComponent';

const POSTransaction = ({ currentUser }) => {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [memberId, setMemberId] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState({
    tax: 0.11,
    memberDiscountRate: 0.05,
    taxEnabled: true,
    memberDiscountEnabled: true
  });

  useEffect(() => {
    loadInitialData();
    
    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [settingsData, favoritesData] = await Promise.all([
        loadSettings(),
        loadFavoriteProducts()
      ]);
      
      console.log('Data loaded:', { settingsData, favoritesData });
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const apiSettings = await settingsAPI.getAll();
      if (apiSettings) {
        setSettings(prev => ({ ...prev, ...apiSettings }));
        return apiSettings;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      const savedSettings = localStorage.getItem('posSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
        return parsed;
      }
    }
    return settings;
  };

  const loadFavoriteProducts = async () => {
    try {
      const favorites = await favoritesAPI.getAll();
      setFavoriteProducts(favorites || []);
      return favorites;
    } catch (error) {
      console.error('Error loading favorites:', error);
      try {
        const allProducts = await productsAPI.getAll();
        const firstSix = allProducts.slice(0, 6);
        setFavoriteProducts(firstSix);
        return firstSix;
      } catch (productError) {
        console.error('Error loading fallback products:', productError);
        return [];
      }
    }
  };

  const handleAddToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setMemberId('');
    setBarcodeInput('');
  };

  const handleBarcodeSearch = async (barcode) => {
    if (!barcode.trim()) return;
    
    try {
      const products = await productsAPI.getAll();
      const product = products.find(p => p.barcode === barcode.trim());
      
      if (product) {
        handleAddToCart(product);
        setBarcodeInput('');
        // Add success animation effect
        const flash = document.createElement('div');
        flash.className = 'fixed inset-0 bg-green-400/20 pointer-events-none z-50 animate-pulse';
        document.body.appendChild(flash);
        setTimeout(() => document.body.removeChild(flash), 200);
      } else {
        // Add error animation effect
        const flash = document.createElement('div');
        flash.className = 'fixed inset-0 bg-red-400/20 pointer-events-none z-50 animate-pulse';
        document.body.appendChild(flash);
        setTimeout(() => document.body.removeChild(flash), 200);
        alert('❌ Produk dengan barcode tersebut tidak ditemukan!');
      }
    } catch (error) {
      console.error('Error searching barcode:', error);
      alert('❌ Error saat mencari produk!');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    const memberDiscount = settings.memberDiscountEnabled && memberId 
      ? subtotal * settings.memberDiscountRate 
      : 0;
    
    const afterDiscountSubtotal = subtotal - memberDiscount;
    const tax = settings.taxEnabled ? afterDiscountSubtotal * settings.tax : 0;
    const total = afterDiscountSubtotal + tax;
    
    return { subtotal, memberDiscount, tax, total };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-400/30 rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-20 h-20 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"></div>
            <div className="absolute top-4 left-4 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400 animate-pulse" />
          </div>
          <p className="text-white text-xl font-bold mt-6">Initializing POS System...</p>
          <p className="text-blue-300 text-sm mt-2">Loading transaction interface</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
      </div>

      <div className="flex h-screen relative z-10">
        {/* Main Transaction Area */}
        <div className="flex-1 flex flex-col">
          {/* Futuristic Header */}
          <div className="backdrop-blur-xl bg-white/10 border-b border-cyan-500/30 shadow-2xl">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg border border-cyan-400/30">
                      <ShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    <Sparkles className="absolute -bottom-1 -left-1 w-4 h-4 text-yellow-400 animate-bounce" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                      POINT OF SALE
                    </h1>
                    <p className="text-cyan-300 font-medium">Advanced Transaction System v2.0</p>
                  </div>
                </div>
                
                {/* System Status */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-cyan-500/30">
                    <div className="flex items-center space-x-2">
                      <Wifi className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">ONLINE</span>
                    </div>
                    <div className="w-px h-6 bg-white/20"></div>
                    <div className="flex items-center space-x-2">
                      <Battery className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 text-sm font-medium">98%</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-cyan-300">
                      <User className="w-5 h-5" />
                      <span className="font-bold">{currentUser?.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        currentUser?.role === 'admin' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {currentUser?.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300 text-sm mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{currentTime.toLocaleTimeString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scanning Interface */}
          <div className="bg-gradient-to-r from-slate-800/50 to-purple-800/50 backdrop-blur-xl border-b border-purple-500/30 px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Barcode Scanner */}
              <div className="relative group">
                <label className="block text-sm font-bold text-cyan-300 mb-3 flex items-center gap-2">
                  <Scan className="w-5 h-5" />
                  BARCODE SCANNER
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto"></div>
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-4">
                    <Scan className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-6 h-6" />
                    <input
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleBarcodeSearch(barcodeInput);
                        }
                      }}
                      placeholder="Scan atau ketik barcode..."
                      className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg font-mono"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Member System */}
              <div className="relative group">
                <label className="block text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  MEMBER ID
                  {memberId && <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse ml-auto"></div>}
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-4">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-6 h-6" />
                    <input
                      type="text"
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      placeholder="ID Member untuk diskon..."
                      className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg font-mono"
                    />
                    {memberId && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Gift className="w-6 h-6 text-pink-400 animate-bounce" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Favorite Products Grid */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  FAVORITE PRODUCTS
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium border border-yellow-500/30">
                    {favoriteProducts.length}/6 ACTIVE
                  </span>
                </h2>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">Quick Access Mode</span>
                  </div>
                </div>
              </div>
              
              {favoriteProducts.length === 0 ? (
                <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-12 text-center">
                  <div className="relative mb-6">
                    <Package className="w-20 h-20 text-gray-400 mx-auto" />
                    <Sparkles className="absolute top-0 right-8 w-6 h-6 text-yellow-400 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    No Favorite Products Configured
                  </h3>
                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    Configure your favorite products in Settings for lightning-fast access during transactions
                  </p>
                  <button className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                    <Settings className="w-5 h-5" />
                    Configure Favorites
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105"
                      onClick={() => handleAddToCart(product)}
                    >
                      {/* Card Background Effects */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Main Card */}
                      <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                        {/* Card Header */}
                        <div className="relative p-6 pb-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                  #{index + 1}
                                </span>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              </div>
                              <h3 className="font-bold text-white text-lg leading-tight mb-2 group-hover:text-cyan-300 transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {product.category?.name || 'Uncategorized'}
                              </p>
                            </div>
                            
                            <div className="relative">
                              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/25 transition-all">
                                <Package className="w-8 h-8 text-white" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                                <Plus className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="px-6 pb-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                                {formatPrice(product.price)}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className={`w-3 h-3 rounded-full ${
                                  product.stock > 10 ? 'bg-green-400' : 
                                  product.stock > 5 ? 'bg-yellow-400' : 'bg-red-400'
                                } animate-pulse`}></div>
                                <span className="text-sm text-gray-300">
                                  Stock: {product.stock} pcs
                                </span>
                              </div>
                            </div>
                            
                            <button className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-green-500/25 transition-all transform group-hover:scale-110 group-hover:rotate-12">
                              <Plus className="w-7 h-7 text-white" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Glowing bottom border */}
                        <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Transaction Summary */}
            {cartItems.length > 0 && (
              <div className="mt-8">
                <div className="bg-gradient-to-r from-slate-800/80 to-purple-800/80 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-6 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Calculator className="w-6 h-6 text-green-400" />
                    LIVE TRANSACTION SUMMARY
                    <div className="ml-auto flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">PROCESSING</span>
                    </div>
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-4 text-center border border-blue-500/30">
                      <DollarSign className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-blue-300 font-medium text-sm">SUBTOTAL</p>
                      <p className="text-2xl font-bold text-white">
                        {formatPrice(totals.subtotal)}
                      </p>
                    </div>
                    
                    {memberId && settings.memberDiscountEnabled && (
                      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-4 text-center border border-purple-500/30">
                        <Gift className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-purple-300 font-medium text-sm">MEMBER DISC</p>
                        <p className="text-2xl font-bold text-white">
                          -{formatPrice(totals.memberDiscount)}
                        </p>
                      </div>
                    )}
                    
                    {settings.taxEnabled && (
                      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-4 text-center border border-orange-500/30">
                        <TrendingUp className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                        <p className="text-orange-300 font-medium text-sm">
                          TAX ({(settings.tax * 100).toFixed(1)}%)
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {formatPrice(totals.tax)}
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-4 text-center border border-green-500/30">
                      <Sparkles className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <p className="text-green-300 font-medium text-sm">TOTAL</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {formatPrice(totals.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Futuristic Shopping Cart Sidebar */}
        <div className="w-96 backdrop-blur-xl bg-gradient-to-b from-slate-800/80 to-purple-800/80 border-l border-cyan-500/30 shadow-2xl">
          <ShoppingCartComponent
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            user={currentUser}
            settings={settings}
            memberId={memberId}
          />
        </div>
      </div>
    </div>
  );
};

export default POSTransaction;