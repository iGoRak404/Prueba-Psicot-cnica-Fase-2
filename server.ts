import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "10mb" }));

// Inicialización de Google Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Endpoint de salud
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

/**
 * Función auxiliar para generar el HTML con el diseño exacto de las capturas
 */
function buildHtmlFromTemplate(data: any): { html: string; text: string; subject: string } {
  const {
    phase,
    recipient_name,
    recipient_email,
    group_letter = "A",
    status = "EN_REVISION",
    final_percentage = 0,
    closed_score_obtained = 0,
    closed_score_total = 18,
    open_score_obtained = 0,
    open_score_total = 0,
    questions_detail = [],
    subjective_reviews = [],
    reviewer_notes = "",
    reason = "",
  } = data;

  const totalPoints = closed_score_obtained + open_score_obtained;
  const maxPoints = closed_score_total + open_score_total || 18;
  const isApproved = status === "APROBADO";

  // FASE 1: Recepción automática con preguntas cerradas, respuestas correctas e incorrectas
  if (phase === 1 || phase === "1") {
    const subject = `[PsicoTest Oficial] Resultados Preliminares - Grupo ${group_letter} - ${recipient_name}`;
    const text = `Hola ${recipient_name},\n\nHemos recibido tu evaluación del Grupo ${group_letter} · Nivel medium.\n\nPorcentaje Preliminar: ${final_percentage}%\n${closed_score_obtained} de ${maxPoints} puntos automáticos\nPuntaje sujeto a revisión manual.\n\nDesglose de Preguntas y Respuestas:\n${questions_detail.map((q: any, idx: number) => {
      if (q.type_label === 'PREGUNTA ABIERTA') {
        return `Pregunta ${idx + 1} (${q.points || 2} pts): ${q.text}\n- Tu respuesta: "${q.candidate_answer || 'Sin respuesta'}"\n- Estado: En revisión manual por el Administrador`;
      }
      return `Pregunta ${idx + 1} (${q.points || 2} pts): ${q.text}\n- Tu respuesta: ${q.candidate_answer || 'Sin respuesta'}\n- Respuesta correcta: ${q.correct_answer || 'No especificada'}\n- Resultado: ${q.is_correct ? 'CORRECTA ✔' : 'INCORRECTA ✖'}`;
    }).join('\n\n')}\n\nTienes preguntas de revisión manual: Un administrador revisará tus respuestas subjetivas.\nRecibirás un segundo correo con tu puntaje final y retroalimentación.\n\nEste es un correo automático. Por favor no respondas directamente.`;

    const questionsHtml = questions_detail.length > 0
      ? questions_detail.map((q: any, idx: number) => {
          const isMultiple = q.type_label !== 'PREGUNTA ABIERTA';
          const isCorrect = Boolean(q.is_correct);
          const bgCol = isMultiple ? (isCorrect ? "#f0fdf4" : "#fef2f2") : "#eff6ff";
          const borderCol = isMultiple ? (isCorrect ? "#bbf7d0" : "#fecaca") : "#bfdbfe";
          const badgeText = isMultiple ? (isCorrect ? `✔ Correcta (+${q.points || 2} pts)` : "✖ Incorrecta (0 pts)") : "⏳ En Revisión por el Administrador";
          const badgeBg = isMultiple ? (isCorrect ? "#16a34a" : "#dc2626") : "#2563eb";

          return `
            <div style="background: ${bgCol}; border: 1px solid ${borderCol}; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.5px; text-transform: uppercase;">
                PREGUNTA ${idx + 1} · ${q.type_label || 'SELECCIÓN MÚLTIPLE'} · ${q.points || 2} PTS
              </div>
              <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 6px 0;">
                ${q.text || "¿Pregunta evaluada?"}
              </div>
              <div style="font-size: 13px; color: #334155; margin-bottom: 6px;">
                <strong>Tu respuesta seleccionada:</strong> <em>${q.candidate_answer || "Sin respuesta"}</em>
              </div>
              ${isMultiple ? `
                <div style="font-size: 13px; color: ${isCorrect ? '#166534' : '#991b1b'}; margin-bottom: 8px; background: ${isCorrect ? '#dcfce7' : '#fee2e2'}; padding: 6px 10px; border-radius: 6px;">
                  <strong>Respuesta correcta oficial:</strong> ${q.correct_answer || 'No especificada'}
                </div>
              ` : `
                <div style="font-size: 12px; color: #1e40af; margin-bottom: 8px; background: #dbeafe; padding: 6px 10px; border-radius: 6px;">
                  📝 Respuesta abierta registrada. Será calificada con retroalimentación por el administrador en la Fase 2.
                </div>
              `}
              <div>
                <span style="display: inline-block; background: ${badgeBg}; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 9999px;">
                  ${badgeText}
                </span>
              </div>
            </div>
          `;
        }).join("")
      : `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569;">PREGUNTA 1 · SELECCIÓN MÚLTIPLE · 2 PTS</div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 6px 0;">Evaluación de lógica y razonamiento</div>
          <div style="font-size: 13px; color: #334155;">Puntaje automático procesado con éxito.</div>
          <span style="display: inline-block; background: #16a34a; color: #ffffff; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 9999px; margin-top: 6px;">✔ Correcta</span>
        </div>
      `;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px 20px; color: #0f172a; background: #ffffff;">
        <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">
          Hola <span style="color: #0f172a;">${recipient_name}</span>,
        </h2>
        <p style="font-size: 13px; color: #475569; margin: 0 0 20px 0;">
          Hemos recibido tu evaluación del <strong>Grupo ${group_letter}</strong> · Nivel medium.
        </p>

        <!-- TARJETA DE PUNTAJE VERDE (IDÉNTICA A LA CAPTURA 1) -->
        <div style="border: 2px solid #22c55e; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 20px; background: #ffffff;">
          <div style="font-size: 52px; font-weight: 800; color: #16a34a; line-height: 1; margin-bottom: 8px;">
            ${final_percentage}%
          </div>
          <div style="font-size: 13px; color: #475569; margin-bottom: 6px;">
            ${closed_score_obtained}.0 de ${maxPoints} puntos automáticos
          </div>
          <div style="font-size: 12px; font-weight: 600; color: #ca8a04; display: inline-block;">
            ⏳ Puntaje sujeto a revisión manual
          </div>
        </div>

        <!-- ALERTA AMARILLA DE PREGUNTAS MANUALES (IDÉNTICA A LA CAPTURA 1) -->
        <div style="background: #fef9c3; border: 1px solid #fef08a; border-radius: 12px; padding: 16px 20px; margin-bottom: 26px;">
          <div style="font-size: 13px; font-weight: 700; color: #854d0e; margin-bottom: 4px;">
            ⚠️ Tienes preguntas de revisión manual
          </div>
          <div style="font-size: 12px; color: #854d0e; line-height: 1.5;">
            Un administrador revisará tus respuestas subjetivas. Recibirás un segundo correo con tu puntaje final y retroalimentación.
          </div>
        </div>

        <!-- SECCIÓN: ANÁLISIS DETALLADO CON LÍNEA VERDE -->
        <div style="margin-top: 10px; margin-bottom: 16px; border-top: 2px solid #16a34a; padding-top: 14px;">
          <h3 style="font-size: 16px; font-weight: 800; color: #064e3b; margin: 0 0 16px 0;">
            Análisis Detallado
          </h3>
          ${questionsHtml}
        </div>

        <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          Grupo: ${group_letter} · Nivel: medium<br/>
          Este es un correo automático. Por favor no respondas directamente.
        </div>
      </div>
    `;

    return { html, text, subject };
  }

  // FASE 2: Dictamen Definitivo del Administrador (IDÉNTICO A LA CAPTURA 2)
  if (phase === 2 || phase === "2") {
    const verdictText = isApproved ? "APROBADO" : "NO APROBADO";
    const boxBorderCol = isApproved ? "#22c55e" : "#dc2626";
    const textColor = isApproved ? "#16a34a" : "#dc2626";
    const badgeSymbol = isApproved ? "✔" : "✖";

    const subject = `[PsicoTest Oficial] Resultados Definitivos: ${verdictText} - ${recipient_name}`;
    const text = `Hola ${recipient_name},\n\nEstos son tus resultados definitivos después de la revisión del administrador.\n\nPorcentaje Definitivo: ${final_percentage}%\n${totalPoints}.0 de ${maxPoints} puntos totales\n${badgeSymbol} ${verdictText}\n\nObservaciones:\n${reviewer_notes || 'Sin observaciones adicionales'}\n\nGrupo: ${group_letter} · Nivel: medium\nEste es un correo automático. Por favor no respondas directamente.`;

    const subjectiveHtml = subjective_reviews.length > 0
      ? subjective_reviews.map((s: any, idx: number) => {
          const isCorrectSub = s.points_awarded > 0;
          const statusText = isCorrectSub ? "Correcta" : "Incorrecta";
          const statusCol = isCorrectSub ? "#16a34a" : "#dc2626";
          const markSym = isCorrectSub ? "✔" : "✖";

          return `
            <div style="background: #ffffff; border-left: 3px solid #dc2626; border-radius: 4px; padding: 14px 16px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.5px;">
                PREGUNTA ${s.number || idx + 1} · ${s.points_possible || 3} PTS
              </div>
              <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 6px 0;">
                ${s.text || "Pregunta de desarrollo"}
              </div>
              <div style="font-size: 13px; color: #334155; margin-bottom: 6px;">
                Tu respuesta: <em>${s.candidate_response || "Sin respuesta"}</em>
              </div>
              <div style="font-size: 12px; font-weight: 700; color: ${statusCol}; margin-bottom: 10px;">
                ${markSym} ${statusText}
              </div>

              <!-- CUADRO DE RETROALIMENTACIÓN (CAPTURA 2) -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 3px;">
                  💬 Retroalimentación:
                </div>
                <div style="font-size: 12px; color: #475569; font-style: normal;">
                  ${s.feedback || reviewer_notes || "Respuesta evaluada por el comité."}
                </div>
              </div>
            </div>
          `;
        }).join("")
      : `
        <div style="background: #ffffff; border-left: 3px solid #dc2626; border-radius: 4px; padding: 14px 16px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569;">PREGUNTA 8 · 3 PTS</div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 6px 0;">Pregunta de desarrollo y análisis situacional</div>
          <div style="font-size: 13px; color: #334155; margin-bottom: 6px;">Tu respuesta: Registrada en plataforma.</div>
          <div style="font-size: 12px; font-weight: 700; color: ${textColor}; margin-bottom: 10px;">${badgeSymbol} Calificada</div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
            <div style="font-size: 12px; font-weight: 700; color: #334155;">💬 Retroalimentación:</div>
            <div style="font-size: 12px; color: #475569;">${reviewer_notes || "Completada por el evaluador."}</div>
          </div>
        </div>
      `;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px 20px; color: #0f172a; background: #ffffff;">
        <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">
          Hola <span style="color: #0f172a;">${recipient_name}</span>,
        </h2>
        <p style="font-size: 13px; color: #475569; margin: 0 0 20px 0;">
          Estos son tus resultados definitivos después de la revisión del administrador.
        </p>

        <!-- TARJETA ROJA/VERDE DE RESULTADO FINAL (IDÉNTICA A LA CAPTURA 2) -->
        <div style="border: 2px solid ${boxBorderCol}; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px; background: #ffffff;">
          <div style="font-size: 52px; font-weight: 800; color: ${textColor}; line-height: 1; margin-bottom: 8px;">
            ${final_percentage}%
          </div>
          <div style="font-size: 13px; color: #475569; margin-bottom: 8px;">
            ${totalPoints}.0 de ${maxPoints} puntos totales
          </div>
          <div style="font-size: 15px; font-weight: 800; color: ${textColor};">
            ${badgeSymbol} ${verdictText}
          </div>
        </div>

        <!-- SECCIÓN: REVISIÓN DE PREGUNTAS SUBJETIVAS (CAPTURA 2) -->
        <div style="margin-top: 10px; margin-bottom: 20px; border-top: 2px solid #16a34a; padding-top: 14px;">
          <h3 style="font-size: 16px; font-weight: 800; color: #064e3b; margin: 0 0 16px 0;">
            Revisión de Preguntas Subjetivas
          </h3>
          ${subjectiveHtml}
        </div>

        <div style="background: #f8fafc; border-radius: 8px; padding: 12px 16px; margin-top: 20px; font-size: 12px; color: #334155;">
          <strong>Grupo:</strong> ${group_letter}<br/>
          <strong>Nivel:</strong> medium
        </div>

        <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          Este es un correo automático. Por favor no respondas directamente.
        </div>
      </div>
    `;

    return { html, text, subject };
  }

  // SOLICITUD DE REINTENTO (Candidato reprobado solicita oportunidad)
  if (phase === "retry_request") {
    const subject = `[PsicoTest] Solicitud de Reintento Registrada - ${recipient_name}`;
    const text = `Hola ${recipient_name},\n\nHemos recibido tu solicitud formal para volver a presentar la evaluación psicotécnica (Grupo ${group_letter}).\n\nMotivo manifestado:\n"${reason || 'Solicitud de reintento por el candidato'}"\n\nTu solicitud ha sido remitida directamente al Administrador del sistema. Tan pronto sea revisada y aprobada, recibirás una notificación automática permitiéndote el acceso nuevamente.\n\nEste es un correo automático.`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
          Hola ${recipient_name},
        </h2>
        <p style="font-size: 13px; color: #475569;">
          Hemos recibido tu solicitud formal para volver a presentar la evaluación psicotécnica para el <strong>Grupo ${group_letter}</strong>.
        </p>

        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 14px 16px; margin: 18px 0;">
          <div style="font-size: 12px; font-weight: 700; color: #1e40af; margin-bottom: 4px;">
            ESTADO DE LA SOLICITUD: PENDIENTE DE REVISIÓN
          </div>
          <div style="font-size: 12px; color: #1e3a8a;">
            "${reason || 'Solicitud de repetición enviada mediante la plataforma.'}"
          </div>
        </div>

        <p style="font-size: 12px; color: #64748b;">
          El comité administrador revisará tu caso. Recibirás un correo automático cuando el acceso sea habilitado.
        </p>

        <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
          Este es un correo automático. Por favor no respondas directamente.
        </div>
      </div>
    `;

    return { html, text, subject };
  }

  // ALERTA AL ADMINISTRADOR DE NUEVA SOLICITUD DE REINTENTO
  if (phase === "admin_alert") {
    const subject = `[Alerta PsicoTest Admin] Solicitud de Reintento - ${recipient_name} (${recipient_email})`;
    const text = `Notificación para el Administrador:\n\nEl candidato ${recipient_name} (${recipient_email}) ha solicitado permiso para volver a presentar la prueba del Grupo ${group_letter}.\n\nMotivo:\n${reason || 'Sin motivo especificado'}\n\nPuede aprobar o rechazar esta solicitud desde el Panel de Administrador en la pestaña "Solicitudes de Reintento".`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;">
          <strong style="color: #92400e; font-size: 13px;">Nueva Solicitud de Reintento de Examen</strong>
        </div>
        <h3 style="font-size: 16px; color: #0f172a; margin: 0 0 10px 0;">Candidato: ${recipient_name}</h3>
        <p style="font-size: 13px; color: #475569; margin: 0 0 14px 0;">
          <strong>Correo:</strong> ${recipient_email}<br/>
          <strong>Grupo:</strong> ${group_letter}
        </p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Motivo expresado:</span>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #1e293b;">"${reason || 'Solicita permiso para repetir la prueba.'}"</p>
        </div>
        <p style="font-size: 12px; color: #64748b;">
          Ingrese a la sección <strong>"Solicitudes de Reintento"</strong> en el Panel de Administrador para Aprobar o Rechazar el acceso.
        </p>
      </div>
    `;

    return { html, text, subject };
  }

  // REINTENTO APROBADO POR EL ADMINISTRADOR
  if (phase === "retry_approved") {
    const subject = `[PsicoTest Oficial] ¡Reintento Habilitado! - Acceso Concedido para Grupo ${group_letter}`;
    const text = `Hola ${recipient_name},\n\nEl Administrador ha APROBADO tu solicitud de reintento para la evaluación psicotécnica del Grupo ${group_letter}.\n\nTu correo (${recipient_email}) ha sido desbloqueado en el sistema y ahora puedes ingresar nuevamente a presentar la prueba.\n\nObservaciones del Administrador:\n${reviewer_notes || 'Acceso concedido para nuevo intento.'}\n\nIngresa a la plataforma y completa tu registro para comenzar.\n\nEste es un correo automático.`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;">
        <div style="border-bottom: 2px solid #22c55e; padding-bottom: 12px; margin-bottom: 16px;">
          <span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase;">
            Acceso Reestablecido
          </span>
          <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 10px 0 4px 0;">
            ¡Tu solicitud de reintento ha sido aprobada!
          </h2>
        </div>

        <p style="font-size: 13px; color: #475569; margin: 0 0 16px 0;">
          Estimado(a) <strong>${recipient_name}</strong>, el comité administrador ha autorizado un nuevo intento para presentar la evaluación psicotécnica del <strong>Grupo ${group_letter}</strong>.
        </p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 4px;">
            ✔ Correo Desbloqueado: ${recipient_email}
          </div>
          <p style="font-size: 12px; color: #14532d; margin: 0;">
            Ya puedes ingresar a la plataforma, digitar tu información e iniciar nuevamente la prueba con cronómetro completo.
          </p>
          ${reviewer_notes ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #86efac; font-size: 12px; color: #15803d;">
              <strong>Mensaje del evaluador:</strong> ${reviewer_notes}
            </div>
          ` : ''}
        </div>

        <p style="font-size: 12px; color: #64748b;">
          Recuerda contar con una conexión estable y disponer de todo el tiempo asignado antes de iniciar.
        </p>

        <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 14px;">
          Este es un correo automático. Por favor no respondas directamente.
        </div>
      </div>
    `;

    return { html, text, subject };
  }

  // ALERTA AL ADMINISTRADOR: EVALUACIÓN FINALIZADA PARA REVISIÓN Y VEREDICTO FINAL
  if (phase === "test_completed_admin_alert") {
    const subject = `[PsicoTest Admin] Evaluación Finalizada para Revisión y Veredicto: ${recipient_name} - Grupo ${group_letter}`;
    const text = `Notificación para el Administrador:\n\nEl candidato ${recipient_name} (${recipient_email}) ha finalizado su evaluación psicotécnica (Grupo ${group_letter}).\n\nResumen de resultados preliminares:\n- Porcentaje Preliminar: ${final_percentage}%\n- Puntaje Cerradas: ${closed_score_obtained} de ${closed_score_total} pts\n- Preguntas de Desarrollo: ${open_score_total > 0 ? `${open_score_total} pts pendientes de calificación` : 'No contiene'}\n\nDetalle de respuestas entregadas:\n${questions_detail.map((q: any, idx: number) => {
      if (q.type_label === 'PREGUNTA ABIERTA') {
        return `Pregunta ${idx + 1} (Abierta / Desarrollo - ${q.points || 3} pts):\nEnunciado: ${q.text}\nRespuesta del candidato:\n"${q.candidate_answer || 'Sin respuesta'}"\n[PENDIENTE DE EVALUAR EN PANEL]`;
      }
      return `Pregunta ${idx + 1} (${q.type_label} - ${q.points || 2} pts):\nEnunciado: ${q.text}\n- Respuesta del candidato: ${q.candidate_answer || 'Sin respuesta'}\n- Respuesta correcta: ${q.correct_answer || 'N/A'}\n- Veredicto automático: ${q.is_correct ? 'CORRECTA ✔' : 'INCORRECTA ✖'}`;
    }).join('\n\n')}\n\nPor favor ingrese al Panel de Administrador en la pestaña "Calificación" para revisar las respuestas y emitir el veredicto final.\n\nPsicoTest Core.`;

    const adminQuestionsHtml = questions_detail.map((q: any, idx: number) => {
      const isMultiple = q.type_label !== 'PREGUNTA ABIERTA';
      const isCorrect = Boolean(q.is_correct);
      const bgCol = isMultiple ? (isCorrect ? "#f0fdf4" : "#fef2f2") : "#eff6ff";
      const borderCol = isMultiple ? (isCorrect ? "#bbf7d0" : "#fecaca") : "#93c5fd";
      const badgeText = isMultiple ? (isCorrect ? `✔ Correcta (+${q.points || 2} pts)` : "✖ Incorrecta (0 pts)") : "⏳ Requiere Calificación Manual (Fase 2)";
      const badgeBg = isMultiple ? (isCorrect ? "#16a34a" : "#dc2626") : "#2563eb";

      return `
        <div style="background: ${bgCol}; border: 1px solid ${borderCol}; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.5px; text-transform: uppercase;">
            PREGUNTA ${idx + 1} · ${q.type_label || 'SELECCIÓN MÚLTIPLE'} · ${q.points || 2} PTS
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 6px 0;">
            ${q.text || "¿Pregunta evaluada?"}
          </div>
          <div style="font-size: 13px; color: #1e293b; margin-bottom: 6px;">
            <strong>Respuesta del candidato:</strong> <span>${q.candidate_answer || "Sin respuesta"}</span>
          </div>
          ${isMultiple ? `
            <div style="font-size: 13px; color: #166534; margin-bottom: 8px;">
              <strong>Respuesta correcta oficial:</strong> ${q.correct_answer || 'No especificada'}
            </div>
          ` : `
            <div style="background: #ffffff; border: 1px solid #bfdbfe; border-left: 3px solid #2563eb; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; font-size: 13px; color: #1e293b;">
              <strong>Texto de desarrollo redactado por el candidato:</strong><br/>
              <p style="margin: 6px 0 0 0; font-style: italic; white-space: pre-wrap;">"${q.candidate_answer || 'Sin respuesta'}"</p>
            </div>
          `}
          <div>
            <span style="display: inline-block; background: ${badgeBg}; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 9999px;">
              ${badgeText}
            </span>
          </div>
        </div>
      `;
    }).join("");

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px;">
          <strong style="color: #1e40af; font-size: 14px; display: block; margin-bottom: 2px;">
            📋 Notificación de Nueva Evaluación Finalizada
          </strong>
          <span style="color: #1e3a8a; font-size: 12px;">
            El candidato ha completado la prueba y requiere revisión de respuestas para emitir el veredicto final.
          </span>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">
            Candidato: ${recipient_name}
          </h3>
          <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; font-weight: 600; width: 140px;">Correo:</td>
              <td style="padding: 4px 0;"><a href="mailto:${recipient_email}" style="color: #2563eb;">${recipient_email}</a></td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: 600;">Grupo Evaluado:</td>
              <td style="padding: 4px 0;"><strong>Grupo ${group_letter}</strong></td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: 600;">Puntaje Preliminar:</td>
              <td style="padding: 4px 0; color: #16a34a; font-weight: 700;">${closed_score_obtained} de ${closed_score_total} pts (${final_percentage}%)</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: 600;">Fecha de entrega:</td>
              <td style="padding: 4px 0; font-family: monospace;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 10px; margin-bottom: 20px; border-top: 2px solid #2563eb; padding-top: 14px;">
          <h4 style="font-size: 15px; font-weight: 800; color: #1e3a8a; margin: 0 0 14px 0;">
            Desglose Completo de Respuestas Entregadas
          </h4>
          ${adminQuestionsHtml}
        </div>

        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; margin-top: 20px;">
          <p style="font-size: 13px; color: #334155; margin: 0 0 8px 0; font-weight: 600;">
            Acceda al Panel de Administrador para calificar las preguntas de desarrollo y formalizar el veredicto final (Aprobado / Reprobado).
          </p>
        </div>

        <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
          Notificación interna oficial de PsicoTest Core · Gmail & Gemini AI
        </div>
      </div>
    `;

    return { html, text, subject };
  }

  // CONCESIÓN DE PRIVILEGIOS DE ADMINISTRADOR
  if (phase === "admin_granted") {
    const subject = `[PsicoTest Oficial] Has sido designado como Administrador del Sistema`;
    const text = `Hola ${recipient_name},\n\nSe te han concedido privilegios de Administrador en la plataforma PsicoTest Core.\n\nAhora puedes ingresar al panel de control para:\n- Calificar evaluaciones psicotécnicas (Fase 2)\n- Gestionar y autorizar solicitudes de reintento\n- Administrar el banco de preguntas\n- Configurar parámetros y credenciales del sistema\n- Administrar roles de otros usuarios\n\nPuedes ingresar desde la opción 'Administrador' en la barra superior.\n\nPsicoTest Core.`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 16px;">
          <span style="background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase;">
            Privilegios de Administrador
          </span>
          <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 10px 0 4px 0;">
            ¡Has sido designado como Administrador!
          </h2>
        </div>

        <p style="font-size: 13px; color: #475569; margin: 0 0 16px 0;">
          Estimado(a) <strong>${recipient_name}</strong>, la administración principal de <strong>PsicoTest Core</strong> te ha otorgado acceso y privilegios de <strong>Administrador</strong> en el sistema.
        </p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 6px;">
            ✔ Acciones habilitadas en tu cuenta:
          </div>
          <ul style="font-size: 12px; color: #14532d; margin: 0; padding-left: 18px; line-height: 1.6;">
            <li>Calificación manual de preguntas de desarrollo y emisión de veredictos finales (Fase 2).</li>
            <li>Revisión, aprobación y desbloqueo de solicitudes de reintento para postulantes.</li>
            <li>Gestión completa del banco de preguntas (creación, edición y borrado).</li>
            <li>Auditoría de correos y despacho oficial vía Gmail API y Gemini AI.</li>
            <li>Concesión y revocación de permisos a otros administradores.</li>
          </ul>
        </div>

        <p style="font-size: 12px; color: #64748b;">
          Para ingresar, abre la plataforma, haz clic en el botón <strong>"Administrador"</strong> e inicia sesión con tus credenciales.
        </p>

        <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 14px;">
          Este es un correo automático oficial de PsicoTest Core.
        </div>
      </div>
    `;

    return { html, text, subject };
  }

  // REVOCACIÓN DE PRIVILEGIOS DE ADMINISTRADOR
  if (phase === "admin_revoked") {
    const subject = `[PsicoTest Oficial] Notificación: Revocación de Privilegios de Administrador`;
    const text = `Hola ${recipient_name},\n\nTe informamos que tus privilegios como Administrador en la plataforma PsicoTest Core han sido revocados por la administración principal.\n\nTu cuenta ha regresado al estado de usuario regular.\n\nSi consideras que esto es un error, por favor contacta al administrador general del sistema.`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 16px;">
          <span style="background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase;">
            Control de Seguridad y Accesos
          </span>
          <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 10px 0 4px 0;">
            Revocación de Permisos de Administrador
          </h2>
        </div>

        <p style="font-size: 13px; color: #475569; margin: 0 0 16px 0;">
          Estimado(a) <strong>${recipient_name}</strong>, te informamos que la administración del sistema ha retirado tus permisos de Administrador en <strong>PsicoTest Core</strong>.
        </p>

        <div style="background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 700; color: #991b1b; margin-bottom: 4px;">
            ESTADO ACTUAL: USUARIO REGULAR
          </div>
          <div style="font-size: 12px; color: #7f1d1d;">
            Tu acceso al Panel de Control, banco de preguntas y módulo de calificación ha sido restringido de acuerdo con las directivas de seguridad vigentes.
          </div>
        </div>

        <p style="font-size: 12px; color: #64748b;">
          Si consideras que se trata de un error o requieres renovación de tus credenciales, comunícate con el administrador principal.
        </p>

        <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 14px;">
          Este es un correo automático oficial de PsicoTest Core.
        </div>
      </div>
    `;

    return { html, text, subject };
  }

  return {
    subject: `[PsicoTest Oficial] Notificación de Evaluación - ${recipient_name}`,
    text: `Hola ${recipient_name}, tienes una actualización en tu proceso psicotécnico.`,
    html: `<div>Hola ${recipient_name}, tienes una actualización en tu proceso psicotécnico.</div>`,
  };
}

// Endpoint principal para generación y despacho real de correos
app.post("/api/send-email", async (req, res) => {
  try {
    // Si viene la solicitud del sistema SENA ADSO
    if (req.body.emailType || req.body.studentEmail) {
      const data = req.body;
      const {
        emailType = 'initial',
        studentEmail,
        studentName = 'Aprendiz',
        studentDoc = '',
        group = 'A',
        difficulty = 'easy',
        score = 0,
        total = 0,
        hasPending = false,
        answers = {},
        questions = [],
        completedAt = new Date().toISOString(),
        adminEmail = process.env.ADMIN_EMAIL || 'admin@sena.edu.co',
        finalScore = 0,
        finalTotal = 0,
        autoScore = 0,
        reviews = {},
      } = data;

      if (!studentEmail) {
        return res.status(400).json({ error: 'Falta correo electrónico del aprendiz.' });
      }

      function escapeText(str: any) {
        if (!str) return '';
        return String(str).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m] || m));
      }

      let studentSubject = '';
      let adminSubject = '';
      let studentHtml = '';
      let adminHtml = '';

      if (emailType === 'final') {
        const pct = finalTotal > 0 ? Math.round((finalScore / finalTotal) * 100) : 0;
        const approved = pct >= 60;
        studentSubject = `Resultados Definitivos - SENA ADSO (${pct}%) - ${approved ? 'APROBADO' : 'NO APROBADO'}`;
        adminSubject = `✅ Revisión Completada: ${studentName} (${pct}%)`;

        const subjectiveQs = (questions as any[]).filter((q: any) => q.type === 'scale' || q.type === 'open');
        const reviewsHtml = subjectiveQs.map((q: any) => {
          const rev = reviews[q.id] || {};
          const ans = answers[q.id];
          const ansText = q.type === 'scale' ? `${ans}/10` : (ans || '(sin respuesta)');
          const statusLabel = rev.status === 'correct' ? '✅ Correcta' : rev.status === 'incorrect' ? '❌ Incorrecta' : rev.status === 'partial' ? `🔄 Parcial (${rev.earned || 0} pts)` : '— Sin revisar';
          return `
            <div style="padding: 15px; margin: 10px 0; border-radius: 10px; background: #f9fcff; border-left: 4px solid ${rev.status === 'correct' ? '#008f4c' : rev.status === 'incorrect' ? '#d14545' : '#f7e6b0'}; font-family: sans-serif;">
              <div style="font-size: 11px; color: #59748c; text-transform: uppercase; font-weight: 700;">Pregunta · ${q.score} pts</div>
              <div style="font-weight: 700; color: #0b2d1f; margin: 6px 0;">${escapeText(q.text)}</div>
              <div style="font-size: 13px; color: #59748c; margin-bottom: 6px;"><strong>Tu respuesta:</strong> ${escapeText(ansText)}</div>
              <div style="font-size: 13px; font-weight: 700; color: ${rev.status === 'correct' ? '#008f4c' : rev.status === 'incorrect' ? '#d14545' : '#8a6d00'};">${statusLabel}</div>
              ${rev.feedback ? `<div style="margin-top: 8px; padding: 10px; background: white; border-radius: 8px; font-size: 13px; border: 1px solid #e2edf5;"><strong>💬 Retroalimentación del instructor:</strong><br>${escapeText(rev.feedback)}</div>` : ''}
            </div>
          `;
        }).join('');

        studentHtml = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #f0f5f9; padding: 20px;">
            <div style="background: ${approved ? '#008f4c' : '#d14545'}; color: white; padding: 25px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; font-size: 22px;">SENA · ADSO</h1>
              <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Resultados Definitivos de la Evaluación</p>
            </div>
            <div style="background: white; padding: 25px; border-radius: 0 0 16px 16px;">
              <p style="font-size: 15px; color: #0b2d1f;">Hola <strong>${escapeText(studentName)}</strong>,</p>
              <p style="font-size: 14px; color: #59748c;">A continuación se detallan tus resultados definitivos tras la revisión manual de los reactivos abiertos:</p>
              <div style="text-align: center; background: ${approved ? '#f2f9f5' : '#fef0f0'}; padding: 25px; border-radius: 12px; border: 3px solid ${approved ? '#008f4c' : '#d14545'}; margin: 20px 0;">
                <div style="font-size: 52px; font-weight: 800; color: ${approved ? '#008f4c' : '#d14545'};">${pct}%</div>
                <div style="color: #59748c; font-size: 14px; margin-top: 6px;">${finalScore.toFixed(1)} de ${finalTotal} puntos totales</div>
                <div style="margin-top: 10px; font-size: 17px; font-weight: 800; color: ${approved ? '#008f4c' : '#d14545'};">${approved ? '✅ APROBADO' : '❌ NO APROBADO'}</div>
              </div>
              ${subjectiveQs.length > 0 ? `<h3 style="color: #0b2d1f; border-bottom: 2px solid #008f4c; padding-bottom: 6px; font-size: 16px;">Revisión de Preguntas Subjetivas</h3>${reviewsHtml}` : ''}
              <div style="background: #f9fcff; padding: 12px; border-radius: 8px; margin-top: 15px; font-size: 12px; color: #59748c;">
                <strong>Grupo:</strong> ${group} · <strong>Nivel:</strong> ${difficulty}
              </div>
            </div>
          </div>
        `;

        adminHtml = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #f0f5f9; padding: 20px;">
            <div style="background: #1e3b2b; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
              <h2 style="margin: 0; font-size: 18px;">✅ Revisión Definitiva Remitida</h2>
            </div>
            <div style="background: white; padding: 20px; border-radius: 0 0 12px 12px; font-size: 13px;">
              <p><strong>Aprendiz:</strong> ${escapeText(studentName)} (${escapeText(studentDoc)})</p>
              <p><strong>Correo:</strong> ${escapeText(studentEmail)}</p>
              <p><strong>Puntaje Final:</strong> ${finalScore.toFixed(1)} / ${finalTotal} (${pct}%)</p>
              <p><strong>Veredicto:</strong> ${approved ? 'APROBADO' : 'NO APROBADO'}</p>
            </div>
          </div>
        `;
      } else {
        const pct = total > 0 ? Math.round((score / total) * 100) : 0;
        studentSubject = `Acuse de Recibo - SENA ADSO (${pct}%) - Grupo ${group}`;
        adminSubject = `📊 Nuevo Intento: ${studentName} - Grupo ${group} (${pct}%)`;

        const answerAnalysis = (questions as any[]).map((q: any, idx: number) => {
          const studentAnswer = answers[q.id];
          let isCorrect = false;
          let answerText = '';
          let typeLabel = q.type;

          if (q.type === 'multiple') {
            isCorrect = studentAnswer === q.correct;
            answerText = q.options?.[studentAnswer] || 'Sin respuesta';
          } else if (q.type === 'truefalse') {
            isCorrect = studentAnswer === q.correct;
            answerText = studentAnswer === true ? 'Verdadero' : studentAnswer === false ? 'Falso' : 'Sin respuesta';
          } else if (q.type === 'checkbox') {
            const sel = Array.isArray(studentAnswer) ? studentAnswer.sort((a: any, b: any) => a - b) : [];
            const cor = (q.corrects || []).sort((a: any, b: any) => a - b);
            isCorrect = sel.length === cor.length && sel.every((v: any, i: any) => v === cor[i]);
            answerText = sel.map((i: any) => q.options?.[i]).filter(Boolean).join(', ') || 'Sin respuesta';
          } else if (q.type === 'numeric') {
            const num = parseFloat(studentAnswer);
            isCorrect = !isNaN(num) && Math.abs(num - q.correct) <= (q.tolerance || 0);
            answerText = studentAnswer || 'Sin respuesta';
          } else if (q.type === 'match') {
            const pairs = q.pairs || [];
            let correctCount = 0;
            pairs.forEach((_: any, i: number) => { if (studentAnswer?.[i] === i) correctCount++; });
            isCorrect = correctCount === pairs.length;
            answerText = `${correctCount}/${pairs.length} pares correctos`;
          } else if (q.type === 'scale') {
            answerText = `Valoración: ${studentAnswer}/10`;
          } else if (q.type === 'open') {
            answerText = studentAnswer || 'Sin respuesta';
          }

          const isSubj = q.type === 'scale' || q.type === 'open';
          const bgColor = isSubj ? '#fef3cd' : isCorrect ? '#e4f3eb' : '#fef0f0';
          const borderColor = isSubj ? '#f7e6b0' : isCorrect ? '#008f4c' : '#d14545';
          const statusBadge = isSubj
            ? '<span style="background: #f7e6b0; color: #8a6d00; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700;">⏳ Revisión manual</span>'
            : isCorrect
            ? '<span style="background: #008f4c; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700;">✓ Correcta</span>'
            : '<span style="background: #d14545; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700;">✗ Incorrecta</span>';

          return `
            <div style="padding: 12px; margin: 8px 0; border-radius: 8px; background: ${bgColor}; border-left: 4px solid ${borderColor}; font-family: sans-serif;">
              <div style="font-size: 11px; color: #59748c; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">
                Pregunta ${idx + 1} · ${typeLabel} · ${q.score || 1} pt${(q.score || 1) > 1 ? 's' : ''}
              </div>
              <div style="font-weight: 600; color: #0b2d1f; margin-bottom: 6px;">${escapeText(q.text)}</div>
              <div style="font-size: 13px; color: #59748c;"><strong>Tu respuesta:</strong> ${escapeText(answerText)}</div>
              <div style="margin-top: 6px;">${statusBadge}</div>
            </div>
          `;
        }).join('');

        studentHtml = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #f0f5f9; padding: 20px;">
            <div style="background: #008f4c; color: white; padding: 25px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; font-size: 22px;">SENA · ADSO</h1>
              <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Evaluación Integral del Tecnólogo</p>
            </div>
            <div style="background: white; padding: 25px; border-radius: 0 0 16px 16px;">
              <p style="font-size: 15px; color: #0b2d1f;">Hola <strong>${escapeText(studentName)}</strong>,</p>
              <p style="font-size: 14px; color: #59748c;">Hemos recibido tu evaluación del <strong>Grupo ${group}</strong> · Nivel <strong>${difficulty}</strong>.</p>
              <div style="text-align: center; background: #f2f9f5; padding: 20px; border-radius: 12px; border: 2px solid #008f4c; margin: 18px 0;">
                <div style="font-size: 48px; font-weight: 800; color: #008f4c;">${pct}%</div>
                <div style="color: #59748c; font-size: 14px; margin-top: 4px;">${score.toFixed(1)} de ${total} puntos automáticos</div>
                ${hasPending ? '<div style="color: #8a6d00; margin-top: 6px; font-size: 12px; font-weight: 700;">⏳ Sujeto a revisión manual de preguntas abiertas</div>' : ''}
              </div>
              <h3 style="color: #0b2d1f; border-bottom: 2px solid #008f4c; padding-bottom: 6px; font-size: 16px;">Análisis de Respuestas</h3>
              ${answerAnalysis}
              <div style="background: #f9fcff; padding: 12px; border-radius: 8px; margin-top: 15px; font-size: 12px; color: #59748c;">
                <strong>Fecha:</strong> ${new Date(completedAt).toLocaleString('es-CO')}
              </div>
            </div>
          </div>
        `;

        adminHtml = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #f0f5f9; padding: 20px;">
            <div style="background: #1e3b2b; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
              <h2 style="margin: 0; font-size: 18px;">📊 Nuevo Intento Registrado - SENA ADSO</h2>
            </div>
            <div style="background: white; padding: 20px; border-radius: 0 0 12px 12px; font-size: 13px;">
              <p><strong>Aprendiz:</strong> ${escapeText(studentName)}</p>
              <p><strong>Documento:</strong> ${escapeText(studentDoc)}</p>
              <p><strong>Correo:</strong> ${escapeText(studentEmail)}</p>
              <p><strong>Grupo:</strong> ${group} · <strong>Nivel:</strong> ${difficulty}</p>
              <p><strong>Puntaje Automático:</strong> ${score.toFixed(1)} / ${total} (${pct}%)</p>
              ${hasPending ? '<p style="color: #8a6d00; font-weight: 700;">⚠️ Requiere revisión manual en el panel de administración.</p>' : ''}
            </div>
          </div>
        `;
      }

      // Despacho vía Nodemailer si SMTP está configurado
      let smtpSent = false;
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"SENA ADSO" <${process.env.SMTP_USER}>`,
            to: studentEmail,
            subject: studentSubject,
            html: studentHtml,
          });

          if (adminEmail) {
            await transporter.sendMail({
              from: process.env.SMTP_FROM || `"SENA ADSO" <${process.env.SMTP_USER}>`,
              to: adminEmail,
              subject: adminSubject,
              html: adminHtml,
            });
          }
          smtpSent = true;
        } catch (e) {
          console.warn("SMTP send failed, continuing with simulated success:", e);
        }
      }

      return res.json({
        success: true,
        smtpSent,
        message: emailType === 'final' ? 'Correos finales procesados' : 'Acuse de recibo procesado',
        studentSubject,
        adminSubject,
      });
    }

    // Flujo anterior compatible
    const recipient_email = req.body.recipient_email || req.body.recipientEmail;
    const recipient_name = req.body.recipient_name || req.body.candidateName || "Candidato";
    const phase = req.body.phase;
    const group_letter = req.body.group_letter || req.body.group || "A";
    const status = req.body.status || "EN_REVISION";
    const final_percentage = req.body.final_percentage ?? req.body.finalPercentage ?? 0;
    const closed_score_obtained = req.body.closed_score_obtained ?? req.body.closedObtained ?? 0;
    const closed_score_total = req.body.closed_score_total ?? req.body.closedTotal ?? 18;
    const open_score_obtained = req.body.open_score_obtained ?? req.body.openObtained ?? 0;
    const open_score_total = req.body.open_score_total ?? req.body.openTotal ?? 0;
    const questions_detail = req.body.questions_detail || req.body.questionsDetail || [];
    const subjective_reviews = req.body.subjective_reviews || req.body.subjectiveReviews || [];
    const reviewer_notes = req.body.reviewer_notes || req.body.reviewerNotes || "";
    const reason = req.body.reason || "";
    const auto_submitted = req.body.auto_submitted ?? req.body.autoSubmitted ?? false;

    if (!recipient_email) {
      return res.status(400).json({ error: "Faltan datos del destinatario (email)." });
    }

    // 1. Crear la base visual de alta fidelidad idéntica a las capturas
    const baseTemplate = buildHtmlFromTemplate({
      phase,
      recipient_name,
      recipient_email,
      group_letter,
      status,
      final_percentage,
      closed_score_obtained,
      closed_score_total,
      open_score_obtained,
      open_score_total,
      questions_detail,
      subjective_reviews,
      reviewer_notes,
      reason,
      auto_submitted,
    });

    let generatedSubject = baseTemplate.subject;
    let generatedBodyHtml = baseTemplate.html;
    let generatedBodyText = baseTemplate.text;
    let usedGemini = false;

    // 2. Potenciación y validación con Gemini API si está disponible
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Actúa como el motor oficial de notificaciones de Talento Humano y Selección Psicotécnica.
Genera o enriquece el asunto y texto oficial para esta notificación:
- Tipo: ${phase}
- Candidato: ${recipient_name}
- Correo: ${recipient_email}
- Grupo: Grupo ${group_letter}
- Veredicto/Estado: ${status}
- Porcentaje: ${final_percentage}%
- Puntos Cerradas: ${closed_score_obtained}/${closed_score_total}
- Puntos Abiertas: ${open_score_obtained}/${open_score_total}
${reviewer_notes ? `- Notas del evaluador: ${reviewer_notes}` : ""}
${reason ? `- Motivo de solicitud de reintento: ${reason}` : ""}

Devuelve un JSON con:
{
  "subject": "Asunto oficial formal conciso",
  "text": "Versión en texto plano para el correo",
  "ai_feedback": "Resumen conciso del desempeño o estatus"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const outputText = response.text || "{}";
        const parsed = JSON.parse(outputText);

        if (parsed.subject) {
          generatedSubject = parsed.subject;
          if (parsed.text) {
            generatedBodyText = parsed.text;
          }
          usedGemini = true;
        }
      } catch (geminiError) {
        console.warn("Gemini API call warning (used deterministic template):", geminiError);
      }
    }

    // 3. Despacho real vía Gmail API si se proporciona Authorization Bearer token
    let dispatchedViaGmailApi = false;
    let gmailMessageId: string | null = null;
    let gmailApiError: string | null = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const utf8Subject = `=?utf-8?B?${Buffer.from(generatedSubject, 'utf-8').toString('base64')}?=`;
        const rawMessage = [
          `To: ${recipient_email}`,
          `Subject: ${utf8Subject}`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=utf-8',
          'Content-Transfer-Encoding: 7bit',
          '',
          generatedBodyHtml,
        ].join('\r\n');

        const encodedMessage = Buffer.from(rawMessage, 'utf-8')
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodedMessage }),
        });

        if (gmailResponse.ok) {
          const gmailData = await gmailResponse.json();
          dispatchedViaGmailApi = true;
          gmailMessageId = gmailData.id || null;
        } else {
          const errData = await gmailResponse.json().catch(() => ({}));
          gmailApiError = errData?.error?.message || 'Error al enviar mediante Gmail API';
          console.warn('Gmail API delivery failed:', gmailApiError);
        }
      } catch (err: any) {
        gmailApiError = err?.message || 'Excepción al conectar con Gmail API';
        console.warn('Gmail API exception:', err);
      }
    }

    // 4. Despacho alternativo vía SMTP si existe configuración en el entorno
    let dispatchedViaSmtp = false;
    let smtpError: string | null = null;

    if (!dispatchedViaGmailApi && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"PsicoTest Oficial" <${process.env.SMTP_USER}>`,
          to: recipient_email,
          subject: generatedSubject,
          text: generatedBodyText,
          html: generatedBodyHtml,
        });

        dispatchedViaSmtp = true;
      } catch (err: any) {
        smtpError = err?.message || "Error al conectar con servidor SMTP.";
        console.error("SMTP delivery error:", err);
      }
    }

    // 5. URL de entrega directa 1-Click en Gmail
    const gmailWebmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      recipient_email
    )}&su=${encodeURIComponent(generatedSubject)}&body=${encodeURIComponent(
      generatedBodyText
    )}`;

    const mailtoUrl = `mailto:${encodeURIComponent(recipient_email)}?subject=${encodeURIComponent(
      generatedSubject
    )}&body=${encodeURIComponent(generatedBodyText)}`;

    const emailRecord = {
      id: `eml_${Date.now()}`,
      assessment_id: req.body.assessment_id || req.body.assessmentId,
      recipient_email,
      recipient_name,
      phase,
      subject: generatedSubject,
      body_html: generatedBodyHtml,
      body_text: generatedBodyText,
      sent_at: new Date().toISOString(),
      status_verdict: status,
      used_gemini: usedGemini,
      dispatched_via_gmail_api: dispatchedViaGmailApi,
      gmail_message_id: gmailMessageId,
      gmail_api_error: gmailApiError,
      dispatched_via_smtp: dispatchedViaSmtp,
      smtp_error: smtpError,
      gmail_webmail_url: gmailWebmailUrl,
      mailto_url: mailtoUrl,
    };

    res.json({
      success: true,
      usedGemini,
      dispatchedViaGmailApi,
      gmailMessageId,
      dispatchedViaSmtp,
      email: emailRecord,
    });
  } catch (err: any) {
    console.error("Error processing email dispatch:", err);
    res.status(500).json({
      error: "Error al procesar el despacho de correo con Gemini.",
      details: err?.message,
    });
  }
});

// Vite Middleware para desarrollo o archivos estáticos en producción
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    Boolean(process.argv[1]?.includes("dist")) ||
    Boolean(process.argv[1]?.endsWith(".cjs"));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const cwdDist = path.join(process.cwd(), "dist");
    let distPath = cwdDist;
    if (fs.existsSync(path.join(cwdDist, "index.html"))) {
      distPath = cwdDist;
    } else if (typeof __dirname !== "undefined" && fs.existsSync(path.join(__dirname, "index.html"))) {
      distPath = __dirname;
    }

    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
