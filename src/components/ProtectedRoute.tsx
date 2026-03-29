import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAdminLoggedIn } = useAdmin();

  if (!isAdminLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
