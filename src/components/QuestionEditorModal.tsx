import React, { useState, useEffect } from 'react';
import { SenaQuestion, QuestionType, Difficulty, GroupLetter, MediaAttachment } from '../types';
import { X, Plus, Trash2, Upload, Link as LinkIcon, Image, Film, Music, FileText } from 'lucide-react';

interface QuestionEditorModalProps {
  isOpen: boolean;
  group: GroupLetter;
  difficulty: Difficulty;
  question: SenaQuestion | null;
  onClose: () => void;
  onSave: (group: GroupLetter, difficulty: Difficulty, question: SenaQuestion) => void;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  isOpen,
  group,
  difficulty,
  question,
  onClose,
  onSave,
}) => {
  const [text, setText] = useState('');
  const [type, setType] = useState<QuestionType>('multiple');
  const [score, setScore] = useState(1);
  const [timeLimit, setTimeLimit] = useState(0);
  const [category, setCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(difficulty);
  const [feedback, setFeedback] = useState('');

  // Type specific states
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [correctIndices, setCorrectIndices] = useState<number[]>([0]);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState(true);
  const [numericAnswer, setNumericAnswer] = useState<number | string>('');
  const [numericTolerance, setNumericTolerance] = useState(0);
  const [matchPairs, setMatchPairs] = useState<{ a: string; b: string }[]>([
    { a: '', b: '' },
    { a: '', b: '' },
  ]);

  // Media
  const [media, setMedia] = useState<MediaAttachment | undefined>(undefined);

  useEffect(() => {
    if (question) {
      setText(question.text);
      setType(question.type);
      setScore(question.score || 1);
      setTimeLimit(question.timeLimit || 0);
      setCategory(question.category || '');
      setSelectedDifficulty(question.difficulty || difficulty);
      setFeedback(question.feedback || '');
      setOptions(question.options?.length ? [...question.options] : ['', '', '', '']);
      setCorrectIndex(typeof question.correct === 'number' ? question.correct : 0);
      setCorrectIndices(question.corrects?.length ? [...question.corrects] : [0]);
      setTrueFalseAnswer(question.correct === true);
      setNumericAnswer(typeof question.correct === 'number' ? question.correct : '');
      setNumericTolerance(question.tolerance || 0);
      setMatchPairs(question.pairs?.length ? [...question.pairs] : [{ a: '', b: '' }, { a: '', b: '' }]);
      setMedia(question.media ? { ...question.media } : undefined);
    } else {
      setText('');
      setType('multiple');
      setScore(1);
      setTimeLimit(0);
      setCategory('');
      setSelectedDifficulty(difficulty);
      setFeedback('');
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
      setCorrectIndices([0]);
      setTrueFalseAnswer(true);
      setNumericAnswer('');
      setNumericTolerance(0);
      setMatchPairs([{ a: '', b: '' }, { a: '', b: '' }]);
      setMedia(undefined);
    }
  }, [question, difficulty, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let mediaType: MediaAttachment['type'] = 'image';
    if (file.type.startsWith('video/')) mediaType = 'video';
    else if (file.type.startsWith('audio/')) mediaType = 'audio';
    else if (file.type === 'application/pdf') mediaType = 'pdf';

    const maxMb = mediaType === 'video' ? 5 : 2;
    if (file.size > maxMb * 1024 * 1024) {
      alert(`El archivo pesa ${(file.size / (1024 * 1024)).toFixed(1)} MB. El límite para ${mediaType} es ${maxMb} MB. Para videos grandes se recomienda usar enlaces de YouTube.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setMedia({
        type: mediaType,
        data: ev.target?.result as string,
        name: file.name,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePasteUrl = () => {
    const t = prompt('Tipo de recurso (image, video, audio, pdf, link):', 'image');
    if (!t || !['image', 'video', 'audio', 'pdf', 'link'].includes(t)) {
      alert('Tipo no válido.');
      return;
    }
    const u = prompt('Pega la URL del recurso:');
    if (!u) return;
    setMedia({
      type: t as any,
      url: u.trim(),
    });
  };

  const handleSave = () => {
    if (!text.trim()) {
      alert('La pregunta debe tener un enunciado descriptivo.');
      return;
    }

    const baseQuestion: SenaQuestion = {
      id: question?.id || `${group}-${selectedDifficulty}-${Date.now()}`,
      text: text.trim(),
      type,
      score: score > 0 ? score : 1,
      timeLimit: timeLimit > 0 ? timeLimit : undefined,
      category: category.trim() || undefined,
      difficulty: selectedDifficulty,
      feedback: feedback.trim() || undefined,
      media: media || undefined,
    };

    if (type === 'multiple') {
      const validOptions = options.map((o) => o.trim()).filter(Boolean);
      if (validOptions.length < 2) {
        alert('Debes proporcionar al menos 2 opciones.');
        return;
      }
      baseQuestion.options = validOptions;
      baseQuestion.correct = Math.min(correctIndex, validOptions.length - 1);
    } else if (type === 'checkbox') {
      const validOptions = options.map((o) => o.trim()).filter(Boolean);
      if (validOptions.length < 2) {
        alert('Debes proporcionar al menos 2 opciones.');
        return;
      }
      if (correctIndices.length === 0) {
        alert('Debes marcar al menos una opción correcta.');
        return;
      }
      baseQuestion.options = validOptions;
      baseQuestion.corrects = correctIndices.filter((idx) => idx < validOptions.length);
    } else if (type === 'truefalse') {
      baseQuestion.correct = trueFalseAnswer;
    } else if (type === 'numeric') {
      const num = parseFloat(String(numericAnswer));
      if (isNaN(num)) {
        alert('Ingresa una respuesta numérica válida.');
        return;
      }
      baseQuestion.correct = num as any;
      baseQuestion.tolerance = numericTolerance;
    } else if (type === 'match') {
      const validPairs = matchPairs.filter((p) => p.a.trim() && p.b.trim());
      if (validPairs.length < 2) {
        alert('Ingresa al menos 2 pares completos.');
        return;
      }
      baseQuestion.pairs = validPairs;
    }

    onSave(group, selectedDifficulty, baseQuestion);
    onClose();
  };

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
        <div className="flex items-center justify-between pb-4 border-b mb-5" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <h3 className="text-xl font-black" style={{ color: 'var(--text-heading)' }}>
              {question ? 'Editar Pregunta' : 'Nueva Pregunta'}
            </h3>
            <span className="text-xs font-semibold text-gray-500">
              Grupo {group} · Nivel {difficulty.toUpperCase()}
            </span>
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

        <div className="flex-1 overflow-y-auto pr-2 space-y-5 text-sm">
          {/* Question Text */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>
              Enunciado de la Pregunta <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe claramente el enunciado de la pregunta..."
              className="w-full p-3 rounded-2xl border text-sm font-medium outline-none focus:border-[#008f4c]"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>
              Tipo de Pregunta
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as QuestionType)}
              className="w-full p-3 rounded-2xl border text-sm font-medium outline-none focus:border-[#008f4c]"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-main)',
              }}
            >
              <option value="multiple">Selección Múltiple (Respuesta única)</option>
              <option value="checkbox">Selección Múltiple (Varias respuestas correctas)</option>
              <option value="truefalse">Verdadero / Falso</option>
              <option value="numeric">Respuesta Numérica (con tolerancia)</option>
              <option value="match">Emparejamiento (Relacionar columnas)</option>
              <option value="scale">Escala de Valoración (1-10) · Revisión manual</option>
              <option value="open">Pregunta Abierta de Desarrollo · Revisión manual</option>
            </select>
          </div>

          {/* Dynamic editor depending on type */}
          {(type === 'multiple' || type === 'checkbox') && (
            <div className="p-4 rounded-2xl bg-[var(--bg-info)] border border-[var(--border-light)] space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Opciones de respuesta ({type === 'multiple' ? 'Marca el radio de la correcta' : 'Marca las casillas correctas'})
              </label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <input
                    type={type === 'multiple' ? 'radio' : 'checkbox'}
                    name="correctOptions"
                    checked={
                      type === 'multiple'
                        ? correctIndex === idx
                        : correctIndices.includes(idx)
                    }
                    onChange={() => {
                      if (type === 'multiple') {
                        setCorrectIndex(idx);
                      } else {
                        setCorrectIndices((prev) =>
                          prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                        );
                      }
                    }}
                    className="w-4 h-4 accent-[#008f4c] shrink-0"
                  />
                  <input
                    type="text"
                    value={opt}
                    placeholder={`Opción ${String.fromCharCode(65 + idx)}`}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[idx] = e.target.value;
                      setOptions(updated);
                    }}
                    className="flex-1 p-2.5 rounded-xl border text-xs font-medium outline-none"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-main)',
                    }}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                      className="p-2 text-red-500 hover:opacity-80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={() => setOptions([...options, ''])}
                  className="btn-secondary-sena text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir otra opción</span>
                </button>
              )}
            </div>
          )}

          {type === 'truefalse' && (
            <div className="p-4 rounded-2xl bg-[var(--bg-info)] border border-[var(--border-light)]">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">
                Respuesta Correcta
              </label>
              <select
                value={trueFalseAnswer ? 'true' : 'false'}
                onChange={(e) => setTrueFalseAnswer(e.target.value === 'true')}
                className="w-full p-2.5 rounded-xl border text-sm font-semibold outline-none"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-main)',
                }}
              >
                <option value="true">Verdadero</option>
                <option value="false">Falso</option>
              </select>
            </div>
          )}

          {type === 'numeric' && (
            <div className="p-4 rounded-2xl bg-[var(--bg-info)] border border-[var(--border-light)] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                  Valor Numérico Correcto
                </label>
                <input
                  type="number"
                  step="any"
                  value={numericAnswer}
                  onChange={(e) => setNumericAnswer(e.target.value)}
                  placeholder="Ej: 404"
                  className="w-full p-2.5 rounded-xl border text-sm font-bold outline-none"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                  Tolerancia (±)
                </label>
                <input
                  type="number"
                  step="any"
                  value={numericTolerance}
                  onChange={(e) => setNumericTolerance(parseFloat(e.target.value) || 0)}
                  placeholder="0 = Exacto"
                  className="w-full p-2.5 rounded-xl border text-sm font-bold outline-none"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
            </div>
          )}

          {type === 'match' && (
            <div className="p-4 rounded-2xl bg-[var(--bg-info)] border border-[var(--border-light)] space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Pares a relacionar (Columna A ➔ Columna B)
              </label>
              {matchPairs.map((pair, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input
                    type="text"
                    value={pair.a}
                    placeholder={`Elemento ${idx + 1} (Col A)`}
                    onChange={(e) => {
                      const updated = [...matchPairs];
                      updated[idx].a = e.target.value;
                      setMatchPairs(updated);
                    }}
                    className="p-2.5 rounded-xl border text-xs font-medium outline-none"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <input
                    type="text"
                    value={pair.b}
                    placeholder={`Definición correspondiente ${idx + 1} (Col B)`}
                    onChange={(e) => {
                      const updated = [...matchPairs];
                      updated[idx].b = e.target.value;
                      setMatchPairs(updated);
                    }}
                    className="p-2.5 rounded-xl border text-xs font-medium outline-none"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-main)',
                    }}
                  />
                  {matchPairs.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setMatchPairs(matchPairs.filter((_, i) => i !== idx))}
                      className="p-2 text-red-500 hover:opacity-80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {matchPairs.length < 6 && (
                <button
                  type="button"
                  onClick={() => setMatchPairs([...matchPairs, { a: '', b: '' }])}
                  className="btn-secondary-sena text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir otro par</span>
                </button>
              )}
            </div>
          )}

          {/* Multimedia Attachment */}
          <div className="p-4 rounded-2xl bg-[var(--bg-info)] border border-[var(--border-light)]">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">
              Adjunto Multimedia (Opcional)
            </label>
            <div className="flex gap-2 flex-wrap items-center">
              <label className="btn-secondary-sena text-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Subir archivo desde PC</span>
                <input
                  type="file"
                  accept="image/*,video/*,audio/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={handlePasteUrl}
                className="btn-secondary-sena text-xs"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Pegar URL (ej. YouTube, web)</span>
              </button>
              {media && (
                <button
                  type="button"
                  onClick={() => setMedia(undefined)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-red-600 border border-red-300 hover:bg-red-50 cursor-pointer"
                >
                  Quitar adjunto
                </button>
              )}
            </div>

            {media && (
              <div className="mt-3 p-3 rounded-xl bg-white dark:bg-gray-900 border text-xs flex items-center gap-2">
                <span className="font-bold text-[#008f4c] uppercase">[{media.type}]</span>
                <span className="truncate">{media.name || media.url || 'Archivo Base64 cargado'}</span>
              </div>
            )}
          </div>

          {/* Advanced config */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                Puntaje
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl border text-xs font-bold outline-none"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-main)',
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                Tiempo Límite (s)
              </label>
              <input
                type="number"
                min="0"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value, 10) || 0)}
                placeholder="0 = Ilimitado"
                className="w-full p-2.5 rounded-xl border text-xs font-bold outline-none"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-main)',
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                Categoría
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej: Git, POO, BD"
                className="w-full p-2.5 rounded-xl border text-xs font-bold outline-none"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-main)',
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                Dificultad
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
                className="w-full p-2.5 rounded-xl border text-xs font-bold outline-none"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-main)',
                }}
              >
                <option value="easy">Fácil</option>
                <option value="medium">Intermedio</option>
                <option value="hard">Avanzado</option>
              </select>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>
              Retroalimentación / Justificación de la Respuesta
            </label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explicación detallada del por qué de la respuesta correcta..."
              className="w-full p-3 rounded-2xl border text-xs font-medium outline-none focus:border-[#008f4c]"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-5 border-t mt-5 flex justify-end gap-3" style={{ borderColor: 'var(--border-light)' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary-sena"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary-sena"
          >
            Guardar Pregunta
          </button>
        </div>
      </div>
    </div>
  );
};
