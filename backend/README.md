# ARQUITECTURA TÉCNICA: SISTEMA DE PRUEBAS PSICOTÉCNICAS
**Autor de la arquitectura:** Linus Torvalds (Modo Pragmatismo Puro)  
**Principios:** Cero bloatware, cero abstracciones innecesarias, cero dependencias infladas. Código que corre directo sobre el metal o el intérprete estándar.

---

## 1. ESQUEMA DE DATOS (SQLite ACID DDL)
El archivo `backend/schema.sql` define el modelo relacional estricto con `PRAGMA foreign_keys = ON;`:

* `system_config`: Control único singleton (`id = 1`) para temporizador global (`timer_enabled`, `time_limit_minutes`, `passing_percentage`).
* `questions`: Preguntas clasificadas por `group_letter` ('A', 'B', 'C', 'D'), `category` ('Lógica', 'Análisis Matemático', 'Comprensión Lectora', 'Psicología'), puntaje (`points > 0`), tipo ('multiple_choice', 'open_text') y soporte multimedia (`image_url`).
* `question_options`: Opciones dinámicas vinculadas por FK con eliminación en cascada (`is_correct` binario).
* `candidates`: Identificación única con constraint de unicidad sobre correo electrónico (`email UNIQUE COLLATE NOCASE`).
* `assessments`: Registro de intentos con máquina de estados finita:
  - `EN_CURSO`: Prueba en ejecución.
  - `EN_REVISION`: Fase 1 concluida (preguntas cerradas computadas, esperando evaluación manual de abiertas).
  - `APROBADO`: Aprobado definitivo en Fase 2.
  - `REPROBADO`: Reprobado definitivo en Fase 2 (o en Fase 1 si no requería revisión manual).
* `assessment_answers`: Registro granular de cada respuesta y feedback del evaluador.
* `email_logs`: Registro auditable de despachos de correo en Fase 1 y Fase 2.

---

## 2. REGLAS DE NEGOCIO Y CONTROL ANTI-CHEAT

### Validación de Reintentos en el Registro:
Al enviar `POST /api/candidate/register`:
1. Si el correo no existe: Se crea el candidato y se retorna el resumen de pesos y categorías del grupo asignado.
2. Si el correo existe: Se consulta su última evaluación:
   - Si `status == 'REPROBADO'`: HTTP 403 con mensaje exacto:  
     `"Prueba no aprobada, no puedes volver a intentarlo"`
   - Si `status == 'EN_REVISION'`: HTTP 403 con mensaje exacto:  
     `"Tus resultados finales están en revisión, no es necesario repetir la prueba"`
   - Si `status == 'APROBADO'`: HTTP 403 con alerta de que ya cuenta con aprobación vigente.

---

## 3. TEMPORIZADOR Y AUTO-SUBMIT DE PRECISIÓN MILISEGÚNDICA
El cronómetro en el cliente no depende únicamente de `setInterval` (vulnerable al throttling cuando la pestaña pierde el foco). Utiliza `Date.now()` diferencial:
```javascript
const endTime = Date.now() + durationInSeconds * 1000;
function tick() {
  const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  if (remaining === 0) {
    triggerTimeoutAndAutoSubmit();
  }
}
```
Al expirar:
1. Se congela inmediatamente el árbol de inputs del DOM.
2. Se activa la cortina visual "¡Tiempo Agotado!".
3. Se serializa el payload de respuestas con la bandera `auto_submitted: 1`.
4. Se despacha `POST /api/exam/submit` de forma asíncrona.

---

## 4. PIPELINE DE CALIFICACIÓN Y CORREOS EN DOS FASES

```
[ CANDIDATO COMPLETA / AUTO-SUBMIT ]
                 │
                 ▼
     POST /api/exam/submit
                 │
     ┌───────────┴────────────────────────┐
     ▼                                    ▼
[Cálculo automático de cerradas]     [Despacho Correo Fase 1]
Puntaje Preliminar Calculado         "Advertencia: Sujeto a revisión
Status: 'EN_REVISION'                 manual por preguntas abiertas"
                 │
                 ▼
[ ADMIN: Bandeja de Calificación Manual ]
     POST /api/admin/grade-manual
                 │
     ┌───────────┴────────────────────────┐
     ▼                                    ▼
[Puntaje Abierto + Puntaje Cerrado]  [Despacho Correo Fase 2]
Cálculo de Porcentaje Definitivo      "Resultados Definitivos:
Status: 'APROBADO' o 'REPROBADO'       APROBADO / NO APROBADO"
```

---

## 5. EJECUCIÓN DEL SERVIDOR PYTHON PURO
Sin necesidad de instalar paquetes pesados:
```bash
# 1. Sembrar base de datos SQLite con preguntas reales y casos anti-cheat:
python3 backend/seed.py

# 2. Iniciar servidor HTTP multihilo nativo (Puerto 8000):
python3 backend/app.py
```
O si prefieres FastAPI + Uvicorn:
```bash
uvicorn backend.fastapi_app:app --reload --port 8000
```
