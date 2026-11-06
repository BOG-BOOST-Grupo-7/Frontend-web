import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCarrito } from "../../context/CarritoContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function ProductCard({ producto }) {

    const navigate = useNavigate();
    const { agregarProducto } = useCarrito();
    const { isAuthenticated } = useAuth();

    const agregarAlCarrito = (e) => {
        e.stopPropagation();

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
            nombre_negocio: producto.nombre_negocio,
            cantidad: 1
        });

        toast.success("Producto agregado al carrito");

        console.log("Agregado al carrito:", producto);
    };

    const abrirDetalle = () => {
        navigate(`/producto/${producto.id_producto}`);
    };

    return (
        <div className="product-card">
            <button
                type="button"
                className="product-card-detalle"
                onClick={abrirDetalle}
                aria-label={`Ver detalle de ${producto.nombre_producto}`}
            >
                <div className="product-card-img-container">
                    {producto.imagen ? (
                        <img
                            src={producto.imagen}
                            alt={producto.nombre_producto}
                            className="producto-img"
                        />
                    ) : (
                        <div className="sin-imagen">
                            Sin imagen
                        </div>
                    )}
                </div>

                <div className="product-card-body">
                    <span className="product-card-category">
                        {producto.categoria?.nombre_categoria}
                    </span>

                    <h4>{producto.nombre_producto}</h4>

                    <p className="product-card-desc">
                        {producto.descripcion}
                    </p>

                    <span className="product-card-price">
                        {Number(producto.precio).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP"
                        })}
                    </span>
                </div>
            </button>

            <button
                type="button"
                className="btn-carrito"
                onClick={agregarAlCarrito}
            >
                <FaShoppingCart />
                Agregar
            </button>
        </div>
    );
}

export default ProductCard;