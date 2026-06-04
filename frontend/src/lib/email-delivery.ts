import {
  assertWithinBrevoDailyCap,
  buildEmailHtml,
  type EmailStyle,
  isBrevoConfigured,
  parseBracketSubject,
  sendBrevoEmail,
} from "@/lib/brevo";
import {
  createCommunicationLog,
  updateCommunicationLog,
} from "@/lib/firestore/crm";
import type { CommunicationLog } from "@/lib/api";

export type DeliveryResult = {
  logId: string;
  status: CommunicationLog["status"];
  error?: string;
};

function plainTextBody(
  body: string,
  recipientName?: string,
  style: EmailStyle = "personal",
): string {
  const greeting = recipientName ? `Hi ${recipientName},\n\n` : "";
  const signOff =
    style === "personal"
      ? `\n\n— ${process.env.BREVO_SENDER_NAME?.trim() || "Beamlink"}`
      : "";
  return `${greeting}${body}${signOff}`;
}

export async function logAndDeliverMessage(input: {
  client_id: string;
  channel: "email" | "sms" | "whatsapp";
  recipient_address: string;
  message_body: string;
  recipient_name?: string;
  provider_message_id?: string;
  subjectOverride?: string;
  emailStyle?: EmailStyle;
}): Promise<DeliveryResult> {
  const logId = await createCommunicationLog({
    client_id: input.client_id,
    channel: input.channel,
    recipient_address: input.recipient_address,
    message_body: input.message_body,
    status: "queued",
    provider_message_id: input.provider_message_id,
  });

  if (input.channel !== "email") {
    return { logId, status: "queued" };
  }

  if (!isBrevoConfigured()) {
    return { logId, status: "queued" };
  }

  const parsed = parseBracketSubject(input.message_body);
  const subject = input.subjectOverride?.trim() || parsed.subject;
  const body = input.subjectOverride ? input.message_body.trim() : parsed.body;
  const emailStyle = input.emailStyle ?? "personal";

  try {
    const { messageId } = await sendBrevoEmail({
      toEmail: input.recipient_address,
      toName: input.recipient_name,
      subject,
      htmlContent: buildEmailHtml(body, input.recipient_name, emailStyle),
      textContent: plainTextBody(body, input.recipient_name, emailStyle),
      style: emailStyle,
    });
    await updateCommunicationLog(logId, {
      status: "sent",
      provider_message_id:
        messageId ?? input.provider_message_id ?? undefined,
    });
    return { logId, status: "sent" };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Send failed";
    await updateCommunicationLog(logId, {
      status: "failed",
      error_telemetry: error,
    });
    return { logId, status: "failed", error };
  }
}

export async function deliverEmailBatch(
  items: Array<{
    client_id: string;
    email: string;
    name: string;
    message_body: string;
    provider_message_id?: string;
  }>,
  options?: { subject?: string; emailStyle?: EmailStyle },
): Promise<{ sent: number; failed: number; queued: number }> {
  assertWithinBrevoDailyCap(items.length);

  let sent = 0;
  let failed = 0;
  let queued = 0;

  for (const item of items) {
    const result = await logAndDeliverMessage({
      client_id: item.client_id,
      channel: "email",
      recipient_address: item.email,
      recipient_name: item.name,
      message_body: item.message_body,
      provider_message_id: item.provider_message_id,
      subjectOverride: options?.subject,
      emailStyle: options?.emailStyle ?? "newsletter",
    });
    if (result.status === "sent") sent += 1;
    else if (result.status === "failed") failed += 1;
    else queued += 1;
  }

  return { sent, failed, queued };
}
