import { Link } from "react-router-dom";
import "../../styles/AdminHome.css";

function AdminHome() {
    const opciones = [
        {
            titulo: "Negocios",
            descripcion: "Gestiona los negocios registrados y las categorías para los productos.",
            icono: "fas fa-store",
            color: "#F5B952",
            ruta: "/admin/negocios"
        },
        {
            titulo: "Usuarios",
            descripcion: "Administra los usuarios del sistema y sus roles.",
            icono: "fas fa-users",
            color: "#10B981",
            ruta: "/admin/usuarios"
        },
        {
            titulo: "Solicitudes",
            descripcion: "Revisa, aprueba o rechaza nuevas solicitudes.",
            icono: "fas fa-file-signature",
            color: "#F97316",
            ruta: "/admin/solicitudes"
        },
        {
            titulo: "PQRS",
            descripcion: "Gestiona peticiones, quejas, reclamos y solicitudes.",
            icono: "fas fa-envelope",
            color: "#3B82F6",
            ruta: "/admin/pqrs"
        },
        {
            titulo: "Reportes",
            descripcion: "Consulta reportes y estadísticas sobre usuarios, ventas y productos.",
            icono: "fas fa-chart-bar",
            color: "#8B5CF6",
            ruta: "/admin/reportes"
        }
    ];

    return (
        <main className="admin-home">
            <div className="admin-header">
                <h1 className="admin-title">Panel de Administración</h1>
                <p className="admin-subtitle">
                    Selecciona una sección para administrar los componentes del sistema.
                </p>
            </div>

            <div className="dashboard-grid">
                {opciones.map((item) => (
                    <Link
                        key={item.titulo}
                        to={item.ruta}
                        className="dashboard-card"
                    >
                        <div
                            className="card-icon"
                            style={{
                                background: `${item.color}15`,
                                color: item.color
                            }}
                        >
                            <i className={item.icono}></i>
                        </div>
                        <h3>{item.titulo}</h3>
                        <p>{item.descripcion}</p>
                    </Link>
                ))}
            </div>
        </main>
    );
}

export default AdminHome;