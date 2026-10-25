import { axiosClient } from "./axiosClient";

export const actualizarSeguimientoApi = async (id_seguimiento, estado_seguimiento) => {
  const response = await axiosClient.put(`/seguimientos/actualizar/${id_seguimiento}`, {
    estado_seguimiento,
  });
  return response.data;
};