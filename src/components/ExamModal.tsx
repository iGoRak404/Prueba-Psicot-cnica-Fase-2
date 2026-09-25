import React, { useState, useEffect } from 'react';
import { SenaQuestion, Student, GroupLetter, Difficulty, MediaAttachment } from '../types';
import {
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  Volume2,
  Film,
  Image as ImageIcon,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

interface ExamModalProps {
  isOpen: boolean;
  student: Student | null;
  group: GroupLetter;
  difficulty: Difficulty;
  questions: SenaQuestion[];
  onExit: () => void;
  onSubmit: (answers: Record<string, any>) => void;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  student,
  group,
  difficulty,
  questions,
  onExit,
  onSubmit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes = 1200s
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [missingCount, setMissingCount] = useState<number | null>(null);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setAnswers({});
      setTimeLeft(1200);
      setShowConfirmModal(false);
      setMissingCount(null);
    }
  }, [isOpen]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('¡Tiempo límite de 20 minutos agotado! Tu examen se enviará automáticamente.');
          onSubmit(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, answers, onSubmit]);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const difficultyLabels: Record<Difficulty, string> = {
    easy: 'Fácil',
    medium: 'Intermedio',
    hard: 'Avanzado',
  };

  // Check if answered
  const isQuestionAnswered = (q: SenaQuestion) => {
    const ans = answers[q.id];
    if (ans === undefined || ans === null || ans === '') return false;
    if (Array.isArray(ans) && ans.length === 0) return false;
    if (q.type === 'match') {
      const pairCount = q.pairs?.length || 0;
      return typeof ans === 'object' && Object.keys(ans).length === pairCount;
    }
    return true;
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;
  const progressPct = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Answer handlers
  const handleSelectRadio = (qid: string, index: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: index }));
  };

  const handleToggleCheckbox = (qid: string, index: number) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[qid]) ? [...prev[qid]] : [];
      const pos = current.indexOf(index);
      if (pos === -1) {
        current.push(index);
      } else {
        current.splice(pos, 1);
      }
      return { ...prev, [qid]: current };
    });
  };

  const handleSelectTrueFalse = (qid: string, val: boolean) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  };

  const handleInputNumeric = (qid: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  };

  const handleSelectMatch = (qid: string, pairIdx: number, val: string) => {
    setAnswers((prev) => {
      const current = typeof prev[qid] === 'object' && prev[qid] !== null ? { ...prev[qid] } : {};
      if (val === '') {
        delete current[pairIdx];
      } else {
        current[pairIdx] = parseInt(val, 10);
      }
      return { ...prev, [qid]: current };
    });
  };

  const handleScaleChange = (qid: string, val: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  };

  const handleTextChange = (qid: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: text }));
  };

  // Exit with confirmation
  const handleExitClick = () => {
    if (confirm('¿Estás seguro de que deseas salir? Las respuestas no enviadas se descartarán.')) {
      onExit();
    }
  };

  // Submit attempt
  const handleAttemptSubmit = () => {
    const unanswered = questions.filter((q) => !isQuestionAnswered(q));
    if (unanswered.length > 0) {
      setMissingCount(unanswered.length);
      alert(`⚠️ Faltan ${unanswered.length} pregunta(s) por responder. Por favor responde todas las preguntas antes de enviar.`);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    onSubmit(answers);
  };

  // Render media attached to question
  const renderMedia = (media?: MediaAttachment) => {
    if (!media || !media.type) return null;
    const url = media.url || media.data || '';

    if (media.type === 'image') {
      return (
        <div
          className="my-4 p-3 rounded-2xl border text-center"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)' }}
        >
          <img src={url} alt="Pregunta" className="max-h-72 mx-auto rounded-xl object-contain" />
        </div>
      );
    }
    if (media.type === 'video') {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let vidId = '';
        if (url.includes('youtu.be/')) vidId = url.split('youtu.be/')[1].split('?')[0];
        else if (url.includes('v=')) vidId = url.split('v=')[1].split('&')[0];
        return (
          <div
            className="my-4 aspect-video rounded-2xl overflow-hidden border"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${vidId}`}
              title="Video complementario"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <div
          className="my-4 rounded-2xl overflow-hidden border"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <video controls src={url} className="w-full max-h-72 object-contain" />
        </div>
      );
    }
    if (media.type === 'audio') {
      return (
        <div
          className="my-4 p-4 rounded-2xl border flex items-center gap-3"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)' }}
        >
          <Volume2 className="w-6 h-6 text-[#008f4c]" />
          <audio controls src={url} className="w-full" />
        </div>
      );
    }
    if (media.type === 'pdf') {
      return (
        <div className="my-4">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs"
            style={{
              backgroundColor: 'var(--sena-light-green)',
              color: 'var(--sena-dark-green)',
            }}
          >
            <FileText className="w-4 h-4" />
            <span>Ver documento PDF adjunto</span>
          </a>
        </div>
      );
    }
    if (media.type === 'link') {
      return (
        <div className="my-4">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs"
            style={{
              backgroundColor: 'var(--sena-light-green)',
              color: 'var(--sena-dark-green)',
            }}
          >
            <ExternalLink className="w-4 h-4" />
            <span>{url}</span>
          </a>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg-main)] text-[var(--text-main)] transition-colors">
      <div className="min-h-screen max-w-6xl mx-auto p-3 sm:p-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* SIDEBAR */}
        <aside
          className="hidden md:flex flex-col rounded-3xl p-5 border h-fit sticky top-6 shadow-xs"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-light)',
          }}
        >
          <div className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
            <span>Navegación</span>
            <span className="text-[#008f4c] font-black">{answeredCount}/{totalQuestions}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = isQuestionAnswered(q);

              let itemClass = '';
              if (isCurrent) {
                itemClass = 'current';
              } else if (isAnswered) {
                itemClass = 'answered';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`q-nav-item ${itemClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
            <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              <span>Progreso</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-light)' }}>
              <div
                className="h-full bg-[#008f4c] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              {answeredCount} de {totalQuestions} respondidas
            </p>
          </div>
        </aside>

        {/* MAIN EXAM CONTAINER */}
        <div
          className="rounded-3xl border overflow-hidden flex flex-col min-h-[600px] shadow-lg"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-light)',
          }}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#008f4c] text-white flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white p-1 flex items-center justify-center shrink-0">
                <img src="/logo-sena.png" alt="SENA" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-sm sm:text-base">
                SENA · Grupo {group} · {difficultyLabels[difficulty]}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm font-semibold opacity-95">
                Pregunta {currentIndex + 1} / {totalQuestions}
              </span>

              {/* Timer Badge */}
              <div className="px-3.5 py-1.5 rounded-full bg-white/20 font-mono font-bold text-sm sm:text-base flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>

              {/* Exit Button */}
              <button
                type="button"
                onClick={handleExitClick}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Salir del examen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Under-header mini progress line */}
          <div className="h-1.5 w-full" style={{ backgroundColor: 'var(--border-light)' }}>
            <div
              className="h-full bg-gradient-to-r from-[#008f4c] to-[#4caf7a] transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Question Body */}
          <div
            className={`flex-1 p-6 sm:p-10 relative transition-colors duration-300 exam-tint-${currentIndex % 5}`}
          >
            {/* Question Badge & Meta */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#008f4c] text-white">
                Pregunta {currentIndex + 1} de {totalQuestions}
              </span>
              {currentQ.category && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold badge-purple">
                  {currentQ.category}
                </span>
              )}
              {currentQ.score && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold badge-green">
                  {currentQ.score} pt{currentQ.score > 1 ? 's' : ''}
                </span>
              )}
              {(currentQ.type === 'scale' || currentQ.type === 'open') && (
                <span className="px-3 py-1 rounded-full text-xs font-bold badge-yellow flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  Revisión manual
                </span>
              )}
            </div>

            {/* Question Text */}
            <h2
              className="text-lg sm:text-2xl font-black mb-6 leading-snug"
              style={{ color: 'var(--text-heading)' }}
            >
              {currentQ.text}
            </h2>

            {/* Media Attachment */}
            {renderMedia(currentQ.media)}

            {/* Answers Interaction based on type */}
            <div className="mt-6">
              {/* 1. Multiple Choice (Radio) */}
              {currentQ.type === 'multiple' && (
                <div className="space-y-3">
                  {(currentQ.options || []).map((opt, oIdx) => {
                    const selected = answers[currentQ.id] === oIdx;
                    return (
                      <label
                        key={oIdx}
                        onClick={() => handleSelectRadio(currentQ.id, oIdx)}
                        className={`exam-option ${selected ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`q_${currentQ.id}`}
                          checked={selected}
                          onChange={() => handleSelectRadio(currentQ.id, oIdx)}
                          className="w-5 h-5 accent-[#008f4c] shrink-0"
                        />
                        <span className="option-letter">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="text-sm sm:text-base font-semibold leading-relaxed">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* 2. Checkbox (Multiple Answers) */}
              {currentQ.type === 'checkbox' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <AlertCircle className="w-4 h-4 text-[#008f4c]" />
                    Selecciona todas las opciones correctas aplicables.
                  </p>
                  {(currentQ.options || []).map((opt, oIdx) => {
                    const selectedArr: number[] = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : [];
                    const isSelected = selectedArr.includes(oIdx);
                    return (
                      <label
                        key={oIdx}
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleCheckbox(currentQ.id, oIdx);
                        }}
                        className={`exam-option ${isSelected ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-5 h-5 accent-[#008f4c] shrink-0"
                        />
                        <span className="option-letter">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="text-sm sm:text-base font-semibold leading-relaxed">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* 3. True / False */}
              {currentQ.type === 'truefalse' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleSelectTrueFalse(currentQ.id, true)}
                    className={`exam-vf-btn ${answers[currentQ.id] === true ? 'selected-true' : ''}`}
                  >
                    <CheckCircle className="w-10 h-10 text-[#008f4c]" />
                    <span>Verdadero</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTrueFalse(currentQ.id, false)}
                    className={`exam-vf-btn ${answers[currentQ.id] === false ? 'selected-false' : ''}`}
                  >
                    <XCircle className="w-10 h-10 text-red-500" />
                    <span>Falso</span>
                  </button>
                </div>
              )}

              {/* 4. Numeric */}
              {currentQ.type === 'numeric' && (
                <div className="max-w-md mx-auto text-center space-y-3">
                  <input
                    type="number"
                    step="any"
                    placeholder="Escribe el valor numérico..."
                    value={answers[currentQ.id] ?? ''}
                    onChange={(e) => handleInputNumeric(currentQ.id, e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 text-center text-3xl font-black outline-none focus:border-[#008f4c] transition-all"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-light)',
                      color: 'var(--text-heading)',
                    }}
                  />
                  {currentQ.tolerance !== undefined && currentQ.tolerance > 0 && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Tolerancia permitida: ±{currentQ.tolerance}
                    </p>
                  )}
                </div>
              )}

              {/* 5. Matching Pairs */}
              {currentQ.type === 'match' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <AlertCircle className="w-4 h-4 text-[#008f4c]" />
                    Relaciona cada concepto de la izquierda con su contraparte correcta:
                  </p>
                  {(currentQ.pairs || []).map((p, pIdx) => {
                    const currentSelected = answers[currentQ.id]?.[pIdx];
                    const allOptionsB = (currentQ.pairs || []).map((pair) => pair.b);

                    return (
                      <div
                        key={pIdx}
                        className="exam-match-row"
                      >
                        <div className="font-bold text-sm sm:text-base px-2">{p.a}</div>
                        <select
                          value={currentSelected ?? ''}
                          onChange={(e) => handleSelectMatch(currentQ.id, pIdx, e.target.value)}
                          className="p-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-[#008f4c]/30"
                          style={{
                            backgroundColor: 'var(--input-bg)',
                            borderColor: 'var(--input-border)',
                            color: 'var(--text-main)',
                          }}
                        >
                          <option value="">— Selecciona la opción —</option>
                          {allOptionsB.map((optB, bIdx) => (
                            <option key={bIdx} value={bIdx}>
                              {optB}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 6. Scale (1-10) */}
              {currentQ.type === 'scale' && (
                <div
                  className="max-w-lg mx-auto p-6 rounded-2xl border text-center space-y-4"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-main)',
                  }}
                >
                  <div className="text-5xl font-black text-[#008f4c]">
                    {answers[currentQ.id] ?? 5}
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={answers[currentQ.id] ?? 5}
                    onChange={(e) => handleScaleChange(currentQ.id, parseInt(e.target.value, 10))}
                    className="w-full h-3 rounded-full accent-[#008f4c] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                    <span>1 · Muy Bajo / Principiante</span>
                    <span>5 · Intermedio</span>
                    <span>10 · Excelente / Experto</span>
                  </div>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2">
                    ⏳ Esta autoevaluación será ponderada y revisada por el evaluador.
                  </p>
                </div>
              )}

              {/* 7. Open Text Area */}
              {currentQ.type === 'open' && (
                <div className="space-y-3">
                  <textarea
                    rows={5}
                    placeholder="Redacta detalladamente tu respuesta técnica aquí..."
                    value={answers[currentQ.id] ?? ''}
                    onChange={(e) => handleTextChange(currentQ.id, e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 text-sm sm:text-base font-medium outline-none focus:border-[#008f4c] transition-all resize-y"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-light)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    ⏳ Esta pregunta abierta será revisada por el administrador para asignar el puntaje final y retroalimentación.
                  </p>
                </div>
              )}
            </div>

            {/* SENA Logo Watermark */}
            <div className="absolute bottom-4 right-4 w-28 h-28 opacity-5 pointer-events-none overflow-hidden select-none">
              <img src="/logo-sena.png" alt="" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Footer Navigation */}
          <div
            className="p-4 sm:p-5 border-t flex items-center justify-between gap-3 flex-wrap"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-light)',
            }}
          >
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="btn-secondary-sena"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
              <button
                type="button"
                disabled={currentIndex === totalQuestions - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="btn-secondary-sena"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAttemptSubmit}
              className="btn-primary-sena"
            >
              <span>Enviar Examen</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-light)',
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#008f4c]/10 text-[#008f4c] flex items-center justify-center mb-4">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-heading)' }}>
              Confirmar envío de examen
            </h3>
            <p className="text-sm font-medium mb-6" style={{ color: 'var(--text-muted)' }}>
              ¿Estás seguro de enviar tu evaluación? Una vez enviada, se calculará tu calificación automática y se notificará al evaluador. No podrás modificar tus respuestas.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary-sena"
              >
                Revisar respuestas
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="btn-primary-sena"
              >
                Sí, enviar ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
