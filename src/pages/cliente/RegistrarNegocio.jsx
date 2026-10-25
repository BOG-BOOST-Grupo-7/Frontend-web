import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { obtenerMiPerfil } from "../../api/perfilApi";
import { registrarNegocio } from "../../api/negocioApi";
import { subirLogo as subirLogoApi } from "../../api/uploadApi";
import { getAvailableStands } from "../../api/puestoApi";

import "../../styles/RegistrarNegocio.css"; 

function RegistrarNegocio() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [cargandoPerfil, setCargandoPerfil] = useState(true);

    const [datos, setDatos] = useState({
        nombre_negocio: "",
        descripcion_negocio: "",
        telefono_negocio: "",
        numero_puesto: "",
        logo: "",
    });

    const [subiendoLogo, setSubiendoLogo] = useState(false);
    const [previewLogo, setPreviewLogo] = useState("");
    const [loading, setLoading] = useState(false);
    const [availableStands, setAvailableStands] = useState([]);
    const [cargandoPuestos, setCargandoPuestos] = useState(false);
    const [error, setError] = useState("");

    // Estados para el dropdown con buscador integrado
    const [busquedaPuesto, setBusquedaPuesto] = useState("");
    const [dropdownAbierto, setDropdownAbierto] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const verificarPerfil = async () => {
            try {
                const perfil = await obtenerMiPerfil();

                const perfilIncompleto =
                    !perfil.primer_nombre ||
                    !perfil.primer_apellido ||
                    !perfil.id_tipo_documento ||
                    !perfil.numero_documento;

                if (perfilIncompleto) {
                    alert("Por favor, completa la información de tu perfil personal antes de registrar un negocio.");
                    navigate("/perfil");
                    return;
                }
            } catch (err) {
                console.error("Error al verificar el perfil:", err);
                alert("No se pudo verificar tu perfil. Inicia sesión nuevamente.");
            } finally {
                setCargandoPerfil(false);
            }
        };

        verificarPerfil();
    }, [navigate]);

    const loadAvailableStands = async () => {
        try {
            setCargandoPuestos(true);
            const data = await getAvailableStands();
            setAvailableStands(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al cargar puestos disponibles:", err);
            setError("Error al cargar los puestos disponibles.");
        } finally {
            setCargandoPuestos(false);
        }
    };

    useEffect(() => {
        loadAvailableStands();
    }, []);

    // Cerrar dropdown al hacer clic afuera
    useEffect(() => {
        const handleClickFuera = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownAbierto(false);
            }
        };
        document.addEventListener("mousedown", handleClickFuera);
        return () => document.removeEventListener("mousedown", handleClickFuera);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDatos((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const subirLogo = async (e) => {
        if (!e || !e.target) return;

        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type || !file.type.startsWith("image/")) {
            setError("Solo se permiten archivos de imagen.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("La imagen no puede superar los 5 MB.");
            e.target.value = "";
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        const imagen = new Image();
        imagen.src = previewUrl;

        try {
            await new Promise((resolve, reject) => {
                imagen.onload = () => {
                    if (imagen.width > 2500 || imagen.height > 2500) {
                        reject(new Error("La imagen es demasiado grande. Máximo 2500x2500 píxeles."));
                    } else {
                        resolve();
                    }
                };
                imagen.onerror = () => reject(new Error("Error al cargar la imagen."));
            });

            setPreviewLogo(previewUrl);
            setSubiendoLogo(true);
            setError("");

            const respuesta = await subirLogoApi(file);

            setDatos((prev) => ({
                ...prev,
                logo: respuesta.url,
            }));
        } catch (err) {
            console.error("Error al subir logo:", err);
            URL.revokeObjectURL(previewUrl);
            setPreviewLogo("");
            setError(err.response?.data?.mensaje || err.message || "Error al subir el logo.");
        } finally {
            setSubiendoLogo(false);
            e.target.value = "";
        }
    };

    const guardarSolicitud = async (e) => {
        e.preventDefault();
        setError("");

        if (!datos.logo) { setError("Debes subir el logo del negocio."); return; }
        if (!datos.nombre_negocio.trim()) { setError("Ingresa el nombre del negocio."); return; }
        if (!datos.descripcion_negocio.trim()) { setError("Ingresa una descripción para tu negocio."); return; }
        if (!datos.telefono_negocio.trim()) { setError("Ingresa el teléfono de contacto."); return; }
        if (datos.telefono_negocio.length !== 10) { setError("El teléfono debe tener exactamente 10 números."); return; }
        if (!datos.numero_puesto) { setError("Selecciona un número de puesto disponible."); return; }

        const standSeleccionado = availableStands.find(
            (stand) => Number(stand.number) === Number(datos.numero_puesto)
        );

        if (!standSeleccionado) {
            setError("El puesto seleccionado no está disponible. Por favor, elige otro.");
            await loadAvailableStands();
            return;
        }

        setLoading(true);

        try {
            await registrarNegocio({
                nombre_negocio: datos.nombre_negocio.trim(),
                descripcion_negocio: datos.descripcion_negocio.trim(),
                telefono_negocio: datos.telefono_negocio.trim(),
                numero_puesto: Number(datos.numero_puesto),
                logo: datos.logo,
            });

            alert(`✅ ¡Éxito! Tu negocio "${datos.nombre_negocio}" ha sido registrado y asignado al puesto #${datos.numero_puesto}.`);

            setDatos({
                nombre_negocio: "",
                descripcion_negocio: "",
                telefono_negocio: "",
                numero_puesto: "",
                logo: "",
            });
            setPreviewLogo("");
            setBusquedaPuesto("");
            await loadAvailableStands();
        } catch (err) {
            console.error("Error al registrar negocio:", err);
            setError(
                err.response?.data?.mensaje ||
                err.response?.data?.message ||
                err.message ||
                "Error al registrar el negocio. Por favor, intenta de nuevo."
            );
        } finally {
            setLoading(false);
        }
    };

    const eliminarLogo = () => {
        setPreviewLogo("");
        setDatos((prev) => ({
            ...prev,
            logo: "",
        }));
    };

    // Filtramos los puestos según la búsqueda (por número)
    const puestosFiltrados = availableStands.filter((stand) => {
        if (!busquedaPuesto.trim()) return true;
        return String(stand.number).includes(busquedaPuesto.trim());
    });

    // Texto que se muestra en la "caja" del select
    const standSeleccionadoObj = availableStands.find(
        (s) => Number(s.number) === Number(datos.numero_puesto)
    );
    
    const textoMostrado = standSeleccionadoObj 
        ? `Puesto #${standSeleccionadoObj.number} - ${standSeleccionadoObj.section}`
        : "";

    if (cargandoPerfil) {
        return (
            <main className="registro-container">
                <div className="registro-card registro-card-wide">
                    <p style={{ textAlign: "center", color: "#6b7280" }}>Verificando información del perfil...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="registro-container">
            <div className="registro-card registro-card-wide">
                
                <div className="auth-header">
                    <div className="auth-icon-badge">
                        <i className="fas fa-store"></i>
                    </div>
                    <h1 className="registro-title">Solicitud de Registro de Negocio</h1>
                    <p className="registro-subtitle">
                        Solo se aceptan negocios con puesto fijo en el Mercado de las Pulgas San Alejo.
                        <br />
                        <strong>Puestos disponibles: {availableStands.length}</strong>
                    </p>
                </div>

                <form onSubmit={guardarSolicitud} className="registro-form">
                    
                    {/* LOGO */}
                    <div className="form-group" style={{ alignItems: "center" }}>
                        <label style={{ width: "100%", justifyContent: "flex-start" }}>
                            <i className="fas fa-image label-icon"></i> Logo del negocio
                        </label>
                        
                        <label className="logo-upload">
                            {previewLogo ? (
                                <img src={previewLogo} alt="Logo del negocio" className="preview-logo" />
                            ) : (
                                <>
                                    <div className="logo-icon">🏪</div>
                                    <p>Sube tu logo</p>
                                    <small>PNG, JPG o WEBP (máx. 5 MB)</small>
                                </>
                            )}
                            <input type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={subirLogo} />
                        </label>

                        {subiendoLogo && <div className="uploading">⏳ Subiendo logo...</div>}

                        {previewLogo && !subiendoLogo && (
                            <button type="button" className="btn-eliminar-logo" onClick={eliminarLogo}>
                                🗑 Cambiar logo
                            </button>
                        )}
                    </div>

                    {/* NOMBRE */}
                    <div className="form-group">
                        <label>
                            <i className="fas fa-store label-icon"></i> Nombre del negocio
                        </label>
                        <input
                            type="text"
                            name="nombre_negocio"
                            value={datos.nombre_negocio}
                            onChange={(e) => {
                                const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                                setDatos((prev) => ({ ...prev, nombre_negocio: soloLetras }));
                            }}
                            placeholder="Ej: Antigüedades San Alejo"
                            maxLength={50}
                            required
                        />
                    </div>

                    {/* DESCRIPCIÓN */}
                    <div className="form-group">
                        <label>
                            <i className="fas fa-align-left label-icon"></i> Descripción
                        </label>
                        <textarea
                            name="descripcion_negocio"
                            value={datos.descripcion_negocio}
                            onChange={handleChange}
                            placeholder="Describe tu negocio y productos"
                            maxLength={200}
                            required
                        />
                    </div>

                    {/* TELÉFONO */}
                    <div className="form-group">
                        <label>
                            <i className="fas fa-phone label-icon"></i> Teléfono
                        </label>
                        <input
                            type="text"
                            name="telefono_negocio"
                            inputMode="numeric"
                            value={datos.telefono_negocio}
                            onChange={(e) => {
                                const soloNumeros = e.target.value.replace(/\D/g, "");
                                const limitado = soloNumeros.slice(0, 10); 
                                setDatos((prev) => ({ ...prev, telefono_negocio: limitado }));
                            }}
                            placeholder="Ej: 3012345678"
                            maxLength={10}
                            required
                        />
                    </div>

                    {/* SELECTOR CON BUSCADOR INTEGRADO */}
                    <div className="form-group">
                        <label>
                            <i className="fas fa-map-marker-alt label-icon"></i> Número del puesto
                        </label>

                        <div className="custom-select-wrapper" ref={dropdownRef}>
                            {/* Caja que se ve igual que un select normal */}
                            <div 
                                className={`custom-select-trigger ${dropdownAbierto ? "open" : ""}`}
                                onClick={() => setDropdownAbierto(!dropdownAbierto)}
                            >
                                <span className={textoMostrado ? "texto-seleccionado" : "texto-placeholder"}>
                                    {textoMostrado || "-- Selecciona un puesto disponible --"}
                                </span>
                                <i className={`fas fa-chevron-${dropdownAbierto ? "up" : "down"} custom-select-arrow`}></i>
                            </div>

                            {/* Panel desplegable con el buscador dentro */}
                            {dropdownAbierto && (
                                <div className="custom-select-panel">
                                    
                                    {/* Buscador (por número) dentro del panel */}
                                    <div className="custom-select-search">
                                        <i className="fas fa-search"></i>
                                        <input
                                            type="text"
                                            placeholder="Buscar por número de puesto..."
                                            value={busquedaPuesto}
                                            onChange={(e) => setBusquedaPuesto(e.target.value.replace(/\D/g, ""))}
                                            inputMode="numeric"
                                            autoFocus
                                        />
                                        {busquedaPuesto && (
                                            <button 
                                                type="button" 
                                                onClick={() => setBusquedaPuesto("")}
                                                className="btn-clear-search"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>

                                    {/* Lista de puestos */}
                                    <div className="custom-select-options">
                                        {cargandoPuestos ? (
                                            <div className="sin-resultados">Cargando puestos...</div>
                                        ) : puestosFiltrados.length === 0 ? (
                                            <div className="sin-resultados">
                                                No hay puestos con el número "{busquedaPuesto}"
                                            </div>
                                        ) : (
                                            puestosFiltrados.map((stand) => (
                                                <div
                                                    key={stand.id}
                                                    className={`custom-select-option ${Number(datos.numero_puesto) === Number(stand.number) ? "selected" : ""}`}
                                                    onClick={() => {
                                                        setDatos((prev) => ({ ...prev, numero_puesto: stand.number }));
                                                        setDropdownAbierto(false);
                                                        setBusquedaPuesto("");
                                                    }}
                                                >
                                                    <div>
                                                        <strong>Puesto #{stand.number}</strong>
                                                        {stand.section && stand.section.trim() !== "" && (
                                                            <span className="option-section"> - {stand.section}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {availableStands.length === 0 && !cargandoPuestos && (
                            <div className="sin-puestos">⚠️ No hay puestos disponibles en este momento.</div>
                        )}
                    </div>

                    {/* BANNER DE ERRORES */}
                    {error && (
                        <div className="error-banner">
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    {/* BOTÓN */}
                    <button
                        type="submit"
                        className="btn-registrar"
                        disabled={subiendoLogo || loading || availableStands.length === 0}
                    >
                        {subiendoLogo ? (
                            <><i className="fas fa-spinner fa-spin"></i> Subiendo logo...</>
                        ) : loading ? (
                            <><i className="fas fa-spinner fa-spin"></i> Registrando...</>
                        ) : (
                            <>Enviar solicitud de registro <i className="fas fa-arrow-right"></i></>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}

export default RegistrarNegocio;