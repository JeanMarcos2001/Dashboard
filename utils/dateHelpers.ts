export const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  return { days, firstDay };
};

export const formatHour12 = (hour24: string) => {
  if (!hour24) return '';
  const [hStr, mStr] = hour24.split(':');
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:00 ${period}`;
};

export const getAvailableHours = (date: Date) => {
  const day = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const hours = [];

  if (day === 0) {
    // Domingo: 10am a 4pm (10, 11, 12, 13, 14, 15, 16)
    for (let i = 10; i <= 16; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }
  } else {
    // Lunes a Sábado: 9am a 12pm (9, 10, 11, 12) y 3pm a 7pm (15, 16, 17, 18, 19)
    for (let i = 9; i <= 12; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }
    for (let i = 15; i <= 19; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }
  }
  return hours;
};

export const getAvailableHoursForDateStr = (dateStr: string) => {
  if (!dateStr) return [];
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return getAvailableHours(date);
};
