"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "../../globals.css";

interface ReservaActivaProps {
  id: number | null;
}

export default function ReservaActiva({ id }: ReservaActivaProps) {
  const router = useRouter();
  const [vehiculo, setVehiculo] = useState<any>(null);
  const [estadoTiempo, setEstadoTiempo] = useState<number>(0);
  const [idReserva, setIdReserva] = useState<number | null>(null);
  const [idVehiculo, setIdVehiculo] = useState<number | null>(id);

  useEffect(() => {
    if (idVehiculo) {
      axios
      .get(`https://vercel-back-speed-code.vercel.app/vehiculo/obtenerDetalleVehiculo/${idVehiculo}`)

        .then((response) => {
          if (response.data.success) {
            setVehiculo(response.data.data);
            setIdReserva(response.data.data.reserva.idreserva);
            const fechaFin = new Date(response.data.data.reserva.fecha_fin);
            const tiempoRestante = Math.floor(
              (fechaFin.getTime() - Date.now()) / 1000
            );
            setEstadoTiempo(tiempoRestante > 0 ? tiempoRestante : 0);
          }
        })
        .catch((error) => {
          console.error("Error al obtener detalles del vehículo:", error);
        });
    }
  }, [idVehiculo]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (idReserva) {
        axios
          .get(`https://vercel-back-speed-code.vercel.app/reservas/obtenerTiempoReserva/${idReserva}`)
          .then((response) => {
            if (response.data.success) {
              setEstadoTiempo(response.data.tiempoRestante);
            }
          })
          .catch((error) => {
            console.error("Error al obtener el tiempo restante:", error);
          });
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [idReserva]);

  const formatoTiempo = (segundos: number) => {
    const hrs = Math.floor(segundos / 3600);
    const mins = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const cancelarReserva = async (porTiempo = false) => {
    if (idReserva) {
      try {
        await axios.post(`https://vercel-back-speed-code.vercel.app/reservas/cancelar/${idReserva}`);
        alert("Reserva cancelada correctamente");
        router.push("/reserva-expirada");
      } catch (error) {
        console.error("Error al cancelar:", error);
        alert("Hubo un error al cancelar la reserva. Intenta nuevamente.");
      }
    }
  };

  if (!vehiculo) {
    return <p className="text-center mt-8">Cargando información de la reserva...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg space-y-6 md:max-w-5xl sm:max-w-xl">
      <h2 className="text-3xl font-bold text-gray-800">Detalles de tu Reserva</h2>
      <p className="text-gray-600">Revisa los detalles de la reserva de tu vehículo.</p>

      <div className="flex flex-col md:flex-row bg-gray-100 rounded-lg p-6 gap-6 items-center">
        <div className="w-full md:w-2/3">
          <h3 className="text-2xl font-semibold text-gray-800">{vehiculo.marca} {vehiculo.modelo}</h3>
          <p className="text-gray-500">Placa: {vehiculo.placa}</p>
          <p className="text-gray-600 mt-2">{vehiculo.descripcion}</p>
          <p className="font-semibold text-xl mt-4">Bs {vehiculo.tarifa}</p>
          <p className="text-gray-600 mt-2">Fecha de inicio: {new Date(vehiculo.reserva.fecha_inicio).toLocaleString()}</p>
          <p className="text-gray-600">Fecha de fin: {new Date(vehiculo.reserva.fecha_fin).toLocaleString()}</p>
          <p className="mt-2 text-gray-600">Estado: {vehiculo.reserva.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}</p>
        </div>
        <img
          src={vehiculo.imagen} 
          alt={vehiculo.marca}
          className="w-full md:w-48 h-auto rounded-lg shadow-md object-cover"
        />
      </div>

      <div className="text-center mt-6">
        <p className="font-semibold text-lg">Tiempo Restante</p>
        <p id="countdown" className="text-4xl font-mono text-gray-800">{formatoTiempo(estadoTiempo)}</p>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => router.push(`/pago?id=${idVehiculo}&monto=${vehiculo.tarifa}`)}   
          className="bg-[#FCA311] hover:bg-[#e2910f] text-white px-6 py-3 rounded-xl shadow-lg transition duration-200 transform hover:scale-105"
        >
          Confirmar Pago
        </button>
        <button
          onClick={() => cancelarReserva(false)}
          className="bg-[#FCA311] hover:bg-[#e2910f] text-white px-6 py-3 rounded-xl shadow-lg transition duration-200 transform hover:scale-105"
        >
          Cancelar Reserva
        </button>
      </div>
    </div>
  );
}