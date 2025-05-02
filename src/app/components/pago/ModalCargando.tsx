"use client";

import { FC } from "react";

const ModalCargando: FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Procesando pago...</h2>
      </div>
    </div>
  );
};

export default ModalCargando;
