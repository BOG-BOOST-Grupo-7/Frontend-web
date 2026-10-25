import { useEffect, useMemo, useState } from "react";
import {
  FaBoxes,
  FaArrowDown,
  FaArrowUp,
  FaFilter,
  FaListAlt,
  FaBoxOpen,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaUndo,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

import { listarMovimientos, getNegocioUsuario } from "../../api/movimientoStockApi";
import { obtenerMisProductos, eliminarProducto } from "../../api/productoApi";
import ModalProductos from "../../components/negocio/ModalProductos";

import "../../styles/MovimientoStock.css";

function AdminMovimientoStock() {
  // Estados generales
  const [id_negocio, setIdNegocio] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Estado para alternar la vista activa: "movimientos" o "productos"
  const [vistaActiva, setVistaActiva] = useState("movimientos");

  // ================= ESTADOS DE FILTROS Y BÚSQUEDA =================
  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");

  // ================= ESTADOS DE PAGINACIÓN =================
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 8;

  // Estados para Movimientos
  const [movimientos, setMovimientos] = useState([]);

  // Estados para Productos (en tabla)
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);

  // Estado para controlar el Modal de Productos (Crear / Editar)
  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);

  // ==========================
  // Inicialización de Negocio
  // ==========================
  useEffect(() => {
    const inicializar = async () => {
      try {
        const perfil = JSON.parse(localStorage.getItem("perfil") || "{}");
        if (perfil.id_perfil) {
          const { data } = await getNegocioUsuario(perfil.id_perfil);
          setIdNegocio(data.id_negocio);
        } else {
          setIdNegocio(10);
        }
      } catch (error) {
        console.error("Error obteniendo negocio:", error);
        setIdNegocio(10);
      }
    };
    inicializar();
  }, []);

  // ==========================
  // Cargar Movimientos
  // ==========================
  const cargarMovimientos = async () => {
    if (!id_negocio) return;
    try {
      setCargando(true);
      const { data } = await listarMovimientos(id_negocio);
      setMovimientos(data);
    } catch (error) {
      console.error(error);
      alert("No fue posible cargar los movimientos.");
    } finally {
      setCargando(false);
    }
  };

  // ==========================
  // Cargar Productos (Tabla)
  // ==========================
  const cargarProductosTabla = async () => {
    try {
      setCargandoProductos(true);
      const data = await obtenerMisProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setCargandoProductos(false);
    }
  };

  useEffect(() => {
    if (id_negocio) {
      cargarMovimientos();
      cargarProductosTabla();
    }
  }, [id_negocio]);

  useEffect(() => {
    setPaginaActual(1);
  }, [vistaActiva, tipoFiltro, busqueda]);

  // ==========================
  // Filtrado y Paginación: Movimientos
  // ==========================
  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((mov) => {
      const cumpleTipo = tipoFiltro === "TODOS" || mov.tipo_movimiento === tipoFiltro;
      const textoBusqueda = busqueda.toLowerCase();
      const nombreProd = (mov.producto?.nombre_producto || "").toLowerCase();
      const motivoMov = (mov.motivo || "").toLowerCase();

      const cumpleBusqueda =
        textoBusqueda === "" ||
        nombreProd.includes(textoBusqueda) ||
        motivoMov.includes(textoBusqueda);

      return cumpleTipo && cumpleBusqueda;
    });
  }, [movimientos, tipoFiltro, busqueda]);

  const totalPaginasMovimientos = Math.ceil(movimientosFiltrados.length / filasPorPagina) || 1;

  const movimientosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * filasPorPagina;
    return movimientosFiltrados.slice(inicio, inicio + filasPorPagina);
  }, [movimientosFiltrados, paginaActual, filasPorPagina]);

  // ==========================
  // Filtrado y Paginación: Productos
  // ==========================
  const productosFiltrados = useMemo(() => {
    return productos.filter((prod) => {
      const textoBusqueda = busqueda.toLowerCase();
      const nombreProd = (prod.nombre_producto || "").toLowerCase();
      const categoriaProd = (prod.categoria?.nombre_categoria || "").toLowerCase();

      return (
        textoBusqueda === "" ||
        nombreProd.includes(textoBusqueda) ||
        categoriaProd.includes(textoBusqueda)
      );
    });
  }, [productos, busqueda]);

  const totalPaginasProductos = Math.ceil(productosFiltrados.length / filasPorPagina) || 1;

  const productosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * filasPorPagina;
    return productosFiltrados.slice(inicio, inicio + filasPorPagina);
  }, [productosFiltrados, paginaActual, filasPorPagina]);

  const totalPaginasActual = vistaActiva === "movimientos" ? totalPaginasMovimientos : totalPaginasProductos;
  const elementosFiltradosActual = vistaActiva === "movimientos" ? movimientosFiltrados : productosFiltrados;

  // Resumen general
  const total = movimientos.length;
  const entradas = movimientos.filter((m) => m.tipo_movimiento === "ENTRADA").length;
  const salidas = movimientos.filter((m) => m.tipo_movimiento === "SALIDA").length;

  const obtenerClaseTipo = (tipo) => {
    switch (tipo) {
      case "ENTRADA": return "movimiento-badge entrada";
      case "SALIDA": return "movimiento-badge salida";
      default: return "movimiento-badge ajuste";
    }
  };

  const limpiarFiltros = () => {
    setTipoFiltro("TODOS");
    setBusqueda("");
  };

  const abrirModalCrear = () => {
    setProductoAEditar(null);
    setModalProductosAbierto(true);
  };

  const abrirModalEditar = (producto) => {
    setProductoAEditar(producto);
    setModalProductosAbierto(true);
  };

  const manejarEliminarProducto = async (id_producto) => {
    const confirmar = window.confirm(
      "¿Estás seguro de eliminar este producto?\n\n" +
      "• Si el producto NO tiene ventas, se eliminará.\n" +
      "• Si el producto YA tiene ventas, se marcará como INACTIVO y desaparecerá del catálogo, pero su historial de ventas se conservará."
    );

    if (!confirmar) return;

    try {
      const respuesta = await eliminarProducto(id_producto);
      alert(respuesta.mensaje);
      cargarProductosTabla();
      cargarMovimientos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert(error.response?.data?.mensaje || "No se pudo procesar la solicitud.");
    }
  };

  return (
    <div className="movimientos-container">
      <div className="lista-movimientos">
        <h1 className="titulo-movimientos">Gestión de Inventario y Stock</h1>

        {/* Resumen de Tarjetas */}
        <div className="movimientos-summary">
          <div className="summary-card">
            <FaBoxes />
            <span>Total Movimientos<strong>{total}</strong></span>
          </div>
          <div className="summary-card">
            <FaArrowDown />
            <span>Entradas<strong>{entradas}</strong></span>
          </div>
          <div className="summary-card">
            <FaArrowUp />
            <span>Salidas<strong>{salidas}</strong></span>
          </div>
        </div>

        {/* Barra de Pestañas / Botones Principales */}
        <div className="action-bar-tabs">
          <div className="tabs-group">
            <button
              className={`btn-side ${vistaActiva === "movimientos" ? "active" : ""}`}
              onClick={() => setVistaActiva("movimientos")}
            >
              <FaListAlt /> Ver Movimientos
            </button>
            <button
              className={`btn-side ${vistaActiva === "productos" ? "active" : ""}`}
              onClick={() => setVistaActiva("productos")}
            >
              <FaBoxOpen /> Ver Productos (Inventario)
            </button>
          </div>

          {vistaActiva === "productos" && (
            <button className="btn-green btn-nuevo-prod-corto" onClick={abrirModalCrear}>
              <FaPlus /> Nuevo Producto
            </button>
          )}
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="action-bar">
          <div className="search-group">
            <FaSearch />
            <input
              type="text"
              className="usuarios-input"
              placeholder={
                vistaActiva === "movimientos"
                  ? "Buscar por producto o motivo..."
                  : "Buscar por nombre de producto o categoría..."
              }
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filter-group">
            {vistaActiva === "movimientos" && (
              <>
                <FaFilter />
                <label>Tipo:</label>
                <select
                  className="filter-select usuarios-select"
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value)}
                >
                  <option value="TODOS">Todos</option>
                  <option value="ENTRADA">Entradas</option>
                  <option value="SALIDA">Salidas</option>
                </select>
              </>
            )}

            <button className="btn-orange btn-with-icon" onClick={limpiarFiltros}>
              <FaUndo /> Limpiar
            </button>
          </div>
        </div>

        {/* Tablas según Vista Activa */}
        {vistaActiva === "movimientos" ? (
          <div className="table-container">
            <table className="movimientos-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Motivo</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan="5" className="sin-datos">Cargando movimientos...</td></tr>
                ) : movimientosPaginados.length === 0 ? (
                  <tr><td colSpan="5" className="sin-datos">No hay movimientos registrados con esos filtros.</td></tr>
                ) : (
                  movimientosPaginados.map((movimiento) => (
                    <tr key={movimiento.id_movimiento}>
                      <td>
                        <div className="nombre-producto">
                          <strong>{movimiento.producto?.nombre_producto || "Producto eliminado"}</strong>
                        </div>
                      </td>
                      <td>
                        <span className={obtenerClaseTipo(movimiento.tipo_movimiento)}>
                          {movimiento.tipo_movimiento}
                        </span>
                      </td>
                      <td>{movimiento.cantidad_productos}</td>
                      <td>{movimiento.motivo || "Sin motivo"}</td>
                      <td>{new Date(movimiento.fecha_movimiento).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table className="movimientos-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock Actual</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargandoProductos ? (
                  <tr><td colSpan="5" className="sin-datos">Cargando productos...</td></tr>
                ) : productosPaginados.length === 0 ? (
                  <tr><td colSpan="5" className="sin-datos">No hay productos registrados con esos filtros.</td></tr>
                ) : (
                  productosPaginados.map((prod) => (
                    <tr key={prod.id_producto}>
                      <td>
                        <div className="nombre-producto product-cell-info">
                          {prod.imagen && (
                            <img src={prod.imagen} alt="" className="product-thumb" />
                          )}
                          <div>
                            <strong>{prod.nombre_producto}</strong>
                            {/* 👇 ETIQUETA INACTIVO MOVIDA AQUÍ */}
                            {prod.estado_producto === "INACTIVO" && (
                              <span className="badge-inactivo">INACTIVO</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{prod.categoria?.nombre_categoria || "Sin categoría"}</td>
                      <td>
                        {Number(prod.precio).toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP"
                        })}
                      </td>
                      <td>
                        <strong>{prod.stock}</strong> unids.
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="btn-orange btn-icon-action"
                            onClick={() => abrirModalEditar(prod)}
                            title="Editar producto"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-delete btn-icon-action"
                            onClick={() => manejarEliminarProducto(prod.id_producto)}
                            title="Eliminar producto"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Controles de Paginación */}
        {!cargando && !cargandoProductos && elementosFiltradosActual.length > 0 && (
          <div className="pagination-container">
            <span className="pagination-info">
              Mostrando del {(paginaActual - 1) * filasPorPagina + 1} al{" "}
              {Math.min(paginaActual * filasPorPagina, elementosFiltradosActual.length)} de{" "}
              {elementosFiltradosActual.length} {vistaActiva === "movimientos" ? "movimientos" : "productos"}
            </span>
            <div className="pagination-buttons">
              <button
                className="btn-orange"
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
              >
                <FaChevronLeft /> Anterior
              </button>
              <span className="pagination-current">
                Página {paginaActual} de {totalPaginasActual}
              </span>
              <button
                className="btn-orange"
                onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginasActual))}
                disabled={paginaActual === totalPaginasActual}
              >
                Siguiente <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      <ModalProductos
        abierto={modalProductosAbierto}
        productoAEditar={productoAEditar}
        onClose={() => {
          setModalProductosAbierto(false);
          setProductoAEditar(null);
          cargarProductosTabla();
          cargarMovimientos();
        }}
        idNegocio={id_negocio}
      />
    </div>
  );
}

export default AdminMovimientoStock;