import React, { useEffect, useRef, useState } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Zona superior (cabecera). En móvil también sirve para arrastrar hacia abajo y cerrar. */
  header: React.ReactNode;
  /** Controles que se dibujan fuera del panel en escritorio (p. ej. flechas anterior/siguiente). */
  desktopSideControls?: React.ReactNode;
  children: React.ReactNode;
}

const DISTANCIA_CIERRE = 110;

/**
 * Panel de detalle: en móvil es una hoja que sube desde abajo sobre la pantalla anterior
 * (con desenfoque) y se cierra arrastrando hacia abajo; en escritorio es un modal centrado.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, header, desktopSideControls, children }) => {
  const [arrastre, setArrastre] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const inicioY = useRef<number | null>(null);

  // Bloquea el scroll de la página de fondo y permite cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    inicioY.current = e.touches[0].clientY;
    setArrastrando(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (inicioY.current === null) return;
    setArrastre(Math.max(0, e.touches[0].clientY - inicioY.current));
  };
  const onTouchEnd = () => {
    inicioY.current = null;
    setArrastrando(false);
    if (arrastre > DISTANCIA_CIERRE) onClose();
    setArrastre(0);
  };

  return (
    <div
      className="overlay-enter fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-slate-900/40 backdrop-blur-md"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full md:max-w-2xl">
        <div className="hidden md:block">{desktopSideControls}</div>

        <div
          role="dialog"
          aria-modal="true"
          className="sheet-enter bg-white w-full flex flex-col overflow-hidden shadow-2xl rounded-t-[28px] md:rounded-3xl max-h-[92dvh] md:max-h-[90vh]"
          style={{
            transform: arrastre ? `translateY(${arrastre}px)` : undefined,
            transition: arrastrando ? 'none' : 'transform 0.25s ease-out',
          }}
        >
          <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
            <div className="md:hidden flex justify-center pt-2.5 pb-1 bg-slate-50" aria-hidden="true">
              <span className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>
            {header}
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar p-4 md:p-6 space-y-5 md:space-y-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
