// frontend/src/components/FeatureRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function FeatureRoute({
  children,
  feature,
  redirectTo = '/upgrade-required',
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

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
          <p className="text-sm">Checking access…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasAccess = user.features?.[feature] === true || user.role === 'admin';

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}