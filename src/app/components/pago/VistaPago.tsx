"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ModalSeleccionPago from "./ModalSeleccionPago";
import PagoTargeta from "./PagoTargeta";
import PagoQR from "./PagoQR";
import "../../globals.css";
import { IoArrowBack } from "react-icons/io5";

interface VistaPagoProps {
  id: string | null;
  monto: string | null;
}

const VistaPago = ({ id, monto }: VistaPagoProps) => {
  const router = useRouter();
  const [modoPago, setModoPago] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [vehiculo, setVehiculo] = useState<any>(null);
  const [idReserva, setIdReserva] = useState<number | null>(null);

  const [nombreTitular, setNombreTitular] = useState("");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [cvv, setCvv] = useState("");
  const [direccion, setDireccion] = useState("");
  const [correoElectronico, setCorreoElectronico] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");

  useEffect(() => {
    if (id) {
      const idReservaNum = parseInt(id);
      setIdReserva(idReservaNum);
      axios
        .get(`https://vercel-back-speed-code.vercel.app/api/reservas/${idReservaNum}`)
        .then((response) => {
          const data = response.data;
          setVehiculo({
            ...data,
            imagen:
              data.imagen ||
              "https://previews.123rf.com/images/nastudio/nastudio2007/nastudio200700383/152011677-silhouette-car-icon-for-logo-vehicle-view-from-side-vector-illustration.jpg",
          });
        })
        .catch((error) => {
          console.error("Error al obtener detalles de la reserva:", error);
        });
    }
  }, [id]);

  const handleConfirmacion = () => {
    alert("Pago con tarjeta confirmado");
  };

  const handleConfirmacionQR = () => {
    alert("Verificación de pago con QR realizada");
  };

  const renderDetallesAuto = () => {
    if (!vehiculo) return null;

    const fechaInicio = new Date(vehiculo.fechaInicio);
    const fechaFin = new Date(vehiculo.fechaFin);

    return (
      <div className="max-w-3xl mx-auto px-4 py-6 bg-white rounded-xl shadow-lg">
        <div className="relative mb-6">
          <button
            onClick={() => setModoPago(null)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-blue-600 hover:text-blue-800 transition text-sm font-medium focus:outline-none"
            aria-label="Volver atrás"
          >
            <IoArrowBack size={18} />
          </button>

          <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800">
            Información del Vehículo
          </h2>
        </div>

        <div className="space-y-4">
          <div className="relative flex justify-center">
            <img
              src={vehiculo.imagen}
              alt={`${vehiculo.marca} ${vehiculo.modelo}`}
              className="w-[400px] h-[250px] object-cover rounded-lg shadow-lg"
            />
            <button
              onClick={() => {
                const imageWindow = window.open("", "_blank");
                if (imageWindow) {
                  imageWindow.document.write(
                    `<img src="${vehiculo.imagen}" style="width: 100%; height: auto;" />`
                  );
                } else {
                  alert("Por favor permite ventanas emergentes para ver la imagen");
                }
              }}
              className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
              title="Ver imagen en pantalla completa"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 3h6v6m0 0L10 21m11-11l-6 6M3 9V3h6m0 0L21 21"
                />
              </svg>
            </button>
          </div>

          <div className="text-gray-800 space-y-3 text-sm md:text-base">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
              {vehiculo.marca} {vehiculo.modelo}
            </h3>

            <div className="flex justify-between px-4">
              <span className="font-semibold">Descripción:</span>
              <span>{vehiculo.descripcion}</span>
            </div>

            <div className="flex justify-between px-4">
              <span className="font-semibold">Placa:</span>
              <span>{vehiculo.placa}</span>
            </div>

            <div className="flex justify-between px-4">
              <span className="font-semibold">Inicio del viaje:</span>
              <span>{fechaInicio.toLocaleString()}</span>
            </div>

            <div className="flex justify-between px-4">
              <span className="font-semibold">Fin del viaje:</span>
              <span>{fechaFin.toLocaleString()}</span>
            </div>

            <div className="flex justify-between px-4 text-lg font-semibold text-[#14213D] pt-2 border-t border-gray-200">
              <span>Monto total a pagar:</span>
              <span>{monto || vehiculo.totalConGarantia} Bs.</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFormularioPago = () => (
    <div className="flex-1">
      {modoPago === "tarjeta" ? (
        <PagoTargeta
          nombreTitular={nombreTitular}
          numeroTarjeta={numeroTarjeta}
          mes={mes}
          anio={anio}
          cvv={cvv}
          direccion={direccion}
          correoElectronico={correoElectronico}
          setNombreTitular={setNombreTitular}
          setNumeroTarjeta={setNumeroTarjeta}
          setMes={setMes}
          setAnio={setAnio}
          setCvv={setCvv}
          setDireccion={setDireccion}
          setCorreoElectronico={setCorreoElectronico}
          handleConfirmacion={handleConfirmacion}
          onCancel={() => setModoPago(null)}
        />
      ) : vehiculo ? (
        <PagoQR
          loading={loading}
          qrImage={qrImage}
          handleConfirmacionQR={handleConfirmacionQR}
          idReserva={vehiculo.idReserva}
          monto={monto ? parseFloat(monto) : vehiculo.totalConGarantia}
        />
      ) : null}
    </div>
  );

  const renderVistaPago = () => (
    <div className="w-full max-w-[3700px] mx-auto shadow-lg rounded-xl p-6 flex flex-col lg:flex-row gap-[80px] overflow-y-auto">
      {renderDetallesAuto()}
      {renderFormularioPago()}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gray-50 px-4 py-8 overflow-hidden">
      {!modoPago ? (
        <ModalSeleccionPago
          setModoPago={setModoPago}
          onCancel={() => router.push("/")}
        />
      ) : (
        renderVistaPago()
      )}
    </div>
  );
};

export default VistaPago;
