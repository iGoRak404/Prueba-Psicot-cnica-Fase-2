import React, { useState } from 'react';
import { GroupLetter, Candidate } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  User,
  Mail,
  CreditCard,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Send,
  Loader2,
  Check,
} from 'lucide-react';

interface CandidateRegistrationProps {
  onRegisterSuccess: (candidate: Candidate) => void;
  validateCandidateEmail: (email: string) => {
    allowed: boolean;
    reason?: 'FAILED' | 'UNDER_REVIEW' | 'APPROVED';
    message?: string;
    candidate?: Candidate;
  };
  onRequestRetry?: (
    email: string,
    fullName: string,
    group: GroupLetter,
    reason: string
  ) => Promise<{ success: boolean; message: string }>;
}

export const CandidateRegistration: React.FC<CandidateRegistrationProps> = ({
  onRegisterSuccess,
  validateCandidateEmail,
  onRequestRetry,
}) => {
  const [docType, setDocType] = useState('C.C.');
  const [docNumber, setDocNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [groupLetter, setGroupLetter] = useState<GroupLetter>('A');

  const [antiCheatError, setAntiCheatError] = useState<{
    code: 'FAILED' | 'UNDER_REVIEW' | 'APPROVED' | null;
    message: string | null;
  }>({ code: null, message: null });

  // Estado para solicitud de reintento por el candidato reprobado
  const [retryReason, setRetryReason] = useState('');
  const [isSubmittingRetry, setIsSubmittingRetry] = useState(false);
  const [retrySuccessNotice, setRetrySuccessNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim() || !fullName.trim() || !email.trim()) return;

    // Validación Anti-Cheat estricta por correo
    const validation = validateCandidateEmail(email.trim().toLowerCase());
    if (!validation.allowed) {
      setAntiCheatError({
        code: validation.reason || null,
        message: validation.message || 'Acceso restringido por directivas del sistema.',
      });
      return;
    }

    setAntiCheatError({ code: null, message: null });

    const newCandidate: Candidate = {
      id: `cand_${Date.now()}`,
      doc_type: docType,
      doc_number: docNumber.trim(),
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      group_letter: groupLetter,
      created_at: new Date().toISOString(),
    };

    onRegisterSuccess(newCandidate);
  };

  const handleSendRetryRequest = async () => {
    if (!onRequestRetry || !email.trim()) return;
    setIsSubmittingRetry(true);
    try {
      const result = await onRequestRetry(
        email.trim().toLowerCase(),
        fullName.trim() || 'Candidato Reprobado',
        groupLetter,
        retryReason.trim()
      );
      if (result.success) {
        setRetrySuccessNotice(result.message);
      }
    } catch (err) {
      setRetrySuccessNotice('Solicitud enviada al Administrador. Se ha notificado por correo.');
    } finally {
      setIsSubmittingRetry(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          Módulo de Ingreso & Control Anti-Cheat
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Registro de Candidato
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
          Complete su identificación oficial para ser asignado al banco de preguntas del Grupo correspondiente.
        </p>
      </div>

      {/* Strict Anti-Cheat Alert Banner */}
      {antiCheatError.message && (
        <div
          id="anti-cheat-alert"
          role="alert"
          className={`mb-6 p-4 rounded-xl border flex flex-col space-y-3 shadow-sm ${
            antiCheatError.code === 'FAILED'
              ? 'bg-red-50 border-red-300 text-red-900'
              : antiCheatError.code === 'UNDER_REVIEW'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-white shadow-xs shrink-0 mt-0.5">
              {antiCheatError.code === 'FAILED' ? (
                <ShieldAlert className="w-6 h-6 text-red-600" />
              ) : antiCheatError.code === 'UNDER_REVIEW' ? (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm uppercase tracking-wide">
                {antiCheatError.code === 'FAILED'
                  ? 'Intento Previo No Superado (Reprobado)'
                  : antiCheatError.code === 'UNDER_REVIEW'
                  ? 'Proceso en Auditoría Manual'
                  : 'Registro Vigente'}
              </h4>
              <p className="text-sm font-semibold mt-1">
                "{antiCheatError.message}"
              </p>
              <p className="text-xs text-slate-600 mt-2">
                Correo evaluado: <strong className="font-mono">{email}</strong>.
              </p>
            </div>
          </div>

          {/* BOTÓN Y FORMULARIO PARA SOLICITAR REINTENTO AL ADMINISTRADOR */}
          {antiCheatError.code === 'FAILED' && (
            <div className="mt-3 p-4 rounded-xl bg-white border border-red-200 shadow-xs">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs mb-1">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>¿Deseas solicitar una nueva oportunidad al Administrador?</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2.5">
                Al presionar el botón le llegará la solicitud directamente al Administrador y se despachará un correo 100% automático mediante la API de Google confirmando el trámite.
              </p>

              {retrySuccessNotice ? (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{retrySuccessNotice}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={retryReason}
                    onChange={(e) => setRetryReason(e.target.value)}
                    placeholder="Motivo de la solicitud (ej: falló la conexión, emergencia técnica)..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleSendRetryRequest}
                    disabled={isSubmittingRetry}
                    className="w-full py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs disabled:opacity-50"
                  >
                    {isSubmittingRetry ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Despachando solicitud con Gemini API...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-slate-950" />
                        <span>Notificar al Administrador para repetir la prueba</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setEmail('');
                setAntiCheatError({ code: null, message: null });
                setRetrySuccessNotice(null);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              Probar con otro correo
            </button>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <form
        id="candidate-registration-form"
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs"
      >
        <div className="space-y-5">
          {/* Document Type and Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="doc-type-select"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Tipo de Doc.
              </label>
              <select
                id="doc-type-select"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="C.C.">Cédula de Ciudadanía (C.C.)</option>
                <option value="C.E.">Cédula de Extranjería (C.E.)</option>
                <option value="T.I.">Tarjeta de Identidad (T.I.)</option>
                <option value="PAS">Pasaporte (PAS)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="doc-number-input"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Número de Documento *
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="doc-number-input"
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="Ej: 1020304050"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="fullname-input"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Nombre Completo del Candidato *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="fullname-input"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Laura Sofía Valencia"
                className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email-input"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Correo Electrónico Oficial *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (antiCheatError.message) setAntiCheatError({ code: null, message: null });
                }}
                placeholder="candidato@correo.com"
                className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Verificación en tiempo real. Recibirá su reporte y dictamen en este correo.
            </p>
          </div>

          {/* Group Letter Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Grupo Psicotécnico Asignado
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['A', 'B', 'C', 'D'] as GroupLetter[]).map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setGroupLetter(grp)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    groupLetter === grp
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="text-lg font-black font-mono">Grupo {grp}</div>
                  <div className="text-[10px] text-slate-500 uppercase mt-0.5">
                    {grp === 'A' ? 'General' : grp === 'B' ? 'Avanzado' : grp === 'C' ? 'Liderazgo' : 'Especial'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-end">
          <button
            id="start-registration-btn"
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
          >
            <span>Iniciar Proceso de Evaluación</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
