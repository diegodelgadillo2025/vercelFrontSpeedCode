"use client";

import React, { useState, useRef, useEffect } from 'react';
import ModalFiltroAeropuerto from "@/app/components/filtroBusqueda/modalFiltroAeropuerto";

interface Aeropuerto {
  id: number;
  nombre: string;
}

const FiltroAeropuerto: React.FC = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aeropuertoSeleccionado, setAeropuertoSeleccionado] = useState<Aeropuerto | null>(null);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [mensajeSinVehiculos, setMensajeSinVehiculos] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = () => setModalAbierto(false);

  const manejarAplicar = async (aeropuerto: Aeropuerto) => {
    setAeropuertoSeleccionado(aeropuerto);
    console.log('Aeropuerto seleccionado:', aeropuerto); // Verifica que el aeropuerto tiene el id correcto
    setModalAbierto(false);
    setMensajeSinVehiculos(false);

    console.log('Haciendo fetch con el id del aeropuerto:', aeropuerto.idaeropuerto);

    try {
      //const response = await fetch(`https://vercel-back-speed-code.vercel.app/aeropuerto/vehiculos-cercanos/${aeropuerto.id}`, {
        const response = await fetch(`http://vercel-back-speed-code.vercel.app/aeropuerto/vehiculos-cercanos/${aeropuerto.idaeropuerto}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Error al obtener vehículos');

      const data = await response.json();

      console.log('Datos de vehículos:', data); // Verifica los vehículos que se obtienen de la API

      setVehiculos(data);
      setMostrarResultados(true);
      setMensajeSinVehiculos(data.length === 0);
    } catch (error) {
      console.error('Error al hacer fetch de vehículos:', error);
      setVehiculos([]);
      setMostrarResultados(true);
      setMensajeSinVehiculos(true);
    }
  };

  // Cierra resultados si se hace clic fuera
  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
        setMostrarResultados(false);
      }
    };

    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  return (
    <div className="relative inline-block" ref={contenedorRef}>
      <button
        onClick={abrirModal}
        className="px-4 py-2 rounded border border-gray-300 hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
      >
        {aeropuertoSeleccionado ? aeropuertoSeleccionado.nombre : 'Aeropuerto'}
      </button>

      <ModalFiltroAeropuerto
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onAplicar={manejarAplicar}
        aeropuertoSeleccionado={aeropuertoSeleccionado}
      />

      {mostrarResultados && (
        <div className="absolute z-50 mt-2 left-0 w-[360px] max-w-[90vw] bg-white p-4 rounded-xl shadow-xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Vehículos cercanos</h3>
            <button
              onClick={() => setMostrarResultados(false)}
              className="text-sm text-gray-500 hover:text-red-600 font-semibold"
            >
              ✕ Cerrar
            </button>
          </div>

          {mensajeSinVehiculos ? (
            <p className="text-gray-600 text-sm">No se encontraron vehículos cercanos a este aeropuerto.</p>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {vehiculos.map((vehiculo, index) => (
                <div key={index} className="flex items-center border p-3 rounded shadow-sm space-x-4">
                  <img
                    src={vehiculo.imagen}
                    alt="Vehículo"
                    className="w-24 h-16 object-cover rounded-md"
                  />
                  <div className="text-sm">
                    <p><strong>Precio:</strong> {vehiculo.precio}</p>
                    <p><strong>Distancia:</strong> {vehiculo.distancia} km</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FiltroAeropuerto;
