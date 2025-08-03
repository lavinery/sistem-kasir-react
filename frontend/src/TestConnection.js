// frontend/src/TestConnection.jsx - Simple test component
import React, { useState, useEffect } from "react";

const TestConnection = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Testing frontend to backend connection...");

      // Test categories
      const categoriesResponse = await fetch(
        "http://localhost:5000/api/categories"
      );
      if (!categoriesResponse.ok) {
        throw new Error(`Categories API failed: ${categoriesResponse.status}`);
      }
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);
      console.log("✅ Categories loaded:", categoriesData.length);

      // Test products
      const productsResponse = await fetch(
        "http://localhost:5000/api/products"
      );
      if (!productsResponse.ok) {
        throw new Error(`Products API failed: ${productsResponse.status}`);
      }
      const productsData = await productsResponse.json();
      setProducts(productsData);
      console.log("✅ Products loaded:", productsData.length);
    } catch (err) {
      console.error("❌ API Test failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='animate-pulse'>
            <div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
            <div className='space-y-3'>
              <div className='h-4 bg-gray-200 rounded'></div>
              <div className='h-4 bg-gray-200 rounded w-5/6'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
          <h2 className='text-red-800 font-semibold mb-2'>Connection Error</h2>
          <p className='text-red-600 mb-4'>{error}</p>
          <button
            onClick={testAPI}
            className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      {/* Success Header */}
      <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
        <h2 className='text-green-800 font-semibold mb-2'>
          ✅ Connection Successful!
        </h2>
        <p className='text-green-600'>
          Frontend successfully connected to backend API
        </p>
      </div>

      {/* Categories Test */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h3 className='text-lg font-semibold mb-4'>
          📂 Categories ({categories.length})
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {categories.map((category) => (
            <div
              key={category.id}
              className='border rounded-lg p-4'>
              <h4 className='font-medium'>{category.name}</h4>
              <p className='text-sm text-gray-600'>{category.description}</p>
              <p className='text-xs text-blue-600 mt-2'>
                {category._count?.products || 0} products
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Products Test */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h3 className='text-lg font-semibold mb-4'>
          📦 Products ({products.length})
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {products.slice(0, 8).map((product) => (
            <div
              key={product.id}
              className='border rounded-lg p-4'>
              <h4 className='font-medium text-sm'>{product.name}</h4>
              <p className='text-xs text-gray-600'>{product.category?.name}</p>
              <p className='text-sm font-semibold text-blue-600'>
                Rp {product.price.toLocaleString("id-ID")}
              </p>
              <p className='text-xs text-gray-500'>Stock: {product.stock}</p>
              {product.barcode && (
                <p className='text-xs text-gray-400'>📷 {product.barcode}</p>
              )}
            </div>
          ))}
        </div>
        {products.length > 8 && (
          <p className='text-center text-gray-500 mt-4'>
            ... and {products.length - 8} more products
          </p>
        )}
      </div>

      {/* API Test Button */}
      <div className='bg-white rounded-lg shadow p-6 text-center'>
        <button
          onClick={testAPI}
          className='bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600'>
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default TestConnection;
