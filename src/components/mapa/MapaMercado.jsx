import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import ModalInfoPuesto from '../components/mapa/ModalInfoPuesto';
import './MapaMercado.css';

const MapaMercado = () => {
  const [escala, setEscala] = useState(1);
  const [puestos, setPuestos] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarTodo = async () => {
      setCargando(true);
      
      try {
        // 1. Cargar puestos desde el esquema 'negocio' y la tabla 'puesto'
        const { data: listaPuestos, error: errorPuestos } = await supabase
          .schema('negocio')
          .from('puesto')
          .select('*')
          .order('numero_puesto', { ascending: true });

        if (errorPuestos) {
          console.error('Error al cargar puestos:', errorPuestos);
        } else {
          setPuestos(listaPuestos || []);
        }

        // 2. Cargar negocios aprobados desde el esquema 'negocio' trayendo la relación con el puesto
        const { data: listaNegocios, error: errorNegocios } = await supabase
          .schema('negocio')
          .from('negocio')
          .select('*, puesto(numero_puesto)')
          .eq('estado_negocio', 'APROBADO');

        if (errorNegocios) {
          console.error('Error al cargar negocios:', errorNegocios);
        } else {
          setNegocios(listaNegocios || []);
        }
      } catch (err) {
        console.error('Error general cargando el mapa:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarTodo();
  }, []);

  // Función para asociar el número de puesto con el negocio aprobado
  const obtenerNegocio = (numeroPuesto) => {
    return negocios.find((n) => {
      if (!n.puesto) return false;
      if (Array.isArray(n.puesto)) {
        return n.puesto.some((p) => String(p.numero_puesto) === String(numeroPuesto));
      }
      return String(n.puesto.numero_puesto) === String(numeroPuesto);
    });
  };

  const manejarClicPuesto = (numeroPuesto) => {
    const puestoData = puestos.find(p => String(p.numero_puesto || p.numero) === String(numeroPuesto)) || { numero_puesto: numeroPuesto };
    const negocio = obtenerNegocio(numeroPuesto);
    setPuestoSeleccionado({ 
      ...puestoData, 
      numero: puestoData.numero_puesto || puestoData.numero, 
      negocio 
    });
  };

  const acercar = () => setEscala(p => Math.min(p + 0.2, 2.5));
  const alejar = () => setEscala(p => Math.max(p - 0.2, 0.5));
  const reiniciar = () => setEscala(1);

  if (cargando) return <div className="cargando">Cargando mapa...</div>;

  return (
    <div className="pagina-mapa">
      <h1>Mapa — Mercado de Pulgas San Alejo</h1>

      <div className="barra-controles">
        <button onClick={acercar}>+</button>
        <button onClick={alejar}>−</button>
        <button onClick={reiniciar}>↻ Restablecer</button>
      </div>

      <div className="contenedor-central">
        <div className="envoltorio-escalado">
          <svg 
            className="lienzo-mapa-svg"
            viewBox="0 0 1300 900"
            style={{ transform: `scale(${escala})` }}
          >
            {/* === REFERENCIAS VISUALES Y ARQUITECTURA === */}
            <g className="referencia-arquitectura" transform="translate(1000, 30)">
              <text x="50" y="50" className="label-icono">⛪</text>
              <text x="50" y="70" className="label-ref">MONSERRATE</text>
            </g>

            <g className="referencia-arquitectura" transform="translate(450, 100)">
              <text x="100" y="40" className="label-icono">🏛️</text>
              <text x="100" y="60" className="label-ref">MUSEO DE ARTE MODERNO</text>
            </g>

            <g className="referencia-arquitectura" transform="translate(100, 300)">
              <text x="50" y="50" className="label-icono">🪐</text>
              <text x="50" y="75" className="label-ref">PLANETARIO DISTRITAL</text>
            </g>

            <g className="referencia-arquitectura" transform="translate(400, 800)">
              <text x="60" y="30" className="label-icono">🏙️</text>
              <text x="60" y="50" className="label-ref">TORRE COLPATRIA</text>
            </g>

            {/* === BLOQUE DE DIBUJO DINÁMICO DE PUESTOS DESDE SUPABASE === */}
            <g className="grupo-puestos">
              {puestos.map((puesto) => {
                const numPuesto = puesto.numero_puesto || puesto.numero;
                const negocio = obtenerNegocio(numPuesto);
                const esOcupado = Boolean(negocio);
                
                // Coordenadas predeterminadas de respaldo si la base de datos no las trae exactas
                const posX = puesto.x !== undefined && puesto.x !== null ? puesto.x : 400;
                const posY = puesto.y !== undefined && puesto.y !== null ? puesto.y : 300;
                const ancho = puesto.ancho || 25;
                const alto = puesto.alto || 25;

                return (
                  <g
                    key={numPuesto}
                    className={`puesto-svg ${esOcupado ? 'ocupado' : 'disponible'}`}
                    onClick={() => manejarClicPuesto(numPuesto)}
                  >
                    <title>
                      Puesto #{numPuesto} — {esOcupado ? 'Ocupado' : 'Disponible'}
                    </title>
                    <rect
                      x={posX}
                      y={posY}
                      width={ancho}
                      height={alto}
                      rx="2"
                    />
                    <text
                      x={posX + ancho / 2}
                      y={posY + alto / 2 + 4}
                      className="texto-p"
                      textAnchor="middle"
                    >
                      {numPuesto}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      <ModalInfoPuesto
        puesto={puestoSeleccionado}
        negocio={puestoSeleccionado?.negocio}
        alCerrar={() => setPuestoSeleccionado(null)}
      />
    </div>
  );
};

export default MapaMercado;