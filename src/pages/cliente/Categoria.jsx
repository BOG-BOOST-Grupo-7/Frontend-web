import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerProductosPorCategoria } from "../../api/categoriaApi";
import ProductCard from "../../components/home/ProductCard";
import "../../styles/Categoria.css";

function Categoria() {
  const { id } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        const data = await obtenerProductosPorCategoria(id);
        setCategoria(data.categoria);
        setProductos(data.productos);
      } catch (error) {
        console.error("Error al cargar productos de la categoría:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarProductos();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="categoria-page">
        <div className="categoria-loading">
          <div className="categoria-spinner"></div>
          <p>Cargando productos de la categoría...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categoria-page">
      <div className="categoria-header">
        <h1>
          Categoría: <span className="categoria-highlight">{categoria ? categoria.nombre_categoria : "Cargando..."}</span>
        </h1>
        <p className="categoria-counter">
          Se {productos.length === 1 ? "encontró" : "encontraron"} {productos.length} {productos.length === 1 ? "producto" : "productos"} en esta sección.
        </p>
      </div>

      <div className="categoria-seccion">
        <div className="categoria-seccion-titulo">
          <h2>Productos disponibles</h2>
          <span className="categoria-badge-count">{productos.length}</span>
        </div>

        {productos.length > 0 ? (
          <div className="categoria-grid-productos">
            {productos.map((prod) => (
              <ProductCard key={prod.id_producto} producto={prod} />
            ))}
          </div>
        ) : (
          <div className="categoria-empty">
            <i className="fas fa-box-open fa-3x"></i>
            <h3>No hay productos disponibles</h3>
            <p>Actualmente no contamos con artículos registrados en esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Categoria;