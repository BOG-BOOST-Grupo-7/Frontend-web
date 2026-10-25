import React, { useState, useEffect } from 'react';
import { obtenerMisCompras } from "../../api/ventaApi";
import ModalComprobante from "../../components/carrito/ModalComprobante";
import "../../styles/Historial.css";

const Historial = () => {
  const [compras, setCompras] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const data = await obtenerMisCompras();
      setCompras(data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (venta) => {
    setVentaSeleccionada(venta);
    setShowModal(true);
  };

  return (
    <div className="historial-page">
      <h1>Mi Historial de Compras</h1>
      
      {/* Aviso informativo sobre calificaciones y comentarios */}
      <div className="aviso-calificacion-banner">
        <span className="aviso-icono">💡</span>
        <p>
          Una vez que tu pedido se encuentre en estado <strong>ENTREGADO</strong>, podrás ingresar a los detalles de la compra para calificar y comentar los productos adquiridos.
        </p>
      </div>
      
      {loading ? <p>Cargando...</p> : (
        <table className="tabla-historial">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {compras.map(venta => {
              // Manejamos si seguimiento viene como array o como objeto directo
              const seguimientoData = Array.isArray(venta.seguimiento) 
                ? venta.seguimiento[0] 
                : venta.seguimiento;

              const estado = seguimientoData?.estado_seguimiento || 'PENDIENTE';

              return (
                <tr key={venta.id_venta}>
                  <td>#{venta.id_venta}</td>
                  <td>{new Date(venta.fecha_venta).toLocaleDateString()}</td>
                  <td>{Number(venta.total).toLocaleString("es-CO", { style: "currency", currency: "COP" })}</td>
                  <td>
                    <span className={`badge-estado ${estado.toLowerCase()}`}>
                      {estado}
                    </span>
                  </td>
                  <td>
                    <button className="btn-ver" onClick={() => abrirModal(venta)}>Ver detalle</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showModal && (
        <ModalComprobante 
          venta={ventaSeleccionada} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
};

export default Historial;