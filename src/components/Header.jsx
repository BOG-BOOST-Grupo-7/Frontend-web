import "../styles/Header.css";
import { useEffect, useState } from "react";
import { obtenerNotificaciones } from "../api/notificacionApi";
import { useNavigate, Link } from "react-router-dom";
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
    cerrarMenus();
  };

  const cerrarMenus = () => {
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
    const cargarDatos = async () => {
      try {
        await cargarCategorias();

        if (isAuthenticated) {
          await cargarNotificaciones();
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    cargarDatos().catch((error) => {
      console.error("Error al ejecutar cargarDatos:", error);
    });
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

  function CatalogoMenu({ id, categorias, catalogoOpen, onToggle, onClose, textoVacio }) {
  return (
    <div className="catalogo-container">
      <button
        type="button"
        className="catalogo-link"
        aria-expanded={catalogoOpen}
        aria-controls={id}
        onClick={onToggle}
      >
        Categorías
        <i className={`fas fa-chevron-down dropdown-arrow ${catalogoOpen ? "rotate" : ""}`}></i>
      </button>

      <div
        id={id}
        className={`catalogo-dropdown ${catalogoOpen ? "show" : ""}`}
      >
        {categorias.length > 0 ? (
          categorias.map((cat) => (
            <Link
              key={cat.id_categoria}
              to={`/categoria/${cat.id_categoria}`}
              onClick={onClose}
            >
              <i className="fas fa-tag"></i> {cat.nombre_categoria}
            </Link>
          ))
        ) : (
          <span className="dropdown-empty">{textoVacio}</span>
        )}
      </div>
    </div>
  );
}

function NavegacionPrincipal({
  rol,
  cerrarMenus,
  categorias,
  catalogoOpen,
  toggleCatalogo,
  dropdownId,
  textoVacio
}) {
  if (rol === "SUPER_ADMIN" || rol === "ADMINISTRADOR") {
    return (
      <Link to="/admin" onClick={cerrarMenus}>
        Panel Principal
      </Link>
    );
  }

  if (rol === "VENDEDOR") {
    return (
      <>
        <Link to="/vendedor" onClick={cerrarMenus}>Perfil Negocio</Link>
        <Link to="/ventas" onClick={cerrarMenus}>Ventas</Link>
        <Link to="/stock" onClick={cerrarMenus}>Inventario y Stock</Link>
      </>
    );
  }

  return (
    <>
      <Link to="/" onClick={cerrarMenus}>Inicio</Link>

      <CatalogoMenu
        id={dropdownId}
        categorias={categorias}
        catalogoOpen={catalogoOpen}
        onToggle={toggleCatalogo}
        onClose={cerrarMenus}
        textoVacio={textoVacio}
      />

      <Link to="/negocios" onClick={cerrarMenus}>Negocios</Link>
    </>
  );
}

  return (
    <header className="navbar">

      <Link to="/" className="logo-container" onClick={cerrarMenus}>
        <img src={logo} alt="Logo" className="logo" />
      </Link>

      {/* MENU ESCRITORIO */}
      <nav className="menu">
        <NavegacionPrincipal
          rol={rol}
          cerrarMenus={cerrarMenus}
          categorias={categorias}
          catalogoOpen={catalogoOpen}
          toggleCatalogo={() => setCatalogoOpen(!catalogoOpen)}
          dropdownId="categorias-dropdown-desktop"
          textoVacio="Cargando..."
        />
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
          <button
            type="button"
            className="search-button"
            aria-label="Buscar"
            onClick={handleSearch}
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
      )}

      {/* ICONOS */}
      <div className="user-icons">
        {isAuthenticated && (
          <Link
            to="/perfil"
            className="user-profile"
            onClick={cerrarMenus}
            aria-label="Ir al perfil"
          >
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
          </Link>
        )}

        {rol !== "SUPER_ADMIN" && rol !== "ADMINISTRADOR" && rol !== "VENDEDOR" && (
          <Link
            to="/carrito"
            className="cart-icon"
            onClick={cerrarMenus}
            aria-label="Ir al carrito"
          >
            <i className="fas fa-shopping-cart"></i>
          </Link>
        )}

        {isAuthenticated && (
          <Link
            to="/notificaciones"
            className="bell-container"
            onClick={cerrarMenus}
            aria-label={`Notificaciones: ${pendientes} pendientes`}
          >
            <i className="fas fa-bell"></i>
            {pendientes > 0 && <span className="badge">{pendientes}</span>}
          </Link>
        )}

        <button
          type="button"
          className="mobile-toggle"
          aria-label="Abrir menú"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(true)}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      <button
        type="button"
        className={`mobile-overlay ${mobileMenuOpen ? "show" : ""}`}
        aria-label="Cerrar menú"
        tabIndex={mobileMenuOpen ? 0 : -1}
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
          <Link to="/admin" onClick={cerrarMenus}>Panel Principal</Link>
        ) : rol === "VENDEDOR" ? (
          <>
            <Link to="/vendedor" onClick={cerrarMenus}>Perfil Negocio</Link>
            <Link to="/ventas" onClick={cerrarMenus}>Ventas</Link>
            <Link to="/stock" onClick={cerrarMenus}>Inventario y Stock</Link>
          </>
        ) : (
          <>
              <NavegacionPrincipal
                rol={rol}
                cerrarMenus={cerrarMenus}
                categorias={categorias}
                catalogoOpen={catalogoOpen}
                toggleCatalogo={() => setCatalogoOpen(!catalogoOpen)}
                dropdownId="categorias-dropdown-mobile"
                textoVacio="No hay categorías"
              />
          </>
        )}

        {!isAuthenticated ? (
          <>
            <Link to="/registrar-negocio" onClick={cerrarMenus}>Registrar negocio</Link>
            <Link to="/login" onClick={cerrarMenus}>Iniciar Sesión</Link>
            <Link to="/registro" onClick={cerrarMenus}>Registro</Link>
          </>
        ) : rol === "CLIENTE" ? (
          <>
            <Link to="/perfil" onClick={cerrarMenus}>Mi Perfil</Link>
            <Link to="/historial" onClick={cerrarMenus}>Historial/Compras</Link>
            <Link to="/contacto" onClick={cerrarMenus}>Contáctenos/PQRS</Link>
            <Link to="/registrar-negocio" onClick={cerrarMenus}>Registrar negocio</Link>
          </>
        ) : rol === "SUPER_ADMIN" || rol === "ADMINISTRADOR" ? (
          <>
            <Link to="/perfil" onClick={cerrarMenus}>Perfil</Link>
            <Link to="/admin/negocios" onClick={cerrarMenus}>Negocios</Link>
            <Link to="/admin/usuarios" onClick={cerrarMenus}>Usuarios</Link>
            <Link to="/admin/solicitudes" onClick={cerrarMenus}>Solicitudes</Link>
            <Link to="/admin/pqrs" onClick={cerrarMenus}>PQRS</Link>
            <Link to="/ventas" onClick={cerrarMenus}>Reportes</Link>
          </>
        ) : rol === "VENDEDOR" ? (
          <>
            <Link to="/perfil" onClick={cerrarMenus}>Perfil</Link>
            <Link to="/contacto" onClick={cerrarMenus}>Contáctenos/PQRS</Link>
          </>
        ) : null}

        {isAuthenticated && (
          <button
            type="button"
            className="logout"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;