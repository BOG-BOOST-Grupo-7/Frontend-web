import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

import {
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria
} from "../../api/categoriaApi";

import "../../styles/PerfilNegocio.css";

export default function ModalCategorias({
    abierto,
    onClose,
    categoriaAEditar
}) {
    const [categorias, setCategorias] = useState([]);
    const [editando, setEditando] = useState(null);
    const [formulario, setFormulario] = useState({
        nombre_categoria: "",
        id_categoria_padre: "",
        estado: "ACTIVO" // 👈 Nuevo campo
    });
    const [errorValidacion, setErrorValidacion] = useState("");

    useEffect(() => {
        if (abierto) {
            cargarCategorias();
            if (categoriaAEditar) {
                setEditando(categoriaAEditar.id_categoria);
                setFormulario({
                    nombre_categoria: categoriaAEditar.nombre_categoria || "",
                    id_categoria_padre: categoriaAEditar.id_categoria_padre || "",
                    estado: categoriaAEditar.estado || "ACTIVO" // 👈 Cargar estado
                });
            } else {
                limpiarFormulario();
            }
        }
    }, [abierto, categoriaAEditar]);

    const cargarCategorias = async () => {
        try {
            const data = await obtenerCategorias();
            setCategorias(data);
        } catch (error) {
            console.error(error);
        }
    };

    const validarFormulario = () => {
        const nombreLimpio = formulario.nombre_categoria.trim();

        if (!nombreLimpio) {
            setErrorValidacion("El nombre de la categoría es obligatorio.");
            return false;
        }

        if (nombreLimpio.length < 2) {
            setErrorValidacion("El nombre debe tener al menos 2 caracteres.");
            return false;
        }

        const regexValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!regexValido.test(nombreLimpio)) {
            setErrorValidacion("El nombre de la categoría solo debe contener letras.");
            return false;
        }

        if (editando && String(formulario.id_categoria_padre) === String(editando)) {
            setErrorValidacion("Una categoría no puede ser padre de sí misma.");
            return false;
        }

        setErrorValidacion("");
        return true;
    };

    const guardar = async () => {
        if (!validarFormulario()) return;

        try {
            const datosAEnviar = {
                ...formulario,
                nombre_categoria: formulario.nombre_categoria.trim()
            };

            if (editando) {
                await actualizarCategoria(editando, datosAEnviar);
            } else {
                await crearCategoria(datosAEnviar);
            }

            limpiarFormulario();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const limpiarFormulario = () => {
        setFormulario({
            nombre_categoria: "",
            id_categoria_padre: "",
            estado: "ACTIVO"
        });
        setEditando(null);
        setErrorValidacion("");
    };

    if (!abierto) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {editando ? "Actualizar Categoría" : "Administrar Categorías"}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    {errorValidacion && (
                        <div className="error-message" style={{ color: "#d9534f", marginBottom: "15px", fontSize: "0.9rem", fontWeight: "500" }}>
                            {errorValidacion}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Nombre</label>
                        <input
                            type="text"
                            value={formulario.nombre_categoria}
                            onChange={(e) => {
                                const valorSinNumeros = e.target.value.replace(/[0-9]/g, "");
                                setFormulario({
                                    ...formulario,
                                    nombre_categoria: valorSinNumeros
                                });
                                if (errorValidacion) setErrorValidacion("");
                            }}
                            placeholder="Ej. Ropa, Mascotas..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Categoría padre</label>
                        <select
                            value={formulario.id_categoria_padre}
                            onChange={(e) =>
                                setFormulario({
                                    ...formulario,
                                    id_categoria_padre: e.target.value
                                })
                            }
                        >
                            <option value="">Ninguna</option>
                            {categorias
                                .filter((cat) => editando !== cat.id_categoria)
                                .map((cat) => {
                                    const esHija = Boolean(cat.id_categoria_padre);
                                    return (
                                        <option key={cat.id_categoria} value={cat.id_categoria}>
                                            {esHija ? `└─ ${cat.nombre_categoria}` : cat.nombre_categoria}
                                        </option>
                                    );
                                })}
                        </select>
                    </div>

                    {/* 👇 Nuevo campo para activar/desactivar */}
                    {editando && (
                        <div className="form-group">
                            <label>Estado</label>
                            <select
                                value={formulario.estado}
                                onChange={(e) =>
                                    setFormulario({
                                        ...formulario,
                                        estado: e.target.value
                                    })
                                }
                            >
                                <option value="ACTIVO">Activo (visible en el catálogo)</option>
                                <option value="INACTIVO">Inactivo (oculto en el catálogo)</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn-orange"
                        style={{ backgroundColor: "#e23e0c" }}
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn-orange"
                        onClick={guardar}
                    >
                        {editando ? "Actualizar" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}