'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReservaVehiculo from '@/app/components/reserva/ReservaVehiculo';

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando reserva...</div>}>
      <ReservaContent />
    </Suspense>
  );
}

function ReservaContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const id = idParam ? parseInt(idParam) : null;

  return <ReservaVehiculo id={id} />;
}
