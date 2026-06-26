import React from 'react';
import { Plus, Trash2, Phone, Mail } from 'lucide-react';
import { Alumno } from '../types';

interface AlumnosViewProps {
  alumnos: Alumno[];
  searchTerm: string;
  setEditingItem: (item: any) => void;
  setIsModalOpen: (open: boolean) => void;
  handleDeleteAlumno: (id: number) => void;
}

export const AlumnosView: React.FC<AlumnosViewProps> = ({
  alumnos,
  searchTerm,
  setEditingItem,
  setIsModalOpen,
  handleDeleteAlumno,
}) => {
  const sorted = [...alumnos].sort((a, b) => {
    const timeA = a.creado_en ? new Date(a.creado_en).getTime() : 0;
    const timeB = b.creado_en ? new Date(b.creado_en).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return b.id - a.id;
  });
  const filtered = sorted.filter(al => al.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-slate-200">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <h3 className="text-xl font-bold text-slate-800">Directorio de Alumnos</h3>
        <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100/50">
          <Plus size={18} /> Nuevo Alumno
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left">Nombre Completo</th>
              <th className="px-6 py-4 text-left">Edad</th>
              <th className="px-6 py-4 text-left">Contacto</th>
              <th className="px-6 py-4 text-left">Registro</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.map(al => (
              <tr key={al.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">{al.nombre_completo[0]}</div>
                    <span className="font-normal text-slate-800">{al.nombre_completo}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{al.edad} años</td>
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {al.telefono || al.email ? (
                    <div className="space-y-1">
                      {al.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" />
                          {al.telefono}
                        </div>
                      )}
                      {al.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail size={12} className="text-slate-400" />
                          {al.email}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-300 font-bold">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 font-bold uppercase">{al.creado_en ? new Date(al.creado_en).toLocaleString('es-PE') : '—'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDeleteAlumno(al.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
