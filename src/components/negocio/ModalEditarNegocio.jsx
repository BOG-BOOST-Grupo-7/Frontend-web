import { useEffect, useState } from "react";
import { actualizarNegocio } from "../../api/negocioApi";

export default function ModalEditarNegocio({
    negocio,
    abierto,
    onClose,
    onActualizado
}) {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [telefono, setTelefono] = useState("");
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (negocio) {
            setNombre(
                negocio.nombre_negocio || ""
            );
            setDescripcion(
                negocio.descripcion_negocio || ""
            );
            setTelefono(
                negocio.telefono_negocio || ""
            );
        }
    }, [negocio]);

    if (!abierto) return null;

    const guardar = async () => {
        try {
            setGuardando(true);

            await actualizarNegocio(
                negocio.id_negocio,
                {
                    nombre_negocio: nombre,
                    descripcion_negocio: descripcion,
                    telefono_negocio: telefono
                }
            );

            alert("Negocio actualizado correctamente.");
            onActualizado();
            onClose();

        } catch (error) {
            console.error(error);
            alert("No fue posible actualizar el negocio.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <dialog
            open
            className="modal-overlay"
            aria-labelledby="titulo-editar-negocio"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="modal-content">
                <div className="modal-header">
                    <h2 id="titulo-editar-negocio">
                        Editar negocio
                    </h2>
                    <button
                        className="modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="nombre-negocio">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="nombre-negocio"
                            value={nombre}
                            onChange={(e) => {
                                // Permitir solo letras, acentos, eñes y espacios
                                const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                                setNombre(soloLetras);
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcion-negocio">
                            Descripción
                        </label>
                        <textarea
                            id="descripcion-negocio"
                            rows={4}
                            value={descripcion}
                            onChange={(e) =>
                                setDescripcion(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefono-negocio">
                            Teléfono
                        </label>
                        <input
                            type="text"
                            id="telefono-negocio"
                            inputMode="numeric"
                            value={telefono}
                            onChange={(e) => {
                                // Permitir únicamente números
                                const soloNumeros = e.target.value.replace(/\D/g, "");
                                setTelefono(soloNumeros);
                            }}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-orange"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className="btn-green"
                        disabled={guardando}
                        onClick={guardar}
                    >
                        {
                            guardando
                                ? "Guardando..."
                                : "Guardar"
                        }
                    </button>
                </div>
            </div>
        </dialog>
    );
}