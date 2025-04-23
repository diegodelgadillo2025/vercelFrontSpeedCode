"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ModalSeleccionPago from "./ModalSeleccionPago";
import PagoTargeta from "./PagoTargeta";
import PagoQR from "./PagoQR";
import "../../globals.css";

interface VistaPagoProps {
  id: string | null;
  monto: string | null;
}

const VistaPago = ({ id, monto }: VistaPagoProps) => {
  const router = useRouter();
  const [modoPago, setModoPago] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [idVehiculo, setIdVehiculo] = useState<number | null>(null);
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
      setIdVehiculo(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (idVehiculo) {
      axios
        .get(`https://vercel-back-speed-code.vercel.app/vehiculo/obtenerDetalleVehiculo/${idVehiculo}`)
        .then((response) => {
          if (response.data.success) {
            const data = response.data.data;
            setVehiculo(data);
            setIdReserva(data.reserva?.idreserva ?? null);
          }
        })
        .catch((error) => {
          console.error("Error al obtener detalles del vehículo:", error);
        });
    }
  }, [idVehiculo]);

  const handleConfirmacion = () => {
    alert("Pago con tarjeta confirmado");
  };

  const handleConfirmacionQR = () => {
    alert("Verificación de pago con QR realizada");
  };

  const renderDetallesAuto = () => {
    if (!vehiculo) return null;

    const fechaInicio = new Date(vehiculo.reserva.fecha_inicio);
    const fechaFin = new Date(vehiculo.reserva.fecha_fin);

    return (
      <div className="max-w-3xl mx-auto px-4 py-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-6">
          Información del Vehículo
        </h2>

        <div className="space-y-4">
          <div className="relative flex justify-center">
            <img
              src={/${vehiculo.imagen}}
              alt={${vehiculo.marca} ${vehiculo.modelo}}
              className="w-[400px] h-[250px] object-cover rounded-lg shadow-lg"
            />
            <button
              onClick={() => {
                const imageWindow = window.open("", "_blank");
                if (imageWindow) {
                  imageWindow.document.write(
                    <img src="https://vercel-back-speed-code.vercel.app/imagenes/${vehiculo.imagen}" style="width: 100%; height: auto;" />
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
              <span>{monto || vehiculo.tarifa} Bs.</span>
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
          idVehiculo={vehiculo.idvehiculo}
          monto={monto ? parseFloat(monto) : vehiculo.tarifa}
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