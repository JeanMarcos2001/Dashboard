import { supabase } from '@/config/supabase';
import { MensajeWsp } from '@/types';

export const getMensajesWsp = async () => {
  return await supabase.from('mensajes_wsp').select('*').order('created_at', { ascending: false });
};

export const createMensajeWsp = async (payload: Omit<MensajeWsp, 'id' | 'created_at'>) => {
  return await supabase.from('mensajes_wsp').insert([payload]).select().single();
};

export const updateMensajeWsp = async (id: number, payload: Partial<MensajeWsp>) => {
  return await supabase.from('mensajes_wsp').update(payload).eq('id', id);
};

export const deleteMensajeWsp = async (id: number) => {
  return await supabase.from('mensajes_wsp').delete().eq('id', id);
};

export const disassociateMensajeFromFiliales = async (removedIds: number[]) => {
  return await supabase.from('filiales').update({ id_mensaje_wsp: null }).in('id', removedIds);
};

export const associateMensajeWithFiliales = async (msgId: number, newIds: number[]) => {
  return await supabase.from('filiales').update({ id_mensaje_wsp: msgId }).in('id', newIds);
};
