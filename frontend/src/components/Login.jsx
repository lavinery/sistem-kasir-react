// frontend/src/components/Login.jsx - Fixed version
import React, { useState } from 'react';
import { authAPI, testConnection } from '../utils/api';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: 'admin@kasir.com',
    password: 'admin123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Test connection on component mount
  React.useEffect(() => {
    checkConnection();
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
      console.log('Attempting login with:', credentials);
      
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Sistem Kasir POS</h1>
          <p className="text-gray-600 mt-2">Silakan login untuk mengakses sistem</p>
        </div>

        {/* Connection Status */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Debug Info:</div>
          <div className="text-xs space-y-1">
            <div>Backend: http://localhost:5000</div>
            <div className="flex items-center gap-2">
              Status: 
              {connectionStatus === 'checking' && (
                <span className="text-yellow-600">🔄 Checking...</span>
              )}
              {connectionStatus === 'connected' && (
                <span className="text-green-600">✅ Connected</span>
              )}
              {connectionStatus === 'error' && (
                <span className="text-red-600">❌ Backend Error</span>
              )}
            </div>
            <button 
              onClick={checkConnection}
              className="text-blue-600 hover:text-blue-800 text-xs underline"
            >
              Test Connection
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              Quick login gagal: {error}
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || connectionStatus !== 'connected'}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Quick Login */}
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600 mb-4">Quick Login untuk Demo</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              className="flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <span>👑</span> Admin
            </button>
            <button
              onClick={() => handleQuickLogin('kasir')}
              disabled={loading}
              className="flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <span>👤</span> Kasir
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Demo Credentials:</p>
            <p>Admin: admin@kasir.com / admin123</p>
            <p>Kasir: kasir@kasir.com / kasir123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;