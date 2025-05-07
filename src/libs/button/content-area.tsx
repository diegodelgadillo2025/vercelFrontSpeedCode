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
        <div style={{ width: '100%', padding: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>Vehículos encontrados: {vehicles.length}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '15px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{vehicle.marca} {vehicle.modelo}</h4>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  📍 Ubicación: {vehicle.ubicacion.latitud.toFixed(4)}, {vehicle.ubicacion.longitud.toFixed(4)}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  💰 Precio: Bs. {vehicle.tarifa}/día
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    );
  };
export default ContentArea
