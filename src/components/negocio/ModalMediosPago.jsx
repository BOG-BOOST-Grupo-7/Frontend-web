import { useEffect, useState } from "react";
import {
    FaPlus,
    FaEdit,
    FaTrash
} from "react-icons/fa";

import {
    obtenerMisMediosPago,
    crearMedioPago,
    actualizarMedioPago,
    eliminarMedioPago
} from "../../api/medioPagoApi";

import "../../styles/PerfilNegocio.css";

export default function ModalMediosPago({
    abierto,
    onClose,
    idNegocio
}) {
    const [medios, setMedios] = useState([]);
    const [formulario, setFormulario] = useState({
        nombre_medio: "",
        numero_medio: "",
        llave_medio: ""
    });

    const [editando, setEditando] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (abierto) {
            cargarMedios();
            limpiarFormulario();
        }
    }, [abierto]);

    const cargarMedios = async () => {
        try {
            const data = await obtenerMisMediosPago();
            setMedios(data);
        } catch (error) {
            console.error(error);
        }
    };

    const guardar = async () => {
        setError("");

        // Validaciones
        if (!formulario.nombre_medio.trim()) {
            setError("El nombre del medio de pago es obligatorio.");
            return;
        }
        if (formulario.nombre_medio.trim().length > 20) {
            setError("El nombre no puede superar los 20 caracteres.");
            return;
        }

        if (!formulario.numero_medio.trim()) {
            setError("El número es obligatorio.");
            return;
        }
        if (!/^\d{6,20}$/.test(formulario.numero_medio.trim())) {
            setError("El número debe tener entre 6 y 20 dígitos.");
            return;
        }

        try {
            if (editando) {
                await actualizarMedioPago(editando, formulario);
            } else {
                await crearMedioPago({
                    ...formulario,
                    id_negocio: idNegocio
                });
            }

            limpiarFormulario();
            cargarMedios();
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.mensaje || "Error al guardar el medio de pago.");
        }
    };

    const editar = (medio) => {
        setEditando(medio.id_medio_pago);
        setFormulario({
            nombre_medio: medio.nombre_medio,
            numero_medio: medio.numero_medio,
            llave_medio: medio.llave_medio || ""
        });
        setError("");
    };

    const eliminar = async (id) => {
        const confirmar = window.confirm(
            "¿Estás seguro de eliminar este medio de pago?\n\n" +
            "• Si NO tiene ventas, se eliminará.\n" +
            "• Si YA tiene ventas, se marcará como INACTIVO y desaparecerá del formulario de compra."
        );

        if (!confirmar) return;

        try {
            const respuesta = await eliminarMedioPago(id);
            alert(respuesta.mensaje);
            cargarMedios();
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert(error.response?.data?.mensaje || "No se pudo procesar la solicitud.");
        }
    };

    const limpiarFormulario = () => {
        setFormulario({
            nombre_medio: "",
            numero_medio: "",
            llave_medio: ""
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
                            ? "Editar medio de pago"
                            : "Administrar medios de pago"}
                    </h2>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="error-banner" style={{ marginBottom: "15px" }}>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Nombre del medio</label>
                        <input
                            type="text"
                            placeholder="Ej: Nequi"
                            value={formulario.nombre_medio}
                            onChange={(e) => {
                                const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                                setFormulario({
                                    ...formulario,
                                    nombre_medio: soloLetras
                                });
                            }}
                            maxLength={20}
                        />
                    </div>

                    <div className="form-group">
                        <label>Número</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Número (6 a 20 dígitos)"
                            value={formulario.numero_medio}
                            onChange={(e) => {
                                const soloNumeros = e.target.value.replace(/\D/g, "");
                                setFormulario({
                                    ...formulario,
                                    numero_medio: soloNumeros
                                });
                            }}
                            maxLength={20}
                        />
                    </div>

                    <div className="form-group">
                        <label>Llave</label>
                        <input
                            type="text"
                            placeholder="Correo o celular (opcional)"
                            value={formulario.llave_medio}
                            onChange={(e) =>
                                setFormulario({
                                    ...formulario,
                                    llave_medio: e.target.value
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
                        {medios.length === 0 ? (
                            <p className="sin-medios">
                                No has registrado medios de pago.
                            </p>
                        ) : (
                            medios.map((medio) => (
                                <div className="card-medio" key={medio.id_medio_pago}>
                                    <h4>
                                        {medio.nombre_medio}
                                        {medio.estado === "INACTIVO" && (
                                            <span className="badge-inactivo">INACTIVO</span>
                                        )}
                                    </h4>
                                    <p>
                                        <strong>Número:</strong> {medio.numero_medio}
                                    </p>
                                    <p>
                                        <strong>Llave:</strong> {medio.llave_medio || "Sin llave"}
                                    </p>
                                    <div className="acciones-medio">
                                        <button
                                            className="btn-orange"
                                            onClick={() => editar(medio)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => eliminar(medio.id_medio_pago)}
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