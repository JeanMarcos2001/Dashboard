import React from 'react';
import {
  Plus, MapPin, Navigation, Phone, Power, Edit, Clock,
  ChevronLeft, Sparkles, GripVertical, X, Save, Trash2
} from 'lucide-react';
import { Filial, Appointment, MensajeWsp } from '../types';
import { Modal } from '../components/Modal';
import { getDaysInMonth, formatHour12, getAvailableHours } from '../utils/dateHelpers';

interface FilialesViewProps {
  filiales: Filial[];
  searchTerm: string;
  // Filial CRUD
  openNewFilial: () => void;
  openEditFilial: (filial: Filial) => void;
  toggleFilialStatus: (id: number, currentStatus: boolean) => void;
  // Reschedule modal
  isRescheduleModalOpen: boolean;
  setIsRescheduleModalOpen: (open: boolean) => void;
  rescheduleApp: Appointment | null;
  currentCalendarDate: Date;
  setCurrentCalendarDate: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  handleRescheduleConfirm: () => void;
  // Mensajes WSP
  mensajesWsp: MensajeWsp[];
  isMensajesModalOpen: boolean;
  setIsMensajesModalOpen: (open: boolean) => void;
  isEditMensajeOpen: boolean;
  setIsEditMensajeOpen: (open: boolean) => void;
  editingMensaje: MensajeWsp | null;
  openMensajesGestor: () => void;
  openNewMensaje: () => void;
  openEditMensaje: (msg: MensajeWsp) => void;
  handleDeleteMensaje: (msg: MensajeWsp) => void;
  handleSaveMensaje: (e: React.FormEvent<HTMLFormElement>) => void;
  availableFiliales: Filial[];
  selectedFiliales: Filial[];
  onDragStartMensaje: (e: React.DragEvent, filial: Filial, source: 'available' | 'selected') => void;
  onDragMensaje: (e: React.DragEvent) => void;
  onDragEndMensaje: (e: React.DragEvent) => void;
  onDragOverMensaje: (e: React.DragEvent) => void;
  onDropMensaje: (e: React.DragEvent, target: 'available' | 'selected') => void;
  selectAllFilialesMensaje: () => void;
  deselectAllFilialesMensaje: () => void;
  draggingItem: { id: number; nombre: string; source: string } | null;
  dragPos: { x: number; y: number };
}

export const FilialesView: React.FC<FilialesViewProps> = ({
  filiales,
  searchTerm,
  openNewFilial,
  openEditFilial,
  toggleFilialStatus,
  isRescheduleModalOpen,
  setIsRescheduleModalOpen,
  rescheduleApp,
  currentCalendarDate,
  setCurrentCalendarDate,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  handleRescheduleConfirm,
  mensajesWsp,
  isMensajesModalOpen,
  setIsMensajesModalOpen,
  isEditMensajeOpen,
  setIsEditMensajeOpen,
  editingMensaje,
  openMensajesGestor,
  openNewMensaje,
  openEditMensaje,
  handleDeleteMensaje,
  handleSaveMensaje,
  availableFiliales,
  selectedFiliales,
  onDragStartMensaje,
  onDragMensaje,
  onDragEndMensaje,
  onDragOverMensaje,
  onDropMensaje,
  selectAllFilialesMensaje,
  deselectAllFilialesMensaje,
  draggingItem,
  dragPos,
}) => {
  const filtered = filiales.filter(f =>
    f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.distrito.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.provincia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reschedule modal logic
  const renderRescheduleModal = () => {
    if (!isRescheduleModalOpen || !rescheduleApp) return null;

    const { days, firstDay } = getDaysInMonth(currentCalendarDate);
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= days; d++) {
      const date = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), d);
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      const isSelected = selectedDate?.getTime() === date.getTime();

      calendarDays.push(
        <button
          key={d}
          disabled={isPast}
          onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${isPast
              ? 'text-slate-300 cursor-not-allowed'
              : isSelected
                ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-200 scale-110 !ring-0'
                : 'hover:bg-emerald-50 text-slate-700'
            }
                    ${!isSelected && isToday ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : ''}
                `}
        >
          {d}
        </button>
      );
    }

    const availableHours = selectedDate ? getAvailableHours(selectedDate) : [];

    return (
      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        title="Reprogramar Cita"
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Calendario */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg">
                <ChevronLeft size={20} className="text-slate-600" />
              </button>
              <h4 className="font-bold text-slate-800">{monthNames[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}</h4>
              <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg">
                <ChevronLeft size={20} className="text-slate-600 rotate-180" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs font-semibold text-slate-400 uppercase">
              <div>Do</div><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div>
            </div>
            <div className="grid grid-cols-7 gap-1 place-items-center">
              {calendarDays}
            </div>
          </div>

          {/* Horas */}
          <div className={`flex-1 border-l border-slate-100 pl-0 md:pl-8 ${!selectedDate ? 'opacity-50 blur-[2px] pointer-events-none select-none' : ''}`}>
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-emerald-500" />
              Horarios Disponibles
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {availableHours.map(hour => (
                <button
                  key={hour}
                  onClick={() => setSelectedTime(hour)}
                  className={`py-2 px-3 rounded-xl border font-bold text-sm transition-all
                                    ${selectedTime === hour
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                    }
                                `}
                >
                  {formatHour12(hour)}
                </button>
              ))}
            </div>
            {!selectedDate && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xl">Selecciona un día primero</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={() => setIsRescheduleModalOpen(false)} className="px-4 py-2.5 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-all text-sm">Cancelar</button>
          <button
            onClick={handleRescheduleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white shadow-md shadow-emerald-100/50 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            Confirmar Cambio
          </button>
        </div>
      </Modal>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Sedes y Sucursales</h3>
            <p className="text-sm text-slate-500 mt-1">Gestiona los locales y sus mensajes predeterminados</p>
          </div>
          <button onClick={openMensajesGestor} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-100 transition-all shadow-sm">
            <Sparkles size={18} /> Gestionar Mensajes WhatsApp
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(filial => (
            <div key={filial.id} className="glass-card rounded-3xl p-6 border border-slate-200 relative overflow-hidden group flex flex-col h-full">
              <div className={`absolute top-0 right-0 px-3 py-0.5 rounded-bl-xl text-xs font-semibold uppercase tracking-wider ${filial.activo ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
                {filial.activo ? 'Activa' : 'Inactiva'}
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors pr-10">{filial.nombre}</h4>
                </div>
                <p className="text-slate-500 font-medium text-sm flex items-center gap-1 mt-1">
                  <MapPin size={14} className="text-emerald-500" /> {filial.distrito}, {filial.provincia}
                </p>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4 mb-6 flex-grow">
                <div className="flex gap-2">
                  <Navigation size={14} className="text-slate-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Dirección</p>
                    <p className="text-sm text-slate-700 font-medium">{filial.direccion}</p>
                    {filial.referencia && <p className="text-[14px] text-slate-400 font-medium italic">Ref: {filial.referencia}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Celular</p>
                    <p className="text-sm text-slate-700 font-bold flex items-center gap-1">
                      <Phone size={12} className="text-emerald-500" /> {filial.telefono_movil}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tel. Fijo</p>
                    <p className="text-sm text-slate-700 font-bold">{filial.telefono_fijo || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 mt-auto">
                <button
                  onClick={() => toggleFilialStatus(filial.id, filial.activo)}
                  className={`p-2 rounded-xl border flex items-center justify-center transition-all ${filial.activo ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}
                  title={filial.activo ? "Desactivar" : "Activar"}
                >
                  <Power size={18} />
                </button>
                <button
                  onClick={() => openEditFilial(filial)}
                  className="p-2 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all"
                  title="Editar"
                >
                  <Edit size={18} />
                </button>
              </div>
            </div>
          ))}
          <button onClick={openNewFilial} className="rounded-3xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-200 hover:text-emerald-600 transition-all group h-[320px]">
            <div className="p-3 bg-slate-50 rounded-full group-hover:bg-emerald-50 transition-colors mb-2">
              <Plus size={24} />
            </div>
            <span className="font-bold">Agregar Nueva Filial</span>
            <p className="text-xs font-medium max-w-[150px] text-center mt-1">Registra un nuevo centro de operaciones</p>
          </button>
        </div>
      </div>

      {renderRescheduleModal()}

      {/* Modales de Mensajes WSP */}
      <Modal isOpen={isMensajesModalOpen} onClose={() => setIsMensajesModalOpen(false)} title="Mensajes de WhatsApp">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-slate-500">Plantillas para el botón de contacto web.</p>
          <button onClick={openNewMensaje} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100/50">
            <Plus size={16} /> Crear Mensaje
          </button>
        </div>
        {mensajesWsp.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Sparkles className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-500 font-bold">No hay mensajes creados</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {mensajesWsp.map(msg => (
              <div key={msg.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col gap-2 group">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 text-sm">{msg.titulo}</h4>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditMensaje(msg)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Edit size={14} /></button>
                    <button onClick={() => handleDeleteMensaje(msg)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic line-clamp-2">"{msg.contenido}"</p>
                <div className="text-[13px] font-bold text-slate-400 mt-1">
                  {filiales.filter(f => f.id_mensaje_wsp === msg.id).length} filial(es) asignada(s)
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal isOpen={isEditMensajeOpen} onClose={() => setIsEditMensajeOpen(false)} title={editingMensaje ? "Editar Mensaje WhatsApp" : "Nuevo Mensaje WhatsApp"}>
        <form onSubmit={handleSaveMensaje} className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Título / Indicador</label>
            <input type="text" name="titulo" defaultValue={editingMensaje?.titulo} required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="Ej. Promoción Chiclayo" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Contenido del Mensaje</label>
            <textarea name="contenido" defaultValue={editingMensaje?.contenido} required rows={3} className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm text-sm" placeholder="Hola, deseo información sobre..." />
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Asignar Filiales</label>
              {availableFiliales.length > 0 && (
                <button type="button" onClick={selectAllFilialesMensaje} className="text-[13px] font-bold text-emerald-600 hover:underline">Seleccionar Todas</button>
              )}
              {selectedFiliales.length > 0 && availableFiliales.length === 0 && (
                <button type="button" onClick={deselectAllFilialesMensaje} className="text-[13px] font-bold text-rose-500 hover:underline">Quitar Todas</button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 h-[250px]">
              {/* Disponibles */}
              <div
                className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-2 overflow-y-auto"
                onDragOver={onDragOverMensaje}
                onDrop={(e) => onDropMensaje(e, 'available')}
              >
                <p className="text-[13px] font-bold text-slate-400 text-center uppercase mb-2 sticky top-0 bg-slate-50 py-1">Disponibles</p>
                <div className="space-y-2">
                  {availableFiliales.map(f => (
                    <div
                      key={f.id}
                      draggable
                      onDragStart={(e) => onDragStartMensaje(e, f, 'available')}
                      onDrag={onDragMensaje}
                      onDragEnd={onDragEndMensaje}
                      className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm text-xs font-bold text-slate-700 cursor-move hover:border-emerald-300 transition-colors flex items-center gap-2"
                    >
                      <GripVertical size={14} className="text-slate-300 flex-shrink-0" />
                      <span className="truncate">{f.nombre}</span>
                    </div>
                  ))}
                  {availableFiliales.length === 0 && (
                    <p className="text-[13px] text-slate-400 text-center py-4 italic">No hay filiales libres</p>
                  )}
                </div>
              </div>

              {/* Seleccionadas */}
              <div
                className="bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200 p-2 overflow-y-auto"
                onDragOver={onDragOverMensaje}
                onDrop={(e) => onDropMensaje(e, 'selected')}
              >
                <p className="text-[13px] font-bold text-emerald-600 text-center uppercase mb-2 sticky top-0 bg-emerald-50/90 py-1">Asignadas</p>
                <div className="space-y-2">
                  {selectedFiliales.map(f => (
                    <div
                      key={f.id}
                      draggable
                      onDragStart={(e) => onDragStartMensaje(e, f, 'selected')}
                      onDrag={onDragMensaje}
                      onDragEnd={onDragEndMensaje}
                      className="p-2 bg-white rounded-xl border border-emerald-200 shadow-sm text-xs font-bold text-emerald-800 cursor-move hover:border-rose-300 hover:bg-rose-50 transition-colors flex items-center gap-2"
                    >
                      <GripVertical size={14} className="text-emerald-300 flex-shrink-0" />
                      <span className="truncate">{f.nombre}</span>
                    </div>
                  ))}
                  {selectedFiliales.length === 0 && (
                    <p className="text-[13px] text-emerald-600/70 text-center py-4 italic">Arrastra filiales aquí</p>
                  )}
                </div>
              </div>
            </div>
            <p className="text-[13px] text-slate-400 mt-2 text-center">Arrastra las filiales de un lado a otro para asignarlas.</p>
          </div>

          <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all uppercase tracking-wider text-xs shadow-md shadow-emerald-100/50 mt-2">
            Guardar Mensaje
          </button>
        </form>

        {/* Custom Drag Overlay */}
        {draggingItem && (
          <div
            className="fixed pointer-events-none z-[9999] p-2 bg-white rounded-lg border border-emerald-500 shadow-xl text-xs font-semibold text-slate-800 flex items-center gap-2 transform -translate-x-1/2 -translate-y-1/2 scale-105"
            style={{ left: dragPos.x, top: dragPos.y }}
          >
            <GripVertical size={14} className="text-emerald-500" />
            <span>{draggingItem.nombre}</span>
          </div>
        )}
      </Modal>
    </>
  );
};
