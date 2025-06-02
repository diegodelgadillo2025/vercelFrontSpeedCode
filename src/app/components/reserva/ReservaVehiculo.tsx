// ReservaVehiculo.tsx - tiempo restante encima del precio
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { HiOutlineCalendar } from "react-icons/hi";
import { FaUsers, FaCog, FaGasPump, FaShieldAlt, FaStar } from "react-icons/fa";

interface ReservaVehiculoProps {
  id: number | null;
}

export default function ReservaVehiculo({ id }: ReservaVehiculoProps) {
  const router = useRouter();
  const [vehiculo, setVehiculo] = useState<any>(null);
  const [estadoTiempo, setEstadoTiempo] = useState<number>(0);
  const [idReserva, setIdReserva] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      axios
        .get(`https://vercel-back-speed-code.vercel.app/vehiculo/obtenerDetalleVehiculo/${id}`)
        .then((response) => {
          if (response.data.success) {
            setVehiculo(response.data.data);
            setIdReserva(response.data.data.reserva.idreserva);
            const fechaFin = new Date(response.data.data.reserva.fecha_fin);
            const tiempoRestante = Math.floor((fechaFin.getTime() - Date.now()) / 1000);
            setEstadoTiempo(tiempoRestante > 0 ? tiempoRestante : 0);
          }
        })
        .catch((error) => {
          console.error("Error al obtener detalles del vehículo:", error);
        });
    }
  }, [id]);

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
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const cancelarReserva = async () => {
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
    return <p className="text-center mt-8">Cargando información del vehículo...</p>;
  }

  const fechaInicio = new Date(vehiculo.reserva.fecha_inicio);
  const fechaFin = new Date(vehiculo.reserva.fecha_fin);
  const tiempoMs = fechaFin.getTime() - fechaInicio.getTime();
  const dias = Math.ceil(tiempoMs / (1000 * 60 * 60 * 24));
  const precioTotal = vehiculo.tarifa * dias;
  const garantia = vehiculo.garantia || 0;
  const total = precioTotal + garantia;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 md:px-8 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          {vehiculo.marca} {vehiculo.modelo}
        </h1>

        <div className="flex gap-2 mb-4">
          <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">{vehiculo.tipo || "Tipo no definido"}</span>
          <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">{vehiculo.anio || "Año no definido"}</span>
        </div>

        <div className="w-full h-64 bg-gray-200 rounded-lg mb-4 overflow-hidden">
          <img src={vehiculo.imagen} alt="imagen" className="w-full h-full object-cover" />
        </div>

        <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
          <img
            src={vehiculo.imagen}
            alt="Avatar vehículo"
            className="w-12 h-12 rounded-full object-cover mr-4 border"
          />
          <div>
            <p className="font-semibold text-black">
              Auto ofrecido por Sergio Campos Noriega
            </p>
            <div className="flex items-center">
              <FaStar className="text-yellow-400" />
              <span className="ml-1 text-sm font-semibold text-black">
                3 (1 reseña)
              </span>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-blue-900 mb-1">Acerca de este auto</h2>
        <p className="text-gray-600 mb-4">
          Kia Rio 2014 en excelentes condiciones. A/C, radio, USB. Bajo consumo de combustible.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-700 mt-4">
          <div className="flex items-center">
            <FaUsers className="mr-2 text-black" />
            {vehiculo.asientos || "5"} Asientos
          </div>
          <div className="flex items-center">
            <FaCog className="mr-2 text-black" />
            {vehiculo.transmision || "Manual"}
          </div>
          <div className="flex items-center">
            <FaGasPump className="mr-2 text-black" />
            {vehiculo.combustible || "Gasolina"}
          </div>
          <div className="flex items-center">
            <FaShieldAlt className="mr-2 text-black" /> Garantía
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="text-center mb-2">
          <p className="text-xs text-gray-500">Tiempo restante</p>
          <p className="text-lg font-mono text-black">{formatoTiempo(estadoTiempo)}</p>
        </div>

        <div className="flex items-end mb-4">
          <div className="text-2xl font-bold text-blue-900">{vehiculo.tarifa} Bs</div>
          <div className="text-sm text-gray-600 ml-1">/por día</div>
        </div>

        <div className="border border-gray-300 rounded-md p-3 flex items-center mb-4">
          <HiOutlineCalendar className="text-black mr-2" />
          <span className="text-sm">
            {fechaInicio.toLocaleDateString()} - {fechaFin.toLocaleDateString()}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-4 mb-4">
          <h3 className="font-bold mb-2 text-black">Detalles del precio</h3>
          <div className="flex justify-between text-sm mb-1">
            <span>{vehiculo.tarifa} Bs × {dias} días</span>
            <span>{precioTotal} Bs</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Garantía (reembolsable)</span>
            <span>{garantia} Bs</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-gray-200 text-base">
            <span>Total</span>
            <span>{total} Bs</span>
          </div>
        </div>

        <button
          onClick={() => router.push(`/pago?id=${id}&monto=${total}`)}
          className="w-full bg-[#FFA500] hover:bg-[#e69500] text-white py-3 rounded-md font-medium mb-3"
        >
          Pagar el 100% ahora
        </button>

        <button
          onClick={cancelarReserva}
          className="w-full bg-gray-100 hover:bg-gray-200 text-black py-3 rounded-md font-medium border"
        >
          Cancelar Reserva
        </button>
      </div>
    </div>
  );
}
