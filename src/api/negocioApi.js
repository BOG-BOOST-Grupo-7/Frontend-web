import { axiosClient } from "./axiosClient";

// ===============================
// CLIENTE
// ===============================

// Crear solicitud de negocio
export const registrarNegocio = async (datos) => {
  const { data } = await axiosClient.post(
    "/negocio/solicitud",
    datos
  );

  return data;
};

// ===============================
// SUPER ADMIN
// ===============================

// Ver todas las solicitudes
export const obtenerSolicitudes = async () => {
  const { data } = await axiosClient.get("/negocio");

  return data;
};

// Lista de negocios
export const obtenerNegocios = async () => {
  const { data } = await axiosClient.get("/negocio");

  return data;
};

// Obtener un negocio por id
export const obtenerNegocioPorId = async (id) => {
  const { data } = await axiosClient.get(`/negocio/${id}`);

  return data;
};

// Aprobar solicitud
export const aprobarSolicitud = async (id_negocio) => {
  const { data } = await axiosClient.put(
    "/negocio/aprobar",
    {
      id_negocio,
    }
  );

  return data;
};

// Rechazar solicitud
export const rechazarSolicitud = async (
  id_negocio,
  observacion_admin
) => {
  const { data } = await axiosClient.put(
    "/negocio/rechazar",
    {
      id_negocio,
      observacion_admin,
    }
  );

  return data;
};

// ===============================
// VENDEDOR
// ===============================

// Obtener mi negocio
export const obtenerMiNegocio = async () => {
  const { data } = await axiosClient.get(
    "/negocio/mi-negocio"
  );

  return data;
};
// Actualizar negocio
export const actualizarNegocio = async (id, datos) => {
  const { data } = await axiosClient.put(
    `/negocio/actualizar/${id}`,
    datos
  );

  return data;
};

export const desactivarNegocio = async (id) => {
  const { data } = await axiosClient.put(
    `/negocio/${id}/desactivar`
  );

  return data;
};

// ===============================
// PÚBLICO
// ===============================

// Obtener negocios públicos (sin auth)
export const obtenerNegociosPublicos = async () => {
  const { data } = await axiosClient.get("/negocio/publicos");
  return data;
};