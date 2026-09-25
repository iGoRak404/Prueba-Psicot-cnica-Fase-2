import React from 'react';
import { CheckCircle, Mail, Clock, Award } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  score: number;
  total: number;
  percentage: number;
  hasPending: boolean;
  email: string;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  score,
  total,
  percentage,
  hasPending,
  email,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border text-center"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)',
          color: 'var(--text-main)',
        }}
      >
        <div className="w-16 h-16 mx-auto rounded-3xl bg-[#008f4c]/10 text-[#008f4c] flex items-center justify-center mb-4">
          <CheckCircle className="w-9 h-9" />
        </div>

        <h3 className="text-2xl font-black mb-1" style={{ color: 'var(--text-heading)' }}>
          ¡Evaluación Registrada!
        </h3>
        <p className="text-xs sm:text-sm font-medium mb-6" style={{ color: 'var(--text-muted)' }}>
          Tus respuestas han sido procesadas con éxito por el sistema SENA ADSO.
        </p>

        {/* Score Card */}
        <div className="p-5 rounded-2xl bg-[#008f4c]/5 border border-[#008f4c]/20 mb-5 text-center">
          <div className="text-4xl font-black text-[#008f4c] mb-1">
            {percentage}%
          </div>
          <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
            {score.toFixed(1)} de {total} puntos automáticos
          </p>
          {hasPending && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-yellow">
              <Clock className="w-3.5 h-3.5" />
              <span>Sujeto a revisión manual de preguntas abiertas</span>
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="p-4 rounded-2xl bg-[var(--bg-info)] border border-[var(--border-light)] text-xs text-left mb-6 space-y-2">
          <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--text-heading)' }}>
            <Mail className="w-4 h-4 text-[#008f4c]" />
            <span>Notificación enviada</span>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            Se ha remitido la confirmación con el análisis de respuestas a: <strong className="text-[var(--text-main)]">{email}</strong>.
          </p>
          {hasPending && (
            <p className="font-semibold text-xs" style={{ color: 'var(--sena-yellow)' }}>
              Cuando el evaluador califique tus respuestas de desarrollo, recibirás un segundo correo con el veredicto definitivo.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-primary-sena w-full"
        >
          Entendido / Volver al Inicio
        </button>
      </div>
    </div>
  );
};
