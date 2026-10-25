import React, { useState, useEffect, useMemo } from "react";
import { listarVentasNegocio } from "../../api/ventaApi";
import { actualizarSeguimientoApi } from "../../api/seguimientoApi";
import ModalComprobante from "../../components/carrito/ModalComprobante";
import { 
  FaShoppingBag, 
  FaClock, 
  FaSyncAlt, 
  FaTruck, 
  FaCheckCircle, 
  FaFilter, 
  FaPhone, 
  FaMapMarkerAlt,
  FaEye,
  FaTimes,
  FaBoxOpen,
  FaReceipt,
  FaUser,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import "../../styles/VentasNegocio.css";
import "../../styles/ModalComprobante.css";

const AdminVentasYSeguimiento = () => {
  const [ventas, setVentas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  
  // Estados para los Modales
  const [modalClienteAbierto, setModalClienteAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const [modalComprobanteAbierto, setModalComprobanteAbierto] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  // Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 5;

  useEffect(() => {
    cargarVentasConSeguimiento();
  }, []);

  // Reiniciar a la página 1 cuando cambia el filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado]);

  const cargarVentasConSeguimiento = async () => {
    try {
      setLoading(true);
      const data = await listarVentasNegocio();
      setVentas(data);
    } catch (error) {
      console.error("Error al cargar las ventas y seguimientos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id_seguimiento, id_venta, nuevoEstado) => {
    const idParaEnviar = id_seguimiento || id_venta;

    if (!idParaEnviar) {
      alert("Error: No se encontró un identificador para este pedido.");
      return;
    }

    try {
      await actualizarSeguimientoApi(idParaEnviar, nuevoEstado);

      setVentas(prevVentas =>
        prevVentas.map(venta => {
          if (venta.id_venta === id_venta) {
            const seguimientoActual = Array.isArray(venta.seguimiento) ? venta.seguimiento[0] : (venta.seguimiento || {});
            return {
              ...venta,
              seguimiento: [{
                ...seguimientoActual,
                estado_seguimiento: nuevoEstado,
                fecha_entrega: nuevoEstado === 'ENTREGADO' ? new Date().toISOString() : seguimientoActual.fecha_entrega
              }]
            };
          }
          return venta;
        })
      );
    } catch (error) {
      console.error("Error al actualizar:", error.response?.data || error.message);
      alert("No se pudo actualizar el estado del pedido.");
    }
  };

  const abrirModalCliente = (venta) => {
    setClienteSeleccionado(venta);
    setModalClienteAbierto(true);
  };

  const cerrarModalCliente = () => {
    setModalClienteAbierto(false);
    setClienteSeleccionado(null);
  };

  const abrirModalComprobante = (venta) => {
    setVentaSeleccionada(venta);
    setModalComprobanteAbierto(true);
  };

  const cerrarModalComprobante = () => {
    setModalComprobanteAbierto(false);
    setVentaSeleccionada(null);
  };

  // Filtrar ventas por el estado de su seguimiento
  const ventasFiltradas = useMemo(() => {
    return ventas.filter((venta) => {
      const estadoSeg = venta.seguimiento?.[0]?.estado_seguimiento || "PENDIENTE";
      if (filtroEstado === "TODOS") return true;
      return estadoSeg.toUpperCase() === filtroEstado.toUpperCase();
    });
  }, [ventas, filtroEstado]);

  // Lógica de Paginación
  const totalPaginas = Math.ceil(ventasFiltradas.length / filasPorPagina) || 1;

  const ventasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * filasPorPagina;
    return ventasFiltradas.slice(inicio, inicio + filasPorPagina);
  }, [ventasFiltradas, paginaActual, filasPorPagina]);

  // Métricas para tarjetas de resumen
  const totalCount = ventas.length;
  const pendientesCount = ventas.filter(v => (v.seguimiento?.[0]?.estado_seguimiento || "PENDIENTE").toUpperCase() === "PENDIENTE").length;
  const preparandoCount = ventas.filter(v => (v.seguimiento?.[0]?.estado_seguimiento || "").toUpperCase() === "PREPARANDO").length;
  const enviadosCount = ventas.filter(v => (v.seguimiento?.[0]?.estado_seguimiento || "").toUpperCase() === "ENVIADO").length;
  const entregadosCount = ventas.filter(v => (v.seguimiento?.[0]?.estado_seguimiento || "").toUpperCase() === "ENTREGADO").length;

  return (
    <div className="movimientos-container">
      <h2 className="titulo-movimientos">Panel de Ventas y Seguimiento de Pedidos</h2>

      {/* Tarjetas Resumen */}
      <div className="movimientos-summary">
        <div className="summary-card">
          <FaShoppingBag />
          <span>Total Ventas<strong>{totalCount}</strong></span>
        </div>
        <div className="summary-card">
          <FaClock className="icon-pendiente" />
          <span>Pendientes<strong>{pendientesCount}</strong></span>
        </div>
        <div className="summary-card">
          <FaSyncAlt className="icon-preparando" />
          <span>Preparando<strong>{preparandoCount}</strong></span>
        </div>
        <div className="summary-card">
          <FaTruck className="icon-enviado" />
          <span>Enviados<strong>{enviadosCount}</strong></span>
        </div>
        <div className="summary-card">
          <FaCheckCircle className="icon-entregado" />
          <span>Entregados<strong>{entregadosCount}</strong></span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="action-bar">
        <div className="filter-group">
          <FaFilter />
          <label htmlFor="filtroEstado">Filtrar estado:</label>
          <select
            id="filtroEstado"
            className="filter-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="PREPARANDO">Preparando</option>
            <option value="ENVIADO">Enviado</option>
            <option value="ENTREGADO">Entregado</option>
          </select>
        </div>
      </div>

      {/* Tabla Unificada */}
      <div className="table-container">
        {loading ? (
          <div className="sin-datos">Cargando ventas y seguimientos...</div>
        ) : ventasFiltradas.length === 0 ? (
          <div className="sin-datos">No se encontraron ventas registradas.</div>
        ) : (
          <table className="movimientos-table">
            <thead>
              <tr>
                <th>Venta #</th>
                <th>Cliente</th>
                <th>Producto(s) / Detalle</th>
                <th>Total</th>
                <th>Estado Actual</th>
                <th>Acción / Cambiar Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ventasPaginadas.map((venta) => {
                const seguimiento = venta.seguimiento?.[0] || {};
                const estadoActual = (seguimiento.estado_seguimiento || "PENDIENTE").toUpperCase();
                
                const detalles = venta.detalle_venta || venta.detalles || venta.items || [];
                const productosTexto = detalles.length > 0 
                  ? detalles.map(d => `${d.cantidad || 1}x ${d.producto?.nombre_producto || d.nombre_producto || "Producto"}`).join(", ")
                  : venta.producto || "Ver comprobante";

                return (
                  <tr key={venta.id_venta}>
                    <td>
                      <strong>#{venta.id_venta}</strong>
                    </td>
                    <td className="text-center">
                      <button 
                        className="btn-icono-ojo" 
                        onClick={() => abrirModalCliente(venta)}
                        title="Ver información del cliente"
                      >
                        <FaEye />
                      </button>
                    </td>
                    <td>
                      <div className="nombre-producto-wrapper">
                        <small className="productos-text-ellipsis">
                          <FaBoxOpen /> {productosTexto}
                        </small>
                        <button 
                          className="btn-ver-comprobante-tabla"
                          onClick={() => abrirModalComprobante(venta)}
                          title="Ver detalle completo"
                        >
                          <FaReceipt /> Ver
                        </button>
                      </div>
                    </td>
                    <td>
                      <strong>{Number(venta.total || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" })}</strong>
                    </td>
                    <td>
                      <span className={`movimiento-badge ${estadoActual.toLowerCase()}`}>
                        {estadoActual}
                      </span>
                    </td>
                    <td>
                      <select
                        className="filter-select"
                        value={estadoActual}
                        onChange={(e) => handleCambiarEstado(seguimiento.id_seguimiento, venta.id_venta, e.target.value)}
                      >
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="PREPARANDO">PREPARANDO</option>
                        <option value="ENVIADO">ENVIADO</option>
                        <option value="ENTREGADO">ENTREGADO</option>
                      </select>
                    </td>
                    <td>
                      <small>{new Date(venta.fecha_venta).toLocaleString()}</small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Controles de Paginación */}
      {!loading && ventasFiltradas.length > 0 && (
        <div className="pagination-container">
          <span className="pagination-info">
            Mostrando del {(paginaActual - 1) * filasPorPagina + 1} al{" "}
            {Math.min(paginaActual * filasPorPagina, ventasFiltradas.length)}{" "}
            de {ventasFiltradas.length} ventas
          </span>
          <div className="pagination-buttons">
            <button
              className="btn-orange btn-paginacion"
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
            >
              <FaChevronLeft /> Anterior
            </button>
            <span className="pagination-pages-text">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              className="btn-orange btn-paginacion"
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Información del Cliente */}
      {modalClienteAbierto && clienteSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModalCliente}>
          <div 
            className="modal-content negocio-modal" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Modal */}
            <div className="modal-cliente-header">
              <div className="modal-cliente-titulo-group">
                <div className="modal-cliente-avatar">
                  <FaUser />
                </div>
                <div>
                  <h3>Información del Cliente</h3>
                  <small>Detalles de contacto y entrega</small>
                </div>
              </div>
              <button 
                onClick={cerrarModalCliente}
                className="modal-close-btn"
                title="Cerrar"
              >
                <FaTimes />
              </button>
            </div>

            {/* Contenido / Tarjetas de información */}
            <div className="modal-cliente-body">
              <div className="info-card info-card-blue">
                <h4>
                  <FaUser /> Nombre Completo
                </h4>
                <p>
                  {clienteSeleccionado.perfil 
                    ? `${clienteSeleccionado.perfil.primer_nombre || ""} ${clienteSeleccionado.perfil.segundo_nombre || ""} ${clienteSeleccionado.perfil.primer_apellido || ""} ${clienteSeleccionado.perfil.segundo_apellido || ""}`.replace(/\s+/g, ' ').trim()
                    : "Cliente Anónimo / No registrado"}
                </p>
              </div>

              <div className="info-card info-card-green">
                <h4>
                  <FaPhone /> Teléfono / Contacto
                </h4>
                <p>
                  {clienteSeleccionado.telefono || "No especificado"}
                </p>
              </div>

              <div className="info-card info-card-purple">
                <h4>
                  <FaMapMarkerAlt /> Dirección de Envío
                </h4>
                <p>
                  {clienteSeleccionado.direccion || "No especificada"}
                </p>
              </div>
            </div>

            {/* Acciones del Modal */}
            <div className="modal-cliente-footer">
              <button 
                onClick={cerrarModalCliente}
                className="btn-orange btn-cerrar-modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Comprobante */}
      {modalComprobanteAbierto && ventaSeleccionada && (
        <ModalComprobante 
          venta={ventaSeleccionada} 
          onClose={cerrarModalComprobante} 
          esVendedor={true} 
        />
      )}
    </div>
  );
};

export default AdminVentasYSeguimiento;