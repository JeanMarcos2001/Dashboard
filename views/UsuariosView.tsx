import React, { useState, useEffect } from 'react';
import { Plus, UserCheck, UserX, MapPin, Loader2, AlertCircle, ShieldCheck, Building2 } from 'lucide-react';
import type { PerfilUsuario, Filial } from '../types';
import { getUsuarios, crearUsuarioSede, desactivarUsuario, reactivarUsuario } from '../services/auth';

interface UsuariosViewProps {
  filiales: Filial[];
}

/**
 * Vista de gestión de usuarios.
 * Solo accesible para rol 'administrador'.
 * Permite crear usuarios de sede (un usuario por filial), activarlos/desactivarlos.
 */
export const UsuariosView: React.FC<UsuariosViewProps> = ({ filiales }) => {
  const [usuarios, setUsuarios] = useState<PerfilUsuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulario de creación
  const [showForm, setShowForm] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formFilialId, setFormFilialId] = useState<number | ''>('');
  const [creando, setCreando] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const cargarUsuarios = async () => {
    setLoadingUsuarios(true);
    const { data, error } = await getUsuarios();
    if (error) setErrorMsg('Error al cargar los usuarios: ' + error.message);
    else setUsuarios(data);
    setLoadingUsuarios(false);
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formFilialId) { setFormError('Selecciona una filial.'); return; }
    if (formPassword.length < 8) { setFormError('La contraseña debe tener al menos 8 caracteres.'); return; }

    setCreando(true);
    const { error } = await crearUsuarioSede(formEmail.trim(), formPassword, Number(formFilialId), formNombre.trim());
    setCreando(false);

    if (error) {
      setFormError(error.message || 'Error al crear el usuario.');
    } else {
      setShowForm(false);
      setFormEmail(''); setFormPassword(''); setFormNombre(''); setFormFilialId('');
      await cargarUsuarios();
    }
  };

  const toggleActivo = async (u: PerfilUsuario) => {
    if (u.activo) {
      await desactivarUsuario(u.id);
    } else {
      await reactivarUsuario(u.id);
    }
    setUsuarios(prev => prev.map(p => p.id === u.id ? { ...p, activo: !u.activo } : p));
  };

  const filialNombre = (idFilial: number | null) =>
    idFilial ? (filiales.find(f => f.id === idFilial)?.nombre ?? `Filial #${idFilial}`) : '—';

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h3>
            <p className="text-sm text-slate-400 mt-0.5">Crea y administra accesos por sede</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setFormError(null); }}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100/50"
          >
            <Plus size={18} /> Nuevo Usuario
          </button>
        </div>

        {/* Formulario de creación */}
        {showForm && (
          <div className="p-6 bg-slate-50 border-b border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" /> Crear usuario de sede
            </h4>
            <form onSubmit={handleCrearUsuario} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nombre para mostrar
                </label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={e => setFormNombre(e.target.value)}
                  placeholder="Ej. Recepción Norte"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Filial asignada
                </label>
                <select
                  value={formFilialId}
                  onChange={e => setFormFilialId(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="">Selecciona una filial...</option>
                  {filiales.filter(f => f.activo).map(f => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="sede@ejemplo.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Contraseña temporal (mín. 8 caracteres)
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              {formError && (
                <div className="md:col-span-2 flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200/60 rounded-xl text-rose-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{formError}</p>
                </div>
              )}

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={creando}
                  className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl shadow-md shadow-emerald-100/50 hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {creando ? <><Loader2 size={16} className="animate-spin" /> Creando...</> : 'Crear usuario'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormError(null); }}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla de usuarios */}
        {loadingUsuarios ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={24} className="animate-spin mr-3" /> Cargando usuarios...
          </div>
        ) : errorMsg ? (
          <div className="flex items-center justify-center py-12 text-rose-500 gap-2">
            <AlertCircle size={20} /> {errorMsg}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Usuario</th>
                  <th className="px-6 py-4 text-left">Rol</th>
                  <th className="px-6 py-4 text-left">Filial Asignada</th>
                  <th className="px-6 py-4 text-left">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                      No hay usuarios registrados aún.
                    </td>
                  </tr>
                ) : usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          u.rol === 'administrador' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {u.nombre_display?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">{u.nombre_display}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide ${
                        u.rol === 'administrador'
                          ? 'bg-violet-50 text-violet-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {u.rol === 'administrador' ? <ShieldCheck size={12} /> : <Building2 size={12} />}
                        {u.rol === 'administrador' ? 'Administrador' : 'Sede'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                        <MapPin size={14} className="text-slate-400" />
                        {filialNombre(u.id_filial)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        u.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* No se puede desactivar al administrador */}
                      {u.rol !== 'administrador' && (
                        <button
                          onClick={() => toggleActivo(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.activo
                              ? 'text-amber-500 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.activo ? 'Desactivar usuario' : 'Reactivar usuario'}
                        >
                          {u.activo ? <UserX size={18} /> : <UserCheck size={18} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
