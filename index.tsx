
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Users,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Plus,
  Trash2,
  ChevronRight,
  Home,
  Phone,
  Info,
  X,
  Edit,
  Power,
  Navigation,
  Loader2,
  RefreshCw,
  GraduationCap,
  CalendarClock,
  ChevronLeft,
  Eye,
  Save,
  PhoneCall,
  User,
  CalendarDays,
  Sparkles,
  CheckCircle,
  ImageIcon,
  GripVertical,
  Upload,
  Images,
  Palette
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AppointmentStatus, Appointment, Alumno, Filial, Stats, Apoderado, MensajeWsp } from './types';

// Configuración de Supabase proporcionada por el usuario
const SUPABASE_URL = 'https://jtrugvxgztnxbhwjtiou.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cnVndnhnenRueGJod2p0aW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDQxMTksImV4cCI6MjA4NzcyMDExOX0.Kw-SMk8ABVNfFEeYoN8oDgbpDv7Uk_cDN23IccH7zoM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Components Reutilizables ---

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  color: 'blue' | 'emerald' | 'amber' | 'purple'
}> = ({ title, value, icon, trend, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color].split(' ')[0]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className={`text-xs font-black uppercase px-2 py-1 rounded-lg ${colorMap[color]}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">{title}</p>
        <h4 className="text-4xl font-black text-slate-800 leading-none">{value}</h4>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
  const configs = {
    [AppointmentStatus.PENDING]: { label: 'Pendiente', classes: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={12} /> },
    [AppointmentStatus.VERIFIED]: { label: 'Verificado', classes: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={12} /> },
    [AppointmentStatus.CANCELLED]: { label: 'Cancelado', classes: 'bg-rose-50 text-rose-600 border-rose-100', icon: <XCircle size={12} /> }
  };
  const config = configs[status] || configs[AppointmentStatus.PENDING];
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-tight border ${config.classes}`}>
      {config.icon} {config.label}
    </span>
  );
};

const ConfirmAlert: React.FC<{ config: any; onClose: () => void }> = ({ config, onClose }) => {
  if (!config?.isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/80 backdrop-blur-xl rounded-[20px] w-full max-w-[270px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/50">
        <div className="p-5 pt-6 text-center">
          <h3 className="text-[17px] font-bold text-slate-900 mb-1 leading-snug">{config.title}</h3>
          <p className="text-[13px] text-slate-600 leading-tight px-1 font-medium">{config.message}</p>
        </div>
        <div className="flex border-t border-slate-200/60 mt-1">
          {!config.isAlertOnly && (
            <>
              <button 
                onClick={() => { config.onCancel?.(); onClose(); }} 
                className="flex-1 py-3 text-[17px] text-blue-500 hover:bg-slate-100/50 transition-colors font-medium"
              >
                {config.cancelText || 'Cancelar'}
              </button>
              <div className="w-[1px] bg-slate-200/60"></div>
            </>
          )}
          <button 
            onClick={() => { if (config.onConfirm) config.onConfirm(); onClose(); }} 
            className={`flex-1 py-3 text-[17px] transition-colors font-semibold ${config.isDestructive ? 'text-rose-500 hover:bg-rose-50/50' : 'text-blue-500 hover:bg-slate-100/50'}`}
          >
            {config.confirmText || 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- App Principal ---

// --- Tipos locales ---
interface ColorCorporativo { id: number; nombre: string; clase_css: string; hex: string; activo: boolean; }
interface Historia { id: number; nombre_alumno: string; programa: string; narracion: string; palabras_por_min: string; foto_path: string | null; foto_position: string | null; foto_scale: number | null; id_color: number | null; activo: boolean; orden: number; created_at: string; }
interface Carrusel02Imagen { id: number; nombre: string; file_path: string; orden: number; activo: boolean; foto_position: string | null; foto_scale: number | null; created_at: string; }

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'citas' | 'alumnos' | 'filiales' | 'apoderados' | 'historias' | 'carrusel02'>('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [filiales, setFiliales] = useState<Filial[]>([]);
  const [apoderados, setApoderados] = useState<Apoderado[]>([]);
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [coloresCorporativos, setColoresCorporativos] = useState<ColorCorporativo[]>([]);
  
  // --- Estado Gestion Colores ---
  const [isColorManagerOpen, setIsColorManagerOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<ColorCorporativo | null>(null);
  const [colorFormNombre, setColorFormNombre] = useState('');
  const [colorFormHex, setColorFormHex] = useState('#10b981');
  const [colorFormClaseCss, setColorFormClaseCss] = useState('');
  
  const [isHistoriaModalOpen, setIsHistoriaModalOpen] = useState(false);
  const [editingHistoria, setEditingHistoria] = useState<Historia | null>(null);
  const [historiaFotoPreview, setHistoriaFotoPreview] = useState<string | null>(null);
  const [historiaFotoFile, setHistoriaFotoFile] = useState<File | null>(null);
  const [historiaColorSeleccionado, setHistoriaColorSeleccionado] = useState<number | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  // --- Estado Carrusel 02 ---
  const [carrusel02, setCarrusel02] = useState<Carrusel02Imagen[]>([]);
  const [isCarrusel02ModalOpen, setIsCarrusel02ModalOpen] = useState(false);
  const [carrusel02Editing, setCarrusel02Editing] = useState<Carrusel02Imagen | null>(null);
  const [carrusel02File, setCarrusel02File] = useState<File | null>(null);
  const [carrusel02Preview, setCarrusel02Preview] = useState<string | null>(null);
  const [carrusel02Uploading, setCarrusel02Uploading] = useState(false);
  const [carrusel02DragOver, setCarrusel02DragOver] = useState<number | null>(null);
  const carrusel02DragRef = React.useRef<number | null>(null);
  const carrusel02FileInputRef = React.useRef<HTMLInputElement>(null);
  // Ajuste de imagen Carrusel 02
  const [carrusel02PosX, setCarrusel02PosX] = useState(50);
  const [carrusel02PosY, setCarrusel02PosY] = useState(50);
  const [carrusel02Scale, setCarrusel02Scale] = useState(1.0);
  const [isCarrusel02AjusteOpen, setIsCarrusel02AjusteOpen] = useState(false);

  // Estados para imagen de Filial
  const [filialFile, setFilialFile] = useState<File | null>(null);
  const [filialPreview, setFilialPreview] = useState<string | null>(null);
  const [filialPosX, setFilialPosX] = useState(50);
  const [filialPosY, setFilialPosY] = useState(50);
  const [filialScale, setFilialScale] = useState(1.0);
  const [isFilialAjusteOpen, setIsFilialAjusteOpen] = useState(false);
  const [uploadingFilial, setUploadingFilial] = useState(false);
  const filialFileInputRef = React.useRef<HTMLInputElement>(null);

  // Estados para Mensajes WSP
  const [mensajesWsp, setMensajesWsp] = useState<MensajeWsp[]>([]);
  const [isMensajesModalOpen, setIsMensajesModalOpen] = useState(false);
  const [isEditMensajeOpen, setIsEditMensajeOpen] = useState(false);
  const [editingMensaje, setEditingMensaje] = useState<MensajeWsp | null>(null);
  const [availableFiliales, setAvailableFiliales] = useState<Filial[]>([]);
  const [selectedFiliales, setSelectedFiliales] = useState<Filial[]>([]);
  const [draggingItem, setDraggingItem] = useState<{ id: number, nombre: string, source: string } | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  // Adjuster state
  const [isAjusteOpen, setIsAjusteOpen] = useState(false);
  const [ajustePosX, setAjustePosX] = useState(50);
  const [ajustePosY, setAjustePosY] = useState(50);
  const [ajusteScale, setAjusteScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);


  // Rescheduling State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleApp, setRescheduleApp] = useState<Appointment | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date()); // For calendar navigation
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Filter State
  const [filterDateMode, setFilterDateMode] = useState<'all' | 'specific' | 'range'>('all');
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');
  const [filterFiliales, setFilterFiliales] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isFilialDropdownOpen, setIsFilialDropdownOpen] = useState(false);

  // Ref for click outside helper could be added here, but for simplicity we'll toggle


  // New Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsAppointment, setDetailsAppointment] = useState<Appointment | null>(null);
  const [isReprogrammingExpanded, setIsReprogrammingExpanded] = useState(false);

  // Alert State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  // Fetch inicial de datos
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [alRes, filRes, appRes, apoRes, histRes, colorRes, c02Res, msgRes] = await Promise.all([
        supabase.from('alumnos').select('*').order('creado_en', { ascending: false }),
        supabase.from('filiales').select('*').order('nombre', { ascending: true }),
        supabase.from('citas').select(`
          *,
          alumnos!citas_id_alumno_fkey (nombre_completo),
          filiales!citas_id_filial_fkey (nombre)
        `).order('creado_en', { ascending: false }),
        supabase.from('apoderados').select('*').order('creado_en', { ascending: false }),
        supabase.from('historias_transformacion').select('*').order('orden', { ascending: true }),
        supabase.from('colores_corporativos').select('*').eq('activo', true).order('nombre', { ascending: true }),
        supabase.from('carrusel_02_imagenes').select('*').order('orden', { ascending: true }),
        supabase.from('mensajes_wsp').select('*').order('created_at', { ascending: false })
      ]);

      if (alRes.error) console.error('[FETCH] Error alumnos:', alRes.error.message);
      if (filRes.error) console.error('[FETCH] Error filiales:', filRes.error.message);
      if (appRes.error) console.error('[FETCH] Error citas:', appRes.error.message);
      if (apoRes.error) console.error('[FETCH] Error apoderados:', apoRes.error.message);
      if (msgRes.error) console.error('[FETCH] Error mensajes wsp:', msgRes.error.message);

      if (alRes.data) setAlumnos(alRes.data);
      if (filRes.data) setFiliales(filRes.data);
      if (apoRes.data) setApoderados(apoRes.data);
      if (histRes.data) setHistorias(histRes.data);
      if (colorRes.data) setColoresCorporativos(colorRes.data);
      if (c02Res.data) setCarrusel02(c02Res.data);
      if (msgRes.data) setMensajesWsp(msgRes.data);
      if (appRes.data) {
        const transformedApps = appRes.data.map((a: any) => {
          // Manejo robusto: Supabase puede devolver un objeto o un array si la relación es 1:N (aunque sea FK)
          const alumnoData = Array.isArray(a.alumnos) ? a.alumnos[0] : a.alumnos;
          const filialData = Array.isArray(a.filiales) ? a.filiales[0] : a.filiales;

          return {
            ...a,
            estado: a.estado?.toUpperCase(),
            alumno_nombre: alumnoData?.nombre_completo || 'Sin nombre',
            filial_nombre: filialData?.nombre || 'Sin sede'
          };
        });
        setAppointments(transformedApps);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Estadísticas globales
  const stats = useMemo((): Stats => {
    const total = appointments.length;
    const verified = appointments.filter(a => a.estado === AppointmentStatus.VERIFIED).length;
    const pending = appointments.filter(a => a.estado === AppointmentStatus.PENDING).length;
    return {
      totalAppointments: total,
      verifiedCount: verified,
      pendingCount: pending,
      conversionRate: total > 0 ? (verified / total) * 100 : 0
    };
  }, [appointments]);

  // --- Handlers de Citas (Persistencia Real en Supabase) ---

  const handleUpdateAppointmentStatus = async (id: number, status: AppointmentStatus) => {
    console.log(`Intentando actualizar cita ID: ${id} a estado: ${status}`);
    const { data, error } = await supabase.from('citas').update({ estado: status }).eq('id', id).select();

    if (error) {
      console.error("Error Supabase:", error);
      alert("Error al actualizar el estado: " + error.message);
    } else {
      if (!data || data.length === 0) {
        console.warn("La actualización no retornó datos. Es posible que el ID no exista o falten permisos RLS.");
        alert("Alerta: El sistema reportó éxito pero no se confirmó el cambio en la base de datos. Verifica permisos.");
      } else {
        console.log("Actualización exitosa:", data);
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, estado: status } : a));
      }
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    setAlertConfig({
      isOpen: true,
      title: 'Eliminar Cita',
      message: '¿Seguro que desea eliminar esta cita permanentemente?',
      confirmText: 'Eliminar',
      isDestructive: true,
      onConfirm: async () => {
        const { error } = await supabase.from('citas').delete().eq('id', id);
        if (!error) {
          setAppointments(prev => prev.filter(a => a.id !== id));
        } else {
          setAlertConfig({ isOpen: true, title: 'Error', message: "Error al eliminar la cita: " + error.message, isAlertOnly: true, confirmText: 'Aceptar' });
        }
      }
    });
  };

  const handleAddAppointment = async (newApp: any) => {
    const payload = {
      id_alumno: Number(newApp.id_alumno),
      id_filial: Number(newApp.id_filial),
      fecha_cita: newApp.fecha_cita,
      hora_cita: newApp.hora_cita,
      tipo_persona: newApp.tipo_persona || 'dependiente',
      estado: AppointmentStatus.PENDING
    };

    const { data, error } = await supabase
      .from('citas')
      .insert([payload])
      .select(`
        *,
        alumnos!citas_id_alumno_fkey (nombre_completo),
        filiales!citas_id_filial_fkey (nombre)
      `)
      .single();

    if (!error && data) {
      const transformed = {
        ...data,
        alumno_nombre: data.alumnos?.nombre_completo,
        filial_nombre: data.filiales?.nombre
      };
      setAppointments([transformed, ...appointments]);
      setIsModalOpen(false);
    } else {
      alert("Error al crear la cita: " + (error?.message || "Error desconocido"));
    }
  };

  // --- Handlers de Alumnos ---

  const handleAddAlumno = async (newAl: any) => {
    const esDependiente = newAl.tipo_alumno === 'dependiente';
    const payload: any = {
      nombre_completo: newAl.nombre_completo,
      edad: Number(newAl.edad),
      telefono: esDependiente ? '' : newAl.telefono,
      id_apoderado: esDependiente ? Number(newAl.id_apoderado) : null
    };
    const { data, error } = await supabase.from('alumnos').insert([payload]).select().single();
    if (!error && data) {
      setAlumnos([data, ...alumnos]);
      setIsModalOpen(false);
    } else {
      alert("Error al registrar alumno: " + (error?.message || "Error desconocido"));
    }
  };

  // --- Handlers de Apoderados ---

  const handleAddApoderado = async (newAp: any) => {
    const payload = {
      nombre_completo: newAp.nombre_completo,
      telefono: newAp.telefono
    };
    const { data, error } = await supabase.from('apoderados').insert([payload]).select().single();
    if (!error && data) {
      setApoderados([data, ...apoderados]);
      setIsModalOpen(false);
    } else {
      alert("Error al registrar apoderado: " + (error?.message || "Error desconocido"));
    }
  };

  const handleDeleteApoderado = async (id: number) => {
    if (confirm('¿Seguro que desea eliminar este apoderado? Esto podría afectar a los alumnos asociados.')) {
      const { error } = await supabase.from('apoderados').delete().eq('id', id);
      if (!error) {
        setApoderados(prev => prev.filter(a => a.id !== id));
      } else {
        alert("Error al eliminar apoderado: " + error.message);
      }
    }
  };

  const handleDeleteAlumno = async (id: number) => {
    if (confirm('¿Seguro que desea eliminar este alumno? Se eliminarán también sus citas.')) {
      const { error } = await supabase.from('alumnos').delete().eq('id', id);
      if (!error) {
        setAlumnos(prev => prev.filter(al => al.id !== id));
        setAppointments(prev => prev.filter(app => app.id_alumno !== id));
      } else {
        alert("Error al eliminar alumno: " + error.message);
      }
    }
  };

  // --- Handlers de Filiales ---

  const handleAddOrUpdateFilial = async (data: any) => {
    const foto_position = `${filialPosX}% ${filialPosY}%`;
    const foto_scale = filialScale;

    const payloadBase = {
      nombre: data.nombre,
      departamento: data.departamento,
      provincia: data.provincia,
      distrito: data.distrito,
      direccion: data.direccion,
      referencia: data.referencia,
      telefono_fijo: data.telefono_fijo,
      telefono_movil: data.telefono_movil,
      activo: editingItem ? (data.activo === 'on' || data.activo === true) : true,
      foto_position: foto_position,
      foto_scale: foto_scale
    };

    const uploadImageIfNecessary = async (): Promise<string | null | undefined> => {
      if (!filialFile) return undefined; // No new file
      setUploadingFilial(true);
      const fileExt = filialFile.name.split('.').pop();
      const safeName = data.nombre.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const fileName = `${safeName}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('Filiales')
        .upload(fileName, filialFile);

      setUploadingFilial(false);

      if (uploadError) {
        alert("Error al subir imagen de filial: " + uploadError.message);
        throw new Error(uploadError.message);
      }
      
      const { data: publicUrlData } = supabase.storage.from('Filiales').getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    };

    if (editingItem) {
      setAlertConfig({
        isOpen: true,
        title: 'Guardar Edición',
        message: `¿Guardar los cambios en "${data.nombre}"?`,
        confirmText: 'Guardar',
        onConfirm: async () => {
          try {
            const newFilePath = await uploadImageIfNecessary();
            const payload = { 
              ...payloadBase, 
              file_path: newFilePath !== undefined ? newFilePath : editingItem.file_path || null 
            };
            const { data: updated, error } = await supabase.from('filiales').update(payload).eq('id', editingItem.id).select().single();
            if (!error && updated) {
              setFiliales(prev => prev.map(f => f.id === updated.id ? updated : f));
              setEditingItem(null);
              setIsModalOpen(false);
            } else {
              alert("Error al actualizar filial: " + error?.message);
            }
          } catch (e) {
            // Error ya manejado en uploadImageIfNecessary
          }
        }
      });
    } else {
      try {
        const newFilePath = await uploadImageIfNecessary();
        const payload = { 
          ...payloadBase, 
          file_path: newFilePath || null 
        };
        const { data: created, error } = await supabase.from('filiales').insert([payload]).select().single();
        if (!error && created) {
          setFiliales([created, ...filiales]);
          setIsModalOpen(false);
        } else {
          alert("Error al crear filial: " + error?.message);
        }
      } catch (e) {
        // Error ya manejado
      }
    }
  };



  const toggleFilialStatus = async (id: number, currentStatus: boolean) => {
    if (currentStatus) { // Va a desactivar
      setAlertConfig({
        isOpen: true,
        title: 'Desactivar Filial',
        message: '¿Estás seguro de que deseas desactivar esta filial?',
        confirmText: 'Desactivar',
        isDestructive: true,
        onConfirm: async () => {
          const { error } = await supabase.from('filiales').update({ activo: !currentStatus }).eq('id', id);
          if (!error) {
            setFiliales(prev => prev.map(f => f.id === id ? { ...f, activo: !currentStatus } : f));
          }
        }
      });
    } else {
      const { error } = await supabase.from('filiales').update({ activo: !currentStatus }).eq('id', id);
      if (!error) {
        setFiliales(prev => prev.map(f => f.id === id ? { ...f, activo: !currentStatus } : f));
      }
    }
  };

  const openEditFilial = (filial: Filial) => {
    setEditingItem(filial);
    setIsModalOpen(true);
    setFilialFile(null);
    setFilialPreview(filial.file_path || null);
    if (filial.foto_position) {
      const parts = filial.foto_position.split(' ');
      setFilialPosX(parseFloat(parts[0]) || 50);
      setFilialPosY(parseFloat(parts[1]) || 50);
    } else {
      setFilialPosX(50);
      setFilialPosY(50);
    }
    setFilialScale(filial.foto_scale ?? 1.0);
    setIsFilialAjusteOpen(false);
    if (filialFileInputRef.current) filialFileInputRef.current.value = '';
  };

  const openNewFilial = () => {
    setEditingItem(null);
    setIsModalOpen(true);
    setFilialFile(null);
    setFilialPreview(null);
    setFilialPosX(50);
    setFilialPosY(50);
    setFilialScale(1.0);
    setIsFilialAjusteOpen(false);
    if (filialFileInputRef.current) filialFileInputRef.current.value = '';
  };

  // --- Handlers Mensajes WSP ---

  const openMensajesGestor = () => {
    setIsMensajesModalOpen(true);
  };

  const openNewMensaje = () => {
    const freeFiliales = filiales.filter(f => f.id_mensaje_wsp === null);
    if (freeFiliales.length === 0 && filiales.length > 0) {
      setAlertConfig({
        isOpen: true,
        title: 'Límite Alcanzado',
        message: 'Todas las filiales ya tienen un mensaje asignado. No puedes crear nuevos mensajes hasta liberar alguna.',
        confirmText: 'Entendido',
        isAlertOnly: true,
        onConfirm: () => setAlertConfig(null)
      });
      return;
    }
    setEditingMensaje(null);
    setAvailableFiliales(freeFiliales);
    setSelectedFiliales([]);
    setIsEditMensajeOpen(true);
  };

  const openEditMensaje = (msg: MensajeWsp) => {
    setEditingMensaje(msg);
    const assigned = filiales.filter(f => f.id_mensaje_wsp === msg.id);
    const free = filiales.filter(f => f.id_mensaje_wsp === null);
    setSelectedFiliales(assigned);
    setAvailableFiliales(free);
    setIsEditMensajeOpen(true);
  };

  const handleDeleteMensaje = (msg: MensajeWsp) => {
    setAlertConfig({
      isOpen: true,
      title: 'Eliminar Mensaje',
      message: `¿Seguro que deseas eliminar el mensaje "${msg.titulo}"? Las filiales asociadas quedarán sin mensaje.`,
      confirmText: 'Eliminar',
      isDestructive: true,
      onConfirm: async () => {
        const { error } = await supabase.from('mensajes_wsp').delete().eq('id', msg.id);
        if (!error) {
          setMensajesWsp(prev => prev.filter(m => m.id !== msg.id));
          setFiliales(prev => prev.map(f => f.id_mensaje_wsp === msg.id ? { ...f, id_mensaje_wsp: null } : f));
        } else {
          alert('Error al eliminar mensaje: ' + error.message);
        }
      }
    });
  };

  const handleSaveMensaje = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const titulo = fd.get('titulo') as string;
    const contenido = fd.get('contenido') as string;

    const payload = { titulo, contenido };

    setAlertConfig({
      isOpen: true,
      title: editingMensaje ? 'Guardar Cambios' : 'Crear Mensaje',
      message: `¿Estás seguro de ${editingMensaje ? 'actualizar' : 'crear'} este mensaje y asignar las filiales seleccionadas?`,
      confirmText: 'Guardar',
      onConfirm: async () => {
        let msgId = editingMensaje?.id;

        if (editingMensaje) {
          const { error } = await supabase.from('mensajes_wsp').update(payload).eq('id', msgId);
          if (error) { alert('Error actualizando mensaje: ' + error.message); return; }
          setMensajesWsp(prev => prev.map(m => m.id === msgId ? { ...m, ...payload } : m));
        } else {
          const { data, error } = await supabase.from('mensajes_wsp').insert([payload]).select().single();
          if (error) { alert('Error creando mensaje: ' + error.message); return; }
          msgId = data.id;
          setMensajesWsp([data, ...mensajesWsp]);
        }

        const previouslyAssigned = filiales.filter(f => f.id_mensaje_wsp === msgId);
        const removedFiliales = previouslyAssigned.filter(pa => !selectedFiliales.some(sf => sf.id === pa.id));
        const newFiliales = selectedFiliales.filter(sf => sf.id_mensaje_wsp !== msgId);

        if (removedFiliales.length > 0) {
          const removedIds = removedFiliales.map(f => f.id);
          await supabase.from('filiales').update({ id_mensaje_wsp: null }).in('id', removedIds);
        }
        if (newFiliales.length > 0) {
          const newIds = newFiliales.map(f => f.id);
          await supabase.from('filiales').update({ id_mensaje_wsp: msgId }).in('id', newIds);
        }

        setFiliales(prev => prev.map(f => {
          if (removedFiliales.some(rf => rf.id === f.id)) return { ...f, id_mensaje_wsp: null };
          if (selectedFiliales.some(sf => sf.id === f.id)) return { ...f, id_mensaje_wsp: msgId as number };
          return f;
        }));

        setIsEditMensajeOpen(false);
      }
    });
  };

  const onDragStartMensaje = (e: React.DragEvent, filial: Filial, source: 'available' | 'selected') => {
    // Esconder la imagen por defecto
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(emptyImg, 0, 0);

    e.dataTransfer.setData('filialId', filial.id.toString());
    e.dataTransfer.setData('source', source);
    e.dataTransfer.effectAllowed = 'move';

    setDraggingItem({ id: filial.id, nombre: filial.nombre, source });
    setDragPos({ x: e.clientX, y: e.clientY });

    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.classList.add('opacity-30', 'border-dashed');
    }, 0);
  };

  const onDragMensaje = (e: React.DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) return; // Ignorar el último evento en 0,0
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const onDragEndMensaje = (e: React.DragEvent) => {
    setDraggingItem(null);
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('opacity-30', 'border-dashed');
  };

  const onDragOverMensaje = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDropMensaje = (e: React.DragEvent, target: 'available' | 'selected') => {
    const filialId = parseInt(e.dataTransfer.getData('filialId'));
    const source = e.dataTransfer.getData('source');

    if (source === target) return;

    let filial: Filial | undefined;
    if (source === 'available') {
      filial = availableFiliales.find(f => f.id === filialId);
      if (filial) {
        setAvailableFiliales(prev => prev.filter(f => f.id !== filialId));
        setSelectedFiliales(prev => [...prev, filial!]);
      }
    } else {
      filial = selectedFiliales.find(f => f.id === filialId);
      if (filial) {
        setSelectedFiliales(prev => prev.filter(f => f.id !== filialId));
        setAvailableFiliales(prev => [...prev, filial!]);
      }
    }
  };

  const selectAllFilialesMensaje = () => {
    setSelectedFiliales(prev => [...prev, ...availableFiliales]);
    setAvailableFiliales([]);
  };

  const deselectAllFilialesMensaje = () => {
    setAvailableFiliales(prev => [...prev, ...selectedFiliales]);
    setSelectedFiliales([]);
  };

  // --- Handlers de Reprogramación ---

  const openRescheduleModal = (app: Appointment) => {
    setRescheduleApp(app);
    setCurrentCalendarDate(new Date());
    setSelectedDate(null);
    setSelectedTime(null);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleConfirm = async () => {
    if (!rescheduleApp || !selectedDate || !selectedTime) return;

    setAlertConfig({
      isOpen: true,
      title: 'Reprogramar Cita',
      message: '¿Confirmar reprogramación de la cita?',
      confirmText: 'Reprogramar',
      onConfirm: async () => {
        // Formato YYYY-MM-DD
        const dateStr = selectedDate.toISOString().split('T')[0];

        const { error } = await supabase
          .from('citas')
          .update({ fecha_cita: dateStr, hora_cita: selectedTime, estado: AppointmentStatus.PENDING })
          .eq('id', rescheduleApp.id);

        if (!error) {
          setAppointments(prev => prev.map(a => a.id === rescheduleApp.id ? { ...a, fecha_cita: dateStr, hora_cita: selectedTime, estado: AppointmentStatus.PENDING } : a));
          setIsRescheduleModalOpen(false);
          setAlertConfig({ isOpen: true, title: 'Éxito', message: 'Cita reprogramada con éxito', isAlertOnly: true, confirmText: 'Aceptar' });
        } else {
          setAlertConfig({ isOpen: true, title: 'Error', message: "Error al reprogramar: " + error.message, isAlertOnly: true, confirmText: 'Aceptar' });
        }
      }
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    return { days, firstDay };
  };

  const getAvailableHours = (date: Date) => {
    const day = date.getDay(); // 0 = Sun, 1 = Mon ...
    const hours = [];

    // Logic: Lunes(1) a Cita(5): 9-12 y 15-19
    // Sabado(6): Igual (asumo por "lunes a sabado")
    // Domingo(0): 9-15

    if (day === 0) {
      // Domingo 9am - 3pm (15:00)
      for (let i = 9; i <= 15; i++) hours.push(`${i}:00`);
    } else {
      // Lun-Sab
      // 9am - 12pm
      for (let i = 9; i <= 12; i++) hours.push(`${i}:00`);
      // 3pm (15) - 7pm (19)
      for (let i = 15; i <= 19; i++) hours.push(`${i}:00`);
    }
    return hours;
  };

  const formatFriendlyDate = (dateStr: string) => {
    // Asegurar que la fecha se interprete correctamente en zona horaria local o la deseada
    // dateStr llega como YYYY-MM-DD
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const formatted = new Intl.DateTimeFormat('es-ES', options).format(date);

    // Capitalizar primera letra (lunes -> Lunes)
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-sm">Sincronizando con Supabase...</p>
      </div>
    );
  }

  // --- Renderers de Vistas ---

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Citas" value={stats.totalAppointments} icon={<Calendar className="text-blue-500" />} trend="Histórico" color="blue" />
        <StatCard title="Verificadas" value={stats.verifiedCount} icon={<CheckCircle2 className="text-emerald-500" />} trend={`${((stats.verifiedCount / Math.max(stats.totalAppointments, 1)) * 100).toFixed(1)}% del total`} color="emerald" />
        <StatCard title="Pendientes" value={stats.pendingCount} icon={<Clock className="text-amber-500" />} trend={`${((stats.pendingCount / Math.max(stats.totalAppointments, 1)) * 100).toFixed(1)}% del total`} color="amber" />
        <StatCard title="Conversión" value={`${stats.conversionRate.toFixed(1)}%`} icon={<ArrowUpRight className="text-purple-500" />} trend="Meta: 80%" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card rounded-3xl p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Citas Recientes</h3>
            <button onClick={() => setActiveView('citas')} className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:underline">
              Ver todas <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {appointments.length > 0 ? appointments.slice(0, 4).map(app => (
              <div key={app.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600 font-bold border border-slate-100">
                    {app.alumno_nombre?.[0] || 'A'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{app.alumno_nombre}</p>
                    <p className="text-xs text-slate-400 font-medium">{app.fecha_cita} • {app.hora_cita}</p>
                  </div>
                </div>
                <StatusBadge status={app.estado} />
              </div>
            )) : <p className="text-center text-slate-400 py-10 font-medium italic">No hay actividad reciente</p>}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Alumnos Recientes</h3>
          <div className="space-y-4">
            {alumnos.length > 0 ? alumnos.slice(0, 4).map(al => (
              <div key={al.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    {al.nombre_completo[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{al.nombre_completo}</p>
                    <p className="text-xs text-slate-400 font-medium">{al.edad} años • {al.telefono}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                  <Info size={18} />
                </button>
              </div>
            )) : <p className="text-center text-slate-400 py-10 font-medium italic">No hay alumnos registrados</p>}
          </div>
          <button onClick={() => setActiveView('alumnos')} className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 text-slate-400 font-bold rounded-2xl hover:border-emerald-200 hover:text-emerald-600 transition-all">
            Ver directorio completo
          </button>
        </div>
      </div>
    </>
  );


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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</label>
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
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Desde"
                  />
                  <input
                    type="date"
                    value={filterDateEnd}
                    onChange={(e) => setFilterDateEnd(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Hasta"
                  />
                </div>
              )}
            </div>

            {/* Filtro de Filiales (Multi-select) */}
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filiales</label>
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
                      <button onClick={() => setFilterFiliales([])} className="text-[10px] font-bold text-rose-500 hover:underline">Borrar</button>
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="ALL">Todos los estados</option>
                <option value={AppointmentStatus.PENDING}>Pendiente</option>
                <option value={AppointmentStatus.VERIFIED}>Verificado</option>
                <option value={AppointmentStatus.CANCELLED}>Cancelado</option>
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

  const renderCitas = () => {
    const filtered = appointments.filter(a => {
      // 1. Search Term
      const matchesSearch =
        a.alumno_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.filial_nombre?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Date Filter
      let matchesDate = true;
      if (filterDateMode === 'specific' && filterDateStart) {
        matchesDate = a.fecha_cita === filterDateStart;
      } else if (filterDateMode === 'range' && filterDateStart && filterDateEnd) {
        matchesDate = a.fecha_cita >= filterDateStart && a.fecha_cita <= filterDateEnd;
      }

      // 3. Filial Filter
      let matchesFilial = true;
      if (filterFiliales.length > 0) {
        matchesFilial = filterFiliales.includes(a.id_filial);
      }

      // 4. Status Filter
      let matchesStatus = true;
      if (filterStatus !== 'ALL') {
        matchesStatus = a.estado === filterStatus;
      }

      return matchesDate && matchesFilial && matchesStatus;
    });

    return (
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Control de Citas</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gestión de la tabla "citas" en Supabase</p>
          </div>
          <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 btn-glow">
            <Plus size={18} /> Agendar Cita
          </button>
        </div>

        {/* Render Filters Here */}
        <div className="px-6 pt-4">
          {renderFilters()}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left">Alumno</th>
                <th className="px-6 py-4 text-left">Filial</th>
                <th className="px-6 py-4 text-left">Programación</th>
                <th className="px-6 py-4 text-center">Estado Operativo</th>
                <th className="px-6 py-4 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length > 0 ? filtered.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-800 leading-none">{app.alumno_nombre}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">ID: {app.id_alumno}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                      <MapPin size={14} className="text-emerald-500" />
                      {app.filial_nombre}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-black text-slate-700 capitalize">{formatFriendlyDate(app.fecha_cita)}</div>
                    <div className="text-[11px] text-emerald-600 font-black bg-emerald-50 inline-block px-1.5 rounded mt-1 shadow-sm border border-emerald-100">{app.hora_cita}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <StatusBadge status={app.estado} />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => openAppointmentDetails(app)}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 rounded-xl font-bold text-xs flex items-center gap-2 ml-auto transition-all"
                    >
                      <Eye size={16} /> Ver Cita
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No se encontraron registros de citas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAlumnos = () => {
    const filtered = alumnos.filter(al => al.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-xl font-bold text-slate-800">Directorio de Alumnos</h3>
          <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
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
                      <span className="font-bold text-slate-800">{al.nombre_completo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{al.edad} años</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {al.id_apoderado && !al.telefono ? (
                      <span className="text-slate-300 font-bold">—</span>
                    ) : al.telefono ? (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        {al.telefono}
                      </div>
                    ) : (
                      <span className="text-slate-300 font-bold">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-bold uppercase">{new Date(al.creado_en).toLocaleDateString()}</td>
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

  const renderFiliales = () => {
    const filtered = filiales.filter(f =>
      f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.distrito.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.provincia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.direccion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Sedes y Sucursales</h3>
            <p className="text-sm text-slate-500 mt-1">Gestiona los locales y sus mensajes predeterminados</p>
          </div>
          <button onClick={openMensajesGestor} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-100 transition-colors shadow-sm">
            <Sparkles size={18} /> Gestionar Mensajes WhatsApp
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(filial => (
          <div key={filial.id} className="glass-card rounded-3xl p-6 border border-slate-200 relative overflow-hidden group flex flex-col h-full">
            <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${filial.activo ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
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
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Dirección</p>
                  <p className="text-sm text-slate-700 font-medium">{filial.direccion}</p>
                  {filial.referencia && <p className="text-[11px] text-slate-400 font-medium italic">Ref: {filial.referencia}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Celular</p>
                  <p className="text-sm text-slate-700 font-bold flex items-center gap-1">
                    <Phone size={12} className="text-emerald-500" /> {filial.telefono_movil}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Tel. Fijo</p>
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
    );
  };

  const renderRescheduleModal = () => {
    if (!isRescheduleModalOpen || !rescheduleApp) return null;

    const { days, firstDay } = getDaysInMonth(currentCalendarDate);
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    // Generate calendar grid
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
                ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-200 scale-110 !ring-0' // Selected: darker, no hover effect needed
                : 'hover:bg-emerald-50 text-slate-700' // Normal state
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
            <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs font-black text-slate-400 uppercase">
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
                  {hour}
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
          <button onClick={() => setIsRescheduleModalOpen(false)} className="px-5 py-2.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
          <button
            onClick={handleRescheduleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="px-5 py-2.5 rounded-2xl font-black bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Confirmar Cambio
          </button>
        </div>
      </Modal>
    );
  };

  const renderApoderados = () => {
    const filtered = apoderados.filter(ap => ap.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()));
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
                  <td className="px-6 py-4 text-slate-600 flex items-center gap-2 font-medium">
                    <Phone size={14} className="text-slate-400" /> {ap.telefono}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-bold uppercase">{new Date(ap.creado_en).toLocaleDateString()}</td>
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

  // --- New Appointment Details Modal Functions ---

  const openAppointmentDetails = (app: Appointment) => {
    setDetailsAppointment(app);
    setIsDetailsModalOpen(true);
    setIsReprogrammingExpanded(false);
    // Reset calendar selection in case reprogramming is opened
    setCurrentCalendarDate(new Date());
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDetailsNavigation = (direction: 'next' | 'prev') => {
    if (!detailsAppointment) return;
    const currentIndex = appointments.findIndex(a => a.id === detailsAppointment.id);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex < appointments.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : appointments.length - 1;
    }

    // Reset reprogramming state when switching
    setIsReprogrammingExpanded(false);
    setSelectedDate(null);
    setSelectedTime(null);
    setDetailsAppointment(appointments[newIndex]);
  };

  const handleStatusChangeFromModal = async (newStatus: AppointmentStatus) => {
    if (!detailsAppointment) return;

    setAlertConfig({
      isOpen: true,
      title: 'Cambiar Estado',
      message: `¿Está seguro de cambiar el estado a ${newStatus}?`,
      confirmText: 'Confirmar',
      onConfirm: async () => {
        await handleUpdateAppointmentStatus(detailsAppointment.id, newStatus);
        // Update local state is handled in handleUpdateAppointmentStatus via setAppointments
        // We also need to update the currently viewed details appointment
        setDetailsAppointment(prev => prev ? { ...prev, estado: newStatus } : null);
      }
    });
  };

  const handleReprogramFromModal = async () => {
    if (!detailsAppointment || !selectedDate || !selectedTime) return;

    setAlertConfig({
      isOpen: true,
      title: 'Confirmar Reprogramación',
      message: '¿Confirmar reprogramación de la cita?',
      confirmText: 'Reprogramar',
      onConfirm: async () => {
        // Formato YYYY-MM-DD usando fecha local
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const { error } = await supabase
          .from('citas')
          .update({ fecha_cita: dateStr, hora_cita: selectedTime, estado: AppointmentStatus.PENDING })
          .eq('id', detailsAppointment.id);

        if (!error) {
          const updatedApp = { ...detailsAppointment, fecha_cita: dateStr, hora_cita: selectedTime, estado: AppointmentStatus.PENDING };
          setAppointments(prev => prev.map(a => a.id === detailsAppointment.id ? updatedApp : a));
          setDetailsAppointment(updatedApp);
          setIsReprogrammingExpanded(false);
          setAlertConfig({ isOpen: true, title: 'Éxito', message: 'Cita reprogramada con éxito', isAlertOnly: true, confirmText: 'Aceptar' });
        } else {
          setAlertConfig({ isOpen: true, title: 'Error', message: "Error al reprogramar: " + error.message, isAlertOnly: true, confirmText: 'Aceptar' });
        }
      }
    });
  };

  const renderAppointmentDetailsModal = () => {
    if (!isDetailsModalOpen || !detailsAppointment) return null;

    const alumnoDetalle = alumnos.find(a => a.id === detailsAppointment.id_alumno);
    const apoderadoDetalle = alumnoDetalle ? apoderados.find(apo => apo.id === alumnoDetalle.id_apoderado) : null;

    // Calendar logic for reprogramming (reusing existing helpers)
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
        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative animate-in fade-in zoom-in duration-200">

          {/* Navigation Buttons */}
          <button onClick={() => handleDetailsNavigation('prev')} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all z-10 border border-slate-100">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => handleDetailsNavigation('next')} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all z-10 border border-slate-100">
            <ChevronLeft size={24} className="rotate-180" />
          </button>

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
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-3 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                  <User size={14} /> Datos del Alumno
                </div>
                <p className="text-lg font-bold text-slate-800">{detailsAppointment.alumno_nombre}</p>
                {detailsAppointment.tipo_persona === 'independiente' ? (
                  <div className="mt-2 flex items-center gap-2 text-xl font-black text-slate-700">
                    <Phone size={18} className="text-emerald-500" />
                    {alumnoDetalle?.telefono || 'Sin teléfono'}
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest">
                    <Users size={13} className="text-blue-400" /> Contacto vía apoderado
                  </div>
                )}
                {alumnoDetalle && (
                  <p className="text-xs text-slate-400 mt-1">Edad: {alumnoDetalle.edad} años</p>
                )}
              </div>

              {detailsAppointment.tipo_persona !== 'independiente' ? (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                    <Users size={14} /> Datos del Apoderado
                  </div>
                  {apoderadoDetalle ? (
                    <>
                      <p className="text-lg font-bold text-slate-800">{apoderadoDetalle.nombre_completo}</p>
                      <div className="mt-2 flex items-center gap-2 text-xl font-black text-slate-700">
                        <PhoneCall size={18} className="text-blue-500" />
                        {apoderadoDetalle.telefono}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Información no disponible</p>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col justify-center items-center text-center">
                  <User size={28} className="text-emerald-400 mb-2" />
                  <p className="text-sm font-bold text-emerald-700">Alumno Independiente</p>
                  <p className="text-xs text-slate-400 mt-1">Sin apoderado asignado</p>
                </div>
              )}
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
                  {detailsAppointment.estado !== AppointmentStatus.VERIFIED && (
                    <button
                      onClick={() => handleStatusChangeFromModal(AppointmentStatus.VERIFIED)}
                      className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 text-xs font-bold transition-colors"
                    >
                      Confirmar
                    </button>
                  )}
                  {detailsAppointment.estado !== AppointmentStatus.CANCELLED && (
                    <button
                      onClick={() => handleStatusChangeFromModal(AppointmentStatus.CANCELLED)}
                      className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 text-xs font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
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
                      <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-black text-slate-400 uppercase mb-1">
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
                              {hour}
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
    );
  };


  // --- Handlers de Historias ---

  const getFotoUrl = (foto_path: string | null): string | null =>
    foto_path ? SUPABASE_URL + '/storage/v1/object/public/Testimonios/' + foto_path : null;

  const handleToggleHistoriaActiva = async (h: Historia) => {
    if (h.activo) { // Va a desactivar
      setAlertConfig({
        isOpen: true,
        title: 'Desactivar Historia',
        message: '¿Estás seguro de que deseas desactivar esta historia?',
        confirmText: 'Desactivar',
        isDestructive: true,
        onConfirm: async () => {
          const { error } = await supabase.from('historias_transformacion').update({ activo: !h.activo }).eq('id', h.id);
          if (!error) setHistorias(prev => prev.map(x => x.id === h.id ? { ...x, activo: !h.activo } : x));
          else alert('Error: ' + error.message);
        }
      });
    } else {
      const { error } = await supabase.from('historias_transformacion').update({ activo: !h.activo }).eq('id', h.id);
      if (!error) setHistorias(prev => prev.map(x => x.id === h.id ? { ...x, activo: !h.activo } : x));
      else alert('Error: ' + error.message);
    }
  };

  const handleDeleteHistoria = (h: Historia) => {
    setAlertConfig({
      isOpen: true,
      title: 'Eliminar Historia',
      message: '\u00bfEliminar la historia de "' + h.nombre_alumno + '"? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      isDestructive: true,
      onConfirm: async () => {
        const { error } = await supabase.from('historias_transformacion').delete().eq('id', h.id);
        if (!error) setHistorias(prev => prev.filter(x => x.id !== h.id));
        else alert('Error al eliminar: ' + error.message);
      }
    });
  };

  const openHistoriaModal = (h: Historia | null) => {
    setEditingHistoria(h);
    setHistoriaFotoPreview(h?.foto_path ? getFotoUrl(h.foto_path) : null);
    setHistoriaFotoFile(null);
    setHistoriaColorSeleccionado(h?.id_color ?? null);
    setIsAjusteOpen(false);
    // Restore saved position/scale
    if (h?.foto_position) {
      const parts = h.foto_position.split(' ');
      setAjustePosX(parseFloat(parts[0]) || 50);
      setAjustePosY(parseFloat(parts[1]) || 50);
    } else {
      setAjustePosX(50);
      setAjustePosY(50);
    }
    setAjusteScale(h?.foto_scale ?? 1.0);
    setIsHistoriaModalOpen(true);
  };

  const handleSaveHistoria = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    // ⚠️ Leer TODOS los valores del form ANTES de cualquier await
    // porque React anula ev.currentTarget después del primer yield async
    const fd = new FormData(ev.currentTarget);
    const activoChecked = (ev.currentTarget.querySelector('[name="activo"]') as HTMLInputElement | null)?.checked ?? true;
    let foto_path = editingHistoria?.foto_path ?? null;
    if (historiaFotoFile) {
      setUploadingFoto(true);
      try {
        // 1. Convertir a WebP usando Canvas
        const webpBlob = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          const objectUrl = URL.createObjectURL(historiaFotoFile);
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const canvas = document.createElement('canvas');
            // Máximo 800px de ancho manteniendo proporción
            const maxW = 800;
            const scale = img.width > maxW ? maxW / img.width : 1;
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('No canvas context')); return; }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('No se pudo convertir a WebP'));
            }, 'image/webp', 0.85);
          };
          img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
          img.src = objectUrl;
        });

        // 2. Subir al bucket en la carpeta Testimonio/
        const baseName = historiaFotoFile.name.replace(/\.[^/.]+$/, '');
        const nombreArchivo = Date.now() + '_' + baseName + '.webp';
        const { error: upErr } = await supabase.storage
          .from('Testimonios')
          .upload(nombreArchivo, webpBlob, { upsert: true, contentType: 'image/webp' });

        if (upErr) { alert('Error al subir foto: ' + upErr.message); setUploadingFoto(false); return; }
        foto_path = nombreArchivo;
      } catch (err: any) {
        alert('Error al procesar imagen: ' + err.message);
        setUploadingFoto(false);
        return;
      }
      setUploadingFoto(false);
    }
    const payload: any = {
      nombre_alumno: fd.get('nombre_alumno'),
      programa: fd.get('programa'),
      narracion: fd.get('narracion'),
      palabras_por_min: fd.get('palabras_por_min'),
      orden: Number(fd.get('orden')) || 0,
      id_color: historiaColorSeleccionado,
      activo: activoChecked,
      foto_path,
      foto_position: `${ajustePosX}% ${ajustePosY}%`,
      foto_scale: ajusteScale,
    };
    if (editingHistoria) {
      setAlertConfig({
        isOpen: true,
        title: 'Guardar Edición',
        message: `¿Guardar los cambios en "${payload.nombre_alumno}"?`,
        confirmText: 'Guardar',
        onConfirm: async () => {
          const { error, status, statusText } = await supabase.from('historias_transformacion').update(payload).eq('id', editingHistoria.id);
          console.log('[UPDATE Historia] id:', editingHistoria.id, '| status:', status, statusText, '| error:', error);
          if (!error) {
            setHistorias(prev => prev.map(x => x.id === editingHistoria.id ? { ...x, ...payload } : x));
            setIsHistoriaModalOpen(false);
          } else alert('Error al actualizar: ' + error.message + ' (code: ' + error.code + ')');
        }
      });
    } else {
      const { data, error } = await supabase.from('historias_transformacion').insert([payload]).select().single();
      if (!error && data) { setHistorias(prev => [data, ...prev]); setIsHistoriaModalOpen(false); }
      else alert('Error al crear: ' + error?.message);
    }
  };

  const openColorModal = (c: ColorCorporativo | null) => {
    setEditingColor(c);
    setColorFormNombre(c?.nombre ?? '');
    setColorFormHex(c?.hex ?? '#10b981');
    setColorFormClaseCss(c?.clase_css ?? '');
  };

  const checkColorInUse = async (colorId: number): Promise<boolean> => {
    const { data, error } = await supabase
      .from('historias_transformacion')
      .select('id')
      .eq('id_color', colorId)
      .limit(1);
    if (error) { console.error(error); return false; }
    return !!(data && data.length > 0);
  };

  const handleSaveColor = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre: colorFormNombre,
      hex: colorFormHex,
      clase_css: colorFormClaseCss || `bg-[${colorFormHex}]`,
      activo: true
    };

    if (editingColor) {
      const inUse = await checkColorInUse(editingColor.id);
      if (inUse) {
        setAlertConfig({
          isOpen: true,
          title: 'Acción no permitida',
          message: 'Este color está siendo usado en testimonios. No se puede editar.',
          isAlertOnly: true,
          confirmText: 'Aceptar'
        });
        return;
      }
      setAlertConfig({
        isOpen: true,
        title: 'Guardar Color',
        message: `¿Guardar los cambios en el color "${colorFormNombre}"?`,
        confirmText: 'Guardar',
        onConfirm: async () => {
          const { error } = await supabase.from('colores_corporativos').update(payload).eq('id', editingColor.id);
          if (!error) {
            setColoresCorporativos(prev => prev.map(c => c.id === editingColor.id ? { ...c, ...payload } : c));
            openColorModal(null);
          } else alert('Error al actualizar color: ' + error.message);
        }
      });
    } else {
      setAlertConfig({
        isOpen: true,
        title: 'Añadir Color',
        message: `¿Crear el nuevo color "${colorFormNombre}"?`,
        confirmText: 'Añadir',
        onConfirm: async () => {
          const { data, error } = await supabase.from('colores_corporativos').insert([payload]).select().single();
          if (!error && data) {
            setColoresCorporativos(prev => [...prev, data]);
            openColorModal(null);
          } else alert('Error al crear color: ' + error?.message);
        }
      });
    }
  };

  const handleDeleteColor = async (color: ColorCorporativo) => {
    const inUse = await checkColorInUse(color.id);
    if (inUse) {
      setAlertConfig({
        isOpen: true,
        title: 'Acción no permitida',
        message: `El color "${color.nombre}" está siendo usado en testimonios. No se puede eliminar hasta que se desvincule.`,
        isAlertOnly: true,
        confirmText: 'Aceptar'
      });
      return;
    }
    setAlertConfig({
      isOpen: true,
      title: 'Eliminar Color',
      message: `¿Eliminar el color "${color.nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      isDestructive: true,
      onConfirm: async () => {
        const { error } = await supabase.from('colores_corporativos').delete().eq('id', color.id);
        if (!error) {
          setColoresCorporativos(prev => prev.filter(c => c.id !== color.id));
        } else alert('Error al eliminar color: ' + error.message);
      }
    });
  };

  const renderHistorias = () => {
    const filtered = historias.filter(h => h.nombre_alumno.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div className="space-y-6">
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Historias de Transformaci&#243;n</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Testimonios del carrusel p&#250;blico</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsColorManagerOpen(true)} className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                <Palette size={18} className="text-emerald-500" /> Gestionar Colores
              </button>
              <button onClick={() => openHistoriaModal(null)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                <Plus size={18} /> Nueva Historia
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
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
                        <span className={'px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-tight border ' + (h.programa === 'Profesional' ? 'bg-purple-50 text-purple-600 border-purple-100' : h.programa === 'Kids' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100')}>
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
                      <td className="px-6 py-4 text-center font-black text-slate-700">{h.orden}</td>
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
    );
  };

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
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Alumno</label>
                <input name="nombre_alumno" required defaultValue={editingHistoria?.nombre_alumno} className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="Ej. Mar&#237;a L&#243;pez" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Programa</label>
                <select name="programa" required defaultValue={editingHistoria?.programa ?? ''} className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm">
                  <option value="">Seleccionar...</option>
                  <option>Profesional</option>
                  <option>Kids</option>
                  <option>PreKids</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Narraci&#243;n / Testimonio <span className="text-slate-300 font-medium normal-case">(m&#225;x. 300 car.)</span></label>
                <textarea name="narracion" required maxLength={300} defaultValue={editingHistoria?.narracion} rows={4} className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm resize-none" placeholder="Testimonio del alumno..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Palabras por Minuto</label>
                  <input name="palabras_por_min" required defaultValue={editingHistoria?.palabras_por_min} className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="e.g. 1,200 ppm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Orden en Carrusel</label>
                  <input name="orden" type="number" min={0} defaultValue={editingHistoria?.orden ?? 0} className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" />
                </div>
              </div>
              {coloresCorporativos.length > 0 && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Color de Fondo</label>
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
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Foto del Alumno</label>
                {/* File input + Ajustar button */}
                <div className="flex items-center gap-2 mb-3">
                  <input type="file" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setHistoriaFotoFile(f); setHistoriaFotoPreview(URL.createObjectURL(f)); setAjustePosX(50); setAjustePosY(50); setAjusteScale(1.0); setIsAjusteOpen(false); }
                  }} className="flex-1 text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
                  {historiaFotoPreview && (
                    <button type="button" onClick={() => setIsAjusteOpen(v => !v)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${isAjusteOpen ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
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
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-sm">3 : 2</div>
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">{ajustePosX}% · {ajustePosY}%</div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white/70 text-[9px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">Arrastra para mover el enfoque</div>
                    </div>
                    <div className="bg-slate-900 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-white/60 text-[10px] font-black uppercase tracking-widest w-12">Zoom</span>
                        <input type="range" min="1" max="2.5" step="0.05" value={ajusteScale} onChange={(e) => setAjusteScale(parseFloat(e.target.value))} className="flex-1 accent-emerald-400 cursor-pointer" />
                        <span className="text-white/80 text-xs font-black w-10 text-right">{ajusteScale.toFixed(2)}x</span>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setAjustePosX(50); setAjustePosY(50); setAjusteScale(1.0); }}
                          className="flex-1 py-2 text-xs font-bold text-white/60 hover:text-white border border-white/10 rounded-xl transition-colors">Restablecer</button>
                        <button type="button" onClick={() => setIsAjusteOpen(false)}
                          className="flex-1 py-2 text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-colors">✓ Guardar ajuste</button>
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
              <button type="submit" disabled={uploadingFoto} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs mt-2 disabled:opacity-60 flex items-center justify-center gap-2">
                {uploadingFoto ? <><Loader2 size={16} className="animate-spin" /> Subiendo foto...</> : <><Sparkles size={16} /> {editingHistoria ? 'Guardar Cambios' : 'Crear Historia'}</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // --- Helpers Carrusel 02 ---
  const getCarrusel02Url = (file_path: string): string => {
    const { data } = supabase.storage.from('carrusel_02').getPublicUrl(file_path);
    return data.publicUrl;
  };

  const convertToWebPBlob = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        const maxW = 1200;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('No canvas context')); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Conversión fallida')), 'image/webp', 0.88);
      };
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      img.src = objectUrl;
    });

  const openCarrusel02Modal = (img: Carrusel02Imagen | null) => {
    setCarrusel02Editing(img);
    setCarrusel02File(null);
    setIsCarrusel02AjusteOpen(false);
    setCarrusel02Preview(img ? getCarrusel02Url(img.file_path) : null);
    if (img?.foto_position) {
      const parts = img.foto_position.split(' ');
      setCarrusel02PosX(parseFloat(parts[0]) || 50);
      setCarrusel02PosY(parseFloat(parts[1]) || 50);
    } else { setCarrusel02PosX(50); setCarrusel02PosY(50); }
    setCarrusel02Scale(img?.foto_scale ?? 1.0);
    setIsCarrusel02ModalOpen(true);
  };

  const handleCarrusel02Save = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    // Leer el formulario ANTES de cualquier operación async (React invalida ev.currentTarget después)
    const fd = new FormData(ev.currentTarget);
    const nombre = (fd.get('nombre') as string || '').trim();

    if (!carrusel02File && !carrusel02Editing) { alert('Selecciona una imagen.'); return; }

    // Capturar estado en el momento del submit para los closures
    const foto_position = `${carrusel02PosX}% ${carrusel02PosY}%`;
    const foto_scale    = carrusel02Scale;
    const editingSnap   = carrusel02Editing;
    const fileSnap      = carrusel02File;

    if (editingSnap) {
      // --- EDICIÓN: confirmar primero, luego subir y guardar ---
      setAlertConfig({
        isOpen: true,
        title: fileSnap ? 'Reemplazar y Guardar' : 'Guardar Cambios',
        message: fileSnap
          ? `¿Reemplazar la imagen y guardar cambios en "${nombre || editingSnap.nombre}"?`
          : `¿Guardar los cambios en "${nombre || editingSnap.nombre}"?`,
        confirmText: 'Guardar',
        onConfirm: async () => {
          setCarrusel02Uploading(true);
          try {
            let filePath = editingSnap.file_path;

            if (fileSnap) {
              const webpBlob = await convertToWebPBlob(fileSnap);
              const fileName = `${Date.now()}_${fileSnap.name.replace(/\.[^/.]+$/, '')}.webp`;
              const { error: upErr } = await supabase.storage
                .from('carrusel_02')
                .upload(fileName, webpBlob, { upsert: false, contentType: 'image/webp' });
              if (upErr) { alert('Error al subir imagen: ' + upErr.message); return; }
              await supabase.storage.from('carrusel_02').remove([editingSnap.file_path]);
              filePath = fileName;
            }

            const payload = { nombre, file_path: filePath, foto_position, foto_scale };
            const { error } = await supabase
              .from('carrusel_02_imagenes')
              .update(payload)
              .eq('id', editingSnap.id);

            if (!error) {
              setCarrusel02(prev => prev.map(x => x.id === editingSnap.id ? { ...x, ...payload } : x));
              setIsCarrusel02ModalOpen(false);
            } else {
              alert('Error al actualizar: ' + error.message + (error.code ? ` (${error.code})` : ''));
            }
          } finally {
            setCarrusel02Uploading(false);
          }
        }
      });

    } else {
      // --- AGREGAR: subir y guardar directamente ---
      setCarrusel02Uploading(true);
      try {
        const webpBlob = await convertToWebPBlob(fileSnap!);
        const fileName = `${Date.now()}_${fileSnap!.name.replace(/\.[^/.]+$/, '')}.webp`;
        const { error: upErr } = await supabase.storage
          .from('carrusel_02')
          .upload(fileName, webpBlob, { upsert: false, contentType: 'image/webp' });
        if (upErr) { alert('Error al subir imagen: ' + upErr.message); return; }

        const nextOrden = carrusel02.length > 0 ? Math.max(...carrusel02.map(x => x.orden)) + 1 : 1;
        const payload = { nombre, file_path: fileName, foto_position, foto_scale, orden: nextOrden, activo: true };
        const { data, error } = await supabase
          .from('carrusel_02_imagenes')
          .insert([payload])
          .select()
          .single();

        if (!error && data) {
          setCarrusel02(prev => [...prev, data]);
          setIsCarrusel02ModalOpen(false);
        } else {
          alert('Error al agregar: ' + (error?.message ?? 'respuesta vacía') + (error?.code ? ` (${error.code})` : ''));
        }
      } finally {
        setCarrusel02Uploading(false);
      }
    }
  };

  const handleCarrusel02Delete = (img: Carrusel02Imagen) => {
    setAlertConfig({
      isOpen: true,
      title: 'Eliminar Imagen',
      message: `¿Eliminar "${img.nombre || img.file_path}"? Se borrará del carrusel y del storage. Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      isDestructive: true,
      onConfirm: async () => {
        await supabase.storage.from('carrusel_02').remove([img.file_path]);
        const { error } = await supabase.from('carrusel_02_imagenes').delete().eq('id', img.id);
        if (!error) setCarrusel02(prev => prev.filter(x => x.id !== img.id));
        else alert('Error al eliminar: ' + error.message);
      }
    });
  };

  const handleCarrusel02ToggleActivo = (img: Carrusel02Imagen) => {
    if (img.activo) {
      setAlertConfig({
        isOpen: true,
        title: 'Ocultar Imagen',
        message: `¿Ocultar "${img.nombre || img.file_path}" del carrusel público?`,
        confirmText: 'Ocultar',
        isDestructive: true,
        onConfirm: async () => {
          const { error } = await supabase.from('carrusel_02_imagenes').update({ activo: false }).eq('id', img.id);
          if (!error) setCarrusel02(prev => prev.map(x => x.id === img.id ? { ...x, activo: false } : x));
        }
      });
    } else {
      supabase.from('carrusel_02_imagenes').update({ activo: true }).eq('id', img.id)
        .then(({ error }) => {
          if (!error) setCarrusel02(prev => prev.map(x => x.id === img.id ? { ...x, activo: true } : x));
        });
    }
  };

  const handleCarrusel02DragStart = (index: number, e: React.DragEvent) => {
    carrusel02DragRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
    // Ocultar la imagen fantasma (luz fuerte) generada por el navegador al arrastrar
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleCarrusel02DragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setCarrusel02DragOver(index);
  };

  const handleCarrusel02Drop = async (dropIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    const dragIndex = carrusel02DragRef.current;
    setCarrusel02DragOver(null);
    if (dragIndex === null || dragIndex === dropIndex) { carrusel02DragRef.current = null; return; }

    const reordered = [...carrusel02];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    const updated = reordered.map((img, i) => ({ ...img, orden: i + 1 }));
    setCarrusel02(updated);
    carrusel02DragRef.current = null;

    await Promise.all(
      updated.map(img => supabase.from('carrusel_02_imagenes').update({ orden: img.orden }).eq('id', img.id))
    );
  };

  const renderCarrusel02 = () => (
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
                  <p className="text-[11px] text-slate-400 truncate font-mono">{img.file_path}</p>
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
  );

  const renderCarrusel02Modal = () => {
    if (!isCarrusel02ModalOpen) return null;
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
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Etiqueta descriptiva</label>
                <input
                  name="nombre"
                  defaultValue={carrusel02Editing?.nombre ?? ''}
                  placeholder='Ej. "Demostración Lima Mayo 2025"'
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm"
                />
              </div>

              {/* File input + botón Ajustar */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
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
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-sm">16 : 9</div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">{carrusel02PosX}% · {carrusel02PosY}%</div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white/70 text-[9px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">Arrastra para mover el enfoque</div>
                  </div>
                  <div className="bg-slate-900 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 text-[10px] font-black uppercase tracking-widest w-12">Zoom</span>
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
            <button onClick={() => { setIsColorManagerOpen(false); setEditingColor(null); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* Lista de colores */}
            <div className="flex-1 border-r border-slate-100 overflow-y-auto p-6 bg-slate-50/30 min-h-[300px]">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Colores Existentes</h4>
              <div className="space-y-2">
                {coloresCorporativos.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: c.hex }}></div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{c.nombre}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{c.hex}</p>
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
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                {editingColor ? 'Editar Color' : 'Añadir Nuevo Color'}
              </h4>
              <form onSubmit={handleSaveColor} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre (ej. Esmeralda)</label>
                  <input
                    required
                    value={colorFormNombre}
                    onChange={e => setColorFormNombre(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 text-sm shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Color Hexadecimal</label>
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
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Clase CSS (Tailwind) Opcional</label>
                  <input
                    value={colorFormClaseCss}
                    onChange={e => setColorFormClaseCss(e.target.value)}
                    placeholder="bg-emerald-500"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800 text-sm shadow-sm"
                  />
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                  {editingColor && (
                    <button type="button" onClick={() => openColorModal(null)} className="flex-1 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all text-sm">
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all text-sm flex items-center justify-center gap-2">
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 gradient-green text-white hidden md:flex flex-col p-6 shadow-xl sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-white/20 p-2 rounded-lg shadow-lg">
            <Users size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">DataLanding</h1>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button onClick={() => setActiveView('dashboard')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold text-[17px] transition-all ${activeView === 'dashboard' ? 'bg-white/15 shadow-inner' : 'hover:bg-white/5 text-white/70'}`}>
            <Home size={22} /> Dashboard
          </button>
          <button onClick={() => setActiveView('citas')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold text-[17px] transition-all ${activeView === 'citas' ? 'bg-white/15 shadow-inner' : 'hover:bg-white/5 text-white/70'}`}>
            <Calendar size={22} /> Citas
          </button>
          <button onClick={() => setActiveView('alumnos')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold text-[17px] transition-all ${activeView === 'alumnos' ? 'bg-white/15 shadow-inner' : 'hover:bg-white/5 text-white/70'}`}>
            <GraduationCap size={22} /> Alumnos
          </button>
          <button onClick={() => setActiveView('apoderados')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold text-[17px] transition-all ${activeView === 'apoderados' ? 'bg-white/15 shadow-inner' : 'hover:bg-white/5 text-white/70'}`}>
            <Users size={22} /> Apoderados
          </button>
          <button onClick={() => setActiveView('filiales')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold text-[17px] transition-all ${activeView === 'filiales' ? 'bg-white/15 shadow-inner' : 'hover:bg-white/5 text-white/70'}`}>
            <MapPin size={22} /> Filiales
          </button>
          <button onClick={() => setActiveView('historias')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold text-[17px] transition-all ${activeView === 'historias' ? 'bg-white/15 shadow-inner' : 'hover:bg-white/5 text-white/70'}`}>
            <Sparkles size={22} /> Historias
          </button>
          <button onClick={() => setActiveView('carrusel02')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold text-[17px] transition-all ${activeView === 'carrusel02' ? 'bg-white/15 shadow-inner' : 'hover:bg-white/5 text-white/70'}`}>
            <Images size={22} /> Carrusel 02
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 text-center">
          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Platinum Edition</p>
          <p className="text-[9px] text-white/30 mt-1">Powered by Supabase</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-[#f8fafc] overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight capitalize">{activeView}</h2>
              <p className="text-slate-500 font-bold italic text-sm">Control centralizado de operaciones</p>
            </div>
            <button
              onClick={() => fetchAllData(true)}
              className={`p-2 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all ${refreshing ? 'animate-spin text-emerald-600' : 'text-slate-400'}`}
              title="Refrescar datos"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar registros..."
                className="pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all w-full md:w-64 shadow-sm font-bold text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 px-5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conectado</span>
            </div>
          </div>
        </header>

        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'citas' && renderCitas()}
        {activeView === 'alumnos' && renderAlumnos()}
        {activeView === 'apoderados' && renderApoderados()}
        {activeView === 'filiales' && renderFiliales()}
        {activeView === 'historias' && renderHistorias()}
        {activeView === 'carrusel02' && renderCarrusel02()}

        {renderAppointmentDetailsModal()}
        {renderRescheduleModal()}
        {renderHistoriaModal()}
        {renderCarrusel02Modal()}
        {renderColorManagerModal()}

        {/* Modales Compartidos */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
          title={editingItem ? `Editar ${editingItem.nombre || 'Registro'}` : (activeView === 'citas' ? 'Agendar Nueva Cita' : activeView === 'alumnos' ? 'Registrar Alumno' : activeView === 'apoderados' ? 'Registrar Apoderado' : 'Nueva Filial')}
        >
          {activeView === 'citas' ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleAddAppointment(Object.fromEntries(fd));
            }} className="space-y-4">
              {/* Tipo de persona */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipo de Persona</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-3 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-100 transition-all">
                    <input type="radio" name="tipo_persona" value="dependiente" defaultChecked className="text-blue-600" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Dependiente</p>
                      <p className="text-[10px] text-slate-400">Tiene apoderado</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl border-2 border-slate-200 cursor-pointer has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 transition-all">
                    <input type="radio" name="tipo_persona" value="independiente" className="text-emerald-600" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Independiente</p>
                      <p className="text-[10px] text-slate-400">Contacto propio</p>
                    </div>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Alumno Solicitante</label>
                <select name="id_alumno" className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm">
                  {alumnos.length > 0 ? alumnos.map(al => <option key={al.id} value={al.id}>{al.nombre_completo}</option>) : <option disabled>No hay alumnos registrados</option>}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sede / Filial</label>
                <select name="id_filial" className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm">
                  {filiales.length > 0 ? filiales.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>) : <option disabled>No hay filiales activas</option>}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fecha</label>
                  <input type="date" name="fecha_cita" required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Hora</label>
                  <input type="time" name="hora_cita" required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs mt-4 btn-glow">
                Registrar Cita en DB
              </button>
            </form>
          ) : activeView === 'alumnos' ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleAddAlumno(Object.fromEntries(fd));
            }} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre Completo</label>
                <input type="text" name="nombre_completo" required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="Ej. Javier Estrada" />
              </div>
              {/* Tipo de alumno */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipo de Alumno</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-3 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-100 transition-all">
                    <input type="radio" name="tipo_alumno" value="dependiente" defaultChecked className="text-blue-600" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Dependiente</p>
                      <p className="text-[10px] text-slate-400">Tiene apoderado</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl border-2 border-slate-200 cursor-pointer has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 transition-all">
                    <input type="radio" name="tipo_alumno" value="independiente" className="text-emerald-600" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Independiente</p>
                      <p className="text-[10px] text-slate-400">Contacto propio</p>
                    </div>
                  </label>
                </div>
              </div>
              {/* Apoderado — solo si dependiente. En React puro sin state reactivo en form mostramos siempre pero con nota */}
              <div id="apoderado-section">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Apoderado <span className="text-blue-400">(solo si dependiente)</span></label>
                <select name="id_apoderado" className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm">
                  <option value="">Sin apoderado (independiente)</option>
                  {apoderados.map(ap => <option key={ap.id} value={ap.id}>{ap.nombre_completo}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Edad</label>
                  <input type="number" name="edad" required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Celular <span className="text-emerald-500">(si independiente)</span></label>
                  <input type="text" name="telefono" className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="999000888" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs mt-4 btn-glow">
                Guardar Alumno
              </button>
            </form>
          ) : activeView === 'apoderados' ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleAddApoderado(Object.fromEntries(fd));
            }} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre Completo</label>
                <input type="text" name="nombre_completo" required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="Ej. Juan Pérez" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Celular</label>
                <input type="text" name="telefono" required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="999888777" />
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs mt-4 btn-glow">
                Guardar Apoderado
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleAddOrUpdateFilial(Object.fromEntries(fd));
            }} className="space-y-4">
              {/* Imagen Filial */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  {editingItem ? 'Imagen (opcional — reemplaza la actual)' : 'Imagen (opcional)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={filialFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setFilialFile(f);
                        setFilialPreview(URL.createObjectURL(f));
                        setFilialPosX(50); setFilialPosY(50); setFilialScale(1.0);
                        setIsFilialAjusteOpen(false);
                      }
                    }}
                    className="flex-1 text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                  {filialFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilialFile(null);
                        setFilialPreview(editingItem?.file_path || null);
                        if (filialFileInputRef.current) filialFileInputRef.current.value = '';
                      }}
                      title="Quitar imagen seleccionada"
                      className="flex-shrink-0 p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors border border-rose-100"
                    >
                      <X size={16} />
                    </button>
                  )}
                  {filialPreview && (
                    <button
                      type="button"
                      onClick={() => setIsFilialAjusteOpen(v => !v)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${isFilialAjusteOpen ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {isFilialAjusteOpen ? 'Cerrar' : '✦ Ajustar'}
                    </button>
                  )}
                </div>
              </div>

              {/* Preview estático */}
              {filialPreview && !isFilialAjusteOpen && (
                <div className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm" style={{ aspectRatio: '2/1' }}>
                  <img
                    src={filialPreview}
                    alt="Vista previa"
                    draggable={false}
                    className="w-full h-full"
                    style={{
                      objectFit: 'cover',
                      objectPosition: `${filialPosX}% ${filialPosY}%`,
                      transform: `scale(${filialScale})`,
                      transformOrigin: `${filialPosX}% ${filialPosY}%`,
                    }}
                  />
                </div>
              )}

              {/* Ajustador interactivo */}
              {filialPreview && isFilialAjusteOpen && (
                <div className="rounded-2xl border-2 border-slate-800 overflow-hidden shadow-xl">
                  <div
                    className="relative w-full select-none cursor-crosshair"
                    style={{ aspectRatio: '2/1', overflow: 'hidden', background: '#0f172a' }}
                    onMouseMove={(e) => {
                      if (e.buttons !== 1) return;
                      const r = e.currentTarget.getBoundingClientRect();
                      setFilialPosX(Math.round(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))));
                      setFilialPosY(Math.round(Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100))));
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      const t = e.touches[0];
                      const r = e.currentTarget.getBoundingClientRect();
                      setFilialPosX(Math.round(Math.max(0, Math.min(100, ((t.clientX - r.left) / r.width) * 100))));
                      setFilialPosY(Math.round(Math.max(0, Math.min(100, ((t.clientY - r.top) / r.height) * 100))));
                    }}
                  >
                    <img
                      src={filialPreview}
                      alt="Ajuste"
                      draggable={false}
                      className="w-full h-full pointer-events-none opacity-60"
                      style={{
                        objectFit: 'cover',
                        objectPosition: `${filialPosX}% ${filialPosY}%`,
                        transform: `scale(${filialScale})`,
                        transformOrigin: `${filialPosX}% ${filialPosY}%`,
                      }}
                    />
                    <div className="absolute inset-0 pointer-events-none border border-white/20">
                      <div className="absolute inset-x-0 top-1/3 border-t border-white/20"></div>
                      <div className="absolute inset-x-0 top-2/3 border-t border-white/20"></div>
                      <div className="absolute inset-y-0 left-1/3 border-l border-white/20"></div>
                      <div className="absolute inset-y-0 left-2/3 border-l border-white/20"></div>
                    </div>
                  </div>
                  <div className="bg-slate-800 p-4 text-white">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block flex justify-between">
                      <span>Zoom: {filialScale.toFixed(1)}x</span>
                      <span>Pos: {filialPosX}% {filialPosY}%</span>
                    </label>
                    <input
                      type="range"
                      min="1" max="3" step="0.1"
                      value={filialScale}
                      onChange={(e) => setFilialScale(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-2 text-center">Arrastra la imagen en el recuadro para centrarla</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre de la Filial</label>
                <input type="text" name="nombre" defaultValue={editingItem?.nombre} required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="Ej. Filial Norte" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dpto.</label>
                  <input type="text" name="departamento" defaultValue={editingItem?.departamento} required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Provincia</label>
                  <input type="text" name="provincia" defaultValue={editingItem?.provincia} required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Distrito</label>
                  <input type="text" name="distrito" defaultValue={editingItem?.distrito} required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Dirección Exacta</label>
                <input type="text" name="direccion" defaultValue={editingItem?.direccion} required className="w-full p-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-800 shadow-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Referencia</label>
                <textarea name="referencia" defaultValue={editingItem?.referencia} className="w-full p-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-800 min-h-[60px] shadow-sm" placeholder="Opcional..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Celular</label>
                  <input type="text" name="telefono_movil" defaultValue={editingItem?.telefono_movil} required className="w-full p-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-800 shadow-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Fijo</label>
                  <input type="text" name="telefono_fijo" defaultValue={editingItem?.telefono_fijo} className="w-full p-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-800 shadow-sm" />
                </div>
              </div>

              {editingItem && (
                <div className="flex items-center gap-2 py-2">
                  <input type="checkbox" name="activo" id="activo" defaultChecked={editingItem.activo} className="w-5 h-5 text-emerald-600 border-slate-200 rounded-lg focus:ring-emerald-500 bg-white" />
                  <label htmlFor="activo" className="text-sm font-bold text-slate-700">Filial Activa</label>
                </div>
              )}

              <button disabled={uploadingFilial} type="submit" className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all mt-4 btn-glow uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                {uploadingFilial ? 'Subiendo imagen...' : (editingItem ? 'Actualizar en DB' : 'Crear en DB')}
              </button>
            </form>
          )}
        </Modal>

        {/* Modales de Mensajes WSP */}
        <Modal isOpen={isMensajesModalOpen} onClose={() => setIsMensajesModalOpen(false)} title="Mensajes de WhatsApp">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-slate-500">Plantillas para el botón de contacto web.</p>
            <button onClick={openNewMensaje} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
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
                  <div className="text-[10px] font-bold text-slate-400 mt-1">
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
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Título / Indicador</label>
              <input type="text" name="titulo" defaultValue={editingMensaje?.titulo} required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="Ej. Promoción Chiclayo" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Contenido del Mensaje</label>
              <textarea name="contenido" defaultValue={editingMensaje?.contenido} required rows={3} className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm text-sm" placeholder="Hola, deseo información sobre..." />
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Asignar Filiales</label>
                {availableFiliales.length > 0 && (
                  <button type="button" onClick={selectAllFilialesMensaje} className="text-[10px] font-bold text-emerald-600 hover:underline">Seleccionar Todas</button>
                )}
                {selectedFiliales.length > 0 && availableFiliales.length === 0 && (
                  <button type="button" onClick={deselectAllFilialesMensaje} className="text-[10px] font-bold text-rose-500 hover:underline">Quitar Todas</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 h-[250px]">
                {/* Disponibles */}
                <div 
                  className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-2 overflow-y-auto"
                  onDragOver={onDragOverMensaje}
                  onDrop={(e) => onDropMensaje(e, 'available')}
                >
                  <p className="text-[10px] font-bold text-slate-400 text-center uppercase mb-2 sticky top-0 bg-slate-50 py-1">Disponibles</p>
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
                      <p className="text-[10px] text-slate-400 text-center py-4 italic">No hay filiales libres</p>
                    )}
                  </div>
                </div>

                {/* Seleccionadas */}
                <div 
                  className="bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200 p-2 overflow-y-auto"
                  onDragOver={onDragOverMensaje}
                  onDrop={(e) => onDropMensaje(e, 'selected')}
                >
                  <p className="text-[10px] font-bold text-emerald-600 text-center uppercase mb-2 sticky top-0 bg-emerald-50/90 py-1">Asignadas</p>
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
                      <p className="text-[10px] text-emerald-600/70 text-center py-4 italic">Arrastra filiales aquí</p>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center">Arrastra las filiales de un lado a otro para asignarlas.</p>
            </div>

            <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs btn-glow mt-2">
              Guardar Mensaje
            </button>
          </form>

          {/* Custom Drag Overlay */}
          {draggingItem && (
            <div 
              className="fixed pointer-events-none z-[9999] p-2 bg-white rounded-xl border-2 border-emerald-500 shadow-2xl text-xs font-black text-slate-800 flex items-center gap-2 transform -translate-x-1/2 -translate-y-1/2 scale-105"
              style={{ left: dragPos.x, top: dragPos.y }}
            >
              <GripVertical size={14} className="text-emerald-500" />
              <span>{draggingItem.nombre}</span>
            </div>
          )}
        </Modal>

        <ConfirmAlert config={alertConfig} onClose={() => setAlertConfig(null)} />
      </main>
    </div >
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

