import React, { useState } from 'react';
import { Student, GroupLetter, Difficulty } from '../types';
import { ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface StudentRegistrationFormProps {
  onStartExam: (student: Student, group: GroupLetter, difficulty: Difficulty) => void;
  getAttemptsCountByDoc: (docNumber: string) => number;
  maxAttempts: number;
}

export const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({
  onStartExam,
  getAttemptsCountByDoc,
  maxAttempts,
}) => {
  const [docType, setDocType] = useState('CC');
  const [docNumber, setDocNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState<GroupLetter>('A');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const groupDescriptions: Record<GroupLetter, string> = {
    A: 'Grupo A · Turno Mañana (Frontend & Arquitectura Web)',
    B: 'Grupo B · Turno Tarde (Backend, Bases de Datos & POO)',
    C: 'Grupo C · Mixto (DevOps, Cloud, Testing & Ágil)',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanDoc = docNumber.trim();
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanDoc || !cleanName || !cleanEmail) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    const previousAttempts = getAttemptsCountByDoc(cleanDoc);
    if (previousAttempts >= maxAttempts) {
      setErrorMsg(`Has alcanzado el límite máximo de ${maxAttempts} intentos permitidos con el documento ${cleanDoc}.`);
      return;
    }

    onStartExam(
      {
        docType,
        docNumber: cleanDoc,
        fullName: cleanName,
        email: cleanEmail,
      },
      group,
      difficulty
    );
  };

  return (
    <div className="card-sena">
      <div className="flex items-center justify-between mb-2">
        <span className="label-tag">Registro del Aprendiz</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Oficial SENA
        </span>
      </div>

      <h2 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: 'var(--text-heading)' }}>
        Datos Personales y Grupo
      </h2>
      <p className="text-sm font-medium mb-6" style={{ color: 'var(--text-muted)' }}>
        Ingresa tus credenciales para registrar tu intento en la evaluación de conocimientos del Tecnólogo ADSO.
      </p>

      {errorMsg && (
        <div className="p-3.5 mb-5 rounded-2xl bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Document Row */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>
            Documento de Identidad <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2.5">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-1/3 min-w-[110px] p-3 rounded-2xl border text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-[#008f4c]/30"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-main)',
              }}
            >
              <option value="CC">C.C. (Cédula)</option>
              <option value="TI">T.I. (Tarjeta Identidad)</option>
              <option value="CE">C.E. (Extranjería)</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
            <input
              type="text"
              required
              placeholder="Número de documento"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="flex-1 p-3 rounded-2xl border text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-[#008f4c]/30"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>
            Nombres y Apellidos Completos <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Carlos Andrés Ramírez Salazar"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 rounded-2xl border text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-[#008f4c]/30"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--text-main)',
            }}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>
            Correo Electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="ejemplo@misena.edu.co o tu correo personal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-2xl border text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-[#008f4c]/30"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--text-main)',
            }}
          />
          <p className="text-xs mt-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Sparkles className="w-3.5 h-3.5 text-[#008f4c]" />
            Recibirás una copia certificada con tus respuestas y desglose de resultados en este correo.
          </p>
        </div>

        {/* Group Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>
            Grupo de Evaluación <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(['A', 'B', 'C'] as GroupLetter[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroup(g)}
                className={`p-3 rounded-2xl border font-bold text-sm transition-all cursor-pointer text-center ${
                  group === g
                    ? 'bg-[#008f4c] text-white border-[#008f4c] shadow-md shadow-[#008f4c]/20'
                    : 'border-[var(--input-border)] bg-[var(--input-bg)] hover:border-[#008f4c]'
                }`}
                style={{ color: group === g ? '#ffffff' : 'var(--text-main)' }}
              >
                Grupo {g}
              </button>
            ))}
          </div>
          <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
            {groupDescriptions[group]}
          </p>
        </div>

        {/* Difficulty Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-main)' }}>
            Nivel de Dificultad <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'easy', title: 'Fácil', sub: 'Fundamentos' },
              { id: 'medium', title: 'Intermedio', sub: 'Aplicación' },
              { id: 'hard', title: 'Avanzado', sub: 'Análisis' },
            ].map((diff) => (
              <button
                key={diff.id}
                type="button"
                onClick={() => setDifficulty(diff.id as Difficulty)}
                className={`p-2.5 sm:p-3 rounded-2xl border font-bold text-sm transition-all cursor-pointer text-center ${
                  difficulty === diff.id
                    ? 'bg-[#008f4c] text-white border-[#008f4c] shadow-md shadow-[#008f4c]/20'
                    : 'border-[var(--input-border)] bg-[var(--input-bg)] hover:border-[#008f4c]'
                }`}
                style={{ color: difficulty === diff.id ? '#ffffff' : 'var(--text-main)' }}
              >
                <div>{diff.title}</div>
                <div className="text-[11px] font-normal opacity-80 mt-0.5">{diff.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary-sena w-full mt-2"
        >
          <span>Comenzar Evaluación</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
