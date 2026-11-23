import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicOnlyRoute = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  if (currentUser) {
    const role = userData?.role;

    if (location.pathname === '/admin-login' && (role === 'admin' || role === 'super-admin')) {
      return <Navigate to="/admin" replace />;
    }
    if (role === 'super-admin') {
      return <Navigate to="/super-admin" replace />;
    }
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (location.pathname === '/signup') {
      return <Navigate to="/register" state={{ from: location.state?.from }} replace />;
    }

    const from = location.state?.from?.pathname || '/renew';
    return <Navigate to={from} replace />;
  }

  return children;
};

export default PublicOnlyRoute;
