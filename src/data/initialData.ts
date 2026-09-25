import { Candidate, Assessment, Question, SystemConfig, EmailLog, RetryRequest } from '../types';

export const RAVEN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <rect width="300" height="300" fill="#f8fafc" rx="8" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="100" y1="10" x2="100" y2="290" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="200" y1="10" x2="200" y2="290" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="10" y1="100" x2="290" y2="100" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="10" y1="200" x2="290" y2="200" stroke="#cbd5e1" stroke-width="2"/>
  <!-- Fila 1: Círculos con centros incrementales -->
  <circle cx="50" cy="50" r="22" fill="#2563eb"/>
  <circle cx="150" cy="50" r="22" fill="#2563eb"/><circle cx="150" cy="50" r="8" fill="#ffffff"/>
  <circle cx="250" cy="50" r="22" fill="#2563eb"/><circle cx="250" cy="50" r="14" fill="#ffffff"/>
  <!-- Fila 2: Cuadrados con centros concéntricos -->
  <rect x="28" y="128" width="44" height="44" fill="#059669" rx="4"/>
  <rect x="128" y="128" width="44" height="44" fill="#059669" rx="4"/><circle cx="150" cy="150" r="10" fill="#ffffff"/>
  <rect x="228" y="128" width="44" height="44" fill="#059669" rx="4"/><circle cx="250" cy="150" r="16" fill="#ffffff"/>
  <!-- Fila 3: Triángulos y elemento incógnita -->
  <polygon points="50,225 28,268 72,268" fill="#d97706"/>
  <polygon points="150,225 128,268 172,268" fill="#d97706"/><circle cx="150" cy="254" r="8" fill="#ffffff"/>
  <rect x="215" y="215" width="70" height="70" fill="#e2e8f0" stroke="#94a3b8" stroke-dasharray="4" rx="6"/>
  <text x="250" y="260" font-size="34" font-family="sans-serif" font-weight="bold" fill="#475569" text-anchor="middle">?</text>
</svg>
`);

export const SPATIAL_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90" width="100%" height="100%">
  <rect width="260" height="90" fill="#f1f5f9" rx="8"/>
  <path d="M20 45 L50 20 L50 35 L90 35 L90 55 L50 55 L50 70 Z" fill="#3b82f6"/>
  <text x="110" y="52" font-size="20" font-weight="bold" fill="#64748b" font-family="sans-serif">Rotar 90° ➔ ?</text>
</svg>
`);

export const INITIAL_CONFIG: SystemConfig = {
  timer_enabled: true,
  time_limit_minutes: 10,
  passing_percentage: 70.0,
  admin_username: 'admin',
  admin_password: 'admin123',
  admin_email: 'admin@psicotest.com',
};

export const INITIAL_QUESTIONS: Question[] = [
  // GRUPO A
  {
    id: 'qa_log_01',
    group_letter: 'A',
    category: 'Lógica',
    question_text: '¿Cuál es el número que continúa lógicamente en la serie secuencial: 2, 6, 12, 20, 30, ...?',
    question_type: 'multiple_choice',
    points: 5.0,
    options: [
      { id: 'opt_qa_1_a', option_key: 'A', option_text: '40', is_correct: false },
      { id: 'opt_qa_1_b', option_key: 'B', option_text: '42 (La diferencia incrementa de 2 en 2: +4, +6, +8, +10, +12)', is_correct: true },
      { id: 'opt_qa_1_c', option_key: 'C', option_text: '44', is_correct: false },
      { id: 'opt_qa_1_d', option_key: 'D', option_text: '48', is_correct: false },
    ],
  },
  {
    id: 'qa_mat_02',
    group_letter: 'A',
    category: 'Análisis Matemático',
    question_text: 'Un operario calificado ensambla 15 componentes en 45 minutos. Manteniendo una tasa de rendimiento constante, ¿cuántos componentes completará en una jornada de 4 horas continuas?',
    question_type: 'multiple_choice',
    points: 5.0,
    options: [
      { id: 'opt_qa_2_a', option_key: 'A', option_text: '60 componentes', is_correct: false },
      { id: 'opt_qa_2_b', option_key: 'B', option_text: '80 componentes (1 pieza cada 3 min; 240 minutos / 3 = 80)', is_correct: true },
      { id: 'opt_qa_2_c', option_key: 'C', option_text: '90 componentes', is_correct: false },
      { id: 'opt_qa_2_d', option_key: 'D', option_text: '100 componentes', is_correct: false },
    ],
  },
  {
    id: 'qa_lec_03',
    group_letter: 'A',
    category: 'Comprensión Lectora',
    question_text: 'Texto técnico: "La redundancia modular activa en subsistemas de control no garantiza inmunidad frente a anomalías de causa común, pero mitiga contingentemente fallos por desgaste de hardware desacoplado". A partir del texto, se infiere necesariamente:',
    question_type: 'multiple_choice',
    points: 5.0,
    options: [
      { id: 'opt_qa_3_a', option_key: 'A', option_text: 'La redundancia elimina cualquier riesgo de interrupción operativa.', is_correct: false },
      { id: 'opt_qa_3_b', option_key: 'B', option_text: 'Un fallo de causa común puede anular simultáneamente los subsistemas redundantes.', is_correct: true },
      { id: 'opt_qa_3_c', option_key: 'C', option_text: 'El hardware desacoplado es invulnerable a anomalías operativas.', is_correct: false },
    ],
  },
  {
    id: 'qa_psi_04',
    group_letter: 'A',
    category: 'Psicología',
    question_text: 'Prueba de Razonamiento No Verbal (Matrices Progresivas): Examine la cuadrícula matricial adjunta y determine qué figura completa de manera unívoca la posición marcada con signo de interrogación.',
    question_type: 'multiple_choice',
    points: 10.0,
    image_url: RAVEN_SVG,
    options: [
      { id: 'opt_qa_4_a', option_key: 'A', option_text: 'Triángulo equilátero con orificio blanco interior grande', is_correct: true },
      { id: 'opt_qa_4_b', option_key: 'B', option_text: 'Cuadrado verde con cruz diagonal', is_correct: false },
      { id: 'opt_qa_4_c', option_key: 'C', option_text: 'Círculo azul sin variación interna', is_correct: false },
      { id: 'opt_qa_4_d', option_key: 'D', option_text: 'Rombo sombreado con bordes dentados', is_correct: false },
    ],
  },
  {
    id: 'qa_psi_open_05',
    group_letter: 'A',
    category: 'Psicología',
    question_text: 'Pregunta de Desarrollo / Juicio Situacional: Detalle una experiencia laboral concreta donde un plazo de entrega inamovible colisionó directamente con un estándar de calidad o seguridad crítico. Explique qué criterio rigió su decisión final y cómo gestionó el impacto con las partes interesadas.',
    question_type: 'open_text',
    points: 15.0,
    options: [],
  },

  // GRUPO B
  {
    id: 'qb_log_01',
    group_letter: 'B',
    category: 'Lógica',
    question_text: 'Premisa 1: Todos los procesos clase Alfa son de alta prioridad. Premisa 2: Ningún proceso de alta prioridad tolera latencia arbitraria. Conclusión lógica rigurosa:',
    question_type: 'multiple_choice',
    points: 6.0,
    options: [
      { id: 'opt_qb_1_a', option_key: 'A', option_text: 'Ningún proceso clase Alfa tolera latencia arbitraria', is_correct: true },
      { id: 'opt_qb_1_b', option_key: 'B', option_text: 'Algunos procesos clase Alfa toleran latencia', is_correct: false },
      { id: 'opt_qb_1_c', option_key: 'C', option_text: 'Todos los procesos tolerantes a latencia son clase Alfa', is_correct: false },
    ],
  },
  {
    id: 'qb_mat_02',
    group_letter: 'B',
    category: 'Análisis Matemático',
    question_text: 'Un activo financiero genera un rendimiento simple anual del 8%. ¿En cuántos años se triplicará exactamente el capital depositado inicialmente?',
    question_type: 'multiple_choice',
    points: 6.0,
    options: [
      { id: 'opt_qb_2_a', option_key: 'A', option_text: '12.5 años', is_correct: false },
      { id: 'opt_qb_2_b', option_key: 'B', option_text: '25 años (Ganancia requerida = 200% del capital inicial; 200 / 8 = 25)', is_correct: true },
      { id: 'opt_qb_2_c', option_key: 'C', option_text: '37.5 años', is_correct: false },
      { id: 'opt_qb_2_d', option_key: 'D', option_text: '30 años', is_correct: false },
    ],
  },
  {
    id: 'qb_lec_03',
    group_letter: 'B',
    category: 'Comprensión Lectora',
    question_text: 'Principio de Menor Privilegio: "Cada entidad operativa debe poseer exclusivamente los derechos mínimos necesarios para cumplir su función específica". Afirmación: ¿Conceder accesos de administrador preventivos al personal de guardia sin ticket activo infringe este principio?',
    question_type: 'multiple_choice',
    points: 5.0,
    options: [
      { id: 'opt_qb_3_v', option_key: 'Verdadero', option_text: 'Verdadero (Concede permisos excedentes innecesarios sin justificación operativa vigente)', is_correct: true },
      { id: 'opt_qb_3_f', option_key: 'Falso', option_text: 'Falso (Es una previsión admisible)', is_correct: false },
    ],
  },
  {
    id: 'qb_psi_open_04',
    group_letter: 'B',
    category: 'Psicología',
    question_text: 'Pregunta de Desarrollo: Ante la detección de una falla severa provocada por una directriz ambigua de su superior jerárquico, describa la secuencia de pasos técnicos y comunicacionales que implementaría para solucionar el incidente sin eludir responsabilidades compartidas.',
    question_type: 'open_text',
    points: 15.0,
    options: [],
  },

  // GRUPO C
  {
    id: 'qc_log_01',
    group_letter: 'C',
    category: 'Lógica',
    question_text: 'Aptitud Espacial: La figura base indica un vector directriz. Si se rota 90° en sentido horario y seguidamente se aplica una reflexión axial vertical, ¿cuál es su orientación resultante?',
    question_type: 'multiple_choice',
    points: 6.0,
    image_url: SPATIAL_SVG,
    options: [
      { id: 'opt_qc_1_a', option_key: 'A', option_text: 'Vértice orientado hacia abajo', is_correct: false },
      { id: 'opt_qc_1_b', option_key: 'B', option_text: 'Vértice orientado hacia arriba (Giro horario apunta abajo; reflexión vertical invierte hacia arriba)', is_correct: true },
      { id: 'opt_qc_1_c', option_key: 'C', option_text: 'Vértice orientado hacia la izquierda', is_correct: false },
      { id: 'opt_qc_1_d', option_key: 'D', option_text: 'Vértice orientado hacia la derecha', is_correct: false },
    ],
  },
  {
    id: 'qc_mat_02',
    group_letter: 'C',
    category: 'Análisis Matemático',
    question_text: 'Al lanzar simultáneamente dos dados regulares estándar de 6 caras numeradas del 1 al 6, ¿cuál es la probabilidad exacta de que la suma de sus caras superiores sea un número impar?',
    question_type: 'multiple_choice',
    points: 6.0,
    options: [
      { id: 'opt_qc_2_a', option_key: 'A', option_text: '1/3 (33.3%)', is_correct: false },
      { id: 'opt_qc_2_b', option_key: 'B', option_text: '1/2 (50.0% - 18 de las 36 parejas posibles suman impar)', is_correct: true },
      { id: 'opt_qc_2_c', option_key: 'C', option_text: '5/12 (41.6%)', is_correct: false },
      { id: 'opt_qc_2_d', option_key: 'D', option_text: '7/12 (58.3%)', is_correct: false },
    ],
  },
  {
    id: 'qc_psi_open_03',
    group_letter: 'C',
    category: 'Psicología',
    question_text: 'Pregunta de Desarrollo: Explique cómo equilibra la exigencia de rigor analítico con la velocidad de ejecución cuando se encuentra bajo una ventana de tiempo altamente restringida.',
    question_type: 'open_text',
    points: 18.0,
    options: [],
  },

  // GRUPO D
  {
    id: 'qd_log_01',
    group_letter: 'D',
    category: 'Lógica',
    question_text: 'Teoría de Conjuntos: De un grupo de 50 ingenieros, 30 dominan Python, 25 dominan lenguaje C, y 10 dominan ambos lenguajes. ¿Cuántos ingenieros no dominan ninguno de estos dos lenguajes?',
    question_type: 'multiple_choice',
    points: 8.0,
    options: [
      { id: 'opt_qd_1_a', option_key: 'A', option_text: '3 ingenieros', is_correct: false },
      { id: 'opt_qd_1_b', option_key: 'B', option_text: '5 ingenieros (Unión = 30 + 25 - 10 = 45; Restantes = 50 - 45 = 5)', is_correct: true },
      { id: 'opt_qd_1_c', option_key: 'C', option_text: '8 ingenieros', is_correct: false },
      { id: 'opt_qd_1_d', option_key: 'D', option_text: '10 ingenieros', is_correct: false },
    ],
  },
  {
    id: 'qd_psi_open_02',
    group_letter: 'D',
    category: 'Psicología',
    question_text: 'Pregunta de Desarrollo: Ante la deserción imprevista de un líder de proyecto crítico a dos semanas de la fecha límite de entrega, presente su protocolo de emergencia para redistribuir cargas sin degradar la moral del equipo.',
    question_type: 'open_text',
    points: 20.0,
    options: [],
  },
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand_reprobado',
    doc_type: 'C.C.',
    doc_number: '1020304050',
    full_name: 'Carlos Andrés Méndez (Caso Reprobado)',
    email: 'reprobado@ejemplo.com',
    group_letter: 'A',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'cand_revision',
    doc_type: 'C.C.',
    doc_number: '9876543210',
    full_name: 'Diana Patricia Morales (Caso En Revisión)',
    email: 'revision@ejemplo.com',
    group_letter: 'A',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'cand_aprobado',
    doc_type: 'C.E.',
    doc_number: '5544332211',
    full_name: 'Alejandro Restrepo (Caso Aprobado)',
    email: 'aprobado@ejemplo.com',
    group_letter: 'B',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: 'asm_rep_01',
    candidate_id: 'cand_reprobado',
    group_letter: 'A',
    status: 'REPROBADO',
    closed_score_obtained: 10,
    closed_score_total: 25,
    open_score_obtained: 4,
    open_score_total: 15,
    final_percentage: 35.0,
    started_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    submitted_at: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    reviewer_notes: 'Rendimiento deficiente en análisis matemático y argumentación situacional insuficiente.',
    auto_submitted: true,
    answers: [
      { question_id: 'qa_log_01', selected_option_id: 'opt_qa_1_a', points_awarded: 0 },
      { question_id: 'qa_mat_02', selected_option_id: 'opt_qa_2_b', points_awarded: 5 },
      { question_id: 'qa_lec_03', selected_option_id: 'opt_qa_3_b', points_awarded: 5 },
      { question_id: 'qa_psi_04', selected_option_id: 'opt_qa_4_b', points_awarded: 0 },
      {
        question_id: 'qa_psi_open_05',
        open_text: 'Hice lo que pude con el tiempo que tenía.',
        points_awarded: 4,
        feedback: 'Falta fundamentación metodológica y gestión de contingencias.',
      },
    ],
  },
  {
    id: 'asm_rev_02',
    candidate_id: 'cand_revision',
    group_letter: 'A',
    status: 'EN_REVISION',
    closed_score_obtained: 20,
    closed_score_total: 25,
    open_score_obtained: 0,
    open_score_total: 15,
    final_percentage: 50.0,
    started_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    submitted_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    auto_submitted: false,
    answers: [
      { question_id: 'qa_log_01', selected_option_id: 'opt_qa_1_b', points_awarded: 5 },
      { question_id: 'qa_mat_02', selected_option_id: 'opt_qa_2_b', points_awarded: 5 },
      { question_id: 'qa_lec_03', selected_option_id: 'opt_qa_3_b', points_awarded: 5 },
      { question_id: 'qa_psi_04', selected_option_id: 'opt_qa_4_a', points_awarded: 5 },
      {
        question_id: 'qa_psi_open_05',
        open_text:
          'En mi gestión previa como líder de turno técnico, tuvimos un requerimiento de entrega con 48h de anticipación. Convoqué al comité de crisis, definimos el núcleo mínimo no negociable (seguridad de datos y pruebas unitarias completas) y aislamos los módulos secundarios de reporte para una segunda fase. Logramos 100% de operatividad en producción sin degradación técnica.',
        points_awarded: 0,
      },
    ],
  },
  {
    id: 'asm_apr_03',
    candidate_id: 'cand_aprobado',
    group_letter: 'B',
    status: 'APROBADO',
    closed_score_obtained: 17,
    closed_score_total: 17,
    open_score_obtained: 14,
    open_score_total: 15,
    final_percentage: 96.8,
    started_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    submitted_at: new Date(Date.now() - 86400000 * 5 + 1200000).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    reviewer_notes: 'Excelente precisión lógica y madurez en resolución de dilemas técnicos.',
    auto_submitted: false,
    answers: [],
  },
];

export const INITIAL_EMAIL_LOGS: EmailLog[] = [
  {
    id: 'eml_p1_rev',
    assessment_id: 'asm_rev_02',
    recipient_email: 'revision@ejemplo.com',
    recipient_name: 'Diana Patricia Morales',
    phase: 1,
    subject: '[Fase 1] Resultados Preliminares de Prueba Psicotécnica - Grupo A',
    body_html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #0f172a; line-height: 1.6;">
        <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px;">
          <span style="background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 12px; padding: 4px 8px; border-radius: 4px;">FASE 1: AUTOMÁTICA</span>
          <h2 style="margin: 8px 0 0 0; color: #0f172a; font-size: 20px;">Evaluación Preliminar Registrada</h2>
        </div>
        <p>Estimado(a) <strong>Diana Patricia Morales</strong>,</p>
        <p>Su prueba para el <strong>Grupo A</strong> ha sido recibida satisfactoriamente.</p>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0284c7; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 0; font-size: 15px; color: #475569;">Porcentaje preliminar obtenido (Preguntas cerradas):</p>
          <p style="margin: 4px 0 0 0; font-size: 26px; font-weight: 800; color: #0f172a;">80.0% <span style="font-size: 14px; font-weight: 500; color: #64748b;">(20.0 / 25.0 pts de preguntas cerradas)</span></p>
        </div>
        <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 14px; margin: 16px 0;">
          <p style="margin: 0; color: #92400e; font-weight: 700; font-size: 14px;">
            ⚠️ ADVERTENCIA DE EVALUACIÓN:
          </p>
          <p style="margin: 6px 0 0 0; color: #b45309; font-size: 14px;">
            El puntaje está sujeto a revisión manual por preguntas subjetivas/de desarrollo. Su calificación final se actualizará una vez el comité evaluador dictamine las respuestas abiertas.
          </p>
        </div>
        <p style="color: #64748b; font-size: 13px; margin-top: 24px;">Sistema de Pruebas Psicotécnicas • Despacho automatizado transaccional.</p>
      </div>
    `,
    sent_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    status_verdict: 'EN_REVISION',
  },
  {
    id: 'eml_p2_apr',
    assessment_id: 'asm_apr_03',
    recipient_email: 'aprobado@ejemplo.com',
    recipient_name: 'Alejandro Restrepo',
    phase: 2,
    subject: '[Fase 2] Resultados Definitivos de Prueba Psicotécnica: APROBADO',
    body_html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #0f172a; line-height: 1.6;">
        <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px;">
          <span style="background: #dcfce7; color: #15803d; font-weight: 700; font-size: 12px; padding: 4px 8px; border-radius: 4px;">FASE 2: DEFINITIVA</span>
          <h2 style="margin: 8px 0 0 0; color: #0f172a; font-size: 20px;">Dictamen Oficial de Selección</h2>
        </div>
        <p>Estimado(a) <strong>Alejandro Restrepo</strong>,</p>
        <p>El comité técnico ha concluido la revisión de sus respuestas abiertas y consolidado su evaluación psicotécnica.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 5px solid #16a34a; padding: 18px; border-radius: 6px; margin: 16px 0;">
          <span style="display: inline-block; background: #16a34a; color: #ffffff; font-weight: 800; font-size: 14px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">
            ESTADO: APROBADO
          </span>
          <p style="margin: 12px 0 0 0; font-size: 28px; font-weight: 900; color: #14532d;">96.8%</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534;">Puntaje consolidado (Preguntas cerradas y abiertas evaluadas).</p>
        </div>
        <p><strong>Observación del evaluador:</strong> Excelente precisión lógica y madurez en resolución de dilemas técnicos.</p>
        <p style="color: #64748b; font-size: 13px; margin-top: 24px;">Sistema de Pruebas Psicotécnicas • Despacho oficial de talento humano.</p>
      </div>
    `,
    sent_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    status_verdict: 'APROBADO',
  },
];

export const INITIAL_RETRY_REQUESTS: RetryRequest[] = [
  {
    id: 'req_rep_01',
    candidate_id: 'cand_reprobado',
    candidate_name: 'Carlos Andrés Méndez',
    candidate_email: 'reprobado@ejemplo.com',
    group_letter: 'A',
    assessment_id: 'asm_rep_01',
    reason: 'Presenté una interrupción de conectividad durante la resolución de las preguntas abiertas. Solicito atentamente la oportunidad de repetir la prueba.',
    status: 'PENDIENTE',
    requested_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];
