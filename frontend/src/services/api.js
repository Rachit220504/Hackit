import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for cross-origin requests
});

// Add a request interceptor to include auth token
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

// Auth Services
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.get('/auth/logout'),
  updateProfile: (profileData) => api.put('/profile', profileData),
  getProfile: (id) => api.get(`/profile/${id}`),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
};

// Team Services
export const teamAPI = {
  createTeam: (teamData) => api.post('/teams', teamData),
  getTeams: () => api.get('/teams'),
  getTeam: (id) => api.get(`/teams/${id}`),
  updateTeam: (id, teamData) => api.put(`/teams/${id}`, teamData),
  deleteTeam: (id) => api.delete(`/teams/${id}`),
  joinTeam: (id) => api.post(`/teams/${id}/join`),
  leaveTeam: (id) => api.post(`/teams/${id}/leave`),
  removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`),
  
  // Team invitation endpoints
  inviteToTeam: (teamId, email) => api.post(`/teams/${teamId}/invite`, { email }),
  getTeamInvitations: (teamId) => api.get(`/teams/${teamId}/invitations`),
  cancelInvitation: (teamId, email) => api.delete(`/teams/${teamId}/invitations/${email}`),
  verifyInvitation: (token) => api.get(`/teams/invitations/${token}`),
  acceptInvitation: (token) => api.post(`/teams/invitations/${token}/accept`),
  declineInvitation: (token) => api.post(`/teams/invitations/${token}/decline`),
};

// Project Services
export const projectAPI = {
  createProject: (projectData) => api.post('/projects', projectData),
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  getMyTeamProjects: () => api.get('/projects/myteam'),
  
  // Project submission
  submitProject: (id) => api.post(`/projects/${id}/submit`),
  addFeedback: (id, feedback) => api.post(`/projects/${id}/feedback`, feedback),
  updateSubmissionStatus: (id, status) => api.put(`/projects/${id}/status`, { status }),
};

export default api;
