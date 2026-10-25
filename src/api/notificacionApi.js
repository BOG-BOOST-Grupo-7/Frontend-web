import { axiosClient } from "./axiosClient";

export const obtenerNotificaciones = async () => {
    const { data } = await axiosClient.get("/notificacion");
    return data;
};

export const marcarComoLeida = async (id) => {
    const { data } = await axiosClient.put(
        `/notificacion/${id}/leida`
    );

    return data;
};

export const eliminarNotificacion = async (id) => {
    const { data } = await axiosClient.delete(
        `/notificacion/eliminar/${id}`
    );

    return data;
};