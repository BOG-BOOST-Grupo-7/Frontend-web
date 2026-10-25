import { axiosClient } from "./axiosClient";

export const getAllStands = async () => {
  const { data } = await axiosClient.get("/puesto");
  return data;
};

export const getNegociosAprobados = async () => {
  const { data } = await axiosClient.get("/puesto/negocios-aprobados");
  return data;
};

export const getAvailableStands = async () => {
  const { data } = await axiosClient.get("/puesto/disponibles");
  return data;
};