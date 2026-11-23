import axios from 'axios';
import { supabase } from './supabase';

let rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001').trim().replace(/\/+$/, '');
if (rawApiUrl.startsWith('https://localhost')) {
  rawApiUrl = rawApiUrl.replace('https://localhost', 'http://localhost');
}

// Auto-adjust backend host when testing on mobile over local Wi-Fi
if (
  typeof window !== 'undefined' &&
  window.location.hostname &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  if (rawApiUrl.includes('localhost')) {
    rawApiUrl = rawApiUrl.replace('localhost', window.location.hostname);
  }
}

const API_BASE = `${rawApiUrl}/api/events`;

const eventApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

eventApi.interceptors.request.use(async (config) => {
  try {
    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  } catch {
    // Ignore session fetch failure for public endpoints
  }

  try {
    const mockRaw = localStorage.getItem('mockUser');
    const mockDataRaw = localStorage.getItem('mockUserData');
    if (mockRaw) {
      const mock = JSON.parse(mockRaw);
      if (mock?.email === 'admin@aclap.org' && mock?.uid === 'master-root') {
        config.headers['X-Dev-Root-Email'] = mock.email;
        config.headers['X-Dev-Root-Uid'] = mock.uid;
      }
      if (mock?.email) {
        config.headers['X-Admin-Email'] = mock.email;
      }
    }
    if (mockDataRaw) {
      const mockData = JSON.parse(mockDataRaw);
      if (mockData?.role) {
        config.headers['X-Admin-Role'] = mockData.role;
      }
      if (mockData?.district) {
        config.headers['X-Admin-District'] = mockData.district;
      }
    }
  } catch {
    // Ignore localStorage parse error
  }

  return config;
});

export default eventApi;
