'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ReservaExpirada() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = '/dist/cancelacion.js';
    script.defer = true;
    document.body.appendChild(script);
  
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  

  return (
    <div className="container text-center p-6 space-y-4">
      <h1 className="text-2xl font-bold text-[#212E5E]">Tiempo Para Reserva Expirada</h1>

      <div className="text-6xl">
        <img
          src="https://cdn.pixabay.com/photo/2014/10/06/04/29/sad-476039_1280.png"
          alt="Reserva expirada"
          className="w-40 h-35 mx-auto"
          loading="lazy"
        />
      </div>

      <p className="text-gray-700">
        El tiempo límite para pagar ha sido superado.<br />
        Puedes intentar reservar nuevamente
      </p>

      <button
        onClick={() => setShowModal(true)}
        className="bg-[#FCA311] hover:bg-[#E0910F] text-white px-4 py-2 rounded"
      >
        Buscar Otro
      </button>

      <div id="modal" className={`modal ${showModal ? '' : 'hidden'}`}>
        <div className="modal-content bg-white p-6 rounded-lg shadow-md mx-auto max-w-md">
          <p className="text-gray-800 font-medium">¿Seguro que quieres buscar otra reserva?</p>
          <div className="modal-buttons flex justify-center gap-4 mt-4">
            <button
              onClick={() => router.push('/home')}
              className="bg-[#FCA311] hover:bg-[#E0910F] text-white px-3 py-1 rounded"
            >
              Sí
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="bg-[#FCA311] hover:bg-[#E0910F] text-white px-3 py-1 rounded"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
