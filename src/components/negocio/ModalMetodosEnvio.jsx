import { useEffect, useState } from "react";
import {
    FaPlus,
    FaEdit,
    FaTrash
} from "react-icons/fa";

import {
    obtenerMisMetodosEnvio,
    crearMetodoEnvio,
    actualizarMetodoEnvio,
    eliminarMetodoEnvio
} from "../../api/metodoEnvioApi";

import "../../styles/PerfilNegocio.css";

export default function ModalMetodosEnvio({
    abierto,
    onClose,
    idNegocio
}) {
    const [metodos, setMetodos] = useState([]);

    const [formulario, setFormulario] = useState({
        nombre_metodo: "",
        descripcion_metodo: "",
        costo_envio: ""
    });

    const [editando, setEditando] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (abierto) {
            cargarMetodos();
            limpiarFormulario();
        }
    }, [abierto]);

    const cargarMetodos = async () => {
        try {
            const data = await obtenerMisMetodosEnvio();
            setMetodos(data);
        } catch (error) {
            console.error(error);
        }
    };

    const guardar = async () => {
        setError("");

        // Validaciones
        if (!formulario.nombre_metodo.trim()) {
            setError("El nombre del método de envío es obligatorio.");
            return;
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formulario.nombre_metodo.trim())) {
            setError("El nombre solo puede contener letras y espacios.");
            return;
        }
        if (formulario.nombre_metodo.trim().length > 50) {
            setError("El nombre no puede superar los 50 caracteres.");
            return;
        }

        if (!formulario.descripcion_metodo.trim()) {
            setError("La descripción es obligatoria.");
            return;
        }
        if (formulario.descripcion_metodo.trim().length > 255) {
            setError("La descripción no puede superar los 255 caracteres.");
            return;
        }

        if (
            formulario.costo_envio === "" ||
            formulario.costo_envio === null ||
            isNaN(formulario.costo_envio) ||
            Number(formulario.costo_envio) < 0
        ) {
            setError("El costo de envío debe ser un número mayor o igual a 0.");
            return;
        }

        try {
            if (editando) {
                await actualizarMetodoEnvio(editando, formulario);
            } else {
                await crearMetodoEnvio({
                    ...formulario,
                    id_negocio: idNegocio
                });
            }

            limpiarFormulario();
            cargarMetodos();
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.mensaje || "Error al guardar el método de envío.");
        }
    };

    const editar = (metodo) => {
        setEditando(metodo.id_metodo_envio);

        setFormulario({
            nombre_metodo: metodo.nombre_metodo,
            descripcion_metodo: metodo.descripcion_metodo,
            costo_envio: metodo.costo_envio
        });
        setError("");
    };

    const eliminar = async (id) => {
        const confirmar = window.confirm(
            "¿Estás seguro de eliminar este método de envío?\n\n" +
            "• Si NO tiene ventas, se eliminará.\n" +
            "• Si YA tiene ventas, se marcará como INACTIVO y desaparecerá del formulario de compra."
        );

        if (!confirmar) return;

        try {
            const respuesta = await eliminarMetodoEnvio(id);
            alert(respuesta.mensaje);
            cargarMetodos();
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert(error.response?.data?.mensaje || "No se pudo procesar la solicitud.");
        }
    };

    const limpiarFormulario = () => {
        setFormulario({
            nombre_metodo: "",
            descripcion_metodo: "",
            costo_envio: ""
        });

        setEditando(null);
        setError("");
    };

    if (!abierto) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>
                        {editando
                            ? "Editar método de envío"
                            : "Administrar métodos de envío"}
                    </h2>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="error-banner" style={{ marginBottom: "15px" }}>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Nombre</label>
                        <input
                            type="text"
                            placeholder="Ej: Domicilio"
                            value={formulario.nombre_metodo}
                            onChange={(e) => {
                                const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                                setFormulario({
                                    ...formulario,
                                    nombre_metodo: soloLetras
                                });
                            }}
                            maxLength={50}
                        />
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <input
                            placeholder="Descripción (máx. 255 caracteres)"
                            value={formulario.descripcion_metodo}
                            onChange={(e) =>
                                setFormulario({
                                    ...formulario,
                                    descripcion_metodo: e.target.value
                                })
                            }
                            maxLength={255}
                        />
                    </div>

                    <div className="form-group">
                        <label>Costo</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Ej: 15000"
                            value={formulario.costo_envio}
                            onChange={(e) =>
                                setFormulario({
                                    ...formulario,
                                    costo_envio:
                                        e.target.value === ""
                                            ? ""
                                            : Number(e.target.value)
                                })
                            }
                        />
                    </div>

                    <div className="acciones-formulario">
                        <button className="btn-green" onClick={guardar}>
                            {editando ? <FaEdit /> : <FaPlus />}
                            <span>{editando ? "Actualizar" : "Guardar"}</span>
                        </button>

                        {editando && (
                            <button
                                type="button"
                                className="btn-orange"
                                onClick={limpiarFormulario}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>

                    <div className="lista-medios">
                        {metodos.length === 0 ? (
                            <p className="sin-medios">
                                No has registrado métodos de envío.
                            </p>
                        ) : (
                            metodos.map((metodo) => (
                                <div className="card-medio" key={metodo.id_metodo_envio}>
                                    <h4>
                                        {metodo.nombre_metodo}
                                        {metodo.estado === "INACTIVO" && (
                                            <span className="badge-inactivo">INACTIVO</span>
                                        )}
                                    </h4>
                                    <p>
                                        <strong>Descripción:</strong> {metodo.descripcion_metodo}
                                    </p>
                                    <p>
                                        <strong>Costo:</strong>{" "}
                                        {Number(metodo.costo_envio).toLocaleString("es-CO", {
                                            style: "currency",
                                            currency: "COP"
                                        })}
                                    </p>
                                    <div className="acciones-medio">
                                        <button
                                            className="btn-orange"
                                            onClick={() => editar(metodo)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => eliminar(metodo.id_metodo_envio)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-orange"
                        onClick={() => {
                            limpiarFormulario();
                            onClose();
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}