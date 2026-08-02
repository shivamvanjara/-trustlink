// Centralized API configuration for TrustLink Frontend

const SERVER_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_BASE_URL = SERVER_URL.endsWith('/api') 
  ? SERVER_URL 
  : `${SERVER_URL.replace(/\/$/, '')}/api`;

export const SOCKET_URL = SERVER_URL.replace(/\/api\/?$/, '');

export default API_BASE_URL;
