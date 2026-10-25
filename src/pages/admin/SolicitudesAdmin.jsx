import "../../styles/SolicitudesAdmin.css";
import { useEffect, useMemo, useState } from "react";

import {
    FaClipboardList,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaEye,
    FaCheck,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaSearch,
} from "react-icons/fa";

import {
    obtenerSolicitudes,
    aprobarSolicitud,
    rechazarSolicitud,
} from "../../api/negocioApi";

function SolicitudesAdmin() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtros
    const [estadoFiltro, setEstadoFiltro] = useState("PENDIENTE");
    const [busqueda, setBusqueda] = useState("");

    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

    // Estados para la paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const filasPorPagina = 5; 

    useEffect(() => {
        cargarSolicitudes();
    }, []);

    // Reiniciar a la página 1 cuando cambia el filtro o la búsqueda
    useEffect(() => {
        setPaginaActual(1);
    }, [estadoFiltro, busqueda]);

    const cargarSolicitudes = async () => {
        try {
            setLoading(true);
            const data = await obtenerSolicitudes();
            setSolicitudes(data);
        } catch (error) {
            console.error(error);
            alert("No fue posible cargar las solicitudes.");
        } finally {
            setLoading(false);
        }
    };

    const aprobar = async (id) => {
        if (!window.confirm("¿Deseas aprobar esta solicitud?")) return;
        try {
            await aprobarSolicitud(id);
            alert("Negocio aprobado correctamente.");
            cerrarModal();
            cargarSolicitudes();
        } catch (error) {
            console.error(error);
            alert("No fue posible aprobar la solicitud.");
        }
    };

    const rechazar = async (id) => {
        const observacion = window.prompt("Escribe el motivo del rechazo:");
        if (!observacion || !observacion.trim()) {
            alert("Debes escribir un motivo del rechazo.");
            return;
        }
        try {
            await rechazarSolicitud(id, observacion.trim());
            alert("Negocio rechazado correctamente.");
            cerrarModal();
            cargarSolicitudes();
        } catch (error) {
            console.error(error);
            alert("No fue posible rechazar.");
        }
    };

    const verDetalles = (solicitud) => {
        setSolicitudSeleccionada(solicitud);
    };

    const cerrarModal = () => {
        setSolicitudSeleccionada(null);
    };

    // LÓGICA DE FILTRADO Y BÚSQUEDA COMBINADA 
    const solicitudesFiltradas = useMemo(() => {
        return solicitudes.filter((s) => {
            // Filtro por estado
            const cumpleEstado = estadoFiltro === "TODOS" || s.estado_negocio === estadoFiltro;
            
            // Filtro por texto (nombre negocio, nombre propietario o correo)
            const texto = busqueda.toLowerCase();
            const nombreNegocio = (s.nombre_negocio || "").toLowerCase();
            const nombrePropietario = `${s.perfil?.primer_nombre || ""} ${s.perfil?.primer_apellido || ""}`.toLowerCase();
            const correo = (s.perfil?.correo || "").toLowerCase();

            const cumpleBusqueda = 
                texto === "" || 
                nombreNegocio.includes(texto) || 
                nombrePropietario.includes(texto) || 
                correo.includes(texto);

            return cumpleEstado && cumpleBusqueda;
        });
    }, [solicitudes, estadoFiltro, busqueda]);

    // Lógica de paginación
    const totalPaginas = Math.ceil(solicitudesFiltradas.length / filasPorPagina) || 1;

    const solicitudesPaginadas = useMemo(() => {
        const inicio = (paginaActual - 1) * filasPorPagina;
        return solicitudesFiltradas.slice(inicio, inicio + filasPorPagina);
    }, [solicitudesFiltradas, paginaActual, filasPorPagina]);

    // Totales para las tarjetas
    const total = solicitudes.length;
    const pendientes = solicitudes.filter((s) => s.estado_negocio === "PENDIENTE").length;
    const aprobadas = solicitudes.filter((s) => s.estado_negocio === "APROBADO").length;
    const rechazadas = solicitudes.filter((s) => s.estado_negocio === "RECHAZADO").length;

    const estadoClass = (estado) => {
        switch (estado) {
            case "PENDIENTE": return "status-badge status-pending";
            case "APROBADO": return "status-badge status-approved";
            case "RECHAZADO": return "status-badge status-rejected";
            default: return "status-badge";
        }
    };

    return (
        <main className="solicitudes-admin">
            <h1 className="view-title">Solicitudes de Negocios</h1>

            {/* ============================
            TARJETAS RESUMEN
            ============================ */}
            <section className="solicitudes-summary">
                <div className="summary-card">
                    <FaClipboardList />
                    <span>Total Solicitudes<strong>{total}</strong></span>
                </div>
                <div className="summary-card">
                    <FaClock />
                    <span>Pendientes<strong>{pendientes}</strong></span>
                </div>
                <div className="summary-card">
                    <FaCheckCircle />
                    <span>Aprobadas<strong>{aprobadas}</strong></span>
                </div>
                <div className="summary-card">
                    <FaTimesCircle />
                    <span>Rechazadas<strong>{rechazadas}</strong></span>
                </div>
            </section>

            {/* ============================
            FILTROS Y BÚSQUEDA
            ============================ */}
            <section className="action-bar">
                <div className="search-group">
                    <FaSearch />
                    <input
                        type="text"
                        className="usuarios-input"
                        placeholder="Buscar negocio o propietario..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>Estado:</label>
                    <select
                        className="usuarios-select"
                        value={estadoFiltro}
                        onChange={(e) => setEstadoFiltro(e.target.value)}
                    >
                        <option value="PENDIENTE">Pendientes</option>
                        <option value="APROBADO">Aprobadas</option>
                        <option value="RECHAZADO">Rechazadas</option>
                        <option value="TODOS">Todos</option>
                    </select>
                </div>
            </section>

            {/* ============================
            TABLA
            ============================ */}
            <div className="table-container">
                <table className="solicitudes-table">
                    <thead>
                        <tr>
                            <th>Negocio</th>
                            <th>Propietario</th>
                            <th>Información</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="sin-datos">Cargando solicitudes...</td>
                            </tr>
                        ) : solicitudesPaginadas.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="sin-datos">No existen solicitudes que coincidan.</td>
                            </tr>
                        ) : (
                            solicitudesPaginadas.map((solicitud) => (
                                <tr key={solicitud.id_negocio}>
                                    <td>
                                        <strong>{solicitud.nombre_negocio}</strong>
                                        <br />
                                        <small>{solicitud.descripcion_negocio}</small>
                                    </td>
                                    <td>
                                        <strong>
                                            {solicitud.perfil?.primer_nombre} {solicitud.perfil?.primer_apellido}
                                        </strong>
                                        <br />
                                        <small>{solicitud.perfil?.correo}</small>
                                    </td>
                                    <td>
                                        <strong>Tel:</strong> {solicitud.telefono_negocio}
                                        <br />
                                        <strong>Puesto:</strong> {solicitud.puesto?.[0]?.numero_puesto || "No asignado"}
                                    </td>
                                    <td>
                                        <span className={estadoClass(solicitud.estado_negocio)}>
                                            {solicitud.estado_negocio}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon view"
                                                title="Ver detalles"
                                                onClick={() => verDetalles(solicitud)}
                                            >
                                                <FaEye />
                                            </button>

                                            {solicitud.estado_negocio === "PENDIENTE" && (
                                                <>
                                                    <button
                                                        className="btn-icon approve"
                                                        title="Aprobar"
                                                        onClick={() => aprobar(solicitud.id_negocio)}
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                    <button
                                                        className="btn-icon reject"
                                                        title="Rechazar"
                                                        onClick={() => rechazar(solicitud.id_negocio)}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ============================
            CONTROLES DE PAGINACIÓN
            ============================ */}
            {!loading && solicitudesFiltradas.length > 0 && (
                <div className="pagination-container">
                    <span className="pagination-info">
                        Mostrando del {(paginaActual - 1) * filasPorPagina + 1} al{" "}
                        {Math.min(paginaActual * filasPorPagina, solicitudesFiltradas.length)} de {solicitudesFiltradas.length} solicitudes
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
                            Página {paginaActual} de {totalPaginas}
                        </span>
                        <button
                            className="btn-orange"
                            onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                            disabled={paginaActual === totalPaginas}
                        >
                            Siguiente <FaChevronRight />
                        </button>
                    </div>
                </div>
            )}

            {/* ============================
            MODAL DETALLES REDISEÑADO
            ============================ */}
            {solicitudSeleccionada && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content negocio-modal" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="modal-header">
                            <div className="modal-logo">
                                {solicitudSeleccionada.logo ? (
                                    <img src={solicitudSeleccionada.logo} alt="Logo" />
                                ) : (
                                    <div className="logo-placeholder">🏪</div>
                                )}
                            </div>
                            <div className="modal-title-info">
                                <h2>{solicitudSeleccionada.nombre_negocio}</h2>
                                <span className={estadoClass(solicitudSeleccionada.estado_negocio)}>
                                    {solicitudSeleccionada.estado_negocio}
                                </span>
                            </div>
                        </div>

                        <div className="modal-grid">
                            <div className="info-section">
                                <h3><i className="fas fa-user"></i> Propietario</h3>
                                <div className="info-card">
                                    <p><strong>Nombre:</strong> {solicitudSeleccionada.perfil?.primer_nombre} {solicitudSeleccionada.perfil?.segundo_nombre} {solicitudSeleccionada.perfil?.primer_apellido}</p>
                                    <p><strong>Correo:</strong> {solicitudSeleccionada.perfil?.correo || "No registrado"}</p>
                                </div>
                            </div>

                            <div className="info-section">
                                <h3><i className="fas fa-store"></i> Negocio</h3>
                                <div className="info-card">
                                    <p><strong>Teléfono:</strong> {solicitudSeleccionada.telefono_negocio}</p>
                                    <p><strong>Puesto:</strong> {solicitudSeleccionada.puesto?.[0]?.numero_puesto || "Sin asignar"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="info-card descripcion-card">
                            <h4><i className="fas fa-align-left"></i> Descripción</h4>
                            <p>{solicitudSeleccionada.descripcion_negocio || "Sin descripción."}</p>
                        </div>

                        {solicitudSeleccionada.observacion_admin && (
                            <div className="info-card observacion-card">
                                <h4><i className="fas fa-exclamation-circle"></i> Observación del Administrador</h4>
                                <p>{solicitudSeleccionada.observacion_admin}</p>
                            </div>
                        )}

                        <div className="modal-actions">
                            {solicitudSeleccionada.estado_negocio === "PENDIENTE" && (
                                <>
                                    <button
                                        className="btn-approve"
                                        onClick={() => aprobar(solicitudSeleccionada.id_negocio)}
                                    >
                                        <FaCheck /> Aprobar
                                    </button>
                                    <button
                                        className="btn-reject"
                                        onClick={() => rechazar(solicitudSeleccionada.id_negocio)}
                                    >
                                        <FaTimes /> Rechazar
                                    </button>
                                </>
                            )}
                            <button className="btn-close" onClick={cerrarModal}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default SolicitudesAdmin;