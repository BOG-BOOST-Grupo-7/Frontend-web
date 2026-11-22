import { useNavigate, Link } from 'react-router-dom';
import '../../styles/ModalInfoPuesto.css';

const ModalInfoPuesto = ({ puesto, negocio, alCerrar }) => {
  const navigate = useNavigate();

  if (!puesto) return null;
  const estaOcupado = Boolean(negocio);

  // Función para manejar el clic y redirigir al perfil del negocio
  const irAlDetalleNegocio = () => {
    if (negocio && negocio.id_negocio) {
      alCerrar(); // Cerramos el modal primero
      navigate(`/negocios/${negocio.id_negocio}`); // Redirige a la ruta configurada
    }
  };
  
  return (
    <dialog
        open
        className="mip-fondo"
        aria-labelledby="titulo-puesto"
        onClick={(e) => {
            if (e.target === e.currentTarget) {
                alCerrar();
            }
        }}
    >
        <div className="mip-contenido">
            <button
                type="button"
                className="mip-boton-cerrar"
                onClick={alCerrar}
                aria-label="Cerrar información del puesto"
            >
                ×
            </button>

            <h2 id="titulo-puesto">
                Puesto N° {puesto.numero}
            </h2>

            {estaOcupado ? (
                <Link
                    to={`/negocios/${negocio.id_negocio}`}
                    className="mip-info-negocio mip-clicable"
                    title="Ver perfil del negocio"
                >
                    {negocio.logo && (
                        <div className="mip-logo-container">
                            <img
                                src={negocio.logo}
                                alt={`Logo de ${negocio.nombre_negocio}`}
                            />
                        </div>
                    )}

                    <div className="mip-insignia mip-ocupado">
                        Ocupado
                    </div>

                    <div className="mip-campo-info">
                        <span className="mip-etiqueta">
                            Nombre del negocio:
                        </span>
                        <span className="mip-valor">
                            {negocio.nombre_negocio || "Sin nombre"}
                        </span>
                    </div>

                    <div className="mip-campo-info">
                        <span className="mip-etiqueta">
                            Descripción:
                        </span>
                        <span className="mip-valor">
                            {negocio.descripcion_negocio || "Sin descripción"}
                        </span>
                    </div>

                    <div className="mip-campo-info">
                        <span className="mip-etiqueta">
                            Teléfono de contacto:
                        </span>
                        <span className="mip-valor">
                            {negocio.telefono_negocio || "No especificado"}
                        </span>
                    </div>

                    <span className="mip-texto-ver-perfil">
                        Ver perfil completo ➜
                    </span>
                </Link>
            ) : (
                <div className="mip-info-disponible">
                    <div className="mip-insignia mip-disponible">
                        Disponible
                    </div>

                    <p>
                        Este puesto se encuentra libre. Se mostrará ocupado cuando el
                        administrador apruebe un negocio registrado para este número.
                    </p>
                </div>
            )}
        </div>
    </dialog>
  );
};

export default ModalInfoPuesto;