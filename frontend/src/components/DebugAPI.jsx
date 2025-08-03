// frontend/src/components/DebugAPI.jsx - For Vite + Axios
import React, { useState, useEffect } from 'react';
import { testConnection, productsAPI, categoriesAPI } from '../utils/api';
import axios from 'axios';

const DebugAPI = () => {
  const [debugData, setDebugData] = useState({
    backendStatus: 'checking',
    categoriesStatus: 'checking',
    productsStatus: 'checking',
    categoriesData: [],
    productsData: [],
    errors: [],
    networkInfo: {
      frontendUrl: window.location.origin,
      backendUrl: 'http://localhost:5000',
      userAgent: navigator.userAgent.substring(0, 80) + '...',
      timestamp: new Date().toLocaleString()
    }
  });

  useEffect(() => {
    runDebugTests();
  }, []);

  const runDebugTests = async () => {
    const errors = [];
    let backendStatus = 'disconnected';
    let categoriesStatus = 'failed';
    let productsStatus = 'failed';
    let categoriesData = [];
    let productsData = [];

    console.log('🔍 Starting comprehensive API debug tests...');

    // Test 1: Backend Health Check
    try {
      console.log('1️⃣ Testing backend health...');
      const healthResponse = await axios.get('http://localhost:5000/health', { timeout: 5000 });
      
      if (healthResponse.status === 200) {
        backendStatus = 'connected';
        console.log('✅ Backend health check passed:', healthResponse.data);
      } else {
        errors.push(`Backend health check failed: HTTP ${healthResponse.status}`);
      }
    } catch (error) {
      errors.push(`Backend connection error: ${error.message}`);
      console.error('❌ Backend health check failed:', error);
    }

    // Test 2: Database Test Endpoint
    try {
      console.log('2️⃣ Testing database endpoint...');
      const dbResponse = await axios.get('http://localhost:5000/api/test', { timeout: 5000 });
      
      if (dbResponse.status === 200) {
        console.log('✅ Database test passed:', dbResponse.data);
      } else {
        errors.push(`Database test failed: HTTP ${dbResponse.status}`);
      }
    } catch (error) {
      errors.push(`Database test error: ${error.message}`);
      console.error('❌ Database test failed:', error);
    }

    // Test 3: Categories API using utility function
    try {
      console.log('3️⃣ Testing categories API with utility...');
      categoriesData = await categoriesAPI.getAll();
      categoriesStatus = 'success';
      console.log('✅ Categories loaded via utility:', categoriesData.length);
    } catch (error) {
      errors.push(`Categories API (utility) error: ${error.message}`);
      console.error('❌ Categories API utility failed:', error);
      
      // Fallback: Direct fetch test
      try {
        console.log('3️⃣b Fallback: Direct categories fetch...');
        const directResponse = await axios.get('http://localhost:5000/api/categories');
        categoriesData = directResponse.data;
        categoriesStatus = 'success-direct';
        console.log('✅ Categories loaded via direct fetch:', categoriesData.length);
      } catch (directError) {
        errors.push(`Categories direct fetch error: ${directError.message}`);
      }
    }

    // Test 4: Products API using utility function
    try {
      console.log('4️⃣ Testing products API with utility...');
      productsData = await productsAPI.getAll();
      productsStatus = 'success';
      console.log('✅ Products loaded via utility:', productsData.length);
    } catch (error) {
      errors.push(`Products API (utility) error: ${error.message}`);
      console.error('❌ Products API utility failed:', error);
      
      // Fallback: Direct fetch test
      try {
        console.log('4️⃣b Fallback: Direct products fetch...');
        const directResponse = await axios.get('http://localhost:5000/api/products');
        productsData = directResponse.data;
        productsStatus = 'success-direct';
        console.log('✅ Products loaded via direct fetch:', productsData.length);
      } catch (directError) {
        errors.push(`Products direct fetch error: ${directError.message}`);
      }
    }

    // Test 5: CORS and Network
    try {
      console.log('5️⃣ Testing CORS and network...');
      const corsTest = await fetch('http://localhost:5000/health', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (corsTest.ok) {
        console.log('✅ CORS test passed');
      } else {
        errors.push(`CORS test failed: ${corsTest.status}`);
      }
    } catch (error) {
      errors.push(`CORS test error: ${error.message}`);
    }

    // Update state with all results
    setDebugData(prev => ({
      ...prev,
      backendStatus,
      categoriesStatus,
      productsStatus,
      categoriesData,
      productsData,
      errors,
      networkInfo: {
        ...prev.networkInfo,
        timestamp: new Date().toLocaleString()
      }
    }));

    console.log('🏁 Debug tests completed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'success':
      case 'success-direct': return 'text-green-600 bg-green-100';
      case 'failed':
      case 'disconnected': return 'text-red-600 bg-red-100';
      case 'checking': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success-direct': return 'Success (Direct)';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">🔍 POS System - API Debug Dashboard</h1>
        <p className="text-gray-600 mb-4">Comprehensive testing of frontend-backend connectivity</p>
        <button
          onClick={runDebugTests}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Run All Tests
        </button>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-3">🖥️ Backend Server</h3>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(debugData.backendStatus)}`}>
            {getStatusText(debugData.backendStatus)}
          </span>
          <p className="text-sm text-gray-600 mt-2">Health check status</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-3">📂 Categories API</h3>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(debugData.categoriesStatus)}`}>
            {getStatusText(debugData.categoriesStatus)}
          </span>
          {debugData.categoriesData.length > 0 && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              ✅ {debugData.categoriesData.length} categories loaded
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-3">📦 Products API</h3>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(debugData.productsStatus)}`}>
            {getStatusText(debugData.productsStatus)}
          </span>
          {debugData.productsData.length > 0 && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              ✅ {debugData.productsData.length} products loaded
            </p>
          )}
        </div>
      </div>

      {/* Errors Section */}
      {debugData.errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6">
          <h3 className="font-semibold text-red-800 text-lg mb-3">❌ Issues Found:</h3>
          <ul className="space-y-2">
            {debugData.errors.map((error, index) => (
              <li key={index} className="text-red-700 bg-red-100 p-2 rounded text-sm">
                <span className="font-medium">#{index + 1}:</span> {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Summary */}
      {debugData.errors.length === 0 && debugData.backendStatus === 'connected' && (
        <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 text-lg mb-2">🎉 All Systems Operational!</h3>
          <p className="text-green-700">
            Frontend is successfully connected to backend. 
            All API endpoints are working correctly.
          </p>
        </div>
      )}

      {/* Data Preview */}
      {debugData.categoriesData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">📂 Categories Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {debugData.categoriesData.map(category => (
              <div key={category.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-blue-600">{category.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">ID: {category.id}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {category._count?.products || 0} products
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {debugData.productsData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">📦 Products Preview (First 12)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {debugData.productsData.slice(0, 12).map(product => (
              <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-sm text-gray-800 line-clamp-2">{product.name}</h4>
                <p className="text-xs text-blue-600 mt-1">{product.category?.name || 'No category'}</p>
                <div className="mt-2">
                  <p className="text-lg font-bold text-green-600">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                </div>
                {product.barcode && (
                  <p className="text-xs text-gray-400 mt-1 bg-gray-100 px-2 py-1 rounded">
                    📷 {product.barcode}
                  </p>
                )}
              </div>
            ))}
          </div>
          {debugData.productsData.length > 12 && (
            <p className="text-center text-gray-500 mt-4 py-2 bg-gray-50 rounded">
              ... and {debugData.productsData.length - 12} more products
            </p>
          )}
        </div>
      )}

      {/* Network Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">🌐 Network Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Frontend URL:</strong> {debugData.networkInfo.frontendUrl}</p>
            <p><strong>Backend URL:</strong> {debugData.networkInfo.backendUrl}</p>
          </div>
          <div>
            <p><strong>Last Test:</strong> {debugData.networkInfo.timestamp}</p>
            <p><strong>Build Tool:</strong> Vite</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAPI;