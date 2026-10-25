import React from 'react';
import  HomeMap  from '../../components/home/HomeMap';
import './Mapa.css';  

const Mapa = () => {
  return (
    <div className="mapa-page">
      <div className="mapa-container">
        <HomeMap />
      </div>
    </div>
  );
};

export default Mapa;