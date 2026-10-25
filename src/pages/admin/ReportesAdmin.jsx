import React, { useEffect, useState, useMemo } from "react";
import { obtenerReportes } from "../../api/ventaApi"; 
import "../../styles/Reportes.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORES = ["#4f46e5", "#059669", "#ff9800", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#10b981", "#f59e0b", "#6366f1"];

export default function ReportesAdmin() {
  const [reportes, setReportes] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Pestañas
  const [pestanaActiva, setPestanaActiva] = useState("mensual");

  // Estados para los filtros
  const [filtroAnio, setFiltroAnio] = useState("todos");
  const [filtroMesSemanal, setFiltroMesSemanal] = useState("todos");

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const data = await obtenerReportes();
        setReportes(data);
      } catch (err) {
        console.error("Error al cargar reportes:", err);
        setError("No se pudieron cargar los datos de reportes.");
      } finally {
        setCargando(false);
      }
    };
    fetchReportes();
  }, []);

  // ==========================================
  // LÓGICA DE FILTRADO Y AGRUPACIÓN
  // ==========================================

  // 1. Extraer años disponibles para el select del mensual
  const aniosDisponibles = useMemo(() => {
    if (!reportes?.usuariosPorMes) return [];
    const anios = new Set(Object.keys(reportes.usuariosPorMes).map(m => m.split("-")[0]));
    return Array.from(anios).sort().reverse();
  }, [reportes]);

  // 2. Filtrar datos mensuales por año
  const datosMensuales = useMemo(() => {
    if (!reportes) return { usuarios: [], ventas: [] };
    
    const filtrarPorAnio = (obj) => Object.entries(obj).filter(([clave]) => 
      filtroAnio === "todos" || clave.startsWith(filtroAnio)
    );

    return {
      usuarios: filtrarPorAnio(reportes.usuariosPorMes || {}).map(([mes, total]) => ({ mes, total })),
      ventas: filtrarPorAnio(reportes.ventasPorMes || {}).map(([mes, data]) => ({ mes, ...data }))
    };
  }, [reportes, filtroAnio]);

  // 3. Extraer meses disponibles para el select del semanal
  const mesesDisponibles = useMemo(() => {
    if (!reportes?.usuariosPorSemana) return [];
    const meses = new Set(Object.keys(reportes.usuariosPorSemana).map(s => s.slice(0, 7)));
    return Array.from(meses).sort().reverse();
  }, [reportes]);

  // 4. Filtrar datos semanales por mes
  const datosSemanales = useMemo(() => {
    if (!reportes) return { usuarios: [], ventas: [] };
    
    const filtrarPorMes = (obj) => Object.entries(obj).filter(([clave]) => 
      filtroMesSemanal === "todos" || clave.startsWith(filtroMesSemanal)
    );

    return {
      usuarios: filtrarPorMes(reportes.usuariosPorSemana || {}).map(([semana, total]) => ({ semana, total })),
      ventas: filtrarPorMes(reportes.ventasPorSemana || {}).map(([semana, data]) => ({ semana, ...data }))
    };
  }, [reportes, filtroMesSemanal]);

  if (cargando) return <div className="reportes-loading">Cargando reportes del sistema...</div>;
  if (error) return <div className="reportes-error">{error}</div>;

  return (
    <div className="reportes-container">
      <h1 className="reportes-title">Panel de Reportes y Estadísticas</h1>

      {/* PESTAÑAS */}
      <div className="reportes-tabs">
        <button className={`tab-btn ${pestanaActiva === "mensual" ? "active" : ""}`} onClick={() => setPestanaActiva("mensual")}>📅 Resumen Mensual</button>
        <button className={`tab-btn ${pestanaActiva === "semanal" ? "active" : ""}`} onClick={() => setPestanaActiva("semanal")}>🗓️ Resumen Semanal</button>
        <button className={`tab-btn ${pestanaActiva === "negocios" ? "active" : ""}`} onClick={() => setPestanaActiva("negocios")}>🏪 Ventas por Negocio</button>
        <button className={`tab-btn ${pestanaActiva === "productos" ? "active" : ""}`} onClick={() => setPestanaActiva("productos")}>🔥 Top Productos</button>
      </div>

      {/* ================= 1. SECCIÓN MENSUAL ================= */}
      {pestanaActiva === "mensual" && (
        <div className="animate-fade-in">
          
          {/* Filtro */}
          <div className="filtros-reportes">
            <label>Filtrar por Año:</label>
            <select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)}>
              <option value="todos">Todos los años</option>
              {aniosDisponibles.map(anio => <option key={anio} value={anio}>{anio}</option>)}
            </select>
          </div>

          <div className="reportes-grid">
            {/* Usuarios Mensuales */}
            <div className="reportes-card">
              <h2>Usuarios Registrados por Mes</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={datosMensuales.usuarios}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Usuarios" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="table-responsive">
                <table className="reportes-table">
                  <thead><tr><th>Mes</th><th className="text-right">Nuevos Perfiles</th></tr></thead>
                  <tbody>
                    {datosMensuales.usuarios.length === 0 ? (
                      <tr><td colSpan="2" className="text-center">Sin registros</td></tr>
                    ) : (
                      datosMensuales.usuarios.map(({ mes, total }) => (
                        <tr key={mes}><td className="font-medium">{mes}</td><td className="text-right text-primary">{total}</td></tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ventas Mensuales */}
            <div className="reportes-card">
              <h2>Ventas e Ingresos por Mes</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={datosMensuales.ventas}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="ingresos_totales" fill="#059669" radius={[4, 4, 0, 0]} name="Ingresos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="table-responsive">
                <table className="reportes-table">
                  <thead><tr><th>Mes</th><th className="text-center">N° Ventas</th><th className="text-right">Ingresos</th></tr></thead>
                  <tbody>
                    {datosMensuales.ventas.length === 0 ? (
                      <tr><td colSpan="3" className="text-center">Sin ventas</td></tr>
                    ) : (
                      datosMensuales.ventas.map(({ mes, cantidad_ventas, ingresos_totales }) => (
                        <tr key={mes}>
                          <td className="font-medium">{mes}</td>
                          <td className="text-center">{cantidad_ventas}</td>
                          <td className="text-right text-success">${ingresos_totales.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. SECCIÓN SEMANAL ================= */}
      {pestanaActiva === "semanal" && (
        <div className="animate-fade-in">
          
          {/* Filtro */}
          <div className="filtros-reportes">
            <label>Filtrar por Mes:</label>
            <select value={filtroMesSemanal} onChange={(e) => setFiltroMesSemanal(e.target.value)}>
              <option value="todos">Todos los meses</option>
              {mesesDisponibles.map(mes => <option key={mes} value={mes}>{mes}</option>)}
            </select>
          </div>

          <div className="reportes-grid">
            {/* Usuarios Semanales */}
            <div className="reportes-card">
              <h2>Usuarios Registrados por Semana</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={datosSemanales.usuarios}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Usuarios" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="table-responsive">
                <table className="reportes-table">
                  <thead><tr><th>Semana (Inicio)</th><th className="text-right">Nuevos Perfiles</th></tr></thead>
                  <tbody>
                    {datosSemanales.usuarios.length === 0 ? (
                      <tr><td colSpan="2" className="text-center">Sin registros</td></tr>
                    ) : (
                      datosSemanales.usuarios.map(({ semana, total }) => (
                        <tr key={semana}><td className="font-medium">{semana}</td><td className="text-right text-primary">{total}</td></tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ventas Semanales */}
            <div className="reportes-card">
              <h2>Ventas e Ingresos por Semana</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={datosSemanales.ventas}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="ingresos_totales" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Ingresos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="table-responsive">
                <table className="reportes-table">
                  <thead><tr><th>Semana (Inicio)</th><th className="text-center">N° Ventas</th><th className="text-right">Ingresos</th></tr></thead>
                  <tbody>
                    {datosSemanales.ventas.length === 0 ? (
                      <tr><td colSpan="3" className="text-center">Sin ventas</td></tr>
                    ) : (
                      datosSemanales.ventas.map(({ semana, cantidad_ventas, ingresos_totales }) => (
                        <tr key={semana}>
                          <td className="font-medium">{semana}</td>
                          <td className="text-center">{cantidad_ventas}</td>
                          <td className="text-right text-success">${ingresos_totales.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. SECCIÓN NEGOCIOS ================= */}
      {pestanaActiva === "negocios" && (
        <div className="animate-fade-in reportes-grid">
          {/* Gráfico de Torta para Ingresos por Negocio */}
          <div className="reportes-card">
            <h2>Distribución de Ingresos por Negocio</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportes?.ventasPorNegocio?.slice(0, 6) || []}
                    dataKey="ingresos_totales"
                    nameKey="nombre_negocio"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {reportes?.ventasPorNegocio?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla de Negocios */}
          <div className="reportes-card">
            <h2>Ventas e Ingresos por Negocio</h2>
            <div className="table-responsive">
              <table className="reportes-table">
                <thead><tr><th>Negocio</th><th className="text-center">N° de Ventas</th><th className="text-right">Ingresos</th></tr></thead>
                <tbody>
                  {reportes?.ventasPorNegocio?.length === 0 ? (
                    <tr><td colSpan="3" className="text-center text-muted">No hay datos.</td></tr>
                  ) : (
                    reportes?.ventasPorNegocio?.map((negocio, index) => (
                      <tr key={index}>
                        <td className="negocio-cell">
                          {negocio.logo ? (
                            <img src={negocio.logo} alt={negocio.nombre_negocio} className="negocio-logo" />
                          ) : (
                            <div className="negocio-avatar">{negocio.nombre_negocio?.charAt(0) || "N"}</div>
                          )}
                          <span className="negocio-nombre">{negocio.nombre_negocio}</span>
                        </td>
                        <td className="text-center">{negocio.cantidad_ventas}</td>
                        <td className="text-right text-success font-bold">${negocio.ingresos_totales.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. SECCIÓN PRODUCTOS TOP ================= */}
      {pestanaActiva === "productos" && (
        <div className="animate-fade-in">
          <div className="reportes-card">
            <h2>Top Productos Más Vendidos</h2>
            <div className="productos-grid">
              {reportes?.productosMasVendidos?.length === 0 ? (
                <p className="text-muted">No hay datos suficientes.</p>
              ) : (
                reportes?.productosMasVendidos?.map((prod, index) => (
                  <div key={index} className="producto-item">
                    {prod.imagen ? (
                      <img src={prod.imagen} alt={prod.nombre} className="reporte-producto-img" />
                    ) : (
                      <div className="reporte-producto-img-placeholder">Sin foto</div>
                    )}
                    <h3 className="reporte-producto-nombre">{prod.nombre}</h3>
                    <span className="producto-badge">{prod.total_vendidos} vendidos</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}