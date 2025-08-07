import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

function LoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/entrar" replace />;
  }

  return <Outlet />;
}