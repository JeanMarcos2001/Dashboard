import { Appointment, AppointmentStatus, Alumno, Apoderado } from '../types';

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

const EMOJI_ESTADO: Partial<Record<AppointmentStatus, string>> = {
  [AppointmentStatus.PENDIENTE]: '🕐',
  [AppointmentStatus.AGENDADO]: '📅',
  [AppointmentStatus.CONFIRMADO]: '✅',
  [AppointmentStatus.ASISTIO]: '🎓',
  [AppointmentStatus.FALTO]: '❌',
  [AppointmentStatus.CONVERTIDO]: '🏆',
  [AppointmentStatus.CANCELADO]: '🚫',
};

const formatHora12 = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

/** Texto listo para compartir con los datos de una cita (formato con emojis). */
export const construirMensajeCita = (
  cita: Appointment,
  alumno: Alumno | undefined,
  apoderado: Apoderado | null | undefined
): string => {
  const esIndependiente = cita.tipo_persona === 'independiente' || !alumno?.id_apoderado;
  const contacto = esIndependiente ? cita.alumno_nombre : (apoderado?.nombre_completo || cita.alumno_nombre);
  const telefono = (esIndependiente ? alumno?.telefono : apoderado?.telefono) || '—';
  const emoji = EMOJI_ESTADO[cita.estado] ?? '📋';

  return (
    `📋 *DETALLE DE CITA — Dashboard Web*\n\n` +
    `🎓 *Alumno:* ${cita.alumno_nombre}\n` +
    `👤 *Contacto:* ${contacto}\n` +
    `📞 *Teléfono:* ${telefono}\n` +
    `🏫 *Sede:* ${cita.filial_nombre}\n` +
    `📅 *Fecha:* ${formatFriendlyDate(cita.fecha_cita)}\n` +
    `⏰ *Hora:* ${formatHora12(cita.hora_cita)}\n` +
    `${emoji} *Estado:* ${cita.estado}` +
    (cita.observaciones ? `\n\n📝 *Notas:* ${cita.observaciones}` : '')
  );
};

export const cleanPhoneNumberForWhatsapp = (phone: string | undefined | null) => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    cleaned = '51' + cleaned;
  }
  return cleaned;
};
