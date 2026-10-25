import { useState, useEffect, useCallback } from 'react';
import { getAllStands, getNegociosAprobados } from '../api/puestoApi'; // 👈 Usa la API, no Supabase
import MapaSVG from '../components/mapa/MapaSVG';
import ModalInfoPuesto from '../components/mapa/ModalInfoPuesto';
import './MapaMercadoPagina.css';

const MapaMercadoPagina = () => {
  const [escala, setEscala] = useState(1);
  const [puestos, setPuestos] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = useCallback(async () => {
    try {
      const [dataPuestos, dataNegocios] = await Promise.all([
        getAllStands(),
        getNegociosAprobados()
      ]);
      setPuestos(dataPuestos || []);
      setNegocios(dataNegocios || []);
    } catch (error) {
      console.error("Error cargando mapa desde la API:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Polling: recargamos cada 10 segundos para simular "tiempo real"
  useEffect(() => {
    const intervalo = setInterval(() => {
      cargarDatos();
    }, 10000);

    return () => clearInterval(intervalo);
  }, [cargarDatos]);

  const obtenerNegocio = (numeroPuesto) => {
    return negocios.find((n) => {
      if (!n.puesto) return false;
      if (Array.isArray(n.puesto)) {
        return n.puesto.some((p) => String(p.numero_puesto).trim() === String(numeroPuesto).trim());
      }
      if (typeof n.puesto === 'object' && n.puesto !== null) {
        return String(n.puesto.numero_puesto).trim() === String(numeroPuesto).trim();
      }
      return false;
    });
  };

  const manejarClicPuesto = (puesto) => {
    const numPuesto = puesto.numero_puesto || puesto.numero;
    const negocio = obtenerNegocio(numPuesto);
    setPuestoSeleccionado({ ...puesto, numero: numPuesto, negocio });
  };

  const cerrarModal = () => setPuestoSeleccionado(null);
  const acercar = () => setEscala((p) => Math.min(p + 0.15, 3));
  const alejar = () => setEscala((p) => Math.max(p - 0.15, 0.5));
  const restablecer = () => setEscala(1);

  if (cargando) return <div className="mapa-cargando">Cargando mapa...</div>;

  return (
    <div className="mapa-pagina">
      <h1>Mapa — Mercado de Pulgas San Alejo</h1>

      <div className="mapa-controles">
        <button onClick={acercar}>➕</button>
        <button onClick={alejar}>➖</button>
        <button onClick={restablecer}>↺</button>
        <span className="zoom-indicador">{Math.round(escala * 100)}%</span>
      </div>

      <div className="mapa-viewport">
        <div className="mapa-contenido"
        style={{
          transform: `scale(${escala})`,
          transformOrigin: 'top left',
          }}
          >
          <MapaSVG
            puestos={puestos}
            obtenerNegocio={obtenerNegocio}
            alHacerClicPuesto={manejarClicPuesto}
          />
        </div>
      </div>

      <ModalInfoPuesto
        puesto={puestoSeleccionado}
        negocio={puestoSeleccionado?.negocio}
        alCerrar={cerrarModal}
      />
    </div>
  );
};

export default MapaMercadoPagina;