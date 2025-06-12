"use client";

import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Modal from "./Modal";

interface PagoQRProps {
  loading: boolean;
  qrImage: string;
  idReserva: number | string;
  monto: any;
  handleConfirmacionQR: () => void;
}

const PagoQR: FC<PagoQRProps> = ({ loading, qrImage, idReserva, monto }) => {
  const router = useRouter();
  const [qrURL, setQrURL] = useState<string>(qrImage);
  const [mensajeModalQR, setMensajeModalQR] = useState<string | null>(null);
  const [mostrarModalCancelacionQR, setMostrarModalCancelacionQR] = useState(false);
  const [mensajeErrorModalQR, setMensajeErrorModalQR] = useState<string | null>(null);

  useEffect(() => {
    const crearQR = async () => {
      if (!qrImage && idReserva && monto) {
        try {
          const response = await axios.get(
            `http://localhost:3001/generarQR/crear/${monto}/${idReserva}`
          );
          const data = response.data;
          if (data?.archivoQR) {
            setQrURL(`http://localhost:3001/qr/${data.archivoQR}`);
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
  }, [idReserva, monto, qrImage]);

  const handleRecargarQR = async () => {
    if (!idReserva || !monto) {
      alert("Faltan datos para regenerar el QR.");
      return;
    }
    
    
    try {
      const response = await axios.get(
        `http://localhost:3001/generarQR/regenerar/${monto}/${idReserva}`
      );
      const data = response.data;
      if (data?.archivoQR) {
        setQrURL(`http://localhost:3001/qr/${data.archivoQR}`);
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
      const response = await fetch(qrURL);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "codigo_qr.png";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode === document.body) {
          document.body.removeChild(link);
        }
      }, 0);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el QR:", error);
      alert("Ocurrió un error al intentar descargar el código QR.");
    }
  };

  const handleConfirmacionQR = async () => {
  const correoElectronico = "pruebaTEST@gmail.com";

  // Validaciones explícitas
  if (!idReserva || isNaN(Number(idReserva))) {
    setMensajeModalQR("ID de reserva inválido.");
    return;
  }

  if (!monto || isNaN(Number(monto))) {
    setMensajeModalQR("El monto no es un número válido.");
    return;
  }

  if (!qrURL) {
    setMensajeModalQR("No hay código QR disponible.");
    return;
  }

  if (!correoElectronico) {
    setMensajeModalQR("Correo electrónico no válido.");
    return;
  }

  const nombreArchivoQR = qrURL.split("/").pop();

  if (!nombreArchivoQR || !nombreArchivoQR.startsWith("qr_")) {
    setMensajeModalQR("Nombre de archivo QR inválido.");
    return;
  }

  const concepto = "Pago con QR";

  const datosPagoQR = {
    nombreArchivoQR: nombreArchivoQR,
    monto: Number(monto).toFixed(2),  // ✅ número como string válido
    concepto,
    correoElectronico
  };
  
  
  try {
    const response = await axios.post(
      `http://localhost:3001/pagos/pagarConQR/${idReserva}`,
      datosPagoQR
    );

    if (response.status === 200 && response.data?.comprobanteURL) {
      setMensajeModalQR("Pago realizado con éxito.");
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
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 0);
        } catch (err) {
          console.error("Error al descargar el comprobante:", err);
        }
      }, 2000);
    } else {
      const msg = response.data?.error || "Error desconocido al pagar.";
      setMensajeModalQR(msg);
    }
  } catch (error: any) {
    console.error("Error:", error);
    const msg = error.response?.data?.error || "Hubo un error al realizar el pago.";
    setMensajeModalQR(msg);
  }
};


  return (
    <div className="max-w-3xl mx-auto px-4 py-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-6">
        Pago con Código QR
      </h2>

      <div className="space-y-4">
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

        <p className="text-center text-gray-700 text-sm md:text-base">
          Escanee el código QR para realizar el pago.
        </p>
        <p className="text-center text-gray-500 text-xs">
          Aún no se ha confirmado ningún pago.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleRecargarQR}
            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition"
            title="Recargar QR"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-6-6c1.31 0 2.5.44 3.45 1.17L13 11h7V4l-2.35 2.35z" />
            </svg>
          </button>

          <button
            onClick={handleDescargarQR}
            className="p-3 bg-yellow-500 hover:bg-yellow-600 rounded-full transition"
            title="Descargar QR"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>

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
