import { axiosClient } from "./axiosClient";

export const obtenerCategorias = async () => {
    const { data } = await axiosClient.get("/categoria");
    return data;
};

export const obtenerProductosPorCategoria = async (id) => {
    const { data } = await axiosClient.get(`/categoria/${id}/productos`);
    return data;
};

export const crearCategoria = async (categoria) => {
    const { data } = await axiosClient.post(
        "/categoria/crear",
        categoria
    );
    return data;
};

export const actualizarCategoria = async (id, categoria) => {
    const { data } = await axiosClient.put(
        `/categoria/actualizar/${id}`,
        categoria
    );
    return data;
};

export const eliminarCategoria = async (id) => {
    const { data } = await axiosClient.delete(
        `/categoria/eliminar/${id}`
    );
    return data;
};