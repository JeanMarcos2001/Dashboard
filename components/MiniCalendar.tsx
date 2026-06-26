import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment, AppointmentStatus } from '../types';
import { isAlumnoExistenteCita } from '../utils/appointments';

interface MiniCalendarProps {
  appointments: Appointment[];
}

const DAYS_INITIALS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ appointments }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Obtener los días del mes actual y los días de relleno de los meses adyacentes
  const calendarCells = useMemo(() => {
    const cells = [];
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Relleno de días del mes anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const cellDate = new Date(year, month - 1, dayNum);
      cells.push({
        day: dayNum,
        date: cellDate,
        isCurrentMonth: false,
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const cellDate = new Date(year, month, i);
      cells.push({
        day: i,
        date: cellDate,
        isCurrentMonth: true,
      });
    }

    // Relleno de días del mes siguiente para completar la grilla
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - cells.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const cellDate = new Date(year, month + 1, i);
      cells.push({
        day: i,
        date: cellDate,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month]);

  // Contar entrevistas agendadas para una fecha dada (formato YYYY-MM-DD)
  const getInterviewsCountForDate = (date: Date): number => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    return appointments.filter(app => {
      // Excluir citas de alumnos existentes (Flujo A)
      if (isAlumnoExistenteCita(app)) return false;
      return app.fecha_cita === dateStr;
    }).length;
  };

  // Obtener el estilo de intensidad del verde según la cantidad de entrevistas
  const getBadgeStyle = (count: number): string => {
    if (count === 0) return '';
    if (count <= 2) return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    if (count <= 4) return 'bg-emerald-100 text-emerald-700 border border-emerald-200/50';
    if (count <= 6) return 'bg-emerald-200 text-emerald-800 border border-emerald-300/50';
    if (count <= 8) return 'bg-emerald-500 text-white border border-emerald-600';
    return 'bg-emerald-700 text-white font-black border border-emerald-800';
  };

  const isSameDay = (d1: Date, d2: Date): boolean => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const capitalizedMonth = MONTH_NAMES[month];

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white shadow-sm flex flex-col">
      {/* 1. Fila superior con las iniciales de los días */}
      <div className="grid grid-cols-7 gap-1 text-center mb-3">
        {DAYS_INITIALS.map((day, idx) => (
          <span key={idx} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="border-b border-slate-100 mb-3" />

      {/* 2. Nombre del mes y año con controles de navegación */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-base font-bold text-slate-800">
          {capitalizedMonth}, {year}
        </h4>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 3. Grilla de días */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarCells.map((cell, idx) => {
          const interviewsCount = getInterviewsCountForDate(cell.date);
          const isSelected = isSameDay(cell.date, selectedDate);
          const isToday = isSameDay(cell.date, new Date());
          const badgeStyle = getBadgeStyle(interviewsCount);

          // Estilo de la celda de día
          let cellStyle = 'relative aspect-square flex flex-col items-center justify-between p-1 rounded-[21px] transition-all duration-200 ';

          if (!cell.isCurrentMonth) {
            cellStyle += 'bg-slate-50/30 text-slate-300 opacity-40 pointer-events-none ';
          } else if (isSelected) {
            cellStyle += 'bg-slate-800 text-white shadow-sm border border-slate-800 cursor-pointer ';
          } else if (isToday) {
            // Día actual: fondo naranja, texto verde
            cellStyle += 'bg-amber-200 border border-amber-300 text-emerald-700 hover:bg-amber-300 cursor-pointer ';
          } else {
            cellStyle += 'bg-white hover:bg-slate-50/70 border border-slate-100 text-slate-700 cursor-pointer ';
          }

          return (
            <div
              key={idx}
              className={cellStyle}
              onClick={() => cell.isCurrentMonth && setSelectedDate(cell.date)}
            >
              {/* cápsula superior para la cantidad de entrevistas */}
              <div className="w-full flex justify-center mt-0.5">
                {interviewsCount > 0 && (
                  <span
                    className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-[9px] font-bold ${badgeStyle}`} 
                  >
                    {interviewsCount}
                  </span>
                )}
              </div>

              {/* número del día */}
              <div className="flex-grow flex items-end justify-center mb-0.5">
                <span
                  className={`text-[13px] font-semibold ${isSelected ? 'text-white' : isToday ? 'text-emerald-700' : 'text-slate-800'}`}
                >
                  {cell.day}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
