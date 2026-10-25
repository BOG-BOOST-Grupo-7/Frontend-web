import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { buscarProductosYNegociosApi } from "../../api/productoApi";
import "../../styles/ResultadosBusqueda.css";

const ResultadosBusqueda = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const categoriaParam = searchParams.get("categoria") || "";
  const ordenParam = searchParams.get("orden") || "relevancia";
  const precioMinParam = searchParams.get("precioMin") || "";
  const precioMaxParam = searchParams.get("precioMax") || "";

  const [resultados, setResultados] = useState({ productos: [], negocios: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabActiva, setTabActiva] = useState("todo");
  const [paginaProductos, setPaginaProductos] = useState(1);
  const [paginaNegocios, setPaginaNegocios] = useState(1);
  const itemsPorPagina = 12; 

  // Estado local de filtros
  const [filtros, setFiltros] = useState({
    categoria: categoriaParam,
    orden: ordenParam,
    precioMin: precioMinParam,
    precioMax: precioMaxParam,
  });

  // Sincroniza filtros locales si cambia la URL
  useEffect(() => {
    setFiltros({
      categoria: categoriaParam,
      orden: ordenParam,
      precioMin: precioMinParam,
      precioMax: precioMaxParam,
    });
  }, [categoriaParam, ordenParam, precioMinParam, precioMaxParam]);

  useEffect(() => {
    setPaginaProductos(1);
    setPaginaNegocios(1);
  }, [tabActiva, categoriaParam, ordenParam, precioMinParam, precioMaxParam, query]);

  useEffect(() => {
    if (!query.trim()) {
      setResultados({ productos: [], negocios: [] });
      return;
    }

    let cancelado = false;

    const fetchResultados = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await buscarProductosYNegociosApi(query);
        if (!cancelado) setResultados(data);
      } catch (err) {
        console.error("Error en búsqueda:", err);
        if (!cancelado) setError("Error al buscar. Intenta de nuevo.");
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    fetchResultados();

    return () => {
      cancelado = true;
    };
  }, [query]);

  const categoriasDisponibles = useMemo(() => {
    const set = new Set();
    resultados.productos.forEach((p) => {
      if (p.categoria?.nombre_categoria) {
        set.add(p.categoria.nombre_categoria);
      }
    });
    return Array.from(set).sort();
  }, [resultados.productos]);

  // PRODUCTOS FILTRADOS Y ORDENADOS
  const productosFiltrados = useMemo(() => {
    let lista = [...resultados.productos];

    if (filtros.categoria) {
      lista = lista.filter(
        (p) => p.categoria?.nombre_categoria === filtros.categoria
      );
    }

    const min = parseFloat(filtros.precioMin);
    const max = parseFloat(filtros.precioMax);
    if (!isNaN(min)) lista = lista.filter((p) => Number(p.precio) >= min);
    if (!isNaN(max)) lista = lista.filter((p) => Number(p.precio) <= max);

    switch (filtros.orden) {
      case "precio-asc":
        lista.sort((a, b) => Number(a.precio) - Number(b.precio));
        break;
      case "precio-desc":
        lista.sort((a, b) => Number(b.precio) - Number(a.precio));
        break;
      case "nombre-asc":
        lista.sort((a, b) => a.nombre_producto.localeCompare(b.nombre_producto));
        break;
      case "nombre-desc":
        lista.sort((a, b) => b.nombre_producto.localeCompare(a.nombre_producto));
        break;
      default:
        break;
    }

    return lista;
  }, [resultados.productos, filtros]);

  const indexUltimoProducto = paginaProductos * itemsPorPagina;
  const indexPrimerProducto = indexUltimoProducto - itemsPorPagina;
  const productosPaginados = productosFiltrados.slice(indexPrimerProducto, indexUltimoProducto);
  const totalPaginasProductos = Math.ceil(productosFiltrados.length / itemsPorPagina);

  const indexUltimoNegocio = paginaNegocios * itemsPorPagina;
  const indexPrimerNegocio = indexUltimoNegocio - itemsPorPagina;
  const negociosPaginados = resultados.negocios.slice(indexPrimerNegocio, indexUltimoNegocio);
  const totalPaginasNegocios = Math.ceil(resultados.negocios.length / itemsPorPagina);

  const aplicarFiltros = (nuevos) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(nuevos).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    setSearchParams(params);
  };

  const limpiarFiltros = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    setSearchParams(params);
  };

  const hayFiltrosActivos =
    filtros.categoria || filtros.orden !== "relevancia" || filtros.precioMin || filtros.precioMax;

  if (!query.trim()) {
    return (
      <div className="busqueda-page">
        <div className="busqueda-empty">
          <i className="fas fa-search fa-3x"></i>
          <h3>¿Qué estás buscando?</h3>
          <p>Escribe algo en el buscador de arriba para encontrar productos o negocios.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="busqueda-page">
        <div className="busqueda-header">
          <h1>Resultados para <span className="query-highlight">"{query}"</span></h1>
        </div>
        <div className="busqueda-loading">
          <div className="spinner"></div>
          <p>Buscando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="busqueda-page">
        <div className="busqueda-empty">
          <i className="fas fa-exclamation-triangle fa-3x"></i>
          <h3>Ups, algo salió mal</h3>
          <p>{error}</p>
          <button className="btn-reintentar" onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  const totalProductos = productosFiltrados.length;
  const totalNegocios = resultados.negocios.length;
  const totalResultados = totalProductos + totalNegocios;
  const sinResultados = totalResultados === 0;
  const sinProductosPorFiltro = totalProductos === 0 && resultados.productos.length > 0;

  return (
    <div className="busqueda-page">
      {/* HEADER */}
      <div className="busqueda-header">
        <h1>Resultados para <span className="query-highlight">"{query}"</span></h1>
        <p className="busqueda-counter">{totalResultados} resultado(s) encontrado(s)</p>

        {/* TABS */}
        {!sinResultados && (
          <div className="busqueda-tabs">
            <button className={`tab-btn ${tabActiva === "todo" ? "active" : ""}`} onClick={() => setTabActiva("todo")}>
              Todo ({totalResultados})
            </button>
            <button className={`tab-btn ${tabActiva === "productos" ? "active" : ""}`} onClick={() => setTabActiva("productos")} disabled={resultados.productos.length === 0}>
              Productos ({totalProductos})
            </button>
            <button className={`tab-btn ${tabActiva === "negocios" ? "active" : ""}`} onClick={() => setTabActiva("negocios")} disabled={totalNegocios === 0}>
              Negocios ({totalNegocios})
            </button>
          </div>
        )}
      </div>

      {/* LAYOUT CON SIDEBAR DE FILTROS */}
      <div className={`layout-busqueda ${tabActiva === "negocios" ? "sin-filtros" : ""}`}>
        {/* SIDEBAR DE FILTROS */}
        {resultados.productos.length > 0 && tabActiva !== "negocios" && (
          <aside className="sidebar-filtros">
            <div className="filtros-header">
              <h3>Filtros</h3>
              {hayFiltrosActivos && (
                <button className="btn-limpiar" onClick={limpiarFiltros}>Limpiar</button>
              )}
            </div>

            {categoriasDisponibles.length > 0 && (
              <div className="filtro-grupo">
                <label>Categoría</label>
                <select
                  value={filtros.categoria}
                  onChange={(e) => {
                    const nuevos = { ...filtros, categoria: e.target.value };
                    setFiltros(nuevos);
                    aplicarFiltros(nuevos);
                  }}
                >
                  <option value="">Todas</option>
                  {categoriasDisponibles.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="filtro-grupo">
              <label>Rango de precio</label>
              <div className="filtro-precio">
                <input type="number" placeholder="Mín" min="0" value={filtros.precioMin} onChange={(e) => setFiltros({ ...filtros, precioMin: e.target.value })} onBlur={() => aplicarFiltros(filtros)} />
                <span>—</span>
                <input type="number" placeholder="Máx" min="0" value={filtros.precioMax} onChange={(e) => setFiltros({ ...filtros, precioMax: e.target.value })} onBlur={() => aplicarFiltros(filtros)} />
              </div>
            </div>

            <div className="filtro-grupo">
              <label>Ordenar por</label>
              <select
                value={filtros.orden}
                onChange={(e) => {
                  const nuevos = { ...filtros, orden: e.target.value };
                  setFiltros(nuevos);
                  aplicarFiltros(nuevos);
                }}
              >
                <option value="relevancia">Relevancia</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre-asc">Nombre: A → Z</option>
                <option value="nombre-desc">Nombre: Z → A</option>
              </select>
            </div>
          </aside>
        )}

        {/* CONTENIDO */}
        <div className="contenido-busqueda">
          {/* SIN RESULTADOS */}
          {sinResultados && (
            <div className="busqueda-empty">
              <i className="fas fa-box-open fa-3x"></i>
              <h3>Sin resultados</h3>
              <p>No encontramos nada para "<strong>{query}</strong>".</p>
            </div>
          )}

          {/* SIN RESULTADOS POR FILTRO */}
          {sinProductosPorFiltro && tabActiva !== "negocios" && (
            <div className="busqueda-empty">
              <i className="fas fa-filter fa-3x"></i>
              <h3>Ningún producto coincide con los filtros</h3>
              <p>Sí encontramos {resultados.productos.length} producto(s), pero ninguno pasa los filtros aplicados.</p>
              <button className="btn-reintentar" onClick={limpiarFiltros}>Limpiar filtros</button>
            </div>
          )}

          {/* PRODUCTOS */}
          {totalProductos > 0 && tabActiva !== "negocios" && (
            <section className="seccion-resultados">
              <div className="seccion-titulo-wrapper">
                <h2>Productos</h2>
                <span className="badge-count">{totalProductos}</span>
              </div>

              <div className="grid-productos-pro">
                {productosPaginados.map((p) => (
                  <Link key={p.id_producto} to={`/producto/${p.id_producto}`} className="producto-card-pro">
                    <div className="producto-img-wrapper">
                      {p.imagen ? (
                        <img src={p.imagen} alt={p.nombre_producto} />
                      ) : (
                        <div className="producto-img-placeholder"><i className="fas fa-image"></i></div>
                      )}
                    </div>
                    <div className="producto-info">
                      {p.categoria?.nombre_categoria && (
                        <span className="categoria-tag">{p.categoria.nombre_categoria}</span>
                      )}
                      <h3>{p.nombre_producto}</h3>
                      {p.descripcion && (
                        <p className="producto-desc">
                          {p.descripcion.length > 70 ? p.descripcion.slice(0, 70) + "..." : p.descripcion}
                        </p>
                      )}
                      <p className="producto-precio">${p.precio}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* PAGINACIÓN PRODUCTOS */}
              {totalPaginasProductos > 1 && (
                <div className="paginacion-container">
                  <button 
                    className="pag-btn" 
                    disabled={paginaProductos === 1} 
                    onClick={() => setPaginaProductos(paginaProductos - 1)}
                  >
                    Anterior
                  </button>
                  <span className="pag-info">Página {paginaProductos} de {totalPaginasProductos}</span>
                  <button 
                    className="pag-btn" 
                    disabled={paginaProductos === totalPaginasProductos} 
                    onClick={() => setPaginaProductos(paginaProductos + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </section>
          )}

          {/* NEGOCIOS */}
          {totalNegocios > 0 && tabActiva !== "productos" && (
            <section className="seccion-resultados">
              <div className="seccion-titulo-wrapper">
                <h2>Negocios</h2>
                <span className="badge-count">{totalNegocios}</span>
              </div>

              <div className="grid-negocios-pro">
                {negociosPaginados.map((n) => (
                  <Link key={n.id_negocio} to={`/negocios/${n.id_negocio}`} className="negocio-card-pro">
                    <div className="negocio-logo-container">
                      {n.logo ? (
                        <img src={n.logo} alt={n.nombre_negocio} />
                      ) : (
                        <div className="negocio-logo-placeholder"><i className="fas fa-store"></i></div>
                      )}
                    </div>
                    <div className="negocio-info">
                      <h3>{n.nombre_negocio}</h3>
                      {n.descripcion_negocio && <p>{n.descripcion_negocio}</p>}
                      <span className="visitar-link">Visitar <i className="fas fa-arrow-right"></i></span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* PAGINACIÓN NEGOCIOS */}
              {totalPaginasNegocios > 1 && (
                <div className="paginacion-container">
                  <button 
                    className="pag-btn" 
                    disabled={paginaNegocios === 1} 
                    onClick={() => setPaginaNegocios(paginaNegocios - 1)}
                  >
                    Anterior
                  </button>
                  <span className="pag-info">Página {paginaNegocios} de {totalPaginasNegocios}</span>
                  <button 
                    className="pag-btn" 
                    disabled={paginaNegocios === totalPaginasNegocios} 
                    onClick={() => setPaginaNegocios(paginaNegocios + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResultadosBusqueda;