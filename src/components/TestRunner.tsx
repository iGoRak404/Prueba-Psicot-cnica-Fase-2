import React, { useState, useEffect, useRef } from 'react';
import { Candidate, Question, AssessmentAnswer, SystemConfig } from '../types';
import { Clock, AlertTriangle, Send, CheckCircle, ChevronLeft, ChevronRight, HelpCircle, Shield, Image as ImageIcon } from 'lucide-react';

interface TestRunnerProps {
  candidate: Candidate;
  questions: Question[];
  config: SystemConfig;
  onSubmitTest: (answers: AssessmentAnswer[], autoSubmitted: boolean) => void;
}

export const TestRunner: React.FC<TestRunnerProps> = ({
  candidate,
  questions,
  config,
  onSubmitTest,
}) => {
  // Filtrar preguntas del grupo asignado
  const groupQuestions = questions.filter((q) => q.group_letter === candidate.group_letter);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selected_option_id?: string; open_text?: string }>>({});
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [timeExpiredModal, setTimeExpiredModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Temporizador de alta precisión diferencial
  const initialSeconds = config.timer_enabled ? config.time_limit_minutes * 60 : 0;
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const endTimeRef = useRef<number>(Date.now() + initialSeconds * 1000);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!config.timer_enabled) return;

    endTimeRef.current = Date.now() + config.time_limit_minutes * 60 * 1000;

    const interval = setInterval(() => {
      if (submittedRef.current) {
        clearInterval(interval);
        return;
      }

      const diff = Math.ceil((endTimeRef.current - Date.now()) / 1000);
      if (diff <= 0) {
        setSecondsRemaining(0);
        clearInterval(interval);
        handleTimeExpiredAutoSubmit();
      } else {
        setSecondsRemaining(diff);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [config.timer_enabled, config.time_limit_minutes]);

  // Manejo de Auto-Submit cuando el tiempo llega a cero
  const handleTimeExpiredAutoSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setTimeExpiredModal(true);
    setIsSubmitting(true);

    // Animación visual de cierre breve antes del submit definitivo
    setTimeout(() => {
      const payload: AssessmentAnswer[] = groupQuestions.map((q) => {
        const userAns = answers[q.id] || {};
        return {
          question_id: q.id,
          selected_option_id: userAns.selected_option_id,
          open_text: userAns.open_text,
        };
      });
      onSubmitTest(payload, true);
    }, 2200);
  };

  const handleManualSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setIsSubmitting(true);

    const payload: AssessmentAnswer[] = groupQuestions.map((q) => {
      const userAns = answers[q.id] || {};
      return {
        question_id: q.id,
        selected_option_id: userAns.selected_option_id,
        open_text: userAns.open_text,
      };
    });
    onSubmitTest(payload, false);
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isSubmitting || timeExpiredModal) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selected_option_id: optionId,
      },
    }));
  };

  const handleOpenTextChange = (questionId: string, text: string) => {
    if (isSubmitting || timeExpiredModal) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        open_text: text,
      },
    }));
  };

  const currentQ = groupQuestions[currentIndex];
  const currentAnswer = currentQ ? answers[currentQ.id] || {} : {};

  // Formato del tiempo mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).filter((qid) => {
    const a = answers[qid];
    return a.selected_option_id || (a.open_text && a.open_text.trim().length > 0);
  }).length;

  const isCriticalTime = config.timer_enabled && secondsRemaining <= 60;
  const isWarningTime = config.timer_enabled && secondsRemaining <= 180 && !isCriticalTime;

  if (!currentQ) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No hay preguntas registradas para el Grupo {candidate.group_letter}.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 px-4">
      {/* Sticky Execution Topbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs sticky top-20 z-30 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Candidate & Group info */}
          <div className="flex items-center space-x-3">
            <div className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs">
              Grupo {candidate.group_letter}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">
                {candidate.full_name}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {answeredCount} de {groupQuestions.length} respondidas ({Math.round((answeredCount / groupQuestions.length) * 100)}%)
              </p>
            </div>
          </div>

          {/* Precision Timer Display */}
          {config.timer_enabled ? (
            <div
              id="test-timer-badge"
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-all ${
                isCriticalTime
                  ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                  : isWarningTime
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <Clock className={`w-4 h-4 ${isCriticalTime ? 'text-red-600' : 'text-slate-600'}`} />
              <span className="tracking-wider text-base">{formatTime(secondsRemaining)}</span>
              {isCriticalTime && (
                <span className="text-[10px] uppercase font-bold tracking-tight text-red-600 ml-1">
                  ¡Agotándose!
                </span>
              )}
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium">
              Sin límite de tiempo
            </div>
          )}

          {/* Submit Action */}
          <button
            id="finish-test-top-btn"
            onClick={() => setConfirmSubmitModal(true)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finalizar y Enviar</span>
          </button>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(answeredCount / groupQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-6">
        {/* Question Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-900 text-white">
              Pregunta {currentIndex + 1} de {groupQuestions.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {currentQ.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {currentQ.question_type === 'multiple_choice' ? 'Opción Múltiple' : 'Pregunta Abierta / Desarrollo'}
            </span>
          </div>

          <div className="text-xs font-mono font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100">
            Valor: {currentQ.points} pts
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed mb-6">
          {currentQ.question_text}
        </h2>

        {/* Multimedia Support (Raven matrices, Spatial rotation diagrams, etc.) */}
        {currentQ.image_url && (
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
            <div className="w-full max-w-md max-h-72 overflow-hidden rounded-lg bg-white border border-slate-200 flex items-center justify-center p-2">
              <img
                src={currentQ.image_url}
                alt="Contexto visual de la pregunta psicotécnica"
                className="max-h-64 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-2 flex items-center">
              <ImageIcon className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Soporte Multimedia Psicométrico
            </span>
          </div>
        )}

        {/* Options Rendering (Multiple Choice) */}
        {currentQ.question_type === 'multiple_choice' && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Seleccione la opción correcta:
            </label>
            {currentQ.options.map((opt) => {
              const isSelected = currentAnswer.selected_option_id === opt.id;
              return (
                <div
                  key={opt.id}
                  id={`opt-card-${opt.id}`}
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3.5 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 border ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    {opt.option_key}
                  </div>
                  <div className="flex-1 text-sm font-medium text-slate-800 leading-snug">
                    {opt.option_text}
                    {opt.image_url && (
                      <div className="mt-2 max-w-xs border rounded p-1 bg-white">
                        <img src={opt.image_url} alt="Opción visual" className="max-h-24 object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Open/Development Question */}
        {currentQ.question_type === 'open_text' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="open-answer-textarea"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Su respuesta fundamentada (Evaluación Subjetiva / Fase 2):
              </label>
              <span className="text-xs text-slate-500 font-mono">
                {(currentAnswer.open_text || '').length} caracteres
              </span>
            </div>
            <textarea
              id="open-answer-textarea"
              rows={6}
              placeholder="Describa con precisión técnica o criterio situacional su respuesta detallada..."
              value={currentAnswer.open_text || ''}
              onChange={(e) => handleOpenTextChange(currentQ.id, e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <p className="text-xs text-amber-700 mt-2 flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0" />
              Esta respuesta será calificada manualmente por el evaluador en la Fase 2 del proceso.
            </p>
          </div>
        )}

        {/* Question Navigation footer */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {/* Quick Pagination Bubbles */}
          <div className="hidden sm:flex items-center space-x-1.5">
            {groupQuestions.map((q, idx) => {
              const isAnswered = answers[q.id]?.selected_option_id || (answers[q.id]?.open_text && answers[q.id]?.open_text!.trim().length > 0);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {currentIndex < groupQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(groupQuestions.length - 1, prev + 1))}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center space-x-1"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setConfirmSubmitModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center space-x-1 shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Finalizar</span>
            </button>
          )}
        </div>
      </div>

      {/* Manual Submit Confirmation Modal */}
      {confirmSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Confirmar Entrega de Prueba
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Ha respondido <strong>{answeredCount}</strong> de <strong>{groupQuestions.length}</strong> preguntas.
              {answeredCount < groupQuestions.length && (
                <span className="block mt-1 text-amber-600 font-semibold">
                  ⚠️ Tiene {groupQuestions.length - answeredCount} preguntas sin responder. Las no contestadas tendrán puntaje 0.
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500 mt-3">
              Al confirmar, el sistema cerrará su intento y disparará el cálculo automático de Fase 1.
            </p>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmSubmitModal(false)}
                className="px-4 py-2 rounded-lg text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Volver a la prueba
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmSubmitModal(false);
                  handleManualSubmit();
                }}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Sí, Enviar Evaluación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strict Visual Closing Animation for Time Expired Auto-Submit */}
      {timeExpiredModal && (
        <div
          id="time-expired-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-md transition-all animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border-4 border-red-500 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Clock className="w-8 h-8" />
            </div>

            <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-600">
              Protocolo de Cierre Automático
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              ¡TIEMPO AGOTADO!
            </h2>

            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              El límite de tiempo global ha expirado. El sistema ha <strong>congelado los inputs</strong> y está capturando su progreso exacto hasta este segundo para su entrega automática.
            </p>

            <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                <span>Respuestas capturadas:</span>
                <span className="font-mono text-blue-600">{answeredCount} / {groupQuestions.length}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 animate-pulse w-full" />
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                Guardando en SQLite y despachando correo de Fase 1...
              </span>
            </div>

            <div className="inline-flex items-center text-xs font-semibold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping" />
              Procesando sumisión en segundo plano...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
