"use client";
import { useRouter } from "next/navigation";

interface BotonRedireccionProps {
  ruta: string;
  texto: string;
  className?: string;
}

export default function BotonRedireccion({ ruta, texto, className = "" }: BotonRedireccionProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(ruta)}
      className={`px-4 py-2 bg-[var(--naranja)] text-white rounded-md hover:bg-[var(--naranja-oscuro)] transition-colors ${className}`}
    >
      {texto}
    </button>
  );
}