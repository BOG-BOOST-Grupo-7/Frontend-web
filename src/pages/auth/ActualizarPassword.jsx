import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase"; 
import "../../styles/Registro.css";

export default function ActualizarPassword() {
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      // Supabase detecta automáticamente la sesión de recuperación activa
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMensaje("¡Contraseña actualizada con éxito! Redirigiendo al login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message || "No se pudo actualizar la contraseña. El enlace pudo haber expirado.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <i className="fas fa-lock"></i>
          </div>
          <h1 className="registro-title">Actualizar Contraseña</h1>
          <p className="registro-subtitle">
            Ingresa tu nueva contraseña para acceder a tu cuenta.
          </p>
        </div>

        {mensaje && (
          <div className="error-banner" style={{ backgroundColor: "#f0fdf4", borderColor: "#dcfce7", color: "#16a34a", marginBottom: "20px" }}>
            <i className="fas fa-check-circle"></i>
            <span>{mensaje}</span>
          </div>
        )}

        {error && (
          <div className="error-banner" style={{ marginBottom: "20px" }}>
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="registro-form">
          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-key label-icon"></i> Nueva Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button type="submit" className="btn-registrar" disabled={cargando}>
            {cargando ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Actualizando...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Guardar nueva contraseña
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}