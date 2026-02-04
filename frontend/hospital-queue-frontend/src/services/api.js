import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Token API
export const tokenAPI = {
  create: (data) => api.post('/tokens', data),
  getUserTokens: (userId) => api.get(`/tokens/user/${userId}`),
  getDepartmentQueue: (deptId) => api.get(`/tokens/department/${deptId}`),
  updateStatus: (id, status) => api.put(`/tokens/${id}/status`, { status }),
};

// Department API
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  getByHospital: (hospitalId) => api.get(`/departments/hospital/${hospitalId}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: (departmentId) => api.get(`/dashboard/stats/${departmentId}`),
};

export default api;