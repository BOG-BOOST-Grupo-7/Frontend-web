import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const VendedorRoute = ({ children }) => {
  const { rol, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (rol !== "VENDEDOR") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default VendedorRoute;