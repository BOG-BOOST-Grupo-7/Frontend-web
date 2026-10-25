import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

function ClienteLayout() {
  const { loading } = useAuth();

  // ⏳ evita parpadeo de UI al cargar sesión
  if (loading) {
    return <div>Cargando aplicación...</div>;
  }

  return (
    <div className="cliente-layout">

      {/* 🔝 HEADER GLOBAL (YA CON ROLES) */}
      <Header />

      {/* 📦 CONTENIDO DINÁMICO */}
      <main className="cliente-content">
        <Outlet />
      </main>

      {/* 🔻 FOOTER GLOBAL */}
      <Footer />

    </div>
  );
}

export default ClienteLayout;