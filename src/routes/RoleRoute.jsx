import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRoute({ children, allowedRoles = [] }) {
  const { rol, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Cargando permisos...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!rol) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 si el rol NO está permitido
  if (!allowedRoles.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleRoute;