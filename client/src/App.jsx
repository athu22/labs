import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import About from './pages/About';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import SuperAdminSetup from './pages/superadmin/SuperAdminSetup';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import MemberPortal from './pages/MemberPortal';
import Membership from './pages/Membership';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import EventRegistration from './pages/EventRegistration';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Layout component to handle conditional rendering of Navbar and Footer
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavFooter = [
    '/admin-login', 
    '/super-admin-login', 
    '/super-admin-setup'
  ].includes(location.pathname) || 
  location.pathname.startsWith('/super-admin') || 
  location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {!hideNavFooter && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!hideNavFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/register" element={
              <ProtectedRoute>
                <Register />
              </ProtectedRoute>
            } />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/event-registration/:eventId" element={<EventRegistration />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/super-admin-login" element={<SuperAdminLogin />} />
            <Route path="/super-admin-setup" element={<SuperAdminSetup />} />
            <Route path="/renew" element={
              <ProtectedRoute>
                <MemberPortal />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/super-admin" element={
              <ProtectedRoute allowedRoles={['super-admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
