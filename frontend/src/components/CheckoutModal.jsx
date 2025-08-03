import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone, Printer, CheckCircle } from 'lucide-react';

const CheckoutModal = ({ 
  cartItems, 
  subtotal, 
  tax, 
  total, 
  user, 
  onClose, 
  onSuccess 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const calculateChange = () => {
    const cash = parseFloat(cashAmount) || 0;
    return Math.max(0, cash - total);
  };

  const handleProcessPayment = async () => {
    if (paymentMethod === 'cash') {
      const cash = parseFloat(cashAmount) || 0;
      if (cash < total) {
        alert('Jumlah uang tidak mencukupi!');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const saleData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        tax,
        total,
        paymentMethod,
        cashAmount: paymentMethod === 'cash' ? parseFloat(cashAmount) : total,
        change: paymentMethod === 'cash' ? calculateChange() : 0
      };

      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saleData)
      });

      if (response.ok) {
        const result = await response.json();
        setTransactionData({
          ...result,
          items: cartItems,
          paymentMethod,
          cashAmount: saleData.cashAmount,
          change: saleData.change,
          timestamp: new Date()
        });
        setShowReceipt(true);
      } else {
        const error = await response.json();
        alert(error.message || 'Transaksi gagal!');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Terjadi kesalahan saat memproses pembayaran!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleFinishTransaction = () => {
    setShowReceipt(false);
    onSuccess();
  };

  const paymentMethods = [
    { id: 'cash', label: 'Tunai', icon: Banknote },
    { id: 'card', label: 'Kartu', icon: CreditCard },
    { id: 'digital', label: 'Digital', icon: Smartphone },
  ];

  if (showReceipt && transactionData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
          <div className="p-6 print:p-4">
            {/* Receipt Header */}
            <div className="text-center mb-6 print:mb-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-2 print:hidden" />
              <h2 className="text-2xl font-bold text-gray-800 print:text-xl">STRUK PEMBELIAN</h2>
              <p className="text-sm text-gray-600">Sistem Kasir</p>
              <p className="text-sm text-gray-600">{formatDateTime(transactionData.timestamp)}</p>
            </div>

            {/* Transaction Info */}
            <div className="border-b border-gray-200 pb-4 mb-4 text-sm">
              <div className="flex justify-between">
                <span>No. Transaksi:</span>
                <span className="font-mono">{transactionData.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{user.name}</span>
              </div>
            </div>

            {/* Items */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Item Pembelian:</h3>
              {transactionData.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm mb-1">
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-gray-600">
                      {formatPrice(item.price)} × {item.quantity}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak (10%):</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
              
              {paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Dibayar:</span>
                    <span>{formatPrice(transactionData.cashAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kembalian:</span>
                    <span>{formatPrice(transactionData.change)}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between">
                <span>Metode Bayar:</span>
                <span className="capitalize">
                  {paymentMethods.find(p => p.id === paymentMethod)?.label}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 text-sm text-gray-600 print:mt-4">
              <p>Terima kasih atas pembelian Anda!</p>
              <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-6 print:hidden">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </button>
              <button
                onClick={handleFinishTransaction}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Checkout</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Ringkasan Pesanan</h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-40 overflow-auto">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak (10%):</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-1">
                <span>Total:</span>
                <span className="text-blue-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Metode Pembayaran</h3>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map(method => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center ${
                      paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Payment Input */}
          {paymentMethod === 'cash' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Uang Diterima
              </label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="Masukkan jumlah uang"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={total}
                step="1000"
              />
              {cashAmount && parseFloat(cashAmount) >= total && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-700">
                    Kembalian: <span className="font-semibold">{formatPrice(calculateChange())}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={handleProcessPayment}
            disabled={isProcessing || (paymentMethod === 'cash' && parseFloat(cashAmount) < total)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Memproses...
              </div>
            ) : (
              `Bayar ${formatPrice(total)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;