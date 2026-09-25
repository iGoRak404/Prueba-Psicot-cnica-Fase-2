import React, { useState } from 'react';
import { Attempt, SenaQuestion, SubjectiveReview } from '../types';
import { UserCheck, CheckCircle2, XCircle, RotateCcw, MessageSquare, X, Mail } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  attempt: Attempt | null;
  onClose: () => void;
  onUpdateReview: (
    attemptId: string,
    questionId: string,
    status: 'correct' | 'incorrect' | 'partial',
    earned: number,
    feedback: string
  ) => void;
  onSendFinalEmail: (attemptId: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  attempt,
  onClose,
  onUpdateReview,
  onSendFinalEmail,
}) => {
  const [partialInputs, setPartialInputs] = useState<Record<string, number>>({});
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});

  if (!isOpen || !attempt) return null;

  const subjectiveQuestions = attempt.questions.filter(
    (q) => q.type === 'scale' || q.type === 'open'
  );

  const handleStatusClick = (
    q: SenaQuestion,
    status: 'correct' | 'incorrect' | 'partial',
    customEarned?: number
  ) => {
    let earned = 0;
    if (status === 'correct') earned = q.score;
    else if (status === 'incorrect') earned = 0;
    else if (status === 'partial') {
      earned = customEarned !== undefined ? customEarned : q.score / 2;
    }

    const currentFeedback =
      feedbackInputs[q.id] ?? attempt.reviews[q.id]?.feedback ?? '';

    onUpdateReview(attempt.id, q.id, status, earned, currentFeedback);
  };

  const handleFeedbackBlur = (qId: string) => {
    const rev = attempt.reviews[qId];
    if (rev && rev.status) {
      const feedback = feedbackInputs[qId] ?? rev.feedback ?? '';
      onUpdateReview(attempt.id, qId, rev.status, rev.earned ?? 0, feedback);
    }
  };

  const allReviewed = subjectiveQuestions.every(
    (q) => attempt.reviews[q.id]?.status !== undefined
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-3xl my-8 rounded-3xl p-6 sm:p-8 shadow-2xl border flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)',
          color: 'var(--text-main)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b mb-5" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <h3 className="text-xl font-black" style={{ color: 'var(--text-heading)' }}>
              Revisión de Respuestas Subjetivas
            </h3>
            <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {attempt.student.fullName} ({attempt.student.docType} {attempt.student.docNumber}) · Grupo {attempt.group} · {attempt.difficulty}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            style={{ borderColor: 'var(--border)' }}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Summary Banner */}
          <div className="p-4 rounded-2xl bg-[var(--bg-info)] border border-[var(--border-light)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <span className="text-[11px] font-bold uppercase text-gray-500">Puntaje Automático</span>
              <div className="text-lg font-extrabold text-[#008f4c]">{attempt.autoScore.toFixed(1)} / {attempt.autoTotal}</div>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-gray-500">Puntaje Definitivo</span>
              <div className="text-lg font-extrabold text-[#008f4c]">{attempt.finalScore.toFixed(1)} / {attempt.finalTotal}</div>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-gray-500">Porcentaje Actual</span>
              <div className="text-lg font-extrabold text-[#008f4c]">
                {attempt.finalTotal > 0 ? Math.round((attempt.finalScore / attempt.finalTotal) * 100) : 0}%
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-gray-500">Estado</span>
              <div className="text-xs font-black mt-1">
                {attempt.reviewStatus === 'pending' ? (
                  <span className="text-amber-600 dark:text-amber-400">⏳ Pendiente</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">✅ Completada</span>
                )}
              </div>
            </div>
          </div>

          {/* Subjective Questions List */}
          {subjectiveQuestions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-sm text-center font-medium">
              Este intento no contiene preguntas subjetivas de respuesta abierta o escala. Todo el examen fue calificado de forma 100% automática.
            </div>
          ) : (
            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                Preguntas a calificar ({subjectiveQuestions.length})
              </h4>

              {subjectiveQuestions.map((q, idx) => {
                const answer = attempt.answers[q.id];
                const review: SubjectiveReview = attempt.reviews[q.id] || {};
                const qNum = attempt.questions.indexOf(q) + 1;
                const earned = review.earned ?? 0;

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border-2 transition-all"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor:
                        review.status === 'correct'
                          ? '#008f4c'
                          : review.status === 'incorrect'
                          ? '#d14545'
                          : review.status === 'partial'
                          ? '#f7e6b0'
                          : 'var(--border-light)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-gray-100 dark:bg-gray-800">
                          #{qNum}
                        </span>
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          {q.type === 'scale' ? 'Escala 1-10' : 'Respuesta Abierta'} · Valor: {q.score} pt{q.score > 1 ? 's' : ''}
                        </span>
                      </div>

                      {review.status && (
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            review.status === 'correct'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : review.status === 'incorrect'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          Calificación: {earned} / {q.score} pts
                        </span>
                      )}
                    </div>

                    <h5 className="font-bold text-sm sm:text-base mb-3" style={{ color: 'var(--text-heading)' }}>
                      {q.text}
                    </h5>

                    {/* Student response */}
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm mb-4">
                      <span className="font-bold text-gray-500 block mb-1">Respuesta del aprendiz:</span>
                      <p className="font-medium whitespace-pre-wrap">
                        {q.type === 'scale'
                          ? `Valoración seleccionada: ${answer ?? 'Sin responder'}/10`
                          : answer || '(El aprendiz no redactó ninguna respuesta)'}
                      </p>
                    </div>

                    {/* Quick grade buttons */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => handleStatusClick(q, 'correct')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          review.status === 'correct'
                            ? 'bg-[#008f4c] text-white shadow-xs'
                            : 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correcta ({q.score} pts)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusClick(q, 'incorrect')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          review.status === 'incorrect'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'border border-red-300 text-red-700 hover:bg-red-50 dark:hover:bg-red-950'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Incorrecta (0 pts)</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const val = partialInputs[q.id] ?? (q.score / 2);
                            handleStatusClick(q, 'partial', val);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            review.status === 'partial'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'border border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Parcial:</span>
                        </button>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={q.score}
                          value={partialInputs[q.id] ?? review.earned ?? q.score / 2}
                          onChange={(e) => {
                            const n = parseFloat(e.target.value) || 0;
                            setPartialInputs((prev) => ({ ...prev, [q.id]: n }));
                            handleStatusClick(q, 'partial', n);
                          }}
                          className="w-16 p-1.5 rounded-lg border text-xs font-bold text-center outline-none"
                        />
                        <span className="text-xs text-gray-500">pts</span>
                      </div>
                    </div>

                    {/* Feedback textarea */}
                    <div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Retroalimentación para el aprendiz (se incluye en su informe):</span>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Ej: Buena fundamentación teórica, sin embargo faltó profundizar en..."
                        value={feedbackInputs[q.id] ?? review.feedback ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFeedbackInputs((prev) => ({ ...prev, [q.id]: val }));
                        }}
                        onBlur={() => handleFeedbackBlur(q.id)}
                        className="w-full p-2.5 rounded-xl border text-xs outline-none focus:border-[#008f4c]"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          borderColor: 'var(--input-border)',
                          color: 'var(--text-main)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-5 border-t mt-5 flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: 'var(--border-light)' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary-sena"
          >
            Cerrar Ventana
          </button>

          {allReviewed && (
            <button
              type="button"
              onClick={() => onSendFinalEmail(attempt.id)}
              className="btn-primary-sena text-xs sm:text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Enviar Correo Definitivo al Aprendiz</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
