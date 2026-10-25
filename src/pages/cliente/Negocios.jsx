import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerNegociosPublicos } from "../../api/negocioApi";
import toast from "react-hot-toast";
import "../../styles/Negocios.css";

function Negocios() {
    const [negocios, setNegocios] = useState([]);
    const navigate = useNavigate();

    // Estados para la paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const negociosPorPagina = 12; 

    useEffect(() => {
        cargarNegocios();
    }, []);

    const cargarNegocios = async () => {
        try {
            const data = await obtenerNegociosPublicos();
            setNegocios(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar negocios");
        }
    };

    // Lógica de paginación
    const indexUltimoNegocio = paginaActual * negociosPorPagina;
    const indexPrimerNegocio = indexUltimoNegocio - negociosPorPagina;
    const negociosPaginados = negocios.slice(indexPrimerNegocio, indexUltimoNegocio);
    const totalPaginas = Math.ceil(negocios.length / negociosPorPagina);

    return (
        <div className="negocios-container">
            <h2>Negocios disponibles</h2>

            <div className="negocios-grid">
                {negociosPaginados.map((negocio) => (
                    <div
                        key={negocio.id_negocio}
                        className="negocio-card"
                        onClick={() => navigate(`/negocios/${negocio.id_negocio}`)}
                    >
                        <img
                            src={negocio.logo || "https://via.placeholder.com/120?text=Sin+Logo"}
                            alt={negocio.nombre_negocio}
                            className="negocio-logo"
                        />
                        <h3>{negocio.nombre_negocio}</h3>
                        <p>
                            {negocio.descripcion_negocio && negocio.descripcion_negocio.length > 80
                                ? `${negocio.descripcion_negocio.substring(0, 80)}...`
                                : negocio.descripcion_negocio}
                        </p>
                    </div>
                ))}
            </div>

            {/* Controles de Paginación */}
            {totalPaginas > 1 && (
                <div className="paginacion-container">
                    <button
                        className="pag-btn"
                        disabled={paginaActual === 1}
                        onClick={() => setPaginaActual(paginaActual - 1)}
                    >
                        Anterior
                    </button>

                    <span className="pag-info">
                        Página {paginaActual} de {totalPaginas}
                    </span>

                    <button
                        className="pag-btn"
                        disabled={paginaActual === totalPaginas}
                        onClick={() => setPaginaActual(paginaActual + 1)}
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
}

export default Negocios;