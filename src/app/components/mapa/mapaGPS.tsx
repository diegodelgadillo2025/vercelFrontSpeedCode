"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Circle,
  useMap,
  useMapEvents,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getEstrellas } from "@/app/components/mapa/getEstrellas";
import { useEffect } from "react";

function ChangeMapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng]);
  return null;
}

function ClickOutsideMapHandler({ onClickOutside }: { onClickOutside: () => void }) {
  useMapEvents({
    click: () => {
      onClickOutside();
    },
  });
  return null;
}

interface MapaGPSProps {
  lat: number;
  lng: number;
  selectedDistance: number;
  vehiculos: any[];
  setLat: (lat: number) => void;
  setLng: (lng: number) => void;
  setEstadoUbicacion: React.Dispatch<React.SetStateAction<"nulo" | "actual" | "personalizada" | "aeropuerto">>;
  cerrarTodosLosPaneles: () => void;
  setResultadosAeropuerto: (val: any[]) => void;
  setAutoReservado: (auto: any) => void;
  setMostrarMensaje: (mostrar: boolean) => void;
}

export default function MapaGPS({
  lat,
  lng,
  selectedDistance,
  vehiculos,
  setLat,
  setLng,
  setEstadoUbicacion,
  cerrarTodosLosPaneles,
  setResultadosAeropuerto,
  setAutoReservado,
  setMostrarMensaje,
}: MapaGPSProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom={true}
      className="w-full h-full"
    >
      <ClickOutsideMapHandler
        onClickOutside={() => {
          cerrarTodosLosPaneles();
          setResultadosAeropuerto([]);
        }}
      />

      <LayersControl position="topright">
  <LayersControl.BaseLayer checked name="OpenStreetMap">
    <TileLayer
      attribution='&copy; OpenStreetMap'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="OpenTopoMap">
    <TileLayer
      attribution='&copy; OpenTopoMap contributors'
      url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="Esri Satélite">
    <TileLayer
      attribution='Tiles © Esri'
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="Esri World Terrain">
    <TileLayer
      attribution='Tiles © Esri Terrain'
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="CartoDB Positron">
    <TileLayer
      attribution='&copy; CartoDB Positron'
      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="CartoDB DarkMatter">
    <TileLayer
      attribution='&copy; CartoDB DarkMatter'
      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    />
  </LayersControl.BaseLayer>
</LayersControl>


      <ChangeMapCenter lat={lat} lng={lng} />

      {/* 📍 Marcador principal */}
      <Marker
        position={[lat, lng]}
        zIndexOffset={1000000}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            setLat(position.lat);
            setLng(position.lng);
            setEstadoUbicacion("personalizada");
          },
        }}
        icon={L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
          shadowSize: [41, 41],
        })}
      />

      {/* 📍 Marcadores de autos */}
      {vehiculos.map((auto) => (
        <Marker
          key={auto.id}
          position={[auto.latitud, auto.longitud]}
           zIndexOffset={0}
          icon={L.icon({
            iconUrl: "https://cdn3.iconfinder.com/data/icons/red-car-types-colored-pack/256/red-liftback-car-16701-512.png",
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          })}
        >
          <Tooltip direction="top" offset={[0, -25]} permanent className="tooltip-auto-precio">
            <span className="text-xs font-semibold">Bs. {auto.precio}</span>
          </Tooltip>
          <Popup>
            <div className="w-[160px] sm:w-[220px] md:w-[260px] max-w-[90vw] relative">
              <div className="relative w-full h-[75px] sm:h-[82px]">
                <img
                  src={
                    auto.imagenUrl ||
                    "https://previews.123rf.com/images/nastudio/nastudio2007/nastudio200700383/152011677-silhouette-car-icon-for-logo-vehicle-view-from-side-vector-illustration.jpg"
                  }
                  alt={auto.nombre}
                  className="w-full h-full object-cover rounded-md mb-[2px]"
                />
                <div className="absolute top-1 left-1 bg-white/80 px-1 rounded text-yellow-500 text-[10px] sm:text-sm flex gap-0.5">
                  {getEstrellas(auto.calificacion || 0)}
                </div>
              </div>

              <div className="text-gray-800 text-[9px] sm:text-sm font-semibold leading-tight">
                {auto.nombre}
              </div>
              <div className="text-gray-600 text-[8px] sm:text-xs leading-tight">
                {auto.descripcion}
              </div>
              <div className="flex justify-between items-center text-[8px] sm:text-xs mt-[2px]">
                <span className="text-[var(--naranja)] font-bold text-[9px] sm:text-sm">
                  Bs. {auto.precio}/día
                </span>
                <span className="text-green-600 font-semibold">Estado: {auto.estado}</span>
              </div>
              <button
                className="mt-2 w-full bg-[#FCA311] hover:bg-[#e6950e] text-white py-[3px] px-2 rounded-md text-[9px] sm:text-sm font-medium"
                onClick={() => {  
                  if (!auto.estado) {
                    setAutoReservado(auto);
                    setMostrarMensaje(true);
                  } else {
                    window.location.href = `/pago`;
                  }
                }}
              >
                RESERVAR
              </button>

              <button
                className="mt-2 w-full bg-[#FCA311] hover:bg-[#e6950e] text-white py-[3px] px-2 rounded-md text-[9px] sm:text-sm font-medium"
                onClick={() => {  
                  if (!auto.estado) {
                    setAutoReservado(auto);
                    setMostrarMensaje(true);
                  } else {
                    window.location.href = `/detalleCoche`;
                  }
                }}
              >
                VER DETALLES
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* 🔵 Círculo de radio */}
      <Circle
        center={[lat, lng]}
        radius={selectedDistance * 1000}
        pathOptions={{
          fillColor: "var(--azul-opaco)",
          color: "var(--azul-oscuro)",
        }}
      />
    </MapContainer>
  );
}
