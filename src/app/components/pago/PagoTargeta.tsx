"use client";

import { FC, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Modal from "./Modal";
import ModalCargando from "./ModalCargando";

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
  onCancel,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [monto, setMonto] = useState<number | null>(null);
  const [idReserva, setIdReserva] = useState<number | null>(null);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [mostrarModalCancelacion, setMostrarModalCancelacion] = useState(false);
  const [mensajeErrorModal, setMensajeErrorModal] = useState<string | null>(null);
  const [mensajeModalTarjeta, setMensajeModalTarjeta] = useState<string | null>(null);
  const [errorAnio, setErrorAnio] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    const montoParam = searchParams.get("monto");
    if (id) {
      const parsed = parseInt(id);
      if (!isNaN(parsed)) setIdReserva(parsed);
    }
    if (montoParam) {
      const parsedMonto = parseFloat(montoParam);
      if (!isNaN(parsedMonto)) setMonto(parsedMonto);
    }
  }, [searchParams]);

  const handleConfirmacionReal = async () => {
    const fechaExpiracion = `${mes}/${anio}`;
    const concepto = "Pago de reserva con tarjeta";

    if (!nombreTitular || !numeroTarjeta || !cvv || !direccion || !correoElectronico || !mes || !anio) {
      setMensajeErrorModal("Por favor completa todos los campos.");
      return;
    }
    if (!monto || !idReserva) {
      setMensajeErrorModal("Monto o idReserva no definido. Verifica la URL.");
      return;
    }

    const datosPago = {
      monto,
      concepto,
      nombreTitular,
      numeroTarjeta: numeroTarjeta.replace(/\s/g, ""),
      fechaExpiracion,
      cvv,
      direccion,
      correoElectronico,
    };

    try {
      setLoading(true);

      const BASE_URL =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3001"
          : "https://vercel-back-speed-code.vercel.app";

      const response = await axios.post(
        `${BASE_URL}/pagos/pagarConTarjeta/${idReserva}`,
        datosPago
      );


      if (response.status === 200 && response.data?.comprobanteURL) {
        setMensajeModalTarjeta("Pago realizado con éxito.");
        const comprobanteURL = response.data.comprobanteURL;
        setTimeout(async () => {
          try {
            const res = await fetch(comprobanteURL);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "comprobante_pago.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } catch (err) {
            setMensajeErrorModal("Error al descargar comprobante.");
          }
        }, 2000);
      } else {
        const msg = response.data?.mensaje || "Error desconocido";
        setMensajeErrorModal("Error en el pago: " + msg);
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || "Hubo un error al realizar el pago.";
      setMensajeErrorModal("Error: " + msg);
    } finally {
      setLoading(false);
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

                if (isNaN(num) || num < currentYear || num > maxYear) {
                  setAnio('');
                  setErrorAnio(true); // Marca error si el valor es inválido
                } else {
                  setErrorAnio(false); // Quita el error si el valor es válido
                  if (anio.length === 1) setAnio('0' + anio);
                }
              }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-center"
              placeholder="AA"
            />
            {errorAnio && (
              <p className="text-red-500 text-xs mt-1">
                Ingrese un año válido. Debe estar entre {new Date().getFullYear() % 100} y {(new Date().getFullYear() % 100) + 10}.
              </p>
            )}
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
              const val = e.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s{2,}/g, ' ');
              setDireccion(val);
            }}
            onBlur={() => {
              const val = direccion.trim();
              if (val.length < 5) setDireccion('');
              else setDireccion(val);
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
          onClick={() => setMostrarModalCancelacion(true)}
          className="w-1/2 py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition text-sm"
        >
          Cancelar
        </button>
        <button
          onClick={() => setMostrarModalConfirmacion(true)}
          className="w-1/2 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition text-sm"
        >
          Confirmar
        </button>
      </div>

      {/* Modales */}
      {mostrarModalConfirmacion && (
        <Modal
          mensaje="¿Seguro que deseas realizar el pago con tarjeta?"
          onConfirmar={async () => {
            setMostrarModalConfirmacion(false);
            await handleConfirmacionReal();
          }}
          onCancelar={() => setMostrarModalConfirmacion(false)}
        />
      )}

      {mostrarModalCancelacion && (
        <Modal
          mensaje="¿Seguro que deseas cancelar el pago?"
          onConfirmar={() => {
            setMostrarModalCancelacion(false);
            router.back();
            
          }}
          onCancelar={() => setMostrarModalCancelacion(false)}
        />
      )}

      {mensajeErrorModal && (
        <Modal
          mensaje={mensajeErrorModal}
          onConfirmar={() => setMensajeErrorModal(null)}
          onCancelar={() => setMensajeErrorModal(null)}
        />
      )}
      {mensajeModalTarjeta && (
        <Modal
          mensaje={mensajeModalTarjeta}
          onConfirmar={() => {
            setMensajeModalTarjeta(null);
          }}
          onCancelar={() => setMensajeModalTarjeta(null)}
        />
      )}

      {loading && <ModalCargando />}
    </div>
    
  );
};

export default PagoTarjeta;