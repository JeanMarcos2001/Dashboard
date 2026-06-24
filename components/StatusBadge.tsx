import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { AppointmentStatus } from '../types';

interface StatusBadgeProps {
  status: AppointmentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    [AppointmentStatus.AGENDADO]:   { label: 'Agendado', classes: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={12} /> },
    [AppointmentStatus.CONFIRMADO]: { label: 'Confirmado', classes: 'bg-teal-50 text-teal-600 border-teal-100', icon: <CheckCircle2 size={12} /> },
    [AppointmentStatus.CANCELADO]:  { label: 'Cancelado', classes: 'bg-rose-50 text-rose-600 border-rose-100', icon: <XCircle size={12} /> },
    [AppointmentStatus.CONVERTIDO]: { label: 'Convertido', classes: 'bg-purple-50 text-purple-600 border-purple-100', icon: <CheckCircle2 size={12} /> },
    [AppointmentStatus.PENDIENTE]:  { label: 'Pendiente', classes: 'bg-sky-50 text-sky-600 border-sky-100', icon: <Clock size={12} /> },
    [AppointmentStatus.ASISTIO]:    { label: 'Asistió', classes: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={12} /> },
    [AppointmentStatus.FALTO]:      { label: 'Faltó', classes: 'bg-orange-50 text-orange-600 border-orange-100', icon: <AlertTriangle size={12} /> }
  };
  const config = configs[status] || configs[AppointmentStatus.PENDIENTE];
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-tight border ${config.classes}`}>
      {config.icon} {config.label}
    </span>
  );
};
