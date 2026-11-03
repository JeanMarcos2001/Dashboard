import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Save } from 'lucide-react';
import { Modal } from './Modal';
import type { PerfilUsuario, Filial, DatosEdicionUsuario } from '../types';

interface EditarUsuarioModalProps {
  usuario: PerfilUsuario | null;
  filiales: Filial[];
  onClose: () => void;
  /** Devuelve el mensaje de error, o null si se guardó correctamente. */
  onGuardar: (datos: DatosEdicionUsuario) => Promise<string | null>;
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all';
const labelClass = 'block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5';

export const EditarUsuarioModal: React.FC<EditarUsuarioModalProps> = ({ usuario, filiales, onClose, onGuardar }) => {
  const [nombre, setNombre] = useState('');
  const [filialId, setFilialId] = useState<number | ''>('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cada vez que se abre con otro usuario, el formulario parte de sus datos actuales
  useEffect(() => {
    setNombre(usuario?.nombre_display ?? '');
    setFilialId(usuario?.id_filial ?? '');
    setError(null);
    setGuardando(false);
  }, [usuario]);

  if (!usuario) return null;

  const nombreLimpio = nombre.trim();
  const sinCambios = nombreLimpio === usuario.nombre_display && filialId === usuario.id_filial;
  const invalido = !nombreLimpio || filialId === '';

  // Filiales activas, más la actual del usuario aunque esté inactiva para no perder su valor
  const opciones = filiales.filter(f => f.activo || f.id === usuario.id_filial);

  const cerrar = () => { if (!guardando) onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalido || sinCambios || guardando) return;
    setError(null);
    setGuardando(true);
    const mensaje = await onGuardar({ nombre_display: nombreLimpio, id_filial: Number(filialId) });
    setGuardando(false);
    if (mensaje) setError(mensaje);
  };

  return (
    <Modal
      isOpen
      onClose={cerrar}
      title="Editar usuario"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={cerrar}
            disabled={guardando}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-all disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="editar-usuario-form"
            disabled={invalido || sinCambios || guardando}
            className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl shadow-md shadow-emerald-100/50 hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> Guardar cambios</>}
          </button>
        </div>
      }
    >
      <form id="editar-usuario-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="editar-usuario-nombre" className={labelClass}>Nombre de la sede</label>
          <input
            id="editar-usuario-nombre"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej. Recepción Norte"
            maxLength={80}
            required
            autoFocus
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="editar-usuario-filial" className={labelClass}>Sede base</label>
          <select
            id="editar-usuario-filial"
            value={filialId}
            onChange={e => setFilialId(e.target.value ? Number(e.target.value) : '')}
            required
            className={inputClass}
          >
            <option value="">Selecciona una filial...</option>
            {opciones.map(f => (
              <option key={f.id} value={f.id}>{f.nombre}{f.activo ? '' : ' (inactiva)'}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1.5">
            El usuario verá solo los datos de esta sede. El cambio se aplica a sus consultas de inmediato; en su pantalla se refleja al recargar.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200/60 rounded-xl text-rose-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </form>
    </Modal>
  );
};
