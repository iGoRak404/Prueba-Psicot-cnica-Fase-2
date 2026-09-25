import React from 'react';
import { User, Shield } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { GoogleSignInButton } from './GoogleSignInButton';

interface NavbarProps {
  activeTab: 'candidate' | 'admin';
  setActiveTab: (tab: 'candidate' | 'admin') => void;
  pendingReviewsCount: number;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  googleUser?: FirebaseUser | null;
  hasGoogleToken?: boolean;
  isLoggingInGoogle?: boolean;
  onSignInGoogle?: () => void;
  onSignOutGoogle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingReviewsCount,
  isAdminLoggedIn,
  onOpenAdminLogin,
  googleUser = null,
  hasGoogleToken = false,
  isLoggingInGoogle = false,
  onSignInGoogle,
  onSignOutGoogle,
}) => {
  const handleAdminClick = () => {
    if (!isAdminLoggedIn) {
      onOpenAdminLogin();
    } else {
      setActiveTab('admin');
    }
  };

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-sm">
              Ψ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">
                  PsicoTest Core
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/80">
                  Gmail & Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Evaluación Psicotécnica en Dos Fases
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* EXACTLY TWO BUTTONS: CANDIDATO & ADMINISTRADOR */}
            <nav className="flex items-center space-x-2 sm:space-x-3">
              {/* BOTÓN 1: CANDIDATO */}
              <button
                id="nav-btn-candidato"
                type="button"
                onClick={() => setActiveTab('candidate')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 border shadow-xs ${
                  activeTab === 'candidate'
                    ? 'bg-blue-600 border-blue-500 text-white ring-2 ring-blue-400/40'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/80'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Candidato</span>
              </button>

              {/* BOTÓN 2: ADMINISTRADOR */}
              <button
                id="nav-btn-administrador"
                type="button"
                onClick={handleAdminClick}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 border shadow-xs relative ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 border-amber-400 text-slate-950 ring-2 ring-amber-300/50'
                    : 'bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300 hover:bg-slate-700/80'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Administrador</span>
                {pendingReviewsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-slate-950 font-black">
                    {pendingReviewsCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
