//ModalInicioSesion
import { useState, useEffect, useRef, useCallback } from 'react';
import BaseModal from '@/app/components/modals/ModalBase';
import BotonConfirm from '@/app/components/botons/botonConfirm';
import CodigoVerificacion from '@/app/components/input/CodigoVerificacíon';
import { FaKey } from "react-icons/fa";
import { GrPowerReset } from "react-icons/gr";
//import { useRouter } from 'next/navigation';
export default function ModalInicioSesion({ 
  onClose,
  tempToken,
  email,
  onSuccess,
  }: { 
    onClose: () => void;
    tempToken: string;
    email: string;
    onSuccess: () => void;
  }) {

  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [contador, setContador] = useState(30);
  const [puedeReenviar, setPuedeReenviar] = useState(false);

  const [intentosReenvio, setIntentosReenvio] = useState(0); // NUEVO ESTADO
  const MAX_INTENTOS = 3; // CONSTANTE PARA LÍMITE

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  //const router = useRouter();

  const iniciarContador = useCallback(() => {
    setPuedeReenviar(false);
    setContador(30);
    intervalRef.current = setInterval(() => {
      setContador((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          // Solo permitir reenviar si no se han agotado los intentos
          if (intentosReenvio < MAX_INTENTOS) {
            setPuedeReenviar(true);
          } else {
            setPuedeReenviar(false);
            setError(`Has alcanzado el límite de ${MAX_INTENTOS} reenvíos`);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [intentosReenvio, MAX_INTENTOS]);

  useEffect(() => {
    iniciarContador();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [iniciarContador]);

  const handleReenviarCodigo = async () => {
    if (intentosReenvio >= MAX_INTENTOS) {
      return;
    }
    setError('');
    try {
      await fetch('http://localhost:3001/api/2fa/enviar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tempToken}`,
        },
      });
      setIntentosReenvio(prev => prev + 1);
      
      // Si es el último intento, no reiniciar el contador
      if (intentosReenvio + 1 < MAX_INTENTOS) {
        iniciarContador();
      } else {
        setPuedeReenviar(false);
      }
    } catch {
      setError('Error al reenviar el código');
    }
  };

  const handleVerify2FA = async () => {
  setLoading(true);
  setError('');

  try {
    const res = await fetch('http://localhost:3001/api/2fa/verificar-login', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tempToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ codigo }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Error al verificar el código');
    }

    // Guardar el token real
    localStorage.setItem('token', data.token);
    localStorage.setItem('nombreCompleto', data.user.nombreCompleto);
    localStorage.setItem('loginSuccess', 'true'); // IMPORTANTE: Asegurar que se guarde
    
    // Llamar a onSuccess para completar el login
    onSuccess();
    //router.push('/home/homePage');
    
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error al verificar código');
  } finally {
    setLoading(false);
  }
  //router.push('/home/homePage');
};

  return (
    <BaseModal onClose={onClose}>
      <svg
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        className="ml-auto block w-fit h-[30px] cursor-pointer text-[var(--azul-oscuro)]"
        onClick={onClose}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"
        />
      </svg>
      
      <h2 className="text-xl font-bold text-center text-[var(--azul-oscuro)] mb-4">
        Bienvenido a <br />
        <span className="text-[var(--naranja)] font-[var(--tamaño-black)] text-[2.2rem] drop-shadow-[2px_2px_4px_rgba(0,0,0,0.4)]">
          REDIBO
        </span>
        <br />
        <span className="text-[var(--azul-oscuro)] font-[var(--tamaño-regular)] text-[1.8rem] uppercase underline drop-shadow-[2px_2px_4px_rgba(0,0,0,0.4)]">
          INGRESAR CÓDIGO
        </span>
      </h2>
      
      <p className="text-center text-[var(--azul-oscuro)] mb-4">
        Hemos enviado un código de verificación a:
        <br />
        <strong>{email}</strong>
      </p>
      
      <CodigoVerificacion
        name="codigo"
        label="Ingresa código"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        icono={<FaKey className="text-[var(--azul-oscuro)] text-2xl" />}
      />
      
      {!puedeReenviar ? (
        <p className="text-left text-[var(--azul-oscuro)] my-1 font-semibold w-full">
          Podremos enviar un nuevo código en 0:{contador < 10 ? `0${contador}` : contador}
        </p>
      ) : (
        <>
          <button
            onClick={handleReenviarCodigo}
            disabled={intentosReenvio >= MAX_INTENTOS}
            className={`flex items-left gap-2 my-1 font-semibold w-full h-auto ${
              intentosReenvio >= MAX_INTENTOS 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-[var(--azul-oscuro)] hover:underline'
            }`}
          >
            <GrPowerReset className="text-xl" /> 
            Obtener un código nuevo {intentosReenvio > 0 && `(${MAX_INTENTOS - intentosReenvio} restantes)`}
          </button>
        </>
      )}
      
      {error && (
        <p className="text-[var(--rojo)] text-sm text-center mt-2 font-bold">{error}</p>
      )}

      <BotonConfirm 
        texto="Verificar e iniciar sesión" 
        onClick={handleVerify2FA}
        disabled={codigo.length !== 6 || loading}
      />
    </BaseModal>
  );
}