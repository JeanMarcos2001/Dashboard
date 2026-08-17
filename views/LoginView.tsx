import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
}

/**
 * Pantalla de inicio de sesión.
 * Renderizada por App cuando no hay sesión activa.
 */
export const LoginView: React.FC<LoginViewProps> = ({ onSignIn }) => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: errMsg } = await onSignIn(email.trim(), password);

    if (errMsg) {
      // Traducir mensajes de Supabase al español
      if (errMsg.toLowerCase().includes('invalid login credentials')) {
        setError('Correo o contraseña incorrectos.');
      } else if (errMsg.toLowerCase().includes('email not confirmed')) {
        setError('Debes confirmar tu correo electrónico antes de ingresar.');
      } else {
        setError(errMsg);
      }
      setLoading(false);
    }
    // Si no hay error, onAuthStateChange en useAuth actualiza la sesión automáticamente
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      {/* Fondo decorativo sutil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16,185,129,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Tarjeta principal */}
        <div className="bg-white rounded-3xl border border-slate-200/70 shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-8">

          {/* Logo / Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-emerald-50 border border-emerald-100/60 text-emerald-600 p-4 rounded-2xl mb-4 shadow-sm">
              <GraduationCap size={28} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">
              EduTrack
            </h1>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Sistema de Gestión Educativa
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@edutrack.com"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200/60 rounded-xl text-rose-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-snug">{error}</p>
              </div>
            )}

            {/* Botón de login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-xl shadow-md shadow-emerald-100/50 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Ingresar al sistema
                </>
              )}
            </button>
          </form>
        </div>

        {/* Pie de página */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          © {new Date().getFullYear()} EduTrack — Acceso restringido al personal autorizado
        </p>
      </div>
    </div>
  );
};
