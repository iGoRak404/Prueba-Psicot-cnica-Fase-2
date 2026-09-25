import React, { useState, useEffect } from 'react';
import {
  SenaQuestion,
  Student,
  Attempt,
  GroupLetter,
  Difficulty,
  ThemeMode,
  GradedDetail,
  SubjectiveReview,
} from './types';
import { DEFAULT_SENA_QUESTIONS } from './data/senaQuestions';
import { SenaHeader } from './components/SenaHeader';
import { StudentRegistrationForm } from './components/StudentRegistrationForm';
import { ExamRulesSidebar } from './components/ExamRulesSidebar';
import { ExamModal } from './components/ExamModal';
import { PasswordModal } from './components/PasswordModal';
import { AdminPanel } from './components/AdminPanel';
import { ReviewModal } from './components/ReviewModal';
import { QuestionEditorModal } from './components/QuestionEditorModal';
import { SuccessModal } from './components/SuccessModal';
import { sendEvaluationEmail, EmailSettings } from './services/emailService';

const STORAGE_KEY_THEME = 'sena_adso_theme';
const STORAGE_KEY_QUESTIONS = 'sena_adso_questions_v4';
const STORAGE_KEY_ATTEMPTS = 'sena_adso_attempts_v4';
const STORAGE_KEY_ADMIN_EMAIL = 'sena_adso_admin_email';
const STORAGE_KEY_EMAIL_SETTINGS = 'sena_adso_email_settings';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode) || 'normal';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Email Settings (Zero-leak GitHub Pages ready)
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EMAIL_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      adminEmail: localStorage.getItem(STORAGE_KEY_ADMIN_EMAIL) || 'admin@sena.edu.co',
      emailJsServiceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
      emailJsTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
      emailJsPublicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
      webhookUrl: import.meta.env.VITE_EMAIL_WEBHOOK_URL || '',
    };
  });

  const handleSaveEmailSettings = (newSettings: EmailSettings) => {
    setEmailSettings(newSettings);
    setAdminEmail(newSettings.adminEmail);
    localStorage.setItem(STORAGE_KEY_EMAIL_SETTINGS, JSON.stringify(newSettings));
    localStorage.setItem(STORAGE_KEY_ADMIN_EMAIL, newSettings.adminEmail);
  };

  // Questions Database
  const [questionsDB, setQuestionsDB] = useState<Record<GroupLetter, Record<Difficulty, SenaQuestion[]>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUESTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SENA_QUESTIONS;
  });

  const saveQuestions = (newDB: Record<GroupLetter, Record<Difficulty, SenaQuestion[]>>) => {
    setQuestionsDB(newDB);
    try {
      localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(newDB));
    } catch (e) {
      alert('⚠️ Almacenamiento lleno. Considera reducir archivos adjuntos pesados.');
    }
  };

  // Attempts Database
  const [attempts, setAttempts] = useState<Attempt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const saveAttempts = (newAttempts: Attempt[]) => {
    setAttempts(newAttempts);
    try {
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(newAttempts));
    } catch (e) {
      alert('⚠️ No se pudo guardar el intento en el almacenamiento local.');
    }
  };

  // Admin Email
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ADMIN_EMAIL) || 'admin@sena.edu.co';
  });

  const handleSaveAdminEmail = (email: string) => {
    setAdminEmail(email);
    localStorage.setItem(STORAGE_KEY_ADMIN_EMAIL, email);
  };

  // Views & Modals state
  const [isAdminView, setIsAdminView] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Exam state
  const [isExamOpen, setIsExamOpen] = useState(false);
  const [examStudent, setExamStudent] = useState<Student | null>(null);
  const [examGroup, setExamGroup] = useState<GroupLetter>('A');
  const [examDifficulty, setExamDifficulty] = useState<Difficulty>('easy');
  const [examQuestions, setExamQuestions] = useState<SenaQuestion[]>([]);

  // Success Modal
  const [successData, setSuccessData] = useState<{
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
  }>({
    isOpen: false,
    score: 0,
    total: 0,
    percentage: 0,
    hasPending: false,
    email: '',
    studentName: '',
    htmlReport: '',
    summaryText: '',
    deliveryMethod: '',
  });

  // Review Modal state
  const [reviewAttempt, setReviewAttempt] = useState<Attempt | null>(null);

  // Question Editor Modal state
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editorGroup, setEditorGroup] = useState<GroupLetter>('A');
  const [editorDiff, setEditorDiff] = useState<Difficulty>('easy');
  const [editorQuestion, setEditorQuestion] = useState<SenaQuestion | null>(null);

  // Toggle Admin
  const handleToggleAdmin = () => {
    if (isAdminView) {
      setIsAdminView(false);
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const handlePasswordSuccess = () => {
    setIsPasswordModalOpen(false);
    setIsAdminView(true);
  };

  // Attempts count helper for 3 attempt max rule
  const getAttemptsCountByDoc = (docNumber: string) => {
    return attempts.filter((a) => a.student.docNumber === docNumber).length;
  };

  // Start exam
  const handleStartExam = (student: Student, group: GroupLetter, difficulty: Difficulty) => {
    const list = questionsDB[group]?.[difficulty] || [];
    if (list.length === 0) {
      alert('No hay preguntas disponibles para este grupo y nivel.');
      return;
    }

    setExamStudent(student);
    setExamGroup(group);
    setExamDifficulty(difficulty);
    setExamQuestions(JSON.parse(JSON.stringify(list)));
    setIsExamOpen(true);
  };

  // Automatic Grading calculation
  const gradeSingleQuestion = (q: SenaQuestion, ans: any): GradedDetail => {
    const qScore = q.score || 1;

    if (q.type === 'multiple') {
      const isOk = ans === q.correct;
      return { earned: isOk ? qScore : 0, total: qScore, auto: true };
    }

    if (q.type === 'truefalse') {
      const isOk = ans === q.correct;
      return { earned: isOk ? qScore : 0, total: qScore, auto: true };
    }

    if (q.type === 'checkbox') {
      const selected = Array.isArray(ans) ? [...ans].sort((a, b) => a - b) : [];
      const corrects = (q.corrects || []).slice().sort((a, b) => a - b);
      const isOk =
        selected.length === corrects.length &&
        selected.every((val, i) => val === corrects[i]);
      return { earned: isOk ? qScore : 0, total: qScore, auto: true };
    }

    if (q.type === 'numeric') {
      const num = parseFloat(ans);
      if (isNaN(num)) return { earned: 0, total: qScore, auto: true };
      const tol = q.tolerance || 0;
      const isOk = Math.abs(num - (q.correct as number)) <= tol;
      return { earned: isOk ? qScore : 0, total: qScore, auto: true };
    }

    if (q.type === 'match') {
      if (!ans || typeof ans !== 'object') return { earned: 0, total: qScore, auto: true };
      const pairs = q.pairs || [];
      let matchCount = 0;
      pairs.forEach((_, i) => {
        if (ans[i] === i) matchCount++;
      });
      const earned = pairs.length > 0 ? (qScore * matchCount) / pairs.length : 0;
      return { earned: Math.round(earned * 100) / 100, total: qScore, auto: true };
    }

    if (q.type === 'scale' || q.type === 'open') {
      return { earned: 0, total: qScore, auto: false, pendingReview: true };
    }

    return { earned: 0, total: qScore, auto: false };
  };

  // Exam Submit handler
  const handleExamSubmit = async (answers: Record<string, any>) => {
    if (!examStudent) return;

    let autoScore = 0;
    let autoTotal = 0;
    let hasPending = false;
    const gradedDetails: Record<string, GradedDetail> = {};

    examQuestions.forEach((q) => {
      const result = gradeSingleQuestion(q, answers[q.id]);
      gradedDetails[q.id] = result;
      autoScore += result.earned;
      autoTotal += result.total;
      if (result.pendingReview) hasPending = true;
    });

    const newAttempt: Attempt = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      student: { ...examStudent },
      group: examGroup,
      difficulty: examDifficulty,
      questions: JSON.parse(JSON.stringify(examQuestions)),
      answers: { ...answers },
      gradedDetails,
      autoScore,
      autoTotal,
      finalScore: autoScore,
      finalTotal: autoTotal,
      reviewStatus: hasPending ? 'pending' : 'completed',
      reviews: {},
      date: new Date().toISOString(),
      emailSentInitial: false,
      emailSentFinal: false,
    };

    const updatedAttempts = [newAttempt, ...attempts];
    saveAttempts(updatedAttempts);

    // Dispatch or Generate Email report (GitHub Pages and server compatible)
    let emailHtml = '';
    let emailText = '';
    let deliveryMethod = 'client_generated';

    try {
      const dispatchResult = await sendEvaluationEmail(
        {
          emailType: 'initial',
          studentEmail: examStudent.email,
          studentName: examStudent.fullName,
          studentDoc: `${examStudent.docType} ${examStudent.docNumber}`,
          group: examGroup,
          difficulty: examDifficulty,
          autoScore,
          autoTotal,
          hasPending,
          answers,
          questions: examQuestions,
          gradedDetails,
          completedAt: newAttempt.date,
          adminEmail: emailSettings.adminEmail,
        },
        emailSettings
      );

      emailHtml = dispatchResult.studentHtml;
      emailText = dispatchResult.studentText;
      deliveryMethod = dispatchResult.method;

      if (dispatchResult.success && dispatchResult.method !== 'client_generated') {
        newAttempt.emailSentInitial = true;
        saveAttempts(updatedAttempts);
      }
    } catch (err) {
      console.warn('Dispatch note:', err);
    }

    // Close exam & show success modal with generated report
    setIsExamOpen(false);
    const pct = autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0;
    setSuccessData({
      isOpen: true,
      score: autoScore,
      total: autoTotal,
      percentage: pct,
      hasPending,
      email: examStudent.email,
      studentName: examStudent.fullName,
      htmlReport: emailHtml,
      summaryText: emailText,
      deliveryMethod,
    });
  };

  // Review Update handler
  const handleUpdateReview = (
    attemptId: string,
    questionId: string,
    status: 'correct' | 'incorrect' | 'partial',
    earned: number,
    feedback: string
  ) => {
    const updated = attempts.map((a) => {
      if (a.id !== attemptId) return a;

      const newReviews: Record<string, SubjectiveReview> = {
        ...a.reviews,
        [questionId]: { status, earned, feedback },
      };

      // Recalculate final score
      let finalScore = a.autoScore;
      let allSubjectiveDone = true;

      a.questions.forEach((q) => {
        if (q.type === 'scale' || q.type === 'open') {
          const rev = newReviews[q.id];
          if (rev && rev.status) {
            finalScore += rev.earned ?? 0;
          } else {
            allSubjectiveDone = false;
          }
        }
      });

      const updatedAttempt: Attempt = {
        ...a,
        reviews: newReviews,
        finalScore: Math.round(finalScore * 100) / 100,
        finalTotal: a.questions.reduce((sum, q) => sum + (q.score || 1), 0),
        reviewStatus: allSubjectiveDone ? 'completed' : 'pending',
      };

      if (reviewAttempt && reviewAttempt.id === attemptId) {
        setReviewAttempt(updatedAttempt);
      }

      return updatedAttempt;
    });

    saveAttempts(updated);
  };

  // Send Final Email
  const handleSendFinalEmail = async (attemptId: string) => {
    const target = attempts.find((a) => a.id === attemptId);
    if (!target) return;

    if (target.reviewStatus !== 'completed') {
      alert('⚠️ Primero debes revisar y asignar calificación a todas las preguntas subjetivas.');
      return;
    }

    if (!confirm(`¿Deseas procesar y enviar el correo con los resultados definitivos a ${target.student.fullName} (${target.student.email})?`)) {
      return;
    }

    try {
      const dispatchResult = await sendEvaluationEmail(
        {
          emailType: 'final',
          studentEmail: target.student.email,
          studentName: target.student.fullName,
          studentDoc: `${target.student.docType} ${target.student.docNumber}`,
          group: target.group,
          difficulty: target.difficulty,
          autoScore: target.autoScore,
          autoTotal: target.autoTotal,
          finalScore: target.finalScore,
          finalTotal: target.finalTotal,
          reviews: target.reviews,
          questions: target.questions,
          answers: target.answers,
          completedAt: target.date,
          adminEmail: emailSettings.adminEmail,
        },
        emailSettings
      );

      const updated = attempts.map((a) =>
        a.id === attemptId ? { ...a, emailSentFinal: true } : a
      );
      saveAttempts(updated);
      if (reviewAttempt && reviewAttempt.id === attemptId) {
        setReviewAttempt({ ...reviewAttempt, emailSentFinal: true });
      }

      if (dispatchResult.method === 'emailjs') {
        alert(`✅ Correo definitivo despachado vía EmailJS a:\n\n📧 ${target.student.email}\n📧 ${emailSettings.adminEmail}`);
      } else if (dispatchResult.method === 'server') {
        alert(`✅ Correo definitivo despachado vía servidor SMTP a:\n\n📧 ${target.student.email}\n📧 ${emailSettings.adminEmail}`);
      } else {
        alert(`✅ Reporte oficial definitivo generado con éxito.\n\nPuedes descargarlo en HTML desde el botón "Descargar (.html)" o copiar el texto para el aprendiz.`);
      }
    } catch (err: any) {
      alert(`❌ Error al procesar el correo definitivo: ${err.message}`);
    }
  };

  // Question Editor Save
  const handleSaveQuestion = (
    group: GroupLetter,
    diff: Difficulty,
    q: SenaQuestion
  ) => {
    const groupData = { ...questionsDB[group] };
    const list = [...(groupData[diff] || [])];

    const existingIdx = list.findIndex((item) => item.id === q.id);
    if (existingIdx >= 0) {
      list[existingIdx] = q;
    } else {
      list.push(q);
    }

    groupData[diff] = list;
    const newDB = { ...questionsDB, [group]: groupData };
    saveQuestions(newDB);
  };

  const handleDeleteQuestion = (
    group: GroupLetter,
    diff: Difficulty,
    idx: number
  ) => {
    if (!confirm('¿Deseas eliminar permanentemente esta pregunta del banco?')) return;
    const groupData = { ...questionsDB[group] };
    const list = [...(groupData[diff] || [])];
    list.splice(idx, 1);
    groupData[diff] = list;
    saveQuestions({ ...questionsDB, [group]: groupData });
  };

  const handleResetQuestions = () => {
    if (confirm('¿Restaurar todas las preguntas predeterminadas del SENA? Los cambios manuales se perderán.')) {
      saveQuestions(DEFAULT_SENA_QUESTIONS);
      alert('✅ Banco de preguntas restablecido con éxito.');
    }
  };

  const handleClearAllLocalData = () => {
    if (confirm('¿Estás seguro de borrar todos los intentos y preguntas guardadas en este navegador?')) {
      localStorage.removeItem(STORAGE_KEY_QUESTIONS);
      localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
      setAttempts([]);
      setQuestionsDB(DEFAULT_SENA_QUESTIONS);
      alert('🗑️ Datos locales eliminados.');
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto flex flex-col justify-between">
      <div>
        {/* Header */}
        <SenaHeader
          currentTheme={theme}
          onThemeChange={setTheme}
          isAdminView={isAdminView}
          onToggleAdmin={handleToggleAdmin}
        />

        {/* Content based on Admin vs Student */}
        {isAdminView ? (
          <AdminPanel
            questionsDB={questionsDB}
            attempts={attempts}
            adminEmail={adminEmail}
            onSaveAdminEmail={handleSaveAdminEmail}
            emailSettings={emailSettings}
            onSaveEmailSettings={handleSaveEmailSettings}
            onSaveQuestion={handleSaveQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onResetQuestions={handleResetQuestions}
            onClearAllLocalData={handleClearAllLocalData}
            onOpenReview={(a) => setReviewAttempt(a)}
            onSendFinalEmail={handleSendFinalEmail}
            onOpenNewQuestion={(g, d) => {
              setEditorGroup(g);
              setEditorDiff(d);
              setEditorQuestion(null);
              setEditorModalOpen(true);
            }}
            onOpenEditQuestion={(g, d, q) => {
              setEditorGroup(g);
              setEditorDiff(d);
              setEditorQuestion(q);
              setEditorModalOpen(true);
            }}
            currentTheme={theme}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
            <StudentRegistrationForm
              onStartExam={handleStartExam}
              getAttemptsCountByDoc={getAttemptsCountByDoc}
              maxAttempts={3}
            />
            <ExamRulesSidebar />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="text-center mt-14 pt-6 border-t text-xs font-medium"
        style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}
      >
        Servicio Nacional de Aprendizaje SENA • Programa Análisis y Desarrollo de Software (ADSO) • Tecnólogo
      </footer>

      {/* Fullscreen Exam Experience */}
      <ExamModal
        isOpen={isExamOpen}
        student={examStudent}
        group={examGroup}
        difficulty={examDifficulty}
        questions={examQuestions}
        onExit={() => setIsExamOpen(false)}
        onSubmit={handleExamSubmit}
      />

      {/* Password Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successData.isOpen}
        score={successData.score}
        total={successData.total}
        percentage={successData.percentage}
        hasPending={successData.hasPending}
        email={successData.email}
        studentName={successData.studentName}
        htmlReport={successData.htmlReport}
        summaryText={successData.summaryText}
        deliveryMethod={successData.deliveryMethod}
        onClose={() => setSuccessData((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={Boolean(reviewAttempt)}
        attempt={reviewAttempt}
        onClose={() => setReviewAttempt(null)}
        onUpdateReview={handleUpdateReview}
        onSendFinalEmail={handleSendFinalEmail}
      />

      {/* Question Editor Modal */}
      <QuestionEditorModal
        isOpen={editorModalOpen}
        group={editorGroup}
        difficulty={editorDiff}
        question={editorQuestion}
        onClose={() => setEditorModalOpen(false)}
        onSave={handleSaveQuestion}
      />
    </div>
  );
}
