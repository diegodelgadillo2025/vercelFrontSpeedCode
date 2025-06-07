"use client";

import dynamic from "next/dynamic";

const Mapa = dynamic(() => import("@/app/components/mapa/mapa"), {
  ssr: false,
  loading: () => <p>Cargando mapa...</p>,
});

export default function MapaPage() {
  return <Mapa />;
}
