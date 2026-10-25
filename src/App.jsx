import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext"; 

// Layouts
import ClienteLayout from "./layouts/ClienteLayout";

// Mapa
import MapaMercadoPagina from './pages/MapaMercadoPagina.jsx';

// Cliente
import Home from "./pages/cliente/Home";
import Perfil from "./pages/cliente/Perfil";
import RegistrarNegocio from "./pages/cliente/RegistrarNegocio";
import Negocios from "./pages/cliente/Negocios";
import NegocioDetalle from "./pages/cliente/NegocioDetalle";
import PQRS from "./pages/cliente/PQRS";
import Historial from "./pages/cliente/Historial";
import ComentariosProducto from "./pages/cliente/ComentariosProducto";
import ResultadosBusqueda from "./components/home/ResultadosBusqueda";
import Notificaciones from "./pages/cliente/Notificaciones";
import Categoria from "./pages/cliente/Categoria";

// Auth
import Login from "./pages/auth/Login";
import Registro from "./pages/auth/Registro";
import RecuperarPassword from "./pages/auth/RecuperarPassword";
import ActualizarPassword from "./pages/auth/ActualizarPassword";

// Admin
import AdminHome from "./pages/admin/AdminHome";
import SolicitudesAdmin from "./pages/admin/SolicitudesAdmin";
import ListaNegociosAdmin from "./pages/admin/ListaNegociosAdmin";
import ListaUsuariosAdmin from "./pages/admin/ListaUsuariosAdmin";
import AdminPQRS from "./pages/admin/AdminPQRS";
import ReportesAdmin from "./pages/admin/ReportesAdmin";

// Vendedor
import PerfilNegocio from "./pages/vendedor/PerfilNegocio";
import DetalleProducto from "./components/home/DetalleProducto";
import Carrito from "./pages/cliente/Carrito";
import AdminMovimientoStock from "./pages/vendedor/MovimientoStock";
import AdminVentasYSeguimiento from "./pages/vendedor/AdminVentasYSeguimiento";


const InicioRedireccion = () => {
  const { rol, loading } = useAuth();
  
  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Cargando...</p>;
  
  // Si es administrador, lo enviamos al panel
  if (rol === "SUPER_ADMIN" || rol === "ADMINISTRADOR") {
    return <Navigate to="/admin" replace />;
  }
  
  // Si es cliente o vendedor, ve el Home normal
  return <Home />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<ClienteLayout />}>
        {/* Usamos el componente de redirección aquí */}
        <Route index element={<InicioRedireccion />} />
        
        {/* Públicas */}
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="recuperar-password" element={<RecuperarPassword />} />
        <Route path="cambiar-password" element={<ActualizarPassword />} />
        <Route path="mapa-mercado" element={<MapaMercadoPagina />} />
        <Route path="negocios" element={<Negocios />} />
        <Route path="negocios/:id" element={<NegocioDetalle />} />
        <Route path="producto/:id" element={<DetalleProducto />} />
        <Route path="producto/:idProducto/comentarios" element={<ComentariosProducto />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="contacto" element={<PQRS />} />
        <Route path="historial" element={<Historial />} />
        <Route path="buscar" element={<ResultadosBusqueda />} />
        <Route path="categoria/:id" element={<Categoria />} />

        {/* Requieren inicio de sesión */}
        <Route path="perfil" element={<ProtectedRoute> <Perfil /> </ProtectedRoute>} />
        <Route path="registrar-negocio" element={<ProtectedRoute> <RegistrarNegocio /> </ProtectedRoute>} />
        <Route path="notificaciones" element={<ProtectedRoute> <Notificaciones /> </ProtectedRoute>} />

        {/* VENDEDOR */}
        <Route path="vendedor" element={<ProtectedRoute allowedRoles={["VENDEDOR"]}><PerfilNegocio /></ProtectedRoute>} />
        <Route path="stock" element={<ProtectedRoute allowedRoles={["VENDEDOR"]}><AdminMovimientoStock /> </ProtectedRoute>} />
        <Route path="ventas" element={<ProtectedRoute allowedRoles={["VENDEDOR"]}><AdminVentasYSeguimiento /></ProtectedRoute>}/>

        {/* ADMINISTRADOR Y SUPER_ADMIN */}
        <Route path="admin" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMINISTRADOR"]}> <AdminHome /></ProtectedRoute>}/>
        <Route path="admin/solicitudes" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMINISTRADOR"]}> <SolicitudesAdmin /> </ProtectedRoute>}/>
        <Route path="admin/negocios" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMINISTRADOR"]}><ListaNegociosAdmin /></ProtectedRoute>} />
        <Route path="admin/usuarios" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMINISTRADOR"]}> <ListaUsuariosAdmin /></ProtectedRoute>}/>
        <Route path="admin/pqrs" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMINISTRADOR"]}><AdminPQRS /></ProtectedRoute>} />
        <Route path="admin/reportes" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMINISTRADOR"]}><ReportesAdmin /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;