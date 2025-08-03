// frontend/src/components/ConnectionTest.jsx - Test component
import React, { useState, useEffect } from 'react';
import { testConnection, productsAPI, categoriesAPI } from '../utils/api';

const ConnectionTest = () => {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setTesting(true);
    const testResults = {};

    try {
      // Test 1: Backend health
      console.log('🔍 Testing backend health...');
      const healthResponse = await fetch('http://localhost:5000/health');
      testResults.health = {
        status: healthResponse.ok ? 'OK' : 'FAIL',
        data: healthResponse.ok ? await healthResponse.json() : null
      };
    } catch (error) {
      testResults.health = { status: 'FAIL', error: error.message };
    }

    try {
      // Test 2: Database test endpoint
      console.log('🔍 Testing database connection...');
      const dbResponse = await fetch('http://localhost:5000/api/test');
      testResults.database = {
        status: dbResponse.ok ? 'OK' : 'FAIL',
        data: dbResponse.ok ? await dbResponse.json() : null
      };
    } catch (error) {
      testResults.database = { status: 'FAIL', error: error.message };
    }

    try {
      // Test 3: Products API
      console.log('🔍 Testing products API...');
      const products = await productsAPI.getAll();
      testResults.products = {
        status: 'OK',
        data: { count: products.length, sample: products.slice(0, 3) }
      };
    } catch (error) {
      testResults.products = { status: 'FAIL', error: error.message };
    }

    try {
      // Test 4: Categories API
      console.log('🔍 Testing categories API...');
      const categories = await categoriesAPI.getAll();
      testResults.categories = {
        status: 'OK',
        data: { count: categories.length, list: categories.map(c => c.name) }
      };
    } catch (error) {
      testResults.categories = { status: 'FAIL', error: error.message };
    }

    setResults(testResults);
    setTesting(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OK': return 'text-green-600 bg-green-100';
      case 'FAIL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">System Connection Test</h2>
            <button
              onClick={runTests}
              disabled={testing}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Run Tests'}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Backend Health Test */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Backend Server Health</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(results.health?.status)}`}>
                {results.health?.status || 'TESTING...'}
              </span>
            </div>
            {results.health && (
              <div className="text-sm">
                {results.health.status === 'OK' ? (
                  <div className="text-green-600">
                    ✅ Server is running at {results.health.data?.timestamp}
                  </div>
                ) : (
                  <div className="text-red-600">
                    ❌ {results.health.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Database Test */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Database Connection</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(results.database?.status)}`}>
                {results.database?.status || 'TESTING...'}
              </span>
            </div>
            {results.database && (
              <div className="text-sm">
                {results.database.status === 'OK' ? (
                  <div className="text-green-600">
                    ✅ Database connected successfully
                    <div className="mt-2 grid grid-cols-3 gap-4">
                      <div>Categories: {results.database.data?.data?.categories}</div>
                      <div>Products: {results.database.data?.data?.products}</div>
                      <div>Users: {results.database.data?.data?.users}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600">
                    ❌ {results.database.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Products API Test */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Products API</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(results.products?.status)}`}>
                {results.products?.status || 'TESTING...'}
              </span>
            </div>
            {results.products && (
              <div className="text-sm">
                {results.products.status === 'OK' ? (
                  <div className="text-green-600">
                    ✅ Found {results.products.data?.count} products
                    {results.products.data?.sample?.length > 0 && (
                      <div className="mt-2">
                        <strong>Sample products:</strong>
                        <ul className="list-disc list-inside ml-4">
                          {results.products.data.sample.map(product => (
                            <li key={product.id}>
                              {product.name} - Rp {product.price.toLocaleString('id-ID')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">
                    ❌ {results.products.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Categories API Test */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Categories API</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(results.categories?.status)}`}>
                {results.categories?.status || 'TESTING...'}
              </span>
            </div>
            {results.categories && (
              <div className="text-sm">
                {results.categories.status === 'OK' ? (
                  <div className="text-green-600">
                    ✅ Found {results.categories.data?.count} categories
                    <div className="mt-2">
                      <strong>Categories:</strong> {results.categories.data?.list?.join(', ')}
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600">
                    ❌ {results.categories.error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;