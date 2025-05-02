"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Popup,
  LayersControl,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const iconoNormal = new L.Icon({
  iconUrl:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="orange">
        <path d="M5 16a2 2 0 100 4 2 2 0 000-4zm14 0a2 2 0 100 4 2 2 0 000-4zM3 6l2.92 8H18l3-8H3z"/>
      </svg>
    `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

const iconoUsuario = new L.Icon({
  iconUrl:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#00BFFF" opacity="0.3"/>
        <circle cx="12" cy="12" r="6" fill="#00BFFF"/>
      </svg>
    `),
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

interface PuntoMapa {
  idVehiculo: number;
  precio: number;
  latitud: number;
  amplitud: number;
}

interface DetalleVehiculo {
  id: number;
  imagen: string;
  nombre: string;
  descripcion: string;
  precio: number;
}

interface Props {
  distanciaFiltro?: number;
}

const IrAUbicacion = ({ setUbicacionUsuario }: { setUbicacionUsuario: (pos: [number, number]) => void }) => {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 13 });

    map.on("locationfound", (e) => {
      const { lat, lng } = e.latlng;
      setUbicacionUsuario([lat, lng]);
    });

    map.on("locationerror", (e) => {
      console.error("No se pudo obtener ubicación:", e.message);
    });
  }, [map, setUbicacionUsuario]);

  return null;
};

export default function FiltroMapaPrecio({ distanciaFiltro = 100 }: Props) {
  const [puntos, setPuntos] = useState<PuntoMapa[]>([]);
  const [detalles, setDetalles] = useState<Record<number, DetalleVehiculo>>({});
  const [ubicacionUsuario, setUbicacionUsuario] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetch("https://vercel-back-speed-code.vercel.app/mapa/gps")
      .then((res) => res.json())
      .then((data) => setPuntos(data));
  }, []);

  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const puntosFiltrados = puntos.filter(punto => {
    if (!ubicacionUsuario) return true;
    const distancia = calcularDistancia(
      ubicacionUsuario[0],
      ubicacionUsuario[1],
      punto.latitud,
      punto.amplitud
    );
    return distancia <= distanciaFiltro;
  });

  const obtenerDetalle = async (id: number) => {
    if (!detalles[id]) {
      try {
        const res = await fetch(`https://vercel-back-speed-code.vercel.app/mapa/gps/${id}`);
        const data = await res.json();
        setDetalles((prev) => ({ ...prev, [id]: data }));
      } catch (err) {
        console.error("Error al obtener detalle:", err);
      }
    }
  };

  return (
    <div className="w-full mt-6 rounded-xl shadow-md overflow-hidden border border-gray-200 bg-white">
      <div className="h-[500px] w-full relative z-0">
        <MapContainer
          center={[-17.7833, -63.1833]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
        >
          <IrAUbicacion setUbicacionUsuario={setUbicacionUsuario} />

          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Normal">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satélite">
              <TileLayer
                url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                attribution="© Google"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Relieve">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution="© OpenTopoMap"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {puntosFiltrados.map((punto) => (
            <Marker
              key={punto.idVehiculo}
              icon={iconoNormal}
              position={[punto.latitud, punto.amplitud]}
              eventHandlers={{
                click: () => obtenerDetalle(punto.idVehiculo),
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -20]}>
                Bs. {punto.precio}
              </Tooltip>

              {detalles[punto.idVehiculo] && (
                <Popup closeButton={false} autoClose={false}>
                  <div className="w-[250px] max-w-[90vw]">
                    <img
                      src={detalles[punto.idVehiculo].imagen}
                      alt={detalles[punto.idVehiculo].nombre}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                    <h3 className="text-sm font-semibold text-gray-800">
                      {detalles[punto.idVehiculo].nombre}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {detalles[punto.idVehiculo].descripcion}
                    </p>
                    <p className="text-orange-600 font-bold text-sm mt-1">
                      Bs. {detalles[punto.idVehiculo].precio}/día
                    </p>
                    <button className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded-md text-sm font-medium">
                      Ver Detalles
                    </button>
                  </div>
                </Popup>
              )}
            </Marker>
          ))}

          {ubicacionUsuario && (
            <Marker position={ubicacionUsuario} icon={iconoUsuario}>
              <Tooltip permanent direction="top" offset={[0, -10]}>
                Tú estás aquí
              </Tooltip>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}