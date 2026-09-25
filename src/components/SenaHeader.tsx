import React from 'react';
import { ThemeMode } from '../types';
import { Sun, Moon, Coffee, Shield, Eye } from 'lucide-react';

interface SenaHeaderProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  isAdminView: boolean;
  onToggleAdmin: () => void;
}

export const SenaHeader: React.FC<SenaHeaderProps> = ({
  currentTheme,
  onThemeChange,
  isAdminView,
  onToggleAdmin,
}) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3.5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 p-1 border"
          style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-card)' }}
        >
          <img
            src="/logo-sena.png"
            alt="SENA"
            className="w-full h-full object-contain block"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-heading)' }}>
            SENA · ADSO
          </h1>
          <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Evaluación Integral del Tecnólogo en Análisis y Desarrollo de Software
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Theme Switcher */}
        <div
          className="flex items-center gap-1 p-1 rounded-full border shadow-xs"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          title="Cambiar tema"
        >
          <button
            type="button"
            onClick={() => onThemeChange('normal')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              currentTheme === 'normal'
                ? 'bg-[#008f4c] text-white shadow-xs font-bold'
                : 'hover:opacity-80'
            }`}
            style={{ color: currentTheme === 'normal' ? '#ffffff' : 'var(--text-muted)' }}
            title="Tema Verde SENA"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onThemeChange('beige')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              currentTheme === 'beige'
                ? 'bg-[#2d7a4a] text-white shadow-xs font-bold'
                : 'hover:opacity-80'
            }`}
            style={{ color: currentTheme === 'beige' ? '#ffffff' : 'var(--text-muted)' }}
            title="Tema Beige Cálido"
          >
            <Coffee className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onThemeChange('dark')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              currentTheme === 'dark'
                ? 'bg-[#39a900] text-white shadow-xs font-bold'
                : 'hover:opacity-80'
            }`}
            style={{ color: currentTheme === 'dark' ? '#ffffff' : 'var(--text-muted)' }}
            title="Tema Oscuro"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Admin Toggle Badge */}
        <button
          type="button"
          onClick={onToggleAdmin}
          className="px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 border transition-all cursor-pointer shadow-xs hover:border-[#008f4c]"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border)',
            color: 'var(--text-main)',
          }}
        >
          {isAdminView ? (
            <>
              <Eye className="w-4 h-4 text-[#008f4c]" />
              <span>Vista Estudiante</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 text-[#008f4c]" />
              <span>Panel Administrador</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
