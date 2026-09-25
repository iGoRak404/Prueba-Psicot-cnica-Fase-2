import React from 'react';
import { Mail, CheckCircle2, LogOut, Loader2 } from 'lucide-react';
import { User } from 'firebase/auth';

interface GoogleSignInButtonProps {
  user: User | null;
  hasToken: boolean;
  isLoading?: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  compact?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  user,
  hasToken,
  isLoading = false,
  onSignIn,
  onSignOut,
  compact = false,
}) => {
  if (user && hasToken) {
    if (compact) {
      return (
        <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-800/80 px-2.5 py-1 rounded-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-medium truncate max-w-[130px]">
            {user.email}
          </span>
          <button
            onClick={onSignOut}
            title="Desconectar Gmail"
            className="text-slate-400 hover:text-red-400 p-0.5 rounded transition-colors"
          >
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Gmail Oficial Conectado
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 font-mono">
                API Activa
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              Conectado como: <strong className="font-semibold">{user.email}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-900 text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-xs self-end sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Desconectar</span>
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        id="google-signin-compact-btn"
        type="button"
        onClick={onSignIn}
        disabled={isLoading}
        className="gsi-material-button text-xs"
        style={{ height: '36px', padding: '0 12px' }}
      >
        <div className="gsi-material-button-state"></div>
        <div className="gsi-material-button-content-wrapper flex items-center space-x-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <div className="gsi-material-button-icon">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ display: 'block', width: '18px', height: '18px' }}
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
          )}
          <span className="gsi-material-button-contents font-semibold text-slate-800">
            Conectar Gmail
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-start space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950">
            Integración Oficial de Gmail
          </h4>
          <p className="text-xs text-blue-900 mt-1 max-w-md leading-relaxed">
            Inicie sesión con su cuenta de Google para despachar y verificar notificaciones
            directamente en su bandeja real de Gmail con total autorización.
          </p>
        </div>
      </div>

      <button
        id="google-signin-btn"
        type="button"
        onClick={onSignIn}
        disabled={isLoading}
        className="gsi-material-button shrink-0 shadow-sm hover:shadow transition-shadow"
      >
        <div className="gsi-material-button-state"></div>
        <div className="gsi-material-button-content-wrapper flex items-center space-x-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <div className="gsi-material-button-icon">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ display: 'block' }}
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
          )}
          <span className="gsi-material-button-contents font-semibold text-slate-800">
            Conectar con Google
          </span>
        </div>
      </button>
    </div>
  );
};
