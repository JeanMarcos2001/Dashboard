import { supabase } from '@/config/supabase';
import { Appointment, AppointmentStatus } from '@/types';

export const getCitas = async () => {
  return await supabase.from('citas').select(`
    *,
    alumnos!citas_id_alumno_fkey (nombre_completo),
    filiales!citas_id_filial_fkey (nombre)
  `).order('creado_en', { ascending: false });
};

export const createCita = async (payload: Omit<Appointment, 'id' | 'created_at'>) => {
  return await supabase.from('citas').insert([payload]).select(`
    *,
    alumnos!citas_id_alumno_fkey (nombre_completo),
    filiales!citas_id_filial_fkey (nombre)
  `).single();
};

export const createCitasBulk = async (payloads: Omit<Appointment, 'id' | 'created_at'>[]) => {
  return await supabase.from('citas').insert(payloads).select(`
    *,
    alumnos!citas_id_alumno_fkey (nombre_completo),
    filiales!citas_id_filial_fkey (nombre)
  `);
};

export const updateCitaEstado = async (id: number, status: AppointmentStatus) => {
  return await supabase.from('citas').update({ estado: status }).eq('id', id).select();
};

export const updateCitaReprogramar = async (id: number, dateStr: string, time: string, status: AppointmentStatus) => {
  return await supabase.from('citas').update({ fecha_cita: dateStr, hora_cita: time, estado: status }).eq('id', id);
};

export const updateCitaObservaciones = async (id: number, observaciones: string | null) => {
  return await supabase.from('citas').update({ observaciones }).eq('id', id);
};

export const deleteCita = async (id: number) => {
  return await supabase.from('citas').delete().eq('id', id);
};
