import { axiosClient } from "./axiosClient";

export const obtenerProductos = async () => {

    const { data } = await axiosClient.get("/producto");

    return data;

};

export const obtenerMisProductos = async () => {

    const { data } = await axiosClient.get("/producto/mis-productos");

    return data;

};

export const obtenerProducto = async (id) => {

    const { data } = await axiosClient.get(`/producto/${id}`);

    return data;

};

export const crearProducto = async (producto) => {

    const { data } = await axiosClient.post(
        "/producto/crear",
        producto
    );

    return data;

};

export const actualizarProducto = async (
    id,
    producto
) => {

    const { data } = await axiosClient.put(
        `/producto/actualizar/${id}`,
        producto
    );

    return data;

};

export const eliminarProducto = async (id) => {

    const { data } = await axiosClient.delete(
        `/producto/eliminar/${id}`
    );

    return data;

};

export const obtenerProductosPorNegocio = async (idNegocio) => {
    const { data } = await axiosClient.get(`/producto/negocio/${idNegocio}`);
    return data;
};

export const buscarProductosYNegociosApi = async (query) => {
  try {
    
    const { data } = await axiosClient.get("/producto/buscar", {
      params: { q: query },
    });
    return data;
  } catch (error) {
    console.error("Error al buscar:", error);
    throw error;
  }
};

export const obtenerProductosMasVendidos = async () => {
  try {
    const { data } = await axiosClient.get("/producto/mas-vendidos");
    return data; 
  } catch (error) {
    console.error("Error al obtener más vendidos:", error);
    return [];
  }
};