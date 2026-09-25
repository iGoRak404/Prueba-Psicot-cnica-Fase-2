-- ============================================================================
-- ESQUEMA DDL SQLITE - SISTEMA DE PRUEBAS PSICOTÉCNICAS
-- Arquitectura de cero bloatware. Tipos estrictos, claves foráneas e índices.
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. Configuración Global del Sistema (Temporizador global, etc.)
CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    timer_enabled INTEGER NOT NULL DEFAULT 1 CHECK (timer_enabled IN (0, 1)),
    time_limit_minutes INTEGER NOT NULL DEFAULT 15 CHECK (time_limit_minutes > 0),
    passing_percentage REAL NOT NULL DEFAULT 70.0 CHECK (passing_percentage >= 0 AND passing_percentage <= 100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Banco de Preguntas
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    group_letter TEXT NOT NULL CHECK (group_letter IN ('A', 'B', 'C', 'D')),
    category TEXT NOT NULL CHECK (category IN ('Lógica', 'Análisis Matemático', 'Comprensión Lectora', 'Psicología')),
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'open_text')),
    points REAL NOT NULL CHECK (points > 0),
    image_url TEXT, -- Contexto multimedia (ej: matrices de Raven, figuras)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Opciones Dinámicas de Preguntas Cerradas
CREATE TABLE IF NOT EXISTS question_options (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    option_key TEXT NOT NULL, -- 'A', 'B', 'C', 'D', 'Verdadero', 'Falso', etc.
    option_text TEXT NOT NULL,
    image_url TEXT,           -- Soporte multimedia para opción gráfica
    is_correct INTEGER NOT NULL DEFAULT 0 CHECK (is_correct IN (0, 1)),
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 4. Candidatos Registrados
CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('C.C.', 'T.I.', 'C.E.', 'Pasaporte')),
    doc_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    group_letter TEXT NOT NULL CHECK (group_letter IN ('A', 'B', 'C', 'D')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Intentos / Evaluaciones del Candidato
-- Estados posibles:
-- 'EN_CURSO'   : Prueba iniciada con temporizador activo.
-- 'EN_REVISION': Fase 1 completada (auto-calificación cerrada lista, esperando calificación abierta).
-- 'APROBADO'   : Fase 2 completada por admin, puntaje >= puntaje mínimo.
-- 'REPROBADO'  : Fase 2 completada por admin (o fase 1 cerrada si no hay abiertas) y puntaje < mínimo.
CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    group_letter TEXT NOT NULL CHECK (group_letter IN ('A', 'B', 'C', 'D')),
    status TEXT NOT NULL CHECK (status IN ('EN_CURSO', 'EN_REVISION', 'APROBADO', 'REPROBADO')),
    closed_score_obtained REAL DEFAULT 0,
    closed_score_total REAL DEFAULT 0,
    open_score_obtained REAL DEFAULT 0,
    open_score_total REAL DEFAULT 0,
    final_percentage REAL DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewer_notes TEXT,
    auto_submitted INTEGER NOT NULL DEFAULT 0 CHECK (auto_submitted IN (0, 1)),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- 6. Respuestas Registradas del Candidato
CREATE TABLE IF NOT EXISTS assessment_answers (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    selected_option_id TEXT, -- Para tipo multiple_choice
    open_answer_text TEXT,   -- Para tipo open_text
    points_awarded REAL DEFAULT 0,
    is_reviewed INTEGER DEFAULT 0 CHECK (is_reviewed IN (0, 1)),
    feedback TEXT,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE SET NULL
);

-- 7. Registro de Auditoría de Correos (Simulación Fase 1 y Fase 2)
CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    phase INTEGER NOT NULL CHECK (phase IN (1, 2)),
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

-- Índices de Rendimiento para Consultas Clave
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_questions_group ON questions(group_letter);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_assessments_candidate ON assessments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_answers_assessment ON assessment_answers(assessment_id);
