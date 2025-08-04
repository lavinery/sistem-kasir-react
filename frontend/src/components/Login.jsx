// frontend/src/components/Login.jsx - Ultra-Modern Animated Login
import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, Sparkles, Zap, Shield, 
  User, Crown, CheckCircle, AlertTriangle, Loader,
  ShoppingCart, TrendingUp, Star
} from 'lucide-react';
import { authAPI, testConnection } from '../utils/api';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: 'admin@kasir.com',
    password: 'admin123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    checkConnection();
    
    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Animation sequence
    const animationTimer = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4);
    }, 3000);
    
    return () => {
      clearInterval(timer);
      clearInterval(animationTimer);
    };
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
    } catch (error) {
      setConnectionStatus('error');
      console.error('Connection test failed:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(credentials);
      if (response.user) {
        onLogin(response.user);
      } else {
        setError('Login response invalid');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    const quickCredentials = {
      admin: { email: 'admin@kasir.com', password: 'admin123' },
      kasir: { email: 'kasir@kasir.com', password: 'kasir123' }
    };

    setCredentials(quickCredentials[role]);
    
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.login(quickCredentials[role]);
      onLogin(response.user);
    } catch (error) {
      console.error('Quick login error:', error);
      setError(error.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: ShoppingCart, text: "Point of Sale Modern", color: "text-blue-400" },
    { icon: TrendingUp, text: "Real-time Analytics", color: "text-green-400" },
    { icon: Shield, text: "Enterprise Security", color: "text-purple-400" },
    { icon: Star, text: "Premium Experience", color: "text-yellow-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-40 w-80 h-80 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-pink-400 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                <Sparkles className="absolute -bottom-1 -left-1 w-6 h-6 text-yellow-400 animate-bounce" />
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
              POS System
              <span className="block text-3xl lg:text-4xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Professional Edition
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Solusi Point of Sale terdepan dengan teknologi modern untuk bisnis retail Anda
            </p>
          </div>

          {/* Animated Features */}
          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = animationStep === index;
              
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-4 p-4 rounded-2xl backdrop-blur-sm border transition-all duration-500 ${
                    isActive 
                      ? 'bg-white/20 border-white/30 scale-105 shadow-xl' 
                      : 'bg-white/10 border-white/20 hover:bg-white/15'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive ? 'bg-white/30 scale-110' : 'bg-white/20'
                  }`}>
                    <Icon className={`w-6 h-6 ${feature.color} ${isActive ? 'animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold transition-all duration-300 ${
                      isActive ? 'text-white text-lg' : 'text-gray-200'
                    }`}>
                      {feature.text}
                    </h3>
                    <p className={`text-sm transition-all duration-300 ${
                      isActive ? 'text-gray-300' : 'text-gray-400'
                    }`}>
                      {isActive ? '✨ Fitur unggulan sistem kami' : 'Teknologi terdepan'}
                    </p>
                  </div>
                  {isActive && (
                    <Zap className="w-5 h-5 text-yellow-400 animate-bounce ml-auto" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-2xl font-bold text-green-400">99.9%</div>
              <div className="text-sm text-gray-300">Uptime</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-2xl font-bold text-blue-400">500+</div>
              <div className="text-sm text-gray-300">Toko</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-2xl font-bold text-purple-400">24/7</div>
              <div className="text-sm text-gray-300">Support</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
            {/* Form Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-300">Masuk ke sistem POS Anda</p>
              
              {/* Live Time */}
              <div className="mt-4 p-3 bg-white/10 rounded-xl border border-white/20">
                <div className="text-sm text-gray-300">
                  {currentTime.toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-lg font-bold text-white">
                  {currentTime.toLocaleTimeString('id-ID')}
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="mb-6 p-4 bg-white/10 rounded-xl border border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Status Server:</span>
                <div className="flex items-center gap-2">
                  {connectionStatus === 'checking' && (
                    <>
                      <Loader className="w-4 h-4 text-yellow-400 animate-spin" />
                      <span className="text-yellow-400 text-sm">Checking...</span>
                    </>
                  )}
                  {connectionStatus === 'connected' && (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm">Connected</span>
                    </>
                  )}
                  {connectionStatus === 'error' && (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm">Error</span>
                    </>
                  )}
                </div>
              </div>
              <button 
                onClick={checkConnection}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Test Connection
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <p className="text-red-300 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all"
                      placeholder="masukkan@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || connectionStatus !== 'connected'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    Sign In
                  </div>
                )}
              </button>
            </form>

            {/* Quick Login */}
            <div className="mt-8">
              <div className="text-center text-sm text-gray-400 mb-4">
                <span>Quick Demo Login</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleQuickLogin('admin')}
                  disabled={loading}
                  className="group p-4 bg-gradient-to-r from-emerald-500/20 to-green-600/20 border border-emerald-500/30 rounded-xl hover:from-emerald-500/30 hover:to-green-600/30 disabled:opacity-50 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-300">Admin</p>
                      <p className="text-xs text-emerald-400">Full Access</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickLogin('kasir')}
                  disabled={loading}
                  className="group p-4 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 border border-blue-500/30 rounded-xl hover:from-blue-500/30 hover:to-indigo-600/30 disabled:opacity-50 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-300">Kasir</p>
                      <p className="text-xs text-blue-400">POS Access</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-gray-400 text-center mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>👑 Admin: admin@kasir.com / admin123</p>
                  <p>👤 Kasir: kasir@kasir.com / kasir123</p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-full blur-xl"></div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              © 2024 POS System Professional Edition
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Powered by Modern Web Technology
            </p>
          </div>
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
    </div>
  );
};

export default Login;