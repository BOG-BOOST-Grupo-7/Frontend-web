import "../../styles/Notificaciones.css";
import { useEffect, useState } from "react";
import {
    FaBell,
    FaCheckCircle,
    FaExclamationTriangle,
    FaGift,
    FaCog,
    FaTimes,
    FaCheckDouble
} from "react-icons/fa";
import {
    obtenerNotificaciones,
    marcarComoLeida,
    eliminarNotificacion
} from "../../api/notificacionApi";

function Notificaciones() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarNotificaciones();
    }, []);

    const cargarNotificaciones = async () => {
        try {
            setLoading(true);
            const data = await obtenerNotificaciones();
            setNotificaciones(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const marcarLeida = async (id) => {
        try {
            await marcarComoLeida(id);
            setNotificaciones(prev =>
                prev.map(n =>
                    n.id_notificacion === id
                        ? { ...n, estado_notificacion: true }
                        : n
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    const eliminar = async (id) => {
        if (!window.confirm("¿Eliminar esta notificación?")) return;

        try {
            await eliminarNotificacion(id);
            setNotificaciones(prev =>
                prev.filter(n => n.id_notificacion !== id)
            );
        } catch (error) {
            console.error(error);
        }
    };

    const marcarTodas = async () => {
        try {
            const pendientes = notificaciones.filter(n => !n.estado_notificacion);
            
            for (const notificacion of pendientes) {
                await marcarComoLeida(notificacion.id_notificacion);
            }
            
            setNotificaciones(prev =>
                prev.map(n => ({ ...n, estado_notificacion: true }))
            );
        } catch (error) {
            console.error(error);
        }
    };

    const obtenerIcono = (tipo) => {
        switch (tipo) {
            case "ALERTA":
                return <FaExclamationTriangle />;
            case "PROMOCION":
                return <FaGift />;
            case "SISTEMA":
                return <FaCog />;
            default:
                return <FaCheckCircle />;
        }
    };

    const obtenerClase = (tipo) => {
        switch (tipo) {
            case "ALERTA":
                return "alerta";
            case "PROMOCION":
                return "promocion";
            case "SISTEMA":
                return "sistema";
            default:
                return "informativa";
        }
    };

    const formatearFecha = (fecha) => {
        const ahora = new Date();
        const fechaNotificacion = new Date(fecha);
        const diferencia = ahora - fechaNotificacion;

        const segundos = Math.floor(diferencia / 1000);
        const minutos = Math.floor(segundos / 60);
        const horas = Math.floor(minutos / 60);
        const dias = Math.floor(horas / 24);
        const semanas = Math.floor(dias / 7);
        const meses = Math.floor(dias / 30);

        if (segundos < 60) return "Hace unos segundos";
        if (minutos < 60) return `Hace ${minutos} minuto${minutos !== 1 ? "s" : ""}`;
        if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? "s" : ""}`;
        if (dias < 7) return `Hace ${dias} día${dias !== 1 ? "s" : ""}`;
        if (semanas < 5) return `Hace ${semanas} semana${semanas !== 1 ? "s" : ""}`;
        if (meses < 12) return `Hace ${meses} mes${meses !== 1 ? "es" : ""}`;

        return fechaNotificacion.toLocaleDateString();
    };

    const tienePendientes = notificaciones.some(n => !n.estado_notificacion);

    return (
        <main className="notificaciones-page">
            <h1 className="view-title">
                <FaBell /> Notificaciones
            </h1>

            <div className="acciones-notificaciones">
                <button
                    className="btn-marcar"
                    onClick={marcarTodas}
                    disabled={!tienePendientes}
                >
                    <FaCheckDouble /> Marcar todas como leídas
                </button>
            </div>

            <div className="notificaciones-list">
                {loading ? (
                    <p className="sin-datos">Cargando notificaciones...</p>
                ) : notificaciones.length === 0 ? (
                    <div className="sin-notificaciones">
                        <FaBell className="icono-vacio" />
                        <h3>No tienes notificaciones</h3>
                        <p>Las nuevas notificaciones aparecerán aquí.</p>
                    </div>
                ) : (
                    notificaciones.map((n) => (
                        <div
                            key={n.id_notificacion}
                            className={`notificacion-item ${!n.estado_notificacion ? "no-leida" : ""}`}
                            onClick={() => {
                                if (!n.estado_notificacion) {
                                    marcarLeida(n.id_notificacion);
                                }
                            }}
                        >
                            <div className={`notificacion-icon ${obtenerClase(n.tipo)}`}>
                                {obtenerIcono(n.tipo)}
                            </div>

                            <div className="notificacion-content">
                                <p className="mensaje">
                                    <strong>BOG BOOST</strong>
                                    <br />
                                    {n.mensaje}
                                </p>
                                <span className="fecha">
                                    {formatearFecha(n.fecha_notificacion)}
                                </span>
                            </div>

                            <button
                                className="btn-eliminar"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    eliminar(n.id_notificacion);
                                }}
                                title="Eliminar"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}

export default Notificaciones;