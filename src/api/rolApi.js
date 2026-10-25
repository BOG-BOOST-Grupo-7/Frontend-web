import { axiosClient } from "./axiosClient";

export const obtenerRoles = async () => {
    const { data } = await axiosClient.get(
        "/roles"
    );
    return data;
};

export const cambiarRolUsuario = async (payload) => {
    const { data } = await axiosClient.put(
        "/roles/usuario",
        payload
    );
    return data;
};