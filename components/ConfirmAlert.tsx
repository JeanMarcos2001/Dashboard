import React from 'react';

interface ConfirmAlertProps {
  config: any;
  onClose: () => void;
}

export const ConfirmAlert: React.FC<ConfirmAlertProps> = ({ config, onClose }) => {
  if (!config?.isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/80 backdrop-blur-xl rounded-[20px] w-full max-w-[270px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/50">
        <div className="p-5 pt-6 text-center">
          <h3 className="text-[17px] font-bold text-slate-900 mb-1 leading-snug">{config.title}</h3>
          <p className="text-[14px] text-slate-600 leading-tight px-1 font-medium">{config.message}</p>
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
