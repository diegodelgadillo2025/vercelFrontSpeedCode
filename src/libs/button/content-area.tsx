import type React from "react"
import { useRouter } from 'next/navigation';
/*actualizar aqui segun este dato de salida ajustar segun esto "{
  "vehiculos": {
    "cantidad": 5,
    "vehiculos": [
      {
        "id": 61,
        "imagen": "https://i.pinimg.com/736x/5b/56/1b/5b561ba5754a6cfabbd75c876e36d374.jpg",
        "nombre": "Toyota - Corolla",
        "descripcion": "Vehículo cómodo y eficiente",
        "precio": 40.5,
        "calificacion": null,
        "latitud": -17.3895,
        "longitud": -66.1568,
        "anio": 2020,
        "transmision": "Automático",
        "consumo": "15km/l"
      },
      {
        "id": 81,
        "imagen": "https://i.pinimg.com/736x/58/a2/e2/58a2e20ad3f20f2fba379a1496f8a26f.jpg",
        "nombre": "Toyota - Yaris",
        "descripcion": "Práctico y ahorrador",
        "precio": 34,
        "calificacion": 4.3,
        "latitud": -17.4032,
        "longitud": -66.0389,
        "anio": 2019,
        "transmision": "Manual",
        "consumo": "17km/l"
      },
      {
        "id": 86,
        "imagen": "https://i.pinimg.com/736x/5b/56/1b/5b561ba5754a6cfabbd75c876e36d374.jpg",
        "nombre": "Toyota - Corolla",
        "descripcion": "Vehículo cómodo y eficiente",
        "precio": 40.5,
        "calificacion": 4.1,
        "latitud": -17.3895,
        "longitud": -66.1568,
        "anio": 2020,
        "transmision": "Automático",
        "consumo": "15km/l"
      },
      {
        "id": 41,
        "imagen": "https://i.pinimg.com/736x/6a/3f/cb/6a3fcb9eef7f7629d14ad14070fdb38d.jpg",
        "nombre": "Toyota - Corolla",
        "descripcion": "Vehículo en excelente estado",
        "precio": 250,
        "calificacion": 4.5,
        "latitud": -17.7833,
        "longitud": -63.1833,
        "anio": 2020,
        "transmision": "Automática",
        "consumo": "Gasolina"
      },
      {
        "id": 56,
        "imagen": "https://i.pinimg.com/736x/7b/e4/01/7be40125278b16da5d73c274bb553afc.jpg",
        "nombre": "Toyota - RAV4",
        "descripcion": "Híbrido y espacioso para la familia",
        "precio": 310,
        "calificacion": 3.6,
        "latitud": -22.0833,
        "longitud": -65.6,
        "anio": 2021,
        "transmision": "Automática",
        "consumo": "Híbrido"
      }
    ]
  }
}"*/

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