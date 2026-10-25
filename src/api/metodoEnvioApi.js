import { axiosClient } from "./axiosClient";

export const obtenerMetodosEnvioPorNegocio = async (idNegocio) => {

    const { data } = await axiosClient.get(
        `/metodos-envio/negocio/${idNegocio}`
    );

    return data;

};

export const obtenerMisMetodosEnvio = async () => {

    const { data } = await axiosClient.get(
        "/metodos-envio/mis-metodos"
    );

    return data;

};

export const crearMetodoEnvio = async (metodo) => {

    const { data } = await axiosClient.post(
        "/metodos-envio/crear",
        metodo
    );

    return data;

};

export const actualizarMetodoEnvio = async (
    id,
    metodo
) => {

    const { data } = await axiosClient.put(
        `/metodos-envio/actualizar/${id}`,
        metodo
    );

    return data;

};

export const eliminarMetodoEnvio = async (id) => {

    const { data } = await axiosClient.delete(
        `/metodos-envio/eliminar/${id}`
    );

    return data;

};
