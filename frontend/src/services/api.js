// Frontend API Service
const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Helper method to get headers with auth
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }

  // Helper method for API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth APIs
  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // POS APIs
  async getPosInitData() {
    return await this.request('/api/pos/init');
  }

  async searchProducts(query) {
    return await this.request(`/api/pos/search?q=${encodeURIComponent(query)}`);
  }

  async getProductByBarcode(barcode) {
    return await this.request(`/api/pos/barcode/${barcode}`);
  }

  async getMemberById(memberId) {
    return await this.request(`/api/pos/member/${memberId}`);
  }

  async checkout(transactionData) {
    return await this.request('/api/pos/checkout', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Products APIs
  async getProducts() {
    return await this.request('/api/products');
  }

  async getProductById(id) {
    return await this.request(`/api/products/${id}`);
  }

  // Categories APIs
  async getCategories() {
    return await this.request('/api/categories');
  }

  // Members APIs
  async getMembers() {
    return await this.request('/api/members');
  }

  // Settings APIs
  async getSettings() {
    return await this.request('/api/settings');
  }

  async updateSettings(settings) {
    return await this.request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getSetting(key) {
    return await this.request(`/api/settings/${key}`);
  }

  async updateSetting(key, value) {
    return await this.request(`/api/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  // Favorites APIs
  async getFavorites() {
    return await this.request('/api/favorites');
  }

  async updateFavorites(favoriteIds) {
    return await this.request('/api/favorites', {
      method: 'PUT',
      body: JSON.stringify({ favoriteIds }),
    });
  }

  async addToFavorites(productId) {
    return await this.request(`/api/favorites/add/${productId}`, {
      method: 'POST',
    });
  }

  async removeFromFavorites(productId) {
    return await this.request(`/api/favorites/remove/${productId}`, {
      method: 'DELETE',
    });
  }

  async getAvailableProducts() {
    return await this.request('/api/favorites/available');
  }

  // Sales APIs
  async getSales() {
    return await this.request('/api/sales');
  }

  async getSaleById(id) {
    return await this.request(`/api/sales/${id}`);
  }

  // Dashboard APIs
  async getDashboardData() {
    return await this.request('/api/dashboard');
  }
}

export default new ApiService();