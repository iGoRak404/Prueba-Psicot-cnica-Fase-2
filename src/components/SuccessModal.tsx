import React, { useState } from 'react';
import { CheckCircle, Mail, Clock, FileDown, Eye, Copy, Check, ExternalLink, X } from 'lucide-react';
import { downloadHtmlReport, generateMailtoUrl } from '../services/emailService';

interface SuccessModalProps {
  isOpen: boolean;
  score: number;
  total: number;
  percentage: number;
  hasPending: boolean;
  email: string;
  studentName?: string;
  htmlReport?: string;
  summaryText?: string;
  deliveryMethod?: string;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  score,
  total,
  percentage,
  hasPending,
  email,
  studentName = 'Aprendiz',
  htmlReport = '',
  summaryText = '',
  deliveryMethod = '',
  onClose,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryText || `Evaluación SENA ADSO - ${studentName}: ${score}/${total} (${percentage}%)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const filename = `acuse_evaluacion_sena_${studentName.toLowerCase().replace(/\s+/g, '_')}.html`;
    downloadHtmlReport(filename, htmlReport || `<p>Reporte de evaluación SENA</p>`);
  };

  const mailtoLink = generateMailtoUrl(
    email,
    `[SENA ADSO] Copia de Evaluación - ${studentName}`,
    summaryText || `Resultados de evaluación: ${score}/${total} (${percentage}%)`
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div
          className="w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border text-center max-h-[90vh] overflow-y-auto"
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
          <p className="text-xs sm:text-sm font-medium mb-5" style={{ color: 'var(--text-muted)' }}>
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

          {/* Email Info box */}
          <div className="p-4 rounded-2xl bg-[var(--bg-info)] border border-[var(--border-light)] text-xs text-left mb-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--text-heading)' }}>
                <Mail className="w-4 h-4 text-[#008f4c]" />
                <span>Acuse de Recibo Generado</span>
              </div>
              {deliveryMethod && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-green">
                  {deliveryMethod === 'emailjs' ? 'Enviado vía EmailJS' : deliveryMethod === 'server' ? 'Enviado vía Servidor' : 'Generado en Cliente'}
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Reporte oficial asignado a: <strong className="text-[var(--text-main)]">{email}</strong>.
            </p>
            {hasPending && (
              <p className="font-semibold text-xs" style={{ color: 'var(--sena-yellow)' }}>
                Cuando el evaluador califique tus respuestas de desarrollo, se emitirá el correo con el veredicto definitivo.
              </p>
            )}
          </div>

          {/* Quick Actions (GitHub Pages & Offline Friendly) */}
          <div className="grid grid-cols-2 gap-2 mb-6 text-xs font-semibold">
            {htmlReport && (
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:border-[#008f4c]"
                style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-light)', color: 'var(--text-main)' }}
              >
                <Eye className="w-3.5 h-3.5 text-[#008f4c]" />
                <span>Ver Reporte HTML</span>
              </button>
            )}

            {htmlReport && (
              <button
                type="button"
                onClick={handleDownload}
                className="p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:border-[#008f4c]"
                style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-light)', color: 'var(--text-main)' }}
              >
                <FileDown className="w-3.5 h-3.5 text-[#008f4c]" />
                <span>Descargar (.html)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopySummary}
              className="p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:border-[#008f4c]"
              style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-light)', color: 'var(--text-main)' }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Resumen'}</span>
            </button>

            <a
              href={mailtoLink}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:border-[#008f4c]"
              style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-light)', color: 'var(--text-main)' }}
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              <span>Abrir en Correo</span>
            </a>
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

      {/* HTML Report Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs">
          <div
            className="w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col h-[85vh] shadow-2xl border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)' }}
          >
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-light)' }}>
              <div className="font-bold text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#008f4c]" />
                <span>Vista Previa del Acuse de Recibo Oficial (HTML)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-full text-xs font-bold btn-primary-sena"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:opacity-75 cursor-pointer"
                  style={{ borderColor: 'var(--border-light)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <iframe
              srcDoc={htmlReport}
              title="Vista previa del correo oficial"
              className="w-full flex-1 bg-white border-0"
            />
          </div>
        </div>
      )}
    </>
  );
};
