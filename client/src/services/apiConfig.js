/**
 * Dynamic API Base URL Resolver
 * - On Localhost / 127.0.0.1: connects to local server at http://localhost:5001
 * - On Mobile testing over local Wi-Fi (e.g. 192.168.x.x): connects to http://<wifi-ip>:5001
 * - On Production (aclapasso.com / Hostinger): connects to Render backend at https://labs-backend-ra23.onrender.com
 */
export const getApiBaseUrl = () => {
  const isBrowser = typeof window !== 'undefined';
  const hostname = isBrowser ? window.location.hostname : '';

  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local');

  // Local development mode (laptop or mobile on Wi-Fi)
  if (isLocal) {
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5001`;
    }
    return import.meta.env.VITE_DEV_API_URL || 'http://localhost:5001';
  }

  // Production mode (aclapasso.com or external domain)
  return (
    import.meta.env.VITE_API_URL ||
    'https://labs-backend-ra23.onrender.com'
  ).trim().replace(/\/+$/, '');
};

export const API_URL = getApiBaseUrl();
export default getApiBaseUrl;
