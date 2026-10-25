import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SuperAdminRoute = ({ children }) => {
  const { rol, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (rol !== "SUPER_ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default SuperAdminRoute;