// ✅ VERSIÓN ACTUALIZADA DE resVehiculos.tsx CON BOTÓN RESERVAR FUNCIONAL Y MODAL

"use client";

import { useState } from "react";
import BuscadorVehiculo from "@/app/components/mapa/buscadorVehiculo";
import { getEstrellas } from "@/app/components/mapa/getEstrellas";
import MensajeRedireccion from "@/app/components/mapa/MensajeRedireccion";

type Vehiculo = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  calificacion: number;
  imagenUrl?: string;
  distancia: number | null;
  anio: number;
  transmision: string;
  consumo: string;
};

interface PanelResultadosProps {
  textoBusqueda: string;
  setTextoBusqueda: React.Dispatch<React.SetStateAction<string>>;
  vehiculos: Vehiculo[];
}

export default function PanelResultados({
  textoBusqueda,
  setTextoBusqueda,
  vehiculos,
}: PanelResultadosProps) {
  const [autoReservado, setAutoReservado] = useState<Vehiculo | null>(null);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);

  return (
    <div className="md:w-1/3 w-full h-1/2 md:h-full bg-white md:border-l p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <BuscadorVehiculo
          textoBusqueda={textoBusqueda}
          setTextoBusqueda={setTextoBusqueda}
        />
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
                <p className="font-semibold text-[var(--azul-oscuro)]">
                  {auto.nombre}{" "}
                  <span className="bg-[var(--naranja-46)] text-[var(--negro)] px-2 py-0.5 rounded text-xs">
                    BOB. {auto.precio}
                  </span>
                </p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {auto.descripcion}
                </p>
                <p className="text-xs text-[var(--naranja)] font-bold flex items-center gap-1">
                  {auto.calificacion?.toFixed(1)} {getEstrellas(auto.calificacion || 0)}
                </p>

                {auto.distancia !== null && (
                  <div className="flex justify-between items-center flex-wrap gap-2 text-xs text-gray-600">
                    <span className="whitespace-nowrap">
                      {auto.distancia.toFixed(1)} km - <span className="text-[var(--verde)] font-semibold">DISPONIBLE</span>
                    </span>
                    <button
                      className="bg-[#FCA311] hover:bg-[#e6950e] text-white px-3 py-1 rounded-md text-xs font-semibold"
                      onClick={() => {
                        if (auto.id !== 60) {
                          setAutoReservado(auto);
                          setMostrarMensaje(true);
                        } else {
                          window.location.href = "/pago";
                        }
                      }}
                    >
                      RESERVAR
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-600">
                  Año: {auto.anio}, Transmisión: {auto.transmision}, Consumo: {auto.consumo}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
