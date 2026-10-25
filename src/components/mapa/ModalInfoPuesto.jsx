import { useNavigate } from 'react-router-dom';
import './ModalInfoPuesto.css';

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
    <div className="mip-fondo" onClick={alCerrar}>
      <div className="mip-contenido" onClick={(e) => e.stopPropagation()}>
        <button className="mip-boton-cerrar" onClick={alCerrar}>×</button>

        <h2>Puesto N° {puesto.numero}</h2>

        {estaOcupado ? (
          <div 
            className="mip-info-negocio mip-clicable" 
            onClick={irAlDetalleNegocio}
            title="Haz clic para ver el perfil del negocio"
          >
            {/* Logo del negocio si lo tiene registrado */}
            {negocio.logo && (
              <div className="mip-logo-container">
                <img 
                  src={negocio.logo} 
                  alt={negocio.nombre_negocio} 
                />
              </div>
            )}

            <div className="mip-insignia mip-ocupado">Ocupado</div>
            
            <div className="mip-campo-info">
              <span className="mip-etiqueta">Nombre del negocio:</span>
              <span className="mip-valor">{negocio.nombre_negocio || 'Sin nombre'}</span>
            </div>
            
            <div className="mip-campo-info">
              <span className="mip-etiqueta">Descripción:</span>
              <span className="mip-valor">{negocio.descripcion_negocio || 'Sin descripción'}</span>
            </div>

            <div className="mip-campo-info">
              <span className="mip-etiqueta">Teléfono de contacto:</span>
              <span className="mip-valor">{negocio.telefono_negocio || 'No especificado'}</span>
            </div>

            <span className="mip-texto-ver-perfil">Ver perfil completo ➜</span>
          </div>
        ) : (
          <div className="mip-info-disponible">
            <div className="mip-insignia mip-disponible">Disponible</div>
            <p>
              Este puesto se encuentra libre. Se mostrará ocupado cuando el
              administrador apruebe un negocio registrado para este número.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalInfoPuesto;