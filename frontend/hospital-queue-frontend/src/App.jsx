import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import BookToken from './components/user/BookToken';
import MyTokens from './components/user/MyTokens';
import Dashboard from './components/admin/Dashboard';
import ManageQueue from './components/admin/ManageQueue';
import LiveDisplay from './components/shared/LiveDisplay';
import Navbar from './components/shared/Navbar';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected User Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <BookToken />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tokens"
          element={
            <ProtectedRoute>
              <MyTokens />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole={['HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-queue"
          element={
            <ProtectedRoute requiredRole={['HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}>
              <ManageQueue />
            </ProtectedRoute>
          }
        />

        {/* Live Display - Public (for hospital screens) */}
        <Route path="/display/:departmentId" element={<LiveDisplay />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;