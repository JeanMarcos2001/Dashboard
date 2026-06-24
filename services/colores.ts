import { supabase } from '@/config/supabase';
import { ColorCorporativo } from '@/types';

export const getColoresCorporativos = async () => {
  return await supabase.from('colores_corporativos').select('*').eq('activo', true).order('nombre', { ascending: true });
};

export const createColorCorporativo = async (payload: Omit<ColorCorporativo, 'id'>) => {
  return await supabase.from('colores_corporativos').insert([payload]).select().single();
};

export const updateColorCorporativo = async (id: number, payload: Partial<ColorCorporativo>) => {
  return await supabase.from('colores_corporativos').update(payload).eq('id', id);
};

export const deleteColorCorporativo = async (id: number) => {
  return await supabase.from('colores_corporativos').delete().eq('id', id);
};

export const checkColorInUse = async (colorId: number) => {
  return await supabase.from('historias_transformacion').select('id').eq('id_color', colorId).limit(1);
};
