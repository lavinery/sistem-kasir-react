import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';

interface Settings {
  // Tax Settings
  tax: number;
  taxEnabled: boolean;
  
  // Member Discount Settings
  memberDiscountRate: number;
  memberDiscountEnabled: boolean;
  
  // Store Information
  storeName: string;
  storeAddress: string;
  storePhone: string;
  
  // Receipt Settings
  receiptFooter: string;
  printReceiptAuto: boolean;
  
  // Stock Settings
  minStock: number;
  autoStockAlert: boolean;
  
  // Other Settings
  currency: string;
  currencySymbol: string;
  allowDiscountEntry: boolean;
  allowNegativeStock: boolean;
  requireBarcodeForCheckout: boolean;
}

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await ApiService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof Settings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: value
    });
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await ApiService.updateSettings(settings);
      alert('Pengaturan berhasil disimpan!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Gagal menyimpan pengaturan: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center text-red-500">
        Error loading settings
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Umum' },
    { id: 'tax', label: 'Pajak & Diskon' },
    { id: 'store', label: 'Info Toko' },
    { id: 'receipt', label: 'Struk' },
    { id: 'stock', label: 'Stok' },
    { id: 'advanced', label: 'Lanjutan' }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Pengaturan Sistem</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola pengaturan sistem POS Anda</p>
        </div>
        
        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Pengaturan Umum</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mata Uang
                </label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Simbol Mata Uang
                </label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => handleChange('currencySymbol', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tax & Discount Tab */}
        {activeTab === 'tax' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Pengaturan Pajak & Diskon</h3>
            
            <div className="space-y-4">
              {/* Tax Settings */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Pengaturan Pajak (PPN)</h4>
                
                <div className="flex items-center mb-4">
                  <input
                    id="taxEnabled"
                    type="checkbox"
                    checked={settings.taxEnabled}
                    onChange={(e) => handleChange('taxEnabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="taxEnabled" className="ml-2 block text-sm text-gray-900">
                    Aktifkan Pajak (PPN)
                  </label>
                </div>
                
                {settings.taxEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Persentase Pajak (%)
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={(settings.tax * 100).toFixed(2)}
                        onChange={(e) => handleChange('tax', parseFloat(e.target.value) / 100)}
                        className="block w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                        %
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Contoh: 11 untuk PPN 11%
                    </p>
                  </div>
                )}
              </div>

              {/* Member Discount Settings */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Diskon Member</h4>
                
                <div className="flex items-center mb-4">
                  <input
                    id="memberDiscountEnabled"
                    type="checkbox"
                    checked={settings.memberDiscountEnabled}
                    onChange={(e) => handleChange('memberDiscountEnabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="memberDiscountEnabled" className="ml-2 block text-sm text-gray-900">
                    Aktifkan Diskon Member
                  </label>
                </div>
                
                {settings.memberDiscountEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Persentase Diskon Member Default (%)
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={(settings.memberDiscountRate * 100).toFixed(2)}
                        onChange={(e) => handleChange('memberDiscountRate', parseFloat(e.target.value) / 100)}
                        className="block w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                        %
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Diskon default untuk member baru
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Informasi Toko</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama Toko
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Alamat Toko
                </label>
                <textarea
                  rows={3}
                  value={settings.storeAddress}
                  onChange={(e) => handleChange('storeAddress', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={settings.storePhone}
                  onChange={(e) => handleChange('storePhone', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Receipt Tab */}
        {activeTab === 'receipt' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Pengaturan Struk</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="printReceiptAuto"
                  type="checkbox"
                  checked={settings.printReceiptAuto}
                  onChange={(e) => handleChange('printReceiptAuto', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="printReceiptAuto" className="ml-2 block text-sm text-gray-900">
                  Cetak struk otomatis setelah transaksi
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Footer Struk
                </label>
                <textarea
                  rows={3}
                  value={settings.receiptFooter}
                  onChange={(e) => handleChange('receiptFooter', e.target.value)}
                  placeholder="Terima kasih atas kunjungan Anda!"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Pesan yang akan muncul di bagian bawah struk
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stock Tab */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Pengaturan Stok</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Stok Default
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.minStock}
                  onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Stok minimum default untuk produk baru
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  id="autoStockAlert"
                  type="checkbox"
                  checked={settings.autoStockAlert}
                  onChange={(e) => handleChange('autoStockAlert', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoStockAlert" className="ml-2 block text-sm text-gray-900">
                  Aktifkan peringatan stok menipis
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Pengaturan Lanjutan</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="allowDiscountEntry"
                  type="checkbox"
                  checked={settings.allowDiscountEntry}
                  onChange={(e) => handleChange('allowDiscountEntry', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowDiscountEntry" className="ml-2 block text-sm text-gray-900">
                  Izinkan input diskon manual saat transaksi
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="allowNegativeStock"
                  type="checkbox"
                  checked={settings.allowNegativeStock}
                  onChange={(e) => handleChange('allowNegativeStock', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowNegativeStock" className="ml-2 block text-sm text-gray-900">
                  Izinkan stok minus (overselling)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="requireBarcodeForCheckout"
                  type="checkbox"
                  checked={settings.requireBarcodeForCheckout}
                  onChange={(e) => handleChange('requireBarcodeForCheckout', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requireBarcodeForCheckout" className="ml-2 block text-sm text-gray-900">
                  Wajibkan barcode untuk checkout
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t">
          <button
            onClick={saveSettings}
            disabled={saving}
            className={`px-6 py-2 rounded-md font-medium ${
              saving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;