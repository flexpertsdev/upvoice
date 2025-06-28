import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loading } from '@components/ui';

// Import pages directly to avoid lazy loading issues
import LandingPage from './pages/LandingPage';

// Temporary placeholder components
const TempPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600">This page is under construction</p>
    </div>
  </div>
);

const JoinSession = () => <TempPage title="Join Session" />;
const ActiveSession = () => <TempPage title="Active Session" />;
const CreateSession = () => <TempPage title="Create Session" />;
const Dashboard = () => <TempPage title="Dashboard" />;
const Login = () => <TempPage title="Login" />;
const Register = () => <TempPage title="Register" />;
const Profile = () => <TempPage title="Profile" />;
const NotFound = () => <TempPage title="404 - Page Not Found" />;

// Protected Route wrapper - simplified for local storage
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login' 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for temp user
    const tempUserId = localStorage.getItem('tempUserId');
    const userEmail = localStorage.getItem('userEmail');
    setIsAuthenticated(!!(tempUserId || userEmail));
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loading size="lg" text="Loading..." />
  </div>
);

function App() {
  return (
    <>
      <Router>
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/join" element={<JoinSession />} />
            <Route path="/join/:sessionCode" element={<JoinSession />} />
            <Route path="/session/:sessionId" element={<ActiveSession />} />
            
            {/* Auth routes */}
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              }
            />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </Router>
      
      {/* Global toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#101828',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </>
  );
}

export default App;