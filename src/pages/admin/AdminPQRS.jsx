import { useEffect, useMemo, useState } from "react";
import { listarPQRS, responderPQRS } from "../../api/pqrsApi";
import {
  FaInbox,
  FaClock,
  FaCheckCircle,
  FaReply,
  FaUserCircle,
  FaEnvelope,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSearch 
} from "react-icons/fa";
import "../../styles/AdminPQRS.css";

function AdminPQRS() {
  const [pqrs, setPQRS] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState(""); 
  const [respuestas, setRespuestas] = useState({});

  // Estados de Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 8;

  // Cargar PQRS
  const cargarPQRS = async () => {
    try {
      setCargando(true);
      const { data } = await listarPQRS();
      setPQRS(data);
    } catch (error) {
      console.error(error);
      alert("No fue posible cargar las PQRS.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPQRS();
  }, []);

  // Cambiar respuesta localmente
  const cambiarRespuesta = (id, texto) => {
    setRespuestas((prev) => ({ ...prev, [id]: texto }));
  };

  // Guardar respuesta en el servidor
  const guardarRespuesta = async (id) => {
    const respuesta = respuestas[id];
    if (!respuesta?.trim()) {
      alert("Escribe una respuesta.");
      return;
    }

    try {
      await responderPQRS(id, respuesta);
      alert("Respuesta enviada.");
      cargarPQRS();
    } catch (error) {
      console.error(error);
      alert("No fue posible responder.");
    }
  };

  
  const pqrsFiltradas = useMemo(() => {
    return pqrs.filter((item) => {
      // 1. Filtro por estado
      let cumpleEstado = true;
      if (estadoFiltro === "pendiente") cumpleEstado = !item.respuesta_pqrs;
      if (estadoFiltro === "resuelto") cumpleEstado = !!item.respuesta_pqrs;

      // 2. Filtro por texto (Nombre, Correo o Mensaje)
      const texto = busqueda.toLowerCase();
      const nombreCompleto = item.perfil
        ? `${item.perfil.primer_nombre ?? ""} ${item.perfil.segundo_nombre ?? ""} ${item.perfil.primer_apellido ?? ""} ${item.perfil.segundo_apellido ?? ""}`.toLowerCase()
        : "";
      const correo = (item.perfil?.correo || "").toLowerCase();
      const mensaje = (item.mensaje_pqrs || "").toLowerCase();

      const cumpleBusqueda = 
        texto === "" || 
        nombreCompleto.includes(texto) || 
        correo.includes(texto) || 
        mensaje.includes(texto);

      return cumpleEstado && cumpleBusqueda;
    });
  }, [pqrs, estadoFiltro, busqueda]);

  
  useEffect(() => {
    setPaginaActual(1);
  }, [estadoFiltro, busqueda]);

  // Lógica de Paginación
  const totalPaginas = Math.ceil(pqrsFiltradas.length / filasPorPagina) || 1;

  const pqrsPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * filasPorPagina;
    return pqrsFiltradas.slice(inicio, inicio + filasPorPagina);
  }, [pqrsFiltradas, paginaActual, filasPorPagina]);

  // Resumen de datos
  const total = pqrs.length;
  const pendientes = pqrs.filter((item) => !item.respuesta_pqrs).length;
  const resueltos = pqrs.filter((item) => item.respuesta_pqrs).length;

  return (
    <div className="admin-pqrs">

      {/* Tarjetas de Resumen */}
      <div className="admin-pqrs-summary">
        <div className="admin-pqrs-card">
          <FaInbox />
          <span>Total <strong>{total}</strong></span>
        </div>
        <div className="admin-pqrs-card">
          <FaClock />
          <span>Pendientes <strong>{pendientes}</strong></span>
        </div>
        <div className="admin-pqrs-card">
          <FaCheckCircle />
          <span>Resueltas <strong>{resueltos}</strong></span>
        </div>
      </div>

      {/* BARRA SUPERIOR CON BUSCADOR Y FILTRO */}
      <div className="action-bar">
        <div className="search-group">
          <FaSearch />
          <input
            type="text"
            className="usuarios-input"
            placeholder="Buscar por cliente o mensaje..."
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
            <option value="todos">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="resuelto">Resueltas</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="admin-pqrs-table-container">
        <table className="admin-pqrs-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Mensaje</th>
              <th>Respuesta</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan="6" className="admin-pqrs-loading">
                  Cargando...
                </td>
              </tr>
            ) : pqrsPaginadas.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-pqrs-loading">
                  No existen PQRS que coincidan.
                </td>
              </tr>
            ) : (
              pqrsPaginadas.map((item) => {
                const nombreCompleto = item.perfil
                  ? `${item.perfil.primer_nombre ?? ""} ${item.perfil.segundo_nombre ?? ""} ${item.perfil.primer_apellido ?? ""} ${item.perfil.segundo_apellido ?? ""}`.trim()
                  : "Sin información";

                return (
                  <tr key={item.id_pqrs}>
                    {/* Cliente */}
                    <td>
                      <div className="cliente-info">
                        <FaUserCircle />
                        <div>
                          <strong>{nombreCompleto}</strong>
                          <small>{item.perfil?.correo}</small>
                        </div>
                      </div>
                    </td>

                    {/* Mensaje */}
                    <td>
                      <div className="mensaje-box">
                        <FaEnvelope />
                        <p>{item.mensaje_pqrs}</p>
                      </div>
                    </td>

                    {/* Respuesta */}
                    <td>
                      <textarea
                        className="admin-pqrs-textarea"
                        value={respuestas[item.id_pqrs] ?? item.respuesta_pqrs ?? ""}
                        onChange={(e) => cambiarRespuesta(item.id_pqrs, e.target.value)}
                      />
                    </td>

                    {/* Fecha */}
                    <td>
                      <div className="fecha-box">
                        <FaCalendarAlt />
                        {new Date(item.fecha_pqrs).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Estado */}
                    <td>
                      {item.respuesta_pqrs ? (
                        <span className="admin-pqrs-status-resolved">Resuelta</span>
                      ) : (
                        <span className="admin-pqrs-status-pending">Pendiente</span>
                      )}
                    </td>

                    {/* Botón de Acción */}
                    <td>
                      <button
                        className="admin-pqrs-btn"
                        onClick={() => guardarRespuesta(item.id_pqrs)}
                      >
                        <FaReply /> Responder
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación */}
      {!cargando && pqrsFiltradas.length > 0 && (
        <div className="pagination-container">
          <span className="pagination-info">
            Mostrando del {(paginaActual - 1) * filasPorPagina + 1} al{" "}
            {Math.min(paginaActual * filasPorPagina, pqrsFiltradas.length)} de {pqrsFiltradas.length} PQRS
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
    </div>
  );
}

export default AdminPQRS;