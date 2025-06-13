"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfigConductores({ idReserva }: { idReserva: number | null }) {
  const router = useRouter();
  const [conductores, setConductores] = useState<Array<{
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    esPrincipal: boolean;
  }>>([
    {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      esPrincipal: true
    }
  ]);
//agregado
  const [errores, setErrores] = useState<{ [key: number]: { nombre?: boolean; apellido?: boolean; email?: boolean; telefono?: boolean } }>({});
  
  const [quienRecoge, setQuienRecoge] = useState<string>("yo");
  const [conductorRecogeId, setConductorRecogeId] = useState<number | null>(null);
  const [metodoEntrega, setMetodoEntrega] = useState<string>("ubicacion");
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);

  const agregarConductor = () => {
    if (conductores.length > 1) {
    alert("Solo puedes agregar un conductor adicional.");
    return;
  }
    setConductores([
      ...conductores,
      {
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        esPrincipal: false
      }
    ]);
  };

  const eliminarConductor = (index: number) => {
    const nuevosConductores = conductores.filter((_, i) => i !== index);
    setConductores(nuevosConductores);
    if (conductorRecogeId === index) {
      setConductorRecogeId(null);
    }
  };

  const handleChange = (index: number, campo: string, valor: string) => {
    const nuevosConductores = [...conductores];
    nuevosConductores[index] = {
      ...nuevosConductores[index],
      [campo]: valor
    };
    setConductores(nuevosConductores);
     // Limpiar error visual al escribir
    setErrores((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [campo]: false
      }
    }));//agregado
  };

  // para validar el formulario componente ConfigConductores
   const validarFormulario = () => {
    const soloLetrasRegex = /^[a-zA-ZáéíóúÑñ\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const telefonoRegex = /^\d{7,15}$/;

    let erroresTemp: typeof errores = {};

    conductores.forEach((c, index) => {
      const err: typeof errores[0] = {};

      if (!soloLetrasRegex.test(c.nombre)) err.nombre = true;
      if (!soloLetrasRegex.test(c.apellido)) err.apellido = true;
      if (!emailRegex.test(c.email)) err.email = true;
      if (!telefonoRegex.test(c.telefono)) err.telefono = true;

      if (Object.keys(err).length > 0) erroresTemp[index] = err;
    });

    setErrores(erroresTemp);

    if (Object.keys(erroresTemp).length > 0) {
      alert("Por favor corrija los campos incorrectos antes de continuar.");
      return false;
    }

    if (quienRecoge === "otro" && conductorRecogeId === null) {
      alert("Por favor seleccione el conductor que recogerá el auto");
      return false;
    }

    return true;
  };

  const mostrarConfirmacion = () => {
    if (validarFormulario()) {
      setMostrarModalConfirmacion(true);
    }
  };

 const guardarConfiguracion = async () => {
  if (!idReserva) {
    alert("ID de reserva inválido");
    return;
  }

  try {
    // ✅ Verificar si ya hay conductores asignados antes de hacer el POST
    const responseExistentes = await fetch(`https://vercel-back-speed-code.vercel.app/api/conductores/${idReserva}`);
    const existentes = await responseExistentes.json();

    if (Array.isArray(existentes) && existentes.length > 0) {
      alert("Ya existen conductores asignados a esta reserva.");
      return;
    }

    // ✅ Preparar payload desde el formulario
    const conductoresPayload = conductores.map(c => ({
      nombre: c.nombre,
      apellido: c.apellido,
      email: c.email,
      telefono: c.telefono
    }));

    // ✅ Enviar la solicitud POST para asignar
    const response = await fetch("https://vercel-back-speed-code.vercel.app/api/conductores/asignar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idReserva,
        conductores: conductoresPayload
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Conductores asignados correctamente");
      setMostrarModalConfirmacion(false);
      router.back();
    } else {
      console.error("Error desde backend:", data.error);
      alert("Error al asignar conductores: " + data.error);
    }
  } catch (error) {
    console.error("Error de red:", error);
    alert("Error de red al asignar conductores");
  }
};



  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Configuración de Conductores</h2>
      
      {/* Sección Conductor Principal */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Conductor Principal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
             type="text"
             className={`w-full p-2 border rounded-md ${
              errores[0]?.nombre ? "border-red-500" : "border-gray-300"
            }`}
            value={conductores[0].nombre}
            onChange={(e) => handleChange(0, "nombre", e.target.value)}
            />

          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={conductores[0].apellido}
              onChange={(e) => handleChange(0, "apellido", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={conductores[0].email}
              onChange={(e) => handleChange(0, "email", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={conductores[0].telefono}
              onChange={(e) => handleChange(0, "telefono", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Sección Quién recogerá el auto */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Conductor que recogerá el Auto</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="yoRecoge"
              name="quienRecoge"
              value="yo"
              checked={quienRecoge === "yo"}
              onChange={() => setQuienRecoge("yo")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="yoRecoge" className="ml-2 block text-sm text-gray-700 font-bold hover:text-[#D88F0A] transition-colors">
              Yo recogeré el auto
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="otroRecoge"
              name="quienRecoge"
              value="otro"
              checked={quienRecoge === "otro"}
              onChange={() => setQuienRecoge("otro")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="otroRecoge" className="ml-2 block text-sm text-gray-700 font-bold hover:text-[#D88F0A] transition-colors">
              Otra persona recogerá el auto
            </label>
          </div>

          {quienRecoge === "otro" && (
            <div className="ml-6 mt-2">
              {conductores.length <= 1 ? (
                <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                  No has agregado conductores adicionales. Por favor agrega al menos un conductor adicional.
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccione el conductor que recogerá el auto:
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={conductorRecogeId || ""}
                    onChange={(e) => setConductorRecogeId(Number(e.target.value))}
                  >
                    <option value="">Seleccione un conductor</option>
                    {conductores.slice(1).map((conductor, index) => (
                      <option key={index} value={index + 1}>
                        {conductor.nombre} {conductor.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sección Método de entrega */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Método de entrega del Auto</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center">
              <input
                type="radio"
                id="recogerUbicacion"
                name="metodoEntrega"
                value="ubicacion"
                checked={metodoEntrega === "ubicacion"}
                onChange={() => setMetodoEntrega("ubicacion")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="recogerUbicacion" className="ml-2 block text-sm text-gray-700 font-bold hover:text-[#D88F0A] transition-colors">
                Recoger en Ubicación
              </label>
            </div>
            <p className="ml-6 text-xs text-gray-500">Ir al lugar designado para recoger el auto</p>
          </div>
          
          <div>
            <div className="flex items-center">
              <input
                type="radio"
                id="anfitrionEntrega"
                name="metodoEntrega"
                value="anfitrion"
                checked={metodoEntrega === "anfitrion"}
                onChange={() => setMetodoEntrega("anfitrion")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="anfitrionEntrega" className="ml-2 block text-sm text-gray-700 font-bold hover:text-[#D88F0A] transition-colors">
                El anfitrión lo entregará
              </label>
            </div>
            <p className="ml-6 text-xs text-gray-500">El propietario lleva el auto a tu ubicación</p>
          </div>
        </div>
      </div>

      {/* Sección Conductores Adicionales */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Conductores Adicionales</h3>
          <button
            onClick={agregarConductor}
            className="px-4 py-2 border-2 border-[#FCA311] bg-transparent text-[#FCA311] font-bold rounded-md hover:border-[#D88F0A] hover:text-[#D88F0A] transition-colors"          >
            Agregar Conductor
          </button>
        </div>

        {conductores.slice(1).map((conductor, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={conductor.nombre}
                onChange={(e) => handleChange(index + 1, "nombre", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={conductor.apellido}
                onChange={(e) => handleChange(index + 1, "apellido", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={conductor.email}
                onChange={(e) => handleChange(index + 1, "email", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={conductor.telefono}
                onChange={(e) => handleChange(index + 1, "telefono", e.target.value)}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={() => eliminarConductor(index + 1)}
                className="px-3 py-1 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-bold rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={mostrarConfirmacion}
          className="px-4 py-2 bg-[#FCA311] text-white font-bold rounded-md border-2 border-[#FCA311] hover:bg-[#D88F0A] hover:border-[#D88F0A] transition-colors"        >
          Guardar Configuración
        </button>
      </div>

      {/* Modal de confirmación */}
      {mostrarModalConfirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmar Configuración</h3>
            
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">Conductores:</h4>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {conductores.map((conductor, index) => (
                  <li key={index}>
                    {conductor.nombre} {conductor.apellido} {index === 0 && "(Principal)"}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">Recogida del auto:</h4>
              <p>
                {quienRecoge === "yo" 
                  ? "Será recogido por usted (conductor principal)" 
                  : `Será recogido por: ${conductores[conductorRecogeId!]?.nombre} ${conductores[conductorRecogeId!]?.apellido}`}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700">Método de entrega:</h4>
              <p>
                {metodoEntrega === "ubicacion" 
                  ? "Recoger en ubicación designada" 
                  : "El anfitrión entregará el vehículo"}
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setMostrarModalConfirmacion(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-bold rounded-md hover:bg-gray-50 transition-colors"
              >
                Modificar
              </button>
              <button
                onClick={guardarConfiguracion}
                className="px-4 py-2 bg-[#FCA311] text-white font-bold rounded-md border-2 border-[#FCA311] hover:bg-[#D88F0A] hover:border-[#D88F0A] transition-colors"                //className="px-4 py-2 FFD548 text-white rounded-md hover:FFC01E transition-colors"
                //className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"

              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}