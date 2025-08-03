// frontend/src/App.jsx - Main Application Component
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Home, ShoppingCart, Package, Users, FileText, Settings, 
  LogOut, Menu, X, User, Shield, Bell
} from 'lucide-react';

// Import components
import Login from './components/Login';
import POSTransaction from './components/POSTransaction';
import ProductManagement from './components/ProductManagement';
import UserManagement from './components/UserManagement';
import SalesReport from './components/SalesReport';
import SettingsComponent from './components/Settings';
import Dashboard from './components/Dashboard';
import { authAPI } from './utils/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check for existing auth
    const savedUser = authAPI.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0`}>
          
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-800">POS System</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                user.role === 'admin' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {user.role === 'admin' ? (
                  <Shield className="w-5 h-5 text-green-600" />
                ) : (
                  <User className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            <NavLink to="/dashboard" icon={Home} label="Dashboard" onClick={() => setSidebarOpen(false)} />
            
            <NavLink to="/transaction" icon={ShoppingCart} label="Transaksi" onClick={() => setSidebarOpen(false)} />
            
            {user.role === 'admin' && (
              <>
                <NavLink to="/products" icon={Package} label="Kelola Produk" onClick={() => setSidebarOpen(false)} />
                <NavLink to="/users" icon={Users} label="Kelola User" onClick={() => setSidebarOpen(false)} />
              </>
            )}
            
            <NavLink to="/reports" icon={FileText} label="Laporan" onClick={() => setSidebarOpen(false)} />
            
            {user.role === 'admin' && (
              <NavLink to="/settings" icon={Settings} label="Pengaturan" onClick={() => setSidebarOpen(false)} />
            )}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Top Bar */}
          <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-400" />
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="/dashboard" 
                element={<Dashboard currentUser={user} />} 
              />
              <Route 
                path="/transaction" 
                element={<POSTransaction currentUser={user} />} 
              />
              
              {user.role === 'admin' && (
                <>
                  <Route 
                    path="/products" 
                    element={
                      <div className="p-6">
                        <ProductManagement />
                      </div>
                    } 
                  />
                  <Route 
                    path="/users" 
                    element={
                      <div className="p-6">
                        <UserManagement />
                      </div>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <div className="p-6">
                        <SettingsComponent currentUser={user} />
                      </div>
                    } 
                  />
                </>
              )}
              
              <Route 
                path="/reports" 
                element={
                  <div className="p-6">
                    <SalesReport />
                  </div>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

// Navigation Link Component
const NavLink = ({ to, icon: Icon, label, onClick }) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(window.location.pathname === to);
  }, [to]);

  const handleClick = () => {
    // Simple navigation without react-router-dom dependency issues
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
    if (onClick) onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-600 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </button>
  );
};

export default App;