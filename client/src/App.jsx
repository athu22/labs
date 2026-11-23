import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

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
import TicketView from './pages/TicketView';
import MobileScanner from './pages/MobileScanner';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

import TallyAccountLogin from './pages/superadmin/sections/TallyAccountLogin';
import Contact from './pages/Contact';

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const { currentUser, userData, loading } = useAuth();

  if (!loading && currentUser) {
    const isAllowedForStaff =
      location.pathname === '/scan' ||
      location.pathname.startsWith('/ticket/') ||
      location.pathname.startsWith('/event-registration/') ||
      location.pathname === '/admin' ||
      location.pathname === '/super-admin' ||
      location.pathname === '/tally-login';

    if (userData?.role === 'admin' && !isAllowedForStaff) {
      return <Navigate to="/admin" replace />;
    }
    if (userData?.role === 'super-admin' && !isAllowedForStaff) {
      return <Navigate to="/super-admin" replace />;
    }
  }

  const hideNavFooter =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/super-admin') ||
    location.pathname.startsWith('/tally') ||
    location.pathname === '/scan' ||
    [
      '/admin-login',
      '/super-admin-login',
      '/super-admin-setup',
      '/tally-login'
    ].includes(location.pathname);

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
        <LanguageProvider>
          <Layout>
            <Routes>

              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicOnlyRoute>
                    <SignUp />
                  </PublicOnlyRoute>
                }
              />
              <Route path="/membership" element={<Membership />} />
              <Route path="/contact-us" element={<Contact />} />

              <Route
                path="/event-registration/:eventId"
                element={<EventRegistration />}
              />
              <Route
                path="/ticket/:code"
                element={<TicketView />}
              />
              <Route
                path="/scan"
                element={<MobileScanner />}
              />

              {/* Member Routes */}
              <Route
                path="/register"
                element={
                  <ProtectedRoute>
                    <Register />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/renew"
                element={
                  <ProtectedRoute>
                    <MemberPortal />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin-login"
                element={
                  <PublicOnlyRoute>
                    <AdminLogin />
                  </PublicOnlyRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin Routes */}
              <Route
                path="/super-admin-login"
                element={
                  <PublicOnlyRoute>
                    <SuperAdminLogin />
                  </PublicOnlyRoute>
                }
              />
              <Route path="/super-admin-setup" element={<SuperAdminSetup />} />

              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute allowedRoles={['super-admin']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Tally Routes */}
              <Route
                path="/tally-login"
                element={<TallyAccountLogin />}
              />

            </Routes>
          </Layout>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;