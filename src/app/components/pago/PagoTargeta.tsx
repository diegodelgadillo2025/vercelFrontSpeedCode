'use client';

import { FC, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

interface PagoTarjetaProps {
  nombreTitular: string;
  numeroTarjeta: string;
  mes: string;
  anio: string;
  cvv: string;
  direccion: string;
  correoElectronico: string;
  setNombreTitular: (value: string) => void;
  setNumeroTarjeta: (value: string) => void;
  setMes: (value: string) => void;
  setAnio: (value: string) => void;
  setCvv: (value: string) => void;
  setDireccion: (value: string) => void;
  setCorreoElectronico: (value: string) => void;
  handleConfirmacion: () => void;
  onCancel: () => void;
}

const PagoTarjeta: FC<PagoTarjetaProps> = ({
  nombreTitular,
  numeroTarjeta,
  mes,
  anio,
  cvv,
  direccion,
  correoElectronico,
  setNombreTitular,
  setNumeroTarjeta,
  setMes,
  setAnio,
  setCvv,
  setDireccion,
  setCorreoElectronico,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [monto, setMonto] = useState<number | null>(null);
  const [idReserva, setIdReserva] = useState<number | null>(null);

  useEffect(() => {
    // Obtén el idReserva y monto de los parámetros de la URL
    const idReserva = searchParams.get("id");
    if (idReserva) {
      const valor = parseInt(idReserva);
      if (!isNaN(valor)) {
        setIdReserva(valor);  // Guarda el idReserva en el estado
      }
    }

    const montoParam = searchParams.get("monto");
    if (montoParam) {
      const valor = parseFloat(montoParam);
      if (!isNaN(valor)) {
        setMonto(valor);
      }
    }
  }, [searchParams]);

  const handleConfirmacion = async () => {
    const fechaExpiracion = `${mes}/${anio}`;
    const concepto = "Pago de reserva con tarjeta";

    // Validación de los campos
    if (
      !nombreTitular ||
      !numeroTarjeta ||
      !cvv ||
      !direccion ||
      !correoElectronico ||
      !mes ||
      !anio
    ) {
      alert("Por favor completa todos los campos.");
      return;
    }

    if (!monto || !idReserva) {
      alert("Monto o idReserva no definido. Verifica la URL.");
      return;
    }

    const datosPago = {
      monto,
      concepto,
      nombreTitular,
      numeroTarjeta,
      fechaExpiracion,
      cvv,
      direccion,
      correoElectronico,
    };

    console.log("Datos a enviar:", { idReserva, datosPago });

    try {
      const response = await axios.post(
        `https://vercel-back-speed-code.vercel.app/pagos/pagarConTarjeta/${idReserva}`,
        datosPago
      );

      if (response.status === 200) {
        alert("¡Pago confirmado con éxito!");
        router.push("/pago");
      } else {
        alert("Error en el pago: " + (response.data?.mensaje || "Error desconocido"));
      }
    } catch (error: any) {
      console.error("Error:", error);
      const msg = error.response?.data?.error || "Hubo un error al realizar el pago.";
      alert("Error: " + msg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-6">
        Pago con Tarjeta
      </h2>

      <div className="space-y-4">
        {/* Nombre del titular */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del titular</label>
          <input
            type="text"
            value={nombreTitular}
            onChange={(e) => {
              let letrasSolo = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
              letrasSolo = letrasSolo
                .toLowerCase()
                .split(' ')
                .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                .join(' ');
              setNombreTitular(letrasSolo);
            }}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej. Juan Pérez"
          />
        </div>

        {/* Número de tarjeta */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Número de tarjeta</label>
          <input
            type="text"
            value={numeroTarjeta}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              value = value.slice(0, 16);
              const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
              setNumeroTarjeta(formatted);
            }}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="1234 5678 9012 3456"
          />
        </div>

        {/* Fecha de expiración y CVV */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Mes</label>
            <input
              type="number"
              value={mes}
              onChange={(e) => {
                let val = e.target.value.slice(0, 2);
                if (parseInt(val) > 12) val = '12';
                if (parseInt(val) < 1) val = '01';
                setMes(val);
              }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-center"
              placeholder="MM"
              min={1}
              max={12}
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Año</label>
            <input
              type="text"
              value={anio}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '').slice(0, 2);
                if (val.length === 2) {
                  const num = parseInt(val);
                  if (num < 25) val = '25';
                  else if (num > 35) val = '35';
                }
                setAnio(val);
              }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-center"
              placeholder="AA"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">CVV</label>
            <input
              type="number"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.slice(0, 3))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-center"
              placeholder="123"
            />
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Dirección</label>
          <input
            type="text"
            value={direccion}
            onChange={(e) =>
              setDireccion(e.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, ''))
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Ej. Calle Oquendo"
          />
        </div>

        {/* Correo electrónico */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
          <input
            type="email"
            value={correoElectronico}
            onChange={(e) => setCorreoElectronico(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Ej. juan.perez@gmail.com"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="mt-6 flex justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="w-1/2 py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition text-sm"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirmacion}
          className="w-1/2 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition text-sm"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};

export default PagoTarjeta;
