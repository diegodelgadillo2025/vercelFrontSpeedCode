'use client';

import { FC } from 'react';

interface ModalProps {
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const Modal: FC<ModalProps> = ({ mensaje, onConfirmar, onCancelar }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">{mensaje}</h2>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirmar}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all"
          >
            Aceptar
          </button>
          <button
            onClick={onCancelar}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;