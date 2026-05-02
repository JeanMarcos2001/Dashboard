
import { AppointmentStatus, Alumno, Apoderado, Filial, Appointment } from './types';

export const mockApoderados: Apoderado[] = [
  { id: 1, nombre_completo: 'Maria Garcia', telefono: '987654321', created_at: '2024-01-10' },
  { id: 2, nombre_completo: 'Juan Perez', telefono: '912345678', created_at: '2024-01-12' },
];

// Added missing properties to satisfy Alumno interface: edad, telefono, id_apoderado, created_at
export const mockAlumnos: Alumno[] = [
  { 
    id: 101, 
    nombre_completo: 'Luis Garcia', 
    edad: 15, 
    telefono: '987654321', 
    id_apoderado: 1, 
    created_at: '2024-01-10' 
  },
  { 
    id: 102, 
    nombre_completo: 'Ana Perez', 
    edad: 14, 
    telefono: '912345678', 
    id_apoderado: 2, 
    created_at: '2024-01-12' 
  }
];

export const mockFiliales: Filial[] = [
  {
    id: 1,
    nombre: 'Filial Lima Central',
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: 'Lima',
    direccion: 'Av. Arequipa 1234',
    referencia: 'Cerca al Parque de la Reserva',
    telefono_fijo: '01 4445566',
    telefono_movil: '999888777',
    activo: true,
    created_at: '2024-01-01'
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 1,
    id_alumno: 101,
    id_filial: 1,
    fecha_cita: '2024-03-20',
    hora_cita: '10:00',
    estado: AppointmentStatus.PENDING,
    created_at: '2024-03-01',
    alumno_nombre: 'Luis Garcia',
    filial_nombre: 'Filial Lima Central'
  }
];
