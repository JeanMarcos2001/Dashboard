import { supabase } from '@/config/supabase';
import { Historia } from '@/types';

export const getHistorias = async () => {
  return await supabase.from('historias_transformacion').select('*').order('orden', { ascending: true });
};

export const createHistoria = async (payload: Omit<Historia, 'id' | 'created_at'>) => {
  return await supabase.from('historias_transformacion').insert([payload]).select().single();
};

export const updateHistoria = async (id: number, payload: Partial<Historia>) => {
  return await supabase.from('historias_transformacion').update(payload).eq('id', id);
};

export const deleteHistoria = async (id: number) => {
  return await supabase.from('historias_transformacion').delete().eq('id', id);
};

export const uploadHistoriaFoto = async (fileName: string, file: Blob | File) => {
  return await supabase.storage.from('Testimonios').upload(fileName, file, { upsert: true, contentType: 'image/webp' });
};
