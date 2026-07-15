import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import TallyAccountLogin from './pages/superadmin/sections/TallyAccountLogin';
import Contact from './pages/Contact';

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();

  const hideNavFooter =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/super-admin') ||
    location.pathname.startsWith('/tally') ||
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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/contact-us" element={<Contact />} />

              <Route
                path="/event-registration/:eventId"
                element={<EventRegistration />}
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
              <Route path="/admin-login" element={<AdminLogin />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin Routes */}
              <Route path="/super-admin-login" element={<SuperAdminLogin />} />
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