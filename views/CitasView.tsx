import React from 'react';
import {
  Plus, Filter, ChevronLeft, ChevronRight, X, Clock, MoreVertical,
  MapPin, Eye, Sparkles, Calendar, GraduationCap, Search, Trash2,
  User, Phone, MessageCircle, XCircle, CalendarDays, TrendingUp,
  CalendarClock, FileText, Save, Info, Mail
} from 'lucide-react';
import {
  Appointment, Alumno, Apoderado, Filial, AppointmentStatus
} from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  isAlumnoExistenteCita, formatFriendlyDate, cleanPhoneNumberForWhatsapp
} from '../utils/appointments';
import {
  formatHour12, getAvailableHoursForDateStr, getAvailableHours, getDaysInMonth
} from '../utils/dateHelpers';

interface CitasViewProps {
  appointments: Appointment[];
  alumnos: Alumno[];
  apoderados: Apoderado[];
  filiales: Filial[];
  searchTerm: string;
  // View toggle
  citasView: 'calendar' | 'list';
  setCitasView: (v: 'calendar' | 'list') => void;
  // Calendar state
  calendarWeekStart: Date;
  setCalendarWeekStart: React.Dispatch<React.SetStateAction<Date>>;
  slideOffset: number;
  setSlideOffset: (v: number) => void;
  isTransitioning: boolean;
  setIsTransitioning: (v: boolean) => void;
  plusMenuDate: string | null;
  setPlusMenuDate: (v: string | null) => void;
  // Appointment creation modal
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  editingItem: any;
  schedulingFlow: 'existing' | 'new';
  setSchedulingFlow: (v: 'existing' | 'new') => void;
  selectedFilialId: number | null;
  setSelectedFilialId: (id: number | null) => void;
  searchStudentTerm: string;
  setSearchStudentTerm: (v: string) => void;
  isStudentDropdownOpen: boolean;
  setIsStudentDropdownOpen: (v: boolean) => void;
  selectedAlumnoId: number | null;
  setSelectedAlumnoId: (id: number | null) => void;
  matchedAlumnos: Alumno[];
  newStudentType: 'dependent' | 'independent';
  setNewStudentType: (v: 'dependent' | 'independent') => void;
  apoderadoNombre: string;
  setApoderadoNombre: (v: string) => void;
  apoderadoTelefono: string;
  setApoderadoTelefono: (v: string) => void;
  apoderadoEmail: string;
  setApoderadoEmail: (v: string) => void;
  newStudents: Array<{ nombre_completo: string; edad: string }>;
  setNewStudents: (v: Array<{ nombre_completo: string; edad: string }>) => void;
  appointmentDate: string;
  setAppointmentDate: (v: string) => void;
  appointmentTime: string;
  setAppointmentTime: (v: string) => void;
  appointmentObservaciones: string;
  setAppointmentObservaciones: (v: string) => void;
  preselectedDate: string | null;
  setPreselectedDate: (v: string | null) => void;
  miniCalendarMonth: Date;
  setMiniCalendarMonth: (v: Date) => void;
  hoursRibbonRef: React.RefObject<HTMLDivElement>;
  isConfirmingSave: boolean;
  setIsConfirmingSave: (v: boolean) => void;
  pendingBookingPayload: any;
  setPendingBookingPayload: (v: any) => void;
  resetAppointmentFields: () => void;
  handleAddAppointment: (booking: any) => void;
  handleCreateAppointmentForDate: (dateStr: string, flow: 'existing' | 'new') => void;
  // Filters
  filterDateMode: 'all' | 'specific' | 'range';
  setFilterDateMode: (v: 'all' | 'specific' | 'range') => void;
  filterDateStart: string;
  setFilterDateStart: (v: string) => void;
  filterDateEnd: string;
  setFilterDateEnd: (v: string) => void;
  filterFiliales: number[];
  setFilterFiliales: (v: number[]) => void;
  filterStatus: AppointmentStatus | 'ALL';
  setFilterStatus: (v: AppointmentStatus | 'ALL') => void;
  isFilterExpanded: boolean;
  setIsFilterExpanded: (v: boolean) => void;
  isFilialDropdownOpen: boolean;
  setIsFilialDropdownOpen: (v: boolean) => void;
  // Details modal
  isDetailsModalOpen: boolean;
  setIsDetailsModalOpen: (open: boolean) => void;
  detailsAppointment: Appointment | null;
  setDetailsAppointment: (app: Appointment | null) => void;
  isReprogrammingExpanded: boolean;
  setIsReprogrammingExpanded: (v: boolean) => void;
  detailsNotes: string;
  setDetailsNotes: (v: string) => void;
  openAppointmentDetails: (app: Appointment) => void;
  handleDetailsNavigation: (direction: 'next' | 'prev') => void;
  handleStatusChangeFromModal: (newStatus: AppointmentStatus) => void;
  handleReprogramFromModal: () => void;
  handleUpdateNotes: () => void;
  currentCalendarDate: Date;
  setCurrentCalendarDate: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  // Delete
  handleDeleteAppointment: (id: number) => void;
}

export const CitasView: React.FC<CitasViewProps> = ({
  appointments,
  alumnos,
  apoderados,
  filiales,
  searchTerm,
  citasView,
  setCitasView,
  calendarWeekStart,
  setCalendarWeekStart,
  slideOffset,
  setSlideOffset,
  isTransitioning,
  setIsTransitioning,
  plusMenuDate,
  setPlusMenuDate,
  isModalOpen,
  setIsModalOpen,
  editingItem,
  schedulingFlow,
  setSchedulingFlow,
  selectedFilialId,
  setSelectedFilialId,
  searchStudentTerm,
  setSearchStudentTerm,
  isStudentDropdownOpen,
  setIsStudentDropdownOpen,
  selectedAlumnoId,
  setSelectedAlumnoId,
  matchedAlumnos,
  newStudentType,
  setNewStudentType,
  apoderadoNombre,
  setApoderadoNombre,
  apoderadoTelefono,
  setApoderadoTelefono,
  apoderadoEmail,
  setApoderadoEmail,
  newStudents,
  setNewStudents,
  appointmentDate,
  setAppointmentDate,
  appointmentTime,
  setAppointmentTime,
  appointmentObservaciones,
  setAppointmentObservaciones,
  preselectedDate,
  setPreselectedDate,
  miniCalendarMonth,
  setMiniCalendarMonth,
  hoursRibbonRef,
  isConfirmingSave,
  setIsConfirmingSave,
  pendingBookingPayload,
  setPendingBookingPayload,
  resetAppointmentFields,
  handleAddAppointment,
  handleCreateAppointmentForDate,
  filterDateMode,
  setFilterDateMode,
  filterDateStart,
  setFilterDateStart,
  filterDateEnd,
  setFilterDateEnd,
  filterFiliales,
  setFilterFiliales,
  filterStatus,
  setFilterStatus,
  isFilterExpanded,
  setIsFilterExpanded,
  isFilialDropdownOpen,
  setIsFilialDropdownOpen,
  isDetailsModalOpen,
  setIsDetailsModalOpen,
  detailsAppointment,
  setDetailsAppointment,
  isReprogrammingExpanded,
  setIsReprogrammingExpanded,
  detailsNotes,
  setDetailsNotes,
  openAppointmentDetails,
  handleDetailsNavigation,
  handleStatusChangeFromModal,
  handleReprogramFromModal,
  handleUpdateNotes,
  currentCalendarDate,
  setCurrentCalendarDate,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  handleDeleteAppointment,
}) => {

  // Detecta viewport móvil para adaptar el calendario (2 columnas en celular, 9 con slide en desktop)
  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  // Ref para swipe horizontal en móvil
  const touchStartX = React.useRef<number | null>(null);
  // Estado de navegación de 2 días para móvil (independiente del semanal de desktop)
  const [mobileDayStart, setMobileDayStart] = React.useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  // Estados para animación de slide en móvil
  const [mobileSlideOffset, setMobileSlideOffset] = React.useState(-25);
  const [isMobileTransitioning, setIsMobileTransitioning] = React.useState(false);

  // ---- renderFilters ----
  const renderFilters = () => {
    return (
      <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`flex items-center gap-2 font-bold transition-colors ${isFilterExpanded ? 'text-emerald-700' : 'text-slate-500 hover:text-emerald-600'}`}
          >
            <Filter size={20} className={isFilterExpanded ? "fill-emerald-100" : ""} />
            <span>Filtros Avanzados</span>
            {isFilterExpanded ? <ChevronLeft size={16} className="rotate-90" /> : <ChevronLeft size={16} className="-rotate-90" />}
          </button>

          {(filterDateMode !== 'all' || filterFiliales.length > 0 || filterStatus !== 'ALL') && (
            <button
              onClick={() => {
                setFilterDateMode('all');
                setFilterDateStart('');
                setFilterDateEnd('');
                setFilterFiliales([]);
                setFilterStatus('ALL');
              }}
              className="text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <X size={14} /> Limpiar Filtros
            </button>
          )}
        </div>

        {isFilterExpanded && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-20">
            {/* Filtro de Fecha */}
            <div className="space-y-2">
              <label className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Fecha</label>
              <select
                value={filterDateMode}
                onChange={(e) => setFilterDateMode(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none mb-2"
              >
                <option value="all">Todas las fechas</option>
                <option value="specific">Fecha Específica</option>
                <option value="range">Rango de Fechas</option>
              </select>

              {filterDateMode === 'specific' && (
                <input
                  type="date"
                  value={filterDateStart}
                  onChange={(e) => setFilterDateStart(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              )}

              {filterDateMode === 'range' && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filterDateStart}
                    onChange={(e) => setFilterDateStart(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Desde"
                  />
                  <input
                    type="date"
                    value={filterDateEnd}
                    onChange={(e) => setFilterDateEnd(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Hasta"
                  />
                </div>
              )}
            </div>

            {/* Filtro de Filiales (Multi-select) */}
            <div className="space-y-2 relative">
              <label className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Filiales</label>
              <button
                onClick={() => setIsFilialDropdownOpen(!isFilialDropdownOpen)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-left flex justify-between items-center hover:border-emerald-300 transition-all text-sm font-bold text-slate-700"
              >
                <span className="truncate">
                  {filterFiliales.length === 0
                    ? 'Todas las filiales'
                    : `${filterFiliales.length} seleccionada${filterFiliales.length !== 1 ? 's' : ''}`}
                </span>
                <ChevronLeft size={16} className={`text-slate-400 transition-transform ${isFilialDropdownOpen ? '-rotate-90' : '-rotate-90'}`} />
              </button>

              {isFilialDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 max-h-[300px] overflow-y-auto">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500">Selección</span>
                    {filterFiliales.length > 0 && (
                      <button onClick={() => setFilterFiliales([])} className="text-[13px] font-bold text-rose-500 hover:underline">Borrar</button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {filiales.map(f => (
                      <label key={f.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={filterFiliales.includes(f.id)}
                          onChange={(e) => {
                            if (e.target.checked) setFilterFiliales([...filterFiliales, f.id]);
                            else setFilterFiliales(filterFiliales.filter(id => id !== f.id));
                          }}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className="text-sm font-medium text-slate-700">{f.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {/* Overlay to close dropdown */}
              {isFilialDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsFilialDropdownOpen(false)}></div>}
            </div>

            {/* Filtro de Estado */}
            <div className="space-y-2">
              <label className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="ALL">Todos los estados</option>
                <option value={AppointmentStatus.AGENDADO}>Agendado (Legacy)</option>
                <option value={AppointmentStatus.CONFIRMADO}>Confirmado (Entrevista)</option>
                <option value={AppointmentStatus.CONVERTIDO}>Convertido (Entrevista)</option>
                <option value={AppointmentStatus.PENDIENTE}>Pendiente (Inicio)</option>
                <option value={AppointmentStatus.ASISTIO}>Asistió (Cita)</option>
                <option value={AppointmentStatus.FALTO}>Faltó (Legacy)</option>
                <option value={AppointmentStatus.CANCELADO}>Cancelado</option>
              </select>
            </div>

            {/* Resumen activo */}
            <div className="flex items-end pb-2">
              <div className="text-xs font-medium text-slate-500 italic">
                Mostrando resultados según los filtros aplicados.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ---- renderMiniFormCalendar ----
  const renderMiniFormCalendar = () => {
    const year = miniCalendarMonth.getFullYear();
    const month = miniCalendarMonth.getMonth();

    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const monthLabel = `${monthNames[month]} ${year}`;

    const firstDayDate = new Date(year, month, 1);
    const startDay = (firstDayDate.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        dayNum: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        dayNum: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }

    const totalCells = Math.ceil(days.length / 7) * 7;
    const nextMonthPadding = totalCells - days.length;
    for (let i = 1; i <= nextMonthPadding; i++) {
      days.push({
        dayNum: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handlePrevMonth = () => {
      setMiniCalendarMonth(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
      setMiniCalendarMonth(new Date(year, month + 1, 1));
    };

    return (
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-5 shadow-sm select-none">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-slate-600 hover:text-slate-800"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-base font-black text-slate-700 uppercase tracking-wider">{monthLabel}</span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-slate-600 hover:text-slate-800"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
          <span>Lu</span>
          <span>Ma</span>
          <span>Mi</span>
          <span>Ju</span>
          <span>Vi</span>
          <span>Sá</span>
          <span>Do</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {days.map((d, index) => {
            const dateStr = `${d.date.getFullYear()}-${(d.date.getMonth() + 1).toString().padStart(2, '0')}-${d.date.getDate().toString().padStart(2, '0')}`;
            const isSelected = appointmentDate === dateStr;
            const isToday = d.date.getTime() === today.getTime();
            const isPast = d.date < today;

            let btnClass = "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ";
            if (isSelected) {
              btnClass += "bg-indigo-600 text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 scale-105 cursor-pointer z-10";
            } else if (isPast) {
              btnClass += "text-slate-300 pointer-events-none opacity-40";
            } else if (!d.isCurrentMonth) {
              btnClass += "text-slate-400 hover:bg-slate-200/50 cursor-pointer";
            } else {
              btnClass += "text-slate-700 hover:bg-slate-200 cursor-pointer ";
              if (isToday) {
                btnClass += "border-2 border-indigo-300 text-indigo-600 bg-indigo-50/30";
              }
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setPreselectedDate(null);
                  setAppointmentDate(dateStr);
                  setAppointmentTime('');
                }}
                disabled={isPast}
                className={btnClass}
              >
                {d.dayNum}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ---- renderHorizontalHourRibbon ----
  const renderHorizontalHourRibbon = () => {
    if (!appointmentDate) {
      return (
        <div className="text-center text-slate-400 py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider">
          Seleccione un día en el calendario
        </div>
      );
    }

    const availableHours = getAvailableHoursForDateStr(appointmentDate);
    const friendlyDateStr = formatFriendlyDate(appointmentDate);

    const scrollLeft = () => {
      if (hoursRibbonRef.current) {
        hoursRibbonRef.current.scrollLeft -= 240;
      }
    };

    const scrollRight = () => {
      if (hoursRibbonRef.current) {
        hoursRibbonRef.current.scrollLeft += 240;
      }
    };

    return (
      <div className="space-y-2 mt-1 select-none">
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
          Horas disponibles para el {friendlyDateStr}
        </label>
        {availableHours.length === 0 ? (
          <div className="text-center text-amber-600 bg-amber-50 border border-amber-100 py-3 rounded-xl text-xs font-semibold">
            No hay horarios disponibles para esta fecha.
          </div>
        ) : (
          <div className="relative flex items-center gap-1.5">
            <button
              type="button"
              onClick={scrollLeft}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-500 hover:text-slate-700 shadow-sm transition-all cursor-pointer"
              title="Deslizar izquierda"
            >
              <ChevronLeft size={16} />
            </button>

            <div
              ref={hoursRibbonRef}
              className="flex-1 flex gap-2 overflow-x-auto scroll-smooth py-2 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {availableHours.map((h) => {
                const isSelected = appointmentTime === h;
                const formattedTime = formatHour12(h);

                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setAppointmentTime(h)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shadow-sm cursor-pointer hover:scale-105 ${isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-100 scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    {formattedTime}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={scrollRight}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-500 hover:text-slate-700 shadow-sm transition-all cursor-pointer"
              title="Deslizar derecha"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ---- renderCitasCalendar ----
  const renderCitasCalendar = () => {
    const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const MONTH_NAMES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    const weekDays = Array.from({ length: 9 }, (_, i) => {
      const d = new Date(calendarWeekStart);
      d.setDate(d.getDate() + (i - 1));
      return d;
    });

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    const fmtDate = (d: Date) => {
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const dy = String(d.getDate()).padStart(2, '0');
      return `${y}-${mo}-${dy}`;
    };

    const fmtTime = (hora: string) => {
      const [h, m] = hora.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
    };

    // ── Navegación DESKTOP (semanal con slide) ──────────────────────────────
    const navigateWeek = (dir: 'prev' | 'next') => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setSlideOffset(dir === 'next' ? -22.222 : 0);
      setTimeout(() => {
        setCalendarWeekStart(prev => {
          const d = new Date(prev);
          d.setDate(d.getDate() + (dir === 'next' ? 1 : -1));
          return d;
        });
        setSlideOffset(-11.111);
        setIsTransitioning(false);
      }, 350);
    };

    const goToToday = () => {
      if (isTransitioning) return;
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const targetStart = new Date(now.getFullYear(), now.getMonth(), diff);
      if (targetStart.getTime() === calendarWeekStart.getTime()) return;
      setIsTransitioning(true);
      setSlideOffset(targetStart.getTime() > calendarWeekStart.getTime() ? -22.222 : 0);
      setTimeout(() => {
        setCalendarWeekStart(targetStart);
        setSlideOffset(-11.111);
        setIsTransitioning(false);
      }, 350);
    };

    // ── Navegación MÓVIL (2 días por página con slide) ─────────────────────────
    const navigateMobile = (dir: 'prev' | 'next') => {
      if (isMobileTransitioning) return;
      setIsMobileTransitioning(true);
      setMobileSlideOffset(dir === 'next' ? -50 : 0);
      setTimeout(() => {
        setMobileDayStart(prev => {
          const d = new Date(prev);
          d.setDate(d.getDate() + (dir === 'next' ? 1 : -1));
          return d;
        });
        setMobileSlideOffset(-25);
        setIsMobileTransitioning(false);
      }, 350);
    };

    const goToTodayMobile = () => {
      if (isMobileTransitioning) return;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (now.getTime() === mobileDayStart.getTime()) return;

      setIsMobileTransitioning(true);
      const isNext = now.getTime() > mobileDayStart.getTime();
      setMobileSlideOffset(isNext ? -50 : 0);

      setTimeout(() => {
        setMobileDayStart(now);
        setMobileSlideOffset(-25);
        setIsMobileTransitioning(false);
      }, 350);
    };

    // Días en móvil: 4 días para el carrusel (-1, 0, 1, 2 en relación al día de inicio de navegación)
    const mobileDays = [-1, 0, 1, 2].map(i => {
      const d = new Date(mobileDayStart);
      d.setDate(d.getDate() + i);
      return d;
    });

    // Swipe: avanza/retrocede 1 día en móvil con slide
    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(dx) > 50) navigateMobile(dx < 0 ? 'next' : 'prev');
      touchStartX.current = null;
    };

    // Labels de rango según modo
    const startDay = weekDays[1];
    const endDay = weekDays[7];
    const rangeLabel = isMobile
      ? `${DAY_NAMES[mobileDays[1].getDay()]} ${mobileDays[1].getDate()} ${MONTH_NAMES[mobileDays[1].getMonth()]} — ${DAY_NAMES[mobileDays[2].getDay()]} ${mobileDays[2].getDate()} ${MONTH_NAMES[mobileDays[2].getMonth()]} ${mobileDays[2].getFullYear()}`
      : `${DAY_NAMES[startDay.getDay()]} ${startDay.getDate()} ${MONTH_NAMES[startDay.getMonth()]} — ${DAY_NAMES[endDay.getDay()]} ${endDay.getDate()} ${MONTH_NAMES[endDay.getMonth()]} ${endDay.getFullYear()}`;

    const STATUS_STYLES: Record<string, { bg: string; border: string; dot: string; text: string }> = {
      [AppointmentStatus.AGENDADO]: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', text: 'text-amber-700' },
      [AppointmentStatus.CONFIRMADO]: { bg: 'bg-teal-50', border: 'border-teal-200', dot: 'bg-teal-500', text: 'text-teal-700' },
      [AppointmentStatus.CANCELADO]: { bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500', text: 'text-rose-700' },
      [AppointmentStatus.CONVERTIDO]: { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500', text: 'text-purple-700' },
      [AppointmentStatus.PENDIENTE]: { bg: 'bg-sky-50', border: 'border-sky-200', dot: 'bg-sky-500', text: 'text-sky-700' },
      [AppointmentStatus.ASISTIO]: { bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700' },
      [AppointmentStatus.FALTO]: { bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500', text: 'text-orange-700' },
    };

    return (
      <div className="p-4">
        {/* Barra de navegación semanal — sticky para que siempre sea accesible al hacer scroll */}
        <div className="sticky top-0 z-10 flex items-center gap-2 mb-4 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => isMobile ? navigateMobile('prev') : navigateWeek('prev')}
            className="w-11 h-11 md:w-10 md:h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all flex-shrink-0 active:bg-slate-200"
            title="Anterior"
          >
            <ChevronLeft size={19} />
          </button>
          <button
            onClick={() => isMobile ? navigateMobile('next') : navigateWeek('next')}
            className="w-11 h-11 md:w-10 md:h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all flex-shrink-0 active:bg-slate-200"
            title="Siguiente"
          >
            <ChevronLeft size={19} className="rotate-180" />
          </button>
          <span className="flex-1 text-center font-bold text-slate-700 text-sm md:text-base tracking-tight select-none">
            {rangeLabel}
          </span>
          <button
            onClick={() => isMobile ? goToTodayMobile() : goToToday()}
            className="px-4 py-2.5 md:px-5 md:py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-black text-sm md:text-base hover:bg-emerald-100 active:bg-emerald-200 transition-all flex-shrink-0"
          >
            Hoy
          </button>
        </div>

        {/* Grilla semanal: 9 columnas con slide en desktop, 4 columnas totales con slide en móvil (2 visibles) */}
        <div
          className="pb-2 w-full overflow-hidden no-scrollbar"
          onTouchStart={isMobile ? handleTouchStart : undefined}
          onTouchEnd={isMobile ? handleTouchEnd : undefined}
        >
          <div
            className={`grid gap-2 ${isMobile ? 'grid-cols-4' : 'grid-cols-9'} ${
              isMobile
                ? (isMobileTransitioning ? 'transition-transform duration-[350ms] ease-out' : '')
                : (isTransitioning ? 'transition-transform duration-[350ms] ease-out' : '')
            }`}
            style={isMobile ? {
              width: '200%',
              transform: `translateX(${mobileSlideOffset}%)`
            } : {
              width: '128.571%',
              minWidth: '925px',
              transform: `translateX(${slideOffset}%)`
            }}
          >
            {(isMobile ? mobileDays : weekDays).map((day) => {
              const dateStr = fmtDate(day);
              const isToday = day.getTime() === todayMidnight.getTime();
              const dayApps = appointments
                .filter(a => a.fecha_cita === dateStr)
                .sort((a, b) => a.hora_cita.localeCompare(b.hora_cita));

              return (
                <div key={day.getTime()} className="flex flex-col">
                  {/* Encabezado del dia */}
                  <div className={`relative text-center px-2 py-3 rounded-2xl mb-2 transition-all ${isToday
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 text-white'
                    : 'bg-white border border-slate-200'
                    }`}>
                    {/* Botón "+" para crear cita rápida */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlusMenuDate(plusMenuDate === dateStr ? null : dateStr);
                      }}
                      className={`absolute top-1.5 right-1.5 w-7 h-7 md:w-6 md:h-6 flex items-center justify-center rounded-full text-xs font-black transition-all cursor-pointer shadow-sm ${isToday
                        ? 'bg-white/20 hover:bg-white/40 text-white hover:scale-110'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-emerald-600 border border-slate-200/50 hover:scale-110'
                        }`}
                      title="Agendar cita o entrevista para este día"
                    >
                      <Plus size={13} />
                    </button>

                    {/* Menú contextual flotante — solo en desktop */}
                    {!isMobile && plusMenuDate === dateStr && (
                      <div className="absolute top-8 right-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 min-w-[150px] text-left animate-in fade-in slide-in-from-top-1 duration-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlusMenuDate(null);
                            handleCreateAppointmentForDate(dateStr, 'existing');
                          }}
                          className="w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Calendar size={13} className="text-emerald-500" /> Agendar Cita
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlusMenuDate(null);
                            handleCreateAppointmentForDate(dateStr, 'new');
                          }}
                          className="w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                        >
                          <GraduationCap size={13} className="text-indigo-500" /> Agendar Entrevista
                        </button>
                      </div>
                    )}

                    <p className={`text-3xl font-black leading-none ${isToday ? 'text-white' : 'text-slate-800'
                      }`}>
                      {day.getDate()}
                    </p>
                    <p className={`text-[13px] font-black uppercase tracking-widest mt-1 ${isToday ? 'text-emerald-100' : 'text-slate-400'
                      }`}>
                      {DAY_NAMES[day.getDay()]}
                    </p>
                    <p className={`text-[12px] font-bold uppercase mt-0.5 ${isToday ? 'text-emerald-200' : 'text-slate-300'
                      }`}>
                      {MONTH_NAMES[day.getMonth()]}
                    </p>
                  </div>

                  {/* Cards de citas del dia */}
                  <div className="flex flex-col gap-2">
                    {dayApps.length === 0 ? (
                      <div className="min-h-[80px] rounded-xl border-2 border-dashed border-slate-100 flex items-center justify-center">
                        <span className="text-slate-200 text-xl font-bold select-none">·</span>
                      </div>
                    ) : (
                      dayApps.map(app => {
                        const isExistente = isAlumnoExistenteCita(app);
                        const isInd = app.tipo_persona === 'independiente' || app.tipo_persona === 'existente_independiente';
                        const s = STATUS_STYLES[app.estado] || STATUS_STYLES[AppointmentStatus.AGENDADO];
                        const isNew = app.creado_en && (new Date().getTime() - new Date(app.creado_en).getTime() < 12 * 60 * 60 * 1000);

                        const cardClasses = isExistente
                          ? 'bg-white hover:bg-emerald-50/10 border-slate-200/60'
                          : 'bg-white hover:bg-indigo-50/10 border-slate-200/60';

                        const typeLabel = isExistente ? 'CITA' : 'ENTREVISTA';

                        return (
                          <button
                            key={app.id}
                            onClick={() => openAppointmentDetails(app)}
                            className={`w-full text-left p-3.5 rounded-[16px] border ${cardClasses} shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all active:scale-[0.98] flex flex-col cursor-pointer`}
                          >
                            <div className="flex items-center justify-between w-full gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-bold uppercase border shadow-sm ${s.bg} ${s.text} ${s.border}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
                                  {app.estado}
                                </div>
                                <span className="text-[11.5px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-slate-200/50 bg-slate-100 text-slate-600">
                                  {typeLabel}
                                </span>
                                {isNew && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold uppercase border border-amber-200 bg-amber-50 text-amber-600">
                                    Nuevo
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-400 flex-shrink-0 hover:text-slate-600 transition-colors p-0.5">
                                <MoreVertical size={14} />
                              </div>
                            </div>

                            <h4 className="text-[15.5px] font-bold text-slate-800 truncate w-full mt-3">
                              {app.alumno_nombre}
                            </h4>

                            <div className="flex items-center gap-1.5 mt-2 text-slate-500 font-medium text-[13.5px]">
                              <Clock size={13} className="text-slate-400 flex-shrink-0" />
                              <span>{fmtTime(app.hora_cita)}</span>
                            </div>

                            <div className="border-t border-slate-100 mt-3 mb-2.5 w-full" />

                            <div className="text-slate-500 font-medium text-[13.5px] truncate w-full">
                              {app.filial_nombre}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom sheet móvil — reemplaza el popover flotante del "+" */}
        {isMobile && plusMenuDate && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setPlusMenuDate(null)}
            />
            {/* Panel deslizante desde abajo */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-250 pb-safe">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-slate-300 rounded-full" />
              </div>
              <div className="px-5 pb-2 pt-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-center">
                  {plusMenuDate ? formatFriendlyDate(plusMenuDate) : ''}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPlusMenuDate(null);
                    handleCreateAppointmentForDate(plusMenuDate!, 'existing');
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 active:bg-emerald-200 transition-all mb-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-800 text-base">Agendar Cita</p>
                    <p className="text-xs text-slate-500 font-medium">Para alumno existente</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlusMenuDate(null);
                    handleCreateAppointmentForDate(plusMenuDate!, 'new');
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 active:bg-indigo-200 transition-all mb-5"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-800 text-base">Agendar Entrevista</p>
                    <p className="text-xs text-slate-500 font-medium">Nuevo prospecto / matrícula</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPlusMenuDate(null)}
                  className="w-full py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm active:bg-slate-200 transition-all mb-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // ---- renderCitas (list) ----
  const filtered = appointments.filter(a => {
    const matchesSearch =
      a.alumno_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.filial_nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    let matchesDate = true;
    if (filterDateMode === 'specific' && filterDateStart) {
      matchesDate = a.fecha_cita === filterDateStart;
    } else if (filterDateMode === 'range' && filterDateStart && filterDateEnd) {
      matchesDate = a.fecha_cita >= filterDateStart && a.fecha_cita <= filterDateEnd;
    }

    let matchesFilial = true;
    if (filterFiliales.length > 0) {
      matchesFilial = filterFiliales.includes(a.id_filial);
    }

    let matchesStatus = true;
    if (filterStatus !== 'ALL') {
      matchesStatus = a.estado === filterStatus;
    }

    return matchesDate && matchesFilial && matchesStatus;
  });

  // ---- renderAppointmentDetailsModal ----
  const renderAppointmentDetailsModal = () => {
    if (!isDetailsModalOpen || !detailsAppointment) return null;

    const alumnoDetalle = alumnos.find(a => a.id === detailsAppointment.id_alumno);
    const apoderadoDetalle = alumnoDetalle ? apoderados.find(apo => apo.id === alumnoDetalle.id_apoderado) : null;
    const isIndependiente = detailsAppointment.tipo_persona === 'independiente' || !alumnoDetalle?.id_apoderado;

    const { days, firstDay } = getDaysInMonth(currentCalendarDate);
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= days; d++) {
      const date = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), d);
      const isPast = date < today;
      const isSelected = selectedDate?.getTime() === date.getTime();

      calendarDays.push(
        <button
          key={d}
          disabled={isPast}
          onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${isPast ? 'text-slate-300 cursor-not-allowed' :
              isSelected ? 'bg-emerald-700 text-white shadow-md scale-105' : 'hover:bg-emerald-50 text-slate-700'}
                `}
        >
          {d}
        </button>
      );
    }
    const availableHours = selectedDate ? getAvailableHours(selectedDate) : [];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl">

          {/* Navigation Buttons (Outside on desktop) */}
          <button onClick={() => handleDetailsNavigation('prev')} className="absolute -left-16 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-xl text-slate-700 hover:text-emerald-600 transition-all z-20 border border-slate-200 hover:scale-105 active:scale-95 hidden md:flex cursor-pointer">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => handleDetailsNavigation('next')} className="absolute -right-16 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-xl text-slate-700 hover:text-emerald-600 transition-all z-20 border border-slate-200 hover:scale-105 active:scale-95 hidden md:flex cursor-pointer">
            <ChevronLeft size={24} className="rotate-180" />
          </button>

          {/* Navigation Buttons (Inside on mobile to prevent clipping) */}
          <button onClick={() => handleDetailsNavigation('prev')} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all z-10 border border-slate-100 md:hidden">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => handleDetailsNavigation('next')} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all z-10 border border-slate-100 md:hidden">
            <ChevronLeft size={20} className="rotate-180" />
          </button>

          {/* Modal Box */}
          <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative animate-in fade-in zoom-in duration-200">

            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
              <div className="flex-1 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm mb-1">
                    <MapPin size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight">{detailsAppointment.filial_nombre}</h3>
                  <StatusBadge status={detailsAppointment.estado} />
                </div>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Información del Contacto según tipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-slate-400 font-black text-[13px] uppercase tracking-widest">
                      <User size={14} /> Datos del Alumno
                    </div>
                    <p className="text-xl font-bold text-slate-800">{detailsAppointment.alumno_nombre}</p>
                    <div className="mt-3 space-y-2 text-xs font-bold text-slate-500">
                      <p>• Edad: <span className="font-extrabold text-slate-700">{alumnoDetalle ? `${alumnoDetalle.edad} años` : 'No especificada'}</span></p>
                      <p>• ID Alumno: <span className="font-extrabold text-slate-700">{detailsAppointment.id_alumno}</span></p>
                    </div>
                  </div>
                  <div className="mt-4">
                    {isIndependiente ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                        Alumno Independiente
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
                        Con Apoderado
                      </span>
                    )}
                  </div>
                </div>

                <div className={`p-5 rounded-3xl border flex flex-col justify-between ${isIndependiente ? 'bg-emerald-50/40 border-emerald-100' : 'bg-blue-50/40 border-blue-100'
                  }`}>
                  <div>
                    <div className={`flex items-center gap-2 mb-3 font-black text-[13px] uppercase tracking-widest ${isIndependiente ? 'text-emerald-500' : 'text-blue-500'
                      }`}>
                      <Phone size={14} /> Datos de Contacto
                    </div>
                    <p className="text-xl font-bold text-slate-800">
                      {isIndependiente ? detailsAppointment.alumno_nombre : (apoderadoDetalle?.nombre_completo || 'Sin apoderado')}
                    </p>
                    <p className="text-[13px] text-slate-400 font-bold uppercase mt-1">
                      {isIndependiente ? 'Contacto Directo (Alumno)' : 'Contacto Apoderado'}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xl font-black text-slate-700">
                      <Phone size={18} className={isIndependiente ? 'text-emerald-500' : 'text-blue-500'} />
                      {isIndependiente ? (alumnoDetalle?.telefono || 'Sin teléfono') : (apoderadoDetalle?.telefono || 'Sin teléfono')}
                    </div>
                    {detailsAppointment.tipo_cita !== 'alumno_existente' && (
                      <div className="mt-2 flex items-center gap-2 text-[15px] font-bold text-slate-600">
                        <Mail size={16} className={isIndependiente ? 'text-emerald-500' : 'text-blue-500'} />
                        <span className="truncate">
                          {isIndependiente ? (alumnoDetalle?.email || 'Sin correo') : (apoderadoDetalle?.email || 'Sin correo')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-5">
                    {((isIndependiente ? alumnoDetalle?.telefono : apoderadoDetalle?.telefono)) ? (
                      <a
                        href={`https://api.whatsapp.com/send?phone=${cleanPhoneNumberForWhatsapp(isIndependiente ? alumnoDetalle?.telefono : apoderadoDetalle?.telefono)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]
                        ${isIndependiente
                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200/50'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200/50'
                          }`}
                      >
                        <MessageCircle size={16} /> Chatear por WhatsApp
                      </a>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} /> Sin número registrado
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="flex flex-col items-center justify-center py-4 border-y border-dashed border-slate-200">
                <div className="flex items-center gap-3 text-slate-800">
                  <CalendarDays size={24} className="text-emerald-600" />
                  <span className="text-2xl font-black capitalize">{formatFriendlyDate(detailsAppointment.fecha_cita)}</span>
                </div>
                <div className="mt-2 px-4 py-1 bg-slate-800 text-white rounded-full font-bold text-lg shadow-lg shadow-slate-200 uppercase tracking-widest">
                  {(() => {
                    const [h, m] = detailsAppointment.hora_cita.split(':').map(Number);
                    const period = h >= 12 ? 'PM' : 'AM';
                    const h12 = h % 12 || 12;
                    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
                  })()}
                </div>
                {detailsAppointment.creado_en && (
                  <p className="text-xs text-slate-400 mt-3 font-semibold">
                    Registrada el {new Date(detailsAppointment.creado_en).toLocaleString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                )}
              </div>

              {/* Gestión del Estado */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-600" /> Gestión de Estado
                </h4>
                <div className="flex items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">Estado Actual</p>
                    <StatusBadge status={detailsAppointment.estado} />
                  </div>
                  <div className="flex gap-2">
                    {isAlumnoExistenteCita(detailsAppointment) ? (
                      <>
                        {detailsAppointment.estado !== AppointmentStatus.PENDIENTE && (
                          <button
                            onClick={() => handleStatusChangeFromModal(AppointmentStatus.PENDIENTE)}
                            className="px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Pendiente
                          </button>
                        )}
                        {detailsAppointment.estado !== AppointmentStatus.ASISTIO && (
                          <button
                            onClick={() => handleStatusChangeFromModal(AppointmentStatus.ASISTIO)}
                            className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Asistió
                          </button>
                        )}
                        {detailsAppointment.estado !== AppointmentStatus.CANCELADO && (
                          <button
                            onClick={() => handleStatusChangeFromModal(AppointmentStatus.CANCELADO)}
                            className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {detailsAppointment.estado !== AppointmentStatus.PENDIENTE && (
                          <button
                            onClick={() => handleStatusChangeFromModal(AppointmentStatus.PENDIENTE)}
                            className="px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Pendiente
                          </button>
                        )}
                        {detailsAppointment.estado !== AppointmentStatus.CONFIRMADO && (
                          <button
                            onClick={() => handleStatusChangeFromModal(AppointmentStatus.CONFIRMADO)}
                            className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Confirmar
                          </button>
                        )}
                        {detailsAppointment.estado !== AppointmentStatus.CONVERTIDO && (
                          <button
                            onClick={() => handleStatusChangeFromModal(AppointmentStatus.CONVERTIDO)}
                            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Convertir
                          </button>
                        )}
                        {detailsAppointment.estado !== AppointmentStatus.CANCELADO && (
                          <button
                            onClick={() => handleStatusChangeFromModal(AppointmentStatus.CANCELADO)}
                            className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Observaciones / Notas */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <FileText size={16} className="text-emerald-600" /> Observaciones / Notas
                </h4>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                  <textarea
                    value={detailsNotes}
                    onChange={(e) => setDetailsNotes(e.target.value)}
                    placeholder="Ingrese observaciones o notas sobre la cita..."
                    className="w-full h-24 p-3 bg-white border border-slate-200 rounded-xl font-medium text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-all placeholder:text-slate-400"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleUpdateNotes}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-100 hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Save size={14} /> Actualizar Notas
                    </button>
                  </div>
                </div>
              </div>

              {/* Reprogramación */}
              <div>
                <button
                  onClick={() => setIsReprogrammingExpanded(!isReprogrammingExpanded)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-200 transition-all group"
                >
                  <span className="font-bold text-slate-700 flex items-center gap-2">
                    <CalendarClock size={18} className="text-blue-500" /> Reprogramar Cita
                  </span>
                  <ChevronLeft size={18} className={`text-slate-400 transition-transform ${isReprogrammingExpanded ? '-rotate-90' : 'rotate-180'}`} />
                </button>

                {isReprogrammingExpanded && (
                  <div className="mt-4 p-5 bg-slate-50 rounded-3xl border border-slate-200 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Mini Calendar */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-3">
                          <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1))} className="p-1 hover:bg-white rounded-lg"><ChevronLeft size={16} /></button>
                          <span className="font-bold text-slate-800 text-sm">{monthNames[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}</span>
                          <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1))} className="p-1 hover:bg-white rounded-lg"><ChevronLeft size={16} className="rotate-180" /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-[13px] text-center font-black text-slate-400 uppercase mb-1">
                          <div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 place-items-center">
                          {calendarDays}
                        </div>
                      </div>

                      {/* Time Slots */}
                      <div className="flex-1 border-l border-slate-200 pl-4">
                        <h5 className="font-bold text-xs text-slate-500 mb-3 uppercase tracking-wide">Horarios Disponibles</h5>
                        {selectedDate ? (
                          <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                            {availableHours.map(hour => (
                              <button
                                key={hour}
                                onClick={() => setSelectedTime(hour)}
                                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${selectedTime === hour ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}`}
                              >
                                {formatHour12(hour)}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-4 text-center">Selecciona un día para ver horarios</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={handleReprogramFromModal}
                        disabled={!selectedDate || !selectedTime}
                        className="px-6 py-2 bg-emerald-600 text-white font-black rounded-xl text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        <Save size={16} /> Guardar Cambios
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200">
        {/* Header con toggle de vista */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Control de Citas</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gestión de la tabla "citas" en Supabase</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
            {/* Toggle Vista Semana / Lista */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 w-full md:w-auto">
              <button
                onClick={() => setCitasView('calendar')}
                className={`px-4 py-2 rounded-lg text-sm font-black transition-all flex-1 md:flex-none ${citasView === 'calendar'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                📅 Semana
              </button>
              <button
                onClick={() => setCitasView('list')}
                className={`px-4 py-2 rounded-lg text-sm font-black transition-all flex-1 md:flex-none ${citasView === 'list'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                ≡ Lista
              </button>
            </div>
            {/* Botones de acción: apilados en móvil (uno sobre otro), en fila en desktop */}
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  resetAppointmentFields();
                  setSchedulingFlow('existing');
                  setIsModalOpen(true);
                }}
                className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-all shadow-md cursor-pointer w-full md:w-auto"
              >
                <Plus size={16} /> Agendar Cita
              </button>
              <button
                onClick={() => {
                  resetAppointmentFields();
                  setSchedulingFlow('new');
                  setIsModalOpen(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-1.5 hover:bg-indigo-700 transition-all shadow-md cursor-pointer w-full md:w-auto"
              >
                <Plus size={16} /> Agendar Entrevista
              </button>
            </div>
          </div>
        </div>

        {/* Vista Calendario Semanal */}
        {citasView === 'calendar' && renderCitasCalendar()}

        {/* Vista Lista */}
        {citasView === 'list' && (
          <>
            <div className="px-6 pt-4">
              {renderFilters()}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-slate-500 text-[13px] font-black uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left">Alumno</th>
                    <th className="px-6 py-4 text-left">Filial</th>
                    <th className="px-6 py-4 text-left">Programación</th>
                    <th className="px-6 py-4 text-left">Registro</th>
                    <th className="px-6 py-4 text-center">Estado Operativo</th>
                    <th className="px-6 py-4 text-right">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filtered.length > 0 ? filtered.map(app => {
                    const al = alumnos.find(a => a.id === app.id_alumno);
                    const isExistente = isAlumnoExistenteCita(app);
                    const isInd = app.tipo_persona === 'independiente' || app.tipo_persona === 'existente_independiente' || !al?.id_apoderado;
                    const isNew = app.creado_en && (new Date().getTime() - new Date(app.creado_en).getTime() < 12 * 60 * 60 * 1000);

                    const rowClass = isExistente
                      ? 'bg-emerald-50/10 hover:bg-emerald-50/45 transition-colors group'
                      : 'bg-indigo-50/10 hover:bg-indigo-50/30 transition-colors group';

                    return (
                      <tr key={app.id} className={rowClass}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-black text-slate-800 leading-none text-[15px]">{app.alumno_nombre}</p>
                            {isNew && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm shadow-amber-200 animate-pulse">
                                <Sparkles size={9} /> Nuevo
                              </span>
                            )}
                            {isExistente ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-black uppercase tracking-wider bg-emerald-100/80 text-emerald-800 border border-emerald-200/50 shadow-sm">
                                Cita
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-black uppercase tracking-wider bg-indigo-100/80 text-indigo-800 border border-indigo-200/50 shadow-sm">
                                Entrevista
                              </span>
                            )}
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
                              {isInd ? 'Indep.' : 'Apod.'}
                            </span>
                          </div>
                          <p className="text-[13px] text-slate-400 font-bold mt-1.5 uppercase">ID: {app.id_alumno}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                            <MapPin size={14} className={isExistente ? 'text-emerald-500' : 'text-indigo-500'} />
                            {app.filial_nombre}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-black text-slate-700 capitalize">{formatFriendlyDate(app.fecha_cita)}</div>
                          <div className={`text-[14px] font-black inline-block px-1.5 rounded mt-1 shadow-sm border ${isExistente
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                            : 'text-indigo-600 bg-indigo-50 border-indigo-100'
                            }`}>{app.hora_cita}</div>
                        </td>
                        <td className="px-6 py-5 text-[13px] text-slate-500 font-bold">
                          {app.creado_en ? new Date(app.creado_en).toLocaleString('es-PE') : '—'}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <StatusBadge status={app.estado} />
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => openAppointmentDetails(app)}
                            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ml-auto transition-all border cursor-pointer ${isExistente
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-150'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-150'
                              }`}
                          >
                            <Eye size={16} /> Ver Cita
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                        No se encontraron registros de citas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {renderAppointmentDetailsModal()}

      {/* Modal Agendar Cita / Entrevista */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetAppointmentFields();
        }}
        title={isConfirmingSave ? 'Confirmar Registro' : (editingItem ? `Editar ${editingItem.nombre || 'Registro'}` : (schedulingFlow === 'existing' ? 'Agendar Cita' : 'Agendar Entrevista'))}
        maxWidth={schedulingFlow === 'new' && !isConfirmingSave ? "max-w-[820px]" : "max-w-lg"}
      >
        {isConfirmingSave && pendingBookingPayload ? (
          /* Pantalla de Confirmación */
          <div className="space-y-5">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm font-semibold flex gap-2">
              <Info size={20} className="flex-shrink-0 mt-0.5 text-amber-600" />
              <p>
                Por favor, revise los detalles a registrar antes de guardar permanentemente en la base de datos Supabase.
              </p>
            </div>

            <div className="divide-y divide-slate-100 space-y-4">
              {/* Detalles de la cita */}
              <div className="space-y-2">
                <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Detalles de la Cita</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-slate-500 font-bold">Filial/Sede:</p>
                  <p className="text-slate-800 font-black">
                    {filiales.find(f => f.id === pendingBookingPayload.filialId)?.nombre || '—'}
                  </p>
                  <p className="text-slate-500 font-bold">Fecha programada:</p>
                  <p className="text-slate-800 font-black">{formatFriendlyDate(pendingBookingPayload.fecha_cita)}</p>
                  <p className="text-slate-500 font-bold">Hora agendada:</p>
                  <p className="text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block w-fit text-xs">
                    {pendingBookingPayload.hora_cita}
                  </p>
                </div>
              </div>

              {/* Detalles de personas */}
              <div className="pt-4 space-y-2">
                <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Alumnos y Contacto</h4>
                <div className="text-sm space-y-2">
                  {pendingBookingPayload.flow === 'existing' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-slate-500 font-bold">Tipo:</p>
                      <p className="text-blue-600 font-black">Cita (Alumno Existente)</p>
                      <p className="text-slate-500 font-bold">Alumno:</p>
                      <p className="text-slate-800 font-black">
                        {alumnos.find(al => al.id === pendingBookingPayload.alumnoId)?.nombre_completo || '—'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-slate-500 font-bold">Tipo:</p>
                        <p className="text-emerald-600 font-black font-extrabold">Entrevista (Matrícula Nueva)</p>

                        <p className="text-slate-500 font-bold">Tipo:</p>
                        <p className="text-slate-800 font-black capitalize">
                          {pendingBookingPayload.newStudentType === 'independent' ? 'Independiente' : 'Con Apoderado'}
                        </p>

                        {pendingBookingPayload.newStudentType === 'dependent' && (
                          <>
                            <p className="text-slate-500 font-bold">Apoderado:</p>
                            <p className="text-slate-800 font-black">{pendingBookingPayload.apoderadoNombre}</p>
                          </>
                        )}

                        <p className="text-slate-500 font-bold">Teléfono/Celular:</p>
                        <p className="text-slate-800 font-black">{pendingBookingPayload.apoderadoTelefono}</p>
                        {pendingBookingPayload.apoderadoEmail && (
                          <>
                            <p className="text-slate-500 font-bold">Correo:</p>
                            <p className="text-slate-800 font-black">{pendingBookingPayload.apoderadoEmail}</p>
                          </>
                        )}
                      </div>
                      <div className="border-t border-slate-100 pt-2.5">
                        <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">Hijos/Alumnos a registrar:</p>
                        <div className="space-y-1.5">
                          {pendingBookingPayload.newStudents.map((st: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-700">
                              <span>{st.nombre_completo}</span>
                              <span className="text-slate-400">{st.edad} años</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              {pendingBookingPayload.observaciones && (
                <div className="pt-4 space-y-2">
                  <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Observaciones / Notas</h4>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 italic">
                    "{pendingBookingPayload.observaciones}"
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmingSave(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                Seguir Editando
              </button>
              <button
                type="button"
                onClick={() => handleAddAppointment(pendingBookingPayload)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
              >
                Confirmar y Guardar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {schedulingFlow === 'existing' ? (
              /* Flow A: Alumno Existente */
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sede / Filial</label>
                  <select
                    value={selectedFilialId || ''}
                    onChange={(e) => {
                      setSelectedFilialId(Number(e.target.value) || null);
                      setSelectedAlumnoId(null);
                      setSearchStudentTerm('');
                    }}
                    className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm transition-all"
                  >
                    <option value="" disabled>Seleccione una filial...</option>
                    {filiales.length > 0 ? filiales.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>) : <option disabled>No hay filiales activas</option>}
                  </select>
                </div>

                {selectedFilialId ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Buscador predictivo */}
                    <div className="relative">
                      <label className="block text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Buscar Alumno</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          placeholder="Escriba el nombre del alumno..."
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm"
                          value={searchStudentTerm}
                          onChange={(e) => {
                            setSearchStudentTerm(e.target.value);
                            setIsStudentDropdownOpen(true);
                            if (selectedAlumnoId) setSelectedAlumnoId(null);
                          }}
                          onFocus={() => setIsStudentDropdownOpen(true)}
                        />
                      </div>

                      {/* Dropdown predictivo de alumnos */}
                      {isStudentDropdownOpen && searchStudentTerm.trim() !== '' && (
                        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-50 divide-y divide-slate-100">
                          {matchedAlumnos.length > 0 ? (
                            matchedAlumnos.map(al => (
                              <button
                                key={al.id}
                                type="button"
                                onClick={() => {
                                  setSelectedAlumnoId(al.id);
                                  setSearchStudentTerm(al.nombre_completo);
                                  setIsStudentDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 font-bold text-sm text-slate-700 transition-colors flex items-center justify-between"
                              >
                                <span>{al.nombre_completo}</span>
                                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                                  {al.id_apoderado ? 'Con Apoderado' : 'Independiente'}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-center text-slate-400 text-xs font-bold italic">
                              No se encontraron alumnos disponibles
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Panel de Información del Alumno Seleccionado */}
                    {selectedAlumnoId && (
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-inner space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Tipo de Alumno:</span>
                          {(() => {
                            const al = alumnos.find(a => a.id === selectedAlumnoId);
                            const apo = al && al.id_apoderado ? apoderados.find(ap => ap.id === al.id_apoderado) : null;
                            const isInd = al ? !al.id_apoderado : true;
                            return (
                              <>
                                {isInd ? (
                                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                    Independiente
                                  </span>
                                ) : (
                                  <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                    Con Apoderado
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        {(() => {
                          const al = alumnos.find(a => a.id === selectedAlumnoId);
                          const apo = al && al.id_apoderado ? apoderados.find(ap => ap.id === al.id_apoderado) : null;
                          if (apo) {
                            return (
                              <div className="text-xs font-bold text-slate-600 space-y-1">
                                <p>• Apoderado: <span className="font-extrabold text-slate-700">{apo.nombre_completo}</span></p>
                                <p>• Teléfono Apoderado: <span className="font-extrabold text-slate-700">{apo.telefono}</span></p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}

                    {/* Fecha y Hora de la cita */}
                    <div className={preselectedDate ? "grid grid-cols-1" : "grid grid-cols-2 gap-4"}>
                      {!preselectedDate && (
                        <div>
                          <label className="block text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fecha</label>
                          <input
                            type="date"
                            required
                            className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Hora</label>
                        <select
                          required
                          className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm"
                          value={appointmentTime}
                          onChange={(e) => setAppointmentTime(e.target.value)}
                        >
                          <option value="" disabled>Seleccione hora...</option>
                          {getAvailableHoursForDateStr(appointmentDate).map((h) => (
                            <option key={h} value={h}>
                              {formatHour12(h)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                      <label className="block text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Observaciones / Notas</label>
                      <textarea
                        placeholder="Ingrese observaciones o anotaciones sobre la cita (ej. dificultad del alumno, comentarios)..."
                        rows={3}
                        className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 shadow-sm text-sm"
                        value={appointmentObservaciones}
                        onChange={(e) => setAppointmentObservaciones(e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedAlumnoId || !appointmentDate || !appointmentTime) {
                          alert("Por favor, complete todos los campos requeridos.");
                          return;
                        }
                        setPendingBookingPayload({
                          flow: 'existing',
                          filialId: selectedFilialId,
                          alumnoId: selectedAlumnoId,
                          fecha_cita: appointmentDate,
                          hora_cita: appointmentTime,
                          observaciones: appointmentObservaciones
                        });
                        setIsConfirmingSave(true);
                      }}
                      className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-md hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs mt-4 cursor-pointer"
                    >
                      Agendar Cita
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-10 font-bold text-xs uppercase tracking-wider border border-dashed border-slate-200 rounded-3xl">
                    Seleccione una sede para buscar alumnos
                  </div>
                )}
              </div>
            ) : (
              /* Flow B: Matrícula Nueva */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna Izquierda: Datos del Formulario */}
                <div className="space-y-4">
                  {/* Tipo de alumno nuevo */}
                  <div>
                    <label className="block text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipo de Alumno Nuevo</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewStudentType('dependent')}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${newStudentType === 'dependent'
                          ? 'border-blue-500 bg-blue-50/50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                          }`}
                      >
                        <input
                          type="radio"
                          checked={newStudentType === 'dependent'}
                          onChange={() => { }}
                          className="pointer-events-none"
                        />
                        <div className="text-left">
                          <p className="font-bold text-sm">Dependiente</p>
                          <p className="text-[12px] text-slate-400 font-semibold leading-tight mt-0.5">Tiene apoderado</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewStudentType('independent');
                          setNewStudents([{ nombre_completo: '', edad: '' }]);
                        }}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${newStudentType === 'independent'
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                          }`}
                      >
                        <input
                          type="radio"
                          checked={newStudentType === 'independent'}
                          onChange={() => { }}
                          className="pointer-events-none"
                        />
                        <div className="text-left">
                          <p className="font-bold text-sm">Independiente</p>
                          <p className="text-[12px] text-slate-400 font-semibold leading-tight mt-0.5">Contacto propio</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Datos del Apoderado - sólo si es Dependiente */}
                  {newStudentType === 'dependent' ? (
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3 shadow-inner">
                      <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/50 pb-1.5">Datos del Apoderado (Contacto Principal)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                          <input
                            type="text"
                            required
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-800 shadow-sm"
                            placeholder="Ej. Maria Garcia"
                            value={apoderadoNombre}
                            onChange={(e) => setApoderadoNombre(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Celular de Contacto</label>
                          <input
                            type="text"
                            required
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-800 shadow-sm"
                            placeholder="Ej. 987654321"
                            value={apoderadoTelefono}
                            onChange={(e) => setApoderadoTelefono(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Electrónico</label>
                          <input
                            type="email"
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-800 shadow-sm"
                            placeholder="Ej. maria@ejemplo.com"
                            value={apoderadoEmail}
                            onChange={(e) => setApoderadoEmail(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Celular y Correo de Contacto directo si es independiente */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Celular de Contacto</label>
                        <input
                          type="text"
                          required
                          className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm"
                          placeholder="Ej. 999888777"
                          value={apoderadoTelefono}
                          onChange={(e) => setApoderadoTelefono(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Correo Electrónico</label>
                        <input
                          type="email"
                          className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm"
                          placeholder="Ej. correo@ejemplo.com"
                          value={apoderadoEmail}
                          onChange={(e) => setApoderadoEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Campos dinámicos de los Alumnos */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-[13px] font-black text-slate-400 uppercase tracking-widest">
                        {newStudentType === 'dependent' ? 'Datos de los Alumnos (Hijos)' : 'Datos del Alumno'}
                      </label>
                      {newStudentType === 'dependent' && (
                        <button
                          type="button"
                          onClick={() => setNewStudents([...newStudents, { nombre_completo: '', edad: '' }])}
                          className="text-xs font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                        >
                          <Plus size={12} /> Añadir hijo
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {newStudents.map((st, idx) => (
                        <div key={idx} className="flex gap-2 items-end p-3.5 bg-slate-50 border border-slate-100 rounded-xl relative group">
                          <div className="flex-1 space-y-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
                            <input
                              type="text"
                              required
                              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-800 shadow-sm"
                              placeholder="Ej. Luis Garcia"
                              value={st.nombre_completo}
                              onChange={(e) => {
                                const updated = [...newStudents];
                                updated[idx].nombre_completo = e.target.value;
                                setNewStudents(updated);
                              }}
                            />
                          </div>
                          <div className="w-20 space-y-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Edad</label>
                            <input
                              type="number"
                              required
                              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-800 shadow-sm"
                              placeholder="Edad"
                              value={st.edad}
                              onChange={(e) => {
                                const updated = [...newStudents];
                                updated[idx].edad = e.target.value;
                                setNewStudents(updated);
                              }}
                            />
                          </div>
                          {newStudents.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setNewStudents(newStudents.filter((_, i) => i !== idx))}
                              className="p-2.5 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all flex items-center justify-center cursor-pointer mb-0.5"
                              title="Quitar"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sede / Filial */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Sede / Filial</label>
                    <select
                      value={selectedFilialId || ''}
                      onChange={(e) => setSelectedFilialId(Number(e.target.value) || null)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-slate-800 shadow-sm"
                    >
                      <option value="" disabled>Seleccione...</option>
                      {filiales.length > 0 ? filiales.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>) : <option disabled>No hay filiales activas</option>}
                    </select>
                  </div>
                </div>

                {/* Columna Derecha: Calendario y Cinta Horaria */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fecha de la Entrevista</label>
                    {renderMiniFormCalendar()}
                  </div>
                  <div>
                    {renderHorizontalHourRibbon()}
                  </div>
                </div>

                {/* Botón Guardar - col-span-2 en pantallas grandes */}
                <div className="md:col-span-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedFilialId || !appointmentDate || !appointmentTime || !apoderadoTelefono) {
                        alert("Por favor, complete todos los campos de contacto, filial, fecha y hora.");
                        return;
                      }
                      if (newStudentType === 'dependent' && !apoderadoNombre) {
                        alert("Por favor, complete el nombre del apoderado.");
                        return;
                      }
                      const hasEmptyStudent = newStudents.some(st => !st.nombre_completo || !st.edad);
                      if (hasEmptyStudent) {
                        alert("Por favor, complete los datos de todos los alumnos.");
                        return;
                      }

                      setPendingBookingPayload({
                        flow: 'new',
                        newStudentType,
                        apoderadoNombre,
                        apoderadoTelefono,
                        apoderadoEmail,
                        newStudents,
                        filialId: selectedFilialId,
                        fecha_cita: appointmentDate,
                        hora_cita: appointmentTime,
                        observaciones: ''
                      });
                      setIsConfirmingSave(true);
                    }}
                    className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-md hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs cursor-pointer"
                  >
                    Agendar Entrevista
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};
