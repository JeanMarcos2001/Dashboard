import React, { useState, useMemo } from 'react';
import { Appointment, Alumno, Apoderado, Filial, AppointmentStatus } from '../types';
import { FileText, Download, Printer, Filter, Calendar, Users, Briefcase, RefreshCw } from 'lucide-react';

interface ReportesViewProps {
  appointments: Appointment[];
  alumnos: Alumno[];
  apoderados: Apoderado[];
  filiales: Filial[];
}

export const ReportesView: React.FC<ReportesViewProps> = ({
  appointments,
  alumnos,
  apoderados,
  filiales,
}) => {
  // Estados de filtros
  const [reportType, setReportType] = useState<'citas' | 'entrevistas' | 'alumnos'>('citas');
  const [filialId, setFilialId] = useState<string>('all');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  const [status, setStatus] = useState<string>('all');
  const [ageMin, setAgeMin] = useState<string>('');
  const [ageMax, setAgeMax] = useState<string>('');
  const [studentType, setStudentType] = useState<'all' | 'dependent' | 'independent'>('all');

  // Estado de los datos filtrados para la vista
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  // Paginación local
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // Limpiar filtros al cambiar el tipo de reporte
  const handleReportTypeChange = (type: 'citas' | 'entrevistas' | 'alumnos') => {
    setReportType(type);
    setFilialId('all');
    setDateStart('');
    setDateEnd('');
    setStatus('all');
    setAgeMin('');
    setAgeMax('');
    setStudentType('all');
    setFilteredResults([]);
    setHasGenerated(false);
    setCurrentPage(1);
  };

  // Función para filtrar los datos en base a los criterios seleccionados
  const handleGenerateReport = () => {
    setLoadingReport(true);
    setTimeout(() => {
      let results: any[] = [];

      if (reportType === 'citas' || reportType === 'entrevistas') {
        // Filtrar citas o entrevistas
        results = appointments.filter((app) => {
          // Filtrar por tipo (citas: alumno_existente, entrevistas: matriculas)
          const isCita = app.tipo_cita === 'alumno_existente';
          if (reportType === 'citas' && !isCita) return false;
          if (reportType === 'entrevistas' && isCita) return false;

          // Filtrar por sede
          if (filialId !== 'all' && Number(app.id_filial) !== Number(filialId)) return false;

          // Filtrar por fechas
          if (dateStart && app.fecha_cita < dateStart) return false;
          if (dateEnd && app.fecha_cita > dateEnd) return false;

          // Filtrar por estado
          if (status !== 'all' && app.estado !== status) return false;

          return true;
        });
      } else if (reportType === 'alumnos') {
        // Filtrar alumnos y cruzar con sus apoderados
        results = alumnos.filter((alumno) => {
          // Filtrar por sede (buscando en citas/entrevistas del alumno para determinar su filial activa)
          if (filialId !== 'all') {
            const alumnoApps = appointments.filter(a => Number(a.id_alumno) === Number(alumno.id));
            const matchesFilial = alumnoApps.some(a => Number(a.id_filial) === Number(filialId));
            if (!matchesFilial) return false;
          }

          // Filtrar por fecha de registro (creado_en)
          if (dateStart || dateEnd) {
            const regDate = alumno.creado_en || alumno.created_at;
            if (regDate) {
              const regDateStr = regDate.split('T')[0];
              if (dateStart && regDateStr < dateStart) return false;
              if (dateEnd && regDateStr > dateEnd) return false;
            }
          }

          // Filtrar por edad
          if (ageMin && alumno.edad < Number(ageMin)) return false;
          if (ageMax && alumno.edad > Number(ageMax)) return false;

          // Filtrar por tipo (dependiente/independiente)
          const esIndependiente = !alumno.id_apoderado;
          if (studentType === 'dependent' && esIndependiente) return false;
          if (studentType === 'independent' && !esIndependiente) return false;

          return true;
        }).map(alumno => {
          // Enlazar datos de apoderado
          const apo = apoderados.find(a => Number(a.id) === Number(alumno.id_apoderado));
          return {
            ...alumno,
            apoderado_nombre: apo ? apo.nombre_completo : 'N/A',
            apoderado_telefono: apo ? apo.telefono : 'N/A',
            apoderado_email: apo ? apo.email : 'N/A',
          };
        });
      }

      setFilteredResults(results);
      setHasGenerated(true);
      setCurrentPage(1);
      setLoadingReport(false);
    }, 300);
  };

  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  // Cálculos de métricas rápidas basadas en el resultado filtrado
  const metrics = useMemo(() => {
    if (filteredResults.length === 0) return null;

    if (reportType === 'citas' || reportType === 'entrevistas') {
      const total = filteredResults.length;
      const asistieron = filteredResults.filter(r => r.estado === AppointmentStatus.ASISTIO).length;
      const confirmados = filteredResults.filter(r => r.estado === AppointmentStatus.CONFIRMADO).length;
      const faltaron = filteredResults.filter(r => r.estado === AppointmentStatus.FALTO).length;
      const cancelados = filteredResults.filter(r => r.estado === AppointmentStatus.CANCELADO).length;
      const pendientes = filteredResults.filter(r => r.estado === AppointmentStatus.PENDIENTE).length;
      const convertivos = filteredResults.filter(r => r.estado === AppointmentStatus.CONVERTIDO).length;

      const rateAsistencia = total > 0 ? Math.round(((asistieron + convertivos) / total) * 100) : 0;

      return {
        total,
        asistieron,
        confirmados,
        faltaron,
        cancelados,
        pendientes,
        convertivos,
        rateAsistencia
      };
    } else {
      const total = filteredResults.length;
      const totalEdad = filteredResults.reduce((acc, curr) => acc + (curr.edad || 0), 0);
      const promedioEdad = total > 0 ? Math.round(totalEdad / total) : 0;
      const independientes = filteredResults.filter(r => !r.id_apoderado).length;
      const dependientes = total - independientes;

      const pctIndependientes = total > 0 ? Math.round((independientes / total) * 100) : 0;

      return {
        total,
        promedioEdad,
        independientes,
        dependientes,
        pctIndependientes
      };
    }
  }, [filteredResults, reportType]);

  // Paginación de los resultados
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const currentResults = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredResults, currentPage]);

  // Exportar a CSV
  const handleExportCSV = () => {
    if (filteredResults.length === 0) return;

    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'citas' || reportType === 'entrevistas') {
      headers = ['ID', 'Alumno', 'Sede', 'Fecha', 'Hora', 'Estado', 'Tipo de Persona', 'Observaciones', 'Creado En'];
      rows = filteredResults.map(r => [
        r.id.toString(),
        r.alumno_nombre || '',
        r.filial_nombre || '',
        r.fecha_cita || '',
        r.hora_cita || '',
        r.estado || '',
        r.tipo_persona || '',
        r.observaciones || '',
        r.creado_en || r.created_at || ''
      ]);
    } else {
      headers = ['ID', 'Alumno', 'Edad', 'Celular Alumno', 'Email Alumno', 'Apoderado', 'Celular Apoderado', 'Email Apoderado', 'Fecha Registro'];
      rows = filteredResults.map(r => [
        r.id.toString(),
        r.nombre_completo || '',
        r.edad ? r.edad.toString() : '',
        r.telefono || '',
        r.email || '',
        r.apoderado_nombre || '',
        r.apoderado_telefono || '',
        r.apoderado_email || '',
        r.creado_en || r.created_at || ''
      ]);
    }

    // Unir encabezados y filas separados por punto y coma (apropiado para Excel en español)
    const csvContent = "\uFEFF" + [
      headers.join(';'),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* Estilos específicos para la impresión PDF */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Título de la Sección */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reportes Avanzados</h2>
          <p className="text-slate-500 font-medium italic text-xs">Genera, visualiza e imprime reportes con filtros inteligentes</p>
        </div>
        
        {filteredResults.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-100/50 transition-all cursor-pointer"
            >
              <Download size={14} /> Exportar CSV
            </button>
            <button
              onClick={handlePrint}
              className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-slate-200/50 transition-all cursor-pointer"
            >
              <Printer size={14} /> Imprimir Reporte
            </button>
          </div>
        )}
      </div>

      {/* Contenedor de Filtros */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm no-print">
        <div className="flex items-center gap-2 mb-4 text-emerald-700 font-semibold text-xs uppercase tracking-wider">
          <Filter size={18} />
          <span>Filtros de Reporte</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tipo de Reporte */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tipo de Reporte</label>
            <select
              value={reportType}
              onChange={(e) => handleReportTypeChange(e.target.value as any)}
              className="p-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
            >
              <option value="citas">Citas (Existentes)</option>
              <option value="entrevistas">Entrevistas (Matrículas)</option>
              <option value="alumnos">Alumnos y Apoderados</option>
            </select>
          </div>

          {/* Sede / Filial */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sede / Filial</label>
            <select
              value={filialId}
              onChange={(e) => setFilialId(e.target.value)}
              className="p-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
            >
              <option value="all">Todas las Sedes</option>
              {filiales.map((f) => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
          </div>

          {/* Fecha Inicio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {reportType === 'alumnos' ? 'Fecha Registro Desde' : 'Fecha Desde'}
            </label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="p-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
            />
          </div>

          {/* Fecha Fin */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {reportType === 'alumnos' ? 'Fecha Registro Hasta' : 'Fecha Hasta'}
            </label>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="p-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
            />
          </div>

          {/* Filtros Condicionales por Tipo de Reporte */}
          {(reportType === 'citas' || reportType === 'entrevistas') ? (
            <div className="flex flex-col gap-1.5 sm:col-span-2 md:col-span-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="p-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
              >
                <option value="all">Todos los Estados</option>
                {reportType === 'citas' ? (
                  <>
                    <option value={AppointmentStatus.PENDIENTE}>Pendiente</option>
                    <option value={AppointmentStatus.ASISTIO}>Asistió</option>
                    <option value={AppointmentStatus.FALTO}>Faltó (Legacy)</option>
                    <option value={AppointmentStatus.CANCELADO}>Cancelado</option>
                  </>
                ) : (
                  <>
                    <option value={AppointmentStatus.PENDIENTE}>Pendiente</option>
                    <option value={AppointmentStatus.CONFIRMADO}>Confirmado</option>
                    <option value={AppointmentStatus.CONVERTIDO}>Convertido</option>
                    <option value={AppointmentStatus.CANCELADO}>Cancelado</option>
                    <option value={AppointmentStatus.AGENDADO}>Agendado (Legacy)</option>
                  </>
                )}
              </select>
            </div>
          ) : (
            <>
              {/* Edad Min */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Edad Mínima</label>
                <input
                  type="number"
                  placeholder="Ej. 6"
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value)}
                  className="p-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
                />
              </div>
              {/* Edad Max */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Edad Máxima</label>
                <input
                  type="number"
                  placeholder="Ej. 18"
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                  className="p-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
                />
              </div>
              {/* Tipo de Alumno */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Dependencia</label>
                <select
                  value={studentType}
                  onChange={(e) => setStudentType(e.target.value as any)}
                  className="p-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
                >
                  <option value="all">Todos los alumnos</option>
                  <option value="dependent">Con Apoderado</option>
                  <option value="independent">Independiente (Sin Apoderado)</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleGenerateReport}
            disabled={loadingReport}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-100/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
          >
            {loadingReport ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <FileText size={18} />
                <span>Generar Reporte</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visualización del Reporte e Impresión */}
      {hasGenerated && (
        <div id="print-area" className="space-y-6 animate-in fade-in duration-300">
          {/* Cabecera del Reporte para Impresión */}
          <div className="hidden no-print block-print border-b border-slate-300 pb-4 mb-4">
            <h1 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Reporte Centralizado de Operaciones</h1>
            <p className="text-[11px] text-slate-500 font-semibold">
              Tipo: <span className="text-slate-800 uppercase font-bold">{reportType}</span> | 
              Sede: <span className="text-slate-800 font-bold">{filialId === 'all' ? 'Todas' : filiales.find(f => Number(f.id) === Number(filialId))?.nombre || 'Desconocida'}</span> | 
              Fecha de Emisión: <span className="text-slate-800 font-bold">{new Date().toLocaleDateString('es-PE')}</span>
            </p>
            {((dateStart || dateEnd) && (
              <p className="text-xs text-slate-500 font-bold mt-1">
                Rango Filtrado: Desde {dateStart || 'Inicio'} hasta {dateEnd || 'Fin'}
              </p>
            ))}
          </div>

          {/* Tarjetas de Métricas */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total de Registros</span>
                <span className="text-xl font-bold text-slate-800 mt-2">{metrics.total}</span>
              </div>

              {(reportType === 'citas' || reportType === 'entrevistas') ? (
                <>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tasa Asistencia / Conversión</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-xl font-bold text-emerald-600">{(metrics as any).rateAsistencia}%</span>
                      <span className="text-xs font-medium text-slate-400">asistió/convirtió</span>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Asistencias / Faltas</span>
                    <span className="text-sm font-semibold text-slate-700 mt-2">
                      <span className="text-emerald-600 font-bold">{(metrics as any).asistieron}</span> asistencias
                      <span className="text-slate-300 mx-1">|</span>
                      <span className="text-orange-500 font-bold">{(metrics as any).faltaron}</span> faltas
                    </span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Estado Pendientes</span>
                    <span className="text-sm font-semibold text-slate-700 mt-2">
                      <span className="text-amber-500 font-bold">{(metrics as any).pendientes}</span> citas por atender
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Edad Promedio</span>
                    <span className="text-xl font-bold text-indigo-600 mt-2">{(metrics as any).promedioEdad} años</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Alumnos Independientes</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-xl font-bold text-sky-600">{(metrics as any).pctIndependientes}%</span>
                      <span className="text-xs font-medium text-slate-400">{(metrics as any).independientes} alumnos</span>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Alumnos Dependientes</span>
                    <span className="text-sm font-semibold text-slate-700 mt-2">
                      <span className="text-teal-600 font-bold">{(metrics as any).dependientes}</span> alumnos con apoderado
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tabla de Resultados */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {filteredResults.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="p-4 pl-6">ID</th>
                      <th className="p-4">
                        {reportType === 'alumnos' ? 'Nombre Alumno' : 'Alumno'}
                      </th>
                      {reportType === 'alumnos' ? (
                        <>
                          <th className="p-4">Edad</th>
                          <th className="p-4">Celular Alumno</th>
                          <th className="p-4">Apoderado</th>
                          <th className="p-4">Celular Apoderado</th>
                          <th className="p-4 pr-6">Fecha Registro</th>
                        </>
                      ) : (
                        <>
                          <th className="p-4">Sede / Filial</th>
                          <th className="p-4">Fecha Cita</th>
                          <th className="p-4">Hora</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4 pr-6">Observaciones</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {currentResults.map((r, idx) => {
                      const isEven = idx % 2 === 0;
                      return (
                        <tr key={r.id} className={`${isEven ? 'bg-white' : 'bg-slate-50/50'} hover:bg-emerald-50/20 transition-all`}>
                          <td className="p-4 pl-6 font-bold text-slate-400">#{r.id}</td>
                          <td className="p-4 font-semibold text-slate-700">
                            {reportType === 'alumnos' ? r.nombre_completo : r.alumno_nombre}
                          </td>
                          {reportType === 'alumnos' ? (
                            <>
                              <td className="p-4 font-bold text-slate-600">{r.edad} años</td>
                              <td className="p-4 text-slate-500 font-bold">{r.telefono || 'N/A'}</td>
                              <td className="p-4 font-bold text-slate-700">{r.apoderado_nombre}</td>
                              <td className="p-4 text-slate-500 font-bold">{r.apoderado_telefono}</td>
                              <td className="p-4 text-slate-400 font-bold pr-6">
                                {r.creado_en ? new Date(r.creado_en).toLocaleDateString('es-PE') : new Date(r.created_at).toLocaleDateString('es-PE')}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-4 font-bold text-slate-600">{r.filial_nombre}</td>
                              <td className="p-4 font-bold text-slate-600">
                                {new Date(r.fecha_cita + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="p-4 font-bold text-slate-500">
                                {(() => {
                                  const [h, m] = r.hora_cita.split(':').map(Number);
                                  const period = h >= 12 ? 'PM' : 'AM';
                                  const h12 = h % 12 || 12;
                                  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
                                })()}
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 shadow-sm
                                  ${r.estado === AppointmentStatus.ASISTIO || r.estado === AppointmentStatus.CONVERTIDO
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : r.estado === AppointmentStatus.CONFIRMADO
                                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                    : r.estado === AppointmentStatus.CANCELADO
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : r.estado === AppointmentStatus.FALTO
                                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                    : r.estado === AppointmentStatus.PENDIENTE
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }
                                `}>
                                  <span className={`w-2 h-2 rounded-full 
                                    ${r.estado === AppointmentStatus.ASISTIO || r.estado === AppointmentStatus.CONVERTIDO
                                      ? 'bg-emerald-500'
                                      : r.estado === AppointmentStatus.CONFIRMADO
                                      ? 'bg-teal-500'
                                      : r.estado === AppointmentStatus.CANCELADO
                                      ? 'bg-rose-500'
                                      : r.estado === AppointmentStatus.FALTO
                                      ? 'bg-orange-500'
                                      : r.estado === AppointmentStatus.PENDIENTE
                                      ? 'bg-sky-500'
                                      : 'bg-amber-500'
                                    }
                                  `} />
                                  {r.estado}
                                </span>
                              </td>
                              <td className="p-4 text-slate-400 font-bold text-xs truncate max-w-[200px] pr-6" title={r.observaciones || ''}>
                                {r.observaciones || '—'}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-16 text-center">
                  <FileText className="mx-auto text-slate-300 mb-3" size={48} />
                  <p className="font-bold text-slate-400 text-base uppercase tracking-wide">Sin resultados</p>
                  <p className="text-slate-400 text-xs font-semibold mt-1">No se encontraron registros que cumplan con los filtros seleccionados</p>
                </div>
              )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center no-print">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Página {currentPage} de {totalPages} ({filteredResults.length} registros totales)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-sm"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-sm"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
