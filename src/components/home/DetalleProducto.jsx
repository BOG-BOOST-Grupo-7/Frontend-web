import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaShoppingCart, FaStar, FaSearchPlus, FaTimes } from "react-icons/fa";
import { useCarrito } from "../../context/CarritoContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

import { obtenerProducto, obtenerProductos } from "../../api/productoApi"; 
import ProductCard from "../../components/home/ProductCard"; 

import "../../styles/DetalleProducto.css";

function DetalleProducto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const { isAuthenticated } = useAuth();
    const { agregarProducto } = useCarrito();

    // Estados para los productos sugeridos
    const [otrosProductos, setOtrosProductos] = useState([]);
    const [mostrarTodos, setMostrarTodos] = useState(false);

    // Estado para controlar el modal de la imagen (Zoom)
    const [imagenExpandida, setImagenExpandida] = useState(false);

    useEffect(() => {
        cargarProducto();
        setCantidad(1);
        setMostrarTodos(false); 
    }, [id]);

    const cargarProducto = async () => {
        try {
            const data = await obtenerProducto(id);
            setProducto(data);

            const todosLosProductos = await obtenerProductos();
            const filtrados = todosLosProductos.filter(p => p.id_producto !== data.id_producto);
            setOtrosProductos(filtrados);

        } catch (error) {
            console.error(error);
        }
    };

    if (!producto) {
        return <h2 className="cargando-producto">Cargando producto...</h2>;
    }

    const agregarAlCarrito = () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        agregarProducto({
            id_producto: producto.id_producto,
            id_negocio: producto.id_negocio,
            nombre_producto: producto.nombre_producto,
            precio: producto.precio,
            imagen: producto.imagen,
            nombre_negocio: producto.negocio?.nombre_negocio,
            cantidad
        });

        toast.success("Producto agregado al carrito");
    };

    const aumentarCantidad = () => {
        if (cantidad < producto.stock) setCantidad(cantidad + 1);
    };

    const disminuirCantidad = () => {
        if (cantidad > 1) setCantidad(cantidad - 1);
    };

    const productosAMostrar = mostrarTodos ? otrosProductos : otrosProductos.slice(0, 10);

    return (
        <div className="detalle-producto">
            <button className="btn-volver" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Volver al catálogo
            </button>

            {/* ================= DETALLE PRINCIPAL ================= */}
            <div className="detalle-card">
                
                {/* Imagen con efecto Zoom */}
                <div 
                    className="detalle-imagen-container" 
                    onClick={() => producto.imagen && setImagenExpandida(true)}
                >
                    {producto.imagen ? (
                        <>
                            <img 
                                src={producto.imagen} 
                                alt={producto.nombre_producto} 
                                className="imagen-principal"
                            />
                            <div className="overlay-zoom">
                                <FaSearchPlus />
                                <span>Ampliar imagen</span>
                            </div>
                        </>
                    ) : (
                        <div className="sin-imagen">Sin imagen</div>
                    )}
                </div>

                {/* Información del producto */}
                <div className="detalle-info">
                    <div className="header-info">
                        <span className="categoria">{producto.categoria?.nombre_categoria}</span>
                        <h1>{producto.nombre_producto}</h1>
                    </div>

                    <div className="precio-y-estado">
                        <div className="precio">
                            {Number(producto.precio).toLocaleString("es-CO", {
                                style: "currency",
                                currency: "COP"
                            })}
                        </div>
                        <span className={producto.estado_producto === "DISPONIBLE" ? "estado-disponible" : "estado-agotado"}>
                            {producto.estado_producto}
                        </span>
                    </div>

                    <p className="stock">
                        <strong>Disponibles:</strong> {producto.stock} unidades
                    </p>

                    <button
                        className="btn-ver-comentarios"
                        onClick={() => navigate(`/producto/${producto.id_producto}/comentarios`)}
                    >
                        <FaStar /> Ver opiniones y comentarios
                    </button>

                    <div className="compra-acciones">
                        <div className="selector-cantidad">
                            <button onClick={disminuirCantidad} disabled={cantidad <= 1}>-</button>
                            <span>{cantidad}</span>
                            <button onClick={aumentarCantidad} disabled={cantidad >= producto.stock}>+</button>
                        </div>

                        <button className="btn-comprar" onClick={agregarAlCarrito}>
                            <FaShoppingCart /> Agregar al carrito
                        </button>
                    </div>

                    {/* Tarjeta del Vendedor */}
                    <div
                        className="info-negocio"
                        onClick={() => navigate(`/negocios/${producto.id_negocio}`)}
                    >
                        {producto.negocio?.logo ? (
                            <img src={producto.negocio.logo} className="logo-negocioo" alt="Logo" />
                        ) : (
                            <div className="logo-placeholder">{producto.negocio?.nombre_negocio?.charAt(0)}</div>
                        )}
                        <div className="negocio-textos">
                            <small>Vendido por</small>
                            <h3>{producto.negocio?.nombre_negocio}</h3>
                        </div>
                        <span className="ver-tienda">Ver tienda</span>
                    </div>
                </div>
            </div>

            {/* ================= DESCRIPCIÓN Y CARACTERÍSTICAS ================= */}
            <div className="info-cards-grid">
                <div className="info-card">
                    <h2>Descripción del producto</h2>
                    <p>{producto.descripcion || "No hay descripción disponible."}</p>
                </div>

                <div className="info-card">
                    <h2>Características</h2>
                    <p>{producto.caracteristicas || "No hay características especificadas."}</p>
                </div>
            </div>

            {/* ================= PRODUCTOS SUGERIDOS ================= */}
            {otrosProductos.length > 0 && (
                <div className="mas-productos-section">
                    <h2>Productos que te pueden interesar</h2>
                    
                    <div className="mas-productos-grid">
                        {productosAMostrar.map((prod) => (
                            <ProductCard key={prod.id_producto} producto={prod} />
                        ))}
                    </div>

                    {otrosProductos.length > 10 && (
                        <div className="btn-ver-mas-container">
                            <button 
                                className="btn-ver-mas" 
                                onClick={() => setMostrarTodos(!mostrarTodos)}
                            >
                                {mostrarTodos ? "Ver menos productos" : "Ver más productos"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ================= MODAL PARA VER LA IMAGEN EN GRANDE ================= */}
            {imagenExpandida && producto.imagen && (
                <div className="modal-imagen-overlay" onClick={() => setImagenExpandida(false)}>
                    <div className="modal-imagen-content" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-cerrar-imagen" onClick={() => setImagenExpandida(false)}>
                            <FaTimes />
                        </button>
                        <img src={producto.imagen} alt={producto.nombre_producto} />
                    </div>
                </div>
            )}

        </div>
    );
}

export default DetalleProducto;