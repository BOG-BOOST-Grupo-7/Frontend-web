import { axiosClient } from "./axiosClient";

export const registerUser = (data) => {
  return axiosClient.post("auth/register", data);
};

export const loginUser = (data) => {
  return axiosClient.post("auth/login", data);
};

export const me = () => {
  return axiosClient.get("auth/me");
};

export const logoutUser = () => {
  return axiosClient.post("auth/logout");
};

export const recuperarPasswordRequest = (email) => {
  return axiosClient.post("auth/recuperar-password", { email });
};

export const cambiarPasswordRequest = (password) => {
  return axiosClient.put("auth/cambiar-password", { password });
};