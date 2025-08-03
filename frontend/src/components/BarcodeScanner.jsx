import React, { useState, useEffect, useRef } from 'react';
import { Scan, Package, Search } from 'lucide-react';

const BarcodeScanner = ({ onBarcodeScanned, products, onAddToCart }) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lastScannedProduct, setLastScannedProduct] = useState(null);
  const [recentlyScanned, setRecentlyScanned] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input saat komponen dimount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    
    if (!barcodeInput.trim()) return;

    const product = products.find(p => p.barcode === barcodeInput.trim());
    
    if (product) {
      setLastScannedProduct(product);
      onBarcodeScanned(barcodeInput.trim());
      
      // Add to recently scanned
      setRecentlyScanned(prev => {
        const filtered = prev.filter(p => p.id !== product.id);
        return [product, ...filtered].slice(0, 10); // Keep last 10
      });
    } else {
      alert(`Produk dengan barcode "${barcodeInput}" tidak ditemukan!`);
    }
    
    setBarcodeInput('');
    if (inputRef.current) {
      inputRef.current.focus();
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

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-600 bg-red-100';
    if (stock <= 10) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getStockText = (stock) => {
    if (stock === 0) return 'Habis';
    if (stock <= 10) return 'Sedikit';
    return 'Tersedia';
  };

  return (
    <div className="space-y-6">
      {/* Scanner Input */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="text-center mb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <Scan className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Scanner Barcode</h3>
          <p className="text-sm text-gray-600">Scan barcode produk atau ketik manual</p>
        </div>

        <form onSubmit={handleBarcodeSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan atau ketik barcode..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
              autoComplete="off"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Cari Produk
          </button>
        </form>
      </div>

      {/* Last Scanned Product */}
      {lastScannedProduct && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-3 flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Produk Terakhir Discan
          </h4>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium text-gray-800">{lastScannedProduct.name}</h5>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor(lastScannedProduct.stock)}`}>
                {getStockText(lastScannedProduct.stock)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>Harga: {formatPrice(lastScannedProduct.price)}</p>
                <p>Stok: {lastScannedProduct.stock}</p>
                <p>Barcode: {lastScannedProduct.barcode}</p>
              </div>
              <button
                onClick={() => onAddToCart(lastScannedProduct)}
                disabled={lastScannedProduct.stock === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {lastScannedProduct.stock === 0 ? 'Habis' : 'Tambah ke Keranjang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recently Scanned Products */}
      {recentlyScanned.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Produk Terakhir Discan</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentlyScanned.map(product => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-sm text-gray-800 flex-1 pr-2">{product.name}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor(product.stock)}`}>
                    {getStockText(product.stock)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-600">
                    <p className="font-semibold text-blue-600">{formatPrice(product.price)}</p>
                    <p>Stok: {product.stock}</p>
                  </div>
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock === 0}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {product.stock === 0 ? 'Habis' : 'Tambah'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">Petunjuk Penggunaan</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Arahkan scanner ke barcode produk</li>
          <li>• Atau ketik barcode secara manual di input box</li>
          <li>• Tekan Enter atau tombol "Cari Produk" untuk mencari</li>
          <li>• Produk yang ditemukan akan muncul di bawah untuk ditambahkan ke keranjang</li>
        </ul>
      </div>
    </div>
  );
};

export default BarcodeScanner;