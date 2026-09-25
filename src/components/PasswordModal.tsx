import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleVerify = () => {
    if (password === 'adso2026') {
      setError(false);
      setPassword('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)',
          color: 'var(--text-main)',
        }}
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#008f4c]/10 text-[#008f4c] flex items-center justify-center mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
            Acceso Administrador
          </h3>
          <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
            Ingresa la contraseña de seguridad del sistema ADSO
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoFocus
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              onKeyDown={handleKeyDown}
              className="w-full p-3.5 pr-12 rounded-2xl border text-base font-medium transition-all outline-none focus:ring-2 focus:ring-[#008f4c]/30"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: error ? '#d14545' : 'var(--input-border)',
                color: 'var(--text-main)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#008f4c] transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl badge-red text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>Contraseña incorrecta. Por favor intenta de nuevo.</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-7">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary-sena"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleVerify}
            className="btn-primary-sena"
          >
            Ingresar
          </button>
        </div>
      </div>
    </div>
  );
};
