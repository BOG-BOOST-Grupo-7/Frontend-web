import React, { useState } from 'react';
import { crearComentarioApi } from "../../api/comentarioApi";
import "../../styles/PerfilNegocio.css"; 
import "../../styles/ModalComprobante.css"; 

const ModalComprobante = ({ venta, onClose, esVendedor = false }) => {
  if (!venta) return null;

  const detalles = venta.detalle_venta || venta.detalles || venta.items || [];

  // 1. Extraer el estado del seguimiento
  const seguimientoData = Array.isArray(venta.seguimiento) 
    ? venta.seguimiento[0] 
    : venta.seguimiento;

  const estado = seguimientoData?.estado_seguimiento ? seguimientoData.estado_seguimiento.toUpperCase() : 'PENDIENTE';
  const esEntregado = estado === 'ENTREGADO';

  // 2. Estados locales para manejar los comentarios y mensajes de éxito por producto
  const [comentarios, setComentarios] = useState({}); 
  const [mensajesExito, setMensajesExito] = useState({});

  const handleInputChange = (id_producto, campo, valor) => {
    setComentarios(prev => ({
      ...prev,
      [id_producto]: {
        ...(prev[id_producto] || { texto: "", calificacion: 5 }),
        [campo]: valor
      }
    }));
  };

  const handleEnviarComentario = async (id_producto) => {
    const datos = comentarios[id_producto];
    if (!datos || !datos.texto || !datos.texto.trim()) {
      alert("Por favor escribe un comentario antes de enviarlo.");
      return;
    }

    try {
      await crearComentarioApi({
        id_producto,
        comentario: datos.texto,
        calificacion: Number(datos.calificacion || 5)
      });
      
      // Mostrar mensaje de éxito específico para este producto
      setMensajesExito(prev => ({ ...prev, [id_producto]: "¡Reseña publicada con éxito!" }));
      setTimeout(() => {
        setMensajesExito(prev => ({ ...prev, [id_producto]: "" }));
      }, 3000);

    } catch (error) {
      console.error("Error al publicar comentario:", error);
      alert("Hubo un error al publicar el comentario.");
    }
  };

  return (
    <div className="modal-overlay">
      
      <div className="modal-content modal-comprobante-content">
        
        <div className="modal-header">
          <h2>{esVendedor ? `Comprobante de Venta #${venta.id_venta}` : "Comprobante de Compra"}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          
          <div className="card-medio">
            <h4>{esVendedor ? `Detalles de la Venta #${venta.id_venta}` : `Detalles del pedido #${venta.id_venta}`}</h4>
            
            {!esVendedor && (
              <>
                <p><strong>Fecha:</strong> {new Date(venta.fecha_venta).toLocaleDateString()}</p>
                <p><strong>Dirección:</strong> {venta.direccion}</p>
              </>
            )}

            <p><strong>Método de pago:</strong> {venta.medio_pago?.nombre_medio || venta.metodo_pago || "No especificado"}</p>
            <p><strong>Envío:</strong> {venta.metodo_envio?.nombre_metodo || venta.envio || "No especificado"}</p>

            {!esVendedor && (
              <p><strong>Estado del pedido:</strong> <span className={`badge-estado ${estado.toLowerCase()}`}>{estado}</span></p>
            )}
          </div>

          <table className="tabla-comprobante" style={{ marginTop: '15px' }}>
            <thead>
              <tr>
                <th>Producto</th>
                <th style={{textAlign: 'center'}}>Cantidad</th>
                <th style={{textAlign: 'right'}}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(detalles) ? detalles : []).map((d, index) => {
                const idProducto = d.id_producto || d.producto?.id_producto;
                const productoState = comentarios[idProducto] || { texto: "", calificacion: 5 };

                return (
                  <React.Fragment key={d.id_detalle || index}>
                    <tr>
                      <td>{d.producto?.nombre_producto || "Producto"}</td>
                      <td style={{textAlign: 'center'}}>{d.cantidad || 0}</td>
                      <td style={{textAlign: 'right'}}>
                        {Number(d.subtotal || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" })}
                      </td>
                    </tr>

                    {/* Sección de comentarios por producto */}
                    {!esVendedor && esEntregado && (
                      <tr>
                        <td colSpan="3" style={{ background: '#f9f9f9', padding: '10px' }}>
                          <div className="seccion-comentario-producto" style={{ border: '1px dashed #ccc', padding: '10px', borderRadius: '5px' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>Califica este producto:</p>
                            
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                              <select 
                                value={productoState.calificacion} 
                                onChange={(e) => handleInputChange(idProducto, 'calificacion', e.target.value)}
                                style={{ padding: '5px' }}
                              >
                                <option value="5">⭐⭐⭐⭐⭐ (5 - Excelente)</option>
                                <option value="4">⭐⭐⭐⭐ (4 - Muy bueno)</option>
                                <option value="3">⭐⭐⭐ (3 - Bueno)</option>
                                <option value="2">⭐⭐ (2 - Regular)</option>
                                <option value="1">⭐ (1 - Malo)</option>
                              </select>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <input 
                                type="text" 
                                placeholder="Escribe tu opinión (máx. 500 caracteres)..."
                                maxLength="500"
                                value={productoState.texto}
                                onChange={(e) => handleInputChange(idProducto, 'texto', e.target.value)}
                                style={{ flex: 1, padding: '5px' }}
                              />
                              <button 
                                type="button"
                                className="btn-orange" 
                                style={{ padding: '5px 10px', fontSize: '0.85rem' }}
                                onClick={() => handleEnviarComentario(idProducto)}
                              >
                                Publicar reseña
                              </button>
                            </div>

                            {mensajesExito[idProducto] && (
                              <div style={{ color: 'green', marginTop: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                {mensajesExito[idProducto]}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          <div className="total-seccion" style={{ marginTop: '15px' }}>
            Total: {Number(venta.total || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-orange" onClick={onClose}>
            Cerrar
          </button>
          {!esVendedor && (
            <button className="btn-green" onClick={() => window.print()}>
              Imprimir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalComprobante;