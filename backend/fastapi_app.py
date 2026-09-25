"""
SISTEMA DE PRUEBAS PSICOTÉCNICAS - VERSIÓN FASTAPI + SQLITE
Ejecutar con: uvicorn backend.fastapi_app:app --reload --port 8000
"""

import sqlite3
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DB_FILE = os.path.join(os.path.dirname(__file__), "psychotest.db")

app = FastAPI(
    title="Sistema de Pruebas Psicotécnicas (FastAPI + SQLite)",
    description="Motor de alto rendimiento para gestión, evaluación en dos fases y anti-cheat."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

# Modelos Pydantic
class CandidateRegisterRequest(BaseModel):
    doc_type: str
    doc_number: str
    full_name: str
    email: str
    group_letter: str

class AnswerSubmission(BaseModel):
    question_id: str
    selected_option_id: Optional[str] = None
    open_text: Optional[str] = None

class ExamSubmitRequest(BaseModel):
    candidate_id: str
    answers: List[AnswerSubmission]
    auto_submitted: Optional[bool] = False

class GradeItem(BaseModel):
    answer_id: str
    points_awarded: float
    feedback: Optional[str] = ""

class ManualGradeRequest(BaseModel):
    assessment_id: str
    verdict: str # 'APROBADO' o 'REPROBADO'
    grades: List[GradeItem]
    reviewer_notes: Optional[str] = ""

class QuestionOptionModel(BaseModel):
    option_key: str
    option_text: str
    image_url: Optional[str] = None
    is_correct: bool

class QuestionCreateModel(BaseModel):
    id: Optional[str] = None
    group_letter: str
    category: str
    question_text: str
    question_type: str # 'multiple_choice' o 'open_text'
    points: float
    image_url: Optional[str] = None
    options: Optional[List[QuestionOptionModel]] = []

class ConfigUpdateModel(BaseModel):
    timer_enabled: bool
    time_limit_minutes: int
    passing_percentage: float

@app.get("/api/config")
def get_config():
    with get_db() as conn:
        row = conn.execute("SELECT * FROM system_config WHERE id = 1").fetchone()
        return dict(row)

@app.post("/api/admin/config")
def update_config(payload: ConfigUpdateModel):
    with get_db() as conn:
        conn.execute("""
            UPDATE system_config
            SET timer_enabled = ?, time_limit_minutes = ?, passing_percentage = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        """, (1 if payload.timer_enabled else 0, payload.time_limit_minutes, payload.passing_percentage))
        conn.commit()
    return {"message": "Configuración actualizada"}

@app.post("/api/candidate/register")
def register_candidate(payload: CandidateRegisterRequest):
    email = payload.email.strip().lower()
    with get_db() as conn:
        # Validación Anti-Cheat
        existing = conn.execute("SELECT id, full_name FROM candidates WHERE email = ?", (email,)).fetchone()
        if existing:
            last_eval = conn.execute(
                "SELECT status FROM assessments WHERE candidate_id = ? ORDER BY started_at DESC LIMIT 1",
                (existing["id"],)
            ).fetchone()
            if last_eval:
                st = last_eval["status"]
                if st == "REPROBADO":
                    raise HTTPException(status_code=403, detail="Prueba no aprobada, no puedes volver a intentarlo")
                elif st == "EN_REVISION":
                    raise HTTPException(status_code=403, detail="Tus resultados finales están en revisión, no es necesario repetir la prueba")
                elif st == "APROBADO":
                    raise HTTPException(status_code=403, detail="Ya has aprobado esta prueba satisfactoriamente.")
            cand_id = existing["id"]
        else:
            cand_id = f"cand_{os.urandom(4).hex()}"
            conn.execute("""
                INSERT INTO candidates (id, doc_type, doc_number, full_name, email, group_letter)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (cand_id, payload.doc_type, payload.doc_number, payload.full_name, email, payload.group_letter))
            conn.commit()

        # Resumen de categorías
        summary = conn.execute("""
            SELECT category, COUNT(*) as question_count, SUM(points) as total_points
            FROM questions WHERE group_letter = ? GROUP BY category
        """, (payload.group_letter,)).fetchall()

        tot_pts = sum(s["total_points"] for s in summary) or 0
        cats = [{
            "category": s["category"],
            "questions": s["question_count"],
            "points": s["total_points"],
            "percentage": round((s["total_points"] / tot_pts * 100), 1) if tot_pts > 0 else 0
        } for s in summary]

        cfg = conn.execute("SELECT * FROM system_config WHERE id = 1").fetchone()
        return {
            "candidate_id": cand_id,
            "full_name": payload.full_name,
            "email": email,
            "group_letter": payload.group_letter,
            "total_points": tot_pts,
            "categories": cats,
            "timer_enabled": bool(cfg["timer_enabled"]),
            "time_limit_minutes": cfg["time_limit_minutes"]
        }

@app.get("/api/exam/questions")
def get_exam_questions(group: str):
    with get_db() as conn:
        q_rows = conn.execute(
            "SELECT id, group_letter, category, question_text, question_type, points, image_url FROM questions WHERE group_letter = ?",
            (group,)
        ).fetchall()
        result = []
        for q in q_rows:
            qd = dict(q)
            opts = conn.execute(
                "SELECT id, option_key, option_text, image_url FROM question_options WHERE question_id = ? ORDER BY option_key",
                (q["id"],)
            ).fetchall()
            qd["options"] = [dict(o) for o in opts]
            result.append(qd)
        return result

@app.post("/api/exam/submit")
def submit_exam(payload: ExamSubmitRequest):
    # Lógica de Fase 1 (Evaluación Automática y Despacho de Correo de Fase 1)
    with get_db() as conn:
        cand = conn.execute("SELECT * FROM candidates WHERE id = ?", (payload.candidate_id,)).fetchone()
        if not cand:
            raise HTTPException(status_code=404, detail="Candidato no encontrado")

        group = cand["group_letter"]
        all_q = conn.execute("SELECT * FROM questions WHERE group_letter = ?", (group,)).fetchall()
        q_map = {q["id"]: dict(q) for q in all_q}
        tot_pts = sum(q["points"] for q in all_q)

        closed_got = 0.0
        closed_tot = 0.0
        open_tot = 0.0
        has_open = False

        for q in all_q:
            if q["question_type"] == "multiple_choice":
                closed_tot += q["points"]
            else:
                open_tot += q["points"]
                has_open = True

        asm_id = f"asm_{os.urandom(4).hex()}"
        for ans in payload.answers:
            if ans.question_id not in q_map:
                continue
            q = q_map[ans.question_id]
            awarded = 0.0
            if q["question_type"] == "multiple_choice" and ans.selected_option_id:
                opt = conn.execute(
                    "SELECT is_correct FROM question_options WHERE id = ? AND question_id = ?",
                    (ans.selected_option_id, ans.question_id)
                ).fetchone()
                if opt and opt["is_correct"] == 1:
                    awarded = float(q["points"])
                    closed_got += awarded

            conn.execute("""
                INSERT INTO assessment_answers (id, assessment_id, question_id, selected_option_id, open_answer_text, points_awarded, is_reviewed)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (f"ans_{os.urandom(4).hex()}", asm_id, ans.question_id, ans.selected_option_id, ans.open_text or "", awarded, 1 if q["question_type"] == "multiple_choice" else 0))

        prelim_pct = round((closed_got / tot_pts * 100), 2) if tot_pts > 0 else 0
        cfg = conn.execute("SELECT passing_percentage FROM system_config WHERE id = 1").fetchone()
        status = "EN_REVISION" if has_open else ("APROBADO" if prelim_pct >= cfg["passing_percentage"] else "REPROBADO")

        conn.execute("""
            INSERT INTO assessments (id, candidate_id, group_letter, status, closed_score_obtained, closed_score_total, open_score_obtained, open_score_total, final_percentage, submitted_at, auto_submitted)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, CURRENT_TIMESTAMP, ?)
        """, (asm_id, payload.candidate_id, group, status, closed_got, closed_tot, open_tot, prelim_pct, 1 if payload.auto_submitted else 0))

        # Despachar Correo Fase 1
        subj = f"[Fase 1] Resultados Preliminares de Prueba Psicotécnica - Grupo {group}"
        body = f"""Estimado(a) {cand['full_name']}: Su prueba fue recibida. Porcentaje preliminar cerrado: {prelim_pct}%. Advertencia: El puntaje está sujeto a revisión manual por preguntas subjetivas/de desarrollo."""
        conn.execute("""
            INSERT INTO email_logs (id, assessment_id, recipient_email, phase, subject, body_html)
            VALUES (?, ?, ?, 1, ?, ?)
        """, (f"eml_{os.urandom(4).hex()}", asm_id, cand["email"], subj, body))

        conn.commit()

        return {
            "assessment_id": asm_id,
            "status": status,
            "preliminary_percentage": prelim_pct,
            "has_open_questions": has_open
        }

@app.post("/api/admin/grade-manual")
def manual_grade(payload: ManualGradeRequest):
    # Lógica de Fase 2 (Calificación de Abiertas y Despacho de Correo de Fase 2)
    with get_db() as conn:
        asm = conn.execute("""
            SELECT a.*, c.full_name, c.email FROM assessments a
            JOIN candidates c ON a.candidate_id = c.id
            WHERE a.id = ?
        """, (payload.assessment_id,)).fetchone()
        if not asm:
            raise HTTPException(status_code=404, detail="Evaluación no encontrada")

        open_got = 0.0
        for g in payload.grades:
            conn.execute("""
                UPDATE assessment_answers SET points_awarded = ?, is_reviewed = 1, feedback = ?
                WHERE id = ? AND assessment_id = ?
            """, (g.points_awarded, g.feedback, g.answer_id, payload.assessment_id))
            open_got += g.points_awarded

        tot_got = asm["closed_score_obtained"] + open_got
        tot_max = asm["closed_score_total"] + asm["open_score_total"]
        final_pct = round((tot_got / tot_max * 100), 2) if tot_max > 0 else 0

        conn.execute("""
            UPDATE assessments
            SET status = ?, open_score_obtained = ?, final_percentage = ?, reviewed_at = CURRENT_TIMESTAMP, reviewer_notes = ?
            WHERE id = ?
        """, (payload.verdict, open_got, final_pct, payload.reviewer_notes, payload.assessment_id))

        subj = f"[Fase 2] Resultados Definitivos: {payload.verdict}"
        body = f"""Estimado(a) {asm['full_name']}: Su calificación definitiva es {final_pct}%. Estado final: {payload.verdict}."""
        conn.execute("""
            INSERT INTO email_logs (id, assessment_id, recipient_email, phase, subject, body_html)
            VALUES (?, ?, ?, 2, ?, ?)
        """, (f"eml_{os.urandom(4).hex()}", payload.assessment_id, asm["email"], subj, body))

        conn.commit()
        return {"status": payload.verdict, "final_percentage": final_pct}
