import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { obtenerNegocioPorId } from "../../api/negocioApi";
import { obtenerProductosPorNegocio } from "../../api/productoApi";
import ProductCard from "../../components/home/ProductCard";
import toast from "react-hot-toast";
import "../../styles/Negocios.css";

function NegocioDetalle() {
    const { id } = useParams();

    const [negocio, setNegocio] = useState(null);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [paginaActual, setPaginaActual] = useState(1);
    const productosPorPagina = 12; 

    useEffect(() => {
        cargarDatosNegocio();
    }, [id]);

    const cargarDatosNegocio = async () => {
        setLoading(true);
        try {
            const [dataNegocio, dataProductos] = await Promise.all([
                obtenerNegocioPorId(id),
                obtenerProductosPorNegocio(id).catch(() => [])
            ]);

            setNegocio(dataNegocio);
            setProductos(dataProductos);
        } catch (error) {
            console.error("Error al cargar la información:", error);
            toast.error("Error al cargar los datos del negocio");
        } finally {
            setLoading(false);
        }
    };

    // Lógica de paginación
    const indexUltimoProducto = paginaActual * productosPorPagina;
    const indexPrimerProducto = indexUltimoProducto - productosPorPagina;
    const productosPaginados = productos.slice(indexPrimerProducto, indexUltimoProducto);
    const totalPaginas = Math.ceil(productos.length / productosPorPagina);

    if (loading) return <p style={{ textAlign: "center", padding: "40px" }}>Cargando...</p>;
    if (!negocio) return <p style={{ textAlign: "center", padding: "40px" }}>No se encontró el negocio.</p>;

    return (
        <div className="perfil-negocio" style={{ padding: "30px 20px" }}>
            {/* Contenedor principal con logo e información */}
            <div className="profile-grid-single">
                <div className="profile-card logo-card">
                    {
                        negocio.logo ?
                            <img
                                src={negocio.logo}
                                alt={negocio.nombre_negocio}
                                className="logo-negocio"
                            />
                            :
                            <div className="logo-placeholder">
                                Sin logo
                            </div>
                    }
                </div>

                <div className="profile-card info-card">
                    <h2>
                        {negocio.nombre_negocio}
                    </h2>
                
                    <p>
                        <strong>Descripción</strong>
                    </p>
                    <p>
                        {negocio.descripcion_negocio}
                    </p>
                    <p>
                        <strong>Teléfono</strong>
                    </p>
                    <p>
                        {negocio.telefono_negocio}
                    </p>

                    <p>
                        <strong>Puesto</strong>
                    </p>

                    <p>
                        <Link to="/mapa-mercado" className="boton-mapa">
                            Ver Mapa del Mercado
                        </Link>
                    </p>
                </div>
            </div>

            <div className="products-section">
                <h3 className="section-title">Productos del Negocio</h3>
                {productos.length === 0 ? (
                    <p style={{ color: "#777", fontStyle: "italic", padding: "20px" }}>Este negocio aún no tiene productos disponibles.</p>
                ) : (
                    <>
                        <div className="productos-grid">
                            {productosPaginados.map((p) => (
                                <ProductCard key={p.id_producto} producto={p} />
                            ))}
                        </div>

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
                    </>
                )}
            </div>
        </div>
    );
}

export default NegocioDetalle;