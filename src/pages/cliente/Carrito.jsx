import { useState } from "react";
import { useCarrito } from "../../context/CarritoContext";
import FormularioCompra from "../../components/carrito/FormularioCompra.jsx";
import "../../styles/Carrito.css";

function Carrito() {
  const {
    carrito,
    eliminarProducto,
    cambiarCantidad,
    total,
    limpiarCarrito
  } = useCarrito();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <div className="carrito-container">
      <h2>🛒 Tu carrito</h2>

      {carrito.length === 0 ? (
        <p className="carrito-vacio">
          No hay productos en el carrito
        </p>
      ) : (
        <>
          <div className="carrito-lista">
            {carrito.map((producto) => (
              <div
                key={producto.id_producto}
                className="carrito-item"
              >
                <img
                  src={producto.imagen}
                  alt={producto.nombre_producto}
                  className="carrito-imagen"
                />

                <div className="carrito-info">
                  <h3>{producto.nombre_producto}</h3>

                  <p>{producto.nombre_negocio}</p>

                  <span>
                    {Number(producto.precio).toLocaleString(
                      "es-CO",
                      {
                        style: "currency",
                        currency: "COP",
                      }
                    )}
                  </span>
                </div>

                <div className="carrito-cantidad">
                  <button
                    onClick={() =>
                      cambiarCantidad(
                        producto.id_producto,
                        producto.cantidad - 1
                      )
                    }
                  >
                    -
                  </button>

                  <span>{producto.cantidad}</span>

                  <button
                    onClick={() =>
                      cambiarCantidad(
                        producto.id_producto,
                        producto.cantidad + 1
                      )
                    }
                  >
                    +
                  </button>
                </div>

                <div className="carrito-subtotal">
                  <strong>
                    {(
                      producto.precio *
                      producto.cantidad
                    ).toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                    })}
                  </strong>
                </div>

                <button
                  className="btn-eliminar"
                  onClick={() =>
                    eliminarProducto(producto.id_producto)
                  }
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="carrito-footer">
            <h3>
              Total:{" "}
              {total.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })}
            </h3>

            <div className="botones">
              <button
                className="btn-vaciar"
                onClick={limpiarCarrito}
              >
                Vaciar carrito
              </button>

              <button
                className="btn-comprar"
                onClick={() => setMostrarFormulario(true)}
              >
                Comprar
              </button>
            </div>
          </div>
        </>
      )}

      {mostrarFormulario && (
        <FormularioCompra
          carrito={carrito}
          total={total}
          onCerrar={() => setMostrarFormulario(false)}
          onCompraExitosa={() => {
            limpiarCarrito();
            setMostrarFormulario(false);
          }}
        />
      )}
    </div>
  );
}

export default Carrito;