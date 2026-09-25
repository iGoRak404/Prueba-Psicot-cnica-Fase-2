import React from 'react';
import { Candidate, Question, SystemConfig } from '../types';
import { Play, Clock, Award, ShieldAlert, CheckCircle2, BookOpen, Brain, Calculator, Compass, ArrowLeft } from 'lucide-react';

interface CandidateDashboardProps {
  candidate: Candidate;
  questions: Question[];
  config: SystemConfig;
  onStartTest: () => void;
  onCancel: () => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  candidate,
  questions,
  config,
  onStartTest,
  onCancel,
}) => {
  // Filtrar preguntas del grupo asignado
  const groupQuestions = questions.filter((q) => q.group_letter === candidate.group_letter);

  const totalPoints = groupQuestions.reduce((acc, q) => acc + q.points, 0);

  // Desglose por categoría
  const categoriesList: Array<{
    name: 'Lógica' | 'Análisis Matemático' | 'Comprensión Lectora' | 'Psicología';
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }> = [
    {
      name: 'Lógica',
      icon: <Compass className="w-5 h-5 text-indigo-600" />,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50 border-indigo-200',
    },
    {
      name: 'Análisis Matemático',
      icon: <Calculator className="w-5 h-5 text-emerald-600" />,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200',
    },
    {
      name: 'Comprensión Lectora',
      icon: <BookOpen className="w-5 h-5 text-amber-600" />,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200',
    },
    {
      name: 'Psicología',
      icon: <Brain className="w-5 h-5 text-purple-600" />,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50 border-purple-200',
    },
  ];

  const breakdown = categoriesList.map((cat) => {
    const catQuestions = groupQuestions.filter((q) => q.category === cat.name);
    const catPoints = catQuestions.reduce((acc, q) => acc + q.points, 0);
    const percentage = totalPoints > 0 ? ((catPoints / totalPoints) * 100).toFixed(1) : '0.0';
    return {
      ...cat,
      count: catQuestions.length,
      points: catPoints,
      percentage: Number(percentage),
    };
  });

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Top action: back to register */}
      <button
        onClick={onCancel}
        className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Cambiar datos de registro
      </button>

      {/* Candidate Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Candidato Verificado
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {candidate.full_name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-600">
              <span>
                {candidate.doc_type}: <strong className="font-mono text-slate-800">{candidate.doc_number}</strong>
              </span>
              <span>•</span>
              <span className="font-mono text-slate-800">{candidate.email}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[10px] font-bold uppercase text-blue-600 block">Grupo</span>
              <span className="text-xl font-black text-blue-900">{candidate.group_letter}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Preguntas</span>
              <span className="text-xl font-black text-slate-800">{groupQuestions.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Puntaje Máx</span>
              <span className="text-xl font-black text-slate-800">{totalPoints} pts</span>
            </div>
          </div>
        </div>

        {/* Evaluation Guidelines & Timer notice */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                {config.timer_enabled ? 'Temporizador y Auto-Submit' : 'Tiempo Libre'}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {config.timer_enabled ? (
                  <>
                    Límite global: <strong>{config.time_limit_minutes} minutos</strong>. Al llegar a cero, se ejecuta el <strong>auto-submit</strong> de sus respuestas de forma irrevocable.
                  </>
                ) : (
                  'El administrador ha deshabilitado el límite de tiempo para esta sesión.'
                )}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
            <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                Evaluación en Dos Fases
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Fase 1 evalúa preguntas cerradas al instante. Fase 2 concluye con la revisión manual de preguntas abiertas por el evaluador.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Category Breakdown & Weighting */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Resumen de Categorías a Evaluar
            </h3>
            <p className="text-xs text-slate-500">
              Ponderación y porcentaje sobre el total del Grupo {candidate.group_letter}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            Total: 100% ({totalPoints} pts)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {breakdown.map((cat) => (
            <div
              key={cat.name}
              className={`p-4 rounded-xl border ${cat.bgColor} flex flex-col justify-between transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-white shadow-xs">
                    {cat.icon}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${cat.color}`}>
                      {cat.name}
                    </h4>
                    <span className="text-xs text-slate-600">
                      {cat.count} {cat.count === 1 ? 'pregunta' : 'preguntas'} ({cat.points} pts)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">
                    {cat.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">
                    Peso
                  </span>
                </div>
              </div>

              {/* Progress bar visual for weight */}
              <div className="w-full bg-slate-200/70 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-slate-800 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, cat.percentage))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Start Button */}
      <div className="text-center">
        <button
          id="start-test-btn"
          onClick={onStartTest}
          className="w-full sm:w-auto min-w-[320px] py-4 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-md hover:shadow-lg transition-all transform active:scale-98 flex items-center justify-center space-x-3 mx-auto"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>COMENZAR PRUEBA AHORA</span>
        </button>
        <p className="text-xs text-slate-500 mt-3">
          El cronómetro iniciará inmediatamente al presionar el botón.
        </p>
      </div>
    </div>
  );
};
