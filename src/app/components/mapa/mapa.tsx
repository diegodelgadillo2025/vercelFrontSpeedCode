"use client";
//filtros version 2
import { useRef, useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

import { FaStar, FaStarHalfAlt, FaRegStar, FaCarSide } from "react-icons/fa";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  Circle,
  Tooltip,
  Popup,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

function ChangeMapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng]);
  return null;
}

function ClickOutsideMapHandler({
  onClickOutside,
}: {
  onClickOutside: () => void;
}) {
  useMapEvents({
    click: () => {
      onClickOutside();
    },
  });
  return null;
}

function getEstrellas(calificacion: number) {
  const estrellas = [];
  for (let i = 1; i <= 5; i++) {
    if (calificacion >= i) {
      estrellas.push(<FaStar key={i} />);
    } else if (calificacion >= i - 0.5) {
      estrellas.push(<FaStarHalfAlt key={i} />);
    } else {
      estrellas.push(<FaRegStar key={i} />);
    }
  }
  return estrellas;
}

export default function MapaConFiltrosEstaticos() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [mostrarAeropuerto, setMostrarAeropuerto] = useState(false);
  const [mostrarDistanciaSlider, setMostrarDistanciaSlider] = useState(false);
  const [lat, setLat] = useState(-17.7833);
  const [lng, setLng] = useState(-63.1833);
  const [selectedDistance, setSelectedDistance] = useState(5);
  const [estadoUbicacion, setEstadoUbicacion] = useState<
    "nulo" | "actual" | "personalizada" | "aeropuerto"
  >("nulo");
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0 });
  const [aeropuertoStyle, setAeropuertoStyle] = useState({ top: 0, left: 0 });
  const [distanciaStyle, setDistanciaStyle] = useState({ top: 0, left: 0 });
  const [nombreAeropuerto, setNombreAeropuerto] = useState("Aeropuerto");
  /*Agregado para back filtrar aeropuerto */
  const [busquedaAeropuerto, setBusquedaAeropuerto] = useState("");
  const [resultadosAeropuerto, setResultadosAeropuerto] = useState<
    { idUbicacion: number; nombre: string; latitud: number; longitud: number }[]
  >([]);
  const [aeropuertoSeleccionado, setAeropuertoSeleccionado] = useState<{
    nombre: string;
    latitud: number;
    longitud: number;
  } | null>(null);
  /*hasta aqui de filtrar aeropuerto*/
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

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  /*para recuperar los vehiculos*/
  useEffect(() => {
    obtenerVehiculos();
  }, [
    textoBusqueda,
    fechaInicio,
    fechaFin,
    precioMin,
    precioMax,
    lat,
    lng,
    selectedDistance,
  ]);

  const obtenerVehiculos = async () => {
    try {
      const params = new URLSearchParams();
      if (textoBusqueda.trim()) params.append("texto", textoBusqueda.trim());
      if (fechaInicio) params.append("fechaInicio", fechaInicio);
      if (fechaFin) params.append("fechaFin", fechaFin);
      if (precioMin !== null) params.append("precioMin", precioMin.toString());
      if (precioMax !== null) params.append("precioMax", precioMax.toString());
      if (lat && lng && selectedDistance) {
        params.append("lat", lat.toString());
        params.append("lng", lng.toString());
        params.append("dkm", selectedDistance.toString());
      }

      const response = await fetch(
        `https://vercel-back-speed-code.vercel.app/api/filtroMapaPrecio?${params.toString()}`
      );
      const data = await response.json();
      setVehiculos(
        Array.isArray(data.vehiculos?.vehiculos) ? data.vehiculos.vehiculos : []
      );

      console.log("Datos recibidos del backend:", data);
    } catch (err) {
      console.error("Error al obtener vehículos:", err);
    }
  };

  /*para recuperar el filtrar aeropuerto*/
  useEffect(() => {
    if (busquedaAeropuerto.trim() === "") {
      setResultadosAeropuerto([]);
      return;
    }

    const fetchResultados = async () => {
      try {
        const res = await fetch(
          `https://vercel-back-speed-code.vercel.app/api/autocompletar/aeropuerto?q=${busquedaAeropuerto}`
        );
        const data = await res.json();
        setResultadosAeropuerto(data);
      } catch (err) {
        console.error("Error al buscar aeropuerto:", err);
      }
    };

    const timeout = setTimeout(fetchResultados, 100); // debounce
    return () => clearTimeout(timeout);
  }, [busquedaAeropuerto]);

  /*hasta aqui es para recuperar el filtrar aeropuerto */
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const ignorarSelectors = [
        "button",
        "input",
        "form",
        "label",
        ".leaflet-container",
        ".leaflet-popup",
        ".leaflet-marker-icon",
        ".leaflet-control",
        ".leaflet-pane",
        ".leaflet-interactive",
        ".leaflet-control-zoom",
        ".fixed.z-[2000]",
      ];
      const clickEnElementoValido = ignorarSelectors.some((selector) =>
        [...document.querySelectorAll(selector)].some((el) =>
          el.contains(target)
        )
      );
      if (!clickEnElementoValido) {
        cerrarTodosLosPaneles();
        setResultadosAeropuerto([]);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // ✅ Solo se debe mostrar un panel a la vez
  const cerrarTodosLosPaneles = () => {
    setMostrarSelector(false);
    setMostrarAeropuerto(false);
    setMostrarDistanciaSlider(false);
    setMostrarFechaInicio(false);
    setMostrarFechaFin(false);
    setMostrarPrecioMin(false);
    setMostrarPrecioMax(false);
  };

  const handleUbicacion = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    cerrarTodosLosPaneles();
    setMostrarSelector(true);
  };
  const handleAeropuerto = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAeropuertoStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    cerrarTodosLosPaneles();
    setMostrarAeropuerto(true);
  };
  const handleDistancia = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDistanciaStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    cerrarTodosLosPaneles();
    setMostrarDistanciaSlider(true);
  };
  const handleFechaInicio = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFechaInicioStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    cerrarTodosLosPaneles();
    setMostrarFechaInicio(true);
  };
  const handleFechaFin = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFechaFinStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    cerrarTodosLosPaneles();
    setMostrarFechaFin(true);
  };
  const handlePrecioMin = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPrecioMinStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    cerrarTodosLosPaneles();
    setMostrarPrecioMin(true);
  };
  const handlePrecioMax = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPrecioMaxStyle({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    cerrarTodosLosPaneles();
    setMostrarPrecioMax(true);
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
          className="fixed z-[2000] bg-[var(--blanco)] border border-[var(--negro)] rounded-lg p-4 shadow-xl w-64"
          style={dropdownStyle}
        >
          {/* 🔗 Enlace personalizado */}
          <form onSubmit={manejarEnlaceGoogleMaps} className="space-y-2">
            <input
              name="mapUrl"
              type="text"
              placeholder="Pegar link de Google Maps"
              className="w-full border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--naranja)]"
            />
            <button
              type="submit"
              className="w-full bg-[var(--naranja)] hover:bg-[var(--naranjaOscuro)] text-white rounded-md px-3 py-1.5 text-sm font-semibold transition-colors"
            >
              Usar ubicación personalizada
            </button>
          </form>

          {/* 📍 Ubicación actual */}
          <button
            onClick={usarUbicacionActual}
            disabled={cargandoUbicacion}
            className={`mt-2 w-full ${
              cargandoUbicacion
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[var(--azul-oscuro)] hover:bg-[#0e234c]"
            } text-white rounded-md px-3 py-1.5 text-sm font-semibold transition-colors`}
          >
            {cargandoUbicacion
              ? "Obteniendo ubicación..."
              : "Usar mi ubicación actual"}
          </button>
        </div>
      )}

      {mostrarAeropuerto && (
        <div
          className="fixed z-[2000] bg-[var(--blanco)] border border-[var(--negro)] rounded-lg p-4 shadow-xl w-64"
          style={aeropuertoStyle}
        >
          {/* 🔍 Campo de búsqueda */}
          <label className="block text-sm mb-1 text-[var(--foreground)] font-medium">
            Buscar aeropuerto:
          </label>
          <input
            type="text"
            value={busquedaAeropuerto}
            onChange={(e) => {
              setBusquedaAeropuerto(e.target.value);
              setAeropuertoSeleccionado(null); // limpiar selección previa
            }}
            placeholder="Ej: Wilstermann"
            className="w-full border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--naranja)]"
          />

          {/* 📋 Lista de resultados */}
          {resultadosAeropuerto.length > 0 && (
            <ul className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto scrollbar-hide">
              {resultadosAeropuerto.map((a) => (
                <li
                  key={a.idUbicacion}
                  onClick={() => {
                    setAeropuertoSeleccionado({
                      nombre: a.nombre,
                      latitud: a.latitud,
                      longitud: a.longitud,
                    });
                    setBusquedaAeropuerto(a.nombre);
                    setResultadosAeropuerto([]);
                  }}
                  className="cursor-pointer px-3 py-2 text-sm hover:bg-[var(--naranja-46)] transition-colors"
                >
                  {a.nombre}
                </li>
              ))}
            </ul>
          )}

          {/* ✅ Botón aplicar */}
          <button
            onClick={() => {
              if (!aeropuertoSeleccionado)
                return alert("Selecciona un aeropuerto");
              setLat(aeropuertoSeleccionado.latitud);
              setLng(aeropuertoSeleccionado.longitud);
              setEstadoUbicacion("aeropuerto");
              setNombreAeropuerto(aeropuertoSeleccionado.nombre);
              setMostrarAeropuerto(false);
              setBusquedaAeropuerto("");
              setResultadosAeropuerto([]);
            }}
            disabled={!aeropuertoSeleccionado}
            className={`mt-3 w-full ${
              aeropuertoSeleccionado
                ? "bg-[var(--azul-oscuro)] hover:bg-[#0e234c]"
                : "bg-gray-400 cursor-not-allowed"
            } text-white rounded-md px-3 py-1.5 text-sm font-semibold transition-colors`}
          >
            Aplicar
          </button>
        </div>
      )}

      {mostrarDistanciaSlider && (
        <div
          className="fixed z-[2000] bg-[var(--blanco)] border border-[var(--negro)] rounded-lg p-4 shadow-xl w-64"
          style={distanciaStyle}
        >
          {/* 🎯 Etiqueta del slider */}
          <label className="block text-sm text-[var(--foreground)] mb-2 font-medium">
            Seleccionar distancia (km):
          </label>

          {/* 📏 Slider */}
          <input
            type="range"
            min="1"
            max="50"
            value={selectedDistance}
            onChange={(e) => setSelectedDistance(Number(e.target.value))}
            className="w-full accent-[var(--naranja)] cursor-pointer"
          />

          {/* 📍 Distancia seleccionada */}
          <div className="text-center text-sm mt-3 font-semibold text-[var(--foreground)]">
            {selectedDistance} km
          </div>
        </div>
      )}

      {mostrarFechaInicio && (
        <div
          className="fixed z-[2000] bg-[var(--blanco)] border border-[var(--negro)] rounded-lg p-4 shadow-xl w-64"
          style={fechaInicioStyle}
        >
          <label className="block text-sm mb-2 text-[var(--foreground)] font-medium">
            Selecciona fecha de inicio:
          </label>
          <input
            type="date"
            value={fechaInicio || ""}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full border border-gray-300 px-2 py-1.5 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--naranja)]"
          />
        </div>
      )}

      {mostrarFechaFin && (
        <div
          className="fixed z-[2000] bg-[var(--blanco)] border border-[var(--negro)] rounded-lg p-4 shadow-xl w-64"
          style={fechaFinStyle}
        >
          <label className="block text-sm mb-2 text-[var(--foreground)] font-medium">
            Selecciona fecha de fin:
          </label>
          <input
            type="date"
            value={fechaFin || ""}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full border border-gray-300 px-2 py-1.5 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--naranja)]"
          />
        </div>
      )}

      {mostrarPrecioMin && (
        <div
          className="fixed z-[2000] bg-[var(--blanco)] border border-[var(--negro)] rounded-lg p-4 shadow-xl w-64"
          style={precioMinStyle}
        >
          <label className="block text-sm mb-2 text-[var(--foreground)] font-medium">
            Precio mínimo (BOB):
          </label>
          <input
            type="number"
            value={precioMin !== null ? precioMin : ""}
            onChange={(e) => setPrecioMin(Number(e.target.value))}
            className="w-full border border-gray-300 px-2 py-1.5 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--naranja)]"
            min={0}
          />
        </div>
      )}

      {mostrarPrecioMax && (
        <div
          className="fixed z-[2000] bg-[var(--blanco)] border border-[var(--negro)] rounded-lg p-4 shadow-xl w-64"
          style={precioMaxStyle}
        >
          <label className="block text-sm mb-2 text-[var(--foreground)] font-medium">
            Precio máximo (BOB):
          </label>
          <input
            type="number"
            value={precioMax !== null ? precioMax : ""}
            onChange={(e) => setPrecioMax(Number(e.target.value))}
            className="w-full border border-gray-300 px-2 py-1.5 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--naranja)]"
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
            <ClickOutsideMapHandler
              onClickOutside={() => {
                cerrarTodosLosPaneles();
                setResultadosAeropuerto([]);
              }}
            />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ChangeMapCenter lat={lat} lng={lng} />

            {/* 📍 Marcador del usuario (arrastrable) */}
            <Marker
              position={[lat, lng]}
              draggable={true}
              zIndexOffset={1000000000000}
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

            {/* 📍 Marcadores dinámicos de vehículos */}
            {vehiculos.map((auto) => (
              <Marker
                key={auto.id}
                position={[auto.latitud, auto.longitud]}
                icon={L.icon({
                  iconUrl:
                    "https://cdn3.iconfinder.com/data/icons/red-car-types-colored-pack/256/red-liftback-car-16701-512.png",
                  iconSize: [30, 30],
                  iconAnchor: [15, 30],
                })}
              >
                <Tooltip direction="top" offset={[0, -25]} permanent>
                  <span className="text-xs font-semibold">
                    Bs. {auto.precio}
                  </span>
                </Tooltip>
                <Popup>
                  <div className="w-[160px] sm:w-[220px] md:w-[260px] max-w-[90vw] relative">
                    <div className="relative w-full h-[75px] sm:h-[82px]">
                      <img
                        src={auto.imagenUrl || "/no-image.jpg"}
                        alt={auto.nombre}
                        className="w-full h-full object-cover rounded-md mb-[2px]"
                      />
                      <div className="absolute top-1 left-1 bg-white/80 px-1 rounded text-yellow-500 text-[10px] sm:text-sm flex gap-0.5">
                        {getEstrellas(auto.calificacion || 0)}
                      </div>
                    </div>

                    <div className="text-gray-800 text-[9px] sm:text-sm font-semibold leading-tight m-0 p-0">
                      {auto.nombre}
                    </div>

                    <div className="text-gray-600 text-[8px] sm:text-xs leading-tight m-0 p-0">
                      {auto.descripcion}
                    </div>

                    <div className="flex justify-between items-center text-[8px] sm:text-xs mt-[2px] leading-tight m-0 p-0">
                      <span className="text-orange-600 font-bold text-[9px] sm:text-sm">
                        Bs. {auto.precio}/día
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

            {/* 🔵 Círculo de radio */}
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
            {/* Input principal */}
            <input
              type="text"
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-black rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCA311] focus:border-transparent text-gray-700"
            />

            {/* Botón de cerrar (derecha) */}
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-black"
            >
              <IoClose className="h-5 w-5" />
            </button>

            {/* Botón de buscar (izquierda) */}
            <div className="absolute inset-y-0 left-2 flex items-center">
              <button
                type="button"
                onClick={() => {
                  console.log("Buscando...");
                }}
                className="bg-[#FCA311] hover:bg-[#e6950e] transition-colors rounded-full h-8 w-8 flex items-center justify-center focus:outline-none"
              >
                <FiSearch className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h2 className="font-bold text-lg mb-3">Resultados</h2>
          <div className="space-y-4">
            {vehiculos.map((auto) => (
              <div
                key={auto.id}
                className="flex gap-3 border-b border-gray-200 pb-3 items-start hover:bg-gray-50 transition-colors rounded-md p-2"
              >
                <div className="min-w-[80px] max-w-[80px] h-[80px] flex-shrink-0">
                  <img
                    src={
                      auto.imagenUrl ||
                      "https://previews.123rf.com/images/nastudio/nastudio2007/nastudio200700383/152011677-silhouette-car-icon-for-logo-vehicle-view-from-side-vector-illustration.jpg"
                    }
                    alt="imagen"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col gap-1 text-[13px] flex-1">
                  <p className="font-semibold text-gray-800">
                    {auto.nombre}{" "}
                    <span className="bg-[var(--naranja-46)] text-[var(--negro)] px-2 py-0.5 rounded text-xs">
                      BOB. {auto.precio}
                    </span>
                  </p>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {auto.descripcion}
                  </p>

                  <p className="text-xs text-[var(--naranja)] font-bold flex items-center gap-1">
                    {auto.calificacion?.toFixed(1)}{" "}
                    {getEstrellas(auto.calificacion || 0)}
                  </p>

                  {auto.distancia !== null && (
                    <p className="text-xs text-gray-600">
                      {auto.distancia.toFixed(1)} km -{" "}
                      <span className="text-[var(--verde)] font-semibold">
                        DISPONIBLE
                      </span>
                    </p>
                  )}

                  <p className="text-xs text-gray-600">
                    Año: {auto.anio}, Transmisión: {auto.transmision}, Consumo:{" "}
                    {auto.consumo}
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
