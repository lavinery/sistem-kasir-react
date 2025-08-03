
// ============================================
// frontend/src/App.jsx - Updated with Settings menu
// ============================================

import React, { useState, useEffect } from 'react';
import { testConnection } from './utils/api';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, 
  Settings, LogOut, Menu, X, Store, User, Shield, UserCheck, Star
} from 'lucide-react';

// Import components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import SalesReport from './components/SalesReport';
import UserManagement from './components/UserManagement';
import SettingsComponent from './components/Settings';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check authentication and connection on app start
  useEffect(() => {
    checkAuthAndConnection();
  }, []);

  const checkAuthAndConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        setCurrentUser(JSON.parse(userData));
      }

      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setCurrentPage('dashboard');
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Loading POS System</h3>
          <p className="text-gray-600">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  // Connection error screen
  if (connectionStatus === 'disconnected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2 text-red-600">Connection Failed</h3>
          <p className="text-gray-600 mb-6">Cannot connect to backend server</p>
          <button
            onClick={checkAuthAndConnection}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🔄 Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // If not logged in, show login
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Menu items based on user role
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'kasir', 'gudang']
    },
    {
      id: 'pos',
      label: 'POS Kasir',
      icon: ShoppingCart,
      roles: ['admin', 'kasir']
    },
    {
      id: 'products',
      label: 'Kelola Produk',
      icon: Package,
      roles: ['admin', 'gudang']
    },
    {
      id: 'sales',
      label: 'Laporan Penjualan',
      icon: BarChart3,
      roles: ['admin']
    },
    {
      id: 'users',
      label: 'Kelola User',
      icon: Users,
      roles: ['admin']
    },
    {
      id: 'members',
      label: 'Member',
      icon: UserCheck,
      roles: ['admin', 'kasir']
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      icon: Settings,
      roles: ['admin']
    }
  ];

  const availableMenuItems = menuItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      } flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-800">Sistem Kasir POS</h1>
                  <p className="text-xs text-gray-500">Toko Alat Tulis & Kantor</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentUser.role === 'admin' ? 'bg-purple-100' : 
              currentUser.role === 'kasir' ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              {currentUser.role === 'admin' ? (
                <Shield className="w-5 h-5 text-purple-600" />
              ) : currentUser.role === 'kasir' ? (
                <User className="w-5 h-5 text-blue-600" />
              ) : (
                <Package className="w-5 h-5 text-green-600" />
              )}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{currentUser.name}</p>
                <p className={`text-xs px-2 py-1 rounded-full inline-block ${
                  currentUser.role === 'admin' 
                    ? 'bg-purple-100 text-purple-700' 
                    : currentUser.role === 'kasir'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {currentUser.role === 'admin' ? '👑 Administrator' : 
                   currentUser.role === 'kasir' ? '👤 Kasir' : '📦 Gudang'}
                </p>
              </div>
            )}
          </div>
          
          {sidebarOpen && (
            <div className="mt-3 flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-xs font-medium ${
                connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'
              }`}>
                {connectionStatus === 'connected' ? 'Online' : 'Offline'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {availableMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {sidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {availableMenuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
              </h2>
              <p className="text-gray-600 text-sm">
                Welcome back, {currentUser.name}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Total Produk</p>
                        <p className="text-2xl font-bold">150</p>
                      </div>
                      <Package className="w-8 h-8 text-blue-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Penjualan Hari Ini</p>
                        <p className="text-2xl font-bold">Rp 2.5M</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-green-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Transaksi</p>
                        <p className="text-2xl font-bold">45</p>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-purple-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Member Aktif</p>
                        <p className="text-2xl font-bold">28</p>
                      </div>
                      <UserCheck className="w-8 h-8 text-orange-200" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-8">
                  <p className="text-gray-500">Selamat datang di Sistem Kasir POS</p>
                  <p className="text-gray-400 text-sm mt-2">Pilih menu di sidebar untuk memulai</p>
                </div>
              </div>
            )}
            
            {currentPage === 'pos' && (
              <Dashboard currentUser={currentUser} />
            )}
            
            {currentPage === 'products' && (currentUser.role === 'admin' || currentUser.role === 'gudang') && (
              <ProductManagement />
            )}
            
            {currentPage === 'sales' && currentUser.role === 'admin' && (
              <SalesReport />
            )}
            
            {currentPage === 'users' && currentUser.role === 'admin' && (
              <UserManagement />
            )}

            {currentPage === 'members' && (currentUser.role === 'admin' || currentUser.role === 'kasir') && (
              <MemberManagement />
            )}
            
            {currentPage === 'settings' && currentUser.role === 'admin' && (
              <SettingsComponent currentUser={currentUser} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Simple Member Management Component (you can expand this)
const MemberManagement = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <UserCheck className="w-6 h-6 text-blue-600" />
        Kelola Member
      </h2>
      <p className="text-gray-600">Fitur manajemen member akan segera tersedia.</p>
    </div>
  );
};

export default App;