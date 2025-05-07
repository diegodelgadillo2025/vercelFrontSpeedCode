import type React from "react"

interface Vehicle {
  idvehiculo: number;
  imagen: string;
  marca: string;
  modelo: string;
  tarifa: number;
  transmision: string;
  consumo: string;
  tipo_auto: string;
  color: string;
  anio: number;
  ubicacion?: { latitud: number; longitud: number };
}

interface ContentAreaProps {
  vehicles: Vehicle[];
}

const ContentArea: React.FC<ContentAreaProps> = ({ vehicles = [] }) => { // Valor por defecto
  const contentAreaStyles: React.CSSProperties = {
    backgroundColor: "#f5f5f5",
    padding: "20px",
    margin: "0 auto 40px",
    width: "80%",
    maxWidth: "1200px",
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
        <p style={placeholderTextStyles}>No hay vehículos para mostrar.</p>
      ) : (
        <div style={{ width: '100%', padding: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>Vehículos encontrados: {vehicles.length}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {vehicles.map((vehicle) => (
              <div key={vehicle.idvehiculo} style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '15px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {/* Imagen a la izquierda */}
              <div style={{ marginRight: "16px", flexShrink: 0 }}>
                <img
                  src={vehicle.imagen}
                  alt={`${vehicle.marca} ${vehicle.modelo}`}
                  style={{
                    width: "120px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              </div>

                <h4 style={{ margin: '0 0 10px 0' }}>{vehicle.marca} {vehicle.modelo} {vehicle.anio}</h4>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  📍 Ubicación: {vehicle.ubicacion?.latitud?.toFixed(4)}, {vehicle.ubicacion?.longitud?.toFixed(4)}
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
