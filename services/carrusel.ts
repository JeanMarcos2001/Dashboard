import { supabase } from '@/config/supabase';
import { Carrusel02Imagen } from '@/types';

export const getCarruselImagenes = async () => {
  return await supabase.from('carrusel_02_imagenes').select('*').order('orden', { ascending: true });
};

export const createCarruselImagen = async (payload: Omit<Carrusel02Imagen, 'id' | 'created_at'>) => {
  return await supabase.from('carrusel_02_imagenes').insert([payload]).select().single();
};

export const deleteCarruselImagen = async (id: number) => {
  return await supabase.from('carrusel_02_imagenes').delete().eq('id', id);
};

export const updateCarruselImagen = async (id: number, payload: Partial<Carrusel02Imagen>) => {
  return await supabase.from('carrusel_02_imagenes').update(payload).eq('id', id);
};

export const uploadCarruselFoto = async (fileName: string, file: Blob | File) => {
  return await supabase.storage.from('carrusel_02').upload(fileName, file, { upsert: false, contentType: 'image/webp' });
};

export const removeCarruselFotos = async (paths: string[]) => {
  return await supabase.storage.from('carrusel_02').remove(paths);
};

export const getCarruselFotoPublicUrl = (file_path: string) => {
  return supabase.storage.from('carrusel_02').getPublicUrl(file_path).data.publicUrl;
};
