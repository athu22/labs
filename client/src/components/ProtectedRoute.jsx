import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>;
  }

  if (!currentUser) {
    if (location.pathname.startsWith('/super-admin')) {
      return <Navigate to="/super-admin-login" />;
    }
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin-login" />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userData?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
