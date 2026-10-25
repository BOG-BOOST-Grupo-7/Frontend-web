import { axiosClient } from "./axiosClient";

export const obtenerMediosPagoPorNegocio = async (idNegocio) => {

    const { data } = await axiosClient.get(
        `/medios-pago/negocio/${idNegocio}`
    );

    return data;

}

export const obtenerMisMediosPago = async () => {

    const { data } = await axiosClient.get(
        "/medios-pago/mi-negocio"
    );

    return data;

};

// Crear medio de pago
export const crearMedioPago = async (datos) => {

    const { data } = await axiosClient.post(
        "/medios-pago/crear",
        datos
    );

    return data;

};

// Actualizar medio de pago
export const actualizarMedioPago = async (id, datos) => {

    const { data } = await axiosClient.put(
        `/medios-pago/actualizar/${id}`,
        datos
    );

    return data;

};

// Eliminar medio de pago
export const eliminarMedioPago = async (id) => {

    const { data } = await axiosClient.delete(
        `/medios-pago/eliminar/${id}`
    );

    return data;

};