import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hospital_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('hospital_token');
      localStorage.removeItem('hospital_user');
      window.dispatchEvent(new Event('auth_logout'));
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: any) => api.post('/auth/change-password', data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/metrics'),
  getSystemStatus: () => api.get('/dashboard/system-status'),
  seedDatabase: () => api.post('/dashboard/seed'),
};

export const employeesApi = {
  getAll: (params?: any) => api.get('/employees', { params }),
  getById: (id: string) => api.get(`/employees/${id}`),
  create: (data: any) => api.post('/employees', data),
  update: (id: string, data: any) => api.put(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
};

export const departmentsApi = {
  getAll: () => api.get('/departments'),
  create: (data: any) => api.post('/departments', data),
  update: (id: string, data: any) => api.put(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

export const leaksApi = {
  getAll: (params?: any) => api.get('/leaks', { params }),
  getById: (id: string) => api.get(`/leaks/${id}`),
  create: (data: any) => api.post('/leaks', data),
  update: (id: string, data: any) => api.put(`/leaks/${id}`, data),
  delete: (id: string) => api.delete(`/leaks/${id}`),
};

export const attendanceApi = {
  getAll: (params?: any) => api.get('/attendance', { params }),
  clockIn: (employeeCode?: string) => api.post('/attendance/clock-in', { employeeCode }),
  clockOut: (employeeCode?: string) => api.post('/attendance/clock-out', { employeeCode }),
  record: (data: any) => api.post('/attendance/record', data),
  delete: (id: string) => api.delete(`/attendance/${id}`),
};

export const leavesApi = {
  getAll: (params?: any) => api.get('/leaves', { params }),
  apply: (data: any) => api.post('/leaves/apply', data),
  review: (id: string, data: any) => api.put(`/leaves/${id}/review`, data),
  delete: (id: string) => api.delete(`/leaves/${id}`),
};

export const recordsApi = {
  getAll: (params?: any) => api.get('/records', { params }),
  create: (data: any) => api.post('/records', data),
  update: (id: string, data: any) => api.put(`/records/${id}`, data),
  delete: (id: string) => api.delete(`/records/${id}`),
};

export const reportsApi = {
  generate: (params: any) => api.get('/reports/generate', { params }),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const auditApi = {
  getAll: (params?: any) => api.get('/audit-logs', { params }),
};

export default api;
