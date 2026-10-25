import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    FaUsers,
    FaUserCheck,
    FaUserSlash,
    FaUserShield,
    FaEye,
    FaUndo,
    FaSearch,
    FaUserTie,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";

import "../../styles/ListaUsuariosAdmin.css";

import {
    obtenerPerfiles,
    obtenerPerfilPorId,
} from "../../api/perfilApi";

import {
    obtenerRoles,
    cambiarRolUsuario,
} from "../../api/rolApi";

export default function ListaUsuariosAdmin() {
    //  Extraemos el rol del usuario logueado para saber quién está mirando
    const { rol: rolLogueado } = useAuth(); 
    const esSuperAdmin = rolLogueado === "SUPER_ADMIN";

    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);

    const [rolesSeleccionados, setRolesSeleccionados] = useState({});
    const [loading, setLoading] = useState(true);

    // ================= ESTADOS DE FILTROS =================
    const [estadoFiltro, setEstadoFiltro] = useState("todos");
    const [rolFiltro, setRolFiltro] = useState("todos");
    const [busqueda, setBusqueda] = useState("");

    // ================= ESTADOS DE PAGINACIÓN =================
    const [paginaActual, setPaginaActual] = useState(1);
    const filasPorPagina = 8;

    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    useEffect(() => {
        cargarUsuarios();
        cargarRoles();
    }, []);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const data = await obtenerPerfiles();
            setUsuarios(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const cargarRoles = async () => {
        try {
            const data = await obtenerRoles();
            setRoles(data);
        } catch (error) {
            console.error(error);
        }
    };

    const nombreCompleto = (usuario) => {
        return [
            usuario.primer_nombre,
            usuario.segundo_nombre,
            usuario.primer_apellido,
            usuario.segundo_apellido,
        ]
            .filter(Boolean)
            .join(" ");
    };

    const usuariosFiltrados = useMemo(() => {
        return usuarios.filter((usuario) => {
            const cumpleEstado = estadoFiltro === "todos" || usuario.estado_usuario === estadoFiltro;
            const cumpleRol = rolFiltro === "todos" || String(usuario.rol?.id_rol) === String(rolFiltro);

            const textoBusqueda = busqueda.toLowerCase();
            const nombre = nombreCompleto(usuario).toLowerCase();
            const correo = (usuario.email || "").toLowerCase();

            const cumpleBusqueda =
                textoBusqueda === "" ||
                nombre.includes(textoBusqueda) ||
                correo.includes(textoBusqueda);

            return cumpleEstado && cumpleRol && cumpleBusqueda;
        });
    }, [usuarios, estadoFiltro, rolFiltro, busqueda]);

    useEffect(() => {
        setPaginaActual(1);
    }, [estadoFiltro, rolFiltro, busqueda]);

    const totalPaginas = Math.ceil(usuariosFiltrados.length / filasPorPagina) || 1;

    const usuariosPaginados = useMemo(() => {
        const inicio = (paginaActual - 1) * filasPorPagina;
        return usuariosFiltrados.slice(inicio, inicio + filasPorPagina);
    }, [usuariosFiltrados, paginaActual, filasPorPagina]);

    const totalClientes = usuariosFiltrados.filter((u) => u.rol?.nombre_rol === "CLIENTE").length;
    const totalVendedores = usuariosFiltrados.filter((u) => u.rol?.nombre_rol === "VENDEDOR").length;
    const totalAdministradores = usuariosFiltrados.filter((u) => u.rol?.nombre_rol === "ADMINISTRADOR").length;
    const totalActivos = usuariosFiltrados.filter((u) => u.estado_usuario === "ACTIVO").length;
    const totalInactivos = usuariosFiltrados.filter((u) => u.estado_usuario === "INACTIVO").length;

    const verDetalles = async (id) => {
        try {
            const data = await obtenerPerfilPorId(id);
            setUsuarioSeleccionado(data);
            setMostrarModal(true);
        } catch (error) {
            console.error(error);
            alert("No fue posible obtener la información del usuario.");
        }
    };

    const cambiarRol = async (usuario) => {
        // Protección extra en el frontend por si acaso
        if (!esSuperAdmin) return; 

        const id_rol = rolesSeleccionados[usuario.id_perfil] ?? usuario.rol?.id_rol;

        if (!id_rol) {
            alert("No hay un rol válido para asignar.");
            return;
        }

        if (id_rol === usuario.rol?.id_rol) {
            alert("El usuario ya tiene este rol asignado.");
            return;
        }

        try {
            await cambiarRolUsuario({
                id_perfil: usuario.id_perfil,
                id_rol,
            });
            alert("Rol actualizado correctamente.");

            const nuevosRoles = { ...rolesSeleccionados };
            delete nuevosRoles[usuario.id_perfil];
            setRolesSeleccionados(nuevosRoles);

            cargarUsuarios();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.mensaje || "No fue posible actualizar el rol.");
        }
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setUsuarioSeleccionado(null);
    };

    const claseEstado = (estado) => {
        return estado === "ACTIVO" ? "status-active" : "status-inactive";
    };

    const limpiarFiltros = () => {
        setEstadoFiltro("todos");
        setRolFiltro("todos");
        setBusqueda("");
    };

    return (
        <div className="usuarios-admin-container">
            <h1 className="view-title">Lista de Usuarios</h1>

            {/* ======== RESUMEN ======== */}
            <div className="usuarios-summary">
                <div className="summary-card">
                    <FaUsers style={{ color: "#2196f3" }} />
                    <span>Clientes<strong>{totalClientes}</strong></span>
                </div>
                <div className="summary-card">
                    <FaUserTie style={{ color: "#9c27b0" }} />
                    <span>Vendedores<strong>{totalVendedores}</strong></span>
                </div>
                <div className="summary-card">
                    <FaUserShield style={{ color: "#ff9800" }} />
                    <span>Administradores<strong>{totalAdministradores}</strong></span>
                </div>
                <div className="summary-card">
                    <FaUserCheck style={{ color: "#4CAF50" }} />
                    <span>Activos<strong>{totalActivos}</strong></span>
                </div>
                <div className="summary-card">
                    <FaUserSlash style={{ color: "#F44336" }} />
                    <span>Inactivos<strong>{totalInactivos}</strong></span>
                </div>
            </div>

            {/* ======== FILTROS Y BÚSQUEDA ======== */}
            <div className="action-bar">
                <div className="search-group">
                    <FaSearch />
                    <input
                        type="text"
                        className="usuarios-input"
                        placeholder="Buscar por nombre o correo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>Rol:</label>
                    <select
                        className="usuarios-select"
                        value={rolFiltro}
                        onChange={(e) => setRolFiltro(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        {roles.map((rol) => (
                            <option key={rol.id_rol} value={rol.id_rol}>
                                {rol.nombre_rol}
                            </option>
                        ))}
                    </select>

                    <label>Estado:</label>
                    <select
                        className="usuarios-select"
                        value={estadoFiltro}
                        onChange={(e) => setEstadoFiltro(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        <option value="ACTIVO">Activos</option>
                        <option value="INACTIVO">Inactivos</option>
                    </select>

                    <button className="btn-orange" onClick={limpiarFiltros}>
                        <FaUndo /> Limpiar
                    </button>
                </div>
            </div>

            {/* ======== TABLA ======== */}
            <div className="table-container">
                <table className="usuarios-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="sin-datos">Cargando usuarios...</td>
                            </tr>
                        ) : usuariosPaginados.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="sin-datos">No se encontraron usuarios con esos filtros.</td>
                            </tr>
                        ) : (
                            usuariosPaginados.map((usuario) => (
                                <tr key={usuario.id_perfil}>
                                    <td>{nombreCompleto(usuario)}</td>
                                    <td>{usuario.email}</td>
                                    <td>
                                        {/* LÓGICA DE PERMISOS AQUÍ */}
                                        {esSuperAdmin ? (
                                            <select
                                                className="usuarios-select"
                                                value={rolesSeleccionados[usuario.id_perfil] ?? usuario.rol.id_rol}
                                                onChange={(e) =>
                                                    setRolesSeleccionados({
                                                        ...rolesSeleccionados,
                                                        [usuario.id_perfil]: Number(e.target.value),
                                                    })
                                                }
                                            >
                                                {roles.map((rol) => (
                                                    <option key={rol.id_rol} value={rol.id_rol}>
                                                        {rol.nombre_rol}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="field-text">
                                                {usuario.rol?.nombre_rol || "Sin rol"}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${claseEstado(usuario.estado_usuario)}`}>
                                            {usuario.estado_usuario}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon view"
                                                title="Ver detalles"
                                                onClick={() => verDetalles(usuario.id_perfil)}
                                            >
                                                <FaEye />
                                            </button>
                                            
                                            {/* SOLO EL SUPER ADMIN VE EL BOTÓN GUARDAR */}
                                            {esSuperAdmin && (
                                                <button
                                                    className="btn-guardar"
                                                    title="Guardar rol"
                                                    onClick={() => cambiarRol(usuario)}
                                                >
                                                    Guardar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ======== CONTROLES DE PAGINACIÓN ======== */}
            {!loading && usuariosFiltrados.length > 0 && (
                <div className="pagination-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", padding: "0.5rem 1rem" }}>
                    <span className="pagination-info" style={{ fontSize: "0.9rem", color: "#666" }}>
                        Mostrando del {(paginaActual - 1) * filasPorPagina + 1} al{" "}
                        {Math.min(paginaActual * filasPorPagina, usuariosFiltrados.length)} de{" "}
                        {usuariosFiltrados.length} usuarios
                    </span>
                    <div className="pagination-buttons" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <button
                            className="btn-orange"
                            onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                            disabled={paginaActual === 1}
                            style={{ opacity: paginaActual === 1 ? 0.5 : 1, cursor: paginaActual === 1 ? "not-allowed" : "pointer" }}
                        >
                            <FaChevronLeft /> Anterior
                        </button>
                        <span style={{ margin: "0 0.5rem", fontWeight: "bold" }}>
                            Página {paginaActual} de {totalPaginas}
                        </span>
                        <button
                            className="btn-orange"
                            onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                            disabled={paginaActual === totalPaginas}
                            style={{ opacity: paginaActual === totalPaginas ? 0.5 : 1, cursor: paginaActual === totalPaginas ? "not-allowed" : "pointer" }}
                        >
                            Siguiente <FaChevronRight />
                        </button>
                    </div>
                </div>
            )}

            {/* ================= MODAL DETALLES ================= */}
            {mostrarModal && usuarioSeleccionado && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detalles del Usuario</h2>
                            <button className="modal-close" onClick={cerrarModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detalle-item">
                                <span className="detalle-label">Nombre</span>
                                <span className="detalle-valor">{nombreCompleto(usuarioSeleccionado)}</span>
                            </div>
                            <div className="detalle-item">
                                <span className="detalle-label">Correo</span>
                                <span className="detalle-valor">{usuarioSeleccionado.email}</span>
                            </div>
                            <div className="detalle-item">
                                <span className="detalle-label">Rol</span>
                                <span className="detalle-valor">{usuarioSeleccionado.rol?.nombre_rol}</span>
                            </div>
                            <div className="detalle-item">
                                <span className="detalle-label">Estado</span>
                                <span className={`status-badge ${claseEstado(usuarioSeleccionado.estado_usuario)}`}>
                                    {usuarioSeleccionado.estado_usuario}
                                </span>
                            </div>
                            <div className="detalle-item">
                                <span className="detalle-label">Tipo de documento</span>
                                <span className="detalle-valor">
                                    {usuarioSeleccionado.tipo_documento?.nombre_documento || "No registrado"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}