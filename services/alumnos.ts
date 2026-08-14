import { supabase } from '@/config/supabase';
import { Alumno } from '@/types';

export const getAlumnos = async () => {
  return await supabase.from('alumnos').select('*').order('creado_en', { ascending: false });
};

export const createAlumno = async (payload: Omit<Alumno, 'id' | 'created_at'>) => {
  return await supabase.from('alumnos').insert([payload]).select().single();
};

export const createAlumnosBulk = async (payloads: Omit<Alumno, 'id' | 'created_at'>[]) => {
  return await supabase.from('alumnos').insert(payloads).select();
};

export const deleteAlumno = async (id: number) => {
  return await supabase.from('alumnos').delete().eq('id', id);
};
