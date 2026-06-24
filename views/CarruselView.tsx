import React from 'react';
import { Upload, GripVertical, Edit, Trash2, ImageIcon, Loader2, X } from 'lucide-react';
import { Carrusel02Imagen } from '../types';

interface CarruselViewProps {
  carrusel02: Carrusel02Imagen[];
  getCarrusel02Url: (file_path: string) => string;
  openCarrusel02Modal: (img: Carrusel02Imagen | null) => void;
  handleCarrusel02Delete: (img: Carrusel02Imagen) => void;
  handleCarrusel02ToggleActivo: (img: Carrusel02Imagen) => void;
  handleCarrusel02DragStart: (index: number, e: React.DragEvent) => void;
  handleCarrusel02DragOver: (index: number, e: React.DragEvent) => void;
  handleCarrusel02Drop: (dropIndex: number, e: React.DragEvent) => void;
  setCarrusel02DragOver: (index: number | null) => void;
  carrusel02DragRef: React.MutableRefObject<number | null>;
  carrusel02DragOver: number | null;
  // Modal
  isCarrusel02ModalOpen: boolean;
  setIsCarrusel02ModalOpen: (open: boolean) => void;
  carrusel02Editing: Carrusel02Imagen | null;
  carrusel02File: File | null;
  setCarrusel02File: (f: File | null) => void;
  carrusel02Preview: string | null;
  setCarrusel02Preview: (v: string | null) => void;
  carrusel02Uploading: boolean;
  carrusel02FileInputRef: React.RefObject<HTMLInputElement>;
  isCarrusel02AjusteOpen: boolean;
  setIsCarrusel02AjusteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  carrusel02PosX: number;
  setCarrusel02PosX: (v: number) => void;
  carrusel02PosY: number;
  setCarrusel02PosY: (v: number) => void;
  carrusel02Scale: number;
  setCarrusel02Scale: (v: number) => void;
  handleCarrusel02Save: (ev: React.FormEvent<HTMLFormElement>) => void;
}

export const CarruselView: React.FC<CarruselViewProps> = ({
  carrusel02,
  getCarrusel02Url,
  openCarrusel02Modal,
  handleCarrusel02Delete,
  handleCarrusel02ToggleActivo,
  handleCarrusel02DragStart,
  handleCarrusel02DragOver,
  handleCarrusel02Drop,
  setCarrusel02DragOver,
  carrusel02DragRef,
  carrusel02DragOver,
  isCarrusel02ModalOpen,
  setIsCarrusel02ModalOpen,
  carrusel02Editing,
  carrusel02File,
  setCarrusel02File,
  carrusel02Preview,
  setCarrusel02Preview,
  carrusel02Uploading,
  carrusel02FileInputRef,
  isCarrusel02AjusteOpen,
  setIsCarrusel02AjusteOpen,
  carrusel02PosX,
  setCarrusel02PosX,
  carrusel02PosY,
  setCarrusel02PosY,
  carrusel02Scale,
  setCarrusel02Scale,
  handleCarrusel02Save,
}) => {
  const isEditing = !!carrusel02Editing;
  const hasNewFile = !!carrusel02File;

  const clearSelectedFile = () => {
    setCarrusel02File(null);
    setIsCarrusel02AjusteOpen(false);
    setCarrusel02Preview(carrusel02Editing ? getCarrusel02Url(carrusel02Editing.file_path) : null);
    if (carrusel02Editing?.foto_position) {
      const parts = carrusel02Editing.foto_position.split(' ');
      setCarrusel02PosX(parseFloat(parts[0]) || 50);
      setCarrusel02PosY(parseFloat(parts[1]) || 50);
    } else { setCarrusel02PosX(50); setCarrusel02PosY(50); }
    setCarrusel02Scale(carrusel02Editing?.foto_scale ?? 1.0);
    if (carrusel02FileInputRef.current) carrusel02FileInputRef.current.value = '';
  };

  const renderCarrusel02Modal = () => {
    if (!isCarrusel02ModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {isEditing ? 'Editar Imagen' : 'Agregar Imagen al Carrusel 02'}
              </h3>
              {isEditing && <p className="text-xs text-slate-400 mt-0.5">Deja el campo de archivo vacío para conservar la imagen actual.</p>}
            </div>
            <button onClick={() => setIsCarrusel02ModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <form onSubmit={handleCarrusel02Save} className="space-y-5">

              {/* Nombre */}
              <div>
                <label className="block text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Etiqueta descriptiva</label>
                <input
                  name="nombre"
                  defaultValue={carrusel02Editing?.nombre ?? ''}
                  placeholder='Ej. "Demostración Lima Mayo 2025"'
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm"
                />
              </div>

              {/* File input + botón Ajustar */}
              <div>
                <label className="block text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  {isEditing ? 'Nueva Imagen (opcional — reemplaza la actual)' : 'Imagen *'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={carrusel02FileInputRef}
                    type="file"
                    accept="image/*"
                    required={!isEditing}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setCarrusel02File(f);
                        setCarrusel02Preview(URL.createObjectURL(f));
                        setCarrusel02PosX(50); setCarrusel02PosY(50); setCarrusel02Scale(1.0);
                        setIsCarrusel02AjusteOpen(false);
                      }
                    }}
                    className="flex-1 text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                  {/* X para limpiar imagen seleccionada (solo si hay un archivo nuevo) */}
                  {hasNewFile && (
                    <button
                      type="button"
                      onClick={clearSelectedFile}
                      title="Quitar imagen seleccionada"
                      className="flex-shrink-0 p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors border border-rose-100"
                    >
                      <X size={16} />
                    </button>
                  )}
                  {/* Botón Ajustar (visible cuando hay preview) */}
                  {carrusel02Preview && (
                    <button
                      type="button"
                      onClick={() => setIsCarrusel02AjusteOpen(v => !v)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${isCarrusel02AjusteOpen ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {isCarrusel02AjusteOpen ? 'Cerrar' : '✦ Ajustar'}
                    </button>
                  )}
                </div>
              </div>

              {/* Preview estático (cuando ajuste cerrado) */}
              {carrusel02Preview && !isCarrusel02AjusteOpen && (
                <div className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm" style={{ aspectRatio: '16/9' }}>
                  <img
                    src={carrusel02Preview}
                    alt="Vista previa"
                    draggable={false}
                    className="w-full h-full"
                    style={{
                      objectFit: 'cover',
                      objectPosition: `${carrusel02PosX}% ${carrusel02PosY}%`,
                      transform: `scale(${carrusel02Scale})`,
                      transformOrigin: `${carrusel02PosX}% ${carrusel02PosY}%`,
                    }}
                  />
                </div>
              )}

              {/* Ajustador interactivo */}
              {carrusel02Preview && isCarrusel02AjusteOpen && (
                <div className="rounded-2xl border-2 border-slate-800 overflow-hidden shadow-xl">
                  <div
                    className="relative w-full select-none cursor-crosshair"
                    style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#0f172a' }}
                    onMouseMove={(e) => {
                      if (e.buttons !== 1) return;
                      const r = e.currentTarget.getBoundingClientRect();
                      setCarrusel02PosX(Math.round(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))));
                      setCarrusel02PosY(Math.round(Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100))));
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      const t = e.touches[0];
                      const r = e.currentTarget.getBoundingClientRect();
                      setCarrusel02PosX(Math.round(Math.max(0, Math.min(100, ((t.clientX - r.left) / r.width) * 100))));
                      setCarrusel02PosY(Math.round(Math.max(0, Math.min(100, ((t.clientY - r.top) / r.height) * 100))));
                    }}
                  >
                    <img
                      src={carrusel02Preview}
                      alt="Ajustar"
                      draggable={false}
                      className="w-full h-full pointer-events-none"
                      style={{
                        objectFit: 'cover',
                        objectPosition: `${carrusel02PosX}% ${carrusel02PosY}%`,
                        transform: `scale(${carrusel02Scale})`,
                        transformOrigin: `${carrusel02PosX}% ${carrusel02PosY}%`,
                        transition: 'transform 0.1s ease',
                      }}
                    />
                    {/* Punto de enfoque */}
                    <div
                      className="pointer-events-none absolute"
                      style={{ left: `calc(${carrusel02PosX}% - 12px)`, top: `calc(${carrusel02PosY}% - 12px)` }}
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-white shadow-lg" />
                    </div>
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-[13px] font-black px-2 py-1 rounded-lg backdrop-blur-sm">16 : 9</div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-[13px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">{carrusel02PosX}% · {carrusel02PosY}%</div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white/70 text-[12px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">Arrastra para mover el enfoque</div>
                  </div>
                  <div className="bg-slate-900 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 text-[13px] font-black uppercase tracking-widest w-12">Zoom</span>
                      <input
                        type="range" min="1" max="2.5" step="0.05"
                        value={carrusel02Scale}
                        onChange={(e) => setCarrusel02Scale(parseFloat(e.target.value))}
                        className="flex-1 accent-emerald-400 cursor-pointer"
                      />
                      <span className="text-white/80 text-xs font-black w-10 text-right">{carrusel02Scale.toFixed(2)}x</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setCarrusel02PosX(50); setCarrusel02PosY(50); setCarrusel02Scale(1.0); }}
                        className="flex-1 py-2 text-xs font-bold text-white/60 hover:text-white border border-white/10 rounded-xl transition-colors"
                      >
                        Restablecer
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCarrusel02AjusteOpen(false)}
                        className="flex-1 py-2 text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-colors"
                      >
                        ✓ Guardar ajuste
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder cuando no hay foto */}
              {!carrusel02Preview && (
                <div
                  className="w-full rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-2"
                  style={{ aspectRatio: '16/9' }}
                >
                  <ImageIcon size={32} />
                  <span className="text-xs font-bold">Sin imagen seleccionada</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={carrusel02Uploading}
                className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {carrusel02Uploading
                  ? <><Loader2 size={16} className="animate-spin" /> Subiendo...</>
                  : <><Upload size={16} /> {isEditing ? 'Guardar Cambios' : 'Agregar al Carrusel'}</>
                }
              </button>
            </form>
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
              <h3 className="text-xl font-bold text-slate-800">Carrusel 02 — Evidencia Visual</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Segunda fila de la sección Resultados · Arrastra para reordenar</p>
            </div>
            <button
              onClick={() => openCarrusel02Modal(null)}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              <Upload size={18} /> Agregar Imagen
            </button>
          </div>

          {carrusel02.length === 0 ? (
            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
              No hay imágenes en el Carrusel 02. Agrega la primera.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white">
              {carrusel02.map((img, index) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={(e) => handleCarrusel02DragStart(index, e)}
                  onDragOver={(e) => handleCarrusel02DragOver(index, e)}
                  onDrop={(e) => handleCarrusel02Drop(index, e)}
                  onDragLeave={() => setCarrusel02DragOver(null)}
                  onDragEnd={() => { setCarrusel02DragOver(null); carrusel02DragRef.current = null; }}
                  className={`flex items-center gap-4 px-4 py-3 transition-colors select-none ${carrusel02DragOver === index ? 'bg-emerald-50 border-t-2 border-emerald-400' : 'hover:bg-slate-50/60'}`}
                >
                  {/* Grip handle */}
                  <div
                    className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0 p-1"
                    title="Arrastra para cambiar el orden"
                  >
                    <GripVertical size={20} />
                  </div>

                  {/* Order badge */}
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 flex-shrink-0">
                    {img.orden}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                    <img
                      src={getCarrusel02Url(img.file_path)}
                      alt={img.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>

                  {/* Name & path */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{img.nombre || '—'}</p>
                    <p className="text-[14px] text-slate-400 truncate font-mono">{img.file_path}</p>
                  </div>

                  {/* Active toggle */}
                  <button
                    onClick={() => handleCarrusel02ToggleActivo(img)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${img.activo ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    title={img.activo ? 'Visible en el carrusel' : 'Oculta del carrusel'}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${img.activo ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openCarrusel02Modal(img)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Reemplazar imagen o editar nombre"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleCarrusel02Delete(img)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar imagen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {renderCarrusel02Modal()}
    </>
  );
};
