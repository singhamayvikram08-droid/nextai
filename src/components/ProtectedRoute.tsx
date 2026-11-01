import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  featureName?: string;
  requiredRole?: 'admin' | 'user' | string;
}

export const ProtectedRoute = ({
  children,
  featureName = 'in-site features',
  requiredRole,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" state={{ from: location.pathname, requireAdmin: true }} replace />;
    }
    return <Navigate to="/login" state={{ from: location.pathname, featureName, requireLoginFirst: true }} replace />;
  }

  if (requiredRole === 'admin') {
    const isAdmin = Boolean(
      user &&
      (user.role === 'Root Admin' || user.role === 'admin' || user.role === 'Enterprise Admin')
    );
    if (!isAdmin) {
      return <Navigate to="/admin/login" state={{ from: location.pathname, unauthorized: true }} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
