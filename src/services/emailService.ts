import { Attempt, SenaQuestion } from '../types';

export interface EmailSettings {
  adminEmail: string;
  emailJsServiceId?: string;
  emailJsTemplateId?: string;
  emailJsPublicKey?: string;
  webhookUrl?: string;
}

export interface EmailDispatchPayload {
  emailType: 'initial' | 'final';
  studentEmail: string;
  studentName: string;
  studentDoc: string;
  group: string;
  difficulty: string;
  autoScore: number;
  autoTotal: number;
  hasPending?: boolean;
  finalScore?: number;
  finalTotal?: number;
  questions: SenaQuestion[];
  answers: Record<string, any>;
  gradedDetails?: Record<string, any>;
  reviews?: Record<string, any>;
  completedAt?: string;
  adminEmail?: string;
}

export interface DispatchResult {
  success: boolean;
  method: 'server' | 'emailjs' | 'webhook' | 'client_generated';
  message: string;
  studentSubject: string;
  studentHtml: string;
  studentText: string;
  adminSubject: string;
  adminHtml: string;
}

/**
 * Escapes HTML characters safely
 */
function escapeHtml(str: string = ''): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates the official SENA HTML Initial Receipt
 */
export function generateStudentInitialEmailHtml(data: EmailDispatchPayload): string {
  const {
    studentName,
    studentDoc,
    group,
    difficulty,
    autoScore,
    autoTotal,
    hasPending,
    questions,
    answers,
    gradedDetails = {},
    completedAt = new Date().toLocaleString('es-CO'),
  } = data;

  const pct = autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0;

  const questionsHtml = questions
    .map((q, idx) => {
      const g = gradedDetails[q.id];
      const isManual = q.type === 'scale' || q.type === 'open';
      const earned = g ? g.earned : 0;
      const totalQ = q.score || 1;
      const isCorrect = earned >= totalQ;

      let badgeBg = '#008f4c';
      let badgeText = `✔ Correcta (+${earned} pts)`;
      let borderCol = '#bbf7d0';
      let cardBg = '#f0fdf4';

      if (isManual) {
        badgeBg = '#d97706';
        badgeText = '⏳ En Revisión por el Evaluador';
        borderCol = '#fde68a';
        cardBg = '#fffbeb';
      } else if (!isCorrect) {
        badgeBg = '#dc2626';
        badgeText = `✖ Incorrecta (0/${totalQ} pts)`;
        borderCol = '#fecaca';
        cardBg = '#fef2f2';
      }

      let answerDisplay = 'Sin respuesta';
      const rawAns = answers[q.id];
      if (rawAns !== undefined && rawAns !== null && rawAns !== '') {
        if (q.type === 'multiple' && q.options) {
          answerDisplay = `Opción ${String.fromCharCode(65 + Number(rawAns))}: ${escapeHtml(q.options[Number(rawAns)])}`;
        } else if (q.type === 'truefalse') {
          answerDisplay = rawAns === true ? 'Verdadero' : 'Falso';
        } else if (q.type === 'checkbox' && Array.isArray(rawAns) && q.options) {
          answerDisplay = rawAns.map((i: number) => q.options![i]).join('; ');
        } else {
          answerDisplay = String(rawAns);
        }
      }

      return `
        <div style="background: ${cardBg}; border: 1px solid ${borderCol}; border-radius: 12px; padding: 16px; margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 800; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px;">
            PREGUNTA ${idx + 1} · ${escapeHtml(q.category || q.type)} · ${totalQ} PTS
          </div>
          <div style="font-size: 15px; font-weight: 700; color: #111827; margin: 8px 0;">
            ${escapeHtml(q.text)}
          </div>
          <div style="font-size: 13px; color: #374151; margin-bottom: 8px;">
            <strong>Tu respuesta registrada:</strong> <em>${escapeHtml(answerDisplay)}</em>
          </div>
          <div>
            <span style="display: inline-block; background: ${badgeBg}; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px;">
              ${badgeText}
            </span>
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Acuse de Recibo Evaluación SENA ADSO</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f6f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 680px; margin: 24px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <!-- Header Oficial SENA -->
        <div style="background: #008f4c; color: #ffffff; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">SERVICIO NACIONAL DE APRENDIZAJE · SENA</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.95; font-weight: 500;">Evaluación Tecnólogo en Análisis y Desarrollo de Software (ADSO)</p>
          <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 16px; border-radius: 100px; font-size: 12px; font-weight: 700; margin-top: 14px;">
            ACUSE OFICIAL DE RECEPCIÓN
          </div>
        </div>

        <!-- Apprentice Details -->
        <div style="padding: 24px 30px; border-bottom: 1px solid #f1f5f9; background: #fafcfb;">
          <h2 style="margin: 0 0 14px 0; font-size: 16px; color: #064e3b; font-weight: 800;">Datos del Aprendiz</h2>
          <table style="width: 100%; font-size: 13px; color: #374151; line-height: 1.6;">
            <tr><td style="width: 140px; font-weight: 700; color: #6b7280;">Nombre:</td><td style="font-weight: 600; color: #111827;">${escapeHtml(studentName)}</td></tr>
            <tr><td style="font-weight: 700; color: #6b7280;">Documento:</td><td style="font-weight: 600; color: #111827;">${escapeHtml(studentDoc)}</td></tr>
            <tr><td style="font-weight: 700; color: #6b7280;">Grupo & Nivel:</td><td>Grupo <strong>${escapeHtml(group)}</strong> · Nivel <strong>${escapeHtml(difficulty)}</strong></td></tr>
            <tr><td style="font-weight: 700; color: #6b7280;">Fecha de Envío:</td><td>${escapeHtml(completedAt)}</td></tr>
          </table>
        </div>

        <!-- Score Summary Card -->
        <div style="margin: 24px 30px; padding: 20px; border-radius: 16px; background: #ecfdf5; border: 1px solid #a7f3d0; text-align: center;">
          <div style="font-size: 12px; font-weight: 800; color: #006633; text-transform: uppercase; letter-spacing: 0.5px;">Calificación Preliminar Automática</div>
          <div style="font-size: 42px; font-weight: 900; color: #008f4c; margin: 6px 0;">${pct}%</div>
          <div style="font-size: 14px; font-weight: 700; color: #064e3b;">${autoScore.toFixed(1)} de ${autoTotal} puntos automáticos</div>
          ${
            hasPending
              ? `<div style="margin-top: 10px; font-size: 12px; font-weight: 700; color: #b45309; background: #fef3c7; padding: 6px 12px; border-radius: 8px; display: inline-block;">
                  ⚠️ Incluye preguntas abiertas en revisión manual por el instructor.
                </div>`
              : ''
          }
        </div>

        <!-- Question Breakdown -->
        <div style="padding: 0 30px 24px 30px;">
          <h3 style="margin: 0 0 16px 0; font-size: 15px; color: #111827; font-weight: 800;">Desglose de Respuestas Evaluadas</h3>
          ${questionsHtml}
        </div>

        <!-- Footer -->
        <div style="padding: 20px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
          <p style="margin: 0 0 6px 0; font-weight: 600;">Servicio Nacional de Aprendizaje SENA · Regional Colombia</p>
          <p style="margin: 0;">Este mensaje constituye una constancia digital oficial de la evaluación recibida.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates the official SENA HTML Final Report (Definitive Results)
 */
export function generateStudentFinalEmailHtml(data: EmailDispatchPayload): string {
  const {
    studentName,
    studentDoc,
    group,
    difficulty,
    finalScore = 0,
    finalTotal = 1,
    questions,
    answers,
    reviews = {},
    completedAt = new Date().toLocaleString('es-CO'),
  } = data;

  const pct = finalTotal > 0 ? Math.round((finalScore / finalTotal) * 100) : 0;
  const isApproved = pct >= 60;

  const questionsHtml = questions
    .map((q, idx) => {
      const totalQ = q.score || 1;
      const isSubjective = q.type === 'scale' || q.type === 'open';
      const rev = reviews[q.id];
      const earned = rev ? rev.earned ?? 0 : isSubjective ? 0 : totalQ;

      let badgeBg = earned > 0 ? '#008f4c' : '#dc2626';
      let badgeText = earned > 0 ? `✔ Calificado (+${earned}/${totalQ} pts)` : `✖ 0/${totalQ} pts`;

      let feedbackBox = '';
      if (rev && rev.feedback) {
        feedbackBox = `
          <div style="margin-top: 8px; padding: 10px; background: #ffffff; border-left: 3px solid #008f4c; font-size: 12px; color: #1f2937;">
            <strong>Comentarios del Evaluador:</strong> ${escapeHtml(rev.feedback)}
          </div>
        `;
      }

      return `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 800; color: #64748b;">PREGUNTA ${idx + 1} (${totalQ} PTS)</div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 4px 0;">${escapeHtml(q.text)}</div>
          <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
            <strong>Respuesta del aprendiz:</strong> ${escapeHtml(String(answers[q.id] || 'Sin respuesta'))}
          </div>
          <div>
            <span style="display: inline-block; background: ${badgeBg}; color: white; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 9999px;">
              ${badgeText}
            </span>
          </div>
          ${feedbackBox}
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #f3f6f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 680px; margin: 24px auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: ${isApproved ? '#008f4c' : '#b91c1c'}; color: #ffffff; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 900;">RESULTADOS DEFINITIVOS DE EVALUACIÓN</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.95;">SENA · Programa de Formación ADSO</p>
          <div style="display: inline-block; background: rgba(255,255,255,0.25); padding: 6px 20px; border-radius: 100px; font-size: 14px; font-weight: 800; margin-top: 14px;">
            ${isApproved ? '🎉 EVALUACIÓN APROBADA' : '❌ NO APROBADA'}
          </div>
        </div>

        <div style="padding: 24px 30px;">
          <h2 style="margin: 0 0 12px 0; font-size: 16px; color: #111827;">Aprendiz: <strong>${escapeHtml(studentName)}</strong> (${escapeHtml(studentDoc)})</h2>
          <div style="text-align: center; padding: 20px; border-radius: 16px; background: ${isApproved ? '#ecfdf5' : '#fef2f2'}; border: 1px solid ${isApproved ? '#a7f3d0' : '#fecaca'}; margin-bottom: 24px;">
            <div style="font-size: 13px; font-weight: 800; color: ${isApproved ? '#065f46' : '#991b1b'};">CALIFICACIÓN FINAL OFICIAL</div>
            <div style="font-size: 46px; font-weight: 900; color: ${isApproved ? '#008f4c' : '#dc2626'};">${pct}%</div>
            <div style="font-size: 14px; font-weight: 700; color: #374151;">${finalScore.toFixed(1)} de ${finalTotal} puntos</div>
          </div>

          <h3 style="margin: 0 0 14px 0; font-size: 15px; color: #111827; font-weight: 800;">Detalle con Retroalimentación del Instructor</h3>
          ${questionsHtml}
        </div>

        <div style="padding: 16px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
          Servicio Nacional de Aprendizaje SENA · Registro Oficial de Calificaciones
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Plain text representation of email
 */
export function generateEmailPlainText(data: EmailDispatchPayload): string {
  const { studentName, studentDoc, group, difficulty, autoScore, autoTotal, finalScore, finalTotal } = data;
  const score = finalScore ?? autoScore;
  const total = finalTotal ?? autoTotal;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return [
    '=== SENA · ADSO | EVALUACIÓN OFICIAL ===',
    `Aprendiz: ${studentName}`,
    `Documento: ${studentDoc}`,
    `Grupo: ${group} · Dificultad: ${difficulty}`,
    `Puntaje: ${score.toFixed(1)} / ${total} (${pct}%)`,
    `Estado: ${pct >= 60 ? 'APROBADO' : 'NO APROBADO'}`,
    '----------------------------------------',
    'Constancia oficial generada por el sistema evaluativo SENA.',
  ].join('\n');
}

/**
 * Generates a pre-filled mailto URL so user or admin can launch native email client with 1 click
 */
export function generateMailtoUrl(to: string, subject: string, bodyText: string): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
}

/**
 * Triggers a file download for the official HTML evaluation certificate/report
 */
export function downloadHtmlReport(filename: string, htmlContent: string) {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Dispatches an email using server proxy if available, or client-side EmailJS/Webhook/fallback on GitHub Pages
 */
export async function sendEvaluationEmail(
  payload: EmailDispatchPayload,
  settings: EmailSettings
): Promise<DispatchResult> {
  const isInitial = payload.emailType === 'initial';
  const studentSubject = isInitial
    ? `[SENA ADSO] Acuse de Recibo · Evaluación Grupo ${payload.group} · ${payload.studentName}`
    : `[SENA ADSO] Resultados Definitivos · Grupo ${payload.group} · ${payload.studentName}`;

  const adminSubject = `[SENA ADSO Evaluador] ${isInitial ? 'Nuevo Intento' : 'Calificación Finalizada'} - ${payload.studentName}`;

  const studentHtml = isInitial
    ? generateStudentInitialEmailHtml(payload)
    : generateStudentFinalEmailHtml(payload);

  const adminHtml = studentHtml;
  const studentText = generateEmailPlainText(payload);

  // 1. Intento vía servidor local o Cloud Run (/api/send-email) si está disponible
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        adminEmail: settings.adminEmail,
      }),
    });

    if (res.ok) {
      return {
        success: true,
        method: 'server',
        message: 'Correo despachado mediante el servidor institucional (SMTP).',
        studentSubject,
        studentHtml,
        studentText,
        adminSubject,
        adminHtml,
      };
    }
  } catch {
    // Si falla o estamos en GitHub Pages (sin servidor Node.js), continuamos con los canales estáticos
  }

  // 2. Intento vía EmailJS si el usuario configuró Service ID y Public Key (ideal para GitHub Pages)
  if (settings.emailJsServiceId && settings.emailJsTemplateId && settings.emailJsPublicKey) {
    try {
      const emailJsRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: settings.emailJsServiceId,
          template_id: settings.emailJsTemplateId,
          user_id: settings.emailJsPublicKey,
          template_params: {
            to_email: payload.studentEmail,
            to_name: payload.studentName,
            subject: studentSubject,
            message_html: studentHtml,
            message_text: studentText,
            admin_email: settings.adminEmail,
          },
        }),
      });

      if (emailJsRes.ok) {
        return {
          success: true,
          method: 'emailjs',
          message: 'Correo enviado con éxito mediante EmailJS (Compatible con GitHub Pages).',
          studentSubject,
          studentHtml,
          studentText,
          adminSubject,
          adminHtml,
        };
      }
    } catch (e: any) {
      console.warn('EmailJS dispatch failed:', e);
    }
  }

  // 3. Intento vía Webhook personalizado si está configurado
  if (settings.webhookUrl) {
    try {
      const hookRes = await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          studentSubject,
          studentHtml,
          studentText,
          adminEmail: settings.adminEmail,
        }),
      });

      if (hookRes.ok) {
        return {
          success: true,
          method: 'webhook',
          message: 'Notificación despachada exitosamente al Webhook configurado.',
          studentSubject,
          studentHtml,
          studentText,
          adminSubject,
          adminHtml,
        };
      }
    } catch (e: any) {
      console.warn('Webhook dispatch failed:', e);
    }
  }

  // 4. Si estamos en GitHub Pages sin configuración de EmailJS, el reporte HTML se genera
  // en el cliente 100% listo para ser visualizado, descargado o copiado sin ningún secreto filtrado.
  return {
    success: true,
    method: 'client_generated',
    message: 'Reporte oficial generado localmente con diseño SENA (sin credenciales expuestas).',
    studentSubject,
    studentHtml,
    studentText,
    adminSubject,
    adminHtml,
  };
}
