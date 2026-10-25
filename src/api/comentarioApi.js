import { axiosClient } from "./axiosClient"; 


export const crearComentarioApi = async (datosComentario) => {
  const response = await axiosClient.post("/comentarios/crear", datosComentario);
  return response.data;
};

export const obtenerComentariosProductoApi = async (idProducto) => {
  const response = await axiosClient.get(`/comentarios/producto/${idProducto}`);
  return response.data;
};

export const obtenerPromedioProductoApi = async (idProducto) => {
  const response = await axiosClient.get(`/comentarios/producto/${idProducto}/promedio`);
  return response.data;
};