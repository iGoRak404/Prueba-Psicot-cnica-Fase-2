import React, { useState } from 'react';
import { Assessment, Candidate, EmailLog } from '../types';
import { CheckCircle2, AlertTriangle, Mail, ArrowRight, Clock, ShieldCheck, ExternalLink, Copy, Check, Eye, Send, Sparkles, Loader2 } from 'lucide-react';
import { sendGmailMessage } from '../services/gmailApi';
import { getAccessToken, googleSignIn } from '../services/googleAuth';

interface Phase1ResultModalProps {
  assessment: Assessment;
  candidate: Candidate;
  emailLog?: EmailLog;
  onFinishSession: () => void;
  onEmailSentViaGmailApi?: (emailId: string, messageId: string) => void;
}

export const Phase1ResultModal: React.FC<Phase1ResultModalProps> = ({
  assessment,
  candidate,
  emailLog,
  onFinishSession,
  onEmailSentViaGmailApi,
}) => {
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSendingDirectGmail, setIsSendingDirectGmail] = useState(false);
  const [directGmailSuccess, setDirectGmailSuccess] = useState(
    Boolean(emailLog?.dispatched_via_gmail_api)
  );
  const [directGmailError, setDirectGmailError] = useState<string | null>(null);

  const handleCopy = () => {
    if (emailLog?.body_text) {
      navigator.clipboard.writeText(emailLog.body_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenGmail = () => {
    if (emailLog?.gmail_webmail_url) {
      window.open(emailLog.gmail_webmail_url, '_blank', 'noopener,noreferrer');
    } else {
      const subject = encodeURIComponent(`[PsicoTest Oficial - Fase 1] Dictamen Preliminar - ${candidate.full_name}`);
      const body = encodeURIComponent(`Reporte Preliminar Psicotécnico para ${candidate.full_name}:\nPorcentaje: ${assessment.final_percentage}%\nEstado: EN REVISION`);
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(candidate.email)}&su=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSendDirectViaGmailApi = async () => {
    if (!emailLog) return;
    setIsSendingDirectGmail(true);
    setDirectGmailError(null);

    try {
      let token = await getAccessToken();
      if (!token) {
        // Prompt Google Sign in popup with Gmail scopes
        const authResult = await googleSignIn();
        token = authResult?.accessToken || null;
      }

      if (!token) {
        setDirectGmailError('Se requiere autorizar el acceso a Gmail para enviar el correo.');
        setIsSendingDirectGmail(false);
        return;
      }

      const res = await sendGmailMessage({
        to: emailLog.recipient_email,
        subject: emailLog.subject,
        bodyHtml: emailLog.body_html,
        bodyText: emailLog.body_text,
        token,
      });

      if (res.success && res.messageId) {
        setDirectGmailSuccess(true);
        if (onEmailSentViaGmailApi && emailLog.id) {
          onEmailSentViaGmailApi(emailLog.id, res.messageId);
        }
      } else {
        setDirectGmailError(res.error || 'Error al enviar por Gmail API');
      }
    } catch (err: any) {
      setDirectGmailError(err?.message || 'Error al procesar envío con Gmail');
    } finally {
      setIsSendingDirectGmail(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <CheckCircle2 className="w-9 h-9 text-blue-600" />
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider mb-2">
            Fase 1: Evaluación Integral Automática
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Prueba Recibida Exitosamente
          </h2>

          <p className="text-sm text-slate-600 mt-2">
            Candidato: <strong>{candidate.full_name}</strong> • Grupo: <strong>{assessment.group_letter}</strong>
          </p>

          {assessment.auto_submitted && (
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
              <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Finalizada por límite de tiempo (Auto-Submit)
            </div>
          )}
        </div>

        {/* Score Card */}
        <div className="my-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Porcentaje Preliminar (Preguntas Cerradas)
          </span>
          <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {assessment.final_percentage}%
          </div>
          <p className="text-xs text-slate-600 mt-2 font-mono">
            Puntos obtenidos en sección objetiva: <strong>{assessment.closed_score_obtained}</strong> de {assessment.closed_score_total} pts posibles
          </p>
        </div>

        {/* Strict Mandatory Warning Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start space-x-3.5 mb-6 shadow-xs">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Advertencia de Calificación Preliminar
            </h4>
            <p className="text-sm font-semibold text-amber-800 mt-0.5 leading-relaxed">
              "El puntaje está sujeto a revisión manual por preguntas subjetivas/de desarrollo."
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Las preguntas abiertas han sido enviadas a la bandeja del evaluador en el Módulo Administrador.
            </p>
          </div>
        </div>

        {/* Real Email Dispatch Notice with Gemini API */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-200/60">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h5 className="text-xs font-bold text-blue-950 uppercase">
                    Correo Generado con Gemini API
                  </h5>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Despachado
                  </span>
                </div>
                <p className="text-xs text-blue-900 mt-0.5">
                  Destinatario: <strong className="font-mono">{candidate.email}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="view-email-preview-btn"
                type="button"
                onClick={() => setShowEmailPreviewModal(true)}
                className="px-3 py-1.5 rounded-xl bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver Reporte</span>
              </button>

              <button
                id="send-gmail-api-btn"
                type="button"
                onClick={handleSendDirectViaGmailApi}
                disabled={isSendingDirectGmail}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1 ${
                  directGmailSuccess
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                title="Despachar mensaje auténtico a través de la API oficial de Gmail"
              >
                {isSendingDirectGmail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : directGmailSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Enviado vía Gmail API</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar vía Gmail</span>
                  </>
                )}
              </button>

              <button
                id="open-gmail-btn"
                type="button"
                onClick={handleOpenGmail}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
                title="Abrir directamente en Gmail para recibir o enviar a su bandeja"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir en Gmail</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2.5 text-[11px] text-blue-800/90">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Reporte psicotécnico oficial con análisis generado con Gemini y despachado con la API de Gmail.
            </span>
            {directGmailSuccess && (
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                ✓ Entregado en bandeja Gmail
              </span>
            )}
          </div>
          {directGmailError && (
            <p className="mt-2 text-xs font-medium text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
              {directGmailError}
            </p>
          )}
        </div>

        {/* Anti-Cheat State Notice */}
        <div className="p-3.5 rounded-xl bg-slate-100 text-slate-700 text-xs flex items-center justify-between mb-8">
          <span className="flex items-center font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
            Estado en sistema: <strong className="ml-1 uppercase text-blue-800 font-mono">EN_REVISION</strong>
          </span>
          <span className="text-[11px] text-slate-500">
            Reintentos bloqueados preventivamente
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center space-x-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar Texto del Correo'}</span>
          </button>

          <button
            id="finish-session-btn"
            type="button"
            onClick={onFinishSession}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-2"
          >
            <span>Concluir Sesión</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* POPUP MODAL: Correo Completo Generado con Gemini */}
      {showEmailPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {emailLog?.subject || 'Reporte de Evaluación Oficial'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Generado con Gemini 3.8 Flash • Para: {candidate.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {emailLog?.body_html ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: emailLog.body_html }}
                />
              ) : (
                <div className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                  {emailLog?.body_text || 'Cargando contenido oficial del correo...'}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white transition-colors flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleOpenGmail}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir en Gmail</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailPreviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
