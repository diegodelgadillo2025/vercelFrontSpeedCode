'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';

interface ModalSeleccionPagoProps {
  setModoPago: (modo: string) => void;
  onCancel: () => void;
}

const ModalSeleccionPago: FC<ModalSeleccionPagoProps> = ({ setModoPago }) => {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md md:max-w-lg p-6 md:p-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-center text-gray-800 mb-6">
          Seleccione el método de pago
        </h2>

        <div className="space-y-4">
          <button
            onClick={() => setModoPago('tarjeta')}
            className="w-full py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-lg transition-colors duration-300"
          >
            Pagar con tarjeta
          </button>

          <button
            onClick={() => setModoPago('qr')}
            className="w-full py-3 rounded-lg bg-blue-900 hover:bg-blue-700 text-white font-semibold text-lg transition-colors duration-300"
          >
            Pagar con QR
          </button>

          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-lg bg-gray-200 hover:bg-red-500 text-gray-800 hover:text-white font-semibold text-lg transition-colors duration-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSeleccionPago;