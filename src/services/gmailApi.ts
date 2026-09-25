import { getAccessToken } from './googleAuth';

/**
 * Creates an RFC 2822 formatted email and encodes it in URL-safe base64
 */
function createRawEmail(options: {
  from?: string;
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
}): string {
  const boundary = `====boundary_${Date.now().toString(16)}====`;
  const plainText = options.bodyText || options.bodyHtml.replace(/<[^>]+>/g, ' ');

  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(options.subject)))}?=`;

  const messageParts = [
    `To: ${options.to}`,
    options.from ? `From: ${options.from}` : '',
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    plainText,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    options.bodyHtml,
    '',
    `--${boundary}--`,
  ]
    .filter(Boolean)
    .join('\r\n');

  // Convert to URL-safe base64 (RFC 4648 §5)
  const encoded = btoa(unescape(encodeURIComponent(messageParts)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return encoded;
}

export interface SendGmailResult {
  success: boolean;
  messageId?: string;
  threadId?: string;
  error?: string;
}

/**
 * Send an email using Gmail REST API directly with the user's OAuth access token
 */
export async function sendGmailMessage(options: {
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  from?: string;
  token?: string;
}): Promise<SendGmailResult> {
  const token = options.token || (await getAccessToken());

  if (!token) {
    return {
      success: false,
      error: 'No se encontró un token de acceso activo para Gmail.',
    };
  }

  try {
    const raw = createRawEmail(options);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `HTTP ${response.status} al despachar con Gmail API`;
      return {
        success: false,
        error: errorMsg,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
      threadId: data.threadId,
    };
  } catch (err: any) {
    console.error('Error sending message via Gmail API:', err);
    return {
      success: false,
      error: err?.message || 'Error de red al conectar con Gmail API.',
    };
  }
}

/**
 * Lists the most recent sent messages from the user's Gmail to verify delivery
 */
export async function listRecentGmailMessages(token?: string, maxResults = 5) {
  const activeToken = token || (await getAccessToken());
  if (!activeToken) return [];

  try {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=subject:PsicoTest`,
      {
        headers: { Authorization: `Bearer ${activeToken}` },
      }
    );

    if (!response.ok) return [];
    const data = await response.json();
    return data.messages || [];
  } catch (err) {
    console.warn('Error fetching messages from Gmail API:', err);
    return [];
  }
}
