import { Appointment, AppointmentStatus } from '../types';

export const isAlumnoExistenteCita = (app: Appointment | null | undefined): boolean => {
  if (!app) return false;
  if (app.tipo_cita === 'alumno_existente') return true;
  if (app.tipo_cita) return false;
  if (app.tipo_persona?.startsWith('existente_')) return true;
  if (app.estado === AppointmentStatus.PENDIENTE ||
    app.estado === AppointmentStatus.ASISTIO ||
    app.estado === AppointmentStatus.FALTO) return true;
  return false;
};

export const formatFriendlyDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const formatted = new Intl.DateTimeFormat('es-ES', options).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const cleanPhoneNumberForWhatsapp = (phone: string | undefined | null) => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    cleaned = '51' + cleaned;
  }
  return cleaned;
};
