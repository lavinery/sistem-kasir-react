// frontend/src/components/CheckoutModal.jsx - Futuristic Payment Interface
import React, { useState, useEffect } from 'react';
import { 
  X, CreditCard, Banknote, Smartphone, Calculator, 
  Receipt, CheckCircle, AlertTriangle, Loader, 
  Users, Gift, Percent, DollarSign, Zap, 
  Sparkles, Target, Clock, Wifi, Shield,
  TrendingUp, Star, Award
} from 'lucide-react';
import { salesAPI, membersAPI } from '../utils/api';

const CheckoutModal = ({ 
  cartItems, 
  subtotal, 
  memberDiscount = 0,
  additionalDiscount = 0,
  tax, 
  total, 
  user, 
  memberId = '',
  settings = {},
  onClose, 
  onSuccess 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState(total);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [memberData, setMemberData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [saleData, setSaleData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    setCashAmount(Math.ceil(total / 1000) * 1000);
    if (memberId) {
      validateMember();
    }
    
    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [total, memberId]);

  const validateMember = async () => {
    try {
      const member = await membersAPI.validate(memberId);
      setMemberData(member);
    } catch (error) {
      console.error('Member validation error:', error);
      setError('ID Member tidak valid');
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

  const calculateChange = () => {
    if (paymentMethod === 'cash' && cashAmount > total) {
      return cashAmount - total;
    }
    return 0;
  };

  const generateSaleNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = date.getTime().toString().slice(-4);
    return `TRX-${dateStr}-${timeStr}`;
  };

  const processingSteps = [
    { text: "Validating transaction...", icon: Shield },
    { text: "Processing payment...", icon: CreditCard },
    { text: "Updating inventory...", icon: TrendingUp },
    { text: "Generating receipt...", icon: Receipt },
    { text: "Transaction complete!", icon: CheckCircle }
  ];

  const handleProcessPayment = async () => {
    setProcessing(true);
    setError('');
    setProcessingStep(0);

    try {
      // Validation
      if (paymentMethod === 'cash' && cashAmount < total) {
        throw new Error('Jumlah pembayaran kurang dari total');
      }

      if (cartItems.length === 0) {
        throw new Error('Keranjang kosong');
      }

      // Simulate processing steps
      for (let i = 0; i < processingSteps.length - 1; i++) {
        setProcessingStep(i);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Prepare sale data
      const saleData = {
        saleNumber: generateSaleNumber(),
        subtotal: subtotal,
        memberDiscount: memberDiscount,
        transactionDiscount: additionalDiscount,
        totalDiscount: memberDiscount + additionalDiscount,
        tax: tax,
        total: total,
        cashAmount: paymentMethod === 'cash' ? cashAmount : total,
        change: paymentMethod === 'cash' ? calculateChange() : 0,
        paymentMethod: paymentMethod,
        memberId: memberData?.id || null,
        userId: user.id,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        }))
      };

      // Process sale
      const response = await salesAPI.create(saleData);
      
      // Update member purchase if applicable
      if (memberData) {
        try {
          await membersAPI.updatePurchase(memberData.id, total);
        } catch (memberError) {
          console.error('Error updating member purchase:', memberError);
        }
      }

      setProcessingStep(4);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSaleData(response);
      setShowReceipt(true);

    } catch (error) {
      console.error('Payment processing error:', error);
      setError(error.message || 'Gagal memproses pembayaran');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleFinishTransaction = () => {
    onSuccess();
    onClose();
  };

  const paymentMethods = [
    { 
      id: 'cash', 
      label: 'Cash Payment', 
      icon: Banknote, 
      gradient: 'from-green-500 to-emerald-600',
      description: 'Physical cash payment'
    },
    { 
      id: 'card', 
      label: 'Card Payment', 
      icon: CreditCard, 
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Credit/Debit card'
    },
    { 
      id: 'digital', 
      label: 'Digital Wallet', 
      icon: Smartphone, 
      gradient: 'from-purple-500 to-pink-600',
      description: 'QR Code & e-wallet'
    }
  ];

  const quickCashAmounts = [
    Math.ceil(total / 1000) * 1000,
    Math.ceil(total / 5000) * 5000,
    Math.ceil(total / 10000) * 10000,
    Math.ceil(total / 20000) * 20000
  ].filter((amount, index, array) => array.indexOf(amount) === index);

  // Receipt View
  if (showReceipt && saleData) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-green-500/30">
          {/* Success Header */}
          <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-cyan-400/20"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-300 animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Payment Success!</h2>
                    <p className="text-green-100">Transaction completed successfully</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Receipt Content */}
          <div className="p-6 space-y-6" id="receipt-content">
            {/* Store Header */}
            <div className="text-center border-b border-slate-700 pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{settings.storeName || 'POS Store'}</h3>
              <p className="text-sm text-gray-400">{settings.storeAddress || 'Store Address'}</p>
              <p className="text-sm text-gray-400">{settings.storePhone || 'Store Phone'}</p>
            </div>

            {/* Transaction Details */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                Transaction Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction ID:</span>
                  <span className="font-mono text-cyan-400">{saleData.saleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date & Time:</span>
                  <span className="text-white">{currentTime.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cashier:</span>
                  <span className="text-white">{user.name}</span>
                </div>
                {memberData && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member:</span>
                    <span className="text-purple-300">{memberData.name} ({memberData.memberId})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <h4 className="font-bold text-white mb-3">Items Purchased:</h4>
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-gray-400">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-green-400">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-400" />
                Payment Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                {memberDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-purple-400">Member Discount:</span>
                    <span className="text-purple-400">-{formatPrice(memberDiscount)}</span>
                  </div>
                )}
                {additionalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-orange-400">Additional Discount:</span>
                    <span className="text-orange-400">-{formatPrice(additionalDiscount)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax ({((settings.tax || 0.11) * 100).toFixed(1)}%):</span>
                    <span className="text-white">{formatPrice(tax)}</span>
                  </div>
                )}
                <div className="border-t border-slate-600 pt-2 flex justify-between font-bold text-lg">
                  <span className="text-white">TOTAL:</span>
                  <span className="text-green-400">{formatPrice(total)}</span>
                </div>
                {paymentMethod === 'cash' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment:</span>
                      <span className="text-white">{formatPrice(cashAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Change:</span>
                      <span className="text-green-400">{formatPrice(calculateChange())}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer Message */}
            <div className="text-center text-sm text-gray-400 border-t border-slate-700 pt-4">
              <p>{settings.receiptFooter || 'Thank you for your purchase!'}</p>
              <p className="mt-2">Powered by POS System v2.0</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-slate-900/50 border-t border-slate-700 flex gap-3">
            <button
              onClick={handlePrintReceipt}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg"
            >
              <Receipt className="w-5 h-5" />
              Print Receipt
            </button>
            <button
              onClick={handleFinishTransaction}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg"
            >
              <CheckCircle className="w-5 h-5" />
              Complete
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Checkout Modal
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-cyan-500/30">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%)
              `,
              backgroundSize: '20px 20px',
              animation: 'slide 2s linear infinite'
            }}></div>
          </div>
          
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">SECURE CHECKOUT</h2>
                  <div className="flex items-center space-x-2 text-cyan-200 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>256-bit SSL Encrypted</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Processing Animation */}
          {processing && (
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-6 text-center backdrop-blur-sm">
              <div className="relative mb-4">
                <div className="w-16 h-16 border-4 border-blue-400/30 rounded-full animate-spin mx-auto"></div>
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
                <Zap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-400 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                {processingSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-center gap-2 text-sm transition-all duration-300 ${
                        index <= processingStep ? 'text-green-400 scale-105' : 
                        index === processingStep + 1 ? 'text-blue-400' : 'text-gray-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{step.text}</span>
                      {index <= processingStep && <CheckCircle className="w-4 h-4 text-green-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!processing && (
            <>
              {/* Member Info */}
              {memberData && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-purple-300 flex items-center gap-2">
                        VIP MEMBER DETECTED
                        <Award className="w-4 h-4 text-yellow-400" />
                      </h3>
                      <div className="text-sm text-purple-200 mt-1">
                        <p>{memberData.name} • ID: {memberData.memberId}</p>
                        <p>Lifetime Purchase: {formatPrice(memberData.totalPurchase || 0)}</p>
                      </div>
                    </div>
                    <Gift className="w-6 h-6 text-pink-400 animate-bounce" />
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-cyan-400" />
                  Order Summary ({cartItems.length} items)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  {memberDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-purple-400 flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        Member Discount:
                      </span>
                      <span className="text-purple-400">-{formatPrice(memberDiscount)}</span>
                    </div>
                  )}
                  {additionalDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-orange-400 flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        Additional Discount:
                      </span>
                      <span className="text-orange-400">-{formatPrice(additionalDiscount)}</span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tax ({((settings.tax || 0.11) * 100).toFixed(1)}%):</span>
                      <span className="text-white">{formatPrice(tax)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-600 pt-2 flex justify-between font-bold text-xl">
                    <span className="text-white">TOTAL:</span>
                    <span className="text-green-400">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Select Payment Method:
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {paymentMethods.map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-2xl border-2 transition-all backdrop-blur-sm group ${
                          paymentMethod === method.id
                            ? `border-cyan-400 bg-gradient-to-r ${method.gradient}/20`
                            : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            paymentMethod === method.id 
                              ? `bg-gradient-to-r ${method.gradient}` 
                              : 'bg-slate-700'
                          }`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className={`font-bold ${
                              paymentMethod === method.id ? 'text-white' : 'text-gray-300'
                            }`}>
                              {method.label}
                            </h4>
                            <p className="text-sm text-gray-400">{method.description}</p>
                          </div>
                          {paymentMethod === method.id && (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Amount Input */}
              {paymentMethod === 'cash' && (
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Cash Payment Amount:
                  </h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="number"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-700 border border-slate-600 text-white text-2xl font-bold py-4 px-4 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-400/50 transition-all"
                        placeholder="Enter amount..."
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        IDR
                      </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      {quickCashAmounts.map(amount => (
                        <button
                          key={amount}
                          onClick={() => setCashAmount(amount)}
                          className="py-3 px-4 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-xl text-sm font-medium transition-all border border-slate-600 hover:border-slate-500"
                        >
                          {formatPrice(amount)}
                        </button>
                      ))}
                    </div>

                    {/* Change Display */}
                    {cashAmount >= total && (
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <span className="text-green-300 font-medium">Change Amount:</span>
                          </div>
                          <span className="text-2xl font-bold text-green-400">
                            {formatPrice(calculateChange())}
                          </span>
                        </div>
                      </div>
                    )}

                    {cashAmount < total && cashAmount > 0 && (
                      <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <span className="text-red-300 font-medium">Insufficient Amount:</span>
                          </div>
                          <span className="text-xl font-bold text-red-400">
                            -{formatPrice(total - cashAmount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <div>
                      <h3 className="font-bold text-red-300">Payment Error</h3>
                      <p className="text-red-200 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Process Payment Button */}
              <button
                onClick={handleProcessPayment}
                disabled={processing || (paymentMethod === 'cash' && cashAmount < total)}
                className="w-full relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Button Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 rounded-2xl opacity-100 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                
                {/* Button Content */}
                <div className="relative py-5 px-6 flex items-center justify-center space-x-3 text-white font-bold text-xl">
                  {processing ? (
                    <>
                      <Loader className="animate-spin w-6 h-6" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span>PROCESS PAYMENT</span>
                      <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
                        <span className="text-lg">{formatPrice(total)}</span>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                    </>
                  )}
                </div>
                
                {/* Animated border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                <div className="absolute inset-0.5 rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600"></div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 group-hover:scale-105 transition-transform duration-300"></div>
              </button>

              {/* Security Info */}
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Secure</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <Wifi className="w-3 h-3" />
                  <span>Encrypted</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Real-time</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(20px); }
        }
      `}</style>
    </div>
  );
};

export default CheckoutModal;