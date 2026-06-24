import { supabase } from '@/config/supabase';
import { Apoderado } from '@/types';

export const getApoderados = async () => {
  return await supabase.from('apoderados').select('*').order('creado_en', { ascending: false });
};

export const createApoderado = async (payload: Omit<Apoderado, 'id' | 'created_at'>) => {
  return await supabase.from('apoderados').insert([payload]).select().single();
};

export const deleteApoderado = async (id: number) => {
  return await supabase.from('apoderados').delete().eq('id', id);
};
