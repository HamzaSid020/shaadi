import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requireAuth = true,
}) => {
  const { user, loading, hasPermission, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !isAdmin && !hasPermission(requiredPermission)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// Helper function to protect routes with specific permissions
export const withProtectedRoute = (
  Component: React.ComponentType<any>,
  permission?: string
) => {
  return (props: any) => (
    <ProtectedRoute requiredPermission={permission}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Commonly used protected routes
export const AdminRoute = withProtectedRoute(({ children }: { children: React.ReactNode }) => <>{children}</>, PERMISSIONS.USERS.MANAGE_ROLES);
export const OrganizerRoute = withProtectedRoute(({ children }: { children: React.ReactNode }) => <>{children}</>, PERMISSIONS.EVENTS.MANAGE);
export const VendorRoute = withProtectedRoute(({ children }: { children: React.ReactNode }) => <>{children}</>, PERMISSIONS.VENDORS.READ); 