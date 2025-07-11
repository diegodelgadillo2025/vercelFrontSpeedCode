"use client";

import React, { useState, useEffect } from 'react';
import { FaPlane } from "react-icons/fa";

interface Aeropuerto {
  idaeropuerto: number;
  nombre: string;
  codigo: string;
  latitud: number;
  longitud: number;
}

interface FiltroAeropuertoProps {
  onUbicacionSeleccionada: (lat: number, lng: number) => void;
}

const FiltroAeropuerto: React.FC<FiltroAeropuertoProps> = ({ onUbicacionSeleccionada }) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aeropuertoSeleccionado, setAeropuertoSeleccionado] = useState<Aeropuerto | null>(null);
  const [sugerencias, setSugerencias] = useState<Aeropuerto[]>([]);
  const [inputTexto, setInputTexto] = useState("");
  const [aeropuertoTemporal, setAeropuertoTemporal] = useState<Aeropuerto | null>(null);
  const [error, setError] = useState("");

  const abrirModal = () => {
    setModalAbierto(true);
    setInputTexto(aeropuertoSeleccionado?.nombre || "");
    setSugerencias([]);
    setError("");
  };

  const cerrarModal = () => setModalAbierto(false);

  const manejarAplicar = () => {
    if (!aeropuertoTemporal) {
      setError("Debes seleccionar un aeropuerto");
      return;
    }
    setAeropuertoSeleccionado(aeropuertoTemporal);
    setModalAbierto(false);
    onUbicacionSeleccionada(aeropuertoTemporal.latitud, aeropuertoTemporal.longitud);
  };

  useEffect(() => {
    const fetchAeropuertos = async () => {
      if (inputTexto.trim() === "") {
        setSugerencias([]);
        return;
      }

      try {
        const response = await fetch(`https://vercel-back-speed-code.vercel.app/aeropuerto/autocompletar?q=${encodeURIComponent(inputTexto)}`);
        if (!response.ok) throw new Error('Error al obtener aeropuertos');
        const data: Aeropuerto[] = await response.json();
        setSugerencias(data);
      } catch (err) {
        console.error(err);
        setSugerencias([]);
        setError("La búsqueda debe estar relacionada con aeropuertos. Por favor, intente nuevamente.");
      }
    };

    const delay = setTimeout(fetchAeropuertos, 300);
    return () => clearTimeout(delay);
  }, [inputTexto]);

  return (
    <div className="relative inline-block">
      <button
        onClick={abrirModal}
        className="flex items-center space-x-2 px-4 py-2 rounded border border-gray-300 hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
      >
        <FaPlane className="text-orange-500" />
        <span>{aeropuertoSeleccionado ? aeropuertoSeleccionado.nombre : 'Aeropuerto'}</span>
      </button>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Seleccionar Aeropuerto</h2>

            <input
              type="text"
              value={inputTexto}
              onChange={(e) => {
                setInputTexto(e.target.value);
                setError('');
              }}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-2"
              placeholder="Buscar aeropuerto"
            />

            {sugerencias.length > 0 && (
              <ul className="max-h-40 overflow-y-auto border border-gray-200 rounded bg-white shadow-sm">
                {sugerencias.map((aeropuerto) => (
                  <li
                    key={aeropuerto.idaeropuerto}
                    className="flex items-center space-x-3 px-4 py-2 cursor-pointer hover:bg-orange-500 hover:text-white"
                    onClick={() => {
                      setAeropuertoTemporal(aeropuerto);
                      setInputTexto(aeropuerto.nombre);
                      setSugerencias([]);
                    }}
                  >
                    <FaPlane className="text-orange-500" />
                    <span>{aeropuerto.nombre}</span>
                  </li>
                ))}
              </ul>
            )}

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="flex justify-end mt-4 space-x-2">
              <button onClick={cerrarModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancelar
              </button>
              <button onClick={manejarAplicar} className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltroAeropuerto;

