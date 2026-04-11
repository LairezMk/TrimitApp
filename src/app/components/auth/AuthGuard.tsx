import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <p className="text-gray-600">Verificando sesion...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
