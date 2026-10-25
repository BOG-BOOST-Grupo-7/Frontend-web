import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/ClienteLayout.css";

function ClienteLayout() {
  return (
    <div className="cliente-layout">

      {/* 🔝 Header global del cliente */}
      <Header />

      {/* 📦 Contenido dinámico de rutas cliente */}
      <main className="cliente-content">
        <Outlet />
      </main>

      {/* 🔻 Footer global */}
      <Footer />

    </div>
  );
}

export default ClienteLayout;