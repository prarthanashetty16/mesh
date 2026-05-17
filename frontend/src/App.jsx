import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';

import Landing    from './pages/Landing';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Browse     from './pages/Browse';
import TaskDetail from './pages/TaskDetail';
import CreateTask from './pages/CreateTask';
import Dashboard  from './pages/Dashboard';
import Profile    from './pages/Profile';
import Wallet     from './pages/Wallet';
import Admin      from './pages/Admin';

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { token } = useAuthStore();
  return !token ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"        element={<Landing />} />
        <Route path="/browse"  element={<Browse />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />

        {/* Guest only */}
        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected */}
        <Route path="/dashboard"   element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/create-task" element={<PrivateRoute><CreateTask /></PrivateRoute>} />
        <Route path="/profile"     element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/wallet"      element={<PrivateRoute><Wallet /></PrivateRoute>} />
        <Route path="/admin"       element={<PrivateRoute><Admin /></PrivateRoute>} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function NotFound() {
  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="text-center">
        <div style={{ fontSize: '6rem', fontWeight: 900, fontFamily: 'Syne', opacity: 0.15, lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Page Not Found</h1>
        <p className="text-muted" style={{ marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
        <a href="/" className="btn btn-primary">Go Home</a>
      </div>
    </div>
  );
}
