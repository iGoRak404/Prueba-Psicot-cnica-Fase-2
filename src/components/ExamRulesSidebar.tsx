import React from 'react';
import { ClipboardList, Clock, AlertTriangle, Layers, FileCheck } from 'lucide-react';

export const ExamRulesSidebar: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Structure Card */}
      <div
        className="rounded-3xl p-6 sm:p-7 border"
        style={{
          backgroundColor: 'var(--bg-info)',
          borderColor: 'var(--border-light)',
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-[#008f4c]/10 text-[#008f4c]">
            <ClipboardList className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
            Estructura de la Evaluación
          </h3>
        </div>

        <ul className="space-y-4">
          {[
            {
              step: '1',
              title: 'Fundamentos de Programación',
              desc: 'Variables, estructuras de control, funciones, POO y lógica algorítmica.',
            },
            {
              step: '2',
              title: 'Metodologías Ágiles',
              desc: 'Scrum, Kanban, artefactos, ceremonias y trabajo colaborativo.',
            },
            {
              step: '3',
              title: 'Análisis y Ciencia de Datos',
              desc: 'Tipos de datos, persistencia relacional, modelado y consultas estructuradas.',
            },
            {
              step: '4',
              title: 'Herramientas y Procesos',
              desc: 'Git, control de versiones, CI/CD, testing y buenas prácticas de ingeniería.',
            },
          ].map((item) => (
            <li key={item.step} className="flex gap-3.5 items-start">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5"
                style={{
                  backgroundColor: 'var(--sena-light-green)',
                  color: 'var(--sena-dark-green)',
                }}
              >
                {item.step}
              </span>
              <div>
                <strong className="block text-sm font-bold" style={{ color: 'var(--text-heading)' }}>
                  {item.title}
                </strong>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {item.desc}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Rules Box */}
      <div
        className="rounded-3xl p-6 border"
        style={{
          backgroundColor: 'var(--bg-rules)',
          borderColor: 'var(--border-light)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[#008f4c]" />
          <h3 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>
            Reglas del Examen
          </h3>
        </div>

        <ul className="space-y-3 text-xs sm:text-sm font-medium" style={{ color: 'var(--text-main)' }}>
          <li className="flex gap-2.5 items-start">
            <Clock className="w-4 h-4 text-[#008f4c] shrink-0 mt-0.5" />
            <span>
              <strong>Tiempo límite:</strong> 20 minutos por intento con temporizador en vivo.
            </span>
          </li>
          <li className="flex gap-2.5 items-start">
            <AlertTriangle className="w-4 h-4 text-[#008f4c] shrink-0 mt-0.5" />
            <span>
              <strong>Obligatorio:</strong> Todas las preguntas deben responderse antes del envío.
            </span>
          </li>
          <li className="flex gap-2.5 items-start">
            <Layers className="w-4 h-4 text-[#008f4c] shrink-0 mt-0.5" />
            <span>
              <strong>Niveles:</strong> Banco calibrado para Fácil, Intermedio o Avanzado.
            </span>
          </li>
          <li className="flex gap-2.5 items-start">
            <FileCheck className="w-4 h-4 text-[#008f4c] shrink-0 mt-0.5" />
            <span>
              <strong>Resultados:</strong> Notificación por correo con respuestas certificadas.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
