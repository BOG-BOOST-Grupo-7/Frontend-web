import { axiosClient } from "./axiosClient";

export const obtenerMisPQRS = () => {
  return axiosClient.get("/pqrs/mis-pqrs");
};

export const crearPQRS = (mensaje_pqrs) => {
  return axiosClient.post("/pqrs/crear", {
    mensaje_pqrs
  });
};

export const listarPQRS = () => {
    return axiosClient.get("/pqrs");
};

export const responderPQRS = (id, respuesta_pqrs) => {
    return axiosClient.put(`/pqrs/${id}/responder`, {
        respuesta_pqrs
    });
};