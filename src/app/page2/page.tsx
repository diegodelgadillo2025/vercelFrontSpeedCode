'use client';

import TargetaNotificacion from '../components/noti/compnot/TarjetaNotificacion';

export default function NotificacionesPage() {
  const notificaciones = [
    {
      titulo: 'Tiempo de renta concluido',
      descripcion: 'Tu vehículo Nissan Sentra ya concluyó su tiempo de renta con el arrendatario El Señor X',
      fecha: '03/31/2025, 21:00',
      destacada: true,
    },
    {
      titulo: 'Título de una notificación',
      descripcion: 'Descripción de una notificación pasada',
      fecha: 'Fecha de la notificación',
    },
    {
      titulo: 'Título de una notificación',
      descripcion: 'Descripción de una notificación pasada',
      fecha: 'Fecha de la notificación',
    },
    {
      titulo: 'Título de una notificación',
      descripcion: 'Descripción de una notificación pasada',
      fecha: 'Fecha de la notificación',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Línea superior */}
      <div className="h-[12px] bg-[#FCA311]" />

      {/* Título */}
      <div className="px-6 py-10">
        <h1 className="text-[#11295B] text-4xl font-bold">Notificaciones</h1>
      </div>

      {/* Lista de notificaciones */}
      <div className="px-6 space-y-4">
        {notificaciones.map((n, i) => (
          <TargetaNotificacion key={i} {...n} />
        ))}
      </div>
    </div>
  );
}
