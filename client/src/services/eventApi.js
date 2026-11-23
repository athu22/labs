import axios from 'axios';
import { supabase } from './supabase';
import { getApiBaseUrl } from './apiConfig';

const API_BASE = `${getApiBaseUrl()}/api/events`;

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
