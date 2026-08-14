import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ArrowUpRight,
  TrendingUp,
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
  AlertTriangle,
  ImageIcon,
  GripVertical,
  Upload,
  Images,
  Palette,
  MessageCircle,
  Menu,
  FileText,
  Settings,
  Mail,
  BarChart3
} from 'lucide-react';
import {
  AppointmentStatus, Appointment, Alumno, Filial, Stats, Apoderado, MensajeWsp,
  ColorCorporativo, Historia, Carrusel02Imagen
} from './types';
import { ConfirmAlert } from './components/ConfirmAlert';
import { Modal } from './components/Modal';
import Loader from './components/Loader';
import { isAlumnoExistenteCita } from './utils/appointments';
import { convertToWebPBlob } from './utils/imageProcessing';
import { DashboardView } from './views/DashboardView';
import { CitasView } from './views/CitasView';
import { AlumnosView } from './views/AlumnosView';
import { ApoderadosView } from './views/ApoderadosView';
import { FilialesView } from './views/FilialesView';
import { HistoriasView } from './views/HistoriasView';
import { CarruselView } from './views/CarruselView';
import { ReportesView } from './views/ReportesView';

// Importar servicios y constantes de configuración
import { SUPABASE_URL } from './config/supabase';
import { getAlumnos, createAlumno, deleteAlumno, createAlumnosBulk } from './services/alumnos';
import { getApoderados, createApoderado, deleteApoderado } from './services/apoderados';
import { getCitas, createCita, createCitasBulk, updateCitaEstado, updateCitaReprogramar, updateCitaObservaciones, deleteCita } from './services/citas';
import { getFiliales, createFilial, updateFilial, updateFilialStatus, deleteFilial, uploadFilialFoto, getFilialFotoPublicUrl } from './services/filiales';
import { getMensajesWsp, createMensajeWsp, updateMensajeWsp, deleteMensajeWsp, disassociateMensajeFromFiliales, associateMensajeWithFiliales } from './services/mensajes';
import { getHistorias, createHistoria, updateHistoria, deleteHistoria, uploadHistoriaFoto } from './services/historias';
import { getColoresCorporativos, createColorCorporativo, updateColorCorporativo, deleteColorCorporativo, checkColorInUse as checkColorInUseDb } from './services/colores';
import { getCarruselImagenes, createCarruselImagen, deleteCarruselImagen, updateCarruselImagen, uploadCarruselFoto, removeCarruselFotos, getCarruselFotoPublicUrl } from './services/carrusel';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'citas' | 'alumnos' | 'filiales' | 'apoderados' | 'historias' | 'carrusel02' | 'reportes'>('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [filiales, setFiliales] = useState<Filial[]>([]);
  const [apoderados, setApoderados] = useState<Apoderado[]>([]);
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [coloresCorporativos, setColoresCorporativos] = useState<ColorCorporativo[]>([]);

  // --- Estados de Navegación Lateral y Submenú ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isWebManagementOpen, setIsWebManagementOpen] = useState(false);
  const [citasView, setCitasView] = useState<'calendar' | 'list'>('calendar');
  const [calendarWeekStart, setCalendarWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff);
  });
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);
  const [navCount, setNavCount] = useState(0);
  const [slideOffset, setSlideOffset] = useState(-11.111);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-abrir Gestión Web si la vista activa es de ese grupo
  useEffect(() => {
    if (['filiales', 'historias', 'carrusel02'].includes(activeView)) {
      setIsWebManagementOpen(true);
    }
  }, [activeView]);

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
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<number | null>(null);

  // Nuevos estados para el flujo de reserva interactivo
  const [schedulingFlow, setSchedulingFlow] = useState<'existing' | 'new'>('existing');
  const [selectedFilialId, setSelectedFilialId] = useState<number | null>(null);
  const [searchStudentTerm, setSearchStudentTerm] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  // Flujo Matrícula Nueva
  const [newStudentType, setNewStudentType] = useState<'dependent' | 'independent'>('dependent');
  const [apoderadoNombre, setApoderadoNombre] = useState('');
  const [apoderadoTelefono, setApoderadoTelefono] = useState('');
  const [apoderadoEmail, setApoderadoEmail] = useState('');
  const [newStudents, setNewStudents] = useState<Array<{ nombre_completo: string; edad: string }>>([
    { nombre_completo: '', edad: '' }
  ]);

  // Cita
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentObservaciones, setAppointmentObservaciones] = useState('');
  const [preselectedDate, setPreselectedDate] = useState<string | null>(null);
  const [plusMenuDate, setPlusMenuDate] = useState<string | null>(null);
  const [miniCalendarMonth, setMiniCalendarMonth] = useState<Date>(new Date());
  const hoursRibbonRef = React.useRef<HTMLDivElement>(null);

  // Modal de Confirmación
  const [isConfirmingSave, setIsConfirmingSave] = useState(false);
  const [pendingBookingPayload, setPendingBookingPayload] = useState<any>(null);

  const resetAppointmentFields = () => {
    setPreselectedDate(null);
    setAppointmentDate('');
    setAppointmentTime('');
    setAppointmentObservaciones('');
    setSearchStudentTerm('');
    setSelectedAlumnoId(null);
    setSelectedFilialId(null);
    setNewStudentType('dependent');
    setApoderadoNombre('');
    setApoderadoTelefono('');
    setApoderadoEmail('');
    setNewStudents([{ nombre_completo: '', edad: '' }]);
    setIsConfirmingSave(false);
    setPendingBookingPayload(null);
    setPlusMenuDate(null);
    setMiniCalendarMonth(new Date());
  };

  // Rescheduling State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleApp, setRescheduleApp] = useState<Appointment | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [alumnoFormTipo, setAlumnoFormTipo] = useState<'dependiente' | 'independiente'>('dependiente');

  // Filter State
  const [filterDateMode, setFilterDateMode] = useState<'all' | 'specific' | 'range'>('all');
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');
  const [filterFiliales, setFilterFiliales] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isFilialDropdownOpen, setIsFilialDropdownOpen] = useState(false);

  // New Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsAppointment, setDetailsAppointment] = useState<Appointment | null>(null);
  const [isReprogrammingExpanded, setIsReprogrammingExpanded] = useState(false);
  const [detailsNotes, setDetailsNotes] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (detailsAppointment) {
      setDetailsNotes(detailsAppointment.observaciones || '');
    } else {
      setDetailsNotes('');
    }
  }, [detailsAppointment]);

  // Alert State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isAlertOnly?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  // Fetch inicial de datos
  useEffect(() => {
    fetchAllData();
  }, []);

  // Alumnos filtrados por sede y término de búsqueda predictiva
  const matchedAlumnos = useMemo(() => {
    if (!selectedFilialId) return [];

    const studentIdsAtFilial = new Set(
      appointments.filter(a => a.id_filial === selectedFilialId).map(a => a.id_alumno)
    );
    const scheduledStudentIds = new Set(appointments.map(a => a.id_alumno));

    return alumnos.filter(al => {
      const matchesFilial = studentIdsAtFilial.has(al.id) || !scheduledStudentIds.has(al.id);
      if (!matchesFilial) return false;
      return al.nombre_completo.toLowerCase().includes(searchStudentTerm.toLowerCase());
    });
  }, [alumnos, appointments, selectedFilialId, searchStudentTerm]);

  // Sync form states when appointment creation modal is opened/closed
  useEffect(() => {
    if (isModalOpen && activeView === 'citas') {
      if (filiales.length > 0 && selectedFilialId === null) {
        setSelectedFilialId(filiales[0].id);
      }
    } else if (!isModalOpen) {
      setSchedulingFlow('existing');
      setSelectedFilialId(null);
      setSearchStudentTerm('');
      setIsStudentDropdownOpen(false);
      setSelectedAlumnoId(null);
      setNewStudentType('dependent');
      setApoderadoNombre('');
      setApoderadoTelefono('');
      setApoderadoEmail('');
      setNewStudents([{ nombre_completo: '', edad: '' }]);
      setAppointmentDate('');
      setAppointmentTime('');
      setAppointmentObservaciones('');
      setPreselectedDate(null);
      setPlusMenuDate(null);
      setIsConfirmingSave(false);
      setPendingBookingPayload(null);
    }
  }, [isModalOpen, activeView, filiales]);

  const fetchAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [alRes, filRes, appResData, apoRes, histRes, colorRes, c02Res, msgRes] = await Promise.all([
        getAlumnos(),
        getFiliales(),
        getCitas(),
        getApoderados(),
        getHistorias(),
        getColoresCorporativos(),
        getCarruselImagenes(),
        getMensajesWsp()
      ]);

      if (alRes.error) console.error('[FETCH] Error alumnos:', alRes.error.message);
      if (filRes.error) console.error('[FETCH] Error filiales:', filRes.error.message);
      if (apoRes.error) console.error('[FETCH] Error apoderados:', apoRes.error.message);
      if (msgRes.error) console.error('[FETCH] Error mensajes wsp:', msgRes.error.message);

      if (alRes.data) setAlumnos(alRes.data);
      if (filRes.data) setFiliales(filRes.data);
      if (apoRes.data) setApoderados(apoRes.data);
      if (histRes.data) setHistorias(histRes.data);
      if (colorRes.data) setColoresCorporativos(colorRes.data);
      if (c02Res.data) setCarrusel02(c02Res.data);
      if (msgRes.data) setMensajesWsp(msgRes.data);

      // appResData ya está completamente normalizado y ordenado por getCitas()
      setAppointments(appResData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Estadísticas globales (solo de Entrevistas, excluyendo Citas)
  const stats = useMemo((): Stats => {
    const total = appointments.filter(a => !isAlumnoExistenteCita(a)).length;
    const verified = appointments.filter(a => !isAlumnoExistenteCita(a) && a.estado === AppointmentStatus.CONFIRMADO).length;
    const pending = appointments.filter(a => !isAlumnoExistenteCita(a) && (a.estado === AppointmentStatus.PENDIENTE || a.estado === AppointmentStatus.AGENDADO)).length;
    const converted = appointments.filter(a => !isAlumnoExistenteCita(a) && a.estado === AppointmentStatus.CONVERTIDO).length;
    const totalNewLeads = appointments.filter(a => !isAlumnoExistenteCita(a)).length;
    const conversion = totalNewLeads > 0 ? (converted / totalNewLeads) * 100 : 0;
    return {
      totalAppointments: total,
      verifiedCount: verified,
      pendingCount: pending,
      conversionRate: conversion
    };
  }, [appointments]);

  // --- Handlers de Citas ---

  const handleUpdateAppointmentStatus = async (id: number, status: AppointmentStatus) => {
    console.log(`Intentando actualizar cita ID: ${id} a estado: ${status}`);
    const app = appointments.find(a => a.id === id);
    const { data, error } = await updateCitaEstado(id, status, app?.tipo_cita);

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
        const app = appointments.find(a => a.id === id);
        const { error } = await deleteCita(id, app?.tipo_cita);
        if (!error) {
          setAppointments(prev => prev.filter(a => a.id !== id));
        } else {
          setAlertConfig({ isOpen: true, title: 'Error', message: "Error al eliminar la cita: " + error.message, isAlertOnly: true, confirmText: 'Aceptar', onConfirm: () => setAlertConfig(null) });
        }
      }
    });
  };
  const handleAddAppointment = async (booking: any) => {
    setLoading(true);
    try {
      if (booking.flow === 'existing') {
        const student = alumnos.find(al => al.id === booking.alumnoId);
        const esIndependiente = student ? !student.id_apoderado : true;

        const payload = {
          id_alumno: booking.alumnoId,
          id_filial: booking.filialId,
          fecha_cita: booking.fecha_cita,
          hora_cita: booking.hora_cita,
          tipo_persona: esIndependiente ? 'independiente' : 'dependiente',
          estado: AppointmentStatus.PENDIENTE,
          creado_en: new Date().toISOString(),
          observaciones: booking.observaciones || null,
          tipo_cita: 'alumno_existente'
        };

        const { data, error } = await createCita(payload);

        if (error) throw error;
        if (data) {
          const transformed = {
            ...data,
            tipo_cita: 'alumno_existente',
            alumno_nombre: data.alumnos?.nombre_completo,
            filial_nombre: data.filiales?.nombre,
            estado: data.estado?.toUpperCase() === 'VERIFICADO' ? AppointmentStatus.CONFIRMADO : data.estado
          };
          setAppointments(prev => [transformed, ...prev].sort((a: any, b: any) => {
            const timeA = a.creado_en ? new Date(a.creado_en).getTime() : 0;
            const timeB = b.creado_en ? new Date(b.creado_en).getTime() : 0;
            if (timeA !== timeB) return timeB - timeA;
            return b.id - a.id;
          }));
        }
      } else {
        let apoderadoId: number | null = null;
        let newApoObj: any = null;

        if (booking.newStudentType === 'dependent') {
          const apoPayload = {
            nombre_completo: booking.apoderadoNombre,
            telefono: booking.apoderadoTelefono,
            email: booking.apoderadoEmail || null,
            creado_en: new Date().toISOString()
          };
          const { data: apoData, error: apoError } = await createApoderado(apoPayload);

          if (apoError) throw apoError;
          apoderadoId = apoData.id;
          newApoObj = apoData;
        }

        const newAlumnosList: any[] = [];
        const alumnosToInsert = booking.newStudents.map((st: any) => ({
          nombre_completo: st.nombre_completo,
          edad: Number(st.edad),
          telefono: booking.newStudentType === 'independent' ? booking.apoderadoTelefono : '',
          email: booking.newStudentType === 'independent' ? (booking.apoderadoEmail || null) : null,
          id_apoderado: apoderadoId,
          creado_en: new Date().toISOString()
        }));

        const { data: alData, error: alError } = await createAlumnosBulk(alumnosToInsert);

        if (alError) throw alError;
        newAlumnosList.push(...alData);

        const appointmentsToInsert = alData.map((al: any) => ({
          id_alumno: al.id,
          id_filial: booking.filialId,
          fecha_cita: booking.fecha_cita,
          hora_cita: booking.hora_cita,
          tipo_persona: booking.newStudentType === 'independent' ? 'independiente' : 'dependiente',
          estado: AppointmentStatus.PENDIENTE,
          creado_en: new Date().toISOString(),
          observaciones: booking.observaciones || null,
          tipo_cita: 'matricula'
        }));

        const { data: appData, error: appError } = await createCitasBulk(appointmentsToInsert);

        if (appError) throw appError;

        if (newApoObj) {
          setApoderados(prev => [newApoObj, ...prev]);
        }
        setAlumnos(prev => [...newAlumnosList, ...prev]);

        const transformedApps = appData.map((a: any) => ({
          ...a,
          tipo_cita: a.tipo_persona === 'independiente' ? 'matricula_independiente' : 'matricula_dependiente',
          alumno_nombre: a.alumnos?.nombre_completo,
          filial_nombre: a.filiales?.nombre,
          estado: a.estado?.toUpperCase() === 'VERIFICADO' ? AppointmentStatus.CONFIRMADO : a.estado
        }));

        setAppointments(prev => [...transformedApps, ...prev].sort((a: any, b: any) => {
          const timeA = a.creado_en ? new Date(a.creado_en).getTime() : 0;
          const timeB = b.creado_en ? new Date(b.creado_en).getTime() : 0;
          if (timeA !== timeB) return timeB - timeA;
          return b.id - a.id;
        }));
      }

      setIsModalOpen(false);
      setAlertConfig({
        isOpen: true,
        title: 'Éxito',
        message: 'La cita ha sido registrada con éxito.',
        isAlertOnly: true,
        confirmText: 'Aceptar',
        onConfirm: () => setAlertConfig(null)
      });
    } catch (err: any) {
      console.error("Error saving appointment:", err);
      alert("Error al guardar la cita: " + (err.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers de Alumnos ---

  const handleAddAlumno = async (newAl: any) => {
    const esDependiente = newAl.tipo_alumno === 'dependiente';
    const payload: any = {
      nombre_completo: newAl.nombre_completo,
      edad: Number(newAl.edad),
      telefono: esDependiente ? '' : newAl.telefono,
      email: esDependiente ? null : (newAl.email || null),
      id_apoderado: esDependiente ? Number(newAl.id_apoderado) : null,
      creado_en: new Date().toISOString()
    };
    const { data, error } = await createAlumno(payload);
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
      telefono: newAp.telefono,
      email: newAp.email || null,
      creado_en: new Date().toISOString()
    };
    const { data, error } = await createApoderado(payload);
    if (!error && data) {
      setApoderados([data, ...apoderados]);
      setIsModalOpen(false);
    } else {
      alert("Error al registrar apoderado: " + (error?.message || "Error desconocido"));
    }
  };

  const handleDeleteApoderado = async (id: number) => {
    if (confirm('¿Seguro que desea eliminar este apoderado? Esto podría afectar a los alumnos asociados.')) {
      const { error } = await deleteApoderado(id);
      if (!error) {
        setApoderados(prev => prev.filter(a => a.id !== id));
      } else {
        alert("Error al eliminar apoderado: " + error.message);
      }
    }
  };

  const handleDeleteAlumno = async (id: number) => {
    if (confirm('¿Seguro que desea eliminar este alumno? Se eliminarán también sus citas.')) {
      const { error } = await deleteAlumno(id);
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
      if (!filialFile) return undefined;
      setUploadingFilial(true);
      const fileExt = filialFile.name.split('.').pop();
      const safeName = data.nombre.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const fileName = `${safeName}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await uploadFilialFoto(fileName, filialFile);

      setUploadingFilial(false);

      if (uploadError) {
        alert("Error al subir imagen de filial: " + uploadError.message);
        throw new Error(uploadError.message);
      }

      return getFilialFotoPublicUrl(fileName);
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
            const { data: updated, error } = await updateFilial(editingItem.id, payload);
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
        const { data: created, error } = await createFilial(payload);
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
    if (currentStatus) {
      setAlertConfig({
        isOpen: true,
        title: 'Desactivar Filial',
        message: '¿Estás seguro de que deseas desactivar esta filial?',
        confirmText: 'Desactivar',
        isDestructive: true,
        onConfirm: async () => {
          const { error } = await updateFilialStatus(id, !currentStatus);
          if (!error) {
            setFiliales(prev => prev.map(f => f.id === id ? { ...f, activo: !currentStatus } : f));
          }
        }
      });
    } else {
      const { error } = await updateFilialStatus(id, !currentStatus);
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
        const { error } = await deleteMensajeWsp(msg.id);
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
          const { error } = await updateMensajeWsp(editingMensaje.id, payload);
          if (error) { alert('Error actualizando mensaje: ' + error.message); return; }
          setMensajesWsp(prev => prev.map(m => m.id === msgId ? { ...m, ...payload } : m));
        } else {
          const { data, error } = await createMensajeWsp(payload);
          if (error) { alert('Error creando mensaje: ' + error.message); return; }
          msgId = data.id;
          setMensajesWsp([data, ...mensajesWsp]);
        }

        const previouslyAssigned = filiales.filter(f => f.id_mensaje_wsp === msgId);
        const removedFiliales = previouslyAssigned.filter(pa => !selectedFiliales.some(sf => sf.id === pa.id));
        const newFiliales = selectedFiliales.filter(sf => sf.id_mensaje_wsp !== msgId);

        if (removedFiliales.length > 0) {
          const removedIds = removedFiliales.map(f => f.id);
          await disassociateMensajeFromFiliales(removedIds);
        }
        if (newFiliales.length > 0 && msgId !== undefined) {
          const newIds = newFiliales.map(f => f.id);
          await associateMensajeWithFiliales(msgId, newIds);
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

  const handleCreateAppointmentForDate = (dateStr: string, flow: 'existing' | 'new') => {
    resetAppointmentFields();
    setPreselectedDate(dateStr);
    setAppointmentDate(dateStr);
    setSchedulingFlow(flow);
    setIsModalOpen(true);
  };

  // --- New Appointment Details Modal Functions ---

  const openAppointmentDetails = (app: Appointment) => {
    setDetailsAppointment(app);
    setIsDetailsModalOpen(true);
    setIsReprogrammingExpanded(false);
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
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const newStatus = AppointmentStatus.PENDIENTE;

        const { error } = await updateCitaReprogramar(
          detailsAppointment.id,
          dateStr,
          selectedTime,
          newStatus,
          detailsAppointment.tipo_cita
        );

        if (!error) {
          const updatedApp = { ...detailsAppointment, fecha_cita: dateStr, hora_cita: selectedTime, estado: newStatus };
          setAppointments(prev => prev.map(a => a.id === detailsAppointment.id ? updatedApp : a));
          setDetailsAppointment(updatedApp);
          setIsReprogrammingExpanded(false);
          setAlertConfig({ isOpen: true, title: 'Éxito', message: 'Cita reprogramada con éxito', isAlertOnly: true, confirmText: 'Aceptar', onConfirm: () => setAlertConfig(null) });
        } else {
          setAlertConfig({ isOpen: true, title: 'Error', message: "Error al reprogramar: " + error.message, isAlertOnly: true, confirmText: 'Aceptar', onConfirm: () => setAlertConfig(null) });
        }
      }
    });
  };

  const handleUpdateNotes = async () => {
    if (!detailsAppointment) return;

    const { error } = await updateCitaObservaciones(
      detailsAppointment.id,
      detailsNotes || null,
      detailsAppointment.tipo_cita
    );

    if (!error) {
      const updatedApp = { ...detailsAppointment, observaciones: detailsNotes || null };
      setAppointments(prev => prev.map(a => a.id === detailsAppointment.id ? updatedApp : a));
      setDetailsAppointment(updatedApp);
      setAlertConfig({
        isOpen: true,
        title: 'Éxito',
        message: 'Notas actualizadas con éxito',
        isAlertOnly: true,
        confirmText: 'Aceptar',
        onConfirm: () => setAlertConfig(null)
      });
    } else {
      setAlertConfig({
        isOpen: true,
        title: 'Error',
        message: 'Error al actualizar notas: ' + error.message,
        isAlertOnly: true,
        confirmText: 'Aceptar',
        onConfirm: () => setAlertConfig(null)
      });
    }
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
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const newStatus = AppointmentStatus.PENDIENTE;

        const { error } = await updateCitaReprogramar(
          rescheduleApp.id,
          dateStr,
          selectedTime,
          newStatus,
          rescheduleApp.tipo_cita
        );

        if (!error) {
          setAppointments(prev => prev.map(a => a.id === rescheduleApp.id ? { ...a, fecha_cita: dateStr, hora_cita: selectedTime, estado: newStatus } : a));
          setIsRescheduleModalOpen(false);
          setAlertConfig({ isOpen: true, title: 'Éxito', message: 'Cita reprogramada con éxito', isAlertOnly: true, confirmText: 'Aceptar', onConfirm: () => setAlertConfig(null) });
        } else {
          setAlertConfig({ isOpen: true, title: 'Error', message: "Error al reprogramar: " + error.message, isAlertOnly: true, confirmText: 'Aceptar', onConfirm: () => setAlertConfig(null) });
        }
      }
    });
  };

  // --- Handlers de Historias ---

  const getFotoUrl = (foto_path: string | null): string | null =>
    foto_path ? SUPABASE_URL + '/storage/v1/object/public/Testimonios/' + foto_path : null;

  const handleToggleHistoriaActiva = async (h: Historia) => {
    if (h.activo) {
      setAlertConfig({
        isOpen: true,
        title: 'Desactivar Historia',
        message: '¿Estás seguro de que deseas desactivar esta historia?',
        confirmText: 'Desactivar',
        isDestructive: true,
        onConfirm: async () => {
          const { error } = await updateHistoria(h.id, { activo: !h.activo });
          if (!error) setHistorias(prev => prev.map(x => x.id === h.id ? { ...x, activo: !h.activo } : x));
          else alert('Error: ' + error.message);
        }
      });
    } else {
      const { error } = await updateHistoria(h.id, { activo: !h.activo });
      if (!error) setHistorias(prev => prev.map(x => x.id === h.id ? { ...x, activo: !h.activo } : x));
      else alert('Error: ' + error.message);
    }
  };

  const handleDeleteHistoria = (h: Historia) => {
    setAlertConfig({
      isOpen: true,
      title: 'Eliminar Historia',
      message: '¿Eliminar la historia de "' + h.nombre_alumno + '"? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      isDestructive: true,
      onConfirm: async () => {
        const { error } = await deleteHistoria(h.id);
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
    const fd = new FormData(ev.currentTarget);
    const activoChecked = (ev.currentTarget.querySelector('[name="activo"]') as HTMLInputElement | null)?.checked ?? true;
    let foto_path = editingHistoria?.foto_path ?? null;
    if (historiaFotoFile) {
      setUploadingFoto(true);
      try {
        const webpBlob = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          const objectUrl = URL.createObjectURL(historiaFotoFile);
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const canvas = document.createElement('canvas');
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

        const baseName = historiaFotoFile.name.replace(/\.[^/.]+$/, '');
        const nombreArchivo = Date.now() + '_' + baseName + '.webp';
        const { error: upErr } = await uploadHistoriaFoto(nombreArchivo, webpBlob);

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
          const { error } = await updateHistoria(editingHistoria.id, payload);
          console.log('[UPDATE Historia] id:', editingHistoria.id, '| error:', error);
          if (!error) {
            setHistorias(prev => prev.map(x => x.id === editingHistoria.id ? { ...x, ...payload } : x));
            setIsHistoriaModalOpen(false);
          } else alert('Error al actualizar: ' + error.message + ' (code: ' + error.code + ')');
        }
      });
    } else {
      const { data, error } = await createHistoria(payload);
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
    const { data, error } = await checkColorInUseDb(colorId);
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
          confirmText: 'Aceptar',
          onConfirm: () => setAlertConfig(null)
        });
        return;
      }
      setAlertConfig({
        isOpen: true,
        title: 'Guardar Color',
        message: `¿Guardar los cambios en el color "${colorFormNombre}"?`,
        confirmText: 'Guardar',
        onConfirm: async () => {
          const { error } = await updateColorCorporativo(editingColor.id, payload);
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
          const { data, error } = await createColorCorporativo(payload);
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
        confirmText: 'Aceptar',
        onConfirm: () => setAlertConfig(null)
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
        const { error } = await deleteColorCorporativo(color.id);
        if (!error) {
          setColoresCorporativos(prev => prev.filter(c => c.id !== color.id));
        } else alert('Error al eliminar color: ' + error.message);
      }
    });
  };

  // --- Helpers Carrusel 02 ---
  const getCarrusel02Url = (file_path: string): string => {
    return getCarruselFotoPublicUrl(file_path);
  };

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
    const fd = new FormData(ev.currentTarget);
    const nombre = (fd.get('nombre') as string || '').trim();

    if (!carrusel02File && !carrusel02Editing) { alert('Selecciona una imagen.'); return; }

    const foto_position = `${carrusel02PosX}% ${carrusel02PosY}%`;
    const foto_scale = carrusel02Scale;
    const editingSnap = carrusel02Editing;
    const fileSnap = carrusel02File;

    if (editingSnap) {
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
              const { error: upErr } = await uploadCarruselFoto(fileName, webpBlob);
              if (upErr) { alert('Error al subir imagen: ' + upErr.message); return; }
              await removeCarruselFotos([editingSnap.file_path]);
              filePath = fileName;
            }

            const payload = { nombre, file_path: filePath, foto_position, foto_scale };
            const { error } = await updateCarruselImagen(editingSnap.id, payload);

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
      setCarrusel02Uploading(true);
      try {
        const webpBlob = await convertToWebPBlob(fileSnap!);
        const fileName = `${Date.now()}_${fileSnap!.name.replace(/\.[^/.]+$/, '')}.webp`;
        const { error: upErr } = await uploadCarruselFoto(fileName, webpBlob);
        if (upErr) { alert('Error al subir imagen: ' + upErr.message); return; }

        const nextOrden = carrusel02.length > 0 ? Math.max(...carrusel02.map(x => x.orden)) + 1 : 1;
        const payload = { nombre, file_path: fileName, foto_position, foto_scale, orden: nextOrden, activo: true };
        const { data, error } = await createCarruselImagen(payload);

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
        await removeCarruselFotos([img.file_path]);
        const { error } = await deleteCarruselImagen(img.id);
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
          const { error } = await updateCarruselImagen(img.id, { activo: false });
          if (!error) setCarrusel02(prev => prev.map(x => x.id === img.id ? { ...x, activo: false } : x));
        }
      });
    } else {
      updateCarruselImagen(img.id, { activo: true })
        .then(({ error }) => {
          if (!error) setCarrusel02(prev => prev.map(x => x.id === img.id ? { ...x, activo: true } : x));
        });
    }
  };

  const handleCarrusel02DragStart = (index: number, e: React.DragEvent) => {
    carrusel02DragRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
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
      updated.map(img => updateCarruselImagen(img.id, { orden: img.orden }))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Backdrop Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 border-r border-slate-200/60 text-slate-700 flex flex-col p-5 shadow-[2px_0_12px_rgba(0,0,0,0.015)] backdrop-blur-md transition-transform duration-300 transform h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="bg-white border border-slate-200/50 rounded-2xl p-4 mb-6 shadow-sm flex items-center justify-between gap-3 relative">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-100/30">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-slate-800 tracking-tight leading-none mb-1">Dashboard</h1>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">EduTrack</p>
            </div>
          </div>
          {/* Close button inside sidebar (mobile only) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 hover:bg-slate-100 rounded-lg md:hidden text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button
            onClick={() => { setActiveView('dashboard'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full p-2.5 rounded-xl font-medium text-[15px] transition-all cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-white shadow-[0_2px_6px_rgba(0,0,0,0.02)] border border-slate-200/40 text-emerald-700 font-semibold'
                : 'hover:bg-slate-200/30 text-slate-500 hover:text-slate-800 border border-transparent'
            }`}
          >
            <Home size={20} className={activeView === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'} /> Dashboard
          </button>
          <button
            onClick={() => { setActiveView('citas'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full p-2.5 rounded-xl font-medium text-[15px] transition-all cursor-pointer ${
              activeView === 'citas'
                ? 'bg-white shadow-[0_2px_6px_rgba(0,0,0,0.02)] border border-slate-200/40 text-emerald-700 font-semibold'
                : 'hover:bg-slate-200/30 text-slate-500 hover:text-slate-800 border border-transparent'
            }`}
          >
            <Calendar size={20} className={activeView === 'citas' ? 'text-emerald-600' : 'text-slate-400'} /> Agenda
          </button>
          <button
            onClick={() => { setActiveView('alumnos'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full p-2.5 rounded-xl font-medium text-[15px] transition-all cursor-pointer ${
              activeView === 'alumnos'
                ? 'bg-white shadow-[0_2px_6px_rgba(0,0,0,0.02)] border border-slate-200/40 text-emerald-700 font-semibold'
                : 'hover:bg-slate-200/30 text-slate-500 hover:text-slate-800 border border-transparent'
            }`}
          >
            <GraduationCap size={20} className={activeView === 'alumnos' ? 'text-emerald-600' : 'text-slate-400'} /> Alumnos
          </button>
          <button
            onClick={() => { setActiveView('apoderados'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full p-2.5 rounded-xl font-medium text-[15px] transition-all cursor-pointer ${
              activeView === 'apoderados'
                ? 'bg-white shadow-[0_2px_6px_rgba(0,0,0,0.02)] border border-slate-200/40 text-emerald-700 font-semibold'
                : 'hover:bg-slate-200/30 text-slate-500 hover:text-slate-800 border border-transparent'
            }`}
          >
            <Users size={20} className={activeView === 'apoderados' ? 'text-emerald-600' : 'text-slate-400'} /> Apoderados
          </button>
          <button
            onClick={() => { setActiveView('reportes'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full p-2.5 rounded-xl font-medium text-[15px] transition-all cursor-pointer ${
              activeView === 'reportes'
                ? 'bg-white shadow-[0_2px_6px_rgba(0,0,0,0.02)] border border-slate-200/40 text-emerald-700 font-semibold'
                : 'hover:bg-slate-200/30 text-slate-500 hover:text-slate-800 border border-transparent'
            }`}
          >
            <BarChart3 size={20} className={activeView === 'reportes' ? 'text-emerald-600' : 'text-slate-400'} /> Reportes
          </button>

          {/* Opción desglosable: Gestión Web */}
          <div className="pt-1">
            <button
              onClick={() => setIsWebManagementOpen(!isWebManagementOpen)}
              className={`flex items-center justify-between w-full p-2.5 rounded-xl font-medium text-[15px] transition-all hover:bg-slate-200/30 cursor-pointer
                ${['filiales', 'historias', 'carrusel02'].includes(activeView)
                  ? 'bg-white shadow-[0_2px_6px_rgba(0,0,0,0.02)] border border-slate-200/40 text-emerald-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Palette size={20} className={['filiales', 'historias', 'carrusel02'].includes(activeView) ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Gestión Web</span>
              </div>
              <ChevronLeft
                size={16}
                className={`transition-transform duration-200 ${isWebManagementOpen ? '-rotate-90' : ''} ${
                  ['filiales', 'historias', 'carrusel02'].includes(activeView) ? 'text-emerald-600' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Submenú desglosable */}
            <div className={`mt-1 pl-4 ml-6 border-l border-slate-200/80 space-y-1 transition-all overflow-hidden duration-300 ${
              isWebManagementOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
            }`}>
              <button
                onClick={() => { setActiveView('filiales'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`flex items-center gap-2.5 w-full py-2 px-3 rounded-lg font-medium text-[13px] transition-all cursor-pointer ${
                  activeView === 'filiales'
                    ? 'text-emerald-700 bg-white/60 shadow-sm border border-slate-100 font-semibold'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/50'
                }`}
              >
                <MapPin size={16} className={activeView === 'filiales' ? 'text-emerald-600' : 'text-slate-400'} /> Filiales
              </button>
              <button
                onClick={() => { setActiveView('historias'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`flex items-center gap-2.5 w-full py-2 px-3 rounded-lg font-medium text-[13px] transition-all cursor-pointer ${
                  activeView === 'historias'
                    ? 'text-emerald-700 bg-white/60 shadow-sm border border-slate-100 font-semibold'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/50'
                }`}
              >
                <Sparkles size={16} className={activeView === 'historias' ? 'text-emerald-600' : 'text-slate-400'} /> Historias
              </button>
              <button
                onClick={() => { setActiveView('carrusel02'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`flex items-center gap-2.5 w-full py-2 px-3 rounded-lg font-medium text-[13px] transition-all cursor-pointer ${
                  activeView === 'carrusel02'
                    ? 'text-emerald-700 bg-white/60 shadow-sm border border-slate-100 font-semibold'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/50'
                }`}
              >
                <Images size={16} className={activeView === 'carrusel02' ? 'text-emerald-600' : 'text-slate-400'} /> Carrusel 02
              </button>
            </div>
          </div>
        </nav>

        {/* Botón de Configuración en la parte inferior de la barra de menú */}
        <div className="pt-4 border-t border-slate-200/60 mt-auto">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 w-full p-2.5 rounded-xl font-medium text-[15px] transition-all hover:bg-slate-200/30 text-slate-500 hover:text-slate-800 cursor-pointer border border-transparent"
          >
            <Settings size={20} className="text-slate-400" /> Configuración
          </button>
        </div>

        {/* Handle (Hojal) for collapsing/expanding sidebar */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-full bottom-8 w-6 h-14 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-r-xl border-y border-r border-slate-200/80 shadow-md hidden md:flex items-center justify-center transition-all duration-300 hover:w-7 active:scale-95 cursor-pointer z-50 group"
          style={{ marginLeft: '-1px' }}
          title={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}
        >
          {isSidebarOpen ? (
            <ChevronLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
          ) : (
            <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-4 md:p-8 bg-[#f8fafc] overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            {/* Hamburger menu button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all text-slate-600 md:hidden flex items-center justify-center"
              title="Menú"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight capitalize">{activeView === 'citas' ? 'Agenda diaria' : activeView}</h2>
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
            {activeView !== 'dashboard' && !(activeView === 'citas' && citasView === 'calendar') && (
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
            )}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 px-5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conectado</span>
            </div>
          </div>
        </header>

        {activeView === 'dashboard' && (
          <DashboardView
            stats={stats}
            appointments={appointments}
            alumnos={alumnos}
            setActiveView={setActiveView}
          />
        )}

        {activeView === 'citas' && (
          <CitasView
            appointments={appointments}
            alumnos={alumnos}
            apoderados={apoderados}
            filiales={filiales}
            searchTerm={searchTerm}
            citasView={citasView}
            setCitasView={setCitasView}
            calendarWeekStart={calendarWeekStart}
            setCalendarWeekStart={setCalendarWeekStart}
            slideOffset={slideOffset}
            setSlideOffset={setSlideOffset}
            isTransitioning={isTransitioning}
            setIsTransitioning={setIsTransitioning}
            plusMenuDate={plusMenuDate}
            setPlusMenuDate={setPlusMenuDate}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            editingItem={editingItem}
            schedulingFlow={schedulingFlow}
            setSchedulingFlow={setSchedulingFlow}
            selectedFilialId={selectedFilialId}
            setSelectedFilialId={setSelectedFilialId}
            searchStudentTerm={searchStudentTerm}
            setSearchStudentTerm={setSearchStudentTerm}
            isStudentDropdownOpen={isStudentDropdownOpen}
            setIsStudentDropdownOpen={setIsStudentDropdownOpen}
            selectedAlumnoId={selectedAlumnoId}
            setSelectedAlumnoId={setSelectedAlumnoId}
            matchedAlumnos={matchedAlumnos}
            newStudentType={newStudentType}
            setNewStudentType={setNewStudentType}
            apoderadoNombre={apoderadoNombre}
            setApoderadoNombre={setApoderadoNombre}
            apoderadoTelefono={apoderadoTelefono}
            setApoderadoTelefono={setApoderadoTelefono}
            apoderadoEmail={apoderadoEmail}
            setApoderadoEmail={setApoderadoEmail}
            newStudents={newStudents}
            setNewStudents={setNewStudents}
            appointmentDate={appointmentDate}
            setAppointmentDate={setAppointmentDate}
            appointmentTime={appointmentTime}
            setAppointmentTime={setAppointmentTime}
            appointmentObservaciones={appointmentObservaciones}
            setAppointmentObservaciones={setAppointmentObservaciones}
            preselectedDate={preselectedDate}
            setPreselectedDate={setPreselectedDate}
            miniCalendarMonth={miniCalendarMonth}
            setMiniCalendarMonth={setMiniCalendarMonth}
            hoursRibbonRef={hoursRibbonRef}
            isConfirmingSave={isConfirmingSave}
            setIsConfirmingSave={setIsConfirmingSave}
            pendingBookingPayload={pendingBookingPayload}
            setPendingBookingPayload={setPendingBookingPayload}
            resetAppointmentFields={resetAppointmentFields}
            handleAddAppointment={handleAddAppointment}
            handleCreateAppointmentForDate={handleCreateAppointmentForDate}
            filterDateMode={filterDateMode}
            setFilterDateMode={setFilterDateMode}
            filterDateStart={filterDateStart}
            setFilterDateStart={setFilterDateStart}
            filterDateEnd={filterDateEnd}
            setFilterDateEnd={setFilterDateEnd}
            filterFiliales={filterFiliales}
            setFilterFiliales={setFilterFiliales}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            isFilterExpanded={isFilterExpanded}
            setIsFilterExpanded={setIsFilterExpanded}
            isFilialDropdownOpen={isFilialDropdownOpen}
            setIsFilialDropdownOpen={setIsFilialDropdownOpen}
            isDetailsModalOpen={isDetailsModalOpen}
            setIsDetailsModalOpen={setIsDetailsModalOpen}
            detailsAppointment={detailsAppointment}
            setDetailsAppointment={setDetailsAppointment}
            isReprogrammingExpanded={isReprogrammingExpanded}
            setIsReprogrammingExpanded={setIsReprogrammingExpanded}
            detailsNotes={detailsNotes}
            setDetailsNotes={setDetailsNotes}
            openAppointmentDetails={openAppointmentDetails}
            handleDetailsNavigation={handleDetailsNavigation}
            handleStatusChangeFromModal={handleStatusChangeFromModal}
            handleReprogramFromModal={handleReprogramFromModal}
            handleUpdateNotes={handleUpdateNotes}
            currentCalendarDate={currentCalendarDate}
            setCurrentCalendarDate={setCurrentCalendarDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            handleDeleteAppointment={handleDeleteAppointment}
          />
        )}

        {activeView === 'alumnos' && (
          <AlumnosView
            alumnos={alumnos}
            searchTerm={searchTerm}
            setEditingItem={setEditingItem}
            setIsModalOpen={setIsModalOpen}
            handleDeleteAlumno={handleDeleteAlumno}
          />
        )}

        {activeView === 'apoderados' && (
          <ApoderadosView
            apoderados={apoderados}
            searchTerm={searchTerm}
            setEditingItem={setEditingItem}
            setIsModalOpen={setIsModalOpen}
            handleDeleteApoderado={handleDeleteApoderado}
          />
        )}

        {activeView === 'filiales' && (
          <FilialesView
            filiales={filiales}
            searchTerm={searchTerm}
            openNewFilial={openNewFilial}
            openEditFilial={openEditFilial}
            toggleFilialStatus={toggleFilialStatus}
            isRescheduleModalOpen={isRescheduleModalOpen}
            setIsRescheduleModalOpen={setIsRescheduleModalOpen}
            rescheduleApp={rescheduleApp}
            currentCalendarDate={currentCalendarDate}
            setCurrentCalendarDate={setCurrentCalendarDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            handleRescheduleConfirm={handleRescheduleConfirm}
            mensajesWsp={mensajesWsp}
            isMensajesModalOpen={isMensajesModalOpen}
            setIsMensajesModalOpen={setIsMensajesModalOpen}
            isEditMensajeOpen={isEditMensajeOpen}
            setIsEditMensajeOpen={setIsEditMensajeOpen}
            editingMensaje={editingMensaje}
            openMensajesGestor={openMensajesGestor}
            openNewMensaje={openNewMensaje}
            openEditMensaje={openEditMensaje}
            handleDeleteMensaje={handleDeleteMensaje}
            handleSaveMensaje={handleSaveMensaje}
            availableFiliales={availableFiliales}
            selectedFiliales={selectedFiliales}
            onDragStartMensaje={onDragStartMensaje}
            onDragMensaje={onDragMensaje}
            onDragEndMensaje={onDragEndMensaje}
            onDragOverMensaje={onDragOverMensaje}
            onDropMensaje={onDropMensaje}
            selectAllFilialesMensaje={selectAllFilialesMensaje}
            deselectAllFilialesMensaje={deselectAllFilialesMensaje}
            draggingItem={draggingItem}
            dragPos={dragPos}
          />
        )}

        {activeView === 'historias' && (
          <HistoriasView
            historias={historias}
            coloresCorporativos={coloresCorporativos}
            searchTerm={searchTerm}
            getFotoUrl={getFotoUrl}
            handleToggleHistoriaActiva={handleToggleHistoriaActiva}
            handleDeleteHistoria={handleDeleteHistoria}
            openHistoriaModal={openHistoriaModal}
            setIsColorManagerOpen={setIsColorManagerOpen}
            isHistoriaModalOpen={isHistoriaModalOpen}
            setIsHistoriaModalOpen={setIsHistoriaModalOpen}
            editingHistoria={editingHistoria}
            historiaFotoPreview={historiaFotoPreview}
            setHistoriaFotoPreview={setHistoriaFotoPreview}
            historiaFotoFile={historiaFotoFile}
            setHistoriaFotoFile={setHistoriaFotoFile}
            historiaColorSeleccionado={historiaColorSeleccionado}
            setHistoriaColorSeleccionado={setHistoriaColorSeleccionado}
            uploadingFoto={uploadingFoto}
            handleSaveHistoria={handleSaveHistoria}
            isAjusteOpen={isAjusteOpen}
            setIsAjusteOpen={setIsAjusteOpen}
            ajustePosX={ajustePosX}
            setAjustePosX={setAjustePosX}
            ajustePosY={ajustePosY}
            setAjustePosY={setAjustePosY}
            ajusteScale={ajusteScale}
            setAjusteScale={setAjusteScale}
            isColorManagerOpen={isColorManagerOpen}
            editingColor={editingColor}
            colorFormNombre={colorFormNombre}
            setColorFormNombre={setColorFormNombre}
            colorFormHex={colorFormHex}
            setColorFormHex={setColorFormHex}
            colorFormClaseCss={colorFormClaseCss}
            setColorFormClaseCss={setColorFormClaseCss}
            openColorModal={openColorModal}
            handleSaveColor={handleSaveColor}
            handleDeleteColor={handleDeleteColor}
          />
        )}

        {activeView === 'carrusel02' && (
          <CarruselView
            carrusel02={carrusel02}
            getCarrusel02Url={getCarrusel02Url}
            openCarrusel02Modal={openCarrusel02Modal}
            handleCarrusel02Delete={handleCarrusel02Delete}
            handleCarrusel02ToggleActivo={handleCarrusel02ToggleActivo}
            handleCarrusel02DragStart={handleCarrusel02DragStart}
            handleCarrusel02DragOver={handleCarrusel02DragOver}
            handleCarrusel02Drop={handleCarrusel02Drop}
            setCarrusel02DragOver={setCarrusel02DragOver}
            carrusel02DragRef={carrusel02DragRef}
            carrusel02DragOver={carrusel02DragOver}
            isCarrusel02ModalOpen={isCarrusel02ModalOpen}
            setIsCarrusel02ModalOpen={setIsCarrusel02ModalOpen}
            carrusel02Editing={carrusel02Editing}
            carrusel02File={carrusel02File}
            setCarrusel02File={setCarrusel02File}
            carrusel02Preview={carrusel02Preview}
            setCarrusel02Preview={setCarrusel02Preview}
            carrusel02Uploading={carrusel02Uploading}
            carrusel02FileInputRef={carrusel02FileInputRef}
            isCarrusel02AjusteOpen={isCarrusel02AjusteOpen}
            setIsCarrusel02AjusteOpen={setIsCarrusel02AjusteOpen}
            carrusel02PosX={carrusel02PosX}
            setCarrusel02PosX={setCarrusel02PosX}
            carrusel02PosY={carrusel02PosY}
            setCarrusel02PosY={setCarrusel02PosY}
            carrusel02Scale={carrusel02Scale}
            setCarrusel02Scale={setCarrusel02Scale}
            handleCarrusel02Save={handleCarrusel02Save}
          />
        )}

        {activeView === 'reportes' && (
          <ReportesView
            appointments={appointments}
            alumnos={alumnos}
            apoderados={apoderados}
            filiales={filiales}
          />
        )}

        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden relative animate-in fade-in zoom-in duration-200">
              {/* Header / Franja Superior */}
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <Settings size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Configuración</h3>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-2">
                  <Settings size={32} className="text-slate-400" />
                </div>
                <p className="text-lg font-bold text-slate-700">Módulo en Desarrollo</p>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-100/80">
                  Aún por implementar más detalle
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modales de Alumnos/Apoderados/Filiales */}
        {(activeView === 'alumnos' || activeView === 'apoderados' || activeView === 'filiales') && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingItem(null);
              resetAppointmentFields();
              setAlumnoFormTipo('dependiente');
            }}
            title={editingItem ? `Editar ${editingItem.nombre || 'Registro'}` : (activeView === 'alumnos' ? 'Registrar Alumno' : activeView === 'apoderados' ? 'Registrar Apoderado' : 'Nueva Filial')}
            maxWidth="max-w-lg"
          >
            {activeView === 'alumnos' ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                handleAddAlumno(Object.fromEntries(fd));
              }} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                  <input type="text" name="nombre_completo" required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="Ej. Javier Estrada" />
                </div>
                {/* Tipo de alumno */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tipo de Alumno</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${alumnoFormTipo === 'dependiente' ? 'border-blue-500 bg-blue-100/50' : 'border-blue-200 bg-blue-50/50'}`}>
                      <input
                        type="radio"
                        name="tipo_alumno"
                        value="dependiente"
                        checked={alumnoFormTipo === 'dependiente'}
                        onChange={() => setAlumnoFormTipo('dependiente')}
                        className="text-blue-600"
                      />
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Dependiente</p>
                        <p className="text-[13px] text-slate-400">Tiene apoderado</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${alumnoFormTipo === 'independiente' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
                      <input
                        type="radio"
                        name="tipo_alumno"
                        value="independiente"
                        checked={alumnoFormTipo === 'independiente'}
                        onChange={() => setAlumnoFormTipo('independiente')}
                        className="text-emerald-600"
                      />
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Independiente</p>
                        <p className="text-[13px] text-slate-400">Contacto propio</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Apoderado - Solo si es dependiente */}
                {alumnoFormTipo === 'dependiente' ? (
                  <>
                    <div id="apoderado-section">
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Apoderado</label>
                      <select name="id_apoderado" required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm">
                        <option value="" disabled>Seleccione un apoderado...</option>
                        {apoderados.map(ap => <option key={ap.id} value={ap.id}>{ap.nombre_completo}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Edad</label>
                      <input type="number" name="edad" required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Edad</label>
                        <input type="number" name="edad" required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Celular</label>
                        <input type="text" name="telefono" required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="999000888" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                      <input type="email" name="email" className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="correo@ejemplo.com" />
                    </div>
                  </>
                )}

                <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-md shadow-emerald-100/50 hover:bg-emerald-700 transition-all uppercase tracking-wider text-xs mt-4 btn-glow">
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
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                  <input type="text" name="nombre_completo" required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="Ej. Juan Pérez" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Celular</label>
                  <input type="text" name="telefono" required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="999888777" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                  <input type="email" name="email" className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="correo@ejemplo.com" />
                </div>
                <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-md shadow-emerald-100/50 hover:bg-emerald-700 transition-all uppercase tracking-wider text-xs mt-4 btn-glow">
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
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
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
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${isFilialAjusteOpen ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
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
                      <p className="text-[13px] text-slate-400 mt-2 text-center">Arrastra la imagen en el recuadro para centrarla</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre de la Filial</label>
                  <input type="text" name="nombre" defaultValue={editingItem?.nombre} required className="w-full p-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-sm" placeholder="Ej. Filial Norte" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-400 uppercase mb-1">Dpto.</label>
                    <input type="text" name="departamento" defaultValue={editingItem?.departamento} required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-400 uppercase mb-1">Provincia</label>
                    <input type="text" name="provincia" defaultValue={editingItem?.provincia} required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-400 uppercase mb-1">Distrito</label>
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

                <button disabled={uploadingFilial} type="submit" className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-md shadow-emerald-100/50 hover:bg-emerald-700 transition-all mt-4 btn-glow uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                  {uploadingFilial ? 'Subiendo imagen...' : (editingItem ? 'Actualizar en DB' : 'Crear en DB')}
                </button>
              </form>
            )}
          </Modal>
        )}

        <ConfirmAlert config={alertConfig} onClose={() => setAlertConfig(null)} />
      </main>
    </div>
  );
};

export default App;
