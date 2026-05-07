
export enum AppointmentStatus {
  PENDING = 'PENDIENTE',
  VERIFIED = 'VERIFICADO',
  CANCELLED = 'CANCELADO'
}

export interface Apoderado {
  id: number;
  nombre_completo: string;
  telefono: string;
  created_at: string;
}

export interface Alumno {
  id: number;
  nombre_completo: string;
  edad: number;
  telefono: string;
  id_apoderado: number;
  created_at: string;
}

export interface Filial {
  id: number;
  nombre: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  referencia: string;
  telefono_fijo: string;
  telefono_movil: string;
  activo: boolean;
  created_at: string;
  file_path?: string | null;
  foto_position?: string | null;
  foto_scale?: number | null;
  id_mensaje_wsp?: number | null;
}

export interface MensajeWsp {
  id: number;
  titulo: string;
  contenido: string;
  created_at: string;
}

export interface Appointment {
  id: number;
  id_alumno: number;
  id_filial: number;
  fecha_cita: string;
  hora_cita: string;
  estado: AppointmentStatus;
  created_at: string;
  // Join data for UI convenience
  alumno_nombre?: string;
  filial_nombre?: string;
}

export interface Stats {
  totalAppointments: number;
  verifiedCount: number;
  pendingCount: number;
  conversionRate: number;
}
