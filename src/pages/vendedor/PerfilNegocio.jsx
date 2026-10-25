import { useEffect, useState, useRef, useMemo } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; 
import toast from "react-hot-toast"; 

import { obtenerMiNegocio, actualizarNegocio, desactivarNegocio } from "../../api/negocioApi";
import { obtenerMisProductos } from "../../api/productoApi";

import ModalEditarNegocio from "../../components/negocio/ModalEditarNegocio";
import ModalMediosPago from "../../components/negocio/ModalMediosPago";
import ModalMetodosEnvio from "../../components/negocio/ModalMetodosEnvio";

import "../../styles/PerfilNegocio.css";

export default function PerfilNegocio() {
    const [negocio, setNegocio] = useState(null);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarMediosPago, setMostrarMediosPago] = useState(false);
    const [mostrarModalEnvio, setMostrarModalEnvio] = useState(false);
    const [desactivando, setDesactivando] = useState(false);
    const navigate = useNavigate();
    const [paginaActual, setPaginaActual] = useState(1);
    const productosPorPagina = 8;

    // ==========================================
    // Lógica para actualizar el Logo
    // ==========================================
    const fileInputRef = useRef(null);
    const [subiendoLogo, setSubiendoLogo] = useState(false);

    const handleClickLogo = () => {
        fileInputRef.current.click();
    };

    const handleCambioLogo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setSubiendoLogo(true);
            
            const formData = new FormData();
            formData.append("logo", file);

            await actualizarNegocio(negocio.id_negocio, formData);
            await cargarNegocio();
            
            toast.success("Logo actualizado correctamente");
        } catch (error) {
            console.error("Error al actualizar el logo:", error);
            toast.error("No se pudo actualizar el logo");
        } finally {
            setSubiendoLogo(false);
        }
    };

    useEffect(() => {
        cargarNegocio();
    }, []);

    const cargarNegocio = async () => {
        try {
            setLoading(true);
            const data = await obtenerMiNegocio();
            setNegocio(data);
            const listaProductos = await obtenerMisProductos();
            setProductos(listaProductos);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Lógica para Desactivar el Negocio
    // ==========================================
    const handleDesactivarNegocio = async () => {
        const confirmar = window.confirm(
            "⚠️ ADVERTENCIA ⚠️\n\n" +
            "¿Estás seguro de que quieres desactivar tu negocio?\n\n" +
            "Al hacerlo:\n" +
            "• Tus productos dejarán de ser visibles en la página.\n" +
            "• Tu puesto será liberado en el mapa del mercado.\n" +
            "• No podrás recibir nuevos pedidos.\n\n" +
            "NOTA: Tu historial de ventas y los datos de tus clientes se conservarán intactos.\n\n" +
            "¿Deseas continuar?"
        );

        if (!confirmar) return;

        try {
            setDesactivando(true);
            await desactivarNegocio(negocio.id_negocio);
            
            toast.success("Tu negocio ha sido desactivado correctamente.");
            
            setTimeout(() => {
                navigate("/");
            }, 2000);

        } catch (error) {
            console.error("Error al desactivar:", error);
            toast.error("No se pudo desactivar el negocio. Intenta de nuevo.");
        } finally {
            setDesactivando(false);
        }
    };

    // 👇 Lógica de paginación
    const indexUltimoProducto = paginaActual * productosPorPagina;
    const indexPrimerProducto = indexUltimoProducto - productosPorPagina;
    const productosPaginados = productos.slice(indexPrimerProducto, indexUltimoProducto);
    const totalPaginas = Math.ceil(productos.length / productosPorPagina);

    if (loading) return <div className="perfil-negocio"><h2>Cargando negocio...</h2></div>;
    if (!negocio) return <div className="perfil-negocio"><h2>No tienes un negocio registrado.</h2></div>
    
    return (
        <div className="perfil-negocio">
            <h1 className="view-title">
                Perfil del Negocio
            </h1>

            <div className="profile-grid">
                <div className="info-column">
                    <div className="profile-card logo-card">
                        {negocio.logo ? (
                            <img
                                src={negocio.logo}
                                alt={negocio.nombre_negocio}
                                className="logo-negocio"
                            />
                        ) : (
                            <div className="logo-placeholder">Sin logo</div>
                        )}

                        <button 
                            className="btn-edit" 
                            onClick={handleClickLogo}
                            disabled={subiendoLogo}
                        >
                            <FaEdit />
                            {subiendoLogo ? " Subiendo..." : " Editar"}
                        </button>

                        <input 
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleCambioLogo}
                        />
                    </div>

                    <div className="config-buttons-bottom">
                        <button
                            className="btn-side"
                            onClick={() => setMostrarMediosPago(true)}
                        >
                            Medio de pago
                        </button>
                        <button
                            className="btn-side"
                            onClick={() => setMostrarModalEnvio(true)}
                        >
                            Método de envío
                        </button>

                        <button
                            className="btn-side btn-danger"
                            onClick={handleDesactivarNegocio}
                            disabled={desactivando || negocio.estado_negocio === "INACTIVO"}
                        >
                            <FaTrashAlt style={{ marginRight: "8px" }} />
                            {desactivando ? "Desactivando..." : "Desactivar negocio"}
                        </button>
                    </div>
                </div>

                <div className="map-column">
                    <div className="map-column-inner">
                        <div className="profile-card info-card">
                            <h2>{negocio.nombre_negocio}</h2>
                            <p><strong>Descripción</strong></p>
                            <p>{negocio.descripcion_negocio}</p>
                            <p><strong>Teléfono</strong></p>
                            <p>{negocio.telefono_negocio}</p>
                            <p><strong>Estado</strong></p>
                            <p>{negocio.estado_negocio}</p>
                            <p><strong>Puesto</strong></p>
                            <p>{negocio.puesto?.[0]?.numero_puesto || "No especificado"}</p>

                            <button
                                className="btn-edit"
                                onClick={() => setMostrarModal(true)}
                            >
                                <FaEdit />
                                Editar información
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* SECCIÓN DE PRODUCTOS CON PAGINACIÓN        */}
            {/* ========================================== */}
            <div className="products-section">
                <h3 className="section-title">Mis Productos ({productos.length})</h3>
                
                {productos.length === 0 ? (
                    <p className="sin-productos">Aún no tienes productos registrados.</p>
                ) : (
                    <>
                        <div className="productos-grid-paginados">
                            {productosPaginados.map((producto) => (
                                <div className="producto-carrusel-card" key={producto.id_producto}>
                                    <div className="producto-carrusel-imagen">
                                        <img
                                            src={producto.imagen || "https://via.placeholder.com/150"}
                                            alt={producto.nombre_producto}
                                        />
                                    </div>
                                    <div className="producto-carrusel-info">
                                        <h4>{producto.nombre_producto}</h4>
                                        <p>{producto.categoria?.nombre_categoria}</p>
                                        <span>
                                            {Number(producto.precio).toLocaleString("es-CO", {
                                                style: "currency",
                                                currency: "COP"
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Controles de paginación */}
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
                    </>
                )}
            </div>

            {/* ========================================== */}
            {/* ZONA DE MODALES */}
            {/* ========================================== */}

            <ModalEditarNegocio
                abierto={mostrarModal}
                negocio={negocio}
                onClose={() => setMostrarModal(false)}
                onActualizado={cargarNegocio} 
            />

            <ModalMediosPago
                abierto={mostrarMediosPago}
                idNegocio={negocio.id_negocio}
                onClose={() => setMostrarMediosPago(false)}
            />

            <ModalMetodosEnvio
                abierto={mostrarModalEnvio}
                onClose={() => setMostrarModalEnvio(false)}
                idNegocio={negocio.id_negocio}
            />

        </div>
    );
}