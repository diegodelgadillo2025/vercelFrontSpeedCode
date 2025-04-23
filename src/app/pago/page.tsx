'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VistaPago from '@/app/components/pago/VistaPago';

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando información de pago...</div>}>
      <PagoContent />
    </Suspense>
  );
}

function PagoContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const monto = searchParams.get('monto');

  return <VistaPago id={id} monto={monto} />;
}