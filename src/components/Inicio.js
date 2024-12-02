// src/components/Presentacion.js
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const Presentacion = () => {
  return (
    <div style={styles.container}>
      <Title level={1} style={styles.title}>
        GUARDIAS APP
      </Title>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '81vh', // Ajusta la altura según el layout
    backgroundImage: 'url("/fondo-salud.jpg")', // Ruta de la imagen de fondo
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#fff',
    textAlign: 'center',
  },
  title: {
    fontSize: '4rem',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)',
  },
};

export default Presentacion;
