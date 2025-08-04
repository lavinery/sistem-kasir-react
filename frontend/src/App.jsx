// frontend/src/App.jsx - Ultra-Modern Design with Glassmorphism
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Home, ShoppingCart, Package, Users, FileText, Settings, 
  LogOut, Menu, X, User, Shield, Bell, Sparkles, Zap, 
  TrendingUp, Star, Award
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Check for existing auth
    const savedUser = authAPI.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-400/30 rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400 animate-pulse" />
          </div>
          <p className="text-white text-lg font-medium mt-6">Memuat aplikasi...</p>
          <p className="text-blue-300 text-sm mt-2">Menyiapkan sistem POS</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Sidebar with Glassmorphism */}
        <div className={`fixed inset-y-0 left-0 z-50 w-80 backdrop-blur-xl bg-white/10 border-r border-white/20 shadow-2xl transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-all duration-500 ease-out lg:translate-x-0 lg:static lg:inset-0`}>
          
          {/* Sidebar Header */}
          <div className="relative h-20 px-6 border-b border-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <ShoppingCart className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">POS System</h1>
                  <p className="text-xs text-blue-200">Professional Edition</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-6">
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    user.role === 'admin' 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  } shadow-lg`}>
                    {user.role === 'admin' ? (
                      <Shield className="w-7 h-7 text-white" />
                    ) : (
                      <User className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    <Award className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{user.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-300">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-6 pb-6">
            <div className="space-y-2">
              <NavLink 
                to="/dashboard" 
                icon={Home} 
                label="Dashboard" 
                gradient="from-blue-500 to-indigo-600"
                onClick={() => setSidebarOpen(false)} 
              />
              
              <NavLink 
                to="/transaction" 
                icon={ShoppingCart} 
                label="Transaksi" 
                gradient="from-green-500 to-emerald-600"
                badge="HOT"
                onClick={() => setSidebarOpen(false)} 
              />
              
              {user.role === 'admin' && (
                <>
                  <NavLink 
                    to="/products" 
                    icon={Package} 
                    label="Kelola Produk" 
                    gradient="from-purple-500 to-violet-600"
                    onClick={() => setSidebarOpen(false)} 
                  />
                  <NavLink 
                    to="/users" 
                    icon={Users} 
                    label="Kelola User" 
                    gradient="from-pink-500 to-rose-600"
                    onClick={() => setSidebarOpen(false)} 
                  />
                </>
              )}
              
              <NavLink 
                to="/reports" 
                icon={FileText} 
                label="Laporan" 
                gradient="from-orange-500 to-amber-600"
                onClick={() => setSidebarOpen(false)} 
              />
              
              {user.role === 'admin' && (
                <NavLink 
                  to="/settings" 
                  icon={Settings} 
                  label="Pengaturan" 
                  gradient="from-slate-500 to-gray-600"
                  onClick={() => setSidebarOpen(false)} 
                />
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl border border-white/20">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Quick Stats
              </h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-2xl font-bold text-white">247</p>
                  <p className="text-xs text-gray-300">Transaksi</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-2xl font-bold text-green-400">89%</p>
                  <p className="text-xs text-gray-300">Uptime</p>
                </div>
              </div>
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-6 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:ml-0 relative">
          {/* Modern Top Bar */}
          <header className="h-20 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {getPageTitle(window.location.pathname)}
                  </h2>
                  <p className="text-sm text-gray-300">
                    {currentTime.toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} • {currentTime.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notification Button */}
                <div className="relative">
                  <button className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                    <Bell className="w-5 h-5" />
                  </button>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                </div>

                {/* User Avatar */}
                <div className="flex items-center space-x-3 bg-white/10 rounded-2xl p-2 pr-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    user.role === 'admin' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-300 capitalize">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content with Glassmorphism Container */}
          <main className="flex-1 overflow-auto p-6">
            <div className="min-h-full backdrop-blur-sm bg-white/5 rounded-3xl border border-white/20 shadow-2xl">
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
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </Router>
  );
};

// Enhanced Navigation Link Component
const NavLink = ({ to, icon: Icon, label, gradient, badge, onClick }) => {
  const [isActive, setIsActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsActive(window.location.pathname === to);
    
    const handlePopState = () => {
      setIsActive(window.location.pathname === to);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [to]);

  const handleClick = () => {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
    if (onClick) onClick();
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full flex items-center px-4 py-3 text-left rounded-2xl transition-all duration-300 group ${
        isActive
          ? `bg-gradient-to-r ${gradient} text-white shadow-lg transform scale-105`
          : 'text-gray-300 hover:text-white hover:bg-white/10'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 ${
        isActive 
          ? 'bg-white/20' 
          : 'bg-white/10 group-hover:bg-white/20'
      }`}>
        <Icon className={`w-5 h-5 transition-all duration-300 ${
          isActive ? 'scale-110' : 'group-hover:scale-110'
        }`} />
      </div>
      
      <span className={`font-medium transition-all duration-300 ${
        isActive ? 'text-white' : 'group-hover:text-white'
      }`}>
        {label}
      </span>
      
      {badge && (
        <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
          {badge}
        </span>
      )}
      
      {isActive && (
        <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
      )}
      
      {(isHovered || isActive) && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
      )}
    </button>
  );
};

// Helper function for page titles
const getPageTitle = (pathname) => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/transaction': 'Point of Sale',
    '/products': 'Kelola Produk',
    '/users': 'Kelola User',
    '/reports': 'Laporan Penjualan',
    '/settings': 'Pengaturan Sistem'
  };
  return titles[pathname] || 'POS System';
};

export default App;