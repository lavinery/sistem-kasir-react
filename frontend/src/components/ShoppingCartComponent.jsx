// frontend/src/components/ShoppingCartComponent.jsx - Complete Cyber Shopping Cart
import React, { useState } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, CreditCard, Receipt, 
  User, Gift, Calculator, Zap, Percent, Target, Sparkles,
  TrendingUp, DollarSign, Clock, Wifi, Battery
} from 'lucide-react';
import CheckoutModal from './CheckoutModal';

const ShoppingCartComponent = ({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  user,
  settings = {},
  memberId = ''
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      ? subtotal * (settings.memberDiscountRate || 0.05)
      : 0;
    
    let additionalDiscount = 0;
    if (manualDiscount > 0) {
      if (discountType === 'percentage') {
        additionalDiscount = subtotal * (manualDiscount / 100);
      } else {
        additionalDiscount = manualDiscount;
      }
    }
    
    const totalDiscount = memberDiscount + additionalDiscount;
    const afterDiscountSubtotal = Math.max(0, subtotal - totalDiscount);
    const tax = settings.taxEnabled ? afterDiscountSubtotal * (settings.tax || 0.11) : 0;
    const total = afterDiscountSubtotal + tax;
    
    return {
      subtotal,
      memberDiscount,
      additionalDiscount,
      totalDiscount,
      tax,
      total,
      afterDiscountSubtotal
    };
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      // Create flash effect
      const flash = document.createElement('div');
      flash.className = 'fixed inset-0 bg-red-400/20 pointer-events-none z-50 animate-pulse';
      document.body.appendChild(flash);
      setTimeout(() => document.body.removeChild(flash), 300);
      
      alert('🛒 Keranjang masih kosong!\nTambahkan produk terlebih dahulu.');
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    onClearCart();
    setManualDiscount(0);
    
    // Success flash effect
    const flash = document.createElement('div');
    flash.className = 'fixed inset-0 bg-green-400/20 pointer-events-none z-50 animate-pulse';
    document.body.appendChild(flash);
    setTimeout(() => document.body.removeChild(flash), 500);
  };

  const totals = calculateTotals();

  return (
    <>
      <div className="flex flex-col h-full relative">
        {/* Cyber Header */}
        <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                  linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%),
                  linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                animation: 'slide 4s linear infinite'
              }}
            ></div>
          </div>
          
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs font-bold">{cartItems.length}</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold">SMART CART</h2>
                  <div className="flex items-center space-x-2 text-cyan-200 text-sm">
                    <Wifi className="w-3 h-3" />
                    <span>ONLINE</span>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <Clock className="w-3 h-3" />
                    <span>{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-400/30 p-3 rounded-xl transition-all transform hover:scale-110"
                  title="Clear all items"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Cart Empty</h3>
              <p className="text-gray-400 text-center text-sm max-w-xs">
                Select your favorite products from the left panel to start a new transaction
              </p>
              <div className="mt-4 p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <p className="text-blue-300 text-xs">💡 Tip: Use barcode scanner for faster input</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="group bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:border-cyan-400/40 transition-all duration-300"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            #{index + 1}
                          </span>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <h4 className="font-bold text-white text-sm leading-tight mb-1 group-hover:text-cyan-300 transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {formatPrice(item.price)} per unit
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-xl hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 flex items-center justify-center transition-all hover:scale-110"
                        >
                          <Minus className="w-3 h-3 text-white" />
                        </button>
                        
                        <div className="w-16 text-center">
                          <span className="text-xl font-bold text-white">{item.quantity}</span>
                        </div>
                        
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                      </div>
                      
                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Glowing bottom line */}
                  <div className="h-px bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary and Checkout */}
        {cartItems.length > 0 && (
          <div className="border-t border-white/20 bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl">
            {/* Member & Discount Section */}
            <div className="p-4 space-y-3">
              {/* Member Status */}
              {memberId && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-bold text-purple-300">MEMBER ACTIVE</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-purple-200 text-xs">ID: {memberId}</span>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-purple-300 text-xs font-medium">
                          {((settings.memberDiscountRate || 0.05) * 100).toFixed(1)}% OFF
                        </span>
                      </div>
                    </div>
                    <Gift className="w-5 h-5 text-pink-400 animate-bounce" />
                  </div>
                </div>
              )}

              {/* Manual Discount */}
              {settings.allowDiscountEntry && user?.role !== 'kasir' && (
                <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-2xl p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Percent className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-bold text-orange-300">ADDITIONAL DISCOUNT</span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-2 py-1"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">Rp</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={manualDiscount}
                      onChange={(e) => setManualDiscount(parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-2 py-1 focus:border-orange-400"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Calculation Summary */}
            <div className="px-4 pb-4">
              <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/50">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Subtotal:
                    </span>
                    <span className="font-bold text-white">{formatPrice(totals.subtotal)}</span>
                  </div>
                  
                  {totals.memberDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-400 flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Member Discount:
                      </span>
                      <span className="text-purple-400 font-bold">
                        -{formatPrice(totals.memberDiscount)}
                      </span>
                    </div>
                  )}
                  
                  {totals.additionalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-400 flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        Additional Discount:
                      </span>
                      <span className="text-orange-400 font-bold">
                        -{formatPrice(totals.additionalDiscount)}
                      </span>
                    </div>
                  )}
                  
                  {settings.taxEnabled && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Tax ({((settings.tax || 0.11) * 100).toFixed(1)}%):
                      </span>
                      <span className="font-bold text-white">{formatPrice(totals.tax)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-slate-600 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-400" />
                        TOTAL:
                      </span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        {formatPrice(totals.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="p-4 bg-gradient-to-r from-slate-900/90 to-purple-900/90 backdrop-blur-xl">
              <button
                onClick={handleCheckout}
                className="w-full relative group overflow-hidden"
              >
                {/* Button Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 rounded-2xl opacity-100 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                
                {/* Button Content */}
                <div className="relative py-4 px-6 flex items-center justify-center space-x-3 text-white font-bold text-lg">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span>CHECKOUT</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
                    <span className="text-sm">{formatPrice(totals.total)}</span>
                    <Zap className="w-4 h-4 animate-pulse" />
                  </div>
                </div>
                
                {/* Animated border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              </button>
              
              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 rounded-xl hover:from-blue-500/30 hover:to-cyan-500/30 transition-all backdrop-blur-sm group">
                  <Receipt className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Preview</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all backdrop-blur-sm group">
                  <Calculator className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Calculate</span>
                </button>
              </div>

              {/* System Status */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Battery className="w-3 h-3" />
                  <span>98%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cartItems={cartItems}
          subtotal={totals.subtotal}
          memberDiscount={totals.memberDiscount}
          additionalDiscount={totals.additionalDiscount}
          tax={totals.tax}
          total={totals.total}
          user={user}
          memberId={memberId}
          settings={settings}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(20px); }
        }
      `}</style>
    </>
  );
};

export default ShoppingCartComponent;