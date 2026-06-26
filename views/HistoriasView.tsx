import React from 'react';
import {
  Plus, Edit, Trash2, Palette, ImageIcon, CheckCircle, Save, Loader2, Sparkles, X
} from 'lucide-react';
import { Historia, ColorCorporativo } from '../types';

interface HistoriasViewProps {
  historias: Historia[];
  coloresCorporativos: ColorCorporativo[];
  searchTerm: string;
  getFotoUrl: (foto_path: string | null) => string | null;
  handleToggleHistoriaActiva: (h: Historia) => void;
  handleDeleteHistoria: (h: Historia) => void;
  openHistoriaModal: (h: Historia | null) => void;
  setIsColorManagerOpen: (open: boolean) => void;
  // Historia modal
  isHistoriaModalOpen: boolean;
  setIsHistoriaModalOpen: (open: boolean) => void;
  editingHistoria: Historia | null;
  historiaFotoPreview: string | null;
  setHistoriaFotoPreview: (v: string | null) => void;
  historiaFotoFile: File | null;
  setHistoriaFotoFile: (f: File | null) => void;
  historiaColorSeleccionado: number | null;
  setHistoriaColorSeleccionado: (id: number | null) => void;
  uploadingFoto: boolean;
  handleSaveHistoria: (ev: React.FormEvent<HTMLFormElement>) => void;
  isAjusteOpen: boolean;
  setIsAjusteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  ajustePosX: number;
  setAjustePosX: (v: number) => void;
  ajustePosY: number;
  setAjustePosY: (v: number) => void;
  ajusteScale: number;
  setAjusteScale: (v: number) => void;
  // Color manager modal
  isColorManagerOpen: boolean;
  editingColor: ColorCorporativo | null;
  colorFormNombre: string;
  setColorFormNombre: (v: string) => void;
  colorFormHex: string;
  setColorFormHex: (v: string) => void;
  colorFormClaseCss: string;
  setColorFormClaseCss: (v: string) => void;
  openColorModal: (c: ColorCorporativo | null) => void;
  handleSaveColor: (e: React.FormEvent) => void;
  handleDeleteColor: (c: ColorCorporativo) => void;
}

export const HistoriasView: React.FC<HistoriasViewProps> = ({
  historias,
  coloresCorporativos,
  searchTerm,
  getFotoUrl,
  handleToggleHistoriaActiva,
  handleDeleteHistoria,
  openHistoriaModal,
  setIsColorManagerOpen,
  isHistoriaModalOpen,
  setIsHistoriaModalOpen,
  editingHistoria,
  historiaFotoPreview,
  setHistoriaFotoPreview,
  historiaFotoFile,
  setHistoriaFotoFile,
  historiaColorSeleccionado,
  setHistoriaColorSeleccionado,
  uploadingFoto,
  handleSaveHistoria,
  isAjusteOpen,
  setIsAjusteOpen,
  ajustePosX,
  setAjustePosX,
  ajustePosY,
  setAjustePosY,
  ajusteScale,
  setAjusteScale,
  isColorManagerOpen,
  editingColor,
  colorFormNombre,
  setColorFormNombre,
  colorFormHex,
  setColorFormHex,
  colorFormClaseCss,
  setColorFormClaseCss,
  openColorModal,
  handleSaveColor,
  handleDeleteColor,
}) => {
  const filtered = historias.filter(h => h.nombre_alumno.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderHistoriaModal = () => {
    if (!isHistoriaModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
            <h3 className="text-xl font-bold text-slate-800">{editingHistoria ? 'Editar Historia' : 'Nueva Historia de Transformaci&#243;n'}</h3>
            <button onClick={() => setIsHistoriaModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
          </div>
          <div className="p-6 overflow-y-auto">
            <form onSubmit={handleSaveHistoria} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Nombre del Alumno</label>
                <input name="nombre_alumno" required defaultValue={editingHistoria?.nombre_alumno} className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="Ej. Mar&#237;a L&#243;pez" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Programa</label>
                <select name="programa" required defaultValue={editingHistoria?.programa ?? ''} className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm">
                  <option value="">Seleccionar...</option>
                  <option>Profesional</option>
                  <option>Kids</option>
                  <option>PreKids</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Narraci&#243;n / Testimonio <span className="text-slate-300 font-medium normal-case">(m&#225;x. 300 car.)</span></label>
                <textarea name="narracion" required maxLength={300} defaultValue={editingHistoria?.narracion} rows={4} className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm resize-none" placeholder="Testimonio del alumno..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Palabras por Minuto</label>
                  <input name="palabras_por_min" required defaultValue={editingHistoria?.palabras_por_min} className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="e.g. 1,200 ppm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Orden en Carrusel</label>
                  <input name="orden" type="number" min={0} defaultValue={editingHistoria?.orden ?? 0} className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" />
                </div>
              </div>
              {coloresCorporativos.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Color de Fondo</label>
                  <div className="flex flex-wrap gap-3">
                    {coloresCorporativos.map(c => (
                      <button key={c.id} type="button" onClick={() => setHistoriaColorSeleccionado(c.id)} title={c.nombre}
                        className={'w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ' + (historiaColorSeleccionado === c.id ? 'border-slate-700 scale-110' : 'border-white hover:scale-105')}
                        style={{ backgroundColor: c.hex }}>
                        {historiaColorSeleccionado === c.id && <CheckCircle size={16} className="text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                  {historiaColorSeleccionado && <p className="text-xs text-slate-400 mt-1.5 font-medium">{coloresCorporativos.find(c => c.id === historiaColorSeleccionado)?.nombre}</p>}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Foto del Alumno</label>
                {/* File input + Ajustar button */}
                <div className="flex items-center gap-2 mb-3">
                  <input type="file" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setHistoriaFotoFile(f); setHistoriaFotoPreview(URL.createObjectURL(f)); setAjustePosX(50); setAjustePosY(50); setAjusteScale(1.0); setIsAjusteOpen(false); }
                  }} className="flex-1 text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
                  {historiaFotoPreview && (
                    <button type="button" onClick={() => setIsAjusteOpen(v => !v)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${isAjusteOpen ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                      {isAjusteOpen ? 'Cerrar' : '✦ Ajustar'}
                    </button>
                  )}
                </div>
                {/* Static preview when adjuster closed */}
                {historiaFotoPreview && !isAjusteOpen && (
                  <div className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm" style={{ aspectRatio: '3/2' }}>
                    <img src={historiaFotoPreview} alt="Preview" draggable={false} className="w-full h-full"
                      style={{ objectFit: 'cover', objectPosition: `${ajustePosX}% ${ajustePosY}%`, transform: `scale(${ajusteScale})`, transformOrigin: `${ajustePosX}% ${ajustePosY}%` }} />
                  </div>
                )}
                {/* Interactive adjuster */}
                {historiaFotoPreview && isAjusteOpen && (
                  <div className="rounded-2xl border-2 border-slate-800 overflow-hidden shadow-xl">
                    <div className="relative w-full select-none cursor-crosshair" style={{ aspectRatio: '3/2', overflow: 'hidden', background: '#0f172a' }}
                      onMouseMove={(e) => { if (e.buttons !== 1) return; const r = e.currentTarget.getBoundingClientRect(); setAjustePosX(Math.round(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)))); setAjustePosY(Math.round(Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)))); }}
                      onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; const r = e.currentTarget.getBoundingClientRect(); setAjustePosX(Math.round(Math.max(0, Math.min(100, ((t.clientX - r.left) / r.width) * 100)))); setAjustePosY(Math.round(Math.max(0, Math.min(100, ((t.clientY - r.top) / r.height) * 100)))); }}
                    >
                      <img src={historiaFotoPreview} alt="Ajustar" draggable={false} className="w-full h-full pointer-events-none"
                        style={{ objectFit: 'cover', objectPosition: `${ajustePosX}% ${ajustePosY}%`, transform: `scale(${ajusteScale})`, transformOrigin: `${ajustePosX}% ${ajustePosY}%`, transition: 'transform 0.1s ease' }} />
                      <div className="pointer-events-none absolute" style={{ left: `calc(${ajustePosX}% - 12px)`, top: `calc(${ajustePosY}% - 12px)` }}>
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow-lg" />
                      </div>
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-sm">3 : 2</div>
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-[13px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">{ajustePosX}% · {ajustePosY}%</div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white/70 text-[12px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">Arrastra para mover el enfoque</div>
                    </div>
                    <div className="bg-slate-900 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-white/60 text-xs font-semibold uppercase tracking-wider w-12">Zoom</span>
                        <input type="range" min="1" max="2.5" step="0.05" value={ajusteScale} onChange={(e) => setAjusteScale(parseFloat(e.target.value))} className="flex-1 accent-emerald-400 cursor-pointer" />
                        <span className="text-white/80 text-xs font-semibold w-10 text-right">{ajusteScale.toFixed(2)}x</span>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setAjustePosX(50); setAjustePosY(50); setAjusteScale(1.0); }}
                          className="flex-1 py-2 text-xs font-bold text-white/60 hover:text-white border border-white/10 rounded-xl transition-colors">Restablecer</button>
                        <button type="button" onClick={() => setIsAjusteOpen(false)}
                          className="flex-1 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-colors">✓ Guardar ajuste</button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Placeholder when no photo */}
                {!historiaFotoPreview && (
                  <div className="w-full rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-2" style={{ aspectRatio: '3/2' }}>
                    <ImageIcon size={28} /><span className="text-xs font-bold">Sin foto seleccionada</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 py-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input name="activo" type="checkbox" defaultChecked={editingHistoria?.activo ?? true} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                </label>
                <span className="text-sm font-bold text-slate-700">Visible en carrusel p&#250;blico</span>
              </div>
              <button type="submit" disabled={uploadingFoto} className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:bg-emerald-700 transition-all uppercase tracking-wider text-xs mt-2 disabled:opacity-60 flex items-center justify-center gap-2">
                {uploadingFoto ? <><Loader2 size={16} className="animate-spin" /> Subiendo foto...</> : <><Sparkles size={16} /> {editingHistoria ? 'Guardar Cambios' : 'Crear Historia'}</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderColorManagerModal = () => {
    if (!isColorManagerOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Gestionar Colores</h3>
              <p className="text-xs text-slate-400 mt-0.5">Añade o edita los colores corporativos para testimonios</p>
            </div>
            <button onClick={() => { setIsColorManagerOpen(false); openColorModal(null); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* Lista de colores */}
            <div className="flex-1 border-r border-slate-100 overflow-y-auto p-6 bg-slate-50/30 min-h-[300px]">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Colores Existentes</h4>
              <div className="space-y-2">
                {coloresCorporativos.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: c.hex }}></div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{c.nombre}</p>
                        <p className="text-[13px] text-slate-400 font-mono">{c.hex}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openColorModal(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Editar color">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteColor(c)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar color">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {coloresCorporativos.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4 font-bold">No hay colores registrados</p>
                )}
              </div>
            </div>

            {/* Formulario */}
            <div className="w-full md:w-72 p-6 overflow-y-auto">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {editingColor ? 'Editar Color' : 'Añadir Nuevo Color'}
              </h4>
              <form onSubmit={handleSaveColor} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Nombre (ej. Esmeralda)</label>
                  <input
                    required
                    value={colorFormNombre}
                    onChange={e => setColorFormNombre(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 text-sm shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Color Hexadecimal</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      required
                      value={colorFormHex}
                      onChange={e => setColorFormHex(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      required
                      value={colorFormHex}
                      onChange={e => setColorFormHex(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800 text-sm shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Clase CSS (Tailwind) Opcional</label>
                  <input
                    value={colorFormClaseCss}
                    onChange={e => setColorFormClaseCss(e.target.value)}
                    placeholder="bg-emerald-500"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800 text-sm shadow-sm"
                  />
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                  {editingColor && (
                    <button type="button" onClick={() => openColorModal(null)} className="flex-1 py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all text-sm">
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className="flex-1 py-2.5 rounded-xl font-semibold bg-emerald-600 text-white shadow-md shadow-emerald-100/50 hover:bg-emerald-700 transition-all text-sm flex items-center justify-center gap-2">
                    <Save size={16} /> {editingColor ? 'Actualizar' : 'Añadir'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Historias de Transformaci&#243;n</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Testimonios del carrusel p&#250;blico</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsColorManagerOpen(true)} className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                <Palette size={18} className="text-emerald-500" /> Gestionar Colores
              </button>
              <button onClick={() => openHistoriaModal(null)} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100/50">
                <Plus size={18} /> Nueva Historia
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left">Previa</th>
                  <th className="px-6 py-4 text-left">Alumno</th>
                  <th className="px-6 py-4 text-left">Programa</th>
                  <th className="px-6 py-4 text-left">PPM</th>
                  <th className="px-6 py-4 text-left">Color</th>
                  <th className="px-6 py-4 text-center">Orden</th>
                  <th className="px-6 py-4 text-center">Activo</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.length > 0 ? filtered.map(h => {
                  const color = coloresCorporativos.find(c => c.id === h.id_color);
                  const fotoUrl = getFotoUrl(h.foto_path);
                  return (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {fotoUrl ? (
                          <img src={fotoUrl} alt={h.nombre_alumno} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{h.nombre_alumno}</p>
                        <p className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate">{h.narracion}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={'px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ' + (h.programa === 'Profesional' ? 'bg-purple-50 text-purple-600 border-purple-100' : h.programa === 'Kids' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100')}>
                          {h.programa}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 text-sm">{h.palabras_por_min}</td>
                      <td className="px-6 py-4">
                        {color ? (
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border border-slate-200 shadow-sm flex-shrink-0" style={{ backgroundColor: color.hex }} />
                            <span className="text-xs text-slate-500 font-medium truncate max-w-[80px]">{color.nombre}</span>
                          </div>
                        ) : <span className="text-slate-300 text-xs">&mdash;</span>}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-700">{h.orden}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleToggleHistoriaActiva(h)} className={'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ' + (h.activo ? 'bg-emerald-500' : 'bg-slate-200')}>
                          <span className={'inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ' + (h.activo ? 'translate-x-6' : 'translate-x-1')} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openHistoriaModal(h)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteHistoria(h)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={8} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No hay historias registradas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {renderHistoriaModal()}
      {renderColorManagerModal()}
    </>
  );
};
