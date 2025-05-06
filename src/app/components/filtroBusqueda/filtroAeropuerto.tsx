import React, { useState } from 'react';
import ModalFiltroAeropuerto from "@/app/components/filtroBusqueda/modalFiltroAeropuerto";

interface Aeropuerto {
  id: number;
  nombre: string;
}

const FiltroAeropuerto: React.FC = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aeropuertoSeleccionado, setAeropuertoSeleccionado] = useState<Aeropuerto | null>(null);
  const [vehiculos, setVehiculos] = useState<any[]>([]); // Mejora esto si tienes modelo de vehículo

  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = () => setModalAbierto(false);

  const manejarAplicar = async (aeropuerto: Aeropuerto) => {
    setAeropuertoSeleccionado(aeropuerto);
    setModalAbierto(false);

    try {
      const response = await fetch('http://localhost:3000/aeropuerto/vehiculos-cercanos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idaeropuerto: aeropuerto.id }),
      });

      if (!response.ok) throw new Error('Error al obtener vehículos');

      const data = await response.json();
      console.log('Vehículos cercanos:', data);
      setVehiculos(data);
    } catch (error) {
      console.error('Error al hacer fetch de vehículos:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Botón para abrir el modal */}
      <div>
        <button
          onClick={abrirModal}
          className="px-4 py-2 rounded border border-gray-300 hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
        >
          {aeropuertoSeleccionado ? aeropuertoSeleccionado.nombre : 'Aeropuerto'}
        </button>
      </div>

      {/* Modal de selección */}
      <ModalFiltroAeropuerto
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onAplicar={manejarAplicar}
        aeropuertoSeleccionado={aeropuertoSeleccionado}
      />

      {/* Sección de resultados de vehículos */}
      {vehiculos.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Vehículos cercanos:</h3>
          <div className="space-y-4">
            {vehiculos.map((vehiculo, index) => (
              <div key={index} className="flex items-center border p-4 rounded shadow-sm space-x-4">
                <img
                  src={vehiculo.imagen}
                  alt="Vehículo"
                  className="w-32 h-20 object-cover rounded-md"
                />
                <div>
                  <p><strong>Precio:</strong> {vehiculo.precio}</p>
                  <p><strong>Distancia:</strong> {vehiculo.distancia} km</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltroAeropuerto;
