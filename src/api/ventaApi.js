import { axiosClient } from "./axiosClient";

// =========================
// CLIENTE
// =========================

export const confirmarCarrito = async (payload) => {
    const { data } = await axiosClient.post(
        "/ventas/confirmar-carrito",
        payload
    );

    return data;
};

export const obtenerDatosUltimaCompra = async () => {
  const { data } = await axiosClient.get(
    "/ventas/ultima-compra");
    
  return data;
};

export const obtenerMisCompras = async () => {
    const { data } = await axiosClient.get(
        "/ventas/mis-compras"
    );

    return data;
};

// =========================
// VENDEDOR
// =========================

export const listarVentasNegocio = async () => {
  const response = await axiosClient.get("/ventas/mis-ventas");
  return response.data;
};

// =========================
// ADMIN — REPORTES
// =========================

export const obtenerReportes = async () => {
  try {
    const { data } = await axiosClient.get("/ventas/reportes");
    return data;
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    throw error;
  }
};