import { axiosClient } from "./axiosClient";

export const subirLogo = async (archivo) => {

    const formData = new FormData();

    formData.append("logo", archivo);

    const { data } = await axiosClient.post(

        "/upload/logo",

        formData,

        {

            headers: {

                "Content-Type": "multipart/form-data"

            }

        }

    );

    return data;

};

export const subirImagenProducto = async (archivo) => {

    const formData = new FormData();

    formData.append("imagen", archivo);

    const { data } = await axiosClient.post(

        "/upload/producto",

        formData,

        {

            headers: {

                "Content-Type": "multipart/form-data"

            }

        }

    );

    return data;

};

export const subirFotoPerfil = async (archivo) => {

    const formData = new FormData();

    formData.append("foto", archivo);

    const { data } = await axiosClient.post(

        "/upload/perfil",

        formData,

        {

            headers: {

                "Content-Type": "multipart/form-data"

            }

        }

    );

    return data;

};