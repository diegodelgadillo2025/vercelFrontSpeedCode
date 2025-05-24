"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Popup,
  LayersControl,
  Tooltip,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const iconoNormal = new L.Icon({
  iconUrl:
    "data:image/svg+xml;utf8," +
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
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#00BFFF" opacity="0.3"/>
        <circle cx="12" cy="12" r="6" fill="#00BFFF"/>
      </svg>
    `),
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

interface Vehiculo {
  id: number;
  imagen: string;
  nombre: string;
  descripcion: string;
  precio: number;
  calificacion: number | null;
  latitud: number;
  longitud: number;
}

const IrAUbicacion = ({
  setUbicacionUsuario,
}: {
  setUbicacionUsuario: (pos: [number, number]) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 13 });

    map.on("locationfound", (e) => {
      const { lat, lng } = e.latlng;
      setUbicacionUsuario([lat, lng]);
    });

    map.on("locationerror", (e) => {
      console.warn("No se pudo obtener ubicación del usuario:", e.message);
    });
  }, [map, setUbicacionUsuario]);

  return null;
};

interface FiltroMapaPrecioProps {
  texto: string;
  distancia: string;
  fechaInicio: string;
  fechaFin: string;
  onLocationChange?: (pos: [number, number]) => void; // Nueva prop
}

export default function FiltroMapaPrecio({
  texto,
  distancia,
  fechaInicio,
  fechaFin,
  onLocationChange // Añade esta prop desestructurada
}: FiltroMapaPrecioProps) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [ubicacionUsuario, setUbicacionUsuario] = useState<
    [number, number] | null
  >(null);
  const [precioMin, setPrecioMin] = useState<string>("");
  const [precioMax, setPrecioMax] = useState<string>("");

  //const [texto, setTexto] = useState<string>(""); // Para el texto de búsqueda
  //const [distancia, setDistancia] = useState<string>(""); // Para la distancia
  //const [fechaInicio, setFechaInicio] = useState<string>(""); // Fecha de inicio
  //const [fechaFin, setFechaFin] = useState<string>(""); // Fecha de fin

  const lastParams = useRef<string>("");

  const fetchVehiculos = async () => {
    try {
      const params = new URLSearchParams();

      // Filtro de texto
      if (texto.trim() !== "") params.append("texto", texto.trim());

      // Filtro de distancia
      if (distancia.trim() !== "") params.append("dkm", distancia.trim());

      // Filtro de fechas
      if (fechaInicio.trim() !== "")
        params.append("fechaInicio", fechaInicio.trim());
      if (fechaFin.trim() !== "") params.append("fechaFin", fechaFin.trim());

      // Filtro de ubicación (latitud y longitud)
      if (
        ubicacionUsuario &&
        !isNaN(ubicacionUsuario[0]) &&
        !isNaN(ubicacionUsuario[1])
      ) {
        params.append("lat", String(ubicacionUsuario[0]));
        params.append("lng", String(ubicacionUsuario[1]));
      }

      // Filtros de precio
      if (precioMin.trim() !== "") params.append("precioMin", precioMin.trim());
      if (precioMax.trim() !== "") params.append("precioMax", precioMax.trim());

      const queryString = params.toString();
      if (queryString === lastParams.current) {
        return; // No hay cambios, no llamar de nuevo
      }

      lastParams.current = queryString;

      // URL del backend
      const url = `https://vercel-back-speed-code.vercel.app/mapa/?${queryString}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.vehiculos && Array.isArray(data.vehiculos.vehiculos)) {
        const vehs: Vehiculo[] = data.vehiculos.vehiculos;
        setVehiculos(vehs);

        console.log("Cantidad de vehículos:", vehs.length);
        console.log(
          "Puntos GPS:",
          vehs.map((v) => ({
            lat: v.latitud,
            lng: v.longitud,
          }))
        );
      } else {
        console.warn("Respuesta inesperada:", data);
      }
    } catch (err) {
      console.error("Error al obtener vehículos:", err);
    }
  };

  useEffect(() => {
    fetchVehiculos();
    const interval = setInterval(fetchVehiculos, 10000);
    return () => clearInterval(interval);
  }, [
    ubicacionUsuario,
    precioMin,
    precioMax,
    texto,
    distancia,
    fechaInicio,
    fechaFin,
  ]);

  const renderEstrellas = (cal: number | null) => {
    const baseClass =
      "absolute top-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs font-semibold text-yellow-500 flex items-center gap-[2px]";

    if (cal === null) {
      return (
        <div className={baseClass}>
          <span>Sin calificación</span>
        </div>
      );
    }

    const llenas = Math.floor(cal);
    const media = cal % 1 >= 0.5 ? 1 : 0;
    const vacias = 5 - llenas - media;

    return (
      <div className={baseClass}>
        {Array.from({ length: llenas }, (_, i) => (
          <FaStar key={`full-${i}`} />
        ))}
        {media === 1 && <FaStarHalfAlt />}
        {Array.from({ length: vacias }, (_, i) => (
          <FaRegStar key={`empty-${i}`} />
        ))}
      </div>
    );
  };
  return (
    <div className="w-full mt-6 rounded-xl shadow-md overflow-hidden border border-gray-200 bg-white">
      {/* Inputs de precio con label, texto "Bs./día" y diseño responsivo */}
      <div className="p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Rango de precios (Bs./día)
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col w-full">
            <input
              type="number"
              placeholder="Precio mínimo"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              className="border px-3 py-1 rounded-md text-sm w-full"
            />
          </div>
          <div className="flex flex-col w-full">
            <input
              type="number"
              placeholder="Precio máximo"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              className="border px-3 py-1 rounded-md text-sm w-full"
            />
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="h-[500px] w-full relative z-0">
        <MapContainer
          center={[-17.7833, -63.1833]} // Centro en Cochabamba
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

          {vehiculos.map((v) => (
            <Marker
              key={v.id}
              position={[v.latitud, v.longitud]}
              icon={iconoNormal}
            >
              <Tooltip permanent direction="top" offset={[0, -20]}>
                Bs. {v.precio}
              </Tooltip>
              <Popup closeButton={false} autoClose={false}>
                <div className="w-[160px] sm:w-[220px] md:w-[260px] max-w-[90vw] relative">
                  {renderEstrellas(v.calificacion)}

                  <img
                    src={v.imagen}
                    alt={v.nombre}
                    className="w-full h-[75px] sm:h-[82px] object-cover rounded-md mb-[2px]"
                  />

                  <div className="text-gray-800 text-[9px] sm:text-sm font-semibold leading-tight m-0 p-0">
                    {v.nombre}
                  </div>

                  <div className="text-gray-600 text-[8px] sm:text-xs leading-tight m-0 p-0">
                    {v.descripcion}
                  </div>

                  <div className="flex justify-between items-center text-[8px] sm:text-xs mt-[2px] leading-tight m-0 p-0">
                    <span className="text-orange-600 font-bold text-[9px] sm:text-sm">
                      Bs. {v.precio}/día
                    </span>
                    <span className="text-green-600 font-semibold">
                      Disponible
                    </span>
                  </div>

                  <button className="mt-2 w-full bg-[#808080] hover:bg-[#6e6e6e] text-white py-[3px] px-2 rounded-md text-[9px] sm:text-sm font-medium">
                    Ver Detalles
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {ubicacionUsuario && (
            <>
              <Marker 
                position={ubicacionUsuario} 
                icon={iconoUsuario}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const newPos = e.target.getLatLng();
                    setUbicacionUsuario([newPos.lat, newPos.lng]);
                    onLocationChange?.([newPos.lat, newPos.lng]); // Usa la prop desestructurada
                  }
                }}
              >
                <Tooltip permanent direction="top" offset={[0, -10]}>
                  Arrástrame para buscar vehículos cercanos
                </Tooltip>
              </Marker>

              {distancia.trim() !== "" && (
                <Circle
                  center={ubicacionUsuario}
                  radius={Number(distancia.trim()) * 1000}
                  pathOptions={{
                    color: "blue",
                    fillColor: "blue",
                    fillOpacity: 0.1,
                  }}
                />
              )}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
