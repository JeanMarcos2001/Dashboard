import React from 'react';
import { Calendar, CheckCircle2, Clock, ArrowUpRight, ChevronRight, Info } from 'lucide-react';
import { Appointment, Alumno, Stats, AppointmentStatus } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { isAlumnoExistenteCita } from '../utils/appointments';

interface DashboardViewProps {
  stats: Stats;
  appointments: Appointment[];
  alumnos: Alumno[];
  setActiveView: (view: 'dashboard' | 'citas' | 'alumnos' | 'filiales' | 'apoderados' | 'historias' | 'carrusel02') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, appointments, alumnos, setActiveView }) => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard title="Total Citas" value={stats.totalAppointments} icon={<Calendar className="text-blue-500" />} trend="Histórico" color="blue" />
      <StatCard title="Confirmadas" value={stats.verifiedCount} icon={<CheckCircle2 className="text-emerald-500" />} trend={`${((stats.verifiedCount / Math.max(stats.totalAppointments, 1)) * 100).toFixed(1)}% del total`} color="emerald" />
      <StatCard title="Agendadas" value={stats.pendingCount} icon={<Clock className="text-amber-500" />} trend={`${((stats.pendingCount / Math.max(stats.totalAppointments, 1)) * 100).toFixed(1)}% del total`} color="amber" />
      <StatCard title="Conversión" value={`${stats.conversionRate.toFixed(1)}%`} icon={<ArrowUpRight className="text-purple-500" />} trend="Matrículas exitosas" color="purple" />
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
          {appointments.length > 0 ? appointments.slice(0, 4).map(app => {
            const al = alumnos.find(a => a.id === app.id_alumno);
            const isExistente = isAlumnoExistenteCita(app);
            const isIndependiente = app.tipo_persona === 'independiente' || app.tipo_persona === 'existente_independiente' || !al?.id_apoderado;
            const isNew = app.creado_en && (new Date().getTime() - new Date(app.creado_en).getTime() < 12 * 60 * 60 * 1000);

            const containerClasses = isExistente
              ? 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-300'
              : 'bg-indigo-50/40 border-indigo-100 hover:border-indigo-300';

            const avatarClasses = isExistente
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 text-white';

            return (
              <div key={app.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group ${containerClasses}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center font-black text-lg ${avatarClasses}`}>
                    {app.alumno_nombre?.[0] || 'A'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-slate-800 leading-none text-[15px]">{app.alumno_nombre}</p>
                      {isNew && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm animate-pulse">
                          Nuevo
                        </span>
                      )}
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${isExistente
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200/50'
                        : 'bg-indigo-100 text-indigo-700 border border-indigo-200/50'
                        }`}>
                        {isExistente ? 'Cita' : 'Entrevista'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase">{app.fecha_cita} • {app.hora_cita}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase px-1.5 py-0.5 rounded-lg border border-slate-200/60 bg-white/70 text-slate-600 shadow-sm hidden sm:inline-block">
                    {isIndependiente ? 'Indep.' : 'Apod.'}
                  </span>
                  <StatusBadge status={app.estado} />
                </div>
              </div>
            );
          }) : <p className="text-center text-slate-400 py-10 font-medium italic">No hay actividad reciente</p>}
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Alumnos Recientes</h3>
        <div className="space-y-4">
          {alumnos.length > 0 ? [...alumnos].sort((a, b) => {
            const timeA = a.creado_en ? new Date(a.creado_en).getTime() : 0;
            const timeB = b.creado_en ? new Date(b.creado_en).getTime() : 0;
            if (timeA !== timeB) return timeB - timeA;
            return b.id - a.id;
          }).slice(0, 4).map(al => (
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
