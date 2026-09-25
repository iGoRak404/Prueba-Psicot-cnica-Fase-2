#!/usr/bin/env python3
"""
SISTEMA DE PRUEBAS PSICOTÉCNICAS - BACKEND PURO PYTHON + SQLITE
Filosofía Linus Torvalds: Cero bloatware, cero dependencias pesadas de pip.
Funciona directamente con la biblioteca estándar de Python (sqlite3 + http.server).
"""

import json
import os
import re
import sqlite3
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(__file__), "psychotest.db")
SCHEMA_FILE = os.path.join(os.path.dirname(__file__), "schema.sql")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    with get_db() as conn:
        with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
            conn.executescript(f.read())
        # Asegurar configuración inicial
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM system_config WHERE id = 1")
        if cur.fetchone()[0] == 0:
            cur.execute("""
                INSERT INTO system_config (id, timer_enabled, time_limit_minutes, passing_percentage)
                VALUES (1, 1, 15, 70.0)
            """)
        conn.commit()

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class PsychotestHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def _parse_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        raw = self.rfile.read(content_length).decode("utf-8")
        return json.loads(raw)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # 1. Configuración del Sistema
        if path == "/api/config":
            with get_db() as conn:
                row = conn.execute("SELECT * FROM system_config WHERE id = 1").fetchone()
                return self._send_json(200, dict(row))

        # 2. Banco de Preguntas (filtro opcional por grupo o categoría)
        elif path == "/api/questions":
            group = query.get("group", [None])[0]
            category = query.get("category", [None])[0]
            with get_db() as conn:
                sql = "SELECT * FROM questions WHERE 1=1"
                params = []
                if group:
                    sql += " AND group_letter = ?"
                    params.append(group)
                if category:
                    sql += " AND category = ?"
                    params.append(category)
                sql += " ORDER BY category ASC, points DESC"
                q_rows = conn.execute(sql, params).fetchall()

                result = []
                for q in q_rows:
                    q_dict = dict(q)
                    opt_rows = conn.execute(
                        "SELECT id, option_key, option_text, image_url, is_correct FROM question_options WHERE question_id = ? ORDER BY option_key ASC",
                        (q["id"],)
                    ).fetchall()
                    q_dict["options"] = [dict(opt) for opt in opt_rows]
                    result.append(q_dict)
                return self._send_json(200, result)

        # 3. Preguntas para el candidato (SE EXCLUYEN las respuestas correctas)
        elif path == "/api/exam/questions":
            group = query.get("group", [None])[0]
            if not group or group not in ("A", "B", "C", "D"):
                return self._send_json(400, {"error": "Se requiere un grupo válido (A, B, C o D)"})
            with get_db() as conn:
                q_rows = conn.execute(
                    "SELECT id, group_letter, category, question_text, question_type, points, image_url FROM questions WHERE group_letter = ? ORDER BY category, id",
                    (group,)
                ).fetchall()
                result = []
                for q in q_rows:
                    q_dict = dict(q)
                    opts = conn.execute(
                        "SELECT id, option_key, option_text, image_url FROM question_options WHERE question_id = ? ORDER BY option_key",
                        (q["id"],)
                    ).fetchall()
                    q_dict["options"] = [dict(o) for o in opts]
                    result.append(q_dict)
                return self._send_json(200, result)

        # 4. Bandeja de Calificación Manual (Admin)
        elif path == "/api/admin/grading-tray":
            with get_db() as conn:
                assessments = conn.execute("""
                    SELECT a.*, c.full_name, c.email, c.doc_type, c.doc_number
                    FROM assessments a
                    JOIN candidates c ON a.candidate_id = c.id
                    WHERE a.status = 'EN_REVISION'
                    ORDER BY a.submitted_at DESC
                """).fetchall()

                result = []
                for a in assessments:
                    a_dict = dict(a)
                    # Obtener respuestas abiertas
                    open_ans = conn.execute("""
                        SELECT ans.*, q.question_text, q.category, q.points as max_points
                        FROM assessment_answers ans
                        JOIN questions q ON ans.question_id = q.id
                        WHERE ans.assessment_id = ? AND q.question_type = 'open_text'
                    """, (a["id"],)).fetchall()
                    a_dict["open_answers"] = [dict(oa) for oa in open_ans]
                    result.append(a_dict)
                return self._send_json(200, result)

        # 5. Registro de Correos Simulados
        elif path == "/api/admin/emails":
            with get_db() as conn:
                emails = conn.execute("""
                    SELECT e.*, c.full_name, a.group_letter, a.status as assessment_status
                    FROM email_logs e
                    JOIN assessments a ON e.assessment_id = a.id
                    JOIN candidates c ON a.candidate_id = c.id
                    ORDER BY e.sent_at DESC
                """).fetchall()
                return self._send_json(200, [dict(e) for e in emails])

        # 404
        self._send_json(404, {"error": "Endpoint no encontrado"})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. Validación de Registro / Anti-Cheat
        if path == "/api/candidate/register":
            data = self._parse_body()
            doc_type = data.get("doc_type")
            doc_number = str(data.get("doc_number", "")).strip()
            full_name = str(data.get("full_name", "")).strip()
            email = str(data.get("email", "")).strip().lower()
            group_letter = data.get("group_letter")

            if not all([doc_type, doc_number, full_name, email, group_letter]):
                return self._send_json(400, {"error": "Todos los campos de registro son obligatorios"})

            with get_db() as conn:
                # Regla Anti-Cheat: Verificar por correo intentos previos
                existing_candidate = conn.execute(
                    "SELECT id, full_name FROM candidates WHERE email = ?", (email,)
                ).fetchone()

                if existing_candidate:
                    candidate_id = existing_candidate["id"]
                    # Buscar la última evaluación
                    last_eval = conn.execute(
                        "SELECT status, final_percentage FROM assessments WHERE candidate_id = ? ORDER BY started_at DESC LIMIT 1",
                        (candidate_id,)
                    ).fetchone()

                    if last_eval:
                        status = last_eval["status"]
                        if status == "REPROBADO":
                            return self._send_json(403, {
                                "code": "FAILED_ATTEMPT_BLOCKED",
                                "message": "Prueba no aprobada, no puedes volver a intentarlo"
                            })
                        elif status == "EN_REVISION":
                            return self._send_json(403, {
                                "code": "UNDER_REVIEW_BLOCKED",
                                "message": "Tus resultados finales están en revisión, no es necesario repetir la prueba"
                            })
                        elif status == "APROBADO":
                            return self._send_json(403, {
                                "code": "ALREADY_APPROVED",
                                "message": "Ya has aprobado esta prueba satisfactoriamente. No es necesario repetir."
                            })
                else:
                    # Crear nuevo candidato
                    candidate_id = f"cand_{datetime.now().strftime('%Y%m%d%H%M%S')}_{os.urandom(2).hex()}"
                    conn.execute("""
                        INSERT INTO candidates (id, doc_type, doc_number, full_name, email, group_letter)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (candidate_id, doc_type, doc_number, full_name, email, group_letter))
                    conn.commit()

                # Resumen de categorías y pesos para el Dashboard previo
                summary = conn.execute("""
                    SELECT category, COUNT(*) as question_count, SUM(points) as total_points
                    FROM questions
                    WHERE group_letter = ?
                    GROUP BY category
                """, (group_letter,)).fetchall()

                total_exam_points = sum(r["total_points"] for r in summary) if summary else 0

                categories_breakdown = []
                for s in summary:
                    pct = round((s["total_points"] / total_exam_points * 100), 1) if total_exam_points > 0 else 0
                    categories_breakdown.append({
                        "category": s["category"],
                        "questions": s["question_count"],
                        "points": s["total_points"],
                        "percentage": pct
                    })

                # Obtener configuración de tiempo
                config = conn.execute("SELECT * FROM system_config WHERE id = 1").fetchone()

                return self._send_json(200, {
                    "candidate_id": candidate_id,
                    "full_name": full_name,
                    "email": email,
                    "group_letter": group_letter,
                    "total_points": total_exam_points,
                    "categories": categories_breakdown,
                    "timer_enabled": bool(config["timer_enabled"]),
                    "time_limit_minutes": config["time_limit_minutes"]
                })

        # 2. Envío de Prueba (Fase 1: Evaluación Automática de Cerradas)
        elif path == "/api/exam/submit":
            data = self._parse_body()
            candidate_id = data.get("candidate_id")
            answers = data.get("answers", []) # lista de {question_id, selected_option_id, open_text}
            auto_submitted = int(data.get("auto_submitted", 0))

            if not candidate_id:
                return self._send_json(400, {"error": "Se requiere candidate_id"})

            with get_db() as conn:
                candidate = conn.execute("SELECT * FROM candidates WHERE id = ?", (candidate_id,)).fetchone()
                if not candidate:
                    return self._send_json(404, {"error": "Candidato no encontrado"})

                group_letter = candidate["group_letter"]
                all_questions = conn.execute(
                    "SELECT * FROM questions WHERE group_letter = ?", (group_letter,)
                ).fetchall()

                q_map = {q["id"]: dict(q) for q in all_questions}
                total_possible_score = sum(q["points"] for q in all_questions)

                # Evaluar preguntas cerradas
                closed_obtained = 0.0
                closed_total = 0.0
                open_total = 0.0
                has_open_questions = False

                assessment_id = f"asm_{datetime.now().strftime('%Y%m%d%H%M%S')}_{os.urandom(2).hex()}"

                for q in all_questions:
                    if q["question_type"] == "multiple_choice":
                        closed_total += q["points"]
                    else:
                        open_total += q["points"]
                        has_open_questions = True

                # Procesar respuestas del payload
                for ans in answers:
                    qid = ans.get("question_id")
                    if qid not in q_map:
                        continue
                    q = q_map[qid]
                    selected_opt_id = ans.get("selected_option_id")
                    open_text = ans.get("open_text", "").strip()

                    awarded = 0.0
                    if q["question_type"] == "multiple_choice" and selected_opt_id:
                        # Verificar si la opción es correcta
                        opt = conn.execute(
                            "SELECT is_correct FROM question_options WHERE id = ? AND question_id = ?",
                            (selected_opt_id, qid)
                        ).fetchone()
                        if opt and opt["is_correct"] == 1:
                            awarded = float(q["points"])
                            closed_obtained += awarded

                    ans_id = f"ans_{os.urandom(4).hex()}"
                    conn.execute("""
                        INSERT INTO assessment_answers
                        (id, assessment_id, question_id, selected_option_id, open_answer_text, points_awarded, is_reviewed)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (ans_id, assessment_id, qid, selected_opt_id, open_text, awarded, 1 if q["question_type"] == "multiple_choice" else 0))

                preliminary_percentage = round((closed_obtained / total_possible_score * 100), 2) if total_possible_score > 0 else 0

                # Si tiene preguntas abiertas, entra a EN_REVISION.
                # Si no tiene preguntas abiertas, se emite veredicto inmediato.
                cfg = conn.execute("SELECT passing_percentage FROM system_config WHERE id = 1").fetchone()
                passing_score = cfg["passing_percentage"]

                if has_open_questions:
                    status = "EN_REVISION"
                else:
                    status = "APROBADO" if preliminary_percentage >= passing_score else "REPROBADO"

                conn.execute("""
                    INSERT INTO assessments
                    (id, candidate_id, group_letter, status, closed_score_obtained, closed_score_total,
                     open_score_obtained, open_score_total, final_percentage, submitted_at, auto_submitted)
                    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, CURRENT_TIMESTAMP, ?)
                """, (
                    assessment_id, candidate_id, group_letter, status,
                    closed_obtained, closed_total, open_total, preliminary_percentage, auto_submitted
                ))

                # SIMULACIÓN FASE 1: ENVÍO DE CORREO AUTOMÁTICO
                subject_p1 = f"[Fase 1] Resultados Preliminares de Prueba Psicotécnica - Grupo {group_letter}"
                body_p1 = f"""
                <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
                    <h2 style="color: #0f172a;">Evaluación Integral Preliminar</h2>
                    <p>Estimado(a) <strong>{candidate['full_name']}</strong>,</p>
                    <p>Su prueba ha sido recibida con éxito {'(concluyó por límite de tiempo)' if auto_submitted else ''}.</p>
                    <div style="background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 16px;"><strong>Porcentaje preliminar obtenido (preguntas cerradas):</strong> {preliminary_percentage}%</p>
                        <p style="margin: 5px 0 0 0; color: #475569;">Puntos cerrados: {closed_obtained} / {closed_total} pts.</p>
                    </div>
                    <p style="color: #b45309; font-weight: bold; background: #fef3c7; padding: 12px; border-radius: 6px;">
                        ⚠️ Advertencia: El puntaje está sujeto a revisión manual por preguntas subjetivas/de desarrollo.
                    </p>
                    <p>Una vez el evaluador califique las respuestas abiertas, recibirá un segundo correo con su porcentaje definitivo y veredicto final.</p>
                </div>
                """
                email_id = f"eml_{os.urandom(4).hex()}"
                conn.execute("""
                    INSERT INTO email_logs (id, assessment_id, recipient_email, phase, subject, body_html)
                    VALUES (?, ?, ?, 1, ?, ?)
                """, (email_id, assessment_id, candidate["email"], subject_p1, body_p1))

                conn.commit()

                return self._send_json(200, {
                    "assessment_id": assessment_id,
                    "status": status,
                    "closed_score_obtained": closed_obtained,
                    "closed_score_total": closed_total,
                    "preliminary_percentage": preliminary_percentage,
                    "has_open_questions": has_open_questions,
                    "auto_submitted": bool(auto_submitted),
                    "email_sent": {
                        "phase": 1,
                        "subject": subject_p1,
                        "recipient": candidate["email"]
                    }
                })

        # 3. Fase 2: Calificación Manual y Emisión de Veredicto Definitivo
        elif path == "/api/admin/grade-manual":
            data = self._parse_body()
            assessment_id = data.get("assessment_id")
            verdict = data.get("verdict") # 'APROBADO' o 'REPROBADO'
            grades = data.get("grades", []) # [{answer_id, points_awarded, feedback}]
            reviewer_notes = data.get("reviewer_notes", "")

            if not assessment_id or verdict not in ("APROBADO", "REPROBADO"):
                return self._send_json(400, {"error": "assessment_id y veredicto (APROBADO/REPROBADO) son obligatorios"})

            with get_db() as conn:
                asm = conn.execute("""
                    SELECT a.*, c.full_name, c.email
                    FROM assessments a
                    JOIN candidates c ON a.candidate_id = c.id
                    WHERE a.id = ?
                """, (assessment_id,)).fetchone()

                if not asm:
                    return self._send_json(404, {"error": "Evaluación no encontrada"})

                # Actualizar notas de preguntas abiertas
                open_obtained = 0.0
                for g in grades:
                    ans_id = g.get("answer_id")
                    pts = float(g.get("points_awarded", 0))
                    fb = g.get("feedback", "")
                    conn.execute("""
                        UPDATE assessment_answers
                        SET points_awarded = ?, is_reviewed = 1, feedback = ?
                        WHERE id = ? AND assessment_id = ?
                    """, (pts, fb, ans_id, assessment_id))
                    open_obtained += pts

                # Recalcular porcentaje total
                total_obtained = asm["closed_score_obtained"] + open_obtained
                total_max = asm["closed_score_total"] + asm["open_score_total"]
                final_pct = round((total_obtained / total_max * 100), 2) if total_max > 0 else 0

                conn.execute("""
                    UPDATE assessments
                    SET status = ?, open_score_obtained = ?, final_percentage = ?, reviewed_at = CURRENT_TIMESTAMP, reviewer_notes = ?
                    WHERE id = ?
                """, (verdict, open_obtained, final_pct, reviewer_notes, assessment_id))

                # SIMULACIÓN FASE 2: ENVÍO DE CORREO DEFINITIVO
                subject_p2 = f"[Fase 2] Resultados Definitivos de Prueba Psicotécnica: {verdict}"
                status_color = "#16a34a" if verdict == "APROBADO" else "#dc2626"
                body_p2 = f"""
                <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
                    <h2 style="color: #0f172a;">Resultados Definitivos de Selección</h2>
                    <p>Estimado(a) <strong>{asm['full_name']}</strong>,</p>
                    <p>El equipo de evaluación ha completado la revisión manual de sus preguntas subjetivas/de desarrollo.</p>
                    <div style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 18px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 18px;">Puntaje Definitivo: <strong>{final_pct}%</strong></p>
                        <p style="margin: 8px 0; font-size: 20px; color: {status_color}; font-weight: bold;">
                            ESTADO: {verdict}
                        </p>
                        <p style="margin: 0; color: #64748b; font-size: 14px;">
                            Desglose: Cerradas {asm['closed_score_obtained']}/{asm['closed_score_total']} pts | Abiertas {open_obtained}/{asm['open_score_total']} pts
                        </p>
                    </div>
                    {f'<p><strong>Observaciones del evaluador:</strong> {reviewer_notes}</p>' if reviewer_notes else ''}
                    <p style="color: #475569;">Este es un mensaje automatizado generado por el Sistema de Pruebas Psicotécnicas.</p>
                </div>
                """
                email_id = f"eml_{os.urandom(4).hex()}"
                conn.execute("""
                    INSERT INTO email_logs (id, assessment_id, recipient_email, phase, subject, body_html)
                    VALUES (?, ?, ?, 2, ?, ?)
                """, (email_id, assessment_id, asm["email"], subject_p2, body_p2))

                conn.commit()

                return self._send_json(200, {
                    "assessment_id": assessment_id,
                    "status": verdict,
                    "final_percentage": final_pct,
                    "email_sent": {
                        "phase": 2,
                        "subject": subject_p2,
                        "recipient": asm["email"],
                        "verdict": verdict
                    }
                })

        # 4. CRUD de Preguntas: Crear o Actualizar
        elif path == "/api/admin/questions":
            data = self._parse_body()
            qid = data.get("id") or f"q_{os.urandom(4).hex()}"
            group_letter = data.get("group_letter")
            category = data.get("category")
            question_text = str(data.get("question_text", "")).strip()
            question_type = data.get("question_type", "multiple_choice")
            points = float(data.get("points", 1.0))
            image_url = data.get("image_url") or None
            options = data.get("options", []) # [{option_key, option_text, image_url, is_correct}]

            if not all([group_letter, category, question_text, points]):
                return self._send_json(400, {"error": "Faltan campos obligatorios para la pregunta"})

            with get_db() as conn:
                conn.execute("""
                    INSERT INTO questions (id, group_letter, category, question_text, question_type, points, image_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        group_letter=excluded.group_letter,
                        category=excluded.category,
                        question_text=excluded.question_text,
                        question_type=excluded.question_type,
                        points=excluded.points,
                        image_url=excluded.image_url
                """, (qid, group_letter, category, question_text, question_type, points, image_url))

                # Reemplazar opciones
                conn.execute("DELETE FROM question_options WHERE question_id = ?", (qid,))
                if question_type == "multiple_choice":
                    for opt in options:
                        opt_id = f"opt_{os.urandom(4).hex()}"
                        conn.execute("""
                            INSERT INTO question_options (id, question_id, option_key, option_text, image_url, is_correct)
                            VALUES (?, ?, ?, ?, ?, ?)
                        """, (opt_id, qid, opt["option_key"], opt["option_text"], opt.get("image_url"), 1 if opt.get("is_correct") else 0))

                conn.commit()
                return self._send_json(200, {"id": qid, "message": "Pregunta guardada exitosamente"})

        # 5. Configuración de Temporizador
        elif path == "/api/admin/config":
            data = self._parse_body()
            timer_enabled = 1 if data.get("timer_enabled") else 0
            time_limit = int(data.get("time_limit_minutes", 15))
            passing_pct = float(data.get("passing_percentage", 70.0))

            with get_db() as conn:
                conn.execute("""
                    UPDATE system_config
                    SET timer_enabled = ?, time_limit_minutes = ?, passing_percentage = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = 1
                """, (timer_enabled, time_limit, passing_pct))
                conn.commit()
                return self._send_json(200, {"message": "Configuración actualizada"})

        self._send_json(404, {"error": "Endpoint POST no encontrado"})

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/admin/questions/"):
            qid = path.split("/")[-1]
            with get_db() as conn:
                conn.execute("DELETE FROM questions WHERE id = ?", (qid,))
                conn.commit()
                return self._send_json(200, {"message": "Pregunta eliminada"})
        self._send_json(404, {"error": "Endpoint DELETE no encontrado"})

def run_server(port=8000):
    init_db()
    server_address = ("0.0.0.0", port)
    httpd = ThreadedHTTPServer(server_address, PsychotestHandler)
    print(f"[Torvalds Backend] Servidor HTTP puro activo en http://0.0.0.0:{port}")
    print(f"[Torvalds Backend] Base de datos SQLite: {DB_FILE}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido limpiamente.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
