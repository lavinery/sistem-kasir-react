// frontend/src/utils/api.js - Add better error handling
const API_BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  console.log("API Call:", { url, config }); // Debug log

  try {
    const response = await fetch(url, config);

    console.log("API Response status:", response.status); // Debug log

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText); // Debug log

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}` };
      }

      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("API Success Response:", result); // Debug log
    return result;
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
};

export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/test`);
    return response.ok;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

export const authAPI = {
  login: async (credentials) => {
    console.log("Sending login request:", credentials); // Debug log

    const response = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("userData", JSON.stringify(response.user));
    }

    return response;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
  },
};

// Export other APIs...
export const productsAPI = {
  getAll: () => apiCall("/products"),
};

export const categoriesAPI = {
  getAll: () => apiCall("/categories"),
};

export const salesAPI = {
  create: (saleData) =>
    apiCall("/sales", {
      method: "POST",
      body: JSON.stringify(saleData),
    }),
};
