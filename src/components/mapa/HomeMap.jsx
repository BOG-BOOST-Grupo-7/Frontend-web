import { Link } from 'react-router-dom';
import './MapaMercado.css';

const HomeMap = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Asociación Mercado de Pulgas San Alejo</h1>
        <p>Explora nuestro mapa interactivo y encuentra tu puesto favorito</p>
        
        <Link to="/mapa" className="map-button">
          <div className="map-preview-container">
            <img 
              src="/mapa-referencia.png" 
              alt="Mapa Mercado de Pulgas San Alejo"
              className="map-preview-image"
            />
            <div className="map-overlay">
              <span>Ver Mapa Completo</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HomeMap;