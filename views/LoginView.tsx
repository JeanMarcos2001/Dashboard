import React, { useState, useEffect } from 'react';
import { GraduationCap, Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onSignIn: (email: string, password: string, rememberMe: boolean) => Promise<{ error: string | null }>;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSignIn }) => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Área realmente visible en móvil: se reduce cuando aparece el teclado
  const [visible, setVisible] = useState<{ height: number; top: number } | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    const actualizar = () => {
      if (!vv || window.innerWidth >= 1024) return setVisible(null);
      setVisible({ height: vv.height, top: vv.offsetTop });
    };
    actualizar();
    vv?.addEventListener('resize', actualizar);
    vv?.addEventListener('scroll', actualizar);
    window.addEventListener('resize', actualizar);
    return () => {
      vv?.removeEventListener('resize', actualizar);
      vv?.removeEventListener('scroll', actualizar);
      window.removeEventListener('resize', actualizar);
    };
  }, []);

  // Al enfocar un campo, llevarlo al centro del área visible (sobre el teclado)
  const mostrarCampo = (e: React.FocusEvent<HTMLFormElement>) => {
    const campo = e.target;
    setTimeout(() => campo.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: errMsg } = await onSignIn(email.trim(), password, rememberMe);

    if (errMsg) {
      if (errMsg.toLowerCase().includes('invalid login credentials')) {
        setError('Correo o contraseña incorrectos.');
      } else if (errMsg.toLowerCase().includes('email not confirmed')) {
        setError('Debes confirmar tu correo electrónico antes de ingresar.');
      } else {
        setError(errMsg);
      }
    }
    // Siempre liberar el botón — si el login fue exitoso el componente se desmontará solo
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-x-0 top-0 h-[100dvh] overflow-hidden flex bg-white lg:static lg:h-auto lg:min-h-screen lg:p-6 lg:gap-6"
      style={visible ? { height: visible.height, top: visible.top } : undefined}
    >
      {/* Panel de imagen (solo escritorio) */}
      <aside className="hidden lg:block lg:w-[48%] relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-800">
        <img
          src="/login_art.webp"
          alt=""
          className="absolute -top-2 left-0 w-full h-[calc(100%+0.5rem)] object-cover"
        />
      </aside>

      <div className="relative flex-1 min-w-0">
        {/* Fondo decorativo a todo el ancho */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 110% 50% at 100% 0%, rgba(16,185,129,0.14) 0%, transparent 70%)',
          }}
        />

        {/* Área con scroll interno: solo aparece si el contenido no cabe (p. ej. con el teclado) */}
        <div className="absolute inset-0 flex overflow-y-auto overscroll-contain">
      <div className="m-auto w-full max-w-sm px-6 py-4 relative z-10">
        <div className="sm:p-8">

          {/* Logo / Branding */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-700/40">
              <GraduationCap size={30} className="text-white" fill="white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">
              Dashboard Web
            </h1>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Sistema de Gestión Educativa
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} onFocus={mostrarCampo} className="space-y-4">
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
                  placeholder="usuario@ejemplo.com"
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

            {/* Mantener sesión */}
            <div className="flex items-center gap-3 select-none">
              <div className="switch-5">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" aria-label="Mantener sesión abierta" />
              </div>
              <label htmlFor="remember-me" className="cursor-pointer text-[13px] font-semibold text-slate-600 leading-tight">
                Mantener sesión iniciada
              </label>
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
              className="w-full py-2.5 gradient-brand text-white font-semibold rounded-xl shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-700/35 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
        <p className="text-center text-[11px] text-slate-400 mt-4 sm:mt-6">
          © {new Date().getFullYear()} Dashboard Web
        </p>
      </div>
        </div>
      </div>
    </div>
  );
};
