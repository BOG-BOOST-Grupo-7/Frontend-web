import { useEffect, useState } from "react";
import { FaPlus, FaEdit } from "react-icons/fa";
import { crearProducto, actualizarProducto } from "../../api/productoApi";
import { obtenerCategorias } from "../../api/categoriaApi";
import { subirImagenProducto } from "../../api/uploadApi";
import "../../styles/PerfilNegocio.css";

export default function ModalProductos({ abierto, onClose, idNegocio, productoAEditar }) {
    const [categorias, setCategorias] = useState([]);
    const [previewImagen, setPreviewImagen] = useState("");
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [error, setError] = useState("");

    const [formulario, setFormulario] = useState({
        id_categoria: "",
        nombre_producto: "",
        descripcion: "",
        caracteristicas: "",
        stock: "",
        precio: "",
        imagen: "",
        estado_producto: "DISPONIBLE"
    });

    useEffect(() => {
        if (abierto) {
            cargarCategorias();
            if (productoAEditar) {
                setFormulario({
                    id_categoria: productoAEditar.id_categoria || "",
                    nombre_producto: productoAEditar.nombre_producto || "",
                    descripcion: productoAEditar.descripcion || "",
                    caracteristicas: productoAEditar.caracteristicas || "",
                    stock: productoAEditar.stock ?? "",
                    precio: productoAEditar.precio ?? "",
                    imagen: productoAEditar.imagen || "",
                    estado_producto: productoAEditar.estado_producto || "DISPONIBLE" // 👈 Cargar estado
                });
                setPreviewImagen(productoAEditar.imagen || "");
            } else {
                limpiarFormulario();
            }
            setError("");
        }
    }, [abierto, productoAEditar]);

    const cargarCategorias = async () => {
        try {
            const data = await obtenerCategorias();

            // Filtramos solo las categorías ACTIVAS
            const categoriasActivas = data.filter(
                (cat) => cat.estado === "ACTIVO" || cat.estado === null || cat.estado === undefined
            );

            // Si estamos editando un producto cuya categoría está inactiva,
            // también la agregamos al array para que no se pierda el valor actual.
            if (productoAEditar?.id_categoria) {
                const categoriaActual = data.find(
                    (cat) => String(cat.id_categoria) === String(productoAEditar.id_categoria)
                );
                if (categoriaActual && !categoriasActivas.some(c => c.id_categoria === categoriaActual.id_categoria)) {
                    categoriasActivas.unshift(categoriaActual);
                }
            }

            setCategorias(categoriasActivas);
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        }
    };

    const subirImagen = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Solo se permiten imágenes");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("El archivo supera el máximo de 5MB");
            return;
        }

        try {
            setPreviewImagen(URL.createObjectURL(file));
            setSubiendoImagen(true);
            const respuesta = await subirImagenProducto(file);
            
            setFormulario((prev) => ({
                ...prev,
                imagen: respuesta.url
            }));
        } catch (error) {
            alert(error.response?.data?.mensaje || error.message || "Error al subir la imagen");
        } finally {
            setSubiendoImagen(false);
        }
    };

    const guardar = async () => {
        setError("");

        // Validaciones
        if (!formulario.id_categoria) {
            setError("Selecciona una categoría.");
            return;
        }
        if (!formulario.nombre_producto.trim()) {
            setError("El nombre del producto es obligatorio.");
            return;
        }
        if (formulario.nombre_producto.trim().length > 200) {
            setError("El nombre no puede superar los 200 caracteres.");
            return;
        }
        if (!formulario.descripcion.trim()) {
            setError("La descripción es obligatoria.");
            return;
        }
        if (formulario.descripcion.trim().length < 10 || formulario.descripcion.trim().length > 1000) {
            setError("La descripción debe tener entre 10 y 1000 caracteres.");
            return;
        }
        if (formulario.stock === "" || isNaN(formulario.stock) || Number(formulario.stock) < 0) {
            setError("El stock debe ser un número mayor o igual a 0.");
            return;
        }
        if (formulario.precio === "" || isNaN(formulario.precio) || Number(formulario.precio) < 0) {
            setError("El precio debe ser un número mayor o igual a 0.");
            return;
        }
        if (!formulario.imagen) {
            setError("Debes subir una imagen del producto.");
            return;
        }

        try {
            if (productoAEditar) {
                await actualizarProducto(productoAEditar.id_producto, formulario);
            } else {
                await crearProducto({
                    ...formulario,
                    id_negocio: idNegocio
                });
            }
            onClose();
        } catch (error) {
            console.error("Error al guardar producto:", error);
            setError(error.response?.data?.mensaje || "Ocurrió un error al guardar el producto.");
        }
    };

    const limpiarFormulario = () => {
        setFormulario({
            id_categoria: "",
            nombre_producto: "",
            descripcion: "",
            caracteristicas: "",
            stock: "",
            precio: "",
            imagen: "",
            estado_producto: "DISPONIBLE"
        });
        setPreviewImagen("");
    };

    if (!abierto) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content modal-productos-content">
                <div className="modal-header">
                    <h2>{productoAEditar ? "Editar Producto" : "Registrar Nuevo Producto"}</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="error-banner" style={{ marginBottom: "15px" }}>
                            {error}
                        </div>
                    )}

                    {/* Aviso si el producto está inactivo */}
                    {productoAEditar?.estado_producto === "INACTIVO" && (
                        <div style={{
                            background: "#fff8e1",
                            border: "1px solid #f39c12",
                            borderRadius: "8px",
                            padding: "10px 15px",
                            marginBottom: "15px",
                            fontSize: "13px",
                            color: "#8c6d1f"
                        }}>
                            ⚠️ <strong>Aviso:</strong> Este producto está INACTIVO. Puedes cambiar su estado a "Disponible" para que vuelva a aparecer en el catálogo.
                        </div>
                    )}

                    <div className="form-seccion">
                        <div className="form-group">
                            <label>Imagen del producto</label>
                            <label className="logo-upload">
                                {previewImagen ? (
                                    <img src={previewImagen} alt="Producto" className="preview-logo" />
                                ) : (
                                    <>
                                        <div className="logo-icon">📦</div>
                                        <p>Haz clic para seleccionar la imagen</p>
                                        <small>PNG, JPG o WEBP (máx. 5MB)</small>
                                    </>
                                )}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={subirImagen}
                                />
                            </label>
                        </div>

                        {subiendoImagen && <div className="uploading">⏳ Subiendo imagen...</div>}

                        {previewImagen && !subiendoImagen && (
                            <button
                                type="button"
                                className="btn-eliminar-logo"
                                onClick={() => {
                                    setPreviewImagen("");
                                    setFormulario({ ...formulario, imagen: "" });
                                }}
                            >
                                🗑 Quitar / Cambiar imagen
                            </button>
                        )}

                        <div className="form-group">
                            <label>Categoría</label>
                            <select
                                value={formulario.id_categoria}
                                onChange={(e) => setFormulario({ ...formulario, id_categoria: e.target.value })}
                            >
                                <option value="">Seleccione una categoría</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id_categoria} value={categoria.id_categoria}>
                                        {categoria.nombre_categoria}
                                        {categoria.estado === "INACTIVO" && " (INACTIVA)"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Nombre</label>
                            <input
                                type="text"
                                placeholder="Nombre del producto"
                                value={formulario.nombre_producto}
                                onChange={(e) => setFormulario({ ...formulario, nombre_producto: e.target.value })}
                                maxLength={200}
                            />
                        </div>

                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea
                                rows="3"
                                placeholder="Descripción detallada (mínimo 10 caracteres)..."
                                value={formulario.descripcion}
                                onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                                maxLength={1000}
                            />
                        </div>

                        <div className="form-group">
                            <label>Características</label>
                            <textarea
                                rows="3"
                                placeholder="Características principales..."
                                value={formulario.caracteristicas}
                                onChange={(e) => setFormulario({ ...formulario, caracteristicas: e.target.value })}
                                maxLength={1000}
                            />
                        </div>

                        <div className="form-row" style={{ display: "flex", gap: "1rem" }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Stock</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formulario.stock}
                                    onChange={(e) => setFormulario({
                                        ...formulario,
                                        stock: e.target.value === "" ? "" : Number(e.target.value)
                                    })}
                                />
                            </div>

                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Precio</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formulario.precio}
                                    onChange={(e) => setFormulario({
                                        ...formulario,
                                        precio: e.target.value === "" ? "" : Number(e.target.value)
                                    })}
                                />
                            </div>
                        </div>

                        {/* campo para activar/desactivar */}
                        {productoAEditar && (
                            <div className="form-group">
                                <label>Estado del producto</label>
                                <select
                                    value={formulario.estado_producto}
                                    onChange={(e) => setFormulario({ ...formulario, estado_producto: e.target.value })}
                                >
                                    <option value="DISPONIBLE">Disponible (visible en el catálogo)</option>
                                    <option value="INACTIVO">Inactivo (oculto en el catálogo)</option>
                                    <option value="AGOTADO">Agotado (sin stock)</option>
                                </select>
                            </div>
                        )}

                        <div className="acciones-formulario" style={{ marginTop: "1.5rem", display: "flex", gap: "10px" }}>
                            <button
                                className="btn-green"
                                disabled={subiendoImagen}
                                onClick={guardar}
                            >
                                {productoAEditar ? <><FaEdit /> Actualizar Producto</> : <><FaPlus /> Guardar Producto</>}
                            </button>

                            <button
                                type="button"
                                className="btn-orange"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}