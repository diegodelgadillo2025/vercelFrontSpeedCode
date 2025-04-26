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
  onCancel, // 🛠️ Agregado para usarlo correctamente
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [monto, setMonto] = useState<number | null>(null);
  const [idReserva, setIdReserva] = useState<number | null>(null);

  useEffect(() => {
    const idReserva = searchParams.get("id");
    if (idReserva) {
      const valor = parseInt(idReserva);
      if (!isNaN(valor)) {
        setIdReserva(valor);
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
        `https://vercelbackspeedcode.onrender.com/pagos/pagarConTarjeta/${idReserva}`,
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
          <label className="block text-sm font-medium text-gray-700">Nombre del titular(*)</label>
          <input
            type="text"
            value={nombreTitular}
            onChange={(e) => {
              let input = e.target.value;
              input = input.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
              input = input.replace(/\s+/g, ' ');
              if (input.length > 60) return;
              const formateado = input
                .toLowerCase()
                .split(' ')
                .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                .join(' ');
              setNombreTitular(formateado);
            }}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej. Juan Pérez"
          />
          <p className="text-xs text-gray-500 mt-1">Máximo 60 caracteres. Solo letras y espacios.</p>
        </div>

        {/* Número de tarjeta */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Número de tarjeta(*)</label>
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
          {/* Mes */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Mes(*)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{2}"
              maxLength={2}
              value={mes}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '');
                if (val.length === 1 && parseInt(val) > 1) val = '0' + val;
                if (val.length <= 2) setMes(val);
              }}
              onBlur={() => {
                const num = parseInt(mes);
                if (isNaN(num) || num < 1 || num > 12) setMes('');
                else if (mes.length === 1) setMes('0' + mes);
              }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-center"
              placeholder="MM"
            />
          </div>

          {/* Año */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Año(*)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{2}"
              maxLength={2}
              value={anio}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '');
                if (val.length <= 2) setAnio(val);
              }}
              onBlur={() => {
                const currentYear = new Date().getFullYear() % 100;
                const maxYear = currentYear + 10;
                const num = parseInt(anio);
                if (isNaN(num) || num < currentYear || num > maxYear) setAnio('');
              }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-center"
              placeholder="AA"
            />
          </div>

          {/* CVV */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">CVV(*)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{3}"
              maxLength={3}
              value={cvv}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '');
                setCvv(val.slice(0, 3));
              }}
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
            maxLength={80}
            onChange={(e) => {
              const val = e.target.value
                .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
                .replace(/\s{2,}/g, ' ');
              setDireccion(val);
            }}
            onBlur={() => {
              const val = direccion.trim();
              if (val.length < 5) {
                setDireccion('');
              } else {
                setDireccion(val);
              }
            }}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Ej. Calle Oquendo 123"
          />
        </div>

        {/* Correo electrónico */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Correo electrónico(*)</label>
          <input
            type="email"
            value={correoElectronico}
            maxLength={100}
            onChange={(e) => {
              const val = e.target.value.trim().replace(/\s/g, '');
              setCorreoElectronico(val);
            }}
            onBlur={() => {
              const esValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoElectronico);
              if (!esValido) {
                setCorreoElectronico('');
              }
            }}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Ej. juan.perez@gmail.com"
          />
          {correoElectronico.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoElectronico) && (
            <p className="text-red-500 text-xs mt-1">Ingrese un correo electrónico válido.</p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="mt-6 flex justify-between gap-4">
        <button
          onClick={onCancel} // ✅ AQUI ESTA CORREGIDO
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
