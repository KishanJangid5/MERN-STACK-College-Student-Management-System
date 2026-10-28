import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Interceptor to attach JWT token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle responses and common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and we had a token, it might be expired
      const token = localStorage.getItem('sms_token');
      if (token) {
        console.warn('Session expired or unauthorized request. Please log in.');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const studentAPI = {
  getAll: async (params = {}) => {
    const res = await api.get('/students', { params });
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/students/stats');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/students/${id}`);
    return res.data;
  },
  create: async (studentData) => {
    const res = await api.post('/students', studentData);
    return res.data;
  },
  update: async (id, studentData) => {
    const res = await api.put(`/students/${id}`, studentData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/students/${id}`);
    return res.data;
  }
};

export const attendanceAPI = {
  get: async (params = {}) => {
    const res = await api.get('/attendance', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/attendance', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/attendance/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/attendance/${id}`);
    return res.data;
  }
};

export const syllabusAPI = {
  getAll: async (params = {}) => {
    const res = await api.get('/syllabus', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/syllabus/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/syllabus', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/syllabus/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/syllabus/${id}`);
    return res.data;
  }
};

export const feeAPI = {
  get: async (params = {}) => {
    const res = await api.get('/fees', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/fees/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/fees', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/fees/${id}`, data);
    return res.data;
  },
  pay: async (id, paymentData) => {
    const res = await api.post(`/fees/${id}/pay`, paymentData);
    return res.data;
  }
};

export const examAPI = {
  getAll: async (params = {}) => {
    const res = await api.get('/examinations', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/examinations/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/examinations', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/examinations/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/examinations/${id}`);
    return res.data;
  }
};

export const resultAPI = {
  get: async (params = {}) => {
    const res = await api.get('/results', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/results/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/results', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/results/${id}`, data);
    return res.data;
  }
};

export const hallTicketAPI = {
  get: async (params = {}) => {
    const res = await api.get('/hall-tickets', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/hall-tickets/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/hall-tickets', data);
    return res.data;
  }
};

export const profileAPI = {
  get: async (params = {}) => {
    const res = await api.get('/profile', { params });
    return res.data;
  },
  update: async (data, params = {}) => {
    const res = await api.put('/profile', data, { params });
    return res.data;
  }
};

export const academicInfoAPI = {
  get: async (params = {}) => {
    const res = await api.get('/academic-info', { params });
    return res.data;
  }
};

export const resultSheetAPI = {
  get: async (params = {}) => {
    const res = await api.get('/result-sheet', { params });
    return res.data;
  }
};

export default api;
