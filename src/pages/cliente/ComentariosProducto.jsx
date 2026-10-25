import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStar } from 'react-icons/fa';
import { obtenerComentariosProductoApi, obtenerPromedioProductoApi } from '../../api/comentarioApi';
import { obtenerProducto } from '../../api/productoApi';

const ComentariosProducto = () => {
  const { idProducto } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [promedioData, setPromedioData] = useState({ promedio: 0, total_comentarios: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [idProducto]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [prodData, comData, promData] = await Promise.all([
        obtenerProducto(idProducto),
        obtenerComentariosProductoApi(idProducto),
        obtenerPromedioProductoApi(idProducto)
      ]);

      setProducto(prodData);
      setComentarios(comData);
      setPromedioData(promData);
    } catch (error) {
      console.error("Error al cargar opiniones del producto:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando opiniones...</p>;

  return (
    <div className="comentarios-page" style={{ maxWidth: '800px', margin: '30px auto', padding: '20px' }}>
      <button 
        className="btn-volver" 
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
      >
        <FaArrowLeft /> Volver al producto
      </button>

      {producto && (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '20px', marginBottom: '20px' }}>
          {producto.imagen && <img src={producto.imagen} alt={producto.nombre_producto} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />}
          <div>
            <h2>Opiniones de: {producto.nombre_producto}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f39c12', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaStar /> {promedioData.promedio} / 5.0
              </span>
              <span style={{ color: '#666' }}>({promedioData.total_comentarios} valoraciones)</span>
            </div>
          </div>
        </div>
      )}

      <div className="lista-comentarios">
        {comentarios.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#777', padding: '30px 0' }}>Este producto aún no tiene comentarios registrados.</p>
        ) : (
          comentarios.map((c) => (
            <div key={c.id_comentario} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ color: '#f39c12' }}>
                  {[...Array(c.calificacion)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <small style={{ color: '#888' }}>{new Date(c.fecha).toLocaleDateString()}</small>
              </div>
              <p style={{ margin: 0, color: '#333', fontSize: '0.95rem' }}>{c.comentario}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComentariosProducto;