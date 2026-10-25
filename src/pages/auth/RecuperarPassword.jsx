import React, { useState } from "react";
import { Link } from "react-router-dom";
import { recuperarPasswordRequest } from "../../api/auth";
import "../../styles/Registro.css";

export default function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const response = await recuperarPasswordRequest(email);
      setMensaje(response.data.mensaje || "¡Correo enviado con éxito! Revisa tu bandeja de entrada.");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo procesar la solicitud. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-card">
        
        {/* Header con icono */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <i className="fas fa-key"></i>
          </div>
          <h1 className="registro-title">¿Olvidaste tu contraseña?</h1>
          <p className="registro-subtitle">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para recuperarla.
          </p>
        </div>

        {/* Mensaje de éxito */}
        {mensaje && (
          <div className="error-banner" style={{ backgroundColor: "#f0fdf4", borderColor: "#dcfce7", color: "#16a34a", marginBottom: "20px" }}>
            <i className="fas fa-check-circle"></i>
            <span>{mensaje}</span>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="error-banner" style={{ marginBottom: "20px" }}>
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="registro-form">
          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope label-icon"></i> Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ejemplo@correo.com"
            />
          </div>

          <button type="submit" className="btn-registrar" disabled={cargando}>
            {cargando ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Enviando...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Enviar instrucciones
              </>
            )}
          </button>
        </form>

        {/* Enlace para volver al login */}
        <div className="registro-links">
          <Link to="/login" className="link-login">
            <i className="fas fa-arrow-left"></i> ¿Recordaste tu contraseña? <span>Iniciar sesión</span>
          </Link>
        </div>

      </div>
    </div>
  );
}