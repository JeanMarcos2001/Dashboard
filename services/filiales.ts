import { supabase } from '@/config/supabase';
import { Filial } from '@/types';

export const getFiliales = async () => {
  return await supabase.from('filiales').select('*').order('nombre', { ascending: true });
};

export const createFilial = async (payload: Omit<Filial, 'id' | 'created_at'>) => {
  return await supabase.from('filiales').insert([payload]).select().single();
};

export const updateFilial = async (id: number, payload: Partial<Filial>) => {
  return await supabase.from('filiales').update(payload).eq('id', id).select().single();
};

export const updateFilialStatus = async (id: number, active: boolean) => {
  return await supabase.from('filiales').update({ activo: active }).eq('id', id);
};

export const deleteFilial = async (id: number) => {
  return await supabase.from('filiales').delete().eq('id', id);
};

export const uploadFilialFoto = async (fileName: string, file: File) => {
  return await supabase.storage.from('Filiales').upload(fileName, file);
};

export const getFilialFotoPublicUrl = (fileName: string) => {
  return supabase.storage.from('Filiales').getPublicUrl(fileName).data.publicUrl;
};
