import "../../styles/Registro.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth";
import { Link } from "react-router-dom";

function Registro() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Validaciones individuales para cada regla visual
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const noSpaces = !/\s/.test(password) && password.length > 0;
  const noInvalidChars = !/[¡¿"ºª·`´ç]/.test(password);

  const passwordValida = hasMinLen && hasUpper && hasLower && hasNumber && noSpaces && noInvalidChars;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!nombre.trim()) {
      setError("Debe ingresar su nombre");
      return;
    }

    if (!nombreRegex.test(nombre)) {
      setError("El nombre solo puede contener letras");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Ingrese un correo electrónico válido");
      return;
    }

    if (!passwordValida) {
      setError("La contraseña no cumple con todos los requisitos de seguridad");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        primer_nombre: nombre,
        email,
        password,
      });

      alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
      navigate("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        "Error al registrar usuario";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="registro-container">
      <div className="registro-card registro-card-wide">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <i className="fas fa-user-plus"></i>
          </div>
          <h2 className="registro-title">Crea una cuenta</h2>
          <p className="registro-subtitle">Únete a nuestra plataforma en segundos</p>
        </div>

        <form onSubmit={handleSubmit} className="registro-form">
          <div className="form-group">
            <label>
              <i className="fas fa-user label-icon"></i> Primer nombre
            </label>
            <input
              type="text"
              placeholder="Ej. Carlos"
              value={nombre}
              onChange={(e) => {
                const valor = e.target.value;
                if (/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(valor)) {
                  setNombre(valor);
                }
              }}
              maxLength={30}
              required
            />
          </div>

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
              <i className="fas fa-lock label-icon"></i> Contraseña
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

            {/* Requisitos de contraseña modernos en formato checklist */}
            <div className="password-checklist">
              <div className={hasMinLen ? "check-item valid" : "check-item"}>
                <i className={hasMinLen ? "fas fa-check-circle" : "fas fa-circle"}></i> Mín. 8 caracteres
              </div>
              <div className={hasUpper ? "check-item valid" : "check-item"}>
                <i className={hasUpper ? "fas fa-check-circle" : "fas fa-circle"}></i> Una mayúscula
              </div>
              <div className={hasLower ? "check-item valid" : "check-item"}>
                <i className={hasLower ? "fas fa-check-circle" : "fas fa-circle"}></i> Una minúscula
              </div>
              <div className={hasNumber ? "check-item valid" : "check-item"}>
                <i className={hasNumber ? "fas fa-check-circle" : "fas fa-circle"}></i> Un número
              </div>
              <div className={noSpaces ? "check-item valid" : "check-item"}>
                <i className={noSpaces ? "fas fa-check-circle" : "fas fa-circle"}></i> Sin espacios
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-check-double label-icon"></i> Confirmar contraseña
            </label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
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
                <i className="fas fa-spinner fa-spin"></i> Creando cuenta...
              </>
            ) : (
              <>
               Registro Completo <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="registro-links">
          <Link to="/login" className="link-login">
            ¿Ya tienes una cuenta? <span>Inicia Sesión</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Registro;