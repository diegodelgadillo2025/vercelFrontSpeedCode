import type React from "react"

interface ContentAreaProps {
  vehicles?: any[]; // Hacer la prop opcional
}

const ContentArea: React.FC<ContentAreaProps> = ({ vehicles = [] }) => { // Valor por defecto
  const contentAreaStyles: React.CSSProperties = {
    backgroundColor: "#f5f5f5",
    padding: "20px",
    margin: "0 auto 40px",
    width: "80%",
    maxWidth: "1200px",
    minHeight: "500px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }

  const placeholderTextStyles: React.CSSProperties = {
    color: "#999",
    fontSize: "18px",
    textAlign: "center",
  }

  return (
    <div style={contentAreaStyles}>
      {vehicles.length === 0 ? (
        <p style={placeholderTextStyles}>Aquí se mostrarán los resultados de la búsqueda</p>
      ) : (
        <div style={{ width: '100%' }}>
          <h3>Vehículos encontrados: {vehicles.length}</h3>
          {vehicles.map((vehicle) => (
            <div key={vehicle.id}>
              <h4>{vehicle.marca} {vehicle.modelo}</h4>
              <p>Ubicación: {vehicle.ubicacion.latitud}, {vehicle.ubicacion.longitud}</p>
              <p>Precio: Bs. {vehicle.precio}/día</p>
            </div>
          ))}
        </div>
      )}
      </div>
    );
  };
export default ContentArea
