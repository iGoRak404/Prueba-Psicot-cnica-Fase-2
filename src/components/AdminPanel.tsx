import React, { useState, useEffect, useRef } from 'react';
import {
  SenaQuestion,
  Attempt,
  GroupLetter,
  Difficulty,
  ThemeMode,
} from '../types';
import {
  LayoutDashboard,
  HelpCircle,
  FileSpreadsheet,
  Settings,
  Plus,
  RotateCcw,
  Search,
  Download,
  RefreshCw,
  Mail,
  Edit2,
  Trash2,
  Users,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { EmailSettings } from '../services/emailService';

Chart.register(...registerables);

interface AdminPanelProps {
  questionsDB: Record<GroupLetter, Record<Difficulty, SenaQuestion[]>>;
  attempts: Attempt[];
  adminEmail: string;
  onSaveAdminEmail: (email: string) => void;
  emailSettings?: EmailSettings;
  onSaveEmailSettings?: (settings: EmailSettings) => void;
  onSaveQuestion: (group: GroupLetter, difficulty: Difficulty, question: SenaQuestion) => void;
  onDeleteQuestion: (group: GroupLetter, difficulty: Difficulty, index: number) => void;
  onResetQuestions: () => void;
  onClearAllLocalData: () => void;
  onOpenReview: (attempt: Attempt) => void;
  onSendFinalEmail: (attemptId: string) => void;
  onOpenNewQuestion: (group: GroupLetter, difficulty: Difficulty) => void;
  onOpenEditQuestion: (group: GroupLetter, difficulty: Difficulty, q: SenaQuestion) => void;
  currentTheme: ThemeMode;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  questionsDB,
  attempts,
  adminEmail,
  onSaveAdminEmail,
  emailSettings,
  onSaveEmailSettings,
  onResetQuestions,
  onClearAllLocalData,
  onOpenReview,
  onSendFinalEmail,
  onOpenNewQuestion,
  onOpenEditQuestion,
  onDeleteQuestion,
  currentTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions' | 'results' | 'config'>('dashboard');

  // Question tab filters
  const [qFilterGroup, setQFilterGroup] = useState<GroupLetter>('A');
  const [qFilterDifficulty, setQFilterDifficulty] = useState<Difficulty>('easy');

  // Results tab filters
  const [resFilterGroup, setResFilterGroup] = useState<string>('');
  const [resFilterDifficulty, setResFilterDifficulty] = useState<string>('');
  const [resSearchStudent, setResSearchStudent] = useState<string>('');

  // Email config local state
  const [emailInput, setEmailInput] = useState(adminEmail);
  const [emailJsServiceId, setEmailJsServiceId] = useState(emailSettings?.emailJsServiceId || '');
  const [emailJsTemplateId, setEmailJsTemplateId] = useState(emailSettings?.emailJsTemplateId || '');
  const [emailJsPublicKey, setEmailJsPublicKey] = useState(emailSettings?.emailJsPublicKey || '');
  const [webhookUrl, setWebhookUrl] = useState(emailSettings?.webhookUrl || '');

  // Chart refs
  const scoresChartRef = useRef<HTMLCanvasElement | null>(null);
  const groupsChartRef = useRef<HTMLCanvasElement | null>(null);
  const diffChartRef = useRef<HTMLCanvasElement | null>(null);

  const scoresChartInstance = useRef<Chart | null>(null);
  const groupsChartInstance = useRef<Chart | null>(null);
  const diffChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    setEmailInput(adminEmail);
  }, [adminEmail]);

  // Compute storage size
  const calculateStorageSize = () => {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('sena_adso')) {
          total += (localStorage[key]?.length || 0) + key.length;
        }
      }
      return total;
    } catch {
      return 0;
    }
  };

  const storageBytes = calculateStorageSize();
  const storageLimit = 8 * 1024 * 1024; // 8MB
  const storagePct = Math.min((storageBytes / storageLimit) * 100, 100);
  const storageText =
    storageBytes > 1024 * 1024
      ? `${(storageBytes / (1024 * 1024)).toFixed(2)} MB / 8 MB`
      : `${(storageBytes / 1024).toFixed(1)} KB / 8 MB`;

  // Render Charts when Dashboard tab is active
  useEffect(() => {
    if (activeTab !== 'dashboard') return;

    const isDark = currentTheme === 'dark';
    const textColor = isDark ? '#c9d1d9' : '#1e3b2b';
    const gridColor = isDark ? '#30363d' : '#eef4f9';

    // 1. Scores Chart
    if (scoresChartRef.current) {
      if (scoresChartInstance.current) scoresChartInstance.current.destroy();
      const recentAttempts = attempts.slice(-10);
      scoresChartInstance.current = new Chart(scoresChartRef.current, {
        type: 'bar',
        data: {
          labels: recentAttempts.map((_, i) => `#${i + 1}`),
          datasets: [
            {
              label: 'Puntaje (%)',
              data: recentAttempts.map((a) =>
                a.finalTotal > 0 ? Math.round((a.finalScore / a.finalTotal) * 100) : 0
              ),
              backgroundColor: '#008f4c',
              borderRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Puntajes de los últimos intentos (%)',
              color: textColor,
              font: { weight: 'bold', size: 13 },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: { color: gridColor },
              ticks: { color: textColor },
            },
            x: {
              grid: { display: false },
              ticks: { color: textColor },
            },
          },
        },
      });
    }

    // 2. Groups Doughnut Chart
    if (groupsChartRef.current) {
      if (groupsChartInstance.current) groupsChartInstance.current.destroy();
      const countA = attempts.filter((a) => a.group === 'A').length;
      const countB = attempts.filter((a) => a.group === 'B').length;
      const countC = attempts.filter((a) => a.group === 'C').length;

      groupsChartInstance.current = new Chart(groupsChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Grupo A', 'Grupo B', 'Grupo C'],
          datasets: [
            {
              data: [countA, countB, countC],
              backgroundColor: ['#008f4c', '#4caf7a', '#a3d9b8'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { weight: 'bold' } },
            },
            title: {
              display: true,
              text: 'Distribución por Grupo',
              color: textColor,
              font: { weight: 'bold', size: 13 },
            },
          },
          cutout: '65%',
        },
      });
    }

    // 3. Difficulty Bar Chart
    if (diffChartRef.current) {
      if (diffChartInstance.current) diffChartInstance.current.destroy();
      const countEasy = attempts.filter((a) => a.difficulty === 'easy').length;
      const countMed = attempts.filter((a) => a.difficulty === 'medium').length;
      const countHard = attempts.filter((a) => a.difficulty === 'hard').length;

      diffChartInstance.current = new Chart(diffChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Fácil', 'Intermedio', 'Avanzado'],
          datasets: [
            {
              label: 'Intentos',
              data: [countEasy, countMed, countHard],
              backgroundColor: ['#4caf7a', '#f7b84c', '#d14545'],
              borderRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Participación por Dificultad',
              color: textColor,
              font: { weight: 'bold', size: 13 },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: gridColor },
              ticks: { color: textColor },
            },
            x: {
              grid: { display: false },
              ticks: { color: textColor },
            },
          },
        },
      });
    }

    return () => {
      scoresChartInstance.current?.destroy();
      groupsChartInstance.current?.destroy();
      diffChartInstance.current?.destroy();
    };
  }, [activeTab, attempts, currentTheme]);

  // Statistics calculation
  const totalStudents = new Set(attempts.map((a) => a.student.docNumber)).size;
  const totalAttempts = attempts.length;
  const avgPercentage =
    totalAttempts > 0
      ? (
          attempts.reduce(
            (sum, a) => sum + (a.finalTotal > 0 ? (a.finalScore / a.finalTotal) * 100 : 0),
            0
          ) / totalAttempts
        ).toFixed(1)
      : '0.0';
  const approvedCount = attempts.filter(
    (a) => a.finalTotal > 0 && a.finalScore / a.finalTotal >= 0.6
  ).length;
  const pendingCount = attempts.filter((a) => a.reviewStatus === 'pending').length;

  // Filtered results
  const filteredAttempts = attempts.filter((a) => {
    if (resFilterGroup && a.group !== resFilterGroup) return false;
    if (resFilterDifficulty && a.difficulty !== resFilterDifficulty) return false;
    if (resSearchStudent) {
      const q = resSearchStudent.toLowerCase();
      const matchName = a.student.fullName.toLowerCase().includes(q);
      const matchDoc = a.student.docNumber.includes(q);
      const matchEmail = a.student.email.toLowerCase().includes(q);
      if (!matchName && !matchDoc && !matchEmail) return false;
    }
    return true;
  });

  // Export to Excel (.xlsx) using SheetJS
  const handleExportExcel = () => {
    if (attempts.length === 0) {
      alert('No hay intentos registrados para exportar.');
      return;
    }

    const data = attempts.map((a) => ({
      'Nombre del Aprendiz': a.student.fullName,
      'Tipo Doc': a.student.docType,
      'Documento': a.student.docNumber,
      'Correo Electrónico': a.student.email,
      'Grupo': a.group,
      'Nivel': a.difficulty,
      'Puntaje Automático': a.autoScore.toFixed(1),
      'Puntaje Final': a.finalScore.toFixed(1),
      'Puntos Totales': a.finalTotal,
      'Porcentaje':
        a.finalTotal > 0 ? `${Math.round((a.finalScore / a.finalTotal) * 100)}%` : '0%',
      'Estado': a.reviewStatus === 'pending' ? 'Pendiente revisión' : 'Calificado',
      'Veredicto':
        a.finalTotal > 0 && a.finalScore / a.finalTotal >= 0.6 ? 'Aprobado' : 'No Aprobado',
      'Fecha y Hora': new Date(a.date).toLocaleString('es-CO'),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados SENA ADSO');
    XLSX.writeFile(wb, `resultados_sena_adso_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (attempts.length === 0) {
      alert('No hay intentos registrados para exportar.');
      return;
    }

    const headers = [
      'Nombre',
      'Tipo Doc',
      'Documento',
      'Correo',
      'Grupo',
      'Nivel',
      'Puntaje Auto',
      'Puntaje Final',
      'Total',
      'Porcentaje',
      'Estado',
      'Fecha',
    ];
    const rows = attempts.map((a) => [
      a.student.fullName,
      a.student.docType,
      a.student.docNumber,
      a.student.email,
      a.group,
      a.difficulty,
      a.autoScore.toFixed(1),
      a.finalScore.toFixed(1),
      a.finalTotal,
      a.finalTotal > 0 ? `${Math.round((a.finalScore / a.finalTotal) * 100)}%` : '0%',
      a.reviewStatus,
      new Date(a.date).toLocaleString('es-CO'),
    ]);

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `resultados_sena_adso_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const currentQuestions = questionsDB[qFilterGroup]?.[qFilterDifficulty] || [];

  return (
    <div className="card-sena">
      {/* Panel Switch Tabs */}
      <div
        className="flex items-center gap-1.5 p-1 rounded-full mb-6 flex-wrap"
        style={{ backgroundColor: 'var(--bg-main)' }}
      >
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'questions', label: 'Preguntas', icon: HelpCircle },
          { id: 'results', label: 'Resultados', icon: FileSpreadsheet },
          { id: 'config', label: 'Configuración', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--bg-card)] text-[#008f4c] shadow-xs'
                  : 'text-[var(--text-muted)] hover:opacity-80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black" style={{ color: 'var(--text-heading)' }}>
              Panel de Administración
            </h2>
            <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Resumen ejecutivo y métricas de desempeño del programa ADSO
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { label: 'Grupos', value: '3', border: '#008f4c' },
              { label: 'Aprendices', value: totalStudents, border: '#008f4c' },
              { label: 'Intentos', value: totalAttempts, border: '#008f4c' },
              { label: 'Promedio', value: `${avgPercentage}%`, border: '#008f4c' },
              { label: 'Aprobados', value: approvedCount, border: '#2ea043' },
              { label: 'Pendientes', value: pendingCount, border: '#f7b84c' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border-l-4 border transition-all"
                style={{
                  backgroundColor: 'var(--bg-info)',
                  borderColor: 'var(--border-light)',
                  borderLeftColor: stat.border,
                }}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                  {stat.label}
                </span>
                <div
                  className="text-2xl font-black mt-1"
                  style={{ color: 'var(--sena-dark-green)' }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div
              className="p-4 rounded-3xl border h-64 relative"
              style={{
                backgroundColor: 'var(--bg-info)',
                borderColor: 'var(--border-light)',
              }}
            >
              <canvas ref={scoresChartRef} />
            </div>
            <div
              className="p-4 rounded-3xl border h-64 relative"
              style={{
                backgroundColor: 'var(--bg-info)',
                borderColor: 'var(--border-light)',
              }}
            >
              <canvas ref={groupsChartRef} />
            </div>
            <div
              className="p-4 rounded-3xl border h-64 relative"
              style={{
                backgroundColor: 'var(--bg-info)',
                borderColor: 'var(--border-light)',
              }}
            >
              <canvas ref={diffChartRef} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PREGUNTAS */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black" style={{ color: 'var(--text-heading)' }}>
                Gestión de Preguntas
              </h2>
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Administra el banco de reactivos y contenidos multimedia
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onOpenNewQuestion(qFilterGroup, qFilterDifficulty)}
                className="btn-primary-sena text-xs py-2 px-4"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Pregunta</span>
              </button>
              <button
                type="button"
                onClick={onResetQuestions}
                className="btn-secondary-sena text-xs py-2 px-3.5"
                title="Restaurar preguntas originales"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-[var(--bg-info)] border border-[var(--border-light)]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Grupo:</span>
              <select
                value={qFilterGroup}
                onChange={(e) => setQFilterGroup(e.target.value as GroupLetter)}
                className="p-2 rounded-xl border text-xs font-bold outline-none"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-main)',
                }}
              >
                <option value="A">Grupo A (Frontend & Web)</option>
                <option value="B">Grupo B (Backend & BD)</option>
                <option value="C">Grupo C (DevOps & Testing)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Dificultad:</span>
              <select
                value={qFilterDifficulty}
                onChange={(e) => setQFilterDifficulty(e.target.value as Difficulty)}
                className="p-2 rounded-xl border text-xs font-bold outline-none"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-main)',
                }}
              >
                <option value="easy">Fácil (Fundamentos)</option>
                <option value="medium">Intermedio (Aplicación)</option>
                <option value="hard">Avanzado (Análisis)</option>
              </select>
            </div>
          </div>

          {/* Storage Meter */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              <span>Almacenamiento local utilizado (Base64)</span>
              <span>{storageText}</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-light)' }}>
              <div
                className={`h-full transition-all duration-300 ${
                  storagePct > 80 ? 'bg-red-500' : storagePct > 60 ? 'bg-amber-500' : 'bg-[#008f4c]'
                }`}
                style={{ width: `${storagePct}%` }}
              />
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-3">
            {currentQuestions.length === 0 ? (
              <div
                className="p-8 text-center text-sm font-medium rounded-3xl border border-dashed"
                style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                No hay preguntas configuradas para este grupo y dificultad. Haz clic en "Nueva Pregunta" o en "Restaurar".
              </div>
            ) : (
              currentQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl border transition-all hover:border-[#008f4c] flex flex-col sm:flex-row justify-between gap-3"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-light)',
                  }}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-start gap-2">
                      <span
                        className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border"
                        style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--text-muted)', borderColor: 'var(--border-light)' }}
                      >
                        {idx + 1}
                      </span>
                      <p className="font-bold text-sm sm:text-base leading-snug" style={{ color: 'var(--text-heading)' }}>
                        {q.text}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pl-8">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold badge-blue">
                        {q.type}
                      </span>
                      {q.category && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold badge-purple">
                          {q.category}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold badge-green">
                        {q.score} pt{q.score > 1 ? 's' : ''}
                      </span>
                      {q.media && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold badge-yellow">
                          Media: {q.media.type}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-end gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenEditQuestion(qFilterGroup, qFilterDifficulty, q)}
                      className="p-2 rounded-xl border hover:text-[#008f4c] hover:border-[#008f4c] transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--border)' }}
                      title="Editar pregunta"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(qFilterGroup, qFilterDifficulty, idx)}
                      className="p-2 rounded-xl border hover:text-red-600 hover:border-red-400 transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--border)' }}
                      title="Eliminar pregunta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RESULTADOS */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black" style={{ color: 'var(--text-heading)' }}>
                Resultados y Calificaciones
              </h2>
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Intentos registrados · Haz clic en el ícono de búsqueda para revisar respuestas subjetivas
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportExcel}
                className="btn-secondary-sena text-xs py-2 px-3.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Exportar Excel</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="btn-secondary-sena text-xs py-2 px-3.5"
              >
                <Download className="w-4 h-4" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-[var(--bg-info)] border border-[var(--border-light)] text-xs">
            <select
              value={resFilterGroup}
              onChange={(e) => setResFilterGroup(e.target.value)}
              className="p-2 rounded-xl border font-bold outline-none"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-main)',
              }}
            >
              <option value="">Todos los grupos</option>
              <option value="A">Grupo A</option>
              <option value="B">Grupo B</option>
              <option value="C">Grupo C</option>
            </select>

            <select
              value={resFilterDifficulty}
              onChange={(e) => setResFilterDifficulty(e.target.value)}
              className="p-2 rounded-xl border font-bold outline-none"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-main)',
              }}
            >
              <option value="">Todas las dificultades</option>
              <option value="easy">Fácil</option>
              <option value="medium">Intermedio</option>
              <option value="hard">Avanzado</option>
            </select>

            <div className="relative flex-1 min-w-[160px]">
              <input
                type="text"
                placeholder="Buscar por aprendiz, doc o correo..."
                value={resSearchStudent}
                onChange={(e) => setResSearchStudent(e.target.value)}
                className="w-full p-2 pl-8 rounded-xl border font-medium outline-none"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-main)',
                }}
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {(resFilterGroup || resFilterDifficulty || resSearchStudent) && (
              <button
                type="button"
                onClick={() => {
                  setResFilterGroup('');
                  setResFilterDifficulty('');
                  setResSearchStudent('');
                }}
                className="px-3 py-2 rounded-xl text-gray-500 hover:text-red-500 border border-gray-200 cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-[var(--border-light)]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[var(--bg-info)] font-bold border-b border-[var(--border-light)]">
                <tr>
                  <th className="p-3.5">Aprendiz</th>
                  <th className="p-3.5">Documento</th>
                  <th className="p-3.5">Correo</th>
                  <th className="p-3.5">Grupo</th>
                  <th className="p-3.5">Nivel</th>
                  <th className="p-3.5">Puntaje</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filteredAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400 font-medium">
                      No hay intentos registrados que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  filteredAttempts.map((a) => {
                    const pct =
                      a.finalTotal > 0 ? Math.round((a.finalScore / a.finalTotal) * 100) : 0;
                    const isApproved = pct >= 60;
                    const canSendFinal =
                      a.reviewStatus === 'completed' && !a.emailSentFinal;

                    return (
                      <tr
                        key={a.id}
                        className="hover:bg-[var(--bg-main)]/50 transition-colors"
                      >
                        <td className="p-3.5 font-bold">
                          <div>{a.student.fullName}</div>
                          {a.emailSentFinal && (
                            <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold badge-green">
                              📧 Correo enviado
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-xs">
                          {a.student.docType} {a.student.docNumber}
                        </td>
                        <td className="p-3.5 font-mono text-xs truncate max-w-[140px]">
                          {a.student.email}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full font-black text-xs badge-green">
                            Grupo {a.group}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              a.difficulty === 'easy'
                                ? 'badge-green'
                                : a.difficulty === 'medium'
                                ? 'badge-yellow'
                                : 'badge-red'
                            }`}
                          >
                            {a.difficulty}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold">
                          {a.finalScore.toFixed(1)} / {a.finalTotal} ({pct}%)
                        </td>
                        <td className="p-3.5">
                          {a.reviewStatus === 'pending' ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold badge-yellow flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" />
                              <span>Pendiente</span>
                            </span>
                          ) : isApproved ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold badge-green w-fit block">
                              Aprobado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold badge-red w-fit block">
                              Reprobado
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(a.date).toLocaleDateString('es-CO')}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenReview(a)}
                              className="p-1.5 rounded-xl border hover:text-[#008f4c] hover:border-[#008f4c] transition-colors cursor-pointer"
                              style={{ borderColor: 'var(--border)' }}
                              title="Revisar respuestas y calificación"
                            >
                              <Search className="w-4 h-4" />
                            </button>

                            {canSendFinal && (
                              <button
                                type="button"
                                onClick={() => onSendFinalEmail(a.id)}
                                className="p-1.5 rounded-xl bg-[#008f4c] text-white hover:bg-[#006b3a] transition-colors cursor-pointer"
                                title="Enviar correo definitivo al aprendiz"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONFIGURACIÓN */}
      {activeTab === 'config' && (
        <div className="space-y-6 max-w-xl">
          <div>
            <h2 className="text-2xl font-black" style={{ color: 'var(--text-heading)' }}>
              Configuración
            </h2>
            <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Parámetros generales de notificación y almacenamiento
            </p>
          </div>

          {/* Admin Email Box */}
          <div className="p-5 rounded-2xl bg-[var(--bg-info)] border border-[var(--border-light)] space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Correo Electrónico del Administrador / Instructor
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="admin@sena.edu.co"
              className="w-full p-3 rounded-2xl border text-sm font-medium outline-none focus:border-[#008f4c]"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-main)',
              }}
            />
            <p className="text-xs text-gray-500">
              Las alertas de exámenes completados y solicitudes de revisión se remitirán a esta dirección.
            </p>
            <button
              type="button"
              onClick={() => {
                if (!emailInput.trim() || !emailInput.includes('@')) {
                  alert('Por favor ingresa un correo válido.');
                  return;
                }
                onSaveAdminEmail(emailInput.trim());
                if (onSaveEmailSettings) {
                  onSaveEmailSettings({
                    adminEmail: emailInput.trim(),
                    emailJsServiceId: emailJsServiceId.trim(),
                    emailJsTemplateId: emailJsTemplateId.trim(),
                    emailJsPublicKey: emailJsPublicKey.trim(),
                    webhookUrl: webhookUrl.trim(),
                  });
                }
                alert('✅ Correo de administrador guardado con éxito.');
              }}
              className="btn-primary-sena text-xs py-2 px-4"
            >
              Guardar Correo
            </button>
          </div>

          {/* GitHub Pages & Email Integration (Zero Leaks) */}
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>
                Despacho de Correo para GitHub Pages
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full badge-green">
                🛡️ Cero Filtraciones de Claves
              </span>
            </div>

            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              En <strong>GitHub Pages</strong> no hay servidor Node.js backend. La plataforma genera automáticamente los acuses de recibo y reportes HTML completos de forma local en el navegador del aprendiz.
            </p>

            <div className="p-3.5 rounded-xl border text-xs space-y-1.5" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-light)' }}>
              <div className="font-bold" style={{ color: 'var(--text-heading)' }}>
                ¿Deseas despacho automático real por correo en GitHub Pages?
              </div>
              <p style={{ color: 'var(--text-muted)' }}>
                Puedes conectar tu cuenta gratuita de <strong>EmailJS</strong>. EmailJS utiliza una <em>Public Key</em> diseñada expresamente para clientes web estáticos, por lo que <strong>nunca expone contraseñas SMTP ni secretos de servidor</strong> en GitHub.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--text-muted)' }}>EmailJS Service ID</label>
                <input
                  type="text"
                  placeholder="service_xxxxx"
                  value={emailJsServiceId}
                  onChange={(e) => setEmailJsServiceId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border outline-none focus:border-[#008f4c]"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--text-muted)' }}>EmailJS Template ID</label>
                <input
                  type="text"
                  placeholder="template_xxxxx"
                  value={emailJsTemplateId}
                  onChange={(e) => setEmailJsTemplateId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border outline-none focus:border-[#008f4c]"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold mb-1" style={{ color: 'var(--text-muted)' }}>EmailJS Public Key (Clave Pública)</label>
                <input
                  type="text"
                  placeholder="user_xxxxx o Public Key de EmailJS"
                  value={emailJsPublicKey}
                  onChange={(e) => setEmailJsPublicKey(e.target.value)}
                  className="w-full p-2.5 rounded-xl border outline-none focus:border-[#008f4c]"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-main)' }}
                />
                <span className="text-[11px] opacity-75 mt-1 block">Se guarda en el navegador local (localStorage), no en archivos del repositorio Git.</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Opcional: URL de Webhook Personalizado (Make / Zapier / Formspree)</label>
                <input
                  type="url"
                  placeholder="https://hook.eu1.make.com/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border outline-none focus:border-[#008f4c]"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSaveEmailSettings) {
                  onSaveEmailSettings({
                    adminEmail: emailInput.trim(),
                    emailJsServiceId: emailJsServiceId.trim(),
                    emailJsTemplateId: emailJsTemplateId.trim(),
                    emailJsPublicKey: emailJsPublicKey.trim(),
                    webhookUrl: webhookUrl.trim(),
                  });
                  alert('✅ Parámetros de correo para GitHub Pages guardados exitosamente.');
                }
              }}
              className="btn-primary-sena text-xs py-2 px-4"
            >
              Guardar Configuración de Correo
            </button>
          </div>

          {/* Local Data Box */}
          <div className="p-5 rounded-2xl border border-[var(--border-light)] space-y-3">
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>
              Almacenamiento Local (Dispositivo)
            </h3>
            <div className="text-xs space-y-1 text-gray-500">
              <p>Intentos registrados localmente: <strong>{totalAttempts}</strong></p>
              <p>Almacenamiento consumido: <strong>{storageText}</strong></p>
            </div>
            <button
              type="button"
              onClick={onClearAllLocalData}
              className="px-4 py-2 rounded-full font-bold text-xs badge-red border border-red-300 dark:border-red-800 hover:opacity-85 transition-opacity cursor-pointer"
            >
              Borrar todos los datos locales
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
