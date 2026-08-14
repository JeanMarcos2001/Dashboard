import { supabase } from '@/config/supabase';
import { Appointment, AppointmentStatus } from '@/types';

// Función para determinar la tabla correcta de Supabase
const getTable = (tipoCita?: string | null) => {
  return tipoCita === 'alumno_existente' ? 'citas' : 'entrevistas';
};

// Función para obtener la FK adecuada para cada tabla
const getFK = (tipoCita?: string | null) => {
  return tipoCita === 'alumno_existente' ? 'citas' : 'entrevistas';
};

export const getCitas = async () => {
  const [citasRes, entrevistasRes] = await Promise.all([
    supabase.from('citas').select(`
      *,
      alumnos!citas_id_alumno_fkey (nombre_completo),
      filiales!citas_id_filial_fkey (nombre)
    `).order('creado_en', { ascending: false }),
    supabase.from('entrevistas').select(`
      *,
      alumnos!entrevistas_id_alumno_fkey (nombre_completo),
      filiales!entrevistas_id_filial_fkey (nombre)
    `).order('creado_en', { ascending: false })
  ]);

  if (citasRes.error) throw citasRes.error;
  if (entrevistasRes.error) throw entrevistasRes.error;

  const citasNorm = (citasRes.data || []).map(a => ({
    ...a,
    tipo_cita: 'alumno_existente',
    alumno_nombre: (a.alumnos as any)?.nombre_completo || 'Sin nombre',
    filial_nombre: (a.filiales as any)?.nombre || 'Sin sede'
  }));

  const entrevistasNorm = (entrevistasRes.data || []).map(a => ({
    ...a,
    alumno_nombre: (a.alumnos as any)?.nombre_completo || 'Sin nombre',
    filial_nombre: (a.filiales as any)?.nombre || 'Sin sede'
  }));

  return [...citasNorm, ...entrevistasNorm].sort((a: any, b: any) => {
    const timeA = a.creado_en ? new Date(a.creado_en).getTime() : 0;
    const timeB = b.creado_en ? new Date(b.creado_en).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return b.id - a.id;
  });
};

export const createCita = async (payload: Omit<Appointment, 'id' | 'created_at'>) => {
  const tabla = getTable(payload.tipo_cita);
  const fk = getFK(payload.tipo_cita);
  const { tipo_cita, ...dbPayload } = payload as any;
  return await supabase.from(tabla).insert([dbPayload]).select(`
    *,
    alumnos!${fk}_id_alumno_fkey (nombre_completo),
    filiales!${fk}_id_filial_fkey (nombre)
  `).single();
};

export const createCitasBulk = async (payloads: Omit<Appointment, 'id' | 'created_at'>[]) => {
  if (payloads.length === 0) return { data: [], error: null };
  const tipoCita = payloads[0].tipo_cita;
  const tabla = getTable(tipoCita);
  const fk = getFK(tipoCita);
  const dbPayloads = payloads.map(({ tipo_cita, ...rest }: any) => rest);
  return await supabase.from(tabla).insert(dbPayloads).select(`
    *,
    alumnos!${fk}_id_alumno_fkey (nombre_completo),
    filiales!${fk}_id_filial_fkey (nombre)
  `);
};

export const updateCitaEstado = async (id: number, status: AppointmentStatus, tipoCita?: string | null) => {
  const tabla = getTable(tipoCita);
  return await supabase.from(tabla).update({ estado: status }).eq('id', id).select();
};

export const updateCitaReprogramar = async (id: number, dateStr: string, time: string, status: AppointmentStatus, tipoCita?: string | null) => {
  const tabla = getTable(tipoCita);
  return await supabase.from(tabla).update({ fecha_cita: dateStr, hora_cita: time, estado: status }).eq('id', id);
};

export const updateCitaObservaciones = async (id: number, observaciones: string | null, tipoCita?: string | null) => {
  const tabla = getTable(tipoCita);
  return await supabase.from(tabla).update({ observaciones }).eq('id', id);
};

export const deleteCita = async (id: number, tipoCita?: string | null) => {
  const tabla = getTable(tipoCita);
  return await supabase.from(tabla).delete().eq('id', id);
};

// --- Entrevistas (Matrícula Nueva - Flujo B) ---

export const getEntrevistas = async () => {
  return await supabase.from('entrevistas').select(`
    *,
    alumnos!entrevistas_id_alumno_fkey (nombre_completo),
    filiales!entrevistas_id_filial_fkey (nombre)
  `).order('creado_en', { ascending: false });
};

export const createEntrevista = async (payload: Omit<Appointment, 'id' | 'created_at'>) => {
  return await supabase.from('entrevistas').insert([payload]).select(`
    *,
    alumnos!entrevistas_id_alumno_fkey (nombre_completo),
    filiales!entrevistas_id_filial_fkey (nombre)
  `).single();
};

export const createEntrevistasBulk = async (payloads: Omit<Appointment, 'id' | 'created_at'>[]) => {
  return await supabase.from('entrevistas').insert(payloads).select(`
    *,
    alumnos!entrevistas_id_alumno_fkey (nombre_completo),
    filiales!entrevistas_id_filial_fkey (nombre)
  `);
};

export const updateEntrevistaEstado = async (id: number, status: AppointmentStatus) => {
  return await supabase.from('entrevistas').update({ estado: status }).eq('id', id).select();
};

export const updateEntrevistaReprogramar = async (id: number, dateStr: string, time: string, status: AppointmentStatus) => {
  return await supabase.from('entrevistas').update({ fecha_cita: dateStr, hora_cita: time, estado: status }).eq('id', id);
};

export const updateEntrevistaObservaciones = async (id: number, observaciones: string | null) => {
  return await supabase.from('entrevistas').update({ observaciones }).eq('id', id);
};

export const deleteEntrevista = async (id: number) => {
  return await supabase.from('entrevistas').delete().eq('id', id);
};
