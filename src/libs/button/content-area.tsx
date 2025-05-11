import type React from "react"
import { useRouter } from 'next/navigation';

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
  distance: number;
  ubicacion: { latitud: number; longitud: number };
}

interface ContentAreaProps {
  vehicles: Vehicle[];
}

const ContentArea: React.FC<ContentAreaProps> = ({ vehicles = [] }) => { // Valor por defecto
  const contentAreaStyles: React.CSSProperties = {
    backgroundColor: "#f5f5f5",
    margin: "0 auto 40px",
    width: "90%",
    maxWidth: "1200px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }

  const placeholderTextStyles: React.CSSProperties = {
    color: "#999",
    fontSize: "18px",
    textAlign: "center",
  }

  const router = useRouter();

  return (
    <div style={contentAreaStyles}>
      {vehicles.length === 0 ? (
        <p style={placeholderTextStyles}>No se encontraron coches disponibles</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, width: "100%" }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'left' }}>Vehículos encontrados: {vehicles.length}</h3>
          {vehicles.map((v) => (
            <li
              key={v.idvehiculo}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                background: "#fff",
                padding: "12px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {/* Imagen a la izquierda */}
              <div style={{ marginRight: "16px", flexShrink: 0 }}>
                <img
                  src={v.imagen}
                  alt={`${v.marca} ${v.modelo}`}
                  style={{
                    width: "120px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              </div>

              {/* Detalles del vehículo */}
              <div style={{ flex: "1 1 auto", textAlign: 'left' }}>
                <p><strong>{v.marca} {v.modelo} {v.color} año {v.anio}</strong></p>
                <p>Tarifa: $ {v.tarifa} / día</p>
                <p>Transmisión: {v.transmision}</p>
                <p>Consumo: {v.consumo}</p>
                {/*<p>Ubicación: Latitud({v.ubicacion.latitud.toFixed(2)}) , Longitud({v.ubicacion.longitud.toFixed(2)})</p>*/} 
                <p>{v.distance !== undefined && ` Distancia aproximada: ${v.distance.toFixed(2)} km`}</p>
              </div>

              {/* Botón Reservar Ahora a la derecha */}
              <button
                style={{
                  marginLeft: "16px",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#FF6B00",
                  color: "#fff",
                  flexShrink: 0,
                }}
                onClick={() => router.push(`/reserva?id=${v.idvehiculo}`)}
              >
                RESERVAR AHORA
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default ContentArea;