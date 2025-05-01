"use client"

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface NavbarProps {
  windowWidth: number;
}

const Navbar: React.FC<NavbarProps> = ({ windowWidth }) => {
  const router = useRouter();
  const [time, setTime] = useState(dayjs().tz('America/La_Paz').format('HH:mm:ss'));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs().tz('America/La_Paz').format('HH:mm:ss'));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Modificar el estilo de la barra de navegación para permitir un diseño de tres secciones
  const navbarStyles: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "60px",
    backgroundColor: "#ffffff",
    display: "grid",
    gridTemplateColumns: windowWidth < 768 ? "1fr auto" : "1fr 2fr 1fr", // Tres columnas en desktop, dos en móvil
    alignItems: "center",
    padding: "0 20px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
  }

  // Actualizar el estilo del logo para mantenerlo a la izquierda
  const logoStyles: React.CSSProperties = {
    color: "#FF6B00",
    fontWeight: "bold",
    fontSize: "24px",
    margin: 0,
    gridColumn: "1", // Colocar en la primera columna
  }

  // Modificar el estilo del contenedor de botones para centrarlos
  const navButtonsContainerStyles: React.CSSProperties = {
    display: windowWidth < 768 ? "none" : "flex",
    justifyContent: "center", // Centrar los botones horizontalmente
    gap: "20px",
    gridColumn: "2", // Colocar en la columna central
  }

  const navButtonStyles: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: "#333",
    padding: "8px 12px",
    transition: "color 0.3s ease",
  }

  // Actualizar el estilo del botón de menú móvil
  const mobileMenuButtonStyles: React.CSSProperties = {
    display: windowWidth < 768 ? "block" : "none",
    gridColumn: "2", // En móvil, colocar en la segunda columna
    justifySelf: "end", // Alinear a la derecha
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
  }

  const clockStyles: React.CSSProperties = {
    backgroundColor: "#f4f4f4",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#333",
    textAlign: "center",
    justifySelf: windowWidth < 768 ? "center" : "end",
    gridColumn: windowWidth < 768 ? "1 / -1" : "3",
    marginTop: windowWidth < 768 ? "5px" : "0",
  }

  // Modificar el return para usar el nuevo diseño de grid
  return (
    <nav style={navbarStyles}>
      <span 
        onClick={() => router.push('/carousel')}
        style={{ 
          cursor: 'pointer',
          color: "#FF6B00",
          fontWeight: "bold",
          fontSize: "24px",
          margin: 0,
          gridColumn: "1",
        }}
      >
        REDIBO
      </span>
      <div style={navButtonsContainerStyles}>
      </div>
      <div style={clockStyles}>
        {time}
      </div>
    </nav>
  )
}

export default Navbar