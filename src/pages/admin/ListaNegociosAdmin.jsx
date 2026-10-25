import { useEffect, useMemo, useState } from "react";
import {
    FaStore,
    FaTags,
    FaPlusCircle,
    FaUndo,
    FaEye,
    FaBoxOpen,
    FaSearch,
    FaEdit,
    FaTrash,
    FaListAlt
} from "react-icons/fa";

import ModalCategorias from "../../components/negocio/ModalCategorias";
import "../../styles/ListaNegociosAdmin.css";
import { obtenerNegocios, obtenerNegocioPorId } from "../../api/negocioApi";
import { obtenerCategorias, eliminarCategoria } from "../../api/categoriaApi";

function ListaNegociosAdmin() {
    const [negocios, setNegocios] = useState([]);
    const [listaCategoriasGenerales, setListaCategoriasGenerales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [negocioSeleccionado, setNegocioSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalCategorias, setMostrarModalCategorias] = useState(false);
    const [categoriaAEditar, setCategoriaAEditar] = useState(null);

    const [vistaActual, setVistaActual] = useState("negocios");
    const [busquedaCategorias, setBusquedaCategorias] = useState("");
    const [categoriaPadreFiltro, setCategoriaPadreFiltro] = useState("todos");

    const [paginaActual, setPaginaActual] = useState(1);
    const elementosPorPagina = 5;

    const [paginaActualCategorias, setPaginaActualCategorias] = useState(1);
    const elementosPorPaginaCategorias = 5;

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const cargarDatosIniciales = async () => {
        try {
            setLoading(true);
            const [respuestaNegocios, respuestaCategorias] = await Promise.all([
                obtenerNegocios(),
                obtenerCategorias()
            ]);

            const negociosAprobados = respuestaNegocios.filter(
                (negocio) => negocio.estado_negocio === "APROBADO"
            );
            setNegocios(negociosAprobados);
            setListaCategoriasGenerales(respuestaCategorias || []);
        } catch (error) {
            console.error(error);
            alert("No fue posible cargar la información de la administración.");
        } finally {
            setLoading(false);
        }
    };

    const recargarCategorias = async () => {
        try {
            const respuestaCategorias = await obtenerCategorias();
            setListaCategoriasGenerales(respuestaCategorias || []);
        } catch (error) {
            console.error(error);
        }
    };

    const nombrePropietario = (perfil) => {
        if (!perfil) return "No disponible";
        return [
            perfil.primer_nombre,
            perfil.segundo_nombre,
            perfil.primer_apellido,
            perfil.segundo_apellido,
        ]
            .filter(Boolean)
            .join(" ");
    };

    const negociosFiltrados = useMemo(() => {
        return negocios.filter((negocio) => {
            const textoBusqueda = busqueda.toLowerCase().trim();
            const nombreNegocio = (negocio.nombre_negocio || "").toLowerCase();
            const correoPropietario = (negocio.perfil?.correo || "").toLowerCase();
            const nombreCompletoPropietario = nombrePropietario(negocio.perfil).toLowerCase();

            return (
                textoBusqueda === "" ||
                nombreNegocio.includes(textoBusqueda) ||
                correoPropietario.includes(textoBusqueda) ||
                nombreCompletoPropietario.includes(textoBusqueda)
            );
        });
    }, [negocios, busqueda]);

    const categoriasFiltradas = useMemo(() => {
        return listaCategoriasGenerales.filter((cat) => {
            const textoBusq = busquedaCategorias.toLowerCase().trim();
            const nombreCat = (cat.nombre_categoria || "").toLowerCase();
            const cumpleBusq = textoBusq === "" || nombreCat.includes(textoBusq);

            let cumplePadre = true;
            if (categoriaPadreFiltro === "ninguna") {
                cumplePadre = !cat.id_categoria_padre;
            } else if (categoriaPadreFiltro !== "todos") {
                cumplePadre = String(cat.id_categoria_padre) === String(categoriaPadreFiltro) || 
                            String(cat.id_categoria) === String(categoriaPadreFiltro);
            }

            return cumpleBusq && cumplePadre;
        });
    }, [listaCategoriasGenerales, busquedaCategorias, categoriaPadreFiltro]);

    const totalPaginas = Math.ceil(negociosFiltrados.length / elementosPorPagina) || 1;
    const negociosPaginados = useMemo(() => {
        const inicio = (paginaActual - 1) * elementosPorPagina;
        return negociosFiltrados.slice(inicio, inicio + elementosPorPagina);
    }, [negociosFiltrados, paginaActual]);

    const totalPaginasCategorias = Math.ceil(categoriasFiltradas.length / elementosPorPaginaCategorias) || 1;
    const categoriasPaginadas = useMemo(() => {
        const inicio = (paginaActualCategorias - 1) * elementosPorPaginaCategorias;
        return categoriasFiltradas.slice(inicio, inicio + elementosPorPaginaCategorias);
    }, [categoriasFiltradas, paginaActualCategorias]);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda]);

    useEffect(() => {
        setPaginaActualCategorias(1);
    }, [busquedaCategorias, categoriaPadreFiltro]);

    const totalNegocios = negociosFiltrados.length;
    const totalCategorias = listaCategoriasGenerales.length;

    const totalProductos = useMemo(() => {
        return negocios.reduce(
            (total, negocio) => total + (negocio.productos?.length || 0),
            0
        );
    }, [negocios]);

    const limpiarFiltros = () => setBusqueda("");
    const limpiarFiltrosCategorias = () => {
        setBusquedaCategorias("");
        setCategoriaPadreFiltro("todos");
    };

    const verNegocio = async (id) => {
        try {
            const negocio = await obtenerNegocioPorId(id);
            setNegocioSeleccionado(negocio);
            setMostrarModal(true);
        } catch (error) {
            console.error(error);
            alert("No fue posible obtener el negocio.");
        }
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setNegocioSeleccionado(null);
    };

    const abrirModalCrearCategoria = () => {
        setCategoriaAEditar(null);
        setMostrarModalCategorias(true);
    };

    const abrirModalEditarCategoria = (cat) => {
        setCategoriaAEditar(cat);
        setMostrarModalCategorias(true);
    };

    const eliminarCatTabla = async (id) => {
        const confirmar = window.confirm(
            "¿Estás seguro de eliminar esta categoría?\n\n" +
            "• Si NO tiene productos ni subcategorías, se eliminará .\n" +
            "• Si YA tiene productos o subcategorías, se marcará como INACTIVA y desaparecerá del catálogo."
        );

        if (!confirmar) return;

        try {
            const respuesta = await eliminarCategoria(id);
            alert(respuesta.mensaje);
            await recargarCategorias();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.mensaje || "No se pudo procesar la solicitud.");
        }
    };

    return (
        <div className="negocios-admin-container">
            <h1 className="view-title">
                {vistaActual === "negocios" ? "Lista de Negocios" : "Lista de Categorías"}
            </h1>

            <div className="negocios-summary">
                <div className="summary-card">
                    <FaStore />
                    <span>Total Negocios <strong>{totalNegocios}</strong></span>
                </div>
                <div className="summary-card">
                    <FaTags style={{ color: "#2196F3" }} />
                    <span>Categorías <strong>{totalCategorias}</strong></span>
                </div>
                <div className="summary-card">
                    <FaBoxOpen style={{ color: "#4CAF50" }} />
                    <span>Productos <strong>{totalProductos}</strong></span>
                </div>
            </div>

            <div className="action-bar" style={{ flexDirection: "column", alignItems: "flex-start", gap: "15px" }}>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: "100%", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button className="btn-orange" onClick={abrirModalCrearCategoria}>
                            <FaPlusCircle /> Agregar Categorías
                        </button>

                        {vistaActual === "negocios" ? (
                            <button
                                className="btn-orange"
                                onClick={() => setVistaActual("categorias")}
                                style={{ backgroundColor: "#2196F3" }}
                            >
                                <FaTags /> Ver Lista de Categorías
                            </button>
                        ) : (
                            <button
                                className="btn-orange"
                                onClick={() => setVistaActual("negocios")}
                                style={{ backgroundColor: "#4CAF50" }}
                            >
                                <FaListAlt /> Ver Lista de Negocios
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ width: "100%", display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
                    {vistaActual === "negocios" ? (
                        <>
                            <div className="search-group" style={{ width: "100%", maxWidth: "400px" }}>
                                <FaSearch />
                                <input
                                    type="text"
                                    className="usuarios-input"
                                    placeholder="Buscar por negocio, correo o propietario..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <button className="btn-orange" onClick={limpiarFiltros}>
                                    <FaUndo /> Limpiar
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="search-group" style={{ width: "100%", maxWidth: "350px" }}>
                                <FaSearch />
                                <input
                                    type="text"
                                    className="usuarios-input"
                                    placeholder="Buscar categoría por nombre..."
                                    value={busquedaCategorias}
                                    onChange={(e) => setBusquedaCategorias(e.target.value)}
                                />
                            </div>
                            <div className="filter-group" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                <select
                                    className="usuarios-select"
                                    value={categoriaPadreFiltro}
                                    onChange={(e) => setCategoriaPadreFiltro(e.target.value)}
                                >
                                    <option value="todos">Todas las categorías padre</option>
                                    <option value="ninguna">Sin categoría padre (Sólo principales)</option>
                                    {listaCategoriasGenerales.map((cat) => {
                                        const esHija = Boolean(cat.id_categoria_padre);
                                        return (
                                            <option key={cat.id_categoria} value={cat.id_categoria}>
                                                {esHija ? `└─ ${cat.nombre_categoria}` : cat.nombre_categoria}
                                            </option>
                                        );
                                    })}
                                </select>
                                <button className="btn-orange" onClick={limpiarFiltrosCategorias}>
                                    <FaUndo /> Limpiar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {vistaActual === "negocios" ? (
                <div className="table-container">
                    <table className="negocios-table">
                        <thead>
                            <tr>
                                <th>Logo</th>
                                <th>Negocio</th>
                                <th>Propietario</th>
                                <th>Información</th>
                                <th>Productos</th>
                                <th>Estado</th>
                                <th>Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>Cargando negocios...</td></tr>
                            ) : negociosPaginados.length === 0 ? (
                                <tr><td colSpan="7" className="sin-datos">No existen negocios con los filtros seleccionados.</td></tr>
                            ) : (
                                negociosPaginados.map((negocio) => (
                                    <tr key={negocio.id_negocio}>
                                        <td>
                                            {negocio.logo ? (
                                                <img src={negocio.logo} alt={negocio.nombre_negocio} className="logo-business" />
                                            ) : (
                                                <div className="logo-business logo-placeholder"><FaStore /></div>
                                            )}
                                        </td>
                                        <td>
                                            <strong>{negocio.nombre_negocio}</strong>
                                            <br />
                                            <small>{negocio.categoria?.nombre_categoria}</small>
                                        </td>
                                        <td>
                                            <strong>{nombrePropietario(negocio.perfil)}</strong>
                                            <br />
                                            <small>{negocio.perfil?.correo}</small>
                                        </td>
                                        <td>
                                            <strong>Descripción</strong>
                                            <br />
                                            <small>{negocio.descripcion_negocio || "Sin descripción"}</small>
                                        </td>
                                        <td>
                                            <span className="product-badge">
                                                <FaBoxOpen /> {negocio.productos?.length || 0} Productos
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${negocio.estado_negocio === "APROBADO" ? "status-active" : "status-inactive"}`}>
                                                {negocio.estado_negocio}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon view" title="Ver detalles" onClick={() => verNegocio(negocio.id_negocio)}>
                                                    <FaEye />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="table-container">
                    <table className="negocios-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre de Categoría</th>
                                <th>Categoría Padre</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>Cargando categorías...</td></tr>
                            ) : categoriasPaginadas.length === 0 ? (
                                <tr><td colSpan="5" className="sin-datos">No existen categorías con los filtros seleccionados.</td></tr>
                            ) : (
                                categoriasPaginadas.map((cat) => {
                                    const categoriaPadreObj = listaCategoriasGenerales.find(
                                        (c) => c.id_categoria === cat.id_categoria_padre
                                    );
                                    return (
                                        <tr key={cat.id_categoria}>
                                            <td>{cat.id_categoria}</td>
                                            <td>
                                                <strong>{cat.nombre_categoria}</strong>
                                                {cat.estado === "INACTIVO" && (
                                                    <span className="badge-inactivo">INACTIVO</span>
                                                )}
                                            </td>
                                            <td>
                                                {categoriaPadreObj ? categoriaPadreObj.nombre_categoria : "Ninguna"}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${cat.estado === "INACTIVO" ? "status-inactive" : "status-active"}`}>
                                                    {cat.estado || "ACTIVO"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons" style={{ display: "flex", gap: "5px" }}>
                                                    <button className="btn-icon edit" title="Editar categoría" onClick={() => abrirModalEditarCategoria(cat)}>
                                                        <FaEdit />
                                                    </button>
                                                    <button className="btn-icon delete" title="Eliminar categoría" onClick={() => eliminarCatTabla(cat.id_categoria)}>
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {vistaActual === "negocios" && !loading && negociosFiltrados.length > 0 && (
                <div className="pagination-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "15px" }}>
                    <button className="btn-orange" disabled={paginaActual === 1} onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}>Anterior</button>
                    <span>Página {paginaActual} de {totalPaginas}</span>
                    <button className="btn-orange" disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}>Siguiente</button>
                </div>
            )}

            {vistaActual === "categorias" && !loading && categoriasFiltradas.length > 0 && (
                <div className="pagination-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "15px" }}>
                    <button className="btn-orange" disabled={paginaActualCategorias === 1} onClick={() => setPaginaActualCategorias((prev) => Math.max(prev - 1, 1))}>Anterior</button>
                    <span>Página {paginaActualCategorias} de {totalPaginasCategorias}</span>
                    <button className="btn-orange" disabled={paginaActualCategorias === totalPaginasCategorias} onClick={() => setPaginaActualCategorias((prev) => Math.min(prev + 1, totalPaginasCategorias))}>Siguiente</button>
                </div>
            )}

            {mostrarModal && negocioSeleccionado && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detalles del Negocio</h2>
                            <button className="modal-close" onClick={cerrarModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detalle-item">
                                <span className="detalle-label">Nombre</span>
                                <span className="detalle-valor">{negocioSeleccionado.nombre_negocio}</span>
                            </div>
                            <div className="detalle-item">
                                <span className="detalle-label">Propietario</span>
                                <span className="detalle-valor">
                                    <strong>{nombrePropietario(negocioSeleccionado.perfil)}</strong>
                                    <br />
                                    <small>{negocioSeleccionado.perfil?.correo}</small>
                                </span>
                            </div>
                            <div className="detalle-item">
                                <span className="detalle-label">Descripción</span>
                                <span className="detalle-valor">{negocioSeleccionado.descripcion_negocio || "Sin descripción"}</span>
                            </div>
                            <div className="detalle-item">
                                <span className="detalle-label">Teléfono</span>
                                <span className="detalle-valor">{negocioSeleccionado.telefono_negocio || "No registrado"}</span>
                            </div>
                            <div className="detalle-item">
                                <span className="detalle-label">Estado</span>
                                <span className={`status-badge ${negocioSeleccionado.estado_negocio === "APROBADO" ? "status-active" : "status-inactive"}`}>
                                    {negocioSeleccionado.estado_negocio}
                                </span>
                            </div>
                            <div className="detalle-item">
                                <span className="detalle-label">Puesto</span>
                                <span className="detalle-valor">{negocioSeleccionado.puesto?.[0]?.numero_puesto || "Sin asignar"}</span>
                            </div>
                            <div className="detalle-item">
                                <span className="detalle-label">Productos registrados</span>
                                <span className="detalle-valor">{negocioSeleccionado.productos?.length || 0}</span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-orange" onClick={cerrarModal}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            <ModalCategorias
                abierto={mostrarModalCategorias}
                categoriaAEditar={categoriaAEditar}
                onClose={() => {
                    setMostrarModalCategorias(false);
                    setCategoriaAEditar(null);
                    recargarCategorias();
                }}
            />
        </div>
    );
}

export default ListaNegociosAdmin;