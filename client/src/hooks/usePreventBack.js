import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Prevents the browser Back button from navigating away from a logged-in portal.
 * Captures the locked URL/path up front so React Router and browser history stay on it.
 */
const usePreventBack = (enabled = true) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    const lockedPath = location.pathname + location.search + location.hash;
    const lockedUrl = window.location.href;

    window.history.pushState({ preventBack: true }, '', lockedUrl);

    const handlePopState = () => {
      window.history.pushState({ preventBack: true }, '', lockedUrl);
      navigate(lockedPath, { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled, location.pathname, location.search, location.hash, navigate]);
};

export default usePreventBack;
