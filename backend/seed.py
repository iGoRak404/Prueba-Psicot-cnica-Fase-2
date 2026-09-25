#!/usr/bin/env python3
"""
SEMILLA DE DATOS - BANCO DE PREGUNTAS PSICOTÉCNICAS
Inicializa la base de datos SQLite con preguntas reales para Grupos A, B, C y D.
Incluye soporte multimedia SVG embebido, opciones dinámicas y preguntas de desarrollo.
"""

import os
import sqlite3

DB_FILE = os.path.join(os.path.dirname(__file__), "psychotest.db")
SCHEMA_FILE = os.path.join(os.path.dirname(__file__), "schema.sql")

# Matriz SVG de prueba psicológica Raven (Cuadrícula 3x3 lógica)
RAVEN_SVG = (
    "data:image/svg+xml;utf8,"
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='100%' height='100%'>"
    "<rect width='300' height='300' fill='%23f8fafc' rx='8'/>"
    "<grid stroke='%23cbd5e1' stroke-width='2'>"
    "<line x1='100' y1='10' x2='100' y2='290'/>"
    "<line x1='200' y1='10' x2='200' y2='290'/>"
    "<line x1='10' y1='100' x2='290' y2='100'/>"
    "<line x1='10' y1='200' x2='290' y2='200'/>"
    "</grid>"
    "<circle cx='50' cy='50' r='20' fill='%232563eb'/>"
    "<circle cx='150' cy='50' r='20' fill='%232563eb'/><circle cx='150' cy='50' r='8' fill='%23ffffff'/>"
    "<circle cx='250' cy='50' r='20' fill='%232563eb'/><circle cx='250' cy='50' r='14' fill='%23ffffff'/>"
    "<rect x='30' y='130' width='40' height='40' fill='%23059669'/>"
    "<rect x='130' y='130' width='40' height='40' fill='%23059669'/><circle cx='150' cy='150' r='10' fill='%23ffffff'/>"
    "<rect x='230' y='130' width='40' height='40' fill='%23059669'/><circle cx='250' cy='150' r='16' fill='%23ffffff'/>"
    "<polygon points='50,225 30,265 70,265' fill='%23d97706'/>"
    "<polygon points='150,225 130,265 170,265' fill='%23d97706'/><circle cx='150' cy='250' r='6' fill='%23ffffff'/>"
    "<rect x='220' y='220' width='60' height='60' fill='%23e2e8f0' stroke='%2394a3b8' stroke-dasharray='4' rx='4'/>"
    "<text x='250' y='258' font-size='28' font-family='sans-serif' font-weight='bold' fill='%2364748b' text-anchor='middle'>?</text>"
    "</svg>"
)

ROTA_SVG = (
    "data:image/svg+xml;utf8,"
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 100'>"
    "<rect width='240' height='100' fill='%23f1f5f9' rx='6'/>"
    "<path d='M20 50 L50 20 L50 40 L90 40 L90 60 L50 60 L50 80 Z' fill='%233b82f6'/>"
    "<text x='110' y='58' font-size='24' font-weight='bold' fill='%2364748b'>➔ ?</text>"
    "</svg>"
)

SAMPLE_QUESTIONS = [
    # GRUPO A
    {
        "id": "qa_log_01",
        "group_letter": "A",
        "category": "Lógica",
        "question_text": "¿Cuál es el número que sigue en la serie: 2, 6, 12, 20, 30, ...?",
        "question_type": "multiple_choice",
        "points": 5.0,
        "image_url": None,
        "options": [
            {"key": "A", "text": "40", "is_correct": 0},
            {"key": "B", "text": "42 (+12 respecto a 30)", "is_correct": 1},
            {"key": "C", "text": "44", "is_correct": 0},
            {"key": "D", "text": "48", "is_correct": 0}
        ]
    },
    {
        "id": "qa_mat_02",
        "group_letter": "A",
        "category": "Análisis Matemático",
        "question_text": "Un operario ensambla 15 piezas en 45 minutos. Manteniendo el mismo ritmo, ¿cuántas piezas completará en una jornada de 4 horas continuas?",
        "question_type": "multiple_choice",
        "points": 5.0,
        "image_url": None,
        "options": [
            {"key": "A", "text": "60 piezas", "is_correct": 0},
            {"key": "B", "text": "80 piezas (1 pieza cada 3 min -> 240 min / 3)", "is_correct": 1},
            {"key": "C", "text": "90 piezas", "is_correct": 0},
            {"key": "D", "text": "100 piezas", "is_correct": 0}
        ]
    },
    {
        "id": "qa_lec_03",
        "group_letter": "A",
        "category": "Comprensión Lectora",
        "question_text": "Lectura técnica: 'La redundancia activa en sistemas de control no garantiza inmunidad frente a fallos de causa común, pero mitiga contingencias transitorias de hardware independiente'. A partir del texto, se concluye:",
        "question_type": "multiple_choice",
        "points": 5.0,
        "image_url": None,
        "options": [
            {"key": "A", "text": "La redundancia resuelve cualquier clase de error en el sistema.", "is_correct": 0},
            {"key": "B", "text": "Un fallo de causa común puede inhabilitar los subsistemas redundantes simultáneamente.", "is_correct": 1},
            {"key": "C", "text": "El hardware independiente es inmune a contingencias transitorias.", "is_correct": 0}
        ]
    },
    {
        "id": "qa_psi_04",
        "group_letter": "A",
        "category": "Psicología",
        "question_text": "Test de Matrices Progresivas de Comportamiento: Observe la cuadrícula adjunta e identifique el patrón que completa coherentemente el espacio con signo de interrogación.",
        "question_type": "multiple_choice",
        "points": 10.0,
        "image_url": RAVEN_SVG,
        "options": [
            {"key": "A", "text": "Triángulo con punto interior grande", "is_correct": 1},
            {"key": "B", "text": "Cuadrado con cruz interior", "is_correct": 0},
            {"key": "C", "text": "Círculo relleno sin variación", "is_correct": 0},
            {"key": "D", "text": "Rombo sombreado", "is_correct": 0}
        ]
    },
    {
        "id": "qa_psi_open_05",
        "group_letter": "A",
        "category": "Psicología",
        "question_text": "Pregunta de Desarrollo / Juicio Situacional: Describa una situación crítica donde un plazo de entrega inamovible colisionó con un estándar de calidad no negociable. ¿Qué criterio rigió su toma de decisiones y cómo gestionó el impacto con el equipo?",
        "question_type": "open_text",
        "points": 15.0,
        "image_url": None,
        "options": []
    },

    # GRUPO B
    {
        "id": "qb_log_01",
        "group_letter": "B",
        "category": "Lógica",
        "question_text": "Si todos los elementos X son Y, y ningún Y es Z, entonces es rigurosamente cierto que:",
        "question_type": "multiple_choice",
        "points": 5.0,
        "image_url": None,
        "options": [
            {"key": "A", "text": "Ningún X es Z", "is_correct": 1},
            {"key": "B", "text": "Algunos X son Z", "is_correct": 0},
            {"key": "C", "text": "Todos los Z son X", "is_correct": 0},
            {"key": "D", "text": "No se puede inferir relación", "is_correct": 0}
        ]
    },
    {
        "id": "qb_mat_02",
        "group_letter": "B",
        "category": "Análisis Matemático",
        "question_text": "Una inversión rinde un interés simple anual del 8%. ¿En cuántos años se triplicará el capital inicial?",
        "question_type": "multiple_choice",
        "points": 5.0,
        "image_url": None,
        "options": [
            {"key": "A", "text": "12.5 años", "is_correct": 0},
            {"key": "B", "text": "25 años (Ganancia requerida = 200% / 8% anual = 25)", "is_correct": 1},
            {"key": "C", "text": "37.5 años", "is_correct": 0},
            {"key": "D", "text": "30 años", "is_correct": 0}
        ]
    },
    {
        "id": "qb_lec_03",
        "group_letter": "B",
        "category": "Comprensión Lectora",
        "question_text": "Texto: 'El principio de menor privilegio exige que en una organización todo módulo cuente únicamente con el acceso mínimo indispensable para su función legítima'. Afirmación: ¿Conceder accesos de administrador preventivos a todo el equipo de soporte viola este principio?",
        "question_type": "multiple_choice",
        "points": 5.0,
        "image_url": None,
        "options": [
            {"key": "Verdadero", "text": "Verdadero (Infringe directamente el postulado de mínimo acceso necesario)", "is_correct": 1},
            {"key": "Falso", "text": "Falso", "is_correct": 0}
        ]
    },
    {
        "id": "qb_psi_open_04",
        "group_letter": "B",
        "category": "Psicología",
        "question_text": "Pregunta de Desarrollo: Ante un error grave detectado en producción causado directamente por una instrucción ambigua de su superior inmediato, detalle paso a paso cómo abordaría el reporte técnico y la conversación correctiva.",
        "question_type": "open_text",
        "points": 15.0,
        "image_url": None,
        "options": []
    },

    # GRUPO C
    {
        "id": "qc_log_01",
        "group_letter": "C",
        "category": "Lógica",
        "question_text": "Rotación espacial: Observe la flecha base. Si rota 90° en sentido horario y luego se refleja verticalmente, ¿en qué dirección apunta su vértice?",
        "question_type": "multiple_choice",
        "points": 6.0,
        "image_url": ROTA_SVG,
        "options": [
            {"key": "A", "text": "Hacia abajo", "is_correct": 0},
            {"key": "B", "text": "Hacia arriba (Rotación 90° horario apunta abajo; reflejo vertical invierte a arriba)", "is_correct": 1},
            {"key": "C", "text": "Hacia la izquierda", "is_correct": 0},
            {"key": "D", "text": "Hacia la derecha", "is_correct": 0}
        ]
    },
    {
        "id": "qc_mat_02",
        "group_letter": "C",
        "category": "Análisis Matemático",
        "question_text": "¿Cuál es la probabilidad de obtener una suma impar al lanzar dos dados estándar de 6 caras?",
        "question_type": "multiple_choice",
        "points": 6.0,
        "image_url": None,
        "options": [
            {"key": "A", "text": "1/3", "is_correct": 0},
            {"key": "B", "text": "1/2 (18 de 36 combinaciones resultan en suma impar)", "is_correct": 1},
            {"key": "C", "text": "5/12", "is_correct": 0},
            {"key": "D", "text": "7/12", "is_correct": 0}
        ]
    },
    {
        "id": "qc_psi_open_03",
        "group_letter": "C",
        "category": "Psicología",
        "question_text": "Pregunta de Desarrollo: Explique cómo equilibra el rigor metodológico y la rapidez de ejecución cuando trabaja bajo presión temporal extrema. Cite un caso concreto de su experiencia previa.",
        "question_type": "open_text",
        "points": 18.0,
        "image_url": None,
        "options": []
    },

    # GRUPO D
    {
        "id": "qd_log_01",
        "group_letter": "D",
        "category": "Lógica",
        "question_text": "En un grupo de 50 profesionales, 30 dominan Python, 25 dominan C, y 10 dominan ambos lenguajes. ¿Cuántos no dominan ninguno de los dos?",
        "question_type": "multiple_choice",
        "points": 8.0,
        "image_url": None,
        "options": [
            {"key": "A", "text": "3", "is_correct": 0},
            {"key": "B", "text": "5 (Unión = 30 + 25 - 10 = 45; Restantes = 50 - 45)", "is_correct": 1},
            {"key": "C", "text": "8", "is_correct": 0},
            {"key": "D", "text": "10", "is_correct": 0}
        ]
    },
    {
        "id": "qd_psi_open_02",
        "group_letter": "D",
        "category": "Psicología",
        "question_text": "Pregunta de Desarrollo: Ante la renuncia intempestiva del referente técnico de un proyecto crítico a dos semanas del despliegue, detalle su plan de contingencia para asumir la brecha operativa sin desestabilizar las metas establecidas.",
        "question_type": "open_text",
        "points": 22.0,
        "image_url": None,
        "options": []
    }
]

def seed():
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    
    conn = sqlite3.connect(DB_FILE)
    conn.execute("PRAGMA foreign_keys = ON;")
    
    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        conn.executescript(f.read())

    # Configuración por defecto: 15 min de temporizador global, 70% puntaje aprobatorio
    conn.execute("""
        INSERT INTO system_config (id, timer_enabled, time_limit_minutes, passing_percentage)
        VALUES (1, 1, 15, 70.0)
    """)

    # Insertar candidatos de prueba para verificar Anti-Cheat inmediatamente
    # Candidato 1: Reprobado (debe bloquearse: "Prueba no aprobada, no puedes volver a intentarlo")
    conn.execute("""
        INSERT INTO candidates (id, doc_type, doc_number, full_name, email, group_letter)
        VALUES ('cand_reprobado', 'C.C.', '1020304050', 'Carlos Méndez (Caso Reprobado)', 'reprobado@ejemplo.com', 'A')
    """)
    conn.execute("""
        INSERT INTO assessments (id, candidate_id, group_letter, status, closed_score_obtained, closed_score_total, open_score_obtained, open_score_total, final_percentage, submitted_at, reviewed_at)
        VALUES ('asm_rep', 'cand_reprobado', 'A', 'REPROBADO', 10, 25, 5, 15, 37.5, datetime('now', '-2 days'), datetime('now', '-1 day'))
    """)

    # Candidato 2: En Revisión (debe bloquearse: "Tus resultados finales están en revisión, no es necesario repetir la prueba")
    conn.execute("""
        INSERT INTO candidates (id, doc_type, doc_number, full_name, email, group_letter)
        VALUES ('cand_revision', 'C.C.', '9876543210', 'Diana Morales (Caso En Revisión)', 'revision@ejemplo.com', 'A')
    """)
    conn.execute("""
        INSERT INTO assessments (id, candidate_id, group_letter, status, closed_score_obtained, closed_score_total, open_score_obtained, open_score_total, final_percentage, submitted_at)
        VALUES ('asm_rev', 'cand_revision', 'A', 'EN_REVISION', 20, 25, 0, 15, 50.0, datetime('now', '-1 hour'))
    """)

    # Insertar preguntas y opciones
    for q in SAMPLE_QUESTIONS:
        conn.execute("""
            INSERT INTO questions (id, group_letter, category, question_text, question_type, points, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (q["id"], q["group_letter"], q["category"], q["question_text"], q["question_type"], q["points"], q["image_url"]))

        for opt in q.get("options", []):
            opt_id = f"opt_{q['id']}_{opt['key']}"
            conn.execute("""
                INSERT INTO question_options (id, question_id, option_key, option_text, image_url, is_correct)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (opt_id, q["id"], opt["key"], opt["text"], opt.get("image_url"), opt["is_correct"]))

    # Insertar respuesta de ejemplo para cand_revision para probar bandeja del admin
    conn.execute("""
        INSERT INTO assessment_answers (id, assessment_id, question_id, selected_option_id, open_answer_text, points_awarded, is_reviewed)
        VALUES ('ans_rev_1', 'asm_rev', 'qa_psi_open_05', NULL,
        'En mi anterior proyecto nos exigieron adelantar un despliegue de seguridad con 48h de anticipación. Priorizamos auditoría estricta de dependencias críticas y postergamos módulos cosméticos de UI, logrando 0 vulnerabilidades con aprobación del CTO.',
        0, 0)
    """)

    conn.commit()
    conn.close()
    print("[Torvalds Seed] Base de datos SQLite 'psychotest.db' poblada con éxito.")

if __name__ == "__main__":
    seed()
