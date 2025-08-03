// frontend/src/components/Settings.jsx - Enhanced with Favorites Management
import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, RotateCcw, Percent, DollarSign, Users, Package, 
  Star, Shield, Bell, Printer, Database, CheckCircle, AlertTriangle
} from 'lucide-react';
import { settingsAPI } from '../utils/api';
import FavoriteProductsManager from './FavoriteProductsManager';

const SettingsComponent = ({ currentUser }) => {
  const [settings, setSettings] = useState({
    // Tax Settings
    tax: 0.11, // 11% PPN
    taxEnabled: true,
    
    // Member Discount Settings
    memberDiscountRate: 0.05, // 5% member discount
    memberDiscountEnabled: true,
    
    // Stock Settings
    minStock: 10,
    autoStockAlert: true,
    
    // Favorite Products
    favoriteProductIds: [],
    maxFavorites: 6,
    
    // Store Information
    storeName: 'Toko Alat Tulis & Kantor',
    storeAddress: 'Jl. Pendidikan No. 123, Kudus',
    storePhone: '0291-123456',
    
    // Receipt Settings
    receiptFooter: 'Terima kasih atas kunjungan Anda!\nSelamat berbelanja kembali 😊',
    printReceiptAuto: true,
    
    // Other Settings
    currency: 'IDR',
    currencySymbol: 'Rp',
    dateFormat: 'dd/MM/yyyy',
    
    // User Permissions
    allowDiscountEntry: true,
    allowNegativeStock: false,
    requireBarcodeForCheckout: false
  });

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const apiSettings = await settingsAPI.getAll();
      if (apiSettings && Object.keys(apiSettings).length > 0) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...apiSettings
        }));
      } else {
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('posSettings');
        if (savedSettings) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...JSON.parse(savedSettings)
          }));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback to localStorage if API fails
      try {
        const savedSettings = localStorage.getItem('posSettings');
        if (savedSettings) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...JSON.parse(savedSettings)
          }));
        }
      } catch (localError) {
        console.error('Error loading local settings:', localError);
      }
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save to API
      await settingsAPI.update(settings);
      
      // Also save to localStorage as backup
      localStorage.setItem('posSettings', JSON.stringify(settings));
      
      setSavedMessage('✅ Pengaturan berhasil disimpan!');
      setTimeout(() => setSavedMessage(''), 3000);
      
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      
      // If API fails, at least save to localStorage
      try {
        localStorage.setItem('posSettings', JSON.stringify(settings));
        setSavedMessage('⚠️ Pengaturan disimpan secara lokal (API error)');
      } catch (localError) {
        setSavedMessage('❌ Gagal menyimpan pengaturan');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = async () => {
    if (confirm('🔄 Reset semua pengaturan ke default?\n\nTindakan ini tidak dapat dibatalkan.')) {
      setLoading(true);
      try {
        await settingsAPI.reset();
        await loadSettings(); // Reload settings after reset
        setSavedMessage('🔄 Pengaturan berhasil direset ke default');
      } catch (error) {
        console.error('Error resetting settings:', error);
        
        // Fallback to manual reset
        const defaultSettings = {
          tax: 0.11,
          taxEnabled: true,
          memberDiscountRate: 0.05,
          memberDiscountEnabled: true,
          minStock: 10,
          autoStockAlert: true,
          favoriteProductIds: [],
          maxFavorites: 6,
          storeName: 'Toko Alat Tulis & Kantor',
          storeAddress: 'Jl. Pendidikan No. 123, Kudus',
          storePhone: '0291-123456',
          receiptFooter: 'Terima kasih atas kunjungan Anda!\nSelamat berbelanja kembali 😊',
          printReceiptAuto: true,
          currency: 'IDR',
          currencySymbol: 'Rp',
          dateFormat: 'dd/MM/yyyy',
          allowDiscountEntry: true,
          allowNegativeStock: false,
          requireBarcodeForCheckout: false
        };
        
        setSettings(defaultSettings);
        setSavedMessage('🔄 Pengaturan direset ke default (mode offline)');
      } finally {
        setLoading(false);
      }
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFavoritesUpdate = (newFavoriteIds) => {
    setSettings(prev => ({
      ...prev,
      favoriteProductIds: newFavoriteIds
    }));
    setSavedMessage('✅ Produk favorit berhasil diupdate!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const tabs = [
    { id: 'general', label: 'Umum', icon: Settings },
    { id: 'tax', label: 'Pajak & Diskon', icon: Percent },
    { id: 'inventory', label: 'Inventori', icon: Package },
    { id: 'favorites', label: 'Produk Favorit', icon: Star },
    { id: 'receipt', label: 'Struk', icon: Printer },
    { id: 'permissions', label: 'Hak Akses', icon: Shield }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Informasi Toko
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Toko
                  </label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => updateSetting('storeName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    value={settings.storePhone}
                    onChange={(e) => updateSetting('storePhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Toko
                  </label>
                  <textarea
                    value={settings.storeAddress}
                    onChange={(e) => updateSetting('storeAddress', e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Format Mata Uang
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mata Uang
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="IDR">Indonesian Rupiah (IDR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Simbol
                  </label>
                  <input
                    type="text"
                    value={settings.currencySymbol}
                    onChange={(e) => updateSetting('currencySymbol', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format Tanggal
                  </label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => updateSetting('dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                    <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tax':
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Pengaturan Pajak (PPN)
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Aktifkan Pajak PPN
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.taxEnabled}
                    onChange={(e) => updateSetting('taxEnabled', e.target.checked)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </div>
                
                {settings.taxEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Persentase PPN (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={settings.tax * 100}
                        onChange={(e) => updateSetting('tax', parseFloat(e.target.value) / 100)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Diskon Member
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Aktifkan Diskon Member
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.memberDiscountEnabled}
                    onChange={(e) => updateSetting('memberDiscountEnabled', e.target.checked)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                </div>
                
                {settings.memberDiscountEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Persentase Diskon Member (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={settings.memberDiscountRate * 100}
                        onChange={(e) => updateSetting('memberDiscountRate', parseFloat(e.target.value) / 100)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Manajemen Stok
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Stok (Alert Stok Rendah)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.minStock}
                      onChange={(e) => updateSetting('minStock', parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <span className="text-gray-500">pcs</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Auto Alert Stok Rendah
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.autoStockAlert}
                    onChange={(e) => updateSetting('autoStockAlert', e.target.checked)}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Izinkan Stok Negatif
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.allowNegativeStock}
                    onChange={(e) => updateSetting('allowNegativeStock', e.target.checked)}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'favorites':
        return (
          <FavoriteProductsManager onUpdate={handleFavoritesUpdate} />
        );

      case 'receipt':
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <h3 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Pengaturan Struk
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Auto Print Struk setelah Checkout
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.printReceiptAuto}
                    onChange={(e) => updateSetting('printReceiptAuto', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Footer Struk
                  </label>
                  <textarea
                    value={settings.receiptFooter}
                    onChange={(e) => updateSetting('receiptFooter', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'permissions':
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Pengaturan Hak Akses
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Kasir dapat memberikan diskon manual</p>
                    <p className="text-xs text-gray-600">
                      Mengizinkan kasir input diskon di transaksi
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowDiscountEntry}
                    onChange={(e) => updateSetting('allowDiscountEntry', e.target.checked)}
                    className="w-4 h-4 text-red-600"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Izinkan stok negatif</p>
                    <p className="text-xs text-gray-600">
                      Memungkinkan penjualan meskipun stok habis
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowNegativeStock}
                    onChange={(e) => updateSetting('allowNegativeStock', e.target.checked)}
                    className="w-4 h-4 text-red-600"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              Pengaturan Sistem
            </h1>
            <p className="text-gray-600 mt-1">
              Konfigurasi sistem POS dan produk favorit
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={resetToDefaults}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            
            {activeTab !== 'favorites' && (
              <button
                onClick={saveSettings}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            )}
          </div>
        </div>
        
        {savedMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {savedMessage}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsComponent;