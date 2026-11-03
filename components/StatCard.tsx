import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="min-w-0 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex flex-wrap justify-between items-start gap-2 mb-3 sm:mb-4">
        <div className={`p-2.5 sm:p-3 rounded-2xl ${colorMap[color].split(' ')[0]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className={`max-w-full text-[10px] sm:text-xs leading-tight font-semibold uppercase px-2 py-1 rounded-lg break-words ${colorMap[color]}`}>
          {trend}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-slate-400 font-semibold text-[11px] sm:text-xs leading-tight uppercase tracking-wider mb-1 break-words">{title}</p>
        <h4 className="text-xl sm:text-2xl font-bold text-slate-800 leading-none truncate">{value}</h4>
      </div>
    </div>
  );
};
