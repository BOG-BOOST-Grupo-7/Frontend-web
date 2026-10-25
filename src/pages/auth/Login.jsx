import "../../styles/Registro.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate(); 
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      const { user, perfil } = res.data;
      login(user, perfil);

      const rol = perfil?.rol?.nombre_rol;
      const destino = location.state?.from;

      switch (rol) {
        case "CLIENTE":
          navigate(destino || "/");
          break;
        case "VENDEDOR":
          navigate("/vendedor");
          break;
        case "SUPER_ADMIN":
          navigate("/admin");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        "Error al iniciar sesión";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="registro-container">
      <div className="registro-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <i className="fas fa-lock-open"></i>
          </div>
          <h2 className="registro-title">Bienvenido de nuevo</h2>
          <p className="registro-subtitle">Ingresa a tu cuenta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="registro-form">
          <div className="form-group">
            <label>
              <i className="fas fa-envelope label-icon"></i> Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-key label-icon"></i> Contraseña
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
              </button>
            </div>
          </div>

          {error && <div className="error-banner"><i className="fas fa-exclamation-circle"></i> {error}</div>}

          <button
            type="submit"
            className="btn-registrar"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Ingresando...
              </>
            ) : (
              <>
                Iniciar Sesión <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="registro-links columnas">
          <Link to="/recuperar-password" className="link-login">
          ¿Olvidaste tu contraseña? <span>Recupérala aquí</span>
          </Link>
          
          <Link to="/registro" className="link-login">
          ¿No tienes una cuenta? <span>Regístrate aquí</span>
          </Link>
          </div>
      </div>
    </section>
  );
}

export default Login;