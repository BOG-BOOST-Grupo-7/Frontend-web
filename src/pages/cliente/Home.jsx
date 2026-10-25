import React, { useEffect, useState, useMemo } from 'react';
import "../../styles/Home.css";
import { Link } from "react-router-dom";
import { FaTruck, FaStar, FaTags, FaBoxOpen } from "react-icons/fa"; 
import RegistrarNegocioCard from "../../components/home/RegistrarNegocioCard";
import ProductCard from "../../components/home/ProductCard";
import { obtenerProductos, obtenerProductosMasVendidos } from "../../api/productoApi";

function Home() {
  const [productos, setProductos] = useState([]);
  const [masVendidosIds, setMasVendidosIds] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState("todos");

  // Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 12; 

  useEffect(() => {
    cargarDatos();
  }, []);

  // Si cambia el filtro, reiniciamos la página a 1
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroActivo]);

  const cargarDatos = async () => {
    try {
      const dataProductos = await obtenerProductos();
      setProductos(dataProductos);
      const dataMasVendidos = await obtenerProductosMasVendidos();
      setMasVendidosIds(dataMasVendidos);
    } catch (error) {
      console.error("Error cargando datos de inicio:", error);
    }
  };

  // Filtramos los productos según la pestaña activa
  const productosFiltrados = useMemo(() => {
    if (filtroActivo === "todos") return productos;
    
    if (filtroActivo === "destacados") {
      return productos
        .filter(p => masVendidosIds.includes(p.id_producto))
        .sort((a, b) => masVendidosIds.indexOf(a.id_producto) - masVendidosIds.indexOf(b.id_producto));
    }
    
    if (filtroActivo === "ofertas") {
      return productos.filter(producto => Number(producto.precio) < 50000);
    }
    
    return productos;
  }, [filtroActivo, productos, masVendidosIds]);

  // Lógica para la paginación
  const indexUltimoProducto = paginaActual * productosPorPagina;
  const indexPrimerProducto = indexUltimoProducto - productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indexPrimerProducto, indexUltimoProducto);
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  // Título dinámico según la pestaña
  const obtenerTitulo = () => {
    if (filtroActivo === "todos") return "Catálogo Completo";
    if (filtroActivo === "destacados") return "Los más vendidos del mercado";
    if (filtroActivo === "ofertas") return "Ofertas y Descuentos";
    return "Catálogo";
  };

  return (
    <div className="container-home">
      <h1 className="view-title">Descubre el Mercado</h1>
      
      {/* AVISO DE COBERTURA */}
      <div className="aviso-cobertura">
        <div className="aviso-icono"><FaTruck /></div>
        <div className="aviso-texto">
          <h4>Cobertura de Entregas y Envíos</h4>
          <p>Actualmente realizamos despachos locales <strong> únicamente en Bogotá</strong>.</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="filtros-home-container">
        <button className={`filtro-btn ${filtroActivo === "todos" ? "activo" : ""}`} onClick={() => setFiltroActivo("todos")}>
          <FaBoxOpen /> Todos los Productos
        </button>
        <button className={`filtro-btn ${filtroActivo === "destacados" ? "activo" : ""}`} onClick={() => setFiltroActivo("destacados")}>
          <FaStar /> Más Vendidos
        </button>
        <button className={`filtro-btn ${filtroActivo === "ofertas" ? "activo" : ""}`} onClick={() => setFiltroActivo("ofertas")}>
          <FaTags /> Ofertas Especiales
        </button>
      </div>

      <div className="main-content">
        <div className="catalogo-column">
          
          {/* CUADRÍCULA CON PAGINACIÓN (Para las 3 pestañas) */}
          <div className="catalogo-completo-container">
            <h2 className="carrusel-title">{obtenerTitulo()}</h2>
            
            {productosPaginados.length === 0 ? (
              <p className="sin-productos">No hay productos disponibles en esta sección por el momento.</p>
            ) : (
              <div className="grid-productos-home">
                {productosPaginados.map((producto) => (
                  <ProductCard key={producto.id_producto} producto={producto} />
                ))}
              </div>
            )}

            {/* Controles de Paginación */}
            {totalPaginas > 1 && (
              <div className="paginacion-container">
                <button 
                  className="pag-btn" 
                  disabled={paginaActual === 1} 
                  onClick={() => setPaginaActual(paginaActual - 1)}
                >
                  Anterior
                </button>
                
                <span className="pag-info">
                  Página {paginaActual} de {totalPaginas}
                </span>
                
                <button 
                  className="pag-btn" 
                  disabled={paginaActual === totalPaginas} 
                  onClick={() => setPaginaActual(paginaActual + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="right-column">
          <div className="tarjeta-mapa">
            <h3>Explora el Mercado</h3>
            <p>Ubica los puestos en nuestro mapa interactivo</p>
            <Link to="/mapa-mercado" className="boton-mapa">Ver Mapa del Mercado</Link>
          </div>
          <RegistrarNegocioCard />
        </div>
      </div>
    </div>
  );
}

export default Home;