/**
 * Brevo (Sendinblue) transactional email — server-only.
 * @see https://developers.brevo.com/reference/sendtransacemail
 */

const BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";

export function isBrevoConfigured(): boolean {
  return Boolean(
    process.env.BREVO_API_KEY?.trim() && process.env.BREVO_SENDER_EMAIL?.trim(),
  );
}

export function brevoConfigHint(): string {
  return "Set BREVO_API_KEY and BREVO_SENDER_EMAIL in .env.local (verified sender in Brevo).";
}

/** `[Campaign name] body text` → subject + body */
export function parseBracketSubject(message: string): {
  subject: string;
  body: string;
} {
  const match = message.match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
  if (match) {
    return { subject: match[1]!.trim(), body: match[2]!.trim() };
  }
  return { subject: "Message from LinkPulse", body: message.trim() };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type EmailStyle = "personal" | "newsletter";

/** Plain, letter-like HTML — less likely to land in Gmail Promotions. */
export function buildPersonalEmailHtml(
  body: string,
  recipientName?: string,
): string {
  const greeting = recipientName
    ? `Hi ${escapeHtml(recipientName)},`
    : "Hello,";
  const signOff =
    process.env.BREVO_SENDER_NAME?.trim() || "Beamlink";
  return `<!DOCTYPE html><html><body style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#18181b;max-width:520px;margin:0;padding:16px 20px">
<p style="margin:0 0 12px">${greeting}</p>
<p style="margin:0;white-space:pre-wrap">${escapeHtml(body)}</p>
<p style="margin:24px 0 0;color:#52525b;font-size:14px">— ${escapeHtml(signOff)}</p>
</body></html>`;
}

/** Bulk / opt-in updates — includes unsubscribe line (may still tab as Promotions). */
export function buildNewsletterEmailHtml(
  body: string,
  recipientName?: string,
  unsubscribeEmail?: string,
): string {
  const greeting = recipientName
    ? `Hi ${escapeHtml(recipientName)},`
    : "Hi there,";
  const unsub = unsubscribeEmail || process.env.BREVO_SENDER_EMAIL?.trim();
  const unsubLine = unsub
    ? `<p style="font-size:12px;color:#71717a;margin-top:16px">To stop these emails, reply with &quot;unsubscribe&quot; or email <a href="mailto:${escapeHtml(unsub)}?subject=unsubscribe" style="color:#52525b">${escapeHtml(unsub)}</a>.</p>`
    : "";
  return `<!DOCTYPE html><html><body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#18181b;max-width:560px;margin:0 auto;padding:24px">
<p>${greeting}</p>
<div style="white-space:pre-wrap;margin:16px 0">${escapeHtml(body)}</div>
${unsubLine}
</body></html>`;
}

export function buildEmailHtml(
  body: string,
  recipientName?: string,
  style: EmailStyle = "personal",
): string {
  return style === "newsletter"
    ? buildNewsletterEmailHtml(body, recipientName)
    : buildPersonalEmailHtml(body, recipientName);
}

export type BrevoSendResult = {
  messageId?: string;
};

export async function sendBrevoEmail(input: {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  style?: EmailStyle;
}): Promise<BrevoSendResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  if (!apiKey || !senderEmail) {
    throw new Error(brevoConfigHint());
  }

  const style = input.style ?? "personal";
  const replyTo =
    process.env.BREVO_REPLY_TO?.trim() || senderEmail;
  const senderName =
    process.env.BREVO_SENDER_NAME?.trim() ||
    (style === "personal" ? "Beamlink" : "LinkPulse");

  const payload: Record<string, unknown> = {
    sender: { name: senderName, email: senderEmail },
    replyTo: { email: replyTo, name: senderName },
    to: [{ email: input.toEmail, name: input.toName || input.toEmail }],
    subject: input.subject,
    htmlContent: input.htmlContent,
    textContent: input.textContent,
    tags: [style === "personal" ? "transactional" : "campaign"],
  };

  if (style === "newsletter") {
    payload.headers = {
      "List-Unsubscribe": `<mailto:${replyTo}?subject=unsubscribe>`,
    };
  }

  const res = await fetch(BREVO_SEND_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail = `Brevo error (${res.status})`;
    try {
      const err = (await res.json()) as { message?: string };
      if (err.message) detail = err.message;
    } catch {
      const text = await res.text().catch(() => "");
      if (text) detail = text.slice(0, 200);
    }
    throw new Error(detail);
  }

  const data = (await res.json()) as { messageId?: string };
  return { messageId: data.messageId };
}

/** Brevo free plan: 300 emails/day */
export const BREVO_FREE_DAILY_CAP = 300;

export function assertWithinBrevoDailyCap(count: number): void {
  if (!isBrevoConfigured()) return;
  if (count > BREVO_FREE_DAILY_CAP) {
    throw new Error(
      `This send needs ${count} emails but Brevo free tier allows ${BREVO_FREE_DAILY_CAP}/day. Reduce your audience or upgrade Brevo.`,
    );
  }
}
