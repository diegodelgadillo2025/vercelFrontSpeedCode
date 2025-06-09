import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

interface MensajeRedireccionProps {
  onCerrar: () => void;
  onAceptar: () => void;
}

export default function MensajeRedireccion({ onCerrar, onAceptar }: MensajeRedireccionProps) {
  const [visible, setVisible] = useState(false);
  const [cerrando, setCerrar] = useState(false);

  useEffect(() => {
    // Animación de entrada
    setVisible(true);
  }, []);

  const manejarCierre = () => {
    setCerrar(true);
    setTimeout(() => {
      onCerrar();
    }, 300); // Tiempo de la transición
  };

  return (
    <div
      className={`fixed inset-0 z-[3000] bg-black bg-opacity-50 flex items-center justify-center transition-opacity ${
        cerrando ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative transform transition-transform duration-300 ${
          visible && !cerrando ? "scale-100" : "scale-95"
        }`}
      >
        {/* Botón de cerrar (x) */}
        <button
          onClick={manejarCierre}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <IoClose className="h-6 w-6" />
        </button>

        {/* Contenido del mensaje */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-[var(--azul-oscuro)] mb-3">
            ¡Vehículo no disponible!
          </h3>
          <p className="text-gray-600 mb-5">
            Parece que este vehículo ya no está disponible. ¿Te ayudamos a encontrar otro que se adapte a tus necesidades?
          </p>
          
          <div className="flex justify-center gap-3">
            <button
              onClick={onAceptar}
              className="bg-[var(--naranja)] hover:bg-[var(--naranja-oscuro)] text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Sí, por favor
            </button>
            <button
              onClick={manejarCierre}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors"
            >
              No, gracias
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}