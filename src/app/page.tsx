// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    //router.replace('/mapa');
    router.replace('/home');
  }, [router]);
  return null;
}
