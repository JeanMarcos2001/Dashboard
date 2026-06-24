import React from 'react';
import { Plus, Trash2, Phone, Mail } from 'lucide-react';
import { Apoderado } from '../types';

interface ApoderadosViewProps {
  apoderados: Apoderado[];
  searchTerm: string;
  setEditingItem: (item: any) => void;
  setIsModalOpen: (open: boolean) => void;
  handleDeleteApoderado: (id: number) => void;
}

export const ApoderadosView: React.FC<ApoderadosViewProps> = ({
  apoderados,
  searchTerm,
  setEditingItem,
  setIsModalOpen,
  handleDeleteApoderado,
}) => {
  const sorted = [...apoderados].sort((a, b) => {
    const timeA = a.creado_en ? new Date(a.creado_en).getTime() : 0;
    const timeB = b.creado_en ? new Date(b.creado_en).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return b.id - a.id;
  });
  const filtered = sorted.filter(ap => ap.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-slate-200">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <h3 className="text-xl font-bold text-slate-800">Directorio de Apoderados</h3>
        <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
          <Plus size={18} /> Nuevo Apoderado
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left">Nombre Completo</th>
              <th className="px-6 py-4 text-left">Contacto</th>
              <th className="px-6 py-4 text-left">Registro</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.map(ap => (
              <tr key={ap.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">{ap.nombre_completo[0]}</div>
                    <span className="font-bold text-slate-800">{ap.nombre_completo}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      {ap.telefono}
                    </div>
                    {ap.email && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail size={12} className="text-slate-400" />
                        {ap.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 font-bold uppercase">{ap.creado_en ? new Date(ap.creado_en).toLocaleString('es-PE') : '—'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDeleteApoderado(ap.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold italic">No hay apoderados registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
