import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
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
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthLogin = requestUrl.includes('/auth/login');

    // Only force-redirect on 401 when not already on the login flow
    if (status === 401 && !isAuthLogin) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (_) {}
      // Do not auto-redirect here to avoid refresh flicker on login; allow caller to handle
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  requestReset: (data) => api.post('/auth/request-reset', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Student endpoints
export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getGrades: (id) => api.get(`/students/${id}/grades`),
  getAttendance: (id) => api.get(`/students/${id}/attendance`),
  resetPassword: (id, newPassword) => api.put(`/students/${id}/reset-password`, { newPassword }),
  changePassword: (id, currentPassword, newPassword) => api.put(`/students/${id}/change-password`, { currentPassword, newPassword }),
  uploadAvatar: (id, formData) => api.post(`/students/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Staff endpoints
export const staffAPI = {
  getAll: () => api.get('/staff'),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
  changePassword: (id, currentPassword, newPassword) => api.put(`/staff/${id}/change-password`, { currentPassword, newPassword }),
  uploadAvatar: (id, formData) => api.post(`/staff/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Grade endpoints
export const gradeAPI = {
  getAll: (params) => api.get('/grades', { params }),
  getById: (id) => api.get(`/grades/${id}`),
  create: (data) => api.post('/grades', data),
  update: (id, data) => api.put(`/grades/${id}`, data),
  bulkUpdate: (grades) => api.put('/grades/bulk', { grades }),
  delete: (id) => api.delete(`/grades/${id}`),
};

// Attendance endpoints
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getById: (id) => api.get(`/attendance/${id}`),
  create: (data) => api.post('/attendance', data),
  bulkCreate: (data) => api.post('/attendance/bulk', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  getStats: (studentId, params) => api.get(`/attendance/stats/${studentId}`, { params }),
};

// Event endpoints
export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// Announcement endpoints
export const announcementAPI = {
  getAll: (params) => api.get('/announcements', { params }),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

// Class endpoints
export const classAPI = {
  getAll: (params) => api.get('/classes', { params }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  getTeacherClasses: (teacherId) => api.get(`/classes/teacher/${teacherId}`),
  addStudent: (classId, studentId) => api.post(`/classes/${classId}/students`, { studentId }),
  removeStudent: (classId, studentId) => api.delete(`/classes/${classId}/students/${studentId}`),
};

// Material endpoints
export const materialAPI = {
  getAll: (params) => api.get('/materials', { params }),
  getById: (id) => api.get(`/materials/${id}`),
  create: (data) => {
    // If data is FormData, let axios handle Content-Type automatically
    if (data instanceof FormData) {
      return api.post('/materials', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.post('/materials', data);
  },
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
  getSubmissions: (materialId) => api.get(`/materials/${materialId}/submissions`),
};

// Submission endpoints
export const submissionAPI = {
  getAll: (params) => api.get('/submissions', { params }),
  getById: (id) => api.get(`/submissions/${id}`),
  create: (data) => {
    // If data is FormData, handle multipart/form-data
    if (data instanceof FormData) {
      return api.post('/submissions', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.post('/submissions', data);
  },
  update: (id, data) => api.put(`/submissions/${id}`, data),
  delete: (id) => api.delete(`/submissions/${id}`),
  grade: (id, data) => api.put(`/submissions/${id}/grade`, data),
  getStudentSubmissions: (studentId) => api.get(`/submissions/student/${studentId}`),
};

export default api;

