import { createContext, useContext, useState } from "react";

import toast from "react-hot-toast";

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  // =========================
  // AGREGAR PRODUCTO
  // =========================
  const agregarProducto = (producto) => {

    console.log(producto);
    setCarrito((prev) => {

      const negocioDiferente = prev.find(
        (p) => p.id_negocio !== producto.id_negocio
      );

      if (
        prev.length > 0 &&
        prev[0].id_negocio !== producto.id_negocio
      ) {
        toast.error(
          "Solo puedes comprar productos de un mismo negocio."
        );

        return prev;
      }

      const existe = prev.find(
        (p) => p.id_producto === producto.id_producto
      );

      if (existe) {

        return prev.map((p) =>
          p.id_producto === producto.id_producto
            ? {
              ...p,
              cantidad: p.cantidad + producto.cantidad
            }
            : p
        );

      }

      return [
        ...prev,
        {
          id_producto: producto.id_producto,
          id_negocio: producto.id_negocio,
          nombre_producto: producto.nombre_producto,
          precio: producto.precio,
          imagen: producto.imagen,
          nombre_negocio: producto.nombre_negocio,
          cantidad: producto.cantidad
        }
      ];

    });

  };

  // =========================
  // ELIMINAR PRODUCTO
  // =========================
  const eliminarProducto = (id) => {
    setCarrito((prev) =>
      prev.filter((p) => p.id_producto !== id)
    );
  };

  // =========================
  // CAMBIAR CANTIDAD
  // =========================
  const cambiarCantidad = (id, cantidad) => {
    setCarrito((prev) =>
      prev.map((p) =>
        p.id_producto === id
          ? { ...p, cantidad: Math.max(1, cantidad) }
          : p
      )
    );
  };

  // =========================
  // LIMPIAR CARRITO
  // =========================
  const limpiarCarrito = () => setCarrito([]);

  // =========================
  // TOTAL
  // =========================
  const total = carrito.reduce((acumulado, producto) => {
    return (
      acumulado +
      Number(producto.precio) * Number(producto.cantidad)
    );
  }, 0);

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarProducto,
        eliminarProducto,
        cambiarCantidad,
        limpiarCarrito,
        total
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

// Hook personalizado
export const useCarrito = () => useContext(CarritoContext);