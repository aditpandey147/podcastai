// frontend/src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  // Auth is still loading (checking token on page load)
  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: '#020914', color: '#8fa0ba' }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-full border-4 animate-spin"
            style={{
              borderColor: 'rgba(110,53,237,.2)',
              borderTopColor: '#6e35ed',
            }}
          />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  const hasToken = token || localStorage.getItem('token');
  if (!user || !hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated — render the page
  return children;
}