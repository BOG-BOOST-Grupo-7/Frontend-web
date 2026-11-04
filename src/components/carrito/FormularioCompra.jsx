import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { obtenerMiPerfil, actualizarPerfil } from "../../api/perfilApi";
import { obtenerMediosPagoPorNegocio } from "../../api/medioPagoApi";
import { obtenerMetodosEnvioPorNegocio } from "../../api/metodoEnvioApi";
import { confirmarCarrito, obtenerDatosUltimaCompra } from "../../api/ventaApi";
import ModalComprobante from './ModalComprobante';

import "../../styles/FormularioCompra.css";

function FormularioCompra({
    carrito,
    total,
    onCerrar,
    onCompraExitosa
}) {

    const [perfil, setPerfil] = useState({
        primer_nombre: "",
        segundo_nombre: "",
        primer_apellido: "",
        segundo_apellido: "",
        id_tipo_documento: "",
        numero_documento: "",
        email: ""
    });

    const [mediosPago, setMediosPago] = useState([]);
    const [metodosEnvio, setMetodosEnvio] = useState([]);
    const [idMedioPago, setIdMedioPago] = useState("");
    const [idMetodoEnvio, setIdMetodoEnvio] = useState("");
    const [telefono, setTelefono] = useState("");

    // Dirección separada por campos para Bogotá
    const [direccion, setDireccion] = useState({
        tipoVia: "",
        numeroVia: "",
        sufijoVia: "",
        numeroCruce: "",
        numeroPlaca: "",
        sufijoPlaca: "",
        complemento: "",
        barrio: ""
    });

    const [showComprobante, setShowComprobante] = useState(false);
    const [ventaConfirmada, setVentaConfirmada] = useState(null);
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        if (carrito && carrito.length > 0) {
            const id = carrito[0].id_negocio;

            if (id !== undefined && id !== null) {
                void cargarDatos(id);
            }
        }
    }, [carrito]);

    useEffect(() => {
        void cargarPerfil();
        void cargarDatosUltimaCompra();
    }, []);

    const cargarDatos = async (id) => {
        try {
            const pagos = await obtenerMediosPagoPorNegocio(id);
            const envios = await obtenerMetodosEnvioPorNegocio(id);
            setMediosPago(pagos);
            setMetodosEnvio(envios);
        } catch (error) {
            console.error("Error al cargar:", error);
            toast.error("No fue posible cargar la información.");
        }
    };

    const cargarPerfil = async () => {
        try {
            const data = await obtenerMiPerfil();
            setPerfil({
                primer_nombre: data.primer_nombre ?? "",
                segundo_nombre: data.segundo_nombre ?? "",
                primer_apellido: data.primer_apellido ?? "",
                segundo_apellido: data.segundo_apellido ?? "",
                id_tipo_documento: data.id_tipo_documento ?? "",
                numero_documento: data.numero_documento ?? "",
                email: data.email ?? ""
            });
        } catch (error) {
            console.error(error);
        }
    };

    const cargarDatosUltimaCompra = async () => {
        try {
            const data = await obtenerDatosUltimaCompra();
            if (data?.telefono) {
                setTelefono(data.telefono);
            }
        } catch (error) {
            console.error("No se pudieron cargar los últimos datos:", error);
        }
    };

    const handlePerfilChange = (e) => {
        const { name, value } = e.target;
        let valorValidado = value;

        const camposNombres = ["primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido"];
        
        if (camposNombres.includes(name)) {
            valorValidado = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
        }

        if (name === "numero_documento") {
            valorValidado = value.replace(/\D/g, ""); 
        }

        setPerfil({
            ...perfil,
            [name]: valorValidado
        });
    };

    const handleTelefonoChange = (e) => {
        const soloNumeros = e.target.value.replace(/\D/g, "").slice(0, 10);
        setTelefono(soloNumeros);
    };

    const handleDireccionChange = (e) => {
        const { name, value } = e.target;
        setDireccion((prev) => ({ ...prev, [name]: value }));
    };

    const construirDireccion = () => {
        const { tipoVia, numeroVia, sufijoVia, numeroCruce, numeroPlaca, sufijoPlaca, complemento, barrio } = direccion;
        if (!tipoVia || !numeroVia || !numeroCruce || !numeroPlaca || !barrio) return "";

        let dir = `${tipoVia} ${numeroVia}`;
        if (sufijoVia) dir += ` ${sufijoVia}`;
        dir += ` # ${numeroCruce}-${numeroPlaca}`;
        if (sufijoPlaca) dir += ` ${sufijoPlaca}`;
        if (complemento) dir += `, ${complemento}`;
        if (barrio) dir += `, Barrio ${barrio}`;
        dir += `, Bogotá D.C.`;
        return dir;
    };

    const confirmarCompra = async () => {
        if (procesando) return;

        if (!perfil.primer_nombre || !perfil.primer_apellido || !perfil.id_tipo_documento || !perfil.numero_documento) {
            toast.error("Completa los datos de tu perfil.");
            return;
        }

        if (telefono.length !== 10) {
            toast.error("El teléfono debe tener exactamente 10 números.");
            return;
        }

        if (!idMedioPago || !idMetodoEnvio) {
            toast.error("Selecciona un medio de pago y un método de envío.");
            return;
        }

        if (!direccion.tipoVia || !direccion.numeroVia || !direccion.numeroCruce || !direccion.numeroPlaca || !direccion.barrio) {
            toast.error("Completa todos los campos de la dirección.");
            return;
        }

        const direccionCompleta = construirDireccion();

        try {
            setProcesando(true); 

            await actualizarPerfil({
                primer_nombre: perfil.primer_nombre,
                segundo_nombre: perfil.segundo_nombre,
                primer_apellido: perfil.primer_apellido,
                segundo_apellido: perfil.segundo_apellido,
                id_tipo_documento: perfil.id_tipo_documento ? Number(perfil.id_tipo_documento) : "",
                numero_documento: perfil.numero_documento ? Number(perfil.numero_documento) : ""
            });

            const payload = {
                id_medio_pago: Number(idMedioPago),
                id_metodo_envio: Number(idMetodoEnvio),
                telefono,
                direccion: direccionCompleta,
                carrito: carrito.map((p) => ({
                    id_producto: p.id_producto,
                    cantidad: p.cantidad
                }))
            };

            const data = await confirmarCarrito(payload);
            toast.success(data.mensaje);

            setVentaConfirmada(data.venta);
            setShowComprobante(true);
            
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.mensaje || "Error del servidor");
        } finally {
            setProcesando(false); 
        }
    };

    const metodoSeleccionado = metodosEnvio.find((m) => m.id_metodo_envio == idMetodoEnvio);
    const costoEnvio = Number(metodoSeleccionado?.costo_envio || 0);
    const totalCompra = Number(total || 0) + costoEnvio;

    return (
        <div className="modal-overlay">
            {!showComprobante ? (
                <div className="modal-compra">
                    <h2>Finalizar compra</h2>
                    <div className="contenido-compra">
                        <div className="seccion-compra">
                            <h3>Datos del comprador</h3>

                            <label htmlFor="primer_nombre">Primer nombre</label>
                            <input
                                id="primer_nombre"
                                className="campo-compra"
                                type="text"
                                name="primer_nombre"
                                value={perfil.primer_nombre}
                                onChange={handlePerfilChange}
                            />

                            <label htmlFor="segundo_nombre">Segundo nombre</label>
                            <input
                                id="segundo_nombre"
                                className="campo-compra"
                                type="text"
                                name="segundo_nombre"
                                value={perfil.segundo_nombre}
                                onChange={handlePerfilChange}
                            />

                            <label htmlFor="primer_apellido">Primer apellido</label>
                            <input
                                id="primer_apellido"
                                className="campo-compra"
                                type="text"
                                name="primer_apellido"
                                value={perfil.primer_apellido}
                                onChange={handlePerfilChange}
                            />

                            <label htmlFor="segundo_apellido">Segundo apellido</label>
                            <input
                                id="segundo_apellido"
                                className="campo-compra"
                                type="text"
                                name="segundo_apellido"
                                value={perfil.segundo_apellido}
                                onChange={handlePerfilChange}
                            />

                            <label htmlFor="id_tipo_documento">Tipo documento</label>
                            <select
                                id="id_tipo_documento"
                                className="campo-compra"
                                name="id_tipo_documento"
                                value={perfil.id_tipo_documento}
                                onChange={handlePerfilChange}
                            >
                                <option value="">Seleccione...</option>
                                <option value="1">Cédula de Ciudadanía</option>
                                <option value="2">Cédula de Extranjería</option>
                            </select>

                            <label htmlFor="numero_documento">Número documento</label>
                            <input
                                id="numero_documento"
                                className="campo-compra"
                                type="text"
                                name="numero_documento"
                                value={perfil.numero_documento}
                                onChange={handlePerfilChange}
                            />

                            <label htmlFor="email">Correo electrónico</label>
                            <input
                                id="email"
                                className="campo-compra"
                                type="email"
                                name="email"
                                value={perfil.email}
                                disabled
                            />
                        </div>

                        <div className="seccion-compra">
                            <h3>Datos de la compra</h3>

                            <label htmlFor="idMedioPago">Medio de pago</label>
                            <select
                                id="idMedioPago"
                                className="campo-compra"
                                value={idMedioPago}
                                onChange={(e) => setIdMedioPago(e.target.value)}
                            >
                                <option value="">Seleccione...</option>
                                {mediosPago.map((medio) => (
                                    <option key={medio.id_medio_pago} value={medio.id_medio_pago}>
                                        {medio.nombre_medio}
                                    </option>
                                ))}
                            </select>

                            <label htmlFor="idMetodoEnvio">Método de envío</label>
                            <select
                                id="idMetodoEnvio"
                                className="campo-compra"
                                value={idMetodoEnvio}
                                onChange={(e) => setIdMetodoEnvio(e.target.value)}
                            >
                                <option value="">Seleccione...</option>
                                {metodosEnvio.map((metodo) => (
                                    <option key={metodo.id_metodo_envio} value={metodo.id_metodo_envio}>
                                        {metodo.nombre_metodo}
                                    </option>
                                ))}
                            </select>

                            {metodoSeleccionado?.descripcion_metodo && (
                                <p className="descripcion-envio">
                                    <strong>Descripción:</strong> {metodoSeleccionado.descripcion_metodo}
                                </p>
                            )}

                            <label htmlFor="telefono">Teléfono</label>
                            <input
                                id="telefono"
                                className="campo-compra"
                                type="text"
                                value={telefono}
                                onChange={handleTelefonoChange}
                                placeholder="Ej: 3001234567"
                                maxLength="10"
                            />

                            <label htmlFor="direccion">Dirección (Bogotá D.C.)</label>
                            <div className="direccion-grid">
                                <select
                                    id="direccion"
                                    className="campo-compra direccion-campo"
                                    name="tipoVia"
                                    value={direccion.tipoVia}
                                    onChange={handleDireccionChange}
                                    style={{ flex: '0 0 110px' }}
                                >
                                    <option value="">Tipo vía</option>
                                    <option value="Calle">Calle</option>
                                    <option value="Carrera">Carrera</option>
                                    <option value="Avenida">Avenida</option>
                                    <option value="Transversal">Transversal</option>
                                    <option value="Diagonal">Diagonal</option>
                                    <option value="Autopista">Autopista</option>
                                </select>

                                <input 
                                    className="campo-compra direccion-campo" 
                                    type="text" 
                                    name="numeroVia" 
                                    value={direccion.numeroVia} 
                                    onChange={handleDireccionChange} 
                                    placeholder="Nº(ej: 45)" 
                                    maxLength={4}
                                    style={{ flex: '0 0 60px' }}
                                />

                                <input 
                                    className="campo-compra direccion-campo" 
                                    type="text" 
                                    name="sufijoVia" 
                                    value={direccion.sufijoVia} 
                                    onChange={handleDireccionChange} 
                                    placeholder="(ej: Bis Sur)" 
                                    maxLength={10}
                                    style={{ flex: '0 0 110px' }}
                                />

                                <span className="direccion-hash">#</span>

                                <input 
                                    className="campo-compra direccion-campo" 
                                    type="text" 
                                    name="numeroCruce" 
                                    value={direccion.numeroCruce} 
                                    onChange={handleDireccionChange} 
                                    placeholder="Cruce (ej: 12)" 
                                    maxLength={4}
                                    style={{ flex: '0 0 60px' }}
                                />

                                <span className="direccion-hash">-</span>

                                <input 
                                    className="campo-compra direccion-campo" 
                                    type="text" 
                                    name="numeroPlaca" 
                                    value={direccion.numeroPlaca} 
                                    onChange={handleDireccionChange} 
                                    placeholder="(ej: 34)" 
                                    maxLength={4}
                                    style={{ flex: '0 0 60px' }}
                                />

                                <input 
                                    className="campo-compra direccion-campo" 
                                    type="text" 
                                    name="sufijoPlaca" 
                                    value={direccion.sufijoPlaca} 
                                    onChange={handleDireccionChange} 
                                    placeholder="(ej: Sur)" 
                                    maxLength={10}
                                    style={{ flex: '0 0 100px' }}
                                />
                            </div>

                            <div className="direccion-grid">
                                <input 
                                    className="campo-compra direccion-campo" 
                                    type="text" 
                                    name="complemento" 
                                    value={direccion.complemento} 
                                    onChange={handleDireccionChange} 
                                    placeholder="Apto, Torre, Interior..." 
                                    maxLength={20}
                                    style={{ flex: 1 }}
                                />

                                <input 
                                    className="campo-compra direccion-campo" 
                                    type="text" 
                                    name="barrio" 
                                    value={direccion.barrio} 
                                    onChange={handleDireccionChange} 
                                    placeholder="Barrio" 
                                    maxLength={40}
                                    style={{ flex: 1 }}
                                />
                            </div>

                            <p className="direccion-preview">
                                <strong>Dirección:</strong> {construirDireccion() || "Completa los campos"}
                            </p>
                            
                            <div className="total-box">
                                <h4>Resumen</h4>
                                <div className="linea-total"><span>Productos</span><span>{total.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</span></div>
                                <div className="linea-total"><span>Envío</span><span>{costoEnvio.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</span></div>
                                <hr />
                                <div className="linea-total total-final"><span>Total</span><span>{totalCompra.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="botones-modal">
                        <button onClick={onCerrar} disabled={procesando}>Cancelar</button>
                        <button onClick={confirmarCompra} disabled={procesando}>
                            {procesando ? "Procesando..." : "Confirmar compra"}
                        </button>
                    </div>
                </div>
            ) : (
                <ModalComprobante 
                    venta={ventaConfirmada} 
                    onClose={() => {
                        setShowComprobante(false);
                        onCompraExitosa(); 
                        onCerrar();        
                    }} 
                />
            )}
        </div>
    );
}

export default FormularioCompra;