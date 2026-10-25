import "../styles/Header.css";
import { useEffect, useState } from "react";
import { obtenerNotificaciones } from "../api/notificacionApi";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { obtenerCategorias } from "../api/categoriaApi";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../api/auth";

function Header() {
  const navigate = useNavigate();

  const { user, perfil, rol, logout, isAuthenticated } = useAuth();

  const [catalogoOpen, setCatalogoOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendientes, setPendientes] = useState(0);
  const [categorias, setCategorias] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");

  const go = (path) => {
    navigate(path);
    setCatalogoOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (searchTerm.trim() !== "") {
        navigate(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm(""); 
        setMobileMenuOpen(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      navigate("/");
      setMobileMenuOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const avatarLetter =
    user?.primer_nombre?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const fotoPerfil = perfil?.foto_perfil || user?.foto_perfil || user?.logo;

  useEffect(() => {
    cargarCategorias();
    if (isAuthenticated) {
      cargarNotificaciones();
    }
  }, [isAuthenticated, user, perfil]);

  const cargarNotificaciones = async () => {
    try {
      const data = await obtenerNotificaciones();
      setPendientes(data.filter(n => !n.estado_notificacion).length);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategorias();
      
      // Filtramos solo las categorías ACTIVAS
      const categoriasActivas = data.filter(
        (cat) => cat.estado === "ACTIVO" || cat.estado === null || cat.estado === undefined
      );
      
      setCategorias(categoriasActivas);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="navbar">

      <div className="logo-container" onClick={() => go("/")} style={{ cursor: "pointer" }}>
        <img src={logo} alt="Logo" className="logo" />
      </div>

      {/* MENU ESCRITORIO */}
      <nav className="menu">
        {rol === "SUPER_ADMIN" || rol === "ADMINISTRADOR" ? (
          <a onClick={() => go("/admin")}>Panel Principal</a>
        ) : rol === "VENDEDOR" ? (
          <>
            <a onClick={() => go("/vendedor")}>Perfil Negocio</a>
            <a onClick={() => go("/ventas")}>Ventas</a>
            <a onClick={() => go("/stock")}>Inventario y Stock</a>
          </>
        ) : (
          <>
            <a onClick={() => go("/")}>Inicio</a>
            <div className="catalogo-container">
              <a
                className="catalogo-link"
                onClick={(e) => {
                  e.preventDefault();
                  setCatalogoOpen(!catalogoOpen);
                }}
              >
                Categorías <i className={`fas fa-chevron-down dropdown-arrow ${catalogoOpen ? "rotate" : ""}`}></i>
              </a>
              <div className={`catalogo-dropdown ${catalogoOpen ? "show" : ""}`}>
                {categorias.length > 0 ? (
                  categorias.map((cat) => (
                    <a
                      key={cat.id_categoria}
                      onClick={() => go(`/categoria/${cat.id_categoria}`)}
                    >
                      <i className="fas fa-tag"></i> {cat.nombre_categoria}
                    </a>
                  ))
                ) : (
                  <span className="dropdown-empty">Cargando...</span>
                )}
              </div>
            </div>
            <a onClick={() => go("/negocios")}>Negocios</a>
          </>
        )}
      </nav>

      {/* SEARCH CONECTADO */}
      {rol !== "SUPER_ADMIN" && rol !== "ADMINISTRADOR" && rol !== "VENDEDOR" && (
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar productos o negocios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
          />
          <i className="fas fa-search" onClick={handleSearch} style={{ cursor: "pointer" }}></i>
        </div>
      )}

      {/* ICONOS */}
      <div className="user-icons">
        {isAuthenticated && (
          <div className="user-profile" onClick={() => go("/perfil")}>
            {fotoPerfil ? (
              <img 
                src={fotoPerfil} 
                alt="Perfil" 
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #2c1810"
                }} 
              />
            ) : (
              <div className="user-avatar">{avatarLetter}</div>
            )}
          </div>
        )}

        {rol !== "SUPER_ADMIN" && rol !== "ADMINISTRADOR" && rol !== "VENDEDOR" && (
          <div className="cart-icon" onClick={() => go("/carrito")}>
            <i className="fas fa-shopping-cart"></i>
          </div>
        )}

        {isAuthenticated && (
          <div className="bell-container" onClick={() => go("/notificaciones")}>
            <i className="fas fa-bell"></i>
            {pendientes > 0 && <span className="badge">{pendientes}</span>}
          </div>
        )}

        <div className="mobile-toggle" onClick={() => setMobileMenuOpen(true)}>
          <i className="fas fa-bars"></i>
        </div>
      </div>

      <div
        className={`mobile-overlay ${mobileMenuOpen ? "show" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* MENÚ MÓVIL */}
      <div className={`mobile-menu ${mobileMenuOpen ? "show" : ""}`}>
        <div className="mobile-header">
          {isAuthenticated ? (
            <>
              {fotoPerfil ? (
                <img 
                  src={fotoPerfil} 
                  alt="Perfil" 
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    margin: "0 auto 10px",
                    border: "2px solid #fff",
                    display: "block"
                  }} 
                />
              ) : (
                <div className="mobile-avatar">{avatarLetter}</div>
              )}
              <h3>{user?.primer_nombre}</h3>
            </>
          ) : (
            <h3>Menú</h3>
          )}
        </div>

        {rol === "SUPER_ADMIN" || rol === "ADMINISTRADOR" ? (
          <a onClick={() => go("/admin")}>Panel Principal</a>
        ) : rol === "VENDEDOR" ? (
          <>
            <a onClick={() => go("/vendedor")}>Perfil Negocio</a>
            <a onClick={() => go("/ventas")}>Ventas</a>
            <a onClick={() => go("/stock")}>Inventario y Stock</a>
          </>
        ) : (
          <>
            <a onClick={() => go("/")}>Inicio</a>
            <div className="catalogo-container">
              <a
                className="catalogo-link"
                onClick={(e) => {
                  e.preventDefault();
                  setCatalogoOpen(!catalogoOpen);
                }}
              >
                Categorías <i className={`fas fa-chevron-down dropdown-arrow ${catalogoOpen ? "rotate" : ""}`}></i>
              </a>
              <div className={`catalogo-dropdown ${catalogoOpen ? "show" : ""}`}>
                {categorias.length > 0 ? (
                  categorias.map((cat) => (
                    <a
                      key={cat.id_categoria}
                      onClick={() => go(`/categoria/${cat.id_categoria}`)}
                    >
                      <i className="fas fa-tag"></i> {cat.nombre_categoria}
                    </a>
                  ))
                ) : (
                  <span className="dropdown-empty">No hay categorías</span>
                )}
              </div>
            </div>
            <a onClick={() => go("/negocios")}>Negocios</a>
          </>
        )}

        {!isAuthenticated ? (
          <>
            <a onClick={() => go("/registrar-negocio")}>Registrar negocio</a>
            <a onClick={() => go("/login")}>Iniciar Sesión</a>
            <a onClick={() => go("/registro")}>Registro</a>
          </>
        ) : rol === "CLIENTE" ? (
          <>
            <a onClick={() => go("/perfil")}>Mi Perfil</a>
            <a onClick={() => go("/historial")}>Historial/Compras</a>
            <a onClick={() => go("/contacto")}>Contáctenos/PQRS</a>
            <a onClick={() => go("/registrar-negocio")}>Registrar negocio</a>
          </>
        ) : rol === "SUPER_ADMIN" || rol === "ADMINISTRADOR" ? (
          <>
            <a onClick={() => go("/perfil")}>Perfil</a>
            <a onClick={() => go("/admin/negocios")}>Negocios</a>
            <a onClick={() => go("/admin/usuarios")}>Usuarios</a>
            <a onClick={() => go("/admin/solicitudes")}>Solicitudes</a>
            <a onClick={() => go("/admin/pqrs")}>PQRS</a>
            <a onClick={() => go("/ventas")}>Reportes</a>
          </>
        ) : rol === "VENDEDOR" ? (
          <>
            <a onClick={() => go("/perfil")}>Perfil</a>
            <a onClick={() => go("/contacto")}>Contáctenos/PQRS</a>
          </>
        ) : null}

        {isAuthenticated && (
          <a className="logout" onClick={handleLogout}>Cerrar Sesión</a>
        )}
      </div>
    </header>
  );
}

export default Header;