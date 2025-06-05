"use client";
//filtros version 2
import { useRef, useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { MapContainer, TileLayer, Marker, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function ChangeMapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng]);
  return null;
}

export default function MapaConFiltrosEstaticos() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [mostrarAeropuerto, setMostrarAeropuerto] = useState(false);
  const [mostrarDistanciaSlider, setMostrarDistanciaSlider] = useState(false);
  const [lat, setLat] = useState(-17.7833);
  const [lng, setLng] = useState(-63.1833);
  const [selectedDistance, setSelectedDistance] = useState(10);
  const [estadoUbicacion, setEstadoUbicacion] = useState<
    "nulo" | "actual" | "personalizada" | "aeropuerto"
  >("nulo");
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0 });
  const [aeropuertoStyle, setAeropuertoStyle] = useState({ top: 0, left: 0 });
  const [distanciaStyle, setDistanciaStyle] = useState({ top: 0, left: 0 });
  const [nombreAeropuerto, setNombreAeropuerto] = useState("Aeropuerto");
  const [mostrarFechaInicio, setMostrarFechaInicio] = useState(false);
  const [mostrarFechaFin, setMostrarFechaFin] = useState(false);
  const [fechaInicio, setFechaInicio] = useState<string | null>(null);
  const [fechaFin, setFechaFin] = useState<string | null>(null);
  const [fechaInicioStyle, setFechaInicioStyle] = useState({ top: 0, left: 0 });
  const [fechaFinStyle, setFechaFinStyle] = useState({ top: 0, left: 0 });
  const [mostrarPrecioMin, setMostrarPrecioMin] = useState(false);
  const [mostrarPrecioMax, setMostrarPrecioMax] = useState(false);
  const [precioMin, setPrecioMin] = useState<number | null>(null);
  const [precioMax, setPrecioMax] = useState<number | null>(null);
  const [precioMinStyle, setPrecioMinStyle] = useState({ top: 0, left: 0 });
  const [precioMaxStyle, setPrecioMaxStyle] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, input, form, label")) return;
      isDown = true;
      el.classList.add("cursor-grabbing");
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
      el.classList.remove("cursor-grabbing");
    };
    const onMouseUp = () => {
      isDown = false;
      el.classList.remove("cursor-grabbing");
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mousemove", onMouseMove);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  const handleUbicacion = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    setDropdownStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setMostrarSelector((prev) => !prev);
  };
  const handleAeropuerto = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    setAeropuertoStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setMostrarAeropuerto((prev) => !prev);
  };
  const handleDistancia = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    setDistanciaStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setMostrarDistanciaSlider((prev) => !prev);
  };
  const handleFechaInicio = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFechaInicioStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setMostrarFechaInicio((prev) => !prev);
  };

  const handleFechaFin = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFechaFinStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setMostrarFechaFin((prev) => !prev);
  };
  const handlePrecioMin = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPrecioMinStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setMostrarPrecioMin((prev) => !prev);
  };

  const handlePrecioMax = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPrecioMaxStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setMostrarPrecioMax((prev) => !prev);
  };

  const aplicarAeropuerto = () => {
    setLat(-17.414248);
    setLng(-66.1813992);
    setEstadoUbicacion("aeropuerto");
    setNombreAeropuerto("Wilsterman");
    setMostrarAeropuerto(false);
  };
  const usarUbicacionActual = () => {
    setCargandoUbicacion(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setEstadoUbicacion("actual");
          setMostrarSelector(false);
          setCargandoUbicacion(false);
        },
        () => {
          alert("Error al obtener ubicación");
          setCargandoUbicacion(false);
        }
      );
    } else {
      alert("Geolocalización no soportada");
      setCargandoUbicacion(false);
    }
  };
  const manejarEnlaceGoogleMaps = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = new FormData(e.currentTarget).get("mapUrl")?.toString() || "";
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      setLat(parseFloat(match[1]));
      setLng(parseFloat(match[2]));
      setEstadoUbicacion("personalizada");
      setMostrarSelector(false);
    } else {
      alert("URL inválida de Google Maps");
    }
  };

  const textoUbicacion =
    estadoUbicacion === "nulo"
      ? "Ubicación: No definida"
      : estadoUbicacion === "actual"
      ? "Ubicación: Mi ubicación"
      : estadoUbicacion === "aeropuerto"
      ? "Ubicación: Aeropuerto definido"
      : "Ubicación: Dirección personalizada";

  return (
    <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden px-2 md:px-4 relative">
      {mostrarSelector && (
        <div
          className="fixed z-[2000] bg-white border-black border rounded p-3 shadow-xl w-64"
          style={dropdownStyle}
        >
          <form onSubmit={manejarEnlaceGoogleMaps}>
            <input
              name="mapUrl"
              type="text"
              placeholder="Pegar link aquí"
              className="w-full border p-1 rounded text-sm mb-2"
            />
            <button
              type="submit"
              className="w-full bg-orange-500 text-white rounded px-2 py-1 text-sm mb-1"
            >
              Usar link personalizada
            </button>
          </form>
          <button
            onClick={usarUbicacionActual}
            disabled={cargandoUbicacion}
            className="w-full bg-blue-700 text-white rounded px-2 py-1 text-sm"
          >
            {cargandoUbicacion
              ? "Obteniendo ubicación..."
              : "usar mi ubicacion actual"}
          </button>
        </div>
      )}

      {mostrarAeropuerto && (
        <div
          className="fixed z-[2000] bg-white border-black border rounded p-3 shadow-xl w-64"
          style={aeropuertoStyle}
        >
          <label className="block text-sm mb-1">Buscar aeropuerto:</label>
          <input
            type="text"
            value="Wilsterman"
            readOnly
            className="w-full border p-1 rounded mb-2 text-sm"
          />
          <button
            onClick={aplicarAeropuerto}
            className="w-full bg-green-600 text-white rounded px-2 py-1 text-sm"
          >
            Aplicar
          </button>
        </div>
      )}

      {mostrarDistanciaSlider && (
        <div
          className="fixed z-[2000] bg-white border-black border rounded p-3 shadow-xl w-64"
          style={distanciaStyle}
        >
          <label className="text-sm mb-1 block">
            Seleccionar distancia (km):
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={selectedDistance}
            onChange={(e) => setSelectedDistance(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-sm mt-2">{selectedDistance} km</div>
        </div>
      )}
      {mostrarFechaInicio && (
        <div
          className="fixed z-[2000] bg-white border-black border rounded p-3 shadow-xl w-64"
          style={fechaInicioStyle}
        >
          <label className="text-sm block mb-2">
            Selecciona fecha de inicio:
          </label>
          <input
            type="date"
            value={fechaInicio || ""}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full border px-2 py-1 text-sm rounded"
          />
        </div>
      )}

      {mostrarFechaFin && (
        <div
          className="fixed z-[2000] bg-white border-black border rounded p-3 shadow-xl w-64"
          style={fechaFinStyle}
        >
          <label className="text-sm block mb-2">Selecciona fecha de fin:</label>
          <input
            type="date"
            value={fechaFin || ""}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full border px-2 py-1 text-sm rounded"
          />
        </div>
      )}
      {mostrarPrecioMin && (
        <div
          className="fixed z-[2000] bg-white border-black border rounded p-3 shadow-xl w-64"
          style={precioMinStyle}
        >
          <label className="text-sm block mb-2">Precio mínimo (BOB):</label>
          <input
            type="number"
            value={precioMin !== null ? precioMin : ""}
            onChange={(e) => setPrecioMin(Number(e.target.value))}
            className="w-full border px-2 py-1 text-sm rounded"
            min={0}
          />
        </div>
      )}

      {mostrarPrecioMax && (
        <div
          className="fixed z-[2000] bg-white border-black border rounded p-3 shadow-xl w-64"
          style={precioMaxStyle}
        >
          <label className="text-sm block mb-2">Precio máximo (BOB):</label>
          <input
            type="number"
            value={precioMax !== null ? precioMax : ""}
            onChange={(e) => setPrecioMax(Number(e.target.value))}
            className="w-full border px-2 py-1 text-sm rounded"
            min={0}
          />
        </div>
      )}

      <div className="md:w-2/3 w-full h-1/2 md:h-full relative flex flex-col">
        <div className="z-[1000] bg-white py-4 relative">
          <div
            ref={scrollRef}
            className="overflow-x-auto whitespace-nowrap scrollbar-hide px-1 cursor-grab"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="inline-flex gap-2 min-w-max items-start">
              <button
                type="button"
                onClick={handleUbicacion}
                className={`transition rounded-full px-4 py-2 border shadow font-medium text-sm flex items-center gap-1 ${
                  mostrarSelector ? "bg-gray-100" : "bg-white"
                }`}
              >
                {textoUbicacion} ▼
              </button>
              <button
                type="button"
                onClick={handleAeropuerto}
                className="transition rounded-full px-4 py-2 border shadow font-medium text-sm"
              >
                {nombreAeropuerto} ▼
              </button>
              <button
                type="button"
                onClick={handleDistancia}
                className={`transition rounded-full px-4 py-2 border shadow font-medium text-sm flex items-center gap-1 ${
                  mostrarDistanciaSlider ? "bg-gray-100" : "bg-white"
                }`}
              >
                Distancia: {selectedDistance} km ▼
              </button>
              <button
                type="button"
                onClick={handleFechaInicio}
                className={`transition rounded-full px-4 py-2 border shadow font-medium text-sm ${
                  mostrarFechaInicio ? "bg-gray-100" : "bg-white"
                }`}
              >
                {fechaInicio ? `Inicio: ${fechaInicio}` : "FECHA INICIO"} ▼
              </button>

              <button
                type="button"
                onClick={handleFechaFin}
                className={`transition rounded-full px-4 py-2 border shadow font-medium text-sm ${
                  mostrarFechaFin ? "bg-gray-100" : "bg-white"
                }`}
              >
                {fechaFin ? `Fin: ${fechaFin}` : "FECHA FIN"} ▼
              </button>
              <button
                type="button"
                onClick={handlePrecioMin}
                className={`transition rounded-full px-4 py-2 border shadow font-medium text-sm ${
                  mostrarPrecioMin ? "bg-gray-100" : "bg-white"
                }`}
              >
                {precioMin !== null ? `Mín: BOB ${precioMin}` : "PRECIO MINIMO"}{" "}
                ▼
              </button>

              <button
                type="button"
                onClick={handlePrecioMax}
                className={`transition rounded-full px-4 py-2 border shadow font-medium text-sm ${
                  mostrarPrecioMax ? "bg-gray-100" : "bg-white"
                }`}
              >
                {precioMax !== null ? `Máx: BOB ${precioMax}` : "PRECIO MAXIMO"}{" "}
                ▼
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 relative z-0">
          <MapContainer
            center={[lat, lng]}
            zoom={13}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeMapCenter lat={lat} lng={lng} />
            <Marker
              position={[lat, lng]}
              icon={L.icon({
                iconUrl:
                  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl:
                  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                shadowSize: [41, 41],
              })}
            />
            <Circle
              center={[lat, lng]}
              radius={selectedDistance * 1000}
              pathOptions={{
                fillColor: "rgba(0, 162, 255, 0.3)",
                color: "#00A2FF",
              }}
            />
          </MapContainer>
        </div>
      </div>

      <div className="md:w-1/3 w-full h-1/2 md:h-full bg-white md:border-l p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-2 flex items-center">
              <div className="bg-[#FCA311] rounded-full h-8 w-8 flex items-center justify-center">
                <FiSearch className="h-5 w-5 text-white" />
              </div>
            </div>
            <input
              type="text"
              defaultValue="Toyota"
              className="block w-full pl-10 pr-10 py-2 border border-black rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCA311] focus:border-transparent text-gray-700"
            />
            <button className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-black">
              <IoClose className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h2 className="font-bold text-lg mb-3">Resultados</h2>
          <div className="space-y-4">
            {Array.from({ length: 20 }).map((_, idx) => (
              <div key={idx} className="flex gap-3 border-b pb-3 items-start">
                <img
                  src={`https://source.unsplash.com/80x80/?car&sig=${idx}`}
                  alt="imagen"
                  className="rounded-md w-20 h-20 object-cover"
                />
                <div>
                  <p className="font-semibold text-sm">
                    Toyota - Raptor{" "}
                    <span className="bg-yellow-100 px-2 py-0.5 rounded">
                      BOB. 600 por día
                    </span>
                  </p>
                  <p className="text-xs text-gray-600">Detalles</p>
                  <p className="text-xs text-yellow-500 font-bold flex items-center gap-1">
                    5.0 <span className="text-yellow-400">★★★★★</span>
                  </p>
                  <p className="text-xs text-gray-600">7km - aquí disponible</p>
                  <p className="text-xs text-green-600 font-semibold">
                    Disponible
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
