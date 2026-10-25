import { axiosClient } from "./axiosClient";

export const getNegocioUsuario = async (id_perfil) => {
  const response = await axiosClient.get(`/movimientos-stock/negocio-usuario?id_perfil=${id_perfil}`);
  return response;
};

export const listarMovimientos = async (id_negocio) => {
  const response = await axiosClient.get(`/movimientos-stock?id_negocio=${id_negocio}`);
  return response;
};