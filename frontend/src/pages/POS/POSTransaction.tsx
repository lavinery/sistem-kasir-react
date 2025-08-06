import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  barcode?: string;
  category?: {
    id: number;
    name: string;
  };
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

interface Member {
  id: number;
  memberId: string;
  name: string;
  discountRate: number;
}

interface Settings {
  tax: number;
  taxEnabled: boolean;
  memberDiscountRate: number;
  memberDiscountEnabled: boolean;
  storeName: string;
  currency: string;
  currencySymbol: string;
}

const POSTransaction: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [memberQuery, setMemberQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPosData();
  }, []);

  const loadPosData = async () => {
    try {
      const data = await ApiService.getPosInitData();
      setProducts(data.products || []);
      setFavorites(data.favorites || []);
      setSettings(data.settings || null);
    } catch (error) {
      console.error('Error loading POS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await ApiService.searchProducts(searchQuery);
      setProducts(results);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const findMember = async () => {
    if (!memberQuery.trim()) {
      setSelectedMember(null);
      return;
    }

    try {
      const member = await ApiService.getMemberById(memberQuery);
      setSelectedMember(member);
    } catch (error) {
      console.error('Error finding member:', error);
      setSelectedMember(null);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        alert('Stock tidak mencukupi!');
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock: product.stock
        }]);
      } else {
        alert('Produk habis!');
      }
    }
  };

  const updateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(item => item.productId === productId);
    if (item && newQuantity <= item.stock) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      alert('Stock tidak mencukupi!');
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedMember(null);
    setMemberQuery('');
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateMemberDiscount = () => {
    if (!selectedMember || !settings?.memberDiscountEnabled) return 0;
    return calculateSubtotal() * selectedMember.discountRate;
  };

  const calculateTax = () => {
    if (!settings?.taxEnabled) return 0;
    const subtotalAfterMemberDiscount = calculateSubtotal() - calculateMemberDiscount();
    return subtotalAfterMemberDiscount * (settings.tax || 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const memberDiscount = calculateMemberDiscount();
    const tax = calculateTax();
    return subtotal - memberDiscount + tax;
  };

  const formatCurrency = (amount: number) => {
    const symbol = settings?.currencySymbol || 'Rp';
    return `${symbol} ${amount.toLocaleString('id-ID')}`;
  };

  const checkout = async () => {
    if (cart.length === 0) {
      alert('Keranjang kosong!');
      return;
    }

    setProcessing(true);
    try {
      const subtotal = calculateSubtotal();
      const memberDiscount = calculateMemberDiscount();
      const tax = calculateTax();
      const total = calculateTotal();

      const transactionData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        tax,
        total,
        memberDiscount,
        transactionDiscount: 0,
        memberId: selectedMember?.id || null,
        paymentMethod: 'cash',
        notes: ''
      };

      const result = await ApiService.checkout(transactionData);
      
      if (result.success) {
        alert('Transaksi berhasil!');
        clearCart();
        loadPosData(); // Refresh data
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Transaksi gagal: ' + (error as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading POS data...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen max-h-screen overflow-hidden">
      {/* Products Section */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <h2 className="text-xl font-semibold mb-4">Produk</h2>
          
          {/* Search */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
              placeholder="Cari produk atau scan barcode..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={searchProducts}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Cari
            </button>
          </div>

          {/* Favorites */}
          {favorites.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2 text-gray-700">Produk Favorit</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {favorites.slice(0, 6).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left hover:bg-yellow-100 transition-colors"
                  >
                    <div className="font-medium text-sm truncate">{product.name}</div>
                    <div className="text-blue-600 font-semibold text-sm">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="text-xs text-gray-500">Stok: {product.stock}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  product.stock <= 0
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-300'
                }`}
              >
                <div className="font-medium text-sm truncate">{product.name}</div>
                <div className="text-blue-600 font-semibold text-sm">
                  {formatCurrency(product.price)}
                </div>
                <div className="text-xs text-gray-500">Stok: {product.stock}</div>
                {product.category && (
                  <div className="text-xs text-gray-400 truncate">{product.category.name}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart & Checkout Section */}
      <div className="bg-white rounded-lg shadow p-6 overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <h2 className="text-xl font-semibold mb-4">Keranjang</h2>
          
          {/* Member Section */}
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && findMember()}
                placeholder="ID Member (opsional)"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={findMember}
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              >
                Cari
              </button>
            </div>
            {selectedMember && (
              <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                <div className="font-medium">{selectedMember.name}</div>
                <div className="text-green-600">
                  Diskon: {(selectedMember.discountRate * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto mb-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Keranjang kosong
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="w-6 h-6 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        {cart.length > 0 && (
          <div className="flex-shrink-0 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(calculateSubtotal())}</span>
            </div>
            {calculateMemberDiscount() > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Diskon Member:</span>
                <span>-{formatCurrency(calculateMemberDiscount())}</span>
              </div>
            )}
            {calculateTax() > 0 && (
              <div className="flex justify-between text-sm">
                <span>Pajak:</span>
                <span>{formatCurrency(calculateTax())}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex-shrink-0 space-y-2 mt-4">
          <button
            onClick={checkout}
            disabled={cart.length === 0 || processing}
            className={`w-full py-3 rounded-md font-medium ${
              cart.length === 0 || processing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {processing ? 'Memproses...' : 'Checkout'}
          </button>
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="w-full py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Bersihkan
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSTransaction;