import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function RegistrarNegocioCard() {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const irARegistroNegocio = () => {

    if (!isAuthenticated) {

      navigate("/login", {
        state: {
          from: "/registrar-negocio"
        }
      });

      return;
    }

    navigate("/registrar-negocio");
  };

  return (
    <div className="negocio-card">

      <h2 className="negocio-title">
        ¿Tienes un puesto en San Alejo?
      </h2>

      <p className="negocio-subtitle">
        Registra tu negocio y empieza a vender en BOG-BOOST.
      </p>

      <div className="negocio-placeholder">

        <span className="negocio-icono">
          🏪
        </span>

        <p className="negocio-texto">
          Solo se pueden registrar puestos que estén
          <strong> físicamente ubicados en el Mercado de las Pulgas San Alejo.</strong>
        </p>

        <button
          className="btn-registrar-negocio"
          onClick={irARegistroNegocio}
        >
          {isAuthenticated
            ? "Registrar mi negocio"
            : "Inicia sesión para registrar tu negocio"}
        </button>

      </div>

    </div>
  );
}

export default RegistrarNegocioCard;