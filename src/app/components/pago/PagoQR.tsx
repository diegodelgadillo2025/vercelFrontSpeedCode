"use client";

import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Modal from "./Modal";
//pago qr
interface PagoQRProps {
  loading: boolean;
  qrImage: string;
  idVehiculo: number | string;
  monto: any;
  handleConfirmacionQR: () => void;
}

const PagoQR: FC<PagoQRProps> = ({ loading, qrImage }) => {
  const router = useRouter();
  const [idVehiculo, setIdVehiculo] = useState<number | null>(null);
  const [monto, setMonto] = useState<number | null>(null);
  const [qrURL, setQrURL] = useState<string>(qrImage);
  const [mensajeModalQR, setMensajeModalQR] = useState<string | null>(null);

  const [mostrarModalCancelacionQR, setMostrarModalCancelacionQR] = useState(false);
  const [mensajeErrorModalQR, setMensajeErrorModalQR] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const montoParam = urlParams.get("monto");

    if (id) setIdVehiculo(parseInt(id));
    if (montoParam) setMonto(parseFloat(montoParam));
  }, []);

  useEffect(() => {
    const crearQR = async () => {
      if (!qrImage && idVehiculo && monto) {
        try {
          const response = await axios.get(
            `https://vercelbackspeedcode.onrender.com/generarQR/crear/${monto}/${idVehiculo}`
          );
          const data = response.data;
          if (data?.archivoQR) {
            setQrURL(`https://vercelbackspeedcode.onrender.com/qr/${data.archivoQR}`);
          } else {
            alert("Error al crear el QR.");
          }
        } catch (error) {
          console.error("Error al crear QR:", error);
          alert("Ocurrió un error al crear el código QR.");
        }
      }
    };

    crearQR();
  }, [idVehiculo, monto, qrImage]);

  const handleRecargarQR = async () => {
    if (!idVehiculo || !monto) {
      alert("Faltan datos para regenerar el QR.");
      return;
    }

    try {
      const response = await axios.get(
        `https://vercelbackspeedcode.onrender.com/generarQR/regenerar/${monto}/${idVehiculo}`
      );
      const data = response.data;
      if (data?.archivoQR) {
        setQrURL(`https://vercelbackspeedcode.onrender.com/qr/${data.archivoQR}`);
      } else {
        alert("Error al regenerar el QR.");
      }
    } catch (error) {
      console.error("Error al regenerar QR:", error);
      alert("Ocurrió un error al regenerar el código QR.");
    }
  };

  const handleDescargarQR = async () => {
    if (!qrURL) {
      alert("No hay QR para descargar");
      return;
    }

    try {
      const response = await fetch(qrURL); // descarga binaria
      const blob = await response.blob();  // lo convierte en objeto descargable
      const url = URL.createObjectURL(blob); // crea URL temporal

      const link = document.createElement("a");
      link.href = url;
      link.download = "codigo_qr.png"; // nombre del archivo
      document.body.appendChild(link);
      link.click(); // dispara la descarga
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // limpia la URL temporal
    } catch (error) {
      console.error("Error al descargar el QR:", error);
      alert("Ocurrió un error al intentar descargar el código QR.");
    }
  };


  const handleConfirmacionQR = async () => {
    const correoElectronico = "pruebaTEST@gmail.com";
    if (!idVehiculo || !monto || !qrURL || !correoElectronico) {
      setMensajeModalQR("Aún no se ha realizado el pago.");
      return;
    }

    const nombreArchivoQR = qrURL.split("/").pop();
    const concepto = "Pago con QR";

    const datosPagoQR = {
      nombreArchivoQR,
      monto: monto.toString(),
      concepto,
      correoElectronico,
    };

    try {
      const response = await axios.post(
        `https://vercelbackspeedcode.onrender.com/pagos/pagarConQR/${idVehiculo}`,
        datosPagoQR
      );

      if (response.status === 200 && response.data?.comprobanteURL) {
        setMensajeModalQR("Pago realizado con éxito.");
      
        setTimeout(async () => {
          try {
            const comprobanteURL = response.data.comprobanteURL;
        
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
            console.error("Error al descargar el comprobante:", err);
            alert("Ocurrió un error al intentar descargar el comprobante.");
          }
        }, 2000);
        
      }
       else {
        setMensajeModalQR("Error al realizar el pago: " + (response.data?.mensaje || "Error desconocido"));
      }
    } catch (error: any) {
      console.error("Error:", error);
      const msg = error.response?.data?.error || "Hubo un error al realizar el pago.";
      setMensajeModalQR("Error al realizar el pago: " + msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-6">
        Pago con Código QR
      </h2>

      <div className="space-y-4">
        {/* Imagen del QR */}
        <div className="relative flex justify-center">
          {loading ? (
            <p className="text-lg text-gray-600">Generando código QR...</p>
          ) : qrURL ? (
            <img
              src={qrURL}
              alt="Código QR"
              className="w-[250px] h-[250px] object-contain rounded-lg shadow-lg border border-gray-300"
            />
          ) : (
            <p className="text-red-500 text-lg">No se pudo generar el QR.</p>
          )}
        </div>

        {/* Texto */}
        <p className="text-center text-gray-700 text-sm md:text-base">
          Escanee el código QR para realizar el pago.
        </p>
        <p className="text-center text-gray-500 text-xs">
          Aún no se ha confirmado ningún pago.
        </p>

        {/* Botones */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleRecargarQR}
            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition"
            title="Recargar QR"
            aria-label="Recargar código QR"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-6-6c1.31 0 2.5.44 3.45 1.17L13 11h7V4l-2.35 2.35z" />
            </svg>
          </button>

          <button
          onClick={handleDescargarQR}
          className="p-3 bg-yellow-500 hover:bg-yellow-600 rounded-full transition"
          title="Descargar QR"
          aria-label="Descargar código QR"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-4 pt-2">
          <button
            onClick={handleConfirmacionQR}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition text-sm md:text-base"
          >
            Verificar Pago
          </button>

          <button
            onClick={() => setMostrarModalCancelacionQR(true)}
            className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition text-sm md:text-base"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Modales */}
      {mensajeModalQR && (
        <Modal
          mensaje={mensajeModalQR}
          onConfirmar={() => setMensajeModalQR(null)}
          onCancelar={() => setMensajeModalQR(null)}
        />
      )}

      {mostrarModalCancelacionQR && (
        <Modal
          mensaje="¿Seguro que deseas cancelar el pago con QR?"
          onConfirmar={() => {
            setMostrarModalCancelacionQR(false);
            router.back();
          }}
          onCancelar={() => setMostrarModalCancelacionQR(false)}
        />
      )}

      {mensajeErrorModalQR && (
        <Modal
          mensaje={mensajeErrorModalQR}
          onConfirmar={() => setMensajeErrorModalQR(null)}
          onCancelar={() => setMensajeErrorModalQR(null)}
        />
      )}
    </div>
  );
};

export default PagoQR;